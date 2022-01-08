import { Box, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServerSide } from '../utils/isServerSide';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServerSide
  });
  
  let body = null;
  // data is loading
  if (fetching) {
    // user is not logged in
  } else if (!data?.me) {
    body = (
      <Box>
        <Box color={'whiteAlpha.800'} mr={5}>
          <Link href={'/login'}>Login</Link>
        </Box>
        <Box color={'whiteAlpha.800'} mr={5}>
          <Link href={'/register'}>Register</Link>
        </Box>
      </Box>
    );
    // user is logged in
  } else {
    body = (
      <Box>
        <Box>{data.me.username}</Box>
        <Button
          variant={'link'}
          onClick={() => logout()}
          isLoading={logoutFetching}
          mx={4}
        >
          Logout
        </Button>
      </Box>
    );
  }
  return (
    <Flex bg="tomato" p={4} justifyContent={'end'}>
      {body}
    </Flex>
  );
};

export default NavBar;
