import {
  dashboardCanvasWidgetSchema,
  dashboardWidgetSchema,
  MAX_METRICS_PER_WIDGET,
  MAX_TABLE_ROWS_PER_WIDGET,
  type DashboardCoverageGapWidget,
  type DashboardMetricItem,
  type DashboardTone,
  type DashboardWidgetDraft,
} from '@/app/dashboard/dashboard-builder-types';
import { insightQuestionsById } from '@/app/insights/insights-catalog';
import type {
  InsightAnswerShape,
  InsightQueryResponse,
  InsightRelativeRange,
  InsightTableColumn,
  InsightTableRowValue,
} from '@/app/insights/insights-types';

export function buildRelativeRangeLabel(relativeRange: InsightRelativeRange) {
  switch (relativeRange) {
    case 'past_7_days':
      return 'Past 7 days';
    case 'past_30_days':
      return 'Past 30 days';
    case 'past_12_weeks':
      return 'Past 12 weeks';
    case 'past_6_months':
      return 'Past 6 months';
    case 'last_month':
      return 'Last month';
  }
}

export function getDashboardWidgetTimeRangeLabel(widget: DashboardWidgetDraft) {
  if (widget.relativeRange) {
    return buildRelativeRangeLabel(widget.relativeRange);
  }

  if (widget.timeRangeLabel) {
    return widget.timeRangeLabel;
  }

  if (!widget.questionId) {
    return undefined;
  }

  const matchedQuestion = insightQuestionsById[widget.questionId as keyof typeof insightQuestionsById];
  return matchedQuestion ? buildRelativeRangeLabel(matchedQuestion.relativeRange) : undefined;
}

export function hydrateDashboardWidget(draft: DashboardWidgetDraft, response: InsightQueryResponse) {
  const timeRangeLabel = getDashboardWidgetTimeRangeLabel(draft);

  if (response.coverage.status !== 'ready') {
    return dashboardCanvasWidgetSchema.parse({
      ...draft,
      timeRangeLabel,
      renderState: 'coverage_gap',
      coverageStatus: response.coverage.status,
      coverageMessage: response.coverage.message,
      summary: response.summary,
      matchedQuestionTitle: response.coverage.matchedQuestionTitle ?? undefined,
      plannerReasoning: response.coverage.plannerReasoning,
    } satisfies DashboardCoverageGapWidget);
  }

  const resolvedWidgetType = resolveWidgetType(response.plan?.answerShape ?? draft.preferredView ?? draft.widgetType);

  switch (resolvedWidgetType) {
    case 'metric':
      return dashboardWidgetSchema.parse({
        ...draft,
        widgetType: 'metric',
        timeRangeLabel,
        renderState: 'ready',
        coverageStatus: 'ready',
        coverageMessage: response.coverage.message,
        summary: response.summary,
        matchedQuestionTitle: response.coverage.matchedQuestionTitle ?? undefined,
        data: {
          metrics: buildMetricItems(response),
          footer: response.summary,
        },
      });
    case 'lineChart':
      return dashboardWidgetSchema.parse({
        ...draft,
        widgetType: 'lineChart',
        timeRangeLabel,
        renderState: 'ready',
        coverageStatus: 'ready',
        coverageMessage: response.coverage.message,
        summary: response.summary,
        matchedQuestionTitle: response.coverage.matchedQuestionTitle ?? undefined,
        data: {
          xLabel: response.chart?.xLabel ?? 'Time',
          yLabel: response.chart?.yLabel ?? 'Value',
          points: response.chart?.points ?? [],
          footer: response.summary,
        },
      });
    case 'barChart':
      return dashboardWidgetSchema.parse({
        ...draft,
        widgetType: 'barChart',
        timeRangeLabel,
        renderState: 'ready',
        coverageStatus: 'ready',
        coverageMessage: response.coverage.message,
        summary: response.summary,
        matchedQuestionTitle: response.coverage.matchedQuestionTitle ?? undefined,
        data: {
          xLabel: response.chart?.xLabel ?? 'Category',
          yLabel: response.chart?.yLabel ?? 'Value',
          bars: response.chart?.points ?? [],
          footer: response.summary,
        },
      });
    case 'table':
    default:
      return dashboardWidgetSchema.parse({
        ...draft,
        widgetType: 'table',
        timeRangeLabel,
        renderState: 'ready',
        coverageStatus: 'ready',
        coverageMessage: response.coverage.message,
        summary: response.summary,
        matchedQuestionTitle: response.coverage.matchedQuestionTitle ?? undefined,
        data: {
          columns: buildTableColumns(response),
          rows: response.rows.slice(0, MAX_TABLE_ROWS_PER_WIDGET),
          footer: response.summary,
        },
      });
  }
}

function resolveWidgetType(answerShape: InsightAnswerShape) {
  switch (answerShape) {
    case 'metric':
      return 'metric';
    case 'lineChart':
      return 'lineChart';
    case 'barChart':
      return 'barChart';
    case 'table':
    default:
      return 'table';
  }
}

function buildMetricItems(response: InsightQueryResponse): DashboardMetricItem[] {
  const firstRow = response.rows[0];
  const numericColumns = response.columns.filter(column => column.kind === 'number').slice(0, MAX_METRICS_PER_WIDGET);

  if (!firstRow || numericColumns.length === 0) {
    return [
      {
        label: 'Matched rows',
        value: String(response.rows.length),
        tone: 'neutral',
      },
    ];
  }

  return numericColumns.map(column => ({
    label: column.label,
    value: formatCellValue(firstRow[column.id], column.kind),
    tone: inferMetricTone(column.label),
  }));
}

function buildTableColumns(response: InsightQueryResponse) {
  return response.columns.length > 0
    ? response.columns
    : [
        {
          id: 'summary',
          label: 'Summary',
          kind: 'text',
        } satisfies InsightTableColumn,
      ];
}

function inferMetricTone(label: string): DashboardTone {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('risk') || normalizedLabel.includes('drop')) {
    return 'caution';
  }

  if (normalizedLabel.includes('average') || normalizedLabel.includes('rate') || normalizedLabel.includes('conversion')) {
    return 'neutral';
  }

  if (normalizedLabel.includes('gtv') || normalizedLabel.includes('revenue') || normalizedLabel.includes('spend')) {
    return 'brand';
  }

  return 'positive';
}

export function formatCellValue(value: InsightTableRowValue | undefined, kind: InsightTableColumn['kind']) {
  if (value === null || value === undefined) {
    return 'No data';
  }

  if (kind === 'date') {
    return String(value);
  }

  if (kind === 'number' && typeof value === 'number') {
    return formatNumber(value);
  }

  return String(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
  }).format(value);
}
