import "reflect-metadata";
import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import { QueryFailedError } from "typeorm";
import { RegisterUserInput, UserResponse, LoginUserInput } from "../types";
import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { CHANGE_PASSWORD_PREFIX, COOKIE_NAME, } from "../constants";
import { validateRegisterRequest } from "../utils/validateRegisterRequest";
import { sendEmail } from "../utils/sendEmail";
import { v7 as uuidv7 } from "uuid";


@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(
    @Root() user: User,
    @Ctx() { req }: MyContext,
  ): string {
    // Only return the email if the current user is the owner of the email
    if (req.session?.userId === user.id) {
      return user.email;
    }
    return "";
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => RegisterUserInput) options: RegisterUserInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const errors = validateRegisterRequest(options);
    if (errors) {
      return errors;
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = User.create({
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });
    
    try {
      await user.save();
    } catch (error) {
      // Duplicate key error
      if (error instanceof QueryFailedError && (error as any).code === "23505") { // Unique violation error code for PostgreSQL
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
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: options.input.includes('@') ? { email: options.input } : { username: options.input }
    });

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

  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req }: MyContext,
  ): Promise<User | null> {
    // User is not logged in if session userId is not present
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne({ where: { id: req.session.userId } });
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
    @Ctx() { redis }: MyContext,
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
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
    @Ctx() { req, redis }: MyContext,
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

    const userIdNum = parseInt(userId);
    const user = await User.findOne({ where: { id: userIdNum } });
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

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );
    await redis.del(CHANGE_PASSWORD_PREFIX + token);

    // Login the user after changing the password
    req.session.userId = user.id;

    return { user };
  }
}
