'use client';

import { ArrowLeftIcon, useTheme } from '@instacart/ids-core';
import { BadgeNotifier, Text } from '@instacart/ids-customers';

export type MenuItemProps = {
  Icon: typeof ArrowLeftIcon;
  label: string;
  isNew?: boolean;
  isSelected?: boolean;
};

const useStyles = (isSelected?: boolean) => {
  const theme = useTheme();
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
      backgroundColor: isSelected ? theme.colors.systemGrayscale99 : 'transparent',
      ...(!isSelected && {
        '&:hover': {
          backgroundColor: theme.colors.systemGrayscale10,
        },
      }),
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

export function MenuItem({ Icon, label, isNew, isSelected }: MenuItemProps) {
  const styles = useStyles(isSelected);
  return (
    <div css={styles.menuItem}>
      <div css={styles.menuItemContent}>
        <>
          <Icon size="24px" color={isSelected ? 'systemGrayscale00' : 'systemGrayscale80'} />
          <Text typography="bodyLarge1" color={isSelected ? 'systemGrayscale00' : 'systemGrayscale70'}>
            {label}
          </Text>
        </>
        {isNew && <BadgeNotifier value="New" css={{ marginLeft: 'auto' }} />}
      </div>
    </div>
  );
}
