import { ObjectType, Field, Int } from "type-graphql";
import { CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Users extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: "int" })
  id!: number;

  @Field(() => String)
  @Column({ type: "text", unique: true })
  username!: string;

  @Field(() => String)
  @Column({ type: "text", unique: true })
  email!: string;

  @Column({ type: "text" })
  password!: string;

  @OneToMany(() => Post, post => post.creator)
  posts!: Post[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date; 
}
