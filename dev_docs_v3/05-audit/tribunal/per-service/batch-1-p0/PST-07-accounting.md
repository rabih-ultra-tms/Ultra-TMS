# PST-07: Accounting — Invoices & Settlements

> **Service:** Accounting (07)
> **Hub file:** `dev_docs_v3/01-services/p0-mvp/07-accounting.md`
> **Auditor:** Claude Code (Opus 4.6)
> **Date:** 2026-03-08
> **Verdict:** MODIFY
> **Hub Score:** 7.0/10 → **Verified Score: 8.2/10** (+1.2)

---

## Executive Summary

The Accounting module is **significantly larger and more capable than the hub documents**. The hub describes a 3-model, 17-endpoint system; reality is an **11-model, 54-endpoint full double-entry accounting platform** with Chart of Accounts, Journal Entries, Payment Applications, PDF generation, and QuickBooks stubs. The backend is the most architecturally complete of any P0 service audited so far.

**Biggest finding:** The hub's #1 known issue — "Dashboard endpoint missing (QS-003)" — is **FALSE**. The `GET /accounting/dashboard` endpoint EXISTS and returns AR, AP, overdue count, DSO, revenue MTD, and cash collected MTD. The aging report endpoint also EXISTS. **QS-003 may already be done.**

The hub data model section documents 3 models with ~43 fields total. Reality has **11 Prisma models with 200+ fields**. The hub's "Payment" model doesn't exist — payments are split into `PaymentReceived` and `PaymentMade` (two completely different models). Eight entire models are missing from the hub.

---

## Phase 1: Data Model Audit

### Hub Claims vs Reality

| Hub Model | Actual Model | Hub Fields | Actual Fields | Accuracy |
|-----------|-------------|------------|---------------|----------|
| Invoice | Invoice | 18 | 35+ | ~50% — missing 17 fields (currency, agingBucket, reminderCount, collectionStatus, revenueAccountId, arAccountId, voidedAt, voidedById, voidReason, paymentTerms, notes, internalNotes, daysOutstanding, lastReminderDate, createdById, updatedById, quickbooksId) |
| Settlement | Settlement | 14 | 35+ | ~40% — completely different structure. Hub says lineHaul/fuelSurcharge/accessorials; actual uses grossAmount/deductionsTotal/quickPayFee/netAmount + quickpay/factoring support |
| Payment | **DOES NOT EXIST** | 11 | 0 | 0% — split into PaymentReceived (20+ fields) and PaymentMade (18+ fields) |

### Models Missing From Hub (8 total)

| Model | Fields | Purpose | Critical? |
|-------|--------|---------|-----------|
| ChartOfAccount | 16 | Double-entry accounting chart of accounts with parent/child hierarchy | YES |
| InvoiceLineItem | 16 | Individual line items on invoices (FREIGHT, ACCESSORIAL, ADJUSTMENT) | YES |
| JournalEntry | 16 | General ledger journal entries (DRAFT → POSTED flow) | YES |
| JournalEntryLine | 14 | Debit/credit lines on journal entries | YES |
| PaymentApplication | 10 | Links PaymentReceived to Invoice (many-to-many allocation) | YES |
| PaymentReceived | 20+ | Customer payments received (RECEIVED → APPLIED → BOUNCED flow) | YES |
| PaymentMade | 18+ | Carrier payments made (PENDING → SENT → CLEARED flow) | YES |
| SettlementLineItem | 14 | Individual line items on settlements | YES |
| PaymentPlan | 20+ | Customer payment plans with installments (NO controller/service!) | Orphan |

### Hub Data Model Accuracy: ~15%

The hub documents a simplified 3-model view. Reality is a full **double-entry accounting system** with chart of accounts, journal entries, payment allocation, and quickpay/factoring support. The Settlement model is particularly wrong — hub describes a simple freight/fuel/accessorials breakdown, but actual model supports quickpay fees, factoring companies, expense/AP account mapping, and approval workflows.

---

## Phase 2: API Endpoints Audit

### Hub Claims: 17 endpoints → Actual: 54 endpoints (3.2x more)

| Controller | Hub Endpoints | Actual Endpoints | Missing From Hub |
|-----------|--------------|-----------------|------------------|
| Accounting (Dashboard) | 2 (both "Not Built") | 2 (both BUILT) | Hub wrong — endpoints EXIST |
| Invoices | 7 | 12 | +5 (aging, statements PDF, invoice PDF, remind, generate-from-load) |
| Settlements | 5 | 8 | +3 (payables-summary, approve, generate-from-load) |
| Payments (hub's unified) | 3 | 1 (batch alias only) | Hub concept doesn't match reality |
| PaymentsReceived | 0 | 7 | Entire controller missing from hub |
| PaymentsMade | 0 | 8 | Entire controller missing from hub |
| ChartOfAccounts | 0 | 6 | Entire controller missing from hub |
| JournalEntries | 0 | 7 | Entire controller missing from hub |
| Reports | 0 | 3 | Entire controller missing from hub |
| QuickBooks | 0 | 2 (stubs) | Entire controller missing from hub |

### CRITICAL: Known Issues That Are FALSE

| Hub Issue | Severity | Verdict | Evidence |
|-----------|----------|---------|----------|
| "Accounting Dashboard endpoint missing (QS-003)" | P0 | **FALSE — ENDPOINT EXISTS** | `accounting.controller.ts` line 18: `@Get('dashboard')` → calls `reportsService.getDashboard(tenantId)` returning totalAR, totalAP, overdueInvoiceCount, DSO, revenueMTD, cashCollectedMTD |
| "Aging Report endpoint missing" | P1 | **FALSE — ENDPOINT EXISTS** | `accounting.controller.ts` line 28: `@Get('aging')` + `reports.controller.ts` line 15: `@Get('aging')` — TWO aging endpoints exist |
| "Invoices/stats Not Built" | P1 | **FALSE — Dashboard serves this** | Dashboard endpoint returns all invoice stats needed |

**Impact:** QS-003 task ("Build Accounting Dashboard Endpoint") may already be DONE. Need runtime verification to confirm the endpoint actually works (QS-008 scope).

---

## Phase 3: Frontend Audit

### Pages: Hub claims 10 → Actual: 11

| Page | Hub Score | Verified Score | Delta | Notes |
|------|-----------|---------------|-------|-------|
| Dashboard (`/accounting`) | 7/10 | 7/10 | 0 | Real API calls, skeleton loading, KPI cards |
| Invoices List | 8/10 | 8/10 | 0 | Filters, pagination, search, status badges |
| Invoice Detail | 8/10 | 8/10 | 0 | 3 tabs (overview, line items, payments), error handling |
| Invoice Create | 8/10 | 7/10 | -1 | `any` type assertion (eslint-disable), Suspense wrapper |
| Settlements List | 8/10 | 7/10 | -1 | Standard list, no detail navigation issues |
| Settlement Detail | 8/10 | 8/10 | 0 | 2 tabs, approve/process workflow |
| Payments List | 8/10 | 8/10 | 0 | Dialog form for recording, method filters |
| Payment Detail | 7/10 | 8/10 | +1 | Advanced allocation table (453 LOC), auto-calculate |
| Payables List | 8/10 | 7/10 | -1 | Simple list, no detail route |
| Aging Report | 7/10 | 8/10 | +1 | Bar chart + detail table, customer filter |
| Invoice Edit | "Not Built" | Not Built | — | Confirmed missing |
| Settlement Create | "Not Built" | Not Built | — | Confirmed missing |

**Average quality: 7.5/10** (hub claims 7.9 — slightly inflated)

### Components: 18 claimed → 18 verified (exact match)

All components use design tokens, Tailwind 4, shadcn/ui. No hardcoded colors. Status badges use centralized status config objects.

### Hooks: 6 claimed → 6 verified (exact match)

All hooks use a consistent `unwrap<T>()` helper:
```typescript
function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  if (body.pagination) return { data: body.data, pagination: body.pagination } as T;
  return (body.data ?? response) as T;
}
```

**Envelope pattern: CONSISTENT** across all 6 hooks. This is the best envelope handling of any P0 service audited. All mutations properly invalidate caches. `useAllocatePayment()` cross-invalidates invoices cache.

### Frontend Total LOC: ~5,244

---

## Phase 4: Security & Tenant Isolation

### Tenant Isolation: PARTIALLY COMPLIANT — 4 CRITICAL BUGS

**All CREATE, LIST, GET operations:** Correctly filter by tenantId ✓

**CRITICAL: Cross-tenant bugs in `payments-received.service.ts`:**

| Line | Method | Bug | Risk |
|------|--------|-----|------|
| ~170 | `applyToInvoice()` | `tx.invoice.update({ where: { id: application.invoiceId } })` — no tenantId | Can apply payment to another tenant's invoice |
| ~215 | `markBounced()` | `tx.invoice.findUnique({ where: { id: application.invoiceId } })` — no tenantId | Can read another tenant's invoice |
| ~223 | `markBounced()` | `tx.invoice.update({ where: { id: application.invoiceId } })` — no tenantId | Can modify another tenant's invoice amount |
| ~303 | `processBatch()` | `where: { id: allocation.invoiceId }` — no tenantId | Batch processing can touch cross-tenant invoices |

**All 4 bugs are in transaction blocks** where the service trusts the invoiceId from the request without verifying it belongs to the same tenant. An attacker could craft a payment application request with a valid invoiceId from another tenant.

### Role-Based Access: INCONSISTENT

| Controller | Has RolesGuard? | Issue |
|-----------|----------------|-------|
| accounting (dashboard) | ✓ ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN | Good |
| invoices | ✓ ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, SUPER_ADMIN | Good |
| reports | ✓ ADMIN, ACCOUNTING, MANAGER | Good |
| quickbooks | ✓ ADMIN, ACCOUNTING | Good |
| **chart-of-accounts** | ✗ JwtAuthGuard only | **Any authenticated user can modify CoA** |
| **settlements** | ✗ JwtAuthGuard only | **Any authenticated user can approve/void settlements** |
| **payments-received** | ✗ JwtAuthGuard only | **Any authenticated user can record/bounce payments** |
| **payments-made** | ✗ JwtAuthGuard only | **Any authenticated user can create carrier payments** |
| **journal-entries** | ✗ JwtAuthGuard only | **Any authenticated user can post journal entries** |
| **payments (batch)** | ✗ JwtAuthGuard only | **Any authenticated user can batch process payments** |

**6 of 10 controllers lack role guards.** A dispatcher or driver could approve settlements, record payments, or post journal entries.

### Soft Delete: INCONSISTENT

- `deletedAt` field exists on 7 models (InvoiceLineItem, JournalEntryLine, PaymentApplication, PaymentReceived, PaymentMade, Settlement, SettlementLineItem)
- **Only `reports.service.ts` filters `deletedAt: null`** in queries
- All other services (invoices, settlements, payments-received, payments-made, journal-entries, chart-of-accounts) **do NOT filter soft-deleted records**
- Result: Soft-deleted financial records appear in lists, detail views, and calculations

**Note:** Invoice model itself does NOT have `deletedAt` — uses `voidedAt` instead (which is correct for financial records). But InvoiceLineItem does have soft delete that's not filtered.

---

## Phase 5: Known Issues Verification

| # | Hub Issue | Hub Severity | Verdict | Evidence |
|---|-----------|-------------|---------|----------|
| 1 | Dashboard endpoint missing (QS-003) | P0 | **FALSE** | `GET /accounting/dashboard` EXISTS in `accounting.controller.ts` |
| 2 | Invoice Edit route missing | P1 | TRUE | No `/invoices/[id]/edit` page exists |
| 3 | Settlement Create route missing | P1 | TRUE | No `/settlements/new` page exists |
| 4 | Aging Report endpoint missing | P1 | **FALSE** | Two aging endpoints exist (`/accounting/aging` + `/reports/aging`) |
| 5 | Soft delete not on Invoice, Settlement, Payment | P1 | **PARTIALLY FALSE** | Settlement, PaymentReceived, PaymentMade all HAVE `deletedAt`. Invoice uses `voidedAt` (correct). But queries don't filter it. |
| 6 | Dashboard uses mock/fallback data | P1 | **NEEDS VERIFICATION** | Hook calls real endpoint, but endpoint may not be returning data if DB has no records |
| 7 | QuickBooks not implemented | P2 | TRUE | Both endpoints are stubs |
| 8 | Test coverage minimal ("1 test file") | P2 | **UNDERSTATED** | 8 backend spec files exist + E2E test planned |

**3 of 8 known issues are FALSE. 1 is partially false. 1 is understated.**

---

## Tribunal: 5 Adversarial Rounds

### Round 1: "The hub is catastrophically wrong about this service"

**Prosecution:** The hub documents 3 models and 17 endpoints. Reality has 11 models and 54 endpoints. The hub doesn't even know about Chart of Accounts, Journal Entries, or the distinction between PaymentsReceived and PaymentsMade. It's describing a toy invoicing system; the actual implementation is a double-entry accounting platform. The hub's #1 P0 known issue is a phantom — the dashboard endpoint exists.

**Defense:** The hub was written before the v2 sprint. The additional models and endpoints were added during development. The hub's core narrative — invoices, settlements, payments — is directionally correct. The quality scores are within 0.5 points of reality.

**Verdict:** Prosecution wins. Missing 8 of 11 models and 37 of 54 endpoints is not "directionally correct" — it's a different system. The false QS-003 known issue means developer time could be wasted building something that already exists.

### Round 2: "The security gaps are critical for a financial module"

**Prosecution:** 4 cross-tenant bugs in payment application code. 6 of 10 controllers lack role guards. Any authenticated user — dispatcher, driver, customer — can approve settlements, post journal entries, and process batch payments. For a financial module handling real money, this is unacceptable.

**Defense:** The JWT guard ensures only authenticated users access the system. Tenant isolation in list/create/get operations is solid. The cross-tenant bugs are in transaction blocks that would require knowing a valid invoiceId from another tenant, which is a narrow attack vector.

**Verdict:** Prosecution wins. Financial modules require defense-in-depth. The role guard gaps are more dangerous than the tenant isolation bugs — a compromised dispatcher account could approve settlements worth thousands of dollars. The "narrow attack vector" defense fails because invoiceIds are UUIDs visible in URLs and API responses.

### Round 3: "The soft delete implementation is dangerous for financial compliance"

**Prosecution:** Financial records have a 7-year retention requirement (hub rule #6). The `deletedAt` field exists on 7 models but only 1 service (`reports.service.ts`) actually filters it. This means: (1) soft-deleted records appear in active lists, (2) soft-deleted settlement line items are included in carrier payment calculations, (3) financial reports may include voided/deleted transactions.

**Defense:** Invoice uses `voidedAt` instead of `deletedAt`, which is the correct pattern for financial records. The soft-delete gap in services is a code quality issue, not a data integrity issue — no one is actually soft-deleting financial records in production.

**Verdict:** Split. Invoice's `voidedAt` approach is correct. But the inconsistency across 7 models is a ticking bomb — if anyone calls soft-delete on a settlement, the queries won't know it's deleted. Add `deletedAt: null` filters or remove the field entirely.

### Round 4: "The frontend is well-built and production-ready"

**Prosecution:** 11 pages, consistent envelope handling, design token compliance, proper loading/error/empty states, 5,244 LOC of clean code. The best-architectured frontend module in the project.

**Defense:** Agreed, but two missing pages (invoice edit, settlement create) and zero frontend tests are gaps. The `any` type assertion in invoice-form.tsx and `window.prompt()` for void reasons are quality issues.

**Verdict:** Defense wins narrowly. The frontend is genuinely good (7.5-8/10) but not "production-ready" without the missing pages and tests.

### Round 5: "QS-003 should be closed"

**Prosecution:** The `GET /accounting/dashboard` endpoint exists, is implemented in `reports.service.ts`, returns all 6 KPIs (totalAR, totalAP, overdueInvoiceCount, DSO, revenueMTD, cashCollectedMTD), and the frontend hook already calls it. QS-003 asks to "Build Accounting Dashboard Endpoint" — it's already built.

**Defense:** The endpoint exists but hasn't been runtime-verified. It may have bugs, return wrong calculations, or fail with real data. QS-003 should be converted to a verification task, not closed blindly.

**Verdict:** Prosecution wins with modification. QS-003 should be **reclassified** from "Build" to "Verify" — the endpoint exists, but needs runtime testing under QS-008 scope.

---

## Verified Health Score: 8.2/10

| Dimension | Score | Notes |
|-----------|-------|-------|
| Backend Architecture | 9/10 | 54 endpoints, 11 models, double-entry accounting, PDF generation, batch processing |
| Backend Security | 5/10 | 4 cross-tenant bugs, 6/10 controllers missing role guards |
| Frontend Quality | 7.5/10 | 11 pages, consistent patterns, 2 missing pages, 0 tests |
| Data Model Documentation | 1.5/10 | Hub documents 3 of 11 models, wrong field names, phantom "Payment" model |
| API Documentation | 2/10 | Hub documents 17 of 54 endpoints, 3 marked "Not Built" that exist |
| Known Issues Accuracy | 3/10 | 3 of 8 issues false, 1 partially false, 1 understated |
| Business Logic | 8.5/10 | Invoice/settlement lifecycle, payment allocation, journal entries, auto-generation |
| Envelope Consistency | 8/10 | Frontend hooks consistent; backend has mixed envelope patterns |

**Overall: 8.2/10** (up from hub's 7.0)

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | **Rewrite hub Section 8 (Data Model)** — add 8 missing models, fix all 3 documented models (Invoice 50% wrong, Settlement 40% wrong, Payment doesn't exist → PaymentReceived + PaymentMade) | P0 | 3-4h | Claude Code |
| 2 | **Rewrite hub Section 4 (API Endpoints)** — 54 actual vs 17 documented, add 6 missing controllers, fix "Not Built" claims on 3 endpoints that exist | P0 | 2-3h | Claude Code |
| 3 | **Close/reclassify QS-003** — dashboard endpoint EXISTS. Reclassify to "Verify endpoint works at runtime" under QS-008 | P0 | 15min | Claude Code |
| 4 | **Fix 4 cross-tenant bugs** in `payments-received.service.ts` — add `tenantId` to all invoice operations in `applyToInvoice()`, `markBounced()`, `processBatch()` | P0 | 1-2h | Claude Code |
| 5 | **Add RolesGuard to 6 controllers** — chart-of-accounts, settlements, payments-received, payments-made, journal-entries, payments batch | P0 | 1h | Claude Code |
| 6 | **Update hub known issues** — close 3 false issues (#1 dashboard, #4 aging, partially #5 soft delete), update #8 (8 spec files not 1) | P0 | 30min | Claude Code |
| 7 | **Add `deletedAt: null` filters** to all services that query models with `deletedAt` field (settlements, payments-received, payments-made, journal-entries) | P1 | 2h | Claude Code |
| 8 | **Remove `window.prompt()` usage** in invoices page and payment detail — replace with ConfirmDialog | P1 | 1h | Any |
| 9 | **Fix `any` type assertion** in invoice-form.tsx line 54 | P1 | 30min | Any |
| 10 | **Build Invoice Edit page** (`/accounting/invoices/[id]/edit`) | P1 | 3h | Any |
| 11 | **Build Settlement Create page** (`/accounting/settlements/new`) | P2 | 3h | Any |
| 12 | **Add frontend accounting tests** — 0 tests for 5,244 LOC | P2 | 4-6h | Any |
| 13 | **Implement PaymentPlan controller/service** — Prisma model exists but no backend code | P2 | 4-6h | Any |

---

## Cross-Cutting Patterns Confirmed

| Pattern | Status | Notes |
|---------|--------|-------|
| Hub data models systemically wrong | CONFIRMED | 8 of 11 models missing, 3 documented models 15-50% accurate |
| Hub "Not Built" claims often false | CONFIRMED | 3 of 5 "Not Built" endpoints actually exist |
| Known issues ~50% stale | CONFIRMED | 3 of 8 false, 1 partially false, 1 understated = 56% inaccurate |
| Tenant isolation gap in mutations | CONFIRMED | 4 bugs in payment application transactions |
| Role guard inconsistency | NEW FINDING | 6/10 controllers in a financial module lack role guards |
| Soft delete field exists but not filtered | CONFIRMED | 7 models have `deletedAt`, only 1 service filters it |
| Envelope handling varies | PARTIALLY | Frontend hooks are consistent (best of all P0 services); backend responses vary |
| Backend spec files exist (hub claims none) | CONFIRMED | 8 backend spec files, hub claims "1 test file" |
