'use client';

import { useQuery } from '@apollo/client';
import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type {
  BusinessAnalyticsQueryQuery,
  BusinessAnalyticsQueryQueryVariables,
} from '@/__generated__/graphql-types';
import type { DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { buildDashboardReportWidgetContext } from '@/app/dashboard/dashboard-report-schema';
import type { DashboardReportWidgetState } from '@/app/dashboard/dashboard-report-types';
import { DashboardWidgetRenderer } from '@/app/dashboard/dashboard-widget-renderer';
import { DashboardWidgetSkeleton } from '@/app/dashboard/dashboard-widget-skeleton';
import { BUSINESS_ANALYTICS_QUERY } from '@/app/dashboard/queries';
import { hydrateDashboardWidget } from '@/app/dashboard/dashboard-schema';

interface DashboardWidgetHydratorProps {
  widget: DashboardWidgetDraft;
  setReportWidgetStates?: Dispatch<SetStateAction<Record<string, DashboardReportWidgetState>>>;
}

export function DashboardWidgetHydrator({ widget, setReportWidgetStates }: DashboardWidgetHydratorProps) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const { data, loading, error, refetch } = useQuery<BusinessAnalyticsQueryQuery, BusinessAnalyticsQueryQueryVariables>(
    BUSINESS_ANALYTICS_QUERY,
    {
      variables: {
        input: widget.query,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    if (!setReportWidgetStates) {
      return;
    }

    if (error) {
      setReportWidgetStates(currentStates =>
        updateReportWidgetState(currentStates, widget.id, {
          status: 'error',
          widgetId: widget.id,
          title: widget.title,
          detail: 'Unable to load analytics for this view.',
        }),
      );
      return;
    }

    if (loading && !data) {
      return;
    }

    const hydratedWidget = hydrateDashboardWidget(widget, data?.businessAnalyticsQuery ?? null);

    setReportWidgetStates(currentStates =>
      updateReportWidgetState(currentStates, widget.id, {
        status: 'ready',
        widgetId: widget.id,
        title: widget.title,
        context: buildDashboardReportWidgetContext(hydratedWidget),
      }),
    );
  }, [data, error, loading, setReportWidgetStates, widget]);

  if (loading && !data) {
    return <DashboardWidgetSkeleton widget={widget} />;
  }

  if (error) {
    return (
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: '220px',
          padding: '18px',
          borderRadius: theme.radius.r12,
          border: `1px solid ${businessPalette.blueberryBorder}`,
          background: 'linear-gradient(180deg, rgba(43, 120, 198, 0.03) 0%, rgba(255, 255, 255, 1) 100%)',
        }}
      >
        <Text typography="bodyEmphasized">Unable to load widget data.</Text>
        <Text typography="bodyRegular" color="systemGrayscale60">
          The layout is saved, but this card could not hydrate from analytics right now.
        </Text>
        <button
          type="button"
          onClick={() => void refetch()}
          css={{
            appearance: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40px',
            padding: '0 14px',
            borderRadius: theme.radius.r12,
            border: `1px solid ${businessPalette.blueberryBorder}`,
            backgroundColor: businessPalette.blueberrySoft,
            color: businessPalette.blueberryDark,
            font: 'inherit',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return <DashboardWidgetRenderer widget={hydrateDashboardWidget(widget, data?.businessAnalyticsQuery ?? null)} />;
}

function updateReportWidgetState(
  currentStates: Record<string, DashboardReportWidgetState>,
  widgetId: string,
  nextState: DashboardReportWidgetState,
) {
  const previousState = currentStates[widgetId];

  if (areReportWidgetStatesEqual(previousState, nextState)) {
    return currentStates;
  }

  return {
    ...currentStates,
    [widgetId]: nextState,
  };
}

function areReportWidgetStatesEqual(
  previousState: DashboardReportWidgetState | undefined,
  nextState: DashboardReportWidgetState,
) {
  if (!previousState || previousState.status !== nextState.status || previousState.widgetId !== nextState.widgetId) {
    return false;
  }

  if (nextState.status === 'loading') {
    return previousState.title === nextState.title;
  }

  if (nextState.status === 'error') {
    return previousState.status === 'error' && previousState.title === nextState.title && previousState.detail === nextState.detail;
  }

  return (
    previousState.status === 'ready' &&
    previousState.title === nextState.title &&
    JSON.stringify(previousState.context) === JSON.stringify(nextState.context)
  );
}
