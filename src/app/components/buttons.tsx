"use client";

import {
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
} from "@instacart/ids-customers";

export function Buttons() {
  return (
    <div css={{ display: "flex", gap: "10px" }}>
      <PrimaryButton>PrimaryButton</PrimaryButton>
      <SecondaryButton>SecondaryButton</SecondaryButton>
      <TertiaryButton>TertiaryButton</TertiaryButton>
    </div>
  );
}
