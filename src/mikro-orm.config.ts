import { MikroORM } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import path from "path";

import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

export default {
    driver: PostgreSqlDriver,
    migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts,cjs}',
    },
    extensions: [Migrator],
    useTsNode: false,
    dbName: 'naileddit',
    debug: !__prod__,
    entities: [Post],
    user: 'postgres',
    password: 'postgres',
} as Parameters<typeof MikroORM.init>[0];