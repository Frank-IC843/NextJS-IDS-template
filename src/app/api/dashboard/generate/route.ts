import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { BusinessAnalyticsDimension } from '@/__generated__/graphql-types';
import {
  businessAnalyticsDimensionSchema,
  businessAnalyticsMeasureSchema,
  businessAnalyticsTimeRangeSchema,
  dashboardAnalyticsFilterSchema,
  dashboardLayoutSchema,
  dashboardGenerateInputSchema,
  dashboardWidgetDraftSchema,
  supportedWidgetTypeSchema,
} from '@/app/dashboard/dashboard-builder-types';
import { buildDashboardWidgetSystemPrompt } from '@/app/api/dashboard/generate/system-prompt';
import { buildPersistedDashboardLayout } from '@/app/dashboard/dashboard-schema';
import { gpt4_1 } from '@/lib/ai-sdk-config';
import { z } from 'zod';

const plannerWidgetPlanSchema = z
  .object({
    widgetType: supportedWidgetTypeSchema,
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(200),
    timeRange: businessAnalyticsTimeRangeSchema,
    metric: businessAnalyticsMeasureSchema,
    groupBy: businessAnalyticsDimensionSchema.optional(),
    filters: z.array(dashboardAnalyticsFilterSchema).default([]),
    layoutHint: dashboardLayoutSchema.optional(),
  })
  .superRefine((widget, context) => {
    if ((widget.widgetType === 'barChart' || widget.widgetType === 'donutChart') && !widget.groupBy) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bar and donut widgets require a groupBy dimension.',
        path: ['groupBy'],
      });
    }

    if ((widget.widgetType === 'metric' || widget.widgetType === 'lineChart') && widget.groupBy) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Metric and line widgets should not specify groupBy.',
        path: ['groupBy'],
      });
    }
  });

const plannerResponseSchema = z.object({
  widgets: z.array(plannerWidgetPlanSchema).min(1).max(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = dashboardGenerateInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'A prompt and at least one allowed widget type are required.' }, { status: 400 });
    }

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
          measures: [widget.metric],
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
