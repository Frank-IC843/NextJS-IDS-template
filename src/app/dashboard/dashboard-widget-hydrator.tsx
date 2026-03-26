'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { useEffect, useState } from 'react';
import type { DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { hydrateDashboardWidget } from '@/app/dashboard/dashboard-schema';
import { DashboardWidgetRenderer } from '@/app/dashboard/dashboard-widget-renderer';
import { DashboardWidgetSkeleton } from '@/app/dashboard/dashboard-widget-skeleton';
import { insightQueryResponseSchema, type InsightQueryResponse } from '@/app/insights/insights-types';

interface DashboardWidgetHydratorProps {
  widget: DashboardWidgetDraft;
}

type HydratorState =
  | {
      status: 'loading';
      response: null;
      errorMessage: null;
    }
  | {
      status: 'ready';
      response: InsightQueryResponse;
      errorMessage: null;
    }
  | {
      status: 'error';
      response: null;
      errorMessage: string;
    };

export function DashboardWidgetHydrator({ widget }: DashboardWidgetHydratorProps) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<HydratorState>({
    status: 'loading',
    response: null,
    errorMessage: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadWidget() {
      setState({
        status: 'loading',
        response: null,
        errorMessage: null,
      });

      try {
        const apiResponse = await fetch('/api/insights/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: widget.question,
            questionId: widget.questionId,
            preferredView: widget.preferredView ?? widget.widgetType,
            relativeRange: widget.relativeRange,
            timeBucket: widget.timeBucket,
            clientRequestId: widget.id,
          }),
          signal: controller.signal,
        });
        const payload = await apiResponse.json().catch(() => null);

        if (!apiResponse.ok) {
          setState({
            status: 'error',
            response: null,
            errorMessage:
              typeof payload?.error === 'string' ? payload.error : 'Unable to load Medusa data for this widget right now.',
          });
          return;
        }

        const parsedPayload = insightQueryResponseSchema.safeParse(payload);

        if (!parsedPayload.success) {
          setState({
            status: 'error',
            response: null,
            errorMessage: 'The Medusa widget response did not match the expected schema.',
          });
          return;
        }

        setState({
          status: 'ready',
          response: parsedPayload.data,
          errorMessage: null,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error('[dashboard-widget-hydrator] Medusa request failed:', error);
        setState({
          status: 'error',
          response: null,
          errorMessage: 'Unable to load Medusa data for this widget right now.',
        });
      }
    }

    void loadWidget();

    return () => {
      controller.abort();
    };
  }, [reloadToken, widget.id, widget.preferredView, widget.question, widget.questionId, widget.relativeRange, widget.timeBucket, widget.widgetType]);

  if (state.status === 'loading') {
    return <DashboardWidgetSkeleton widget={widget} />;
  }

  if (state.status === 'error') {
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
          {state.errorMessage}
        </Text>
        <button
          type="button"
          onClick={() => setReloadToken(currentToken => currentToken + 1)}
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

  return <DashboardWidgetRenderer widget={hydrateDashboardWidget(widget, state.response)} />;
}
