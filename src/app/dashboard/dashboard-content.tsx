'use client';

import { useMutation } from '@apollo/client';
import { DndContext } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useTheme } from '@instacart/ids-core';
import { DetrimentalButtonSmall, SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type {
  CreateOrUpdateBusinessDashboardMutation,
  CreateOrUpdateBusinessDashboardMutationVariables,
} from '@/__generated__/graphql-types';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import {
  MAX_WIDGETS_PER_DASHBOARD,
  persistedDashboardLayoutSchema,
  type DashboardLayout,
  type DashboardWidgetDraft,
} from '@/app/dashboard/dashboard-builder-types';
import { useDashboardContentStyles } from '@/app/dashboard/dashboard-content-styles';
import { DashboardEmptyLaunchpad } from '@/app/dashboard/dashboard-empty-launchpad';
import { DashboardPromptComposer } from '@/app/dashboard/dashboard-prompt-composer';
import {
  type DashboardReportSkippedWidget,
  type DashboardReportWidgetState,
} from '@/app/dashboard/dashboard-report-types';
import { CREATE_OR_UPDATE_BUSINESS_DASHBOARD_MUTATION } from '@/app/dashboard/queries';
import { buildPersistedDashboardLayout, getDashboardWidgetDraftsFromLayout } from '@/app/dashboard/dashboard-schema';
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
  const [reportWidgetStates, setReportWidgetStates] = useState<Record<string, DashboardReportWidgetState>>(() =>
    buildInitialReportWidgetStates(initialWidgets),
  );
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [reportErrorMessage, setReportErrorMessage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [allowedWidgetTypes, setAllowedWidgetTypes] = useState<SupportedWidgetDefinition['type'][]>(allWidgetTypes);
  const [previewWidgets, setPreviewWidgets] = useState<DashboardWidgetDraft[]>([]);
  const [pendingBuilderAction, setPendingBuilderAction] = useState<BuilderAction | null>(null);
  const previewCacheRef = useRef<PreviewCacheEntry | null>(null);
  const readyReportWidgets = widgets.flatMap(widget => {
    const reportState = reportWidgetStates[widget.id];

    return reportState?.status === 'ready' ? [reportState.context] : [];
  });
  const reportLoadingCount = widgets.filter(widget => {
    const reportState = reportWidgetStates[widget.id];

    return !reportState || reportState.status === 'loading';
  }).length;
  const reportSkippedWidgets = widgets.flatMap<DashboardReportSkippedWidget>(widget => {
    const reportState = reportWidgetStates[widget.id];

    return reportState?.status === 'error'
      ? [
          {
            id: widget.id,
            title: widget.title,
            reason: 'error',
            detail: reportState.detail,
          },
        ]
      : [];
  });
  const dashboardPrompt = widgets.find(widget => widget.prompt?.trim())?.prompt?.trim();
  const canGenerateReport = !isGenerating && !isReportGenerating && reportLoadingCount === 0 && readyReportWidgets.length > 0;
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
    setPrompt(typeof nextPrompt === 'string' ? nextPrompt : '');
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

      const parsedResponse = persistedDashboardLayoutSchema.safeParse(payload?.layout);

      if (!parsedResponse.success) {
        setRequestError('The dashboard plan response did not match the backend layout schema.');
        return null;
      }

      const { layout, drafts } = getDashboardWidgetDraftsFromLayout(parsedResponse.data);

      if (!layout) {
        setRequestError('The AI returned an invalid dashboard layout.');
        return null;
      }

      if (drafts.length > remainingWidgetCapacity) {
        setRequestError(
          `The AI planned ${drafts.length} widgets, but only ${remainingWidgetCapacity} more fit on this dashboard.`,
        );
        return null;
      }

      if (action === 'preview') {
        previewCacheRef.current = {
          requestKey,
          widgets: drafts,
        };
      }

      return drafts;
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

    if (widgets.length + nextWidgets.length > MAX_WIDGETS_PER_DASHBOARD) {
      setRequestError(`This dashboard supports up to ${MAX_WIDGETS_PER_DASHBOARD} widgets. Remove one before adding more.`);
      return;
    }

    flushSync(() => {
      setPreviewWidgets([]);
      setPrompt('');
      setRequestError(null);
      setIsBuilderOpen(false);
    });

    handleWidgetsChange([...widgets, ...nextWidgets]);
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

    if (widgets.length + previewWidgets.length > MAX_WIDGETS_PER_DASHBOARD) {
      setRequestError(`This dashboard supports up to ${MAX_WIDGETS_PER_DASHBOARD} widgets. Remove one before adding more.`);
      return;
    }

    flushSync(() => {
      setPreviewWidgets([]);
      setPrompt('');
      setRequestError(null);
      setIsBuilderOpen(false);
    });

    handleWidgetsChange([...widgets, ...previewWidgets]);
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
    handleWidgetsChange([]);
    setDashboardNotice(null);
    setReportErrorMessage(null);
    setPrompt('');
    setPreviewWidgets([]);
    setRequestError(null);
    setIsBuilderOpen(false);
    previewCacheRef.current = null;
  }

  async function handleGenerateReport() {
    if (!canGenerateReport) {
      return;
    }

    setIsReportGenerating(true);
    setReportErrorMessage(null);

    try {
      const response = await fetch('/api/dashboard/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(dashboardPrompt ? { dashboardPrompt } : {}),
          widgets: readyReportWidgets,
          skippedWidgets: reportSkippedWidgets,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Unable to generate a dashboard report right now.';
        const contentType = response.headers.get('content-type') ?? '';

        if (contentType.includes('application/json')) {
          const payload = await response.json();
          errorMessage = typeof payload?.error === 'string' ? payload.error : errorMessage;
        }

        setReportErrorMessage(errorMessage);
        return;
      }

      const pdfBlob = await response.blob();
      const filename = getFilenameFromContentDisposition(response.headers.get('content-disposition')) ?? buildReportDownloadFilename();

      downloadBlob(pdfBlob, filename);
    } catch (error) {
      console.error('Dashboard report request failed:', error);
      setReportErrorMessage('Unable to generate a dashboard report right now.');
    } finally {
      setIsReportGenerating(false);
    }
  }

  function handleWidgetsChange(nextWidgets: DashboardWidgetDraft[]) {
    setReportErrorMessage(null);
    setReportWidgetStates(currentStates => reconcileReportWidgetStates(currentStates, nextWidgets));
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

  const reportStatusMessage =
    reportLoadingCount > 0
      ? `Report generation unlocks after ${reportLoadingCount} more dashboard view${reportLoadingCount === 1 ? '' : 's'} finish loading.`
      : reportSkippedWidgets.length > 0
        ? `${reportSkippedWidgets.length} dashboard view${reportSkippedWidgets.length === 1 ? '' : 's'} failed to load and will be called out as incomplete coverage in the PDF.`
        : null;
  const statusMessage = reportErrorMessage ?? dashboardNotice ?? reportStatusMessage;

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
                  disabled={remainingWidgetCapacity <= 0 || isReportGenerating}
                >
                  Add widgets
                </PrimaryButtonSmall>
                <SecondaryButtonSmall onClick={() => void handleGenerateReport()} disabled={!canGenerateReport}>
                  {getReportActionLabel({ isGenerating: isReportGenerating })}
                </SecondaryButtonSmall>
                <DetrimentalButtonSmall onClick={handleReset} disabled={isGenerating || isReportGenerating}>
                  Reset canvas
                </DetrimentalButtonSmall>
              </div>
            </div>
          ) : null}
        </div>
        {isSaving ? (
          <Text typography="bodyMedium1" color="systemGrayscale60">
            Saving dashboard...
          </Text>
        ) : statusMessage ? (
          <div>
            <Text typography="bodyMedium1" color="systemGrayscale60">
              {statusMessage}
            </Text>
          </div>
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
                      setReportWidgetStates={setReportWidgetStates}
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

function buildInitialReportWidgetStates(widgets: DashboardWidgetDraft[]) {
  return Object.fromEntries(widgets.map(widget => [widget.id, buildLoadingReportWidgetState(widget)]));
}

function reconcileReportWidgetStates(
  currentStates: Record<string, DashboardReportWidgetState>,
  nextWidgets: DashboardWidgetDraft[],
) {
  return Object.fromEntries(
    nextWidgets.map(widget => {
      const currentState = currentStates[widget.id];

      return [widget.id, currentState ?? buildLoadingReportWidgetState(widget)];
    }),
  );
}

function buildLoadingReportWidgetState(widget: DashboardWidgetDraft): DashboardReportWidgetState {
  return {
    status: 'loading',
    widgetId: widget.id,
    title: widget.title,
  };
}

function getReportActionLabel({ isGenerating }: { isGenerating: boolean }) {
  if (isGenerating) {
    return 'Generating Report...';
  }

  return 'Generate report';
}

function buildReportDownloadFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `business-intelligence-report-${year}-${month}-${day}.pdf`;
}

function getFilenameFromContentDisposition(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null;
  }

  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

  return filenameMatch?.[1] ?? null;
}

function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 0);
}
