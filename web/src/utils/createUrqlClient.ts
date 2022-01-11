import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import Router from 'next/router';
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from 'urql';
import { pipe, tap } from 'wonka';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';
import { betterUpdateQuery } from '../utils/betterUpdateQuery';

export const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        // if the operationResult has an error send a request to senrty
        if (error?.message.includes('not authenticated')) {
          Router.replace('/login');
        }
      })
    );
  };

//* PAGINATION
// https://github.com/FormidableLabs/urql/blob/main/exchanges/graphcache/src/extras/simplePagination.ts
const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    // console.log(entityKey, fieldName); // Query, posts

    const allFields = cache.inspectFields(entityKey); // all the fields in the cache
    // console.log('all fields', allFields);

    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName); // filter
    // console.log('fieldInfos', fieldInfos);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    // console.log('field args', fieldArgs); // limit: 10
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    // console.log('key we created', fieldKey);
    const isItInTheCache = cache.resolve(entityKey, fieldKey);
    // console.log('isItInTheCache:', isItInTheCache);
    info.partial = !isItInTheCache;
    // console.log('info.parital', info.partial);

    let hasMore: boolean = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      // console.log('key', key);
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');
      // console.log('data', data, _hasMore); // post with ids
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return { __typename: 'PaginatedPosts', hasMore, posts: results };
  };
};

// urql config.
export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(), // posts -> posts.graphql
        },
      },
      updates: {
        Mutation: {
          // createPost(createPost.graphql) send server a request. Saves a new post to our db
          // invalidates cache on client side then index.ts(client-side) re-fetches from graphQL
          createPost: (_result, args, cache, info) => {
            const queryFields = cache.inspectFields('Query'); // Query fields
            const fieldInfos = queryFields.filter(
              (info) => info.fieldName === 'posts'
            ); // filter
            fieldInfos.forEach((fi) => {
              cache.invalidate('Query', 'posts', fi.arguments || {});
            });
            console.log(
              'cache inspectFields of Query',
              cache.inspectFields('Query')
            );
          },
          // delete { me } from cache
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
          //
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          //
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
