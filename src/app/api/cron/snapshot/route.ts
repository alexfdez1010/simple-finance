import { NextRequest, NextResponse } from 'next/server';
import { findAllProducts } from '@/lib/infrastructure/database/product-repository';
import { enrichProductsWithEurValues } from '@/lib/domain/services/product-enrichment';
import { upsertPortfolioSnapshot } from '@/lib/infrastructure/database/portfolio-snapshot-repository';
import { generateAuthToken } from '@/lib/auth/auth-utils';

/**
 * API endpoint to create a daily portfolio snapshot.
 * Protected by bearer token authentication.
 * Should be called by a cron job at midnight.
 *
 * @returns JSON response with snapshot data or error
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error('CRON_SECRET environment variable is not set');
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

    const token = authHeader.substring(7);

    if (generateAuthToken(token) !== generateAuthToken(expectedToken)) {
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 },
      );
    }

    const products = await findAllProducts();

    if (products.length === 0) {
      return NextResponse.json(
        { message: 'No products found, snapshot not created', totalValue: 0 },
        { status: 200 },
      );
    }

    const enriched = await enrichProductsWithEurValues(products);

    const totalValue = enriched.reduce((acc, p) => acc + p.currentValueEur, 0);
    const totalInvestment = enriched.reduce((acc, p) => acc + p.investedEur, 0);
    const totalReturn = totalValue - totalInvestment;
    const totalReturnPercentage =
      totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await upsertPortfolioSnapshot(
      today,
      Math.round(totalValue * 100) / 100,
    );

    return NextResponse.json(
      {
        message: 'Portfolio snapshot created successfully',
        snapshot: {
          date: snapshot.date.toISOString(),
          value: snapshot.value,
        },
        stats: {
          totalValue: Math.round(totalValue * 100) / 100,
          totalReturn: Math.round(totalReturn * 100) / 100,
          totalReturnPercentage: Math.round(totalReturnPercentage * 100) / 100,
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
