import { ChatInterface } from './components/chat-interface';

export default function Home() {
  return (
    <div>
      {Array.from({ length: 100 }).map((_, index) => (
        <div key={index}>{index}</div>
      ))}
    </div>
  );
}
