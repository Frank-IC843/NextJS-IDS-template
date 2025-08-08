'use client';

import {
  Text,
  ButtonBase,
  Select,
  SelectButton,
  SelectButtonValue,
  SelectOptions,
  SelectOption,
  Tooltip,
  Divider,
} from '@instacart/ids-customers';
import { useTheme, InformationIcon } from '@instacart/ids-core';
import { useState } from 'react';
import { GetAllLinkedUserAccountsQuery } from '@/__generated__/graphql-types';

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
  } as const;
};

const monthOptions = [
  'This Month (August)',
  'July (2025)',
  'June (2025)',
  'May (2025)',
  'April (2025)',
  'March (2025)',
  'February (2025)',
  'January (2025)',
  'December (2024)',
  'November (2024)',
  'October (2024)',
  'September (2024)',
];

interface DashboardClientProps {
  userData: GetAllLinkedUserAccountsQuery;
}

export function DashboardClient({ userData }: DashboardClientProps) {
  const styles = useStyles();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  console.log(userData);

  return (
    <div css={styles.container}>
      <div css={styles.header}>
        <Text typography="headline">Dashboard</Text>
        <ButtonBase css={styles.linkButton}>Export</ButtonBase>
      </div>
      <div css={styles.selectContainer}>
        <Select selectedValue={selectedMonth} styles={styles.selectStyles}>
          <SelectButton>
            <SelectButtonValue>{selectedMonth}</SelectButtonValue>
          </SelectButton>
          <SelectOptions alignment="left">
            {monthOptions.map(month => (
              <SelectOption value={month} key={month} onClick={() => setSelectedMonth(month)}>
                {month}
              </SelectOption>
            ))}
          </SelectOptions>
        </Select>
      </div>
      <div css={styles.cardsContainer}>
        <div css={styles.card}>
          <div css={styles.cardHeader}>
            <Text typography="bodyLarge2" color="systemGrayscale50">
              Orders Completed
            </Text>
          </div>
          <Text typography="titleMedium">0</Text>
        </div>

        <div css={styles.card}>
          <div css={styles.cardHeader}>
            <Text typography="bodyLarge2" color="systemGrayscale50">
              Total Spend
            </Text>
            <Tooltip title="Total amount of money spent during the selected time period by all members across USD and CAD. We'll split this out shortly.">
              <InformationIcon color="systemGrayscale30" />
            </Tooltip>
          </div>
          <Text typography="titleMedium">$0.00</Text>
        </div>
      </div>
      <Divider />
    </div>
  );
}
