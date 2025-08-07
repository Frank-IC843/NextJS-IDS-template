import { Header } from './components/header';
import { ChatInterface } from './components/chat-interface';

export default function Home() {
  return (
    <>
      <Header />
      {/* Main Content */}
      <main
        style={{
          marginTop: '100px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <ChatInterface />
      </main>
    </>
  );
}
