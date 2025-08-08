import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/business-info - Get business information from request headers
 * This endpoint receives business info from the client via headers to avoid CORS issues
 */
export async function GET(request: NextRequest) {
  try {
    // Get business info from custom header
    const businessInfo = request.headers.get('x-business-info') || '';

    return NextResponse.json({
      businessInfo: decodeURIComponent(businessInfo),
    });
  } catch (error) {
    console.error('Business info API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve business information' }, { status: 500 });
  }
}

/**
 * POST /api/business-info - Receive business information from client
 * This is used by the chat API to get the current business info
 */
export async function POST(request: NextRequest) {
  try {
    const { businessInfo } = await request.json();

    // For now, we just return it back - in a real implementation,
    // you might want to validate or process it
    return NextResponse.json({
      businessInfo: businessInfo || '',
    });
  } catch (error) {
    console.error('Business info API error:', error);
    return NextResponse.json({ error: 'Failed to process business information' }, { status: 500 });
  }
}
