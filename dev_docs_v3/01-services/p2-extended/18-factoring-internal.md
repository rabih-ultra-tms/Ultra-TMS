# Service Hub: Factoring Internal (18)

> **Priority:** P2 Extended | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 5 controllers in `apps/api/src/modules/factoring/` |
| **Frontend** | Not Built |
| **Tests** | None |
| **Scope** | Internal factoring program — broker advances carrier payments before customer pays |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Factoring service in dev_docs |
| Backend Controller | Partial | 5 controllers in factoring module |
| Backend Service | Partial | 5 services |
| Prisma Models | Partial | FactoringRequest, FactoringAdvance models |
| Frontend Pages | Not Built | |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Factoring Dashboard | `/factoring` | Not Built | Advances outstanding, fees earned |
| Factoring Requests | `/factoring/requests` | Not Built | Carrier requests for advance |
| Advance Detail | `/factoring/advances/[id]` | Not Built | Advance terms, repayment status |
| Factoring Reports | `/factoring/reports` | Not Built | Revenue from factoring fees |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/factoring/requests` | Partial | List requests |
| POST | `/api/v1/factoring/requests` | Partial | Carrier submits request |
| GET | `/api/v1/factoring/requests/:id` | Partial | Detail |
| PATCH | `/api/v1/factoring/requests/:id/approve` | Partial | Approve advance |
| GET | `/api/v1/factoring/dashboard` | Partial | KPI data |

---

## 5. Business Rules

1. **Who Can Request:** Only carriers with ACTIVE status and positive payment history (no NSF in 6 months) can request factoring advances.
2. **Advance Amount:** Carrier can receive up to 95% of the invoice amount immediately after POD upload. The remaining 5% is held as a reserve until customer pays.
3. **Factoring Fee:** 2-4% of invoice face value (configurable per carrier tier). Fee is deducted from the advance. Brokerage retains the fee as revenue.
4. **Recourse vs Non-Recourse:** Current implementation: recourse factoring only (if customer doesn't pay, carrier is responsible for repayment). Non-recourse is P3.
5. **Settlement Integration:** When a factoring advance is approved, it creates a modified Settlement record (carrier receives reduced amount minus factoring fee). The normal settlement is marked as FACTORED.

---

## 6. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| FACT-101 | Build Factoring Dashboard | M (4h) | P2 |
| FACT-102 | Build Factoring Requests queue | M (4h) | P2 |
| FACT-103 | Integrate with Settlement workflow | M (4h) | P2 |
| FACT-104 | Write factoring tests | M (3h) | P2 |

---

## 7. Dependencies

**Depends on:** Auth, Accounting (settlement integration, invoice data), Carrier Management (carrier eligibility)
**Depended on by:** Accounting (factoring revenue recognition), Analytics (factoring revenue reports)
