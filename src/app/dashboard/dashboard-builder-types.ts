import {
  BusinessAnalyticsDimension,
  BusinessAnalyticsFilterField,
  BusinessAnalyticsFilterOperator,
  BusinessAnalyticsMeasure,
  BusinessAnalyticsTimeRange,
} from '@/__generated__/graphql-types';
import { z } from 'zod';

export const dashboardToneSchema = z.enum(['positive', 'brand', 'neutral', 'caution']);
export type DashboardTone = z.infer<typeof dashboardToneSchema>;

export const supportedWidgetTypeSchema = z.enum(['metric', 'lineChart', 'barChart', 'donutChart']);
export type SupportedWidgetType = z.infer<typeof supportedWidgetTypeSchema>;

export const dashboardLayoutSchema = z.enum(['half', 'full']);
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

export const MAX_WIDGETS_PER_GENERATION = 4;
export const MAX_WIDGETS_PER_DASHBOARD = 12;

export const businessAnalyticsMeasureSchema = z.nativeEnum(BusinessAnalyticsMeasure);
export type DashboardAnalyticsMeasure = z.infer<typeof businessAnalyticsMeasureSchema>;

export const businessAnalyticsDimensionSchema = z.nativeEnum(BusinessAnalyticsDimension);
export type DashboardAnalyticsDimension = z.infer<typeof businessAnalyticsDimensionSchema>;

export const businessAnalyticsFilterFieldSchema = z.nativeEnum(BusinessAnalyticsFilterField);
export type DashboardAnalyticsFilterField = z.infer<typeof businessAnalyticsFilterFieldSchema>;

export const businessAnalyticsFilterOperatorSchema = z.nativeEnum(BusinessAnalyticsFilterOperator);
export type DashboardAnalyticsFilterOperator = z.infer<typeof businessAnalyticsFilterOperatorSchema>;

export const businessAnalyticsTimeRangeSchema = z.nativeEnum(BusinessAnalyticsTimeRange);
export type DashboardAnalyticsTimeRange = z.infer<typeof businessAnalyticsTimeRangeSchema>;

export const dashboardAnalyticsFilterSchema = z.object({
  field: businessAnalyticsFilterFieldSchema,
  operator: businessAnalyticsFilterOperatorSchema,
  value: z.string().trim().min(1),
});
export type DashboardAnalyticsFilter = z.infer<typeof dashboardAnalyticsFilterSchema>;

export const dashboardAnalyticsQuerySchema = z.object({
  measures: z.array(businessAnalyticsMeasureSchema).min(1),
  dimensions: z.array(businessAnalyticsDimensionSchema).default([]),
  filters: z.array(dashboardAnalyticsFilterSchema).default([]),
  timeRange: businessAnalyticsTimeRangeSchema,
});
export type DashboardAnalyticsQuery = z.infer<typeof dashboardAnalyticsQuerySchema>;

export const persistedDashboardAnalyticsQuerySchema = z.union([
  z.object({
    measures: z.array(businessAnalyticsMeasureSchema).min(1),
    dimensions: z.array(businessAnalyticsDimensionSchema).default([]),
    filters: z.array(dashboardAnalyticsFilterSchema).default([]),
    time_range: businessAnalyticsTimeRangeSchema,
  }),
  z.object({
    measures: z.array(businessAnalyticsMeasureSchema).min(1),
    dimensions: z.array(businessAnalyticsDimensionSchema).default([]),
    filters: z.array(dashboardAnalyticsFilterSchema).default([]),
    timeRange: businessAnalyticsTimeRangeSchema,
  }),
]);
export type PersistedDashboardAnalyticsQuery = z.infer<typeof persistedDashboardAnalyticsQuerySchema>;

export const persistedDashboardChartTypeSchema = z.enum(['NUMBER', 'BAR_CHART', 'LINE_CHART', 'PIE_CHART', 'TABLE']);
export type PersistedDashboardChartType = z.infer<typeof persistedDashboardChartTypeSchema>;

const persistedDashboardIntegerSchema = z.coerce.number().int();

export const persistedDashboardPositionSchema = z.object({
  x: persistedDashboardIntegerSchema.nonnegative(),
  y: persistedDashboardIntegerSchema.nonnegative(),
  w: persistedDashboardIntegerSchema.positive(),
  h: persistedDashboardIntegerSchema.positive(),
});
export type PersistedDashboardPosition = z.infer<typeof persistedDashboardPositionSchema>;

export const persistedDashboardWidgetSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  prompt: z.string().trim().min(1).nullable().optional(),
  position: persistedDashboardPositionSchema,
  chart_type: persistedDashboardChartTypeSchema,
  query: persistedDashboardAnalyticsQuerySchema,
});
export type PersistedDashboardWidget = z.infer<typeof persistedDashboardWidgetSchema>;

export const persistedDashboardLayoutSchema = z.object({
  version: persistedDashboardIntegerSchema.refine(version => version === 1, {
    message: 'Unsupported dashboard layout version.',
  }),
  widgets: z.array(persistedDashboardWidgetSchema).default([]),
});
export type PersistedDashboardLayout = z.infer<typeof persistedDashboardLayoutSchema>;

export const dashboardGenerateInputSchema = z.object({
  prompt: z.string().trim().min(1).max(400),
  allowedWidgetTypes: z.array(supportedWidgetTypeSchema).min(1),
});
export type DashboardGenerateInput = z.infer<typeof dashboardGenerateInputSchema>;

export const dashboardWidgetDraftSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  prompt: z.string().trim().min(1).optional(),
  layout: dashboardLayoutSchema,
  widgetType: supportedWidgetTypeSchema,
  query: dashboardAnalyticsQuerySchema,
});
export type DashboardWidgetDraft = z.infer<typeof dashboardWidgetDraftSchema>;

const dashboardWidgetBaseSchema = dashboardWidgetDraftSchema.extend({
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
    points: z.array(chartPointSchema),
    footer: z.string().min(1),
  }),
});
export type LineChartWidget = z.infer<typeof lineChartWidgetSchema>;

export const barChartWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal('barChart'),
  data: z.object({
    bars: z.array(chartPointSchema),
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
    segments: z.array(donutChartSegmentSchema),
    footer: z.string().min(1),
  }),
});
export type DonutChartWidget = z.infer<typeof donutChartWidgetSchema>;

export const dashboardWidgetSchema = z.discriminatedUnion('widgetType', [
  metricWidgetSchema,
  lineChartWidgetSchema,
  barChartWidgetSchema,
  donutChartWidgetSchema,
]);
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;

export const dashboardGenerateResponseSchema = z.object({
  widgets: z.array(dashboardWidgetDraftSchema).min(1).max(MAX_WIDGETS_PER_GENERATION),
});
export type DashboardGenerateResponse = z.infer<typeof dashboardGenerateResponseSchema>;
