import { readFile } from 'node:fs/promises';
import { test, expect, type APIRequestContext } from '@playwright/test';
import { PrismaClient } from './database-client';
import { financeBackupFixture } from '../fixtures/finance-backup';
import type { FinanceBackup } from '../../src/lib/backup/backup-schema';
import { authenticateTestUser } from './auth-helper';
import { cleanDatabase } from './test-helpers';

const prisma = new PrismaClient();
const endpoint = 'http://localhost:3000/api/backup';

/** Sends an authenticated same-origin restore request without market-data reads. */
async function restore(request: APIRequestContext, data: FinanceBackup) {
  return request.post(endpoint, {
    data,
    headers: { origin: 'http://localhost:3000' },
  });
}

/** Reads the persisted copy with a deterministic browser currency. */
async function exported(request: APIRequestContext): Promise<FinanceBackup> {
  const response = await request.get(`${endpoint}?currency=USD`);
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/** Orders record collections by ID so equality concerns content, not insertion order. */
function ordered(data: FinanceBackup['data']) {
  return Object.fromEntries(
    Object.entries(data).map(([key, rows]) => [
      key,
      [...rows].sort((a, b) => a.id.localeCompare(b.id)),
    ]),
  );
}

test.describe('Complete finance backups', () => {
  test.beforeEach(async ({ page }) => {
    await cleanDatabase();
    await authenticateTestUser(page);
  });
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('round-trips all tables, IDs, timestamps, precision and legacy nulls without data loss', async ({
    page,
  }) => {
    const request = page.context().request;
    const fixture = financeBackupFixture();
    expect((await restore(request, fixture)).ok()).toBeTruthy();
    const before = await exported(request);
    expect(ordered(before.data)).toEqual(ordered(fixture.data));
    await cleanDatabase();
    expect((await restore(request, before)).ok()).toBeTruthy();
    const after = await exported(request);
    expect(after.data).toEqual(before.data);
    expect(after.preferences).toEqual(before.preferences);
    // Import replaces rather than merges, so repeating a restore never duplicates rows.
    expect((await restore(request, before)).ok()).toBeTruthy();
    expect((await exported(request)).data).toEqual(before.data);
  });

  test('rolls back earlier deletes and inserts when the final settings write fails', async ({
    page,
  }) => {
    const request = page.context().request;
    expect((await restore(request, financeBackupFixture())).ok()).toBeTruthy();
    const before = await exported(request);
    try {
      await prisma.$executeRawUnsafe(
        `CREATE TRIGGER backup_test_reject BEFORE INSERT ON runway_settings BEGIN SELECT RAISE(ABORT, 'Injected QA failure'); END`,
      );
      const replacement = financeBackupFixture();
      replacement.data.products[0].name = 'Must roll back';
      replacement.data.portfolioSnapshots[0].value = 999;
      expect((await restore(request, replacement)).status()).toBe(500);
      expect((await exported(request)).data).toEqual(before.data);
    } finally {
      await prisma.$executeRawUnsafe(
        'DROP TRIGGER IF EXISTS backup_test_reject',
      );
    }
  });

  test('rejects invalid files and unauthenticated or foreign requests without changing data', async ({
    page,
    request,
  }) => {
    const authenticated = page.context().request;
    expect(
      (await restore(authenticated, financeBackupFixture())).ok(),
    ).toBeTruthy();
    const before = await exported(authenticated);
    expect((await request.get(endpoint)).status()).toBe(401);
    expect((await restore(request, financeBackupFixture())).status()).toBe(401);
    expect(
      (
        await authenticated.post(endpoint, {
          data: before,
          headers: { origin: 'https://foreign.example' },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await authenticated.post(endpoint, {
          data: { ...before, version: 999 },
          headers: { origin: 'http://localhost:3000' },
        })
      ).status(),
    ).toBe(400);
    expect((await exported(authenticated)).data).toEqual(before.data);
  });

  test('downloads, previews, cancels and restores the selected file from the holdings controls', async ({
    page,
  }, testInfo) => {
    const fixture = financeBackupFixture();
    fixture.data.products = fixture.data.products.filter(
      (row) => row.type === 'CUSTOM',
    );
    fixture.data.yahoo = [];
    fixture.data.productSnapshots = fixture.data.productSnapshots.filter(
      (row) => row.productId === 'custom',
    );
    fixture.data.contributions[1].amountEur = -50;
    expect((await restore(page.context().request, fixture)).ok()).toBeTruthy();
    await page.goto('http://localhost:3000/dashboard/portfolio');
    const controls = page.getByRole('region', { name: 'Data backup' });
    await expect(
      controls.getByRole('button', { name: 'Export backup' }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('backup-desktop.png'),
      fullPage: true,
    });
    const downloadEvent = page.waitForEvent('download');
    await controls.getByRole('button', { name: 'Export backup' }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toMatch(/^simple-finance-.*\.json$/);
    const copy = JSON.parse(
      await readFile((await download.path())!, 'utf8'),
    ) as FinanceBackup;
    copy.preferences.displayCurrency = 'USD';
    const upload = {
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(copy)),
    };
    const fileChooser = page.waitForEvent('filechooser');
    await controls.getByRole('button', { name: 'Import backup' }).click();
    await (await fileChooser).setFiles(upload);
    const dialog = page.getByRole('alertdialog', { name: 'Restore backup' });
    await expect(
      dialog.getByText('This replaces all current holdings', { exact: false }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(
      controls.getByRole('button', { name: 'Import backup' }),
    ).toBeFocused();
    expect((await exported(page.context().request)).data).toEqual(copy.data);
    await prisma.financialProduct.update({
      where: { id: 'custom' },
      data: { name: 'Changed after export' },
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel('Choose backup file').setInputFiles(upload);
    await expect(dialog).toBeVisible();
    await page.evaluate(async () => {
      await Promise.all(
        document.getAnimations().map((animation) => animation.finished),
      );
    });
    await page.screenshot({
      path: testInfo.outputPath('backup-mobile-confirmation.png'),
      fullPage: true,
    });
    await dialog.getByRole('button', { name: 'Replace all data' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Backup restored.' }),
    ).toBeVisible();
    await expect(
      page.getByText('Savings with a complete movement history', {
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem('display-currency')),
    ).toBe('USD');
    expect((await exported(page.context().request)).data).toEqual(copy.data);
    await page.screenshot({
      path: testInfo.outputPath('backup-mobile-restored.png'),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByLabel('Choose backup file').setInputFiles({
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{}'),
    });
    await expect(controls.getByRole('alert')).toContainText(
      'complete Simple Finance backup',
    );
  });

  test('restores an empty copy by removing existing records across every table', async ({
    page,
  }) => {
    const request = page.context().request;
    expect((await restore(request, financeBackupFixture())).ok()).toBeTruthy();
    const empty = financeBackupFixture();
    for (const key of Object.keys(empty.data) as (keyof typeof empty.data)[])
      empty.data[key] = [];
    expect((await restore(request, empty)).ok()).toBeTruthy();
    expect((await exported(request)).data).toEqual(empty.data);
  });
});
