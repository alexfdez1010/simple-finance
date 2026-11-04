import type { RunwayHolding } from '@/lib/domain/models/runway.types';
import {
  effectiveMonthlyRate,
  portfolioRunwayAssumptions,
} from './runway-math';

/** Monthly growth with optional income capacity for mixed simple-interest projections. */
export type RunwayGrowth = ((balance: number) => number) & {
  annualReturn?: (balance: number) => number;
};

/**
 * Creates an independent monthly growth calculator for one projection scenario.
 * @param products - Current balances with optional non-reinvested principal and FX estimates.
 * @returns Stateful monthly-return function; withdrawals reduce holdings proportionally,
 * new investments follow initial allocation and become earning principal. Simple yield
 * stays outside principal; only currency appreciation can grow both principal and income.
 */
export function createRunwayGrowth(
  products: readonly RunwayHolding[],
): RunwayGrowth {
  const { initialCapital, annualReturn } = portfolioRunwayAssumptions(products);
  if (!products.some((product) => product.simpleInterest)) {
    const rate = effectiveMonthlyRate(annualReturn);
    return (balance) => balance * rate;
  }
  const holdings = products.map((product) => ({
    value: product.currentValueEur,
    weight: initialCapital > 0 ? product.currentValueEur / initialCapital : 0,
    principal: product.simpleInterest?.principalEur ?? 0,
    simpleRate: (product.simpleInterest?.annualRate ?? 0) / 12,
    rate: effectiveMonthlyRate(
      product.simpleInterest?.fxAnnualRate ?? product.expectedAnnualReturn ?? 0,
    ),
    simple: !!product.simpleInterest,
  }));
  let previousBalance = initialCapital;
  /** Allocates new investments and proportionally reduces withdrawn capital without accruing yield. */
  const rebalance = (balance: number) => {
    const change = balance - previousBalance;
    for (const holding of holdings) {
      if (change < 0 && previousBalance > 0) {
        const fraction = Math.max(0, balance / previousBalance);
        holding.value *= fraction;
        holding.principal *= fraction;
      } else if (change > 0) {
        const added = change * holding.weight;
        holding.value += added;
        holding.principal += added;
      }
    }
    previousBalance = balance;
  };
  /** Computes one month of FX appreciation and yield on earning principal only. */
  const gainFor = (holding: (typeof holdings)[number]) =>
    holding.value * holding.rate +
    (holding.simple
      ? holding.principal * holding.simpleRate * (1 + holding.rate)
      : 0);
  const growth: RunwayGrowth = (balance) => {
    rebalance(balance);
    let returns = 0;
    for (const holding of holdings) {
      const gain = gainFor(holding);
      holding.value += gain;
      holding.principal *= 1 + holding.rate;
      returns += gain;
    }
    previousBalance = balance + returns;
    return returns;
  };
  growth.annualReturn = (balance) => {
    rebalance(balance);
    const gain = holdings.reduce((sum, holding) => sum + gainFor(holding), 0);
    return balance > 0 ? (1 + gain / balance) ** 12 - 1 : 0;
  };
  return growth;
}
