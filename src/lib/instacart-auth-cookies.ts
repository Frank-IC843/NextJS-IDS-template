type CookieRecord = {
  name: string;
  value: string;
};

type CookieStoreReader = {
  get(name: string): CookieRecord | undefined;
};

type CookieStoreWriter = {
  set(name: string, value: string, options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    path: string;
    maxAge: number;
  }): void;
};

export function getGraphQLAuthHeaders(cookieStore: CookieStoreReader) {
  const authCookies: string[] = [];
  const instacartSession = cookieStore.get('_instacart_session');
  const instacartSid = cookieStore.get('instacart_sid') || cookieStore.get('__Host-instacart_sid');

  if (instacartSession) {
    authCookies.push(`_instacart_session=${instacartSession.value}`);
  }

  if (instacartSid) {
    authCookies.push(`${instacartSid.name}=${instacartSid.value}`);
  }

  return {
    ...(process.env.GRAPHQL_AUTH_TOKEN
      ? {
          Authorization: `Bearer ${process.env.GRAPHQL_AUTH_TOKEN}`,
        }
      : {}),
    ...(authCookies.length > 0
      ? {
          Cookie: authCookies.join('; '),
        }
      : {}),
  };
}

export function setInstacartAuthCookies(cookieStore: CookieStoreWriter, token: string, environment: string) {
  const cookieOptions = {
    httpOnly: true,
    secure: environment === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };

  cookieStore.set('_instacart_session', token, cookieOptions);

  if (environment === 'production') {
    cookieStore.set('__Host-instacart_sid', token, cookieOptions);
    return;
  }

  cookieStore.set('instacart_sid', token, cookieOptions);
}
