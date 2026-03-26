import { insightSavedViewsSchema, type InsightSavedView, type InsightSavedViews } from '@/app/insights/insights-types';

export const INSIGHTS_SAVED_VIEWS_COOKIE = 'insights_saved_views_v1';

const AUTH_COOKIE_NAMES = ['_instacart_session', 'instacart_sid', '__Host-instacart_sid'];

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

export function hasInternalInsightsAccess(cookieStore: CookieReader) {
  if (process.env.INSIGHTS_ALLOW_UNAUTHENTICATED === 'true') {
    return true;
  }

  return AUTH_COOKIE_NAMES.some(cookieName => Boolean(cookieStore.get(cookieName)?.value));
}

export function readSavedViews(cookieValue: string | undefined): InsightSavedViews {
  if (!cookieValue) {
    return [];
  }

  try {
    const decodedValue = Buffer.from(cookieValue, 'base64url').toString('utf8');
    const parsedValue = JSON.parse(decodedValue);
    const parsedViews = insightSavedViewsSchema.safeParse(parsedValue);

    return parsedViews.success ? parsedViews.data : [];
  } catch {
    return [];
  }
}

export function serializeSavedViews(views: InsightSavedView[]) {
  return Buffer.from(JSON.stringify(views), 'utf8').toString('base64url');
}
