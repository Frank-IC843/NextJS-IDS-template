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

type ItemImage = {
  id: string;
  imageUrl: string;
};

type Props = {
  productIds: number[];
  itemImages?: ItemImage[];
  isMobile?: boolean;
};

export function ItemList({ productIds, itemImages, isMobile = false }: Props) {
  const theme = useTheme();
  const styles = useStyles({ theme });
  const [fetchedImages, setFetchedImages] = useState<ItemImage[]>([]);

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/product-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds }),
        });

        if (response.ok) {
          const data = await response.json();
          const images = data.productImages.map((item: { productId: string; imageUrl: string }) => ({
            id: item.productId,
            imageUrl: item.imageUrl,
          }));
          setFetchedImages(images);
        }
      } catch (error) {
        console.error('Failed to fetch product images:', error);
        // Fallback to placeholders
        setFetchedImages(
          productIds.map(id => ({
            id: String(id),
            imageUrl: `https://via.placeholder.com/48x48/f0f0f0/333?text=${id}`,
          }))
        );
      }
    };

    if (productIds.length > 0 && !itemImages) {
      fetchImages();
    }
  }, [productIds, itemImages]);

  // Use provided itemImages, or fetched images, or placeholders
  const items =
    itemImages ||
    fetchedImages ||
    productIds.map(id => ({
      id: String(id),
      imageUrl: `https://via.placeholder.com/48x48/f0f0f0/333?text=${id}`,
    }));

  if (items.length === 0) {
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
