import { NextRequest, NextResponse } from 'next/server';
import { persistedDashboardLayoutSchema } from '@/app/dashboard/dashboard-builder-types';
import { readLocalDashboardLayout, writeLocalDashboardLayout } from '@/app/dashboard/dashboard-local-storage';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const layout = await readLocalDashboardLayout();
    return NextResponse.json({ layout });
  } catch (error) {
    console.error('Dashboard layout GET failed:', error);
    return NextResponse.json({ error: 'Unable to load the saved dashboard right now.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedLayout = persistedDashboardLayoutSchema.safeParse(body?.layout);

    if (!parsedLayout.success) {
      return NextResponse.json({ error: 'A valid dashboard layout is required.' }, { status: 400 });
    }

    await writeLocalDashboardLayout(parsedLayout.data);

    return NextResponse.json({
      layout: parsedLayout.data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard layout POST failed:', error);
    return NextResponse.json({ error: 'Unable to save the dashboard right now.' }, { status: 500 });
  }
}
