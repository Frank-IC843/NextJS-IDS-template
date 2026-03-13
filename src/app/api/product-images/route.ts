import { NextRequest, NextResponse } from 'next/server';

// Lazy load demo data to avoid memory bloat
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let demoOrderSummaries: any = null;
async function getDemoOrderSummaries() {
  if (!demoOrderSummaries) {
    demoOrderSummaries = await import('../../../../tmp/business-order-summaries-2025-09-04T20-27-45-629Z.json');
  }
  return demoOrderSummaries;
}

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds array is required' }, { status: 400 });
    }

    // Load the demo data
    const demoData = await getDemoOrderSummaries();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const demoNodes = (demoData as any).result.nodes;

    // Build a map of product ID to image URL
    const productImageMap = new Map<string, { imageUrl: string; name: string; price: string }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    demoNodes.forEach((order: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order.orderSummary?.orderItemCollection?.orderItems?.forEach((item: any) => {
        const productId = item.item?.id || item.currentItem?.id || '';

        if (productId && !productImageMap.has(productId)) {
          const imageUrl =
            item.item?.basketProduct?.imageUrl ||
            item.currentItem?.basketProduct?.imageUrl ||
            item.item?.viewSection?.primaryImage?.url ||
            item.currentItem?.viewSection?.primaryImage?.url ||
            '';

          const name = item.item?.name || item.currentItem?.name || '';
          const price =
            item.item?.viewSection?.customerPriceString || item.currentItem?.viewSection?.customerPriceString || '';

          if (imageUrl) {
            productImageMap.set(productId, { imageUrl, name, price });
          }
        }
      });
    });

    // Create an array of all available product images for fallback
    const allProductImages = Array.from(productImageMap.values());

    // Get the requested product images
    const productImages = productIds.map((id, index) => {
      const data = productImageMap.get(String(id));

      if (data) {
        // Found exact match
        return {
          productId: String(id),
          imageUrl: data.imageUrl,
          name: data.name,
          price: data.price,
        };
      } else if (allProductImages.length > 0) {
        // No exact match, use a sample image from available products
        // Use modulo to cycle through available images
        const fallbackImage = allProductImages[index % allProductImages.length];
        return {
          productId: String(id),
          imageUrl: fallbackImage.imageUrl,
          name: fallbackImage.name,
          price: fallbackImage.price,
        };
      } else {
        // No images available at all, use placeholder
        return {
          productId: String(id),
          imageUrl: `https://via.placeholder.com/48x48/f0f0f0/333?text=${id}`,
          name: '',
          price: '',
        };
      }
    });

    return NextResponse.json({ productImages });
  } catch (error) {
    console.error('Error fetching product images:', error);
    return NextResponse.json({ error: 'Failed to fetch product images' }, { status: 500 });
  }
}
