'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import type { DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { buildDashboardTimeRangeLabel } from '@/app/dashboard/dashboard-schema';
import { DashboardWidgetSkeleton } from '@/app/dashboard/dashboard-widget-skeleton';
import { useDashboardPromptComposerStyles } from '@/app/dashboard/dashboard-prompt-composer.styles';

interface DashboardWidgetPlanPreviewProps {
  widgets: DashboardWidgetDraft[];
}

export function DashboardWidgetPlanPreview({ widgets }: DashboardWidgetPlanPreviewProps) {
  const styles = useDashboardPromptComposerStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return (
    <div
      css={{
        display: 'grid',
        gap: '14px',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        [responsive.up('r')]: {
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        },
      }}
    >
      {widgets.map(widget => (
        <div
          key={widget.id}
          css={{
            ...styles.previewWidgetCard,
            gridColumn: widget.layout === 'full' ? '1 / -1' : undefined,
          }}
        >
          <div css={styles.previewWidgetHeader}>
            <div css={styles.previewWidgetHeaderCopy}>
              <Text typography="bodyEmphasized">{widget.title}</Text>
              {widget.description ? (
                <Text typography="bodyMedium1" css={styles.helperText}>
                  {widget.description}
                </Text>
              ) : null}
            </div>
            <div css={styles.previewWidgetMeta}>
              <div css={styles.previewWidgetBadge}>
                <Text typography="bodyMedium1" css={{ color: businessPalette.blueberryDark }}>
                  {buildDashboardTimeRangeLabel(widget.query.timeRange)}
                </Text>
              </div>
              <div css={{ ...styles.previewWidgetBadge, ...styles.previewWidgetBadgeAccent }}>
                <Text typography="bodyMedium1" css={{ color: businessPalette.elderberryDark }}>
                  {widget.layout === 'full' ? 'Full width' : 'Half width'}
                </Text>
              </div>
            </div>
          </div>
          <div
            css={{
              ...styles.previewWidgetCanvas,
              minHeight: widget.layout === 'full' ? '280px' : '240px',
            }}
          >
            <DashboardWidgetSkeleton widget={widget} />
          </div>
          <Text typography="bodyMedium1" css={{ color: businessPalette.blueberryDark }}>
            {widget.widgetType === 'metric'
              ? 'KPI snapshot'
              : widget.widgetType === 'lineChart'
                ? 'Trend view'
                : widget.widgetType === 'barChart'
                  ? 'Comparison view'
                  : 'Share view'}
          </Text>
        </div>
      ))}
    </div>
  );
}
