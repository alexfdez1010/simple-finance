/** Idempotent legacy backfill for custom-contribution EUR cost bases. */

import type { FinancialProduct } from '@/lib/domain/models/product.types';
import { setContributionAmountEurIfMissing } from '@/lib/infrastructure/database/contribution-repository';
import { convertProductAmountToEurAtDate } from './product-currency-converter';

export interface ContributionEurBackfillDependencies {
  convertAtDate: (
    amount: number,
    currency: string,
    date: Date,
  ) => Promise<number>;
  persistIfMissing: (id: string, amountEur: number) => Promise<boolean>;
}

const defaultDependencies: ContributionEurBackfillDependencies = {
  convertAtDate: convertProductAmountToEurAtDate,
  persistIfMissing: setContributionAmountEurIfMissing,
};

/**
 * Fills nullable legacy EUR values once and returns an immutable product list
 * containing the resolved values. Existing values cause no conversion or write.
 * Concurrent calls are safe because persistence only updates null rows.
 *
 * @param products - Products loaded with custom contributions
 * @param dependencies - Injectable converter and persistence boundary for tests
 * @returns Products with every custom contribution's `amountEur` resolved
 */
export async function ensureContributionEurAmounts(
  products: FinancialProduct[],
  dependencies: ContributionEurBackfillDependencies = defaultDependencies,
): Promise<FinancialProduct[]> {
  return Promise.all(
    products.map(async (product): Promise<FinancialProduct> => {
      if (product.type !== 'CUSTOM') return product;

      const contributions = await Promise.all(
        product.custom.contributions.map(async (contribution) => {
          if (contribution.amountEur != null) return contribution;
          const amountEur = await dependencies.convertAtDate(
            contribution.amount,
            product.custom.currency,
            contribution.date,
          );
          await dependencies.persistIfMissing(contribution.id, amountEur);
          return { ...contribution, amountEur };
        }),
      );

      return {
        ...product,
        custom: { ...product.custom, contributions },
      };
    }),
  );
}
