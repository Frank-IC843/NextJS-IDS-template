'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import type { InsightListWidget } from '@/app/dashboard/dashboard-builder-types';

function useStyles() {
  const theme = useTheme();

  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    list: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '14px',
      listStyle: 'none' as const,
      margin: 0,
      padding: 0,
    },
    item: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      borderRadius: theme.radius.r12,
      padding: '14px 0',
      borderBottom: `1px solid ${theme.colors.systemGrayscale20}`,
      '&:last-of-type': {
        borderBottom: 'none',
        paddingBottom: 0,
      },
      '&:first-of-type': {
        paddingTop: 0,
      },
    },
    marker: {
      width: '10px',
      height: '10px',
      borderRadius: '999px',
      marginTop: '8px',
      flexShrink: 0,
    },
  } as const;
}

export function DashboardInsightListWidgetView({ widget }: { widget: InsightListWidget }) {
  const styles = useStyles();
  const theme = useTheme();
  const palette = getTonePalette(theme, widget.data.tone);

  return (
    <div css={styles.container}>
      <ul css={styles.list}>
        {widget.data.items.map(item => (
          <li key={item} css={styles.item}>
            <div css={{ ...styles.marker, backgroundColor: palette.accent }} />
            <Text typography="bodyRegular" color="systemGrayscale70">
              {item}
            </Text>
          </li>
        ))}
      </ul>

      <Text typography="bodyRegular" color="systemGrayscale60">
        {widget.data.footer}
      </Text>
    </div>
  );
}
