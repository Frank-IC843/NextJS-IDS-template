'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import type { DonutChartWidget } from '@/app/dashboard/dashboard-builder-types';

function useStyles() {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    chartSurface: {
      width: '100%',
      height: '240px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: businessPalette.canvasGradient,
      padding: '12px',
    },
    legendList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
    },
    legendRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    },
    legendLabel: {
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
  } as const;
}

export function DashboardDonutChartWidgetView({ widget }: { widget: DonutChartWidget }) {
  const styles = useStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const total = Math.max(widget.data.segments.reduce((sum, segment) => sum + segment.value, 0), 1);

  return (
    <div css={styles.container}>
      <div css={styles.chartSurface}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <PieChart>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${businessPalette.blueberryBorder}`,
                boxShadow: '0 12px 30px rgba(17, 24, 39, 0.10)',
              }}
            />
            <Pie
              data={widget.data.segments}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              cx="50%"
              cy="50%"
            >
              {widget.data.segments.map(segment => {
                const palette = getTonePalette(theme, segment.tone);

                return <Cell key={segment.label} fill={palette.accent} />;
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div css={styles.legendList}>
        {widget.data.segments.map(segment => {
          const palette = getTonePalette(theme, segment.tone);
          const percent = Math.round((segment.value / total) * 100);

          return (
            <div key={segment.label} css={styles.legendRow}>
              <div css={styles.legendLabel}>
                <div css={{ ...styles.toneDot, backgroundColor: palette.accent }} />
                <Text typography="bodyRegular">{segment.label}</Text>
              </div>
              <Text typography="bodySmall1" color="systemGrayscale60">
                {percent}%
              </Text>
            </div>
          );
        })}
      </div>

      <Text typography="bodyRegular" color="systemGrayscale60">
        {widget.data.footer}
      </Text>
    </div>
  );
}
