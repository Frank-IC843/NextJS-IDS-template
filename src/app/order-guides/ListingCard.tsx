'use client';

import { OrderListingCard } from '@/app/order-guides/OrderListingCard';
import { ItemList } from '@/app/order-guides/ItemList';
import { OrderGuideFragment } from '@/__generated__/graphql-types';

type Props = {
  orderGuide: OrderGuideFragment;
};

export function ListingCard({ orderGuide }: Props) {
  const { name, retailerId, productIds, viewSection } = orderGuide;
  const card = viewSection?.card;
  const actions = card?.actions || [];
  const content = card?.content;

  const retailerIconImage = content?.retailerIconImage;
  const retailerIconBackgroundColorHexString = content?.retailerIconBackgroundColorHexString;
  const subtitleString = content?.subtitleString;
  const unavailableSummaryString = content?.unavailableSummaryString;
  const summaryString = content?.summaryString;

  // For simplicity, assuming all order guides are available
  const isAvailable = true;

  return (
    <OrderListingCard
      name={name}
      retailerIconImage={retailerIconImage}
      retailerIconBackgroundColorHexString={retailerIconBackgroundColorHexString}
      subtitleLine1={subtitleString}
      subtitleLine2={isAvailable ? summaryString : unavailableSummaryString}
      actions={isAvailable ? actions : []}
    >
      {isAvailable && productIds.length > 0 && <ItemList productIds={productIds} />}
    </OrderListingCard>
  );
}
