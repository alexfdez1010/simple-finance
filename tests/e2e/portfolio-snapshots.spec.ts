import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';

test.describe('Portfolio Snapshots and Charts', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate before each test
    await authenticateTestUser(page);
  });

  test('should show empty state when no snapshots exist', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for empty state in charts
    const evolutionChart = page.locator('text=Portfolio Evolution').first();
    await expect(evolutionChart).toBeVisible();

    // Check for empty state message (either chart can have it)
    const emptyMessage = page
      .locator('text=No historical data available yet')
      .first();
    await expect(emptyMessage).toBeVisible({ timeout: 10000 });
  });

  test('should create snapshot via API endpoint with valid token', async ({
    request,
  }) => {
    const cronToken = process.env.CRON_TOKEN || 'test-token';

    // Call the snapshot API endpoint
    const response = await request.post(
      'http://localhost:3000/api/cron/snapshot',
      {
        headers: {
          Authorization: `Bearer ${cronToken}`,
        },
      },
    );

    // Should succeed (200) or return no products message (200)
    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Check response structure
    expect(data).toHaveProperty('message');

    // If products exist, should have snapshot data
    if (data.snapshot) {
      expect(data.snapshot).toHaveProperty('date');
      expect(data.snapshot).toHaveProperty('value');
      expect(data.stats).toHaveProperty('totalValue');
      expect(data.stats).toHaveProperty('totalReturn');
      expect(data.stats).toHaveProperty('totalReturnPercentage');
    }
  });

  test('should reject API call without authorization header', async ({
    request,
  }) => {
    // Call without authorization header
    const response = await request.post(
      'http://localhost:3000/api/cron/snapshot',
    );

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('authorization');
  });

  test('should reject API call with invalid token', async ({ request }) => {
    // Call with invalid token
    const response = await request.post(
      'http://localhost:3000/api/cron/snapshot',
      {
        headers: {
          Authorization: 'Bearer invalid-token-12345',
        },
      },
    );

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('Invalid authorization token');
  });

  test('should handle API errors gracefully', async ({ request }) => {
    // Test with missing CRON_TOKEN environment variable
    // This should return 500 if CRON_TOKEN is not set
    // Or 401 if token is invalid

    const response = await request.post(
      'http://localhost:3000/api/cron/snapshot',
      {
        headers: {
          Authorization: 'Bearer wrong-token',
        },
      },
    );

    // Should return error status
    expect(response.status()).toBeGreaterThanOrEqual(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should display portfolio statistics correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for portfolio stats section
    const portfolioOverview = page.locator('text=Portfolio Overview');
    await expect(portfolioOverview).toBeVisible();

    // Stats should be visible even with no products
    const statsSection = page.locator('text=Total Value').first();
    await expect(statsSection).toBeVisible({ timeout: 10000 });
  });

  // Note: This test requires manual testing due to Playwright auth cookie limitations
  test.skip('should format currency values correctly in charts', async ({
    page,
    request,
  }) => {
    // Create a product with known value
    await page.goto('http://localhost:3000/products/add-custom');
    
    // Ensure we're on the right page and not redirected
    await page.waitForURL('http://localhost:3000/products/add-custom');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="name"]', `Currency Test ${Date.now()}`);
    await page.fill('input[name="initialInvestment"]', '10000');
    await page.fill('input[name="annualReturnRate"]', '5');
    await page.fill('input[name="quantity"]', '1');

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    await page.fill(
      'input[name="investmentDate"]',
      oneWeekAgo.toISOString().split('T')[0],
    );

    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/dashboard', {
      timeout: 10000,
    });

    // Create snapshot
    const cronToken = process.env.CRON_TOKEN || 'test-token';
    const response = await request.post(
      'http://localhost:3000/api/cron/snapshot',
      {
        headers: {
          Authorization: `Bearer ${cronToken}`,
        },
      },
    );

    expect(response.ok()).toBeTruthy();

    // Reload and check for EUR symbol
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for EUR currency symbol in the page
    const eurSymbol = page.locator('text=/€/').first();
    await expect(eurSymbol).toBeVisible({ timeout: 10000 });
  });
});
