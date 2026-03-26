'use client';

import { useTheme } from '@instacart/ids-core';
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
import type { DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';
import { useDashboardPromptComposerStyles } from '@/app/dashboard/dashboard-prompt-composer.styles';
import { DashboardWidgetPlanPreview } from '@/app/dashboard/dashboard-widget-plan-preview';
import type { SupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';
import { DashboardWidgetCatalog } from '@/app/dashboard/dashboard-widget-catalog';

interface DashboardPromptComposerProps {
  isOpen: boolean;
  prompt: string;
  isGenerating: boolean;
  pendingAction?: 'generate' | 'preview' | null;
  errorMessage?: string | null;
  previewWidgets?: DashboardWidgetDraft[] | null;
  promptSuggestions: string[];
  supportedWidgets: SupportedWidgetDefinition[];
  selectedWidgetTypes: SupportedWidgetDefinition['type'][];
  currentWidgetCount: number;
  maxWidgetCount: number;
  onPromptChange: (value: string) => void;
  onPromptSubmit: () => void;
  onPreviewSubmit: () => void;
  onPreviewBack: () => void;
  onPreviewConfirm: () => void;
  onPromptSuggestionClick: (suggestion: string) => void;
  onWidgetTypeToggle: (widgetType: SupportedWidgetDefinition['type']) => void;
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
  previewWidgets,
  promptSuggestions,
  supportedWidgets,
  selectedWidgetTypes,
  currentWidgetCount,
  maxWidgetCount,
  onPromptChange,
  onPromptSubmit,
  onPreviewSubmit,
  onPreviewBack,
  onPreviewConfirm,
  onPromptSuggestionClick,
  onWidgetTypeToggle,
  onClose,
}: DashboardPromptComposerModalProps) {
  const styles = useDashboardPromptComposerStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const modal = useModalState({ visible: true });
  const accessibleLabels = { close: 'Close builder' };
  const trimmedPrompt = prompt.trim();
  const emptyPromptErrorMessage = 'Enter a prompt before generating widgets.';
  const isPromptEmpty = trimmedPrompt.length === 0;
  const displayErrorMessage = isPromptEmpty ? emptyPromptErrorMessage : errorMessage;
  const isAtCapacity = currentWidgetCount >= maxWidgetCount;
  const isSubmitDisabled = isGenerating || isPromptEmpty || selectedWidgetTypes.length === 0 || isAtCapacity;
  const prefersReducedMotion = useReducedMotion();
  const previewWidgetCount = previewWidgets?.length ?? 0;
  const isPreviewMode = previewWidgetCount > 0;
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
            <ModalTitle>{isPreviewMode ? 'Preview Medusa Widget Plan' : 'Medusa Dashboard Planner'}</ModalTitle>
          </ModalHeader>
        </motion.div>
        <ModalContent>
          <motion.div css={styles.contentLayout} initial={sectionTransition?.initial} animate={sectionTransition?.animate}>
            <motion.div initial={sectionTransition?.initial} animate={sectionTransition?.animate}>
              <div css={styles.introBlock}>
                <Text typography="bodyMedium1" css={{ ...styles.eyebrow, color: businessPalette.elderberryDark }}>
                  {isPreviewMode ? 'Preview' : 'Planner'}
                </Text>
                <Text typography="bodyRegular" color="systemGrayscale60">
                  {isPreviewMode
                    ? 'Review the planned widget set before it lands on the canvas. You can go back to refine the request or confirm the add.'
                    : 'Describe one chart or a full PM/sales dashboard. The planner stays inside the enabled widget types and maps each widget onto the current Medusa question catalog.'}
                </Text>
              </div>
            </motion.div>

            {isPreviewMode ? (
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
                    <div css={styles.sectionHeader}>
                      <div css={styles.section}>
                        <Text typography="bodyEmphasized" css={styles.fieldLabel}>
                          Prompt
                        </Text>
                        <Text typography="bodyRegular">{prompt.trim()}</Text>
                      </div>
                      <div css={styles.previewWidgetMeta}>
                        <div css={styles.previewWidgetBadge}>
                          <Text typography="bodyMedium1" css={{ color: businessPalette.blueberryDark }}>
                            {previewWidgetCount} widget{previewWidgetCount === 1 ? '' : 's'} planned
                          </Text>
                        </div>
                        <div css={{ ...styles.previewWidgetBadge, ...styles.previewWidgetBadgeAccent }}>
                          <Text typography="bodyMedium1" css={{ color: businessPalette.elderberryDark }}>
                            {currentWidgetCount + previewWidgetCount} / {maxWidgetCount} on canvas
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DashboardWidgetPlanPreview widgets={previewWidgets ?? []} />

                  <Text typography="bodyMedium1" css={styles.helperText}>
                    Looks right? Add this widget set to the canvas or go back to refine the prompt and enabled widget types.
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
                  <DashboardWidgetCatalog
                    supportedWidgets={supportedWidgets}
                    selectedWidgetTypes={selectedWidgetTypes}
                    onWidgetTypeToggle={onWidgetTypeToggle}
                  />
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
                    <Text typography="bodyEmphasized">Describe the dashboard</Text>
                    <label css={styles.section}>
                      <Text typography="bodyEmphasized" css={styles.fieldLabel}>
                        Prompt
                      </Text>
                      <textarea
                        value={prompt}
                        onChange={event => onPromptChange(event.target.value)}
                        placeholder="Example: Build a sales dashboard with a weekly health snapshot, trend, and spend-drop watchlist."
                        css={styles.textarea}
                        autoFocus
                      />
                      {isPromptEmpty ? (
                        <Text typography="bodyRegular" css={styles.errorText}>
                          {emptyPromptErrorMessage}
                        </Text>
                      ) : null}
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
                    <Text typography="bodyEmphasized" css={styles.fieldLabel}>
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

                <motion.div
                  initial={sectionTransition?.initial}
                  animate={{
                    ...sectionTransition?.animate,
                    transition: prefersReducedMotion
                      ? undefined
                      : {
                          duration: 0.34,
                          delay: 0.18,
                          ease: [0.22, 1, 0.36, 1] as const,
                        },
                  }}
                >
                </motion.div>
              </>
            )}

            {displayErrorMessage && !isPromptEmpty ? (
              <motion.div initial={sectionTransition?.initial} animate={sectionTransition?.animate}>
                <Text typography="bodyRegular" css={styles.errorText}>
                  {displayErrorMessage}
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
                    Add {previewWidgetCount} widget{previewWidgetCount === 1 ? '' : 's'}
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
                    {isPreviewLoading ? 'Previewing dashboard...' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={onPromptSubmit}
                    disabled={isSubmitDisabled}
                    css={{ ...styles.footerButtonBase, ...styles.footerPrimaryButton }}
                  >
                    {isGenerateLoading ? 'Generating widgets...' : 'Generate widgets'}
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
