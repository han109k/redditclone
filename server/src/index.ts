import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // console.log("dirname: ", __dirname);

  //
  const orm = await MikroORM.init(mikroOrmConfig);
  // Migrate up to the latest version
  await orm.getMigrator().up();
  // const post = orm.em.create(Post, { title: "my first post" });
  // // insert into database
  // await orm.em.persistAndFlush(post);

  const app = express();

  // // use _ (underscore) if you want to omit a variable
  // app.get("/", (_, res) => {
  //   res.send("hello")
  // })

  // GraphQL Apollo config
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  // Create graphQL end point
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("Server running on port 4000");
  });

  // const posts = await orm.em.find(Post, {});
  // console.log(posts);

  // console.log("------ sql 2 -------");
  // await orm.em.nativeInsert(Post, { title: "my first post 2" });
};

main().catch((error) => console.log(error));
