import {
  ArrowLeftIcon,
  GearIcon,
  MarkerIcon,
  PlusBadgeIcon,
  ReceiptIcon,
  CardIcon,
  LoyaltyCardIcon,
  DealsCategoryFilledIcon,
  NotificationIcon,
  DashboardIcon,
  TeamIcon,
  DollarIcon,
  OrderIcon,
  TimeIcon,
} from '@instacart/ids-core';

export type SidebarMenuConfigItem = {
  Icon: typeof ArrowLeftIcon;
  label: string;
  isNew?: boolean;
};

export const menuItemRoutes: Record<string, string> = {
  Assistant: '/assistant',
  Dashboard: '/dashboard',
  Insights: '/insights',
  'Order history': '/order-history',
  'Account settings': '/account-settings',
  'Instacart+': '/instacart-plus',
  Addresses: '/addresses',
  'Payment methods': '/payment-methods',
  'Credits, promos, and gift cards': '/credits-promos-gift-cards',
  'Notification settings': '/notification-settings',
  'Loyalty cards': '/loyalty-cards',
  'Team members': '/team-members',
  'Tax exemptions': '/tax-exemptions',
  'Order guides': '/order-guides',
  Invoicing: '/invoicing',
  'Order approvals': '/order-approvals',
  'Business settings': '/settings',
  Back: '/',
};

export const personalMenuItems: SidebarMenuConfigItem[] = [
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

export const businessMenuItems: SidebarMenuConfigItem[] = [
  {
    Icon: DealsCategoryFilledIcon,
    label: 'Assistant',
    isNew: true,
  },
  {
    Icon: DashboardIcon,
    label: 'Dashboard',
  },
  {
    Icon: DashboardIcon,
    label: 'Insights',
    isNew: true,
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

export const backMenuItem: SidebarMenuConfigItem = {
  Icon: ArrowLeftIcon,
  label: 'Back',
};

export const switchToPersonalMenuItem: SidebarMenuConfigItem = {
  Icon: ArrowLeftIcon,
  label: 'Switch to personal',
};
