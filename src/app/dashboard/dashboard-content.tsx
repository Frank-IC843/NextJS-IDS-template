'use client';

import {
  Text,
  ButtonBase,
  Select,
  SelectButton,
  SelectButtonValue,
  SelectOptions,
  SelectOption,
  Divider,
} from '@instacart/ids-customers';
import { useTheme } from '@instacart/ids-core';
import { useState } from 'react';
import { BusinessMonthsQuery } from '@/__generated__/graphql-types';

import { useGetBusinessOrderMetrics } from '../queries';
import { MetricCard } from '@/app/components/metric-card';
import { AIButton } from './ai-button';

const useStyles = () => {
  const theme = useTheme();
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    linkButton: {
      // Reset default button styles
      backgroundColor: 'transparent',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      ...theme.typography.linkMedium,
    },
    selectContainer: {
      width: '268px',
    },
    selectStyles: {
      select: {
        width: '100%',
      },
    },
    cardsContainer: {
      display: 'flex',
      gap: '16px',
      marginTop: '8px',
    },
  } as const;
};

interface DashboardContentProps {
  businessMonthsData: BusinessMonthsQuery;
}

export function DashboardContent({ businessMonthsData: { businessMonths } }: DashboardContentProps) {
  const styles = useStyles();
  const [selectedMonth, setSelectedMonth] = useState(businessMonths[0]);
  const selectedMonthLabel = selectedMonth.viewSection.labelString;

  const { data: orderMetricsData, loading: orderMetricsLoading } = useGetBusinessOrderMetrics(
    selectedMonth.startDate,
    selectedMonth.endDate
  );
  const { orderMetricCards } = orderMetricsData?.businessOrderMetrics.viewSection ?? {};
  const ordersCompletedCard = orderMetricCards?.find(card => card.cardVariant === 'ordersCompleted');
  const totalSpendCard = orderMetricCards?.find(card => card.cardVariant === 'totalSpendCents');

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <Text typography="headline">Dashboard</Text>
        <ButtonBase css={styles.linkButton}>Export</ButtonBase>
      </div>
      <div css={styles.selectContainer}>
        <Select selectedValue={selectedMonthLabel} styles={styles.selectStyles}>
          <SelectButton>
            <SelectButtonValue>{selectedMonthLabel}</SelectButtonValue>
          </SelectButton>
          <SelectOptions alignment="left">
            {businessMonths.map(month => (
              <SelectOption
                value={month.viewSection.labelString}
                key={month.viewSection.labelString}
                onClick={() => setSelectedMonth(month)}
              >
                {month.viewSection.labelString}
              </SelectOption>
            ))}
          </SelectOptions>
        </Select>
      </div>
      <div css={styles.cardsContainer}>
        <MetricCard
          title={ordersCompletedCard?.titleString}
          value={ordersCompletedCard?.valueString}
          tooltipText={ordersCompletedCard?.tooltipTextString}
          isLoading={orderMetricsLoading}
        />
        <MetricCard
          title={totalSpendCard?.titleString}
          value={totalSpendCard?.valueString}
          tooltipText={totalSpendCard?.tooltipTextString}
          isLoading={orderMetricsLoading}
        />
      </div>
      <Divider />
      <AIButton />
    </div>
  );
}
