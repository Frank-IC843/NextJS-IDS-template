'use client';

import { keyframes } from '@emotion/react';
import { useTheme } from '@instacart/ids-core';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { getDashboardChartContainerStyles, getDashboardChartSurfaceStyles } from '@/app/dashboard/dashboard-chart-styles';
import type { DashboardWidgetDraft } from '@/app/dashboard/dashboard-builder-types';

const shimmer = keyframes`
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
`;

export function DashboardWidgetSkeleton({ widget }: { widget: DashboardWidgetDraft }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const containerStyles = getDashboardChartContainerStyles();
  const chartSurfaceStyles = getDashboardChartSurfaceStyles(theme, businessPalette, {
    background: 'linear-gradient(180deg, rgba(43, 120, 198, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%)',
  });

  const skeletonBlock = {
    borderRadius: '999px',
    background: 'linear-gradient(90deg, rgba(226, 232, 240, 0.92) 0%, rgba(248, 250, 252, 1) 48%, rgba(226, 232, 240, 0.92) 100%)',
    backgroundSize: '220% 100%',
    animation: `${shimmer} 1.6s ease-in-out infinite`,
  } as const;

  switch (widget.widgetType) {
    case 'metric':
      return (
        <div css={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '180px', justifyContent: 'space-between' }}>
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '18px',
              borderRadius: theme.radius.r12,
              backgroundColor: businessPalette.elderberrySoft,
            }}
          >
            <div css={{ ...skeletonBlock, width: '58%', height: '42px', borderRadius: theme.radius.r12 }} />
            <div css={{ ...skeletonBlock, width: '38%', height: '30px' }} />
          </div>
          <div css={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div css={{ ...skeletonBlock, width: '92%', height: '12px' }} />
            <div css={{ ...skeletonBlock, width: '74%', height: '12px' }} />
          </div>
        </div>
      );
    case 'lineChart':
      return (
        <div css={containerStyles}>
          <div css={chartSurfaceStyles}>
            <div css={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '14px 8px 8px' }}>
              {[0, 1, 2].map(index => (
                <div
                  key={index}
                  css={{
                    width: '100%',
                    borderTop: '1px dashed rgba(43, 120, 198, 0.18)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: `${12 + index * 18}%`,
                      top: `${24 - index * 2}px`,
                      width: `${58 - index * 6}%`,
                      height: '4px',
                      borderRadius: '999px',
                      ...skeletonBlock,
                    },
                  }}
                />
              ))}
              <div css={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '12px', alignItems: 'end', height: '48px' }}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} css={{ ...skeletonBlock, width: '100%', height: `${18 + (index % 3) * 6}px`, borderRadius: '999px' }} />
                ))}
              </div>
            </div>
          </div>
          <div css={{ ...skeletonBlock, width: '72%', height: '12px' }} />
        </div>
      );
    case 'barChart':
      return (
        <div css={containerStyles}>
          <div css={chartSurfaceStyles}>
            <div css={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px', alignItems: 'end', height: '100%' }}>
              {[56, 88, 74, 96, 66].map(height => (
                <div key={height} css={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '8px', height: '100%' }}>
                  <div css={{ ...skeletonBlock, width: '100%', height: `${height}px`, borderRadius: '999px 999px 8px 8px' }} />
                  <div css={{ ...skeletonBlock, width: '72%', height: '8px', marginInline: 'auto' }} />
                </div>
              ))}
            </div>
          </div>
          <div css={{ ...skeletonBlock, width: '78%', height: '12px' }} />
        </div>
      );
    case 'donutChart':
    default:
      return (
        <div css={containerStyles}>
          <div css={{ ...chartSurfaceStyles, padding: '18px' }}>
            <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', height: '100%' }}>
              <div
                css={{
                  width: '112px',
                  height: '112px',
                  borderRadius: '999px',
                  background:
                    'conic-gradient(rgba(110, 72, 229, 0.35) 0deg 132deg, rgba(43, 120, 198, 0.35) 132deg 268deg, rgba(148, 163, 184, 0.3) 268deg 360deg)',
                  position: 'relative',
                  flexShrink: 0,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '22px',
                    borderRadius: '999px',
                    backgroundColor: theme.colors.systemGrayscale00,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '999px',
                    ...skeletonBlock,
                    opacity: 0.55,
                  },
                }}
              />
              <div css={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {[82, 68, 56].map(width => (
                  <div key={width} css={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '10px', alignItems: 'center' }}>
                    <div css={{ ...skeletonBlock, width: '10px', height: '10px', borderRadius: '999px' }} />
                    <div css={{ ...skeletonBlock, width: `${width}%`, height: '10px' }} />
                    <div css={{ ...skeletonBlock, width: '28px', height: '10px' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div css={{ ...skeletonBlock, width: '74%', height: '12px' }} />
        </div>
      );
  }
}
