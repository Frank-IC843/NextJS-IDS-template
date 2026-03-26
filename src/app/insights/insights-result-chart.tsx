'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';
import type { InsightChart } from '@/app/insights/insights-types';

export function InsightsResultChart({ chart }: { chart: InsightChart }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '18px',
        borderRadius: theme.radius.r12,
        border: `1px solid ${businessPalette.blueberryBorder}`,
        backgroundColor: theme.colors.systemGrayscale00,
      }}
    >
      <div
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Text typography="titleMedium">
          {chart.kind === 'line' ? 'Trend view' : 'Breakdown view'}
        </Text>
        <Text typography="bodyRegular" color="systemGrayscale60">
          {chart.xLabel} vs {chart.yLabel}
        </Text>
      </div>
      <div css={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart.kind === 'line' ? (
            <LineChart data={chart.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.32)" />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={businessPalette.elderberry}
                strokeWidth={3}
                dot={{
                  fill: businessPalette.elderberry,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          ) : (
            <BarChart data={chart.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.32)" />
              <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill={businessPalette.blueberry} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
