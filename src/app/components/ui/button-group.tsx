'use client';

import { PrimaryButton, SecondaryButton, TertiaryButton, DetrimentalButton } from '@instacart/ids-customers';

export function ButtonGroup() {
  return (
    <>
      <PrimaryButton css={{ maxWidth: 'fit-content' }}>Primary Button</PrimaryButton>
      <SecondaryButton css={{ maxWidth: 'fit-content' }}>Secondary Button</SecondaryButton>
      <TertiaryButton css={{ maxWidth: 'fit-content' }}>Tertiary Button</TertiaryButton>
      <DetrimentalButton css={{ maxWidth: 'fit-content' }}>Detrimental Button</DetrimentalButton>
    </>
  );
}
