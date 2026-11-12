import { expect, test } from '@playwright/test';
import { DEMO_NEWSLETTERS, openScannedDemo, preferEnglish } from './helpers';

test.describe('Demo dashboard', () => {
  test('is reachable from the landing page and clearly labelled', async ({ page }) => {
    await preferEnglish(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Explore the demo' }).click();
    await expect(page).toHaveURL(/\/demo$/);
    await expect(page.getByText('Demo mode, with invented data')).toBeVisible();
    await expect(page.getByTestId('newsletter-card')).toHaveCount(DEMO_NEWSLETTERS);
  });

  test('statistics match the detected demo data', async ({ page }) => {
    await openScannedDemo(page);
    await expect(page.getByTestId('stat-senders')).toHaveText(String(DEMO_NEWSLETTERS));
    await expect(page.getByTestId('stat-newsletterEmails')).toHaveText('240');
    await expect(page.getByText(/Based on 259 scanned messages/)).toBeVisible();
  });

  test('search, filter and sort work on real detected data', async ({ page }) => {
    await openScannedDemo(page);

    await page.getByRole('searchbox', { name: 'Search newsletters' }).fill('example');
    await expect(page.getByTestId('newsletter-card')).toHaveCount(DEMO_NEWSLETTERS);
    await page.getByRole('searchbox', { name: 'Search newsletters' }).fill('kaffe');
    await expect(page.getByTestId('newsletter-card')).toHaveCount(1);
    await expect(page.getByTestId('result-count')).toHaveText(
      `Showing 1 of ${DEMO_NEWSLETTERS} newsletters`,
    );
    await page.getByRole('searchbox', { name: 'Search newsletters' }).fill('');

    await page.getByRole('combobox', { name: 'Sort by' }).selectOption('count');
    await expect(page.getByTestId('newsletter-card').first().getByRole('heading')).toHaveText(
      'The Morning Byte',
    );

    await page.getByRole('combobox', { name: 'Sort by' }).selectOption('name');
    await expect(page.getByTestId('newsletter-card').first().getByRole('heading')).toHaveText(
      'Bokhylla Book Club',
    );

    await page.getByRole('combobox', { name: 'Filter' }).selectOption('recent');
    const recentCount = await page.getByTestId('newsletter-card').count();
    await expect(page.getByTestId('stat-recentlyActive')).toHaveText(String(recentCount));
  });

  test('single simulated unsubscribe shows an honest, labelled result', async ({ page }) => {
    await openScannedDemo(page);
    await page.getByRole('searchbox', { name: 'Search newsletters' }).fill('Nordlys');
    await page.getByRole('button', { name: 'Unsubscribe: Nordlys Weekly' }).click();

    const dialog = page.getByRole('dialog', { name: 'Unsubscribe from Nordlys Weekly' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/nothing will be sent or opened/)).toBeVisible();
    await dialog.getByRole('button', { name: /Simulate: Send unsubscribe request/ }).click();
    await expect(dialog.getByText('Simulated (demo)')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close', exact: true }).first().click();
    await expect(dialog).toBeHidden();

    await expect(page.getByTestId('newsletter-card').getByText('Simulated (demo)')).toBeVisible();
  });

  test('dialog closes with Escape and traps focus', async ({ page }) => {
    await openScannedDemo(page);
    await page.getByRole('button', { name: 'Unsubscribe: Startup Signals' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('bulk selection and simulated bulk unsubscribe with per-item results', async ({ page }) => {
    await openScannedDemo(page);
    await page.getByRole('checkbox', { name: 'Select The Morning Byte' }).check();
    await page.getByRole('checkbox', { name: 'Select Pixel & Pine Design Digest' }).check();
    await page.getByRole('checkbox', { name: 'Select Plant Parent Tips' }).check();

    const toolbar = page.getByRole('toolbar', { name: 'Bulk actions' });
    await expect(toolbar).toContainText('3 selected');
    await toolbar.getByRole('button', { name: 'Unsubscribe from selected' }).click();

    const dialog = page.getByRole('dialog', { name: 'Unsubscribe from 3 newsletters' });
    await expect(dialog.getByText('Sent automatically after you confirm (1)')).toBeVisible();
    await expect(dialog.getByText('Needs your action (1)')).toBeVisible();
    await expect(dialog.getByText('No unsubscribe option found (1)')).toBeVisible();

    await dialog.getByRole('button', { name: 'Simulate 1 request' }).click();
    await expect(dialog.getByText('Simulated (demo)')).toHaveCount(1);
    await dialog.getByRole('button', { name: /Simulate: Open pixelpine.example/ }).click();
    await expect(dialog.getByText('Simulated (demo)')).toHaveCount(2);
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toBeHidden();
  });

  test('exiting the demo returns to the landing page', async ({ page }) => {
    await openScannedDemo(page);
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('button', { name: 'Exit demo' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('the real dashboard never shows demo data', async ({ page }) => {
    await openScannedDemo(page);
    await page.goto('/app');
    await expect(page.getByText('No mailbox connected')).toBeVisible();
    await expect(page.getByTestId('newsletter-card')).toHaveCount(0);
  });
});
