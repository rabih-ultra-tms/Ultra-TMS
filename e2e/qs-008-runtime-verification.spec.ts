import { test, expect, Page, BrowserContext } from '@playwright/test';
import { routes, RouteEntry } from './route-registry';
import * as fs from 'fs';
import * as path from 'path';

// Result types
type RouteStatus = 'PASS' | 'STUB' | 'BROKEN' | 'CRASH' | '404';

interface RouteResult {
  group: string;
  label: string;
  path: string;
  status: RouteStatus;
  errors: string[];
  bodyLength: number;
  screenshotPath?: string;
  duration: number;
}

const results: RouteResult[] = [];
const SCREENSHOT_DIR = path.join(__dirname, 'reports', 'qs-008-screenshots');
const RESULTS_FILE = path.join(__dirname, 'reports', 'qs-008-results.json');

// Ensure screenshot directory exists
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Auth setup — login once, reuse cookies
test.describe('QS-008 Runtime Verification', () => {
  let authCookies: { name: string; value: string; domain: string; path: string }[];

  test.beforeAll(async ({ browser }) => {
    // Login via API to get auth token
    const response = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin1@tms.local', password: 'password123', tenantId: 'f1559ac5-44c1-445e-b15e-cc34e1acaeb6' }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const { accessToken, refreshToken } = data.data;

    // Store cookies to set on each test's context
    authCookies = [
      { name: 'accessToken', value: accessToken, domain: 'localhost', path: '/' },
      { name: 'refreshToken', value: refreshToken, domain: 'localhost', path: '/' },
    ];
  });

  // Group routes by group name
  const groups = new Map<string, RouteEntry[]>();
  for (const route of routes) {
    const existing = groups.get(route.group) || [];
    existing.push(route);
    groups.set(route.group, existing);
  }

  for (const [groupName, groupRoutes] of groups) {
    test.describe(groupName, () => {
      for (const route of groupRoutes) {
        test(`${route.label} — ${route.path}`, async ({ browser }) => {
          const start = Date.now();
          const jsErrors: string[] = [];

          // Create a fresh context with auth cookies for protected routes
          const context = await browser.newContext();
          if (route.requiresAuth && authCookies) {
            await context.addCookies(authCookies);
          }

          const page = await context.newPage();

          // Collect JS errors
          page.on('pageerror', (error) => {
            jsErrors.push(error.message);
          });

          let status: RouteStatus = 'PASS';
          let bodyLength = 0;

          try {
            // Navigate with a generous timeout
            const response = await page.goto(route.path, {
              waitUntil: 'domcontentloaded',
              timeout: 30_000,
            });

            // Wait for hydration
            await page.waitForTimeout(3000);

            // Get page content
            const bodyText = await page.evaluate(() => document.body?.innerText || '');
            bodyLength = bodyText.length;

            // Check for 404
            const title = await page.title();
            const is404 = title.includes('404') ||
              bodyText.includes('This page could not be found') ||
              (bodyText.includes('404') && bodyText.length < 500);

            // Check for crash (Next.js error overlay or React error boundary)
            const hasCrash = await page.evaluate(() => {
              // Check for Next.js error overlay (not #__next-build-watcher which is always present in dev)
              const overlay = document.querySelector('[data-nextjs-dialog]') ||
                document.querySelector('[data-nextjs-dialog-overlay]');
              const bodyText = document.body?.innerText || '';
              return !!(overlay ||
                bodyText.includes('Unhandled Runtime Error') ||
                bodyText.includes('Application error: a client-side exception') ||
                bodyText.includes('Application error: a server-side exception'));
            });

            // Classify
            if (is404) {
              status = '404';
            } else if (hasCrash) {
              status = 'CRASH';
            } else if (jsErrors.length > 0) {
              status = 'BROKEN';
            } else if (bodyLength < 100 || /coming soon|under construction|placeholder|todo/i.test(bodyText)) {
              status = 'STUB';
            }
          } catch (error: any) {
            status = 'CRASH';
            jsErrors.push(`Navigation error: ${error.message}`);
          }

          // Screenshot for failures
          let screenshotPath: string | undefined;
          if (['CRASH', '404', 'BROKEN'].includes(status)) {
            const filename = `${route.group}-${route.label}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            screenshotPath = path.join(SCREENSHOT_DIR, `${filename}.png`);
            try {
              await page.screenshot({ path: screenshotPath, fullPage: true });
            } catch {
              // Page may have crashed too hard for screenshot
            }
          }

          const result: RouteResult = {
            group: route.group,
            label: route.label,
            path: route.path,
            status,
            errors: jsErrors,
            bodyLength,
            screenshotPath,
            duration: Date.now() - start,
          };

          results.push(result);

          await context.close();

          // Log result inline
          const icon = { PASS: '\u2705', STUB: '\u26a0\ufe0f', BROKEN: '\ud83d\udd27', CRASH: '\ud83d\udca5', '404': '\ud83d\udeab' }[status];
          console.log(`${icon} [${status}] ${route.group} > ${route.label} \u2014 ${route.path}${jsErrors.length ? ` (${jsErrors.length} errors)` : ''}`);
        });
      }
    });
  }

  test.afterAll(async () => {
    // Write results JSON
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

    // Print summary
    const counts: Record<RouteStatus, number> = { PASS: 0, STUB: 0, BROKEN: 0, CRASH: 0, '404': 0 };
    for (const r of results) {
      counts[r.status]++;
    }

    console.log('\n========================================');
    console.log('QS-008 Runtime Verification Summary');
    console.log('========================================');
    console.log(`PASS:    ${counts.PASS}`);
    console.log(`STUB:    ${counts.STUB}`);
    console.log(`BROKEN:  ${counts.BROKEN}`);
    console.log(`CRASH:   ${counts.CRASH}`);
    console.log(`404:     ${counts['404']}`);
    console.log(`TOTAL:   ${results.length}`);
    console.log('========================================');

    if (counts.CRASH > 0 || counts['404'] > 0 || counts.BROKEN > 0) {
      console.log('\nFailures:');
      for (const r of results) {
        if (['CRASH', '404', 'BROKEN'].includes(r.status)) {
          console.log(`  [${r.status}] ${r.group} > ${r.label} \u2014 ${r.path}`);
          for (const err of r.errors) {
            console.log(`    Error: ${err.substring(0, 200)}`);
          }
        }
      }
    }
  });
});
