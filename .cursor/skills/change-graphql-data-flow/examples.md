# GraphQL Data Flow Examples

## 1. Put Operations In `queries.ts`

Keep GraphQL documents in a nearby `queries.ts` so `yarn codegen` can see them.

```ts
import { gql } from '@apollo/client';

export const ORDER_GUIDE_ITEMS_QUERY = gql`
  query OrderGuideItems($orderGuideId: ID!) {
    businessOrderGuide(id: $orderGuideId) {
      id
      productIds
    }
  }
`;
```

## 2. Server-Side Read

Use the registered Apollo client directly in Server Components and server utilities.

```tsx
import { getClient } from '@/lib/apollo-client';
import { ORDER_GUIDE_ITEMS_QUERY } from './queries';
import type { OrderGuideItemsQuery } from '@/__generated__/graphql-types';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await getClient().query<OrderGuideItemsQuery>({
    query: ORDER_GUIDE_ITEMS_QUERY,
    variables: { orderGuideId: id },
  });

  return <pre>{JSON.stringify(data.businessOrderGuide, null, 2)}</pre>;
}
```

## 3. Client-Side Mutation

Use generated types and a small sync strategy after success.

```tsx
'use client';

import { useMutation } from '@apollo/client';
import {
  UPDATE_ORDER_GUIDE_MUTATION,
  ORDER_GUIDE_ITEMS_QUERY,
} from './queries';
import type { UpdateOrderGuideMutation } from '@/__generated__/graphql-types';

export function SaveOrderGuideButton({ orderGuideId }: { orderGuideId: string }) {
  const [updateOrderGuide, { loading }] = useMutation<UpdateOrderGuideMutation>(
    UPDATE_ORDER_GUIDE_MUTATION,
    {
      refetchQueries: [
        {
          query: ORDER_GUIDE_ITEMS_QUERY,
          variables: { orderGuideId },
        },
      ],
    }
  );

  return (
    <button
      disabled={loading}
      onClick={() => updateOrderGuide({ variables: { orderGuideId } })}
    >
      Save
    </button>
  );
}
```

## 4. Derive From Query Results

Do not copy query results into local state unless the user is editing a separate client draft.

**Prefer:**

```tsx
function ItemsSummary({ data }: { data: OrderGuideItemsQuery }) {
  const productIds = data.businessOrderGuide?.productIds ?? [];

  return <span>{productIds.length} items</span>;
}
```

**Avoid:**

```tsx
function ItemsSummary({ data }: { data: OrderGuideItemsQuery }) {
  const [productIds, setProductIds] = useState<string[]>([]);

  useEffect(() => {
    setProductIds(data.businessOrderGuide?.productIds ?? []);
  }, [data]);

  return <span>{productIds.length} items</span>;
}
```
