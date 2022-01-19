import { Box, Flex, Heading } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import EditDeleteButtons from '../../components/EditDeleteButtons';
import Layout from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();

  if (fetching) {
    return (
      <Layout>
        <Box>loading...</Box>
      </Layout>
    );
  }

  if (error) {
    return <Box>{error.message}</Box>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find the post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex mb={4}>
        <Heading>{data.post.title}</Heading>
        <Flex ml={2} my={'auto'}>
          <EditDeleteButtons
            id={data.post.id}
            creatorId={data.post.creator.id}
          />
        </Flex>
      </Flex>
      {data.post.text}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
