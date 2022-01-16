import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

// Many to many relationship
// user -> join table <- posts
// user -> upvote <- posts

@Entity()
export class Upvote extends BaseEntity {
  @Field()
  @Column({ type: 'int' })
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.upvotes)
  user: User; // foreign key

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, (post) => post.upvotes, {
    onDelete: 'CASCADE',
  })
  post: Post;
}
