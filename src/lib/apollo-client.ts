import { HttpLink } from '@apollo/client';
import { registerApolloClient, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import { cookies } from 'next/headers';
import { GRAPHQL_URL } from './constants';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
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

        return fetch(uri, {
          ...options,
          headers: {
            ...options?.headers,
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
