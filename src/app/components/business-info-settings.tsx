'use client';

import React, { useState, useEffect } from 'react';
import {
  Text,
  PrimaryButton,
  SecondaryButton,
  ModalBase,
  useModalState,
  ModalHeader,
  ModalTitle,
  TextAreaFixed,
} from '@instacart/ids-customers';

const useStyles = () => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '24px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      maxWidth: '100%',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '20px',
    },
    headerContent: {
      flex: 1,
    },
    description: {
      color: '#666',
      lineHeight: '1.5',
    },
    currentInfo: {
      padding: '16px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap',
      maxHeight: '150px',
      overflow: 'auto',
    },
    emptyState: {
      padding: '24px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      border: '2px dashed #ddd',
      borderRadius: '8px',
    },
    modalContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px',
    },
    buttonContainer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px',
    },
    modalStyles: {
      modal: {
        width: '600px',
        maxWidth: '90vw',
      },
    },
    addInfoButton: {
      maxWidth: 'fit-content',
    },
    modalButton: {
      maxWidth: 'fit-content',
    },
    example: {
      fontSize: '12px',
      color: '#666',
      fontStyle: 'italic',
      marginTop: '8px',
    },
  } as const;
};

// Storage key for business information
const BUSINESS_INFO_KEY = 'instacart_business_info';

interface BusinessInfoSettingsProps {
  onBusinessInfoChange?: (info: string) => void;
}

export function BusinessInfoSettings({ onBusinessInfoChange }: BusinessInfoSettingsProps) {
  const styles = useStyles();
  const [businessInfo, setBusinessInfo] = useState('');
  const [tempInfo, setTempInfo] = useState('');
  const modal = useModalState({ visible: false });

  // Load business info from localStorage on mount
  useEffect(() => {
    const savedInfo = localStorage.getItem(BUSINESS_INFO_KEY) || '';
    setBusinessInfo(savedInfo);
    setTempInfo(savedInfo);
  }, []);

  // Notify parent component of changes
  useEffect(() => {
    onBusinessInfoChange?.(businessInfo);
  }, [businessInfo, onBusinessInfoChange]);

  const handleOpenModal = () => {
    setTempInfo(businessInfo);
    modal.show();
  };

  const handleSave = () => {
    setBusinessInfo(tempInfo);
    localStorage.setItem(BUSINESS_INFO_KEY, tempInfo);
    modal.hide();
  };

  const handleCancel = () => {
    setTempInfo(businessInfo);
    modal.hide();
  };

  const hasBusinessInfo = businessInfo.trim().length > 0;

  return (
    <>
      <div css={styles.container}>
        <div css={styles.header}>
          <div css={styles.headerContent}>
            <Text typography="title">Business Information</Text>
            <Text typography="bodyLarge2" css={styles.description}>
              Provide context about your business to get more relevant AI insights and recommendations.
            </Text>
          </div>
          <PrimaryButton onClick={handleOpenModal} css={styles.addInfoButton}>
            {hasBusinessInfo ? 'Edit' : 'Add Info'}
          </PrimaryButton>
        </div>

        {hasBusinessInfo ? (
          <div>
            <Text typography="bodyLarge2" color="systemGrayscale70">
              Current business information:
            </Text>
            <div css={styles.currentInfo}>{businessInfo}</div>
          </div>
        ) : (
          <div css={styles.emptyState}>
            <Text typography="bodyEmphasized" color="systemGrayscale60">
              No business information added yet.
            </Text>
            <Text typography="bodyRegular" color="systemGrayscale50">
              Click &ldquo;Add Info&rdquo; to provide context that will help the AI give you more relevant insights.
            </Text>
          </div>
        )}
      </div>

      <ModalBase modal={modal} aria-label="Business Information" styles={styles.modalStyles}>
        <ModalHeader hide={modal.hide} accessibleLabels={{ close: 'Close business information' }}>
          <ModalTitle>
            <Text typography="headline">Business Information</Text>
          </ModalTitle>
        </ModalHeader>
        <div css={styles.modalContent}>
          <div>
            <Text typography="bodyLarge2">Tell the AI about your business to get more personalized insights:</Text>
            <Text typography="bodyRegular" css={styles.example}>
              Example: &ldquo;We&rsquo;re a mid-size restaurant chain with 15 locations in California. We focus on
              fresh, organic ingredients and have seasonal menu changes. Our peak ordering days are Thursday-Sunday, and
              we&rsquo;re particularly interested in cost optimization for produce and dairy products.&rdquo;
            </Text>
          </div>

          <TextAreaFixed
            value={tempInfo}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTempInfo(e.target.value)}
            placeholder="Describe your business type, size, industry, key priorities, seasonal patterns, or any other context that would help the AI provide better insights..."
          />

          <Text typography="bodyMedium2" color="systemGrayscale60">
            This information will be included in your AI conversations to provide more relevant analysis and
            recommendations.
          </Text>

          <div css={styles.buttonContainer}>
            <SecondaryButton onClick={handleCancel} css={styles.modalButton}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleSave} css={styles.modalButton}>
              Save
            </PrimaryButton>
          </div>
        </div>
      </ModalBase>
    </>
  );
}

// Hook to get business information
export function useBusinessInfo(): string {
  const [businessInfo, setBusinessInfo] = useState('');

  useEffect(() => {
    const savedInfo = localStorage.getItem(BUSINESS_INFO_KEY) || '';
    setBusinessInfo(savedInfo);
  }, []);

  return businessInfo;
}
