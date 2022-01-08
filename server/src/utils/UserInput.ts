import {
  Field,
  InputType
} from 'type-graphql';

// Instead of creating multiple args we can use custom class
// @Arg("username") username: string
// @Arg("password") password: string
@InputType()
export class UserInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
