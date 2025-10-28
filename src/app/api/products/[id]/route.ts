/**
 * API routes for individual product operations
 * GET /api/products/[id] - Get product by ID
 * PUT /api/products/[id] - Update product
 * DELETE /api/products/[id] - Delete product
 * @module api/products/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  findProductById,
  updateProductQuantity,
  deleteProduct,
} from '@/lib/infrastructure/database/product-repository';
import { updateProductQuantitySchema } from '@/lib/validation/product-schemas';
import { ZodError } from 'zod';

/**
 * Route parameters type
 */
interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id]
 * Retrieves a product by ID
 *
 * @param request - Request object
 * @param params - Route parameters
 * @returns Product data
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const product = await findProductById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/[id]
 * Updates a product's quantity
 *
 * @param request - Request with update data
 * @param params - Route parameters
 * @returns Updated product
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const validatedData = updateProductQuantitySchema.parse(body);

    const product = await updateProductQuantity({
      productId: id,
      quantity: validatedData.quantity,
    });

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Deletes a product
 *
 * @param request - Request object
 * @param params - Route parameters
 * @returns Success response
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await deleteProduct(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 },
    );
  }
}
