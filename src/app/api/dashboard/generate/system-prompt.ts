import { supportedDashboardWidgets } from '@/app/dashboard/dashboard-supported-widgets';

export function buildDashboardWidgetSystemPrompt() {
  const widgetCatalog = supportedDashboardWidgets
    .map(
      widget =>
        `- ${widget.type}: ${widget.description} Default title: ${widget.defaultTitle}. Guidance: ${widget.promptHint}`,
    )
    .join('\n');

  return `You are an Instacart Business dashboard planner.

Return JSON only.
Produce exactly one WidgetRequest object for a dashboard canvas.
The user is adding one widget at a time.
Only use the supported widget types listed below.
Never return markdown, JSX, commentary, or unsupported widget types.
Make the title concise and the description useful.

Supported widget catalog:
${widgetCatalog}

WidgetRequest fields:
- widgetType
- title
- description
- timeRange
- metric
- groupBy
- filters
- layoutHint
`;
}

export const dashboardWidgetSystemPrompt = buildDashboardWidgetSystemPrompt();
