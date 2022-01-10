import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { UserInput } from '../utils/UserInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
import { getConnection } from 'typeorm';

// Error custom class
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

@Resolver(User)
export class UserResolver {
  //* CHANGE PASSWORD
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 5) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 5',
          },
        ],
      };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [{ field: 'token', message: 'token expired' }],
      };
    }

    // TypeORM
    const user = await User.findOne({ id: parseInt(userId) });

    if (!user) {
      return {
        errors: [{ field: 'token', message: 'user no longer exist' }],
      };
    }

    await User.update(
      { id: user.id },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);

    return { user };
  }

  //* FORGOT PASSWORD
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } }); // since email is not a primary key we need to use 'where'
    if (!user) {
      // the email is not in the db
      return false;
    }

    const token = v4();
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24
    ); // 1 day

    // nodemailer
    // http://url/change-password/token
    await sendEmail(
      email,
      `<a href='http://localhost:3000/change-password/${token}'>reset password</a>`
    );

    return true;
  }

  //* VERIFY
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    // Not logged in
    if (!req.session.userId) {
      return null;
    }

    return await User.findOne(req.session.userId);
  }

  //* REGISTER
  @Mutation(() => UserResponse) // return string
  async register(
    @Arg('options') options: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // Validations
    const errors = validateRegister(options);

    if (errors) return { errors };

    // hashing password before storing on db
    const hashedPassword = await argon2.hash(options.password);

    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning('*')
        .execute();

      user = result.raw[0];
    } catch (error) {
      console.log(error);

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
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req, res }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password.toString(), password);
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
          resolve(false);
          return;
        }

        res.clearCookie(COOKIE_NAME); // clear cookie
        resolve(true);
      })
    );
  }
}
