/**
 * E2E tests for adding Yahoo Finance products via dialog
 * @module tests/e2e/add-yahoo-product
 */

import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase, openProductsTab } from './test-helpers';

/**
 * Test suite for Yahoo Finance product creation flow
 */
test.describe('Add Yahoo Finance Product', () => {
  test.beforeEach(async ({ page }) => {
    await cleanDatabase();
    await authenticateTestUser(page);
  });

  /**
   * Test: Successfully create a Yahoo Finance product via dialog
   */
  test('should create a Yahoo Finance product and display it in the dashboard', async ({
    page,
  }) => {
    // Open add product dialog from dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Yahoo Product' }).click();

    // Verify dialog opened with Yahoo Finance tab active
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).toBeVisible();

    // Fill in the product name
    const productName = `Test Apple Stock ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);

    // Fill in the stock symbol and trigger validation
    const symbolInput = page.getByLabel('Stock Symbol');
    await symbolInput.fill('AAPL');
    await symbolInput.blur();

    // Wait for symbol validation to complete
    await expect(page.getByText('Validating symbol...')).toBeVisible();
    await expect(page.getByText(/Valid symbol: AAPL/i)).toBeVisible({
      timeout: 10000,
    });

    // Verify purchase price was auto-filled
    const purchasePriceInput = page.getByLabel('Purchase Price (€)');
    await expect(purchasePriceInput).not.toHaveValue('');

    // Fill in the purchase date
    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Purchase Date').fill(today);

    // Fill in the quantity
    await page.getByLabel('Quantity').fill('10');

    // Submit the form
    await page.getByRole('button', { name: 'Add Product' }).click();

    // Wait for dialog to close and page to refresh
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible({ timeout: 10000 });

    // Reload the page to ensure fresh data
    await page.reload({ waitUntil: 'networkidle' });
    await openProductsTab(page);

    // Verify the product appears in the dashboard
    await expect(page.getByRole('heading', { name: productName })).toBeVisible({
      timeout: 15000,
    });

    // Verify product card displays key information
    const productCard = page
      .locator('.glass-card.rounded-xl')
      .filter({ hasText: productName })
      .first();
    await expect(productCard.getByText('AAPL').nth(0)).toBeVisible();
    await expect(productCard).toContainText('Quantity');
    await expect(productCard).toContainText('Current Price');
    await expect(productCard).toContainText('Avg. Purchase');
  });

  /**
   * Test: Validate error handling for invalid stock symbol
   */
  test('should show error for invalid stock symbol', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Yahoo Product' }).click();

    // Fill in the product name
    await page.getByLabel('Product Name').fill('Invalid Stock');

    // Fill in an invalid stock symbol
    const symbolInput = page.getByLabel('Stock Symbol');
    await symbolInput.fill('INVALIDXYZ123');
    await symbolInput.blur();

    // Wait for validation to complete
    await expect(page.getByText('Validating symbol...')).toBeVisible();

    // Verify error message appears
    await expect(
      page.getByText(/Invalid symbol|Failed to validate symbol/i),
    ).toBeVisible({ timeout: 10000 });

    // Verify the submit button is present
    await expect(
      page.getByRole('button', { name: 'Add Product' }),
    ).toBeVisible();
  });

  /**
   * Test: Validate form requires all fields
   */
  test('should require all fields to be filled', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Yahoo Product' }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: 'Add Product' }).click();

    // Verify dialog is still open (form validation prevented submission)
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).toBeVisible();
  });

  /**
   * Test: Dialog can be closed
   */
  test('should close dialog when close button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Yahoo Product' }).click();

    // Verify dialog is open
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).toBeVisible();

    // Close the dialog
    await page.getByRole('button', { name: 'Close' }).click();

    // Verify dialog is closed
    await expect(
      page.getByRole('heading', { name: 'Add Product' }),
    ).not.toBeVisible();
  });

  /**
   * Test: Symbol is converted to uppercase on submission
   */
  test('should handle lowercase symbol input', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Yahoo Product' }).click();

    // Fill in the product name
    await page.getByLabel('Product Name').fill('Test Lowercase Symbol');

    // Fill in lowercase symbol
    const symbolInput = page.getByLabel('Stock Symbol');
    await symbolInput.fill('aapl');
    await symbolInput.blur();

    // Wait for validation - the backend converts to uppercase
    await expect(page.getByText(/Valid symbol: AAPL/i)).toBeVisible({
      timeout: 10000,
    });
  });

  /**
   * Test: Auto-fill functionality works for name and purchase price
   */
  test('should auto-fill name and purchase price after symbol validation', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('button', { name: 'Yahoo Product' }).click();

    // Fill in only the stock symbol (leave name empty)
    const symbolInput = page.getByLabel('Stock Symbol');
    await symbolInput.fill('MSFT');
    await symbolInput.blur();

    // Wait for validation
    await expect(page.getByText(/Valid symbol: MSFT/i)).toBeVisible({
      timeout: 10000,
    });

    // Verify name was auto-filled
    const nameInput = page.getByLabel('Product Name');
    await expect(nameInput).not.toHaveValue('');

    // Verify purchase price was auto-filled
    const purchasePriceInput = page.getByLabel('Purchase Price (€)');
    await expect(purchasePriceInput).not.toHaveValue('');
  });
});
