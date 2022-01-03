import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";


export default {
  // migration config
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  entities: [Post, User],
  dbName: 'reddit',
  type: "postgresql",
  debug: __prod__,
  user: "postgres",
  password: "asd1234"
} as Parameters<typeof MikroORM.init>[0];