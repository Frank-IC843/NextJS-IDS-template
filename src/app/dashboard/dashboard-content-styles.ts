'use client';

import { keyframes } from '@emotion/react';
import { responsive, useTheme } from '@instacart/ids-core';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';

export const HERO_CAROUSEL_AUTOPLAY_MS = 4800;

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

export function useDashboardContentStyles() {
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
      justifyContent: 'flex-start',
      gap: '6px',
      minWidth: 0,
      minHeight: '72px',
      padding: '10px 10px 12px',
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
      width: '100%',
      minHeight: '4px',
      height: '4px',
      marginTop: 'auto',
      flexShrink: 0,
      borderRadius: '999px',
      backgroundColor: 'rgba(43, 120, 198, 0.14)',
      overflow: 'hidden' as const,
    },
    heroCarouselNavProgressFill: {
      display: 'block',
      width: '100%',
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
}

export type DashboardContentStyles = ReturnType<typeof useDashboardContentStyles>;
