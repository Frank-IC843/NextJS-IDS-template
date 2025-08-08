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
        ol: ({ children }) => (
          <ol
            style={{
              margin: '8px 0',
              paddingLeft: '0',
              listStyleType: 'none',
            }}
          >
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul
            style={{
              margin: '8px 0',
              paddingLeft: '0',
              listStyleType: 'none',
            }}
          >
            {children}
          </ul>
        ),
        li: ({ children, node }) => {
          // Check if this li is inside an ol (ordered list) or ul (unordered list)
          const parent = (node as { parent?: { tagName: string } })?.parent;
          const isOrdered = parent?.tagName === 'ol';

          return (
            <li
              style={{
                margin: '2px 0',
                lineHeight: '1.4',
                paddingLeft: '20px',
                position: 'relative',
                listStyleType: 'none',
              }}
            >
              {isOrdered && (
                <span
                  style={{
                    position: 'absolute',
                    left: '0',
                    fontWeight: 'normal',
                    color: 'inherit',
                  }}
                >
                  •
                </span>
              )}
              {!isOrdered && (
                <span
                  style={{
                    position: 'absolute',
                    left: '8px',
                    fontWeight: 'normal',
                    color: 'inherit',
                  }}
                >
                  •
                </span>
              )}
              {children}
            </li>
          );
        },
        p: ({ children, node }) => {
          // Check if this paragraph is inside a list item
          const parent = (node as { parent?: { type: string } })?.parent;
          if (parent?.type === 'listItem') {
            return <div style={{ margin: '0' }}>{children}</div>;
          }
          return <p style={{ margin: '8px 0' }}>{children}</p>;
        },
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
