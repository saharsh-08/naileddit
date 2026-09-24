import "reflect-metadata";
import { Resolver, Query, Arg, Int, Mutation, Ctx, UseMiddleware, FieldResolver, Root } from "type-graphql";
import { MyContext, PostsResponse } from "../types";
import { isAuth } from "../middleware/isAuth";

import { Post } from "../entities/Post";
import { CreatePostInput } from "../types";
import { appDataSource } from "../typeorm.config";
import { Updoot } from "../entities/Updoot";

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

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() root: Post,
    @Ctx() { req }: MyContext,
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await Updoot.findOne({
      where: { userId: req.session.userId, postId: root.id }
    });

    return updoot ? updoot.value : null;
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
          'createdAt', u."createdAt",
          'updatedAt', u."updatedAt"
        ) AS creator
        FROM post p
        INNER JOIN public.user u
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
    return Post.findOne({ where: { id }, relations: { creator: true } });
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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext,
  ) {
    const { userId } = req.session;
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;

    const updoot = await Updoot.findOne({ where: { userId, postId } });

    // If the user has already updooted and wants to change their vote
    if (updoot && updoot.value !== realValue) {
      await appDataSource.transaction(async tm => {
        await tm.query(`
          UPDATE updoot
          SET value = $1
          WHERE "userId" = $2 AND "postId" = $3;
        `, [realValue, userId, postId]);
        await tm.query(`
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `, [realValue * 2, postId]);
      });
    }
    // If the user is voting again and wants to unvote
    else if (updoot && updoot.value === realValue) {
      await appDataSource.transaction(async tm => {
        await tm.query(`
          DELETE FROM updoot
          WHERE "userId" = $1 AND "postId" = $2;
        `, [userId, postId]);
        await tm.query(`
          UPDATE post
          SET points = points - $1
          WHERE id = $2;
        `, [realValue, postId]);
      });
    }
    // If the user is voting for the first time
    else if (!updoot) {
      await appDataSource.transaction(async tm => {
        await tm.query(`
          INSERT INTO updoot("userId", "postId", "value")
          VALUES ($1, $2, $3);
        `, [userId, postId, realValue]);
        await tm.query(`
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `, [realValue, postId]);
      });
    }

    return true;
  }
}
