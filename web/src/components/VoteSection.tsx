import { Flex, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import NextLink from 'next/link';
import {
  RegularPostFragment,
  useDeletePostMutation,
  useVoteMutation,
} from '../generated/graphql';

// icons
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface VoteSectionProps {
  post: RegularPostFragment;
}

const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [loading, setLoading] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  // operation object includes context(fetch, fetchOptions ...), query, variables(postId, value)
  const [, vote] = useVoteMutation();
  const [, deletePost] = useDeletePostMutation();

  return (
    <Flex
      direction={'column'}
      justifyContent={'space-between'}
      background={'gray.100'}
      py={2}
    >
      <IconButton
        variant={post.voteStatus === 1 ? 'solid' : 'ghost'}
        colorScheme={'facebook'}
        aria-label="Upvote"
        fontSize="20px"
        height="20px"
        icon={<FiChevronUp />}
        onClick={async () => {
          setLoading('upvote-loading');
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoading('not-loading');
        }}
        disabled={post.voteStatus === 1 ? true : false}
        isLoading={loading === 'upvote-loading'}
      />
      <Text fontSize={'x-small'} mx={'auto'}>
        {post.points}
      </Text>
      <IconButton
        variant={post.voteStatus === -1 ? 'solid' : 'ghost'}
        colorScheme="red"
        aria-label="Downvote"
        fontSize="20px"
        height="20px"
        icon={<FiChevronDown />}
        onClick={async () => {
          setLoading('downvote-loading');
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoading('not-loading');
        }}
        disabled={post.voteStatus === -1 ? true : false}
        isLoading={loading === 'downvote-loading'}
      />
      <Flex mt={2} maxW="90px">
        <IconButton
          aria-label="delete post"
          icon={<FaTrashAlt />}
          width="5px"
          height="15px"
          fontSize="15px"
          textColor={'red.500'}
          onClick={() => {
            deletePost({ id: post.id });
          }}
        ></IconButton>
        <NextLink href="post/edit/[id]" as={`/post/edit/${post.id}`}>
          <IconButton
            aria-label="edit post"
            icon={<FaEdit />}
            height="15px"
            fontSize="15px"
            textColor={'blue.500'}
          ></IconButton>
        </NextLink>
      </Flex>
    </Flex>
  );
};

export default VoteSection;
