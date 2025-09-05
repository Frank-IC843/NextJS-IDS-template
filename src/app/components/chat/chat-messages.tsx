'use client';

import React, { useRef, useEffect } from 'react';
import { Text } from '@instacart/ids-customers';
import { ChatMessage } from '@/app/components/chat/chat-message';
import { ChatProvider } from '@/app/components/chat/chat-context';
import type { Message } from '@/app/components/chat/use-chat';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const useStyles = () => {
  return {
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      minHeight: 0,
      maxHeight: '100%',
      // Custom scrollbar styling
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#d1d5db',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#9ca3af',
      },
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      textAlign: 'center',
      padding: '40px 20px',
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.6,
    },
    emptyStateTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '8px',
    },
    emptyStateText: {
      maxWidth: '400px',
      lineHeight: '1.5',
    },
  } as const;
};

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const styles = useStyles();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ChatProvider messages={messages}>
      <div css={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div css={styles.emptyState}>
            <Text typography="bodyLarge1" color="systemGrayscale60">
              Ask me about your order patterns, spending trends, or cost optimization opportunities! Try: &ldquo;Show me
              my spending by category&rdquo; or &ldquo;Create a monthly trend chart&rdquo;
            </Text>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isLoading={isLoading}
                isLastMessage={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </ChatProvider>
  );
}
