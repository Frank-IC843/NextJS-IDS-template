'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import { Divider, Text } from '@instacart/ids-customers';
import type { DashboardHeroBlock } from '@/app/dashboard/dashboard-mock-data';

function useStyles() {
  const theme = useTheme();

  return {
    heroGrid: {
      display: 'grid',
      gap: '16px',
      [responsive.up('r')]: {
        gridTemplateColumns: 'minmax(0, 1.55fr) minmax(320px, 0.95fr)',
      },
    },
    panelCard: {
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      padding: '24px',
      backgroundColor: theme.colors.systemGrayscale00,
      boxShadow: '0 12px 40px rgba(17, 24, 39, 0.06)',
      overflow: 'hidden' as const,
    },
    heroPanel: {
      background:
        'linear-gradient(135deg, rgba(10, 173, 10, 0.10) 0%, rgba(255, 255, 255, 0.98) 52%, rgba(246, 247, 248, 0.98) 100%)',
    },
    promptPanel: {
      background:
        'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 247, 248, 0.98) 100%)',
    },
    heroGlow: {
      position: 'absolute' as const,
      top: '-80px',
      right: '-80px',
      width: '220px',
      height: '220px',
      borderRadius: '999px',
      background: 'radial-gradient(circle, rgba(10, 173, 10, 0.18) 0%, rgba(10, 173, 10, 0) 68%)',
      pointerEvents: 'none' as const,
    },
    eyebrow: {
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    heroTitle: {
      maxWidth: '720px',
      lineHeight: 1.1,
    },
    heroDescription: {
      maxWidth: '700px',
      lineHeight: 1.45,
    },
    badgeRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '12px',
      marginTop: '8px',
    },
    badge: {
      borderRadius: '999px',
      padding: '10px 14px',
      backgroundColor: theme.colors.systemGrayscale00,
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      boxShadow: '0 6px 24px rgba(17, 24, 39, 0.05)',
    },
    promptHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap' as const,
    },
    promptBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '999px',
      backgroundColor: 'rgba(10, 173, 10, 0.10)',
      border: '1px solid rgba(10, 173, 10, 0.18)',
    },
    promptPreview: {
      borderRadius: theme.radius.r12,
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      backgroundColor: theme.colors.systemGrayscale00,
      padding: '18px',
      minHeight: '132px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    },
    promptSuggestions: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
    },
    promptSuggestion: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '999px',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      backgroundColor: theme.colors.systemGrayscale00,
    },
  } as const;
}

export function DashboardHeroBlockView({ block }: { block: DashboardHeroBlock }) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <section css={styles.heroGrid}>
      <article css={{ ...styles.panelCard, ...styles.heroPanel }}>
        <div css={styles.heroGlow} />
        <Text typography="bodySmall1" css={{ ...styles.eyebrow, color: theme.colors.brandPrimaryDark }}>
          {block.eyebrow}
        </Text>
        <Text typography="headline" css={styles.heroTitle}>
          {block.title}
        </Text>
        <Text typography="bodyLarge2" color="systemGrayscale70" css={styles.heroDescription}>
          {block.description}
        </Text>
        <div css={styles.badgeRow}>
          {block.summaryBadges.map(badge => (
            <div key={badge} css={styles.badge}>
              <Text typography="bodyEmphasized">{badge}</Text>
            </div>
          ))}
        </div>
      </article>

      <article css={{ ...styles.panelCard, ...styles.promptPanel }}>
        <div css={styles.promptHeader}>
          <div css={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Text typography="bodySmall1" css={styles.eyebrow}>
              {block.promptTitle}
            </Text>
            <Text typography="bodyRegular" color="systemGrayscale60">
              Natural-language entry point reserved for the next milestone.
            </Text>
          </div>
          <div css={styles.promptBadge}>
            <Text typography="bodySmall1" css={{ color: theme.colors.brandPrimaryDark }}>
              Future-ready seam
            </Text>
          </div>
        </div>

        <div css={styles.promptPreview}>
          <Text typography="titleMedium">&ldquo;{block.promptPreview}&rdquo;</Text>
        </div>

        <div css={styles.promptSuggestions}>
          {block.suggestions.map(suggestion => (
            <div key={suggestion} css={styles.promptSuggestion}>
              <Text typography="bodyRegular">{suggestion}</Text>
            </div>
          ))}
        </div>

        <Divider />

        <Text typography="bodyRegular" color="systemGrayscale60">
          {block.promptHint}
        </Text>
      </article>
    </section>
  );
}
