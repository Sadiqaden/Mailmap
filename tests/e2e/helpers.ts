import { expect, type Page } from '@playwright/test';

/** Number of synthetic newsletter senders in the demo mailbox (see src/demo/demoData.ts). */
export const DEMO_NEWSLETTERS = 22;

/** Start every test in English so assertions are readable. Norwegian is tested separately. */
export async function preferEnglish(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('mailmap.locale', 'en');
    } catch {
      // ignore
    }
  });
}

export async function openScannedDemo(page: Page) {
  await preferEnglish(page);
  await page.goto('/demo');
  await expect(page.getByTestId('newsletter-card')).toHaveCount(DEMO_NEWSLETTERS, {
    timeout: 10_000,
  });
}
