import { ChatInterface } from './components/chat-interface';
import { LoginButton } from './components/login-button';

export default function Home() {
  return (
    <div>
      <LoginButton />
      <ChatInterface />
    </div>
  );
}
