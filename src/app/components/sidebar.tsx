'use client';
import {
  ArrowLeftIcon,
  GearIcon,
  MarkerIcon,
  PlusBadgeIcon,
  ReceiptIcon,
  CardIcon,
  useTheme,
  LoyaltyCardIcon,
  DealsCategoryFilledIcon,
  NotificationIcon,
  DashboardIcon,
  TeamIcon,
  DollarIcon,
  OrderIcon,
  TimeIcon,
} from '@instacart/ids-core';
import { DividerBase } from '@instacart/ids-customers';
import { MenuItem, MenuItemProps } from './menu-item';

function useStyles() {
  const theme = useTheme();
  return {
    sidebar: {
      width: '100%',
      paddingTop: '8px',
      paddingRight: '16px',
      borderRight: `1px solid ${theme.colors.systemGrayscale20}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    menuItems: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '16px',
      gap: '5px',
    },
    divider: {
      marginTop: '6px',
      marginBottom: '6px',
    },
  } as const;
}

const personalMenuItems: MenuItemProps[] = [
  {
    Icon: ReceiptIcon,
    label: 'Order history',
  },
  {
    Icon: GearIcon,
    label: 'Account settings',
  },
  {
    Icon: PlusBadgeIcon,
    label: 'Instacart+',
  },
  {
    Icon: MarkerIcon,
    label: 'Addresses',
  },
  {
    Icon: CardIcon,
    label: 'Payment methods',
  },
  {
    Icon: DealsCategoryFilledIcon,
    label: 'Credits, promos, and gift cards',
  },
  {
    Icon: NotificationIcon,
    label: 'Notification settings',
  },
  {
    Icon: LoyaltyCardIcon,
    label: 'Loyalty cards',
  },
];

const businessMenuItems: MenuItemProps[] = [
  {
    Icon: DashboardIcon,
    label: 'Dashboard',
  },
  {
    Icon: TeamIcon,
    label: 'Team members',
  },
  {
    Icon: DollarIcon,
    label: 'Tax exemptions',
  },
  {
    Icon: OrderIcon,
    label: 'Order guides',
  },
  {
    Icon: ReceiptIcon,
    label: 'Invoicing',
    isNew: true,
    isSelected: true,
  },
  {
    Icon: TimeIcon,
    label: 'Order approvals',
  },
  {
    Icon: GearIcon,
    label: 'Business settings',
  },
];

export function Sidebar() {
  const styles = useStyles();

  return (
    <nav css={styles.sidebar}>
      <div css={styles.menuItems}>
        <MenuItem Icon={ArrowLeftIcon} label="Back" />
        <DividerBase styles={{ divider: styles.divider }} />
      </div>
      <div css={styles.menuItems}>
        {personalMenuItems.map(item => (
          <MenuItem key={item.label} Icon={item.Icon} label={item.label} isNew={item.isNew} />
        ))}
        <DividerBase styles={{ divider: styles.divider }} />
      </div>
      <div css={styles.menuItems}>
        {businessMenuItems.map(item => (
          <MenuItem
            key={item.label}
            Icon={item.Icon}
            label={item.label}
            isNew={item.isNew}
            isSelected={item.isSelected}
          />
        ))}
        <DividerBase styles={{ divider: styles.divider }} />
      </div>
      <div css={styles.menuItems}>
        <MenuItem Icon={ArrowLeftIcon} label="Switch to personal" />
      </div>
    </nav>
  );
}
