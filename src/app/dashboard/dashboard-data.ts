import 'server-only';

import type { DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';
import { readLocalDashboardLayout } from '@/app/dashboard/dashboard-local-storage';
import { getDashboardWidgetDraftsFromLayout } from '@/app/dashboard/dashboard-schema';

export interface DashboardPageData {
  widgets: DashboardWidgetDraft[];
  errorMessage: string | null;
}

export async function loadDashboardPageData(): Promise<DashboardPageData> {
  try {
    const rawLayout = await readLocalDashboardLayout();

    if (!rawLayout) {
      return {
        widgets: [],
        errorMessage: null,
      };
    }

    const { layout, drafts } = getDashboardWidgetDraftsFromLayout(rawLayout);

    if (!layout) {
      return {
        widgets: [],
        errorMessage: 'The saved dashboard layout was invalid, so the canvas started empty.',
      };
    }

    return {
      widgets: drafts,
      errorMessage:
        drafts.length < layout.widgets.length
          ? 'Some saved widget types are not supported in this frontend yet.'
          : null,
    };
  } catch (error) {
    console.error('Failed to load local business dashboard:', error);

    return {
      widgets: [],
      errorMessage: 'Unable to load the saved dashboard right now.',
    };
  }
}
