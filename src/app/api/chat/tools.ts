import 'server-only';

import { tool } from 'ai';
import { z } from 'zod';
import { getClient } from '@/lib/apollo-client';
import { CREATE_ORDER_GUIDE_MUTATION } from '@/app/queries';
import type { CreateOrderGuideMutation } from '@/__generated__/graphql-types';

/**
 * Type-safe result types for tool responses
 */
type ToolSuccessResult<T> = {
  success: true;
  data: T;
};

type ToolErrorResult = {
  success: false;
  error: string;
  errorType?: string;
};

type ToolResult<T> = ToolSuccessResult<T> | ToolErrorResult;

/**
 * AI SDK tools for business operations via GraphQL.
 * Follows Vercel AI SDK best practices for tool implementation.
 */
export const tools = {
  /**
   * Creates a new business order guide with specified products
   */
  createBusinessOrderGuide: tool({
    description:
      'Create a new business order guide to organize and save frequently ordered products from a specific retailer. ' +
      'Order guides help streamline reordering by grouping products together.',

    inputSchema: z
      .object({
        name: z
          .string()
          .min(1, 'Name is required')
          .max(100, 'Name must be 100 characters or less')
          .describe('The name of the order guide (e.g., "Weekly Essentials", "Office Supplies")'),

        retailerId: z
          .string()
          .min(1, 'Retailer ID is required')
          .describe('The ID of the retailer this order guide is for'),

        description: z
          .string()
          .max(500, 'Description must be 500 characters or less')
          .optional()
          .describe('Optional description of what this order guide is for'),

        imageUrl: z
          .string()
          .url('Must be a valid URL')
          .optional()
          .describe('Optional URL to an image representing this order guide'),

        productIds: z
          .array(z.string())
          .optional()
          .describe('Optional array of product IDs to include in this order guide'),
      })
      .describe('Parameters for creating a new business order guide'),

    execute: async (input, context) => {
      const { toolCallId } = context;

      console.log('[AI Tool] createBusinessOrderGuide START', {
        toolCallId,
        input: {
          ...input,
          productCount: input.productIds?.length ?? 0,
        },
      });

      try {
        const client = getClient();

        // Execute the GraphQL mutation
        const { data } = await client.mutate<CreateOrderGuideMutation>({
          mutation: CREATE_ORDER_GUIDE_MUTATION,
          variables: {
            name: input.name,
            retailerId: input.retailerId,
            description: input.description,
            imageUrl: input.imageUrl,
            productIds: input.productIds,
          },
        });

        const result = data?.createBusinessOrderGuide;

        // Handle the discriminated union response
        if (result && '__typename' in result) {
          if (result.__typename === 'BusinessCreateOrderGuideSuccessResponse') {
            console.log('[AI Tool] createBusinessOrderGuide SUCCESS', {
              toolCallId,
              orderGuideId: result.orderGuideId,
            });

            return {
              success: true,
              data: {
                orderGuideId: result.orderGuideId,
                name: input.name,
                retailerId: input.retailerId,
                description: input.description,
                productCount: input.productIds?.length ?? 0,
              },
            } satisfies ToolResult<{
              orderGuideId: string;
              name: string;
              retailerId: string;
              description?: string;
              productCount: number;
            }>;
          }

          if (result.__typename === 'BusinessCreateOrderGuideError') {
            console.error('[AI Tool] createBusinessOrderGuide BUSINESS_ERROR', {
              toolCallId,
              errorType: result.errorType,
            });

            return {
              success: false,
              error: `Failed to create order guide: ${result.errorType}`,
              errorType: result.errorType,
            } satisfies ToolResult<never>;
          }
        }

        // Unexpected response format
        console.error('[AI Tool] createBusinessOrderGuide UNEXPECTED_RESPONSE', {
          toolCallId,
          result,
        });

        return {
          success: false,
          error: 'Unexpected response format from server',
        } satisfies ToolResult<never>;
      } catch (error) {
        console.error('[AI Tool] createBusinessOrderGuide ERROR', {
          toolCallId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        // Parse GraphQL errors if available
        let errorMessage = 'Failed to create order guide';
        if (error instanceof Error) {
          errorMessage = error.message;

          // Check for network errors
          if (error.message.includes('Network error')) {
            errorMessage = 'Network error: Unable to reach the server';
          }

          // Check for GraphQL validation errors
          if (error.message.includes('GraphQL error')) {
            errorMessage = `Validation error: ${error.message}`;
          }
        }

        return {
          success: false,
          error: errorMessage,
        } satisfies ToolResult<never>;
      }
    },
  }),
};
