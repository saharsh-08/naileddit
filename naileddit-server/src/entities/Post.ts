import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";
import { Updoot } from "./Updoot";

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

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts)
  creator!: User;

  @Field(() => [Updoot])
  @OneToMany(() => Updoot, updoot => updoot.post)
  updoots!: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date;
}