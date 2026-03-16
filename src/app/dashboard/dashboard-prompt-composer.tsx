'use client';

import { useTheme } from '@instacart/ids-core';
import {
  ButtonBase,
  ModalContent,
  ModalFixedSize,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SecondaryButtonSmall,
  Text,
  useModalState,
} from '@instacart/ids-customers';
import { useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { PrimaryButtonSmall } from '@/app/components/ui/buttons';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import type { SupportedWidgetType } from '@/app/dashboard/dashboard-builder-types';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';

function useStyles() {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return {
    contentLayout: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '18px',
      paddingTop: '8px',
    },
    introBlock: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
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
    },
    widgetOption: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      padding: '14px 16px',
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
      flexDirection: 'column' as const,
      gap: '4px',
      minWidth: 0,
      flex: 1,
    },
    widgetActionText: {
      color: businessPalette.elderberryDark,
      flexShrink: 0,
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

type DashboardPromptComposerModalProps = Omit<DashboardPromptComposerProps, 'isOpen'>;

export function DashboardPromptComposer({ isOpen, ...props }: DashboardPromptComposerProps) {
  if (!isOpen) {
    return null;
  }

  return <DashboardPromptComposerModal {...props} />;
}

function DashboardPromptComposerModal({
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
}: DashboardPromptComposerModalProps) {
  const styles = useStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const modal = useModalState({ visible: true });
  const accessibleLabels = { close: 'Close builder' };

  useEffect(() => {
    if (!modal.visible && !isGenerating) {
      onClose();
    }
  }, [isGenerating, modal.visible, onClose]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      onPromptSubmit();
    }
  }

  return (
    <ModalFixedSize modal={modal} hideOnClickOutside={!isGenerating} hideOnEsc={!isGenerating}>
      <ModalHeader hide={modal.hide} accessibleLabels={accessibleLabels} onClick={onClose} disabled={isGenerating}>
        <ModalTitle>Create a new dashboard widget</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <div css={styles.contentLayout}>
          <div css={styles.introBlock}>
            <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
              Add to dashboard
            </Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              Choose from the visualization library or describe the chart or summary widget you want to add. Each request focuses on a
              single dashboard widget for a clear result.
            </Text>
          </div>

          <div css={styles.pillRow}>
            <div css={styles.heroPill}>
              <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
                Focused requests
              </Text>
            </div>
            <div
              css={{
                ...styles.heroPill,
                borderColor: businessPalette.blueberryBorder,
                backgroundColor: businessPalette.blueberrySoft,
              }}
            >
              <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
                Supported widget library
              </Text>
            </div>
          </div>

          <div css={styles.quickAddPanel}>
            <div css={styles.header}>
              <Text typography="bodyEmphasized">Visualization library</Text>
              <Text typography="bodyRegular" color="systemGrayscale60">
                Add a supported chart or summary widget instantly, or use the prompt below to generate one from a request.
              </Text>
            </div>
            <div css={styles.widgetCatalog}>
              {supportedWidgets.map(widget => (
                <ButtonBase key={widget.type} onClick={() => onQuickAdd(widget.type)} css={styles.widgetOption}>
                  <div css={styles.widgetOptionLabel}>
                    <Text typography="bodyEmphasized">{widget.label}</Text>
                    <Text typography="bodySmall1" color="systemGrayscale60">
                      {widget.promptHint}
                    </Text>
                  </div>
                  <Text typography="bodySmall1" css={styles.widgetActionText}>
                    Add
                  </Text>
                </ButtonBase>
              ))}
            </div>
          </div>

          <Text typography="bodyRegular" color="systemGrayscale60">
            Describe a widget
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
        </div>
      </ModalContent>
      <ModalFooter>
        <div css={styles.buttonRow}>
          <PrimaryButtonSmall onClick={onPromptSubmit} disabled={isGenerating} css={styles.primaryAction}>
            {isGenerating ? 'Creating widget...' : 'Create widget'}
          </PrimaryButtonSmall>
          <SecondaryButtonSmall onClick={onClose} disabled={isGenerating}>
            Cancel
          </SecondaryButtonSmall>
          <Text typography="bodySmall1" color="systemGrayscale60">
            Tip: press Cmd/Ctrl + Enter to submit.
          </Text>
        </div>
      </ModalFooter>
    </ModalFixedSize>
  );
}
