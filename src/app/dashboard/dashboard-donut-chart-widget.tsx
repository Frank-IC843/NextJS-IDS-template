'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import {
  getDashboardChartContainerStyles,
  getDashboardChartSurfaceStyles,
  getDashboardChartTooltipContentStyle,
} from '@/app/dashboard/dashboard-chart-styles';
import type { DonutChartWidget } from '@/app/dashboard/dashboard-builder-types';

export function DashboardDonutChartWidgetView({ widget }: { widget: DonutChartWidget }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const total = Math.max(widget.data.segments.reduce((sum, segment) => sum + segment.value, 0), 1);
  const hasData = widget.data.segments.length > 0;
  const containerStyles = getDashboardChartContainerStyles();
  const chartSurfaceStyles = getDashboardChartSurfaceStyles(theme, businessPalette, {
    background: businessPalette.canvasGradient,
    padding: '12px',
  });
  const legendListStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  };
  const legendRowStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  };
  const legendLabelStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };
  const toneDotStyles = {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    flexShrink: 0,
  };

  return (
    <div css={containerStyles}>
      <div css={chartSurfaceStyles}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <PieChart>
              <Tooltip contentStyle={getDashboardChartTooltipContentStyle(businessPalette.blueberryBorder)} />
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
        ) : (
          <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Text typography="bodyRegular" color="systemGrayscale60">
              No analytics data for this widget.
            </Text>
          </div>
        )}
      </div>

      {hasData ? (
        <div css={legendListStyles}>
          {widget.data.segments.map(segment => {
            const palette = getTonePalette(theme, segment.tone);
            const percent = Math.round((segment.value / total) * 100);

            return (
              <div key={segment.label} css={legendRowStyles}>
                <div css={legendLabelStyles}>
                  <div css={{ ...toneDotStyles, backgroundColor: palette.accent }} />
                  <Text typography="bodyRegular">{segment.label}</Text>
                </div>
                <Text typography="bodyMedium1" color="systemGrayscale60">
                  {percent}%
                </Text>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
