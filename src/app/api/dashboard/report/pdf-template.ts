import type {
  DashboardReport,
  DashboardReportRequest,
  DashboardReportWidgetContext,
} from '@/app/dashboard/dashboard-report-types';

const PDF_COLORS = {
  text: '#1f2937',
  muted: '#5b6472',
  softText: '#6b7280',
  line: '#d8e1ee',
  panel: '#f8fafc',
  white: '#ffffff',
  brand: '#2b78c6',
  brandDark: '#18599a',
  brandSoft: '#eaf3ff',
  elderberry: '#6e48e5',
  elderberrySoft: '#f3edff',
  positive: '#12803a',
  positiveSoft: '#eaf7ef',
  caution: '#9a6200',
  cautionSoft: '#f9f1df',
  neutral: '#64748b',
  neutralSoft: '#f1f5f9',
};

export function renderDashboardReportPdfHtml({
  report,
  request,
  generatedAt,
  logoDataUrl,
}: {
  report: DashboardReport;
  request: DashboardReportRequest;
  generatedAt: Date;
  logoDataUrl: string | null;
}) {
  const widgetsById = new Map(request.widgets.map(widget => [widget.id, widget]));
  const sectionsHtml = report.sections
    .map(section => {
      const sectionVisual = pickSectionVisual(section.sourceWidgetIds, widgetsById);

      return `
        <section class="report-card keep-together">
          <div class="section-header-block">
            <div class="section-kicker">Analysis section</div>
            <h2>${escapeHtml(section.title)}</h2>
            <p class="section-summary">${escapeHtml(section.summary)}</p>
          </div>
          <div class="analysis-grid${sectionVisual ? '' : ' analysis-grid-no-visual'}">
            <div class="section-body">
              <div class="callout-panel">
                <div class="callout-list">
                  ${section.callouts
                    .map(
                      callout => `
                        <div class="callout-item">
                          <div class="callout-dot"></div>
                          <p>${escapeHtml(callout)}</p>
                        </div>
                      `,
                    )
                    .join('')}
                </div>
              </div>
            </div>
            ${
              sectionVisual
                ? `
                  <div class="section-visual">
                    ${renderVisualForWidget(sectionVisual)}
                  </div>
                `
                : ''
            }
          </div>
          <div class="analysis-evidence-grid">
            ${section.evidence
              .map(
                evidence => `
                  <div class="evidence-card">
                    <div class="evidence-label">${escapeHtml(evidence.label)}</div>
                    <div class="evidence-value">${escapeHtml(evidence.value)}</div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
      `;
    })
    .join('');
  const recommendationsHtml = report.recommendations
    .map(
      recommendation => `
        <div class="recommendation-card keep-together">
          <div class="recommendation-header">
            <h3>${escapeHtml(recommendation.title)}</h3>
            <span class="priority-badge priority-${recommendation.priority}">${escapeHtml(capitalizeLabel(recommendation.priority))} priority</span>
          </div>
          <p class="recommendation-action">${escapeHtml(recommendation.action)}</p>
          <p class="recommendation-rationale">${escapeHtml(recommendation.rationale)}</p>
        </div>
      `,
    )
    .join('');
  const dataCoverageHtml =
    request.skippedWidgets.length > 0
      ? `
        <section class="report-card keep-together">
          <div class="section-kicker">Data coverage</div>
          <h2>Incomplete views</h2>
          <div class="coverage-list">
            ${request.skippedWidgets
              .map(
                skippedWidget => `
                  <div class="coverage-item">
                    <div class="coverage-title">${escapeHtml(skippedWidget.title)}</div>
                    <div class="coverage-detail">${escapeHtml(skippedWidget.detail)}</div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
      `
      : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(report.title)}</title>
    <style>
      @page {
        size: A4;
        margin: 16mm 14mm 18mm;
      }

      * {
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        padding: 0;
        background: ${PDF_COLORS.white};
        color: ${PDF_COLORS.text};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        font-size: 12px;
        line-height: 1.5;
      }

      h1, h2, h3, p {
        margin: 0;
      }

      .document {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .report-meta {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid ${PDF_COLORS.line};
      }

      .report-meta-left {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .report-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${PDF_COLORS.softText};
      }

      .brand-logo {
        width: 182px;
        height: auto;
        display: block;
      }

      .brand-wordmark {
        font-size: 24px;
        font-weight: 700;
        color: ${PDF_COLORS.brandDark};
      }

      .generated-at {
        color: ${PDF_COLORS.softText};
        font-size: 11px;
      }

      .report-title-block {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-top: 2px;
      }

      .report-title {
        font-size: 30px;
        line-height: 1.15;
        font-weight: 800;
        color: ${PDF_COLORS.brand};
      }

      .report-title-rule {
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, ${PDF_COLORS.brand} 0%, ${PDF_COLORS.line} 100%);
      }

      .report-subtitle {
        max-width: 620px;
        color: ${PDF_COLORS.muted};
        font-size: 14px;
      }

      .query-card,
      .summary-card,
      .report-card,
      .recommendation-card,
      .coverage-item {
        border: 1px solid ${PDF_COLORS.line};
        border-radius: 14px;
        background: ${PDF_COLORS.white};
      }

      .query-card,
      .summary-card,
      .report-card {
        padding: 18px;
      }

      .query-card {
        background: ${PDF_COLORS.panel};
      }

      .summary-card {
        background: linear-gradient(135deg, ${PDF_COLORS.elderberrySoft} 0%, ${PDF_COLORS.white} 70%);
      }

      .section-header-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 18px;
      }

      .section-kicker {
        margin-bottom: 8px;
        color: ${PDF_COLORS.softText};
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .query-card h2,
      .summary-card h2,
      .report-card h2,
      .recommendations-title,
      .metrics-title {
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 1.3;
        font-weight: 800;
      }

      .query-text,
      .summary-overview,
      .section-summary,
      .recommendation-action,
      .recommendation-rationale,
      .coverage-detail {
        color: ${PDF_COLORS.muted};
      }

      .summary-headline {
        margin-bottom: 8px;
        font-size: 20px;
        line-height: 1.3;
        font-weight: 800;
      }

      .takeaway-list,
      .callout-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .takeaway-item,
      .callout-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .takeaway-item p,
      .callout-item p {
        flex: 1;
      }

      .takeaway-dot,
      .callout-dot {
        width: 8px;
        height: 8px;
        margin-top: 6px;
        border-radius: 999px;
        flex-shrink: 0;
        background: ${PDF_COLORS.brand};
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .metric-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        border: 1px solid ${PDF_COLORS.line};
        border-radius: 14px;
        background: ${PDF_COLORS.white};
      }

      .metric-label {
        color: ${PDF_COLORS.softText};
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .metric-value {
        font-size: 28px;
        line-height: 1;
        font-weight: 800;
      }

      .metric-insight {
        color: ${PDF_COLORS.muted};
      }

      .analysis-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(290px, 0.96fr);
        gap: 20px;
        align-items: stretch;
        margin-bottom: 14px;
      }

      .analysis-grid-no-visual {
        grid-template-columns: minmax(0, 1fr);
      }

      .section-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 0;
      }

      .callout-panel {
        padding: 14px 16px;
        border-radius: 12px;
        border: 1px solid ${PDF_COLORS.line};
        background: linear-gradient(180deg, ${PDF_COLORS.panel} 0%, ${PDF_COLORS.white} 100%);
      }

      .analysis-evidence-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .evidence-card {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px;
        border-radius: 12px;
        background: ${PDF_COLORS.panel};
        border: 1px solid ${PDF_COLORS.line};
        min-height: 72px;
        justify-content: space-between;
      }

      .evidence-label {
        color: ${PDF_COLORS.softText};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .evidence-value {
        font-size: 16px;
        line-height: 1.2;
        font-weight: 700;
      }

      .section-visual {
        min-width: 0;
        display: flex;
      }

      .visual-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        padding: 16px;
        border-radius: 14px;
        border: 1px solid ${PDF_COLORS.line};
        background: linear-gradient(180deg, ${PDF_COLORS.brandSoft} 0%, ${PDF_COLORS.white} 100%);
        min-height: 100%;
      }

      .visual-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }

      .visual-title {
        font-size: 13px;
        line-height: 1.3;
        font-weight: 800;
      }

      .visual-time-range {
        color: ${PDF_COLORS.softText};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .visual-description {
        color: ${PDF_COLORS.muted};
        font-size: 11px;
      }

      .chart-shell {
        width: 100%;
        border-radius: 12px;
        border: 1px solid ${PDF_COLORS.line};
        background: ${PDF_COLORS.white};
        padding: 12px;
        min-height: 250px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chart-footer {
        color: ${PDF_COLORS.softText};
        font-size: 10px;
        line-height: 1.4;
      }

      .metric-visual {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 18px;
        border-radius: 12px;
        background: linear-gradient(135deg, ${PDF_COLORS.brandSoft} 0%, ${PDF_COLORS.white} 100%);
        border: 1px solid ${PDF_COLORS.line};
        min-height: 212px;
        justify-content: space-between;
      }

      .metric-visual-value {
        font-size: 34px;
        line-height: 1;
        font-weight: 800;
      }

      .metric-visual-range {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        padding: 6px 10px;
        border-radius: 999px;
        background: ${PDF_COLORS.white};
        border: 1px solid ${PDF_COLORS.line};
        color: ${PDF_COLORS.brandDark};
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .donut-layout {
        display: grid;
        grid-template-columns: 132px minmax(0, 1fr);
        gap: 14px;
        align-items: center;
      }

      .donut-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .donut-legend-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .donut-legend-label {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .donut-legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        flex-shrink: 0;
      }

      .recommendations-wrap {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .recommendation-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
      }

      .recommendation-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .recommendation-header h3 {
        font-size: 14px;
        line-height: 1.3;
        font-weight: 800;
      }

      .priority-badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        border: 1px solid transparent;
        white-space: nowrap;
      }

      .priority-high {
        color: ${PDF_COLORS.caution};
        background: ${PDF_COLORS.cautionSoft};
        border-color: rgba(154, 98, 0, 0.25);
      }

      .priority-medium {
        color: ${PDF_COLORS.brandDark};
        background: ${PDF_COLORS.brandSoft};
        border-color: rgba(43, 120, 198, 0.22);
      }

      .priority-low {
        color: ${PDF_COLORS.neutral};
        background: ${PDF_COLORS.neutralSoft};
        border-color: rgba(100, 116, 139, 0.22);
      }

      .caveat-list,
      .coverage-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .coverage-item {
        padding: 12px;
        background: ${PDF_COLORS.panel};
      }

      .coverage-title {
        margin-bottom: 4px;
        font-weight: 800;
      }

      .keep-together {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <main class="document">
      <section class="report-meta keep-together">
        <div class="report-meta-left">
          <div class="report-label">Business intelligence report</div>
          ${
            logoDataUrl
              ? `<img src="${logoDataUrl}" alt="Instacart Business" class="brand-logo" />`
              : `<div class="brand-wordmark">Instacart Business</div>`
          }
          <div class="generated-at">Generated on ${escapeHtml(formatGeneratedAt(generatedAt))}</div>
        </div>
      </section>

      <section class="report-title-block keep-together">
        <h1 class="report-title">${escapeHtml(report.title)}</h1>
        <div class="report-title-rule"></div>
        <p class="report-subtitle">${escapeHtml(report.subtitle)}</p>
      </section>

      ${
        request.dashboardPrompt
          ? `
            <section class="query-card keep-together">
              <div class="section-kicker">User query</div>
              <h2>Request context</h2>
              <p class="query-text">${escapeHtml(request.dashboardPrompt)}</p>
            </section>
          `
          : ''
      }

      <section class="summary-card keep-together">
        <div class="section-kicker">Executive summary</div>
        <div class="summary-headline">${escapeHtml(report.executiveSummary.headline)}</div>
        <p class="summary-overview">${escapeHtml(report.executiveSummary.overview)}</p>
        <div class="takeaway-list" style="margin-top: 14px;">
          ${report.executiveSummary.keyTakeaways
            .map(
              takeaway => `
                <div class="takeaway-item">
                  <div class="takeaway-dot"></div>
                  <p>${escapeHtml(takeaway)}</p>
                </div>
              `,
            )
            .join('')}
        </div>
      </section>

      <section class="keep-together">
        <div class="metrics-title">Key metrics</div>
        <div class="metrics-grid">
          ${report.keyMetrics
            .map(
              metric => `
                <div class="metric-card">
                  <div class="metric-label">${escapeHtml(metric.label)}</div>
                  <div class="metric-value">${escapeHtml(metric.value)}</div>
                  <div class="metric-insight">${escapeHtml(metric.insight)}</div>
                </div>
              `,
            )
            .join('')}
        </div>
      </section>

      ${sectionsHtml}

      <section class="keep-together">
        <div class="recommendations-title">Recommended next steps</div>
        <div class="recommendations-wrap">
          ${recommendationsHtml}
        </div>
      </section>

      ${
        report.caveats.length > 0
          ? `
            <section class="report-card keep-together">
              <div class="section-kicker">Caveats</div>
              <h2>Read before sharing</h2>
              <div class="caveat-list">
                ${report.caveats
                  .map(
                    caveat => `
                      <div class="callout-item">
                        <div class="callout-dot" style="background: ${PDF_COLORS.neutral};"></div>
                        <p>${escapeHtml(caveat)}</p>
                      </div>
                    `,
                  )
                  .join('')}
              </div>
            </section>
          `
          : ''
      }

      ${dataCoverageHtml}
    </main>
  </body>
</html>`;
}

function pickSectionVisual(
  sourceWidgetIds: string[],
  widgetsById: Map<string, DashboardReportWidgetContext>,
) {
  for (const widgetId of sourceWidgetIds) {
    const widget = widgetsById.get(widgetId);

    if (widget && widget.widgetType !== 'metric') {
      return widget;
    }
  }

  for (const widgetId of sourceWidgetIds) {
    const widget = widgetsById.get(widgetId);

    if (widget) {
      return widget;
    }
  }

  return null;
}

function renderVisualForWidget(widget: DashboardReportWidgetContext) {
  switch (widget.widgetType) {
    case 'metric':
      return `
        <div class="visual-card">
          <div class="visual-header">
            <div class="visual-title">${escapeHtml(widget.title)}</div>
            <div class="visual-time-range">${escapeHtml(widget.timeRangeLabel)}</div>
          </div>
          ${widget.description ? `<div class="visual-description">${escapeHtml(widget.description)}</div>` : ''}
          <div class="metric-visual">
            <div class="metric-visual-value">${escapeHtml(widget.summary.value)}</div>
            <div class="metric-visual-range">${escapeHtml(widget.timeRangeLabel)}</div>
            <div class="chart-footer">${escapeHtml(widget.summary.detail)}</div>
          </div>
        </div>
      `;
    case 'lineChart':
      return `
        <div class="visual-card">
          <div class="visual-header">
            <div class="visual-title">${escapeHtml(widget.title)}</div>
            <div class="visual-time-range">${escapeHtml(widget.timeRangeLabel)}</div>
          </div>
          ${widget.description ? `<div class="visual-description">${escapeHtml(widget.description)}</div>` : ''}
          <div class="chart-shell">
            ${renderLineChartSvg(widget.summary.points)}
          </div>
          <div class="chart-footer">${escapeHtml(widget.summary.footer)}</div>
        </div>
      `;
    case 'barChart':
      return `
        <div class="visual-card">
          <div class="visual-header">
            <div class="visual-title">${escapeHtml(widget.title)}</div>
            <div class="visual-time-range">${escapeHtml(widget.timeRangeLabel)}</div>
          </div>
          ${widget.description ? `<div class="visual-description">${escapeHtml(widget.description)}</div>` : ''}
          <div class="chart-shell">
            ${renderBarChartSvg(widget.summary.bars)}
          </div>
          <div class="chart-footer">${escapeHtml(widget.summary.footer)}</div>
        </div>
      `;
    case 'donutChart':
    default:
      return `
        <div class="visual-card">
          <div class="visual-header">
            <div class="visual-title">${escapeHtml(widget.title)}</div>
            <div class="visual-time-range">${escapeHtml(widget.timeRangeLabel)}</div>
          </div>
          ${widget.description ? `<div class="visual-description">${escapeHtml(widget.description)}</div>` : ''}
          <div class="chart-shell">
            ${renderDonutChart(widget.summary.segments)}
          </div>
          <div class="chart-footer">${escapeHtml(widget.summary.footer)}</div>
        </div>
      `;
  }
}

function renderLineChartSvg(points: Array<{ label: string; value: number }>) {
  if (points.length === 0) {
    return renderEmptyChartState();
  }

  const width = 420;
  const height = 220;
  const paddingTop = 18;
  const paddingRight = 18;
  const paddingBottom = 34;
  const paddingLeft = 24;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(...points.map(point => point.value), 1);
  const minValue = Math.min(0, ...points.map(point => point.value));
  const range = Math.max(maxValue - minValue, 1);
  const getX = (index: number) =>
    points.length === 1 ? paddingLeft + plotWidth / 2 : paddingLeft + (index * plotWidth) / (points.length - 1);
  const getY = (value: number) => paddingTop + ((maxValue - value) / range) * plotHeight;
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index).toFixed(2)} ${getY(point.value).toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L ${getX(points.length - 1).toFixed(2)} ${(paddingTop + plotHeight).toFixed(2)} L ${getX(0).toFixed(2)} ${(paddingTop + plotHeight).toFixed(2)} Z`;
  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const y = paddingTop + (index * plotHeight) / 3;

    return `<line x1="${paddingLeft}" x2="${width - paddingRight}" y1="${y}" y2="${y}" stroke="${PDF_COLORS.line}" stroke-dasharray="3 4" />`;
  }).join('');
  const xLabels = points
    .map(
      (point, index) => `
        <text x="${getX(index)}" y="${height - 12}" text-anchor="middle" font-size="10" fill="${PDF_COLORS.softText}">
          ${escapeHtml(truncateLabel(point.label, 9))}
        </text>
      `,
    )
    .join('');
  const dots = points
    .map(
      (point, index) => `
        <circle cx="${getX(index)}" cy="${getY(point.value)}" r="3.4" fill="${PDF_COLORS.white}" stroke="${PDF_COLORS.brand}" stroke-width="2" />
      `,
    )
    .join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="220" role="img" aria-label="Line chart">
      <defs>
        <linearGradient id="line-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${PDF_COLORS.elderberry}" stop-opacity="0.18" />
          <stop offset="100%" stop-color="${PDF_COLORS.brand}" stop-opacity="0.03" />
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#line-fill)" />
      <path d="${linePath}" fill="none" stroke="${PDF_COLORS.elderberry}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
      ${xLabels}
    </svg>
  `;
}

function renderBarChartSvg(bars: Array<{ label: string; value: number }>) {
  if (bars.length === 0) {
    return renderEmptyChartState();
  }

  const width = 420;
  const height = 220;
  const paddingTop = 18;
  const paddingRight = 18;
  const paddingBottom = 40;
  const paddingLeft = 18;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(...bars.map(bar => bar.value), 1);
  const gap = 12;
  const barWidth = Math.max((plotWidth - gap * (bars.length - 1)) / bars.length, 12);
  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const y = paddingTop + (index * plotHeight) / 3;

    return `<line x1="${paddingLeft}" x2="${width - paddingRight}" y1="${y}" y2="${y}" stroke="${PDF_COLORS.line}" stroke-dasharray="3 4" />`;
  }).join('');
  const barsHtml = bars
    .map((bar, index) => {
      const x = paddingLeft + index * (barWidth + gap);
      const barHeight = Math.max((bar.value / maxValue) * plotHeight, 4);
      const y = paddingTop + plotHeight - barHeight;

      return `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="8" fill="${PDF_COLORS.brand}" />
        <text x="${x + barWidth / 2}" y="${height - 14}" text-anchor="middle" font-size="10" fill="${PDF_COLORS.softText}">
          ${escapeHtml(truncateLabel(bar.label, 8))}
        </text>
      `;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="220" role="img" aria-label="Bar chart">
      ${gridLines}
      ${barsHtml}
    </svg>
  `;
}

function renderDonutChart(segments: Array<{ label: string; value: number; tone: string }>) {
  if (segments.length === 0) {
    return renderEmptyChartState();
  }

  const total = Math.max(
    segments.reduce((sum, segment) => sum + segment.value, 0),
    1,
  );
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const circlesHtml = segments
    .map(segment => {
      const length = (segment.value / total) * circumference;
      const circle = `
        <circle
          cx="66"
          cy="66"
          r="${radius}"
          fill="none"
          stroke="${getSegmentColor(segment.tone)}"
          stroke-width="18"
          stroke-dasharray="${length} ${circumference - length}"
          stroke-dashoffset="${-offset}"
          stroke-linecap="butt"
          transform="rotate(-90 66 66)"
        />
      `;

      offset += length;
      return circle;
    })
    .join('');
  const legendHtml = segments
    .map(segment => {
      const percent = Math.round((segment.value / total) * 100);

      return `
        <div class="donut-legend-item">
          <div class="donut-legend-label">
            <span class="donut-legend-dot" style="background: ${getSegmentColor(segment.tone)};"></span>
            <span>${escapeHtml(truncateLabel(segment.label, 18))}</span>
          </div>
          <span>${percent}%</span>
        </div>
      `;
    })
    .join('');

  return `
    <div class="donut-layout">
      <svg viewBox="0 0 132 132" width="132" height="132" role="img" aria-label="Donut chart">
        <circle cx="66" cy="66" r="${radius}" fill="none" stroke="${PDF_COLORS.line}" stroke-width="18" />
        ${circlesHtml}
        <circle cx="66" cy="66" r="28" fill="${PDF_COLORS.white}" />
        <text x="66" y="62" text-anchor="middle" font-size="10" fill="${PDF_COLORS.softText}">Total</text>
        <text x="66" y="78" text-anchor="middle" font-size="14" font-weight="800" fill="${PDF_COLORS.text}">${escapeHtml(
          formatCompactNumber(total),
        )}</text>
      </svg>
      <div class="donut-legend">
        ${legendHtml}
      </div>
    </div>
  `;
}

function renderEmptyChartState() {
  return `
    <div style="display:flex;align-items:center;justify-content:center;height:200px;color:${PDF_COLORS.softText};">
      No analytics data available for this visual.
    </div>
  `;
}

function getSegmentColor(tone: string) {
  switch (tone) {
    case 'positive':
      return PDF_COLORS.positive;
    case 'caution':
      return PDF_COLORS.caution;
    case 'neutral':
      return PDF_COLORS.neutral;
    case 'brand':
    default:
      return PDF_COLORS.brand;
  }
}

function formatGeneratedAt(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function truncateLabel(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, Math.max(maxLength - 3, 1))}...`;
}

function capitalizeLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
