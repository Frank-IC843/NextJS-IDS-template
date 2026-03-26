import { NextRequest, NextResponse } from 'next/server';
import {
  dashboardSaveInputSchema,
  savedDashboardListResponseSchema,
  savedDashboardSummaryResponseSchema,
} from '@/app/dashboard/dashboard-builder-types';
import { listSavedDashboards, saveDashboard } from '@/app/dashboard/dashboard-saved-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dashboards = await listSavedDashboards();

    return NextResponse.json(
      savedDashboardListResponseSchema.parse({
        dashboards,
      }),
    );
  } catch (error) {
    console.error('Saved dashboards list route failed:', error);
    return NextResponse.json({ error: 'Unable to read saved dashboards right now.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = dashboardSaveInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'A dashboard name is optional, but at least one widget is required to save.' }, { status: 400 });
    }

    const dashboard = await saveDashboard(parsedInput.data);

    return NextResponse.json(
      savedDashboardSummaryResponseSchema.parse({
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          createdAt: dashboard.createdAt,
          updatedAt: dashboard.updatedAt,
          widgetCount: dashboard.widgets.length,
        },
      }),
    );
  } catch (error) {
    console.error('Saved dashboard create route failed:', error);
    return NextResponse.json({ error: 'Unable to save this dashboard right now.' }, { status: 500 });
  }
}
