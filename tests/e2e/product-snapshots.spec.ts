/**
 * E2E coverage for the per-product daily EUR snapshot table and the
 * product-history dialog (Eye button on each card).
 *
 * Mirrors the structure of `portfolio-snapshots.spec.ts`: drives the cron
 * route via Playwright's request fixture, then asserts both the JSON
 * response and the persisted `product_snapshots` rows in the test DB.
 *
 * @module tests/e2e/product-snapshots
 */

import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase, openProductsTab } from './test-helpers';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

test.describe('Per-product snapshots and history dialog', () => {
  test.beforeEach(async ({ page }) => {
    await cleanDatabase();
    await authenticateTestUser(page);
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('cron route writes a product_snapshots row per product (EUR)', async ({
    page,
    request,
  }) => {
    // Seed one custom product so the cron has something to snapshot.
    // A custom product is the cheapest path: no Yahoo round-trip to fail.
    const productName = `Cron Custom ${Date.now()}`;
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();
    await page.getByRole('tab', { name: 'Custom Product' }).click();
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Rate (%)').fill('4');
    await page.getByLabel('Currency', { exact: true }).selectOption('EUR');
    await page.locator('#custom-investment').fill('1000');
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    await page
      .locator('#custom-date')
      .fill(oneYearAgo.toISOString().split('T')[0]);
    await page.getByRole('button', { name: 'Add Product' }).click();
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    const before = await prisma.productSnapshot.count();

    const cronToken = process.env.CRON_SECRET || 'test-token';
    const response = await request.get(
      'http://localhost:3000/api/cron/snapshot',
      { headers: { Authorization: `Bearer ${cronToken}` } },
    );
    expect(response.ok()).toBeTruthy();

    // Snapshot row written for the seeded product, in EUR (>= 1000 due to
    // a year of 4% compounding) and dated today.
    const snapshots = await prisma.productSnapshot.findMany({
      include: { product: true },
    });
    expect(snapshots.length).toBe(before + 1);
    const row = snapshots.find((s) => s.product.name === productName)!;
    expect(row).toBeDefined();
    expect(row.value).toBeGreaterThan(1000);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(row.date.toISOString().slice(0, 10)).toBe(
      today.toISOString().slice(0, 10),
    );
  });

  test('cron is idempotent — second call upserts the same row', async ({
    page,
    request,
  }) => {
    const productName = `Cron Idempotent ${Date.now()}`;
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();
    await page.getByRole('tab', { name: 'Custom Product' }).click();
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Rate (%)').fill('3');
    await page.getByLabel('Currency', { exact: true }).selectOption('EUR');
    await page.locator('#custom-investment').fill('500');
    await page
      .locator('#custom-date')
      .fill(new Date().toISOString().split('T')[0]);
    await page.getByRole('button', { name: 'Add Product' }).click();
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    const cronToken = process.env.CRON_SECRET || 'test-token';
    const url = 'http://localhost:3000/api/cron/snapshot';
    const headers = { Authorization: `Bearer ${cronToken}` };

    await request.get(url, { headers });
    const afterFirst = await prisma.productSnapshot.count();
    await request.get(url, { headers });
    const afterSecond = await prisma.productSnapshot.count();

    expect(afterSecond).toBe(afterFirst);
  });

  test('product card eye button opens the history dialog', async ({ page }) => {
    const productName = `History Dialog ${Date.now()}`;
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();
    await page.getByRole('tab', { name: 'Custom Product' }).click();
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Rate (%)').fill('5');
    await page.getByLabel('Currency', { exact: true }).selectOption('EUR');
    await page.locator('#custom-investment').fill('2000');
    await page
      .locator('#custom-date')
      .fill(new Date().toISOString().split('T')[0]);
    await page.getByRole('button', { name: 'Add Product' }).click();
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    await page.reload({ waitUntil: 'networkidle' });
    await openProductsTab(page);

    const card = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await card.hover();
    await card.getByRole('button', { name: 'View product history' }).click();

    // Dialog title carries the product name; horizon controls show the
    // simulation buttons because the seeded product is custom.
    await expect(
      page.getByRole('heading', { name: productName }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '+1y' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+5y' })).toBeVisible();
  });
});
