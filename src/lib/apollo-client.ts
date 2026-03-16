import { createHttpLink } from '@apollo/client';
import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { cookies } from 'next/headers';
import { GRAPHQL_URL } from './constants';

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
        const authCookies = [];

        // Get Instacart auth cookies
        const instacartSession = cookieStore.get('_instacart_session');
        const instacartSid = cookieStore.get('instacart_sid') || cookieStore.get('__Host-instacart_sid');

        if (instacartSession) {
          authCookies.push(`_instacart_session=${instacartSession.value}`);
        }
        if (instacartSid) {
          authCookies.push(`${instacartSid.name}=${instacartSid.value}`);
        }
        console.log(`calling tools with token ${process.env.GRAPHQL_AUTH_TOKEN}`);
        return fetch(uri, {
          ...options,
          headers: {
            ...options?.headers,
            ...(process.env.GRAPHQL_AUTH_TOKEN && {
              Authorization: `Bearer ${process.env.GRAPHQL_AUTH_TOKEN}`,
            }),
            // Forward cookies to GraphQL server
            ...(authCookies.length > 0 && {
              Cookie: authCookies.join('; '),
            }),
          },
        });
      },
    }),
  });
});
