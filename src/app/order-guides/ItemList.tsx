'use client';

import { Theme, spacing, useTheme } from '@instacart/ids-core';
import { Image } from '@instacart/ids-customers';
import { useState, useEffect } from 'react';

const useStyles = ({ theme }: { theme: Theme }) => ({
  container: {
    listStyle: 'none',
    padding: 0,
    margin: `${spacing.s8}px 0`,
    display: 'flex',
    gap: 4.6,
  },
  remainingCount: {
    width: spacing.s48,
    height: spacing.s48,
    borderRadius: theme.radius.r8,
    backgroundColor: theme.colors.systemGrayscale10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.typography.bodyRegular,
  },
});

type Props = {
  productIds: number[];
  isMobile?: boolean;
};

// Mock item data for now - in production this would come from GraphQL
function useItemImages(productIds: number[]) {
  const [items, setItems] = useState<Array<{ id: string; imageUrl: string }>>([]);

  useEffect(() => {
    // Mock implementation - in production this would be a GraphQL query
    // For now, generate placeholder images
    const mockItems = productIds.map(id => ({
      id: String(id),
      imageUrl: `https://via.placeholder.com/48x48/f0f0f0/333?text=${id}`,
    }));
    setItems(mockItems);
  }, [productIds]);

  return { items, loading: false, error: null };
}

export function ItemList({ productIds, isMobile = false }: Props) {
  const theme = useTheme();
  const styles = useStyles({ theme });

  const { items, loading, error } = useItemImages(productIds);

  if (loading || !items || error || productIds.length === 0) {
    return <ul css={styles.container} />;
  }

  const visibleItemsCount = isMobile ? 5 : 12;
  const visibleItems = items.slice(0, visibleItemsCount);
  const remainingCount = items.length - visibleItemsCount;
  const remainingCountText = `+${remainingCount}`;

  return (
    <ul css={styles.container}>
      {visibleItems.map(item => (
        <li key={item.id} data-testid={`ListingCardItem-${item.id}`}>
          <Image templateUrl={item.imageUrl} alt={`Product ${item.id}`} width={spacing.s48} height={spacing.s48} />
        </li>
      ))}
      {remainingCount > 0 && <li css={styles.remainingCount}>{remainingCountText}</li>}
    </ul>
  );
}
