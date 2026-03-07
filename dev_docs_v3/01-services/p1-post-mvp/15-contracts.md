# Service Hub: Contracts (15)

> **Priority:** P1 Post-MVP | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 8 controllers, 8 services in `apps/api/src/modules/contracts/` |
| **Frontend** | Not Built |
| **Tests** | None |
| **Scope** | Customer rate contracts, carrier contracts, lane agreements |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Contracts definition in dev_docs |
| Backend Controller | Partial | 8 controllers in contracts module |
| Backend Service | Partial | 8 services in contracts module |
| Prisma Models | Partial | Contract, ContractRate, ContractLane models |
| Frontend Pages | Not Built | |
| Hooks | Not Built | |
| Components | Not Built | |
| Tests | None | |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Contracts List | `/contracts` | Not Built | Customer + carrier contracts |
| Contract Detail | `/contracts/[id]` | Not Built | Rates, lanes, terms |
| Contract Create | `/contracts/new` | Not Built | Multi-step wizard |
| Contract Edit | `/contracts/[id]/edit` | Not Built | |
| Lane Rates | `/contracts/[id]/lanes` | Not Built | Lane-by-lane rate breakdown |
| Contract Renewal | `/contracts/[id]/renew` | Not Built | Renewal workflow |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/contracts` | Partial | List contracts |
| POST | `/api/v1/contracts` | Partial | Create contract |
| GET | `/api/v1/contracts/:id` | Partial | Detail with rates and lanes |
| PUT | `/api/v1/contracts/:id` | Partial | Update |
| DELETE | `/api/v1/contracts/:id` | Partial | Soft delete |
| GET | `/api/v1/contracts/:id/rates` | Partial | Lane rates |
| POST | `/api/v1/contracts/:id/rates` | Partial | Add rate |
| PUT | `/api/v1/contracts/:id/rates/:rateId` | Partial | Update rate |

---

## 5. Business Rules

1. **Contract Types:** CUSTOMER (outbound rate agreements), CARRIER (inbound capacity agreements), LANE (specific lane pricing). Each type has different fields and validation.
2. **Rate Resolution:** Contract rates override default rate tables. Resolution order: (1) Customer contract lane rate, (2) Customer contract base rate, (3) General rate table. Load Planner uses this resolution order.
3. **Expiry Management:** Contracts have start and end dates. 30-day expiry warning. Expired contracts cannot generate new loads — the system warns but doesn't hard-block (legacy loads).
4. **Rate Change Protocol:** Rates cannot be changed on active contracts without creating a rate amendment (tracked as a ContractAmendment record). Amendments require customer/carrier acknowledgment.
5. **Multi-Lane Contracts:** Customer contracts can cover multiple origin-destination pairs with different rates per lane. Lane rates take priority over contract-level rates.

---

## 6. Data Model

```
Contract {
  id           String (UUID)
  contractNumber String (auto)
  type         ContractType (CUSTOMER, CARRIER, LANE)
  status       ContractStatus (DRAFT, ACTIVE, EXPIRING, EXPIRED, CANCELLED)
  customerId   String? (FK → Customer)
  carrierId    String? (FK → Carrier)
  startDate    DateTime
  endDate      DateTime
  terms        String?
  rates        ContractRate[]
  tenantId     String
  createdAt    DateTime
  updatedAt    DateTime
  deletedAt    DateTime?
}

ContractRate {
  id            String (UUID)
  contractId    String (FK → Contract)
  originState   String?
  destState     String?
  equipmentType String?
  baseRate      Decimal
  fuelSurcharge Decimal? (% or flat)
  effectiveDate DateTime
}
```

---

## 7. Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| No frontend screens | P0 | Not Built |
| Rate resolution integration with Load Planner | P1 | Needs verification |
| No tests | P0 | Open |

---

## 8. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CONT-101 | Build Contracts List + Detail | L (8h) | P1 |
| CONT-102 | Build Contract Create wizard | L (8h) | P1 |
| CONT-103 | Integrate contract rates with Load Planner | M (4h) | P1 |
| CONT-104 | Write contracts tests | M (4h) | P1 |

---

## 9. Dependencies

**Depends on:** Auth, CRM (customer contracts), Carrier Management (carrier contracts)
**Depended on by:** Sales & Quotes (rate resolution), TMS Core (rate verification on load creation), Accounting (billing per contracted rates)
