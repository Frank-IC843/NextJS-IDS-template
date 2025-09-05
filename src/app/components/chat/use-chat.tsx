'use client';

import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useBusinessInfo } from '@/app/settings/business-info-settings';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatOptions {
  onError?: (error: string) => void;
}

// Limit message history to prevent memory bloat
const MAX_MESSAGE_HISTORY = 20; // Keep only last 20 messages

export function useChat({ onError }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const businessInfo = useBusinessInfo();

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (readerRef.current) {
        try {
          readerRef.current.releaseLock();
        } catch (error) {
          console.warn('Reader cleanup warning:', error);
        }
      }
    };
  }, []);

  const clearMessages = () => {
    setMessages([]);
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const userMessage: Message = { role: 'user', content: messageContent.trim() };

    // Apply message limit to prevent memory bloat
    setMessages(prev => {
      const updated = [...prev, userMessage];
      // Keep only the last MAX_MESSAGE_HISTORY messages
      if (updated.length > MAX_MESSAGE_HISTORY) {
        return updated.slice(-MAX_MESSAGE_HISTORY);
      }
      return updated;
    });
    setIsLoading(true);

    // Use a local variable to accumulate content - this avoids stale closures
    let assistantContent = '';

    try {
      // Add assistant message placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // Only send recent messages to API to reduce token usage
      const messagesToSend = [...messages, userMessage].slice(-10); // Last 10 messages max

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend,
          stream: true,
          businessInfo,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      readerRef.current = reader;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              // Clean up reader before returning
              try {
                reader.releaseLock();
                readerRef.current = null;
              } catch (error) {
                console.warn('Reader release warning:', error);
              }
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                flushSync(() => {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                      newMessages[newMessages.length - 1] = {
                        role: 'assistant',
                        content: assistantContent,
                      };
                    }
                    return newMessages;
                  });
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const errorMessage = 'Sorry, I encountered an error. Please try again.';

      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === 'assistant') {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: errorMessage,
          };
        }
        return newMessages;
      });

      onError?.(errorMessage);
    } finally {
      // Clean up references
      if (readerRef.current) {
        try {
          readerRef.current.releaseLock();
        } catch (error) {
          console.warn('Reader cleanup warning:', error);
        }
        readerRef.current = null;
      }
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageContent = input.trim();
    setInput('');
    await sendMessage(messageContent);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleSubmit,
    clearMessages,
    stopGeneration,
  };
}
