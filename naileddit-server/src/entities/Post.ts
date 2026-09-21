import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { Users } from "./Users";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  // Note: You can remove the @Field annotation from a field to not expose it in the GraphQL schema
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: "int" })
  id!: number;

  @Field(() => String)
  @Column({ type: "text" })
  title!: string;

  @Field(() => Int)
  @Column({ type: "int" })
  creatorId!: number;

  @Field(() => String)
  @Column({ type: "text" })
  text!: string;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  points!: number;

  @ManyToOne(() => Users, user => user.posts)
  creator!: Users;

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date;
}