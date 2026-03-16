import type { Theme } from '@instacart/ids-core';
import type { DashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';

interface DashboardChartSurfaceOptions {
  borderColor?: string;
  background: string;
  padding?: string;
}

export function getDashboardChartContainerStyles() {
  return {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  };
}

export function getDashboardChartSurfaceStyles(
  theme: Theme,
  businessPalette: DashboardBusinessPalette,
  options: DashboardChartSurfaceOptions,
) {
  return {
    width: '100%',
    height: '240px',
    borderRadius: theme.radius.r12,
    border: `1px solid ${options.borderColor ?? businessPalette.blueberryBorder}`,
    background: options.background,
    padding: options.padding ?? '12px 12px 4px',
  };
}

export function getDashboardChartTooltipContentStyle(borderColor: string) {
  return {
    borderRadius: 12,
    border: `1px solid ${borderColor}`,
    boxShadow: '0 12px 30px rgba(17, 24, 39, 0.10)',
  };
}
