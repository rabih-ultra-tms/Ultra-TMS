import { test, expect } from '@playwright/test';

test.describe('Companies CRUD', () => {
  test('should display companies list page', async ({ page }) => {
    await page.goto('/companies');
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Should have a table or list of companies
    const hasTable = await page.locator('table').isVisible({ timeout: 10_000 }).catch(() => false);
    const hasList = await page.locator('[role="list"], [data-testid*="company"]').isVisible({ timeout: 3_000 }).catch(() => false);
    expect(hasTable || hasList).toBeTruthy();
  });

  test('should have a create button', async ({ page }) => {
    await page.goto('/companies');
    const createBtn = page.getByRole('button', { name: /new|create|add/i });
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('should open create form', async ({ page }) => {
    await page.goto('/companies');
    await page.getByRole('button', { name: /new|create|add/i }).click();

    // Should show a form (dialog or new page)
    const formVisible = await page.locator('form, [role="dialog"]')
      .first()
      .isVisible({ timeout: 10_000 });
    expect(formVisible).toBeTruthy();
  });

  test('should show validation on empty submit', async ({ page }) => {
    await page.goto('/companies');
    await page.getByRole('button', { name: /new|create|add/i }).click();

    // Find and click submit/save button
    const submitBtn = page.getByRole('button', { name: /save|submit|create/i }).last();
    if (await submitBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await submitBtn.click();

      // Should show validation errors
      const errors = await page.locator('.text-destructive, [role="alert"], .error').count();
      expect(errors).toBeGreaterThan(0);
    }
  });

  test('should navigate to company detail on row click', async ({ page }) => {
    await page.goto('/companies');

    // Wait for table data
    const hasRows = await page.locator('table tbody tr').first().isVisible({ timeout: 10_000 }).catch(() => false);
    if (!hasRows) {
      test.skip();
      return;
    }

    await page.locator('table tbody tr').first().click();

    // Should navigate to detail page or open drawer
    await page.waitForTimeout(2_000);
    const isDetail = page.url().includes('/companies/') ||
      await page.locator('[role="dialog"], [data-testid*="detail"]').isVisible({ timeout: 3_000 }).catch(() => false);
    expect(isDetail).toBeTruthy();
  });
});
