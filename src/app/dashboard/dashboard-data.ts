import 'server-only';

import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  type BusinessAnalyticsQueryQuery,
  type BusinessAnalyticsQueryQueryVariables,
  type BusinessDashboardQuery,
  type BusinessDashboardQueryVariables,
} from '@/__generated__/graphql-types';
import type { DashboardWidget, DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';
import { hydrateDashboardWidget, getDashboardWidgetDraftsFromLayout } from '@/app/dashboard/dashboard-schema';
import { BUSINESS_ANALYTICS_QUERY, BUSINESS_DASHBOARD_QUERY } from '@/app/dashboard/queries';
import { getClient } from '@/lib/apollo-client';

export interface DashboardPageData {
  widgets: DashboardWidget[];
  errorMessage: string | null;
}

interface HydratedWidgetResult {
  widget: DashboardWidget;
  hadAnalyticsError: boolean;
}

export async function loadDashboardPageData(): Promise<DashboardPageData> {
  const client = getClient();

  try {
    const { data } = await client.query<BusinessDashboardQuery, BusinessDashboardQueryVariables>({
      query: BUSINESS_DASHBOARD_QUERY,
      fetchPolicy: 'no-cache',
    });
    console.log("dashboard data", data);
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

    const unsupportedWidgetCount = Math.max(layout.widgets.length - drafts.length, 0);
    const hydratedWidgets = await Promise.all(drafts.map(draft => hydrateDashboardWidgetDraft(draft, client)));
    const analyticsErrorCount = hydratedWidgets.filter(result => result.hadAnalyticsError).length;
    const messages: string[] = [];

    if (unsupportedWidgetCount > 0) {
      messages.push(
        unsupportedWidgetCount === 1
          ? 'One saved widget type is not supported in this frontend yet.'
          : `${unsupportedWidgetCount} saved widget types are not supported in this frontend yet.`,
      );
    }

    if (analyticsErrorCount > 0) {
      messages.push(
        analyticsErrorCount === 1
          ? 'One widget could not be hydrated with live analytics data.'
          : `${analyticsErrorCount} widgets could not be hydrated with live analytics data.`,
      );
    }

    return {
      widgets: hydratedWidgets.map(result => result.widget),
      errorMessage: messages.length > 0 ? messages.join(' ') : null,
    };
  } catch (error) {
    console.error('Failed to load business dashboard:', error);

    return {
      widgets: [],
      errorMessage: 'Unable to load the saved dashboard right now.',
    };
  }
}

export async function hydrateDashboardWidgetDraft(
  draft: DashboardWidgetDraft,
  client: ApolloClient<NormalizedCacheObject> = getClient(),
): Promise<HydratedWidgetResult> {
  try {
    const { data } = await client.query<BusinessAnalyticsQueryQuery, BusinessAnalyticsQueryQueryVariables>({
      query: BUSINESS_ANALYTICS_QUERY,
      variables: {
        input: draft.query,
      },
      fetchPolicy: 'no-cache',
    });

    return {
      widget: hydrateDashboardWidget(draft, data.businessAnalyticsQuery),
      hadAnalyticsError: false,
    };
  } catch (error) {
    console.error(`Failed to hydrate dashboard widget "${draft.title}":`, error);

    return {
      widget: hydrateDashboardWidget(draft, null),
      hadAnalyticsError: true,
    };
  }
}
