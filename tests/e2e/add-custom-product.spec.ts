/**
 * E2E tests for adding custom products via dialog
 * @module tests/e2e/add-custom-product
 */

import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

/**
 * Test suite for custom product creation flow
 */
test.describe('Add Custom Product', () => {
  test.beforeEach(async ({ page }) => {
    await cleanDatabase();
    await authenticateTestUser(page);
  });

  /**
   * Test: Successfully create a custom product via dialog
   */
  test('should create a custom product and display it in the dashboard', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();

    // Verify dialog opened
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).toBeVisible();

    // Click the Custom Product tab
    await page.getByRole('tab', { name: 'Custom Product' }).click();

    // Fill in the product name
    const productName = `Test Savings Account ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);

    // Fill in the annual return rate
    await page.getByLabel('Annual Rate (%)').fill('5.5');

    // Select currency (default is EUR)
    await page.getByLabel('Currency', { exact: true }).selectOption('EUR');

    // Fill in the initial investment
    await page.getByLabel(/Initial Investment/).fill('10000');

    // Fill in the investment date (30 days ago)
    const investmentDate = new Date();
    investmentDate.setDate(investmentDate.getDate() - 30);
    const dateString = investmentDate.toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(dateString);

    // Fill in the quantity
    await page.getByLabel('Quantity').fill('1');

    // Submit the form
    await page.getByRole('button', { name: 'Add Product' }).click();

    // Wait for dialog to close
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    // Reload the page to ensure fresh data
    await page.reload({ waitUntil: 'networkidle' });

    // Verify the product appears in the dashboard
    await expect(page.getByRole('heading', { name: productName })).toBeVisible({
      timeout: 15000,
    });

    // Verify product card displays key information
    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await expect(productCard).toContainText('Annual Rate');
    await expect(productCard).toContainText('Investment');
    await expect(productCard).toContainText('Quantity');
  });

  /**
   * Test: Create custom product with high return rate
   */
  test('should create a custom product with high return rate', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();
    await page.getByRole('tab', { name: 'Custom Product' }).click();

    const productName = `High Yield Investment ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Rate (%)').fill('15.75');
    await page.getByLabel(/Initial Investment/).fill('5000');

    const investmentDate = new Date();
    investmentDate.setDate(investmentDate.getDate() - 90);
    const dateString = investmentDate.toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(dateString);

    await page.getByLabel('Quantity').fill('2');

    await page.getByRole('button', { name: 'Add Product' }).click();

    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: productName })).toBeVisible({
      timeout: 15000,
    });
    const highYieldCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await expect(highYieldCard.getByText(/15\.75%/)).toBeVisible();
  });

  /**
   * Test: Create custom product with fractional quantity
   */
  test('should create a custom product with fractional quantity', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();
    await page.getByRole('tab', { name: 'Custom Product' }).click();

    const productName = `Fractional Investment ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Rate (%)').fill('3.5');
    await page.getByLabel(/Initial Investment/).fill('1000');

    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(today);

    await page.getByLabel('Quantity').fill('2.5');

    await page.getByRole('button', { name: 'Add Product' }).click();

    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: productName })).toBeVisible({
      timeout: 15000,
    });
  });

  /**
   * Test: Validate form requires all fields
   */
  test('should require all fields to be filled', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();
    await page.getByRole('tab', { name: 'Custom Product' }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: 'Add Product' }).click();

    // Verify dialog is still open
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).toBeVisible();
  });

  /**
   * Test: Dialog can be closed
   */
  test('should close dialog when close button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();

    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();

    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible();
  });

  /**
   * Test: Verify compound interest info box in dialog
   */
  test('should display information about compound interest calculation', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();
    await page.getByRole('tab', { name: 'Custom Product' }).click();

    await expect(page.getByText('How it works')).toBeVisible();
    await expect(
      page.getByText(/compound interest.*A = P\(1 \+ r\/365\)/i),
    ).toBeVisible();
  });

  /**
   * Test: Create product with today's date
   */
  test('should create a custom product with today as investment date', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Custom Product' }).click();
    await page.getByRole('tab', { name: 'Custom Product' }).click();

    const productName = `Today Investment ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Rate (%)').fill('4.0');
    await page.getByLabel(/Initial Investment/).fill('2000');

    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(today);

    await page.getByLabel('Quantity').fill('1');

    await page.getByRole('button', { name: 'Add Product' }).click();

    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: productName })).toBeVisible({
      timeout: 15000,
    });
  });
});
