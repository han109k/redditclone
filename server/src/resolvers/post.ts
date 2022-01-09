import { Post } from '../entities/Post';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [Post]) // return array of Post
  async posts(): Promise<Post[]> {
    // await sleep(3000);
    return Post.find();
  }

  // Query decorator is for fetching data
  @Query(() => Post, { nullable: true }) // return the Post
  post(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // Muation decorator is for insert, edit or delete
  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    return Post.create({ title }).save();
  }

  // Muation decorator is for insert, edit or delete
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: String
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

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
