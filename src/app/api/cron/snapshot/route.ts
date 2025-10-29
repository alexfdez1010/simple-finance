import { NextRequest, NextResponse } from 'next/server';
import { findAllProducts } from '@/lib/infrastructure/database/product-repository';
import { calculatePortfolioStatistics } from '@/lib/domain/services/portfolio-statistics';
import { upsertPortfolioSnapshot } from '@/lib/infrastructure/database/portfolio-snapshot-repository';
import { fetchYahooQuoteServer } from '@/lib/infrastructure/yahoo-finance/server-client';
import { calculateCustomProductValue } from '@/lib/domain/services/custom-product-calculator';

/**
 * API endpoint to create a daily portfolio snapshot.
 * Protected by bearer token authentication.
 * Should be called by a cron job at midnight.
 *
 * @returns JSON response with snapshot data or error
 */
export async function POST(request: NextRequest) {
  try {
    // Verify bearer token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_TOKEN;

    if (!expectedToken) {
      console.error('CRON_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 },
      );
    }

    // Get all products
    const products = await findAllProducts();

    if (products.length === 0) {
      return NextResponse.json(
        {
          message: 'No products found, snapshot not created',
          totalValue: 0,
        },
        { status: 200 },
      );
    }

    // Fetch current prices for Yahoo Finance products
    const currentPrices = new Map<string, number>();

    for (const product of products) {
      if (product.type === 'YAHOO_FINANCE') {
        const quote = await fetchYahooQuoteServer(product.yahoo.symbol);
        if (quote) {
          currentPrices.set(product.id, quote.regularMarketPrice);
        }
      } else if (product.type === 'CUSTOM') {
        const value = await calculateCustomProductValue(
          product.custom.initialInvestment,
          product.custom.annualReturnRate,
          product.custom.investmentDate,
        );
        currentPrices.set(product.id, value);
      }
    }

    // Calculate portfolio statistics
    const stats = await calculatePortfolioStatistics(products, currentPrices);

    // Create snapshot for today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight

    const snapshot = await upsertPortfolioSnapshot(today, stats.totalValue);

    return NextResponse.json(
      {
        message: 'Portfolio snapshot created successfully',
        snapshot: {
          date: snapshot.date.toISOString(),
          value: snapshot.value,
        },
        stats: {
          totalValue: stats.totalValue,
          totalReturn: stats.totalReturn,
          totalReturnPercentage: stats.totalReturnPercentage,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error creating portfolio snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio snapshot' },
      { status: 500 },
    );
  }
}
