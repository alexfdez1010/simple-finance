import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';
import { authenticateTestUser } from './auth-helper';
import {
  cleanDatabase,
  disconnectDatabase,
  openProductsTab,
} from './test-helpers';

const prisma = new PrismaClient();
const longName = `LongTermReserve${'WithoutSpaces'.repeat(15)}`;
const longNote = `BankTransferReference${'WithoutSpaces'.repeat(15)}`;
const amount = 9876543210;

test.beforeEach(async ({ page }) => {
  await cleanDatabase();
  await prisma.financialProduct.create({
    data: {
      name: longName,
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
              amount,
              amountEur: amount,
              date: new Date('2026-01-01T00:00:00Z'),
              note: longNote,
            },
          },
        },
      },
    },
  });
  await authenticateTestUser(page);
  await page.goto('http://localhost:3000/dashboard');
});

test.afterAll(async () => {
  await prisma.$disconnect();
  await disconnectDatabase();
});

for (const width of [320, 390, 1280]) {
  test(`keeps navigation visible and centered and large holdings contained at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.scrollTo(0, 0));
    const tabs = page.getByRole('tablist', { name: 'Dashboard sections' });
    await expect(tabs).toBeVisible();
    const bounds = await tabs.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThan(900);
    expect(Math.abs(bounds!.x + bounds!.width / 2 - width / 2)).toBeLessThan(2);

    await openProductsTab(page);
    const search = page.getByLabel('Search holdings');
    await expect(search).toBeVisible();
    const searchBounds = await search.boundingBox();
    const searchWrapperBounds = await search.locator('..').boundingBox();
    expect(searchBounds).not.toBeNull();
    expect(searchWrapperBounds).not.toBeNull();
    expect(
      Math.abs(searchBounds!.width - searchWrapperBounds!.width),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(searchBounds!.x - searchWrapperBounds!.x),
    ).toBeLessThanOrEqual(1);
    const card = page.getByTestId('product-card');
    await expect(card).toHaveCount(1);
    await expect(
      card.getByRole('heading', { name: longName, exact: true }),
    ).toBeVisible();
    await expect(card).toContainText('9.876.543.210');
    expect(
      await card.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    const contentFits = await card
      .locator('h3, p, dd')
      .evaluateAll((elements) =>
        elements.every((element) => element.scrollWidth <= element.clientWidth),
      );
    expect(contentFits).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test('activates the Products workspace with the keyboard', async ({ page }) => {
  const charts = page.getByRole('tab', { name: 'Charts', exact: true });
  const products = page.getByRole('tab', { name: 'Products', exact: true });
  await charts.click();
  await expect(charts).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(products).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(products).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByRole('heading', { name: 'Your holdings', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Search holdings')).toBeVisible();
});

test('offers touch-sized mobile header actions', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const name of ['Yahoo Product', 'Custom Product']) {
    const action = page.getByRole('button', { name, exact: true });
    await expect(action).toBeVisible();
    const bounds = await action.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
  }
});

test('finds movement editor inputs by their visible labels on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openProductsTab(page);
  await page
    .getByTestId('product-card')
    .getByRole('button', { name: 'Edit product', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Edit Product',
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(longNote, { exact: false })).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Edit movement', exact: true })
    .click();

  const amountInput = dialog.getByLabel('Amount (€)', { exact: true });
  const dateInput = dialog.getByLabel('Date', { exact: true });
  const noteInput = dialog.getByLabel('Note (optional)', { exact: true });
  await expect(amountInput).toHaveValue(String(amount));
  await expect(dateInput).toHaveValue('2026-01-01');
  await expect(noteInput).toHaveValue(longNote);
  await noteInput.fill('Updated reference');
  await expect(noteInput).toHaveValue('Updated reference');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog.getByText(longNote, { exact: false })).toBeVisible();
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
});
