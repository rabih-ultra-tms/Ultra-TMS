import { test, expect } from '@playwright/test';
import { loginViaUI, USERS } from '../../fixtures/auth.fixture';

test.describe('Login Flow', () => {
  // These tests run WITHOUT pre-existing auth state
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should show login page with all expected elements', async ({
    page,
  }) => {
    await page.goto('/login');

    // Heading
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // Email and password fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Submit button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Forgot password link
    await expect(
      page.getByRole('link', { name: /forgot password/i })
    ).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({
    page,
  }) => {
    await page.goto('/login');

    // Click submit without filling anything
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation errors (Zod: email invalid, password min 8 chars)
    const errorCount = await page
      .locator('.text-destructive, [role="alert"]')
      .count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should show validation error for invalid email format', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByLabel(/password/i).fill('somepassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show email validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('user@test.com');
    await page.getByLabel(/password/i).fill('short');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Zod schema requires min 8 chars
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error — either an Alert with variant="destructive" or a toast
    const errorVisible = await page
      .locator(
        '[data-sonner-toast][data-type="error"], [role="alert"].border-destructive, .text-destructive'
      )
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    expect(errorVisible).toBeTruthy();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('TestPassword123');

    // Initially password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the show/hide toggle button
    await page.getByRole('button', { name: /show password/i }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle back
    await page.getByRole('button', { name: /hide password/i }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    await loginViaUI(page, USERS.admin.email, USERS.admin.password);

    // loginViaUI already waits for /dashboard URL
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('should show loading state while submitting', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill(USERS.admin.email);
    await page.getByLabel(/password/i).fill(USERS.admin.password);

    // Start listening before clicking
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // The button text should change to "Signing in..." while loading
    // This may be very brief, so we check for either state
    const signingInVisible = await page
      .getByText(/signing in/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    // Either we caught the loading state, or login was fast enough to redirect
    const onDashboard = page.url().includes('dashboard');
    expect(signingInVisible || onDashboard).toBeTruthy();
  });
});

test.describe('Authenticated Session', () => {
  // These tests use the pre-authenticated storage state from the setup project

  test('should show dashboard after login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show user info or navigation in header', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for user avatar, name, or dropdown in header area
    const header = page.locator('header, [role="banner"]').first();
    await expect(header).toBeVisible();
  });

  test('should persist auth across page navigation', async ({ page }) => {
    // Visit dashboard first
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to another protected page
    await page.goto('/companies');
    // Should NOT redirect to login
    await expect(page).not.toHaveURL(/login/);
  });

  test('should persist auth after page reload', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);

    // Reload the page
    await page.reload();

    // Should still be on dashboard, not redirected to login
    await expect(page).toHaveURL(/dashboard/);
  });
});
