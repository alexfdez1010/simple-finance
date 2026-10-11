/**
 * Test helper utilities for E2E tests
 * @module tests/e2e/test-helpers
 */

import type { Page } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

/**
 * Navigates to the dedicated holdings workspace through the persistent navigation.
 * @param page - Authenticated Playwright page; works from any dashboard route.
 * @returns Resolves after the management heading is visible.
 */
export async function openHoldingsPage(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Holdings', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Your holdings', exact: true })
    .waitFor();
}

/**
 * Chooses one option from a HeroUI select by its accessible label.
 *
 * @param page - Playwright page containing the select.
 * @param label - Exact accessible label of the select trigger.
 * @param option - Exact accessible name of the option to choose.
 */
export async function selectHeroOption(
  page: Page,
  label: string,
  option: string,
): Promise<void> {
  await page.getByLabel(label, { exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

/**
 * Clean all products from the database
 * Use this in beforeEach hooks to ensure test isolation
 */
export async function cleanDatabase(): Promise<void> {
  // Per-product snapshots cascade-delete with `financialProduct`, but
  // remove them explicitly so failed runs cannot leave orphans behind.
  await prisma.productSnapshot.deleteMany({});
  await prisma.financialProduct.deleteMany({});
  await prisma.portfolioSnapshot.deleteMany({});
}

/**
 * Disconnect Prisma client
 * Use this in afterAll hooks
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
