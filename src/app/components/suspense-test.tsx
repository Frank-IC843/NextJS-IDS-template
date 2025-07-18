'use client';

import { Suspense } from 'react';
import { useSuspenseQuery } from '@apollo/client';
import { BUSINESS_LAYOUT_QUERY } from '../queries';
import { PrimaryButton } from '@instacart/ids-customers';

function BusinessLayoutTest() {
  const { data, refetch } = useSuspenseQuery(BUSINESS_LAYOUT_QUERY, {
    variables: {
      category: 'test',
      isReferral: false,
    },
  });

  return (
    <>
      <PrimaryButton css={{ maxWidth: 'fit-content' }} onClick={() => refetch()}>
        Refresh Data
      </PrimaryButton>
      <div css={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '10px', borderRadius: '8px' }}>
        <h2>✅ useSuspenseQuery Test</h2>
        <p>
          <strong>Status:</strong> Query executed successfully!
        </p>
        <details>
          <summary>Raw Data (click to expand)</summary>
          <pre css={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>{JSON.stringify(data, null, 2)}</pre>
        </details>
      </div>
    </>
  );
}

export function TestSuspenseQuery() {
  return (
    <div>
      <h1>GraphQL useSuspenseQuery Integration Test</h1>
      <Suspense
        fallback={
          <div css={{ padding: '20px', backgroundColor: '#fff3cd', margin: '10px', borderRadius: '8px' }}>
            <h2>⏳ Loading...</h2>
            <p>Testing useSuspenseQuery with Suspense boundary...</p>
          </div>
        }
      >
        <BusinessLayoutTest />
      </Suspense>
    </div>
  );
}
