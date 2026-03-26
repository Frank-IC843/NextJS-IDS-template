'use client';

import { useTheme } from '@instacart/ids-core';
import { Text } from '@instacart/ids-customers';
import type { DashboardCoverageGapWidget } from '@/app/dashboard/dashboard-builder-types';
import { getDashboardBusinessPalette } from '@/app/dashboard/dashboard-business-theme';

export function DashboardCoverageWidgetView({ widget }: { widget: DashboardCoverageGapWidget }) {
  const theme = useTheme();
  const businessPalette = getDashboardBusinessPalette(theme);
  const isBlocked = widget.coverageStatus === 'blocked';

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minHeight: '220px',
        padding: '18px',
        borderRadius: theme.radius.r12,
        border: `1px solid ${isBlocked ? 'rgba(180, 35, 24, 0.24)' : businessPalette.blueberryBorder}`,
        background: isBlocked
          ? 'linear-gradient(180deg, rgba(180, 35, 24, 0.04) 0%, rgba(255, 255, 255, 0.98) 100%)'
          : 'linear-gradient(180deg, rgba(43, 120, 198, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%)',
      }}
    >
      <div css={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          css={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 10px',
            borderRadius: '999px',
            border: `1px solid ${isBlocked ? 'rgba(180, 35, 24, 0.24)' : businessPalette.elderberryBorder}`,
            backgroundColor: isBlocked ? 'rgba(180, 35, 24, 0.08)' : businessPalette.elderberrySoft,
          }}
        >
          <Text typography="bodyMedium1">{humanizeCoverageStatus(widget.coverageStatus)}</Text>
        </div>
        {widget.matchedQuestionTitle ? (
          <Text typography="bodyMedium1" color="systemGrayscale60">
            {widget.matchedQuestionTitle}
          </Text>
        ) : null}
      </div>

      <div css={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Text typography="bodyEmphasized">{widget.coverageMessage}</Text>
        <Text typography="bodyRegular" color="systemGrayscale60">
          {widget.summary}
        </Text>
      </div>

      <div
        css={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        }}
      >
        <CoverageField label="Requested widget question" value={widget.question} />
        <CoverageField label="Planner reasoning" value={widget.plannerReasoning} />
      </div>
    </div>
  );
}

function CoverageField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text typography="bodyMedium1" color="systemGrayscale60">
        {label}
      </Text>
      <Text typography="bodyRegular">{value}</Text>
    </div>
  );
}

function humanizeCoverageStatus(status: DashboardCoverageGapWidget['coverageStatus']) {
  switch (status) {
    case 'needs_medusa_config':
      return 'Needs Medusa config';
    case 'blocked':
    default:
      return 'Blocked';
  }
}
