'use client';

import { Text, ButtonBase, Divider } from '@instacart/ids-customers';
import { useTheme } from '@instacart/ids-core';
import { useState } from 'react';
import { BusinessMonthsQuery } from '@/__generated__/graphql-types';
import { OrderMetrics } from './order-metrics';
import { MonthSelector } from './month-selector';

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
  } as const;
};

interface DashboardContentProps {
  businessMonthsData: BusinessMonthsQuery;
}

export function DashboardContent({ businessMonthsData: { businessMonths } }: DashboardContentProps) {
  const styles = useStyles();
  const [selectedMonth, setSelectedMonth] = useState(businessMonths[0]);

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <Text typography="headline">Dashboard</Text>
        <ButtonBase css={styles.linkButton}>Export</ButtonBase>
      </div>
      <div css={styles.selectContainer}>
        <MonthSelector
          businessMonths={businessMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          styles={styles.selectStyles}
        />
      </div>
      <OrderMetrics startDate={selectedMonth.startDate ?? ''} endDate={selectedMonth.endDate ?? ''} />
      <Divider />
    </div>
  );
}
