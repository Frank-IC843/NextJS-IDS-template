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
      viewSection {
        orderMetricCards {
          id
          cardVariant
          displayVariant
          titleString
          valueString
          tooltipDisplayVariant
          tooltipIconVariant
          tooltipTextString
        }
      }
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
