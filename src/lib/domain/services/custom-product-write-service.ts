/** Application service for custom-product writes with immutable EUR basis. */

import type {
  AddContributionInput,
  CreateCustomProductInput,
  CustomContribution,
  CustomProduct,
  UpdateContributionInput,
} from '@/lib/domain/models/product.types';
import {
  addContribution,
  findContributionCurrency,
  findCustomProductCurrency,
  updateContribution,
} from '@/lib/infrastructure/database/contribution-repository';
import { createCustomProduct } from '@/lib/infrastructure/database/product-repository';
import { convertProductAmountToEurAtDate } from './product-currency-converter';

type FirstMovement = CreateCustomProductInput['firstMovement'];
export type CreateCustomProductCommand = Omit<
  CreateCustomProductInput,
  'firstMovement'
> & {
  firstMovement: Omit<FirstMovement, 'amountEur'>;
};
export type AddContributionCommand = Omit<AddContributionInput, 'amountEur'>;
export type UpdateContributionCommand = Omit<
  UpdateContributionInput,
  'amountEur'
>;

/**
 * Converts and creates a custom product atomically from the caller's view.
 * The first movement keeps both its native amount and date-specific EUR basis.
 *
 * @param input - Custom product and first native-currency movement
 * @returns Created custom product
 */
export async function createCustomProductWithEurBasis(
  input: CreateCustomProductCommand,
): Promise<CustomProduct> {
  const amountEur = await convertProductAmountToEurAtDate(
    input.firstMovement.amount,
    input.currency,
    input.firstMovement.date,
  );
  return createCustomProduct({
    ...input,
    firstMovement: { ...input.firstMovement, amountEur },
  });
}

/**
 * Adds a movement after freezing its EUR value at the movement date.
 *
 * @param input - Signed movement in the custom product's currency
 * @returns Created contribution
 * @throws When the parent custom product does not exist
 */
export async function addContributionWithEurBasis(
  input: AddContributionCommand,
): Promise<CustomContribution> {
  const currency = await findCustomProductCurrency(input.customProductDataId);
  if (!currency) throw new Error('Custom product not found');
  const amountEur = await convertProductAmountToEurAtDate(
    input.amount,
    currency,
    input.date,
  );
  return addContribution({ ...input, amountEur });
}

/**
 * Replaces a movement and recalculates its immutable EUR basis because its
 * native amount or effective date may have changed.
 *
 * @param input - Replacement contribution values
 * @returns Updated contribution
 * @throws When the contribution does not exist
 */
export async function updateContributionWithEurBasis(
  input: UpdateContributionCommand,
): Promise<CustomContribution> {
  const currency = await findContributionCurrency(input.id);
  if (!currency) throw new Error('Contribution not found');
  const amountEur = await convertProductAmountToEurAtDate(
    input.amount,
    currency,
    input.date,
  );
  return updateContribution({ ...input, amountEur });
}
