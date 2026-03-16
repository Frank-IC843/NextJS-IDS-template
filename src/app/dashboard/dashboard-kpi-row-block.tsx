'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import type { DashboardKpiRowBlock } from '@/app/dashboard/dashboard-mock-data';

function useStyles() {
  const theme = useTheme();

  return {
    kpiGrid: {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
      '@media (min-width: 1220px)': {
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      },
    },
    kpiCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '14px',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      padding: '20px',
      backgroundColor: theme.colors.systemGrayscale00,
      minHeight: '200px',
      boxShadow: '0 8px 30px rgba(17, 24, 39, 0.04)',
    },
    kpiHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    toneDot: {
      width: '10px',
      height: '10px',
      borderRadius: '999px',
      flexShrink: 0,
    },
    kpiValue: {
      lineHeight: 1,
      marginTop: '2px',
    },
    kpiChange: {
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      padding: '8px 12px',
      borderRadius: '999px',
      border: '1px solid transparent',
    },
  } as const;
}

export function DashboardKpiRowBlockView({ block }: { block: DashboardKpiRowBlock }) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <section css={styles.kpiGrid}>
      {block.items.map(item => {
        const palette = getTonePalette(theme, item.tone);

        return (
          <article
            key={item.id}
            css={{
              ...styles.kpiCard,
              background: `linear-gradient(180deg, ${palette.soft} 0%, ${theme.colors.systemGrayscale00} 54%)`,
            }}
          >
            <div css={styles.kpiHeader}>
              <div css={{ ...styles.toneDot, backgroundColor: palette.accent }} />
              <Text typography="bodyLarge2" color="systemGrayscale60">
                {item.label}
              </Text>
            </div>

            <Text typography="headline" css={styles.kpiValue}>
              {item.value}
            </Text>

            <div css={{ ...styles.kpiChange, backgroundColor: palette.soft, borderColor: palette.border }}>
              <Text typography="bodySmall1" css={{ color: palette.accent }}>
                {item.change}
              </Text>
            </div>

            <Text typography="bodyRegular" color="systemGrayscale70">
              {item.detail}
            </Text>
          </article>
        );
      })}
    </section>
  );
}
