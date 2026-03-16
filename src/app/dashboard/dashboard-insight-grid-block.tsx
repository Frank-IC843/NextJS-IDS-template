'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import { Divider, Text } from '@instacart/ids-customers';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import type {
  DashboardDistributionCard,
  DashboardInsightGridBlock,
  DashboardInsightListCard,
  DashboardTrendCard,
} from '@/app/dashboard/dashboard-mock-data';

function useStyles() {
  const theme = useTheme();

  return {
    sectionHeader: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
      marginBottom: '16px',
      maxWidth: '760px',
    },
    insightsGrid: {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
        gridAutoRows: '1fr',
      },
    },
    insightCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '14px',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      padding: '20px',
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 8px 30px rgba(17, 24, 39, 0.04)',
      minWidth: 0,
    },
    featureCard: {
      [responsive.up('r')]: {
        gridRow: 'span 2',
      },
    },
    cardEyebrow: {
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
    },
    chartArea: {
      display: 'grid',
      gap: '10px',
      alignItems: 'end',
      height: '220px',
      padding: '18px 16px 12px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      background:
        'linear-gradient(180deg, rgba(246, 247, 248, 0.92) 0%, rgba(255, 255, 255, 0.98) 100%)',
    },
    chartColumn: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '8px',
      minWidth: 0,
      height: '100%',
    },
    chartBar: {
      width: '100%',
      minHeight: '12px',
      borderRadius: '999px 999px 6px 6px',
      background: 'linear-gradient(180deg, #0AAD0A 0%, #098A09 100%)',
      boxShadow: '0 10px 24px rgba(10, 173, 10, 0.20)',
    },
    distributionList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    distributionRow: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    distributionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    },
    distributionTrack: {
      width: '100%',
      height: '10px',
      borderRadius: '999px',
      backgroundColor: theme.colors.systemGrayscale10,
      overflow: 'hidden' as const,
    },
    distributionFill: {
      height: '100%',
      borderRadius: '999px',
    },
    bulletList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '14px',
      margin: 0,
      padding: 0,
      listStyle: 'none' as const,
    },
    bulletItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    bulletMarker: {
      width: '10px',
      height: '10px',
      borderRadius: '999px',
      marginTop: '8px',
      flexShrink: 0,
    },
  } as const;
}

export function DashboardInsightGridBlockView({ block }: { block: DashboardInsightGridBlock }) {
  const styles = useStyles();

  return (
    <section>
      <div css={styles.sectionHeader}>
        <Text typography="titleMedium">{block.title}</Text>
        <Text typography="bodyRegular" color="systemGrayscale60">
          {block.description}
        </Text>
      </div>

      <div css={styles.insightsGrid}>
        {block.cards.map(card => {
          if (card.kind === 'trend') {
            return <TrendInsightCard key={card.id} card={card} />;
          }

          if (card.kind === 'distribution') {
            return <DistributionInsightCard key={card.id} card={card} />;
          }

          return <BulletInsightCard key={card.id} card={card} />;
        })}
      </div>
    </section>
  );
}

function TrendInsightCard({ card }: { card: DashboardTrendCard }) {
  const styles = useStyles();

  const maxValue = Math.max(...card.points.map(point => point.value), 1);

  return (
    <article css={{ ...styles.insightCard, ...styles.featureCard }}>
      <Text typography="bodySmall1" css={styles.cardEyebrow}>
        {card.eyebrow}
      </Text>
      <Text typography="titleMedium">{card.title}</Text>
      <Text typography="bodyRegular" color="systemGrayscale70">
        {card.description}
      </Text>

      <div css={{ ...styles.chartArea, gridTemplateColumns: `repeat(${card.points.length}, minmax(0, 1fr))` }}>
        {card.points.map(point => (
          <div key={point.label} css={styles.chartColumn}>
            <Text typography="bodySmall1" color="systemGrayscale60">
              {point.value}
            </Text>
            <div
              css={{
                ...styles.chartBar,
                height: `${Math.max((point.value / maxValue) * 100, 12)}%`,
              }}
            />
            <Text typography="bodySmall1" color="systemGrayscale60">
              {point.label}
            </Text>
          </div>
        ))}
      </div>

      <Divider />

      <Text typography="bodyRegular" color="systemGrayscale60">
        {card.footer}
      </Text>
    </article>
  );
}

function DistributionInsightCard({ card }: { card: DashboardDistributionCard }) {
  const styles = useStyles();
  const theme = useTheme();
  const total = Math.max(card.segments.reduce((sum, segment) => sum + segment.value, 0), 1);

  return (
    <article css={styles.insightCard}>
      <Text typography="bodySmall1" css={styles.cardEyebrow}>
        {card.eyebrow}
      </Text>
      <Text typography="titleMedium">{card.title}</Text>
      <Text typography="bodyRegular" color="systemGrayscale70">
        {card.description}
      </Text>

      <div css={styles.distributionList}>
        {card.segments.map(segment => {
          const palette = getTonePalette(theme, segment.tone);
          const percent = Math.round((segment.value / total) * 100);

          return (
            <div key={segment.label} css={styles.distributionRow}>
              <div css={styles.distributionHeader}>
                <Text typography="bodyRegular">{segment.label}</Text>
                <Text typography="bodySmall1" color="systemGrayscale60">
                  {percent}%
                </Text>
              </div>
              <div css={styles.distributionTrack}>
                <div
                  css={{
                    ...styles.distributionFill,
                    width: `${percent}%`,
                    backgroundColor: palette.accent,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Divider />

      <Text typography="bodyRegular" color="systemGrayscale60">
        {card.footer}
      </Text>
    </article>
  );
}

function BulletInsightCard({ card }: { card: DashboardInsightListCard }) {
  const styles = useStyles();
  const theme = useTheme();
  const palette = getTonePalette(theme, card.tone);

  return (
    <article css={styles.insightCard}>
      <Text typography="bodySmall1" css={styles.cardEyebrow}>
        {card.eyebrow}
      </Text>
      <Text typography="titleMedium">{card.title}</Text>
      <Text typography="bodyRegular" color="systemGrayscale70">
        {card.description}
      </Text>

      <ul css={styles.bulletList}>
        {card.items.map(item => (
          <li key={item} css={styles.bulletItem}>
            <div css={{ ...styles.bulletMarker, backgroundColor: palette.accent }} />
            <Text typography="bodyRegular" color="systemGrayscale70">
              {item}
            </Text>
          </li>
        ))}
      </ul>

      <Divider />

      <Text typography="bodyRegular" color="systemGrayscale60">
        {card.footer}
      </Text>
    </article>
  );
}
