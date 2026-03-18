import { NextRequest, NextResponse } from 'next/server';
import { print } from 'graphql';
import { CREATE_USER_SESSION_FROM_CODE } from '@/app/api/login/queries';
import { GRAPHQL_URL } from '@/lib/constants';
import { setInstacartAuthCookies } from '@/lib/instacart-auth-cookies';
import { UsersAccountTypes, UsersIdentityType } from '@/__generated__/graphql-types';

export async function POST(request: NextRequest) {
  try {
    const { identifier, verification_code } = await request.json();
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(CREATE_USER_SESSION_FROM_CODE),
        variables: {
          identifier,
          identifier_type: UsersIdentityType.Email,
          verification_code,
          accountType: UsersAccountTypes.Business,
        },
      }),
    });
    const { data, errors } = await response.json();

    if (errors) {
      return NextResponse.json({ error: 'GraphQL error' }, { status: 400 });
    }

    const result = data?.createUserSessionFromVerificationCode;

    if (!result?.token) {
      return NextResponse.json({ error: 'No token received' }, { status: 400 });
    }

    const environment = process.env.NODE_ENV || 'development';

    const nextResponse = NextResponse.json({
      success: true,
      token: result.token,
      expires: result.expires,
    });

    setInstacartAuthCookies(nextResponse.cookies, result.token, environment);

    const setCookieHeaders =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : response.headers.get('set-cookie')
          ? [response.headers.get('set-cookie') as string]
          : [];

    setCookieHeaders.forEach(setCookieHeader => {
      nextResponse.headers.append('set-cookie', setCookieHeader);
    });

    return nextResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
