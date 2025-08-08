import { gql, useQuery, useSuspenseQuery } from '@apollo/client';
import { GetAllLinkedUserAccountsQuery } from '@/__generated__/graphql-types';

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

export const GET_ALL_LINKED_USER_ACCOUNTS = gql`
  query GetAllLinkedUserAccounts {
    getAllLinkedUserAccounts {
      id
      linkedUserAccounts {
        accountId
        accountType
        id
        userId
        viewSection {
          accountTypeDescriptionString
          accountTypeIconImage {
            altText
            templateUrl
          }
          accountTypeLabelString
          accountTypeLoadingBackgroundColorString
          accountTypeLoadingImage {
            altText
            templateUrl
          }
          accountTypeEmailString
          showLogoVariant
        }
        businessOrganizationOptional {
          id
          name
          businessCategory
        }
      }
    }
  }
`;

export const useGetAllLinkedUserAccounts = () => {
  return useQuery<GetAllLinkedUserAccountsQuery>(GET_ALL_LINKED_USER_ACCOUNTS);
};

// Suspense version - this is the hook you want to use with Suspense
export const useSuspenseGetAllLinkedUserAccounts = () => {
  return useSuspenseQuery<GetAllLinkedUserAccountsQuery>(GET_ALL_LINKED_USER_ACCOUNTS);
};
