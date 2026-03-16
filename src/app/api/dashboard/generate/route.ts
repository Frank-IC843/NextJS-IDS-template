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
import { buildDashboardWidgetSystemPrompt } from '@/app/api/dashboard/generate/system-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = dashboardGenerateInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'A prompt and at least one allowed widget type are required.' }, { status: 400 });
    }

    const systemPrompt = buildDashboardWidgetSystemPrompt(parsedInput.data.allowedWidgetTypes);

    if (!systemPrompt) {
      return NextResponse.json({ error: 'Dashboard widget generation is unavailable.' }, { status: 500 });
    }

    const parsedWidgetRequest = singleWidgetRequestSchema.safeParse(
      mockGenerateWidgetRequest(parsedInput.data.prompt, {
        allowedWidgetTypes: parsedInput.data.allowedWidgetTypes,
      }),
    );

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
    return NextResponse.json({ error: 'Unable to generate a widget right now.' }, { status: 500 });
  }
}
