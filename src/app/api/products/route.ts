/**
 * API routes for financial products
 * GET /api/products - List all products
 * POST /api/products - Create a new product
 * @module api/products
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  findProductsByPortfolioId,
  createYahooFinanceProduct,
  createCustomProduct,
} from '@/lib/infrastructure/database/product-repository';
import { findOrCreateDefaultPortfolio } from '@/lib/infrastructure/database/portfolio-repository';
import {
  createYahooFinanceProductSchema,
  createCustomProductSchema,
} from '@/lib/validation/product-schemas';
import { ZodError } from 'zod';

/**
 * GET /api/products
 * Lists all products in the default portfolio
 *
 * @returns Array of financial products
 */
export async function GET(): Promise<NextResponse> {
  try {
    const portfolio = await findOrCreateDefaultPortfolio();
    const products = await findProductsByPortfolioId(portfolio.id);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 * Creates a new financial product (Yahoo Finance or Custom)
 *
 * @param request - Request with product data
 * @returns Created product
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const portfolio = await findOrCreateDefaultPortfolio();

    // Determine product type based on presence of 'symbol' field
    if ('symbol' in body) {
      // Yahoo Finance product
      const validatedData = createYahooFinanceProductSchema.parse({
        ...body,
        portfolioId: portfolio.id,
      });

      const product = await createYahooFinanceProduct(validatedData);
      return NextResponse.json({ product }, { status: 201 });
    } else {
      // Custom product
      const validatedData = createCustomProductSchema.parse({
        ...body,
        portfolioId: portfolio.id,
      });

      const product = await createCustomProduct(validatedData);
      return NextResponse.json({ product }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 },
    );
  }
}
