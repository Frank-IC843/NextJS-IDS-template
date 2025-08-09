'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MermaidChart } from '@/app/components/mermaid-chart';
import { PrimaryButton } from '@/app/components/buttons';
import { usePdfExport } from './use-pdf-export';
import { useChatContext } from './chat-context';

interface MessagePart {
  type: 'text' | 'chart' | 'button';
  content: string;
  key: string;
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

// Component for rendering text parts of messages
const MessageTextPart: React.FC<MessageTextPartProps> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        ol: ({ children }) => <ol style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.2' }}>{children}</ol>,
        li: ({ children }) => <li style={{ margin: '0', padding: '0', lineHeight: '1.2' }}>{children}</li>,
        p: ({ children }) => <p style={{ margin: '0' }}>{children}</p>,
        h2: ({ children }) => <h2 style={{ margin: '10px 0' }}>{children}</h2>,
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
  const { messages } = useChatContext();
  const { exportToPdf, isExporting } = usePdfExport({
    onSuccess: () => {
      console.log('Report PDF generated successfully');
    },
    onError: error => {
      console.error('Failed to generate report PDF:', error);
    },
  });

  const handleGenerateReport = () => {
    if (!messages || messages.length === 0) {
      console.error('No messages available for report generation');
      return;
    }

    // Convert messages to markdown format for PDF export with proper Mermaid handling
    // Remove the report button marker from all messages before generating PDF
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
      <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'flex-start' }}>
        <PrimaryButton
          onClick={handleGenerateReport}
          disabled={isExporting || !messages || messages.length === 0}
          css={{ width: '300px', marginTop: '16px' }}
        >
          {isExporting ? 'Generating Report...' : 'Generate Report'}
        </PrimaryButton>
      </div>
    );
  }

  return null;
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

  // Add report button at the end if detected
  if (hasReportButton) {
    parts.push({
      type: 'button',
      content: 'REPORT_BUTTON_MARKER',
      key: `button-${partIndex++}`,
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
          ) : null}
        </div>
      ))}
    </>
  );
};
