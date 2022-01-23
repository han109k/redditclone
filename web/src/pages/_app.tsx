import { ChakraProvider } from '@chakra-ui/react';
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';

import theme from '../theme';
import { AppProps } from 'next/app';
import { PaginatedPosts } from '../generated/graphql';

const link = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL as string,
  credentials: 'include',
});

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            // Don't cache separate results based on
            // any of this field's arguments.
            keyArgs: false,
            // Concatenate the incoming list items with
            // the existing list items.
            merge(
              existing: PaginatedPosts | undefined,
              incoming: PaginatedPosts
            ): PaginatedPosts {
              return {
                ...incoming,
                posts: [...(existing?.posts || []), ...incoming.posts],
              };
            },
          },
        },
      },
    },
  }),
  link,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default MyApp;
