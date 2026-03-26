'use client';

import { Text } from '@instacart/ids-customers';
import { DashboardBarChartWidgetView } from '@/app/dashboard/dashboard-bar-chart-widget';
import type { DashboardCanvasWidget } from '@/app/dashboard/dashboard-builder-types';
import { DashboardCoverageWidgetView } from '@/app/dashboard/dashboard-coverage-widget';
import { DashboardLineChartWidgetView } from '@/app/dashboard/dashboard-line-chart-widget';
import { DashboardMetricWidgetView } from '@/app/dashboard/dashboard-metric-widget';
import { DashboardTableWidgetView } from '@/app/dashboard/dashboard-table-widget';

export function DashboardWidgetRenderer({ widget }: { widget: DashboardCanvasWidget }) {
  if (widget.renderState === 'coverage_gap') {
    return <DashboardCoverageWidgetView widget={widget} />;
  }

  switch (widget.widgetType) {
    case 'metric':
      return <DashboardMetricWidgetView widget={widget} />;
    case 'lineChart':
      return <DashboardLineChartWidgetView widget={widget} />;
    case 'barChart':
      return <DashboardBarChartWidgetView widget={widget} />;
    case 'table':
      return <DashboardTableWidgetView widget={widget} />;
    default:
      return (
        <Text typography="bodyRegular" color="systemGrayscale60">
          Unsupported widget type.
        </Text>
      );
  }
}
