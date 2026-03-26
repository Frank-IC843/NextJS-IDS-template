import type { DashboardWidget } from '@/app/dashboard/dashboard-builder-types';
import { dashboardReportWidgetContextSchema } from '@/app/dashboard/dashboard-report-types';

export function buildDashboardReportWidgetContext(widget: DashboardWidget) {
  switch (widget.widgetType) {
    case 'metric':
      return dashboardReportWidgetContextSchema.parse({
        id: widget.id,
        title: widget.title,
        description: widget.description,
        widgetType: widget.widgetType,
        timeRangeLabel: widget.timeRangeLabel ?? 'Current selection',
        summary: {
          metrics: widget.data.metrics.map(metric => ({
            label: metric.label,
            value: metric.value,
          })),
          footer: widget.data.footer,
        },
      });
    case 'lineChart':
      return dashboardReportWidgetContextSchema.parse({
        id: widget.id,
        title: widget.title,
        description: widget.description,
        widgetType: widget.widgetType,
        timeRangeLabel: widget.timeRangeLabel ?? 'Current selection',
        summary: {
          points: widget.data.points,
          footer: widget.data.footer,
        },
      });
    case 'barChart':
      return dashboardReportWidgetContextSchema.parse({
        id: widget.id,
        title: widget.title,
        description: widget.description,
        widgetType: widget.widgetType,
        timeRangeLabel: widget.timeRangeLabel ?? 'Current selection',
        summary: {
          bars: widget.data.bars,
          footer: widget.data.footer,
        },
      });
    case 'table':
    default:
      return dashboardReportWidgetContextSchema.parse({
        id: widget.id,
        title: widget.title,
        description: widget.description,
        widgetType: widget.widgetType,
        timeRangeLabel: widget.timeRangeLabel ?? 'Current selection',
        summary: {
          columns: widget.data.columns,
          rows: widget.data.rows,
          footer: widget.data.footer,
        },
      });
  }
}
