import {
  chartPointSchema,
  donutChartSegmentSchema,
  MAX_METRICS_PER_WIDGET,
  MAX_WIDGETS_PER_DASHBOARD,
} from '@/app/dashboard/dashboard-builder-types';
import { z } from 'zod';

const dashboardReportWidgetBaseSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(200).optional(),
  timeRangeLabel: z.string().trim().min(1).max(40),
});

const dashboardReportMetricItemSchema = z.object({
  label: z.string().trim().min(1).max(48),
  value: z.string().trim().min(1).max(80),
});

const dashboardReportMetricWidgetContextSchema = dashboardReportWidgetBaseSchema.extend({
  widgetType: z.literal('metric'),
  summary: z.object({
    metrics: z.array(dashboardReportMetricItemSchema).min(1).max(MAX_METRICS_PER_WIDGET),
    footer: z.string().trim().min(1).max(200),
  }),
});

const dashboardReportLineChartWidgetContextSchema = dashboardReportWidgetBaseSchema.extend({
  widgetType: z.literal('lineChart'),
  summary: z.object({
    points: z.array(chartPointSchema).max(12),
    footer: z.string().trim().min(1).max(200),
  }),
});

const dashboardReportBarChartWidgetContextSchema = dashboardReportWidgetBaseSchema.extend({
  widgetType: z.literal('barChart'),
  summary: z.object({
    bars: z.array(chartPointSchema).max(12),
    footer: z.string().trim().min(1).max(200),
  }),
});

const dashboardReportDonutChartWidgetContextSchema = dashboardReportWidgetBaseSchema.extend({
  widgetType: z.literal('donutChart'),
  summary: z.object({
    segments: z.array(donutChartSegmentSchema).max(12),
    footer: z.string().trim().min(1).max(200),
  }),
});

export const dashboardReportWidgetContextSchema = z.discriminatedUnion('widgetType', [
  dashboardReportMetricWidgetContextSchema,
  dashboardReportLineChartWidgetContextSchema,
  dashboardReportBarChartWidgetContextSchema,
  dashboardReportDonutChartWidgetContextSchema,
]);
export type DashboardReportWidgetContext = z.infer<typeof dashboardReportWidgetContextSchema>;

export type DashboardReportWidgetState =
  | {
      status: 'loading';
      widgetId: string;
      title: string;
    }
  | {
      status: 'error';
      widgetId: string;
      title: string;
      detail: string;
    }
  | {
      status: 'ready';
      widgetId: string;
      title: string;
      context: DashboardReportWidgetContext;
    };

export const dashboardReportSkippedWidgetSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).max(80),
  reason: z.literal('error'),
  detail: z.string().trim().min(1).max(180),
});
export type DashboardReportSkippedWidget = z.infer<typeof dashboardReportSkippedWidgetSchema>;

export const dashboardReportRequestSchema = z.object({
  dashboardPrompt: z.string().trim().min(1).max(400).optional(),
  widgets: z.array(dashboardReportWidgetContextSchema).min(1).max(MAX_WIDGETS_PER_DASHBOARD),
  skippedWidgets: z.array(dashboardReportSkippedWidgetSchema).max(MAX_WIDGETS_PER_DASHBOARD).default([]),
});
export type DashboardReportRequest = z.infer<typeof dashboardReportRequestSchema>;

const dashboardReportKeyMetricSchema = z.object({
  label: z.string().trim().min(1).max(48),
  value: z.string().trim().min(1).max(80),
  insight: z.string().trim().min(1).max(180),
});

const dashboardReportEvidenceSchema = z.object({
  label: z.string().trim().min(1).max(48),
  value: z.string().trim().min(1).max(80),
});

const dashboardReportSectionSchema = z.object({
  title: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(260),
  sourceWidgetIds: z.array(z.string().trim().min(1)).min(1).max(3),
  callouts: z.array(z.string().trim().min(1).max(180)).min(1).max(4),
  evidence: z.array(dashboardReportEvidenceSchema).min(1).max(4),
});

const dashboardReportRecommendationSchema = z.object({
  title: z.string().trim().min(1).max(80),
  priority: z.enum(['high', 'medium', 'low']),
  action: z.string().trim().min(1).max(180),
  rationale: z.string().trim().min(1).max(220),
});

export const dashboardReportSchema = z.object({
  title: z.string().trim().min(1).max(100),
  subtitle: z.string().trim().min(1).max(180),
  executiveSummary: z.object({
    headline: z.string().trim().min(1).max(180),
    overview: z.string().trim().min(1).max(320),
    keyTakeaways: z.array(z.string().trim().min(1).max(180)).min(2).max(5),
  }),
  keyMetrics: z.array(dashboardReportKeyMetricSchema).min(1).max(4),
  sections: z.array(dashboardReportSectionSchema).min(1).max(4),
  recommendations: z.array(dashboardReportRecommendationSchema).min(1).max(4),
  caveats: z.array(z.string().trim().min(1).max(180)).max(4).default([]),
});
export type DashboardReport = z.infer<typeof dashboardReportSchema>;
