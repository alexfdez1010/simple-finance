/**
 * Server actions for managing custom-product contributions
 * (deposits and withdrawals).
 * @module lib/actions/contribution-actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import {
  addContribution,
  updateContribution,
  deleteContribution,
} from '@/lib/infrastructure/database/contribution-repository';

type ActionResult = { success: boolean; error?: string; id?: string };

function fail(error: unknown, fallback: string): ActionResult {
  console.error(`${fallback}:`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

/**
 * Rejects dates beyond the end of the current local day. Future-dated
 * deposits cannot accrue interest yet and confuse the totals shown in the
 * UI, so they are not allowed at the API boundary either.
 */
function assertNotFuture(date: Date): void {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  if (date.getTime() > endOfToday.getTime()) {
    throw new Error('Date cannot be in the future');
  }
}

/**
 * Adds a deposit (positive amount) or withdrawal (negative amount) to a
 * custom product. `amount` is in the product's currency.
 */
export async function addContributionAction(
  customProductDataId: string,
  amount: number,
  date: Date,
  note?: string | null,
): Promise<ActionResult> {
  try {
    assertNotFuture(date);
    const created = await addContribution({
      customProductDataId,
      amount,
      date,
      note,
    });
    revalidatePath('/dashboard');
    return { success: true, id: created.id };
  } catch (error) {
    return fail(error, 'Failed to add contribution');
  }
}

/**
 * Updates an existing contribution.
 */
export async function updateContributionAction(
  id: string,
  amount: number,
  date: Date,
  note?: string | null,
): Promise<ActionResult> {
  try {
    assertNotFuture(date);
    await updateContribution({ id, amount, date, note });
    revalidatePath('/dashboard');
    return { success: true, id };
  } catch (error) {
    return fail(error, 'Failed to update contribution');
  }
}

/**
 * Deletes a contribution.
 */
export async function deleteContributionAction(
  id: string,
): Promise<ActionResult> {
  try {
    await deleteContribution(id);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return fail(error, 'Failed to delete contribution');
  }
}
