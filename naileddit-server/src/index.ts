import dotenv from "dotenv"
dotenv.config();

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";
import { createClient } from "redis";
import session from "express-session";
import { RedisStore } from "connect-redis";

import mikroOrmConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { MyContext } from "./types";
import { UserResolver } from "./resolvers/user";
import { __prod__, COOKIE_NAME } from "./constants";


const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  // Running migrations to create the post table in the database
  await orm.migrator.up();

  const app = express();

  const redisClient = createClient({
    url: "redis://localhost:6379",
    RESP: 2,
  });
  await redisClient.connect();
  const redisStore = new RedisStore({
    client: redisClient,
    disableTouch: true,
  });

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
    session({
      name: COOKIE_NAME,
      store: redisStore,
      secret: process.env.SESSION_ID_COOKIE_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      },
    })
  );

  const apolloServer = new ApolloServer<MyContext>({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<MyContext> => (
        {
          em: orm.em,
          req,
          res,
          redis: redisClient
        }
      ),
    }),
  );

  app.listen(4000, () => {
    console.log("Server started on localhost:4000");
  });

  // Creating a record in the post entity
  // const em = orm.em.fork();
  // const post = em.create(Post, { id: 1, title: "My First Post"});
  // em.persist(post);
  // await em.flush();
};

main();
