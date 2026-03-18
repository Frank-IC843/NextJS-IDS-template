'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import type { MetricWidget } from '@/app/dashboard/dashboard-builder-types';

function useStyles() {
  const theme = useTheme();

  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
    },
    value: {
      lineHeight: 1,
    },
    changeBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      padding: '8px 12px',
      borderRadius: '999px',
      border: '1px solid transparent',
    },
    dataCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      minHeight: '240px',
      borderRadius: theme.radius.r12,
      padding: '24px',
      backgroundColor: theme.colors.systemGrayscale10,
      textAlign: 'center' as const,
    },
  } as const;
}

export function DashboardMetricWidgetView({ widget }: { widget: MetricWidget }) {
  const styles = useStyles();
  const theme = useTheme();
  const palette = getTonePalette(theme, widget.data.tone);

  return (
    <div css={styles.container}>
      <div
        css={{
          ...styles.dataCard,
          backgroundColor: palette.soft,
        }}
      >
        <Text typography="headline" css={styles.value}>
          {widget.data.value}
        </Text>
        <div css={{ ...styles.changeBadge, backgroundColor: theme.colors.systemGrayscale00, borderColor: palette.border }}>
          <Text typography="bodyMedium1" css={{ color: palette.accent }}>
            {widget.data.change}
          </Text>
        </div>
      </div>
    </div>
  );
}
