'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getInitials, getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import type {
  DashboardActivitySplitBlock,
  DashboardOrder,
  DashboardRecommendation,
} from '@/app/dashboard/dashboard-mock-data';

function useStyles() {
  const theme = useTheme();

  return {
    panelCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      padding: '24px',
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 12px 40px rgba(17, 24, 39, 0.06)',
    },
    sectionHeader: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
      maxWidth: '760px',
    },
    activityGrid: {
      display: 'grid',
      gap: '16px',
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 0.9fr)',
        alignItems: 'start',
      },
    },
    orderList: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    orderRow: {
      display: 'grid',
      gap: '14px',
      padding: '18px 0',
      borderBottom: `1px solid ${theme.colors.systemGrayscale20}`,
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'start',
      },
      '&:last-of-type': {
        borderBottom: 'none',
        paddingBottom: 0,
      },
      '&:first-of-type': {
        paddingTop: 0,
      },
    },
    orderInfo: {
      display: 'flex',
      gap: '12px',
      minWidth: 0,
    },
    orderAvatar: {
      width: '42px',
      height: '42px',
      borderRadius: '999px',
      backgroundColor: theme.colors.systemGrayscale10,
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    orderMeta: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      minWidth: 0,
    },
    orderHeader: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '6px 10px',
      alignItems: 'center',
    },
    orderRight: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: '10px',
      [responsive.up('r')]: {
        alignItems: 'flex-end',
      },
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '999px',
      border: '1px solid transparent',
    },
    recommendationList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    recommendationCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
      borderRadius: theme.radius.r12,
      border: '1px solid transparent',
      padding: '16px',
      backgroundColor: theme.colors.systemGrayscale00,
    },
    recommendationMeta: {
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      padding: '8px 12px',
      borderRadius: '999px',
      border: '1px solid transparent',
    },
  } as const;
}

export function DashboardActivitySplitBlockView({ block }: { block: DashboardActivitySplitBlock }) {
  const styles = useStyles();

  return (
    <section css={styles.activityGrid}>
      <article css={styles.panelCard}>
        <div css={styles.sectionHeader}>
          <Text typography="titleMedium">{block.ordersTitle}</Text>
          <Text typography="bodyRegular" color="systemGrayscale60">
            {block.ordersDescription}
          </Text>
        </div>

        <div css={styles.orderList}>
          {block.orders.map(order => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      </article>

      <article css={styles.panelCard}>
        <div css={styles.sectionHeader}>
          <Text typography="titleMedium">{block.sidePanelTitle}</Text>
          <Text typography="bodyRegular" color="systemGrayscale60">
            {block.sidePanelDescription}
          </Text>
        </div>

        <div css={styles.recommendationList}>
          {block.recommendations.map(recommendation => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      </article>
    </section>
  );
}

function OrderRow({ order }: { order: DashboardOrder }) {
  const styles = useStyles();
  const theme = useTheme();
  const palette = getTonePalette(theme, order.statusTone);

  return (
    <div css={styles.orderRow}>
      <div css={styles.orderInfo}>
        <div css={styles.orderAvatar}>
          <Text typography="bodySmall1">{getInitials(order.store)}</Text>
        </div>

        <div css={styles.orderMeta}>
          <div css={styles.orderHeader}>
            <Text typography="bodyEmphasized">{order.store}</Text>
            <Text typography="bodySmall1" color="systemGrayscale60">
              {order.owner}
            </Text>
          </div>

          <Text typography="bodyRegular" color="systemGrayscale70">
            {order.summary}
          </Text>

          <Text typography="bodySmall1" color="systemGrayscale60">
            {order.placedAt}
          </Text>
        </div>
      </div>

      <div css={styles.orderRight}>
        <Text typography="bodyEmphasized">{order.amount}</Text>
        <div css={{ ...styles.statusBadge, backgroundColor: palette.soft, borderColor: palette.border }}>
          <Text typography="bodySmall1" css={{ color: palette.accent }}>
            {order.status}
          </Text>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: DashboardRecommendation }) {
  const styles = useStyles();
  const theme = useTheme();
  const palette = getTonePalette(theme, recommendation.tone);

  return (
    <div
      css={{
        ...styles.recommendationCard,
        backgroundColor: palette.soft,
        borderColor: palette.border,
      }}
    >
      <Text typography="bodyEmphasized">{recommendation.title}</Text>
      <Text typography="bodyRegular" color="systemGrayscale70">
        {recommendation.body}
      </Text>
      <div css={{ ...styles.recommendationMeta, backgroundColor: theme.colors.systemGrayscale00, borderColor: palette.border }}>
        <Text typography="bodySmall1" css={{ color: palette.accent }}>
          {recommendation.meta}
        </Text>
      </div>
    </div>
  );
}
