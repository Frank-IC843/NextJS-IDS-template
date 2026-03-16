'use client';

import { useTheme } from '@instacart/ids-core';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import type { DashboardLayout } from '@/app/dashboard/dashboard-builder-types';

type DashboardLayoutGlyphSize = 'compact' | 'regular';

interface DashboardLayoutGlyphProps {
  layout: DashboardLayout;
  size?: DashboardLayoutGlyphSize;
}

const glyphDimensions: Record<DashboardLayoutGlyphSize, { width: number; height: number }> = {
  compact: { width: 13, height: 8 },
  regular: { width: 16, height: 10 },
};

export function DashboardLayoutGlyph({ layout, size = 'regular' }: DashboardLayoutGlyphProps) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const dimensions = glyphDimensions[size];

  return (
    <div
      css={{
        display: layout === 'half' ? 'grid' : 'flex',
        gridTemplateColumns: layout === 'half' ? 'repeat(2, minmax(0, 1fr))' : undefined,
        gap: layout === 'half' ? '2px' : undefined,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: layout === 'half' ? 2 : 1 }).map((_, index) => (
        <div
          key={`${layout}-${index}`}
          css={{
            flex: 1,
            borderRadius: '999px',
            border: `1px solid ${businessPalette.blueberryBorder}`,
            backgroundColor: 'rgba(43, 120, 198, 0.16)',
          }}
        />
      ))}
    </div>
  );
}
