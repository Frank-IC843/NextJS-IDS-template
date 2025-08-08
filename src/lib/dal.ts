import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Next.js 2025 Best Practice: Data Access Layer (DAL)
 * Replaces middleware-based authentication
 */

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const instacartSession = cookieStore.get('_instacart_session')?.value;
  const instacartSid = cookieStore.get('instacart_sid')?.value || cookieStore.get('__Host-instacart_sid')?.value;

  if (!instacartSession || !instacartSid) {
    return null;
  }

  // Here you would verify the token with your auth provider
  // For now, we assume if cookies exist, user is authenticated
  return {
    userId: 'user-id', // Extract from token
    sessionToken: instacartSession,
    sidToken: instacartSid,
  };
});

export const getUser = cache(async () => {
  const session = await verifySession();

  if (!session) {
    return null;
  }

  // Use your Apollo Client to fetch user data
  // This is where you'd call your GraphQL query
  try {
    // const userData = await apolloClient.query(GET_ALL_LINKED_USER_ACCOUNTS)
    // return userData
    return { id: session.userId, authenticated: true };
  } catch (error) {
    console.error('Failed to fetch user', error);
    return null;
  }
});

export const requireAuth = cache(async () => {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
});
