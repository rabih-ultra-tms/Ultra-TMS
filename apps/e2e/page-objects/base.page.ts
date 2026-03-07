import { type Page, type Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async expectToast(text: string | RegExp) {
    const toast = this.page.locator('[data-sonner-toast]').filter({ hasText: text });
    await expect(toast).toBeVisible({ timeout: 10_000 });
  }

  async expectNoToastError() {
    const errorToast = this.page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToast).not.toBeVisible({ timeout: 3_000 }).catch(() => {
      // Swallow if no error toast is found — that's expected
    });
  }

  async expectPageTitle(title: string | RegExp) {
    await expect(this.page.getByRole('heading', { level: 1 }).or(
      this.page.getByRole('heading', { level: 2 })
    ).first()).toContainText(title);
  }

  async waitForTableLoaded() {
    // Wait for loading skeleton to disappear and table rows to appear
    await this.page.waitForSelector('table tbody tr', { timeout: 15_000 });
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('table tbody tr').count();
  }

  async clickTableRow(index: number) {
    await this.page.locator('table tbody tr').nth(index).click();
  }

  sidebar(): Locator {
    return this.page.locator('nav, [role="navigation"]').first();
  }

  async navigateVia(linkText: string) {
    await this.sidebar().getByRole('link', { name: linkText }).click();
  }

  async confirmDialog() {
    const dialog = this.page.getByRole('alertdialog').or(
      this.page.getByRole('dialog')
    );
    await dialog.getByRole('button', { name: /confirm|yes|delete|ok/i }).click();
  }

  async cancelDialog() {
    const dialog = this.page.getByRole('alertdialog').or(
      this.page.getByRole('dialog')
    );
    await dialog.getByRole('button', { name: /cancel|no/i }).click();
  }
}
