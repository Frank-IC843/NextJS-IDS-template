'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type Modifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { responsive, useTheme } from '@instacart/ids-core';
import { SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { useRef, useState } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import {
  createQuickAddWidget,
  dashboardBuilderHighlights,
} from '@/app/dashboard/dashboard-builder-mocks';
import {
  dashboardGenerateResponseSchema,
  type DashboardWidget,
} from '@/app/dashboard/dashboard-builder-types';
import { DashboardPromptComposer } from '@/app/dashboard/dashboard-prompt-composer';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';
import { DashboardWidgetCard } from '@/app/dashboard/dashboard-widget-card';

const useStyles = () => {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      paddingBottom: '48px',
    },
    overviewCard: {
      display: 'grid',
      gap: '18px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      borderRadius: theme.radius.r12,
      padding: '24px',
      background: businessPalette.canvasGradient,
      boxShadow: '0 12px 40px rgba(17, 24, 39, 0.06)',
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1.15fr) auto',
        alignItems: 'start',
      },
    },
    overviewBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      maxWidth: '760px',
    },
    eyebrow: {
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    badgeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap' as const,
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.elderberryBorder}`,
      backgroundColor: businessPalette.elderberrySoft,
    },
    actionRail: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      minWidth: 0,
      [responsive.up('r')]: {
        alignItems: 'flex-end',
      },
    },
    widgetCountCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '220px',
      padding: '18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
    },
    highlightList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      listStyle: 'none' as const,
      padding: 0,
      margin: 0,
    },
    highlightItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    highlightMarker: {
      width: '10px',
      height: '10px',
      marginTop: '8px',
      flexShrink: 0,
      borderRadius: '999px',
      backgroundColor: businessPalette.blueberry,
    },
    actionRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '12px',
      flexWrap: 'wrap' as const,
    },
    primaryAction: {
      backgroundColor: businessPalette.elderberry,
      borderColor: businessPalette.elderberry,
      color: theme.colors.systemGrayscale00,
      '&:hover': {
        backgroundColor: businessPalette.elderberryDark,
        borderColor: businessPalette.elderberryDark,
      },
    },
    canvasSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
    },
    canvasHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      [responsive.up('r')]: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    },
    canvasTitleGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '760px',
    },
    canvasMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap' as const,
    },
    statusPill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '999px',
      backgroundColor: businessPalette.blueberrySoft,
      border: `1px solid ${businessPalette.blueberryBorder}`,
    },
    lastPromptCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '16px 18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.elderberryBorder}`,
      backgroundColor: businessPalette.elderberrySoft,
    },
    canvasGrid: {
      display: 'grid',
      gap: '18px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'flex-start',
      padding: '24px',
      border: `1px dashed ${businessPalette.blueberryBorder}`,
      borderRadius: theme.radius.r12,
      background: businessPalette.canvasGradient,
    },
  } as const;
};

interface DashboardContentProps {
  initialWidgets: DashboardWidget[];
  promptSuggestions: string[];
  supportedWidgets: SupportedWidgetDefinition[];
}

export function DashboardContent({ initialWidgets, promptSuggestions, supportedWidgets }: DashboardContentProps) {
  const styles = useStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const defaultPrompt = promptSuggestions[0] ?? '';
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [widgets, setWidgets] = useState(initialWidgets);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const restrictToPageBounds: Modifier = ({ draggingNodeRect, activeNodeRect, transform }) => {
    const pageRect = pageRef.current?.getBoundingClientRect();
    const nodeRect = draggingNodeRect ?? activeNodeRect;

    if (!pageRect || !nodeRect) {
      return transform;
    }

    let x = transform.x;
    let y = transform.y;

    const nextLeft = nodeRect.left + x;
    const nextRight = nodeRect.right + x;
    const nextTop = nodeRect.top + y;
    const nextBottom = nodeRect.bottom + y;

    if (nextLeft < pageRect.left) {
      x += pageRect.left - nextLeft;
    }

    if (nextRight > pageRect.right) {
      x -= nextRight - pageRect.right;
    }

    if (nextTop < pageRect.top) {
      y += pageRect.top - nextTop;
    }

    if (nextBottom > pageRect.bottom) {
      y -= nextBottom - pageRect.bottom;
    }

    return {
      ...transform,
      x,
      y,
    };
  };

  function openBuilder() {
    setRequestError(null);
    setIsBuilderOpen(true);
  }

  async function handlePromptSubmit() {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setRequestError('Enter a prompt before generating widgets.');
      return;
    }

    setIsGenerating(true);
    setRequestError(null);

    try {
      const response = await fetch('/api/dashboard/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setRequestError(typeof payload?.error === 'string' ? payload.error : 'Unable to generate a widget right now.');
        return;
      }

      const parsedResponse = dashboardGenerateResponseSchema.safeParse(payload);

      if (!parsedResponse.success) {
        setRequestError('The widget response did not match the supported schema.');
        return;
      }

      setWidgets(currentWidgets => [...currentWidgets, parsedResponse.data.widget]);
      setLastPrompt(trimmedPrompt);
      setPrompt(defaultPrompt);
      setIsBuilderOpen(false);
    } catch (error) {
      console.error('Dashboard prompt request failed:', error);
      setRequestError('Unable to generate a widget right now.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleQuickAdd(widgetType: SupportedWidgetDefinition['type']) {
    setWidgets(currentWidgets => [...currentWidgets, createQuickAddWidget(widgetType)]);
    setRequestError(null);
    setIsBuilderOpen(false);
  }

  function handleRemove(widgetId: string) {
    setWidgets(currentWidgets => currentWidgets.filter(widget => widget.id !== widgetId));
  }

  function handleReset() {
    setWidgets(initialWidgets);
    setPrompt(defaultPrompt);
    setRequestError(null);
    setLastPrompt(null);
    setIsBuilderOpen(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setWidgets(currentWidgets => {
      const oldIndex = currentWidgets.findIndex(widget => widget.id === active.id);
      const newIndex = currentWidgets.findIndex(widget => widget.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return currentWidgets;
      }

      return arrayMove(currentWidgets, oldIndex, newIndex);
    });
  }

  return (
    <div ref={pageRef} css={styles.container}>
      <section css={styles.overviewCard}>
        <div css={styles.overviewBody}>
          <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
            Custom dashboards
          </Text>
          <Text typography="headline">Build dashboards around the metrics your team tracks.</Text>
          <Text typography="bodyLarge2" color="systemGrayscale70">
            Create tailored dashboard views with curated chart types, natural-language requests, and a flexible layout that can be
            arranged to match how your team reviews performance.
          </Text>

          <div css={styles.badgeRow}>
            <div css={styles.badge}>
              <Text typography="bodyEmphasized" css={{ color: businessPalette.elderberryDark }}>
                Natural language
              </Text>
            </div>
            <div css={styles.badge}>
              <Text typography="bodyEmphasized" css={{ color: businessPalette.elderberryDark }}>
                Curated visualizations
              </Text>
            </div>
            <div css={styles.badge}>
              <Text typography="bodyEmphasized" css={{ color: businessPalette.elderberryDark }}>
                Flexible layout
              </Text>
            </div>
          </div>

          <ul css={styles.highlightList}>
            {dashboardBuilderHighlights.map(highlight => (
              <li key={highlight} css={styles.highlightItem}>
                <div css={styles.highlightMarker} />
                <Text typography="bodyRegular" color="systemGrayscale70">
                  {highlight}
                </Text>
              </li>
            ))}
          </ul>

        </div>

        <div css={styles.actionRail}>
          <div css={styles.widgetCountCard}>
            <Text typography="bodySmall1" color="systemGrayscale60">
              Layout summary
            </Text>
            <Text typography="titleMedium">{widgets.length} active widget{widgets.length === 1 ? '' : 's'}</Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              Add charts or summary cards as needed, then reset the canvas whenever you want to return to the default view.
            </Text>
          </div>

          <div css={styles.actionRow}>
            <PrimaryButtonSmall onClick={openBuilder} css={styles.primaryAction}>
              Add widget
            </PrimaryButtonSmall>
            <SecondaryButtonSmall onClick={handleReset} disabled={isGenerating}>
              Reset canvas
            </SecondaryButtonSmall>
          </div>
        </div>
      </section>

      <section css={styles.canvasSection}>
        <div css={styles.canvasHeader}>
          <div css={styles.canvasTitleGroup}>
            <Text typography="titleMedium">Dashboard canvas</Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              Arrange cards to match how your team reads the page, from headline KPIs to deeper category and location analysis.
            </Text>
          </div>
        </div>

        {lastPrompt ? (
          <div css={styles.lastPromptCard}>
            <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
              Most recent request
            </Text>
            <Text typography="bodyRegular" color="systemGrayscale70">
              &ldquo;{lastPrompt}&rdquo;
            </Text>
          </div>
        ) : null}

        {widgets.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToPageBounds]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgets.map(widget => widget.id)} strategy={rectSortingStrategy}>
              <div css={styles.canvasGrid}>
                {widgets.map(widget => (
                  <DashboardWidgetCard key={widget.id} widget={widget} onRemove={handleRemove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div css={styles.emptyState}>
            <Text typography="titleMedium">Start building this dashboard.</Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              Add a metric, chart, or summary card to create the first view for this dashboard.
            </Text>
            <PrimaryButtonSmall onClick={openBuilder} css={styles.primaryAction}>
              Add your first widget
            </PrimaryButtonSmall>
          </div>
        )}
      </section>

      <DashboardPromptComposer
        isOpen={isBuilderOpen}
        prompt={prompt}
        isGenerating={isGenerating}
        errorMessage={requestError}
        promptSuggestions={promptSuggestions}
        supportedWidgets={supportedWidgets}
        onPromptChange={setPrompt}
        onPromptSubmit={handlePromptSubmit}
        onPromptSuggestionClick={suggestion => {
          setPrompt(suggestion);
          setRequestError(null);
        }}
        onQuickAdd={handleQuickAdd}
        onClose={() => {
          if (!isGenerating) {
            setIsBuilderOpen(false);
          }
        }}
      />
    </div>
  );
}
