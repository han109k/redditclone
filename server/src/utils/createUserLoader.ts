import DataLoader from 'dataloader';
import { User } from '../entities/User';

// keys => [1, 78, 9, 52] user ids in our case
// return user array [{id:1, username: han109k}, {id: 78, username: wyvern}, ...]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (keys) => {
    const users = await User.findByIds(keys as number[]); // get all users in one query
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    return keys.map((userId) => userIdToUser[userId]); // match user ids to user return users in order
  });
