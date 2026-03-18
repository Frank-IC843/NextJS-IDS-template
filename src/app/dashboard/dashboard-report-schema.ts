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
        timeRangeLabel: widget.timeRangeLabel,
        summary: {
          value: widget.data.value,
          detail: widget.data.detail,
        },
      });
    case 'lineChart':
      return dashboardReportWidgetContextSchema.parse({
        id: widget.id,
        title: widget.title,
        description: widget.description,
        widgetType: widget.widgetType,
        timeRangeLabel: widget.timeRangeLabel,
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
        timeRangeLabel: widget.timeRangeLabel,
        summary: {
          bars: widget.data.bars,
          footer: widget.data.footer,
        },
      });
    case 'donutChart':
    default:
      return dashboardReportWidgetContextSchema.parse({
        id: widget.id,
        title: widget.title,
        description: widget.description,
        widgetType: widget.widgetType,
        timeRangeLabel: widget.timeRangeLabel,
        summary: {
          segments: widget.data.segments,
          footer: widget.data.footer,
        },
      });
  }
}
