import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
export class Users {
  @Field(() => Int)
  @PrimaryKey({ type: "number" })
  id!: number;

  @Field(() => String)
  @Property({ type: "datetime", defaultRaw: "now()" })
  createdAt?: Date = new Date();

  @Field(() => String)
  @Property({
    type: "datetime",
    onUpdate: () => new Date(),
    defaultRaw: "now()",
  })
  updatedAt?: Date = new Date();

  @Field(() => String)
  @Property({ type: "text", unique: true })
  username!: string;

  @Field(() => String)
  @Property({ type: "text", unique: true })
  email!: string;

  @Property({ type: "text" })
  password!: string;
}
