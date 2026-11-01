import { test, expect, type Page } from '@playwright/test';
import { PrismaClient } from './database-client';
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

/** Gives the fixture a known positive yield without introducing historical accrued gains. */
async function enablePortfolioReturn(): Promise<void> {
  await prisma.customProductData.updateMany({
    data: { annualReturnRate: 0.05 },
  });
  await prisma.customProductContribution.updateMany({
    data: { date: new Date() },
  });
}

/** Converts the user-facing finite FIRE duration to months for contribution sensitivity checks. */
function fireMonths(duration: string): number {
  const years = duration.match(/(\d+(?:\.\d+)?)\s+years?/);
  const months = duration.match(/(\d+(?:\.\d+)?)\s+mo/);
  if (!years && !months)
    throw new Error(`Expected a finite FIRE duration: ${duration}`);
  return Number(years?.[1] ?? 0) * 12 + Number(months?.[1] ?? 0);
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
  await expect(page.getByRole('spinbutton')).toHaveCount(3);
  await expect(
    page.getByLabel('Monthly investment after living costs (EUR)', {
      exact: true,
    }),
  ).toHaveValue('0');
  for (const removedLabel of [
    'Other net income per month (EUR)',
    'Years to reach FIRE',
    'Annual FIRE withdrawal rate (%)',
    'Annual return override (%)',
  ]) {
    await expect(page.getByLabel(removedLabel, { exact: true })).toHaveCount(0);
  }
  await expect(
    page.getByRole('button', { name: 'Save settings', exact: true }),
  ).toBeDisabled();
  await expect(page.getByTestId('runway-duration')).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: 'FIRE estimate', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText('Enter your monthly living cost to see the projection'),
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

/** Automatic portfolio returns determine FIRE; investing more each month must shorten the computed time. */
test('computes FIRE time from the portfolio and responds to monthly investment', async ({
  page,
}) => {
  await enablePortfolioReturn();
  await page.reload();
  await enterMonthlyCost(page, '1000');
  const withoutInvestment = fireMonths(
    await page.getByTestId('fire-time').innerText(),
  );
  const investment = page.getByLabel(
    'Monthly investment after living costs (EUR)',
    { exact: true },
  );
  await investment.fill('500');
  const with500 = fireMonths(await page.getByTestId('fire-time').innerText());
  expect(with500).toBeLessThan(withoutInvestment);
  await investment.fill('1000');
  const with1000Text = await page.getByTestId('fire-time').innerText();
  expect(fireMonths(with1000Text)).toBeLessThan(with500);
  await page
    .getByRole('button', { name: 'Save settings', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Settings saved');
  await page.reload();
  await expect(investment).toHaveValue('1000');
  await expect(page.getByTestId('fire-time')).toHaveText(with1000Text);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Financial runway', exact: true }),
  ).toContainText(with1000Text);
  await page.getByRole('link', { name: 'Runway & FIRE', exact: true }).click();
  const fire = page.getByRole('region', { name: 'FIRE estimate', exact: true });
  await expect(fire.getByText('FIRE', { exact: true })).toHaveCount(0);
  await page
    .getByLabel('Monthly living cost (EUR)', { exact: true })
    .fill('100');
  await expect(fire.getByText('FIRE', { exact: true })).toBeVisible();
  await expect(page.getByTestId('fire-time')).toHaveText('Reached');
});

/** Obsolete assumptions must have no effect on new calculations and survive a three-field save for rollback. */
test('ignores legacy income and return overrides while preserving their stored values', async ({
  page,
}) => {
  await prisma.runwaySettings.create({
    data: {
      id: 'default',
      monthlyExpenses: 1000,
      annualInflation: 0,
      monthlyContribution: 500,
      monthlyIncome: 100000,
      annualReturnOverride: 0.99,
      withdrawalRate: 0.2,
      targetYears: 1,
    },
  });
  await page.reload();
  await expect(page.getByRole('spinbutton')).toHaveCount(3);
  await expect(page.getByTestId('runway-duration')).toHaveText('10 years');
  await expect(page.getByTestId('fire-time')).toHaveText(
    'Not reached within 50 years',
  );
  const fire = page.getByRole('region', { name: 'FIRE estimate', exact: true });
  await expect(fire).toContainText('Return does not exceed inflation');
  await expect(fire.getByText('Unavailable', { exact: true })).toBeVisible();
  await expect(fire.getByText('FIRE', { exact: true })).toHaveCount(0);
  await page
    .getByLabel('Monthly living cost (EUR)', { exact: true })
    .fill('2000');
  await page
    .getByRole('button', { name: 'Save settings', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Settings saved');
  const row = await prisma.runwaySettings.findUniqueOrThrow({
    where: { id: 'default' },
  });
  expect(row.monthlyExpenses).toBe(2000);
  expect(row.monthlyContribution).toBe(500);
  expect(row.monthlyIncome).toBe(100000);
  expect(row.annualReturnOverride).toBe(0.99);
  expect(row.withdrawalRate).toBe(0.2);
  expect(row.targetYears).toBe(1);
});

/** Inputs, results, charts and the fifth navigation item must remain usable at the narrowest viewport. */
test('keeps the simulation usable on mobile and exposes readable chart figures', async ({
  page,
}) => {
  await enablePortfolioReturn();
  await page.reload();
  await enterMonthlyCost(page, '1000');
  await page
    .getByLabel('Monthly investment after living costs (EUR)', { exact: true })
    .fill('500');
  await page
    .getByRole('button', { name: 'Save settings', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Settings saved');
  await expect(
    page.getByRole('button', { name: 'Save settings', exact: true }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  const costInput = page.getByLabel('Monthly living cost (EUR)', {
    exact: true,
  });
  const costBounds = await costInput.boundingBox();
  const runwaySection = await page
    .getByRole('region', { name: 'Runway', exact: true })
    .boundingBox();
  const fireSection = await page
    .getByRole('region', { name: 'FIRE', exact: true })
    .boundingBox();
  const coverageBounds = await page
    .getByRole('region', { name: 'Monthly cost coverage', exact: true })
    .boundingBox();
  const fireBounds = await page
    .getByRole('region', { name: 'FIRE estimate', exact: true })
    .boundingBox();
  const drawdownBounds = await page
    .getByRole('region', { name: 'Living off your capital', exact: true })
    .boundingBox();
  const wealthBounds = await page
    .getByRole('region', { name: 'Building toward FIRE', exact: true })
    .boundingBox();
  expect(costBounds!.height).toBeGreaterThanOrEqual(44);
  expect(costBounds!.y + costBounds!.height).toBeLessThanOrEqual(
    runwaySection!.y,
  );
  expect(runwaySection!.y + runwaySection!.height).toBeLessThanOrEqual(
    fireSection!.y,
  );
  expect(Math.abs(coverageBounds!.y - drawdownBounds!.y)).toBeLessThanOrEqual(
    2,
  );
  expect(
    Math.abs(coverageBounds!.width - drawdownBounds!.width),
  ).toBeLessThanOrEqual(2);
  expect(Math.abs(fireBounds!.y - wealthBounds!.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(fireBounds!.width - wealthBounds!.width)).toBeLessThanOrEqual(
    2,
  );
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
  expect(await chart.getByRole('row').count()).toBeGreaterThan(2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: test.info().outputPath('runway-mobile.png'),
    fullPage: true,
  });
});
