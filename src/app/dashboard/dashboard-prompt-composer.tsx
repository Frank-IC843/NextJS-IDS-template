'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import {
  ButtonBase,
  ModalBase,
  ModalContent,
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
    modalStyles: {
      modal: {
        width: 'min(1200px, calc(100vw - 32px))',
        maxWidth: 'none',
        height: 'min(860px, calc(100vh - 32px))',
      },
    },
    contentLayout: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
      paddingTop: '8px',
    },
    introBlock: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      maxWidth: '46rem',
    },
    eyebrow: {
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap' as const,
    },
    widgetTypePanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '14px',
      padding: '18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: businessPalette.canvasGradient,
    },
    widgetCatalog: {
      display: 'grid',
      gap: '14px',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    widgetOption: {
      appearance: 'none' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'stretch',
      gap: '12px',
      width: '100%',
      minWidth: 0,
      minHeight: '188px',
      padding: '14px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      textAlign: 'left' as const,
      cursor: 'pointer',
      overflow: 'visible' as const,
      font: 'inherit',
      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: businessPalette.blueberry,
        boxShadow: '0 12px 26px rgba(17, 24, 39, 0.06)',
      },
      '&:focus-visible': {
        outline: `2px solid ${businessPalette.blueberry}`,
        outlineOffset: '3px',
      },
    },
    widgetOptionSelected: {
      borderColor: businessPalette.elderberry,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      boxShadow: '0 14px 28px rgba(110, 72, 229, 0.12)',
    },
    widgetOptionHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      minWidth: 0,
    },
    widgetOptionText: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
      minWidth: 0,
      flex: 1,
    },
    widgetOptionStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: businessPalette.blueberrySoft,
      flexShrink: 0,
    },
    widgetOptionStatusSelected: {
      borderColor: businessPalette.elderberryBorder,
      backgroundColor: businessPalette.elderberrySoft,
    },
    widgetPreviewSurface: {
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      height: '118px',
      flexShrink: 0,
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: 'linear-gradient(180deg, rgba(43, 120, 198, 0.05) 0%, rgba(255, 255, 255, 0.96) 100%)',
      overflow: 'hidden' as const,
      padding: '12px',
    },
    previewMetric: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      gap: '8px',
      width: '100%',
      height: '100%',
    },
    previewMetricTag: {
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      padding: '6px 8px',
      borderRadius: '999px',
      backgroundColor: businessPalette.elderberrySoft,
      border: `1px solid ${businessPalette.elderberryBorder}`,
    },
    previewMetricFooter: {
      display: 'grid',
      gap: '6px',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      alignItems: 'end',
    },
    previewMetricBar: {
      borderRadius: '999px 999px 4px 4px',
      background: 'linear-gradient(180deg, rgba(110, 72, 229, 0.92) 0%, rgba(43, 120, 198, 0.76) 100%)',
    },
    previewChartSvg: {
      width: '100%',
      height: '100%',
      display: 'block',
    },
    previewBarChart: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      width: '100%',
      height: '100%',
    },
    previewBarColumn: {
      flex: 1,
      borderRadius: '999px 999px 4px 4px',
      background: 'linear-gradient(180deg, rgba(110, 72, 229, 0.92) 0%, rgba(43, 120, 198, 0.76) 100%)',
    },
    previewDonutWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      width: '100%',
      height: '100%',
    },
    previewDonut: {
      width: '72px',
      height: '72px',
      borderRadius: '999px',
      background:
        'conic-gradient(#6E48E5 0deg 132deg, #2B78C6 132deg 262deg, rgba(43, 120, 198, 0.2) 262deg 360deg)',
      position: 'relative' as const,
      flexShrink: 0,
      '&::after': {
        content: '""',
        position: 'absolute' as const,
        inset: '16px',
        borderRadius: '999px',
        backgroundColor: theme.colors.systemGrayscale00,
      },
    },
    previewLegend: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      flex: 1,
      minWidth: 0,
    },
    previewLegendRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    previewLegendDot: {
      width: '8px',
      height: '8px',
      borderRadius: '999px',
      flexShrink: 0,
    },
    previewLegendBar: {
      height: '8px',
      borderRadius: '999px',
      flex: 1,
      backgroundColor: businessPalette.blueberrySoft,
    },
    previewInsightList: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      gap: '10px',
      width: '100%',
      height: '100%',
    },
    previewInsightRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    previewInsightDot: {
      width: '8px',
      height: '8px',
      borderRadius: '999px',
      backgroundColor: businessPalette.elderberry,
      flexShrink: 0,
    },
    previewInsightLine: {
      height: '9px',
      borderRadius: '999px',
      backgroundColor: businessPalette.blueberrySoft,
    },
    textarea: {
      width: '100%',
      minHeight: '148px',
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
    helperText: {
      color: theme.colors.systemGrayscale60,
    },
    warningText: {
      color: '#B42318',
    },
    errorText: {
      color: '#B42318',
    },
    buttonRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '12px',
      alignItems: 'center',
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
  selectedWidgetTypes: SupportedWidgetType[];
  onPromptChange: (value: string) => void;
  onPromptSubmit: () => void;
  onPromptSuggestionClick: (suggestion: string) => void;
  onWidgetTypeToggle: (widgetType: SupportedWidgetType) => void;
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
  selectedWidgetTypes,
  onPromptChange,
  onPromptSubmit,
  onPromptSuggestionClick,
  onWidgetTypeToggle,
  onClose,
}: DashboardPromptComposerModalProps) {
  const styles = useStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const modal = useModalState({ visible: true });
  const accessibleLabels = { close: 'Close builder' };
  const isSubmitDisabled = isGenerating || selectedWidgetTypes.length === 0;

  useEffect(() => {
    if (!modal.visible && !isGenerating) {
      onClose();
    }
  }, [isGenerating, modal.visible, onClose]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !isSubmitDisabled) {
      event.preventDefault();
      onPromptSubmit();
    }
  }

  return (
    <ModalBase
      modal={modal}
      styles={styles.modalStyles}
      hideOnClickOutside={!isGenerating}
      hideOnEsc={!isGenerating}
    >
      <ModalHeader hide={modal.hide} accessibleLabels={accessibleLabels} onClick={() => onClose()} disabled={isGenerating}>
        <ModalTitle>Build a dashboard widget</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <div css={styles.contentLayout}>
          <div css={styles.introBlock}>
            <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
              Builder
            </Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              Prompt a single widget and guide the AI by selecting which widget types it is allowed to use for this request.
            </Text>
          </div>

          <div css={styles.widgetTypePanel}>
            <div css={styles.sectionHeader}>
              <div css={styles.section}>
                <Text typography="bodyEmphasized">Widget types the AI can use</Text>
                <Text typography="bodySmall1" css={styles.helperText}>
                  Select one or more widget types. The AI will stay within this set when generating the widget.
                </Text>
              </div>
              <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
                {selectedWidgetTypes.length} of {supportedWidgets.length} enabled
              </Text>
            </div>

            <div css={styles.widgetCatalog}>
              {supportedWidgets.map(widget => {
                const isSelected = selectedWidgetTypes.includes(widget.type);

                return (
                  <button
                    type="button"
                    key={widget.type}
                    onClick={() => onWidgetTypeToggle(widget.type)}
                    aria-pressed={isSelected}
                    css={{
                      ...styles.widgetOption,
                      ...(isSelected ? styles.widgetOptionSelected : {}),
                    }}
                  >
                    <div css={styles.widgetPreviewSurface}>{renderWidgetPreview(widget.type, styles, businessPalette, theme.colors.systemGrayscale00)}</div>
                    <div css={styles.widgetOptionHeader}>
                      <div css={styles.widgetOptionText}>
                        <Text typography="bodyEmphasized">{widget.label}</Text>
                        <Text typography="bodySmall1" css={styles.helperText}>
                          {widget.promptHint}
                        </Text>
                      </div>
                      <div
                        css={{
                          ...styles.widgetOptionStatus,
                          ...(isSelected ? styles.widgetOptionStatusSelected : {}),
                        }}
                      >
                        <Text typography="bodySmall1" css={{ color: isSelected ? businessPalette.elderberryDark : businessPalette.blueberryDark }}>
                          {isSelected ? 'Enabled' : 'Off'}
                        </Text>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedWidgetTypes.length === 0 ? (
              <Text typography="bodySmall1" css={styles.warningText}>
                Select at least one widget type to continue.
              </Text>
            ) : null}
          </div>

          <div css={styles.section}>
            <Text typography="bodyEmphasized">Describe the widget</Text>
            <label css={styles.section}>
              <Text typography="bodySmall1" css={styles.helperText}>
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
          </div>

          <div css={styles.section}>
            <Text typography="bodySmall1" css={styles.helperText}>
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
          <PrimaryButtonSmall onClick={onPromptSubmit} disabled={isSubmitDisabled} css={styles.primaryAction}>
            {isGenerating ? 'Generating widget...' : 'Generate widget'}
          </PrimaryButtonSmall>
          <SecondaryButtonSmall onClick={() => onClose()} disabled={isGenerating}>
            Cancel
          </SecondaryButtonSmall>
          <Text typography="bodySmall1" css={styles.helperText}>
            Tip: press Cmd/Ctrl + Enter to submit.
          </Text>
        </div>
      </ModalFooter>
    </ModalBase>
  );
}

function renderWidgetPreview(
  widgetType: SupportedWidgetType,
  styles: ReturnType<typeof useStyles>,
  businessPalette: ReturnType<typeof getDashboardBusinessPalette>,
  canvasColor: string,
) {
  switch (widgetType) {
    case 'metric':
      return (
        <div css={styles.previewMetric}>
          <div css={styles.previewMetricTag}>
            <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
              Headline
            </Text>
          </div>
          <Text typography="headline">$18.4K</Text>
          <div css={styles.previewMetricFooter}>
            {[26, 42, 34].map(height => (
              <div key={height} css={{ ...styles.previewMetricBar, height: `${height}px` }} />
            ))}
          </div>
        </div>
      );
    case 'lineChart':
      return (
        <svg viewBox="0 0 240 96" css={styles.previewChartSvg} aria-hidden="true">
          <path d="M0 18 H240" stroke="rgba(43, 120, 198, 0.14)" strokeDasharray="5 5" />
          <path d="M0 52 H240" stroke="rgba(43, 120, 198, 0.14)" strokeDasharray="5 5" />
          <path
            d="M12 72 C46 62, 74 58, 100 50 C126 42, 152 36, 176 34 C198 32, 214 24, 228 18"
            fill="none"
            stroke="#6E48E5"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="100" cy="50" r="4" fill="#2B78C6" />
          <circle cx="176" cy="34" r="4" fill="#2B78C6" />
          <circle cx="228" cy="18" r="4" fill="#6E48E5" />
        </svg>
      );
    case 'barChart':
      return (
        <div css={styles.previewBarChart}>
          {[40, 60, 54, 72, 88].map(height => (
            <div key={height} css={{ ...styles.previewBarColumn, height: `${height}px` }} />
          ))}
        </div>
      );
    case 'donutChart':
      return (
        <div css={styles.previewDonutWrap}>
          <div css={{ ...styles.previewDonut, backgroundColor: canvasColor }} />
          <div css={styles.previewLegend}>
            <div css={styles.previewLegendRow}>
              <div css={{ ...styles.previewLegendDot, backgroundColor: businessPalette.elderberry }} />
              <div css={{ ...styles.previewLegendBar, maxWidth: '68%' }} />
            </div>
            <div css={styles.previewLegendRow}>
              <div css={{ ...styles.previewLegendDot, backgroundColor: businessPalette.blueberry }} />
              <div css={{ ...styles.previewLegendBar, maxWidth: '82%' }} />
            </div>
            <div css={styles.previewLegendRow}>
              <div css={{ ...styles.previewLegendDot, backgroundColor: 'rgba(43, 120, 198, 0.32)' }} />
              <div css={{ ...styles.previewLegendBar, maxWidth: '52%' }} />
            </div>
          </div>
        </div>
      );
    case 'insightList':
    default:
      return (
        <div css={styles.previewInsightList}>
          {[76, 92, 64].map(width => (
            <div key={width} css={styles.previewInsightRow}>
              <div css={styles.previewInsightDot} />
              <div css={{ ...styles.previewInsightLine, width: `${width}%` }} />
            </div>
          ))}
        </div>
      );
  }
}
