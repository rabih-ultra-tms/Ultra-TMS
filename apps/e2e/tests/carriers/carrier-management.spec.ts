import { test, expect } from '@playwright/test';

test.describe('Carrier Management', () => {
  test('should display carriers list', async ({ page }) => {
    await page.goto('/carriers');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should have search and create controls', async ({ page }) => {
    await page.goto('/carriers');
    const search = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    const hasSearch = await search.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasSearch).toBeTruthy();

    const createBtn = page.getByRole('button', { name: /new|create|add|onboard/i });
    await expect(createBtn).toBeVisible();
  });

  test('should show carrier table', async ({ page }) => {
    await page.goto('/carriers');
    const table = page.locator('table');
    const hasTable = await table.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasTable).toBeTruthy();
  });

  test('should open carrier form on create', async ({ page }) => {
    await page.goto('/carriers');
    await page.getByRole('button', { name: /new|create|add|onboard/i }).click();
    await page.waitForTimeout(2_000);

    const formVisible = await page.locator('form, [role="dialog"]')
      .first()
      .isVisible({ timeout: 10_000 });
    expect(formVisible).toBeTruthy();
  });

  test('should navigate to carrier detail', async ({ page }) => {
    await page.goto('/carriers');
    const hasRows = await page.locator('table tbody tr').first().isVisible({ timeout: 10_000 }).catch(() => false);
    if (!hasRows) {
      test.skip();
      return;
    }

    await page.locator('table tbody tr').first().click();
    await page.waitForTimeout(2_000);

    const isDetail = page.url().includes('/carriers/') ||
      await page.locator('[role="dialog"]').isVisible({ timeout: 3_000 }).catch(() => false);
    expect(isDetail).toBeTruthy();
  });
});
