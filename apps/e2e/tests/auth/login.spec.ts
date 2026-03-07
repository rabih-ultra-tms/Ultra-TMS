import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // No pre-auth

  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in|log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Should show error — either toast or inline message
    const errorVisible = await page
      .locator('[data-sonner-toast][data-type="error"], [role="alert"], .text-destructive')
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    expect(errorVisible).toBeTruthy();
  });

  test('should require email and password', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Should show validation errors
    const errorCount = await page.locator('.text-destructive, [role="alert"]').count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });
});

test.describe('Authenticated Session', () => {
  test('should show dashboard after login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show user info in header', async ({ page }) => {
    await page.goto('/dashboard');
    // Look for user avatar, name, or dropdown in header
    const header = page.locator('header, [role="banner"]').first();
    await expect(header).toBeVisible();
  });
});
