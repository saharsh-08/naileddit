import "reflect-metadata";
import {
  Resolver,
  Mutation,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { Users } from "../entities/Users";
import { MyContext } from "../types";

@InputType()
class UsernamePasswordInput {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
class FieldError {
  @Field(() => String)
  field!: string;

  @Field(() => String)
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Users, { nullable: true })
  user?: Users;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext,
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Length must be greater than 2",
          },
        ],
      };
    }
    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "Length must be greater than 2",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(Users, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      em.persist(user);
      await em.flush();
    } catch (error) {
      // console.error(error);
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

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext,
  ): Promise<UserResponse> {
    const user = await em.findOne(Users, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username/password",
            message: "Incorrect username or password",
          },
        ],
      }
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "username/password",
            message: "Incorrect username or password",
          },
        ],
      };
    }

    return { user };
  }
}
