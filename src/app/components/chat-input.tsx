'use client';

import React, { useRef, useEffect } from 'react';
import { PrimaryButton } from '@/app/components/buttons';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const useStyles = () => {
  return {
    inputForm: {
      display: 'flex',
      gap: '12px',
      padding: '20px',
      borderTop: '1px solid #e0e0e0',
      background: '#f8f9fa',
      borderRadius: '0 0 12px 12px',
      flexShrink: 0,
    },
    messageInput: {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #ddd',
      borderRadius: '24px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s',
      minWidth: 0,
    },
    sendButton: {
      width: '100px',
    },
  } as const;
};

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  placeholder = 'Ask about orders, spending, or business insights...',
  autoFocus = true,
}: ChatInputProps) {
  const styles = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <form onSubmit={onSubmit} css={styles.inputForm}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        css={styles.messageInput}
      />
      <PrimaryButton type="submit" disabled={isLoading || !input.trim()} css={styles.sendButton}>
        {isLoading ? '...' : 'Send'}
      </PrimaryButton>
    </form>
  );
}
