import { z } from 'zod';

export const insightCoverageStatusSchema = z.enum(['ready', 'needs_medusa_config', 'blocked']);
export type InsightCoverageStatus = z.infer<typeof insightCoverageStatusSchema>;

export const insightCategorySchema = z.enum([
  'acquisition',
  'activation',
  'business_health',
  'segment_breakdown',
  'retention',
  'invoicing',
  'partner_reporting',
]);
export type InsightCategory = z.infer<typeof insightCategorySchema>;

export const insightPersonaSchema = z.enum(['pm', 'sales', 'leadership']);
export type InsightPersona = z.infer<typeof insightPersonaSchema>;

export const insightImprovementFocusSchema = z.enum([
  'acquisition',
  'activation',
  'health',
  'segmentation',
  'retention',
  'invoicing',
  'partner_reporting',
]);
export type InsightImprovementFocus = z.infer<typeof insightImprovementFocusSchema>;

export const insightAnswerShapeSchema = z.enum(['metric', 'table', 'lineChart', 'barChart']);
export type InsightAnswerShape = z.infer<typeof insightAnswerShapeSchema>;

export const insightRelativeRangeSchema = z.enum([
  'past_7_days',
  'past_30_days',
  'past_12_weeks',
  'past_6_months',
  'last_month',
]);
export type InsightRelativeRange = z.infer<typeof insightRelativeRangeSchema>;

export const insightTimeBucketSchema = z.enum(['none', 'day', 'week', 'month']);
export type InsightTimeBucket = z.infer<typeof insightTimeBucketSchema>;

export const insightDimensionKindSchema = z.enum(['date', 'category']);
export type InsightDimensionKind = z.infer<typeof insightDimensionKindSchema>;

export const insightFilterOperatorSchema = z.enum(['equals', 'in']);
export type InsightFilterOperator = z.infer<typeof insightFilterOperatorSchema>;

export const insightFilterDefinitionSchema = z.object({
  dimensionId: z.string().trim().min(1),
  operator: insightFilterOperatorSchema,
  values: z.array(z.string().trim().min(1)).min(1),
});
export type InsightFilterDefinition = z.infer<typeof insightFilterDefinitionSchema>;

export const insightMetricDefinitionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  medusaName: z.string().trim().min(1).nullable().optional(),
  coverageStatus: insightCoverageStatusSchema,
  defaultDateDimensionId: z.string().trim().min(1).nullable().optional(),
  allowedDimensionIds: z.array(z.string().trim().min(1)).default([]),
});
export type InsightMetricDefinition = z.infer<typeof insightMetricDefinitionSchema>;

export const insightDimensionDefinitionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  medusaName: z.string().trim().min(1).nullable().optional(),
  kind: insightDimensionKindSchema,
  coverageStatus: insightCoverageStatusSchema,
});
export type InsightDimensionDefinition = z.infer<typeof insightDimensionDefinitionSchema>;

export const insightQuestionDefinitionSchema = z.object({
  id: z.string().trim().min(1),
  category: insightCategorySchema,
  persona: insightPersonaSchema,
  title: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  description: z.string().trim().min(1),
  aliases: z.array(z.string().trim().min(1)).default([]),
  improvementFocus: insightImprovementFocusSchema,
  preferredWidgetType: insightAnswerShapeSchema,
  coverageStatus: insightCoverageStatusSchema,
  metricIds: z.array(z.string().trim().min(1)).min(1),
  dimensionId: z.string().trim().min(1).nullable().optional(),
  timeBucket: insightTimeBucketSchema,
  relativeRange: insightRelativeRangeSchema,
  answerShape: insightAnswerShapeSchema,
  filters: z.array(insightFilterDefinitionSchema).default([]),
  coverageNotes: z.array(z.string().trim().min(1)).default([]),
});
export type InsightQuestionDefinition = z.infer<typeof insightQuestionDefinitionSchema>;

export const insightQueryInputSchema = z
  .object({
    question: z.string().trim().max(400).optional(),
    questionId: z.string().trim().min(1).optional(),
    clientRequestId: z.string().trim().min(1).max(80).optional(),
    preferredView: insightAnswerShapeSchema.optional(),
    relativeRange: insightRelativeRangeSchema.optional(),
    timeBucket: insightTimeBucketSchema.optional(),
  })
  .refine(input => Boolean(input.question?.trim() || input.questionId), {
    message: 'A question or questionId is required before querying Medusa.',
  });
export type InsightQueryInput = z.infer<typeof insightQueryInputSchema>;

export const insightPlannerConfidenceSchema = z.enum(['high', 'medium', 'low']);
export type InsightPlannerConfidence = z.infer<typeof insightPlannerConfidenceSchema>;

export const insightSavedViewSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(60),
  question: z.string().trim().min(1).max(400),
  questionId: z.string().trim().min(1).nullable().optional(),
  preferredView: insightAnswerShapeSchema.optional(),
  savedAt: z.string().trim().min(1),
});
export type InsightSavedView = z.infer<typeof insightSavedViewSchema>;

export const insightSavedViewsSchema = z.array(insightSavedViewSchema).max(8);
export type InsightSavedViews = z.infer<typeof insightSavedViewsSchema>;

export const insightSavedViewWriteInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(60),
  question: z.string().trim().min(1).max(400),
  questionId: z.string().trim().min(1).nullable().optional(),
  preferredView: insightAnswerShapeSchema.optional(),
});
export type InsightSavedViewWriteInput = z.infer<typeof insightSavedViewWriteInputSchema>;

export const insightSavedViewDeleteInputSchema = z.object({
  id: z.string().trim().min(1),
});
export type InsightSavedViewDeleteInput = z.infer<typeof insightSavedViewDeleteInputSchema>;

export const insightTableColumnSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  kind: z.enum(['text', 'date', 'number']),
});
export type InsightTableColumn = z.infer<typeof insightTableColumnSchema>;

export const insightTableRowValueSchema = z.union([z.string(), z.number(), z.null()]);
export type InsightTableRowValue = z.infer<typeof insightTableRowValueSchema>;

export const insightTableRowSchema = z.record(z.string().trim().min(1), insightTableRowValueSchema);
export type InsightTableRow = z.infer<typeof insightTableRowSchema>;

export const insightChartSchema = z.object({
  kind: z.enum(['line', 'bar']),
  xLabel: z.string().trim().min(1),
  yLabel: z.string().trim().min(1),
  points: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        value: z.number(),
      }),
    )
    .min(1)
    .max(200),
});
export type InsightChart = z.infer<typeof insightChartSchema>;

export const insightCoverageSchema = z.object({
  status: insightCoverageStatusSchema,
  message: z.string().trim().min(1),
  matchedQuestionId: z.string().trim().min(1).nullable().optional(),
  matchedQuestionTitle: z.string().trim().min(1).nullable().optional(),
  plannerReasoning: z.string().trim().min(1),
});
export type InsightCoverage = z.infer<typeof insightCoverageSchema>;

export const insightQueryPlanSchema = z.object({
  questionId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  metricIds: z.array(z.string().trim().min(1)).min(1),
  dimensionId: z.string().trim().min(1).nullable().optional(),
  relativeRange: insightRelativeRangeSchema,
  timeBucket: insightTimeBucketSchema,
  answerShape: insightAnswerShapeSchema,
  medusaSql: z.string().trim().min(1).nullable().optional(),
  compiledSql: z.string().trim().min(1).nullable().optional(),
});
export type InsightQueryPlan = z.infer<typeof insightQueryPlanSchema>;

export const insightQueryResponseSchema = z.object({
  clientRequestId: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1),
  columns: z.array(insightTableColumnSchema),
  rows: z.array(insightTableRowSchema),
  chart: insightChartSchema.nullable().optional(),
  coverage: insightCoverageSchema,
  plan: insightQueryPlanSchema.nullable().optional(),
});
export type InsightQueryResponse = z.infer<typeof insightQueryResponseSchema>;
