import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { content, title = 'Chat Export' } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Convert markdown content to HTML - let Puppeteer handle Mermaid rendering
    const messageHtml = await marked(content);

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

    // Create complete HTML document with styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #2c3e50;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
            font-size: 11pt;
          }
          
          /* Professional heading hierarchy */
          h1 {
            font-size: 18pt;
            font-weight: 600;
            color: #2d3748;
            margin: 25px 0 15px 0;
            page-break-after: avoid;
          }
          
          /* Main title with full-width underline */
          h1.main-title {
            font-size: 24pt;
            font-weight: 700;
            color: #0969da;
            margin: 30px -20px 20px -20px;
            padding: 0 20px 8px 20px;
            border-bottom: 2px solid #3182ce;
          }
          
          h2 {
            font-size: 14pt;
            font-weight: 600;
            color: #4a5568;
            margin: 20px 0 12px 0;
            page-break-after: avoid;
          }
          
          h3 {
            font-size: 12pt;
            font-weight: 600;
            color: #6b7280;
            margin: 16px 0 8px 0;
            page-break-after: avoid;
          }
          
          h4 {
            font-size: 12pt;
            font-weight: 600;
            color: #718096;
            margin: 15px 0 10px 0;
          }
          
          /* Professional paragraph spacing */
          p {
            margin: 0 0 12px 0;
            text-align: justify;
            orphans: 2;
            widows: 2;
          }
          
          /* Executive summary styling */
          h2:first-of-type + ul,
          h2:first-of-type + p + ul {
            background: #f7fafc;
            border-left: 4px solid #3182ce;
            padding: 15px 20px;
            margin: 15px 0 25px 0;
            border-radius: 0 4px 4px 0;
          }
          
          /* Professional list styling */
          ul, ol {
            margin: 12px 0 18px 0;
            padding-left: 25px;
          }
          
          li {
            margin-bottom: 6px;
            line-height: 1.4;
          }
          
          /* Strong emphasis for key terms */
          strong {
            color: #2d3748;
            font-weight: 600;
          }
          
          /* Horizontal rules for section breaks */
          hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 30px 0;
            page-break-after: avoid;
          }
          
          /* Code styling */
          code {
            background-color: #edf2f7;
            border-radius: 3px;
            font-size: 10pt;
            margin: 0;
            padding: 2px 4px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            color: #d53f8c;
          }
          
          pre {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 10pt;
            line-height: 1.4;
            overflow: auto;
            padding: 12px;
            margin: 15px 0;
            page-break-inside: avoid;
          }
          
          pre code {
            background-color: transparent;
            border: 0;
            color: #2d3748;
            padding: 0;
          }
          
          /* Professional blockquote */
          blockquote {
            border-left: 4px solid #3182ce;
            background: #f7fafc;
            color: #4a5568;
            margin: 15px 0;
            padding: 12px 20px;
            font-style: italic;
            border-radius: 0 4px 4px 0;
          }
          
          /* Professional table styling */
          table {
            border-collapse: collapse;
            margin: 20px 0;
            width: 100%;
            font-size: 10pt;
            page-break-inside: avoid;
          }
          
          table th,
          table td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
          }
          
          table th {
            background-color: #edf2f7;
            font-weight: 600;
            color: #2d3748;
          }
          
          table tr:nth-child(even) {
            background-color: #f7fafc;
          }
          
          /* Professional Mermaid chart styling */
          .mermaid {
            text-align: center;
            margin: 25px 0 30px 0;
            page-break-inside: avoid;
            background: #fcfcfc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 20px;
          }
          
          .mermaid svg {
            max-width: 100% !important;
            max-height: 350px !important;
            height: auto !important;
            width: auto !important;
          }
          
          /* Professional print optimizations */
          @media print {
            body { 
              margin: 0; 
              font-size: 10pt;
            }
            h1, h2, h3, h4, h5, h6 { 
              page-break-after: avoid;
              page-break-inside: avoid;
            }
            .mermaid, pre, blockquote, table { 
              page-break-inside: avoid; 
            }
            ul, ol {
              page-break-before: avoid;
            }
            li {
              page-break-inside: avoid;
            }
          }
          
          /* Section spacing utilities */
          .section-break {
            margin-top: 35px;
            page-break-before: avoid;
          }
          
          /* Recommendation section styling */
          h2:contains("Recommendations") + h3,
          h2:contains("recommendations") + h3 {
            color: #2b6cb0;
            background: #ebf8ff;
            padding: 8px 15px;
            border-radius: 4px;
            border-left: 4px solid #3182ce;
          }
        </style>
      </head>
      <body>
        <header style="margin-bottom: 40px; padding-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <img 
              src="${logoBase64}" 
              alt="Instacart Business" 
              style="height: 32px; margin-bottom: 16px;"
            />
            <h1 class="main-title" style="margin: 0; color: #0969da; font-size: 28px;">${title}</h1>
            <p style="margin: 8px 0 0 0; color: #656d76; font-size: 14px;">
              Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </header>
        
        <main>
          ${messageHtml}
        </main>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaecef; text-align: center; color: #656d76; font-size: 12px;">
          Generated from Chat Interface
        </footer>
        
        <script>
          // Convert code blocks with mermaid content to mermaid divs
          document.addEventListener('DOMContentLoaded', function() {
            const codeBlocks = document.querySelectorAll('pre code');
            const mermaidKeywords = ['graph', 'pie', 'flowchart', 'gantt', 'timeline', 'sequenceDiagram', 'classDiagram', 'stateDiagram'];
            
            codeBlocks.forEach(codeBlock => {
              const content = codeBlock.textContent || '';
              const isExplicitMermaid = codeBlock.className.includes('language-mermaid');
              const startsWithMermaidKeyword = mermaidKeywords.some(keyword => content.trim().startsWith(keyword));
              
              if (isExplicitMermaid || startsWithMermaidKeyword) {
                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.textContent = content;
                codeBlock.parentElement.replaceWith(mermaidDiv);
              }
            });
            
            // Initialize mermaid after converting code blocks
            mermaid.initialize({ 
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose',
              maxTextSize: 90000,
              flowchart: {
                useMaxWidth: true,
                htmlLabels: true
              },
              pie: {
                useMaxWidth: true
              }
            });
            
            // Render all mermaid diagrams
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
          });
        </script>
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
