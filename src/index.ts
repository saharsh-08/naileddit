import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";

import mikroOrmConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { MyContext } from "./types";


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    // Running migrations to create the post table in the database
    await orm.migrator.up();

    const app = express();

    const apolloServer = new ApolloServer<MyContext>({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false,
        }),
    });

    await apolloServer.start();

    app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(apolloServer, {
            context: async () => ({ em: orm.em }),
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