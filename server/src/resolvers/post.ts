import { User } from '../entities/User';
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
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Upvote } from '../entities/Upvote';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

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

  // get creator based on creator id
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    // given creator id on the post find user
    // return User.findOne(post.creatorId);
    return userLoader.load(post.creatorId);
  }

  // get vote status
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, upvoteLoader }: MyContext
  ) {
    if (!req.session.userId) return null;
    const upvote = await upvoteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return upvote ? upvote.value : null;
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

    const isVoted = await Upvote.findOne({ where: { postId, userId } });

    // the user has voted on the post before
    // and they are changing their vote
    if (isVoted && isVoted.value !== vote) {
      await getConnection().transaction(async (tm) => {
        // change vote
        await tm.query(
          `update upvote set value = $1 where "postId" = $2 and "userId" = $3`,
          [vote, postId, userId]
        );

        // when changing vote you're incrementing/decrementing by 2
        await tm.query(`update post set points = points + $1 where id = $2`, [
          2 * vote,
          postId,
        ]);
      });
    } else if (!isVoted) {
      // never voted before
      await getConnection().transaction(async (tm) => {
        // insert into upvote table
        // update post's upvote value
        await tm.query(
          `insert into upvote ("userId", "postId", value) values ($1, $2, $3)`,
          [userId, postId, vote]
        );

        await tm.query(`update post set points = points + $1 where id = $2`, [
          vote,
          postId,
        ]);
      });
    } else {
      //TODO user wants to undo their vote
    }

    // insert into upvote table
    // await Upvote.insert({ userId, postId, value: vote });
    // await Post.update({set: });

    return true;
  }

  //* GET POSTS
  @Query(() => PaginatedPosts) // return array of Post
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    // 10 -> 11 we normally want to fetch 10 post but we fetch 11 instead to determine if there is more posts or not
    const realLimit = Math.min(25, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    // console.log('replacements', replacements);

    const posts = await getConnection().query(
      `
      select p.*
      from post p
      ${cursor ? `where p."createdAt" < $2` : ''}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements
    );

    // const posts = await getConnection().query(
    //   `
    //   select p.*,
    //* SUBQUERY
    //   ${
    //     req.session.userId
    //       ? '(select value from upvote where "userId" = $2 and "postId" = p.id) as "voteStatus"'
    //       : 'null as "voteStatus"'
    //   }
    //   from post p
    //   ${cursor ? `where p."createdAt" < $3` : ''}
    //   order by p."createdAt" DESC
    //   limit $1
    //   `,
    //   replacements
    // );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect(
    //     'p.creator',
    //     'u', // creator
    //     'u.id = p."creatorId"'
    //   )
    //   // https://github.com/typeorm/typeorm/issues/747#issuecomment-491585082
    //   .orderBy('p.createdAt', 'DESC') // when parsing we need to use double quotations to prevent it to lowercase
    //   .take(realLimitPlusOne);
    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   }); // get posts before createdAt -> :createAt
    // }
    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  //* GET POST BY ID
  // Query decorator is for fetching data
  @Query(() => Post, { nullable: true }) // return the Post
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    // return Post.findOne(id, { relations: ['creator'] }); //* get post and creator. typeORM automatically writes join for relations option
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning('*')
      .execute();
    return result.raw[0];
    // return Post.update({ id, creatorId: req.session.userId }, { title, text });
  }

  //* DELETE A POST
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth) // check if the user is logged in
  async deletePost(
    @Arg('id', () => Int) id: number, // '() => Int' use this for non float id
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // non cascade solution
    // const post = await Post.findOne(id);
    // if(!post) return false;
    // if(post.creatorId !== req.session.userId) throw new Error('not authorized');
    // await Upvote.delete({postId: id});
    // await Post.delete({id});

    const res = await Post.delete({ id, creatorId: req.session.userId });
    if (res.affected) return true; // if deleted

    return false;
  }
}
