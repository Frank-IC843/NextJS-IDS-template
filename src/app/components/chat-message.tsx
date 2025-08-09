'use client';

import React from 'react';
import { MessageContent } from '@/app/components/message-content';
import type { Message } from '@/app/components/use-chat';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  isLastMessage?: boolean;
}

const useStyles = () => {
  return {
    message: {
      display: 'flex',
      maxWidth: '85%',
      flexShrink: 0,
      width: 'fit-content',
      marginBottom: '4px',
    },
    userMessage: {
      alignSelf: 'flex-end',
      flexDirection: 'row-reverse',
    },
    assistantMessage: {
      alignSelf: 'flex-start',
    },
    messageContent: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    },
    userMessageContent: {
      flexDirection: 'row-reverse',
    },
    messageRole: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      flexShrink: 0,
      marginTop: '2px',
    },
    userAvatar: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    assistantAvatar: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    messageText: {
      padding: '14px 18px',
      borderRadius: '20px',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      maxWidth: '100%',
      overflowWrap: 'break-word',
      minWidth: 0,
      width: 'fit-content',
      lineHeight: '1.5',
      fontSize: '15px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    userMessageText: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderBottomRightRadius: '6px',
    },
    assistantMessageText: {
      background: '#ffffff',
      color: '#374151',
      border: '1px solid #e5e7eb',
      borderBottomLeftRadius: '6px',
    },
  } as const;
};

export function ChatMessage({ message, isLoading = false, isLastMessage = false }: ChatMessageProps) {
  const styles = useStyles();
  const isUser = message.role === 'user';
  const showLoading = message.role === 'assistant' && isLoading && isLastMessage && !message.content;

  return (
    <div css={[styles.message, isUser ? styles.userMessage : styles.assistantMessage]}>
      <div css={[styles.messageContent, isUser ? styles.userMessageContent : {}]}>
        <div css={[styles.messageRole, isUser ? styles.userAvatar : styles.assistantAvatar]}>
          {isUser ? '👤' : '🤖'}
        </div>
        <div>
          <div css={[styles.messageText, isUser ? styles.userMessageText : styles.assistantMessageText]}>
            {showLoading ? <ChatMessageLoading /> : <MessageContent content={message.content} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for assistant messages
function ChatMessageLoading() {
  const styles = {
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#666',
      fontSize: '14px',
    },
    thinkingText: {
      fontStyle: 'italic',
    },
    loadingDots: {
      display: 'flex',
      gap: '1px',
    },
    dot: {
      animation: 'dotPulse 1.4s infinite ease-in-out',
      fontSize: '16px',
      '@keyframes dotPulse': {
        '0%, 80%, 100%': {
          opacity: 0.3,
        },
        '40%': {
          opacity: 1,
        },
      },
    },
    dot1: {
      animationDelay: '0s',
    },
    dot2: {
      animationDelay: '0.2s',
    },
    dot3: {
      animationDelay: '0.4s',
    },
  } as const;

  return (
    <div css={styles.loadingContainer}>
      <span css={styles.thinkingText}>thinking</span>
      <div css={styles.loadingDots}>
        <span css={[styles.dot, styles.dot1]}>.</span>
        <span css={[styles.dot, styles.dot2]}>.</span>
        <span css={[styles.dot, styles.dot3]}>.</span>
      </div>
    </div>
  );
}
