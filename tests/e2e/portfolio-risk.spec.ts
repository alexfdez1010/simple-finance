/** Browser regression for contribution-adjusted charts and heatmap details. */
import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('excludes deposits from risk and opens day returns with mouse and keyboard', async ({
  page,
}) => {
  await cleanDatabase();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);
  await prisma.financialProduct.create({
    data: {
      name: 'Risk regression',
      type: 'CUSTOM',
      quantity: 1,
      assetCategory: 'CASH',
      custom: {
        create: {
          currency: 'EUR',
          annualReturnRate: 0,
          contributions: {
            create: [
              { date: yesterday, amount: 100, amountEur: 100 },
              { date: today, amount: 50, amountEur: 50 },
            ],
          },
        },
      },
    },
  });
  await prisma.portfolioSnapshot.createMany({
    data: [
      { date: yesterday, value: 100 },
      { date: today, value: 160 },
    ],
  });
  await authenticateTestUser(page);
  await page.goto('http://localhost:3000/dashboard');
  await page.getByRole('button', { name: 'Risk', exact: true }).click();
  await expect(
    page.getByText('Returns exclude recorded deposits', { exact: false }),
  ).toBeVisible();
  const day = page.getByRole('button', { name: /\+10.00% return/ });
  await day.click();
  await expect(page.getByRole('dialog')).toContainText('+10.00%');
  await expect(page.getByRole('dialog')).toContainText(
    'Return excluding contributions',
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(day).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('+10.00%');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await day.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
});
