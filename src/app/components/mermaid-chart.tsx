'use client';

import React, { useLayoutEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  chart: string;
  className?: string;
}

export function MermaidChart({ chart, className }: MermaidChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useLayoutEffect(() => {
    // Initialize mermaid only once
    if (!initialized.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });
      initialized.current = true;
    }
  }, []);

  useLayoutEffect(() => {
    if (chartRef.current && chart.trim()) {
      const renderChart = async () => {
        try {
          // Clear previous content
          if (chartRef.current) {
            chartRef.current.innerHTML = '';
          }

          // Generate a unique ID for this render
          const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

          // Parse the chart first to validate syntax
          await mermaid.parse(chart.trim());

          // Render the chart
          const { svg } = await mermaid.render(uniqueId, chart.trim());

          // Insert the SVG
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          if (chartRef.current) {
            const errorMessage = error instanceof Error ? error.message : 'Invalid chart syntax';
            chartRef.current.innerHTML = `
              <div style="
                color: #dc3545; 
                padding: 16px; 
                border: 1px solid #dc3545; 
                border-radius: 8px; 
                background: #f8d7da;
                font-family: monospace;
                font-size: 14px;
                max-width: 100%;
                overflow-wrap: break-word;
              ">
                <strong>Chart Error:</strong><br/>
                ${errorMessage}<br/><br/>
                <details>
                  <summary>Chart Code (click to expand)</summary>
                  <pre style="margin-top: 8px; background: #fff; padding: 8px; border-radius: 4px; overflow-x: auto;">${chart}</pre>
                </details>
              </div>
            `;
          }
        }
      };

      renderChart();
    }
  }, [chart]);

  if (!chart || !chart.trim()) {
    return null;
  }

  return (
    <div
      ref={chartRef}
      className={className}
      style={{
        textAlign: 'center',
        margin: '16px 0',
        padding: '16px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'auto',
        minHeight: '100px',
      }}
    />
  );
}
