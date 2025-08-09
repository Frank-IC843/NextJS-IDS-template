'use client';
import { LoadingGenericOnEnter } from '@instacart/ids-customers';

export function LoadingOnEnter() {
  return (
    <LoadingGenericOnEnter
      css={{
        '& *:focus': {
          outline: 'none !important',
          border: 'none !important',
          boxShadow: 'none !important',
        },
      }}
    />
  );
}
