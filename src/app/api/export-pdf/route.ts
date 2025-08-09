import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { createPdfTemplate } from '@/lib/pdf-template';

export async function POST(req: NextRequest) {
  try {
    const { content, title = 'Chat Export' } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Convert markdown content to HTML with Mermaid chart processing
    const messageHtml = await marked(content);

    // Process Mermaid code blocks to use proper div wrapper
    const processedHtml = messageHtml.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      '<div class="mermaid">$1</div>'
    );

    // Convert local image to base64 for Puppeteer
    let logoBase64 = '';
    try {
      const imagePath = path.join(process.cwd(), 'public', 'images', 'instacart-business.png');
      const imageBuffer = fs.readFileSync(imagePath);
      logoBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
      console.warn('Could not load local image, using fallback', error);
      logoBase64 =
        'https://www.instacart.com/image-server/x24/www.instacart.com/assets/beetstrap/brand/2022/instacart-business-logo-dark@3x-d16b19c9060685d040461f6e9a3c29e615b79792b566e74b9258f135db349c96.png';
    }

    // Create complete HTML document using template
    const htmlContent = createPdfTemplate({
      title,
      logoBase64,
      messageHtml: processedHtml,
    });

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

    // Generate PDF with professional settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.8in',
        right: '0.75in',
        bottom: '0.8in',
        left: '0.75in',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; color: #718096; width: 100%; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding-top: 10px;">
          ${title}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; color: #718096; width: 100%; display: flex; justify-content: space-between; align-items: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 10px 20px;">
          <span>Instacart Business Analytics</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          <span>${new Date().toLocaleDateString()}</span>
        </div>
      `,
      preferCSSPageSize: false,
      scale: 0.9,
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
