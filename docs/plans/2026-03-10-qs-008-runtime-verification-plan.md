# QS-008: Runtime Verification — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Navigate all 103 frontend routes via Playwright, classify each as PASS/STUB/BROKEN/CRASH/404, screenshot failures, and produce a machine-readable report.

**Architecture:** A standalone Playwright test script (not in the web/api apps) that authenticates once, then visits every route in sequence. Uses `page.on('pageerror')` to detect JS errors, DOM checks for Next.js error overlays and 404 pages, and content checks for stub detection. Results written to JSON + console summary table.

**Tech Stack:** Playwright Test (`@playwright/test`), TypeScript, `tsx` runner (already in root deps)

---

### Task 1: Install Playwright and scaffold e2e directory

**Files:**
- Create: `e2e/playwright.config.ts`
- Create: `e2e/package.json`
- Create: `e2e/tsconfig.json`
- Create: `e2e/reports/` (directory)

**Step 1: Create `e2e/` directory and install Playwright**

```bash
mkdir -p e2e/reports/qs-008-screenshots
cd e2e
cat > package.json << 'PJEOF'
{
  "name": "ultra-tms-e2e",
  "private": true,
  "devDependencies": {
    "@playwright/test": "^1.50.0"
  }
}
PJEOF
pnpm install
npx playwright install chromium
```

**Step 2: Create Playwright config**

Create `e2e/playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 120_000,         // 2 min per test (some pages are slow)
  retries: 0,               // No retries — we want raw results
  reporter: [['list'], ['json', { outputFile: 'reports/qs-008-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

**Step 3: Create tsconfig**

Create `e2e/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["*.ts"]
}
```

**Step 4: Verify setup**

```bash
cd e2e && npx playwright test --list
```

Expected: No tests found (no spec files yet). No errors.

---

### Task 2: Write the route registry

**Files:**
- Create: `e2e/route-registry.ts`

**Step 1: Create the route registry**

This file defines all 103 routes with metadata. Each route has a `group`, `path`, `requiresAuth`, `isDynamic`, and `label`.

Create `e2e/route-registry.ts` with the full route list extracted from the screen catalog. Dynamic `[id]` routes use the dummy UUID `00000000-0000-0000-0000-000000000001`.

The registry should be a flat array of objects:

```typescript
export interface RouteEntry {
  group: string;
  label: string;
  path: string;
  requiresAuth: boolean;
  requiresRole?: 'ADMIN' | 'SUPER_ADMIN';
}

export const DUMMY_ID = '00000000-0000-0000-0000-000000000001';

export const routes: RouteEntry[] = [
  // Auth (7) — no auth required
  { group: 'Auth', label: 'Login', path: '/login', requiresAuth: false },
  { group: 'Auth', label: 'Register', path: '/register', requiresAuth: false },
  { group: 'Auth', label: 'Forgot Password', path: '/forgot-password', requiresAuth: false },
  { group: 'Auth', label: 'Reset Password', path: '/reset-password', requiresAuth: false },
  { group: 'Auth', label: 'Verify Email', path: '/verify-email', requiresAuth: false },
  { group: 'Auth', label: 'MFA', path: '/mfa', requiresAuth: false },
  { group: 'Auth', label: 'Super Admin Login', path: '/superadmin/login', requiresAuth: false },

  // Dashboard (1)
  { group: 'Dashboard', label: 'Main Dashboard', path: '/dashboard', requiresAuth: true },

  // Admin (11)
  { group: 'Admin', label: 'Users List', path: '/admin/users', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'User Create', path: '/admin/users/new', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'User Detail', path: `/admin/users/${DUMMY_ID}`, requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'User Edit', path: `/admin/users/${DUMMY_ID}/edit`, requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Roles List', path: '/admin/roles', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Role Create', path: '/admin/roles/new', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Role Detail', path: `/admin/roles/${DUMMY_ID}`, requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Permissions Matrix', path: '/admin/permissions', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Tenants List', path: '/admin/tenants', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Tenant Detail', path: `/admin/tenants/${DUMMY_ID}`, requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Audit Logs', path: '/admin/audit-logs', requiresAuth: true, requiresRole: 'ADMIN' },
  { group: 'Admin', label: 'Admin Settings', path: '/admin/settings', requiresAuth: true, requiresRole: 'ADMIN' },

  // Profile (2)
  { group: 'Profile', label: 'Profile', path: '/profile', requiresAuth: true },
  { group: 'Profile', label: 'Security Settings', path: '/profile/security', requiresAuth: true },

  // CRM — Companies (6)
  { group: 'CRM', label: 'Companies List', path: '/companies', requiresAuth: true },
  { group: 'CRM', label: 'Company Create', path: '/companies/new', requiresAuth: true },
  { group: 'CRM', label: 'Company Detail', path: `/companies/${DUMMY_ID}`, requiresAuth: true },
  { group: 'CRM', label: 'Company Edit', path: `/companies/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'CRM', label: 'Company Activities', path: `/companies/${DUMMY_ID}/activities`, requiresAuth: true },
  { group: 'CRM', label: 'Company Contacts', path: `/companies/${DUMMY_ID}/contacts`, requiresAuth: true },

  // CRM — Customers (6)
  { group: 'CRM', label: 'Customers List', path: '/customers', requiresAuth: true },
  { group: 'CRM', label: 'Customer Create', path: '/customers/new', requiresAuth: true },
  { group: 'CRM', label: 'Customer Detail', path: `/customers/${DUMMY_ID}`, requiresAuth: true },
  { group: 'CRM', label: 'Customer Edit', path: `/customers/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'CRM', label: 'Customer Activities', path: `/customers/${DUMMY_ID}/activities`, requiresAuth: true },
  { group: 'CRM', label: 'Customer Contacts', path: `/customers/${DUMMY_ID}/contacts`, requiresAuth: true },

  // CRM — Contacts (4)
  { group: 'CRM', label: 'Contacts List', path: '/contacts', requiresAuth: true },
  { group: 'CRM', label: 'Contact Create', path: '/contacts/new', requiresAuth: true },
  { group: 'CRM', label: 'Contact Detail', path: `/contacts/${DUMMY_ID}`, requiresAuth: true },
  { group: 'CRM', label: 'Contact Edit', path: `/contacts/${DUMMY_ID}/edit`, requiresAuth: true },

  // CRM — Leads (5)
  { group: 'CRM', label: 'Leads List', path: '/leads', requiresAuth: true },
  { group: 'CRM', label: 'Lead Create', path: '/leads/new', requiresAuth: true },
  { group: 'CRM', label: 'Lead Detail', path: `/leads/${DUMMY_ID}`, requiresAuth: true },
  { group: 'CRM', label: 'Lead Activities', path: `/leads/${DUMMY_ID}/activities`, requiresAuth: true },
  { group: 'CRM', label: 'Lead Contacts', path: `/leads/${DUMMY_ID}/contacts`, requiresAuth: true },

  // Activities (1)
  { group: 'CRM', label: 'Activities', path: '/activities', requiresAuth: true },

  // Sales & Quotes (7)
  { group: 'Sales', label: 'Quotes List', path: '/quotes', requiresAuth: true },
  { group: 'Sales', label: 'Quote Create', path: '/quotes/new', requiresAuth: true },
  { group: 'Sales', label: 'Quote Detail', path: `/quotes/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Sales', label: 'Quote Edit', path: `/quotes/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'Sales', label: 'Quote History', path: '/quote-history', requiresAuth: true },
  { group: 'Sales', label: 'Load Planner', path: `/load-planner/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'Sales', label: 'Load Planner History', path: '/load-planner/history', requiresAuth: true },

  // TMS Core — Operations (12)
  { group: 'TMS Core', label: 'Operations Dashboard', path: '/operations', requiresAuth: true },
  { group: 'TMS Core', label: 'Orders List', path: '/operations/orders', requiresAuth: true },
  { group: 'TMS Core', label: 'Order Create', path: '/operations/orders/new', requiresAuth: true },
  { group: 'TMS Core', label: 'Order Detail', path: `/operations/orders/${DUMMY_ID}`, requiresAuth: true },
  { group: 'TMS Core', label: 'Order Edit', path: `/operations/orders/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'TMS Core', label: 'Loads List', path: '/operations/loads', requiresAuth: true },
  { group: 'TMS Core', label: 'Load Create', path: '/operations/loads/new', requiresAuth: true },
  { group: 'TMS Core', label: 'Load Detail', path: `/operations/loads/${DUMMY_ID}`, requiresAuth: true },
  { group: 'TMS Core', label: 'Load Edit', path: `/operations/loads/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'TMS Core', label: 'Rate Confirmation', path: `/operations/loads/${DUMMY_ID}/rate-con`, requiresAuth: true },
  { group: 'TMS Core', label: 'Dispatch Board', path: '/operations/dispatch', requiresAuth: true },
  { group: 'TMS Core', label: 'Tracking Map', path: '/operations/tracking', requiresAuth: true },

  // Carriers (4)
  { group: 'Carriers', label: 'Carriers List', path: '/carriers', requiresAuth: true },
  { group: 'Carriers', label: 'Carrier Detail', path: `/carriers/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Carriers', label: 'Carrier Edit', path: `/carriers/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'Carriers', label: 'Carrier Scorecard', path: `/carriers/${DUMMY_ID}/scorecard`, requiresAuth: true },

  // Load History (2)
  { group: 'Carriers', label: 'Load History List', path: '/load-history', requiresAuth: true },
  { group: 'Carriers', label: 'Load History Detail', path: `/load-history/${DUMMY_ID}`, requiresAuth: true },

  // Truck Types (1)
  { group: 'Carriers', label: 'Truck Types', path: '/truck-types', requiresAuth: true },

  // Accounting (10)
  { group: 'Accounting', label: 'Accounting Dashboard', path: '/accounting', requiresAuth: true },
  { group: 'Accounting', label: 'Invoices List', path: '/accounting/invoices', requiresAuth: true },
  { group: 'Accounting', label: 'Invoice Create', path: '/accounting/invoices/new', requiresAuth: true },
  { group: 'Accounting', label: 'Invoice Detail', path: `/accounting/invoices/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Accounting', label: 'Payables', path: '/accounting/payables', requiresAuth: true },
  { group: 'Accounting', label: 'Payments List', path: '/accounting/payments', requiresAuth: true },
  { group: 'Accounting', label: 'Payment Detail', path: `/accounting/payments/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Accounting', label: 'Settlements List', path: '/accounting/settlements', requiresAuth: true },
  { group: 'Accounting', label: 'Settlement Detail', path: `/accounting/settlements/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Accounting', label: 'Aging Report', path: '/accounting/reports/aging', requiresAuth: true },

  // Commission (11)
  { group: 'Commission', label: 'Commissions Dashboard', path: '/commissions', requiresAuth: true },
  { group: 'Commission', label: 'Plans List', path: '/commissions/plans', requiresAuth: true },
  { group: 'Commission', label: 'Plan Create', path: '/commissions/plans/new', requiresAuth: true },
  { group: 'Commission', label: 'Plan Detail', path: `/commissions/plans/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Commission', label: 'Plan Edit', path: `/commissions/plans/${DUMMY_ID}/edit`, requiresAuth: true },
  { group: 'Commission', label: 'Payouts List', path: '/commissions/payouts', requiresAuth: true },
  { group: 'Commission', label: 'Payout Detail', path: `/commissions/payouts/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Commission', label: 'Reports', path: '/commissions/reports', requiresAuth: true },
  { group: 'Commission', label: 'Sales Reps', path: '/commissions/reps', requiresAuth: true },
  { group: 'Commission', label: 'Sales Rep Detail', path: `/commissions/reps/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Commission', label: 'Transactions', path: '/commissions/transactions', requiresAuth: true },

  // Load Board (4)
  { group: 'Load Board', label: 'Load Board', path: '/load-board', requiresAuth: true },
  { group: 'Load Board', label: 'Post Load', path: '/load-board/post', requiresAuth: true },
  { group: 'Load Board', label: 'Posting Detail', path: `/load-board/postings/${DUMMY_ID}`, requiresAuth: true },
  { group: 'Load Board', label: 'Load Board Search', path: '/load-board/search', requiresAuth: true },

  // Super Admin (1)
  { group: 'Super Admin', label: 'Tenant Services', path: '/superadmin/tenant-services', requiresAuth: true, requiresRole: 'SUPER_ADMIN' },

  // Portal (5) — separate auth, tested separately
  { group: 'Portal', label: 'Portal Login', path: '/portal/login', requiresAuth: false },
  { group: 'Portal', label: 'Portal Dashboard', path: '/portal/dashboard', requiresAuth: false },
  { group: 'Portal', label: 'Portal Documents', path: '/portal/documents', requiresAuth: false },
  { group: 'Portal', label: 'Portal Shipments', path: '/portal/shipments', requiresAuth: false },
  { group: 'Portal', label: 'Portal Shipment Detail', path: `/portal/shipments/${DUMMY_ID}`, requiresAuth: false },

  // Public (2)
  { group: 'Public', label: 'Root', path: '/', requiresAuth: false },
  { group: 'Public', label: 'Public Tracking', path: `/track/${DUMMY_ID}`, requiresAuth: false },
];
```

**Step 2: Verify count**

```bash
cd e2e && npx tsx -e "import { routes } from './route-registry'; console.log('Total routes:', routes.length)"
```

Expected: `Total routes: 103` (give or take — adjust registry if needed)

---

### Task 3: Write the runtime verification test

**Files:**
- Create: `e2e/qs-008-runtime-verification.spec.ts`

**Step 1: Write the test file**

The test file should:

1. **`beforeAll`**: Log in via API call to `http://localhost:3001/api/v1/auth/login` with `admin@test.com` / `Test1234!`. Extract `accessToken` from response. Set it as a cookie on the browser context.

2. **Group routes by `group`** and create a `test.describe` block per group.

3. **For each route**, create a `test()` that:
   - Collects JS errors via `page.on('pageerror', ...)`
   - Navigates to the route with `page.goto(path, { waitUntil: 'networkidle', timeout: 15000 })`
   - Waits 2s for hydration
   - Checks classification:
     - **404**: `document.title` contains "404" OR page has `.not-found` selector OR body text contains "This page could not be found" or "404"
     - **CRASH**: Page has `nextjs-portal` (Next.js error overlay) OR `[data-nextjs-dialog]` OR text "Unhandled Runtime Error" OR text "Application error"
     - **BROKEN**: Any JS errors were collected via `pageerror`
     - **STUB**: Page body text length < 100 chars OR page contains "Coming Soon" / "Under Construction" / "TODO" / "placeholder"
     - **PASS**: None of the above
   - Takes a screenshot if result is CRASH, 404, or BROKEN
   - Writes result to a shared array

4. **`afterAll`**: Write results JSON to `e2e/reports/qs-008-results.json` and print summary table.

**Step 2: Run the test**

```bash
cd e2e && npx playwright test qs-008-runtime-verification.spec.ts --reporter=list
```

Expected: All 103 tests run. Each prints its classification. Summary at end.

---

### Task 4: Run verification and collect results

**Step 1: Execute the full test suite**

```bash
cd e2e && npx playwright test --reporter=list 2>&1 | tee reports/qs-008-run-output.txt
```

**Step 2: Inspect results JSON**

```bash
cat e2e/reports/qs-008-results.json | npx tsx -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('e2e/reports/qs-008-results.json', 'utf8'));
  const counts = { PASS: 0, STUB: 0, BROKEN: 0, CRASH: 0, '404': 0 };
  data.forEach(r => counts[r.status]++);
  console.table(counts);
  console.log('\\nFailures:');
  data.filter(r => r.status !== 'PASS').forEach(r => console.log(\`  [\${r.status}] \${r.group} > \${r.label} — \${r.path}\`));
"
```

---

### Task 5: Manual MCP inspection of failures

**Step 1: For each CRASH/404/BROKEN route from the JSON report:**

- Navigate via Playwright MCP `browser_navigate`
- Take screenshot via `browser_take_screenshot`
- Inspect console errors via `browser_console_messages`
- Diagnose root cause (missing API endpoint, import error, missing component, etc.)
- Log findings in the results

**Step 2: Create bug task files**

For each CRASH or 404 route, create a bug task in `dev_docs_v3/03-tasks/backlog/bugs/` with:
- Route path
- Classification
- Root cause
- Screenshot reference
- Suggested fix

---

### Task 6: Update screen catalog and commit

**Files:**
- Modify: `dev_docs_v3/02-screens/_index.md` — update Status column with verified results
- Modify: `dev_docs_v3/03-tasks/sprint-quality/QS-008-runtime-verification.md` — mark DONE

**Step 1: Update screen catalog**

Replace "Needs verification" notes with actual results from the JSON report. Update Status column (Built → PASS, Stub → STUB, etc.).

**Step 2: Update QS-008 task file**

Set status to DONE with summary: `X/103 PASS, X STUB, X BROKEN, X CRASH, X 404`.

**Step 3: Update STATUS.md**

Mark QS-008 as DONE.

**Step 4: Commit**

```bash
git add e2e/ dev_docs_v3/02-screens/_index.md dev_docs_v3/03-tasks/ dev_docs_v3/STATUS.md docs/plans/2026-03-10-qs-008-*
git commit -m "feat(QS-008): runtime verification of all 103 routes

Playwright test suite verifies every frontend route renders.
Results: X/103 PASS, X STUB, X BROKEN, X CRASH, X 404.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Execution Summary

| Task | Description | Effort |
|------|-------------|--------|
| 1 | Install Playwright + scaffold | 5 min |
| 2 | Write route registry (103 routes) | 10 min |
| 3 | Write verification test | 15 min |
| 4 | Run tests + collect results | 10 min |
| 5 | MCP inspection of failures | 20-60 min (depends on failure count) |
| 6 | Update docs + commit | 10 min |
