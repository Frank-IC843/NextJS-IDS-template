'use client';

import { GrabIcon, TrashIcon, useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { DashboardWidgetRenderer } from '@/app/dashboard/dashboard-widget-renderer';
import type { DashboardLayout, DashboardWidget } from '@/app/dashboard/dashboard-builder-types';
import { DashboardLayoutGlyph } from '@/app/dashboard/dashboard-layout-glyph';

function useStyles() {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '18px',
      position: 'relative' as const,
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 12px 40px rgba(17, 24, 39, 0.06)',
      padding: '20px',
      minWidth: 0,
    },
    header: {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    },
    titleGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      minWidth: 0,
      flex: 1,
      paddingRight: '196px',
      borderRadius: theme.radius.r12,
      outline: 'none',
      '&:focus-visible': {
        boxShadow: `0 0 0 2px ${businessPalette.blueberrySoft}`,
      },
    },
    metaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap' as const,
    },
    pill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: businessPalette.blueberrySoft,
    },
    controls: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: 0,
      opacity: 0,
      visibility: 'hidden' as const,
      transform: 'translateY(-4px)',
      pointerEvents: 'none' as const,
      overflow: 'visible' as const,
      transition: 'opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease',
    },
    controlsVisible: {
      opacity: 1,
      visibility: 'visible' as const,
      transform: 'translateY(0)',
      pointerEvents: 'auto' as const,
    },
    layoutControl: {
      display: 'inline-grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '4px',
      padding: '3px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      overflow: 'visible' as const,
    },
    layoutOptionWrap: {
      position: 'relative' as const,
      display: 'inline-flex',
      '&:hover [data-layout-tooltip], & [data-layout-trigger]:focus-visible + [data-layout-tooltip]': {
        opacity: 1,
        transform: 'translateX(-50%) translateY(0)',
      },
    },
    layoutOption: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '32px',
      borderRadius: '999px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        backgroundColor: businessPalette.blueberrySoft,
      },
      '&:focus-visible': {
        outline: `2px solid ${businessPalette.blueberry}`,
        outlineOffset: '2px',
      },
    },
    layoutOptionActive: {
      backgroundColor: businessPalette.elderberrySoft,
      boxShadow: `inset 0 0 0 1px ${businessPalette.elderberryBorder}`,
    },
    layoutTooltip: {
      position: 'absolute' as const,
      left: '50%',
      bottom: 'calc(100% + 8px)',
      transform: 'translateX(-50%) translateY(4px)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 10px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 12px 24px rgba(17, 24, 39, 0.12)',
      whiteSpace: 'nowrap' as const,
      pointerEvents: 'none' as const,
      opacity: 0,
      transition: 'opacity 0.18s ease, transform 0.18s ease',
      zIndex: 3,
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        top: '100%',
        left: '50%',
        width: '8px',
        height: '8px',
        borderRight: `1px solid ${businessPalette.blueberryBorder}`,
        borderBottom: `1px solid ${businessPalette.blueberryBorder}`,
        backgroundColor: theme.colors.systemGrayscale00,
        transform: 'translateX(-50%) rotate(45deg)',
      },
    },
    layoutTooltipHidden: {
      opacity: '0 !important' as const,
      transform: 'translateX(-50%) translateY(4px) !important',
    },
    iconButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '36px',
      height: '36px',
      padding: '0 10px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: businessPalette.blueberry,
        backgroundColor: businessPalette.blueberrySoft,
      },
      '&:focus-visible': {
        outline: `2px solid ${businessPalette.blueberry}`,
        outlineOffset: '2px',
      },
    },
    iconButtonWrap: {
      position: 'relative' as const,
      display: 'inline-flex',
      '&:hover [data-toolbar-tooltip], & [data-toolbar-trigger]:focus-visible + [data-toolbar-tooltip]': {
        opacity: 1,
        transform: 'translateX(-50%) translateY(0)',
      },
    },
    iconGlyph: {
      width: '16px',
      height: '16px',
      color: businessPalette.elderberryDark,
    },
    body: {
      minWidth: 0,
    },
  } as const;
}

interface DashboardWidgetShellProps {
  widget: DashboardWidget;
  isDropTarget?: boolean;
  onLayoutChange: (widgetId: string, layout: DashboardLayout) => void;
  onRemove: (widgetId: string) => void;
}

export function DashboardWidgetShell({ widget, isDropTarget = false, onLayoutChange, onRemove }: DashboardWidgetShellProps) {
  const styles = useStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
  });
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const translatedTransform = transform
    ? CSS.Transform.toString({
        ...transform,
        scaleX: 1,
        scaleY: 1,
      })
    : undefined;

  return (
    <article
      ref={setNodeRef}
      css={{
        ...styles.container,
        gridColumn: widget.layout === 'full' ? '1 / -1' : undefined,
        transform: translatedTransform,
        transition,
        opacity: 1,
        zIndex: isDragging ? 20 : 1,
        boxShadow: isDragging
          ? '0 18px 44px rgba(17, 24, 39, 0.16)'
          : isDropTarget
            ? '0 0 0 2px rgba(110, 72, 229, 0.16), 0 16px 42px rgba(17, 24, 39, 0.08)'
            : styles.container.boxShadow,
        borderColor: isDragging
          ? businessPalette.blueberry
          : isDropTarget
            ? businessPalette.elderberry
            : businessPalette.blueberryBorder,
      }}
    >
      <div css={styles.header}>
        <div
          tabIndex={0}
          css={styles.titleGroup}
          onMouseEnter={() => setIsToolbarVisible(true)}
          onMouseLeave={() => setIsToolbarVisible(false)}
          onFocus={() => setIsToolbarVisible(true)}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsToolbarVisible(false);
            }
          }}
        >
          <div css={styles.metaRow}>
            <Text typography="titleMedium">{widget.title}</Text>
            {widget.timeRangeLabel ? (
              <div css={styles.pill}>
                <Text typography="bodySmall1" color="systemGrayscale60">
                  {widget.timeRangeLabel}
                </Text>
              </div>
            ) : null}
          </div>
          {widget.description ? (
            <Text typography="bodyRegular" color="systemGrayscale60">
              {widget.description}
            </Text>
          ) : null}
        </div>

        <div
          css={{
            ...styles.controls,
            ...(isToolbarVisible || isDragging ? styles.controlsVisible : {}),
          }}
          onMouseEnter={() => setIsToolbarVisible(true)}
          onMouseLeave={() => setIsToolbarVisible(false)}
          onFocusCapture={() => setIsToolbarVisible(true)}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsToolbarVisible(false);
            }
          }}
        >
          <div css={styles.layoutControl} aria-label={`${widget.title} width`}>
            <div css={styles.layoutOptionWrap}>
              <button
                type="button"
                data-layout-trigger
                aria-label={`Set ${widget.title} to one column`}
                aria-pressed={widget.layout === 'half'}
                css={{
                  ...styles.layoutOption,
                  ...(widget.layout === 'half' ? styles.layoutOptionActive : {}),
                }}
                onClick={() => onLayoutChange(widget.id, 'half')}
              >
                <DashboardLayoutGlyph layout="half" />
              </button>
              <div data-layout-tooltip css={{ ...styles.layoutTooltip, ...(isDragging ? styles.layoutTooltipHidden : {}) }}>
                <Text typography="bodySmall1">One column</Text>
              </div>
            </div>
            <div css={styles.layoutOptionWrap}>
              <button
                type="button"
                data-layout-trigger
                aria-label={`Set ${widget.title} to full width`}
                aria-pressed={widget.layout === 'full'}
                css={{
                  ...styles.layoutOption,
                  ...(widget.layout === 'full' ? styles.layoutOptionActive : {}),
                }}
                onClick={() => onLayoutChange(widget.id, 'full')}
              >
                <DashboardLayoutGlyph layout="full" />
              </button>
              <div data-layout-tooltip css={{ ...styles.layoutTooltip, ...(isDragging ? styles.layoutTooltipHidden : {}) }}>
                <Text typography="bodySmall1">Full width</Text>
              </div>
            </div>
          </div>
          <div css={styles.iconButtonWrap}>
            <button
              type="button"
              data-toolbar-trigger
              aria-label={`Re-order ${widget.title}`}
              css={{
                ...styles.iconButton,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              {...attributes}
              {...listeners}
            >
              <GrabIcon css={styles.iconGlyph} />
            </button>
            <div data-toolbar-tooltip css={{ ...styles.layoutTooltip, ...(isDragging ? styles.layoutTooltipHidden : {}) }}>
              <Text typography="bodySmall1">Re-order</Text>
            </div>
          </div>
          <div css={styles.iconButtonWrap}>
            <button
              type="button"
              data-toolbar-trigger
              aria-label={`Delete ${widget.title}`}
              css={styles.iconButton}
              onClick={() => onRemove(widget.id)}
            >
              <TrashIcon css={styles.iconGlyph} />
            </button>
            <div data-toolbar-tooltip css={{ ...styles.layoutTooltip, ...(isDragging ? styles.layoutTooltipHidden : {}) }}>
              <Text typography="bodySmall1">Delete</Text>
            </div>
          </div>
        </div>
      </div>

      <div css={styles.body}>
        <DashboardWidgetRenderer widget={widget} />
      </div>
    </article>
  );
}
