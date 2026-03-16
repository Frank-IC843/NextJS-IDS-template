'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import type { LineChartWidget } from '@/app/dashboard/dashboard-builder-types';

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
      border: `1px solid ${businessPalette.elderberryBorder}`,
      background: `linear-gradient(180deg, ${businessPalette.elderberrySoft} 0%, rgba(255, 255, 255, 0.98) 100%)`,
      padding: '12px 12px 4px',
    },
  } as const;
}

export function DashboardLineChartWidgetView({ widget }: { widget: LineChartWidget }) {
  const styles = useStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return (
    <div css={styles.container}>
      <div css={styles.chartSurface}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <LineChart data={widget.data.points} margin={{ top: 16, right: 12, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={theme.colors.systemGrayscale20} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.colors.systemGrayscale60, fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: theme.colors.systemGrayscale30, strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${businessPalette.elderberryBorder}`,
                boxShadow: '0 12px 30px rgba(17, 24, 39, 0.10)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={businessPalette.elderberry}
              strokeWidth={3}
              dot={{
                r: 3.5,
                strokeWidth: 2,
                stroke: businessPalette.blueberry,
                fill: theme.colors.systemGrayscale00,
              }}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: businessPalette.blueberryDark,
                fill: theme.colors.systemGrayscale00,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Text typography="bodyRegular" color="systemGrayscale60">
        {widget.data.footer}
      </Text>
    </div>
  );
}
