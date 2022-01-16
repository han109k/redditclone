import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import Layout from '../components/Layout';
// Components
import VoteSection from '../components/VoteSection';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  // Get posts
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>You got query failed!!!</div>;
  }

  return (
    <Layout>
      <Box textAlign={'center'} mb={6} fontWeight={'bold'}>
        <Heading>Posts</Heading>
      </Box>
      {!data && fetching ? (
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
            isLoading={fetching}
            fontWeight={'light'}
            fontSize={'sm'}
            my={8}
            mx={'auto'}
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
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

//* ssr enabled + seo improved since changes will effect to the html file
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
