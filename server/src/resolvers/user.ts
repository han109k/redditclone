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
  //* REGISTER
  @Mutation(() => UserResponse) // return string
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ) : Promise<UserResponse> {
    if(options.username.length <= 5) {
      return {
        errors: [{
          field: 'username',
          message: 'length must be greater than 5'
        }]
      }
    }
    if(options.password.length <= 5) {
      return {
        errors: [{
          field: 'password',
          message: 'length must be greater than 5'
        }]
      }
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch(error) {
      // duplicate user
      if(error.code === '23505') { // || error.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken'
            }
          ]
        }
      }
    }
    return {user};
  }

  //* LOGIN
  @Mutation(() => UserResponse) // return string
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
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
}
