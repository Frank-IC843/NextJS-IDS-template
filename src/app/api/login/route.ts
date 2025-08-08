import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClient } from '@/lib/apollo-client';
import { CREATE_USER_SESSION_FROM_CODE } from '@/app/queries';
import { UsersIdentityType } from '@/__generated__/graphql-types';

export async function POST(request: NextRequest) {
  try {
    const { identifier, verification_code, identifier_type } = await request.json();

    const client = getClient();
    const { data, errors } = await client.mutate({
      mutation: CREATE_USER_SESSION_FROM_CODE,
      variables: {
        identifier,
        identifier_type: identifier_type === 'phone' ? UsersIdentityType.PhoneNumber : UsersIdentityType.Email,
        verification_code,
        accountType: null,
        linkUserAccounts: false,
      },
    });

    if (errors) {
      return NextResponse.json({ error: 'GraphQL error' }, { status: 400 });
    }

    const result = data?.createUserSessionFromVerificationCode;

    if (!result?.token) {
      return NextResponse.json({ error: 'No token received' }, { status: 400 });
    }

    // Set Instacart cookies
    const cookieStore = await cookies();
    const environment = process.env.NODE_ENV || 'development';

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };

    // Environment-specific cookie names
    if (environment === 'production') {
      cookieStore.set('_instacart_session', result.token, cookieOptions);
      cookieStore.set('__Host-instacart_sid', result.token, cookieOptions);
    } else {
      cookieStore.set('_instacart_session', result.token, cookieOptions);
      cookieStore.set('instacart_sid', result.token, cookieOptions);
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      expires: result.expires,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
