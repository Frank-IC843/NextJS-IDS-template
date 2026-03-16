import { z } from 'zod';

export const dashboardToneSchema = z.enum(['positive', 'brand', 'neutral', 'caution']);
export type DashboardTone = z.infer<typeof dashboardToneSchema>;

export const supportedWidgetTypeSchema = z.enum(['metric', 'lineChart', 'barChart', 'donutChart', 'insightList']);
export type SupportedWidgetType = z.infer<typeof supportedWidgetTypeSchema>;

export const dashboardLayoutSchema = z.enum(['half', 'full']);
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

export const dashboardTimeRangeSchema = z.enum(['last7Days', 'last30Days', 'last8Weeks', 'quarterToDate']);
export type DashboardTimeRange = z.infer<typeof dashboardTimeRangeSchema>;

export const dashboardGenerateInputSchema = z.object({
  prompt: z.string().trim().min(1).max(400),
});
export type DashboardGenerateInput = z.infer<typeof dashboardGenerateInputSchema>;

export const widgetRequestSchema = z.object({
  widgetType: supportedWidgetTypeSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  timeRange: dashboardTimeRangeSchema.optional(),
  metric: z.string().trim().min(1).optional(),
  groupBy: z.string().trim().min(1).optional(),
  filters: z.array(z.string().trim().min(1)).default([]),
  layoutHint: dashboardLayoutSchema.optional(),
});
export type WidgetRequest = z.infer<typeof widgetRequestSchema>;

export const singleWidgetRequestSchema = widgetRequestSchema;

const dashboardWidgetBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  layout: dashboardLayoutSchema,
  timeRangeLabel: z.string().min(1).optional(),
});

export const metricWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal('metric'),
  data: z.object({
    value: z.string().min(1),
    change: z.string().min(1),
    detail: z.string().min(1),
    tone: dashboardToneSchema,
  }),
});
export type MetricWidget = z.infer<typeof metricWidgetSchema>;

export const chartPointSchema = z.object({
  label: z.string().min(1),
  value: z.number().nonnegative(),
});
export type ChartPoint = z.infer<typeof chartPointSchema>;

export const lineChartWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal('lineChart'),
  data: z.object({
    points: z.array(chartPointSchema).min(2),
    footer: z.string().min(1),
  }),
});
export type LineChartWidget = z.infer<typeof lineChartWidgetSchema>;

export const barChartWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal('barChart'),
  data: z.object({
    bars: z.array(chartPointSchema).min(2),
    footer: z.string().min(1),
  }),
});
export type BarChartWidget = z.infer<typeof barChartWidgetSchema>;

export const donutChartSegmentSchema = z.object({
  label: z.string().min(1),
  value: z.number().nonnegative(),
  tone: dashboardToneSchema,
});
export type DonutChartSegment = z.infer<typeof donutChartSegmentSchema>;

export const donutChartWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal('donutChart'),
  data: z.object({
    segments: z.array(donutChartSegmentSchema).min(2),
    footer: z.string().min(1),
  }),
});
export type DonutChartWidget = z.infer<typeof donutChartWidgetSchema>;

export const insightListWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal('insightList'),
  data: z.object({
    items: z.array(z.string().min(1)).min(1),
    tone: dashboardToneSchema,
    footer: z.string().min(1),
  }),
});
export type InsightListWidget = z.infer<typeof insightListWidgetSchema>;

export const dashboardWidgetSchema = z.discriminatedUnion('widgetType', [
  metricWidgetSchema,
  lineChartWidgetSchema,
  barChartWidgetSchema,
  donutChartWidgetSchema,
  insightListWidgetSchema,
]);
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;

export const dashboardGenerateResponseSchema = z.object({
  widget: dashboardWidgetSchema,
});
export type DashboardGenerateResponse = z.infer<typeof dashboardGenerateResponseSchema>;
