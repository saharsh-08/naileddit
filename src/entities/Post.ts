import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  // Note: You can remove the @Field annotation from a field to not expose it in the GraphQL schema
  @Field(() => Int)
  @PrimaryKey({ type: "number" })
  id!: number;

  @Field(() => String)
  @Property({ type: "datetime", defaultRaw: "now()" })
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ type: "datetime", onUpdate: () => new Date(), defaultRaw: "now()" })
  updatedAt: Date = new Date();

  @Field(() => String)
  @Property({ type: "text" })
  title!: string;
}