'use client';

import { responsive, useTheme } from '@instacart/ids-core';
import { Text, ButtonBase, Divider, SecondaryButtonSmall } from '@instacart/ids-customers';
import { useState } from 'react';
import { DashboardBlockRenderer } from '@/app/dashboard/dashboard-block-renderer';
import type { DashboardDefinition } from '@/app/dashboard/dashboard-mock-data';

const useStyles = () => {
  const theme = useTheme();
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      paddingBottom: '48px',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      [responsive.up('r')]: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      },
    },
    titleGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '860px',
    },
    statusRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    statusPill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '999px',
      backgroundColor: 'rgba(10, 173, 10, 0.10)',
      border: '1px solid rgba(10, 173, 10, 0.18)',
    },
    controlsCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      padding: '18px',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      backgroundColor: theme.colors.systemGrayscale10,
      boxShadow: '0 8px 30px rgba(17, 24, 39, 0.03)',
    },
    viewTabs: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
    },
    viewButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '999px',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      backgroundColor: theme.colors.systemGrayscale00,
      padding: '10px 14px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        borderColor: theme.colors.systemGrayscale30,
        boxShadow: '0 8px 24px rgba(17, 24, 39, 0.06)',
      },
    },
    viewButtonActive: {
      backgroundColor: theme.colors.systemGrayscale90,
      borderColor: theme.colors.systemGrayscale90,
      boxShadow: '0 10px 24px rgba(17, 24, 39, 0.10)',
    },
    blocks: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    blockSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
  } as const;
};

interface DashboardContentProps {
  dashboard: DashboardDefinition;
}

function noop() {}

export function DashboardContent({ dashboard }: DashboardContentProps) {
  const styles = useStyles();
  const theme = useTheme();
  const [selectedViewId, setSelectedViewId] = useState(dashboard.views[0]?.id ?? '');
  const selectedView = dashboard.views.find(view => view.id === selectedViewId) ?? dashboard.views[0];

  if (!selectedView) {
    return null;
  }

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <div css={styles.titleGroup}>
          <div css={styles.statusRow}>
            <Text typography="headline">{dashboard.title}</Text>
            <div css={styles.statusPill}>
              <Text typography="bodySmall1" css={{ color: theme.colors.brandPrimaryDark }}>
                {dashboard.statusLabel}
              </Text>
            </div>
          </div>
          <Text typography="bodyLarge2" color="systemGrayscale70">
            {dashboard.subtitle}
          </Text>
        </div>

        <SecondaryButtonSmall onClick={noop}>Export snapshot</SecondaryButtonSmall>
      </div>

      <section css={styles.controlsCard}>
        <div css={styles.viewTabs}>
          {dashboard.views.map(view => {
            const isSelected = view.id === selectedView.id;

            return (
              <ButtonBase
                key={view.id}
                onClick={() => setSelectedViewId(view.id)}
                css={{
                  ...styles.viewButton,
                  ...(isSelected ? styles.viewButtonActive : {}),
                }}
                aria-pressed={isSelected}
              >
                <Text
                  typography="bodyRegular"
                  css={{ color: isSelected ? theme.colors.systemGrayscale00 : theme.colors.systemGrayscale70 }}
                >
                  {view.label}
                </Text>
              </ButtonBase>
            );
          })}
        </div>

        <Text typography="bodyRegular" color="systemGrayscale60">
          {selectedView.summary}
        </Text>
      </section>

      <div css={styles.blocks}>
        {selectedView.blocks.map((block, index) => (
          <div key={`${selectedView.id}-${block.type}-${index}`} css={styles.blockSection}>
            <DashboardBlockRenderer block={block} />
            {index < selectedView.blocks.length - 1 ? <Divider /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
