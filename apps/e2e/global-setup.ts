import { test as setup } from '@playwright/test';
import { loginViaUI, USERS } from './fixtures/auth.fixture';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '.auth');

setup('authenticate as admin', async ({ page }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  await loginViaUI(page, USERS.admin.email, USERS.admin.password);
  await page.context().storageState({ path: USERS.admin.storageState });
});
