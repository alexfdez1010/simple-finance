/**
 * E2E tests for adding custom products
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
    // Clean database before each test to ensure isolation
    await cleanDatabase();

    // Authenticate before each test
    await authenticateTestUser(page);
  });
  /**
   * Test: Successfully create a custom product and verify it appears in dashboard
   */
  test('should create a custom product and display it in the dashboard', async ({
    page,
  }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Verify we're on the correct page
    await expect(page).toHaveTitle(/Simple Finance/);
    await expect(
      page.getByRole('heading', { name: 'Add Custom Product' }),
    ).toBeVisible();

    // Fill in the product name
    const productName = `Test Savings Account ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);

    // Fill in the annual return rate
    await page.getByLabel('Annual Return Rate (%)').fill('5.5');

    // Select currency (default is EUR)
    await page.getByLabel('Currency').selectOption('EUR');

    // Fill in the initial investment
    await page.getByLabel('Initial Investment (€)').fill('10000');

    // Fill in the investment date (30 days ago for visible returns)
    const investmentDate = new Date();
    investmentDate.setDate(investmentDate.getDate() - 30);
    const dateString = investmentDate.toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(dateString);

    // Fill in the quantity (default is 1)
    await page.getByLabel('Quantity').fill('1');

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
    const productCard = page
      .locator('.bg-white.dark\\:bg-slate-800.rounded-lg')
      .filter({ hasText: productName })
      .first();
    await expect(productCard).toContainText('Annual Rate');
    await expect(productCard).toContainText('Current Value');
    await expect(productCard).toContainText('Quantity');
  });

  /**
   * Test: Create custom product with high return rate
   */
  test('should create a custom product with high return rate', async ({
    page,
  }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Fill in the form with high return rate
    const productName = `High Yield Investment ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Return Rate (%)').fill('15.75');
    await page.getByLabel('Initial Investment (€)').fill('5000');

    // Set investment date to 90 days ago
    const investmentDate = new Date();
    investmentDate.setDate(investmentDate.getDate() - 90);
    const dateString = investmentDate.toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(dateString);

    await page.getByLabel('Quantity').fill('2');

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
    await expect(page.getByText(/15\.75%/)).toBeVisible();
  });

  /**
   * Test: Create custom product with fractional quantity
   */
  test('should create a custom product with fractional quantity', async ({
    page,
  }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Fill in the form with fractional quantity
    const productName = `Fractional Investment ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Return Rate (%)').fill('3.5');
    await page.getByLabel('Initial Investment (€)').fill('1000');

    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(today);

    // Use fractional quantity
    await page.getByLabel('Quantity').fill('2.5');

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
  });

  /**
   * Test: Validate form requires all fields
   */
  test('should require all fields to be filled', async ({ page }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Try to submit empty form
    await page.getByRole('button', { name: 'Add Product' }).click();

    // Verify we're still on the add page (form validation prevented submission)
    await expect(page).toHaveURL('http://localhost:3000/products/add-custom');
  });

  /**
   * Test: Cancel button navigates back to dashboard
   */
  test('should navigate back to dashboard when cancel is clicked', async ({
    page,
  }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

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
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Click the back to dashboard link
    await page.getByRole('link', { name: '← Back to Dashboard' }).click();

    // Verify navigation to dashboard
    await page.waitForURL('http://localhost:3000/dashboard');
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  /**
   * Test: Verify "How it works" information box is displayed
   */
  test('should display information about compound interest calculation', async ({
    page,
  }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Verify the info box is visible
    await expect(page.getByText('How it works')).toBeVisible();
    await expect(
      page.getByText(/Custom products use compound interest/i),
    ).toBeVisible();
    await expect(page.getByText(/A = P\(1 \+ r\/365\)/)).toBeVisible();
  });

  /**
   * Test: Validate minimum values for numeric fields
   */
  test('should enforce minimum values for numeric inputs', async ({ page }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Fill in the form
    await page.getByLabel('Product Name').fill('Test Product');

    // Try to enter negative return rate
    const returnRateInput = page.getByLabel('Annual Return Rate (%)');
    await returnRateInput.fill('-5');

    // Try to enter zero initial investment
    const investmentInput = page.getByLabel('Initial Investment (€)');
    await investmentInput.fill('0');

    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(today);

    // Try to enter zero quantity
    const quantityInput = page.getByLabel('Quantity');
    await quantityInput.fill('0');

    // Verify minimum value constraints are enforced by HTML5 validation
    // The form should not submit with invalid values
    await page.getByRole('button', { name: 'Add Product' }).click();

    // Should still be on the add page
    await expect(page).toHaveURL('http://localhost:3000/products/add-custom');
  });

  /**
   * Test: Create product with today's date
   */
  test('should create a custom product with today as investment date', async ({
    page,
  }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Fill in the form with today's date
    const productName = `Today Investment ${Date.now()}`;
    await page.getByLabel('Product Name').fill(productName);
    await page.getByLabel('Annual Return Rate (%)').fill('4.0');
    await page.getByLabel('Initial Investment (€)').fill('2000');

    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Investment Date').fill(today);

    await page.getByLabel('Quantity').fill('1');

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
  });

  /**
   * Test: Helper text is displayed for all fields
   */
  test('should display helper text for all input fields', async ({ page }) => {
    // Navigate to the add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Verify helper texts are visible
    await expect(
      page.getByText('Enter the annual return rate as a percentage'),
    ).toBeVisible();
    await expect(page.getByText('Enter amount in euros (€)')).toBeVisible();
    await expect(
      page.getByText('Date when the investment started'),
    ).toBeVisible();
    await expect(
      page.getByText('Number of units (usually 1 for custom products)'),
    ).toBeVisible();
  });
});
