import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase, openHoldingsPage } from './test-helpers';
import { PrismaClient } from './database-client';

const prisma = new PrismaClient();

test('persists reinvestment through creation, reload and editing', async ({
  page,
}) => {
  await cleanDatabase();
  await authenticateTestUser(page);
  await page.goto('http://localhost:3000/dashboard/portfolio');
  await page.getByRole('button', { name: 'Custom Product' }).click();
  await page.getByRole('tab', { name: 'Custom Product' }).click();
  const checkbox = page.getByRole('checkbox', { name: 'Reinvest interest' });
  await expect(checkbox).toBeChecked();
  await checkbox.focus();
  await checkbox.press('Space');
  await expect(page.getByText(/Simple interest: A/)).toBeVisible();
  await page.getByLabel('Product Name').fill('Simple interest account');
  await page.getByLabel('Annual Rate (%)').fill('10');
  await page.locator('#custom-investment').fill('1000');
  await page.locator('#custom-date').fill('2024-01-01');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Add Product', exact: true })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.reload();
  await openHoldingsPage(page);
  const card = page
    .getByTestId('product-card')
    .filter({ hasText: 'Simple interest account' });
  await card.getByRole('button', { name: 'Edit product' }).click();
  await expect(checkbox).not.toBeChecked();
  await page.getByText('Reinvest interest', { exact: true }).click();
  await page
    .getByRole('button', { name: 'Update Product', exact: true })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.reload();
  await card.getByRole('button', { name: 'Edit product' }).click();
  await expect(checkbox).toBeChecked();
  await checkbox.focus();
  await checkbox.press('Space');
  await page
    .getByRole('button', { name: 'Update Product', exact: true })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const saved = await prisma.customProductData.findFirst({
    include: { product: true },
  });
  expect(saved?.reinvestInterest).toBe(false);
});
