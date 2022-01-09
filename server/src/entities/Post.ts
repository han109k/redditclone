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
export class Post extends BaseEntity {
  @Field() // type-graphQL exposing to graphQL schema
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String) // type-graphQL
  @CreateDateColumn() // typeORM
  createdAt: Date;

  @Field(() => String) // type-graphQL
  @UpdateDateColumn()
  updatedAt: Date;

  @Field() // type-graphQL
  @Column({ type: 'text' })
  title!: String;
}
