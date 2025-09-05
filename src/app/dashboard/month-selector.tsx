'use client';

import { useState, useEffect, ComponentProps } from 'react';
import { Select, SelectButton, SelectButtonValue, SelectOptions, SelectOption } from '@instacart/ids-customers';
import { BusinessMonthsQuery } from '@/__generated__/graphql-types';

interface MonthSelectorProps {
  businessMonths: BusinessMonthsQuery['businessMonths'];
  selectedMonth: BusinessMonthsQuery['businessMonths'][0];
  onMonthChange: (month: BusinessMonthsQuery['businessMonths'][0]) => void;
  styles?: ComponentProps<typeof Select>['styles'];
}

export function MonthSelector({ businessMonths, selectedMonth, onMonthChange, styles }: MonthSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div style={{ height: '40px', width: '268px' }}>
        {/* Placeholder with same dimensions to prevent layout shift */}
      </div>
    );
  }

  const selectedMonthLabel = selectedMonth.viewSection.labelString;

  return (
    <Select selectedValue={selectedMonthLabel} styles={styles}>
      <SelectButton>
        <SelectButtonValue>{selectedMonthLabel}</SelectButtonValue>
      </SelectButton>
      <SelectOptions alignment="left">
        {businessMonths.map(month => (
          <SelectOption
            value={month.viewSection.labelString}
            key={month.viewSection.labelString}
            onClick={() => onMonthChange(month)}
          >
            {month.viewSection.labelString}
          </SelectOption>
        ))}
      </SelectOptions>
    </Select>
  );
}
