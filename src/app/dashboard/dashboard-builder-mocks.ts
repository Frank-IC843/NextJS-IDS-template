import {
  dashboardWidgetSchema,
  type DashboardTimeRange,
  type DashboardWidget,
  type DashboardLayout,
  type DashboardTone,
  type SupportedWidgetType,
  type WidgetRequest,
} from '@/app/dashboard/dashboard-builder-types';
import { getSupportedWidgetDefinition } from '@/app/dashboard/dashboard-supported-widgets';

type MetricKey = 'spend' | 'orders' | 'fillRate' | 'averageBasket' | 'budget';
type GroupByKey = 'department' | 'location' | 'weekday' | 'status';

interface HydrateWidgetOptions {
  widgetId?: string;
}

const timeRangeLabels: Record<DashboardTimeRange, string> = {
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  last8Weeks: 'Last 8 weeks',
  quarterToDate: 'Quarter to date',
};

const lineLabels: Record<DashboardTimeRange, string[]> = {
  last7Days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  last30Days: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
  last8Weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
  quarterToDate: ['Jan', 'Feb', 'Mar', 'Apr'],
};

const baseLineSeries: Record<MetricKey, Record<DashboardTimeRange, number[]>> = {
  spend: {
    last7Days: [74, 81, 79, 86, 94, 88, 92],
    last30Days: [68, 73, 79, 84, 88, 93],
    last8Weeks: [58, 61, 67, 72, 75, 82, 87, 92],
    quarterToDate: [62, 70, 81, 89],
  },
  orders: {
    last7Days: [32, 38, 36, 41, 49, 44, 47],
    last30Days: [29, 34, 37, 42, 46, 51],
    last8Weeks: [24, 28, 31, 36, 40, 44, 48, 53],
    quarterToDate: [28, 34, 43, 50],
  },
  fillRate: {
    last7Days: [94, 95, 96, 95, 97, 96, 97],
    last30Days: [93, 94, 95, 96, 96, 97],
    last8Weeks: [92, 93, 94, 95, 95, 96, 96, 97],
    quarterToDate: [94, 95, 96, 97],
  },
  averageBasket: {
    last7Days: [118, 124, 122, 131, 136, 133, 139],
    last30Days: [114, 119, 126, 129, 135, 141],
    last8Weeks: [104, 109, 115, 121, 128, 132, 138, 144],
    quarterToDate: [110, 121, 133, 142],
  },
  budget: {
    last7Days: [103, 101, 99, 98, 97, 96, 95],
    last30Days: [106, 104, 101, 99, 97, 95],
    last8Weeks: [109, 107, 104, 102, 100, 98, 96, 94],
    quarterToDate: [106, 101, 98, 95],
  },
};

const groupBars: Record<GroupByKey, { label: string; value: number }[]> = {
  department: [
    { label: 'Produce', value: 34 },
    { label: 'Beverages', value: 28 },
    { label: 'Prepared', value: 22 },
    { label: 'Pantry', value: 18 },
    { label: 'Dairy', value: 15 },
  ],
  location: [
    { label: 'Union Sq', value: 41 },
    { label: 'Downtown', value: 36 },
    { label: 'West 7th', value: 33 },
    { label: 'Riverside', value: 27 },
    { label: 'South Mkt', value: 24 },
  ],
  weekday: [
    { label: 'Mon', value: 18 },
    { label: 'Tue', value: 26 },
    { label: 'Wed', value: 31 },
    { label: 'Thu', value: 29 },
    { label: 'Fri', value: 24 },
    { label: 'Sat', value: 20 },
  ],
  status: [
    { label: 'Delivered', value: 57 },
    { label: 'Scheduled', value: 21 },
    { label: 'Review', value: 9 },
    { label: 'In progress', value: 13 },
  ],
};

const donutSegmentsByGroup: Record<GroupByKey, { label: string; value: number; tone: DashboardTone }[]> = {
  department: [
    { label: 'Produce', value: 34, tone: 'positive' },
    { label: 'Beverages', value: 23, tone: 'brand' },
    { label: 'Prepared', value: 18, tone: 'positive' },
    { label: 'Pantry', value: 15, tone: 'neutral' },
    { label: 'Dairy', value: 10, tone: 'neutral' },
  ],
  location: [
    { label: 'Top 5 stores', value: 61, tone: 'brand' },
    { label: 'Mid-tier', value: 24, tone: 'neutral' },
    { label: 'Long tail', value: 15, tone: 'caution' },
  ],
  weekday: [
    { label: 'Weekday', value: 72, tone: 'positive' },
    { label: 'Weekend', value: 28, tone: 'brand' },
  ],
  status: [
    { label: 'Delivered', value: 73, tone: 'positive' },
    { label: 'Scheduled', value: 16, tone: 'brand' },
    { label: 'Needs review', value: 11, tone: 'caution' },
  ],
};

const insightSets: Record<MetricKey, string[]> = {
  spend: [
    'Spend is growing more slowly than order volume, which suggests healthier basket mix and fewer delivery touches.',
    'Midweek replenishment remains the most efficient ordering window across locations.',
    'Fresh categories continue to explain most of the lift without pushing the budget off track.',
  ],
  orders: [
    'Order counts are rising fastest on Tuesday through Thursday, which makes the weekday view more actionable than weekends.',
    'The highest-volume locations are placing larger baskets instead of simply ordering more often.',
    'Recent order pace suggests the next dashboard iteration should surface delayed-delivery risk earlier.',
  ],
  fillRate: [
    'Morning deliveries consistently outperform late-afternoon orders in fill rate.',
    'Needs-review volume stays small, which helps keep fill-rate performance stable across the month.',
    'The best-performing windows are concentrated in locations with tighter basket composition.',
  ],
  averageBasket: [
    'Average basket growth is being driven by beverage and prepared-food overlap.',
    'Larger baskets cluster around office restocks and event-prep orders rather than daily staples.',
    'Basket size is rising without a matching spike in exception volume, which is a healthy signal.',
  ],
  budget: [
    'Budget pacing remains controlled even as order activity climbs.',
    'The clearest savings opportunity continues to come from consolidating midweek replenishment.',
    'Budget pacing is steady enough to support planning conversations without introducing unnecessary risk.',
  ],
};

export const dashboardPromptSuggestions = [
  'Add a line chart showing order volume over the last 8 weeks.',
  'Add a donut chart for department share this month.',
  'Add an insight list summarizing budget pacing this quarter.',
];

export const dashboardBuilderHighlights = [
  'Add new widgets without breaking focus on the dashboard itself.',
  'Choose from a curated set of chart types designed for operational and spend reviews.',
  'Reorder widgets to match the story your team needs to see first.',
];

export function getStarterDashboardWidgets(): DashboardWidget[] {
  return [
    hydrateWidgetRequest(
      {
        widgetType: 'metric',
        title: 'Total spend',
        description: 'Headline performance for the current reporting window.',
        metric: 'spend',
        timeRange: 'last30Days',
        filters: [],
        layoutHint: 'half',
      },
      { widgetId: 'starter-metric-spend' },
    ),
    hydrateWidgetRequest(
      {
        widgetType: 'lineChart',
        title: 'Orders over time',
        description: 'Order volume trend across the selected reporting window.',
        metric: 'orders',
        timeRange: 'last8Weeks',
        filters: [],
        layoutHint: 'full',
      },
      { widgetId: 'starter-line-orders' },
    ),
    hydrateWidgetRequest(
      {
        widgetType: 'insightList',
        title: 'What stands out',
        description: 'Key observations to support reviews and follow-up decisions.',
        metric: 'orders',
        timeRange: 'last30Days',
        filters: [],
        layoutHint: 'half',
      },
      { widgetId: 'starter-insights-orders' },
    ),
  ];
}

export function createQuickAddWidget(widgetType: SupportedWidgetType) {
  return hydrateWidgetRequest(buildDefaultWidgetRequest(widgetType));
}

export function mockGenerateWidgetRequest(prompt: string): WidgetRequest {
  const normalizedPrompt = prompt.toLowerCase();
  const timeRange = inferTimeRange(normalizedPrompt);
  const metric = inferMetricKey(normalizedPrompt);
  const groupBy = inferGroupBy(normalizedPrompt);
  const widgetType = inferWidgetType(normalizedPrompt);

  return buildDefaultWidgetRequest(widgetType, { metric, timeRange, groupBy });
}

export function hydrateWidgetRequest(widgetRequest: WidgetRequest, options?: HydrateWidgetOptions): DashboardWidget {
  switch (widgetRequest.widgetType) {
    case 'metric':
      return buildMetricWidget(widgetRequest, options);
    case 'lineChart':
      return buildLineChartWidget(widgetRequest, options);
    case 'barChart':
      return buildBarChartWidget(widgetRequest, options);
    case 'donutChart':
      return buildDonutChartWidget(widgetRequest, options);
    case 'insightList':
      return buildInsightListWidget(widgetRequest, options);
    default:
      return buildInsightListWidget(widgetRequest, options);
  }
}

function buildMetricWidget(widgetRequest: WidgetRequest, options?: HydrateWidgetOptions): DashboardWidget {
  const metric = inferMetricKey(widgetRequest.metric);
  const profile = getMetricProfile(metric);
  const timeRange = widgetRequest.timeRange ?? 'last30Days';

  return dashboardWidgetSchema.parse({
    id: options?.widgetId ?? buildWidgetId('metric'),
    widgetType: 'metric',
    title: widgetRequest.title,
    description: widgetRequest.description,
    layout: resolveLayout(widgetRequest.layoutHint, 'metric'),
    timeRangeLabel: timeRangeLabels[timeRange],
    data: profile,
  });
}

function buildLineChartWidget(widgetRequest: WidgetRequest, options?: HydrateWidgetOptions): DashboardWidget {
  const metric = inferMetricKey(widgetRequest.metric);
  const timeRange = widgetRequest.timeRange ?? 'last30Days';
  const labels = lineLabels[timeRange];
  const values = baseLineSeries[metric][timeRange];

  return dashboardWidgetSchema.parse({
    id: options?.widgetId ?? buildWidgetId('line'),
    widgetType: 'lineChart',
    title: widgetRequest.title,
    description: widgetRequest.description,
    layout: resolveLayout(widgetRequest.layoutHint, 'lineChart'),
    timeRangeLabel: timeRangeLabels[timeRange],
    data: {
      points: labels.map((label, index) => ({
        label,
        value: values[index] ?? values[values.length - 1] ?? 0,
      })),
      footer: `${metricLabel(metric)} remains strongest through the middle of the period, with steady performance into the latest interval.`,
    },
  });
}

function buildBarChartWidget(widgetRequest: WidgetRequest, options?: HydrateWidgetOptions): DashboardWidget {
  const groupBy = inferGroupBy(widgetRequest.groupBy);
  const timeRange = widgetRequest.timeRange ?? 'last30Days';

  return dashboardWidgetSchema.parse({
    id: options?.widgetId ?? buildWidgetId('bar'),
    widgetType: 'barChart',
    title: widgetRequest.title,
    description: widgetRequest.description,
    layout: resolveLayout(widgetRequest.layoutHint, 'barChart'),
    timeRangeLabel: timeRangeLabels[timeRange],
    data: {
      bars: groupBars[groupBy],
      footer: `${groupByLabel(groupBy)} performance is clearly segmented here, making outliers and top contributors easier to review.`,
    },
  });
}

function buildDonutChartWidget(widgetRequest: WidgetRequest, options?: HydrateWidgetOptions): DashboardWidget {
  const groupBy = inferGroupBy(widgetRequest.groupBy);
  const timeRange = widgetRequest.timeRange ?? 'last30Days';

  return dashboardWidgetSchema.parse({
    id: options?.widgetId ?? buildWidgetId('donut'),
    widgetType: 'donutChart',
    title: widgetRequest.title,
    description: widgetRequest.description,
    layout: resolveLayout(widgetRequest.layoutHint, 'donutChart'),
    timeRangeLabel: timeRangeLabels[timeRange],
    data: {
      segments: donutSegmentsByGroup[groupBy],
      footer: `A clear share view for ${groupByLabel(groupBy).toLowerCase()} contribution across the current reporting window.`,
    },
  });
}

function buildInsightListWidget(widgetRequest: WidgetRequest, options?: HydrateWidgetOptions): DashboardWidget {
  const metric = inferMetricKey(widgetRequest.metric);
  const timeRange = widgetRequest.timeRange ?? 'last30Days';

  return dashboardWidgetSchema.parse({
    id: options?.widgetId ?? buildWidgetId('insight'),
    widgetType: 'insightList',
    title: widgetRequest.title,
    description: widgetRequest.description,
    layout: resolveLayout(widgetRequest.layoutHint, 'insightList'),
    timeRangeLabel: timeRangeLabels[timeRange],
    data: {
      items: insightSets[metric],
      tone: metric === 'budget' ? 'brand' : 'positive',
      footer: 'Concise takeaways that can be used in reviews, planning conversations, and follow-up actions.',
    },
  });
}

function buildDefaultWidgetRequest(
  widgetType: SupportedWidgetType,
  options?: {
    metric?: string;
    timeRange?: DashboardTimeRange;
    groupBy?: string;
  },
): WidgetRequest {
  const definition = getSupportedWidgetDefinition(widgetType);
  const metric = inferMetricKey(options?.metric);
  const groupBy = inferGroupBy(options?.groupBy);

  switch (widgetType) {
    case 'metric':
      return {
        widgetType,
        title: getMetricTitle(metric),
        description: 'Headline performance metric for the current reporting window.',
        metric,
        timeRange: options?.timeRange ?? 'last30Days',
        filters: [],
        layoutHint: definition?.defaultLayout ?? 'half',
      };
    case 'lineChart':
      return {
        widgetType,
        title: `${metricLabel(metric)} trend`,
        description: definition?.description,
        metric,
        timeRange: options?.timeRange ?? 'last8Weeks',
        filters: [],
        layoutHint: definition?.defaultLayout ?? 'full',
      };
    case 'barChart':
      return {
        widgetType,
        title: `${groupByLabel(groupBy)} comparison`,
        description: definition?.description,
        metric,
        groupBy,
        timeRange: options?.timeRange ?? 'last30Days',
        filters: [],
        layoutHint: definition?.defaultLayout ?? 'full',
      };
    case 'donutChart':
      return {
        widgetType,
        title: `${groupByLabel(groupBy)} mix`,
        description: definition?.description,
        metric,
        groupBy,
        timeRange: options?.timeRange ?? 'last30Days',
        filters: [],
        layoutHint: definition?.defaultLayout ?? 'half',
      };
    case 'insightList':
    default:
      return {
        widgetType: 'insightList',
        title: definition?.defaultTitle ?? 'What stands out',
        description: definition?.description,
        metric,
        timeRange: options?.timeRange ?? 'last30Days',
        filters: [],
        layoutHint: definition?.defaultLayout ?? 'half',
      };
  }
}

function getMetricProfile(metric: MetricKey) {
  switch (metric) {
    case 'orders':
      return {
        value: '128',
        change: '+14 vs prior period',
        detail: 'Order volume is strongest in the core midweek replenishment window.',
        tone: 'positive' as const,
      };
    case 'fillRate':
      return {
        value: '97.2%',
        change: '+1.3 pts above target',
        detail: 'Morning deliveries continue to outperform later order windows.',
        tone: 'positive' as const,
      };
    case 'averageBasket':
      return {
        value: '$143.90',
        change: '+8.4% basket growth',
        detail: 'Larger replenishment orders are driving a higher average basket.',
        tone: 'positive' as const,
      };
    case 'budget':
      return {
        value: '6.1% under',
        change: 'Ahead of plan',
        detail: 'Budget pacing remains healthy across the current reporting window.',
        tone: 'brand' as const,
      };
    case 'spend':
    default:
      return {
        value: '$18,420',
        change: '6.1% under budget',
        detail: 'Spend remains controlled while category and location performance stay balanced.',
        tone: 'brand' as const,
      };
  }
}

function buildWidgetId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function resolveLayout(layoutHint: DashboardLayout | undefined, widgetType: SupportedWidgetType) {
  return layoutHint ?? getSupportedWidgetDefinition(widgetType)?.defaultLayout ?? 'half';
}

function inferTimeRange(prompt: string): DashboardTimeRange {
  if (prompt.includes('quarter')) {
    return 'quarterToDate';
  }

  if (prompt.includes('8 week') || prompt.includes('two month')) {
    return 'last8Weeks';
  }

  if (prompt.includes('7 day') || prompt.includes('this week')) {
    return 'last7Days';
  }

  return 'last30Days';
}

function inferMetricKey(prompt?: string): MetricKey {
  const normalizedPrompt = prompt?.toLowerCase() ?? '';

  if (normalizedPrompt.includes('fill')) {
    return 'fillRate';
  }

  if (normalizedPrompt.includes('basket')) {
    return 'averageBasket';
  }

  if (normalizedPrompt.includes('budget')) {
    return 'budget';
  }

  if (normalizedPrompt.includes('order')) {
    return 'orders';
  }

  return 'spend';
}

function inferGroupBy(prompt?: string): GroupByKey {
  const normalizedPrompt = prompt?.toLowerCase() ?? '';

  if (normalizedPrompt.includes('store') || normalizedPrompt.includes('location')) {
    return 'location';
  }

  if (normalizedPrompt.includes('weekday') || normalizedPrompt.includes('day')) {
    return 'weekday';
  }

  if (normalizedPrompt.includes('status')) {
    return 'status';
  }

  return 'department';
}

function metricLabel(metric: MetricKey) {
  switch (metric) {
    case 'orders':
      return 'Orders';
    case 'fillRate':
      return 'Fill rate';
    case 'averageBasket':
      return 'Average basket';
    case 'budget':
      return 'Budget pacing';
    case 'spend':
    default:
      return 'Spend';
  }
}

function getMetricTitle(metric: MetricKey) {
  switch (metric) {
    case 'orders':
      return 'Orders placed';
    case 'fillRate':
      return 'On-time fill rate';
    case 'averageBasket':
      return 'Average basket';
    case 'budget':
      return 'Budget pacing';
    case 'spend':
    default:
      return 'Total spend';
  }
}

function groupByLabel(groupBy: GroupByKey) {
  switch (groupBy) {
    case 'location':
      return 'Location';
    case 'weekday':
      return 'Weekday';
    case 'status':
      return 'Status';
    case 'department':
    default:
      return 'Department';
  }
}

function shouldIncludeMetric(prompt: string) {
  return hasPromptKeyword(prompt, ['metric', 'kpi', 'total', 'spend', 'order', 'budget', 'fill', 'basket']);
}

function shouldIncludeLineChart(prompt: string) {
  return hasPromptKeyword(prompt, ['trend', 'over time', 'week', 'month', 'quarter', 'daily', 'weekly']);
}

function shouldIncludeBarChart(prompt: string) {
  return hasPromptKeyword(prompt, ['compare', 'comparison', 'top', 'department', 'store', 'location', 'weekday']);
}

function shouldIncludeDonutChart(prompt: string) {
  return hasPromptKeyword(prompt, ['mix', 'breakdown', 'distribution', 'share', 'split', 'category']);
}

function shouldIncludeInsightList(prompt: string) {
  return hasPromptKeyword(prompt, ['insight', 'takeaway', 'summary', 'attention', 'highlight', 'why']);
}

function inferWidgetType(prompt: string): SupportedWidgetType {
  if (hasPromptKeyword(prompt, ['donut', 'pie']) || shouldIncludeDonutChart(prompt)) {
    return 'donutChart';
  }

  if (hasPromptKeyword(prompt, ['bar']) || shouldIncludeBarChart(prompt)) {
    return 'barChart';
  }

  if (hasPromptKeyword(prompt, ['line']) || shouldIncludeLineChart(prompt)) {
    return 'lineChart';
  }

  if (shouldIncludeInsightList(prompt)) {
    return 'insightList';
  }

  if (shouldIncludeMetric(prompt)) {
    return 'metric';
  }

  return 'lineChart';
}

function hasPromptKeyword(prompt: string, keywords: string[]) {
  return keywords.some(keyword => prompt.includes(keyword));
}
