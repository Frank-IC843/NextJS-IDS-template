'use client';
import {
  useTheme,
} from '@instacart/ids-core';
import { DividerBase } from '@instacart/ids-customers';
import {
  backMenuItem,
  businessMenuItems,
  menuItemRoutes,
  personalMenuItems,
  switchToPersonalMenuItem,
} from '@/app/components/layout/sidebar-config';
import { MenuItem } from '@/app/components/layout/menu-item';
import { useRouter, usePathname } from 'next/navigation';

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

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const styles = useStyles();

  // Calculate selected menu item directly from pathname to avoid hydration mismatch
  const getSelectedMenuItem = () => {
    const currentMenuItem = Object.entries(menuItemRoutes).find(entry => entry[1] === pathname);
    return currentMenuItem && currentMenuItem[0] !== 'Back' ? currentMenuItem[0] : '';
  };

  const selectedMenuItem = getSelectedMenuItem();

  const handleMenuItemClick = (item: string) => {
    if (item === 'Back') {
      router.back();
      return;
    }

    const route = menuItemRoutes[item];
    if (route) {
      router.push(route);
    }
  };

  return (
    <nav css={styles.sidebar}>
      <div css={styles.menuItems}>
        <MenuItem
          Icon={backMenuItem.Icon}
          label={backMenuItem.label}
          onClick={() => handleMenuItemClick(backMenuItem.label)}
          isSelected={selectedMenuItem === backMenuItem.label}
        />
        <DividerBase styles={{ divider: styles.divider }} />
      </div>
      <div css={styles.menuItems}>
        {personalMenuItems.map(item => (
          <MenuItem
            key={item.label}
            Icon={item.Icon}
            label={item.label}
            onClick={() => handleMenuItemClick(item.label)}
            isSelected={selectedMenuItem === item.label}
          />
        ))}
        <DividerBase styles={{ divider: styles.divider }} />
      </div>
      <div css={styles.menuItems}>
        {businessMenuItems.map(item => (
          <MenuItem
            key={item.label}
            Icon={item.Icon}
            label={item.label}
            onClick={() => handleMenuItemClick(item.label)}
            isSelected={selectedMenuItem === item.label}
          />
        ))}
        <DividerBase styles={{ divider: styles.divider }} />
      </div>
      <div css={styles.menuItems}>
        <MenuItem
          Icon={switchToPersonalMenuItem.Icon}
          label={switchToPersonalMenuItem.label}
          onClick={() => handleMenuItemClick(switchToPersonalMenuItem.label)}
          isSelected={selectedMenuItem === switchToPersonalMenuItem.label}
        />
      </div>
    </nav>
  );
}
