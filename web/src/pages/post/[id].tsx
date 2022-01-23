import { Box, Flex, Heading } from '@chakra-ui/react';
import React from 'react';
import EditDeleteButtons from '../../components/EditDeleteButtons';
import Layout from '../../components/Layout';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post = ({}) => {
  const { data, error, loading } = useGetPostFromUrl();

  if (loading) {
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

export default Post;
