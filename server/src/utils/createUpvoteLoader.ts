import DataLoader from 'dataloader';
import { Upvote } from '../entities/Upvote';

// keys => [{postId: 5, userId: 78}, {postId: 21, userId: 56}, ...] user ids in our case
// return upvotes [1, {id: 78, username: wyvern}, ...]
export const createUpvoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
      const upvotes = await Upvote.findByIds(keys as any); // get all users in one query
      const upvoteIdsToUpvote: Record<string, Upvote> = {};
      upvotes.forEach((upvote) => {
        upvoteIdsToUpvote[`${upvote.userId}|${upvote.postId}`] = upvote;
      });

      return keys.map(
        (key) => upvoteIdsToUpvote[`${key.userId}|${key.postId}`]
      ); // match user ids to user
    }
  );
