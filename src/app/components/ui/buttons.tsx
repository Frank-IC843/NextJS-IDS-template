'use client';

import {
  PrimaryButton as IdsPrimaryButton,
  SecondaryButton as IdsSecondaryButton,
  TertiaryButton as IdsTertiaryButton,
  DetrimentalButton as IdsDetrimentalButton,
  PrimaryButtonSmall as IdsPrimaryButtonSmall,
} from '@instacart/ids-customers';
import { ComponentProps } from 'react';

type PrimaryButtonProps = ComponentProps<typeof IdsPrimaryButton>;
type SecondaryButtonProps = ComponentProps<typeof IdsSecondaryButton>;
type TertiaryButtonProps = ComponentProps<typeof IdsTertiaryButton>;
type DetrimentalButtonProps = ComponentProps<typeof IdsDetrimentalButton>;
type PrimaryButtonSmallProps = ComponentProps<typeof IdsPrimaryButtonSmall>;

export function PrimaryButton({ children, ...props }: PrimaryButtonProps) {
  return <IdsPrimaryButton {...props}>{children}</IdsPrimaryButton>;
}
export function SecondaryButton({ children, ...props }: SecondaryButtonProps) {
  return <IdsSecondaryButton {...props}>{children}</IdsSecondaryButton>;
}
export function TertiaryButton({ children, ...props }: TertiaryButtonProps) {
  return <IdsTertiaryButton {...props}>{children}</IdsTertiaryButton>;
}
export function DetrimentalButton({ children, ...props }: DetrimentalButtonProps) {
  return <IdsDetrimentalButton {...props}>{children}</IdsDetrimentalButton>;
}
export function PrimaryButtonSmall({ children, ...props }: PrimaryButtonSmallProps) {
  return <IdsPrimaryButtonSmall {...props}>{children}</IdsPrimaryButtonSmall>;
}
