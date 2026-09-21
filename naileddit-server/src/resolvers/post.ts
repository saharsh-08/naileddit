import "reflect-metadata";
import { Resolver, Query, Arg, Int, Mutation, Ctx, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";

import { Post } from "../entities/Post";
import { CreatePostInput } from "../types";

// @Query(): Fetching data
// @Mutation(): Modifying data (create, update, delete)

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
  ): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("options", () => CreatePostInput) options: CreatePostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const post = Post.create({
      ...options,
      creatorId: req.session?.userId,
    });
    await post.save();
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return null;
    }
    if (title) {
      await Post.update(
        { id },
        { title }
      );
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => Int) id: number,
  ): Promise<boolean> {
    await Post.delete({ id });
    return true;
  }
}
