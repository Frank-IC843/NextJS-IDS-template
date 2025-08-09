'use client';

import React from 'react';
import { Text } from '@instacart/ids-customers';
import { ChatMessage } from '@/app/components/chat-message';
import type { Message } from '@/app/components/use-chat';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const useStyles = () => {
  return {
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: 0,
      maxHeight: '100%',
    },
    emptyState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#666',
      fontSize: '1.1rem',
    },
  } as const;
};

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const styles = useStyles();

  return (
    <div css={styles.messagesContainer}>
      {messages.length === 0 ? (
        <div css={styles.emptyState}>
          <Text typography="bodyLarge1" color="systemGrayscale60">
            Ask me about your order patterns, spending trends, or cost optimization opportunities! Try: &ldquo;Show me
            my spending by category&rdquo; or &ldquo;Create a monthly trend chart&rdquo;
          </Text>
        </div>
      ) : (
        messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isLoading={isLoading}
            isLastMessage={index === messages.length - 1}
          />
        ))
      )}
    </div>
  );
}