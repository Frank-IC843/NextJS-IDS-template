'use client';

import { OrderListingCard } from '@/app/order-guides/OrderListingCard';
import { ItemList } from '@/app/order-guides/ItemList';
import { OrderGuideFragment } from '@/__generated__/graphql-types';
import { useMutation } from '@apollo/client';
import { DELETE_ORDER_GUIDE_MUTATION, ORDER_GUIDES_CONNECTION_QUERY } from '@/app/queries';
import {
  useModalState,
  ModalAutosize,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  Text,
  ModalContent,
  SecondaryButton,
  DetrimentalButton,
} from '@instacart/ids-customers';
import { useRouter } from 'next/navigation';

type Props = {
  orderGuide: OrderGuideFragment;
};

export function ListingCard({ orderGuide }: Props) {
  const { id, name, productIds, viewSection } = orderGuide;
  const card = viewSection?.card;
  const actions = card?.actions || [];
  const content = card?.content;
  const deleteModal = useModalState();
  const router = useRouter();
  const retailerIconImage = content?.retailerIconImage;
  const retailerIconBackgroundColorHexString = content?.retailerIconBackgroundColorHexString;
  const subtitleString = content?.subtitleString;
  const unavailableSummaryString = content?.unavailableSummaryString;
  const summaryString = content?.summaryString;

  // For simplicity, assuming all order guides are available
  const isAvailable = true;

  const [deleteOrderGuide, { loading }] = useMutation(DELETE_ORDER_GUIDE_MUTATION, {
    refetchQueries: [{ query: ORDER_GUIDES_CONNECTION_QUERY }],
    onCompleted: () => {
      deleteModal.hide();
      router.refresh();
    },
  });

  const handleDelete = async () => {
    await deleteOrderGuide({ variables: { orderGuideId: id } });
  };

  return (
    <>
      <OrderListingCard
        name={name}
        retailerIconImage={retailerIconImage}
        retailerIconBackgroundColorHexString={retailerIconBackgroundColorHexString}
        subtitleLine1={subtitleString}
        subtitleLine2={isAvailable ? summaryString : unavailableSummaryString}
        actions={isAvailable ? actions : []}
        onDelete={deleteModal.show}
      >
        {/* {isAvailable && productIds.length > 0 && <ItemList productIds={productIds} />} */}
      </OrderListingCard>

      <ModalAutosize modal={deleteModal}>
        <ModalHeader hide={deleteModal.hide} accessibleLabels={{ close: 'Close' }}>
          <ModalTitle>
            <Text typography="titleLarge">Delete order guide?</Text>
          </ModalTitle>
        </ModalHeader>
        <ModalContent>
          <Text typography="titleMedium" css={{ textAlign: 'center' }}>
            Are you sure you want to delete &ldquo;{name}&rdquo;? This action cannot be undone.
          </Text>
        </ModalContent>
        <ModalFooter styles={{ footer: { display: 'flex', gap: '12px', flexDirection: 'column' } }}>
          <DetrimentalButton onPress={handleDelete} loading={loading} disabled={loading}>
            Delete
          </DetrimentalButton>
          <SecondaryButton>Cancel</SecondaryButton>
        </ModalFooter>
      </ModalAutosize>
    </>
  );
}
