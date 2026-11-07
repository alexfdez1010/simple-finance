import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { authenticateTestUser } from './auth-helper';

test('publishes the install identity and real opaque icons without authentication', async ({
  page,
  request,
}) => {
  await page.goto('http://localhost:3000/auth');
  const manifestHref = await page
    .locator('link[rel="manifest"]')
    .getAttribute('href');
  const response = await request.get(`http://localhost:3000${manifestHref}`);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({
    id: '/',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    name: 'Simple Finance',
  });
  const apple = await page
    .locator('link[rel="apple-touch-icon"]')
    .getAttribute('href');
  for (const icon of [...manifest.icons, { src: apple, sizes: '180x180' }]) {
    const image = await request.get(`http://localhost:3000${icon.src}`);
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toContain('image/png');
    const metadata = await sharp(await image.body()).metadata();
    expect(`${metadata.width}x${metadata.height}`).toBe(icon.sizes);
    expect(metadata.hasAlpha).toBe(false);
  }
  expect(
    manifest.icons.some(
      (icon: { purpose: string }) => icon.purpose === 'maskable',
    ),
  ).toBe(true);
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/,
  );
});

test('controls mobile pages, isolates cached content and recovers from offline navigation', async ({
  page,
  context,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateTestUser(page);
  await page.goto('http://localhost:3000/dashboard/security');
  await expect(
    page.getByRole('heading', { name: 'Install Simple Finance' }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>((resolve) =>
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => resolve(),
        { once: true },
      ),
    );
  });
  const cdp = await context.newCDPSession(page);
  expect(
    (await cdp.send('Page.getInstallabilityErrors')).installabilityErrors,
  ).toEqual([]);
  const script = await request.get('http://localhost:3000/sw.js');
  expect(script.headers()['cache-control']).toContain('no-store');
  await page.screenshot({
    path: 'test-results/pwa-install-mobile.png',
    fullPage: true,
  });
  const keys = await page.evaluate(async () => {
    const names = await caches.keys();
    return (
      await Promise.all(
        names.map(async (name) =>
          (await (await caches.open(name)).keys()).map(
            (entry) => new URL(entry.url).pathname,
          ),
        ),
      )
    ).flat();
  });
  expect(keys).toContain('/offline');
  expect(
    keys.every(
      (path) =>
        path === '/offline' ||
        (path.startsWith('/_next/static/') && path.endsWith('.css')),
    ),
  ).toBe(true);
  expect(keys.some((path) => path.endsWith('.css'))).toBe(true);
  await context.setOffline(true);
  await page.goto('http://localhost:3000/dashboard/portfolio');
  await expect(
    page.getByRole('heading', { name: 'You’re offline' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try again' })).toBeVisible();
  expect(
    await page
      .getByRole('heading', { name: 'You’re offline' })
      .evaluate((heading) => getComputedStyle(heading).fontSize),
  ).toBe('30px');
  await page.screenshot({
    path: 'test-results/pwa-offline-mobile.png',
    fullPage: true,
  });
  await context.setOffline(false);
  await page.getByRole('link', { name: 'Try again' }).click();
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:3000/dashboard/security');
  await page.screenshot({
    path: 'test-results/pwa-install-desktop.png',
    fullPage: true,
  });
});
