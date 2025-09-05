import { gql, useQuery, useSuspenseQuery } from '@apollo/client';
import { BusinessOrderMetricsQuery } from '@/__generated__/graphql-types';

export const CREATE_USER_SESSION_FROM_CODE = gql`
  mutation CreateUserSessionFromVerificationCode(
    $identifier: String!
    $identifier_type: UsersIdentityType!
    $verification_code: String!
    $accountType: UsersAccountTypes
    $linkUserAccounts: Boolean
  ) {
    createUserSessionFromVerificationCode(
      identifier: $identifier
      identifierType: $identifier_type
      verificationCode: $verification_code
      accountType: $accountType
      linkUserAccounts: $linkUserAccounts
    ) {
      ... on UsersAuthToken {
        token
        expires
      }
      ... on SharedError {
        errorTypes
      }
    }
  }
`;

export const BUSINESS_MONTHS_QUERY = gql`
  query BusinessMonths {
    businessMonths {
      id
      startDate
      endDate
      viewSection {
        labelString
      }
    }
  }
`;

export const BUSINESS_ORDER_METRICS_QUERY = gql`
  query BusinessOrderMetrics($startDate: String!, $endDate: String!) {
    businessOrderMetrics(startDate: $startDate, endDate: $endDate) {
      startDate
      endDate
      ordersPlaced
      ordersCompleted
      totalSpendCents
      totalSavingsCents
    }
  }
`;

export const BUSINESS_ORDER_SUMMARIES_CONNECTION_QUERY = gql`
  query BusinessOrderSummariesConnection(
    $orderBy: BusinessOrderSummaryOrderBy
    $startDate: ISO8601Date!
    $endDate: ISO8601Date!
    $first: Int!
    $after: String
  ) {
    businessOrderSummariesConnection(
      orderBy: $orderBy
      startDate: $startDate
      endDate: $endDate
      first: $first
      after: $after
    ) {
      nodes {
        id
        businessMember {
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
        orderSummary {
          itemCount
          orderPlacedAtUtc
          orderTotalCents
          orderItemCollection {
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
          retailer {
            id
            name
            slug
            logoImage {
              templateUrl
            }
          }
          retailerId
          retailerLocationId
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }

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
      customerPriceString
    }
  }
`;

const ORDER_GUIDE_FRAGMENT = gql`
  fragment OrderGuide on BusinessOrderGuide {
    id
    description
    imageUrl
    name
    productIds
    retailerId
    viewSection {
      card {
        actions {
          ctaColor
          ctaString
          navigateToUrlCtaAction {
            openInNewTab
            url
          }
        }
        content {
          retailerIconImage {
            templateUrl
            altText
          }
          retailerIconBackgroundColorHexString
          subtitleString
          summaryString
          unavailableSummaryString
        }
        trackingProperties
      }
    }
  }
`;

export const ORDER_GUIDES_CONNECTION_QUERY = gql`
  query OrderGuidesConnection(
    $orderBy: BusinessOrderGuidesOrderBy
    $filters: BusinessOrderGuidesFilters
    $after: String
    $first: Int
  ) {
    businessOrderGuidesConnection(orderBy: $orderBy, filters: $filters, after: $after, first: $first) {
      nodes {
        ...OrderGuide
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
  ${ORDER_GUIDE_FRAGMENT}
`;

export const CREATE_ORDER_GUIDE_MUTATION = gql`
  mutation CreateOrderGuide(
    $name: String!
    $retailerId: ID!
    $description: String
    $imageUrl: String
    $productIds: [ID!]
  ) {
    createBusinessOrderGuide(
      name: $name
      retailerId: $retailerId
      description: $description
      imageUrl: $imageUrl
      productIds: $productIds
    ) {
      ... on BusinessCreateOrderGuideSuccessResponse {
        orderGuideId
      }
      ... on BusinessCreateOrderGuideError {
        errorType
      }
    }
  }
`;

export const DELETE_ORDER_GUIDE_MUTATION = gql`
  mutation DeleteOrderGuide($orderGuideId: ID!) {
    deleteBusinessOrderGuide(orderGuideId: $orderGuideId) {
      ... on BusinessDeleteOrderGuideSuccessResponse {
        id
      }
      ... on BusinessDeleteOrderGuideError {
        errorType
      }
    }
  }
`;

const USER_LOCATION_FRAGMENT = gql`
  fragment UserLocationFields on UsersUserLocation {
    addressId
    zoneId
    postalCode
    coordinates {
      latitude
      longitude
    }
    viewSection {
      trackingProperties
      shoppingInString
    }
    zone {
      timeZoneName
    }
  }
`;

export const GET_LAST_USER_LOCATION = gql`
  query GetLastUserLocation {
    lastUserLocation {
      ...UserLocationFields
    }
  }
  ${USER_LOCATION_FRAGMENT}
`;

export const SHOP_ITEMS_QUERY = gql`
  query ShopItems($productIds: [ID!]!, $shopId: ID!) {
    shopItems(productIds: $productIds, shopId: $shopId) {
      id
      productId
    }
  }
`;

export const useGetBusinessOrderMetrics = (startDate?: string | null, endDate?: string | null) => {
  return useQuery<BusinessOrderMetricsQuery>(BUSINESS_ORDER_METRICS_QUERY, {
    variables: { startDate, endDate },
    skip: !startDate || !endDate,
  });
};

export const useSuspenseBusinessOrderMetrics = (startDate: string, endDate: string) => {
  return useSuspenseQuery<BusinessOrderMetricsQuery>(BUSINESS_ORDER_METRICS_QUERY, {
    variables: { startDate, endDate },
  });
};
