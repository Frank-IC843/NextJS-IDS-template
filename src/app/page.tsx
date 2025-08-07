import { PrimaryButtonSmall } from '@/app/components/buttons';
import { ChatInterface } from './components/chat-interface';

export default function Home() {
  return (
    <div>
      <PrimaryButtonSmall>Log In</PrimaryButtonSmall>
      <ChatInterface />
    </div>
  );
}
