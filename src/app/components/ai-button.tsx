'use client';

import {
  Text,
  Tooltip,
  ModalBase,
  useModalState,
  useModalDisclosure,
  ModalHeader,
  ModalTitle,
} from '@instacart/ids-customers';
import { responsive } from '@instacart/ids-core';
import { ChatInterface } from '@/app/components/chat-interface';
import { useEffect, useState } from 'react';

const useStyles = () => {
  return {
    aiButton: {
      width: '64px',
      height: '64px',
      borderRadius: '20px', // Rounded rectangle instead of circle
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // AI gradient
      border: '2px solid rgba(255, 255, 255, 0.2)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        transform: 'translateY(-2px) scale(1.05)',
        boxShadow: '0 16px 48px rgba(102, 126, 234, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      },
      '&:active': {
        transform: 'translateY(0) scale(0.98)',
      },
    },
    aiIcon: {
      width: '28px',
      height: '28px',
      fill: 'white',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
    },
    aiButtonContainer: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
    },
    aiTooltipContainer: {
      minWidth: '275px',
      maxWidth: '350px',
      whiteSpace: 'normal' as const,
      padding: '12px 16px',
      fontSize: '14px',
      borderRadius: '8px',
    },
  } as const;
};

export function AIButton() {
  const styles = useStyles();
  const modal = useModalState({
    visible: false,
  });
  const disclosure = useModalDisclosure(modal);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div css={styles.aiButtonContainer}>
        <Tooltip
          title="💡 Ask AI about your spending insights, or ask about any other question you have about your business."
          placement="left"
          styles={{ container: styles.aiTooltipContainer }}
        >
          <button css={styles.aiButton} {...disclosure}>
            <svg css={styles.aiIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1L14.5 8.5L22 11L14.5 13.5L12 21L9.5 13.5L2 11L9.5 8.5L12 1Z" opacity="0.9" />
              <path d="M19 4L20.2 7.8L24 9L20.2 10.2L19 14L17.8 10.2L14 9L17.8 7.8L19 4Z" opacity="0.7" />
              <path d="M5 16L6.2 19.8L10 21L6.2 22.2L5 26L3.8 22.2L0 21L3.8 19.8L5 16Z" opacity="0.6" />
            </svg>
          </button>
        </Tooltip>
      </div>
      <ModalBase
        modal={modal}
        aria-label="AI Chat Assistant"
        styles={{
          modal: {
            [responsive.up('r')]: {
              width: '1000px',
            },
            position: 'relative',
          },
        }}
      >
        <ModalHeader hide={modal.hide} accessibleLabels={{ close: 'Close chat' }}>
          <ModalTitle>
            <Text typography="headline">Instacart Business Analytics</Text>
          </ModalTitle>
        </ModalHeader>
        {modal.visible && <ChatInterface />}
      </ModalBase>
    </>
  );
}
