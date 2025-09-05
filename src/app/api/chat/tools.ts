import 'server-only';

import { tool } from 'ai';
import { z } from 'zod';
import { getClient } from '@/lib/apollo-client';
import {
  BUSINESS_MONTHS_QUERY,
  BUSINESS_ORDER_METRICS_QUERY,
  BUSINESS_ORDER_SUMMARIES_CONNECTION_QUERY,
} from '@/app/queries';
import { BusinessOrderSummaryOrderBy } from '@/__generated__/graphql-types';
import { readFile } from 'fs/promises';

/**
 * Tools exposed to the LLM for fetching business data via GraphQL.
 * These wrap Apollo Client calls so the model can request data on demand.
 */
export const graphqlTools = {
  // businessMonths: tool({
  //   description:
  //     'Fetch available business months in the past 12 months and their display labels for reporting.',
  //   inputSchema: z.object({}).describe('No parameters required.'),
  //   execute: async (_input, { toolCallId }) => {
  //     console.log('[AI Tool] businessMonths START', { toolCallId });
  //     try {
  //       const client = getClient();
  //       const { data } = await client.query({
  //         query: BUSINESS_MONTHS_QUERY,
  //         fetchPolicy: 'no-cache',
  //       });
  //       const result = data?.businessMonths ?? [];
  //       console.log('[AI Tool] businessMonths RESULT', {
  //         toolCallId,
  //         result,
  //         count: Array.isArray(result) ? result.length : 0,
  //         sample: Array.isArray(result) ? result[0] : undefined,
  //       });
  //       return result;
  //     } catch (error) {
  //       console.error('[AI Tool] businessMonths ERROR', { toolCallId, error });
  //       throw error;
  //     }
  //   },
  // }),
  businessOrderMetrics: tool({
    description:
      'Fetch business order metrics and metric cards for a given date range.',
    inputSchema: z
      .object({
        startDate: z
          .string()
          .describe('Inclusive start date in YYYY-MM-DD format.'),
        endDate: z
          .string()
          .describe('Inclusive end date in YYYY-MM-DD format.'),
      })
      .describe('Date range to compute metrics over.'),
    execute: async ({ startDate, endDate }, { toolCallId }) => {
      console.log('[AI Tool] businessOrderMetrics START', {
        toolCallId,
        params: { startDate, endDate },
      });
      try {
        const client = getClient();
        const { data } = await client.query({
          query: BUSINESS_ORDER_METRICS_QUERY,
          variables: { startDate, endDate },
          fetchPolicy: 'no-cache',
        });
        const result = data?.businessOrderMetrics ?? null;
        // Compress payload to essential fields only
        const compressed = result
          ? {
              startDate: result.startDate,
              endDate: result.endDate,
              ordersCompleted: result.ordersCompleted,
              totalSpendCents: result.totalSpendCents,
              viewSection: {
                orderMetricCards: (result.viewSection?.orderMetricCards ?? []).map((card: any) => ({
                  id: card.id,
                  titleString: card.titleString,
                  valueString: card.valueString,
                })),
              },
            }
          : null;
        console.log('[AI Tool] businessOrderMetrics RESULT', {
          toolCallId,
          hasResult: Boolean(result),
          cardsCount: result?.viewSection?.orderMetricCards?.length ?? 0,
        });
        return { ok: true, data: compressed } as const;
      } catch (error) {
        console.error('[AI Tool] businessOrderMetrics ERROR', {
          toolCallId,
          params: { startDate, endDate },
          error,
        });
        return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' } as const;
      }
    },
  }),

  businessOrderSummariesConnection: tool({
    description:
      'Fetch paginated business order summaries within a date range, including member and summary info with order item collection.',
    inputSchema: z
      .object({
        orderBy: z
          .string()
          .optional()
          .describe('Ordering for summaries. One of: itemCountAsc, itemCountDesc, orderTotalCentsAsc, orderTotalCentsDesc, placedAtAsc, placedAtDesc.'),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/u, 'startDate must be YYYY-MM-DD')
          .describe('Inclusive start date in YYYY-MM-DD format.'),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/u, 'endDate must be YYYY-MM-DD')
          .describe('Inclusive end date in YYYY-MM-DD format.'),
        first: z
          .number()
          .int()
          .positive()
          .max(50, 'first cannot exceed 50')
          .describe('Number of items to fetch.'),
        after: z
          .string()
          .optional()
          .describe('Cursor for pagination.'),
      })
      .describe('Parameters for fetching order summaries connection.'),
    execute: async ({ orderBy, startDate, endDate, first, after }, { toolCallId }) => {
      console.log('[AI Tool] businessOrderSummariesConnection START', {
        toolCallId,
        params: { orderBy, startDate, endDate, first, after },
      });
      try {
        // Coerce orderBy string to GraphQL enum value (case-insensitive)
        const ORDER_BY_MAP: Record<string, BusinessOrderSummaryOrderBy> = {
          itemcountasc: BusinessOrderSummaryOrderBy.ItemCountAsc,
          itemcountdesc: BusinessOrderSummaryOrderBy.ItemCountDesc,
          ordertotalcentsasc: BusinessOrderSummaryOrderBy.OrderTotalCentsAsc,
          ordertotalcentsdesc: BusinessOrderSummaryOrderBy.OrderTotalCentsDesc,
          placedatasc: BusinessOrderSummaryOrderBy.PlacedAtAsc,
          placedatdesc: BusinessOrderSummaryOrderBy.PlacedAtDesc,
        };
        let mappedOrderBy: BusinessOrderSummaryOrderBy | undefined;
        if (orderBy) {
          const key = orderBy.replace(/[ _-]/g, '').toLowerCase();
          mappedOrderBy = ORDER_BY_MAP[key];
          if (!mappedOrderBy) {
            const valid = Object.values(BusinessOrderSummaryOrderBy).join(', ');
            return { ok: false, error: `Invalid orderBy: ${orderBy}. Valid: ${valid}` } as const;
          }
        }

        const client = getClient();
        const { data } = await client.query({
          query: BUSINESS_ORDER_SUMMARIES_CONNECTION_QUERY,
          variables: { orderBy: mappedOrderBy, startDate, endDate, first, after },
          fetchPolicy: 'no-cache',
        });
        const result = data?.businessOrderSummariesConnection ?? null;
        // Compress and truncate payload to avoid context overflow
        const totalNodes = result?.nodes?.length ?? 0;
        const nodesCap = Math.min(totalNodes, 20);
        const itemsPerNodeCap = 12;
        const nodes = (result?.nodes ?? []).slice(0, nodesCap).map((n: any) => {
          const os = n.orderSummary;
          const items = os?.orderItemCollection?.orderItems ?? [];
          const retailer = os?.retailer;
          return {
            placedAtUtc: os?.orderPlacedAtUtc ?? null,
            itemCount: os?.itemCount ?? null,
            orderTotalCents: os?.orderTotalCents ?? null,
            retailer: {
              name: retailer?.name ?? null,
              slug: retailer?.slug ?? null,
              logo: retailer?.logoImage?.templateUrl ?? null,
            },
            items: items.slice(0, itemsPerNodeCap).map((oi: any) => {
              const base = oi?.item ?? oi?.currentItem;
              const prod = base?.basketProduct;
              const vs = base?.viewSection;
              return {
                name: base?.name ?? null,
                quantity: oi?.selectedQuantityValue ?? oi?.pickedQuantityValue ?? null,
                customerPriceString: vs?.customerPriceString ?? null,
                productId: prod?.id ?? null,
                imageUrl: prod?.imageUrl ?? vs?.primaryImage?.url ?? null,
              };
            }),
          };
        });

        const compressed = {
          pageInfo: result?.pageInfo
            ? { hasNextPage: Boolean(result.pageInfo.hasNextPage), endCursor: result.pageInfo.endCursor ?? null }
            : null,
          nodes,
          meta: {
            nodesReturned: nodes.length,
            nodesTotal: totalNodes,
            itemsPerNodeCap,
          },
        };

        console.log('[AI Tool] businessOrderSummariesConnection RESULT', {
          toolCallId,
          hasResult: Boolean(result),
          nodesCount: nodes.length,
          pageInfo: compressed.pageInfo,
          truncated: totalNodes > nodesCap,
        });
        return { ok: true, data: compressed } as const;
      } catch (error) {
        console.error('[AI Tool] businessOrderSummariesConnection ERROR', {
          toolCallId,
          params: { orderBy, startDate, endDate, first, after },
          error,
        });
        // Fallback to saved local JSON so LLM can still respond (compress as well)
        try {
          const fallbackPath = '/Users/limingkang/NextJS-IDS-template/tmp/business-order-summaries-2025-09-04T20-27-45-629Z.json';
          const fileContent = await readFile(fallbackPath, 'utf8');
          const parsed = JSON.parse(fileContent);
          const connection = parsed?.result ?? parsed;

          const totalNodes = connection?.nodes?.length ?? 0;
          const nodesCap = Math.min(totalNodes, 20);
          const itemsPerNodeCap = 12;
          const nodes = (connection?.nodes ?? []).slice(0, nodesCap).map((n: any) => {
            const os = n?.orderSummary;
            const items = os?.orderItemCollection?.orderItems ?? [];
            const retailer = os?.retailer;
            return {
              placedAtUtc: os?.orderPlacedAtUtc ?? null,
              itemCount: os?.itemCount ?? null,
              orderTotalCents: os?.orderTotalCents ?? null,
              retailer: {
                name: retailer?.name ?? null,
                slug: retailer?.slug ?? null,
                logo: retailer?.logoImage?.templateUrl ?? null,
              },
              items: items.slice(0, itemsPerNodeCap).map((oi: any) => {
                const base = oi?.item ?? oi?.currentItem;
                const prod = base?.basketProduct;
                const vs = base?.viewSection;
                return {
                  name: base?.name ?? null,
                  quantity: oi?.selectedQuantityValue ?? oi?.pickedQuantityValue ?? null,
                  customerPriceString: vs?.customerPriceString ?? null,
                  productId: prod?.id ?? null,
                  imageUrl: prod?.imageUrl ?? vs?.primaryImage?.url ?? null,
                };
              }),
            };
          });

          const compressed = {
            pageInfo: connection?.pageInfo
              ? { hasNextPage: Boolean(connection.pageInfo.hasNextPage), endCursor: connection.pageInfo.endCursor ?? null }
              : null,
            nodes,
            meta: {
              nodesReturned: nodes.length,
              nodesTotal: totalNodes,
              itemsPerNodeCap,
              fallback: true,
            },
          };

          console.warn('[AI Tool] businessOrderSummariesConnection FALLBACK_USED', { toolCallId, fallbackPath, nodes: nodes.length });
          return { ok: true, data: compressed, fallback: true as const } as const;
        } catch (fallbackErr) {
          console.error('[AI Tool] businessOrderSummariesConnection FALLBACK_FAILED', { toolCallId, fallbackErr });
          return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' } as const;
        }
      }
    },
  }),
};

