/**
 * E2E tests for editing and deleting products via dialogs
 * @module tests/e2e/edit-product
 */

import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

/**
 * Helper to create a custom product via dialog
 *
 * @param page - Playwright page
 * @param name - Product name
 * @param rate - Annual return rate
 * @param investment - Initial investment
 * @param date - Investment date
 */
async function createCustomProduct(
  page: import('@playwright/test').Page,
  name: string,
  rate: string,
  investment: string,
  date: string,
) {
  await page.getByRole('button', { name: 'Custom Product' }).click();
  await page.getByRole('tab', { name: 'Custom Product' }).click();
  await page.getByLabel('Product Name').fill(name);
  await page.getByLabel('Annual Rate (%)').fill(rate);
  await page.getByLabel(/Initial Investment/).fill(investment);
  await page.getByLabel('Quantity').fill('1');
  await page.getByLabel('Investment Date').fill(date);
  await page.getByRole('button', { name: 'Add Product' }).click();
  await expect(
    page.getByRole('heading', { name: 'Add Product' }),
  ).not.toBeVisible({ timeout: 10000 });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 15000 });
}

/**
 * Helper to create a Yahoo product via dialog
 *
 * @param page - Playwright page
 * @param name - Product name
 * @param symbol - Stock symbol
 * @param qty - Quantity
 * @param price - Purchase price
 * @param date - Purchase date
 */
async function createYahooProduct(
  page: import('@playwright/test').Page,
  name: string,
  symbol: string,
  qty: string,
  price: string,
  date: string,
) {
  await page.getByRole('button', { name: 'Yahoo Product' }).click();
  await page.getByLabel('Product Name').fill(name);
  const symbolInput = page.getByLabel('Stock Symbol');
  await symbolInput.fill(symbol);
  await symbolInput.blur();
  await expect(
    page.getByText(new RegExp(`Valid symbol: ${symbol}`, 'i')),
  ).toBeVisible({ timeout: 10000 });
  await page.getByLabel('Quantity').fill(qty);
  await page.getByLabel('Purchase Price (€)').fill(price);
  await page.getByLabel('Purchase Date').fill(date);
  await page.getByRole('button', { name: 'Add Product' }).click();
  await expect(
    page.getByRole('heading', { name: 'Add Product' }),
  ).not.toBeVisible({ timeout: 10000 });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 15000 });
}

/**
 * Test suite for product edit and delete functionality
 */
test.describe('Edit Product', () => {
  test.beforeEach(async ({ page }) => {
    await cleanDatabase();
    await authenticateTestUser(page);
    await page.goto('http://localhost:3000/dashboard');
  });

  /**
   * Test: Edit Yahoo Finance product via dialog
   */
  test('should edit Yahoo Finance product successfully', async ({ page }) => {
    const originalName = `AAPL Original ${Date.now()}`;
    await createYahooProduct(
      page,
      originalName,
      'AAPL',
      '10',
      '150.00',
      '2024-01-01',
    );

    // Hover over card to reveal edit button, then click
    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: originalName })
      .first();
    await productCard.hover();
    await productCard.getByRole('button', { name: 'Edit product' }).click({
      force: true,
    });

    // Verify edit dialog opened
    await expect(
      page.getByRole('heading', { name: 'Edit Product' }),
    ).toBeVisible();

    // Verify symbol is read-only
    const symbolField = page.getByLabel('Stock Symbol');
    await expect(symbolField).toBeDisabled({ timeout: 10000 });
    await expect(symbolField).toHaveValue('AAPL');

    // Verify form is pre-populated
    await expect(page.getByLabel('Product Name')).toHaveValue(originalName);
    await expect(page.getByLabel('Quantity')).toHaveValue('10');
    await expect(page.getByLabel('Purchase Price (€)')).toHaveValue('150');
    await expect(page.getByLabel('Purchase Date')).toHaveValue('2024-01-01');

    // Edit the fields
    const updatedName = `AAPL Updated ${Date.now()}`;
    await page.getByLabel('Product Name').fill(updatedName);
    await page.getByLabel('Quantity').fill('15');
    await page.getByLabel('Purchase Price (€)').fill('175.50');
    await page.getByLabel('Purchase Date').fill('2024-02-01');

    // Submit the form
    await page.getByRole('button', { name: 'Update Product' }).click();

    // Wait for dialog to close
    await expect(
      page.getByRole('heading', { name: 'Edit Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    // Reload to verify changes persisted
    await page.reload({ waitUntil: 'networkidle' });

    const updatedCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: updatedName })
      .first();
    await expect(updatedCard).toBeVisible({ timeout: 15000 });
    await expect(updatedCard).toContainText(updatedName);
    await expect(updatedCard).toContainText('AAPL');
    await expect(updatedCard).toContainText('15');
  });

  /**
   * Test: Edit Custom product via dialog
   */
  test('should edit Custom product successfully', async ({ page }) => {
    const originalName = `CUSTOM-EDIT-TEST-${Date.now()}`;
    await createCustomProduct(page, originalName, '5.5', '1000', '2024-01-01');

    // Hover and click edit
    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: originalName })
      .first();
    await productCard.hover();
    await productCard.getByRole('button', { name: 'Edit product' }).click({
      force: true,
    });

    // Verify edit dialog opened
    await expect(
      page.getByRole('heading', { name: 'Edit Product' }),
    ).toBeVisible();

    // Verify form is pre-populated
    await expect(page.getByLabel('Product Name')).toHaveValue(originalName);
    await expect(page.getByLabel('Quantity')).toHaveValue('1');
    await expect(page.getByLabel('Annual Rate (%)')).toHaveValue('5.5');
    await expect(page.getByLabel(/Investment \(/)).toHaveValue('1000');
    await expect(page.getByLabel('Investment Date')).toHaveValue('2024-01-01');

    // Edit all fields
    const updatedName = `Custom Investment Updated ${Date.now()}`;
    await page.getByLabel('Product Name').fill(updatedName);
    await page.getByLabel('Quantity').fill('2');
    await page.getByLabel('Annual Rate (%)').fill('7.25');

    // Submit
    await page.getByRole('button', { name: 'Update Product' }).click();

    await expect(
      page.getByRole('heading', { name: 'Edit Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    await page.reload({ waitUntil: 'networkidle' });

    const updatedCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: updatedName })
      .first();
    await expect(updatedCard).toBeVisible({ timeout: 15000 });
    await expect(updatedCard).toContainText(updatedName);
    await expect(updatedCard).toContainText('Custom');
    await expect(updatedCard).toContainText('2');
  });

  /**
   * Test: Edit button is visible on hover for product cards
   */
  test('should display Edit button on product card hover', async ({ page }) => {
    const productName = `Edit Button Test ${Date.now()}`;
    await createCustomProduct(page, productName, '5.5', '1000', '2024-01-01');

    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();

    await productCard.hover();
    await expect(
      productCard.getByRole('button', { name: 'Edit product' }),
    ).toBeVisible();
  });

  /**
   * Test: Close edit dialog without saving
   */
  test('should close edit dialog without saving changes', async ({ page }) => {
    const originalName = `Cancel Test ${Date.now()}`;
    await createCustomProduct(page, originalName, '5.5', '1000', '2024-01-01');

    // Open edit dialog
    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: originalName })
      .first();
    await productCard.hover();
    await productCard.getByRole('button', { name: 'Edit product' }).click({
      force: true,
    });

    // Make changes but don't save
    await page.getByLabel('Product Name').fill('Should Not Save');

    // Close the dialog
    await page.getByRole('button', { name: 'Close' }).click();

    // Verify original name is still there
    await page.reload({ waitUntil: 'networkidle' });
    const unchangedCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: originalName })
      .first();
    await expect(unchangedCard).toBeVisible({ timeout: 15000 });
    await expect(unchangedCard).not.toContainText('Should Not Save');
  });

  /**
   * Test: Delete product with confirmation dialog
   */
  test('should delete a product with confirmation dialog', async ({ page }) => {
    const productName = `Delete Test ${Date.now()}`;
    await createCustomProduct(page, productName, '5.5', '1000', '2024-01-01');

    // Hover and click delete
    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await productCard.hover();
    await productCard.getByRole('button', { name: 'Delete product' }).click({
      force: true,
    });

    // Verify confirmation dialog appeared
    await expect(
      page.getByRole('heading', { name: 'Delete Product' }),
    ).toBeVisible();
    await expect(page.getByText(/Are you sure.*delete/i)).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: 'Delete' }).click();

    // Wait and reload
    await page.reload({ waitUntil: 'networkidle' });

    // Verify product is gone
    await expect(page.getByRole('heading', { name: productName })).not.toBeVisible({
      timeout: 10000,
    });
  });

  /**
   * Test: Cancel delete confirmation
   */
  test('should cancel delete and keep the product', async ({ page }) => {
    const productName = `Cancel Delete ${Date.now()}`;
    await createCustomProduct(page, productName, '5.5', '1000', '2024-01-01');

    // Hover and click delete
    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await productCard.hover();
    await productCard.getByRole('button', { name: 'Delete product' }).click({
      force: true,
    });

    // Verify confirmation dialog
    await expect(
      page.getByRole('heading', { name: 'Delete Product' }),
    ).toBeVisible();

    // Cancel deletion
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify product is still there
    await expect(page.getByRole('heading', { name: productName })).toBeVisible();
  });

  /**
   * Test: Form validation on edit
   */
  test('should validate required fields on edit', async ({ page }) => {
    const productName = `Validation Test ${Date.now()}`;
    await createCustomProduct(page, productName, '5.5', '1000', '2024-01-01');

    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await productCard.hover();
    await productCard.getByRole('button', { name: 'Edit product' }).click({
      force: true,
    });

    // Clear required field
    await page.getByLabel('Product Name').fill('');

    // Try to submit
    await page.getByRole('button', { name: 'Update Product' }).click();

    // Dialog should still be open (HTML5 validation prevented submission)
    await expect(
      page.getByRole('heading', { name: 'Edit Product' }),
    ).toBeVisible();
  });

  /**
   * Test: Edit preserves product type
   */
  test('should preserve product type after edit', async ({ page }) => {
    const productName = `Type Test ${Date.now()}`;
    await createYahooProduct(
      page,
      productName,
      'MSFT',
      '5',
      '300',
      '2024-01-01',
    );

    // Verify it shows MSFT badge
    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await expect(productCard).toContainText('MSFT');

    // Edit the product
    await productCard.hover();
    await productCard.getByRole('button', { name: 'Edit product' }).click({
      force: true,
    });
    await page.getByLabel('Quantity').fill('10');
    await page.getByRole('button', { name: 'Update Product' }).click();

    await expect(
      page.getByRole('heading', { name: 'Edit Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    await page.reload({ waitUntil: 'networkidle' });

    // Verify it's still a Yahoo Finance product
    const updatedCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await expect(updatedCard).toBeVisible({ timeout: 15000 });
    await expect(updatedCard).toContainText('MSFT');
    await expect(updatedCard).toContainText('10');
  });
});
