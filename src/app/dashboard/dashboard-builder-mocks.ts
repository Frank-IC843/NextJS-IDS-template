import {
  BusinessAnalyticsDimension,
  BusinessAnalyticsFilterField,
  BusinessAnalyticsFilterOperator,
  BusinessAnalyticsMeasure,
  BusinessAnalyticsTimeRange,
} from '@/__generated__/graphql-types';
import {
  dashboardWidgetSchema,
  type DashboardAnalyticsFilter,
  type DashboardLayout,
  type DashboardWidget,
  type DashboardWidgetDraft,
  type SupportedWidgetType,
} from '@/app/dashboard/dashboard-builder-types';
import { buildDashboardTimeRangeLabel } from '@/app/dashboard/dashboard-schema';

const completedOrdersFilter: DashboardAnalyticsFilter = {
  field: BusinessAnalyticsFilterField.OrderStatus,
  operator: BusinessAnalyticsFilterOperator.Equals,
  value: 'completed',
};

export const dashboardPromptSuggestions = [
  'Add a metric widget for total spend this week.',
  'Add a line chart showing order count over the past 7 days.',
  'Add a donut chart for department spend over the past 3 days.',
];

export function getStarterDashboardWidgets(): DashboardWidget[] {
  return [
    dashboardWidgetSchema.parse({
      id: 'starter-line-orders',
      widgetType: 'lineChart',
      title: 'Orders over time',
      description: 'Order count over time for the past 7 days.',
      layout: 'full',
      query: {
        measures: [BusinessAnalyticsMeasure.OrderCount],
        dimensions: [BusinessAnalyticsDimension.Date],
        filters: [],
        timeRange: BusinessAnalyticsTimeRange.Past_7Days,
      },
      timeRangeLabel: buildDashboardTimeRangeLabel(BusinessAnalyticsTimeRange.Past_7Days),
      data: {
        points: [
          { label: 'Mar 11', value: 18 },
          { label: 'Mar 12', value: 24 },
          { label: 'Mar 13', value: 21 },
          { label: 'Mar 14', value: 27 },
          { label: 'Mar 15', value: 31 },
          { label: 'Mar 16', value: 29 },
          { label: 'Mar 17', value: 34 },
        ],
        footer: 'Order count over time for the past 7 days.',
      },
    }),
    dashboardWidgetSchema.parse({
      id: 'starter-bar-departments',
      widgetType: 'barChart',
      title: 'Spend by department',
      description: 'Total spend by department for the past 7 days.',
      layout: 'half',
      query: {
        measures: [BusinessAnalyticsMeasure.TotalSpend],
        dimensions: [BusinessAnalyticsDimension.Department],
        filters: [completedOrdersFilter],
        timeRange: BusinessAnalyticsTimeRange.Past_7Days,
      },
      timeRangeLabel: buildDashboardTimeRangeLabel(BusinessAnalyticsTimeRange.Past_7Days),
      data: {
        bars: [
          { label: 'Produce', value: 42 },
          { label: 'Dairy', value: 34 },
          { label: 'Frozen', value: 28 },
          { label: 'Pantry', value: 22 },
        ],
        footer: 'Total spend by department for the past 7 days.',
      },
    }),
    dashboardWidgetSchema.parse({
      id: 'starter-donut-service-type',
      widgetType: 'donutChart',
      title: 'Spend by service type',
      description: 'Total spend share by service type for the past 3 days.',
      layout: 'half',
      query: {
        measures: [BusinessAnalyticsMeasure.TotalSpend],
        dimensions: [BusinessAnalyticsDimension.ServiceType],
        filters: [],
        timeRange: BusinessAnalyticsTimeRange.Past_3Days,
      },
      timeRangeLabel: buildDashboardTimeRangeLabel(BusinessAnalyticsTimeRange.Past_3Days),
      data: {
        segments: [
          { label: 'Delivery', value: 64, tone: 'brand' },
          { label: 'Pickup', value: 36, tone: 'positive' },
        ],
        footer: 'Total spend share by service type for the past 3 days.',
      },
    }),
  ];
}

export function mockGenerateWidgetDraft(
  prompt: string,
  options?: {
    allowedWidgetTypes?: SupportedWidgetType[];
  },
): DashboardWidgetDraft {
  const normalizedPrompt = prompt.toLowerCase();
  const preferredWidgetType = inferWidgetType(normalizedPrompt);
  const widgetType = resolveAllowedWidgetType(preferredWidgetType, options?.allowedWidgetTypes);
  const timeRange = inferTimeRange(normalizedPrompt);
  const primaryDimension = inferPrimaryDimension(normalizedPrompt, widgetType);
  const measure = inferMeasure(normalizedPrompt, primaryDimension);
  const filters = inferFilters(normalizedPrompt, measure, primaryDimension);

  return {
    id: buildWidgetId(widgetType),
    title: buildWidgetTitle(widgetType, measure, primaryDimension),
    description: buildWidgetDescription(widgetType, measure, primaryDimension, timeRange),
    prompt,
    layout: getDefaultLayout(widgetType),
    widgetType,
    query: {
      measures: [measure],
      dimensions: primaryDimension ? [primaryDimension] : [],
      filters,
      timeRange,
    },
  };
}

function inferWidgetType(prompt: string): SupportedWidgetType {
  if (hasPromptKeyword(prompt, ['donut', 'pie', 'share', 'mix', 'breakdown', 'distribution'])) {
    return 'donutChart';
  }

  if (hasPromptKeyword(prompt, ['bar', 'compare', 'comparison', 'top'])) {
    return 'barChart';
  }

  if (hasPromptKeyword(prompt, ['line', 'trend', 'over time', 'daily'])) {
    return 'lineChart';
  }

  return 'metric';
}

function inferTimeRange(prompt: string) {
  if (hasPromptKeyword(prompt, ['24 hour', '1 day', 'today', 'past day'])) {
    return BusinessAnalyticsTimeRange.Past_1Day;
  }

  if (hasPromptKeyword(prompt, ['3 day', 'three day', 'past few days'])) {
    return BusinessAnalyticsTimeRange.Past_3Days;
  }

  return BusinessAnalyticsTimeRange.Past_7Days;
}

function inferPrimaryDimension(prompt: string, widgetType: SupportedWidgetType) {
  if (widgetType === 'metric') {
    return undefined;
  }

  if (widgetType === 'lineChart') {
    return BusinessAnalyticsDimension.Date;
  }

  if (hasPromptKeyword(prompt, ['delivery vs pickup', 'pickup vs delivery', 'service type'])) {
    return BusinessAnalyticsDimension.ServiceType;
  }

  if (hasPromptKeyword(prompt, ['status', 'completed', 'canceled', 'cancelled'])) {
    return BusinessAnalyticsDimension.OrderStatus;
  }

  if (hasPromptKeyword(prompt, ['retailer', 'store', 'location'])) {
    return BusinessAnalyticsDimension.Retailer;
  }

  if (hasPromptKeyword(prompt, ['member', 'team', 'who on my team'])) {
    return BusinessAnalyticsDimension.Member;
  }

  if (hasPromptKeyword(prompt, ['category', 'categories'])) {
    return BusinessAnalyticsDimension.ProductCategory;
  }

  return BusinessAnalyticsDimension.Department;
}

function inferMeasure(prompt: string, dimension: BusinessAnalyticsDimension | undefined) {
  if (hasPromptKeyword(prompt, ['saving'])) {
    return dimension && dimension !== BusinessAnalyticsDimension.Date
      ? BusinessAnalyticsMeasure.TotalSpend
      : BusinessAnalyticsMeasure.TotalSavings;
  }

  if (hasPromptKeyword(prompt, ['average order', 'aov'])) {
    return BusinessAnalyticsMeasure.AvgOrderValue;
  }

  if (hasPromptKeyword(prompt, ['items per order', 'avg items'])) {
    return BusinessAnalyticsMeasure.AvgItemsPerOrder;
  }

  if (hasPromptKeyword(prompt, ['orders placed', 'placed orders'])) {
    return BusinessAnalyticsMeasure.OrdersPlaced;
  }

  if (hasPromptKeyword(prompt, ['orders completed', 'completed orders', 'delivered orders'])) {
    return BusinessAnalyticsMeasure.OrdersCompleted;
  }

  if (hasPromptKeyword(prompt, ['spend', 'spent', 'cost'])) {
    return BusinessAnalyticsMeasure.TotalSpend;
  }

  return BusinessAnalyticsMeasure.OrderCount;
}

function inferFilters(
  prompt: string,
  measure: BusinessAnalyticsMeasure,
  dimension: BusinessAnalyticsDimension | undefined,
) {
  if (measure === BusinessAnalyticsMeasure.TotalSavings) {
    return [];
  }

  const filters: DashboardAnalyticsFilter[] = [];
  const includesBothServiceTypes = hasPromptKeyword(prompt, ['delivery vs pickup', 'pickup vs delivery']);

  if (!includesBothServiceTypes && dimension !== BusinessAnalyticsDimension.ServiceType) {
    if (hasPromptKeyword(prompt, ['delivery only', 'delivery orders'])) {
      filters.push({
        field: BusinessAnalyticsFilterField.ServiceType,
        operator: BusinessAnalyticsFilterOperator.Equals,
        value: 'delivery',
      });
    } else if (hasPromptKeyword(prompt, ['pickup only', 'pickup orders'])) {
      filters.push({
        field: BusinessAnalyticsFilterField.ServiceType,
        operator: BusinessAnalyticsFilterOperator.Equals,
        value: 'pickup',
      });
    }
  }

  if (hasPromptKeyword(prompt, ['all orders'])) {
    return filters;
  }

  if (hasPromptKeyword(prompt, ['canceled', 'cancelled'])) {
    filters.push({
      field: BusinessAnalyticsFilterField.OrderStatus,
      operator: BusinessAnalyticsFilterOperator.Equals,
      value: 'canceled',
    });
    return filters;
  }

  if (hasPromptKeyword(prompt, ['completed', 'delivered'])) {
    filters.push(completedOrdersFilter);
    return filters;
  }

  if (measure !== BusinessAnalyticsMeasure.OrdersPlaced) {
    filters.push(completedOrdersFilter);
  }

  return filters;
}

function buildWidgetTitle(
  widgetType: SupportedWidgetType,
  measure: BusinessAnalyticsMeasure,
  dimension: BusinessAnalyticsDimension | undefined,
) {
  if (widgetType === 'metric') {
    return getMeasureLabel(measure);
  }

  if (widgetType === 'lineChart') {
    return `${getMeasureLabel(measure)} over time`;
  }

  if (widgetType === 'barChart') {
    return `${getMeasureLabel(measure)} by ${getDimensionLabel(dimension ?? BusinessAnalyticsDimension.Department)}`;
  }

  return `${getDimensionLabel(dimension ?? BusinessAnalyticsDimension.Department)} share`;
}

function buildWidgetDescription(
  widgetType: SupportedWidgetType,
  measure: BusinessAnalyticsMeasure,
  dimension: BusinessAnalyticsDimension | undefined,
  timeRange: BusinessAnalyticsTimeRange,
) {
  const timeRangeLabel = buildDashboardTimeRangeLabel(timeRange).toLowerCase();

  switch (widgetType) {
    case 'metric':
      return `${getMeasureLabel(measure)} for ${timeRangeLabel}.`;
    case 'lineChart':
      return `${getMeasureLabel(measure)} over time for ${timeRangeLabel}.`;
    case 'barChart':
      return `${getMeasureLabel(measure)} by ${getDimensionLabel(dimension ?? BusinessAnalyticsDimension.Department).toLowerCase()} for ${timeRangeLabel}.`;
    case 'donutChart':
    default:
      return `${getMeasureLabel(measure)} share by ${getDimensionLabel(dimension ?? BusinessAnalyticsDimension.Department).toLowerCase()} for ${timeRangeLabel}.`;
  }
}

function getDefaultLayout(widgetType: SupportedWidgetType): DashboardLayout {
  switch (widgetType) {
    case 'metric':
    case 'donutChart':
      return 'half';
    case 'lineChart':
    case 'barChart':
    default:
      return 'full';
  }
}

function resolveAllowedWidgetType(
  preferredWidgetType: SupportedWidgetType,
  allowedWidgetTypes?: SupportedWidgetType[],
): SupportedWidgetType {
  if (!allowedWidgetTypes || allowedWidgetTypes.length === 0) {
    return preferredWidgetType;
  }

  if (allowedWidgetTypes.includes(preferredWidgetType)) {
    return preferredWidgetType;
  }

  return allowedWidgetTypes[0];
}

function getMeasureLabel(measure: BusinessAnalyticsMeasure) {
  switch (measure) {
    case BusinessAnalyticsMeasure.TotalSpend:
      return 'Total spend';
    case BusinessAnalyticsMeasure.TotalSavings:
      return 'Total savings';
    case BusinessAnalyticsMeasure.OrdersPlaced:
      return 'Orders placed';
    case BusinessAnalyticsMeasure.OrdersCompleted:
      return 'Orders completed';
    case BusinessAnalyticsMeasure.AvgOrderValue:
      return 'Average order value';
    case BusinessAnalyticsMeasure.AvgItemsPerOrder:
      return 'Average items per order';
    case BusinessAnalyticsMeasure.OrderCount:
    default:
      return 'Order count';
  }
}

function getDimensionLabel(dimension: BusinessAnalyticsDimension) {
  switch (dimension) {
    case BusinessAnalyticsDimension.Date:
      return 'Date';
    case BusinessAnalyticsDimension.ServiceType:
      return 'Service type';
    case BusinessAnalyticsDimension.OrderStatus:
      return 'Order status';
    case BusinessAnalyticsDimension.Retailer:
      return 'Retailer';
    case BusinessAnalyticsDimension.Member:
      return 'Member';
    case BusinessAnalyticsDimension.ProductCategory:
      return 'Product category';
    case BusinessAnalyticsDimension.Department:
    default:
      return 'Department';
  }
}

function buildWidgetId(prefix: SupportedWidgetType) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function hasPromptKeyword(prompt: string, keywords: string[]) {
  return keywords.some(keyword => prompt.includes(keyword));
}
