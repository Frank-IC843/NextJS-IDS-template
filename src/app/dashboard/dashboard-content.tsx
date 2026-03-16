'use client';

import { keyframes } from '@emotion/react';
import {
  closestCenter,
  type CollisionDetection,
  DndContext,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type Modifier,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { responsive, type Theme, useTheme } from '@instacart/ids-core';
import { ButtonBase, SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getTonePalette } from '@/app/dashboard/dashboard-block-utils';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { getStarterDashboardWidgets } from '@/app/dashboard/dashboard-builder-mocks';
import {
  dashboardGenerateResponseSchema,
  type DashboardLayout,
  type DashboardWidget,
} from '@/app/dashboard/dashboard-builder-types';
import { DashboardPromptComposer } from '@/app/dashboard/dashboard-prompt-composer';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';
import { DashboardWidgetShell } from '@/app/dashboard/dashboard-widget-shell';

const HERO_CAROUSEL_AUTOPLAY_MS = 4800;
type BuilderAction = 'generate' | 'preview';
type PreviewCacheEntry = {
  requestKey: string;
  widget: DashboardWidget;
};

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
    navLabel: 'Enable',
    title: 'Enable the right widget types.',
    description: 'Choose which widget types the AI can use before you submit a prompt.',
    prompt: 'Add a metric widget for total spend this month.',
  },
  {
    id: 'describe',
    stepLabel: '02',
    navLabel: 'Prompt',
    title: 'Prompt one widget.',
    description: 'Use the prompt box or example requests to describe the single widget you want.',
    prompt: 'Add a line chart showing order volume over the last 8 weeks.',
  },
  {
    id: 'arrange',
    stepLabel: '03',
    navLabel: 'Arrange',
    title: 'Generate, then arrange.',
    description: 'The widget lands on the canvas and can be reordered as your dashboard grows.',
    prompt: 'Add an insight list summarizing budget pacing this quarter.',
  },
] as const;

const exampleLayoutWidgets = getStarterDashboardWidgets();

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
    heroCarouselMain: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '18px',
      flex: 1,
      minHeight: 0,
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
      gap: '6px',
      minWidth: 0,
      minHeight: 0,
      padding: '2px 2px 0',
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
      flexDirection: 'column' as const,
      gap: '10px',
      alignItems: 'stretch',
      marginTop: 'auto',
      paddingTop: '6px',
    },
    heroCarouselFooter: {
      display: 'flex',
      flexDirection: 'column' as const,
      paddingTop: '2px',
    },
    heroCarouselActionRow: {
      display: 'flex',
      width: '100%',
      minWidth: 0,
      '& > *': {
        flex: 1,
        width: '100%',
      },
    },
    heroCarouselActionCallout: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      padding: '10px 12px',
      borderRadius: theme.radius.r12,
      border: `1px solid rgba(43, 120, 198, 0.14)`,
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
    },
    heroCarouselActionButton: {
      appearance: 'none' as const,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '46px',
      padding: '0 18px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.elderberry}`,
      backgroundColor: businessPalette.elderberry,
      color: theme.colors.systemGrayscale00,
      font: 'inherit',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 14px 28px rgba(110, 72, 229, 0.18)',
      transition: 'transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        backgroundColor: businessPalette.elderberryDark,
        borderColor: businessPalette.elderberryDark,
        boxShadow: '0 18px 32px rgba(110, 72, 229, 0.22)',
      },
      '&:focus-visible': {
        outline: `2px solid ${businessPalette.blueberry}`,
        outlineOffset: '3px',
      },
    },
    heroCarouselStage: {
      position: 'relative' as const,
      height: '156px',
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
      marginTop: 'auto',
      marginBottom: 'auto',
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
      marginTop: '14px',
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
      gap: '10px',
      padding: '14px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 16px 42px rgba(17, 24, 39, 0.05)',
      overflow: 'hidden' as const,
      minWidth: 0,
    },
    exampleWidgetGrid: {
      display: 'grid',
      gap: '14px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    exampleWidgetCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      position: 'relative' as const,
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 12px 40px rgba(17, 24, 39, 0.06)',
      padding: '14px',
      minWidth: 0,
    },
    exampleWidgetHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
    },
    exampleWidgetTitleGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      minWidth: 0,
    },
    exampleWidgetMetaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap' as const,
    },
    exampleWidgetPill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 8px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: businessPalette.blueberrySoft,
    },
    exampleWidgetControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexShrink: 0,
    },
    exampleWidgetLayoutControl: {
      display: 'inline-grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '3px',
      padding: '3px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
    },
    exampleWidgetLayoutOption: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '30px',
      height: '26px',
      borderRadius: '999px',
      backgroundColor: 'transparent',
    },
    exampleWidgetLayoutOptionActive: {
      backgroundColor: businessPalette.elderberrySoft,
      boxShadow: `inset 0 0 0 1px ${businessPalette.elderberryBorder}`,
    },
    exampleWidgetLayoutGlyphHalf: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '2px',
      width: '13px',
      height: '8px',
    },
    exampleWidgetLayoutGlyphFull: {
      display: 'flex',
      width: '13px',
      height: '8px',
    },
    exampleWidgetLayoutGlyphBar: {
      flex: 1,
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: 'rgba(43, 120, 198, 0.16)',
    },
    exampleWidgetIconButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '34px',
      height: '34px',
      padding: '0 8px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
    },
    exampleWidgetGripDots: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 4px)',
      gap: '3px',
    },
    exampleWidgetGripDot: {
      width: '4px',
      height: '4px',
      borderRadius: '999px',
      backgroundColor: businessPalette.elderberryDark,
    },
    exampleWidgetBody: {
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    exampleWidgetDescription: {
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    },
    exampleWidgetFooter: {
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
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
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      height: '84px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: 'linear-gradient(180deg, rgba(43, 120, 198, 0.06) 0%, rgba(255, 255, 255, 0.96) 100%)',
      padding: '8px',
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
    exampleBarChart: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '6px',
      width: '100%',
      height: '100%',
    },
    exampleBarColumnWrap: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '6px',
      minWidth: 0,
      height: '100%',
    },
    exampleBarColumn: {
      width: '100%',
      borderRadius: '999px 999px 4px 4px',
      background: 'linear-gradient(180deg, rgba(110, 72, 229, 0.92) 0%, rgba(43, 120, 198, 0.76) 100%)',
    },
    exampleBarLabel: {
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      color: theme.colors.systemGrayscale60,
    },
    exampleDonutWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      width: '100%',
      height: '100%',
    },
    exampleDonutChart: {
      width: '64px',
      height: '64px',
      borderRadius: '999px',
      position: 'relative' as const,
      flexShrink: 0,
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        inset: '15px',
        borderRadius: '999px',
        backgroundColor: theme.colors.systemGrayscale00,
      },
    },
    exampleDonutLegend: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
      flex: 1,
      minWidth: 0,
    },
    exampleDonutLegendRow: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr) auto',
      alignItems: 'center',
      gap: '8px',
      minWidth: 0,
    },
    exampleDonutLegendDot: {
      width: '8px',
      height: '8px',
      borderRadius: '999px',
      flexShrink: 0,
    },
    exampleDonutLegendLabel: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    starterPanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      height: '100%',
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
      position: 'relative' as const,
      zIndex: 1,
      display: 'grid',
      gap: '18px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    canvasGridShell: {
      position: 'relative' as const,
      minWidth: 0,
    },
    canvasDragGuide: {
      position: 'absolute' as const,
      inset: 0,
      zIndex: 2,
      display: 'grid',
      gap: '18px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      pointerEvents: 'none' as const,
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    canvasDragGuideColumn: {
      borderRadius: theme.radius.r12,
      border: '1px dashed rgba(43, 120, 198, 0.28)',
      backgroundColor: 'rgba(43, 120, 198, 0.03)',
      boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.66)',
    },
    canvasDragGuideColumnDesktop: {
      display: 'none',
      [responsive.up('r')]: {
        display: 'block',
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
  const allWidgetTypes = supportedWidgets.map(widget => widget.type);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const canvasGridRef = useRef<HTMLDivElement | null>(null);
  const [widgets, setWidgets] = useState(initialWidgets);
  const isEmpty = widgets.length === 0;
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [allowedWidgetTypes, setAllowedWidgetTypes] = useState<SupportedWidgetDefinition['type'][]>(allWidgetTypes);
  const [previewWidget, setPreviewWidget] = useState<DashboardWidget | null>(null);
  const [pendingBuilderAction, setPendingBuilderAction] = useState<BuilderAction | null>(null);
  const [activeHeroCarouselIndex, setActiveHeroCarouselIndex] = useState(0);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const previewCacheRef = useRef<PreviewCacheEntry | null>(null);
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
  const isCanvasDragging = activeDragId !== null;
  const heroCarouselStepTransition = prefersReducedMotion
    ? undefined
    : {
        initial: {
          opacity: 0,
          y: 12,
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.34,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        },
        exit: {
          opacity: 0,
          y: -10,
          transition: {
            duration: 0.22,
            ease: [0.4, 0, 1, 1] as const,
          },
        },
      };
  const collisionDetectionStrategy: CollisionDetection = args => {
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    const intersectionCollisions = rectIntersection(args);

    if (intersectionCollisions.length > 0) {
      return intersectionCollisions;
    }

    return closestCenter(args);
  };

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
    const canvasGridRect = canvasGridRef.current?.getBoundingClientRect();
    const nodeRect = draggingNodeRect ?? activeNodeRect;

    if (!pageRect || !nodeRect) {
      return transform;
    }

    let x = transform.x;
    let y = transform.y;
    const leftBound = canvasGridRect?.left ?? pageRect.left;
    const rightBound = canvasGridRect?.right ?? pageRect.right;
    const topBound = canvasGridRect?.top ?? pageRect.top;

    const nextLeft = nodeRect.left + x;
    const nextRight = nodeRect.right + x;
    const nextTop = nodeRect.top + y;
    const nextBottom = nodeRect.bottom + y;

    if (nextLeft < leftBound) {
      x += leftBound - nextLeft;
    }

    if (nextRight > rightBound) {
      x -= nextRight - rightBound;
    }

    if (nextTop < topBound) {
      y += topBound - nextTop;
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

  function clearDragState() {
    setActiveDragId(null);
    setDragOverWidgetId(null);
  }

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

    setWidgets(currentWidgets => [...currentWidgets, widget]);
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

    setWidgets(currentWidgets => [...currentWidgets, previewWidget]);
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
    setWidgets(currentWidgets => currentWidgets.filter(widget => widget.id !== widgetId));
  }

  function handleLayoutChange(widgetId: string, layout: DashboardLayout) {
    setWidgets(currentWidgets =>
      currentWidgets.map(widget => {
        if (widget.id !== widgetId || widget.layout === layout) {
          return widget;
        }

        return {
          ...widget,
          layout,
        };
      }),
    );
  }

  function handleReset() {
    setWidgets(initialWidgets);
    setPrompt(defaultPrompt);
    setPreviewWidget(null);
    setRequestError(null);
    setIsBuilderOpen(false);
    setActiveHeroCarouselIndex(0);
    previewCacheRef.current = null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    clearDragState();

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

  function handleDragStart(event: DragStartEvent) {
    const nextActiveId = String(event.active.id);
    setActiveDragId(nextActiveId);
    setDragOverWidgetId(nextActiveId);
  }

  function handleDragOver(event: DragOverEvent) {
    setDragOverWidgetId(event.over ? String(event.over.id) : null);
  }

  function renderHeroCarouselStage(stepId: HeroCarouselStepId) {
    switch (stepId) {
      case 'choose':
        return (
          <div css={styles.heroCarouselStageInner} aria-hidden="true">
            <div css={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
              <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <Text typography="bodySmall1" color="systemGrayscale60">
                  Allowed types
                </Text>
                <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
                  3 enabled
                </Text>
              </div>
              <div css={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', flex: 1 }}>
                {[
                  { label: 'Metric', active: true, preview: <Text typography="bodyEmphasized">$18.4K</Text> },
                  {
                    label: 'Line',
                    active: true,
                    preview: (
                      <svg viewBox="0 0 60 24" preserveAspectRatio="none" css={{ width: '100%', height: '24px', display: 'block' }}>
                        <path d="M2 20 C18 16, 28 12, 42 10 C50 8, 55 6, 58 4" fill="none" stroke="#6E48E5" strokeWidth="3" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Donut',
                    active: true,
                    preview: (
                      <div css={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <div
                          css={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '999px',
                            background:
                              'conic-gradient(#6E48E5 0deg 148deg, #2B78C6 148deg 282deg, rgba(43, 120, 198, 0.18) 282deg 360deg)',
                            position: 'relative',
                            flexShrink: 0,
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              inset: '5px',
                              borderRadius: '999px',
                              backgroundColor: theme.colors.systemGrayscale00,
                            },
                          }}
                        />
                        <div css={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                          {[68, 46].map(width => (
                            <div
                              key={width}
                              css={{
                                width: `${width}%`,
                                height: '4px',
                                borderRadius: '999px',
                                backgroundColor: width === 68 ? businessPalette.blueberrySoft : 'rgba(43, 120, 198, 0.18)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ),
                  },
                ].map(item => (
                  <div
                    key={item.label}
                    css={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                      minWidth: 0,
                      padding: '8px',
                      borderRadius: theme.radius.r12,
                      border: `1px solid ${item.active ? businessPalette.elderberryBorder : 'rgba(43, 120, 198, 0.16)'}`,
                      backgroundColor: item.active ? businessPalette.elderberrySoft : 'rgba(255,255,255,0.92)',
                    }}
                  >
                    <div css={{ minHeight: '24px', display: 'flex', alignItems: 'flex-end' }}>{item.preview}</div>
                    <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <Text typography="bodySmall1" css={{ color: item.active ? businessPalette.elderberryDark : businessPalette.blueberryDark }}>
                        {item.label}
                      </Text>
                      <div
                        css={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '999px',
                          backgroundColor: item.active ? businessPalette.elderberry : 'rgba(43, 120, 198, 0.22)',
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </div>
                ))}
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
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  height: '100%',
                }}
              >
                <Text typography="bodySmall1" color="systemGrayscale60">
                  Prompt
                </Text>
                <div
                  css={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    minHeight: '58px',
                    padding: '10px 12px',
                    borderRadius: theme.radius.r12,
                    border: `1px solid ${theme.colors.systemGrayscale20}`,
                    backgroundColor: theme.colors.systemGrayscale00,
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <Text typography="bodySmall1" css={{ lineHeight: 1.4, color: theme.colors.systemGrayscale90 }}>
                    Add a line chart showing order volume over the last 8 weeks.
                  </Text>
                </div>
                <div
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap',
                    marginTop: 'auto',
                  }}
                >
                  {['Orders over time', 'Example request'].map(label => (
                    <div
                      key={label}
                      css={{
                        padding: '5px 8px',
                        borderRadius: '999px',
                        border: `1px solid rgba(43, 120, 198, 0.16)`,
                        backgroundColor: businessPalette.blueberrySoft,
                      }}
                    >
                      <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
                        {label}
                      </Text>
                    </div>
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
                <div css={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div css={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                    <Text typography="bodySmall1" color="systemGrayscale60">
                      New widget
                    </Text>
                    <Text typography="bodyEmphasized">Order trend</Text>
                  </div>
                  <div css={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div
                      css={{
                        display: 'inline-grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '4px',
                        padding: '4px',
                        borderRadius: '999px',
                        border: `1px solid ${businessPalette.blueberryBorder}`,
                        backgroundColor: theme.colors.systemGrayscale00,
                      }}
                    >
                      <div
                        css={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '20px',
                          borderRadius: '999px',
                          backgroundColor: businessPalette.elderberrySoft,
                          boxShadow: `inset 0 0 0 1px ${businessPalette.elderberryBorder}`,
                        }}
                      >
                        <div css={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2px', width: '12px', height: '8px' }}>
                          <div
                            css={{
                              borderRadius: '999px',
                              border: `1px solid ${businessPalette.blueberryBorder}`,
                              backgroundColor: 'rgba(43, 120, 198, 0.16)',
                            }}
                          />
                          <div
                            css={{
                              borderRadius: '999px',
                              border: `1px solid ${businessPalette.blueberryBorder}`,
                              backgroundColor: 'rgba(43, 120, 198, 0.16)',
                            }}
                          />
                        </div>
                      </div>
                      <div
                        css={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '20px',
                          borderRadius: '999px',
                        }}
                      >
                        <div css={{ display: 'flex', width: '12px', height: '8px' }}>
                          <div
                            css={{
                              flex: 1,
                              borderRadius: '999px',
                              border: `1px solid ${businessPalette.blueberryBorder}`,
                              backgroundColor: 'rgba(43, 120, 198, 0.16)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      css={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '999px',
                        border: `1px solid ${businessPalette.blueberryBorder}`,
                        backgroundColor: theme.colors.systemGrayscale00,
                      }}
                    >
                      <div css={{ display: 'grid', gridTemplateColumns: 'repeat(2, 4px)', gap: '3px' }}>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={index}
                            css={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '999px',
                              backgroundColor: businessPalette.elderberryDark,
                            }}
                          />
                        ))}
                      </div>
                      <svg
                        viewBox="0 0 18 22"
                        css={{
                          position: 'absolute',
                          right: '-4px',
                          top: '-7px',
                          width: '18px',
                          height: '22px',
                          filter: 'drop-shadow(0 4px 8px rgba(17, 24, 39, 0.18))',
                        }}
                      >
                        <path
                          d="M2 1.5 L12.8 10.3 L8.6 10.9 L11.5 18.4 L8.7 19.4 L5.8 12 L2 14.8 Z"
                          fill={theme.colors.systemGrayscale00}
                          stroke={businessPalette.elderberryDark}
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div
                      css={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '54px',
                        height: '32px',
                        padding: '0 10px',
                        borderRadius: '999px',
                        border: `1px solid ${businessPalette.blueberryBorder}`,
                        backgroundColor: theme.colors.systemGrayscale00,
                      }}
                    >
                      <Text typography="bodySmall1" color="systemGrayscale70">
                        Remove
                      </Text>
                    </div>
                  </div>
                </div>
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
      </section>

      <section css={styles.canvasSection}>
        {isEmpty ? (
          <div css={styles.emptyLaunchpad}>
            <div css={styles.previewPanel}>
              <Text typography="bodyEmphasized" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
                Example layout
              </Text>
              <div css={styles.exampleWidgetGrid}>
                {exampleLayoutWidgets.map(widget => (
                  <DashboardExampleWidgetShell key={widget.id} widget={widget} />
                ))}
              </div>
            </div>

            <div css={styles.starterPanel}>
              <div css={styles.heroCarouselHeader}>
                <Text typography="bodyEmphasized" css={{ ...styles.eyebrow, color: businessPalette.blueberryDark }}>
                  Get started
                </Text>
                <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
                  {activeHeroCarouselStep.stepLabel} / {heroCarouselSteps.length.toString().padStart(2, '0')}
                </Text>
              </div>

              <div css={styles.heroCarouselMain}>
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={activeHeroCarouselStep.id}
                    css={styles.heroCarouselBody}
                    initial={heroCarouselStepTransition?.initial}
                    animate={heroCarouselStepTransition?.animate}
                    exit={heroCarouselStepTransition?.exit}
                  >
                    <div css={styles.heroCarouselStage}>{renderHeroCarouselStage(activeHeroCarouselStep.id)}</div>

                    <div css={styles.heroCarouselCopy}>
                      <Text typography="bodyEmphasized">{activeHeroCarouselStep.title}</Text>
                      <Text typography="bodySmall1" color="systemGrayscale60">
                        {activeHeroCarouselStep.description}
                      </Text>
                    </div>
                  </motion.div>
                </AnimatePresence>
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

              <div css={styles.heroCarouselFooter}>
                <div css={styles.heroCarouselActionRow}>
                  <button
                    type="button"
                    onClick={() => openBuilder(activeHeroCarouselStep.prompt)}
                    css={styles.heroCarouselActionButton}
                  >
                    Open builder
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

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

function DashboardExampleWidgetShell({ widget }: { widget: DashboardWidget }) {
  const styles = useStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return (
    <article
      css={{
        ...styles.exampleWidgetCard,
        gridColumn: widget.layout === 'full' ? '1 / -1' : undefined,
      }}
    >
      <div css={styles.exampleWidgetHeader}>
        <div css={styles.exampleWidgetTitleGroup}>
          <div css={styles.exampleWidgetMetaRow}>
            <Text typography="bodyEmphasized">{widget.title}</Text>
            {widget.timeRangeLabel ? (
              <div css={styles.exampleWidgetPill}>
                <Text typography="bodySmall1" color="systemGrayscale60">
                  {widget.timeRangeLabel}
                </Text>
              </div>
            ) : null}
          </div>
          {widget.description ? (
            <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetDescription}>
              {widget.description}
            </Text>
          ) : null}
        </div>
      </div>

      <div css={styles.exampleWidgetBody}>{renderExampleWidgetBody(widget, styles, theme, businessPalette)}</div>
    </article>
  );
}

function renderExampleWidgetBody(
  widget: DashboardWidget,
  styles: ReturnType<typeof useStyles>,
  theme: Theme,
  businessPalette: ReturnType<typeof getDashboardBusinessPalette>,
) {
  switch (widget.widgetType) {
    case 'lineChart': {
      const chartPoints = getExampleLinePreviewPoints(widget);

      return (
        <>
          <div css={styles.previewChartSurface}>
            <svg viewBox="0 0 520 180" preserveAspectRatio="none" css={styles.previewLineSvg} aria-hidden="true">
              <path d="M0 34 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
              <path d="M0 86 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
              <path d="M0 138 H520" stroke="rgba(43, 120, 198, 0.16)" strokeDasharray="5 5" />
              <path
                d={chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')}
                fill="none"
                stroke={businessPalette.elderberry}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {chartPoints.map((point, index) => (
                <circle
                  key={point.label}
                  cx={point.x}
                  cy={point.y}
                  r={index === chartPoints.length - 1 ? 5 : 4}
                  fill={theme.colors.systemGrayscale00}
                  stroke={index === chartPoints.length - 1 ? businessPalette.elderberry : businessPalette.blueberry}
                  strokeWidth="2.5"
                />
              ))}
            </svg>
          </div>
          <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetFooter}>
            {widget.data.footer}
          </Text>
        </>
      );
    }
    case 'barChart': {
      const maxValue = Math.max(...widget.data.bars.map(bar => bar.value), 1);

      return (
        <>
          <div css={styles.previewChartSurface}>
            <div css={styles.exampleBarChart} aria-hidden="true">
              {widget.data.bars.map(bar => (
                <div key={bar.label} css={styles.exampleBarColumnWrap}>
                  <div
                    css={{
                      ...styles.exampleBarColumn,
                      height: `${Math.max((bar.value / maxValue) * 100, 18)}%`,
                    }}
                  />
                  <Text typography="bodySmall1" css={styles.exampleBarLabel}>
                    {bar.label}
                  </Text>
                </div>
              ))}
            </div>
          </div>
          <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetFooter}>
            {widget.data.footer}
          </Text>
        </>
      );
    }
    case 'donutChart': {
      const total = Math.max(widget.data.segments.reduce((sum, segment) => sum + segment.value, 0), 1);
      const donutGradient = buildExampleDonutGradient(widget, theme);

      return (
        <>
          <div css={styles.previewChartSurface}>
            <div css={styles.exampleDonutWrap}>
              <div css={{ ...styles.exampleDonutChart, background: donutGradient }} />
              <div css={styles.exampleDonutLegend}>
                {widget.data.segments.slice(0, 3).map(segment => {
                  const palette = getTonePalette(theme, segment.tone);

                  return (
                    <div key={segment.label} css={styles.exampleDonutLegendRow}>
                      <div css={{ ...styles.exampleDonutLegendDot, backgroundColor: palette.accent }} />
                      <Text typography="bodySmall1" css={styles.exampleDonutLegendLabel}>
                        {segment.label}
                      </Text>
                      <Text typography="bodySmall1" color="systemGrayscale60">
                        {Math.round((segment.value / total) * 100)}%
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetFooter}>
            {widget.data.footer}
          </Text>
        </>
      );
    }
    default:
      return (
        <Text typography="bodySmall1" color="systemGrayscale60" css={styles.exampleWidgetFooter}>
          This example widget preview is unavailable.
        </Text>
      );
  }
}

function getExampleLinePreviewPoints(widget: Extract<DashboardWidget, { widgetType: 'lineChart' }>) {
  const points = widget.data.points;
  const chartWidth = 520;
  const leftPadding = 18;
  const rightPadding = 20;
  const topPadding = 30;
  const bottomPadding = 140;
  const maxValue = Math.max(...points.map(point => point.value), 1);
  const minValue = Math.min(...points.map(point => point.value));
  const valueRange = Math.max(maxValue - minValue, 1);
  const xStep = points.length > 1 ? (chartWidth - leftPadding - rightPadding) / (points.length - 1) : 0;

  return points.map((point, index) => ({
    label: point.label,
    x: Number((leftPadding + xStep * index).toFixed(2)),
    y: Number((bottomPadding - ((point.value - minValue) / valueRange) * (bottomPadding - topPadding)).toFixed(2)),
  }));
}

function buildExampleDonutGradient(widget: Extract<DashboardWidget, { widgetType: 'donutChart' }>, theme: Theme) {
  const total = Math.max(widget.data.segments.reduce((sum, segment) => sum + segment.value, 0), 1);
  let currentAngle = 0;

  const gradientStops = widget.data.segments.map(segment => {
    const palette = getTonePalette(theme, segment.tone);
    const startAngle = currentAngle;
    const sweep = (segment.value / total) * 360;
    const endAngle = startAngle + sweep;

    currentAngle = endAngle;

    return `${palette.accent} ${startAngle}deg ${endAngle}deg`;
  });

  return `conic-gradient(${gradientStops.join(', ')})`;
}
