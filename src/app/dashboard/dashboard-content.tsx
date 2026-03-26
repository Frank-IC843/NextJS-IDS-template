'use client';

import { DndContext } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useTheme } from '@instacart/ids-core';
import { SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { useRef, useState } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import {
  dashboardGenerateResponseSchema,
  MAX_SAVED_DASHBOARD_HISTORY,
  MAX_WIDGETS_PER_DASHBOARD,
  savedDashboardResponseSchema,
  savedDashboardSummaryResponseSchema,
  type DashboardLayout,
  type SavedDashboardSummary,
  type DashboardWidgetDraft,
} from '@/app/dashboard/dashboard-builder-types';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { DashboardConfirmModal } from '@/app/dashboard/dashboard-confirm-modal';
import { useDashboardContentStyles } from '@/app/dashboard/dashboard-content-styles';
import { DashboardEmptyLaunchpad } from '@/app/dashboard/dashboard-empty-launchpad';
import { DashboardLibraryModal } from '@/app/dashboard/dashboard-library-modal';
import { DashboardPromptComposer } from '@/app/dashboard/dashboard-prompt-composer';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';
import { DashboardWidgetShell } from '@/app/dashboard/dashboard-widget-shell';
import { useDashboardCanvasDnd } from '@/app/dashboard/use-dashboard-canvas-dnd';

type BuilderAction = 'generate' | 'preview';
type PreviewCacheEntry = {
  requestKey: string;
  widgets: DashboardWidgetDraft[];
};

type DashboardConfirmationState =
  | {
      kind: 'reset';
    }
  | {
      kind: 'load';
      dashboardId: string;
      dashboardName: string;
    }
  | {
      kind: 'remove';
      widgetId: string;
      widgetTitle: string;
    };

interface DashboardContentProps {
  initialWidgets: DashboardWidgetDraft[];
  initialSavedDashboards: SavedDashboardSummary[];
  initialErrorMessage?: string | null;
  promptSuggestions: string[];
  supportedWidgets: SupportedWidgetDefinition[];
}

export function DashboardContent({
  initialWidgets,
  initialSavedDashboards,
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
  const previewCacheRef = useRef<PreviewCacheEntry | null>(null);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [savedDashboards, setSavedDashboards] = useState(initialSavedDashboards);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(initialErrorMessage);
  const [prompt, setPrompt] = useState('');
  const [saveName, setSaveName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDashboard, setIsSavingDashboard] = useState(false);
  const [loadingDashboardId, setLoadingDashboardId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isDashboardLibraryOpen, setIsDashboardLibraryOpen] = useState(false);
  const [allowedWidgetTypes, setAllowedWidgetTypes] = useState<SupportedWidgetDefinition['type'][]>(allWidgetTypes);
  const [previewWidgets, setPreviewWidgets] = useState<DashboardWidgetDraft[]>([]);
  const [pendingBuilderAction, setPendingBuilderAction] = useState<BuilderAction | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<DashboardConfirmationState | null>(null);
  const remainingWidgetCapacity = MAX_WIDGETS_PER_DASHBOARD - widgets.length;
  const isEmpty = widgets.length === 0;
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

  function handleWidgetsChange(nextWidgets: DashboardWidgetDraft[]) {
    setWidgets(nextWidgets);
    setDashboardNotice(null);
    previewCacheRef.current = null;
  }

  function openBuilder(nextPrompt?: string) {
    setRequestError(null);
    setPreviewWidgets([]);
    setPrompt(typeof nextPrompt === 'string' ? nextPrompt : '');
    setIsBuilderOpen(true);
  }

  function closeBuilder() {
    setIsBuilderOpen(false);
    setPreviewWidgets([]);
    setRequestError(null);
  }

  function openDashboardLibrary() {
    setIsDashboardLibraryOpen(true);
  }

  function closeDashboardLibrary() {
    setIsDashboardLibraryOpen(false);
  }

  async function handleSaveDashboard() {
    if (widgets.length === 0) {
      setDashboardNotice('Add at least one widget before saving this dashboard.');
      return;
    }

    setIsSavingDashboard(true);
    setDashboardNotice(null);

    try {
      const response = await fetch('/api/dashboard/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: saveName.trim() || undefined,
          widgets,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setDashboardNotice(typeof payload?.error === 'string' ? payload.error : 'Unable to save this dashboard right now.');
        return;
      }

      const parsedPayload = savedDashboardSummaryResponseSchema.safeParse(payload);

      if (!parsedPayload.success) {
        setDashboardNotice('The saved dashboard response did not match the expected schema.');
        return;
      }

      setSavedDashboards(currentDashboards => [
        parsedPayload.data.dashboard,
        ...currentDashboards.filter(dashboard => dashboard.id !== parsedPayload.data.dashboard.id),
      ].slice(0, MAX_SAVED_DASHBOARD_HISTORY));
      setSaveName('');
      setDashboardNotice(`Saved "${parsedPayload.data.dashboard.name}" to local dashboard history.`);
    } catch (error) {
      console.error('[dashboard-content] Saving dashboard failed:', error);
      setDashboardNotice('Unable to save this dashboard right now.');
    } finally {
      setIsSavingDashboard(false);
    }
  }

  async function loadSavedDashboard(dashboardId: string) {
    setLoadingDashboardId(dashboardId);
    setDashboardNotice(null);

    try {
      const response = await fetch(`/api/dashboard/saved/${dashboardId}`);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setDashboardNotice(typeof payload?.error === 'string' ? payload.error : 'Unable to load this saved dashboard right now.');
        return;
      }

      const parsedPayload = savedDashboardResponseSchema.safeParse(payload);

      if (!parsedPayload.success) {
        setDashboardNotice('The saved dashboard payload did not match the expected schema.');
        return;
      }

      handleWidgetsChange(parsedPayload.data.dashboard.widgets);
      setPrompt('');
      setPreviewWidgets([]);
      setRequestError(null);
      setIsBuilderOpen(false);
      setIsDashboardLibraryOpen(false);
      setSaveName(parsedPayload.data.dashboard.name);
      setDashboardNotice(`Loaded "${parsedPayload.data.dashboard.name}" from local dashboard history.`);
    } catch (error) {
      console.error('[dashboard-content] Loading dashboard failed:', error);
      setDashboardNotice('Unable to load this saved dashboard right now.');
    } finally {
      setLoadingDashboardId(null);
    }
  }

  function handleLoadDashboardRequest(dashboard: SavedDashboardSummary) {
    if (widgets.length === 0) {
      setIsDashboardLibraryOpen(false);
      void loadSavedDashboard(dashboard.id);
      return;
    }

    setIsDashboardLibraryOpen(false);
    setPendingConfirmation({
      kind: 'load',
      dashboardId: dashboard.id,
      dashboardName: dashboard.name,
    });
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
      setRequestError(`This canvas supports up to ${MAX_WIDGETS_PER_DASHBOARD} widgets. Remove one before adding more.`);
      return null;
    }

    const requestKey = getBuilderRequestKey(trimmedPrompt, allowedWidgetTypes);
    const cachedPreview = previewCacheRef.current;

    if (cachedPreview?.requestKey === requestKey) {
      if (cachedPreview.widgets.length > remainingWidgetCapacity) {
        setRequestError(
          `The cached plan includes ${cachedPreview.widgets.length} widgets, but only ${remainingWidgetCapacity} more fit on this canvas.`,
        );
        return null;
      }

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
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setRequestError(typeof payload?.error === 'string' ? payload.error : 'Unable to generate a widget plan right now.');
        return null;
      }

      const parsedPayload = dashboardGenerateResponseSchema.safeParse(payload);

      if (!parsedPayload.success) {
        setRequestError('The Medusa widget plan did not match the expected schema.');
        return null;
      }

      if (parsedPayload.data.widgets.length > remainingWidgetCapacity) {
        setRequestError(
          `The planner returned ${parsedPayload.data.widgets.length} widgets, but only ${remainingWidgetCapacity} more fit on this canvas.`,
        );
        return null;
      }

      previewCacheRef.current = {
        requestKey,
        widgets: parsedPayload.data.widgets,
      };

      return parsedPayload.data.widgets;
    } catch (error) {
      console.error('[dashboard-content] Widget planner failed:', error);
      setRequestError('Unable to generate a widget plan right now.');
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

    handleWidgetsChange([...widgets, ...nextWidgets]);
    setPrompt('');
    closeBuilder();
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

    handleWidgetsChange([...widgets, ...previewWidgets]);
    setPrompt('');
    closeBuilder();
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
    previewCacheRef.current = null;
  }

  function handlePromptSuggestionClick(suggestion: string) {
    setPrompt(suggestion);
    setRequestError(null);
    setPreviewWidgets([]);
  }

  function handleRemove(widgetId: string) {
    const widget = widgets.find(currentWidget => currentWidget.id === widgetId);

    if (!widget) {
      return;
    }

    setPendingConfirmation({
      kind: 'remove',
      widgetId,
      widgetTitle: widget.title,
    });
  }

  function handleLayoutChange(widgetId: string, layout: DashboardLayout) {
    const nextWidgets = widgets.map(widget => (widget.id === widgetId ? { ...widget, layout } : widget));
    handleWidgetsChange(nextWidgets);
  }

  function handleResetRequest() {
    if (widgets.length === 0) {
      return;
    }

    setPendingConfirmation({ kind: 'reset' });
  }

  function resetCanvas() {
    handleWidgetsChange([]);
    setDashboardNotice(null);
    setPrompt('');
    setPreviewWidgets([]);
    setRequestError(null);
    setIsBuilderOpen(false);
  }

  function handleConfirmDangerAction() {
    if (!pendingConfirmation) {
      return;
    }

    if (pendingConfirmation.kind === 'load') {
      void loadSavedDashboard(pendingConfirmation.dashboardId);
      setPendingConfirmation(null);
      return;
    }

    if (pendingConfirmation.kind === 'reset') {
      resetCanvas();
      setPendingConfirmation(null);
      return;
    }

    handleWidgetsChange(widgets.filter(widget => widget.id !== pendingConfirmation.widgetId));
    setPendingConfirmation(null);
  }

  return (
    <div ref={pageRef} css={styles.container}>
      <section css={styles.overviewCard}>
        <div css={styles.overviewTopRow}>
          <div css={styles.overviewBody}>
            <Text typography="bodyEmphasized" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
              Medusa Dashboard MVP
            </Text>
            <Text typography="headline">Build PM and sales widgets from natural language, then run them through Medusa.</Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              This canvas keeps widget planning in the dashboard flow and sends every widget refresh through the Next.js
              backend. Ready catalog questions execute now, while coverage gaps stay visible as first-class widgets.
            </Text>
            <div css={styles.actionRow}>
              <PrimaryButtonSmall onClick={() => openBuilder()}>Build widgets</PrimaryButtonSmall>
              <SecondaryButtonSmall onClick={openDashboardLibrary}>
                Dashboard library{savedDashboards.length > 0 ? ` (${savedDashboards.length})` : ''}
              </SecondaryButtonSmall>
              <SecondaryButtonSmall onClick={handleResetRequest} disabled={widgets.length === 0}>
                Reset canvas
              </SecondaryButtonSmall>
            </div>
          </div>

          <div css={styles.actionRail}>
            <div css={styles.previewFeatureCard}>
              <Text typography="bodyEmphasized">Canvas status</Text>
              <div css={styles.previewMiniGrid}>
                <div css={styles.previewMiniCard}>
                  <Text typography="bodyMedium1" color="systemGrayscale60">
                    Widgets on canvas
                  </Text>
                  <Text typography="headline" css={styles.previewValue}>
                    {widgets.length} / {MAX_WIDGETS_PER_DASHBOARD}
                  </Text>
                </div>
                <div css={styles.previewMiniCard}>
                  <Text typography="bodyMedium1" color="systemGrayscale60">
                    Widget types enabled
                  </Text>
                  <Text typography="headline" css={styles.previewValue}>
                    {allowedWidgetTypes.length}
                  </Text>
                </div>
              </div>
              <div css={styles.previewBadge}>
                <Text typography="bodyMedium1" css={{ color: businessPalette.elderberryDark }}>
                  Coverage gaps stay on the canvas instead of failing the whole dashboard.
                </Text>
              </div>
              <div css={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Text typography="bodyMedium1" color="systemGrayscale60">
                  Local history
                </Text>
                <Text typography="bodyEmphasized">
                  {savedDashboards.length} saved dashboard{savedDashboards.length === 1 ? '' : 's'}
                </Text>
                <div css={{ display: 'flex', width: '100%', paddingTop: '4px' }}>
                  <SecondaryButtonSmall onClick={openDashboardLibrary} fullWidth>
                    {savedDashboards.length > 0 ? 'Manage saved dashboards' : 'Open dashboard library'}
                  </SecondaryButtonSmall>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {dashboardNotice ? (
        <section
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '14px 16px',
            borderRadius: theme.radius.r12,
            border: `1px solid ${businessPalette.blueberryBorder}`,
            backgroundColor: theme.colors.systemGrayscale00,
          }}
        >
          <Text typography="bodyEmphasized">Dashboard notice</Text>
          <Text typography="bodyRegular" color="systemGrayscale60">
            {dashboardNotice}
          </Text>
        </section>
      ) : null}

      <section css={styles.canvasSection}>
        {isEmpty ? (
          <DashboardEmptyLaunchpad onOpenBuilder={openBuilder} />
        ) : (
          <>
            <div css={styles.canvasHeader}>
              <div css={styles.canvasTitleGroup}>
                <Text typography="titleLarge">Widget canvas</Text>
                <Text typography="bodyRegular" color="systemGrayscale60">
                  Reorder widgets, resize them between half and full width, and keep both successful Medusa widgets and
                  coverage-gap widgets in the same dashboard.
                </Text>
              </div>
              <PrimaryButtonSmall onClick={() => openBuilder()}>Add more widgets</PrimaryButtonSmall>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetectionStrategy}
              modifiers={[restrictToPageBounds]}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={clearDragState}
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
                        isDropTarget={Boolean(activeDragId && dragOverWidgetId === widget.id && activeDragId !== widget.id)}
                        onLayoutChange={handleLayoutChange}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
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
        onPromptChange={setPrompt}
        onPromptSubmit={handlePromptSubmit}
        onPreviewSubmit={handlePreviewSubmit}
        onPreviewBack={handlePreviewBack}
        onPreviewConfirm={handlePreviewConfirm}
        onPromptSuggestionClick={handlePromptSuggestionClick}
        onWidgetTypeToggle={handleAllowedWidgetTypeToggle}
        onClose={closeBuilder}
      />

      <DashboardLibraryModal
        isOpen={isDashboardLibraryOpen}
        widgets={widgets}
        saveName={saveName}
        savedDashboards={savedDashboards}
        isSavingDashboard={isSavingDashboard}
        loadingDashboardId={loadingDashboardId}
        onSaveNameChange={setSaveName}
        onSaveDashboard={handleSaveDashboard}
        onLoadDashboardRequest={handleLoadDashboardRequest}
        onClose={closeDashboardLibrary}
      />

      {pendingConfirmation ? (
        <DashboardConfirmModal
          title={
            pendingConfirmation.kind === 'reset'
              ? 'Reset canvas?'
              : pendingConfirmation.kind === 'load'
                ? `Load "${pendingConfirmation.dashboardName}"?`
                : `Remove "${pendingConfirmation.widgetTitle}"?`
          }
          description={
            pendingConfirmation.kind === 'reset'
              ? 'This clears the current Medusa widget canvas. Any locally saved dashboards stay available in history.'
              : pendingConfirmation.kind === 'load'
                ? 'This replaces the current canvas with the saved widget structure from local dashboard history.'
                : 'This removes the widget from the current canvas only.'
          }
          confirmLabel={
            pendingConfirmation.kind === 'reset'
              ? 'Reset canvas'
              : pendingConfirmation.kind === 'load'
                ? 'Load dashboard'
                : 'Remove widget'
          }
          onConfirm={handleConfirmDangerAction}
          onClose={() => setPendingConfirmation(null)}
        />
      ) : null}
    </div>
  );
}

function getBuilderRequestKey(prompt: string, allowedWidgetTypes: SupportedWidgetDefinition['type'][]) {
  return JSON.stringify({
    prompt,
    allowedWidgetTypes,
  });
}
