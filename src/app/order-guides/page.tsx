import OrderGuidesContent from '@/app/order-guides/order-guides-content';
import { ORDER_GUIDES_CONNECTION_QUERY } from '@/app/queries';
import { getClient } from '@/lib/apollo-client';
import {
  BusinessOrderGuidesOrderBy,
  BusinessOrderGuidesVisibilityFilter,
  OrderGuidesConnectionQuery,
} from '@/__generated__/graphql-types';

export default async function OrderGuidesPage() {
  const client = getClient();

  // Fetch order guides with SSR
  const { data } = await client.query<OrderGuidesConnectionQuery>({
    query: ORDER_GUIDES_CONNECTION_QUERY,
    variables: {
      first: 10,
      filters: {
        visibility: BusinessOrderGuidesVisibilityFilter.CreatedByMe,
      },
      orderBy: BusinessOrderGuidesOrderBy.CreatedAtDesc,
    },
  });

  console.log(data);

  return <OrderGuidesContent orderGuidesData={data} />;
}
