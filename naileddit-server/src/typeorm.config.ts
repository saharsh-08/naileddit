import dotenv from "dotenv"
dotenv.config();

import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import { DataSource } from "typeorm";

export const appDataSource = new DataSource({
  type: "postgres",

  // Migration options
  synchronize: __prod__ ? false : true,
  migrations: [__dirname + "\\migrations\\**\\*{.js,.ts}"],
  migrationsRun: __prod__ ? true : false,

  // Database connection options
  url: process.env.DATABASE_URL,
  entities: [Post, User, Updoot],

  // Logging options
  logging: !__prod__,
});
