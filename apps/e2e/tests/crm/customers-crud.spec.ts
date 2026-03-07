import { test, expect } from '@playwright/test';

test.describe('Customers CRUD', () => {
  test('should display customers list', async ({ page }) => {
    await page.goto('/customers');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/customers');
    const search = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    const hasSearch = await search.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasSearch).toBeTruthy();
  });

  test('should have create button', async ({ page }) => {
    await page.goto('/customers');
    const createBtn = page.getByRole('button', { name: /new|create|add/i });
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('should open customer form on create', async ({ page }) => {
    await page.goto('/customers');
    await page.getByRole('button', { name: /new|create|add/i }).click();

    const formVisible = await page.locator('form, [role="dialog"]')
      .first()
      .isVisible({ timeout: 10_000 });
    expect(formVisible).toBeTruthy();
  });
});
