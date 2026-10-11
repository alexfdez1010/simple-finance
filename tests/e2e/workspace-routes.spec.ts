import { createHash } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase, selectHeroOption } from './test-helpers';

const routes = [
  ['/dashboard', 'Portfolio Overview', 'Home'],
  ['/dashboard/portfolio', 'Your holdings', 'Holdings'],
  ['/dashboard/analytics', 'Portfolio analytics', 'Analytics'],
  ['/dashboard/analytics/allocation', 'Portfolio allocation', 'Analytics'],
  ['/dashboard/analytics/cash-flow', 'Cash flow & liquidity', 'Analytics'],
  ['/dashboard/analytics/risk', 'Risk & daily changes', 'Analytics'],
  ['/dashboard/skill', 'Agent setup', 'Agent setup'],
] as const;

test.beforeEach(async ({ page }) => {
  await cleanDatabase();
  await authenticateTestUser(page);
});

/** Every workspace is independently addressable and reloadable, including empty states. */
test('opens all deep links with their own active navigation and heading', async ({
  page,
}) => {
  for (const [path, heading, active] of routes) {
    await page.goto(`http://localhost:3000${path}`);
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: active, exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await page.reload();
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

/** Home summarizes the portfolio, never serializing the agent credential or every analytics chart. */
test('keeps the landing overview separate from detailed analytics and agent secrets', async ({
  page,
}) => {
  const response = await page.goto('http://localhost:3000/');
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  await expect(
    page.getByRole('region', { name: 'Portfolio summary' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Largest holdings' }),
  ).toBeVisible();
  await expect(
    page.getByLabel('Monthly investment gains', { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByLabel('Agent skill', { exact: true })).toHaveCount(0);
  const token = createHash('sha256')
    .update(process.env.PASSWORD ?? '12345678')
    .digest('hex');
  expect(await response!.text()).not.toContain(token);
  await page.getByRole('link', { name: 'Analytics', exact: true }).click();
  await expect(
    page.getByLabel('Monthly investment gains', { exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});

/** Route changes preserve the display preference without mixing financial source currencies. */
test('preserves display currency across page navigation and reload', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/dashboard');
  await selectHeroOption(page, 'Display currency', 'USD ($)');
  await page.getByRole('link', { name: 'Holdings', exact: true }).click();
  await expect(
    page.getByRole('button', { name: /USD \([\$]\).*Display currency/ }),
  ).toContainText('USD ($)');
  await page.reload();
  await expect(
    page.getByRole('button', { name: /USD \([\$]\).*Display currency/ }),
  ).toContainText('USD ($)');
  await page.getByRole('link', { name: 'Analytics', exact: true }).click();
  await page.getByRole('link', { name: 'Risk', exact: true }).click();
  await expect(
    page.getByRole('button', { name: /USD \([\$]\).*Display currency/ }),
  ).toContainText('USD ($)');
});

/** Mobile navigation and every workspace must remain inside a narrow viewport. */
test('keeps all workspace routes usable at 320px with reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [path, heading] of routes) {
    await page.goto(`http://localhost:3000${path}`);
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
    for (const link of await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link')
      .all()) {
      const bounds = await link.boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

/** Authentication restores the exact workspace destination after signing in. */
test('protects a deep-linked integration page and returns there after login', async ({
  page,
}) => {
  await page.context().clearCookies();
  await page.goto('http://localhost:3000/dashboard/skill');
  await expect(page).toHaveURL(/\/auth\?redirectTo=%2Fdashboard%2Fskill$/);
  await page
    .getByLabel('Password', { exact: true })
    .fill(process.env.PASSWORD ?? '12345678');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL('http://localhost:3000/dashboard/skill');
  await expect(page.getByLabel('Agent skill', { exact: true })).toBeVisible();
});
