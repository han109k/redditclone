import { Entity, Property, PrimaryKey } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@ObjectType() // Turn class into graphQL type
@Entity() // ctrl + .
export class User {
  @Field() // type-graphQL exposing to graphQL schema
  @PrimaryKey()
  id!: number;

  @Field(() => String) // type-graphQL
  @Property({ type: 'date' }) // mikro-orm
  createdAt = new Date();

  @Field(() => String) // type-graphQL
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field() // type-graphQL
  @Property({ type: 'text', unique: true })
  username!: String;

  @Field() // type-graphQL
  @Property({ type: 'text', unique: true })
  email!: String;

  // we don't use @Field here. We want to hide password when we share an user data
  @Property({ type: 'text' })
  password!: String;
}
