/**
 * Examples of using Apollo Client with per-query endpoint configuration
 */

import { gql } from '@apollo/client';
import { getClient } from '@/lib/apollo-client';

// Example 1: Using the default endpoint (no context needed)
export async function queryWithDefaultEndpoint() {
  const client = await getClient();

  const result = await client.query({
    query: gql`
      query GetBusinessData {
        businessMonths {
          id
          startDate
        }
      }
    `,
  });

  return result;
}

// Example 2: Using the staging endpoint explicitly
export async function queryWithStagingEndpoint() {
  const client = await getClient();

  const result = await client.query({
    query: gql`
      query GetBusinessData {
        businessMonths {
          id
          startDate
        }
      }
    `,
    context: {
      endpoint: 'staging', // This will use the staging endpoint
    },
  });

  return result;
}

// Example 3: Using the production endpoint
export async function queryWithProductionEndpoint() {
  const client = await getClient();

  const result = await client.query({
    query: gql`
      query GetBusinessData {
        businessMonths {
          id
          startDate
        }
      }
    `,
    context: {
      endpoint: 'production', // This will use the production endpoint
    },
  });

  return result;
}

// Example 4: With useQuery hook in React components
// In your React component:
/*
import { useQuery } from '@apollo/client';
import { BUSINESS_MONTHS_QUERY } from '@/app/queries';

function MyComponent() {
  // Using default endpoint
  const { data: defaultData } = useQuery(BUSINESS_MONTHS_QUERY);
  
  // Using staging endpoint
  const { data: stagingData } = useQuery(BUSINESS_MONTHS_QUERY, {
    context: {
      endpoint: 'staging',
    },
  });
  
  // Using production endpoint
  const { data: prodData } = useQuery(BUSINESS_MONTHS_QUERY, {
    context: {
      endpoint: 'production',
    },
  });
  
  return (
    // Your component JSX
  );
}
*/

// Example 5: With useLazyQuery hook
/*
import { useLazyQuery } from '@apollo/client';
import { BUSINESS_ORDER_METRICS_QUERY } from '@/app/queries';

function MyComponent() {
  const [fetchMetrics] = useLazyQuery(BUSINESS_ORDER_METRICS_QUERY);
  
  const handleFetchFromProduction = async () => {
    const result = await fetchMetrics({
      variables: { startDate: '2024-01-01', endDate: '2024-01-31' },
      context: {
        endpoint: 'production', // Specify the endpoint
      },
    });
    
    console.log('Production data:', result.data);
  };
  
  return (
    // Your component JSX
  );
}
*/

// Example 6: With mutations
/*
import { useMutation } from '@apollo/client';
import { CREATE_USER_SESSION_FROM_CODE } from '@/app/queries';

function LoginComponent() {
  const [createSession] = useMutation(CREATE_USER_SESSION_FROM_CODE);
  
  const handleLogin = async (code: string) => {
    const result = await createSession({
      variables: {
        identifier: 'user@example.com',
        identifier_type: 'EMAIL',
        verification_code: code,
      },
      context: {
        endpoint: 'production', // Use production endpoint for authentication
      },
    });
    
    return result;
  };
  
  return (
    // Your component JSX
  );
}
*/
