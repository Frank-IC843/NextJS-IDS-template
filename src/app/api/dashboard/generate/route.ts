import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { BusinessAnalyticsDimension } from '@/__generated__/graphql-types';
import {
  MAX_METRICS_PER_WIDGET,
  MAX_WIDGETS_PER_GENERATION,
  businessAnalyticsDimensionSchema,
  businessAnalyticsMeasureSchema,
  businessAnalyticsTimeRangeSchema,
  dashboardAnalyticsFilterSchema,
  dashboardLayoutSchema,
  dashboardGenerateInputSchema,
  dashboardWidgetDraftSchema,
  supportedWidgetTypeSchema,
  type SupportedWidgetType,
} from '@/app/dashboard/dashboard-builder-types';
import { buildDashboardWidgetSystemPrompt } from '@/app/api/dashboard/generate/system-prompt';
import { buildPersistedDashboardLayout } from '@/app/dashboard/dashboard-schema';
import { gpt4_1 } from '@/lib/ai-sdk-config';
import { z } from 'zod';

const plannerWidgetBaseSchema = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(200),
  timeRange: businessAnalyticsTimeRangeSchema,
  filters: z.array(dashboardAnalyticsFilterSchema).default([]),
  layoutHint: dashboardLayoutSchema.optional(),
});

const metricPlannerWidgetPlanSchema = plannerWidgetBaseSchema.extend({
  widgetType: z.literal('metric'),
  metrics: z.array(businessAnalyticsMeasureSchema).min(1).max(MAX_METRICS_PER_WIDGET),
});

const lineChartPlannerWidgetPlanSchema = plannerWidgetBaseSchema.extend({
  widgetType: z.literal('lineChart'),
  metric: businessAnalyticsMeasureSchema,
});

const barChartPlannerWidgetPlanSchema = plannerWidgetBaseSchema.extend({
  widgetType: z.literal('barChart'),
  metric: businessAnalyticsMeasureSchema,
  groupBy: businessAnalyticsDimensionSchema,
});

const donutChartPlannerWidgetPlanSchema = plannerWidgetBaseSchema.extend({
  widgetType: z.literal('donutChart'),
  metric: businessAnalyticsMeasureSchema,
  groupBy: businessAnalyticsDimensionSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = dashboardGenerateInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'A prompt and at least one allowed widget type are required.' }, { status: 400 });
    }

    const plannerResponseSchema = buildPlannerResponseSchema(parsedInput.data.allowedWidgetTypes);

    const { object } = await generateObject({
      model: gpt4_1,
      system: buildDashboardWidgetSystemPrompt(parsedInput.data.allowedWidgetTypes),
      prompt: parsedInput.data.prompt,
      schema: plannerResponseSchema,
      temperature: 0,
    });

    const generatedWidgets = object.widgets.map(widget =>
      dashboardWidgetDraftSchema.parse({
        id: buildWidgetId(widget.widgetType),
        title: widget.title,
        description: widget.description,
        prompt: parsedInput.data.prompt,
        layout: 'half',
        widgetType: widget.widgetType,
        query: {
          measures: widget.widgetType === 'metric' ? widget.metrics : [widget.metric],
          dimensions:
            widget.widgetType === 'metric'
              ? []
              : widget.widgetType === 'lineChart'
                ? [BusinessAnalyticsDimension.Date]
                : widget.groupBy
                  ? [widget.groupBy]
                  : [],
          filters: widget.filters,
          timeRange: widget.timeRange,
        },
      }),
    );
    return NextResponse.json({
      layout: buildPersistedDashboardLayout(generatedWidgets),
    });
  } catch (error) {
    console.error('Dashboard generate route failed:', error);
    return NextResponse.json({ error: 'Unable to generate a dashboard plan right now.' }, { status: 500 });
  }
}

function buildWidgetId(prefix: z.infer<typeof supportedWidgetTypeSchema>) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

type PlannerWidgetPlanSchemaByType = {
  metric: typeof metricPlannerWidgetPlanSchema;
  lineChart: typeof lineChartPlannerWidgetPlanSchema;
  barChart: typeof barChartPlannerWidgetPlanSchema;
  donutChart: typeof donutChartPlannerWidgetPlanSchema;
};

const plannerWidgetPlanSchemaByType: PlannerWidgetPlanSchemaByType = {
  metric: metricPlannerWidgetPlanSchema,
  lineChart: lineChartPlannerWidgetPlanSchema,
  barChart: barChartPlannerWidgetPlanSchema,
  donutChart: donutChartPlannerWidgetPlanSchema,
};

function buildPlannerResponseSchema(allowedWidgetTypes: SupportedWidgetType[]) {
  const widgetPlanSchema = buildPlannerWidgetPlanSchema(allowedWidgetTypes);

  return z.object({
    widgets: z.array(widgetPlanSchema).min(1).max(getMaxPlannerWidgetCount(allowedWidgetTypes)),
  });
}

function buildPlannerWidgetPlanSchema(allowedWidgetTypes: SupportedWidgetType[]) {
  const uniqueAllowedWidgetTypes = Array.from(new Set(allowedWidgetTypes));
  const allowedSchemas = uniqueAllowedWidgetTypes.map(widgetType => plannerWidgetPlanSchemaByType[widgetType]);

  if (allowedSchemas.length === 1) {
    return allowedSchemas[0];
  }

  const [firstSchema, secondSchema, ...restSchemas] = allowedSchemas;

  if (!firstSchema || !secondSchema) {
    throw new Error('At least one supported widget type is required.');
  }

  return z.discriminatedUnion('widgetType', [firstSchema, secondSchema, ...restSchemas]);
}

function getMaxPlannerWidgetCount(allowedWidgetTypes: SupportedWidgetType[]) {
  return Math.min(MAX_WIDGETS_PER_GENERATION, Array.from(new Set(allowedWidgetTypes)).length);
}
