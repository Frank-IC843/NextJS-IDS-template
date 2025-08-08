'use client';

import {
  Text,
  ButtonBase,
  Select,
  SelectButton,
  SelectButtonValue,
  SelectOptions,
  SelectOption,
  Tooltip,
  Divider,
  ModalBase,
  useModalState,
  useModalDisclosure,
  ModalHeader,
  ModalTitle,
} from '@instacart/ids-customers';
import { useTheme, InformationIcon, responsive } from '@instacart/ids-core';
import { useState } from 'react';
import { GetAllLinkedUserAccountsQuery } from '@/__generated__/graphql-types';
import { ChatInterface } from '@/app/components/chat-interface';

const useStyles = () => {
  const theme = useTheme();
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    linkButton: {
      // Reset default button styles
      backgroundColor: 'transparent',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      ...theme.typography.linkMedium,
    },
    selectContainer: {
      width: '268px',
    },
    selectStyles: {
      select: {
        width: '100%',
      },
    },
    cardsContainer: {
      display: 'flex',
      gap: '16px',
      marginTop: '8px',
    },
    card: {
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: '8px',
      flex: 1,
      maxWidth: '403px',
      padding: '16px',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      marginBottom: '12px',
    },
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
      textAlign: 'center' as const,
      padding: '12px 16px',
      fontSize: '14px',
      lineHeight: '1.4',
      borderRadius: '8px',
    },
    chatOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    chatModal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '900px',
      height: '85vh',
      maxHeight: '700px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    chatWrapper: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      '& > div': {
        height: '100%',
        border: 'none',
        borderRadius: 0,
        margin: 0,
        maxWidth: 'none',
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        '& > div:first-of-type': {
          paddingRight: '60px', // Make room for close button
        },
      },
    },
  } as const;
};

const monthOptions = [
  'This Month (August)',
  'July (2025)',
  'June (2025)',
  'May (2025)',
  'April (2025)',
  'March (2025)',
  'February (2025)',
  'January (2025)',
  'December (2024)',
  'November (2024)',
  'October (2024)',
  'September (2024)',
];

interface DashboardContentProps {
  data: GetAllLinkedUserAccountsQuery;
}

export function DashboardContent({ data }: DashboardContentProps) {
  const styles = useStyles();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const modal = useModalState({
    visible: false,
  });
  const disclosure = useModalDisclosure(modal);

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <Text typography="headline">Dashboard</Text>
        <ButtonBase css={styles.linkButton}>Export</ButtonBase>
      </div>
      <div css={styles.selectContainer}>
        <Select selectedValue={selectedMonth} styles={styles.selectStyles}>
          <SelectButton>
            <SelectButtonValue>{selectedMonth}</SelectButtonValue>
          </SelectButton>
          <SelectOptions alignment="left">
            {monthOptions.map(month => (
              <SelectOption value={month} key={month} onClick={() => setSelectedMonth(month)}>
                {month}
              </SelectOption>
            ))}
          </SelectOptions>
        </Select>
      </div>
      <div css={styles.cardsContainer}>
        <div css={styles.card}>
          <div css={styles.cardHeader}>
            <Text typography="bodyLarge2" color="systemGrayscale50">
              Orders Completed
            </Text>
          </div>
          <Text typography="titleMedium">0</Text>
        </div>

        <div css={styles.card}>
          <div css={styles.cardHeader}>
            <Text typography="bodyLarge2" color="systemGrayscale50">
              Total Spend
            </Text>
            <Tooltip title="Total amount of money spent during the selected time period by all members across USD and CAD. We'll split this out shortly.">
              <InformationIcon color="systemGrayscale30" />
            </Tooltip>
          </div>
          <Text typography="titleMedium">$0.00</Text>
        </div>
      </div>
      <Divider />
      <div css={styles.aiButtonContainer}>
        <Tooltip
          title="💡 Ask AI about your spending insights"
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
              width: '750px',
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
        <ChatInterface />
      </ModalBase>
    </div>
  );
}
