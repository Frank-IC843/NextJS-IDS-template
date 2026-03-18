'use client';

import { BusinessAnalyticsMeasure } from '@/__generated__/graphql-types';
import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import { getDashboardChartMeasurePresentation } from '@/app/dashboard/dashboard-chart-measure-formatting';
import {
  getDashboardChartContainerStyles,
  getDashboardChartSurfaceStyles,
  getDashboardChartTooltipContentStyle,
} from '@/app/dashboard/dashboard-chart-styles';
import type { DonutChartSegment, DonutChartWidget } from '@/app/dashboard/dashboard-builder-types';

const DONUT_LABEL_RADIAN = Math.PI / 180;

export function DashboardDonutChartWidgetView({ widget }: { widget: DonutChartWidget }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const primaryMeasure = widget.query.measures[0] ?? BusinessAnalyticsMeasure.OrderCount;
  const measurePresentation = getDashboardChartMeasurePresentation(primaryMeasure);
  const total = Math.max(widget.data.segments.reduce((sum, segment) => sum + segment.value, 0), 1);
  const hasData = widget.data.segments.length > 0;
  const shouldUseDetailedLegend = widget.data.segments.length > 4;
  const minimumVisibleLabelPercent = shouldUseDetailedLegend ? 0.12 : 0.07;
  const shouldShowTotalSummary = supportsDonutTotalSummary(primaryMeasure);
  const containerStyles = getDashboardChartContainerStyles();
  const chartSurfaceStyles = getDashboardChartSurfaceStyles(theme, businessPalette, {
    background: businessPalette.canvasGradient,
    padding: '12px',
  });
  const chartSurfaceContentStyles = {
    display: 'grid',
    gridTemplateColumns: shouldShowTotalSummary ? 'minmax(0, 1fr) 148px' : 'minmax(0, 1fr)',
    alignItems: 'center',
    gap: '12px',
    height: '100%',
    minHeight: 0,
  };
  const donutChartAreaStyles = {
    width: '100%',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
  };
  const legendListStyles = {
    display: 'grid',
    gridTemplateColumns:
      widget.data.segments.length === 1
        ? 'minmax(0, 1fr)'
        : shouldUseDetailedLegend
          ? 'minmax(0, 1fr)'
          : 'repeat(2, minmax(0, 1fr))',
    gap: shouldUseDetailedLegend ? '10px' : '10px 18px',
  };
  const legendRowStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    minWidth: 0,
  };
  const legendLabelStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  };
  const legendValueGroupStyles = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    gap: '8px',
    marginLeft: 'auto',
    flexShrink: 0,
  };
  const toneDotStyles = {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    flexShrink: 0,
  };
  const totalSummaryWrapStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  };
  const totalSummaryStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '6px',
    width: '100%',
    maxWidth: '148px',
    padding: '14px 14px 12px',
    borderRadius: theme.radius.r12,
    border: `1px solid ${businessPalette.blueberryBorder}`,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    boxShadow: '0 10px 22px rgba(17, 24, 39, 0.04)',
  };
  const renderDonutLabel = (labelProps: DonutLabelProps) =>
    renderSegmentPercentLabel(labelProps, minimumVisibleLabelPercent, theme.colors.systemGrayscale70);

  return (
    <div css={containerStyles}>
      <div css={chartSurfaceStyles}>
        <div css={chartSurfaceContentStyles}>
          {hasData ? (
            <>
              <div css={donutChartAreaStyles}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Tooltip
                      contentStyle={getDashboardChartTooltipContentStyle(businessPalette.blueberryBorder)}
                      formatter={value => [measurePresentation.formatValue(Number(value)), measurePresentation.tooltipLabel]}
                    />
                    <Pie
                      data={widget.data.segments}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={54}
                      outerRadius={76}
                      paddingAngle={2}
                      cx="50%"
                      cy="50%"
                      label={renderDonutLabel}
                      labelLine={{ stroke: theme.colors.systemGrayscale30, strokeWidth: 1 }}
                    >
                      {widget.data.segments.map(segment => {
                        const palette = getTonePalette(theme, segment.tone);

                        return <Cell key={segment.label} fill={palette.accent} />;
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {shouldShowTotalSummary ? (
                <div css={totalSummaryWrapStyles}>
                  <div css={totalSummaryStyles}>
                    <Text typography="bodyMedium1" color="systemGrayscale60">
                      {measurePresentation.tooltipLabel}
                    </Text>
                    <Text typography="titleMedium" css={{ lineHeight: 1.05 }}>
                      {measurePresentation.formatValue(total)}
                    </Text>
                    <Text typography="bodyRegular" color="systemGrayscale60">
                      {widget.timeRangeLabel ?? 'Current selection'}
                    </Text>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Text typography="bodyRegular" color="systemGrayscale60">
                No analytics data for this widget.
              </Text>
            </div>
          )}
        </div>
      </div>

      {hasData ? (
        <>
          <div css={legendListStyles}>
            {widget.data.segments.map(segment => {
              const palette = getTonePalette(theme, segment.tone);
              const percent = Math.round((segment.value / total) * 100);

              return (
                <div key={segment.label} css={legendRowStyles}>
                  <div css={legendLabelStyles}>
                    <div css={{ ...toneDotStyles, backgroundColor: palette.accent }} />
                    <Text typography="bodyLarge1">{segment.label}</Text>
                  </div>
                  <div css={legendValueGroupStyles}>
                    <Text typography="bodyMedium1" color="systemGrayscale70">
                      {measurePresentation.formatValue(segment.value)}
                    </Text>
                    {shouldUseDetailedLegend ? (
                      <Text typography="bodyRegular" color="systemGrayscale60">
                        {percent}%
                      </Text>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

interface DonutLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  payload?: DonutChartSegment;
}

function renderSegmentPercentLabel(
  { cx, cy, midAngle, outerRadius, percent }: DonutLabelProps,
  minimumVisibleLabelPercent: number,
  labelFill: string,
) {
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof percent !== 'number' ||
    percent < minimumVisibleLabelPercent
  ) {
    return null;
  }

  const labelRadius = outerRadius + 14;
  const x = cx + labelRadius * Math.cos(-midAngle * DONUT_LABEL_RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * DONUT_LABEL_RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';
  const percentText = `${Math.round(percent * 100)}%`;

  return (
    <text
      x={x}
      y={y}
      fill={labelFill}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize="11"
      fontWeight="600"
    >
      {percentText}
    </text>
  );
}

function supportsDonutTotalSummary(measure: BusinessAnalyticsMeasure) {
  switch (measure) {
    case BusinessAnalyticsMeasure.TotalSpend:
    case BusinessAnalyticsMeasure.TotalSavings:
    case BusinessAnalyticsMeasure.OrdersPlaced:
    case BusinessAnalyticsMeasure.OrdersCompleted:
    case BusinessAnalyticsMeasure.OrderCount:
      return true;
    case BusinessAnalyticsMeasure.AvgOrderValue:
    case BusinessAnalyticsMeasure.AvgItemsPerOrder:
    default:
      return false;
  }
}
