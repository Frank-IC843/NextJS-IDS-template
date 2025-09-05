'use client';

import { useTheme } from '@instacart/ids-core';
import { Text, PrimaryButtonSmall } from '@instacart/ids-customers';
import { useState } from 'react';
import { CreateOrderGuideModal } from '@/app/order-guides/create-order-guide-modal';
import { EmptyStateCard } from '@/app/order-guides/empty-state-card';
import { ListingCard } from '@/app/order-guides/ListingCard';
import { useModalState } from '@instacart/ids-customers';
import { OrderGuidesConnectionQuery, OrderGuideFragment } from '@/__generated__/graphql-types';

function useStyles() {
  const theme = useTheme();
  return {
    container: {
      padding: '24px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
    },
    tabs: {
      display: 'flex',
      gap: '4px',
      marginBottom: '24px',
    },
    tab: {
      padding: '8px 16px',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      backgroundColor: theme.colors.systemGrayscale10,
      color: theme.colors.systemGrayscale70,
      '&[data-active="true"]': {
        backgroundColor: theme.colors.systemGrayscale90,
        color: '#ffffff',
      },
    },
    cardsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
  } as const;
}

interface OrderGuidesContentProps {
  orderGuidesData: OrderGuidesConnectionQuery | null;
}

export function OrderGuidesContent({ orderGuidesData }: OrderGuidesContentProps) {
  const styles = useStyles();
  const [tab, setTab] = useState<'all' | 'createdByMe'>('createdByMe');
  const createModal = useModalState({ visible: false });

  const orderGuides = orderGuidesData?.businessOrderGuidesConnection?.nodes || [];

  return (
    <div css={styles.container}>
      {/* Header */}
      <div css={styles.header}>
        <Text typography="titleLarge">Order Guides</Text>
        {orderGuides.length > 0 && (
          <PrimaryButtonSmall onClick={createModal.show}>Create order guide</PrimaryButtonSmall>
        )}
      </div>

      {/* Tabs */}
      <div css={styles.tabs}>
        <button css={styles.tab} data-active={tab === 'all'} onClick={() => setTab('all')}>
          All
        </button>
        <button css={styles.tab} data-active={tab === 'createdByMe'} onClick={() => setTab('createdByMe')}>
          Created by me
        </button>
      </div>

      {/* Cards in a vertical list */}
      {orderGuides.length === 0 ? (
        <EmptyStateCard onCreateClick={createModal.show} />
      ) : (
        <div css={styles.cardsList}>
          {orderGuides.map(guide => (
            <ListingCard key={guide.id} orderGuide={guide} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateOrderGuideModal
        modal={createModal}
        onOpenRetailerSelect={() => {}}
        onSubmit={() => {
          createModal.hide();
          // Refresh the page or refetch data
          window.location.reload();
        }}
      />
    </div>
  );
}

export default OrderGuidesContent;
