import { test, expect, type Page } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

const prisma = new PrismaClient();

/** Seeds a deterministic EUR cash balance without market quotes or accrued returns. */
async function seedCapital(): Promise<void> {
  await prisma.financialProduct.create({
    data: {
      name: 'Runway cash fixture',
      type: 'CUSTOM',
      assetCategory: 'CASH',
      quantity: 1,
      daysToLiquidity: 0,
      custom: {
        create: {
          currency: 'EUR',
          annualReturnRate: 0,
          contributions: {
            create: {
              amount: 120000,
              amountEur: 120000,
              date: new Date('2026-01-01T00:00:00Z'),
            },
          },
        },
      },
    },
  });
}

/** Enters the two primary assumptions through the same labels used by keyboard users. */
async function enterMonthlyCost(page: Page, cost: string, inflation = '2') {
  await page
    .getByLabel('Monthly living cost (EUR)', { exact: true })
    .fill(cost);
  await page
    .getByLabel('Annual inflation (%)', { exact: true })
    .fill(inflation);
}

test.beforeEach(async ({ page }) => {
  await cleanDatabase();
  await seedCapital();
  await authenticateTestUser(page);
  await page.goto('http://localhost:3000/dashboard/runway');
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

/** Unconfigured settings must request a real monthly cost rather than imply a free lifestyle. */
test('starts with the monthly cost and inflation, without invented results', async ({
  page,
}) => {
  await expect(
    page.getByLabel('Monthly living cost (EUR)', { exact: true }),
  ).toHaveValue('');
  await expect(
    page.getByLabel('Annual inflation (%)', { exact: true }),
  ).toHaveValue('2');
  await expect(
    page.getByRole('button', { name: 'Save settings', exact: true }),
  ).toBeDisabled();
  await expect(page.getByTestId('runway-duration')).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: 'FIRE estimate', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText(
      'Add your monthly living cost and inflation to calculate your runway and FIRE target',
    ),
  ).toBeVisible();
});

/** Save/reload and dashboard navigation must share persisted settings; a draft must remain local. */
test('persists assumptions and refreshes the dashboard without saving previews', async ({
  page,
}) => {
  await enterMonthlyCost(page, '1000');
  await expect(page.getByRole('status')).toContainText('Unsaved preview');
  await page
    .getByRole('button', { name: 'Save settings', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Settings saved');
  const persisted = await prisma.runwaySettings.findUnique({
    where: { id: 'default' },
  });
  expect(persisted?.monthlyExpenses).toBe(1000);
  expect(persisted?.annualInflation).toBeCloseTo(0.02);

  await page
    .getByLabel('Monthly living cost (EUR)', { exact: true })
    .fill('2000');
  await expect(page.getByRole('status')).toContainText('Unsaved preview');
  await page.reload();
  await expect(
    page.getByLabel('Monthly living cost (EUR)', { exact: true }),
  ).toHaveValue('1000');
  await expect(
    page.getByLabel('Annual inflation (%)', { exact: true }),
  ).toHaveValue('2');
  await enterMonthlyCost(page, '2000');
  await page
    .getByRole('button', { name: 'Save settings', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Settings saved');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Financial runway', exact: true }),
  ).toContainText('2000,00');
  await page.getByRole('link', { name: 'Runway & FIRE', exact: true }).click();
  await expect(
    page.getByLabel('Monthly living cost (EUR)', { exact: true }),
  ).toHaveValue('2000');
});

/** An expired session must preserve the draft and allow recovery without writing unauthenticated data. */
test('retains the draft after an expired-session save and allows retry', async ({
  page,
}) => {
  await page.context().clearCookies();
  await enterMonthlyCost(page, '1000');
  await page
    .getByRole('button', { name: 'Save settings', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'Your session has expired. Sign in to save your plan.',
  );
  expect(await prisma.runwaySettings.count()).toBe(0);
  await expect(
    page.getByLabel('Monthly living cost (EUR)', { exact: true }),
  ).toHaveValue('1000');
  await expect(
    page.getByLabel('Annual inflation (%)', { exact: true }),
  ).toHaveValue('2');

  await authenticateTestUser(page);
  await page
    .getByRole('button', { name: 'Save settings', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Settings saved');
  expect(await prisma.runwaySettings.count()).toBe(1);
  await page.reload();
  await expect(
    page.getByLabel('Monthly living cost (EUR)', { exact: true }),
  ).toHaveValue('1000');
});

/** Zero growth has an exact savings requirement and FIRE excludes the separately entered salary. */
test('calculates required monthly savings and identifies a reached FIRE target', async ({
  page,
}) => {
  await enterMonthlyCost(page, '1000', '0');
  await page.getByText('Income & simulation settings', { exact: true }).click();
  await page.getByLabel('Years to reach FIRE', { exact: true }).fill('1');
  await page
    .getByLabel('Annual return override (%)', { exact: true })
    .fill('0');
  await expect(page.getByTestId('runway-duration')).toHaveText('10 years');
  await expect(page.getByTestId('fire-monthly-required')).toContainText(
    '15.000,00',
  );
  await page
    .getByLabel('Other net income per month (EUR)', { exact: true })
    .fill('1000');
  await expect(page.getByTestId('runway-duration')).toHaveText('50+ years');
  const fire = page.getByRole('region', { name: 'FIRE estimate', exact: true });
  await expect(fire.getByText('FIRE', { exact: true })).toHaveCount(0);
  await page
    .getByLabel('Monthly living cost (EUR)', { exact: true })
    .fill('100');
  await expect(fire.getByText('FIRE', { exact: true })).toBeVisible();
  await expect(page.getByTestId('fire-monthly-required')).toContainText('0,00');
});

/** Inputs, results, charts and the fifth navigation item must remain usable at the narrowest viewport. */
test('keeps the simulation usable on mobile and exposes readable chart figures', async ({
  page,
}) => {
  await enterMonthlyCost(page, '1000');
  await page.getByText('Income & simulation settings', { exact: true }).click();
  await page
    .getByLabel('Monthly investment after living costs (EUR)', { exact: true })
    .fill('500');
  await page.getByLabel('Years to reach FIRE', { exact: true }).fill('5');
  await page
    .getByLabel('Annual return override (%)', { exact: true })
    .fill('5');
  await page
    .getByRole('button', { name: 'Save settings', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Settings saved');
  await expect(
    page.getByRole('button', { name: 'Save settings', exact: true }),
  ).toBeVisible();
  await page.getByText('Income & simulation settings', { exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: test.info().outputPath('runway-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(
    page.getByRole('region', { name: 'Monthly cost coverage', exact: true }),
  ).toBeVisible();
  const link = page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Runway', exact: true });
  await expect(link).toHaveAttribute('aria-current', 'page');
  const bounds = await link.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(44);
  expect(bounds!.height).toBeGreaterThanOrEqual(44);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  const chart = page.getByRole('region', {
    name: 'Building toward FIRE',
    exact: true,
  });
  await chart.getByText('View yearly figures', { exact: true }).click();
  await expect(chart.getByRole('table')).toBeVisible();
  await expect(chart.getByRole('row')).toHaveCount(7);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: test.info().outputPath('runway-mobile.png'),
    fullPage: true,
  });
});
