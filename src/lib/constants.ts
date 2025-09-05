// Default GraphQL endpoint
export const GRAPHQL_URL = 'https://rdhackathon-web-instacart-customers-stg.instacart.team/graphql';

// GraphQL endpoint configurations
export const GRAPHQL_ENDPOINTS = {
  hackathonStg: 'https://rdhackathon-web-instacart-customers-stg.instacart.team/graphql',
  local: 'http://localhost:3030/graphql',
  // Add more endpoints as needed
} as const;

export type GraphQLEndpoint = keyof typeof GRAPHQL_ENDPOINTS;
