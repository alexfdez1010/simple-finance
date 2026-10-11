import { describe, expect, it } from 'vitest';
import { formatDrawdownTick } from '@/components/dashboard/drawdown-format';

describe('drawdown measurement labels', () => {
  it('distinguishes every level in a shallow decline', () => {
    const ticks = [0, -0.25, -0.5, -0.75, -1].map(formatDrawdownTick);
    expect(ticks).toEqual(['0%', '-0.25%', '-0.5%', '-0.75%', '-1%']);
    expect(new Set(ticks).size).toBe(ticks.length);
  });
  it('normalizes signed and rounded negative zero', () => {
    expect(formatDrawdownTick(-0)).toBe('0%');
    expect(formatDrawdownTick(-0.001)).toBe('0%');
  });
  it('retains readable precision for deeper declines', () => {
    expect(formatDrawdownTick(-12.345)).toBe('-12.34%');
    expect(formatDrawdownTick(-50)).toBe('-50%');
  });
});
