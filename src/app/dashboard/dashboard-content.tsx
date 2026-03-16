'use client';

import { keyframes } from '@emotion/react';
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
import { ButtonBase, SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { useEffect, useRef, useState } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { createQuickAddWidget } from '@/app/dashboard/dashboard-builder-mocks';
import {
  dashboardGenerateResponseSchema,
  type DashboardWidget,
} from '@/app/dashboard/dashboard-builder-types';
import { DashboardPromptComposer } from '@/app/dashboard/dashboard-prompt-composer';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';
import { DashboardWidgetShell } from '@/app/dashboard/dashboard-widget-shell';

const HERO_CAROUSEL_AUTOPLAY_MS = 4800;

const heroCarouselEnter = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 14px, 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const heroCarouselFloat = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -8px, 0);
  }
`;

const heroCarouselPulse = keyframes`
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.06);
  }
`;

const heroCarouselProgress = keyframes`
  0% {
    transform: scaleX(0);
    opacity: 0.55;
  }

  100% {
    transform: scaleX(1);
    opacity: 1;
  }
`;

const heroCarouselSteps = [
  {
    id: 'choose',
    stepLabel: '01',
    navLabel: 'Pick',
    title: 'Pick the widget type.',
    description: 'Start with the KPI, trend, or breakdown your team wants to see first.',
    prompt: 'Add a metric widget for total spend this month.',
  },
  {
    id: 'describe',
    stepLabel: '02',
    navLabel: 'Describe',
    title: 'Describe the ask.',
    description: 'Write a short request and the builder shapes a focused widget for the page.',
    prompt: 'Add a line chart showing order volume over the last 8 weeks.',
  },
  {
    id: 'arrange',
    stepLabel: '03',
    navLabel: 'Arrange',
    title: 'Arrange the flow.',
    description: 'Place the widget, then drag to refine the review order as the page grows.',
    prompt: 'Add an insight list summarizing budget pacing this quarter.',
  },
] as const;

type HeroCarouselStepId = (typeof heroCarouselSteps)[number]['id'];

const useStyles = () => {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      paddingBottom: '48px',
      overflowX: 'hidden' as const,
    },
    overviewCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      borderRadius: theme.radius.r12,
      padding: '18px 20px',
      background: businessPalette.canvasGradient,
      boxShadow: '0 18px 48px rgba(17, 24, 39, 0.08)',
    },
    overviewTopRow: {
      display: 'grid',
      gap: '16px',
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 360px)',
        alignItems: 'stretch',
      },
    },
    overviewBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '720px',
    },
    eyebrow: {
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    actionRail: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minWidth: 0,
      [responsive.up('r')]: {
        width: '100%',
      },
    },
    heroCarousel: {
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      minWidth: 0,
      minHeight: '244px',
      padding: '16px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background:
        'linear-gradient(135deg, rgba(110, 72, 229, 0.08) 0%, rgba(43, 120, 198, 0.05) 38%, rgba(255, 255, 255, 0.98) 100%)',
      boxShadow: '0 14px 32px rgba(17, 24, 39, 0.06)',
      overflow: 'hidden' as const,
    },
    heroCarouselHeader: {
      position: 'relative' as const,
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    },
    heroCarouselBody: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      minWidth: 0,
    },
    heroCarouselCopy: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      gap: '8px',
      minWidth: 0,
      minHeight: '120px',
    },
    heroCarouselStepBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      padding: '6px 10px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.elderberryBorder}`,
      backgroundColor: 'rgba(255, 255, 255, 0.76)',
    },
    heroCarouselActions: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    heroCarouselStage: {
      position: 'relative' as const,
      height: '110px',
      minWidth: 0,
      borderRadius: theme.radius.r12,
      border: `1px solid rgba(43, 120, 198, 0.18)`,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.96) 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      overflow: 'hidden' as const,
      padding: '12px',
    },
    heroCarouselStageInner: {
      position: 'relative' as const,
      width: '100%',
      height: '100%',
    },
    heroCarouselStageGlow: {
      position: 'absolute' as const,
      width: '180px',
      height: '180px',
      borderRadius: '999px',
      filter: 'blur(10px)',
      opacity: 0.7,
      animation: `${heroCarouselPulse} 6s ease-in-out infinite`,
    },
    heroCarouselFloatingBadge: {
      position: 'absolute' as const,
      display: 'inline-flex',
      alignItems: 'center',
      padding: '7px 10px',
      borderRadius: '999px',
      border: `1px solid rgba(110, 72, 229, 0.22)`,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      boxShadow: '0 14px 30px rgba(17, 24, 39, 0.08)',
      animation: `${heroCarouselFloat} 6s ease-in-out infinite`,
    },
    heroCarouselWindow: {
      position: 'absolute' as const,
      inset: '28px 24px 18px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      padding: '14px',
      borderRadius: theme.radius.r12,
      border: `1px solid rgba(43, 120, 198, 0.18)`,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      boxShadow: '0 18px 38px rgba(17, 24, 39, 0.08)',
    },
    heroCarouselToolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    heroCarouselToolbarDot: {
      width: '6px',
      height: '6px',
      borderRadius: '999px',
      backgroundColor: 'rgba(43, 120, 198, 0.22)',
    },
    heroCarouselChoiceGrid: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
    },
    heroCarouselChoicePill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 10px',
      borderRadius: '999px',
      border: `1px solid rgba(43, 120, 198, 0.16)`,
      backgroundColor: businessPalette.blueberrySoft,
    },
    heroCarouselChoicePillActive: {
      borderColor: businessPalette.elderberry,
      backgroundColor: businessPalette.elderberrySoft,
      boxShadow: '0 10px 24px rgba(110, 72, 229, 0.12)',
    },
    heroCarouselPrimarySurface: {
      flex: 1,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '12px',
      minHeight: '92px',
      padding: '14px',
      borderRadius: theme.radius.r12,
      background: 'linear-gradient(135deg, rgba(110, 72, 229, 0.14) 0%, rgba(43, 120, 198, 0.08) 100%)',
    },
    heroCarouselPromptBubble: {
      position: 'absolute' as const,
      top: '22px',
      left: '16px',
      maxWidth: '76%',
      padding: '14px 16px',
      borderRadius: `${theme.radius.r12} ${theme.radius.r12} ${theme.radius.r12} 6px`,
      border: `1px solid rgba(110, 72, 229, 0.2)`,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 16px 34px rgba(17, 24, 39, 0.08)',
      animation: `${heroCarouselEnter} 420ms ease both`,
    },
    heroCarouselResponseTile: {
      position: 'absolute' as const,
      right: '20px',
      bottom: '18px',
      width: '68%',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      padding: '14px',
      borderRadius: theme.radius.r12,
      border: `1px solid rgba(43, 120, 198, 0.18)`,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      boxShadow: '0 18px 38px rgba(17, 24, 39, 0.08)',
      animation: `${heroCarouselEnter} 480ms ease both`,
    },
    heroCarouselResponseBars: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      height: '76px',
    },
    heroCarouselResponseBar: {
      flex: 1,
      borderRadius: '999px 999px 6px 6px',
      background: 'linear-gradient(180deg, rgba(110, 72, 229, 0.9) 0%, rgba(43, 120, 198, 0.74) 100%)',
    },
    heroCarouselConnector: {
      position: 'absolute' as const,
      left: '34%',
      top: '48%',
      width: '38%',
      height: '2px',
      background: 'linear-gradient(90deg, rgba(110, 72, 229, 0.12) 0%, rgba(43, 120, 198, 0.9) 48%, rgba(43, 120, 198, 0.12) 100%)',
      transform: 'rotate(8deg)',
      transformOrigin: 'left center',
    },
    heroCarouselArrangeGrid: {
      position: 'absolute' as const,
      inset: '24px',
      display: 'grid',
      gap: '10px',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      alignContent: 'end',
    },
    heroCarouselArrangePanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      gap: '8px',
      minHeight: '78px',
      padding: '12px',
      borderRadius: theme.radius.r12,
      border: `1px solid rgba(43, 120, 198, 0.18)`,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      boxShadow: '0 14px 30px rgba(17, 24, 39, 0.06)',
      animation: `${heroCarouselFloat} 6s ease-in-out infinite`,
    },
    heroCarouselArrangeHandle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 4px)',
      gap: '3px',
      width: 'fit-content',
    },
    heroCarouselArrangeGuide: {
      position: 'absolute' as const,
      right: '18px',
      top: '18px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '7px 10px',
      borderRadius: '999px',
      backgroundColor: 'rgba(255,255,255,0.9)',
      border: `1px solid rgba(43, 120, 198, 0.18)`,
      boxShadow: '0 12px 28px rgba(17, 24, 39, 0.06)',
    },
    heroCarouselNav: {
      position: 'relative' as const,
      zIndex: 1,
      display: 'grid',
      gap: '8px',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
    heroCarouselNavButton: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      minWidth: 0,
      padding: '10px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      textAlign: 'left' as const,
      cursor: 'pointer',
      overflow: 'hidden' as const,
      transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: businessPalette.blueberry,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      },
    },
    heroCarouselNavButtonActive: {
      borderColor: businessPalette.elderberry,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      boxShadow: '0 16px 34px rgba(110, 72, 229, 0.12)',
    },
    heroCarouselNavProgressTrack: {
      position: 'relative' as const,
      height: '4px',
      borderRadius: '999px',
      backgroundColor: 'rgba(43, 120, 198, 0.14)',
      overflow: 'hidden' as const,
    },
    heroCarouselNavProgressFill: {
      height: '100%',
      borderRadius: '999px',
      background: 'linear-gradient(90deg, #6E48E5 0%, #2B78C6 100%)',
      transformOrigin: 'left center',
      animation: `${heroCarouselProgress} ${HERO_CAROUSEL_AUTOPLAY_MS}ms linear forwards`,
    },
    widgetSummaryPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '220px',
      padding: '18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
    },
    actionRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
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
      gap: '14px',
    },
    emptyLaunchpad: {
      display: 'grid',
      gap: '14px',
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)',
        alignItems: 'stretch',
      },
    },
    previewPanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      padding: '16px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 16px 42px rgba(17, 24, 39, 0.05)',
      overflow: 'hidden' as const,
      minWidth: 0,
    },
    previewFeatureCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: '14px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.elderberryBorder}`,
      background:
        'linear-gradient(180deg, rgba(110, 72, 229, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%)',
    },
    previewChartSurface: {
      height: '108px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: 'linear-gradient(180deg, rgba(43, 120, 198, 0.06) 0%, rgba(255, 255, 255, 0.96) 100%)',
      padding: '10px',
    },
    previewMiniGrid: {
      display: 'grid',
      gap: '10px',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    previewMiniCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      minWidth: 0,
      padding: '12px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
    },
    previewValue: {
      lineHeight: 1,
    },
    previewBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      padding: '7px 10px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.elderberryBorder}`,
      backgroundColor: businessPalette.elderberrySoft,
    },
    previewList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: 0,
      margin: 0,
      listStyle: 'none' as const,
    },
    previewListItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    previewListDot: {
      width: '8px',
      height: '8px',
      borderRadius: '999px',
      backgroundColor: businessPalette.blueberry,
      flexShrink: 0,
    },
    previewLineSvg: {
      width: '100%',
      height: '100%',
      display: 'block',
    },
    starterPanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
      padding: '16px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 247, 248, 0.98) 100%)',
      boxShadow: '0 16px 42px rgba(17, 24, 39, 0.05)',
    },
    starterGrid: {
      display: 'grid',
      gap: '8px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    starterWidgetOption: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      justifyContent: 'center',
      minHeight: '72px',
      padding: '12px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      textAlign: 'left' as const,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: businessPalette.blueberry,
        boxShadow: '0 12px 26px rgba(17, 24, 39, 0.06)',
      },
    },
    starterWidgetOptionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      minWidth: 0,
    },
    starterWidgetOptionAction: {
      color: businessPalette.elderberryDark,
      flexShrink: 0,
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
    canvasGrid: {
      display: 'grid',
      gap: '18px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
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
  const isEmpty = widgets.length === 0;
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeHeroCarouselIndex, setActiveHeroCarouselIndex] = useState(0);
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
  const activeHeroCarouselStep = heroCarouselSteps[activeHeroCarouselIndex];

  useEffect(() => {
    if (!isEmpty) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroCarouselIndex(current => (current + 1) % heroCarouselSteps.length);
    }, HERO_CAROUSEL_AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isEmpty]);

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

  function openBuilder(nextPrompt?: string) {
    setRequestError(null);
    if (typeof nextPrompt === 'string') {
      setPrompt(nextPrompt);
    }
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
    setIsBuilderOpen(false);
    setActiveHeroCarouselIndex(0);
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

  function renderHeroCarouselStage(stepId: HeroCarouselStepId) {
    switch (stepId) {
      case 'choose':
        return (
          <div css={styles.heroCarouselStageInner} aria-hidden="true">
            <div css={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
              <div css={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    css={{
                      ...styles.heroCarouselToolbarDot,
                      backgroundColor: index === 0 ? businessPalette.elderberry : styles.heroCarouselToolbarDot.backgroundColor,
                    }}
                  />
                ))}
              </div>
              <div css={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Metric', 'Line', 'Bar'].map(label => (
                  <div
                    key={label}
                    css={{
                      ...styles.heroCarouselChoicePill,
                      ...(label === 'Metric' ? styles.heroCarouselChoicePillActive : {}),
                    }}
                  >
                    <Text typography="bodySmall1" css={{ color: label === 'Metric' ? businessPalette.elderberryDark : businessPalette.blueberryDark }}>
                      {label}
                    </Text>
                  </div>
                ))}
              </div>
              <div
                css={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: theme.radius.r12,
                  background: 'linear-gradient(135deg, rgba(110, 72, 229, 0.12) 0%, rgba(43, 120, 198, 0.08) 100%)',
                }}
              >
                <div css={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Text typography="bodySmall1" color="systemGrayscale60">
                    Selected
                  </Text>
                  <Text typography="bodyEmphasized">Metric widget</Text>
                </div>
                <Text typography="titleMedium">$18.4K</Text>
              </div>
            </div>
          </div>
        );
      case 'describe':
        return (
          <div css={styles.heroCarouselStageInner} aria-hidden="true">
            <div css={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
              <div
                css={{
                  padding: '10px 12px',
                  borderRadius: `${theme.radius.r12} ${theme.radius.r12} ${theme.radius.r12} 6px`,
                  border: `1px solid rgba(110, 72, 229, 0.18)`,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                }}
              >
                <Text typography="bodySmall1" color="systemGrayscale60">
                  Prompt
                </Text>
                <Text typography="bodyEmphasized">Show order volume over the last 8 weeks.</Text>
              </div>
              <div
                css={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: theme.radius.r12,
                  border: `1px solid rgba(43, 120, 198, 0.16)`,
                  backgroundColor: 'rgba(255,255,255,0.94)',
                }}
              >
                <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
                  Generated widget
                </Text>
                <div css={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flex: 1 }}>
                  {[32, 44, 38, 54, 66].map(height => (
                    <div
                      key={height}
                      css={{
                        flex: 1,
                        height: `${height}px`,
                        borderRadius: '999px 999px 4px 4px',
                        background: 'linear-gradient(180deg, rgba(110, 72, 229, 0.9) 0%, rgba(43, 120, 198, 0.76) 100%)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'arrange':
      default:
        return (
          <div css={styles.heroCarouselStageInner} aria-hidden="true">
            <div css={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', height: '100%' }}>
              <div
                css={{
                  gridColumn: '1 / -1',
                  padding: '12px',
                  borderRadius: theme.radius.r12,
                  border: `1px solid rgba(43, 120, 198, 0.16)`,
                  backgroundColor: 'rgba(255,255,255,0.94)',
                  boxShadow: '0 10px 22px rgba(17, 24, 39, 0.04)',
                }}
              >
                <Text typography="bodySmall1" color="systemGrayscale60">
                  Headline
                </Text>
                <Text typography="bodyEmphasized">Order trend</Text>
              </div>
              {['Mix', 'Insights'].map(label => (
                <div
                  key={label}
                  css={{
                    padding: '12px',
                    borderRadius: theme.radius.r12,
                    border: `1px solid rgba(43, 120, 198, 0.16)`,
                    backgroundColor: 'rgba(255,255,255,0.94)',
                    boxShadow: '0 10px 22px rgba(17, 24, 39, 0.04)',
                  }}
                >
                  <Text typography="bodySmall1" color="systemGrayscale60">
                    Support
                  </Text>
                  <Text typography="bodyEmphasized">{label}</Text>
                </div>
              ))}
            </div>
          </div>
        );
    }
  }

  return (
    <div ref={pageRef} css={styles.container}>
      <section css={styles.overviewCard}>
        <div css={styles.overviewTopRow}>
          <div css={styles.overviewBody}>
            <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
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
                <Text typography="bodySmall1" color="systemGrayscale60">
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
      </section>

      <section css={styles.canvasSection}>
        {isEmpty ? (
          <div css={styles.emptyLaunchpad}>
            <div css={styles.previewPanel}>
              <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
                Example layout
              </Text>
              <Text typography="titleMedium">Lead with one trend widget and support it with quick context.</Text>
              <div css={styles.previewFeatureCard}>
                <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
                  Order trend
                </Text>
                <div css={styles.previewChartSurface}>
                  <svg viewBox="0 0 520 180" css={styles.previewLineSvg} aria-hidden="true">
                    <path d="M0 34 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
                    <path d="M0 86 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
                    <path d="M0 138 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
                    <path
                      d="M18 122 C90 110, 132 98, 188 90 C244 82, 286 70, 346 64 C402 58, 444 42, 500 30"
                      fill="none"
                      stroke="#6E48E5"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="188" cy="90" r="6" fill="#2B78C6" />
                    <circle cx="346" cy="64" r="6" fill="#2B78C6" />
                    <circle cx="500" cy="30" r="6" fill="#6E48E5" />
                  </svg>
                </div>
              </div>

              <div css={styles.previewMiniGrid}>
                <div css={styles.previewMiniCard}>
                  <Text typography="bodySmall1" color="systemGrayscale60">
                    Total spend
                  </Text>
                  <Text typography="headline" css={styles.previewValue}>
                    $18.4K
                  </Text>
                  <div css={styles.previewBadge}>
                    <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
                      6.1% under budget
                    </Text>
                  </div>
                </div>

                <div css={styles.previewMiniCard}>
                  <Text typography="bodySmall1" color="systemGrayscale60">
                    Review highlights
                  </Text>
                  <ul css={styles.previewList}>
                    <li css={styles.previewListItem}>
                      <div css={styles.previewListDot} />
                      <Text typography="bodySmall1" color="systemGrayscale60">
                        Midweek volume remains strongest
                      </Text>
                    </li>
                    <li css={styles.previewListItem}>
                      <div css={styles.previewListDot} />
                      <Text typography="bodySmall1" color="systemGrayscale60">
                        Produce continues to lead contribution
                      </Text>
                    </li>
                    <li css={styles.previewListItem}>
                      <div css={styles.previewListDot} />
                      <Text typography="bodySmall1" color="systemGrayscale60">
                        Budget pacing remains healthy
                      </Text>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div css={styles.starterPanel}>
              <div css={styles.heroCarouselHeader}>
                <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.blueberryDark }}>
                  Get started
                </Text>
                <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
                  {activeHeroCarouselStep.stepLabel} / {heroCarouselSteps.length.toString().padStart(2, '0')}
                </Text>
              </div>

              <div css={styles.heroCarouselStage}>{renderHeroCarouselStage(activeHeroCarouselStep.id)}</div>

              <div css={styles.heroCarouselCopy}>
                <div css={styles.heroCarouselStepBadge}>
                  <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
                    {activeHeroCarouselStep.navLabel}
                  </Text>
                </div>
                <Text typography="titleMedium">{activeHeroCarouselStep.title}</Text>
                <Text typography="bodySmall1" color="systemGrayscale60">
                  {activeHeroCarouselStep.description}
                </Text>
                <div css={styles.heroCarouselActions}>
                  <PrimaryButtonSmall onClick={() => openBuilder(activeHeroCarouselStep.prompt)} css={styles.primaryAction}>
                    Open builder
                  </PrimaryButtonSmall>
                </div>
              </div>

              <div css={styles.heroCarouselNav}>
                {heroCarouselSteps.map((step, index) => {
                  const isActive = index === activeHeroCarouselIndex;

                  return (
                    <ButtonBase
                      key={step.id}
                      onClick={() => setActiveHeroCarouselIndex(index)}
                      css={{
                        ...styles.heroCarouselNavButton,
                        ...(isActive ? styles.heroCarouselNavButtonActive : {}),
                      }}
                    >
                      <Text typography="bodySmall1" css={{ color: isActive ? businessPalette.elderberryDark : businessPalette.blueberryDark }}>
                        {step.stepLabel}
                      </Text>
                      <Text typography="bodySmall1">{step.navLabel}</Text>
                      <div css={styles.heroCarouselNavProgressTrack}>
                        {isActive ? <div css={styles.heroCarouselNavProgressFill} /> : null}
                      </div>
                    </ButtonBase>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div css={styles.canvasHeader}>
            <div css={styles.canvasTitleGroup}>
              <Text typography="titleMedium">Dashboard canvas</Text>
              <Text typography="bodyRegular" color="systemGrayscale60">
                Arrange widgets to match how your team reads the page, from headline KPIs to deeper category and location analysis.
              </Text>
            </div>
          </div>
        )}

        {!isEmpty ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToPageBounds]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgets.map(widget => widget.id)} strategy={rectSortingStrategy}>
              <div css={styles.canvasGrid}>
                {widgets.map(widget => (
                  <DashboardWidgetShell key={widget.id} widget={widget} onRemove={handleRemove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : null}
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
