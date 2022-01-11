import { Post } from '../entities/Post';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Upvote } from '../entities/Upvote';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

//* POST RESOLVER
@Resolver(Post)
export class PostResolver {
  // Text snippet for front-end
  @FieldResolver(() => String) // type-graphql
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  //* VOTE
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth) // protect this route from unauthenticated users
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpvote = value !== -1;
    const vote = isUpvote ? 1 : -1;
    const { userId } = req.session;
    // insert into upvote table
    // await Upvote.insert({ userId, postId, value: vote });

    // insert into upvote table
    // update post's upvote value
    await getConnection().query(
      `
      start transaction;
      insert into upvote ("userId", "postId", value)
      values (${userId}, ${postId}, ${vote});
      update post
      set points = points + ${vote}
      where id = ${postId};
      commit;
      `
    );

    // await Post.update({set: });
    return true;
  }

  //* GET POSTS
  @Query(() => PaginatedPosts) // return array of Post
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    // 10 -> 11 we normally want to fetch 10 post but we fetch 11 instead to determine if there is more posts or not
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder('p')
      .innerJoinAndSelect(
        'p.creator',
        'u', // creator
        'u.id = p."creatorId"'
      )
      // https://github.com/typeorm/typeorm/issues/747#issuecomment-491585082
      .orderBy('p.createdAt', 'DESC') // when parsing we need to use double quotations to prevent it to lowercase
      .take(realLimitPlusOne);
    if (cursor) {
      qb.where('p."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      }); // get posts before createdAt -> :createAt
    }

    const posts = await qb.getMany();
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  //* GET POST BY ID
  // Query decorator is for fetching data
  @Query(() => Post, { nullable: true }) // return the Post
  post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  //* CREATE A POST
  // Muation decorator is for insert, edit or delete
  @UseMiddleware(isAuth) // type-graphql middleware runs before createPost resolver
  @Mutation(() => Post)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    if (!req.session.userId) {
      throw new Error('not authenticated');
    }
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  //* UPDATE A POST
  // Muation decorator is for insert, edit or delete
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } }); // same as findOne(id)
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title });
    }
    return post;
  }

  //* DELETE A POST
  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
