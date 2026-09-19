import "reflect-metadata";
import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  Query,
} from "type-graphql";
import { RegisterUserInput, UserResponse, LoginUserInput } from "../types";
import argon2 from "argon2";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { Users } from "../entities/Users";
import { MyContext } from "../types";
import { CHANGE_PASSWORD_PREFIX, COOKIE_NAME, } from "../constants";
import { validateRegisterRequest } from "../utils/validateRegisterRequest";
import { sendEmail } from "../utils/sendEmail";
import { v7 as uuidv7 } from "uuid";
// import { EntityManager } from "@mikro-orm/postgresql";


@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => RegisterUserInput) options: RegisterUserInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    const errors = validateRegisterRequest(options);
    if (errors) {
      return errors;
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(Users, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });
    try {
      em.persist(user);
      await em.flush();
    } catch (error) {
      // Duplicate key error
      if (error instanceof UniqueConstraintViolationException) {
        return {
          errors: [
            {
              field: "username",
              message: "Username already exists",
            },
          ],
        };
      }
    }

    // Store user id in session after successful registration
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => LoginUserInput) options: LoginUserInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    const user = await em.findOne(
      Users,
      options.input.includes('@') ? { email: options.input } : { username: options.input }
    );

    if (!user) {
      return {
        errors: [
          {
            field: "username/email/password",
            message: "Incorrect username, email, or password",
          },
        ],
      }
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "username/email/password",
            message: "Incorrect username or password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Query(() => Users, { nullable: true })
  async me(
    @Ctx() { req, em }: MyContext,
  ): Promise<Users | null> {
    // User is not logged in if session userId is not present
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(Users, { id: req.session.userId });
    return user;
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res}: MyContext,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          console.log("Error in destroying session: ", err);
          resolve(false);
          return;
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email", () => String) email: string,
    @Ctx() { em, redis }: MyContext,
  ): Promise<boolean> {
    const user = await em.findOne(Users, { email });
    if (!user) {
      return true;
    }

    const token = uuidv7();
    const mailContent = `<a href="http://localhost:3000/change-password/${token}">Click here to reset your password</a>`;

    await redis.set(
      CHANGE_PASSWORD_PREFIX + token,
      user.id,
      {
        expiration:
        { 
          type: 'EX',
          value: 60 * 60 * 24  // 1 day expiration
        }
      }
    );

    await sendEmail(email, "Reset Password", mailContent);

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("newPassword", () => String) newPassword: string,
    @Arg("token", () => String) token: string,
    @Ctx() { em, req, redis }: MyContext,
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "Length must be greater than 2",
          },
        ],
      };
    }

    const userId = await redis.get(CHANGE_PASSWORD_PREFIX + token);
    if (!userId) {
      return {
        errors: [
          {
            field: "user/token",
            message: "Invalid user or token",
          },
        ],
      };
    }

    const user = await em.findOne(Users, { id: parseInt(userId) });
    if (!user) {
      return {
        errors: [
          {
            field: "user/token",
            message: "Invalid user or token",
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);
    em.persist(user);
    await em.flush();
    await redis.del(CHANGE_PASSWORD_PREFIX + token);

    // Login the user after changing the password
    req.session.userId = user.id;

    return { user };
  }
  
}
