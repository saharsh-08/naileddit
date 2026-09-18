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
import { COOKIE_NAME } from "../constants";
import { validateRegisterRequest } from "../utils/validateRegisterRequest";
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
    if (!options.username && !options.email) {
      return {
        errors: [
          {
            field: "username/email",
            message: "Either username or email must be provided",
          },
        ],
      };
    }

    const user = await em.findOne(
      Users,
      options.username ? { username: options.username } : { email: options.email }
    );

    if (!user) {
      return {
        errors: [
          {
            field: "username",
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
            field: "password",
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
}
