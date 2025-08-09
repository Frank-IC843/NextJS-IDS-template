'use client';

import React from 'react';
import { IconButton } from '@instacart/ids-customers';
import { ReceiptIcon } from '@instacart/ids-core';
import { usePdfExport } from './use-pdf-export';

interface PdfExportButtonProps {
  content: string;
  title?: string;
  filename?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

export function PdfExportButton({
  content,
  title = 'Chat Export',
  filename,
  disabled = false,
  onSuccess,
  onError,
  children,
}: PdfExportButtonProps) {
  const { exportToPdf, isExporting } = usePdfExport({
    onSuccess,
    onError,
  });

  const handleExport = () => {
    exportToPdf({ content, title, filename });
  };

  const isDisabled = disabled || isExporting || !content.trim();
  const buttonText = isExporting ? 'Exporting...' : (children as string) || 'Export PDF';

  return (
    <IconButton onPress={handleExport} disabled={isDisabled} icon={ReceiptIcon} accessibleLabel="Export PDF">
      {buttonText}
    </IconButton>
  );
}
