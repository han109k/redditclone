import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';
import { Upvote } from './Upvote';

@ObjectType() // Turn class into graphQL type
@Entity() // ctrl + . to import
export class User extends BaseEntity {
  @Field() // type-graphQL exposing to graphQL schema
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  // we don't use @Field here. We want to hide password when we share an user data
  @Column()
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[];

  @Field(() => String) // return type string
  @CreateDateColumn() // typeORM
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
