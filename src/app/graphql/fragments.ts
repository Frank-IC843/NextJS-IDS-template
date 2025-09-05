import { gql } from '@apollo/client';

export const ITEM_FRAGMENT = gql`
  fragment Item on OrdersItem {
    basketProduct {
      id
      imageUrl
    }
    id
    name
    viewSection {
      primaryImage {
        url
      }
    }
  }
`;

export const MEMBER_FRAGMENT = gql`
  fragment Member on BusinessBusinessMember {
    id
    userId
    userInfo {
      email
      firstName
      fullName
      lastName
    }
    availableMemberOperations {
      operations
    }
  }
`;

const ORDER_ITEM_COLLECTION_FRAGMENT = gql`
  fragment OrderItemCollection on OrdersOrderItemCollection {
    orderItems {
      certifiedDelivery
      currentItem {
        ...Item
      }
      customerAddedToOrder
      item {
        ...Item
      }
      legacyObfuscatedId
      pickedQuantityValue
      selectedQuantityType
      selectedQuantityValue
    }
  }
  ${ITEM_FRAGMENT}
`

export const ORDER_SUMMARY_FRAGMENT = gql`
  fragment OrderSummary on BusinessOrderSummary {
    itemCount
    orderPlacedAtUtc
    orderTotalCents
    orderItemCollection {
      ...OrderItemCollection
    }
    retailer {
      id
      name
      logoImage {
        templateUrl
      }
    }
    retailerId
    viewSection {
      itemCountString
      numberItemsString
      placedAtString
      statusColor
      statusString
      totalString
      viewOrderDetailsAccessibleLabelString
      orderDetailsModal {
        closeButtonLabelString
        emptyValuePlaceholderString
        headerString
        storeString
      }
    }
  }
  ${ORDER_ITEM_COLLECTION_FRAGMENT}
`;

export const ORDER_SUMMARY_WITH_MEMBER_FRAGMENT = gql`
  fragment OrderSummaryWithMember on BusinessBusinessOrderSummaryWithMember {
    id
    businessMember {
      ...Member
    }
    orderSummary {
      ...OrderSummary
    }
  }
  ${MEMBER_FRAGMENT}
  ${ORDER_SUMMARY_FRAGMENT}
`;


