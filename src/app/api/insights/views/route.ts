import { NextRequest, NextResponse } from 'next/server';
import {
  INSIGHTS_SAVED_VIEWS_COOKIE,
  hasInternalInsightsAccess,
  readSavedViews,
  serializeSavedViews,
} from '@/app/insights/insights-server-utils';
import {
  insightSavedViewDeleteInputSchema,
  insightSavedViewWriteInputSchema,
  type InsightSavedView,
} from '@/app/insights/insights-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!hasInternalInsightsAccess(request.cookies)) {
    return NextResponse.json({ error: 'Sign in before loading saved insight views.' }, { status: 401 });
  }

  return NextResponse.json({
    views: readSavedViews(request.cookies.get(INSIGHTS_SAVED_VIEWS_COOKIE)?.value),
  });
}

export async function POST(request: NextRequest) {
  if (!hasInternalInsightsAccess(request.cookies)) {
    return NextResponse.json({ error: 'Sign in before saving an insight view.' }, { status: 401 });
  }

  const body = await request.json();
  const parsedInput = insightSavedViewWriteInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json({ error: 'A name and question are required to save this view.' }, { status: 400 });
  }

  const currentViews = readSavedViews(request.cookies.get(INSIGHTS_SAVED_VIEWS_COOKIE)?.value);
  const nextViewId = parsedInput.data.id ?? crypto.randomUUID();
  const nextSavedView: InsightSavedView = {
    id: nextViewId,
    name: parsedInput.data.name,
    question: parsedInput.data.question,
    questionId: parsedInput.data.questionId ?? null,
    preferredView: parsedInput.data.preferredView,
    savedAt: new Date().toISOString(),
  };
  const existingViewIndex = currentViews.findIndex(view => view.id === nextViewId);
  const nextViews = [...currentViews];

  if (existingViewIndex >= 0) {
    nextViews.splice(existingViewIndex, 1, nextSavedView);
  } else {
    nextViews.unshift(nextSavedView);
  }

  const truncatedViews = nextViews.slice(0, 8);
  const response = NextResponse.json({
    views: truncatedViews,
  });

  response.cookies.set(INSIGHTS_SAVED_VIEWS_COOKIE, serializeSavedViews(truncatedViews), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function DELETE(request: NextRequest) {
  if (!hasInternalInsightsAccess(request.cookies)) {
    return NextResponse.json({ error: 'Sign in before updating saved insight views.' }, { status: 401 });
  }

  const body = await request.json();
  const parsedInput = insightSavedViewDeleteInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json({ error: 'A saved view id is required.' }, { status: 400 });
  }

  const currentViews = readSavedViews(request.cookies.get(INSIGHTS_SAVED_VIEWS_COOKIE)?.value);
  const nextViews = currentViews.filter(view => view.id !== parsedInput.data.id);
  const response = NextResponse.json({
    views: nextViews,
  });

  response.cookies.set(INSIGHTS_SAVED_VIEWS_COOKIE, serializeSavedViews(nextViews), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
