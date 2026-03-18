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
    description: 'Single KPI widgets for totals, counts, savings, and averages.',
    promptHint: 'Best for headline measures such as spend, order count, or average order value.',
    defaultTitle: 'Total spend',
    defaultLayout: 'half',
  },
  {
    type: 'lineChart',
    label: 'Line chart',
    description: 'Trend visualizations over the supported 1, 3, and 7 day windows.',
    promptHint: 'Best for daily movement such as order pace, spend, or savings over time.',
    defaultTitle: 'Orders over time',
    defaultLayout: 'full',
  },
  {
    type: 'barChart',
    label: 'Bar chart',
    description: 'Compare departments, retailers, members, statuses, or service types side by side.',
    promptHint: 'Best for rankings, side-by-side comparisons, and grouped performance.',
    defaultTitle: 'Spend by department',
    defaultLayout: 'full',
  },
  {
    type: 'donutChart',
    label: 'Donut chart',
    description: 'Breakdowns for share and contribution across a single grouping.',
    promptHint: 'Best for share of spend or order count by department, retailer, or service type.',
    defaultTitle: 'Department share',
    defaultLayout: 'half',
  },
];

export function getSupportedWidgetDefinition(widgetType: SupportedWidgetType) {
  return supportedDashboardWidgets.find(widget => widget.type === widgetType);
}
