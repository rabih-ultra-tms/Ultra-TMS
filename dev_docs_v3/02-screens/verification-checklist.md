# Runtime Verification Checklist

> Use with QS-008 task — click every route, verify it renders
> Tool: Playwright (`browser_navigate` + `browser_take_screenshot`)
> Prerequisite: `pnpm dev` running on ports 3000 + 3001 + Docker infra

---

## Verification Protocol

For each route:
1. `browser_navigate` to the route
2. `browser_snapshot` — check accessibility tree for content (not blank)
3. `browser_take_screenshot` — visual record
4. Record: PASS (renders real content) | STUB (renders "Coming Soon" or empty shell) | FAIL (404 or error)

Results → Update `Status` column in `_index.md`

---

## Auth Routes

| Route | Expected | Verify |
|-------|----------|--------|
| `/login` | Login form with email/password fields, submit button | |
| `/register` | Register form — may be stub | |
| `/forgot-password` | Forgot password form — may be stub | |
| `/reset-password` | Reset password form — may be stub | |
| `/mfa` | MFA input — 6-digit field + QR code flow | |
| `/superadmin/login` | Super admin login form | |
| `/verify-email` | Email verification page | |

---

## Dashboard

| Route | Expected | Verify |
|-------|----------|--------|
| `/dashboard` | KPI cards (even if showing 0), recent activity | |

---

## Admin

| Route | Expected | Verify |
|-------|----------|--------|
| `/admin/users` | Users table with data or empty state | |
| `/admin/users/new` | User creation form | |
| `/admin/users/[id]` | User detail — needs real user ID | |
| `/admin/users/[id]/edit` | User edit form | |
| `/admin/roles` | Roles table | |
| `/admin/roles/new` | Role creation form | |
| `/admin/roles/[id]` | Role detail | |
| `/admin/permissions` | Permissions matrix grid | |
| `/admin/tenants` | Tenants table | |
| `/admin/tenants/[id]` | Tenant detail | |
| `/admin/audit-logs` | Audit log table | |
| `/admin/settings` | Settings page | |

---

## Profile

| Route | Expected | Verify |
|-------|----------|--------|
| `/profile` | Profile display + edit form | |
| `/profile/security` | Password change, MFA settings | |

---

## CRM

| Route | Expected | Verify |
|-------|----------|--------|
| `/companies` | Companies table with search | |
| `/companies/new` | Company create form | |
| `/companies/[id]` | Company detail (tabbed) | |
| `/companies/[id]/edit` | Company edit form | |
| `/companies/[id]/activities` | Activity timeline | |
| `/companies/[id]/contacts` | Contacts sub-list | |
| `/customers` | Redirects to /companies | |
| `/contacts` | Contacts table | |
| `/contacts/new` | Contact create form | |
| `/contacts/[id]` | Contact detail | |
| `/contacts/[id]/edit` | Contact edit form | |
| `/leads` | Leads table + pipeline view | |
| `/leads/new` | Lead create form | |
| `/leads/[id]` | Lead detail | |
| `/leads/[id]/activities` | Lead activity timeline | |
| `/activities` | Activity log | |

---

## Sales & Quotes

| Route | Expected | Verify |
|-------|----------|--------|
| `/quotes` | Quotes table | |
| `/quotes/new` | Quote create form | |
| `/quotes/[id]` | Quote detail | |
| `/quotes/[id]/edit` | Quote edit form | |
| `/quote-history` | Quote history list | |
| `/load-planner/[id]/edit` | Full Load Planner (PROTECTED) — use test load ID | |
| `/load-planner/history` | Load planner history list | |

---

## TMS Core — CRITICAL VERIFICATION

| Route | Expected | Pass/Stub/Fail |
|-------|----------|----------------|
| `/operations` | Operations dashboard with KPIs | |
| `/operations/orders` | Orders table | |
| `/operations/orders/new` | Order creation form | |
| `/operations/orders/[id]` | Order detail (tabbed) | |
| `/operations/orders/[id]/edit` | Order edit form | |
| `/operations/loads` | Loads table | |
| `/operations/loads/new` | Load creation form | |
| `/operations/loads/[id]` | Load detail (tabbed) | |
| `/operations/loads/[id]/edit` | Load edit form | |
| `/operations/loads/[id]/rate-con` | Rate confirmation viewer | |
| `/operations/dispatch` | Dispatch board (Kanban) | |
| `/operations/tracking` | Tracking map | |

---

## Carriers

| Route | Expected | Pass/Stub/Fail |
|-------|----------|----------------|
| `/carriers` | Carriers table | |
| `/carriers/[id]` | **Carrier detail — KNOWN BUG BUG-001** | |
| `/carriers/[id]/edit` | Carrier edit form | |
| `/carriers/[id]/scorecard` | Carrier scorecard | |
| `/load-history` | Load history table | |
| `/load-history/[id]` | **Load history detail — KNOWN BUG BUG-002** | |
| `/truck-types` | Truck types CRUD (PROTECTED) | |

---

## Accounting — CRITICAL VERIFICATION

| Route | Expected | Pass/Stub/Fail |
|-------|----------|----------------|
| `/accounting` | Accounting dashboard | |
| `/accounting/invoices` | Invoices table | |
| `/accounting/invoices/new` | Invoice create form | |
| `/accounting/invoices/[id]` | Invoice detail | |
| `/accounting/payables` | Payables list | |
| `/accounting/payments` | Payments list | |
| `/accounting/payments/[id]` | Payment detail | |
| `/accounting/settlements` | Settlements table | |
| `/accounting/settlements/[id]` | Settlement detail | |
| `/accounting/reports/aging` | Aging report | |

---

## Commission — CRITICAL VERIFICATION

| Route | Expected | Pass/Stub/Fail |
|-------|----------|----------------|
| `/commissions` | Commission dashboard | |
| `/commissions/plans` | Plans list | |
| `/commissions/plans/new` | Plan create form | |
| `/commissions/plans/[id]` | Plan detail | |
| `/commissions/plans/[id]/edit` | Plan edit | |
| `/commissions/payouts` | Payouts list | |
| `/commissions/payouts/[id]` | Payout detail | |
| `/commissions/reports` | Commission reports | |
| `/commissions/reps` | Sales reps list | |
| `/commissions/reps/[id]` | Rep detail | |
| `/commissions/transactions` | Transactions list | |

---

## Load Board — CRITICAL VERIFICATION

| Route | Expected | Pass/Stub/Fail |
|-------|----------|----------------|
| `/load-board` | Available loads for posting | |
| `/load-board/post` | Post load form | |
| `/load-board/postings/[id]` | Posting detail | |
| `/load-board/search` | Load board search | |

---

## Other

| Route | Expected | Verify |
|-------|----------|--------|
| `/superadmin/tenant-services` | Tenant services management | |
| `/track/[trackingCode]` | Public tracking page (no auth) | |
| `/` | Root — should redirect | |

---

## Verification Results Template

After running QS-008, update this file:

```
VERIFICATION RUN: YYYY-MM-DD
Environment: localhost:3000
Auth: logged in as ADMIN role

RESULTS:
Total routes: 98
PASS: XX
STUB: XX
FAIL: XX

PASS routes: [list]
STUB routes: [list — shows "coming soon" or empty skeleton]
FAIL routes: [list — 404, error, blank page]

Screenshots: dev_docs_v3/verification/screenshots/
```

---

## What to Check Beyond "Does It Render?"

For each PASS route, additionally verify:

1. **API Call Success:** Open DevTools Network tab — do API calls return 200? No 404s or 500s?
2. **Real Data or Hardcoded:** Does the page show database data, or hardcoded placeholder values?
3. **Loading State:** Does the page show a loading skeleton while fetching? (Not just blank)
4. **Error State:** What happens if you kill the API? Does it show an error, or just hang?
5. **Empty State:** If the table/list is empty, does it show a helpful empty state message?
6. **Interactive Elements:** Click every button. Are there stubs (onClick does nothing)?
7. **Forms:** Try submitting a form. Does it call the API? Does it validate?
8. **Console Errors:** Are there any console.error or unhandled promise rejections?
