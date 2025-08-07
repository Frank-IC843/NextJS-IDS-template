'use client';

import { ArrowLeftIcon } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';

export type MenuItemProps = {
  Icon: typeof ArrowLeftIcon;
  label: string;
  isNew?: boolean;
};

const useStyles = () => {
  return {
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      borderRadius: '6px',
    },
    menuItemContent: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      gap: '12px',
      padding: '8px',
      borderRadius: '6px',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: '#F3F4F6',
      },
    },
    newBadge: {
      backgroundColor: '#EF4444',
      color: 'white',
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '2px 6px',
      borderRadius: '12px',
      marginLeft: 'auto',
    },
  } as const;
};

export function MenuItem({ Icon, label, isNew }: MenuItemProps) {
  const styles = useStyles();
  return (
    <div css={styles.menuItem}>
      <div css={styles.menuItemContent}>
        <Icon size="24px" />
        <Text typography="bodyLarge2">{label}</Text>
      </div>
      {isNew && <span css={styles.newBadge}>New</span>}
    </div>
  );
}
