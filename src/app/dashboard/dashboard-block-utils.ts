import type { Theme } from '@instacart/ids-core';
import type { DashboardTone } from '@/app/dashboard/dashboard-builder-types';

export interface TonePalette {
  accent: string;
  soft: string;
  border: string;
}

export function getTonePalette(theme: Theme, tone: DashboardTone): TonePalette {
  switch (tone) {
    case 'positive':
      return {
        accent: theme.colors.brandPrimaryDark,
        soft: 'rgba(9, 138, 9, 0.10)',
        border: 'rgba(9, 138, 9, 0.18)',
      };
    case 'brand':
      return {
        accent: theme.colors.brandHighlightRegular,
        soft: 'rgba(43, 120, 198, 0.12)',
        border: 'rgba(43, 120, 198, 0.22)',
      };
    case 'caution':
      return {
        accent: '#9A6200',
        soft: 'rgba(154, 98, 0, 0.11)',
        border: 'rgba(154, 98, 0, 0.20)',
      };
    case 'neutral':
    default:
      return {
        accent: theme.colors.systemGrayscale70,
        soft: theme.colors.systemGrayscale10,
        border: theme.colors.systemGrayscale20,
      };
  }
}
