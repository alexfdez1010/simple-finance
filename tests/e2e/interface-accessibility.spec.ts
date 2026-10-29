import { test, expect } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';

test.beforeEach(async ({ page }) => {
  await authenticateTestUser(page);
});

for (const width of [390, 1440]) {
  /** The first keyboard stop bypasses navigation and moves focus into the workspace. */
  test(`skips directly to workspace content at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://localhost:3000/dashboard');
    await expect(
      page.getByRole('heading', { name: 'Portfolio Overview', exact: true }),
    ).toBeVisible();

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });
}

/** Keyboard users stay inside the product dialog and recover the opening control on dismissal. */
test('contains dialog focus and restores it after Escape on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/dashboard/portfolio');
  const opener = page.getByRole('button', {
    name: 'Custom Product',
    exact: true,
  });
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Add Product', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Product Name', { exact: true }).focus();

  for (const direction of ['Tab', 'Shift+Tab']) {
    for (let index = 0; index < 16; index++) {
      await page.keyboard.press(direction);
      await expect
        .poll(() =>
          dialog.evaluate((element) =>
            element.contains(document.activeElement),
          ),
        )
        .toBe(true);
    }
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

/** Reduced motion suppresses lingering effects while preserving navigation and form interaction. */
test('honors reduced motion without blocking workspace interaction', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:3000/dashboard');
  await expect(
    page.getByRole('region', { name: 'Portfolio summary' }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((animation) => {
            const timing = animation.effect?.getComputedTiming();
            return (
              animation.playState === 'running' &&
              typeof timing?.duration === 'number' &&
              timing.duration > 100
            );
          }).length,
      ),
    )
    .toBe(0);

  await page.getByRole('link', { name: 'Holdings', exact: true }).click();
  await page
    .getByRole('button', { name: 'Custom Product', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Add Product', exact: true });
  const name = dialog.getByLabel('Product Name', { exact: true });
  await name.fill('Reduced motion keyboard review');
  await expect(name).toHaveValue('Reduced motion keyboard review');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
