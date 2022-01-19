import { Flex, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { RegularPostFragment, useVoteMutation } from '../generated/graphql';
import EditDeleteButtons from './EditDeleteButtons';

interface VoteSectionProps {
  post: RegularPostFragment;
}

const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [loading, setLoading] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  // operation object includes context(fetch, fetchOptions ...), query, variables(postId, value)
  // const [{operation}] = useMeQuery()
  const [, vote] = useVoteMutation();

  return (
    <Flex
      direction={'column'}
      justifyContent={'space-between'}
      background={'gray.100'}
      py={2}
      width="80px"
    >
      <IconButton
        variant={post.voteStatus === 1 ? 'solid' : 'ghost'}
        colorScheme={'facebook'}
        aria-label="Upvote"
        fontSize="20px"
        height="20px"
        width="20px"
        mx={'auto'}
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
        width="20px"
        mx={'auto'}
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
      <Flex mt={2}>
        <EditDeleteButtons id={post.id} creatorId={post.creator.id} />
      </Flex>
    </Flex>
  );
};

export default VoteSection;
