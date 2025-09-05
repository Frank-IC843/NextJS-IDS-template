'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MermaidChart } from '@/app/components/visualization/mermaid-chart';
import { PrimaryButton } from '@/app/components/ui/buttons';
import { usePdfExport } from '@/app/hooks/use-pdf-export';
import { useChatContext } from '@/app/components/chat/chat-context';
import { useCreateOrderGuide } from '@/app/components/chat/order-guide-button-handler';

interface MessagePart {
  type: 'text' | 'chart' | 'button' | 'orderGuideButtons';
  content: string;
  key: string;
}

interface OrderGuideSuggestion {
  name: string;
  retailerId: string;
  description: string;
  productIds: string[];
}

interface MessageContentProps {
  content: string;
}

interface MessageTextPartProps {
  content: string;
}

interface MessageChartPartProps {
  content: string;
}

interface MessageButtonPartProps {
  content: string;
}

const useStyles = () => {
  return {
    markdownList: {
      margin: '0',
      paddingLeft: '20px',
      lineHeight: '1.2',
    },
    markdownListItem: {
      margin: '0',
      padding: '0',
      lineHeight: '1.2',
    },
    markdownParagraph: {
      margin: '0',
    },
    markdownHeading: {
      margin: '10px 0',
    },
    markdownHeadingH2: {
      margin: '12px 0',
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.25,
    },
    markdownHeadingH3: {
      margin: '10px 0',
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    buttonContainer: {
      margin: '16px 0',
      display: 'flex',
      justifyContent: 'flex-start',
    },
    reportButton: {
      width: '300px',
      marginTop: '16px',
    },
  } as const;
};

// Component for rendering text parts of messages
const MessageTextPart: React.FC<MessageTextPartProps> = ({ content }) => {
  const styles = useStyles();

  return (
    <ReactMarkdown
      components={{
        ol: ({ children }) => <ol css={styles.markdownList}>{children}</ol>,
        ul: ({ children }) => <ul css={styles.markdownList}>{children}</ul>,
        li: ({ children }) => <li css={styles.markdownListItem}>{children}</li>,
        p: ({ children }) => <p css={styles.markdownParagraph}>{children}</p>,
        h2: ({ children }) => <h2 css={styles.markdownHeadingH2}>{children}</h2>,
        h3: ({ children }) => <h3 css={styles.markdownHeadingH3}>{children}</h3>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Component for rendering chart parts of messages
const MessageChartPart: React.FC<MessageChartPartProps> = ({ content }) => {
  return <MermaidChart chart={content} />;
};

// Component for rendering button parts of messages
const MessageButtonPart: React.FC<MessageButtonPartProps> = ({ content }) => {
  const styles = useStyles();
  const { messages } = useChatContext();
  const { exportToPdf, isExporting } = usePdfExport({
    onSuccess: () => {
      // Report PDF generated successfully
    },
    onError: error => {
      // Handle PDF generation error - could show a toast notification here
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to generate report PDF:', error);
      }
    },
  });

  const handleGenerateReport = () => {
    if (!messages || messages.length === 0) {
      // No messages available for report generation
      return;
    }

    // Convert messages to markdown format for PDF export with proper Mermaid handling
    let reportContent = '';

    messages.forEach((message, index) => {
      const role = message.role === 'user' ? '## User Query' : '';
      // Clean the content by removing the report button marker
      const cleanContent = message.content.replace(/\[REPORT_BUTTON_MARKER\]/g, '').trim();

      if (role) {
        reportContent += `${role}\n\n${cleanContent}\n\n`;
      } else {
        reportContent += `${cleanContent}\n\n`;
      }

      if (index < messages.length - 1) {
        reportContent += '---\n\n';
      }
    });

    const title = 'Business Intelligence Report';
    const filename = `business_report_${new Date().toISOString().split('T')[0]}.pdf`;

    exportToPdf({
      content: reportContent,
      title,
      filename,
    });
  };

  if (content === 'REPORT_BUTTON_MARKER') {
    return (
      <div css={styles.buttonContainer}>
        <PrimaryButton
          onClick={handleGenerateReport}
          disabled={isExporting || !messages || messages.length === 0}
          css={styles.reportButton}
        >
          {isExporting ? 'Generating Report...' : 'Generate Report'}
        </PrimaryButton>
      </div>
    );
  }

  return null;
};

// Component for rendering order guide creation buttons
const MessageOrderGuideButtons: React.FC<{ content: string }> = ({ content }) => {
  const { createOrderGuide } = useCreateOrderGuide();
  const [buttonStates, setButtonStates] = React.useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});

  let suggestions: OrderGuideSuggestion[] = [];
  try {
    const parsed = JSON.parse(content);
    suggestions = parsed.suggestions || [];
  } catch (e) {
    console.error('Failed to parse order guide suggestions:', e);
    return null;
  }

  const handleCreateGuide = async (suggestion: OrderGuideSuggestion, index: number) => {
    const buttonKey = `guide-${index}`;
    setButtonStates(prev => ({ ...prev, [buttonKey]: 'loading' }));

    try {
      await createOrderGuide({
        name: suggestion.name,
        retailerId: suggestion.retailerId,
        description: suggestion.description,
        productIds: suggestion.productIds,
      });
      setButtonStates(prev => ({ ...prev, [buttonKey]: 'success' }));
    } catch (error) {
      console.error('Failed to create order guide:', error);
      setButtonStates(prev => ({ ...prev, [buttonKey]: 'error' }));
      setTimeout(() => {
        setButtonStates(prev => ({ ...prev, [buttonKey]: 'idle' }));
      }, 3000);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
      {suggestions.map((suggestion, index) => {
        const buttonKey = `guide-${index}`;
        const state = buttonStates[buttonKey] || 'idle';

        return (
          <PrimaryButton
            key={buttonKey}
            onClick={() => handleCreateGuide(suggestion, index)}
            disabled={state === 'loading' || state === 'success'}
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: state === 'success' ? '#4CAF50' : state === 'error' ? '#f44336' : undefined,
            }}
          >
            {state === 'loading'
              ? '⏳ Creating...'
              : state === 'success'
                ? `✅ ${suggestion.name} Created!`
                : state === 'error'
                  ? '❌ Failed - Try Again'
                  : `✨ Create "${suggestion.name}"`}
          </PrimaryButton>
        );
      })}
    </div>
  );
};

// Utility function to parse message content into structured parts
const parseMessageContent = (content: string): MessagePart[] => {
  const parts: MessagePart[] = [];

  // First, check for and extract report button marker
  const reportButtonRegex = /\[REPORT_BUTTON_MARKER\]/g;
  let contentWithoutButton = content;
  let hasReportButton = false;

  if (reportButtonRegex.test(content)) {
    hasReportButton = true;
    contentWithoutButton = content.replace(reportButtonRegex, '').trim();
  }

  // Check for and extract order guide suggestions marker
  const orderGuideRegex = /\[ORDER_GUIDE_SUGGESTIONS_MARKER\]([\s\S]*?)\[\/ORDER_GUIDE_SUGGESTIONS_MARKER\]/g;
  let orderGuideSuggestions = '';
  let hasOrderGuides = false;

  const orderGuideMatch = orderGuideRegex.exec(contentWithoutButton);
  if (orderGuideMatch) {
    hasOrderGuides = true;
    orderGuideSuggestions = orderGuideMatch[1].trim();
    contentWithoutButton = contentWithoutButton.replace(orderGuideRegex, '').trim();
  }

  // Updated regex to be more flexible with whitespace and handle charts in lists
  const mermaidRegex = /```mermaid\s*\n([\s\S]*?)\n\s*```/g;

  let lastIndex = 0;
  let match;
  let partIndex = 0;

  // Reset regex lastIndex to ensure fresh start
  mermaidRegex.lastIndex = 0;

  while ((match = mermaidRegex.exec(contentWithoutButton)) !== null) {
    // Add text before the chart
    if (match.index > lastIndex) {
      const textContent = contentWithoutButton.slice(lastIndex, match.index);
      if (textContent.trim()) {
        parts.push({
          type: 'text',
          content: textContent,
          key: `text-${partIndex++}`,
        });
      }
    }

    // Add the chart
    parts.push({
      type: 'chart',
      content: match[1].trim(),
      key: `chart-${partIndex++}`,
    });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last chart
  if (lastIndex < contentWithoutButton.length) {
    const textContent = contentWithoutButton.slice(lastIndex);
    if (textContent.trim()) {
      parts.push({
        type: 'text',
        content: textContent,
        key: `text-${partIndex++}`,
      });
    }
  }

  // If no charts found, return all as text
  if (parts.length === 0 && contentWithoutButton.trim()) {
    parts.push({
      type: 'text',
      content: contentWithoutButton,
      key: 'text-0',
    });
  }

  // Add order guide buttons if detected
  if (hasOrderGuides && orderGuideSuggestions) {
    parts.push({
      type: 'orderGuideButtons',
      content: orderGuideSuggestions,
      key: `order-guides-${partIndex++}`,
    });
  }

  // Add report button at the end if detected
  if (hasReportButton) {
    parts.push({
      type: 'button',
      content: 'REPORT_BUTTON_MARKER',
      key: `button-${partIndex}`,
    });
  }

  return parts;
};

// Main component for rendering message content with mixed text and charts
export const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const parts = parseMessageContent(content);

  return (
    <>
      {parts.map(part => (
        <div key={part.key}>
          {part.type === 'text' ? (
            <MessageTextPart content={part.content} />
          ) : part.type === 'chart' ? (
            <MessageChartPart content={part.content} />
          ) : part.type === 'button' ? (
            <MessageButtonPart content={part.content} />
          ) : part.type === 'orderGuideButtons' ? (
            <MessageOrderGuideButtons content={part.content} />
          ) : null}
        </div>
      ))}
    </>
  );
};
