/**
 * E2E tests for editing products
 * @module tests/e2e/edit-product
 */

import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

/**
 * Test suite for product edit functionality
 */
test.describe('Edit Product', () => {
  test.beforeEach(async ({ page }) => {
    // Clean database before each test to ensure isolation
    await cleanDatabase();

    // Authenticate before each test
    await authenticateTestUser(page);
  });

  /**
   * Test: Edit Yahoo Finance product - update name, quantity, and purchase price
   */
  test('should edit Yahoo Finance product successfully', async ({ page }) => {
    // First, create a Yahoo Finance product to edit
    await page.goto('http://localhost:3000/products/add');

    const originalName = `AAPL Original ${Date.now()}`;
    await page.getByLabel('Product Name').fill(originalName);

    const symbolInput = page.getByLabel('Stock Symbol');
    await symbolInput.fill('AAPL');
    await symbolInput.blur();

    await expect(page.getByText(/Valid symbol: AAPL/i)).toBeVisible({
      timeout: 10000,
    });

    await page.getByLabel('Quantity').fill('10');
    await page.getByLabel('Purchase Price (€)').fill('150.00');
    await page.getByLabel('Purchase Date').fill('2024-01-01');

    await page.getByRole('button', { name: 'Add Product' }).click();

    // Wait for redirect to dashboard
    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Reload to bypass cache
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product name to appear
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 15000 });

    // Find the product card and click Edit
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: originalName })
      .first();

    await expect(productCard).toBeVisible({ timeout: 15000 });
    await productCard.locator('a[aria-label="Edit product"]').nth(0).click();

    // Verify we're on the edit page
    await expect(page).toHaveURL(/\/products\/edit\//);
    await expect(
      page.getByRole('heading', { name: 'Edit Product' }),
    ).toBeVisible();

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Verify symbol is read-only (confirms it's a Yahoo Finance product)
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

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Reload to bypass cache
    await page.reload({ waitUntil: 'networkidle' });

    // Verify the updated product appears in dashboard
    const updatedCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: updatedName })
      .first();

    await expect(updatedCard).toBeVisible({ timeout: 15000 });
    await expect(updatedCard).toContainText(updatedName);
    await expect(updatedCard).toContainText('Symbol: AAPL');
    await expect(updatedCard).toContainText('15'); // Updated quantity
  });

  /**
   * Test: Edit Custom product - update all fields
   */
  test('should edit Custom product successfully', async ({ page }) => {
    // First, create a Custom product to edit
    await page.goto('http://localhost:3000/products/add-custom');

    // Use a very unique name to avoid conflicts with other tests
    const originalName = `CUSTOM-EDIT-TEST-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await page.getByLabel('Product Name').fill(originalName);
    await page.getByLabel('Annual Return Rate (%)').fill('5.5');
    await page.getByLabel('Initial Investment (€)').fill('1000');
    await page.getByLabel('Quantity').fill('1');
    await page.getByLabel('Investment Date').fill('2024-01-01');

    await page.getByRole('button', { name: 'Add Product' }).click();

    // Wait for redirect to dashboard
    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Reload to bypass cache
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product name to appear
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 15000 });

    // Wait a bit more to ensure page is fully loaded
    await page.waitForTimeout(1000);

    // Find the product card by looking for the exact heading text
    const productHeading = page.getByRole('heading', {
      name: originalName,
      exact: true,
    });
    await expect(productHeading).toBeVisible({ timeout: 15000 });

    // Navigate up to the card container and find the Edit link
    const productCard = productHeading.locator('../..');
    await productCard.getByRole('link', { name: 'Edit' }).click();

    // Verify we're on the edit page
    await expect(page).toHaveURL(/\/products\/edit\//);
    await expect(
      page.getByRole('heading', { name: 'Edit Product' }),
    ).toBeVisible();

    // Verify form is pre-populated (confirms it's a custom product)
    await expect(page.getByLabel('Product Name')).toHaveValue(originalName);
    await expect(page.getByLabel('Quantity')).toHaveValue('1');
    await expect(page.getByLabel('Annual Return Rate (%)')).toHaveValue('5.5');
    await expect(page.getByLabel('Initial Investment (€)')).toHaveValue('1000');
    await expect(page.getByLabel('Investment Date')).toHaveValue('2024-01-01');

    // Edit all fields
    const updatedName = `Custom Investment Updated ${Date.now()}`;
    await page.getByLabel('Product Name').fill(updatedName);
    await page.getByLabel('Quantity').fill('2');
    await page.getByLabel('Annual Return Rate (%)').fill('7.25');
    await page.getByLabel('Initial Investment (€)').fill('2500');
    await page.getByLabel('Investment Date').fill('2024-03-01');

    // Submit the form
    await page.getByRole('button', { name: 'Update Product' }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Reload to bypass cache
    await page.reload({ waitUntil: 'networkidle' });

    // Verify the updated product appears in dashboard
    const updatedCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: updatedName })
      .first();

    await expect(updatedCard).toBeVisible({ timeout: 15000 });
    await expect(updatedCard).toContainText(updatedName);
    await expect(updatedCard).toContainText('Custom Product');
    await expect(updatedCard).toContainText('2'); // Updated quantity
  });

  /**
   * Test: Edit button is visible on product cards
   */
  test('should display Edit button on all product cards', async ({ page }) => {
    // Create a product first to ensure we have something to test
    await page.goto('http://localhost:3000/products/add-custom');

    const productName = `Edit Button Test ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Return Rate (%)').fill('5.5');
    await page.getByLabel('Initial Investment (€)').fill('1000');
    await page.getByLabel('Quantity').fill('1');
    await page.getByLabel('Investment Date').fill('2024-01-01');

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product to appear
    await expect(page.getByText(productName)).toBeVisible({ timeout: 15000 });

    // Get the product card
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: productName })
      .first();

    // Check that the card has an Edit button
    await expect(
      productCard.locator('a[aria-label="Edit product"]').nth(0),
    ).toBeVisible();
  });

  /**
   * Test: Cancel button returns to dashboard without saving
   */
  test('should cancel edit and return to dashboard without changes', async ({
    page,
  }) => {
    // Create a product first
    await page.goto('http://localhost:3000/products/add-custom');

    const originalName = `Cancel Test ${Date.now()}`;
    await page.getByLabel('Product Name').fill(originalName);
    await page.getByLabel('Annual Return Rate (%)').fill('5.5');
    await page.getByLabel('Initial Investment (€)').fill('1000');
    await page.getByLabel('Quantity').fill('1');
    await page.getByLabel('Investment Date').fill('2024-01-01');

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product name to appear
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 15000 });

    // Click Edit
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: originalName })
      .first();

    await expect(productCard).toBeVisible({ timeout: 15000 });
    await productCard.locator('a[aria-label="Edit product"]').nth(0).click();

    // Make changes but don't save
    await page.getByLabel('Product Name').fill('Should Not Save');
    await page.getByLabel('Quantity').fill('999');

    // Click Cancel
    await page.getByRole('link', { name: 'Cancel' }).click();

    // Verify we're back on dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Reload and verify original name is still there
    await page.reload({ waitUntil: 'networkidle' });
    const unchangedCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: originalName })
      .first();

    await expect(unchangedCard).toBeVisible({ timeout: 15000 });
    await expect(unchangedCard).toContainText(originalName);
    await expect(unchangedCard).not.toContainText('Should Not Save');
  });

  /**
   * Test: Back to Dashboard link works
   */
  test('should navigate back to dashboard using back link', async ({
    page,
  }) => {
    // Create a product first
    await page.goto('http://localhost:3000/products/add-custom');

    const productName = `Back Link Test ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Return Rate (%)').fill('5.5');
    await page.getByLabel('Initial Investment (€)').fill('1000');
    await page.getByLabel('Quantity').fill('1');
    await page.getByLabel('Investment Date').fill('2024-01-01');

    await page.getByRole('button', { name: 'Add Product' }).click();
    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product to appear
    await expect(page.getByText(productName)).toBeVisible({ timeout: 15000 });

    // Find the product card and click Edit
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: productName })
      .first();

    await productCard.locator('a[aria-label="Edit product"]').nth(0).click();

    // Verify we're on edit page
    await expect(page).toHaveURL(/\/products\/edit\//);

    // Click back link
    await page.getByRole('link', { name: '← Back to Dashboard' }).click();

    // Verify we're back on dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  /**
   * Test: Form validation - required fields
   */
  test('should validate required fields on Yahoo Finance product edit', async ({
    page,
  }) => {
    // Create a product first
    await page.goto('http://localhost:3000/products/add');

    const productName = `Validation Test ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);

    const symbolInput = page.getByLabel('Stock Symbol');
    await symbolInput.fill('AAPL');
    await symbolInput.blur();

    await expect(page.getByText(/Valid symbol: AAPL/i)).toBeVisible({
      timeout: 10000,
    });

    await page.getByLabel('Quantity').fill('10');
    await page.getByRole('button', { name: 'Add Product' }).click();

    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product name to appear
    await expect(page.getByText(productName)).toBeVisible({ timeout: 15000 });

    // Click Edit
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: productName })
      .first();

    await expect(productCard).toBeVisible({ timeout: 15000 });
    await productCard.locator('a[aria-label="Edit product"]').nth(0).click();

    // Clear required field
    await page.getByLabel('Product Name').fill('');

    // Try to submit
    await page.getByRole('button', { name: 'Update Product' }).click();

    // Should still be on edit page due to HTML5 validation
    await expect(page).toHaveURL(/\/products\/edit\//);
  });

  /**
   * Test: Form validation - required fields for Custom product
   */
  test('should validate required fields on Custom product edit', async ({
    page,
  }) => {
    // Create a product first
    await page.goto('http://localhost:3000/products/add-custom');

    const productName = `Custom Validation Test ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Return Rate (%)').fill('5.5');
    await page.getByLabel('Initial Investment (€)').fill('1000');
    await page.getByLabel('Quantity').fill('1');
    await page.getByLabel('Investment Date').fill('2024-01-01');

    await page.getByRole('button', { name: 'Add Product' }).click();

    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product name to appear
    await expect(page.getByText(productName)).toBeVisible({ timeout: 15000 });

    // Click Edit
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: productName })
      .first();

    await expect(productCard).toBeVisible({ timeout: 15000 });
    await productCard.locator('a[aria-label="Edit product"]').nth(0).click();

    // Clear required field
    await page.getByLabel('Product Name').fill('');

    // Try to submit
    await page.getByRole('button', { name: 'Update Product' }).click();

    // Should still be on edit page due to HTML5 validation
    await expect(page).toHaveURL(/\/products\/edit\//);
  });

  /**
   * Test: Edit preserves product type
   */
  test('should preserve product type after edit', async ({ page }) => {
    // Create a Yahoo Finance product
    await page.goto('http://localhost:3000/products/add');

    const productName = `Type Test ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);

    const symbolInput = page.getByLabel('Stock Symbol');
    await symbolInput.fill('MSFT');
    await symbolInput.blur();

    await expect(page.getByText(/Valid symbol: MSFT/i)).toBeVisible({
      timeout: 10000,
    });

    await page.getByLabel('Quantity').fill('5');
    await page.getByRole('button', { name: 'Add Product' }).click();

    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product name to appear
    await expect(page.getByText(productName)).toBeVisible({ timeout: 15000 });

    // Verify it's a Yahoo Finance product
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: productName })
      .first();

    await expect(productCard).toBeVisible({ timeout: 15000 });
    await expect(productCard).toContainText('Symbol: MSFT');

    // Edit the product
    await productCard.locator('a[aria-label="Edit product"]').nth(0).click();
    await page.getByLabel('Quantity').fill('10');
    await page.getByRole('button', { name: 'Update Product' }).click();

    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for product name to appear
    await expect(page.getByText(productName)).toBeVisible({ timeout: 15000 });

    // Verify it's still a Yahoo Finance product
    const updatedCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: productName })
      .first();

    await expect(updatedCard).toBeVisible({ timeout: 15000 });
    await expect(updatedCard).toContainText('Symbol: MSFT');
    await expect(updatedCard).toContainText('10');
  });
});
