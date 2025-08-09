/**
 * PDF Template Utility
 * Generates HTML templates for PDF export with professional styling
 */

export interface PdfTemplateOptions {
  title: string;
  logoBase64: string;
  messageHtml: string;
}

/**
 * Creates a complete HTML template for PDF generation
 * @param options - Template configuration options
 * @returns Complete HTML document string
 */
export function createPdfTemplate({ title, logoBase64, messageHtml }: PdfTemplateOptions): string {
  return `
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
          margin: 0 -20px 20px 0;
          padding: 0 20px 8px 0;
          border-bottom: 2px solid #3182ce;
          text-align: left;
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
        
        /* Horizontal rules for section breaks - made more visible */
        hr {
          border: none;
          border-top: 1px solid #cbd5e0;
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
      <header style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <img 
              src="${logoBase64}" 
              alt="Instacart Business" 
              style="height: 32px; margin-bottom: 16px;"
            />
            <p style="margin: 8px 0 0 0; color: #656d76; font-size: 14px;">
              Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} at ${new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>
        </div>
        <h1 class="main-title">${title}</h1>
      </header>
      
      <main>
        ${messageHtml}
      </main>
      
      <script>
        // Configure Mermaid before DOMContentLoaded
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
        
        document.addEventListener('DOMContentLoaded', function() {
          // Wait a bit for content to be fully loaded
          setTimeout(function() {
            const mermaidElements = document.querySelectorAll('.mermaid');
            console.log('Found Mermaid elements:', mermaidElements.length);
            
            if (mermaidElements.length > 0) {
              mermaid.init(undefined, mermaidElements);
            }
          }, 100);
        });
      </script>
    </body>
    </html>
  `;
}
