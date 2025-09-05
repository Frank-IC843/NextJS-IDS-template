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

/**
 * Helper function to handle button clicks from chat messages
 * This can be used directly in onClick handlers or DOM events
 */
export function createOrderGuideFromButton(
  event: MouseEvent | React.MouseEvent<HTMLButtonElement>,
  handler: (data: OrderGuideData) => Promise<void>
) {
  const target = event.target as HTMLButtonElement;

  // Extract data from button attributes
  const name = target.dataset.name;
  const retailerId = target.dataset.retailerId;
  const description = target.dataset.description;
  const productIdsJson = target.dataset.productIds;

  if (!name || !retailerId) {
    console.error('Missing required data for order guide creation');
    return;
  }

  // Parse product IDs
  let productIds: string[] | undefined;
  if (productIdsJson) {
    try {
      productIds = JSON.parse(productIdsJson);
    } catch (error) {
      console.error('Failed to parse product IDs:', error);
    }
  }

  // Update button state
  const originalText = target.textContent;
  target.disabled = true;
  target.textContent = '⏳ Creating...';

  // Call handler
  handler({ name, retailerId, description, productIds })
    .then(() => {
      target.textContent = '✅ Created!';
      target.style.backgroundColor = '#4CAF50';
    })
    .catch(() => {
      target.disabled = false;
      target.textContent = '❌ Failed - Try Again';
      target.style.backgroundColor = '#f44336';

      // Reset after 3 seconds
      setTimeout(() => {
        target.textContent = originalText;
        target.style.backgroundColor = '#4CAF50';
      }, 3000);
    });
}
