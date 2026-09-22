import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { Users } from "./entities/Users";
import { DataSource } from "typeorm";

export const appDataSource = new DataSource({
  type: "postgres",

  // Migration options
  synchronize: true,
  migrations: [__dirname + "\\migrations\\**\\*{.js,.ts}"],
  migrationsRun: false,

  // Database connection options
  database: "naileddit",
  entities: [Post, Users],
  username: "postgres",
  password: "postgres",

  // Logging options
  logging: !__prod__,
});
