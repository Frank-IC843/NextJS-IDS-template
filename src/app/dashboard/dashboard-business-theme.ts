import type { Theme } from '@instacart/ids-core';

export interface DashboardBusinessPalette {
  elderberry: string;
  elderberryDark: string;
  elderberrySoft: string;
  elderberryBorder: string;
  blueberry: string;
  blueberryDark: string;
  blueberrySoft: string;
  blueberryBorder: string;
  canvasGradient: string;
}

export function getDashboardBusinessPalette(theme: Theme): DashboardBusinessPalette {
  return {
    elderberry: '#6E48E5',
    elderberryDark: '#5534C5',
    elderberrySoft: 'rgba(110, 72, 229, 0.10)',
    elderberryBorder: 'rgba(110, 72, 229, 0.22)',
    blueberry: theme.colors.brandHighlightRegular,
    blueberryDark: theme.colors.brandHighlightDark,
    blueberrySoft: 'rgba(43, 120, 198, 0.12)',
    blueberryBorder: 'rgba(43, 120, 198, 0.24)',
    canvasGradient:
      'linear-gradient(135deg, rgba(110, 72, 229, 0.11) 0%, rgba(43, 120, 198, 0.10) 48%, rgba(246, 247, 248, 0.98) 100%)',
  };
}
