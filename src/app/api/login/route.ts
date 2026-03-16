import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CREATE_USER_SESSION_FROM_CODE } from '@/app/api/login/queries';
import { getClient } from '@/lib/apollo-client';
import { setInstacartAuthCookies } from '@/lib/instacart-auth-cookies';
import { UsersAccountTypes, UsersIdentityType } from '@/__generated__/graphql-types';

export async function POST(request: NextRequest) {
  try {
    const { identifier, verification_code } = await request.json();

    const client = getClient();
    const { data, errors } = await client.mutate({
      mutation: CREATE_USER_SESSION_FROM_CODE,
      variables: {
        identifier,
        identifier_type: UsersIdentityType.Email,
        verification_code,
        accountType: UsersAccountTypes.Business,
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

    setInstacartAuthCookies(cookieStore, result.token, environment);

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
