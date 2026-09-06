import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';
import { authenticateTestUser } from './auth-helper';
import {
  cleanDatabase,
  openProductsTab,
  selectHeroOption,
} from './test-helpers';

const prisma = new PrismaClient();

test.beforeEach(async ({ page }) => {
  await cleanDatabase();
  for (const [name, amount, days] of [
    ['Reserve', 15000, 0],
    ['Bond ladder', 5000, 30],
  ] as const) {
    await prisma.financialProduct.create({
      data: {
        name,
        type: 'CUSTOM',
        assetCategory: days ? 'BONDS_LOANS' : 'CASH',
        quantity: 1,
        daysToLiquidity: days,
        custom: {
          create: {
            currency: 'EUR',
            annualReturnRate: 0,
            contributions: {
              create: {
                amount,
                amountEur: amount,
                date: new Date('2026-01-01T00:00:00Z'),
              },
            },
          },
        },
      },
    });
  }
  await authenticateTestUser(page);
  await page.goto('http://localhost:3000/dashboard');
});
test.afterAll(async () => {
  await prisma.$disconnect();
});

test('shows value-weighted insights and preserves every analytics workspace', async ({
  page,
}) => {
  const insights = page.getByLabel('Portfolio insights', { exact: true });
  await expect(insights).toContainText('75.0%');
  await expect(insights).toContainText('100.0%');
  await expect(insights).toContainText('0 / 2');
  await expect(insights).toContainText('Reserve');
  await page.getByRole('button', { name: 'Allocation', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Allocation', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Cash flow', exact: true }).click();
  await expect(
    page.getByText('Cash Availability', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Risk', exact: true }).click();
  await expect(
    page.getByText(/Returns exclude recorded deposits/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await expect(
    page.getByText('Portfolio Evolution', { exact: true }),
  ).toBeVisible();
});

test('searches and sorts holdings, recovers from no results, and opens editing', async ({
  page,
}) => {
  await openProductsTab(page);
  const cards = page.getByTestId('product-card');
  await expect(cards.first()).toContainText('Reserve');
  await selectHeroOption(page, 'Sort holdings', 'Name A–Z');
  await expect(cards.first()).toContainText('Bond ladder');
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await selectHeroOption(page, 'Sort holdings', 'Highest value');
  await expect(cards.first()).toContainText('Reserve');
  await page.getByLabel('Search holdings').fill('reserve');
  await expect(cards).toHaveCount(1);
  await page.getByLabel('Search holdings').fill('missing');
  await expect(page.getByRole('status')).toContainText('No matching holdings');
  await page.getByLabel('Search holdings').fill('');
  await expect(cards).toHaveCount(2);
  await cards
    .first()
    .getByRole('button', { name: 'Edit product', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Edit Product', exact: true }),
  ).toBeVisible();
});

test('keeps glass surfaces and content usable on mobile with reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(
    page.getByText('Beyond the balance', { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await openProductsTab(page);
  await page.getByLabel('Search holdings').fill('EUR');
  await expect(page.getByTestId('product-card')).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

/** Large portfolios must retain readable amounts without overflowing their cards. */
test('contains large balances on a narrow screen', async ({ page }) => {
  await prisma.customProductContribution.updateMany({
    data: { amount: 9876543210, amountEur: 9876543210 },
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const total = page.getByRole('group', { name: 'Total Value', exact: true });
  await expect(total).toContainText('19.753.086.420');
  expect(
    await total.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

/** The workspace navigation stays centered at both desktop and mobile widths. */
test('centers dashboard navigation across breakpoints', async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const tabs = page.getByRole('tablist', { name: 'Dashboard sections' });
    await expect(tabs).toBeVisible();
    const bounds = await tabs.boundingBox();
    expect(bounds).not.toBeNull();
    expect(Math.abs(bounds!.x + bounds!.width / 2 - width / 2)).toBeLessThan(2);
  }
});
