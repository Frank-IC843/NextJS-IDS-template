import { NextRequest, NextResponse } from 'next/server';
import { mockGenerateDashboardDrafts } from '@/app/dashboard/dashboard-builder-mocks';
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

    const generatedWidgets = mockGenerateDashboardDrafts(parsedInput.data.prompt, {
      allowedWidgetTypes: parsedInput.data.allowedWidgetTypes,
    });
    const parsedWidgetDrafts = generatedWidgets.map(widget => dashboardWidgetDraftSchema.safeParse(widget));
    const hasInvalidWidgetDraft = parsedWidgetDrafts.some(result => !result.success);

    if (hasInvalidWidgetDraft) {
      const firstInvalidResult = parsedWidgetDrafts.find(result => !result.success);
      console.error('Dashboard widget drafts validation failed:', firstInvalidResult?.error.flatten());
      return NextResponse.json({ error: 'Unable to generate a supported dashboard plan.' }, { status: 500 });
    }
    const successfulDrafts = parsedWidgetDrafts.flatMap(result => (result.success ? [result.data] : []));

    const generatedResponse = dashboardGenerateResponseSchema.safeParse({
      widgets: successfulDrafts,
    });

    if (!generatedResponse.success) {
      console.error('Dashboard widget response validation failed:', generatedResponse.error.flatten());
      return NextResponse.json({ error: 'Unable to build a supported dashboard plan.' }, { status: 500 });
    }

    return NextResponse.json(generatedResponse.data);
  } catch (error) {
    console.error('Dashboard generate route failed:', error);
    return NextResponse.json({ error: 'Unable to generate a dashboard plan right now.' }, { status: 500 });
  }
}
