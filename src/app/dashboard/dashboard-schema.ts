import {
  BusinessAnalyticsDimension,
  BusinessAnalyticsMeasure,
  BusinessAnalyticsQueryQuery,
  BusinessAnalyticsTimeRange,
} from '@/__generated__/graphql-types';
import {
  dashboardWidgetSchema,
  type DashboardAnalyticsFilter,
  type DashboardAnalyticsQuery,
  type DashboardLayout,
  type DashboardTone,
  type DashboardWidget,
  type DashboardWidgetDraft,
  persistedDashboardLayoutSchema,
  type PersistedDashboardChartType,
  type PersistedDashboardLayout,
  type PersistedDashboardWidget,
  type SupportedWidgetType,
} from '@/app/dashboard/dashboard-builder-types';

const TWO_COLUMN_WIDTH = 2;
const donutTones: DashboardTone[] = ['brand', 'positive', 'neutral', 'caution'];
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});
const integerFormatter = new Intl.NumberFormat('en-US');

export function parsePersistedDashboardLayout(layout: unknown) {
  return persistedDashboardLayoutSchema.safeParse(layout);
}

export function getDashboardWidgetDraftsFromLayout(layout: unknown) {
  const parsedLayout = parsePersistedDashboardLayout(layout);

  if (!parsedLayout.success) {
    return {
      layout: null,
      drafts: [] as DashboardWidgetDraft[],
    };
  }

  return {
    layout: parsedLayout.data,
    drafts: parsedLayout.data.widgets
      .slice()
      .sort((leftWidget, rightWidget) => {
        if (leftWidget.position.y !== rightWidget.position.y) {
          return leftWidget.position.y - rightWidget.position.y;
        }

        return leftWidget.position.x - rightWidget.position.x;
      })
      .flatMap(widget => {
        const draft = persistedWidgetToDraft(widget);

        return draft ? [draft] : [];
      }),
  };
}

export function buildPersistedDashboardLayout(widgets: DashboardWidget[]): PersistedDashboardLayout {
  let currentRow = 0;
  let currentColumn = 0;

  return {
    version: 1,
    widgets: widgets.map(widget => {
      const isFullWidth = widget.layout === 'full';
      const width = isFullWidth ? TWO_COLUMN_WIDTH : 1;
      let x = 0;
      let y = currentRow;

      if (isFullWidth) {
        if (currentColumn !== 0) {
          currentRow += 1;
          currentColumn = 0;
        }

        x = 0;
        y = currentRow;
        currentRow += 1;
      } else {
        x = currentColumn;
        y = currentRow;

        if (currentColumn === 0) {
          currentColumn = 1;
        } else {
          currentColumn = 0;
          currentRow += 1;
        }
      }

      return {
        id: widget.id,
        title: widget.title,
        prompt: widget.prompt ?? null,
        position: {
          x,
          y,
          w: width,
          h: isFullWidth ? 2 : 1,
        },
        chart_type: getPersistedChartType(widget.widgetType),
        query: widget.query,
      };
    }),
  };
}

export function buildDashboardTimeRangeLabel(timeRange: BusinessAnalyticsTimeRange) {
  switch (timeRange) {
    case BusinessAnalyticsTimeRange.Past_1Day:
      return 'Past 1 day';
    case BusinessAnalyticsTimeRange.Past_3Days:
      return 'Past 3 days';
    case BusinessAnalyticsTimeRange.Past_7Days:
    default:
      return 'Past 7 days';
  }
}

export function hydrateDashboardWidget(
  draft: DashboardWidgetDraft,
  analyticsResult: BusinessAnalyticsQueryQuery['businessAnalyticsQuery'],
): DashboardWidget {
  const timeRangeLabel = buildDashboardTimeRangeLabel(draft.query.timeRange);
  const primaryMeasure = draft.query.measures[0] ?? BusinessAnalyticsMeasure.OrderCount;
  const primaryDimension = draft.query.dimensions[0];
  const rows = analyticsResult?.rows ?? [];

  switch (draft.widgetType) {
    case 'metric': {
      const rawValue = rows[0]?.[draft.query.dimensions.length] ?? null;

      return dashboardWidgetSchema.parse({
        ...draft,
        description: draft.description ?? buildWidgetDescription(draft),
        timeRangeLabel,
        data: {
          value: formatMetricValue(primaryMeasure, rawValue),
          change: timeRangeLabel,
          detail: buildMetricDetail(draft.query, rows.length > 0),
          tone: getMeasureTone(primaryMeasure),
        },
      });
    }
    case 'lineChart': {
      return dashboardWidgetSchema.parse({
        ...draft,
        description: draft.description ?? buildWidgetDescription(draft),
        timeRangeLabel,
        data: {
          points: rows.map(row => ({
            label: formatDimensionValue(primaryDimension, row[0] ?? ''),
            value: formatChartValue(primaryMeasure, row[draft.query.dimensions.length]),
          })),
          footer: buildChartFooter(draft.query, 'over time'),
        },
      });
    }
    case 'barChart': {
      return dashboardWidgetSchema.parse({
        ...draft,
        description: draft.description ?? buildWidgetDescription(draft),
        timeRangeLabel,
        data: {
          bars: rows.map(row => ({
            label: formatDimensionValue(primaryDimension, row[0] ?? ''),
            value: formatChartValue(primaryMeasure, row[draft.query.dimensions.length]),
          })),
          footer: buildChartFooter(draft.query, primaryDimension ? `by ${getDimensionLabel(primaryDimension).toLowerCase()}` : null),
        },
      });
    }
    case 'donutChart':
    default: {
      return dashboardWidgetSchema.parse({
        ...draft,
        description: draft.description ?? buildWidgetDescription(draft),
        timeRangeLabel,
        data: {
          segments: rows.map((row, index) => ({
            label: formatDimensionValue(primaryDimension, row[0] ?? ''),
            value: formatChartValue(primaryMeasure, row[draft.query.dimensions.length]),
            tone: donutTones[index % donutTones.length] ?? donutTones[0],
          })),
          footer: buildChartFooter(draft.query, primaryDimension ? `share by ${getDimensionLabel(primaryDimension).toLowerCase()}` : null),
        },
      });
    }
  }
}

function persistedWidgetToDraft(widget: PersistedDashboardWidget): DashboardWidgetDraft | null {
  const widgetType = getSupportedWidgetType(widget.chart_type);

  if (!widgetType) {
    return null;
  }

  const layout: DashboardLayout = widget.position.w >= TWO_COLUMN_WIDTH ? 'full' : 'half';

  return {
    id: widget.id,
    title: widget.title,
    description: buildWidgetDescription({
      id: widget.id,
      title: widget.title,
      prompt: widget.prompt ?? undefined,
      layout,
      widgetType,
      query: widget.query,
    }),
    prompt: widget.prompt ?? undefined,
    layout,
    widgetType,
    query: widget.query,
  };
}

function getSupportedWidgetType(chartType: PersistedDashboardChartType): SupportedWidgetType | null {
  switch (chartType) {
    case 'NUMBER':
      return 'metric';
    case 'LINE_CHART':
      return 'lineChart';
    case 'BAR_CHART':
      return 'barChart';
    case 'PIE_CHART':
      return 'donutChart';
    case 'TABLE':
    default:
      return null;
  }
}

function getPersistedChartType(widgetType: SupportedWidgetType) {
  switch (widgetType) {
    case 'metric':
      return 'NUMBER';
    case 'lineChart':
      return 'LINE_CHART';
    case 'barChart':
      return 'BAR_CHART';
    case 'donutChart':
    default:
      return 'PIE_CHART';
  }
}

function buildWidgetDescription(draft: Pick<DashboardWidgetDraft, 'query' | 'widgetType'>) {
  const primaryMeasure = draft.query.measures[0] ?? BusinessAnalyticsMeasure.OrderCount;
  const primaryDimension = draft.query.dimensions[0];
  const timeRangeLabel = buildDashboardTimeRangeLabel(draft.query.timeRange).toLowerCase();
  const filterSuffix = buildFilterSuffix(draft.query.filters);

  switch (draft.widgetType) {
    case 'metric':
      return `${getMeasureLabel(primaryMeasure)} for ${timeRangeLabel}${filterSuffix}.`;
    case 'lineChart':
      return `${getMeasureLabel(primaryMeasure)} over time for ${timeRangeLabel}${filterSuffix}.`;
    case 'barChart':
      return `${getMeasureLabel(primaryMeasure)} by ${getDimensionLabel(primaryDimension ?? BusinessAnalyticsDimension.ServiceType).toLowerCase()} for ${timeRangeLabel}${filterSuffix}.`;
    case 'donutChart':
    default:
      return `${getMeasureLabel(primaryMeasure)} share by ${getDimensionLabel(primaryDimension ?? BusinessAnalyticsDimension.Department).toLowerCase()} for ${timeRangeLabel}${filterSuffix}.`;
  }
}

function buildMetricDetail(query: DashboardAnalyticsQuery, hasData: boolean) {
  if (!hasData) {
    return 'No matching data was returned for the selected widget query.';
  }

  const primaryMeasure = query.measures[0] ?? BusinessAnalyticsMeasure.OrderCount;

  return `${getMeasureLabel(primaryMeasure)} for ${buildDashboardTimeRangeLabel(query.timeRange).toLowerCase()}${buildFilterSuffix(query.filters)}.`;
}

function buildChartFooter(query: DashboardAnalyticsQuery, groupingText: string | null) {
  const primaryMeasure = query.measures[0] ?? BusinessAnalyticsMeasure.OrderCount;
  const rangeText = buildDashboardTimeRangeLabel(query.timeRange).toLowerCase();

  return `${getMeasureLabel(primaryMeasure)} ${groupingText ?? 'across matching records'} for ${rangeText}${buildFilterSuffix(query.filters)}.`;
}

function buildFilterSuffix(filters: DashboardAnalyticsFilter[]) {
  if (filters.length === 0) {
    return '';
  }

  if (filters.length === 1) {
    const filter = filters[0];
    const fieldLabel = getFilterFieldLabel(filter.field).toLowerCase();
    const operatorLabel = filter.operator === 'EQUALS' ? '' : 'not ';

    if (filter.field === 'ORDER_STATUS') {
      return ` for ${operatorLabel}${humanizeLabel(filter.value).toLowerCase()} orders`;
    }

    return ` filtered to ${fieldLabel} ${operatorLabel}${humanizeLabel(filter.value).toLowerCase()}`;
  }

  return ' with filters applied';
}

function getMeasureTone(measure: BusinessAnalyticsMeasure): DashboardTone {
  switch (measure) {
    case BusinessAnalyticsMeasure.TotalSpend:
    case BusinessAnalyticsMeasure.TotalSavings:
    case BusinessAnalyticsMeasure.AvgOrderValue:
      return 'brand';
    case BusinessAnalyticsMeasure.AvgItemsPerOrder:
      return 'neutral';
    case BusinessAnalyticsMeasure.OrdersCompleted:
    case BusinessAnalyticsMeasure.OrdersPlaced:
    case BusinessAnalyticsMeasure.OrderCount:
    default:
      return 'positive';
  }
}

function formatMetricValue(measure: BusinessAnalyticsMeasure, rawValue: string | null) {
  if (rawValue == null) {
    return 'No data';
  }

  const numericValue = Number(rawValue);

  if (Number.isNaN(numericValue)) {
    return rawValue;
  }

  switch (measure) {
    case BusinessAnalyticsMeasure.TotalSpend:
    case BusinessAnalyticsMeasure.TotalSavings:
    case BusinessAnalyticsMeasure.AvgOrderValue:
      return currencyFormatter.format(numericValue / 100);
    case BusinessAnalyticsMeasure.AvgItemsPerOrder:
      return decimalFormatter.format(numericValue);
    case BusinessAnalyticsMeasure.OrdersCompleted:
    case BusinessAnalyticsMeasure.OrdersPlaced:
    case BusinessAnalyticsMeasure.OrderCount:
    default:
      return integerFormatter.format(Math.round(numericValue));
  }
}

function formatChartValue(measure: BusinessAnalyticsMeasure, rawValue: string | undefined) {
  if (!rawValue) {
    return 0;
  }

  const numericValue = Number(rawValue);

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  switch (measure) {
    case BusinessAnalyticsMeasure.TotalSpend:
    case BusinessAnalyticsMeasure.TotalSavings:
    case BusinessAnalyticsMeasure.AvgOrderValue:
      return Math.max(Math.round(numericValue / 100), 0);
    case BusinessAnalyticsMeasure.AvgItemsPerOrder:
      return Math.max(Number(numericValue.toFixed(1)), 0);
    case BusinessAnalyticsMeasure.OrdersCompleted:
    case BusinessAnalyticsMeasure.OrdersPlaced:
    case BusinessAnalyticsMeasure.OrderCount:
    default:
      return Math.max(numericValue, 0);
  }
}

function formatDimensionValue(dimension: BusinessAnalyticsDimension | undefined, rawValue: string) {
  if (!rawValue) {
    return 'Unknown';
  }

  if (dimension === BusinessAnalyticsDimension.Date) {
    const parsedDate = new Date(rawValue);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  return humanizeLabel(rawValue);
}

function humanizeLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, character => character.toUpperCase());
}

function getMeasureLabel(measure: BusinessAnalyticsMeasure) {
  switch (measure) {
    case BusinessAnalyticsMeasure.OrdersPlaced:
      return 'Orders placed';
    case BusinessAnalyticsMeasure.OrdersCompleted:
      return 'Orders completed';
    case BusinessAnalyticsMeasure.TotalSpend:
      return 'Total spend';
    case BusinessAnalyticsMeasure.TotalSavings:
      return 'Total savings';
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
    case BusinessAnalyticsDimension.Department:
      return 'Department';
    case BusinessAnalyticsDimension.ProductCategory:
    default:
      return 'Product category';
  }
}

function getFilterFieldLabel(field: DashboardAnalyticsFilter['field']) {
  switch (field) {
    case 'SERVICE_TYPE':
      return 'Service type';
    case 'ORDER_STATUS':
      return 'Order status';
    case 'RETAILER':
      return 'Retailer';
    case 'DEPARTMENT':
      return 'Department';
    case 'PRODUCT_CATEGORY':
    default:
      return 'Product category';
  }
}
