'use client';

import { BusinessAnalyticsDimension, BusinessAnalyticsMeasure } from '@/__generated__/graphql-types';
import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { Bar, BarChart, CartesianGrid, Label, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { getDashboardChartMeasurePresentation } from '@/app/dashboard/dashboard-chart-measure-formatting';
import {
  getDashboardChartContainerStyles,
  getDashboardChartSurfaceStyles,
  getDashboardChartTooltipContentStyle,
} from '@/app/dashboard/dashboard-chart-styles';
import type { BarChartWidget } from '@/app/dashboard/dashboard-builder-types';

export function DashboardBarChartWidgetView({ widget }: { widget: BarChartWidget }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const primaryMeasure = widget.query.measures[0] ?? BusinessAnalyticsMeasure.OrderCount;
  const measurePresentation = getDashboardChartMeasurePresentation(primaryMeasure);
  const containerStyles = getDashboardChartContainerStyles();
  const xAxisLabel = getBarChartXAxisLabel(widget.query.dimensions[0]);
  const chartSurfaceStyles = getDashboardChartSurfaceStyles(theme, businessPalette, {
    background: `linear-gradient(180deg, ${businessPalette.blueberrySoft} 0%, rgba(255, 255, 255, 0.98) 100%)`,
  });
  const hasData = widget.data.bars.length > 0;

  return (
    <div css={containerStyles}>
      <div css={chartSurfaceStyles}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <BarChart data={widget.data.bars} margin={{ top: 16, right: 12, left: 4, bottom: 12 }}>
              <CartesianGrid stroke={theme.colors.systemGrayscale20} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.colors.systemGrayscale60, fontSize: 12 }}
                tickMargin={10}
                height={52}
                padding={{ left: 12, right: 12 }}
              >
                <Label
                  value={xAxisLabel}
                  position="insideBottom"
                  offset={-4}
                  style={{
                    fill: theme.colors.systemGrayscale60,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              </XAxis>
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: theme.colors.systemGrayscale60, fontSize: 12 }}
                tickMargin={8}
                width={88}
                tickFormatter={measurePresentation.formatValue}
              >
                <Label
                  value={measurePresentation.yAxisLabel}
                  angle={-90}
                  position="insideLeft"
                  offset={12}
                  style={{
                    fill: theme.colors.systemGrayscale60,
                    fontSize: 11,
                    fontWeight: 600,
                    textAnchor: 'middle',
                  }}
                />
              </YAxis>
              <Tooltip
                cursor={{ fill: 'rgba(17, 24, 39, 0.04)' }}
                contentStyle={getDashboardChartTooltipContentStyle(businessPalette.blueberryBorder)}
                formatter={value => [measurePresentation.formatValue(Number(value)), measurePresentation.tooltipLabel]}
              />
              <Bar dataKey="value" fill={businessPalette.blueberry} radius={[10, 10, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Text typography="bodyRegular" color="systemGrayscale60">
              No analytics data for this widget.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

function getBarChartXAxisLabel(dimension: BusinessAnalyticsDimension | undefined) {
  switch (dimension) {
    case BusinessAnalyticsDimension.Member:
      return 'Team member';
    case BusinessAnalyticsDimension.Retailer:
      return 'Retailer';
    case BusinessAnalyticsDimension.ServiceType:
      return 'Service type';
    case BusinessAnalyticsDimension.OrderStatus:
      return 'Order status';
    case BusinessAnalyticsDimension.ProductCategory:
      return 'Product category';
    case BusinessAnalyticsDimension.Department:
    default:
      return 'Department';
  }
}
