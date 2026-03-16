import { NextRequest, NextResponse } from 'next/server';
import {
  hydrateWidgetRequest,
  mockGenerateWidgetRequest,
} from '@/app/dashboard/dashboard-builder-mocks';
import {
  dashboardGenerateInputSchema,
  dashboardGenerateResponseSchema,
  singleWidgetRequestSchema,
} from '@/app/dashboard/dashboard-builder-types';
import { dashboardWidgetSystemPrompt } from '@/app/api/dashboard/generate/system-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = dashboardGenerateInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'Prompt is required to generate widgets.' }, { status: 400 });
    }

    if (!dashboardWidgetSystemPrompt) {
      return NextResponse.json({ error: 'Dashboard widget generation is unavailable.' }, { status: 500 });
    }

    const parsedWidgetRequest = singleWidgetRequestSchema.safeParse(mockGenerateWidgetRequest(parsedInput.data.prompt));

    if (!parsedWidgetRequest.success) {
      console.error('Dashboard widget request validation failed:', parsedWidgetRequest.error.flatten());
      return NextResponse.json({ error: 'Unable to generate a supported widget.' }, { status: 500 });
    }

    const hydratedResponse = dashboardGenerateResponseSchema.safeParse({
      widget: hydrateWidgetRequest(parsedWidgetRequest.data),
    });

    if (!hydratedResponse.success) {
      console.error('Dashboard widget hydration failed:', hydratedResponse.error.flatten());
      return NextResponse.json({ error: 'Unable to hydrate widget data.' }, { status: 500 });
    }

    return NextResponse.json(hydratedResponse.data);
  } catch (error) {
    console.error('Dashboard generate route failed:', error);
    return NextResponse.json({ error: 'Unable to generate widgets right now.' }, { status: 500 });
  }
}
