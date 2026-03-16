import { createHttpLink } from '@apollo/client';
import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { cookies } from 'next/headers';
import { GRAPHQL_URL } from './constants';
import { getGraphQLAuthHeaders } from './instacart-auth-cookies';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({
      // Dynamic URI selection based on context
      uri: GRAPHQL_URL,
      fetchOptions: {
        credentials: 'include',
      },
      // Forward cookies from Next.js server context to GraphQL requests
      fetch: async (uri, options) => {
        const cookieStore = await cookies();

        return fetch(uri, {
          ...options,
          headers: {
            ...options?.headers,
            ...getGraphQLAuthHeaders(cookieStore),
          },
        });
      },
    }),
  });
});
