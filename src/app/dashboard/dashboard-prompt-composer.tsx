'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import {
  ButtonBase,
  ModalBase,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalInnerWrapper,
  ModalTitle,
  Text,
  useModalState,
} from '@instacart/ids-customers';
import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import type { DashboardWidget, SupportedWidgetType } from '@/app/dashboard/dashboard-builder-types';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';
import { DashboardWidgetRenderer } from '@/app/dashboard/dashboard-widget-renderer';

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
    modalMotionShell: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      transformOrigin: '50% 18%',
      willChange: 'transform, opacity',
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
    previewLayout: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    previewPromptPanel: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: '18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: businessPalette.canvasGradient,
    },
    previewWidgetCard: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '18px',
      padding: '20px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 14px 34px rgba(17, 24, 39, 0.08)',
    },
    previewWidgetHeader: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '14px',
      [responsive.up('r')]: {
        flexDirection: 'row' as const,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      },
    },
    previewWidgetHeaderCopy: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
      minWidth: 0,
      flex: 1,
    },
    previewWidgetMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap' as const,
      flexShrink: 0,
    },
    previewWidgetBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '7px 10px',
      borderRadius: '999px',
      border: `1px solid ${businessPalette.blueberryBorder}`,
      backgroundColor: businessPalette.blueberrySoft,
    },
    previewWidgetBadgeAccent: {
      borderColor: businessPalette.elderberryBorder,
      backgroundColor: businessPalette.elderberrySoft,
    },
    previewWidgetCanvas: {
      minHeight: '320px',
      padding: '18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${businessPalette.blueberryBorder}`,
      background: 'linear-gradient(180deg, rgba(43, 120, 198, 0.04) 0%, rgba(255, 255, 255, 1) 100%)',
      overflow: 'hidden' as const,
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
      boxSizing: 'border-box' as const,
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
      borderWidth: '2px',
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
      display: 'grid',
      gap: '12px',
      width: '100%',
      gridTemplateColumns: 'minmax(0, 1fr)',
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      },
    },
    buttonRowPreview: {
      [responsive.up('r')]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    footerButtonBase: {
      appearance: 'none' as const,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '48px',
      padding: '0 18px',
      borderRadius: theme.radius.r12,
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      backgroundColor: theme.colors.systemGrayscale00,
      color: theme.colors.systemGrayscale90,
      font: 'inherit',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease',
      '&:hover:not(:disabled)': {
        transform: 'translateY(-1px)',
        boxShadow: '0 12px 24px rgba(17, 24, 39, 0.08)',
      },
      '&:focus-visible': {
        outline: `2px solid ${businessPalette.blueberry}`,
        outlineOffset: '3px',
      },
      '&:disabled': {
        opacity: 0.58,
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    },
    footerPrimaryButton: {
      backgroundColor: businessPalette.elderberry,
      borderColor: businessPalette.elderberry,
      color: theme.colors.systemGrayscale00,
      '&:hover:not(:disabled)': {
        backgroundColor: businessPalette.elderberryDark,
        borderColor: businessPalette.elderberryDark,
      },
    },
    footerSecondaryButton: {
      borderColor: businessPalette.blueberryBorder,
      backgroundColor: businessPalette.blueberrySoft,
      color: businessPalette.blueberryDark,
      '&:hover:not(:disabled)': {
        borderColor: businessPalette.blueberry,
        backgroundColor: theme.colors.systemGrayscale00,
      },
    },
    footerNeutralButton: {
      '&:hover:not(:disabled)': {
        borderColor: theme.colors.systemGrayscale30,
      },
    },
  } as const;
}

interface DashboardPromptComposerProps {
  isOpen: boolean;
  prompt: string;
  isGenerating: boolean;
  pendingAction?: 'generate' | 'preview' | null;
  errorMessage?: string | null;
  previewWidget?: DashboardWidget | null;
  promptSuggestions: string[];
  supportedWidgets: SupportedWidgetDefinition[];
  selectedWidgetTypes: SupportedWidgetType[];
  onPromptChange: (value: string) => void;
  onPromptSubmit: () => void;
  onPreviewSubmit: () => void;
  onPreviewBack: () => void;
  onPreviewConfirm: () => void;
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
  pendingAction,
  errorMessage,
  previewWidget,
  promptSuggestions,
  supportedWidgets,
  selectedWidgetTypes,
  onPromptChange,
  onPromptSubmit,
  onPreviewSubmit,
  onPreviewBack,
  onPreviewConfirm,
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
  const prefersReducedMotion = useReducedMotion();
  const isPreviewMode = Boolean(previewWidget);
  const isPreviewLoading = isGenerating && pendingAction === 'preview';
  const isGenerateLoading = isGenerating && pendingAction === 'generate';

  const shellAnimation = prefersReducedMotion
    ? {
        initial: false,
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
        },
      }
    : {
        initial: {
          opacity: 0,
          y: 28,
          scale: 0.96,
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring' as const,
            stiffness: 340,
            damping: 30,
            mass: 0.92,
          },
        },
      };

  const sectionTransition = prefersReducedMotion
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
            duration: 0.32,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        },
      };

  useEffect(() => {
    if (!modal.visible && !isGenerating) {
      onClose();
    }
  }, [isGenerating, modal.visible, onClose]);

  return (
    <ModalBase
      modal={modal}
      styles={styles.modalStyles}
      isMounted
      hideOnClickOutside={!isGenerating}
      hideOnEsc={!isGenerating}
    >
      <ModalInnerWrapper as={motion.div} css={styles.modalMotionShell} initial={shellAnimation.initial} animate={shellAnimation.animate}>
        <motion.div initial={sectionTransition?.initial} animate={sectionTransition?.animate}>
          <ModalHeader hide={modal.hide} accessibleLabels={accessibleLabels} onClick={modal.hide} disabled={isGenerating}>
            <ModalTitle>{isPreviewMode ? 'Preview Widget' : 'Widget Builder'}</ModalTitle>
          </ModalHeader>
        </motion.div>
        <ModalContent>
          <motion.div css={styles.contentLayout} initial={sectionTransition?.initial} animate={sectionTransition?.animate}>
            <motion.div initial={sectionTransition?.initial} animate={sectionTransition?.animate}>
              <div css={styles.introBlock}>
                <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
                  {isPreviewMode ? 'Preview' : 'Builder'}
                </Text>
                <Text typography="bodyRegular" color="systemGrayscale60">
                  {isPreviewMode
                    ? 'Review the generated widget before it lands on the dashboard. You can go back to refine the request or confirm the add.'
                    : 'Prompt a single widget and guide the AI by selecting which widget types it is allowed to use for this request.'}
                </Text>
              </div>
            </motion.div>

            {previewWidget ? (
              <motion.div
                initial={sectionTransition?.initial}
                animate={{
                  ...sectionTransition?.animate,
                  transition: prefersReducedMotion
                    ? undefined
                    : {
                        duration: 0.38,
                        delay: 0.06,
                        ease: [0.22, 1, 0.36, 1] as const,
                      },
                }}
              >
                <div css={styles.previewLayout}>
                  <div css={styles.previewPromptPanel}>
                    <Text typography="bodySmall1" css={styles.helperText}>
                      Prompt
                    </Text>
                    <Text typography="bodyRegular">{prompt.trim()}</Text>
                  </div>

                  <div css={styles.previewWidgetCard}>
                    <div css={styles.previewWidgetHeader}>
                      <div css={styles.previewWidgetHeaderCopy}>
                        <Text typography="bodyEmphasized">{previewWidget.title}</Text>
                        {previewWidget.description ? (
                          <Text typography="bodySmall1" css={styles.helperText}>
                            {previewWidget.description}
                          </Text>
                        ) : null}
                      </div>
                      <div css={styles.previewWidgetMeta}>
                        {previewWidget.timeRangeLabel ? (
                          <div css={styles.previewWidgetBadge}>
                            <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
                              {previewWidget.timeRangeLabel}
                            </Text>
                          </div>
                        ) : null}
                        <div css={{ ...styles.previewWidgetBadge, ...styles.previewWidgetBadgeAccent }}>
                          <Text typography="bodySmall1" css={{ color: businessPalette.elderberryDark }}>
                            {getWidgetLayoutLabel(previewWidget.layout)}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div css={styles.previewWidgetCanvas}>
                      <DashboardWidgetRenderer widget={previewWidget} />
                    </div>
                  </div>

                  <Text typography="bodySmall1" css={styles.helperText}>
                    Looks right? Add it to the dashboard or go back to refine the prompt and allowed widget types.
                  </Text>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={sectionTransition?.initial}
                  animate={{
                    ...sectionTransition?.animate,
                    transition: prefersReducedMotion
                      ? undefined
                      : {
                          duration: 0.38,
                          delay: 0.06,
                          ease: [0.22, 1, 0.36, 1] as const,
                        },
                  }}
                >
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
                            <div css={styles.widgetPreviewSurface}>
                              {renderWidgetPreview(widget.type, styles, businessPalette, theme.colors.systemGrayscale00)}
                            </div>
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
                                <Text
                                  typography="bodySmall1"
                                  css={{ color: isSelected ? businessPalette.elderberryDark : businessPalette.blueberryDark }}
                                >
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
                </motion.div>

                <motion.div
                  initial={sectionTransition?.initial}
                  animate={{
                    ...sectionTransition?.animate,
                    transition: prefersReducedMotion
                      ? undefined
                      : {
                          duration: 0.34,
                          delay: 0.1,
                          ease: [0.22, 1, 0.36, 1] as const,
                        },
                  }}
                >
                  <div css={styles.section}>
                    <Text typography="bodyEmphasized">Describe the widget</Text>
                    <label css={styles.section}>
                      <Text typography="bodySmall1" css={styles.helperText}>
                        Prompt
                      </Text>
                      <textarea
                        value={prompt}
                        onChange={event => onPromptChange(event.target.value)}
                        placeholder="Example: Add a line chart showing spend over the last 8 weeks."
                        css={styles.textarea}
                        autoFocus
                      />
                    </label>
                  </div>
                </motion.div>

                <motion.div
                  initial={sectionTransition?.initial}
                  animate={{
                    ...sectionTransition?.animate,
                    transition: prefersReducedMotion
                      ? undefined
                      : {
                          duration: 0.34,
                          delay: 0.14,
                          ease: [0.22, 1, 0.36, 1] as const,
                        },
                  }}
                >
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
                </motion.div>
              </>
            )}

            {errorMessage ? (
              <motion.div initial={sectionTransition?.initial} animate={sectionTransition?.animate}>
                <Text typography="bodyRegular" css={styles.errorText}>
                  {errorMessage}
                </Text>
              </motion.div>
            ) : null}
          </motion.div>
        </ModalContent>
        <motion.div
          initial={sectionTransition?.initial}
          animate={{
            ...sectionTransition?.animate,
            transition: prefersReducedMotion
              ? undefined
              : {
                  duration: 0.32,
                  delay: 0.16,
                  ease: [0.22, 1, 0.36, 1] as const,
                },
          }}
        >
          <ModalFooter>
            <div css={{ ...styles.buttonRow, ...(isPreviewMode ? styles.buttonRowPreview : {}) }}>
              {isPreviewMode ? (
                <>
                  <button
                    type="button"
                    onClick={onPreviewBack}
                    disabled={isGenerating}
                    css={{ ...styles.footerButtonBase, ...styles.footerNeutralButton }}
                  >
                    Back to builder
                  </button>
                  <button
                    type="button"
                    onClick={onPreviewConfirm}
                    disabled={isGenerating}
                    css={{ ...styles.footerButtonBase, ...styles.footerPrimaryButton }}
                  >
                    Add widget
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onPreviewSubmit}
                    disabled={isSubmitDisabled}
                    css={{ ...styles.footerButtonBase, ...styles.footerSecondaryButton }}
                  >
                    {isPreviewLoading ? 'Previewing widget...' : 'Preview widget'}
                  </button>
                  <button
                    type="button"
                    onClick={onPromptSubmit}
                    disabled={isSubmitDisabled}
                    css={{ ...styles.footerButtonBase, ...styles.footerPrimaryButton }}
                  >
                    {isGenerateLoading ? 'Generating widget...' : 'Generate widget'}
                  </button>
                  <button
                    type="button"
                    onClick={modal.hide}
                    disabled={isGenerating}
                    css={{ ...styles.footerButtonBase, ...styles.footerNeutralButton }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </ModalFooter>
        </motion.div>
      </ModalInnerWrapper>
    </ModalBase>
  );
}

function getWidgetLayoutLabel(layout: DashboardWidget['layout']) {
  return layout === 'full' ? 'Full width on dashboard' : 'One column on dashboard';
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
