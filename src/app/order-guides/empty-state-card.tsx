'use client';

import { useTheme, responsive } from '@instacart/ids-core';
import { Text, PrimaryButtonSmall, Image } from '@instacart/ids-customers';

interface EmptyStateCardProps {
  onCreateClick: () => void;
}

function useStyles() {
  const theme = useTheme();
  return {
    card: {
      position: 'relative',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      backgroundColor: theme.colors.systemGrayscale10,
      borderRadius: theme.radius.r12,
      padding: '16px',
      marginTop: '8px',
    },
    contentArea: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      [responsive.up('r')]: {
        maxWidth: 428,
        textAlign: 'left',
        alignItems: 'flex-start',
        paddingLeft: '16px',
      },
    },
    logo: {
      marginBottom: '12px',
      [responsive.up('r')]: {
        marginBottom: 0,
        position: 'absolute',
        right: 112,
        bottom: 0,
      },
    },
    titleText: {
      width: 247,
      [responsive.up('r')]: {
        width: 'auto',
        paddingTop: '16px',
        paddingBottom: '8px',
      },
    },
    bodyText: {
      padding: '8px 0',
    },
    createButton: {
      marginTop: '8px',
      maxWidth: 'fit-content',
    },
  } as const;
}

export function EmptyStateCard({ onCreateClick }: EmptyStateCardProps) {
  const styles = useStyles();

  return (
    <div css={styles.card}>
      <div css={styles.contentArea}>
        <Image
          css={styles.logo}
          templateUrl="https://www.instacart.com/image-server/236x236/www.instacart.com/assets/business/order_guides/cards/og-emptystate-graphic-538ab3ee8852f7abf1a07189ac69dfecbfdc45a51aa4284b542921595d90b78f.png"
          alt="Order guides empty state"
          width={236}
          height={236}
        />
        <Text css={styles.titleText} typography="title">
          Create order guides to share with your team
        </Text>
        <Text css={styles.bodyText} typography="bodyRegular" color="systemGrayscale70">
          Add items to an order guide for fast, streamlined shopping. Team members can shop directly from order guides
          you share with them.
        </Text>
        <PrimaryButtonSmall css={styles.createButton} onClick={onCreateClick}>
          Create order guide
        </PrimaryButtonSmall>
      </div>
    </div>
  );
}

export default EmptyStateCard;
