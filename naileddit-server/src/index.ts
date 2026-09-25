import "reflect-metadata";
import dotenv from "dotenv"
dotenv.config();

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";
import { createClient } from "redis";
import session from "express-session";
import { RedisStore } from "connect-redis";

import { appDataSource } from "./typeorm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { MyContext } from "./types";
import { UserResolver } from "./resolvers/user";
import { __prod__, COOKIE_NAME } from "./constants";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";


const main = async () => {
  await appDataSource.initialize();

  const app = express();

  const redisClient = createClient({
    url: process.env.REDIS_URL,
    RESP: 2,
  });
  await redisClient.connect();
  const redisStore = new RedisStore({
    client: redisClient,
    disableTouch: true,
  });

  app.set("proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
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
          req,
          res,
          redis: redisClient,
          userLoader: createUserLoader,
          updootLoader: createUpdootLoader,
        }
      ),
    }),
  );

  app.listen(process.env.PORT, () => {
    console.log("Server started on localhost:4000");
  });

  // Creating a record in the post entity
  // const em = orm.em.fork();
  // const post = em.create(Post, { id: 1, title: "My First Post"});
  // em.persist(post);
  // await em.flush();
};

main();
