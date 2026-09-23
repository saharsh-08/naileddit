import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import { DataSource } from "typeorm";

export const appDataSource = new DataSource({
  type: "postgres",

  // Migration options
  synchronize: true,
  migrations: [__dirname + "\\migrations\\**\\*{.js,.ts}"],
  migrationsRun: false,

  // Database connection options
  database: "naileddit",
  entities: [Post, User, Updoot],
  username: "postgres",
  password: "postgres",

  // Logging options
  logging: !__prod__,
});
