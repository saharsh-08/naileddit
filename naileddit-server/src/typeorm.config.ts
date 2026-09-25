import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";
import { DataSource } from "typeorm";

export const appDataSource = new DataSource({
  type: "postgres",

  // Use platform-agnostic paths so migrations are found in Linux containers too.
  synchronize: __prod__ ? false : true,
  migrations: [path.join(__dirname, "migrations", "**", "*.{js,ts}")],
  migrationsRun: __prod__ ? true : false,

  // Database connection options
  url: process.env.DATABASE_URL,
  entities: [Post, User, Updoot],

  // Logging options
  logging: true,
});
