import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Redis } from 'ioredis';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number };
  };
  redis: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>; // quick way to get return type of a function
  upvoteLoader: ReturnType<typeof createUpvoteLoader>; // quick way to get return type of a function
};
