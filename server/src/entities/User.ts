import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType() // Turn class into graphQL type
@Entity() // ctrl + .
export class User extends BaseEntity {
  @Field() // type-graphQL exposing to graphQL schema
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String) // type-graphQL
  @CreateDateColumn() // typeORM
  createdAt = Date;

  @Field(() => String) // type-graphQL
  @UpdateDateColumn()
  updatedAt = Date;

  @Field() // type-graphQL
  @Column({ unique: true })
  username!: String;

  @Field() // type-graphQL
  @Column({ unique: true })
  email!: String;

  // we don't use @Field here. We want to hide password when we share an user data
  @Column()
  password!: String;
}
