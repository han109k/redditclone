import { MyContext } from 'src/types';
import { MiddlewareFn } from 'type-graphql';

// will run before resolver
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('not authenticated');
  }

  return next();
};
