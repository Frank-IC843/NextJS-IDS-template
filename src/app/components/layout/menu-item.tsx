'use client';

import { ArrowLeftIcon, useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';

export type MenuItemProps = {
  Icon: typeof ArrowLeftIcon;
  label: string;
  isSelected?: boolean;
  onClick: () => void;
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
  } as const;
};

export function MenuItem({ Icon, label, isSelected, onClick }: MenuItemProps) {
  const styles = useStyles(isSelected);
  return (
    <div css={styles.menuItem} onClick={onClick}>
      <div css={styles.menuItemContent}>
        <>
          <Icon size="24px" color={isSelected ? 'systemGrayscale00' : 'systemGrayscale80'} />
          <Text typography="bodyLarge1" color={isSelected ? 'systemGrayscale00' : 'systemGrayscale70'}>
            {label}
          </Text>
        </>
      </div>
    </div>
  );
}
