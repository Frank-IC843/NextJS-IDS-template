import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { generateObject } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { renderDashboardReportPdfHtml } from '@/app/api/dashboard/report/pdf-template';
import { buildDashboardReportSystemPrompt } from '@/app/api/dashboard/report/system-prompt';
import { dashboardReportRequestSchema, dashboardReportSchema, type DashboardReportRequest } from '@/app/dashboard/dashboard-report-types';
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

    const { object } = await generateObject({
      model: gpt4_1,
      system: buildDashboardReportSystemPrompt(),
      prompt: buildDashboardReportPrompt(parsedInput.data),
      schema: dashboardReportSchema,
      temperature: 0,
    });

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
