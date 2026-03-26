import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  dashboardGenerateInputSchema,
  dashboardGenerateResponseSchema,
  dashboardLayoutSchema,
  MAX_WIDGETS_PER_GENERATION,
  type DashboardLayout,
  type DashboardWidgetDraft,
  type SupportedWidgetType,
} from '@/app/dashboard/dashboard-builder-types';
import { buildDashboardWidgetSystemPrompt } from '@/app/api/dashboard/generate/system-prompt';
import { buildRelativeRangeLabel } from '@/app/dashboard/dashboard-schema';
import { insightDimensionCatalog, insightQuestionCatalog, insightQuestionsById } from '@/app/insights/insights-catalog';
import {
  insightRelativeRangeSchema,
  insightTimeBucketSchema,
  type InsightQuestionDefinition,
  type InsightRelativeRange,
  type InsightTimeBucket,
} from '@/app/insights/insights-types';
import { gpt4_1 } from '@/lib/ai-sdk-config';

const ALL_INSIGHT_QUESTION_IDS = insightQuestionCatalog.map(question => question.id) as [string, ...string[]];

type PlannerWidgetPlan = {
  questionId: string;
  preferredView: SupportedWidgetType;
  title: string;
  description: string;
  layout?: DashboardLayout;
  relativeRange?: InsightRelativeRange;
  timeBucket?: InsightTimeBucket;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = dashboardGenerateInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'A prompt and at least one allowed widget type are required.' }, { status: 400 });
    }

    const allowedWidgetTypes = Array.from(new Set(parsedInput.data.allowedWidgetTypes));
    const plannerResponseSchema = buildPlannerResponseSchema(allowedWidgetTypes);
    let plannedWidgets: PlannerWidgetPlan[] = [];

    try {
      const { object } = await generateObject({
        model: gpt4_1,
        system: buildDashboardWidgetSystemPrompt(allowedWidgetTypes),
        prompt: parsedInput.data.prompt,
        schema: plannerResponseSchema,
        temperature: 0,
      });

      plannedWidgets = object.widgets;
    } catch (error) {
      console.warn('[dashboard-generate] Planner fell back to keyword matching:', error);
      plannedWidgets = buildHeuristicDashboardPlan(parsedInput.data.prompt, allowedWidgetTypes);
    }

    const normalizedWidgets = normalizePlannedWidgets(plannedWidgets, parsedInput.data.prompt, allowedWidgetTypes);

    if (normalizedWidgets.length === 0) {
      return NextResponse.json({ error: 'Unable to map that prompt onto the current Medusa-backed widget catalog.' }, { status: 400 });
    }

    return NextResponse.json(
      dashboardGenerateResponseSchema.parse({
        widgets: normalizedWidgets,
      }),
    );
  } catch (error) {
    console.error('Dashboard generate route failed:', error);
    return NextResponse.json({ error: 'Unable to generate a dashboard plan right now.' }, { status: 500 });
  }
}

function buildPlannerResponseSchema(allowedWidgetTypes: SupportedWidgetType[]) {
  const allowedWidgetTypeSchema = buildAllowedWidgetTypeSchema(allowedWidgetTypes);

  return z.object({
    widgets: z
      .array(
        z.object({
          questionId: z.enum(ALL_INSIGHT_QUESTION_IDS),
          preferredView: allowedWidgetTypeSchema,
          title: z.string().trim().min(1).max(80),
          description: z.string().trim().min(1).max(220),
          layout: dashboardLayoutSchema.optional(),
          relativeRange: insightRelativeRangeSchema.optional(),
          timeBucket: insightTimeBucketSchema.optional(),
        }),
      )
      .min(1)
      .max(Math.min(MAX_WIDGETS_PER_GENERATION, Math.max(1, allowedWidgetTypes.length))),
  });
}

function buildAllowedWidgetTypeSchema(allowedWidgetTypes: SupportedWidgetType[]) {
  const [firstWidgetType, ...restWidgetTypes] = allowedWidgetTypes;

  if (!firstWidgetType) {
    throw new Error('At least one widget type is required.');
  }

  return z.enum([firstWidgetType, ...restWidgetTypes]);
}

function normalizePlannedWidgets(
  plannedWidgets: PlannerWidgetPlan[],
  prompt: string,
  allowedWidgetTypes: SupportedWidgetType[],
): DashboardWidgetDraft[] {
  const seen = new Set<string>();
  const normalizedWidgets = plannedWidgets
    .map(widgetPlan => normalizePlannedWidget(widgetPlan, prompt, allowedWidgetTypes))
    .filter((widget): widget is DashboardWidgetDraft => Boolean(widget))
    .filter(widget => {
      const dedupeKey = `${widget.questionId ?? widget.question}|${widget.preferredView ?? widget.widgetType}|${widget.relativeRange ?? 'default'}|${widget.timeBucket ?? 'default'}`;

      if (seen.has(dedupeKey)) {
        return false;
      }

      seen.add(dedupeKey);
      return true;
    })
    .slice(0, MAX_WIDGETS_PER_GENERATION);

  if (normalizedWidgets.length > 0) {
    return normalizedWidgets;
  }

  return buildHeuristicDashboardPlan(prompt, allowedWidgetTypes)
    .map(widgetPlan => normalizePlannedWidget(widgetPlan, prompt, allowedWidgetTypes))
    .filter((widget): widget is DashboardWidgetDraft => Boolean(widget))
    .slice(0, MAX_WIDGETS_PER_GENERATION);
}

function normalizePlannedWidget(
  widgetPlan: PlannerWidgetPlan,
  prompt: string,
  allowedWidgetTypes: SupportedWidgetType[],
): DashboardWidgetDraft | null {
  const matchedQuestion = insightQuestionsById[widgetPlan.questionId as keyof typeof insightQuestionsById];

  if (!matchedQuestion) {
    return null;
  }

  const preferredView = resolvePreferredView(matchedQuestion, widgetPlan.preferredView, allowedWidgetTypes);
  const relativeRange = widgetPlan.relativeRange ?? inferExplicitRelativeRange(prompt) ?? matchedQuestion.relativeRange;
  const timeBucket = resolveTimeBucketOverride(matchedQuestion, widgetPlan.timeBucket ?? inferExplicitTimeBucket(prompt));

  return {
    id: buildWidgetId(preferredView),
    title: widgetPlan.title || matchedQuestion.title,
    description: widgetPlan.description || matchedQuestion.description,
    question: matchedQuestion.prompt,
    questionId: matchedQuestion.id,
    preferredView,
    relativeRange,
    timeBucket,
    layout: normalizeLayout(preferredView, widgetPlan.layout),
    widgetType: preferredView,
    timeRangeLabel: buildRelativeRangeLabel(relativeRange),
  };
}

function buildHeuristicDashboardPlan(prompt: string, allowedWidgetTypes: SupportedWidgetType[]): PlannerWidgetPlan[] {
  const normalizedPrompt = normalizeText(prompt);
  const wantsDashboard = hasPromptKeyword(normalizedPrompt, ['dashboard', 'overview', 'scorecard', 'workspace', 'executive']);
  const wantsMultipleWidgets = wantsDashboard || hasPromptKeyword(normalizedPrompt, [' and ', ' plus ', ' alongside ']);
  const desiredCount = wantsDashboard ? Math.min(MAX_WIDGETS_PER_GENERATION, 3) : wantsMultipleWidgets ? 2 : 1;
  const scoredQuestions = insightQuestionCatalog
    .map(question => ({
      question,
      score: scoreQuestionMatch(normalizedPrompt, question),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.question.coverageStatus !== right.question.coverageStatus) {
        return left.question.coverageStatus === 'ready' ? -1 : 1;
      }

      return left.question.title.localeCompare(right.question.title);
    });

  const candidateQuestions = scoredQuestions
    .filter(candidate => candidate.score > 0)
    .map(candidate => candidate.question);
  const fallbackQuestions = [
    insightQuestionsById['business-deliveries-last-30-days'],
    insightQuestionsById['weekly-business-deliveries-trend'],
    insightQuestionsById['business-deliveries-by-vertical'],
  ].filter((question): question is InsightQuestionDefinition => Boolean(question));

  return pickUniqueQuestions(candidateQuestions.length > 0 ? candidateQuestions : fallbackQuestions, desiredCount).map(question => {
    const preferredView = resolvePreferredView(question, inferExplicitWidgetType(normalizedPrompt), allowedWidgetTypes);
    const relativeRange = inferExplicitRelativeRange(prompt) ?? question.relativeRange;
    const timeBucket = resolveTimeBucketOverride(question, inferExplicitTimeBucket(prompt));

    return {
      questionId: question.id,
      preferredView,
      title: question.title,
      description: question.description,
      layout: getDefaultLayout(preferredView),
      relativeRange,
      timeBucket,
    };
  });
}

function pickUniqueQuestions(questions: InsightQuestionDefinition[], desiredCount: number) {
  const seenQuestionIds = new Set<string>();
  const pickedQuestions: InsightQuestionDefinition[] = [];

  for (const question of questions) {
    if (seenQuestionIds.has(question.id)) {
      continue;
    }

    seenQuestionIds.add(question.id);
    pickedQuestions.push(question);

    if (pickedQuestions.length >= desiredCount) {
      break;
    }
  }

  return pickedQuestions;
}

function resolvePreferredView(
  question: InsightQuestionDefinition,
  requestedView: SupportedWidgetType | undefined,
  allowedWidgetTypes: SupportedWidgetType[],
): SupportedWidgetType {
  if (requestedView && allowedWidgetTypes.includes(requestedView)) {
    if (requestedView === 'metric' && question.dimensionId) {
      return question.preferredWidgetType === 'table' && allowedWidgetTypes.includes('table') ? 'table' : 'barChart';
    }

    if (requestedView === 'lineChart' && !isTimeSeriesQuestion(question)) {
      return allowedWidgetTypes.includes('barChart') ? 'barChart' : 'table';
    }

    return requestedView;
  }

  if (allowedWidgetTypes.includes(question.preferredWidgetType as SupportedWidgetType)) {
    return question.preferredWidgetType as SupportedWidgetType;
  }

  if (!question.dimensionId && allowedWidgetTypes.includes('metric')) {
    return 'metric';
  }

  if (isTimeSeriesQuestion(question) && allowedWidgetTypes.includes('lineChart')) {
    return 'lineChart';
  }

  if (allowedWidgetTypes.includes('barChart')) {
    return 'barChart';
  }

  if (allowedWidgetTypes.includes('table')) {
    return 'table';
  }

  return allowedWidgetTypes[0] ?? 'metric';
}

function isTimeSeriesQuestion(question: InsightQuestionDefinition) {
  return Boolean(question.dimensionId && question.timeBucket !== 'none');
}

function inferExplicitWidgetType(prompt: string): SupportedWidgetType | undefined {
  if (hasPromptKeyword(prompt, ['table', 'watchlist', 'list'])) {
    return 'table';
  }

  if (hasPromptKeyword(prompt, ['line', 'trend', 'over time', 'pace'])) {
    return 'lineChart';
  }

  if (hasPromptKeyword(prompt, ['bar', 'compare', 'comparison', 'top', 'breakdown'])) {
    return 'barChart';
  }

  if (hasPromptKeyword(prompt, ['metric', 'snapshot', 'scorecard', 'headline'])) {
    return 'metric';
  }

  return undefined;
}

function inferExplicitRelativeRange(prompt: string): InsightRelativeRange | undefined {
  if (hasPromptKeyword(prompt, ['last month', 'previous month', 'prior month'])) {
    return 'last_month';
  }

  if (hasPromptKeyword(prompt, ['past 6 months', 'last 6 months', 'six months'])) {
    return 'past_6_months';
  }

  if (hasPromptKeyword(prompt, ['past 12 weeks', 'last 12 weeks', '12 weeks', 'past 3 months', 'last 3 months'])) {
    return 'past_12_weeks';
  }

  if (hasPromptKeyword(prompt, ['past 30 days', 'last 30 days', '30 days'])) {
    return 'past_30_days';
  }

  if (hasPromptKeyword(prompt, ['past 7 days', 'last 7 days', '7 days', 'past week', 'last week'])) {
    return 'past_7_days';
  }

  return undefined;
}

function inferExplicitTimeBucket(prompt: string): InsightTimeBucket | undefined {
  if (hasPromptKeyword(prompt, ['daily', 'day by day', 'per day', 'each day'])) {
    return 'day';
  }

  if (hasPromptKeyword(prompt, ['monthly', 'per month', 'each month'])) {
    return 'month';
  }

  if (hasPromptKeyword(prompt, ['weekly', 'per week', 'each week'])) {
    return 'week';
  }

  return undefined;
}

function resolveTimeBucketOverride(question: InsightQuestionDefinition, requestedTimeBucket: InsightTimeBucket | undefined) {
  if (!question.dimensionId) {
    return question.timeBucket;
  }

  const dimension = insightDimensionCatalog[question.dimensionId as keyof typeof insightDimensionCatalog];

  if (!dimension || dimension.kind !== 'date' || question.timeBucket === 'none') {
    return question.timeBucket;
  }

  return requestedTimeBucket ?? question.timeBucket;
}

function scoreQuestionMatch(prompt: string, question: InsightQuestionDefinition) {
  const searchText = normalizeText(
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
  const promptTokens = tokenize(prompt);
  const searchTokens = tokenize(searchText);
  let score = 0;

  for (const token of promptTokens) {
    if (searchTokens.has(token)) {
      score += 1;
    }
  }

  if (question.aliases.some(alias => prompt.includes(normalizeText(alias).trim()))) {
    score += 3;
  }

  if (question.coverageStatus === 'ready' && prompt.includes('business deliver')) {
    score += 2;
  }

  return score;
}

function normalizeLayout(_widgetType: SupportedWidgetType, _suggestedLayout: DashboardLayout | undefined): DashboardLayout {
  return getDefaultLayout();
}

function getDefaultLayout(): DashboardLayout {
  return 'half';
}

function buildWidgetId(prefix: SupportedWidgetType) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function tokenize(value: string) {
  return new Set(value.split(/\s+/).filter(token => token.length >= 4));
}

function hasPromptKeyword(prompt: string, keywords: string[]) {
  return keywords.some(keyword => prompt.includes(keyword));
}
