'use client';

import { Text, Tooltip } from '@instacart/ids-customers';
import { useTheme, InformationIcon } from '@instacart/ids-core';
import { useSuspenseBusinessOrderMetrics } from '@/app/queries';

const useStyles = () => {
  const theme = useTheme();
  return {
    card: {
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: '8px',
      flex: 1,
      maxWidth: '403px',
      padding: '16px',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      marginBottom: '12px',
    },
    cardLoading: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
  } as const;
};

interface MetricCardProps {
  startDate: string;
  endDate: string;
  cardVariant: string;
}

export function MetricCard({ startDate, endDate, cardVariant }: MetricCardProps) {
  const styles = useStyles();
  const { orderMetricCards } =
    useSuspenseBusinessOrderMetrics(startDate, endDate).data?.businessOrderMetrics.viewSection ?? {};
  const card = orderMetricCards?.find(card => card.cardVariant === cardVariant);

  return (
    <div css={styles.card}>
      <div css={styles.cardHeader}>
        <Text typography="bodyLarge2" color="systemGrayscale50">
          {card?.titleString}
        </Text>
        {card?.tooltipTextString && (
          <Tooltip title={card.tooltipTextString}>
            <InformationIcon color="systemGrayscale30" />
          </Tooltip>
        )}
      </div>
      <Text typography="titleMedium">{card?.valueString}</Text>
    </div>
  );
}
