'use client';

import { HttpLink } from '@apollo/client';
import { ApolloNextAppProvider, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { GRAPHQL_URL } from './constants';

// have a function to create a client for you
function makeClient() {
  const httpLink = new HttpLink({
    // Use our proxy route instead of direct GraphQL endpoint
    uri: '/api/graphql',
    fetchOptions: {
      credentials: 'include',
      // Next.js-related fetch options for caching and revalidation
      // see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
    },
    // you can override the default `fetchOptions` on a per query basis
    // via the `context` property on the options passed as a second argument
    // to an Apollo Client data fetching hook, e.g.:
    // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: 'no-store' }}});
  });

  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/client-integration-nextjs"
    cache: new InMemoryCache({
      // Optional: Configure cache policies for better performance
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
