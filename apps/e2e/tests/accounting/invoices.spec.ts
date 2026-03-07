import { test, expect } from '@playwright/test';

test.describe('Invoices', () => {
  test('should display invoices page', async ({ page }) => {
    await page.goto('/invoices');
    // Should not be a 404
    const is404 = await page.locator('text=404, text=not found').isVisible({ timeout: 5_000 }).catch(() => false);
    expect(is404).toBeFalsy();
  });

  test('should show invoices table or empty state', async ({ page }) => {
    await page.goto('/invoices');
    const hasTable = await page.locator('table').isVisible({ timeout: 10_000 }).catch(() => false);
    const hasEmpty = await page.locator('text=no invoices, text=no data, text=empty').first().isVisible({ timeout: 3_000 }).catch(() => false);
    expect(hasTable || hasEmpty).toBeTruthy();
  });

  test('should have create invoice button', async ({ page }) => {
    await page.goto('/invoices');
    const createBtn = page.getByRole('button', { name: /new|create|add/i });
    const hasBtn = await createBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasBtn).toBeTruthy();
  });
});

test.describe('Settlements', () => {
  test('should display settlements page', async ({ page }) => {
    await page.goto('/settlements');
    const is404 = await page.locator('text=404, text=not found').isVisible({ timeout: 5_000 }).catch(() => false);
    expect(is404).toBeFalsy();
  });
});
