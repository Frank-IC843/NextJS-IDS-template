import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { renderToString } from 'react-dom/server';
import { MessageContent } from '@/app/components/message-content';

export async function POST(req: NextRequest) {
  try {
    const { content, title = 'Chat Export' } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Render React component to HTML string
    const messageHtml = renderToString(await MessageContent({ content }));

    // Create complete HTML document with styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
          }
          
          h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
          }
          
          h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
          h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
          h3 { font-size: 1.25em; }
          
          p { margin-bottom: 16px; }
          
          ul, ol {
            margin-bottom: 16px;
            padding-left: 2em;
          }
          
          li {
            margin-bottom: 0.25em;
          }
          
          code {
            background-color: #f6f8fa;
            border-radius: 6px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          }
          
          pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
            margin-bottom: 16px;
          }
          
          pre code {
            background-color: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            max-width: auto;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
          }
          
          blockquote {
            border-left: 4px solid #dfe2e5;
            color: #6a737d;
            margin: 0 0 16px 0;
            padding: 0 1em;
          }
          
          table {
            border-collapse: collapse;
            margin-bottom: 16px;
            width: 100%;
          }
          
          table th,
          table td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
          }
          
          table th {
            background-color: #f6f8fa;
            font-weight: 600;
          }
          
          /* Mermaid diagrams */
          .mermaid {
            text-align: center;
            margin: 20px 0;
          }
          
          /* Print optimizations */
          @media print {
            body { margin: 0; }
            h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
            pre, blockquote { page-break-inside: avoid; }
          }
          
          /* Page break utilities */
          .page-break-before { page-break-before: always; }
          .page-break-after { page-break-after: always; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <header style="margin-bottom: 40px; border-bottom: 2px solid #eaecef; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #0969da;">${title}</h1>
          <p style="margin: 8px 0 0 0; color: #656d76; font-size: 14px;">
            Exported on ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </header>
        
        <main>
          ${messageHtml}
        </main>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaecef; text-align: center; color: #656d76; font-size: 12px;">
          Generated from Chat Interface
        </footer>
      </body>
      </html>
    `;

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Set content and wait for any dynamic content to load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #656d76; width: 100%; text-align: center;">
          ${title}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #656d76; width: 100%; text-align: center;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    });

    await browser.close();

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
