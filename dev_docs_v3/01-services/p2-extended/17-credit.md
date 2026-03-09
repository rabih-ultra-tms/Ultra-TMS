# Service Hub: Credit Management (17)

> **Priority:** P2 Extended | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-17 tribunal)
> **Original definition:** `dev_docs/02-services/` (Credit service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/16-credit/` (11 files)
> **v2 hub (historical):** N/A
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-17-credit.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.0/10) |
| **Confidence** | High — code-verified via PST-17 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Partial — 5 controllers, 31 endpoints, 1,719 LOC service code (2,487 with tests) in `apps/api/src/modules/credit/` |
| **Frontend** | Not Built — 0 pages, 0 components, 0 hooks |
| **Tests** | Partial — 58 tests across 5 spec files (768 LOC), not verified green |
| **Priority** | P0: Verify RolesGuard global registration. P1: Fix collections soft-delete gap, implement hold→limit auto-suspend |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Credit service definition in dev_docs |
| Design Specs | Done | 11 files in `dev_docs/12-Rabih-design-Process/16-credit/` |
| Backend — Applications | Partial | 8 endpoints: CRUD + submit/approve/reject |
| Backend — Collections | Partial | 6 endpoints: queue, customer history, CRUD, aging, follow-ups |
| Backend — Holds | Partial | 5 endpoints: CRUD + customer lookup + release |
| Backend — Limits | Partial | 6 endpoints: CRUD + increase + utilization |
| Backend — Payment Plans | Partial | 6 endpoints: CRUD + record-payment + cancel |
| Prisma Models | Done | CreditApplication, CreditHold, CreditLimit, CollectionActivity, PaymentPlan |
| Frontend Pages | Not Built | 0 pages exist |
| React Hooks | Not Built | 0 hooks exist |
| Components | Not Built | 0 components exist |
| Tests | Partial | 58 tests (768 LOC) across 5 spec files, 0 frontend tests |
| Security | **Degraded** | All controllers: JwtAuthGuard + tenantId + @Roles — but 0/5 controllers include RolesGuard in @UseGuards(). If not globally registered, @Roles is decorative |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Credit Dashboard | `/credit` | Not Built | -- | KPI cards, exposure summary, holds overview |
| Credit Applications List | `/credit/applications` | Not Built | -- | Queue with status filters |
| Credit Application Detail | `/credit/applications/[id]` | Not Built | -- | Full application with business info, trade refs, credit check |
| Credit Review | `/credit/review` | Not Built | -- | Pending review queue for approvals |
| Credit Limits | `/credit/limits` | Not Built | -- | All customer credit limits with utilization |
| Credit Monitoring | `/credit/monitoring` | Not Built | -- | Real-time credit exposure and alerts |
| Collection Queue | `/credit/collections` | Not Built | -- | Aging buckets, follow-up due dates |
| Collection Detail | `/credit/collections/[id]` | Not Built | -- | Activity log per customer |
| Credit Reports | `/credit/reports` | Not Built | -- | Aging, exposure, risk analysis |
| D&B Integration | `/credit/dnb` | Not Built | -- | Dun & Bradstreet credit report lookup |

---

## 4. API Endpoints

### CreditApplicationsController — `@Controller('credit/applications')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/credit/applications` | Partial | Create credit application |
| GET | `/api/v1/credit/applications` | Partial | List (paginated, filterable by status) |
| GET | `/api/v1/credit/applications/:id` | Partial | Application detail |
| PUT | `/api/v1/credit/applications/:id` | Partial | Update application |
| DELETE | `/api/v1/credit/applications/:id` | Partial | Delete application |
| POST | `/api/v1/credit/applications/:id/submit` | Partial | Submit for review |
| POST | `/api/v1/credit/applications/:id/approve` | Partial | Approve with limit (ADMIN only) |
| POST | `/api/v1/credit/applications/:id/reject` | Partial | Reject with reason (ADMIN only) |

### CollectionsController — `@Controller('credit/collections')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/credit/collections` | Partial | Collections queue (paginated) |
| GET | `/api/v1/credit/collections/customer/:companyId` | Partial | History by customer |
| POST | `/api/v1/credit/collections` | Partial | Create collection activity |
| PUT | `/api/v1/credit/collections/:id` | Partial | Update collection activity |
| GET | `/api/v1/credit/collections/aging` | Partial | Aging report |
| GET | `/api/v1/credit/collections/follow-ups` | Partial | Follow-ups due |

### CreditHoldsController — `@Controller('credit/holds')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/credit/holds` | Partial | List holds (filter by reason, isActive) |
| GET | `/api/v1/credit/holds/customer/:companyId` | Partial | Holds by customer |
| GET | `/api/v1/credit/holds/:id` | Partial | Hold detail |
| POST | `/api/v1/credit/holds` | Partial | Create hold (ADMIN only) |
| PATCH | `/api/v1/credit/holds/:id/release` | Partial | Release hold (ADMIN only) |

### CreditLimitsController — `@Controller('credit/limits')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/credit/limits` | Partial | List all limits (filterable by status) |
| POST | `/api/v1/credit/limits` | Partial | Create credit limit (ADMIN only) |
| PUT | `/api/v1/credit/limits/:companyId` | Partial | Update credit limit (ADMIN only) |
| PATCH | `/api/v1/credit/limits/:companyId/increase` | Partial | Increase limit (ADMIN only) |
| GET | `/api/v1/credit/limits/:companyId/utilization` | Partial | Credit utilization |
| GET | `/api/v1/credit/limits/:companyId` | Partial | Limit detail by company |

### PaymentPlansController — `@Controller('credit/payment-plans')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/credit/payment-plans` | Partial | List plans (filter by status) |
| GET | `/api/v1/credit/payment-plans/:id` | Partial | Plan detail |
| POST | `/api/v1/credit/payment-plans` | Partial | Create payment plan |
| PUT | `/api/v1/credit/payment-plans/:id` | Partial | Update payment plan |
| POST | `/api/v1/credit/payment-plans/:id/record-payment` | Partial | Record payment on plan |
| PATCH | `/api/v1/credit/payment-plans/:id/cancel` | Partial | Cancel plan |

**Total: 31 endpoints across 5 controllers.**

---

## 5. Components

No components exist. The following will need to be built:

| Component | Proposed Path | Priority |
|-----------|--------------|----------|
| CreditDashboardCards | `components/credit/credit-dashboard-cards.tsx` | P2 |
| CreditApplicationForm | `components/credit/credit-application-form.tsx` | P2 |
| CreditApplicationDetail | `components/credit/credit-application-detail.tsx` | P2 |
| CreditLimitCard | `components/credit/credit-limit-card.tsx` | P2 |
| CreditUtilizationBar | `components/credit/credit-utilization-bar.tsx` | P2 |
| CreditHoldBanner | `components/credit/credit-hold-banner.tsx` | P2 |
| CollectionActivityLog | `components/credit/collection-activity-log.tsx` | P2 |
| AgingBucketChart | `components/credit/aging-bucket-chart.tsx` | P2 |
| PaymentPlanTimeline | `components/credit/payment-plan-timeline.tsx` | P2 |
| CreditStatusBadge | `components/credit/credit-status-badge.tsx` | P2 |

---

## 6. Hooks

No hooks exist. The following will need to be built:

| Hook | Endpoints Used | Notes |
|------|---------------|-------|
| `useCreditApplications` | GET `/credit/applications` | Paginated list |
| `useCreditApplication` | GET `/credit/applications/:id` | Single detail |
| `useCreateCreditApplication` | POST `/credit/applications` | Mutation |
| `useApproveCreditApplication` | POST `/credit/applications/:id/approve` | Mutation |
| `useRejectCreditApplication` | POST `/credit/applications/:id/reject` | Mutation |
| `useCreditLimits` | GET `/credit/limits` | Paginated list |
| `useCreditLimit` | GET `/credit/limits/:companyId` | Single detail |
| `useCreditUtilization` | GET `/credit/limits/:companyId/utilization` | Read |
| `useCreditHolds` | GET `/credit/holds` | Paginated list |
| `useCollectionsQueue` | GET `/credit/collections` | Paginated list |
| `useAgingReport` | GET `/credit/collections/aging` | Read |
| `usePaymentPlans` | GET `/credit/payment-plans` | Paginated list |
| `useRecordPayment` | POST `/credit/payment-plans/:id/record-payment` | Mutation |

**IMPORTANT:** All hooks must unwrap the API envelope: `response.data.data` (not `response.data`). See `dev_docs_v3/05-audit/recurring-patterns.md`.

---

## 7. Business Rules

1. **Credit Application Workflow:** Customer applies for credit -> application starts in PENDING -> analyst submits for review (UNDER_REVIEW) -> ADMIN approves with limit (sets approvedLimit, creates CreditLimit record via `upsertCreditLimit()`) or denies with reason. Conditional approval possible (CONDITIONAL_APPROVAL). Applications expire if not acted on.
2. **Credit Holds:** Automatic when customer exceeds limit (CREDIT_LIMIT_EXCEEDED) or has overdue invoices (PAYMENT_OVERDUE). Manual holds for fraud suspicion (FRAUD_SUSPECTED), insufficient insurance (INSUFFICIENT_INSURANCE), carrier out-of-service (CARRIER_OOS), or any manual reason (MANUAL_HOLD). Only ADMIN can create or release holds. **NOTE:** Hold→Limit auto-suspend is NOT implemented — events are emitted but no listener connects them.
3. **Credit Limits:** Available credit = creditLimit - usedCredit. Sub-limits enforced: singleLoadLimit (max per load) and monthlyLimit (max per month). Status cycles: ACTIVE -> SUSPENDED (on hold) -> EXCEEDED (over limit) -> EXPIRED (past expiresAt).
4. **Payment Plans:** Structured repayment for overdue customers. Supports WEEKLY, BI_WEEKLY, MONTHLY, QUARTERLY frequencies. Plans track total owed, amount paid, and remaining balance. 20% minimum down payment required. Maximum 12 installments. Status: ACTIVE -> COMPLETED (fully paid) or DEFAULTED (missed payments) or CANCELLED (manual). **NOTE:** Auto-default detection is NOT implemented.
5. **Collections Escalation:** Progressive workflow: CALL -> EMAIL -> LETTER -> LEGAL_NOTICE -> COLLECTIONS_AGENCY. Each activity is logged with notes, assigned user, and follow-up date. Aging report groups by 5 buckets: CURRENT, 1-30, 31-60, 61-90, 90+ days.
6. **Review Cycle:** Credit limits reviewed every 90 days by default (reviewFrequencyDays field). System tracks lastReviewDate and nextReviewDate. Review frequency is configurable per customer. Grace period (gracePeriodDays, default 0) allows brief overages before hold is applied.
7. **D&B Integration (Future):** Credit applications support optional dunsNumber field. creditScore and creditCheckDate fields exist for storing external credit check results. Full D&B API integration is P3.
8. **Payment Terms:** Supported terms: NET_15, NET_21, NET_30, NET_45, COD. Stored on CreditLimit and used by Accounting for invoice due date calculation.
9. **Credit Utilization Events:** EventEmitter fires threshold events at 80% and 100% utilization. 11 total EventEmitter events across all state transitions.
10. **Number Generation:** Application and plan numbers auto-generated with collision retry (max 4 attempts).

---

## 8. Data Model

### CreditApplication (hub: 22 fields, actual: 34 — ~75% accuracy)

```
CreditApplication {
  id                  String (UUID, PK)
  tenantId            String (FK -> Tenant)
  companyId           String (FK -> Company)
  customerId          String? (FK -> Customer)
  applicationNumber   String (unique)
  status              CreditApplicationStatus (default PENDING)
  requestedLimit      Decimal(12,2)
  approvedLimit       Decimal(12,2)?
  businessName        String
  dbaName             String?
  federalTaxId        String?
  dunsNumber          String?
  yearsInBusiness     Int?
  businessType        String?
  annualRevenue       Decimal?
  bankName            String?
  bankAccountNumber   String?
  bankContactName     String?
  bankContactPhone    String?
  tradeReferences     Json?
  ownerName           String?
  ownerSSN            String?
  ownerAddress        String?
  creditScore         Int?
  creditCheckDate     DateTime?
  creditReportUrl     String?
  reviewedById        String?
  reviewedAt          DateTime?
  denialReason        String?
  conditions          String?
  approvedAt          DateTime?
  expiresAt           DateTime?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  createdById         String?
  updatedById         String?
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
}
```

### CreditLimit (hub: 18 fields, actual: 23 — ~85% accuracy)

```
CreditLimit {
  id                  String (UUID, PK)
  tenantId            String (FK -> Tenant)
  companyId           String (FK -> Company)
  customerId          String? (FK -> Customer)
  creditLimit         Decimal(12,2)
  availableCredit     Decimal(12,2)
  usedCredit          Decimal(12,2) (default 0)
  status              CreditLimitStatus (default ACTIVE)
  paymentTerms        String?
  gracePeriodDays     Int (default 0)
  singleLoadLimit     Decimal?
  monthlyLimit        Decimal?
  lastReviewDate      DateTime?
  nextReviewDate      DateTime?
  reviewFrequencyDays Int (default 90)
  approvedById        String?
  approvedAt          DateTime?
  expiresAt           DateTime?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  createdById         String?
  updatedById         String?
  createdAt           DateTime
  updatedAt           DateTime
}
```

### CreditHold (hub: 12 fields, actual: 18 — ~80% accuracy)

```
CreditHold {
  id                  String (UUID, PK)
  tenantId            String (FK -> Tenant)
  companyId           String (FK -> Company)
  customerId          String? (FK -> Customer)
  reason              CreditHoldReason
  description         String?
  amountHeld          Decimal?
  isActive            Boolean (default true)
  resolvedById        String?
  resolvedAt          DateTime?
  resolutionNotes     String?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  createdById         String?
  updatedById         String?
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
}
```

### CollectionActivity (hub: 8 fields, actual: 23 — ~40% accuracy)

```
CollectionActivity {
  id                  String (UUID, PK)
  tenantId            String (FK -> Tenant)
  companyId           String (FK -> Company)
  invoiceId           String? (FK -> Invoice)
  activityType        CollectionActivityType    # hub had "type"
  subject             String?
  description         String?                   # hub had "notes"
  outcome             String?
  contactName         String?
  contactPhone        String?
  contactEmail        String?
  promisedAmount      Decimal?
  promisedDate        DateTime?
  followUpDate        DateTime?
  assignedToId        String?                   # hub claimed doesn't exist — verify
  escalationLevel     String?
  externalId          String?
  sourceSystem        String?
  customFields        Json?
  createdById         String
  updatedById         String?
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
}
```

**PST-17 note:** Hub originally listed 8 fields. Actual Prisma model has ~23 fields. Field name mismatches: `type`→`activityType`, `notes`→`description`. 15 fields were missing from original hub.

### PaymentPlan (hub: 13 fields, actual: 26 — ~45% accuracy)

```
PaymentPlan {
  id                  String (UUID, PK)
  tenantId            String (FK -> Tenant)
  companyId           String (FK -> Company)
  planNumber          String (unique)
  status              PaymentPlanStatus (default ACTIVE)
  totalAmount         Decimal(12,2)             # hub had "totalOwed"
  amountPaid          Decimal(12,2) (default 0)
  remainingBalance    Decimal(12,2)
  frequency           PaymentFrequency
  installmentAmount   Decimal(12,2)
  installmentCount    Int
  installmentsPaid    Int (default 0)
  firstPaymentDate    DateTime                  # hub had "startDate"
  nextPaymentDate     DateTime?
  endDate             DateTime?
  interestRate        Decimal?
  lateFees            Decimal?
  invoiceIds          String[]
  approvedBy          String?
  approvedAt          DateTime?
  completedAt         DateTime?
  defaultedAt         DateTime?
  cancelledAt         DateTime?
  cancellationReason  String?
  createdById         String
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
}
```

**PST-17 note:** Hub originally listed 13 fields. Actual Prisma model has ~26 fields. Field name mismatches: `totalOwed`→`totalAmount`, `startDate`→`firstPaymentDate`. `cancelledById` does not exist. 15+ fields were missing from original hub.

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `applicationNumber` | Unique per tenant, auto-generated (collision retry, max 4 attempts) | "Application number already exists" |
| `requestedLimit` | Decimal(12,2), must be > 0 | "Requested limit must be positive" |
| `approvedLimit` | Decimal(12,2), must be > 0 when set | "Approved limit must be positive" |
| `creditLimit` | Decimal(12,2), must be > 0 | "Credit limit must be positive" |
| `singleLoadLimit` | Must be <= creditLimit | "Single load limit cannot exceed credit limit" |
| `monthlyLimit` | Must be <= creditLimit | "Monthly limit cannot exceed credit limit" |
| `availableCredit` | Computed: creditLimit - usedCredit | N/A (computed) |
| `reviewFrequencyDays` | Integer >= 1, default 90 | "Review frequency must be at least 1 day" |
| `gracePeriodDays` | Integer >= 0, default 0 | "Grace period cannot be negative" |
| `installmentAmount` | Decimal(12,2), must be > 0 | "Installment amount must be positive" |
| `totalAmount` | Must be > 0 | "Total amount must be positive" |
| `installmentCount` | Max 12 | "Maximum 12 installments" |
| Down payment | Minimum 20% of total | "Minimum 20% down payment required" |
| Hold creation | companyId must exist in tenant | "Company not found" |
| Hold release | Hold must be active (isActive = true) | "Hold is already released" |
| Application approve | Status must be UNDER_REVIEW | "Application must be under review to approve" |
| Application reject | Status must be UNDER_REVIEW | "Application must be under review to reject" |
| Limit increase | Amount must be positive | "Increase amount must be positive" |

---

## 10. Status States

### CreditApplicationStatus

```
PENDING -> UNDER_REVIEW (submit)
UNDER_REVIEW -> APPROVED (approve with limit)
UNDER_REVIEW -> CONDITIONAL_APPROVAL (approve with conditions)
UNDER_REVIEW -> DENIED (reject with reason)
PENDING -> EXPIRED (timeout, no action taken)
UNDER_REVIEW -> EXPIRED (timeout, no decision)
```

### CreditLimitStatus

```
ACTIVE -> SUSPENDED (credit hold placed)
ACTIVE -> EXCEEDED (usedCredit > creditLimit)
ACTIVE -> EXPIRED (past expiresAt date)
SUSPENDED -> ACTIVE (hold released)
EXCEEDED -> ACTIVE (payment received, usedCredit drops below limit)
```

### CreditHoldReason (enum, not a state machine)

```
PAYMENT_OVERDUE        -- invoices past due
CREDIT_LIMIT_EXCEEDED  -- over credit limit
FRAUD_SUSPECTED        -- manual flag for suspected fraud
INSUFFICIENT_INSURANCE -- insurance lapsed or inadequate
CARRIER_OOS            -- carrier out of service
MANUAL_HOLD            -- any other manual reason
```

### PaymentPlanStatus

```
ACTIVE -> COMPLETED (fully paid, remainingBalance = 0)
ACTIVE -> DEFAULTED (missed payments beyond threshold)
ACTIVE -> CANCELLED (manual cancel by ADMIN)
```

### CollectionActivityType (escalation order)

```
CALL -> EMAIL -> LETTER -> LEGAL_NOTICE -> COLLECTIONS_AGENCY
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| 0/5 controllers include RolesGuard in @UseGuards() — @Roles is decorative if not globally registered | **P0** | All 5 controllers | **Open** — verify global registration in main.ts |
| Collections soft-delete gap: `queue()` and `historyByCustomer()` query WITHOUT `deletedAt: null` | **P1 BUG** | `collections.service.ts:21-26,39-42` | **Open** |
| CreditHold → CreditLimit auto-suspend NOT implemented — events emitted but no listener | **P1** | `credit-holds.service.ts` | **Open** |
| Hold release silently succeeds on already-released holds (returns hold instead of throwing) | P2 | `credit-holds.service.ts:93` | Open |
| Payment plan auto-default detection NOT implemented (no cron for missed payments) | P2 | `payment-plans.service.ts` | Open |
| No expiration cron for CreditApplication/CreditLimit expiresAt | P2 | -- | Open |
| credit-holds.service.spec.ts has only 4 tests (55 LOC) — dangerously thin | P2 | `credit-holds.service.spec.ts` | Open |
| No @Audit decorators on financial operations (approve, reject, record-payment, cancel) | P2 | All controllers | Open |
| No @Throttle rate limiting on any endpoint | P2 | All controllers | Open |
| Entire frontend not built | P1 | -- | Open |
| No frontend hooks — all 31 endpoints lack consumers | P1 | -- | Open |
| No WebSocket events for credit hold notifications | P2 | -- | Deferred |
| D&B integration not connected (fields exist, no API call) | P3 | -- | Deferred |

**Resolved Issues (closed during PST-17 tribunal):**

- ~~"CreditHold -> CreditLimit auto-suspend logic unverified"~~ — Verified: NOT implemented. Reclassified from "unverified" to "not implemented" (P1 action item)
- ~~"Payment plan defaulting logic unverified"~~ — Verified: NOT implemented. Reclassified from "unverified" to "not implemented" (P2 action item)
- ~~LOC claim "~2,337"~~ — Corrected: 1,719 service code + 768 tests = 2,487 total
- ~~"5 spec files exist but not confirmed green"~~ — Updated: 58 tests across 5 spec files (768 LOC)
- ~~Security listed as "Good"~~ — Downgraded to "Degraded" pending RolesGuard verification

---

## 12. Tasks

### Phase 0 — Security Verification (from PST-17 tribunal)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRED-000 | Verify RolesGuard global registration in main.ts. If NOT global, add to all 5 controllers | XS (30min) | **P0** |

### Phase 1 — Backend Fixes (from PST-17 tribunal)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRED-001 | Runtime-verify all 31 credit endpoints (Postman/curl) | M (3h) | P1 |
| CRED-002 | Verify 5 spec files pass in CI (58 tests) | S (1h) | P1 |
| CRED-003 | Add `deletedAt: null` to `CollectionsService.queue()` and `historyByCustomer()` | XS (15min) | P1 |
| CRED-004 | Implement CreditHold → CreditLimit auto-suspend (on hold.placed event) | M (2h) | P1 |

### Phase 2 — Frontend Build

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRED-101 | Build Credit Dashboard page (KPI cards, exposure summary) | L (6h) | P2 |
| CRED-102 | Build Credit Applications queue (list + filters) | L (6h) | P2 |
| CRED-103 | Build Credit Application Detail (form, review, approve/reject) | L (8h) | P2 |
| CRED-104 | Build Credit Limits overview (list + utilization bars) | M (4h) | P2 |
| CRED-105 | Build Credit Holds management (list, create, release) | M (4h) | P2 |
| CRED-106 | Build Collections Queue (aging buckets, activity log) | L (6h) | P2 |
| CRED-107 | Build Payment Plans management (create, record payments) | M (4h) | P2 |
| CRED-108 | Build Credit Reports page (aging, exposure, risk) | L (6h) | P2 |
| CRED-109 | Write all credit hooks (13 hooks for 31 endpoints) | M (4h) | P2 |
| CRED-110 | Write frontend tests for credit pages | M (4h) | P2 |

### Phase 3 — Backend Hardening (from PST-17 tribunal)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRED-201 | Add expiration cron for CreditApplication + CreditLimit expiresAt | M (2h) | P2 |
| CRED-202 | Add auto-default detection for PaymentPlan missed payments | M (2h) | P2 |
| CRED-203 | Expand credit-holds.service.spec.ts from 4 → 12+ tests | S (1h) | P2 |
| CRED-204 | Add @Audit decorators on approve, reject, record-payment, cancel | S (1h) | P2 |
| CRED-205 | Fix hold release to throw on already-released holds | XS (15min) | P2 |

### Phase 4 — Integrations

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRED-301 | D&B API integration for credit checks | XL (12h) | P3 |
| CRED-302 | WebSocket notifications for credit hold events | M (4h) | P3 |
| CRED-303 | Auto-hold on overdue invoice (integration with Accounting) | L (6h) | P3 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Overview | `dev_docs/12-Rabih-design-Process/16-credit/00-service-overview.md` |
| Credit Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/01-credit-dashboard.md` |
| Credit Applications List | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/02-credit-applications.md` |
| Credit Application Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/03-credit-application.md` |
| Credit Review | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/04-credit-review.md` |
| Credit Limits | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/05-credit-limits.md` |
| Credit Monitoring | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/06-credit-monitoring.md` |
| Collection Queue | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/07-collection-queue.md` |
| Collection Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/08-collection-detail.md` |
| Credit Reports | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/09-credit-reports.md` |
| D&B Integration | Full 15-section | `dev_docs/12-Rabih-design-Process/16-credit/10-dnb-integration.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| 5 controllers planned | 5 controllers built (applications, collections, holds, limits, payment-plans) | On track |
| ~30 endpoints planned | 31 endpoints implemented (100% match) | On track |
| Full CRUD + workflows | CRUD + submit/approve/reject + hold/release + record-payment + aging | On track |
| RolesGuard enforcement | @Roles decorator used but RolesGuard NOT in @UseGuards() on any controller | **Gap** |
| Hold → Limit auto-suspend | Events emitted but no listener — NOT implemented | **Gap** |
| Auto-default detection | NOT implemented — no cron for missed payments | **Gap** |
| Frontend pages planned | 0 pages built | Significantly behind |
| Frontend components planned | 0 components built | Significantly behind |
| Frontend hooks planned | 0 hooks built | Significantly behind |
| D&B integration | Schema fields exist, no API connection | Expected (P3) |
| Tests planned | 58 tests across 5 spec files (768 LOC), not verified green | Partial |
| 11 design specs | 11 specs complete | On track |
| ~2,337 LOC claimed | 1,719 LOC service code + 768 LOC tests = 2,487 total | Corrected |
| Data model 5 models | Names 100% match, field accuracy ~65% (CollectionActivity ~40%, PaymentPlan ~45%) | Partial |
| Module exports | All 5 services exported (clean architecture) | On track |

**Summary:** Backend has excellent surface accuracy (endpoint count 100%, paths ~100%, model names 100%) — the best of all 17 services audited at surface level. However, depth accuracy is only ~65% (data model fields), RolesGuard enforcement is uncertain, and collections has a soft-delete gap. Module exports all 5 services and uses 11 EventEmitter events for state transitions. Entire frontend is missing.

---

## 15. Dependencies

**Depends on:**

- Auth & Admin (JWT authentication, role-based access: ADMIN, CREDIT_ANALYST, CREDIT_VIEWER — **pending RolesGuard verification**)
- CRM / Company (companyId, customerId — credit is always tied to a customer/company)
- Accounting (invoice data for aging reports, payment history for collections, overdue detection)
- D&B / SAFER Web API (external credit check — P3, schema ready)

**Depended on by:**

- TMS Core (credit check before order creation — is customer on hold? is limit exceeded?)
- CRM (credit status display on customer detail, credit hold banner)
- Accounting (payment terms from CreditLimit, collection activity for AR management)
- Sales & Quotes (credit limit check before quoting large shipments)
- Notifications (credit hold placed/released events, collection follow-up reminders)
