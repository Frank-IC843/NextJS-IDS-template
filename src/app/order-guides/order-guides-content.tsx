'use client';

import { useTheme } from '@instacart/ids-core';
import { Text, PrimaryButtonSmall } from '@instacart/ids-customers';
import { useState, useEffect, useTransition } from 'react';
import { CreateOrderGuideModal } from '@/app/order-guides/create-order-guide-modal';
import { EmptyStateCard } from '@/app/order-guides/empty-state-card';
import { ListingCard } from '@/app/order-guides/ListingCard';
import { useModalState } from '@instacart/ids-customers';
import { OrderGuidesConnectionQuery } from '@/__generated__/graphql-types';
import { useRouter } from 'next/navigation';
import { orderGuideEvents } from '@/lib/order-guide-events';

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
      position: 'relative' as const,
      transition: 'opacity 0.3s ease',
    },
    refreshOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      zIndex: 10,
    },
    refreshText: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    newBadge: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      marginLeft: '8px',
      animation: 'pulse 2s infinite',
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
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const orderGuides = orderGuidesData?.businessOrderGuidesConnection?.nodes || [];

  // Listen for order guide creation events and auto-refresh
  useEffect(() => {
    const unsubscribe = orderGuideEvents.subscribe(event => {
      if (event.type === 'order-guide-created') {
        // Show refreshing state briefly for smooth transition
        setIsRefreshing(true);

        // Use React 18's startTransition for smooth updates
        startTransition(() => {
          router.refresh();

          // Clear refreshing state after a short delay
          setTimeout(() => {
            setIsRefreshing(false);
          }, 500);
        });
      }
    });

    return unsubscribe;
  }, [router]);

  return (
    <>
      <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
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
          <div css={styles.cardsList} style={{ opacity: isRefreshing ? 0.6 : 1 }}>
            {isRefreshing && (
              <div css={styles.refreshOverlay}>
                <div css={styles.refreshText}>
                  <span>🔄</span>
                  <Text typography="bodyRegular">Loading new order guide...</Text>
                </div>
              </div>
            )}
            {orderGuides.map((guide, index) => (
              <div
                key={guide.id}
                style={{ animation: isRefreshing && index === 0 ? 'slideDown 0.5s ease-out' : 'none' }}
              >
                <ListingCard orderGuide={guide} />
                {isRefreshing && index === 0 && <span css={styles.newBadge}>NEW</span>}
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <CreateOrderGuideModal
          modal={createModal}
          onOpenRetailerSelect={() => {}}
          onSubmit={() => {
            createModal.hide();
          }}
        />
      </div>
    </>
  );
}

export default OrderGuidesContent;
