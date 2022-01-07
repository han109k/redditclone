import { Post } from '../entities/Post';
import { MyContext } from 'src/types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [Post]) // return array of Post
  async posts(
    @Ctx()
    { em }: MyContext
  ): Promise<Post[]> {
    // await sleep(3000);
    return em.find(Post, {});
  }

  // Query decorator is for fetching data
  @Query(() => Post, { nullable: true }) // return the Post
  post(
    @Arg('id') id: number,
    @Ctx()
    { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  // Muation decorator is for insert, edit or delete
  @Mutation(() => Post, { nullable: true })
  async createPost(
    @Arg('title') title: String,
    @Ctx()
    { em }: MyContext
  ): Promise<Post | null> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  // Muation decorator is for insert, edit or delete
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: String,
    @Ctx()
    { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx()
    { em }: MyContext
  ): Promise<boolean> {
    const res = await em.nativeDelete(Post, { id });
    return res != 0 ? true : false;
  }
}
