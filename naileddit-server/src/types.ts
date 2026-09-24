import { Request, Response, } from "express";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "./entities/User";
import { RedisClientType } from "redis";
import { Post } from "./entities/Post";
import DataLoader from "dataloader";

export type MyContext = {
  req: Request & {
    session?: {
      userId?: number;
    };
  };
  res: Response;
  redis: RedisClientType<{}, {}, {}, 2, {}>;
  userLoader: DataLoader<number, User, number>;
  updootLoader: typeof createUpdootLoader;
}

// Input for Registration
@InputType()
export class RegisterUserInput {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;
}

// Input for Login
@InputType()
export class LoginUserInput {
  @Field(() => String)
  input!: string;

  @Field(() => String)
  password!: string;
}

// Input for creating a Post
@InputType()
export class CreatePostInput {
  @Field(() => String)
  title!: string;

  @Field(() => String)
  text!: string;
}

@ObjectType()
export class FieldError {
  @Field(() => String)
  field!: string;

  @Field(() => String)
  message!: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class PostsResponse {
  @Field(() => [Post])
  posts!: Post[];

  @Field(() => Boolean)
  hasMore!: boolean;
}