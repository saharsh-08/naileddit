import "reflect-metadata";
import { Resolver, Query, Arg, Int, Mutation, Ctx, UseMiddleware, FieldResolver, Root } from "type-graphql";
import { MyContext, PostsResponse } from "../types";
import { isAuth } from "../middleware/isAuth";

import { Post } from "../entities/Post";
import { CreatePostInput } from "../types";
import { appDataSource } from "../typeorm.config";

// @Query(): Fetching data
// @Mutation(): Modifying data (create, update, delete)

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(
    @Root() root: Post
  ) {
    return root.text.slice(0, 50);
  }

  @Query(() => PostsResponse)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
  ): Promise<PostsResponse> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1; 

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await appDataSource.query(
      `
        SELECT p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'createdAt', u."createdAt"
          'updatedAt', u."updatedAt"
        ) creator
        FROM post p
        INNER JOIN public.users u
        ON u.id = p."creatorId"
        ${cursor ? 'WHERE p."createdAt" < $2' : ''}
        ORDER BY p."createdAt" DESC
        LIMIT $1
      `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
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
    return Post.create({
      ...options,
      creatorId: req.session?.userId,
    }).save();
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
