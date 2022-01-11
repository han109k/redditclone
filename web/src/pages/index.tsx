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
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import { useState } from 'react';

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
      <Flex direction={'column'}>
        <Box display={'flex'}>
          <Heading>Reddit2</Heading>
          <NextLink href="/create-post">
            <Link my="auto" ml="auto" textDecoration={'underline'}>
              Create Post
            </Link>
          </NextLink>
        </Box>
        <Box textAlign={'center'} my={6} fontWeight={'bold'}>
          Posts
        </Box>
        {!data && fetching ? (
          <div>loading...</div>
        ) : (
          // Posts
          <Stack spacing={8}>
            {data!.posts.posts.map((p) => (
              <Box key={p.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{p.title}</Heading>
                <Text fontWeight={'light'} fontSize={'x-small'}>
                  posted by {p.creator.username}
                </Text>
                <Text mt={4}>{p.textSnippet}...</Text>
              </Box>
            ))}
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
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                });
              }}
            >
              Load more
            </Button>
          </Flex>
        ) : null}
      </Flex>
    </Layout>
  );
};

//* ssr enabled + seo improved since changes will effect to the html file
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
