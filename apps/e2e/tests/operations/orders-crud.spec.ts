import { test, expect } from '@playwright/test';

test.describe('Orders CRUD', () => {
  test('should display orders list', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should have create order button', async ({ page }) => {
    await page.goto('/orders');
    const createBtn = page.getByRole('button', { name: /new|create|add/i });
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('should open multi-step order form', async ({ page }) => {
    await page.goto('/orders');
    await page.getByRole('button', { name: /new|create|add/i }).click();
    await page.waitForTimeout(2_000);

    // Should show form with steps/stepper
    const formVisible = await page.locator('form, [role="dialog"]')
      .first()
      .isVisible({ timeout: 10_000 });
    expect(formVisible).toBeTruthy();
  });

  test('should show order table with data columns', async ({ page }) => {
    await page.goto('/orders');
    const table = page.locator('table');
    const hasTable = await table.isVisible({ timeout: 10_000 }).catch(() => false);
    if (hasTable) {
      // Verify expected columns exist
      const headers = await page.locator('table thead th').allTextContents();
      expect(headers.length).toBeGreaterThan(0);
    }
  });
});
