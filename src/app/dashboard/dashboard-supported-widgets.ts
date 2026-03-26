import type {
  DashboardLayout,
  SupportedWidgetType,
} from '@/app/dashboard/dashboard-builder-types';

export interface SupportedWidgetDefinition {
  type: SupportedWidgetType;
  label: string;
  description: string;
  promptHint: string;
  defaultTitle: string;
  defaultLayout: DashboardLayout;
}

export const supportedDashboardWidgets: SupportedWidgetDefinition[] = [
  {
    type: 'metric',
    label: 'Metric',
    description: 'Headline KPI widgets for executive scorecards, weekly health checks, and single-number answers.',
    promptHint: 'Best for top-line Medusa-backed snapshots like deliveries, GTV, orders, and activation scorecards.',
    defaultTitle: 'Business health snapshot',
    defaultLayout: 'half',
  },
  {
    type: 'lineChart',
    label: 'Line chart',
    description: 'Trend visualizations for weekly momentum, funnel movement, and business health over time.',
    promptHint: 'Best for pace and movement questions such as weekly deliveries, activations, or spend trends.',
    defaultTitle: 'Weekly trend',
    defaultLayout: 'full',
  },
  {
    type: 'barChart',
    label: 'Bar chart',
    description: 'Compare retailers, sources, partners, or segments side by side.',
    promptHint: 'Best for ranked comparisons, vertical mix, and side-by-side PM or sales performance cuts.',
    defaultTitle: 'Top contributors',
    defaultLayout: 'half',
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Watchlists and ranked output for sales follow-up, partner reporting, and account reviews.',
    promptHint: 'Best for account watchlists, landing-page reports, and coverage-gap workflows where detail matters.',
    defaultTitle: 'Account watchlist',
    defaultLayout: 'full',
  },
];

export function getSupportedWidgetDefinition(widgetType: SupportedWidgetType) {
  return supportedDashboardWidgets.find(widget => widget.type === widgetType);
}
