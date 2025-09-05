import 'server-only';

import { tool } from 'ai';
import { z } from 'zod';
import { getClient } from '@/lib/apollo-client';
import { BusinessOrderMetricsQuery } from '@/__generated__/graphql-types';
import { BUSINESS_ORDER_METRICS_QUERY, CREATE_ORDER_GUIDE_MUTATION } from '@/app/queries';

// Lazy load demo data only when needed to avoid memory bloat
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let demoOrderSummaries: any = null;
async function getDemoOrderSummaries() {
  if (!demoOrderSummaries) {
    demoOrderSummaries = await import('../../../../tmp/business-order-summaries-2025-09-04T20-27-45-629Z.json');
  }
  return demoOrderSummaries;
}

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
   * Fetches business order metrics for analysis
   */
  getBusinessOrderMetrics: tool({
    description:
      'Fetch business order metrics including total spend, savings, orders placed and completed for a specific date range. ' +
      'Use this to analyze spending patterns, track cost savings, and monitor order completion rates.',

    inputSchema: z
      .object({
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
          .describe('Start date for the metrics period (format: YYYY-MM-DD)'),

        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
          .describe('End date for the metrics period (format: YYYY-MM-DD)'),
      })
      .describe('Date range parameters for fetching business order metrics'),

    execute: async (input, context) => {
      const { toolCallId } = context;

      console.log('[AI Tool] getBusinessOrderMetrics START', {
        toolCallId,
        input,
      });

      try {
        const client = getClient();

        const { data } = await client.query<BusinessOrderMetricsQuery>({
          query: BUSINESS_ORDER_METRICS_QUERY,
          variables: {
            startDate: input.startDate,
            endDate: input.endDate,
          },
          fetchPolicy: 'network-only',
        });

        const metrics = data?.businessOrderMetrics;

        if (metrics) {
          console.log('[AI Tool] getBusinessOrderMetrics SUCCESS', {
            toolCallId,
            ordersPlaced: metrics.ordersPlaced,
            ordersCompleted: metrics.ordersCompleted,
          });

          return {
            success: true,
            data: {
              startDate: metrics.startDate,
              endDate: metrics.endDate,
              ordersPlaced: metrics.ordersPlaced,
              ordersCompleted: metrics.ordersCompleted,
              totalSpendCents: metrics.totalSpendCents,
              totalSavingsCents: metrics.totalSavingsCents,
            },
          } satisfies ToolResult<{
            startDate: string;
            endDate: string;
            ordersPlaced: number;
            ordersCompleted: number;
            totalSpendCents: number;
            totalSavingsCents: number;
          }>;
        }

        return {
          success: false,
          error: 'No metrics data available for the specified date range',
        } satisfies ToolResult<never>;
      } catch (error) {
        console.error('[AI Tool] getBusinessOrderMetrics ERROR', {
          toolCallId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch order metrics',
        } satisfies ToolResult<never>;
      }
    },
  }),

  /**
   * Fetches detailed order summaries with pagination
   */
  getBusinessOrderSummaries: tool({
    description:
      'Fetch detailed business order summaries including items, costs, retailers, and member information. ' +
      'Use this to analyze individual orders, track spending by member, and review order details.',

    inputSchema: z
      .object({
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
          .describe('Start date for order summaries (format: YYYY-MM-DD)'),

        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
          .describe('End date for order summaries (format: YYYY-MM-DD)'),

        first: z.number().min(1).max(20).default(10).describe('Number of orders to fetch (default: 10, max: 20)'),

        orderBy: z
          .enum(['PlacedAtAsc', 'PlacedAtDesc'])
          .default('PlacedAtDesc')
          .optional()
          .describe('Sort order for results (default: most recent first)'),

        after: z.string().optional().describe('Cursor for pagination - use pageInfo.endCursor from previous query'),
      })
      .describe('Parameters for fetching business order summaries with pagination'),

    execute: async (input, context) => {
      const { toolCallId } = context;

      console.log('[AI Tool] getBusinessOrderSummaries START', {
        toolCallId,
        input,
      });

      try {
        // Always use the full demo data regardless of input dates
        // The demo data covers 2025-07-04 to 2025-09-04
        const demoData = await getDemoOrderSummaries();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const demoNodes = (demoData as any).result.nodes;

        // Apply pagination
        const startIndex = input.after ? parseInt(input.after, 10) : 0;
        const endIndex = startIndex + input.first;
        const paginatedNodes = demoNodes.slice(startIndex, endIndex);

        const connection = {
          nodes: paginatedNodes,
          pageInfo: {
            hasNextPage: endIndex < demoNodes.length,
            endCursor: endIndex < demoNodes.length ? String(endIndex) : null,
            hasPreviousPage: startIndex > 0,
            startCursor: startIndex > 0 ? String(startIndex) : null,
          },
        };

        if (connection?.nodes && connection.nodes.length > 0) {
          console.log('[AI Tool] getBusinessOrderSummaries SUCCESS', {
            toolCallId,
            orderCount: connection.nodes.length,
            hasMore: connection.pageInfo?.hasNextPage,
          });

          // COMPRESSED: Only aggregate essential data for order guide creation
          const productMap = new Map<
            string,
            {
              productId: string;
              name: string;
              retailerId: string;
              retailerName: string;
              price: string;
              orderCount: number;
            }
          >();
          const retailerMap = new Map<
            string,
            {
              name: string;
              orderCount: number;
              totalCents: number;
            }
          >();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          connection.nodes.forEach((order: any) => {
            const retailerId = order.orderSummary?.retailerId || '';
            const retailerName = order.orderSummary?.retailer?.name || 'Unknown';

            // Track retailer stats
            if (!retailerMap.has(retailerId)) {
              retailerMap.set(retailerId, { name: retailerName, orderCount: 0, totalCents: 0 });
            }
            const retailerData = retailerMap.get(retailerId);
            if (retailerData) {
              retailerData.orderCount++;
              retailerData.totalCents += order.orderSummary?.orderTotalCents || 0;
            }

            // Track product frequency
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            order.orderSummary?.orderItemCollection?.orderItems?.forEach((item: any) => {
              const productId = item.item?.id || item.currentItem?.id || '';
              const name = item.item?.name || item.currentItem?.name || '';
              const price =
                item.item?.viewSection?.customerPriceString || item.currentItem?.viewSection?.customerPriceString || '';

              if (productId && name) {
                const key = `${productId}_${retailerId}`;
                if (!productMap.has(key)) {
                  productMap.set(key, {
                    productId,
                    name: name.substring(0, 50), // Truncate long names
                    retailerId,
                    retailerName,
                    price,
                    orderCount: 0,
                  });
                }
                const productData = productMap.get(key);
                if (productData) {
                  productData.orderCount++;
                }
              }
            });
          });

          // Get top products by frequency
          const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 30); // Only top 30 products

          // Clear product map early to free memory
          productMap.clear();

          // Get top retailers
          const topRetailers = Array.from(retailerMap.entries())
            .map(([id, data]) => ({
              retailerId: id,
              name: data.name,
              orderCount: data.orderCount,
              totalSpend: `$${(data.totalCents / 100).toFixed(0)}`,
            }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 5);

          // Clear retailer map to free memory
          retailerMap.clear();

          return {
            success: true,
            data: {
              // Compressed format - only essential data
              topProducts, // Most frequently ordered items
              topRetailers, // Main retailers by order count
              summary: {
                dateRange: `${input.startDate} to ${input.endDate}`,
                totalOrders: connection.nodes.length,
                totalProducts: topProducts.length, // Use topProducts length instead of map size
              },
            },
          } satisfies ToolResult<{
            topProducts: Array<{
              productId: string;
              name: string;
              retailerId: string;
              retailerName: string;
              price: string;
              orderCount: number;
            }>;
            topRetailers: Array<{
              retailerId: string;
              name: string;
              orderCount: number;
              totalSpend: string;
            }>;
            summary: {
              dateRange: string;
              totalOrders: number;
              totalProducts: number;
            };
          }>;
        }

        return {
          success: false,
          error: 'No order summaries found for the specified date range',
        } satisfies ToolResult<never>;
      } catch (error) {
        console.error('[AI Tool] getBusinessOrderSummaries ERROR', {
          toolCallId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch order summaries',
        } satisfies ToolResult<never>;
      }
    },
  }),

  /**
   * Creates an order guide with specified products
   */
  createOrderGuide: tool({
    description:
      'Create an order guide with specified products. Use this ONLY after the user has confirmed they want to create the order guide.',

    inputSchema: z
      .object({
        name: z.string().describe('Name of the order guide'),

        retailerId: z.string().describe('Retailer ID for the order guide (e.g., "5" for Costco)'),

        description: z.string().optional().describe('Description of what the guide contains'),

        productIds: z.array(z.string()).describe('Array of product IDs to include in the guide'),
      })
      .describe('Parameters for creating an order guide'),

    execute: async ({ name, retailerId, description, productIds }) => {
      try {
        // Import the mutation here to avoid circular dependencies
        const client = getClient();

        const { data } = await client.mutate({
          mutation: CREATE_ORDER_GUIDE_MUTATION,
          variables: {
            name,
            retailerId,
            description,
            productIds,
          },
        });

        const result = data?.createBusinessOrderGuide;

        if (result?.__typename === 'BusinessCreateOrderGuideSuccessResponse') {
          return {
            success: true,
            data: {
              orderGuideId: result.orderGuideId,
              name,
              retailerId,
              description,
              message: `✅ Order guide "${name}" has been created successfully!`,
            },
          } satisfies ToolResult<{
            orderGuideId: string;
            name: string;
            retailerId: string;
            description?: string;
            message: string;
          }>;
        } else if (result?.__typename === 'BusinessCreateOrderGuideError') {
          return {
            success: false,
            error: `Failed to create order guide: ${result.errorType}`,
            errorType: result.errorType,
          } satisfies ToolResult<never>;
        } else {
          return {
            success: false,
            error: 'Unexpected response from server',
          } satisfies ToolResult<never>;
        }
      } catch (error) {
        console.error('Error creating order guide:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create order guide',
        } satisfies ToolResult<never>;
      }
    },
  }),
};
