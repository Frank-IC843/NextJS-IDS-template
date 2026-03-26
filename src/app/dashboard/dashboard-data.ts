import 'server-only';

import type { DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';

export interface DashboardPageData {
  widgets: DashboardWidgetDraft[];
  errorMessage: string | null;
}

export async function loadDashboardPageData(): Promise<DashboardPageData> {
  return {
    widgets: [],
    errorMessage: null,
  };
}
