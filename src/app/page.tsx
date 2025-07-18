import { TestSuspenseQuery } from './components/suspense-test';
import { ServerSideDataTile } from './components/server-side-data-tile';

export default async function Home() {
  return (
    <div css={{ display: 'flex', flexDirection: 'column' }}>
      <h1 css={{ margin: '20px 10px', fontSize: '24px', fontWeight: 'bold' }}>GraphQL Data Fetching Comparison</h1>
      <div css={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <ServerSideDataTile />
        <TestSuspenseQuery />
      </div>
    </div>
  );
}
