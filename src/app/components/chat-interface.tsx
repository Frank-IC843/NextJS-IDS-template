'use client';

import { useState, useRef, useEffect } from 'react';
import { CSSObject } from '@emotion/react';
import { PrimaryButton, SecondaryButton } from '@instacart/ids-customers';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const useStyles = (): Record<string, CSSObject> => ({
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '80vh',
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    background: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },

  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    background: '#f8f9fa',
    borderRadius: '12px 12px 0 0',
    flexShrink: 0,
  },

  chatTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
  },

  clearButton: {
    padding: '8px 16px',
    maxWidth: 'fit-content',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.2s',
    '&:hover': {
      background: '#d32f2f',
    },
  },

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

  message: {
    display: 'flex',
    maxWidth: '80%',
    flexShrink: 0,
    width: 'fit-content',
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
    fontSize: '1.5rem',
    flexShrink: 0,
  },

  messageText: {
    padding: '12px 16px',
    borderRadius: '18px',
    lineHeight: 1.4,
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    maxWidth: '100%',
    overflowWrap: 'break-word',
    minWidth: 0,
    width: 'fit-content',
  },

  userMessageText: {
    background: '#007bff',
    color: 'white',
    borderBottomRightRadius: '4px',
  },

  assistantMessageText: {
    background: '#f1f3f5',
    color: '#333',
    borderBottomLeftRadius: '4px',
  },

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
});

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const styles = useStyles();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add assistant message placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
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
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);

      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === 'assistant') {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div css={styles.chatContainer}>
      <div css={styles.chatHeader}>
        <h1 css={styles.chatTitle}>Instacart Business Analytics</h1>
        <SecondaryButton onClick={clearChat} css={styles.clearButton}>
          Clear Chat
        </SecondaryButton>
      </div>

      <div css={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div css={styles.emptyState}>
            <p>Ask me about your order patterns, spending trends, or cost optimization opportunities!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              css={[styles.message, message.role === 'user' ? styles.userMessage : styles.assistantMessage]}
            >
              <div css={[styles.messageContent, message.role === 'user' ? styles.userMessageContent : {}]}>
                <div css={styles.messageRole}>{message.role === 'user' ? '👤' : '🤖'}</div>
                <div
                  css={[
                    styles.messageText,
                    message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                  ]}
                >
                  {message.content || (message.role === 'assistant' && isLoading ? '...' : '')}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} css={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about orders, spending, or business insights..."
          disabled={isLoading}
          css={styles.messageInput}
        />
        <PrimaryButton type="submit" disabled={isLoading || !input.trim()} css={styles.sendButton}>
          {isLoading ? '...' : 'Send'}
        </PrimaryButton>
      </form>
    </div>
  );
}
