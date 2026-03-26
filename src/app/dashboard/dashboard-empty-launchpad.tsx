'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { getStarterDashboardWidgets } from '@/app/dashboard/dashboard-builder-mocks';
import type { DashboardWidget } from '@/app/dashboard/dashboard-builder-types';
import { useDashboardContentStyles } from '@/app/dashboard/dashboard-content-styles';
import { DashboardHeroCarousel } from '@/app/dashboard/dashboard-hero-carousel';
import { DashboardWidgetTypePreview } from '@/app/dashboard/dashboard-widget-type-preview';
import { DashboardWidgetRenderer } from '@/app/dashboard/dashboard-widget-renderer';

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
  const isChartPreview = widget.widgetType === 'lineChart' || widget.widgetType === 'barChart';

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
                <Text typography="bodyMedium1" color="systemGrayscale60">
                  {widget.timeRangeLabel}
                </Text>
              </div>
            ) : null}
          </div>
          {widget.description ? (
            <Text typography="bodyMedium1" color="systemGrayscale60" css={styles.exampleWidgetDescription}>
              {widget.description}
            </Text>
          ) : null}
        </div>
      </div>

      <div css={styles.exampleWidgetBody}>
        {isChartPreview ? <DashboardWidgetTypePreview widgetType={widget.widgetType} /> : <DashboardWidgetRenderer widget={widget} />}
      </div>
    </article>
  );
}
