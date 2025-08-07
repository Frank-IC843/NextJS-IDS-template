'use client';

import Image from 'next/image';
import { MenuIcon, MarkerIcon, ChevronDownIcon, responsive, useTheme, spacing } from '@instacart/ids-core';
import { CartButton, SearchButton, Text } from '@instacart/ids-customers';

const useStyles = () => {
  const theme = useTheme();
  return {
    header: {
      height: '80px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      backgroundColor: theme.colors.brandBusinessElderberry,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
    },

    headerLeft: {
      display: 'flex',
      alignItems: 'center',
    },

    menuButton: {
      background: 'none',
      border: 'none',
      borderRadius: theme.radius.r8,
      color: 'white',
      cursor: 'pointer',
      marginRight: '10px',
      marginLeft: '18px',
      padding: spacing.s12,
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },

    logoContainer: {
      marginRight: '20px',
    },

    searchContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },

    searchButton: {
      cursor: 'text',
    },

    locationContainer: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '24px',
      color: 'white',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
    },

    locationIcon: {
      marginRight: '8px',
    },

    locationText: {
      marginRight: '4px',
    },

    cartButton: {
      marginRight: '24px',
    },

    logoImage: {
      height: 'auto',
      maxWidth: '250px',
      [responsive.down('c')]: {
        width: '100%',
        height: 'auto',
      },
    },

    headerRight: {
      display: 'flex',
      alignItems: 'center',
    },
  } as const;
};

export function Header() {
  const styles = useStyles();

  return (
    <header css={styles.header}>
      <div css={styles.headerLeft}>
        <button css={styles.menuButton}>
          <MenuIcon size="24px" color="systemGrayscale00" />
        </button>
        <div css={styles.logoContainer}>
          <Image
            src="https://www.instacart.com/image-server/x24/www.instacart.com/assets/beetstrap/brand/2022/instacart-business-logo-dark@3x-d16b19c9060685d040461f6e9a3c29e615b79792b566e74b9258f135db349c96.png"
            alt="Instacart Business"
            width={250}
            height={24}
            css={styles.logoImage}
          />
        </div>
      </div>
      <div css={styles.searchContainer}>
        <SearchButton css={styles.searchButton}>Search products, stores, and recipes</SearchButton>
      </div>

      <div css={styles.headerRight}>
        <div css={styles.locationContainer}>
          <MarkerIcon size="20px" color="systemGrayscale00" css={styles.locationIcon} />
          <Text color="systemGrayscale00" typography="bodyLarge2" css={styles.locationText}>
            94105
          </Text>
          <ChevronDownIcon size="16px" />
        </div>

        <CartButton itemCount={3} css={styles.cartButton} />
      </div>
    </header>
  );
}
