# Build Patterns

## 1. Small Client Boundary

Prefer a Server Component for data loading and pass only the interactive part into a Client Component.

**Prefer:**

```tsx
// page.tsx
import { getClient } from '@/lib/apollo-client';
import { ItemCard } from './item-card';
import { SaveButton } from './save-button';

export default async function Page() {
  const { data } = await getClient().query({ query: ITEMS_QUERY });

  return (
    <div>
      {data.items.map(item => (
        <ItemCard key={item.id} item={item}>
          <SaveButton itemId={item.id} />
        </ItemCard>
      ))}
    </div>
  );
}
```

```tsx
'use client';

export function SaveButton({ itemId }: { itemId: string }) {
  return <button onClick={() => console.log(itemId)}>Save</button>;
}
```

**Avoid:**

```tsx
'use client';

export default function Page() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/items').then(/* ... */);
  }, []);

  return null;
}
```

## 2. Event Handler Over Effect

If the user action triggers the side effect, do it in the handler.

**Prefer:**

```tsx
function OrderGuideForm() {
  const handleSubmit = async () => {
    await createOrderGuide();
  };

  return <button onClick={handleSubmit}>Create</button>;
}
```

**Avoid:**

```tsx
function OrderGuideForm() {
  const [shouldSubmit, setShouldSubmit] = useState(false);

  useEffect(() => {
    if (shouldSubmit) {
      createOrderGuide();
    }
  }, [shouldSubmit]);

  return <button onClick={() => setShouldSubmit(true)}>Create</button>;
}
```

## 3. Derive State During Render

Do not mirror props or query results into state unless the user is editing a local draft.

**Prefer:**

```tsx
function UserBadge({ user }: { user: { firstName: string; lastName: string } }) {
  const fullName = `${user.firstName} ${user.lastName}`;

  return <span>{fullName}</span>;
}
```

**Avoid:**

```tsx
function UserBadge({ user }: { user: { firstName: string; lastName: string } }) {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(`${user.firstName} ${user.lastName}`);
  }, [user.firstName, user.lastName]);

  return <span>{fullName}</span>;
}
```

## 4. No Manual Memoization

This repo uses the React Compiler. Start without `useMemo`, `useCallback`, or `React.memo`.

**Prefer:**

```tsx
function ItemList({ items, selectedId }: { items: Item[]; selectedId: string }) {
  const selectedItem = items.find(item => item.id === selectedId);
  const handleSelect = (id: string) => console.log(id);

  return <List item={selectedItem} onSelect={handleSelect} />;
}
```

**Avoid:**

```tsx
function ItemList({ items, selectedId }: { items: Item[]; selectedId: string }) {
  const selectedItem = useMemo(
    () => items.find(item => item.id === selectedId),
    [items, selectedId]
  );
  const handleSelect = useCallback((id: string) => console.log(id), []);

  return <List item={selectedItem} onSelect={handleSelect} />;
}
```
