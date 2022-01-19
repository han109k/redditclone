import { Box, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';

// icons
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeleteButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeleteButtons: React.FC<EditDeleteButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          aria-label="edit post"
          icon={<FaEdit />}
          height="15px"
          fontSize="15px"
          textColor={'blue.500'}
        />
      </NextLink>
      <IconButton
        aria-label="delete post"
        icon={<FaTrashAlt />}
        width="5px"
        height="15px"
        fontSize="15px"
        textColor={'red.500'}
        onClick={() => {
          deletePost({ id });
        }}
      />
    </Box>
  );
};

export default EditDeleteButtons;
