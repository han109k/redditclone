import { useApolloClient } from '@apollo/client';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServerSide } from '../utils/isServerSide';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServerSide, // this means for 'me' query don't use cache (go make a request)
  });

  let body = null;
  // data is loading
  if (loading) {
    // user is not logged in
  } else if (!data?.me) {
    body = (
      <Flex>
        <Box color={'whiteAlpha.800'} mr={5}>
          <NextLink href={'/login'}>Login</NextLink>
        </Box>
        <Box color={'whiteAlpha.800'} mr={5}>
          <NextLink href={'/register'}>Register</NextLink>
        </Box>
      </Flex>
    );
    // user is logged in
  } else {
    body = (
      <Flex alignItems={'center'}>
        <Box mr={4}>
          <NextLink href="/create-post">
            <Button size={'sm'} color={'blackAlpha.800'}>
              Create Post
            </Button>
          </NextLink>
        </Box>
        <Box my={'auto'}>{data.me.username}</Box>
        <Button
          color={'whiteAlpha.800'}
          variant={'link'}
          onClick={async () => {
            await logout();
            await apolloClient.resetStore(); // reset cache
          }}
          isLoading={logoutFetching}
          mx={4}
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex
      bg="tomato"
      p={4}
      position={'sticky'}
      top={0}
      zIndex={1}
      justifyContent={'end'}
      align={'center'}
    >
      <Flex maxW={800} alignItems={'center'} flex={1} m={'auto'}>
        <Box mr="auto" color={'whiteAlpha.800'}>
          <NextLink href="/">
            <Link>
              <Heading size={'xl'}>Reddit2</Heading>
            </Link>
          </NextLink>
        </Box>
        {body}
      </Flex>
    </Flex>
  );
};

export default NavBar;
