'use client';

import { Text } from '@instacart/ids-customers';
import { DashboardBarChartWidgetView } from '@/app/dashboard/dashboard-bar-chart-widget';
import type { DashboardWidget } from '@/app/dashboard/dashboard-builder-types';
import { DashboardDonutChartWidgetView } from '@/app/dashboard/dashboard-donut-chart-widget';
import { DashboardLineChartWidgetView } from '@/app/dashboard/dashboard-line-chart-widget';
import { DashboardMetricWidgetView } from '@/app/dashboard/dashboard-metric-widget';

export function DashboardWidgetRenderer({ widget }: { widget: DashboardWidget }) {
  switch (widget.widgetType) {
    case 'metric':
      return <DashboardMetricWidgetView widget={widget} />;
    case 'lineChart':
      return <DashboardLineChartWidgetView widget={widget} />;
    case 'barChart':
      return <DashboardBarChartWidgetView widget={widget} />;
    case 'donutChart':
      return <DashboardDonutChartWidgetView widget={widget} />;
    default:
      return (
        <Text typography="bodyRegular" color="systemGrayscale60">
          Unsupported widget type.
        </Text>
      );
  }
}
