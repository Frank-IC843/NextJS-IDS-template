'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import { ButtonBase, SecondaryButtonSmall, Text } from '@instacart/ids-customers';
import { useEffect, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import type { SupportedWidgetType } from '@/app/dashboard/dashboard-builder-types';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';

function useStyles() {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return {
    backdrop: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: 'rgba(17, 24, 39, 0.44)',
      backdropFilter: 'blur(6px)',
    },
    modalCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '18px',
      width: 'min(880px, 100%)',
      maxHeight: 'min(88vh, 920px)',
      overflowY: 'auto' as const,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      borderRadius: theme.radius.r12,
      padding: '24px',
      background:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 247, 248, 0.98) 100%)',
      boxShadow: '0 28px 80px rgba(17, 24, 39, 0.22)',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
    },
    modalTitleGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      maxWidth: '620px',
    },
    eyebrow: {
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    pillRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap' as const,
    },
    heroPill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.elderberryBorder}`,
      backgroundColor: businessPalette.elderberrySoft,
    },
    quickAddPanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: businessPalette.canvasGradient,
      padding: '18px',
    },
    header: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },
    textarea: {
      width: '100%',
      minHeight: '136px',
      resize: 'vertical' as const,
      borderRadius: theme.radius.r12,
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      padding: '16px 18px',
      font: 'inherit',
      color: theme.colors.systemGrayscale90,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      '&:focus': {
        outline: `2px solid ${businessPalette.blueberry}`,
        outlineOffset: '2px',
      },
      '&::placeholder': {
        color: theme.colors.systemGrayscale50,
      },
    },
    buttonRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '12px',
      alignItems: 'center',
    },
    hintRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
    },
    suggestionChip: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '10px 14px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: businessPalette.blueberrySoft,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: businessPalette.blueberry,
        backgroundColor: theme.colors.systemGrayscale00,
      },
    },
    widgetCatalog: {
      display: 'grid',
      gap: '12px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    widgetOption: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      padding: '16px',
      textAlign: 'left' as const,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: businessPalette.blueberry,
        boxShadow: '0 10px 24px rgba(17, 24, 39, 0.06)',
      },
    },
    widgetOptionLabel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    },
    widgetBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '999px',
      backgroundColor: businessPalette.elderberrySoft,
      border: `1px solid ${businessPalette.elderberryBorder}`,
    },
    errorText: {
      color: '#B42318',
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
    closeButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '40px',
      height: '40px',
      borderRadius: '999px',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      backgroundColor: theme.colors.systemGrayscale00,
      cursor: 'pointer',
    },
  } as const;
}

interface DashboardPromptComposerProps {
  isOpen: boolean;
  prompt: string;
  isGenerating: boolean;
  errorMessage?: string | null;
  promptSuggestions: string[];
  supportedWidgets: SupportedWidgetDefinition[];
  onPromptChange: (value: string) => void;
  onPromptSubmit: () => void;
  onPromptSuggestionClick: (suggestion: string) => void;
  onQuickAdd: (widgetType: SupportedWidgetType) => void;
  onClose: () => void;
}

export function DashboardPromptComposer({
  isOpen,
  prompt,
  isGenerating,
  errorMessage,
  promptSuggestions,
  supportedWidgets,
  onPromptChange,
  onPromptSubmit,
  onPromptSuggestionClick,
  onQuickAdd,
  onClose,
}: DashboardPromptComposerProps) {
  const styles = useStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isGenerating) {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isGenerating, isOpen, onClose]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      onPromptSubmit();
    }
  }

  function handleBackdropClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isGenerating) {
      onClose();
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div css={styles.backdrop} onClick={handleBackdropClick}>
      <section css={styles.modalCard} role="dialog" aria-modal="true" aria-label="Add one dashboard widget">
        <div css={styles.modalHeader}>
          <div css={styles.modalTitleGroup}>
            <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
              Add to dashboard
            </Text>
            <Text typography="titleMedium">Create a new dashboard card</Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              Choose from the visualization library or describe the chart or summary card you want to add. Each request focuses on a
              single dashboard card for a clear result.
            </Text>
          </div>
          <button type="button" aria-label="Close builder" onClick={onClose} css={styles.closeButton}>
            <Text typography="bodySmall1" color="systemGrayscale70">
              Close
            </Text>
          </button>
        </div>

        <div css={styles.pillRow}>
          <div css={styles.heroPill}>
            <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
              Focused requests
            </Text>
          </div>
          <div css={{ ...styles.heroPill, borderColor: businessPalette.blueberryBorder, backgroundColor: businessPalette.blueberrySoft }}>
            <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
              Supported card library
            </Text>
          </div>
        </div>

        <div css={styles.quickAddPanel}>
          <div css={styles.header}>
            <Text typography="bodyEmphasized">Visualization library</Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              Add a supported chart or summary card instantly, or use the prompt below to generate one from a request.
            </Text>
          </div>
          <div css={styles.widgetCatalog}>
            {supportedWidgets.map(widget => (
              <ButtonBase key={widget.type} onClick={() => onQuickAdd(widget.type)} css={styles.widgetOption}>
                <div css={styles.widgetOptionLabel}>
                  <Text typography="bodyEmphasized">{widget.label}</Text>
                  <div css={styles.widgetBadge}>
                    <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
                      Add
                    </Text>
                  </div>
                </div>
                <Text typography="bodyRegular" color="systemGrayscale70">
                  {widget.description}
                </Text>
                <Text typography="bodySmall1" color="systemGrayscale60">
                  {widget.promptHint}
                </Text>
              </ButtonBase>
            ))}
          </div>
        </div>

        <Text typography="bodyRegular" color="systemGrayscale60">
          Describe a card
        </Text>

        <label css={styles.header}>
          <Text typography="bodySmall1" color="systemGrayscale60">
            Prompt
          </Text>
          <textarea
            value={prompt}
            onChange={event => onPromptChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Example: Add a line chart showing spend over the last 8 weeks."
            css={styles.textarea}
            autoFocus
          />
        </label>

        <div css={styles.header}>
          <Text typography="bodySmall1" color="systemGrayscale60">
            Example requests
          </Text>
          <div css={styles.hintRow}>
            {promptSuggestions.map(suggestion => (
              <ButtonBase
                key={suggestion}
                onClick={() => onPromptSuggestionClick(suggestion)}
                css={styles.suggestionChip}
              >
                <Text typography="bodyRegular">{suggestion}</Text>
              </ButtonBase>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <Text typography="bodyRegular" css={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}

        <div css={styles.buttonRow}>
          <PrimaryButtonSmall onClick={onPromptSubmit} disabled={isGenerating} css={styles.primaryAction}>
            {isGenerating ? 'Creating card...' : 'Create card'}
          </PrimaryButtonSmall>
          <SecondaryButtonSmall onClick={onClose} disabled={isGenerating}>
            Cancel
          </SecondaryButtonSmall>
          <Text typography="bodySmall1" color="systemGrayscale60">
            Tip: press Cmd/Ctrl + Enter to submit.
          </Text>
        </div>

      </section>
    </div>
  );
}
