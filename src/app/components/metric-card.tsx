'use client';

import { Text, Tooltip, LoadingLockupTextBase } from '@instacart/ids-customers';
import { useTheme, InformationIcon } from '@instacart/ids-core';

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
  title?: string;
  value?: string;
  tooltipText?: string;
  isLoading?: boolean;
}

export function MetricCard({ title, value, tooltipText, isLoading }: MetricCardProps) {
  const styles = useStyles();

  const loadingContent = (
    <div css={styles.cardLoading}>
      <LoadingLockupTextBase />
      <LoadingLockupTextBase styles={{ container: { width: '60%' } }} />
    </div>
  );

  const cardContent = (
    <>
      <div css={styles.cardHeader}>
        <Text typography="bodyLarge2" color="systemGrayscale50">
          {title}
        </Text>
        {tooltipText && (
          <Tooltip title={tooltipText}>
            <InformationIcon color="systemGrayscale30" />
          </Tooltip>
        )}
      </div>
      <Text typography="titleMedium">{value}</Text>
    </>
  );

  return <div css={styles.card}>{isLoading ? loadingContent : cardContent}</div>;
}
