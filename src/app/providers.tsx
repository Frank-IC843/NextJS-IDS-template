'use client';

import { useRouter } from 'next/navigation';
import { IdsProvider } from '@instacart/ids-core';
import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { getBusinessThemeOverrides } from '@/app/theme';
declare module '@instacart/ids-core' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>;
  }
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <ApolloWrapper>
      <IdsProvider
        themeOverrides={getBusinessThemeOverrides()}
        routing={{
          navigate: router.push,
        }}
      >
        {children}
      </IdsProvider>
    </ApolloWrapper>
  );
}
