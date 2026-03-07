import { test, expect } from '@playwright/test';

test.describe('Contacts CRUD', () => {
  test('should display contacts list', async ({ page }) => {
    await page.goto('/contacts');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should have create button', async ({ page }) => {
    await page.goto('/contacts');
    const createBtn = page.getByRole('button', { name: /new|create|add/i });
    await expect(createBtn).toBeVisible({ timeout: 10_000 });
  });

  test('should open contact form', async ({ page }) => {
    await page.goto('/contacts');
    await page.getByRole('button', { name: /new|create|add/i }).click();

    const formVisible = await page.locator('form, [role="dialog"]')
      .first()
      .isVisible({ timeout: 10_000 });
    expect(formVisible).toBeTruthy();
  });
});
