import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@ObjectType() // Turn class into graphQL type
@Entity() // ctrl + . to import
export class Post extends BaseEntity {
  @Field() // type-graphQL exposing to graphQL schema
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;

  @ManyToOne(() => User, (user) => user.posts)
  creator: User; // foreign key

  @Field(() => String) // return type
  @CreateDateColumn() // typeORM
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
