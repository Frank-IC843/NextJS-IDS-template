'use client';

import { DashboardActivitySplitBlockView } from '@/app/dashboard/dashboard-activity-split-block';
import { DashboardHeroBlockView } from '@/app/dashboard/dashboard-hero-block';
import { DashboardInsightGridBlockView } from '@/app/dashboard/dashboard-insight-grid-block';
import { DashboardKpiRowBlockView } from '@/app/dashboard/dashboard-kpi-row-block';
import type { DashboardBlock } from '@/app/dashboard/dashboard-mock-data';

export function DashboardBlockRenderer({ block }: { block: DashboardBlock }) {
  switch (block.type) {
    case 'hero':
      return <DashboardHeroBlockView block={block} />;
    case 'kpiRow':
      return <DashboardKpiRowBlockView block={block} />;
    case 'insightGrid':
      return <DashboardInsightGridBlockView block={block} />;
    case 'activitySplit':
      return <DashboardActivitySplitBlockView block={block} />;
    default:
      return null;
  }
}
