import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

const prisma = new PrismaClient();

test.beforeEach(async ({ page }) => {
  await cleanDatabase();
  await authenticateTestUser(page);
});
test.afterAll(async () => {
  await prisma.$disconnect();
});

/** Verifies server aggregation, chart rendering, signed flows, and mobile layout together. */
test('shows monthly gains excluding deposits and withdrawals', async ({
  page,
}) => {
  const now = new Date();
  const opening = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 0),
  );
  const closing = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0),
  );
  await prisma.financialProduct.create({
    data: {
      name: 'Monthly gain fixture',
      type: 'CUSTOM',
      quantity: 1,
      custom: {
        create: {
          currency: 'EUR',
          annualReturnRate: 0,
          contributions: {
            create: [
              { date: opening, amount: 1000, amountEur: 1000 },
              { date: closing, amount: 500, amountEur: 500 },
              { date: closing, amount: -200, amountEur: -200 },
            ],
          },
        },
      },
    },
  });
  await prisma.portfolioSnapshot.createMany({
    data: [
      { date: opening, value: 1000 },
      { date: closing, value: 1350 },
    ],
  });
  await page.goto('http://localhost:3000/dashboard');
  const card = page.getByLabel('Monthly investment gains', { exact: true });
  await expect(card.getByLabel('Investment gains by month')).toBeVisible();
  await card.getByText('View monthly breakdown', { exact: true }).click();
  const row = card.getByRole('row').nth(1);
  await expect(row).toContainText(closing.toISOString().slice(0, 7));
  const cells = row.getByRole('cell');
  await expect(cells.nth(0)).toContainText('1000,00');
  await expect(cells.nth(1)).toContainText('1350,00');
  await expect(cells.nth(2)).toContainText('300,00');
  await expect(cells.nth(3)).toContainText('50,00');
  await card.screenshot({ path: test.info().outputPath('monthly-gains.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});

/** Insufficient history must explain the missing result rather than invent a zero gain. */
test('explains missing monthly history', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await expect(
    page.getByLabel('Monthly investment gains', { exact: true }),
  ).toContainText('Two consecutive month-end snapshots are required');
});
