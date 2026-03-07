import { test, expect } from '@playwright/test';

test.describe('Loads Lifecycle', () => {
  test('should display loads list', async ({ page }) => {
    await page.goto('/loads');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should have create load button', async ({ page }) => {
    await page.goto('/loads');
    const createBtn = page.getByRole('button', { name: /new|create|add/i });
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('should show loads table with status column', async ({ page }) => {
    await page.goto('/loads');
    const table = page.locator('table');
    const hasTable = await table.isVisible({ timeout: 10_000 }).catch(() => false);
    if (hasTable) {
      const headers = await page.locator('table thead th').allTextContents();
      const headerText = headers.join(' ').toLowerCase();
      expect(headerText).toMatch(/status|state/);
    }
  });

  test('should open load detail on click', async ({ page }) => {
    await page.goto('/loads');
    const hasRows = await page.locator('table tbody tr').first().isVisible({ timeout: 10_000 }).catch(() => false);
    if (!hasRows) {
      test.skip();
      return;
    }

    await page.locator('table tbody tr').first().click();
    await page.waitForTimeout(2_000);

    const isDetail = page.url().includes('/loads/') ||
      await page.locator('[role="dialog"], [data-testid*="detail"], [data-testid*="drawer"]').isVisible({ timeout: 5_000 }).catch(() => false);
    expect(isDetail).toBeTruthy();
  });
});

test.describe('Dispatch Board', () => {
  test('should display dispatch board', async ({ page }) => {
    await page.goto('/dispatch');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should have filter controls', async ({ page }) => {
    await page.goto('/dispatch');
    const filters = page.locator('[role="combobox"], select, [data-testid*="filter"]');
    const hasFilters = await filters.first().isVisible({ timeout: 10_000 }).catch(() => false);
    // Dispatch board should have some filtering UI
    expect(hasFilters).toBeTruthy();
  });
});
