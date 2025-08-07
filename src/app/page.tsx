import { ChatInterface } from './components/chat-interface';

export default function Home() {
  return (
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
  );
}
