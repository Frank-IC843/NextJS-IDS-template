'use client';

import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { keyframes } from '@emotion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PrimaryButton } from '@/app/components/buttons';
import { MessageContent } from '@/app/components/message-content';
import { Text } from '@instacart/ids-customers';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const dotPulse = keyframes`
  0%, 80%, 100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
`;

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
      maxWidth: 'fit-content',
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
      animation: `${dotPulse} 1.4s infinite ease-in-out`,
      fontSize: '16px',
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
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const styles = useStyles();

  // PDF Export function
  const handleExportPDF = async () => {
    if (!chatContainerRef.current) return;

    try {
      const canvas = await html2canvas(chatContainerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
        foreignObjectRendering: false,
        ignoreElements: element => {
          // Ignore elements that might cause issues
          return element.classList?.contains('no-export') || false;
        },
        onclone: clonedDoc => {
          // Fix CSS issues that html2canvas can't handle
          const styleElement = clonedDoc.createElement('style');
          styleElement.textContent = `
            * {
              color: #000000 !important;
              background-color: transparent !important;
            }
            .chat-container {
              background-color: #ffffff !important;
            }
            /* Override any CSS custom properties that cause issues */
            :root {
              --color-text: #000000;
              --color-background: #ffffff;
            }
            /* Fix any color() functions */
            [style*="color("] {
              color: #000000 !important;
            }
          `;
          clonedDoc.head.appendChild(styleElement);
          const clonedElement = clonedDoc.querySelector('[ref="chatContainerRef"]') || clonedDoc.body;
          if (clonedElement && clonedElement instanceof HTMLElement) {
            clonedElement.style.color = '#000000';
            clonedElement.style.backgroundColor = '#ffffff';
          }
        },
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions to fit the page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30; // Add some top margin

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        Math.min(imgHeight * ratio, pdfHeight - 40) // Ensure it fits with margins
      );

      // Add metadata
      pdf.setProperties({
        title: 'Instacart Business Chat Report',
        subject: 'AI-Generated Business Analysis',
        author: 'Instacart Business Intelligence',
        keywords: 'report, analysis, business, instacart',
      });

      // Save the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      console.log('PDF generated successfully, downloading...');
      pdf.save(`instacart-report-${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Use a local variable to accumulate content - this avoids stale closures
    let assistantContent = '';

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
      // Handle abort errors gracefully (user cancelled or component unmounted)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }

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

  return (
    <div css={styles.chatContainer}>
      <div css={styles.messagesContainer} ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div css={styles.emptyState}>
            <Text typography="bodyLarge1" color="systemGrayscale60">
              Ask me about your order patterns, spending trends, or cost optimization opportunities! Try: &ldquo;Show me
              my spending by category&rdquo; or &ldquo;Create a monthly trend chart&rdquo;
            </Text>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              css={[styles.message, message.role === 'user' ? styles.userMessage : styles.assistantMessage]}
            >
              <div css={[styles.messageContent, message.role === 'user' ? styles.userMessageContent : {}]}>
                <div css={styles.messageRole}>{message.role === 'user' ? '👤' : '🤖'}</div>
                <div>
                  {/* Render message content with inline charts */}
                  <div
                    css={[
                      styles.messageText,
                      message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                    ]}
                  >
                    {message.role === 'assistant' && isLoading && index === messages.length - 1 && !message.content ? (
                      <div css={styles.loadingContainer}>
                        <span css={styles.thinkingText}>thinking</span>
                        <div css={styles.loadingDots}>
                          <span css={[styles.dot, styles.dot1]}>.</span>
                          <span css={[styles.dot, styles.dot2]}>.</span>
                          <span css={[styles.dot, styles.dot3]}>.</span>
                        </div>
                      </div>
                    ) : (
                      <MessageContent content={message.content} onExportPDF={handleExportPDF} />
                    )}
                  </div>
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
