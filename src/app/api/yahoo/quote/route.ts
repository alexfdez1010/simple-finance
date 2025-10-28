/**
 * API route for fetching Yahoo Finance quotes
 * This acts as a proxy to avoid CORS issues while keeping calls server-side
 * @module api/yahoo/quote
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchQuote } from '@/lib/infrastructure/yahoo-finance/client';

/**
 * GET /api/yahoo/quote?symbol=AAPL
 * Fetches current quote for a symbol
 *
 * @param request - Request with symbol query parameter
 * @returns Quote data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 },
      );
    }

    const quote = await fetchQuote(symbol);
    return NextResponse.json({ quote }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch quote:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 },
    );
  }
}
