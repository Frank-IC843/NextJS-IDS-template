'use client';

import { ButtonBase, Text } from '@instacart/ids-customers';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTheme } from '@instacart/ids-core';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { HERO_CAROUSEL_AUTOPLAY_MS, useDashboardContentStyles } from '@/app/dashboard/dashboard-content-styles';
import { DashboardLayoutGlyph } from '@/app/dashboard/dashboard-layout-glyph';

export const heroCarouselSteps = [
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

type HeroCarouselStepId = (typeof heroCarouselSteps)[number]['id'];

interface DashboardHeroCarouselProps {
  onOpenBuilder: (prompt?: string) => void;
}

export function DashboardHeroCarousel({ onOpenBuilder }: DashboardHeroCarouselProps) {
  const styles = useDashboardContentStyles();
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = heroCarouselSteps[activeIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % heroCarouselSteps.length);
    }, HERO_CAROUSEL_AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const stepTransition = prefersReducedMotion
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

  return (
    <div css={styles.starterPanel}>
      <div css={styles.heroCarouselHeader}>
        <Text typography="bodyEmphasized" css={{ ...styles.eyebrow, color: businessPalette.blueberryDark }}>
          Get started
        </Text>
        <Text typography="bodySmall1" css={{ color: businessPalette.blueberryDark }}>
          {activeStep.stepLabel} / {heroCarouselSteps.length.toString().padStart(2, '0')}
        </Text>
      </div>

      <div css={styles.heroCarouselMain}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeStep.id}
            css={styles.heroCarouselBody}
            initial={stepTransition?.initial}
            animate={stepTransition?.animate}
            exit={stepTransition?.exit}
          >
            <div css={styles.heroCarouselStage}>{renderHeroCarouselStage(activeStep.id)}</div>

            <div css={styles.heroCarouselCopy}>
              <Text typography="bodyEmphasized">{activeStep.title}</Text>
              <Text typography="bodySmall1" color="systemGrayscale60">
                {activeStep.description}
              </Text>
            </div>
          </motion.div>
        </AnimatePresence>

        <div css={styles.heroCarouselNav}>
          {heroCarouselSteps.map((step, index) => {
            const isActive = index === activeIndex;

            return (
              <ButtonBase
                key={step.id}
                onClick={() => setActiveIndex(index)}
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
          <button type="button" onClick={() => onOpenBuilder(activeStep.prompt)} css={styles.heroCarouselActionButton}>
            Open builder
          </button>
        </div>
      </div>
    </div>
  );

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
                        border: '1px solid rgba(43, 120, 198, 0.16)',
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
                  border: '1px solid rgba(43, 120, 198, 0.16)',
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
                        <DashboardLayoutGlyph layout="half" size="compact" />
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
                        <DashboardLayoutGlyph layout="full" size="compact" />
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
                    border: '1px solid rgba(43, 120, 198, 0.16)',
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
}
