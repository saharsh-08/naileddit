import { EntityManager, Connection, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response, } from "express";
import { Field, InputType, ObjectType } from "type-graphql";
import { Users } from "./entities/Users";

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & {
    session?: {
      userId?: number;
    };
  };
  res: Response;
}

@InputType()
export class RegisterUserInput {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;
}

@InputType()
export class LoginUserInput {
  @Field(() => String)
  input!: string;

  @Field(() => String)
  password!: string;
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

  @Field(() => Users, { nullable: true })
  user?: Users;
}