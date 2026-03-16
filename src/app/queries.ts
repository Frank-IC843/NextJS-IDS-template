import { gql } from '@apollo/client';

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
