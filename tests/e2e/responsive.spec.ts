import { expect, test } from '@playwright/test';
import { openScannedDemo, preferEnglish } from './helpers';

test.describe('Responsive layout', () => {
  test('mobile navigation opens and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only behaviour');
    await preferEnglish(page);
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: 'Open menu' });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await menuButton.click();

    const nav = page.getByRole('navigation', { name: 'Mobile' });
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(nav).toBeHidden();
  });

  test('desktop shows inline navigation', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only behaviour');
    await preferEnglish(page);
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
  });

  test('newsletter cards form a single column on mobile and several on desktop', async ({
    page,
    isMobile,
  }) => {
    await openScannedDemo(page);
    const cards = page.getByTestId('newsletter-card');
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first && second).toBeTruthy();
    if (isMobile) {
      expect(second!.x).toBeCloseTo(first!.x, 0);
      expect(second!.y).toBeGreaterThan(first!.y);
    } else {
      expect(second!.y).toBeCloseTo(first!.y, 0);
    }
  });

  test('cards keep a 16px gutter on a small 375px phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openScannedDemo(page);
    const box = await page.getByTestId('newsletter-card').first().boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(16);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375 - 16);
  });

  test('no horizontal scrolling on any page', async ({ page }) => {
    await preferEnglish(page);
    for (const path of ['/', '/demo', '/privacy', '/connect/outlook']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
