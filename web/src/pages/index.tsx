import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import Layout from '../components/Layout';
// Components
import VoteSection from '../components/VoteSection';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
  // Get posts
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 10,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (error) {
    return (
      <div>
        <div>Query failed!</div>
        <div>{error.message}</div>
      </div>
    );
  }

  return (
    <Layout>
      <Box textAlign={'center'} mb={6} fontWeight={'bold'}>
        <Heading>Posts</Heading>
      </Box>
      {!data && loading ? (
        <div>loading...</div>
      ) : (
        // Posts
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            // after deletion p will be null so it will be problem when rendering
            // so check before!
            !p ? null : (
              <Flex key={p.id} shadow="md" borderWidth="1px">
                {/* Upvote downvote */}
                <VoteSection post={p} />
                {/* Post */}
                <Flex direction={'column'} ml={'1'} py={3}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text fontWeight={'light'} fontSize={'x-small'}>
                    posted by {p.creator.username}
                  </Text>
                  <Text mt={4}>{p.textSnippet}...</Text>
                </Flex>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            isLoading={loading}
            fontWeight={'light'}
            fontSize={'sm'}
            my={8}
            mx={'auto'}
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
                // pagination(deprecated)
                // updateQuery: (
                //   previousValue,
                //   { fetchMoreResult }
                // ): PostsQuery => {
                //   if (!fetchMoreResult) return previousValue;
                //   return {
                //     __typename: 'Query',
                //     posts: {
                //       __typename: 'PaginatedPosts',
                //       hasMore: fetchMoreResult.posts.hasMore,
                //       posts: [
                //         ...previousValue.posts.posts,
                //         ...fetchMoreResult.posts.posts,
                //       ],
                //     },
                //   };
                // },
              });
            }}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default Index;
