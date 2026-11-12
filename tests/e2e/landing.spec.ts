import { expect, test } from '@playwright/test';
import { preferEnglish } from './helpers';

test.describe('Landing page', () => {
  test('defaults to Norwegian and switches language without reloading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ta kontroll over nyhetsbrevene dine.',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'nb');

    // Mark the window so we can prove no reload happened.
    await page.evaluate(() => ((window as unknown as { __marker: boolean }).__marker = true));

    const header = page.getByRole('banner');
    if (await header.getByRole('button', { name: /Åpne meny/ }).isVisible()) {
      await header.getByRole('button', { name: /Åpne meny/ }).click();
    }
    await page
      .getByRole('button', { name: /English/ })
      .first()
      .click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Take control of your newsletters.',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.evaluate(() => (window as unknown as { __marker?: boolean }).__marker)).toBe(
      true,
    );
  });

  test('remembers the chosen language after a reload', async ({ page }) => {
    await preferEnglish(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Take control of your newsletters.',
    );
  });

  test('shows connection options, benefits, privacy and FAQ', async ({ page }) => {
    await preferEnglish(page);
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Connect Gmail' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Connect Outlook' })).toBeVisible();
    await expect(
      page.getByRole('img', { name: /Illustration of the Mailmap dashboard/ }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What Mailmap does' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Privacy by design, explained plainly' }),
    ).toBeVisible();

    const question = page.getByText('Will Mailmap find every newsletter?');
    await question.click();
    await expect(
      page.getByText(/It scans a limited number of your most recent messages/),
    ).toBeVisible();
    await expect(page.getByRole('contentinfo')).toContainText(
      'Built by Sadiq Aden, with AI assistance.',
    );
  });

  test('explains when a provider is not configured instead of faking a login', async ({ page }) => {
    await preferEnglish(page);
    await page.goto('/connect/gmail');
    // The E2E build has no client IDs configured.
    await expect(
      page.getByRole('heading', { name: 'Gmail is not configured for this deployment' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Explore the demo instead' }).click();
    await expect(page).toHaveURL(/\/demo$/);
  });

  test('privacy page is reachable and describes data handling', async ({ page }) => {
    await preferEnglish(page);
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Are message bodies accessed?' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Google Account/ })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });

  test('unknown routes show a 404 page', async ({ page }) => {
    await preferEnglish(page);
    await page.goto('/does-not-exist');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });
});
