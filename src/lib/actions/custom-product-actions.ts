/** Server actions for creating and updating custom financial products. */

'use server';

import { revalidatePath } from 'next/cache';
import type { CreateCustomProductInput } from '@/lib/domain/models/product.types';
import {
  DEFAULT_ASSET_CATEGORY,
  type AssetCategory,
} from '@/lib/domain/models/asset-category';
import { createCustomProductWithEurBasis } from '@/lib/domain/services/custom-product-write-service';
import { updateCustomProduct } from '@/lib/infrastructure/database/product-repository';

const DEFAULT_CURRENCY = 'EUR';
const DEFAULT_DAYS_TO_LIQUIDITY = 0;

/**
 * Creates a custom product and freezes its first movement's EUR cost basis.
 *
 * @returns Created product id or a user-facing error
 */
export async function createCustomProductAction(
  name: string,
  annualReturnRate: number,
  firstMovementAmount: number,
  firstMovementDate: Date,
  currency: string = DEFAULT_CURRENCY,
  firstMovementNote?: string | null,
  assetCategory: AssetCategory = DEFAULT_ASSET_CATEGORY,
  daysToLiquidity: number = DEFAULT_DAYS_TO_LIQUIDITY,
): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    const firstMovement: Omit<
      CreateCustomProductInput['firstMovement'],
      'amountEur'
    > = {
      amount: firstMovementAmount,
      date: firstMovementDate,
      note: firstMovementNote,
    };
    const product = await createCustomProductWithEurBasis({
      name,
      annualReturnRate,
      currency: currency || DEFAULT_CURRENCY,
      assetCategory,
      daysToLiquidity,
      firstMovement,
    });
    revalidatePath('/dashboard');
    return { success: true, productId: product.id };
  } catch (error) {
    console.error('Failed to create custom product:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

/**
 * Updates custom metadata without changing its immutable currency or movements.
 *
 * @returns Success or a user-facing error
 */
export async function updateCustomProductAction(
  productId: string,
  name: string,
  annualReturnRate: number,
  assetCategory: AssetCategory = DEFAULT_ASSET_CATEGORY,
  daysToLiquidity: number = DEFAULT_DAYS_TO_LIQUIDITY,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateCustomProduct({
      productId,
      name,
      annualReturnRate,
      assetCategory,
      daysToLiquidity,
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update custom product:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}
