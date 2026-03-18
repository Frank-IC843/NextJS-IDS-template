'use client';

import { useMutation } from '@apollo/client';
import { DndContext } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useTheme } from '@instacart/ids-core';
import { SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { useRef, useState } from 'react';
import type {
  CreateOrUpdateBusinessDashboardMutation,
  CreateOrUpdateBusinessDashboardMutationVariables,
} from '@/__generated__/graphql-types';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import {
  dashboardGenerateResponseSchema,
  type DashboardLayout,
  type DashboardWidget,
} from '@/app/dashboard/dashboard-builder-types';
import { useDashboardContentStyles } from '@/app/dashboard/dashboard-content-styles';
import { DashboardEmptyLaunchpad } from '@/app/dashboard/dashboard-empty-launchpad';
import { DashboardPromptComposer } from '@/app/dashboard/dashboard-prompt-composer';
import { CREATE_OR_UPDATE_BUSINESS_DASHBOARD_MUTATION } from '@/app/dashboard/queries';
import { buildPersistedDashboardLayout } from '@/app/dashboard/dashboard-schema';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';
import { DashboardWidgetShell } from '@/app/dashboard/dashboard-widget-shell';
import { useDashboardCanvasDnd } from '@/app/dashboard/use-dashboard-canvas-dnd';

type BuilderAction = 'generate' | 'preview';
type PreviewCacheEntry = {
  requestKey: string;
  widget: DashboardWidget;
};

interface DashboardContentProps {
  initialWidgets: DashboardWidget[];
  initialErrorMessage?: string | null;
  promptSuggestions: string[];
  supportedWidgets: SupportedWidgetDefinition[];
}

export function DashboardContent({
  initialWidgets,
  initialErrorMessage = null,
  promptSuggestions,
  supportedWidgets,
}: DashboardContentProps) {
  const styles = useDashboardContentStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const defaultPrompt = promptSuggestions[0] ?? '';
  const allWidgetTypes = supportedWidgets.map(widget => widget.type);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const canvasGridRef = useRef<HTMLDivElement | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveRequestIdRef = useRef(0);
  const [widgets, setWidgets] = useState(initialWidgets);
  const isEmpty = widgets.length === 0;
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(initialErrorMessage);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [allowedWidgetTypes, setAllowedWidgetTypes] = useState<SupportedWidgetDefinition['type'][]>(allWidgetTypes);
  const [previewWidget, setPreviewWidget] = useState<DashboardWidget | null>(null);
  const [pendingBuilderAction, setPendingBuilderAction] = useState<BuilderAction | null>(null);
  const previewCacheRef = useRef<PreviewCacheEntry | null>(null);
  const [saveDashboardLayout] = useMutation<
    CreateOrUpdateBusinessDashboardMutation,
    CreateOrUpdateBusinessDashboardMutationVariables
  >(CREATE_OR_UPDATE_BUSINESS_DASHBOARD_MUTATION);
  const {
    activeDragId,
    dragOverWidgetId,
    isCanvasDragging,
    sensors,
    collisionDetectionStrategy,
    restrictToPageBounds,
    clearDragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDashboardCanvasDnd({
    pageRef,
    canvasGridRef,
    widgets,
    onWidgetsChange: handleWidgetsChange,
  });

  function openBuilder(nextPrompt?: string) {
    setRequestError(null);
    setPreviewWidget(null);
    if (typeof nextPrompt === 'string') {
      setPrompt(nextPrompt);
    }
    setIsBuilderOpen(true);
  }

  async function requestGeneratedWidget(action: BuilderAction) {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setRequestError('Enter a prompt before generating a widget.');
      return null;
    }

    if (allowedWidgetTypes.length === 0) {
      setRequestError('Select at least one widget type for the builder.');
      return null;
    }

    const requestKey = getBuilderRequestKey(trimmedPrompt, allowedWidgetTypes);
    const cachedPreview = previewCacheRef.current;

    if (cachedPreview?.requestKey === requestKey) {
      setRequestError(null);
      return cachedPreview.widget;
    }

    setIsGenerating(true);
    setPendingBuilderAction(action);
    setRequestError(null);

    try {
      const response = await fetch('/api/dashboard/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          allowedWidgetTypes,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setRequestError(typeof payload?.error === 'string' ? payload.error : 'Unable to generate a widget right now.');
        return null;
      }

      const parsedResponse = dashboardGenerateResponseSchema.safeParse(payload);

      if (!parsedResponse.success) {
        setRequestError('The widget response did not match the supported schema.');
        return null;
      }

      if (action === 'preview') {
        previewCacheRef.current = {
          requestKey,
          widget: parsedResponse.data.widget,
        };
      }

      return parsedResponse.data.widget;
    } catch (error) {
      console.error('Dashboard prompt request failed:', error);
      setRequestError('Unable to generate a widget right now.');
      return null;
    } finally {
      setIsGenerating(false);
      setPendingBuilderAction(null);
    }
  }

  async function handlePromptSubmit() {
    const widget = await requestGeneratedWidget('generate');

    if (!widget) {
      return;
    }

    handleWidgetsChange([...widgets, widget]);
    setPreviewWidget(null);
    setPrompt(defaultPrompt);
    setIsBuilderOpen(false);
  }

  async function handlePreviewSubmit() {
    const widget = await requestGeneratedWidget('preview');

    if (!widget) {
      return;
    }

    setPreviewWidget(widget);
  }

  function handlePreviewConfirm() {
    if (!previewWidget) {
      return;
    }

    handleWidgetsChange([...widgets, previewWidget]);
    setPreviewWidget(null);
    setPrompt(defaultPrompt);
    setRequestError(null);
    setIsBuilderOpen(false);
  }

  function handlePreviewBack() {
    setPreviewWidget(null);
  }

  function handleAllowedWidgetTypeToggle(widgetType: SupportedWidgetDefinition['type']) {
    setAllowedWidgetTypes(currentTypes => {
      const nextTypes = currentTypes.includes(widgetType)
        ? currentTypes.filter(currentType => currentType !== widgetType)
        : [...currentTypes, widgetType];

      return allWidgetTypes.filter(type => nextTypes.includes(type));
    });
    setPreviewWidget(null);
    setRequestError(null);
  }

  function handleRemove(widgetId: string) {
    handleWidgetsChange(widgets.filter(widget => widget.id !== widgetId));
  }

  function handleLayoutChange(widgetId: string, layout: DashboardLayout) {
    const hasChanged = widgets.some(widget => widget.id === widgetId && widget.layout !== layout);

    if (!hasChanged) {
      return;
    }

    const nextWidgets = widgets.map(widget => {
      if (widget.id !== widgetId || widget.layout === layout) {
        return widget;
      }

      return {
        ...widget,
        layout,
      };
    });

    handleWidgetsChange(nextWidgets);
  }

  function handleReset() {
    handleWidgetsChange(initialWidgets);
    setPrompt(defaultPrompt);
    setPreviewWidget(null);
    setRequestError(null);
    setIsBuilderOpen(false);
    previewCacheRef.current = null;
  }

  function handleWidgetsChange(nextWidgets: DashboardWidget[]) {
    setWidgets(nextWidgets);
    queuePersistWidgets(nextWidgets);
  }

  function queuePersistWidgets(nextWidgets: DashboardWidget[]) {
    const saveRequestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = saveRequestId;
    setIsSaving(true);

    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        try {
          await saveDashboardLayout({
            variables: {
              layout: buildPersistedDashboardLayout(nextWidgets),
            },
          });

          if (saveRequestIdRef.current === saveRequestId) {
            setDashboardNotice(null);
          }
        } catch (error) {
          console.error('Failed to save business dashboard:', error);

          if (saveRequestIdRef.current === saveRequestId) {
            setDashboardNotice('Unable to save dashboard changes right now.');
          }
        }
      })
      .finally(() => {
        if (saveRequestIdRef.current === saveRequestId) {
          setIsSaving(false);
        }
      });
  }

  return (
    <div ref={pageRef} css={styles.container}>
      <section css={styles.overviewCard}>
        <div css={styles.overviewTopRow}>
          <div css={styles.overviewBody}>
            <Text typography="bodyEmphasized" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
              Custom dashboards
            </Text>
            <Text typography="headline">Build dashboards around your team&apos;s metrics.</Text>
            <Text typography="bodyRegular" color="systemGrayscale70">
              Start with one widget, then expand the page as new questions come up.
            </Text>
          </div>

          {!isEmpty ? (
            <div css={styles.actionRail}>
              <div css={styles.widgetSummaryPanel}>
                <Text typography="bodyEmphasized" color="systemGrayscale60">
                  Layout summary
                </Text>
                <Text typography="titleMedium">{widgets.length} active widget{widgets.length === 1 ? '' : 's'}</Text>
                <Text typography="bodyRegular" color="systemGrayscale60">
                  Add charts or summary widgets as needed, then reset the canvas whenever you want to return to the default view.
                </Text>
              </div>

              <div css={styles.actionRow}>
                <PrimaryButtonSmall onClick={() => openBuilder()} css={styles.primaryAction}>
                  Add widget
                </PrimaryButtonSmall>
                <SecondaryButtonSmall onClick={handleReset} disabled={isGenerating}>
                  Reset canvas
                </SecondaryButtonSmall>
              </div>
            </div>
          ) : null}
        </div>
        {isSaving ? (
          <Text typography="bodyMedium1" color="systemGrayscale60">
            Saving dashboard...
          </Text>
        ) : dashboardNotice ? (
          <Text typography="bodyMedium1" color="systemGrayscale60">
            {dashboardNotice}
          </Text>
        ) : null}
      </section>

      <section css={styles.canvasSection}>
        {isEmpty ? <DashboardEmptyLaunchpad onOpenBuilder={openBuilder} /> : null}

        {!isEmpty ? (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            modifiers={[restrictToPageBounds]}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragCancel={clearDragState}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgets.map(widget => widget.id)} strategy={rectSortingStrategy}>
              <div css={styles.canvasGridShell}>
                {isCanvasDragging ? (
                  <div css={styles.canvasDragGuide} aria-hidden="true">
                    <div css={styles.canvasDragGuideColumn} />
                    <div css={{ ...styles.canvasDragGuideColumn, ...styles.canvasDragGuideColumnDesktop }} />
                  </div>
                ) : null}
                <div ref={canvasGridRef} css={styles.canvasGrid}>
                  {widgets.map(widget => (
                    <DashboardWidgetShell
                      key={widget.id}
                      widget={widget}
                      isDropTarget={dragOverWidgetId === widget.id && activeDragId !== widget.id}
                      onLayoutChange={handleLayoutChange}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>
            </SortableContext>
          </DndContext>
        ) : null}
      </section>

      <DashboardPromptComposer
        isOpen={isBuilderOpen}
        prompt={prompt}
        isGenerating={isGenerating}
        pendingAction={pendingBuilderAction}
        errorMessage={requestError}
        previewWidget={previewWidget}
        promptSuggestions={promptSuggestions}
        supportedWidgets={supportedWidgets}
        selectedWidgetTypes={allowedWidgetTypes}
        onPromptChange={value => {
          setPrompt(value);
          setRequestError(null);
        }}
        onPromptSubmit={handlePromptSubmit}
        onPreviewSubmit={handlePreviewSubmit}
        onPreviewBack={handlePreviewBack}
        onPreviewConfirm={handlePreviewConfirm}
        onPromptSuggestionClick={suggestion => {
          setPrompt(suggestion);
          setRequestError(null);
        }}
        onWidgetTypeToggle={handleAllowedWidgetTypeToggle}
        onClose={() => {
          if (!isGenerating) {
            setPreviewWidget(null);
            setRequestError(null);
            setIsBuilderOpen(false);
          }
        }}
      />
    </div>
  );
}

function getBuilderRequestKey(prompt: string, allowedWidgetTypes: readonly SupportedWidgetDefinition['type'][]) {
  return JSON.stringify({
    prompt,
    allowedWidgetTypes,
  });
}
