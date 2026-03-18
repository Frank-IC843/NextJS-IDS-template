import { createHttpLink } from '@apollo/client';
import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { cookies, headers } from 'next/headers';
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
        cache: 'no-store',
      },
      // Forward cookies from Next.js server context to GraphQL requests
      fetch: async (uri, options) => {
        const cookieStore = await cookies();
        const headerStore = await headers();
        const incomingCookieHeader = headerStore.get('cookie');
        const mergedHeaders = new Headers(options?.headers);

        Object.entries(getGraphQLAuthHeaders(cookieStore)).forEach(([key, value]) => {
          mergedHeaders.set(key, value);
        });

        if (incomingCookieHeader) {
          mergedHeaders.set('Cookie', incomingCookieHeader);
        }

        return fetch(uri, {
          ...options,
          cache: 'no-store',
          headers: mergedHeaders,
        });
      },
    }),
  });
});
