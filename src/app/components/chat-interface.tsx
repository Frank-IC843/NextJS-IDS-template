'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessages } from '@/app/components/chat-messages';
import { ChatInput } from '@/app/components/chat-input';
import { useChat } from '@/app/components/use-chat';
import { ErrorBoundary } from '@/app/components/error-boundary';

const useStyles = () => {
  return {
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      border: '1px solid #e0e0e0',
      background: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
  } as const;
};

export function ChatInterface() {
  const { messages, input, setInput, isLoading, handleSubmit } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const styles = useStyles();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ErrorBoundary>
      <div css={styles.chatContainer}>
        <ChatMessages messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
        <ChatInput input={input} setInput={setInput} onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </ErrorBoundary>
  );
}
