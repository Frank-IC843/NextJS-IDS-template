import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { renderDashboardReportPdfHtml } from '@/app/api/dashboard/report/pdf-template';
import { buildDashboardReportSystemPrompt } from '@/app/api/dashboard/report/system-prompt';
import { dashboardReportRequestSchema, dashboardReportSchema, type DashboardReport, type DashboardReportRequest } from '@/app/dashboard/dashboard-report-types';
import { gpt4_1 } from '@/lib/ai-sdk-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = dashboardReportRequestSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'At least one hydrated widget is required to generate a report.' }, { status: 400 });
    }

    const object = await generateDashboardReport(parsedInput.data);

    const generatedAt = new Date();
    const logoDataUrl = await readBrandLogoDataUrl();
    const pdfBuffer = await renderDashboardReportPdf(
      renderDashboardReportPdfHtml({
        report: object,
        request: parsedInput.data,
        generatedAt,
        logoDataUrl,
      }),
    );
    const pdfArrayBuffer = new ArrayBuffer(pdfBuffer.byteLength);

    new Uint8Array(pdfArrayBuffer).set(pdfBuffer);

    return new NextResponse(pdfArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${buildReportFilename(object.title, generatedAt)}"`,
      },
    });
  } catch (error) {
    console.error('Dashboard report route failed:', error);
    return NextResponse.json({ error: 'Unable to generate a dashboard report right now.' }, { status: 500 });
  }
}

function buildDashboardReportPrompt(input: DashboardReportRequest) {
  return `Generate a business analytics report from this dashboard context.

Dashboard context:
${JSON.stringify(input, null, 2)}`;
}

async function generateDashboardReport(input: DashboardReportRequest): Promise<DashboardReport> {
  try {
    const { object } = await requestDashboardReport(input);

    return object;
  } catch (error) {
    if (!shouldRetryDashboardReport(error)) {
      throw error;
    }

    const validationIssues = extractDashboardReportValidationIssues(error);
    const { object } = await requestDashboardReport(input, validationIssues);

    return object;
  }
}

function requestDashboardReport(input: DashboardReportRequest, validationIssues: string[] = []) {
  return generateObject({
    model: gpt4_1,
    system: buildDashboardReportSystemPrompt(),
    prompt: buildDashboardReportPromptWithValidation(input, validationIssues),
    schema: dashboardReportSchema,
    temperature: 0,
  });
}

function buildDashboardReportPromptWithValidation(input: DashboardReportRequest, validationIssues: string[]) {
  if (validationIssues.length === 0) {
    return buildDashboardReportPrompt(input);
  }

  return `${buildDashboardReportPrompt(input)}

The previous attempt failed schema validation.
Fix every issue below while keeping the report grounded in the supplied dashboard context:
${validationIssues.map(issue => `- ${issue}`).join('\n')}

Return a corrected response that fully satisfies the required structure.`;
}

function shouldRetryDashboardReport(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'AI_NoObjectGeneratedError' ||
      error.message.includes('did not match schema') ||
      error.message.includes('Type validation failed'))
  );
}

function extractDashboardReportValidationIssues(error: unknown) {
  const issues = collectValidationIssues(error);

  return issues.length > 0 ? issues : ['Return an object that fully matches the required report schema.'];
}

function collectValidationIssues(error: unknown) {
  const queue: unknown[] = [error];
  const issues: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!isRecord(current)) {
      continue;
    }

    const maybeIssues = current.issues;

    if (Array.isArray(maybeIssues)) {
      maybeIssues.forEach(issue => {
        if (!isRecord(issue)) {
          return;
        }

        const issuePath = Array.isArray(issue.path) ? issue.path.join('.') : 'report';
        const issueMessage = typeof issue.message === 'string' ? issue.message : 'Validation issue';

        issues.push(issuePath ? `${issuePath}: ${issueMessage}` : issueMessage);
      });
    }

    if ('cause' in current) {
      queue.push(current.cause);
    }
  }

  return issues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function renderDashboardReportPdf(html: string) {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    });
    await page.emulateMediaType('screen');

    return await page.pdf({
      format: 'a4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="width:100%;padding:0 14mm;font-size:9px;color:#6b7280;text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: {
        top: '12mm',
        right: '0',
        bottom: '14mm',
        left: '0',
      },
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}

async function readBrandLogoDataUrl() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'instacart-business.png');
    const logoBuffer = await readFile(logoPath);

    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Unable to load Instacart Business logo for dashboard report:', error);
    return null;
  }
}

function buildReportFilename(title: string, date: Date) {
  const baseTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${baseTitle || 'business-intelligence-report'}-${year}-${month}-${day}.pdf`;
}
