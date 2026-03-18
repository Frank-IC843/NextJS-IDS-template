import 'server-only';

import {
  type BusinessDashboardQuery,
  type BusinessDashboardQueryVariables,
} from '@/__generated__/graphql-types';
import type { DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';
import { getDashboardWidgetDraftsFromLayout } from '@/app/dashboard/dashboard-schema';
import { BUSINESS_DASHBOARD_QUERY } from '@/app/dashboard/queries';
import { getClient } from '@/lib/apollo-client';

export interface DashboardPageData {
  widgets: DashboardWidgetDraft[];
  errorMessage: string | null;
}

export async function loadDashboardPageData(): Promise<DashboardPageData> {
  try {
    const client = getClient();
    const { data } = await client.query<BusinessDashboardQuery, BusinessDashboardQueryVariables>({
      query: BUSINESS_DASHBOARD_QUERY,
      fetchPolicy: 'no-cache',
    });
    const rawLayout = data.businessDashboard?.layout;

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
    console.error('Failed to load business dashboard:', error);

    return {
      widgets: [],
      errorMessage: 'Unable to load the saved dashboard right now.',
    };
  }
}
