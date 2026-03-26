import { dashboardWidgetSchema, type DashboardWidget } from '@/app/dashboard/dashboard-builder-types';

export const dashboardPromptSuggestions = [
  'Build an exec dashboard for weekly business health with a snapshot, trend, and vertical breakdown.',
  'Show business deliveries trend plus vertical mix for the last 12 weeks.',
  'Create a sales dashboard for signup source performance and spend-drop risk.',
];

export function getStarterDashboardWidgets(): DashboardWidget[] {
  return [
    dashboardWidgetSchema.parse({
      id: 'starter-metric-business-deliveries',
      title: 'Business deliveries snapshot',
      description: 'Verified Medusa-backed snapshot for the current starter metric.',
      question: 'How many business deliveries happened in the last 30 days?',
      questionId: 'business-deliveries-last-30-days',
      preferredView: 'metric',
      layout: 'half',
      widgetType: 'metric',
      timeRangeLabel: 'Past 30 days',
      renderState: 'ready',
      coverageStatus: 'ready',
      coverageMessage: 'Matched a ready Medusa-backed question.',
      summary: 'Business deliveries were 14,280 for the last 30 days.',
      matchedQuestionTitle: 'Business deliveries snapshot',
      data: {
        metrics: [{ label: 'Business deliveries', value: '14,280', tone: 'brand' }],
        footer: 'Business deliveries were 14,280 for the last 30 days.',
      },
    }),
    dashboardWidgetSchema.parse({
      id: 'starter-table-watchlist',
      title: 'Spend-drop watchlist',
      description: 'A watchlist-style widget for the PM and sales use cases this MVP is targeting.',
      question: 'Which business accounts have the sharpest spend drop over the last month?',
      questionId: 'accounts-with-spend-drop',
      preferredView: 'table',
      layout: 'half',
      widgetType: 'table',
      timeRangeLabel: 'Past 30 days',
      renderState: 'ready',
      coverageStatus: 'ready',
      coverageMessage: 'Matched a table-style sales follow-up question.',
      summary: 'Top watchlist accounts are ranked by the largest month-over-month declines.',
      matchedQuestionTitle: 'Accounts with spend drop risk',
      data: {
        columns: [
          { id: 'dimension_value', label: 'Business account', kind: 'text' },
          { id: 'icbSpendDropRisk', label: 'Spend drop risk', kind: 'number' },
        ],
        rows: [
          { dimension_value: 'Acme Health SF', icbSpendDropRisk: 31.2 },
          { dimension_value: 'Bento Labs NYC', icbSpendDropRisk: 24.6 },
          { dimension_value: 'Northstar Legal', icbSpendDropRisk: 19.4 },
        ],
        footer: 'Top watchlist accounts are ranked by the largest month-over-month declines.',
      },
    }),
  ];
}
