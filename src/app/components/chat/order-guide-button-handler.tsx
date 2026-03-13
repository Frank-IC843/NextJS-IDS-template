'use client';

import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ORDER_GUIDE_MUTATION, ORDER_GUIDES_CONNECTION_QUERY } from '@/app/queries';
import type { CreateOrderGuideMutation } from '@/__generated__/graphql-types';

interface OrderGuideData {
  name: string;
  retailerId: string;
  description?: string;
  productIds?: string[];
}

interface UseCreateOrderGuideResult {
  createOrderGuide: (data: OrderGuideData) => Promise<void>;
  loading: boolean;
  error: Error | undefined;
}

/**
 * Hook for creating order guides from chat suggestions
 * Returns a handler function that can be called with order guide data
 */
export function useCreateOrderGuide(): UseCreateOrderGuideResult {
  const [createOrderGuideMutation, { loading, error }] = useMutation<CreateOrderGuideMutation>(
    CREATE_ORDER_GUIDE_MUTATION,
    {
      refetchQueries: [{ query: ORDER_GUIDES_CONNECTION_QUERY }],
      onCompleted: data => {
        const result = data?.createBusinessOrderGuide;
        if (result?.__typename === 'BusinessCreateOrderGuideSuccessResponse') {
          console.log('✅ Order guide created successfully!', result.orderGuideId);
          // You can add toast notification here
        }
      },
      onError: error => {
        console.error('❌ Failed to create order guide:', error);
        // You can add error toast here
      },
    }
  );

  const createOrderGuide = useCallback(
    async (data: OrderGuideData) => {
      try {
        await createOrderGuideMutation({
          variables: {
            name: data.name,
            retailerId: data.retailerId,
            description: data.description,
            productIds: data.productIds,
          },
        });
      } catch (err) {
        // Error is already handled by onError callback
        console.error('Create order guide error:', err);
      }
    },
    [createOrderGuideMutation]
  );

  return {
    createOrderGuide,
    loading,
    error,
  };
}
