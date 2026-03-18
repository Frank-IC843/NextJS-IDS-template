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
  MAX_WIDGETS_PER_DASHBOARD,
  dashboardGenerateResponseSchema,
  type DashboardLayout,
  type DashboardWidgetDraft,
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
  widgets: DashboardWidgetDraft[];
};

interface DashboardContentProps {
  initialWidgets: DashboardWidgetDraft[];
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
  const remainingWidgetCapacity = MAX_WIDGETS_PER_DASHBOARD - widgets.length;
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(initialErrorMessage);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [allowedWidgetTypes, setAllowedWidgetTypes] = useState<SupportedWidgetDefinition['type'][]>(allWidgetTypes);
  const [previewWidgets, setPreviewWidgets] = useState<DashboardWidgetDraft[]>([]);
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
    setPreviewWidgets([]);
    if (typeof nextPrompt === 'string') {
      setPrompt(nextPrompt);
    }
    setIsBuilderOpen(true);
  }

  async function requestGeneratedWidgets(action: BuilderAction) {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setRequestError('Enter a prompt before generating widgets.');
      return null;
    }

    if (allowedWidgetTypes.length === 0) {
      setRequestError('Select at least one widget type for the builder.');
      return null;
    }

    if (remainingWidgetCapacity <= 0) {
      setRequestError(`This dashboard supports up to ${MAX_WIDGETS_PER_DASHBOARD} widgets. Remove one before adding more.`);
      return null;
    }

    const requestKey = getBuilderRequestKey(trimmedPrompt, allowedWidgetTypes);
    const cachedPreview = previewCacheRef.current;

    if (cachedPreview?.requestKey === requestKey) {
      if (cachedPreview.widgets.length > remainingWidgetCapacity) {
        setRequestError(
          `The cached dashboard plan includes ${cachedPreview.widgets.length} widgets, but only ${remainingWidgetCapacity} more fit on this dashboard.`,
        );
        return null;
      }

      setRequestError(null);
      return cachedPreview.widgets;
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
        setRequestError('The dashboard plan response did not match the supported schema.');
        return null;
      }

      if (parsedResponse.data.widgets.length > remainingWidgetCapacity) {
        setRequestError(
          `The AI planned ${parsedResponse.data.widgets.length} widgets, but only ${remainingWidgetCapacity} more fit on this dashboard.`,
        );
        return null;
      }

      if (action === 'preview') {
        previewCacheRef.current = {
          requestKey,
          widgets: parsedResponse.data.widgets,
        };
      }

      return parsedResponse.data.widgets;
    } catch (error) {
      console.error('Dashboard prompt request failed:', error);
      setRequestError('Unable to generate a dashboard plan right now.');
      return null;
    } finally {
      setIsGenerating(false);
      setPendingBuilderAction(null);
    }
  }

  async function handlePromptSubmit() {
    const nextWidgets = await requestGeneratedWidgets('generate');

    if (!nextWidgets) {
      return;
    }

    const hasAddedWidgets = appendWidgets(nextWidgets);

    if (!hasAddedWidgets) {
      return;
    }

    setPreviewWidgets([]);
    setPrompt(defaultPrompt);
    setIsBuilderOpen(false);
  }

  async function handlePreviewSubmit() {
    const nextWidgets = await requestGeneratedWidgets('preview');

    if (!nextWidgets) {
      return;
    }

    setPreviewWidgets(nextWidgets);
  }

  function handlePreviewConfirm() {
    if (previewWidgets.length === 0) {
      return;
    }

    const hasAddedWidgets = appendWidgets(previewWidgets);

    if (!hasAddedWidgets) {
      return;
    }

    setPreviewWidgets([]);
    setPrompt(defaultPrompt);
    setRequestError(null);
    setIsBuilderOpen(false);
  }

  function handlePreviewBack() {
    setPreviewWidgets([]);
  }

  function handleAllowedWidgetTypeToggle(widgetType: SupportedWidgetDefinition['type']) {
    setAllowedWidgetTypes(currentTypes => {
      const nextTypes = currentTypes.includes(widgetType)
        ? currentTypes.filter(currentType => currentType !== widgetType)
        : [...currentTypes, widgetType];

      return allWidgetTypes.filter(type => nextTypes.includes(type));
    });
    setPreviewWidgets([]);
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
    setPreviewWidgets([]);
    setRequestError(null);
    setIsBuilderOpen(false);
    previewCacheRef.current = null;
  }

  function appendWidgets(nextWidgets: DashboardWidgetDraft[]) {
    if (widgets.length + nextWidgets.length > MAX_WIDGETS_PER_DASHBOARD) {
      setRequestError(`This dashboard supports up to ${MAX_WIDGETS_PER_DASHBOARD} widgets. Remove one before adding more.`);
      return false;
    }

    handleWidgetsChange([...widgets, ...nextWidgets]);
    return true;
  }

  function handleWidgetsChange(nextWidgets: DashboardWidgetDraft[]) {
    setWidgets(nextWidgets);
    queuePersistWidgets(nextWidgets);
  }

  function queuePersistWidgets(nextWidgets: DashboardWidgetDraft[]) {
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
              Ask for one chart or a whole dashboard plan. Widgets load their analytics in parallel as soon as they land on the canvas.
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
                  Keep the story focused. This canvas supports up to {MAX_WIDGETS_PER_DASHBOARD} widgets in the current two-column layout.
                </Text>
              </div>

              <div css={styles.actionRow}>
                <PrimaryButtonSmall
                  onClick={() => openBuilder()}
                  css={styles.primaryAction}
                  disabled={remainingWidgetCapacity <= 0}
                >
                  Add widgets
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
        previewWidgets={previewWidgets}
        promptSuggestions={promptSuggestions}
        supportedWidgets={supportedWidgets}
        selectedWidgetTypes={allowedWidgetTypes}
        currentWidgetCount={widgets.length}
        maxWidgetCount={MAX_WIDGETS_PER_DASHBOARD}
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
            setPreviewWidgets([]);
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
