import { promises as fs } from 'node:fs';
import path from 'node:path';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  insightDimensionCatalog,
  insightMetricCatalog,
  insightQuestionCatalog,
  insightQuestionsById,
} from '@/app/insights/insights-catalog';
import { hasInternalInsightsAccess } from '@/app/insights/insights-server-utils';
import {
  insightAnswerShapeSchema,
  insightPlannerConfidenceSchema,
  insightQueryInputSchema,
  insightQueryResponseSchema,
  type InsightAnswerShape,
  type InsightDimensionDefinition,
  type InsightMetricDefinition,
  type InsightQuestionDefinition,
  type InsightRelativeRange,
  type InsightTableRow,
  type InsightTableRowValue,
  type InsightTimeBucket,
} from '@/app/insights/insights-types';
import { gpt4_1 } from '@/lib/ai-sdk-config';
import { runMedusaQuery } from '@/app/api/insights/query/medusa-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INSIGHTS_AUDIT_LOG_PATH = path.join(process.cwd(), '.insights-audit', 'insights-log.ndjson');
const MAX_RESULT_ROWS = Number(process.env.INSIGHTS_RESULT_ROW_LIMIT ?? 100);
const ALL_INSIGHT_QUESTION_IDS = insightQuestionCatalog.map(question => question.id) as [string, ...string[]];

const plannerResponseSchema = z.object({
  questionId: z.enum(ALL_INSIGHT_QUESTION_IDS),
  confidence: insightPlannerConfidenceSchema,
  reasoning: z.string().trim().min(1).max(240),
  preferredView: insightAnswerShapeSchema.optional(),
  relativeRange: z.enum(['past_7_days', 'past_30_days', 'past_12_weeks', 'past_6_months', 'last_month']).optional(),
  timeBucket: z.enum(['none', 'day', 'week', 'month']).optional(),
});

type PlannerResponse = z.infer<typeof plannerResponseSchema>;

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const rawQuestion = await safeReadQuestion(request);

  try {
    if (!hasInternalInsightsAccess(request.cookies)) {
      return NextResponse.json(
        {
          error:
            'Insights uses your internal Instacart session for guarded access. Sign in first or set `INSIGHTS_ALLOW_UNAUTHENTICATED=true` for local development.',
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsedInput = insightQueryInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'A question or catalog questionId is required before querying Medusa.' }, { status: 400 });
    }

    const requestedQuestion = parsedInput.data.question?.trim() || '';
    const plannerResult = parsedInput.data.questionId
      ? buildDirectQuestionPlannerResult(parsedInput.data.questionId, parsedInput.data.preferredView)
      : await planCatalogQuestion(requestedQuestion, parsedInput.data.preferredView);
    const matchedQuestion = insightQuestionsById[plannerResult.questionId];

    if (!matchedQuestion) {
      throw new Error('The insights planner returned an unknown catalog question.');
    }

    if (plannerResult.confidence === 'low') {
      const response = buildCoverageGapResponse({
        clientRequestId: parsedInput.data.clientRequestId,
        matchedQuestion,
        plannerReasoning: plannerResult.reasoning,
        status: 'blocked',
        message:
          'I could not safely map that request to one of the production-backed Instacart Business questions in the current catalog.',
      });
      await writeInsightsAuditLog({
        elapsedMs: Date.now() - startedAt,
        question: requestedQuestion || matchedQuestion.prompt,
        matchedQuestionId: matchedQuestion.id,
        matchedQuestionTitle: matchedQuestion.title,
        medusaSql: null,
        status: 'coverage_gap',
      });
      return NextResponse.json(response);
    }

    if (matchedQuestion.coverageStatus !== 'ready') {
      const response = buildCoverageGapResponse({
        clientRequestId: parsedInput.data.clientRequestId,
        matchedQuestion,
        plannerReasoning: plannerResult.reasoning,
        status: matchedQuestion.coverageStatus,
        message: buildCoverageMessage(matchedQuestion),
      });
      await writeInsightsAuditLog({
        elapsedMs: Date.now() - startedAt,
        question: requestedQuestion || matchedQuestion.prompt,
        matchedQuestionId: matchedQuestion.id,
        matchedQuestionTitle: matchedQuestion.title,
        medusaSql: null,
        status: 'coverage_gap',
      });
      return NextResponse.json(response);
    }

    const requestedView = parsedInput.data.preferredView ?? plannerResult.preferredView;
    const resolvedAnswerShape = resolveAnswerShape(matchedQuestion, requestedView);
    const resolvedQuestion = resolveQuestionOverrides(matchedQuestion, {
      relativeRange: parsedInput.data.relativeRange ?? plannerResult.relativeRange,
      timeBucket: parsedInput.data.timeBucket ?? plannerResult.timeBucket,
    });
    const resolvedMetrics = matchedQuestion.metricIds.map(metricId => resolveMetric(metricId));
    const resolvedDimension = resolvedQuestion.dimensionId ? resolveDimension(resolvedQuestion.dimensionId) : null;
    const medusaSql = buildMedusaSql({
      answerShape: resolvedAnswerShape,
      dimension: resolvedDimension,
      metrics: resolvedMetrics,
      question: resolvedQuestion,
    });
    const { compiledSql, rows } = await runMedusaQuery(medusaSql);
    const response = buildSuccessResponse({
      answerShape: resolvedAnswerShape,
      clientRequestId: parsedInput.data.clientRequestId,
      compiledSql,
      dimension: resolvedDimension,
      matchedQuestion: resolvedQuestion,
      medusaSql,
      plannerReasoning: plannerResult.reasoning,
      rawRows: rows,
      requestedQuestion: requestedQuestion || matchedQuestion.prompt,
      resolvedMetrics,
    });

    await writeInsightsAuditLog({
      elapsedMs: Date.now() - startedAt,
      question: requestedQuestion || matchedQuestion.prompt,
      matchedQuestionId: matchedQuestion.id,
      matchedQuestionTitle: matchedQuestion.title,
      medusaSql,
      status: 'success',
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Insights query route failed:', error);
    await writeInsightsAuditLog({
      elapsedMs: Date.now() - startedAt,
      question: rawQuestion,
      matchedQuestionId: null,
      matchedQuestionTitle: null,
      medusaSql: null,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown insights error',
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to query Medusa right now. Check the route logs and Medusa credentials.',
      },
      { status: 502 },
    );
  }
}

async function planCatalogQuestion(question: string, preferredView: InsightAnswerShape | undefined): Promise<PlannerResponse> {
  try {
    const { object } = await generateObject({
      model: gpt4_1,
      schema: plannerResponseSchema,
      temperature: 0,
      prompt: question,
      system: buildPlannerSystemPrompt(),
    });

    return {
      ...object,
      preferredView: preferredView ?? object.preferredView,
    };
  } catch (error) {
    console.warn('Insights planner fell back to keyword matching:', error);
    return matchQuestionByKeywords(question, preferredView);
  }
}

function buildDirectQuestionPlannerResult(questionId: string, preferredView: InsightAnswerShape | undefined): PlannerResponse {
  const matchedQuestion = insightQuestionsById[questionId as keyof typeof insightQuestionsById];

  if (!matchedQuestion) {
    throw new Error(`Unknown insight question id "${questionId}".`);
  }

  return plannerResponseSchema.parse({
    questionId: matchedQuestion.id,
    confidence: 'high',
    reasoning: `Used the exact catalog recipe for "${matchedQuestion.title}" from the widget configuration.`,
    preferredView: preferredView ?? matchedQuestion.preferredWidgetType ?? matchedQuestion.answerShape,
    relativeRange: matchedQuestion.relativeRange,
    timeBucket: matchedQuestion.timeBucket,
  });
}

function buildPlannerSystemPrompt() {
  return [
    'You are classifying an internal Instacart Business analytics question onto a fixed catalog of recurring questions.',
    'Choose the single best matching question id from the catalog below.',
    'Use `high` confidence only when the user intent is clearly the same as a catalog question.',
    'Use `medium` confidence when the intent is adjacent but still matches the same business need.',
    'Use `low` confidence when none of the catalog questions are a safe fit.',
    'Prefer a `ready` question only when the wording still fits the user request. Do not force unrelated requests into a ready question just because it is executable.',
    'If the user explicitly asks for a chart, table, or summary, set `preferredView` accordingly when it is compatible with the matched question.',
    'If the user explicitly asks for a time window like 7 days, 30 days, 12 weeks, 6 months, or last month, set `relativeRange` accordingly.',
    'If the user explicitly asks for daily, weekly, or monthly buckets, set `timeBucket` accordingly when the matched question supports a time dimension.',
    '',
    'Catalog:',
    ...insightQuestionCatalog.map(question => {
      return [
        `- id: ${question.id}`,
        `  status: ${question.coverageStatus}`,
        `  persona: ${question.persona}`,
        `  improvementFocus: ${question.improvementFocus}`,
        `  title: ${question.title}`,
        `  prompt: ${question.prompt}`,
        `  description: ${question.description}`,
        `  aliases: ${question.aliases.join(' | ') || 'none'}`,
        `  preferredWidgetType: ${question.preferredWidgetType}`,
        `  defaultTimeBucket: ${question.timeBucket}`,
        `  defaultRelativeRange: ${question.relativeRange}`,
      ].join('\n');
    }),
  ].join('\n');
}

function matchQuestionByKeywords(question: string, preferredView: InsightAnswerShape | undefined): PlannerResponse {
  const normalizedQuestion = normalizeText(question);
  const questionTokens = tokenize(normalizedQuestion);
  let bestMatch = insightQuestionCatalog[0];
  let bestScore = -1;

  for (const catalogQuestion of insightQuestionCatalog) {
    const catalogText = buildCatalogQuestionSearchText(catalogQuestion);
    const catalogTokens = tokenize(catalogText);
    let score = 0;

    for (const token of questionTokens) {
      if (catalogTokens.has(token)) {
        score += 1;
      }
    }

    if (catalogQuestion.coverageStatus === 'ready' && normalizedQuestion.includes('business deliver')) {
      score += 2;
    }

    if (catalogQuestion.aliases.some(alias => normalizedQuestion.includes(normalizeText(alias).trim()))) {
      score += 3;
    }

    if (normalizedQuestion.includes(catalogQuestion.improvementFocus.replaceAll('_', ' '))) {
      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = catalogQuestion;
    }
  }

  const confidence = bestScore >= 5 ? 'high' : bestScore >= 3 ? 'medium' : 'low';

  return plannerResponseSchema.parse({
    questionId: bestMatch.id,
    confidence,
    reasoning:
      confidence === 'low'
        ? 'Keyword fallback could not find a strong match to the current catalog.'
        : `Keyword fallback matched the request to "${bestMatch.title}".`,
    preferredView: preferredView ?? inferPreferredView(normalizedQuestion),
    relativeRange: inferRelativeRange(normalizedQuestion) ?? bestMatch.relativeRange,
    timeBucket: inferTimeBucket(normalizedQuestion) ?? bestMatch.timeBucket,
  });
}

function resolveMetric(metricId: string) {
  const metric = insightMetricCatalog[metricId as keyof typeof insightMetricCatalog];

  if (!metric || metric.coverageStatus !== 'ready' || !metric.medusaName) {
    throw new Error(`The metric "${metricId}" is not ready for execution in this workspace.`);
  }

  return metric;
}

function resolveDimension(dimensionId: string) {
  const dimension = insightDimensionCatalog[dimensionId as keyof typeof insightDimensionCatalog];

  if (!dimension || dimension.coverageStatus !== 'ready' || !dimension.medusaName) {
    throw new Error(`The dimension "${dimensionId}" is not ready for execution in this workspace.`);
  }

  return dimension;
}

function resolveAnswerShape(question: InsightQuestionDefinition, requestedView: InsightAnswerShape | undefined) {
  if (!requestedView) {
    return question.preferredWidgetType ?? question.answerShape;
  }

  const supportsTimeSeries = question.dimensionId
    ? insightDimensionCatalog[question.dimensionId as keyof typeof insightDimensionCatalog]?.kind === 'date'
    : false;

  if (!question.dimensionId) {
    return requestedView === 'table' ? 'table' : 'metric';
  }

  if (supportsTimeSeries) {
    return requestedView === 'barChart' ? 'barChart' : requestedView === 'table' ? 'table' : 'lineChart';
  }

  if (requestedView === 'metric') {
    return question.preferredWidgetType === 'table' ? 'table' : 'barChart';
  }

  return requestedView === 'lineChart' ? 'barChart' : requestedView;
}

function resolveQuestionOverrides(
  question: InsightQuestionDefinition,
  overrides: {
    relativeRange?: InsightRelativeRange;
    timeBucket?: InsightTimeBucket;
  },
): InsightQuestionDefinition {
  const resolvedTimeBucket = resolveTimeBucket(question, overrides.timeBucket);

  return {
    ...question,
    relativeRange: overrides.relativeRange ?? question.relativeRange,
    timeBucket: resolvedTimeBucket,
  };
}

function resolveTimeBucket(question: InsightQuestionDefinition, requestedTimeBucket: InsightTimeBucket | undefined) {
  if (!question.dimensionId) {
    return question.timeBucket;
  }

  const dimension = insightDimensionCatalog[question.dimensionId as keyof typeof insightDimensionCatalog];

  if (!dimension || dimension.kind !== 'date' || question.timeBucket === 'none') {
    return question.timeBucket;
  }

  return requestedTimeBucket ?? question.timeBucket;
}

function buildCoverageMessage(question: InsightQuestionDefinition) {
  if (question.coverageStatus === 'blocked') {
    return `${question.title} is still blocked outside the current Medusa-only path. ${question.coverageNotes[0] ?? ''}`.trim();
  }

  return `${question.title} is in the Phase 0 inventory, but this workspace does not yet have verified Medusa metric coverage for it. ${question.coverageNotes[0] ?? ''}`.trim();
}

function buildCoverageGapResponse({
  clientRequestId,
  matchedQuestion,
  plannerReasoning,
  status,
  message,
}: {
  clientRequestId?: string;
  matchedQuestion: InsightQuestionDefinition;
  plannerReasoning: string;
  status: 'needs_medusa_config' | 'blocked';
  message: string;
}) {
  return insightQueryResponseSchema.parse({
    clientRequestId,
    summary: message,
    columns: [],
    rows: [],
    chart: null,
    coverage: {
      status,
      message,
      matchedQuestionId: matchedQuestion.id,
      matchedQuestionTitle: matchedQuestion.title,
      plannerReasoning,
    },
    plan: null,
  });
}

function buildSuccessResponse({
  answerShape,
  clientRequestId,
  compiledSql,
  dimension,
  matchedQuestion,
  medusaSql,
  plannerReasoning,
  rawRows,
  requestedQuestion,
  resolvedMetrics,
}: {
  answerShape: InsightAnswerShape;
  clientRequestId?: string;
  compiledSql: string | null;
  dimension: InsightDimensionDefinition | null;
  matchedQuestion: InsightQuestionDefinition;
  medusaSql: string;
  plannerReasoning: string;
  rawRows: Record<string, unknown>[];
  requestedQuestion: string;
  resolvedMetrics: InsightMetricDefinition[];
}) {
  const normalizedRows = alignMetricKeys(normalizeRows(rawRows, dimension, matchedQuestion), resolvedMetrics);
  const columns = buildColumns(dimension, matchedQuestion, resolvedMetrics);
  const chart = buildChart(answerShape, normalizedRows, dimension, resolvedMetrics);
  const summary = buildSummary({
    dimension,
    matchedQuestion,
    requestedQuestion,
    rows: normalizedRows,
    resolvedMetrics,
  });

  return insightQueryResponseSchema.parse({
    clientRequestId,
    summary,
    columns,
    rows: normalizedRows,
    chart,
    coverage: {
      status: 'ready',
      message: `Matched "${matchedQuestion.title}" and executed a read-only Medusa query.`,
      matchedQuestionId: matchedQuestion.id,
      matchedQuestionTitle: matchedQuestion.title,
      plannerReasoning,
    },
    plan: {
      questionId: matchedQuestion.id,
      title: matchedQuestion.title,
      metricIds: matchedQuestion.metricIds,
      dimensionId: matchedQuestion.dimensionId ?? null,
      relativeRange: matchedQuestion.relativeRange,
      timeBucket: matchedQuestion.timeBucket,
      answerShape,
      medusaSql,
      compiledSql,
    },
  });
}

function alignMetricKeys(rows: InsightTableRow[], metrics: InsightMetricDefinition[]) {
  return rows.map(row => {
    const nextRow: InsightTableRow = { ...row };

    for (const metric of metrics) {
      const exactValue = row[metric.id];

      if (exactValue !== undefined) {
        continue;
      }

      const lowercaseValue = row[metric.id.toLowerCase()];

      if (lowercaseValue !== undefined) {
        nextRow[metric.id] = lowercaseValue;
      }
    }

    return nextRow;
  });
}

function buildMedusaSql({
  answerShape,
  dimension,
  metrics,
  question,
}: {
  answerShape: InsightAnswerShape;
  dimension: InsightDimensionDefinition | null;
  metrics: InsightMetricDefinition[];
  question: InsightQuestionDefinition;
}) {
  const dateDimensionId = question.metricIds
    .map(metricId => insightMetricCatalog[metricId as keyof typeof insightMetricCatalog]?.defaultDateDimensionId)
    .find(Boolean);

  const dateDimension = dateDimensionId ? insightDimensionCatalog[dateDimensionId as keyof typeof insightDimensionCatalog] : null;

  if (!dateDimension?.medusaName) {
    throw new Error(`Question "${question.title}" is missing a ready date dimension for safe time filtering.`);
  }

  const filterClauses = [
    `${dateDimension.medusaName} >= '${buildDateRange(question.relativeRange).start}'`,
    `${dateDimension.medusaName} <= '${buildDateRange(question.relativeRange).end}'`,
    ...question.filters.map(filter => buildFilterClause(filter.dimensionId, filter.operator, filter.values)),
  ];
  const metricSelects = metrics.map(metric => `AGG(${metric.medusaName}) AS ${metric.id}`);
  const selectParts = dimension?.medusaName ? [`${dimension.medusaName} AS dimension_value`, ...metricSelects] : metricSelects;
  const orderByClause = dimension?.kind === 'date' ? 'ORDER BY 1' : dimension ? `ORDER BY ${metrics[0]?.id ?? '1'} DESC` : '';
  const limitClause = dimension ? `LIMIT ${answerShape === 'table' ? MAX_RESULT_ROWS : Math.min(MAX_RESULT_ROWS, 24)}` : '';

  return [
    'SELECT',
    indentLines(selectParts.join(',\n')),
    'FROM all',
    'WHERE',
    indentLines(filterClauses.join('\nAND ')),
    dimension ? 'GROUP BY 1' : '',
    orderByClause,
    limitClause,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildColumns(
  dimension: InsightDimensionDefinition | null,
  question: InsightQuestionDefinition,
  metrics: InsightMetricDefinition[],
) {
  const columns = [];

  if (dimension) {
    columns.push({
      id: 'dimension_value',
      label: getDimensionColumnLabel(dimension, question),
      kind: dimension.kind === 'date' ? 'date' : 'text',
    });
  }

  for (const metric of metrics) {
    columns.push({
      id: metric.id,
      label: metric.label,
      kind: 'number',
    });
  }

  return columns;
}

function buildChart(
  answerShape: InsightAnswerShape,
  rows: InsightTableRow[],
  dimension: InsightDimensionDefinition | null,
  metrics: InsightMetricDefinition[],
) {
  if (!dimension || rows.length === 0 || answerShape === 'metric' || answerShape === 'table') {
    return null;
  }

  const primaryMetric = metrics[0];

  if (!primaryMetric) {
    return null;
  }

  return {
    kind: answerShape === 'lineChart' ? 'line' : 'bar',
    xLabel: getDimensionLabel(dimension),
    yLabel: primaryMetric.label,
    points: rows.slice(0, 24).map(row => ({
      label: String(row.dimension_value ?? ''),
      value: coerceNumber(row[primaryMetric.id]),
    })),
  };
}

function buildSummary({
  dimension,
  matchedQuestion,
  requestedQuestion,
  rows,
  resolvedMetrics,
}: {
  dimension: InsightDimensionDefinition | null;
  matchedQuestion: InsightQuestionDefinition;
  requestedQuestion: string;
  rows: InsightTableRow[];
  resolvedMetrics: InsightMetricDefinition[];
}) {
  if (rows.length === 0) {
    return `No results came back for "${requestedQuestion}" over the selected time range.`;
  }

  const primaryMetric = resolvedMetrics[0];

  if (!primaryMetric) {
    return `Ran "${matchedQuestion.title}", but no metrics were configured in the response.`;
  }

  if (!dimension) {
    const firstValue = coerceNumber(rows[0]?.[primaryMetric.id]);
    return `${primaryMetric.label} was ${formatNumber(firstValue)} for ${formatRelativeRangeLabel(matchedQuestion.relativeRange)}.`;
  }

  if (dimension.kind === 'date') {
    const latestRow = rows.at(-1);
    const latestValue = latestRow ? coerceNumber(latestRow[primaryMetric.id]) : 0;
    const totalValue = rows.reduce((sum, row) => sum + coerceNumber(row[primaryMetric.id]), 0);

    return `${primaryMetric.label} totaled ${formatNumber(totalValue)} across ${rows.length} ${getTimeBucketLabel(
      matchedQuestion.timeBucket,
    )}, with ${formatNumber(latestValue)} in the latest bucket.`;
  }

  const sortedRows = [...rows].sort((leftRow, rightRow) => coerceNumber(rightRow[primaryMetric.id]) - coerceNumber(leftRow[primaryMetric.id]));
  const topRow = sortedRows[0];
  const topLabel = String(topRow?.dimension_value ?? 'Unknown');
  const topValue = coerceNumber(topRow?.[primaryMetric.id]);

  return `The top ${dimension.label.toLowerCase()} was ${topLabel} with ${formatNumber(topValue)} ${primaryMetric.label.toLowerCase()} for ${formatRelativeRangeLabel(
    matchedQuestion.relativeRange,
  )}.`;
}

function normalizeRows(
  rawRows: Record<string, unknown>[],
  dimension: InsightDimensionDefinition | null,
  question: InsightQuestionDefinition,
) {
  const rows = rawRows.map(rawRow => {
    const nextRow: InsightTableRow = {};

    for (const [key, value] of Object.entries(rawRow)) {
      if (key === 'dimension_value' && dimension?.kind === 'date') {
        nextRow[key] = normalizeDateValue(value);
        continue;
      }

      if (typeof value === 'number' || value === null) {
        nextRow[key] = value;
        continue;
      }

      const numericValue = Number(value);

      nextRow[key] = Number.isFinite(numericValue) && String(value).trim() !== '' ? numericValue : value === undefined ? null : String(value);
    }

    return nextRow;
  });

  if (!dimension || dimension.kind !== 'date' || question.timeBucket === 'day' || question.timeBucket === 'none') {
    return rows;
  }

  const bucketedRows = new Map<string, InsightTableRow>();

  for (const row of rows) {
    const normalizedDimensionValue = String(row.dimension_value ?? '');
    const bucketLabel = bucketDateValue(normalizedDimensionValue, question.timeBucket);

    if (!bucketedRows.has(bucketLabel)) {
      bucketedRows.set(bucketLabel, {
        ...row,
        dimension_value: bucketLabel,
      });
      continue;
    }

    const existingRow = bucketedRows.get(bucketLabel);

    if (!existingRow) {
      continue;
    }

    for (const [key, value] of Object.entries(row)) {
      if (key === 'dimension_value') {
        continue;
      }

      existingRow[key] = coerceNumber(existingRow[key]) + coerceNumber(value);
    }
  }

  return Array.from(bucketedRows.values()).sort((leftRow, rightRow) =>
    String(leftRow.dimension_value).localeCompare(String(rightRow.dimension_value)),
  );
}

function buildDateRange(relativeRange: InsightQuestionDefinition['relativeRange']) {
  const today = new Date();
  const currentDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  switch (relativeRange) {
    case 'past_7_days':
      return {
        start: shiftDate(currentDate, -6),
        end: formatDate(currentDate),
      };
    case 'past_30_days':
      return {
        start: shiftDate(currentDate, -29),
        end: formatDate(currentDate),
      };
    case 'past_12_weeks':
      return {
        start: shiftDate(currentDate, -83),
        end: formatDate(currentDate),
      };
    case 'past_6_months':
      return {
        start: shiftDate(currentDate, -179),
        end: formatDate(currentDate),
      };
    case 'last_month': {
      const start = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1));
      const end = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 0));
      return {
        start: formatDate(start),
        end: formatDate(end),
      };
    }
  }
}

function buildFilterClause(dimensionId: string, operator: 'equals' | 'in', values: string[]) {
  const dimension = resolveDimension(dimensionId);

  if (operator === 'equals') {
    return `${dimension.medusaName} = '${escapeSqlValue(values[0] ?? '')}'`;
  }

  return `${dimension.medusaName} IN (${values.map(value => `'${escapeSqlValue(value)}'`).join(', ')})`;
}

function inferPreferredView(question: string): InsightAnswerShape | undefined {
  if (question.includes('table')) {
    return 'table';
  }

  if (question.includes('bar chart') || question.includes('breakdown') || question.includes('compare')) {
    return 'barChart';
  }

  if (question.includes('line chart') || question.includes('trend') || question.includes('over time')) {
    return 'lineChart';
  }

  if (question.includes('metric') || question.includes('headline') || question.includes('snapshot')) {
    return 'metric';
  }

  return undefined;
}

function inferRelativeRange(question: string): InsightRelativeRange | undefined {
  if (question.includes('last month') || question.includes('previous month') || question.includes('prior month')) {
    return 'last_month';
  }

  if (
    question.includes('past 6 months') ||
    question.includes('last 6 months') ||
    question.includes('six months')
  ) {
    return 'past_6_months';
  }

  if (
    question.includes('past 12 weeks') ||
    question.includes('last 12 weeks') ||
    question.includes('12 weeks') ||
    question.includes('past 3 months') ||
    question.includes('last 3 months')
  ) {
    return 'past_12_weeks';
  }

  if (question.includes('past 30 days') || question.includes('last 30 days') || question.includes('30 days')) {
    return 'past_30_days';
  }

  if (
    question.includes('past 7 days') ||
    question.includes('last 7 days') ||
    question.includes('7 days') ||
    question.includes('past week') ||
    question.includes('last week')
  ) {
    return 'past_7_days';
  }

  return undefined;
}

function inferTimeBucket(question: string): InsightTimeBucket | undefined {
  if (question.includes('daily') || question.includes('day by day') || question.includes('per day') || question.includes('each day')) {
    return 'day';
  }

  if (question.includes('monthly') || question.includes('per month') || question.includes('each month')) {
    return 'month';
  }

  if (question.includes('weekly') || question.includes('per week') || question.includes('each week')) {
    return 'week';
  }

  return undefined;
}

function getDimensionColumnLabel(dimension: InsightDimensionDefinition, question: InsightQuestionDefinition) {
  if (dimension.kind !== 'date') {
    return dimension.label;
  }

  switch (question.timeBucket) {
    case 'week':
      return 'Week';
    case 'month':
      return 'Month';
    case 'day':
    case 'none':
    default:
      return dimension.label;
  }
}

function getDimensionLabel(dimension: InsightDimensionDefinition) {
  return dimension.label;
}

function getTimeBucketLabel(timeBucket: InsightQuestionDefinition['timeBucket']) {
  switch (timeBucket) {
    case 'week':
      return 'weeks';
    case 'month':
      return 'months';
    case 'day':
      return 'days';
    case 'none':
    default:
      return 'rows';
  }
}

function formatRelativeRangeLabel(relativeRange: InsightQuestionDefinition['relativeRange']) {
  switch (relativeRange) {
    case 'past_7_days':
      return 'the last 7 days';
    case 'past_30_days':
      return 'the last 30 days';
    case 'past_12_weeks':
      return 'the last 12 weeks';
    case 'past_6_months':
      return 'the last 6 months';
    case 'last_month':
      return 'last month';
  }
}

function normalizeDateValue(value: unknown) {
  if (value instanceof Date) {
    return formatDate(value);
  }

  const rawValue = String(value ?? '').slice(0, 10);

  return rawValue.length === 10 ? rawValue : String(value ?? '');
}

function bucketDateValue(dateValue: string, timeBucket: InsightQuestionDefinition['timeBucket']) {
  const [year, month, day] = dateValue.split('-').map(Number);

  if (!year || !month || !day) {
    return dateValue;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (timeBucket === 'month') {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  const dayOfWeek = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - dayOfWeek + 1);

  return formatDate(monday);
}

function shiftDate(date: Date, dayDelta: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + dayDelta);
  return formatDate(nextDate);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function buildCatalogQuestionSearchText(question: InsightQuestionDefinition) {
  return normalizeText(
    [
      question.title,
      question.prompt,
      question.description,
      question.persona,
      question.improvementFocus,
      question.preferredWidgetType,
      ...question.aliases,
    ].join(' '),
  );
}

function tokenize(value: string) {
  return new Set(value.split(/\s+/).filter(token => token.length >= 4));
}

function coerceNumber(value: InsightTableRowValue | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function escapeSqlValue(value: string) {
  return value.replaceAll("'", "''");
}

function indentLines(value: string) {
  return value
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n');
}

async function safeReadQuestion(request: NextRequest) {
  try {
    const clone = request.clone();
    const body = await clone.json();
    return typeof body?.question === 'string' ? body.question : '';
  } catch {
    return '';
  }
}

async function writeInsightsAuditLog(event: {
  elapsedMs: number;
  question: string;
  matchedQuestionId: string | null;
  matchedQuestionTitle: string | null;
  medusaSql: string | null;
  status: 'success' | 'coverage_gap' | 'error';
  errorMessage?: string;
}) {
  const payload = {
    ...event,
    createdAt: new Date().toISOString(),
  };

  console.info('[insights-audit]', payload);

  try {
    await fs.mkdir(path.dirname(INSIGHTS_AUDIT_LOG_PATH), { recursive: true });
    await fs.appendFile(INSIGHTS_AUDIT_LOG_PATH, `${JSON.stringify(payload)}\n`, 'utf8');
  } catch (error) {
    console.warn('Unable to persist insights audit log:', error);
  }
}
