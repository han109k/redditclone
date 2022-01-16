import { Box } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../../utils/createUrqlClient';

const EditPost = ({}) => {
  return <Box>Hello</Box>;
};

export default withUrqlClient(createUrqlClient)(EditPost);
