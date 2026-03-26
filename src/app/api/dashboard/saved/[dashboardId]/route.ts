import { NextResponse } from 'next/server';
import { savedDashboardResponseSchema } from '@/app/dashboard/dashboard-builder-types';
import { getSavedDashboard } from '@/app/dashboard/dashboard-saved-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface DashboardRouteContext {
  params: Promise<{
    dashboardId: string;
  }>;
}

export async function GET(_request: Request, context: DashboardRouteContext) {
  try {
    const { dashboardId } = await context.params;
    const dashboard = await getSavedDashboard(dashboardId);

    if (!dashboard) {
      return NextResponse.json({ error: 'Saved dashboard not found.' }, { status: 404 });
    }

    return NextResponse.json(
      savedDashboardResponseSchema.parse({
        dashboard,
      }),
    );
  } catch (error) {
    console.error('Saved dashboard load route failed:', error);
    return NextResponse.json({ error: 'Unable to load this dashboard right now.' }, { status: 500 });
  }
}
