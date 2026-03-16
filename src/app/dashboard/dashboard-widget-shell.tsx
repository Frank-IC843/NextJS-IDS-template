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
    },
    layoutControl: {
      display: 'inline-grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '4px',
      padding: '4px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
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
            <button
              type="button"
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
            <button
              type="button"
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
          </div>
          <button type="button" aria-label={`Drag ${widget.title}`} css={styles.iconButton} {...attributes} {...listeners}>
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
