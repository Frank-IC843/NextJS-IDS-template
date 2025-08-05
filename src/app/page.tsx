// import { TestSuspenseQuery } from './components/suspense-test';
// import { ServerSideDataTile } from './components/server-side-data-tile';
import { Header } from './components/header';
import { ButtonGroup } from './components/button-group';

export default function Home() {
  return (
    <>
      <Header />
      {/* Main Content */}
      <main
        style={{
          marginTop: '100px', // Account for fixed header height
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <ButtonGroup />
        {/* <ServerSideDataTile />
        <TestSuspenseQuery /> */}
      </main>
    </>
  );
}
