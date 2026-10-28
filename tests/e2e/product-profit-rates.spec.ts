import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase, disconnectDatabase } from './test-helpers';

const prisma = new PrismaClient();

test.beforeEach(async ({ page }) => {
  await cleanDatabase();
  for (const [name, annualReturnRate] of [
    ['Projected reserve', 0.365],
    ['Zero-rate reserve', 0],
  ] as const) {
    await prisma.financialProduct.create({
      data: {
        name,
        type: 'CUSTOM',
        assetCategory: 'CASH',
        quantity: 1,
        daysToLiquidity: 0,
        custom: {
          create: {
            currency: 'EUR',
            annualReturnRate,
            contributions: {
              create: { amount: 3650, amountEur: 3650, date: new Date() },
            },
          },
        },
      },
    });
  }
  await authenticateTestUser(page);
});

test.afterAll(async () => {
  await prisma.$disconnect();
  await disconnectDatabase();
});

for (const width of [320, 1440]) {
  test(`cycles individual estimates independently at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://localhost:3000/dashboard/portfolio');
    const estimate = page.getByRole('group', {
      name: 'Estimated profit for Projected reserve',
    });
    const zero = page.getByRole('group', {
      name: 'Estimated profit for Zero-rate reserve',
    });
    await expect(estimate).toContainText('Estimated daily profit');
    await expect(estimate).toContainText('+3,65');
    await expect(estimate).toContainText('+0.10%');
    await expect(zero).toContainText('+0.00%');

    const cycle = estimate.getByRole('button', { name: 'Show weekly profit' });
    await cycle.focus();
    await page.keyboard.press('Enter');
    await expect(estimate).toContainText('Estimated weekly profit');
    await expect(estimate).toContainText('+25,55');
    await expect(estimate).toContainText('+0.70%');
    for (const [next, amount, pct] of [
      ['monthly', '+109,50', '+3.00%'],
      ['annual', '+1332,25', '+36.50%'],
      ['daily', '+3,65', '+0.10%'],
    ]) {
      await estimate
        .getByRole('button', { name: `Show ${next} profit` })
        .click();
      await expect(estimate).toContainText(`Estimated ${next} profit`);
      await expect(estimate).toContainText(amount);
      await expect(estimate).toContainText(pct);
      await expect(zero).toContainText('Estimated daily profit');
    }
    const bounds = await estimate.getByRole('button').boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `/tmp/simple-finance-product-profits-${width}.png`,
      fullPage: true,
    });

    await page.getByRole('link', { name: 'Home', exact: true }).click();
    const global = page.getByRole('group', {
      name: 'Projected profit',
      exact: true,
    });
    await expect(global).toContainText('Estimated daily profit');
    await expect(global).toContainText('+3,65');
    await global.getByRole('button', { name: 'Show weekly profit' }).click();
    await expect(global).toContainText('+25,55');
  });
}
