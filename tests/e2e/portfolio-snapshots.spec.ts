import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

test.describe('Portfolio Snapshots and Charts', () => {
  test.beforeEach(async ({ page }) => {
    // Clean database before each test to ensure isolation
    await cleanDatabase();

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

    const monthlyChart = page.locator('text=Monthly Wealth Evolution').first();
    await expect(monthlyChart).toBeVisible();

    await page.getByRole('button', { name: 'Risk', exact: true }).click();
    const dailyChart = page.locator('text=Daily Changes').first();
    await expect(dailyChart).toBeVisible();

    await page.getByRole('button', { name: 'Overview', exact: true }).click();
    // Check the overview empty state after returning from Risk.
    const emptyMessage = page
      .locator('text=No historical data available yet')
      .first();
    await expect(emptyMessage).toBeVisible({ timeout: 10000 });
  });

  test('should show daily change statistics in Portfolio Overview', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');

    // Latest snapshot change stat card should be visible in the stats section
    const todayStats = page.locator('text=Latest change').first();
    await expect(todayStats).toBeVisible({ timeout: 10000 });
  });

  test('should create snapshot via API endpoint with valid token', async ({
    request,
  }) => {
    const cronToken = process.env.CRON_SECRET || 'test-token';

    // Call the snapshot API endpoint
    const response = await request.get(
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
    const response = await request.get(
      'http://localhost:3000/api/cron/snapshot',
    );

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('authorization');
  });

  test('should reject API call with invalid token', async ({ request }) => {
    // Call with invalid token
    const response = await request.get(
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

    const response = await request.get(
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

  test('should keep the portfolio cards organized across breakpoints', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');

    const summary = page.getByRole('region', { name: 'Portfolio summary' });
    const total = summary.getByRole('group', { name: 'Total Value' });
    const invested = summary.getByRole('group', { name: 'Invested' });
    const projected = summary.getByRole('group', { name: 'Projected profit' });
    const [totalBox, investedBox, projectedBox] = await Promise.all([
      total.boundingBox(),
      invested.boundingBox(),
      projected.boundingBox(),
    ]);

    expect(totalBox).not.toBeNull();
    expect(investedBox).not.toBeNull();
    expect(projectedBox).not.toBeNull();
    expect(totalBox!.height).toBeGreaterThan(investedBox!.height * 1.8);
    expect(projectedBox!.x).toBeGreaterThan(totalBox!.x + totalBox!.width);
    expect(projectedBox!.width).toBeGreaterThan(investedBox!.width * 3);

    await page.setViewportSize({ width: 390, height: 844 });
    const [mobileTotal, mobileInvested, mobileProjected, hasOverflow] =
      await Promise.all([
        total.boundingBox(),
        invested.boundingBox(),
        projected.boundingBox(),
        page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        ),
      ]);

    expect(mobileTotal!.width).toBeGreaterThan(mobileInvested!.width * 1.8);
    expect(mobileProjected!.width).toBeCloseTo(mobileTotal!.width, 0);
    expect(hasOverflow).toBe(false);
  });
});
