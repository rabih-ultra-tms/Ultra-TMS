import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
  test('should display users list', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should show users table', async ({ page }) => {
    await page.goto('/users');
    const table = page.locator('table');
    const hasTable = await table.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasTable).toBeTruthy();
  });

  test('should have invite/create user button', async ({ page }) => {
    await page.goto('/users');
    const createBtn = page.getByRole('button', { name: /new|create|add|invite/i });
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('should open user form on create', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('button', { name: /new|create|add|invite/i }).click();

    const formVisible = await page.locator('form, [role="dialog"]')
      .first()
      .isVisible({ timeout: 10_000 });
    expect(formVisible).toBeTruthy();
  });
});

test.describe('Roles Management', () => {
  test('should display roles list', async ({ page }) => {
    await page.goto('/roles');
    const is404 = await page.locator('text=404').isVisible({ timeout: 5_000 }).catch(() => false);
    expect(is404).toBeFalsy();
  });

  test('should have create role button', async ({ page }) => {
    await page.goto('/roles');
    const createBtn = page.getByRole('button', { name: /new|create|add/i });
    const hasBtn = await createBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasBtn).toBeTruthy();
  });
});
