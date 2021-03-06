import 'reflect-metadata';
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
// Uncomment this if you want to access apollo playground
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core/dist/plugin/landingPage/graphqlPlayground';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis';
import session from 'express-session';

import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';

import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Upvote } from './entities/Upvote';
import { createUserLoader } from './utils/createUserLoader';
import { createUpvoteLoader } from './utils/createUpvoteLoader';

const main = async () => {
  // console.log("dirname: ", __dirname);

  // typeORM
  const conn = createConnection({
    type: 'postgres',
    database: 'reddit2', // typeORM
    username: 'postgres',
    password: 'asd1234',
    logging: true,
    synchronize: true, // create tables automatically without running migrations
    entities: [Post, User, Upvote],
    migrations: [path.join(__dirname, './migrations/*')],
  });
  (await conn).runMigrations();

  // Post.delete({});

  const app = express();
  const corsOptions = {
    origin: ' http://localhost:3000',
    credentials: true,
  };
  app.use(cors(corsOptions));

  const RedisStore = require('connect-redis')(session);
  const redis = new Redis(); //kept blank so that default options are available

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // one week
        httpOnly: true,
        sameSite: 'lax', // default 'lax' csrf
        // secure: __prod__, // cookie only works in https / use this in production
      },
      saveUninitialized: true,
      secret: 'thisshouldbesecret',
      resave: false,
    })
  );

  // Redis error checking
  app.use(function (req, res, next) {
    if (!req.session) {
      return next(new Error('oh no')); // handle error
    }
    next(); // otherwise continue
  });

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
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    // passing express request and response objects to our context. Context will run for every request
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
  });

  // Create graphQL end point
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log('Server running on port 4000');
  });
};

main().catch((error) => console.log(error));
