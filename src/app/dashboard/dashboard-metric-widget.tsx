'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import type { MetricWidget } from '@/app/dashboard/dashboard-builder-types';

function useStyles(metricCount: number) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
    },
    dataCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      flex: 1,
      minHeight: '240px',
      borderRadius: theme.radius.r12,
      padding: metricCount > 1 ? '18px' : '24px',
    },
    singleMetricWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      textAlign: 'center' as const,
    },
    singleMetricStack: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '16px',
      maxWidth: '18rem',
      margin: '0 auto',
    },
    metricLabelBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      width: 'fit-content',
      padding: '8px 12px',
      borderRadius: '999px',
      border: '1px solid transparent',
      backgroundColor: theme.colors.systemGrayscale00,
    },
    metricToneDot: {
      width: '10px',
      height: '10px',
      borderRadius: '999px',
      flexShrink: 0,
    },
    singleMetricValue: {
      lineHeight: 0.95,
      letterSpacing: '-0.03em',
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '16px',
      height: '100%',
      flex: 1,
    },
    metricTile: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      gap: '12px',
      minWidth: 0,
      padding: '16px',
      borderRadius: theme.radius.r12,
      backgroundColor: 'rgba(255, 255, 255, 0.82)',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      boxShadow: '0 10px 26px rgba(255, 255, 255, 0.46)',
    },
    metricTileFeatured: {
      gridColumn: '1 / -1',
      minHeight: '108px',
    },
    metricTileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: 0,
    },
    metricTileValue: {
      lineHeight: 0.95,
      letterSpacing: '-0.03em',
    },
  } as const;
}

export function DashboardMetricWidgetView({ widget }: { widget: MetricWidget }) {
  const styles = useStyles(widget.data.metrics.length);
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const primaryMetric = widget.data.metrics[0];

  if (!primaryMetric) {
    return null;
  }

  const primaryPalette = getTonePalette(theme, primaryMetric.tone);
  const isComposite = widget.data.metrics.length > 1;

  return (
    <div css={styles.container}>
      <div
        css={{
          ...styles.dataCard,
          background: isComposite ? businessPalette.canvasGradient : primaryPalette.soft,
        }}
      >
        {isComposite ? (
          <div css={styles.metricsGrid}>
            {widget.data.metrics.map((metric, index) => {
              const palette = getTonePalette(theme, metric.tone);
              const isFeaturedMetric = widget.data.metrics.length === 3 && index === 0;

              return (
                <div
                  key={`${metric.label}-${index}`}
                  css={{
                    ...styles.metricTile,
                    ...(isFeaturedMetric ? styles.metricTileFeatured : {}),
                    borderColor: palette.border,
                  }}
                >
                  <div css={styles.metricTileHeader}>
                    <div css={{ ...styles.metricToneDot, backgroundColor: palette.accent }} />
                    <Text typography="bodyMedium1" color="systemGrayscale60">
                      {metric.label}
                    </Text>
                  </div>
                  <Text
                    typography={widget.data.metrics.length >= 4 && !isFeaturedMetric ? 'titleMedium' : 'headline'}
                    css={styles.metricTileValue}
                  >
                    {metric.value}
                  </Text>
                </div>
              );
            })}
          </div>
        ) : (
          <div css={styles.singleMetricWrap}>
            <div css={styles.singleMetricStack}>
              <div css={{ ...styles.metricLabelBadge, borderColor: primaryPalette.border }}>
                <div css={{ ...styles.metricToneDot, backgroundColor: primaryPalette.accent }} />
                <Text typography="bodyMedium1" css={{ color: primaryPalette.accent }}>
                  {primaryMetric.label}
                </Text>
              </div>
              <Text typography="headline" css={styles.singleMetricValue}>
                {primaryMetric.value}
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
