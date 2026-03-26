import type { SupportedWidgetType } from '@/app/dashboard/dashboard-builder-types';
import { supportedDashboardWidgets } from '@/app/dashboard/dashboard-supported-widgets';
import { insightQuestionCatalog } from '@/app/insights/insights-catalog';

export function buildDashboardWidgetSystemPrompt(allowedWidgetTypes: SupportedWidgetType[]) {
  const uniqueAllowedWidgetTypes = Array.from(new Set(allowedWidgetTypes));
  const widgetCatalog = supportedDashboardWidgets
    .filter(widget => uniqueAllowedWidgetTypes.includes(widget.type))
    .map(
      widget =>
        `- ${widget.type}: ${widget.description} Default title: ${widget.defaultTitle}. Guidance: ${widget.promptHint}`,
    )
    .join('\n');
  const maxWidgetCount = Math.min(4, uniqueAllowedWidgetTypes.length);
  const widgetShapeExample = `{
  "widgets": [
    {
      "questionId": "<exact catalog id>",
      "preferredView": "<${uniqueAllowedWidgetTypes.join(' | ')}>",
      "title": "<concise widget title>",
      "description": "<useful widget description>",
      "layout": "<half | full>",
      "relativeRange": "<optional: past_7_days | past_30_days | past_12_weeks | past_6_months | last_month>",
      "timeBucket": "<optional: none | day | week | month>"
    }
  ]
}`;
  const widgetCountRules =
    uniqueAllowedWidgetTypes.length === 1 && uniqueAllowedWidgetTypes[0] === 'metric'
      ? `- Return exactly 1 widget.
- Because metric is the only allowed widget type, use a single scorecard-style widget.`
      : `- Return between 1 and ${maxWidgetCount} widgets.
- Return 1 widget for narrow asks.
${maxWidgetCount > 1 ? `- Return 2 to ${maxWidgetCount} widgets only when the user clearly wants a dashboard, scorecard, overview, or multiple cuts.` : ''}`;
  const catalogSummary = insightQuestionCatalog
    .map(question =>
      [
        `- id: ${question.id}`,
        `  status: ${question.coverageStatus}`,
        `  persona: ${question.persona}`,
        `  improvementFocus: ${question.improvementFocus}`,
        `  preferredWidgetType: ${question.preferredWidgetType}`,
        `  defaultTimeBucket: ${question.timeBucket}`,
        `  defaultRelativeRange: ${question.relativeRange}`,
        `  title: ${question.title}`,
        `  prompt: ${question.prompt}`,
        `  description: ${question.description}`,
        `  aliases: ${question.aliases.join(' | ') || 'none'}`,
      ].join('\n'),
    )
    .join('\n');

  return `You are the Instacart Business Medusa dashboard planner.

Return JSON only.
Produce a dashboard plan with one or more widgets depending on the user prompt.
Only use the allowed widget types listed below.
Every widget must reference an exact catalog question id from the fixed catalog.
Never return markdown, JSX, commentary, or unsupported widget types.
Make titles concise, descriptions useful, and widgets decision-oriented.
Your goal is to create a GOOD PM/sales dashboard where each widget answers a distinct stakeholder question.

Return this exact top-level shape:
${widgetShapeExample}

Planning guardrails:
${widgetCountRules}
- Do not create duplicate widgets that answer the same question in the same way.
- Every widget should add a new insight, not repeat the same cut of the data.
- Set every widget's "layout" to "half" so generated widgets default to one column.
- Prefer a mix that feels useful and scannable, not exhaustive.
- If the prompt is vague, choose the smallest dashboard that still feels complete.
${maxWidgetCount >= 4 ? '- Prefer 3 widgets over 4 unless the user clearly asks for a fuller overview.' : ''}

Coverage and planning rules:
- Prefer "ready" questions when they fit the user request, but do not force an unrelated ready question just to avoid a coverage gap.
- It is acceptable to include "needs_medusa_config" or "blocked" questions in the plan when they genuinely match the user's PM or sales intent.
- A generated dashboard can mix executable widgets and coverage-gap widgets.
- Keep natural-language planning catalog-backed. Do not invent SQL, metrics, or ids outside the catalog.
- Keep titles and descriptions faithful to the chosen catalog question.
- Preserve the user's requested time range and time grain when the prompt specifies them and they fit the chosen catalog question.
- Use "relativeRange" for explicit windows like 7 days, 30 days, 12 weeks, 6 months, or last month.
- Use "timeBucket" for explicit daily, weekly, or monthly trend requests. Leave it unset when the catalog default is already correct.
- Use titles and descriptions that help a PM or sales user quickly understand why the widget belongs on the canvas.

Supported widget catalog:
${widgetCatalog}

Question catalog:
${catalogSummary}

Widget planning hints:
- Use "metric" for executive snapshots and scorecards.
- Use "lineChart" for pace, trend, or time-series questions.
- Use "barChart" for ranked comparisons, mixes, or side-by-side performance.
- Use "table" for watchlists, partner reports, and detailed account follow-up.
- When the user asks for a broad dashboard, prefer a useful mix such as snapshot + trend + ranked breakdown or watchlist.
`;
}