'use client';

import { HttpLink } from '@apollo/client';
import { ApolloNextAppProvider, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { GRAPHQL_URL } from './constants';
import { setVerbosity } from 'ts-invariant';

if (process.env.NODE_ENV === 'development') {
  setVerbosity('debug');
}

function makeClient() {
  const httpLink = new HttpLink({
    // Use proxy route for client-side to avoid CORS, direct URL for SSR
    uri: typeof window === 'undefined' ? GRAPHQL_URL : '/api/graphql',
    fetchOptions: {
      credentials: 'include',
    },
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getAllLinkedUserAccounts: {
              // Cache this query for 5 minutes
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    link: httpLink,
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
