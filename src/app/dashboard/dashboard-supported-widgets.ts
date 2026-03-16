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
    description: 'Single KPI cards for totals, rates, and budget signals.',
    promptHint: 'Best for headline measures such as spend, orders, or fill rate.',
    defaultTitle: 'Total spend',
    defaultLayout: 'half',
  },
  {
    type: 'lineChart',
    label: 'Line chart',
    description: 'Trend visualizations for order pace, spend, and performance over time.',
    promptHint: 'Best for movement over days, weeks, and quarterly reporting windows.',
    defaultTitle: 'Orders over time',
    defaultLayout: 'full',
  },
  {
    type: 'barChart',
    label: 'Bar chart',
    description: 'Compare locations, departments, or weekdays side by side.',
    promptHint: 'Best for rankings, side-by-side comparisons, and segment performance.',
    defaultTitle: 'Top departments by spend',
    defaultLayout: 'full',
  },
  {
    type: 'donutChart',
    label: 'Donut chart',
    description: 'Breakdowns for spend mix, order status, or category share.',
    promptHint: 'Best for contribution, category share, and percentage mix views.',
    defaultTitle: 'Spend mix',
    defaultLayout: 'half',
  },
  {
    type: 'insightList',
    label: 'Insight list',
    description: 'Short bullet summaries that explain what the charts mean.',
    promptHint: 'Best for concise summaries, callouts, and review-ready takeaways.',
    defaultTitle: 'What stands out',
    defaultLayout: 'half',
  },
];

export function getSupportedWidgetDefinition(widgetType: SupportedWidgetType) {
  return supportedDashboardWidgets.find(widget => widget.type === widgetType);
}
