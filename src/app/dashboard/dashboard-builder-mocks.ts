import {
  BusinessAnalyticsDimension,
  BusinessAnalyticsFilterField,
  BusinessAnalyticsFilterOperator,
  BusinessAnalyticsMeasure,
  BusinessAnalyticsTimeRange,
} from '@/__generated__/graphql-types';
import {
  dashboardWidgetSchema,
  MAX_METRICS_PER_WIDGET,
  MAX_WIDGETS_PER_GENERATION,
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
  'Show a dashboard with order trend plus department share over the past 7 days.',
  'Create an executive dashboard for retailer spend and service-type mix.',
];

export function getStarterDashboardWidgets(): DashboardWidget[] {
  return [
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

interface PlannerWidgetSpec {
  widgetType: SupportedWidgetType;
  measures: BusinessAnalyticsMeasure[];
  dimension?: BusinessAnalyticsDimension;
  timeRange: BusinessAnalyticsTimeRange;
  filters: DashboardAnalyticsFilter[];
}

export function mockGenerateDashboardDrafts(
  prompt: string,
  options?: {
    allowedWidgetTypes?: SupportedWidgetType[];
  },
): DashboardWidgetDraft[] {
  const normalizedPrompt = prompt.toLowerCase();
  const allowedWidgetTypes = resolveAllowedWidgetTypes(options?.allowedWidgetTypes);
  const desiredWidgetCount = resolvePlannerWidgetCount(normalizedPrompt, allowedWidgetTypes.length);
  const explicitWidgetTypes = collectExplicitWidgetTypes(normalizedPrompt).filter(widgetType =>
    allowedWidgetTypes.includes(widgetType),
  );
  const candidateSpecs: PlannerWidgetSpec[] = [];
  const primaryComparisonDimension = inferComparisonDimension(normalizedPrompt);
  const timeRange = inferTimeRange(normalizedPrompt);
  const preferredMeasure = inferMeasure(normalizedPrompt, primaryComparisonDimension);

  explicitWidgetTypes.forEach(widgetType => {
    const spec = buildPlannerWidgetSpec(widgetType, normalizedPrompt, timeRange, preferredMeasure, primaryComparisonDimension);

    if (spec) {
      candidateSpecs.push(spec);
    }
  });

  if (shouldBuildDashboardSet(normalizedPrompt)) {
    ['metric', 'donutChart', 'lineChart', 'barChart']
      .filter((widgetType): widgetType is SupportedWidgetType => allowedWidgetTypes.includes(widgetType as SupportedWidgetType))
      .forEach(widgetType => {
        const spec = buildPlannerWidgetSpec(
          widgetType,
          normalizedPrompt,
          timeRange,
          preferredMeasure,
          primaryComparisonDimension,
        );

        if (spec) {
          candidateSpecs.push(spec);
        }
      });
  } else if (candidateSpecs.length === 0) {
    const widgetType = resolveAllowedWidgetType(inferWidgetType(normalizedPrompt), allowedWidgetTypes);
    const spec = buildPlannerWidgetSpec(widgetType, normalizedPrompt, timeRange, preferredMeasure, primaryComparisonDimension);

    if (spec) {
      candidateSpecs.push(spec);
    }
  }

  const uniqueSpecs = dedupePlannerSpecs(candidateSpecs).slice(0, desiredWidgetCount);
  const drafts = uniqueSpecs.map(spec => buildWidgetDraftFromSpec(spec, prompt));

  return optimizeDraftsForCanvas(drafts);
}

export function mockGenerateWidgetDraft(
  prompt: string,
  options?: {
    allowedWidgetTypes?: SupportedWidgetType[];
  },
): DashboardWidgetDraft {
  return mockGenerateDashboardDrafts(prompt, options)[0];
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

function collectExplicitWidgetTypes(prompt: string): SupportedWidgetType[] {
  const widgetTypes: SupportedWidgetType[] = [];

  if (hasPromptKeyword(prompt, ['metric', 'kpi', 'headline', 'summary'])) {
    widgetTypes.push('metric');
  }

  if (hasPromptKeyword(prompt, ['line', 'trend', 'over time', 'daily'])) {
    widgetTypes.push('lineChart');
  }

  if (hasPromptKeyword(prompt, ['bar', 'compare', 'comparison', 'top'])) {
    widgetTypes.push('barChart');
  }

  if (hasPromptKeyword(prompt, ['donut', 'pie', 'share', 'mix', 'breakdown', 'distribution'])) {
    widgetTypes.push('donutChart');
  }

  return widgetTypes;
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

  if (widgetType === 'barChart') {
    if (hasPromptKeyword(prompt, ['member', 'team member', 'team members', 'who on my team', 'who spent the most'])) {
      return BusinessAnalyticsDimension.Member;
    }

    if (hasPromptKeyword(prompt, ['retailer', 'retailers', 'store', 'stores', 'location', 'locations'])) {
      return BusinessAnalyticsDimension.Retailer;
    }

    if (hasPromptKeyword(prompt, ['department', 'departments'])) {
      return BusinessAnalyticsDimension.Department;
    }

    if (hasPromptKeyword(prompt, ['category', 'categories'])) {
      return BusinessAnalyticsDimension.ProductCategory;
    }

    if (hasPromptKeyword(prompt, ['delivery vs pickup', 'pickup vs delivery', 'service type'])) {
      return BusinessAnalyticsDimension.ServiceType;
    }

    if (hasExplicitOrderStatusBreakdownIntent(prompt)) {
      return BusinessAnalyticsDimension.OrderStatus;
    }

    return BusinessAnalyticsDimension.Member;
  }

  if (hasPromptKeyword(prompt, ['retailer share', 'retailer mix', 'retailer breakdown', 'retailer got the biggest share'])) {
    return BusinessAnalyticsDimension.Retailer;
  }

  if (hasPromptKeyword(prompt, ['delivery vs pickup', 'pickup vs delivery', 'service type'])) {
    return BusinessAnalyticsDimension.ServiceType;
  }

  if (hasPromptKeyword(prompt, ['department', 'departments'])) {
    return BusinessAnalyticsDimension.Department;
  }

  if (hasPromptKeyword(prompt, ['category', 'categories'])) {
    return BusinessAnalyticsDimension.ProductCategory;
  }

  if (hasPromptKeyword(prompt, ['member', 'team member', 'team members', 'who on my team'])) {
    return BusinessAnalyticsDimension.Member;
  }

  if (hasExplicitOrderStatusBreakdownIntent(prompt)) {
    return BusinessAnalyticsDimension.OrderStatus;
  }

  if (hasPromptKeyword(prompt, ['retailer', 'retailers', 'store', 'stores', 'location', 'locations'])) {
    return BusinessAnalyticsDimension.Retailer;
  }

  return BusinessAnalyticsDimension.ServiceType;
}

function inferComparisonDimension(prompt: string) {
  if (hasPromptKeyword(prompt, ['delivery vs pickup', 'pickup vs delivery', 'service type'])) {
    return BusinessAnalyticsDimension.ServiceType;
  }

  if (hasExplicitOrderStatusBreakdownIntent(prompt)) {
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

function hasExplicitOrderStatusBreakdownIntent(prompt: string) {
  return hasPromptKeyword(prompt, [
    'order status',
    'status share',
    'status breakdown',
    'status mix',
    'status comparison',
    'completed vs canceled',
    'completed vs cancelled',
    'placed vs completed',
  ]);
}

function buildWidgetTitle(
  widgetType: SupportedWidgetType,
  measures: BusinessAnalyticsMeasure[],
  dimension: BusinessAnalyticsDimension | undefined,
) {
  const primaryMeasure = measures[0] ?? BusinessAnalyticsMeasure.OrderCount;

  if (widgetType === 'metric') {
    return buildMetricWidgetTitle(measures);
  }

  if (widgetType === 'lineChart') {
    return `${getMeasureLabel(primaryMeasure)} over time`;
  }

  if (widgetType === 'barChart') {
    return `${getMeasureLabel(primaryMeasure)} by ${getDimensionLabel(dimension ?? BusinessAnalyticsDimension.Department)}`;
  }

  return `${getDimensionLabel(dimension ?? BusinessAnalyticsDimension.Department)} share`;
}

function buildWidgetDescription(
  widgetType: SupportedWidgetType,
  measures: BusinessAnalyticsMeasure[],
  dimension: BusinessAnalyticsDimension | undefined,
  timeRange: BusinessAnalyticsTimeRange,
) {
  const timeRangeLabel = buildDashboardTimeRangeLabel(timeRange).toLowerCase();
  const primaryMeasure = measures[0] ?? BusinessAnalyticsMeasure.OrderCount;

  switch (widgetType) {
    case 'metric':
      return measures.length > 1
        ? `Top-line snapshot of ${formatMetricMeasureList(measures)} for ${timeRangeLabel}.`
        : `${getMeasureLabel(primaryMeasure)} for ${timeRangeLabel}.`;
    case 'lineChart':
      return `${getMeasureLabel(primaryMeasure)} over time for ${timeRangeLabel}.`;
    case 'barChart':
      return `${getMeasureLabel(primaryMeasure)} by ${getDimensionLabel(dimension ?? BusinessAnalyticsDimension.Department).toLowerCase()} for ${timeRangeLabel}.`;
    case 'donutChart':
    default:
      return `${getMeasureLabel(primaryMeasure)} share by ${getDimensionLabel(dimension ?? BusinessAnalyticsDimension.Department).toLowerCase()} for ${timeRangeLabel}.`;
  }
}

function buildMetricMeasureSet(prompt: string, primaryMeasure: BusinessAnalyticsMeasure) {
  const measures = [primaryMeasure];

  if (!shouldUseCompositeMetricCard(prompt)) {
    return measures;
  }

  switch (primaryMeasure) {
    case BusinessAnalyticsMeasure.TotalSavings:
      measures.push(BusinessAnalyticsMeasure.TotalSpend, BusinessAnalyticsMeasure.OrderCount);
      break;
    case BusinessAnalyticsMeasure.AvgOrderValue:
      measures.push(BusinessAnalyticsMeasure.TotalSpend, BusinessAnalyticsMeasure.OrderCount);
      break;
    case BusinessAnalyticsMeasure.AvgItemsPerOrder:
      measures.push(BusinessAnalyticsMeasure.OrderCount, BusinessAnalyticsMeasure.AvgOrderValue);
      break;
    case BusinessAnalyticsMeasure.OrdersPlaced:
    case BusinessAnalyticsMeasure.OrdersCompleted:
    case BusinessAnalyticsMeasure.OrderCount:
      measures.push(BusinessAnalyticsMeasure.TotalSpend, BusinessAnalyticsMeasure.AvgOrderValue);
      break;
    case BusinessAnalyticsMeasure.TotalSpend:
    default:
      measures.push(BusinessAnalyticsMeasure.OrderCount, BusinessAnalyticsMeasure.AvgOrderValue);
      break;
  }

  return Array.from(new Set(measures)).slice(0, MAX_METRICS_PER_WIDGET);
}

function shouldUseCompositeMetricCard(prompt: string) {
  return (
    shouldBuildDashboardSet(prompt) ||
    hasPromptKeyword(prompt, ['summary', 'snapshot', 'scorecard', 'kpi', 'kpis', 'top line', 'topline', 'performance']) ||
    countRequestedMetricThemes(prompt) >= 2
  );
}

function countRequestedMetricThemes(prompt: string) {
  return [
    hasPromptKeyword(prompt, ['spend', 'spent', 'cost']),
    hasPromptKeyword(prompt, ['orders', 'order count', 'completed orders', 'placed orders']),
    hasPromptKeyword(prompt, ['average order', 'aov']),
    hasPromptKeyword(prompt, ['items per order', 'avg items', 'basket size']),
    hasPromptKeyword(prompt, ['saving', 'savings']),
  ].filter(Boolean).length;
}

function buildMetricWidgetTitle(measures: BusinessAnalyticsMeasure[]) {
  if (measures.length <= 1) {
    return getMeasureLabel(measures[0] ?? BusinessAnalyticsMeasure.OrderCount);
  }

  if (measures.includes(BusinessAnalyticsMeasure.TotalSavings)) {
    return 'Savings snapshot';
  }

  if (measures.includes(BusinessAnalyticsMeasure.TotalSpend)) {
    return 'Performance snapshot';
  }

  if (
    measures.includes(BusinessAnalyticsMeasure.OrderCount) ||
    measures.includes(BusinessAnalyticsMeasure.OrdersPlaced) ||
    measures.includes(BusinessAnalyticsMeasure.OrdersCompleted)
  ) {
    return 'Order snapshot';
  }

  return 'KPI snapshot';
}

function formatMetricMeasureList(measures: BusinessAnalyticsMeasure[]) {
  const labels = measures.slice(0, MAX_METRICS_PER_WIDGET).map(measure => getMeasureLabel(measure).toLowerCase());

  if (labels.length <= 1) {
    return labels[0] ?? 'top-line metrics';
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')}, and ${labels.at(-1)}`;
}

function getDefaultLayout(widgetType: SupportedWidgetType): DashboardLayout {
  switch (widgetType) {
    case 'metric':
    case 'lineChart':
    case 'barChart':
    case 'donutChart':
    default:
      return 'half';
  }
}

function buildPlannerWidgetSpec(
  widgetType: SupportedWidgetType,
  prompt: string,
  timeRange: BusinessAnalyticsTimeRange,
  preferredMeasure: BusinessAnalyticsMeasure,
  primaryComparisonDimension: BusinessAnalyticsDimension,
) {
  const inferredDimension =
    widgetType === 'lineChart' ? BusinessAnalyticsDimension.Date : inferPrimaryDimension(prompt, widgetType);
  const dimension = widgetType === 'metric' ? undefined : inferredDimension;
  const primaryMeasure =
    preferredMeasure === BusinessAnalyticsMeasure.TotalSavings && dimension && dimension !== BusinessAnalyticsDimension.Date
      ? BusinessAnalyticsMeasure.TotalSpend
      : preferredMeasure;
  const measures = widgetType === 'metric' ? buildMetricMeasureSet(prompt, primaryMeasure) : [primaryMeasure];

  return {
    widgetType,
    measures,
    dimension,
    timeRange,
    filters: inferFilters(
      prompt,
      primaryMeasure,
      widgetType === 'metric' ? undefined : dimension ?? primaryComparisonDimension,
    ),
  } satisfies PlannerWidgetSpec;
}

function buildWidgetDraftFromSpec(
  spec: PlannerWidgetSpec,
  prompt: string,
): DashboardWidgetDraft {
  const layout: DashboardLayout = getDefaultLayout(spec.widgetType);

  return {
    id: buildWidgetId(spec.widgetType),
    title: buildWidgetTitle(spec.widgetType, spec.measures, spec.dimension),
    description: buildWidgetDescription(spec.widgetType, spec.measures, spec.dimension, spec.timeRange),
    prompt,
    layout,
    widgetType: spec.widgetType,
    query: {
      measures: spec.measures,
      dimensions: spec.dimension ? [spec.dimension] : [],
      filters: spec.filters,
      timeRange: spec.timeRange,
    },
  };
}

function dedupePlannerSpecs(specs: PlannerWidgetSpec[]) {
  const seen = new Set<string>();

  return specs.filter(spec => {
    const key = JSON.stringify({
      widgetType: spec.widgetType,
      measures: spec.measures,
      dimension: spec.dimension ?? null,
      timeRange: spec.timeRange,
      filters: spec.filters,
    });

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function optimizeDraftsForCanvas(drafts: DashboardWidgetDraft[]) {
  if (drafts.length <= 1) {
    return drafts;
  }

  const nextDrafts = drafts.map<DashboardWidgetDraft>(draft => ({ ...draft }));
  const halfWidgets = nextDrafts.filter(draft => draft.layout === 'half');
  const fullWidgets = nextDrafts.filter(draft => draft.layout === 'full');

  if (nextDrafts.length >= 3 && halfWidgets.length === 1 && fullWidgets.length >= 2) {
    const firstFullBarChart = fullWidgets.find(draft => draft.widgetType === 'barChart');

    if (firstFullBarChart) {
      firstFullBarChart.layout = 'half';
    }
  }

  const hasFullAndHalfTwoUp =
    nextDrafts.length === 2 &&
    nextDrafts.some(draft => draft.layout === 'full') &&
    nextDrafts.some(draft => draft.layout === 'half');

  return [...nextDrafts]
    .sort((leftDraft, rightDraft) => {
      const leftWeight = getCanvasOrderWeight(leftDraft.widgetType, leftDraft.layout, nextDrafts.length, hasFullAndHalfTwoUp);
      const rightWeight = getCanvasOrderWeight(
        rightDraft.widgetType,
        rightDraft.layout,
        nextDrafts.length,
        hasFullAndHalfTwoUp,
      );

      return leftWeight - rightWeight;
    })
    .slice(0, MAX_WIDGETS_PER_GENERATION);
}

function getCanvasOrderWeight(
  widgetType: SupportedWidgetType,
  layout: DashboardLayout,
  totalWidgets: number,
  hasFullAndHalfTwoUp: boolean,
) {
  if (totalWidgets === 2 && layout === 'full') {
    return widgetType === 'lineChart' ? 0 : 1;
  }

  if (hasFullAndHalfTwoUp && layout === 'half') {
    return 4;
  }

  switch (widgetType) {
    case 'metric':
      return 0;
    case 'donutChart':
      return 1;
    case 'lineChart':
      return 2;
    case 'barChart':
    default:
      return 3;
  }
}

function resolveAllowedWidgetTypes(allowedWidgetTypes?: SupportedWidgetType[]) {
  if (!allowedWidgetTypes || allowedWidgetTypes.length === 0) {
    return ['metric', 'lineChart', 'barChart', 'donutChart'] satisfies SupportedWidgetType[];
  }

  return allowedWidgetTypes;
}

function resolvePlannerWidgetCount(prompt: string, allowedWidgetCount: number) {
  const explicitWidgetCount = collectExplicitWidgetTypes(prompt).length;
  const dashboardIntent = shouldBuildDashboardSet(prompt);
  const multiIntent = dashboardIntent || hasPromptKeyword(prompt, [' and ', ',', ' plus ', ' alongside ']);

  if (!multiIntent) {
    return 1;
  }

  if (hasPromptKeyword(prompt, ['executive dashboard', 'comprehensive', 'full dashboard', 'overview dashboard'])) {
    return Math.min(MAX_WIDGETS_PER_GENERATION, allowedWidgetCount, 4);
  }

  if (dashboardIntent) {
    return Math.min(MAX_WIDGETS_PER_GENERATION, allowedWidgetCount, Math.max(explicitWidgetCount, 3));
  }

  if (explicitWidgetCount >= 2) {
    return Math.min(MAX_WIDGETS_PER_GENERATION, allowedWidgetCount, explicitWidgetCount);
  }

  return Math.min(MAX_WIDGETS_PER_GENERATION, allowedWidgetCount, dashboardIntent ? 3 : 2);
}

function shouldBuildDashboardSet(prompt: string) {
  return hasPromptKeyword(prompt, [
    'dashboard',
    'overview',
    'scorecard',
    'cockpit',
    'workspace',
    'exec view',
    'executive',
  ]);
}

function resolveAllowedWidgetType(
  preferredWidgetType: SupportedWidgetType,
  allowedWidgetTypes: SupportedWidgetType[],
): SupportedWidgetType {
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
