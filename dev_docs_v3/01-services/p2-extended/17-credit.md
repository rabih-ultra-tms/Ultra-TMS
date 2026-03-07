# Service Hub: Credit Management (17)

> **Priority:** P2 Extended | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 5 controllers in `apps/api/src/modules/credit/` |
| **Frontend** | Not Built |
| **Tests** | None |
| **Note** | Basic credit status is in CRM; this service handles detailed credit analysis |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Credit service in dev_docs |
| Backend Controller | Partial | 5 controllers in credit module |
| Backend Service | Partial | 5 services |
| Prisma Models | Partial | CreditApplication, CreditLine, CreditReview models |
| Frontend Pages | Not Built | |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Credit Applications | `/credit/applications` | Not Built | New customer credit requests |
| Credit Lines | `/credit/lines` | Not Built | All customer credit limits |
| Credit Review | `/credit/review` | Not Built | Pending review queue |
| Credit Reports | `/credit/reports` | Not Built | Aging, exposure, risk |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/credit/applications` | Partial | List credit applications |
| POST | `/api/v1/credit/applications` | Partial | Submit credit application |
| GET | `/api/v1/credit/applications/:id` | Partial | Detail |
| PATCH | `/api/v1/credit/applications/:id/approve` | Partial | Approve with limit |
| PATCH | `/api/v1/credit/applications/:id/deny` | Partial | Deny with reason |

---

## 5. Business Rules

1. **Credit Application Workflow:** New customers submit credit applications. ACCOUNTING reviews and approves/denies with a credit limit amount. Approved applications auto-update the customer's `creditLimit` in CRM.
2. **Credit Exposure Monitoring:** Total credit exposure = sum of all customers' current balances. Dashboard shows exposure by industry, by region, and concentration risk (single customer > 10% of exposure).
3. **Credit Review Triggers:** Periodic review required: ENTERPRISE tier = annual, PROFESSIONAL = annual, STARTER = no automatic review. Also triggered by: 2 NSF checks, 1 payment > 90 days late, balance increase > 50%.
4. **D&B Integration:** Credit decisions can be informed by Dun & Bradstreet credit reports (P3 — requires D&B API credentials). Current process: manual review.
5. **Risk Tiers:** Based on payment history and D&B score: LOW (< 1% default risk), MEDIUM (1-5%), HIGH (5-15%), CRITICAL (> 15% or active collections).

---

## 6. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CRED-101 | Build Credit Applications queue | L (6h) | P2 |
| CRED-102 | Build Credit Lines overview | M (4h) | P2 |
| CRED-103 | Write credit tests | M (3h) | P2 |

---

## 7. Dependencies

**Depends on:** Auth, CRM (customer credit status integration), Accounting (invoice/payment history)
**Depended on by:** CRM (credit status from credit decisions), TMS Core (credit check on order creation)
