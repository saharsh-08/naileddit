import { MikroORM } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import path from "path";

import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { Users } from "./entities/Users";

export default {
  driver: PostgreSqlDriver,
  migrations: {
    path: path.join(__dirname, "./migrations"),
    glob: "!(*.d).{js,ts,cjs}",
  },
  extensions: [Migrator],
  useTsNode: false,
  dbName: "naileddit",
  debug: !__prod__,
  entities: [Post, Users],
  user: "postgres",
  password: "postgres",
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
