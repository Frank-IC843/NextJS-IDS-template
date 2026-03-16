'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import {
  getDashboardChartContainerStyles,
  getDashboardChartSurfaceStyles,
  getDashboardChartTooltipContentStyle,
} from '@/app/dashboard/dashboard-chart-styles';
import type { BarChartWidget } from '@/app/dashboard/dashboard-builder-types';

export function DashboardBarChartWidgetView({ widget }: { widget: BarChartWidget }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const containerStyles = getDashboardChartContainerStyles();
  const chartSurfaceStyles = getDashboardChartSurfaceStyles(theme, businessPalette, {
    background: `linear-gradient(180deg, ${businessPalette.blueberrySoft} 0%, rgba(255, 255, 255, 0.98) 100%)`,
  });

  return (
    <div css={containerStyles}>
      <div css={chartSurfaceStyles}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <BarChart data={widget.data.bars} margin={{ top: 16, right: 12, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={theme.colors.systemGrayscale20} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.colors.systemGrayscale60, fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'rgba(17, 24, 39, 0.04)' }}
              contentStyle={getDashboardChartTooltipContentStyle(businessPalette.blueberryBorder)}
            />
            <Bar dataKey="value" fill={businessPalette.blueberry} radius={[10, 10, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Text typography="bodyRegular" color="systemGrayscale60">
        {widget.data.footer}
      </Text>
    </div>
  );
}
