import { BusinessAnalyticsMeasure } from '@/__generated__/graphql-types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat('en-US');
const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function getDashboardChartMeasurePresentation(measure: BusinessAnalyticsMeasure | undefined) {
  switch (measure) {
    case BusinessAnalyticsMeasure.TotalSpend:
      return {
        yAxisLabel: 'Spend ($)',
        tooltipLabel: 'Total spend',
        formatValue: (value: number) => currencyFormatter.format(value),
      };
    case BusinessAnalyticsMeasure.TotalSavings:
      return {
        yAxisLabel: 'Savings ($)',
        tooltipLabel: 'Total savings',
        formatValue: (value: number) => currencyFormatter.format(value),
      };
    case BusinessAnalyticsMeasure.AvgOrderValue:
      return {
        yAxisLabel: 'Avg order value ($)',
        tooltipLabel: 'Average order value',
        formatValue: (value: number) => currencyFormatter.format(value),
      };
    case BusinessAnalyticsMeasure.AvgItemsPerOrder:
      return {
        yAxisLabel: 'Items / order',
        tooltipLabel: 'Average items per order',
        formatValue: (value: number) => decimalFormatter.format(value),
      };
    case BusinessAnalyticsMeasure.OrdersPlaced:
      return {
        yAxisLabel: 'Orders placed',
        tooltipLabel: 'Orders placed',
        formatValue: (value: number) => integerFormatter.format(Math.round(value)),
      };
    case BusinessAnalyticsMeasure.OrdersCompleted:
      return {
        yAxisLabel: 'Orders completed',
        tooltipLabel: 'Orders completed',
        formatValue: (value: number) => integerFormatter.format(Math.round(value)),
      };
    case BusinessAnalyticsMeasure.OrderCount:
    default:
      return {
        yAxisLabel: 'Orders',
        tooltipLabel: 'Order count',
        formatValue: (value: number) => integerFormatter.format(Math.round(value)),
      };
  }
}
