'use server';

import { revalidatePath } from 'next/cache';
import { isAuthenticated } from '@/lib/auth/auth-utils';
import type { RunwaySettings } from '@/lib/domain/models/runway.types';
import { saveRunwaySettings } from '@/lib/infrastructure/database/runway-repository';
import { runwaySettingsSchema } from '@/lib/validation/runway-schemas';

/**
 * Authenticates, validates and persists the shared runway/FIRE assumptions.
 * @param input - EUR cash amounts, decimal annual rates, and whole target years.
 * @returns A confirmed save or a recoverable error without database details.
 * Revalidates dashboard routes only after a successful write; invalid input is never stored.
 */
export async function saveRunwaySettingsAction(
  input: RunwaySettings,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await isAuthenticated())) {
      return {
        success: false,
        error: 'Your session has expired. Sign in to save your plan.',
      };
    }
    const parsed = runwaySettingsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Check the amounts and rates in your plan.',
      };
    }
    await saveRunwaySettings(parsed.data);
    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to save runway settings:', error);
    return { success: false, error: 'Could not save your plan. Try again.' };
  }
}
