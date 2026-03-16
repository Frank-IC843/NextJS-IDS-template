import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GRAPHQL_URL } from '@/lib/constants';

/**
 * GraphQL Proxy Route
 * Forwards GraphQL requests to the backend with proper cookie handling
 * This avoids CORS issues and ensures cookies are always sent
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body (GraphQL query)
    const body = await request.json();

    // Get cookies from the request
    const cookieStore = await cookies();
    const authCookies = [];

    // Extract Instacart auth cookies
    const instacartSession = cookieStore.get('_instacart_session');
    const instacartSid = cookieStore.get('instacart_sid') || cookieStore.get('__Host-instacart_sid');

    if (instacartSession) {
      authCookies.push(`_instacart_session=${instacartSession.value}`);
    }
    if (instacartSid) {
      authCookies.push(`${instacartSid.name}=${instacartSid.value}`);
    }

    // Forward the request to the GraphQL server
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.GRAPHQL_AUTH_TOKEN && {
          Authorization: `Bearer ${process.env.GRAPHQL_AUTH_TOKEN}`,
        }),
        // Forward cookies to the GraphQL server
        ...(authCookies.length > 0 && {
          Cookie: authCookies.join('; '),
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Create the response
    const nextResponse = NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Forward any set-cookie headers from the GraphQL server
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return NextResponse.json({ errors: [{ message: 'Internal server error' }] }, { status: 500 });
  }
}
