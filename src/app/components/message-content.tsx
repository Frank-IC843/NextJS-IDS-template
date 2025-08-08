'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MermaidChart } from '@/app/components/mermaid-chart';

interface MessagePart {
  type: 'text' | 'chart';
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

// Utility function to parse message content into structured parts
const parseMessageContent = (content: string): MessagePart[] => {
  const parts: MessagePart[] = [];
  // Updated regex to be more flexible with whitespace and handle charts in lists
  const mermaidRegex = /```mermaid\s*\n([\s\S]*?)\n\s*```/g;

  let lastIndex = 0;
  let match;
  let partIndex = 0;

  // Reset regex lastIndex to ensure fresh start
  mermaidRegex.lastIndex = 0;

  while ((match = mermaidRegex.exec(content)) !== null) {
    // Add text before the chart
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index);
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
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex);
    if (textContent.trim()) {
      parts.push({
        type: 'text',
        content: textContent,
        key: `text-${partIndex++}`,
      });
    }
  }

  // If no charts found, return all as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: content,
      key: 'text-0',
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
          ) : (
            <MessageChartPart content={part.content} />
          )}
        </div>
      ))}
    </>
  );
};
