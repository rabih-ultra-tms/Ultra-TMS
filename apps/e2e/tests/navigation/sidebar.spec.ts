import { test, expect } from '@playwright/test';

// All sidebar navigation links that should resolve to real pages
const SIDEBAR_LINKS = [
  { name: /dashboard/i, url: '/dashboard' },
  { name: /customers/i, url: '/customers' },
  { name: /contacts/i, url: '/contacts' },
  { name: /companies/i, url: '/companies' },
  { name: /leads/i, url: '/leads' },
  { name: /quotes/i, url: '/quotes' },
  { name: /orders/i, url: '/orders' },
  { name: /loads/i, url: '/loads' },
  { name: /dispatch/i, url: '/dispatch' },
  { name: /carriers/i, url: '/carriers' },
  { name: /tracking/i, url: '/tracking' },
  { name: /invoices/i, url: '/invoices' },
  { name: /settlements/i, url: '/settlements' },
  { name: /users/i, url: '/users' },
  { name: /roles/i, url: '/roles' },
];

test.describe('Sidebar Navigation', () => {
  test('sidebar is visible on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  for (const link of SIDEBAR_LINKS) {
    test(`"${link.name}" navigates without 404`, async ({ page }) => {
      await page.goto('/dashboard');

      // Find and click the link
      const navLink = page.locator('nav, [role="navigation"]')
        .first()
        .getByRole('link', { name: link.name });

      // Skip if link doesn't exist in sidebar (may be role-restricted)
      const linkExists = await navLink.count() > 0;
      if (!linkExists) {
        test.skip();
        return;
      }

      await navLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

      // Verify we landed on a real page (not a 404)
      const is404 = await page.locator('text=404, text=not found, text=page not found')
        .first()
        .isVisible({ timeout: 3_000 })
        .catch(() => false);

      expect(is404).toBeFalsy();
      expect(page.url()).toContain(link.url);
    });
  }
});

test.describe('Deep Linking', () => {
  test('direct URL to dashboard works', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('direct URL to customers works', async ({ page }) => {
    await page.goto('/customers');
    const is404 = await page.locator('text=404').isVisible({ timeout: 5_000 }).catch(() => false);
    expect(is404).toBeFalsy();
  });
});
