'use client';
import { ArrowLeftIcon, MenuIcon, MarkerIcon, useTheme } from '@instacart/ids-core';
import { DividerBase } from '@instacart/ids-customers';
import { MenuItem, MenuItemProps } from './menu-item';

function useStyles() {
  const theme = useTheme();
  return {
    sidebar: {
      width: '100%',
      padding: '16px',
      borderRight: `1px solid ${theme.colors.systemGrayscale20}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
  } as const;
}

const personalMenuItems: MenuItemProps[] = [
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for order history
    label: 'Order history',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for account settings
    label: 'Account settings',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for Instacart+
    label: 'Instacart+',
  },
  {
    Icon: MarkerIcon,
    label: 'Addresses',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for payment methods
    label: 'Payment methods',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for credits/promos
    label: 'Credits, promos, and gift cards',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for notification settings
    label: 'Notification settings',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for loyalty cards
    label: 'Loyalty cards',
  },
];

const businessMenuItems: MenuItemProps[] = [
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for dashboard
    label: 'Dashboard',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for team members
    label: 'Team members',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for tax exemptions
    label: 'Tax exemptions',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for order guides
    label: 'Order guides',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for invoicing
    label: 'Invoicing',
    isNew: true,
    isSelected: true,
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for order approvals
    label: 'Order approvals',
  },
  {
    Icon: MenuIcon, // Using MenuIcon as placeholder for business settings
    label: 'Business settings',
  },
  {
    Icon: ArrowLeftIcon, // Using ArrowLeftIcon as placeholder for switch to personal
    label: 'Switch to personal',
  },
];

export function Sidebar() {
  const styles = useStyles();

  return (
    <nav css={styles.sidebar}>
      <>
        <MenuItem Icon={ArrowLeftIcon} label="Back" />
        <DividerBase />
      </>
      <>
        {personalMenuItems.map(item => (
          <MenuItem key={item.label} Icon={item.Icon} label={item.label} isNew={item.isNew} />
        ))}
        <DividerBase />
      </>
      {businessMenuItems.map(item => (
        <MenuItem
          key={item.label}
          Icon={item.Icon}
          label={item.label}
          isNew={item.isNew}
          isSelected={item.isSelected}
        />
      ))}
    </nav>
  );
}
