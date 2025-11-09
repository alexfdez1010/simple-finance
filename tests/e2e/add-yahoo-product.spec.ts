/**
 * E2E tests for adding Yahoo Finance products
 * @module tests/e2e/add-yahoo-product
 */

import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

/**
 * Test suite for Yahoo Finance product creation flow
 */
test.describe('Add Yahoo Finance Product', () => {
  test.beforeEach(async ({ page }) => {
    // Clean database before each test to ensure isolation
    await cleanDatabase();

    // Authenticate before each test
    await authenticateTestUser(page);
  });
  /**
   * Test: Successfully create a Yahoo Finance product and verify it appears in dashboard
   */
  test('should create a Yahoo Finance product and display it in the dashboard', async ({
    page,
  }) => {
    // Navigate to the add Yahoo Finance product page
    await page.goto('http://localhost:3000/products/add');

    // Verify we're on the correct page
    await expect(page).toHaveTitle(/Simple Finance/);
    await expect(
      page.getByRole('heading', { name: 'Add Yahoo Finance Product' }),
    ).toBeVisible();

    // Fill in the product name
    const productName = `Test Apple Stock ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);

    // Fill in the stock symbol and trigger validation
    const symbolInput = page.getByLabel('Stock Symbol');
    await symbolInput.fill('AAPL');
    await symbolInput.blur(); // Trigger validation on blur

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

    // Wait for navigation to dashboard
    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Reload the page to ensure fresh data (bypass cache)
    await page.reload({ waitUntil: 'networkidle' });

    // Verify the product appears in the dashboard
    await expect(page.getByText(productName)).toBeVisible({ timeout: 15000 });

    // Verify product card displays key information
    // Use the specific product card class and filter by product name
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: productName })
      .first();
    await expect(productCard.getByText(/Symbol: AAPL/).nth(0)).toBeVisible();
    await expect(productCard).toContainText('Quantity');
    await expect(productCard).toContainText('Current Value');
  });

  /**
   * Test: Validate error handling for invalid stock symbol
   */
  test('should show error for invalid stock symbol', async ({ page }) => {
    // Navigate to the add Yahoo Finance product page
    await page.goto('http://localhost:3000/products/add');

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

    // Verify the submit button is present but form won't submit
    await expect(
      page.getByRole('button', { name: 'Add Product' }),
    ).toBeVisible();
  });

  /**
   * Test: Validate form requires all fields
   */
  test('should require all fields to be filled', async ({ page }) => {
    // Navigate to the add Yahoo Finance product page
    await page.goto('http://localhost:3000/products/add');

    // Try to submit empty form
    await page.getByRole('button', { name: 'Add Product' }).click();

    // Verify we're still on the add page (form validation prevented submission)
    await expect(page).toHaveURL('http://localhost:3000/products/add');
  });

  /**
   * Test: Cancel button navigates back to dashboard
   */
  test('should navigate back to dashboard when cancel is clicked', async ({
    page,
  }) => {
    // Navigate to the add Yahoo Finance product page
    await page.goto('http://localhost:3000/products/add');

    // Click the cancel button
    await page.getByRole('link', { name: 'Cancel' }).click();

    // Verify navigation to dashboard
    await page.waitForURL('http://localhost:3000/dashboard');
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  /**
   * Test: Back to Dashboard link works
   */
  test('should navigate back to dashboard via back link', async ({ page }) => {
    // Navigate to the add Yahoo Finance product page
    await page.goto('http://localhost:3000/products/add');

    // Click the back to dashboard link
    await page.getByRole('link', { name: '← Back to Dashboard' }).click();

    // Verify navigation to dashboard
    await page.waitForURL('http://localhost:3000/dashboard');
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  /**
   * Test: Symbol is converted to uppercase on submission
   */
  test('should handle lowercase symbol input', async ({ page }) => {
    // Navigate to the add Yahoo Finance product page
    await page.goto('http://localhost:3000/products/add');

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
    // Navigate to the add Yahoo Finance product page
    await page.goto('http://localhost:3000/products/add');

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
