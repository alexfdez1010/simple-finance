import { beforeEach, describe, expect, it, vi } from 'vitest';
import { revalidatePath } from 'next/cache';
import { isAuthenticated } from '@/lib/auth/auth-utils';
import { saveRunwaySettingsAction } from '@/lib/actions/runway-actions';
import { saveRunwaySettings } from '@/lib/infrastructure/database/runway-repository';
import type { RunwaySettings } from '@/lib/domain/models/runway.types';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/auth/auth-utils', () => ({ isAuthenticated: vi.fn() }));
vi.mock('@/lib/infrastructure/database/runway-repository', () => ({
  saveRunwaySettings: vi.fn(),
}));

const settings: RunwaySettings = {
  monthlyExpenses: 2_000,
  annualInflation: 0.02,
  monthlyContribution: 500,
};

describe('saveRunwaySettingsAction', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(isAuthenticated).mockResolvedValue(true);
    vi.mocked(saveRunwaySettings).mockResolvedValue(undefined);
  });

  it('persists validated assumptions and refreshes dashboard routes', async () => {
    expect(await saveRunwaySettingsAction(settings)).toEqual({ success: true });
    expect(saveRunwaySettings).toHaveBeenCalledExactlyOnceWith(settings);
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith(
      '/dashboard',
      'layout',
    );
  });

  it('rejects a signed-out caller before any write or revalidation', async () => {
    vi.mocked(isAuthenticated).mockResolvedValue(false);
    expect(await saveRunwaySettingsAction(settings)).toEqual({
      success: false,
      error: 'Your session has expired. Sign in to save your plan.',
    });
    expect(saveRunwaySettings).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ['monthlyExpenses', -1],
    ['monthlyExpenses', Infinity],
    ['monthlyExpenses', NaN],
    ['monthlyContribution', 1_000_000_001],
    ['annualInflation', -0.21],
    ['annualInflation', 1.01],
  ])('rejects invalid %s=%s without changing settings', async (key, value) => {
    const result = await saveRunwaySettingsAction({
      ...settings,
      [key]: value,
    });
    expect(result.success).toBe(false);
    expect(saveRunwaySettings).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ['withdrawalRate', 0.04],
    ['targetYears', 10],
    ['monthlyIncome', 1000],
    ['annualReturnOverride', 0.05],
  ])(
    'rejects retired %s inputs instead of using hidden assumptions',
    async (key, value) => {
      const result = await saveRunwaySettingsAction({
        ...settings,
        [key]: value,
      });
      expect(result.success).toBe(false);
      expect(saveRunwaySettings).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    },
  );

  it('accepts a zero expense plan', async () => {
    const zeroExpense = {
      ...settings,
      monthlyExpenses: 0,
    };
    expect(await saveRunwaySettingsAction(zeroExpense)).toEqual({
      success: true,
    });
    expect(saveRunwaySettings).toHaveBeenCalledWith(zeroExpense);
  });

  it('keeps database failure details out of the response', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(saveRunwaySettings).mockRejectedValue(
      new Error('private connection'),
    );
    expect(await saveRunwaySettingsAction(settings)).toEqual({
      success: false,
      error: 'Could not save your plan. Try again.',
    });
    expect(revalidatePath).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
