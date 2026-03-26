'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import type { TableWidget } from '@/app/dashboard/dashboard-builder-types';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import { formatCellValue } from '@/app/dashboard/dashboard-schema';

export function DashboardTableWidgetView({ widget }: { widget: TableWidget }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const hasRows = widget.data.rows.length > 0;

  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {hasRows ? (
        <div
          css={{
            overflowX: 'auto',
            borderRadius: theme.radius.r12,
            border: `1px solid ${businessPalette.blueberryBorder}`,
            backgroundColor: theme.colors.systemGrayscale00,
          }}
        >
          <table css={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
            <thead>
              <tr>
                {widget.data.columns.map(column => (
                  <th
                    key={column.id}
                    css={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      borderBottom: `1px solid ${theme.colors.systemGrayscale20}`,
                      color: theme.colors.systemGrayscale60,
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: theme.colors.systemGrayscale00,
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {widget.data.rows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${String(row.dimension_value ?? 'row')}`}>
                  {widget.data.columns.map(column => (
                    <td
                      key={column.id}
                      css={{
                        padding: '12px 14px',
                        borderBottom:
                          rowIndex === widget.data.rows.length - 1 ? 'none' : `1px solid ${theme.colors.systemGrayscale20}`,
                        fontSize: '14px',
                        color: theme.colors.systemGrayscale80,
                        whiteSpace: column.kind === 'number' ? 'nowrap' : 'normal',
                      }}
                    >
                      {formatCellValue(row[column.id], column.kind)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '220px',
            padding: '18px',
            borderRadius: theme.radius.r12,
            border: `1px solid ${businessPalette.blueberryBorder}`,
            backgroundColor: theme.colors.systemGrayscale00,
          }}
        >
          <Text typography="bodyRegular" color="systemGrayscale60">
            No result rows were returned for this widget.
          </Text>
        </div>
      )}

      <Text typography="bodyMedium1" color="systemGrayscale60">
        {widget.data.footer}
      </Text>
    </div>
  );
}
