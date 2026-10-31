import { test, expect, type Locator } from '@playwright/test';
import { authenticateTestUser } from './auth-helper';

/**
 * Checks that decorative selection and the semantic current destination agree.
 * @param navigation - The visible route navigation at its current breakpoint.
 * @returns Resolves when the indicator has reached the selected link's bounds.
 */
async function expectSelectionAligned(navigation: Locator) {
  await expect
    .poll(async () => {
      const selection = await navigation
        .locator('.navigation-indicator')
        .boundingBox();
      const current = await navigation
        .locator('[aria-current="page"]')
        .boundingBox();
      if (!selection || !current) return false;
      return ['x', 'y', 'width', 'height'].every(
        (key) =>
          Math.abs(
            selection[key as keyof typeof selection] -
              current[key as keyof typeof current],
          ) < 1,
      );
    })
    .toBe(true);
}

test.beforeEach(async ({ page }) => {
  await authenticateTestUser(page);
});

/** Selection follows real route changes and remains aligned across both layouts. */
test('keeps selection continuous through navigation and responsive layout changes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/dashboard');
  const main = page.getByRole('navigation', { name: 'Main navigation' });
  await expectSelectionAligned(main);
  await main.getByRole('link', { name: 'Holdings', exact: true }).click();
  await expect(
    main.getByRole('link', { name: 'Holdings', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expectSelectionAligned(main);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectSelectionAligned(main);
  await main.getByRole('link', { name: 'Analytics', exact: true }).click();
  const analytics = page.getByRole('navigation', { name: 'Analytics views' });
  await analytics.getByRole('link', { name: 'Cash flow', exact: true }).click();
  await expectSelectionAligned(analytics);
  await expectSelectionAligned(main);
  await analytics.getByRole('link', { name: 'Risk', exact: true }).click();
  await analytics.getByRole('link', { name: 'Overview', exact: true }).click();
  await expectSelectionAligned(analytics);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expectSelectionAligned(main);
});

/** Closing completes the actual CSS exit and restores focus; reopening starts a fresh form. */
test('completes dialog dismissal before reopening a clean form', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/dashboard/portfolio');
  const opener = page.getByRole('button', {
    name: 'Custom Product',
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Add Product', exact: true });
  await dialog
    .getByLabel('Product Name', { exact: true })
    .fill('Unsaved review');
  await page.evaluate(() => {
    document.addEventListener('animationstart', (event) => {
      if (event.animationName === 'dialog-exit')
        document.body.dataset.exitObserved = 'true';
    });
  });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute(
    'data-exit-observed',
    'true',
  );
  await expect(opener).toBeFocused();
  await opener.press('Enter');
  await expect(dialog.getByLabel('Product Name', { exact: true })).toHaveValue(
    '',
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

/** Owned imagery loads without blocking form access or reduced-motion navigation. */
test('loads the portfolio artwork and preserves immediate reduced-motion interaction', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/auth');
  const artwork = page.locator('aside img');
  await expect
    .poll(() =>
      artwork.evaluate(
        (image) =>
          image instanceof HTMLImageElement &&
          image.complete &&
          image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await page.goto('http://localhost:3000/dashboard');
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await navigation.getByRole('link', { name: 'Holdings', exact: true }).click();
  await expectSelectionAligned(navigation);
  await page
    .getByRole('button', { name: 'Custom Product', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Add Product', exact: true });
  await dialog
    .getByLabel('Product Name', { exact: true })
    .fill('Reduced motion');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((animation) => {
            const duration = animation.effect?.getComputedTiming().duration;
            return (
              animation.playState === 'running' &&
              typeof duration === 'number' &&
              duration > 100
            );
          }).length,
      ),
    )
    .toBe(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
