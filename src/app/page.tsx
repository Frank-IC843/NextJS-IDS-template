"use client";
import {
  StoreRow,
  StoreRowAnchor,
  StoreCardImage,
  StoreCardCenter,
  StoreCardTag,
  StoreCardTitle,
  StoreCardETA,
  StoreCardCenterFooter,
  StoreCardAttributes,
  StoreCardRight,
  StoreRowChevron,
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
} from "@instacart/ids-customers";
import { useRef } from "react";
import Image from "next/image";

export default function Home() {
  const initialFocusElem = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  return (
    <div>
      <StoreRow ref={initialFocusElem}>
        <StoreRowAnchor href="#" ref={anchorRef}>
          <StoreCardImage>
            <Image
              src="https://d2d8wwwkmhfcva.cloudfront.net/72x/d2lnr5mha7bycj.cloudfront.net/warehouse/logo/279/0d43b5d2-9d07-4a30-a0ee-0e16d5922411.png"
              alt="Sprouts Farmers Market"
              width="60"
              height="60"
              role="presentation"
            />
          </StoreCardImage>
          <StoreCardCenter>
            <StoreCardTag>NEW</StoreCardTag>
            <StoreCardTitle>Sprouts Farmers Markets</StoreCardTitle>
            <StoreCardETA>Delivery by 1:35 PM</StoreCardETA>
            <StoreCardCenterFooter>
              <StoreCardAttributes>In-store Prices</StoreCardAttributes>
              <StoreCardAttributes>Pickup 3.8mi</StoreCardAttributes>
            </StoreCardCenterFooter>
          </StoreCardCenter>
          <StoreCardRight>
            <StoreRowChevron />
          </StoreCardRight>
        </StoreRowAnchor>
      </StoreRow>
      <PrimaryButton>Test</PrimaryButton>
      <SecondaryButton>Test</SecondaryButton>
      <TertiaryButton>Test</TertiaryButton>
    </div>
  );
}
