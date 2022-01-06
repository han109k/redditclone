import { Box, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();
  let body = null;
  // data is loading
  if (fetching) {
    // user is not logged in
  } else if (!data?.me) {
    body = (
      <>
        <Box color={'whiteAlpha.800'} mr={5}>
          <Link href={'/login'}>Login</Link>
        </Box>
        <Box color={'whiteAlpha.800'} mr={5}>
          <Link href={'/register'}>Register</Link>
        </Box>
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex color={'whiteAlpha.800'}>
        <Box>{data.me.username}</Box>
        <Button
          variant={'link'}
          onClick={() => logout()}
          isLoading={logoutFetching}
          mx={4}
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="tomato" p={4} justifyContent={'end'}>
      {body}
    </Flex>
  );
};

export default NavBar;
