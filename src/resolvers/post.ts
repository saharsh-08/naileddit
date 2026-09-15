import "reflect-metadata";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";

import { Post } from "../entities/Post";
import { MyContext } from "../types";

// @Query(): Fetching data
// @Mutation(): Modifying data (create, update, delete)

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Ctx() { em }: MyContext,
    @Arg("id", () => Int) id: number,
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Ctx() { em }: MyContext,
    @Arg("title", () => String) title: string,
  ): Promise<Post> {
    const post = em.create(Post, {
      title,
    });
    em.persist(post);
    await em.flush();
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Ctx() { em }: MyContext,
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string,
  ): Promise<Post | null> {
    const post = await em.findOne(Post, {
      id,
    });
    if (!post) {
      return null;
    }
    if (title) {
      post.title = title;
      em.persist(post);
      await em.flush();
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Ctx() { em }: MyContext,
    @Arg("id", () => Int) id: number,
  ): Promise<boolean> {
    await em.nativeDelete(Post, {
      id,
    });
    return true;
  }
}
