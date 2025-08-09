import { Suspense } from 'react';
import { MetricCard } from '@/app/dashboard/metric-card';
import { MetricLoading } from './metric-loading';

const useStyles = () => {
  return {
    cardsContainer: {
      display: 'flex',
      gap: '16px',
      marginTop: '8px',
    },
    cardLoading: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
  } as const;
};

export function OrderMetrics({ startDate, endDate }: { startDate: string; endDate: string }) {
  const styles = useStyles();

  return (
    <div css={styles.cardsContainer}>
      <Suspense fallback={<MetricLoading />}>
        <MetricCard startDate={startDate} endDate={endDate} cardVariant="ordersCompleted" />
      </Suspense>
      <Suspense fallback={<MetricLoading />}>
        <MetricCard startDate={startDate} endDate={endDate} cardVariant="totalSpendCents" />
      </Suspense>
    </div>
  );
}
