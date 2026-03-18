import { NextRequest, NextResponse } from 'next/server';
import { mockGenerateWidgetDraft } from '@/app/dashboard/dashboard-builder-mocks';
import { hydrateDashboardWidgetDraft } from '@/app/dashboard/dashboard-data';
import {
  dashboardGenerateInputSchema,
  dashboardGenerateResponseSchema,
  dashboardWidgetDraftSchema,
} from '@/app/dashboard/dashboard-builder-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = dashboardGenerateInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'A prompt and at least one allowed widget type are required.' }, { status: 400 });
    }

    const parsedWidgetDraft = dashboardWidgetDraftSchema.safeParse(
      mockGenerateWidgetDraft(parsedInput.data.prompt, {
        allowedWidgetTypes: parsedInput.data.allowedWidgetTypes,
      }),
    );

    if (!parsedWidgetDraft.success) {
      console.error('Dashboard widget draft validation failed:', parsedWidgetDraft.error.flatten());
      return NextResponse.json({ error: 'Unable to generate a supported widget.' }, { status: 500 });
    }

    const hydratedWidgetResult = await hydrateDashboardWidgetDraft(parsedWidgetDraft.data);
    const hydratedResponse = dashboardGenerateResponseSchema.safeParse({
      widget: hydratedWidgetResult.widget,
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
