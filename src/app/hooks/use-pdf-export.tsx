'use client';

import { useState } from 'react';

interface UsePdfExportProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface ExportPdfOptions {
  content: string;
  title?: string;
  filename?: string;
}

export function usePdfExport({ onSuccess, onError }: UsePdfExportProps = {}) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async ({ content, title = 'Chat Export', filename }: ExportPdfOptions) => {
    if (!content.trim()) {
      onError?.('No content to export');
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, title }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      onSuccess?.();
    } catch (error) {
      console.error('PDF export error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPdf,
    isExporting,
  };
}
