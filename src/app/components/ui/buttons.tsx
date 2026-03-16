'use client';

import { PrimaryButtonSmall as IdsPrimaryButtonSmall } from '@instacart/ids-customers';
import { ComponentProps } from 'react';

type PrimaryButtonSmallProps = ComponentProps<typeof IdsPrimaryButtonSmall>;

export function PrimaryButtonSmall({ children, ...props }: PrimaryButtonSmallProps) {
  return <IdsPrimaryButtonSmall {...props}>{children}</IdsPrimaryButtonSmall>;
}
