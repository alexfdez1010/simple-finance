import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

/** Compact million-scale EUR values hydrate identically in Node and Chromium. */
test('hydrates large compact balances without replacing the server-rendered UI', async ({
  page,
}) => {
  await cleanDatabase();
  await prisma.financialProduct.create({
    data: {
      name: 'Synthetic compact-currency regression',
      type: 'CUSTOM',
      assetCategory: 'CASH',
      quantity: 1,
      custom: {
        create: {
          currency: 'EUR',
          annualReturnRate: 0,
          contributions: {
            create: {
              amount: 49100000,
              amountEur: 49100000,
              date: new Date('2026-01-01T00:00:00Z'),
            },
          },
        },
      },
    },
  });
  const snapshotDate = new Date();
  snapshotDate.setUTCHours(0, 0, 0, 0);
  await prisma.portfolioSnapshot.create({
    data: {
      date: snapshotDate,
      value: 49100000,
      investedEur: 49100000,
    },
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await authenticateTestUser(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/dashboard');
  await expect(
    page.getByRole('group', { name: 'Total Value', exact: true }),
  ).toContainText('49.100.000,00');
  await expect(page.getByRole('table')).toContainText('49,1 M €');
  await expect(
    page
      .getByRole('img', { name: 'Portfolio value across snapshots' })
      .locator('.recharts-area-dot'),
  ).toHaveCount(1);

  await page.getByRole('link', { name: 'Holdings', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your holdings', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
