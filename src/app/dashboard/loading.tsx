'use client';

import { LoadingGenericOnEnter } from '@instacart/ids-customers';

export default function Loading() {
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
