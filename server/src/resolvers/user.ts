import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
const argon2 = require('argon2');
import { EntityManager } from '@mikro-orm/postgresql';
import { COOKIE_NAME } from '../constants';

// Instead of creating multiple args we can use custom class
// @Arg("username") username: string
// @Arg("password") password: string
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

// The reason we're using ObjectType is that we can return them in @Mutation()
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  //* VERIFY
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // Not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  //* REGISTER
  @Mutation(() => UserResponse) // return string
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 5) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 5',
          },
        ],
      };
    }
    if (options.password.length <= 5) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be greater than 5',
          },
        ],
      };
    }
    // hashing password before storing on db
    const hashedPassword = await argon2.hash(options.password);

    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    // let user;
    try {
      await em.persistAndFlush(user);
      // const result = await (em as EntityManager)
      //   .createQueryBuilder(User)
      //   .getKnexQuery()
      //   .insert({
      //     username: options.username,
      //     password: hashedPassword,
      //     created_at: new Date(), // mikroORM converts variable name createdAt to created_at but we need to do it manually here
      //     updated_at: new Date(),
      //   })
      //   .returning('*');
      // user = result[0];
    } catch (error) {
      // duplicate user
      if (error.code === '23505') {
        // || error.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    // set cookie on the user client to keep them logged in
    req.session.userId = user.id;

    return { user };
  }

  //* LOGIN
  @Mutation(() => UserResponse) // return string
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req, res }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  //* LOGOUT
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    // clear redis
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false)
          return;
        };

        res.clearCookie(COOKIE_NAME); // clear cookie
        resolve(true);
      })
    );
  }
}
