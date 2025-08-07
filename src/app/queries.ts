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
