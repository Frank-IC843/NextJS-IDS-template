import { gql } from '@apollo/client'
export const CREATE_OR_UPDATE_BUSINESS_DASHBOARD_MUTATION = gql`
  mutation CreateOrUpdateBusinessDashboard($layout: JSON!) {
    createOrUpdateBusinessDashboard(layout: $layout) {
      id
      businessId
      layout
      updatedAt
    }
  }
`
export const BUSINESS_ANALYTICS_QUERY = gql`
  query BusinessAnalyticsQuery($input: BusinessAnalyticsQueryInput!) {
    businessAnalyticsQuery(input: $input) {
      columns {
        key
        label
        dataType
      }
      rows
    }
  }
`
export const BUSINESS_DASHBOARD_QUERY = gql`
  query BusinessDashboard {
    businessDashboard {
      id
      businessId
      layout
      updatedAt
    }
  }
`