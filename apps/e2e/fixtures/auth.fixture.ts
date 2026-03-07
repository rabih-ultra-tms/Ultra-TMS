import { test as base, type Page } from '@playwright/test';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '..', '.auth');

export const USERS = {
  admin: {
    email: 'admin@ultratms.test',
    password: 'Admin123!@#',
    storageState: path.join(AUTH_DIR, 'admin.json'),
  },
  dispatcher: {
    email: 'dispatcher@ultratms.test',
    password: 'Dispatch123!@#',
    storageState: path.join(AUTH_DIR, 'dispatcher.json'),
  },
  sales: {
    email: 'sales@ultratms.test',
    password: 'Sales123!@#',
    storageState: path.join(AUTH_DIR, 'sales.json'),
  },
} as const;

export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('**/dashboard**', { timeout: 15_000 });
}

export const test = base.extend<{
  adminPage: Page;
}>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: USERS.admin.storageState,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
