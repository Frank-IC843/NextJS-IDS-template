'use client';

import { type Theme, useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { getStarterDashboardWidgets } from '@/app/dashboard/dashboard-builder-mocks';
import type { DashboardWidget } from '@/app/dashboard/dashboard-builder-types';
import { useDashboardContentStyles } from '@/app/dashboard/dashboard-content-styles';
import { DashboardHeroCarousel } from '@/app/dashboard/dashboard-hero-carousel';

const exampleLayoutWidgets = getStarterDashboardWidgets();

interface DashboardEmptyLaunchpadProps {
  onOpenBuilder: (prompt?: string) => void;
}

export function DashboardEmptyLaunchpad({ onOpenBuilder }: DashboardEmptyLaunchpadProps) {
  const styles = useDashboardContentStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return (
    <div css={styles.emptyLaunchpad}>
      <div css={styles.previewPanel}>
        <Text typography="bodyEmphasized" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
          Example layout
        </Text>
        <div css={styles.exampleWidgetGrid}>
          {exampleLayoutWidgets.map(widget => (
            <DashboardExampleWidgetShell key={widget.id} widget={widget} />
          ))}
        </div>
      </div>

      <DashboardHeroCarousel onOpenBuilder={onOpenBuilder} />
    </div>
  );
}

function DashboardExampleWidgetShell({ widget }: { widget: DashboardWidget }) {
  const styles = useDashboardContentStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return (
    <article
      css={{
        ...styles.exampleWidgetCard,
        gridColumn: widget.layout === 'full' ? '1 / -1' : undefined,
      }}
    >
      <div css={styles.exampleWidgetHeader}>
        <div css={styles.exampleWidgetTitleGroup}>
          <div css={styles.exampleWidgetMetaRow}>
            <Text typography="bodyEmphasized">{widget.title}</Text>
            {widget.timeRangeLabel ? (
              <div css={styles.exampleWidgetPill}>
                <Text typography="bodySmall1" color="systemGrayscale60">
                  {widget.timeRangeLabel}
                </Text>
              </div>
            ) : null}
          </div>
          {widget.description ? (
            <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetDescription}>
              {widget.description}
            </Text>
          ) : null}
        </div>
      </div>

      <div css={styles.exampleWidgetBody}>{renderExampleWidgetBody(widget, styles, theme, businessPalette)}</div>
    </article>
  );
}

function renderExampleWidgetBody(
  widget: DashboardWidget,
  styles: ReturnType<typeof useDashboardContentStyles>,
  theme: Theme,
  businessPalette: ReturnType<typeof getDashboardBusinessPalette>,
) {
  switch (widget.widgetType) {
    case 'lineChart': {
      const chartPoints = getExampleLinePreviewPoints(widget);

      return (
        <>
          <div css={styles.previewChartSurface}>
            <svg viewBox="0 0 520 180" preserveAspectRatio="none" css={styles.previewLineSvg} aria-hidden="true">
              <path d="M0 34 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
              <path d="M0 86 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
              <path d="M0 138 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
              <path
                d={chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')}
                fill="none"
                stroke={businessPalette.elderberry}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {chartPoints.map((point, index) => (
                <circle
                  key={point.label}
                  cx={point.x}
                  cy={point.y}
                  r={index === chartPoints.length - 1 ? 5 : 4}
                  fill={theme.colors.systemGrayscale00}
                  stroke={index === chartPoints.length - 1 ? businessPalette.elderberry : businessPalette.blueberry}
                  strokeWidth="2.5"
                />
              ))}
            </svg>
          </div>
          <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetFooter}>
            {widget.data.footer}
          </Text>
        </>
      );
    }
    case 'barChart': {
      const maxValue = Math.max(...widget.data.bars.map(bar => bar.value), 1);

      return (
        <>
          <div css={styles.previewChartSurface}>
            <div css={styles.exampleBarChart} aria-hidden="true">
              {widget.data.bars.map(bar => (
                <div key={bar.label} css={styles.exampleBarColumnWrap}>
                  <div
                    css={{
                      ...styles.exampleBarColumn,
                      height: `${Math.max((bar.value / maxValue) * 100, 18)}%`,
                    }}
                  />
                  <Text typography="bodySmall1" css={styles.exampleBarLabel}>
                    {bar.label}
                  </Text>
                </div>
              ))}
            </div>
          </div>
          <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetFooter}>
            {widget.data.footer}
          </Text>
        </>
      );
    }
    case 'donutChart': {
      const total = Math.max(widget.data.segments.reduce((sum, segment) => sum + segment.value, 0), 1);
      const donutGradient = buildExampleDonutGradient(widget, theme);

      return (
        <>
          <div css={styles.previewChartSurface}>
            <div css={styles.exampleDonutWrap}>
              <div css={{ ...styles.exampleDonutChart, background: donutGradient }} />
              <div css={styles.exampleDonutLegend}>
                {widget.data.segments.slice(0, 3).map(segment => {
                  const palette = getTonePalette(theme, segment.tone);

                  return (
                    <div key={segment.label} css={styles.exampleDonutLegendRow}>
                      <div css={{ ...styles.exampleDonutLegendDot, backgroundColor: palette.accent }} />
                      <Text typography="bodySmall1" css={styles.exampleDonutLegendLabel}>
                        {segment.label}
                      </Text>
                      <Text typography="bodySmall1" color="systemGrayscale60">
                        {Math.round((segment.value / total) * 100)}%
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetFooter}>
            {widget.data.footer}
          </Text>
        </>
      );
    }
    default:
      return (
        <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetFooter}>
          This example widget preview is unavailable.
        </Text>
      );
  }
}

function getExampleLinePreviewPoints(widget: Extract<DashboardWidget, { widgetType: 'lineChart' }>) {
  const points = widget.data.points;
  const chartWidth = 520;
  const leftPadding = 18;
  const rightPadding = 20;
  const topPadding = 30;
  const bottomPadding = 140;
  const maxValue = Math.max(...points.map(point => point.value), 1);
  const minValue = Math.min(...points.map(point => point.value));
  const valueRange = Math.max(maxValue - minValue, 1);
  const xStep = points.length > 1 ? (chartWidth - leftPadding - rightPadding) / (points.length - 1) : 0;

  return points.map((point, index) => ({
    label: point.label,
    x: Number((leftPadding + xStep * index).toFixed(2)),
    y: Number((bottomPadding - ((point.value - minValue) / valueRange) * (bottomPadding - topPadding)).toFixed(2)),
  }));
}

function buildExampleDonutGradient(widget: Extract<DashboardWidget, { widgetType: 'donutChart' }>, theme: Theme) {
  const total = Math.max(widget.data.segments.reduce((sum, segment) => sum + segment.value, 0), 1);
  let currentAngle = 0;

  const gradientStops = widget.data.segments.map(segment => {
    const palette = getTonePalette(theme, segment.tone);
    const startAngle = currentAngle;
    const sweep = (segment.value / total) * 360;
    const endAngle = startAngle + sweep;

    currentAngle = endAngle;

    return `${palette.accent} ${startAngle}deg ${endAngle}deg`;
  });

  return `conic-gradient(${gradientStops.join(', ')})`;
}
