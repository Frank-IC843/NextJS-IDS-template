'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { DashboardWidgetRenderer } from '@/app/dashboard/dashboard-widget-renderer';
import type { DashboardLayout, DashboardWidget } from '@/app/dashboard/dashboard-builder-types';

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
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
    },
    titleGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      minWidth: 0,
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
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0,
      overflow: 'visible' as const,
    },
    layoutControl: {
      display: 'inline-grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '4px',
      padding: '4px',
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
    layoutGlyphHalf: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '2px',
      width: '16px',
      height: '10px',
    },
    layoutGlyphFull: {
      display: 'flex',
      width: '16px',
      height: '10px',
    },
    layoutGlyphBar: {
      flex: 1,
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: 'rgba(43, 120, 198, 0.16)',
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
    iconButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '40px',
      height: '40px',
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
    },
    gripDots: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 4px)',
      gap: '3px',
    },
    gripDot: {
      width: '4px',
      height: '4px',
      borderRadius: '999px',
      backgroundColor: businessPalette.elderberryDark,
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
        <div css={styles.titleGroup}>
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

        <div css={styles.controls}>
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
                <div css={styles.layoutGlyphHalf}>
                  <div css={styles.layoutGlyphBar} />
                  <div css={styles.layoutGlyphBar} />
                </div>
              </button>
              <div data-layout-tooltip css={styles.layoutTooltip}>
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
                <div css={styles.layoutGlyphFull}>
                  <div css={styles.layoutGlyphBar} />
                </div>
              </button>
              <div data-layout-tooltip css={styles.layoutTooltip}>
                <Text typography="bodySmall1">Full width</Text>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label={`Drag ${widget.title}`}
            css={{
              ...styles.iconButton,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            {...attributes}
            {...listeners}
          >
            <div css={styles.gripDots}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} css={styles.gripDot} />
              ))}
            </div>
          </button>
          <button type="button" aria-label={`Remove ${widget.title}`} css={styles.iconButton} onClick={() => onRemove(widget.id)}>
            <Text typography="bodySmall1" color="systemGrayscale70">
              Remove
            </Text>
          </button>
        </div>
      </div>

      <div css={styles.body}>
        <DashboardWidgetRenderer widget={widget} />
      </div>
    </article>
  );
}
