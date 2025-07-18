import { getClient } from '@/lib/apollo-client';
import { BUSINESS_LAYOUT_QUERY } from '../queries';

export async function ServerSideDataTile() {
  const { data } = await getClient().query({ query: BUSINESS_LAYOUT_QUERY });
  return (
    <div
      css={{
        padding: '20px',
        backgroundColor: '#d4edda',
        margin: '10px',
        borderRadius: '8px',
        border: '1px solid #c3e6cb',
      }}
    >
      <h2>🚀 Server-Side Data Fetching (SSR)</h2>
      <p>
        <strong>Status:</strong> Data rendered immediately on server!
      </p>
      <p>
        <strong>Loading State:</strong> None - data available instantly
      </p>
      <details>
        <summary>Raw Data (click to expand)</summary>
        <pre css={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
}
