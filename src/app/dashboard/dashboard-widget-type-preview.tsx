'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import type { SupportedWidgetType } from '@/app/dashboard/dashboard-builder-types';
import { useDashboardPromptComposerStyles } from '@/app/dashboard/dashboard-prompt-composer.styles';

interface DashboardWidgetTypePreviewProps {
  widgetType: SupportedWidgetType;
}

export function DashboardWidgetTypePreview({ widgetType }: DashboardWidgetTypePreviewProps) {
  const styles = useDashboardPromptComposerStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  switch (widgetType) {
    case 'metric':
      return (
        <div css={styles.previewMetric}>
          <div css={styles.previewMetricTag}>
            <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
              Headline
            </Text>
          </div>
          <Text typography="headline">$18.4K</Text>
          <div css={styles.previewMetricFooter}>
            {[26, 42, 34].map(height => (
              <div key={height} css={{ ...styles.previewMetricBar, height: `${height}px` }} />
            ))}
          </div>
        </div>
      );
    case 'lineChart':
      return (
        <svg viewBox="0 0 240 96" css={styles.previewChartSvg} aria-hidden="true">
          <path d="M0 18 H240" stroke="rgba(43, 120, 198, 0.14)" strokeDasharray="5 5" />
          <path d="M0 52 H240" stroke="rgba(43, 120, 198, 0.14)" strokeDasharray="5 5" />
          <path
            d="M12 72 C46 62, 74 58, 100 50 C126 42, 152 36, 176 34 C198 32, 214 24, 228 18"
            fill="none"
            stroke="#6E48E5"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="100" cy="50" r="4" fill="#2B78C6" />
          <circle cx="176" cy="34" r="4" fill="#2B78C6" />
          <circle cx="228" cy="18" r="4" fill="#6E48E5" />
        </svg>
      );
    case 'barChart':
      return (
        <div css={styles.previewBarChart}>
          {[40, 60, 54, 72, 88].map(height => (
            <div key={height} css={{ ...styles.previewBarColumn, height: `${height}px` }} />
          ))}
        </div>
      );
    case 'donutChart':
      return (
        <div css={styles.previewDonutWrap}>
          <div css={{ ...styles.previewDonut, backgroundColor: theme.colors.systemGrayscale00 }} />
          <div css={styles.previewLegend}>
            <div css={styles.previewLegendRow}>
              <div css={{ ...styles.previewLegendDot, backgroundColor: businessPalette.elderberry }} />
              <div css={{ ...styles.previewLegendBar, maxWidth: '68%' }} />
            </div>
            <div css={styles.previewLegendRow}>
              <div css={{ ...styles.previewLegendDot, backgroundColor: businessPalette.blueberry }} />
              <div css={{ ...styles.previewLegendBar, maxWidth: '82%' }} />
            </div>
            <div css={styles.previewLegendRow}>
              <div css={{ ...styles.previewLegendDot, backgroundColor: 'rgba(43, 120, 198, 0.32)' }} />
              <div css={{ ...styles.previewLegendBar, maxWidth: '52%' }} />
            </div>
          </div>
        </div>
      );
    case 'insightList':
    default:
      return (
        <div css={styles.previewInsightList}>
          {[76, 92, 64].map(width => (
            <div key={width} css={styles.previewInsightRow}>
              <div css={styles.previewInsightDot} />
              <div css={{ ...styles.previewInsightLine, width: `${width}%` }} />
            </div>
          ))}
        </div>
      );
  }
}
