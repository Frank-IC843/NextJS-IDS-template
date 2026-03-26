import { z } from 'zod';
import {
  insightAnswerShapeSchema,
  insightCoverageStatusSchema,
  insightRelativeRangeSchema,
  insightTableColumnSchema,
  insightTableRowSchema,
  insightTimeBucketSchema,
} from '@/app/insights/insights-types';

export const dashboardToneSchema = z.enum(['positive', 'brand', 'neutral', 'caution']);
export type DashboardTone = z.infer<typeof dashboardToneSchema>;

export const supportedWidgetTypeSchema = z.enum(['metric', 'lineChart', 'barChart', 'table']);
export type SupportedWidgetType = z.infer<typeof supportedWidgetTypeSchema>;

export const dashboardLayoutSchema = z.enum(['half', 'full']);
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

export const MAX_WIDGETS_PER_GENERATION = 4;
export const MAX_WIDGETS_PER_DASHBOARD = 12;
export const MAX_METRICS_PER_WIDGET = 4;
export const MAX_TABLE_ROWS_PER_WIDGET = 10;
export const MAX_SAVED_DASHBOARD_HISTORY = 30;

export const dashboardGenerateInputSchema = z.object({
  prompt: z.string().trim().min(1).max(400),
  allowedWidgetTypes: z.array(supportedWidgetTypeSchema).min(1),
});
export type DashboardGenerateInput = z.infer<typeof dashboardGenerateInputSchema>;

export const dashboardWidgetDraftSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(220).optional(),
  question: z.string().trim().min(1).max(400),
  questionId: z.string().trim().min(1).optional(),
  preferredView: insightAnswerShapeSchema.optional(),
  relativeRange: insightRelativeRangeSchema.optional(),
  timeBucket: insightTimeBucketSchema.optional(),
  layout: dashboardLayoutSchema,
  widgetType: supportedWidgetTypeSchema,
  timeRangeLabel: z.string().trim().min(1).max(40).optional(),
});
export type DashboardWidgetDraft = z.infer<typeof dashboardWidgetDraftSchema>;

const dashboardReadyWidgetBaseSchema = dashboardWidgetDraftSchema.extend({
  renderState: z.literal('ready'),
  coverageStatus: z.literal('ready'),
  coverageMessage: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  matchedQuestionTitle: z.string().trim().min(1).optional(),
});

export const dashboardMetricItemSchema = z.object({
  label: z.string().trim().min(1).max(48),
  value: z.string().trim().min(1).max(80),
  tone: dashboardToneSchema,
});
export type DashboardMetricItem = z.infer<typeof dashboardMetricItemSchema>;

export const metricWidgetSchema = dashboardReadyWidgetBaseSchema.extend({
  widgetType: z.literal('metric'),
  data: z.object({
    metrics: z.array(dashboardMetricItemSchema).min(1).max(MAX_METRICS_PER_WIDGET),
    footer: z.string().trim().min(1).max(240),
  }),
});
export type MetricWidget = z.infer<typeof metricWidgetSchema>;

export const chartPointSchema = z.object({
  label: z.string().trim().min(1),
  value: z.number(),
});
export type ChartPoint = z.infer<typeof chartPointSchema>;

export const lineChartWidgetSchema = dashboardReadyWidgetBaseSchema.extend({
  widgetType: z.literal('lineChart'),
  data: z.object({
    xLabel: z.string().trim().min(1),
    yLabel: z.string().trim().min(1),
    points: z.array(chartPointSchema).max(200),
    footer: z.string().trim().min(1).max(240),
  }),
});
export type LineChartWidget = z.infer<typeof lineChartWidgetSchema>;

export const barChartWidgetSchema = dashboardReadyWidgetBaseSchema.extend({
  widgetType: z.literal('barChart'),
  data: z.object({
    xLabel: z.string().trim().min(1),
    yLabel: z.string().trim().min(1),
    bars: z.array(chartPointSchema).max(200),
    footer: z.string().trim().min(1).max(240),
  }),
});
export type BarChartWidget = z.infer<typeof barChartWidgetSchema>;

export const tableWidgetSchema = dashboardReadyWidgetBaseSchema.extend({
  widgetType: z.literal('table'),
  data: z.object({
    columns: z.array(insightTableColumnSchema).min(1).max(8),
    rows: z.array(insightTableRowSchema).max(MAX_TABLE_ROWS_PER_WIDGET),
    footer: z.string().trim().min(1).max(240),
  }),
});
export type TableWidget = z.infer<typeof tableWidgetSchema>;

export const dashboardWidgetSchema = z.discriminatedUnion('widgetType', [
  metricWidgetSchema,
  lineChartWidgetSchema,
  barChartWidgetSchema,
  tableWidgetSchema,
]);
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;

export const dashboardCoverageGapWidgetSchema = dashboardWidgetDraftSchema.extend({
  renderState: z.literal('coverage_gap'),
  coverageStatus: z.enum(['needs_medusa_config', 'blocked']),
  coverageMessage: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  matchedQuestionTitle: z.string().trim().min(1).optional(),
  plannerReasoning: z.string().trim().min(1),
});
export type DashboardCoverageGapWidget = z.infer<typeof dashboardCoverageGapWidgetSchema>;

export const dashboardCanvasWidgetSchema = z.union([dashboardWidgetSchema, dashboardCoverageGapWidgetSchema]);
export type DashboardCanvasWidget = z.infer<typeof dashboardCanvasWidgetSchema>;

export const dashboardGenerateResponseSchema = z.object({
  widgets: z.array(dashboardWidgetDraftSchema).min(1).max(MAX_WIDGETS_PER_GENERATION),
});
export type DashboardGenerateResponse = z.infer<typeof dashboardGenerateResponseSchema>;

export const dashboardCoverageStatusSchema = insightCoverageStatusSchema;
export type DashboardCoverageStatus = z.infer<typeof dashboardCoverageStatusSchema>;

export const dashboardSaveInputSchema = z.object({
  name: z.string().trim().max(80).optional(),
  widgets: z.array(dashboardWidgetDraftSchema).min(1).max(MAX_WIDGETS_PER_DASHBOARD),
});
export type DashboardSaveInput = z.infer<typeof dashboardSaveInputSchema>;

export const savedDashboardSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(80),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  widgets: z.array(dashboardWidgetDraftSchema).min(1).max(MAX_WIDGETS_PER_DASHBOARD),
});
export type SavedDashboard = z.infer<typeof savedDashboardSchema>;

export const savedDashboardSummarySchema = savedDashboardSchema.omit({
  widgets: true,
}).extend({
  widgetCount: z.number().int().min(1).max(MAX_WIDGETS_PER_DASHBOARD),
});
export type SavedDashboardSummary = z.infer<typeof savedDashboardSummarySchema>;

export const savedDashboardListResponseSchema = z.object({
  dashboards: z.array(savedDashboardSummarySchema),
});
export type SavedDashboardListResponse = z.infer<typeof savedDashboardListResponseSchema>;

export const savedDashboardResponseSchema = z.object({
  dashboard: savedDashboardSchema,
});
export type SavedDashboardResponse = z.infer<typeof savedDashboardResponseSchema>;

export const savedDashboardSummaryResponseSchema = z.object({
  dashboard: savedDashboardSummarySchema,
});
export type SavedDashboardSummaryResponse = z.infer<typeof savedDashboardSummaryResponseSchema>;
