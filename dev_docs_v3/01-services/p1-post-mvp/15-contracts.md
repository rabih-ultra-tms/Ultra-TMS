# Service Hub: Contracts (15)

> **Priority:** P1 Post-MVP | **Status:** Backend Rich, Frontend Not Built
> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Contracts service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/14-contracts/` (8 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/` (if applicable)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D+ (3.5/10) -- richest P1 backend (58 endpoints!), but zero frontend |
| **Confidence** | High -- backend controllers verified 2026-03-07 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Substantial -- 8 controllers, 9 services, 58 endpoints, 11 Prisma models, 6 enums, DocuSign integration (stubbed), 11 event types |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | Minimal -- 2 spec files (contracts.service.spec.ts, amendments.service.spec.ts), mostly boilerplate |
| **Revenue Impact** | HIGH -- contract rates drive pricing for all loads; rate resolution affects every quote and invoice |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Contracts definition in dev_docs |
| Design Specs | Done | 8 files in `dev_docs/12-Rabih-design-Process/14-contracts/` |
| Backend -- Contracts | Built | `ContractsController` -- 13 endpoints (CRUD, status, renewals) |
| Backend -- Rate Tables | Built | `RateTablesController` -- 7 endpoints (rate table CRUD) |
| Backend -- Rate Lanes | Built | `RateLanesController` -- 5 endpoints (lane-level rates) |
| Backend -- Templates | Built | `ContractTemplatesController` -- 6 endpoints |
| Backend -- Amendments | Built | `AmendmentsController` -- 6 endpoints |
| Backend -- Fuel Surcharge | Built | `FuelSurchargeController` -- 9 endpoints |
| Backend -- Volume Commitments | Built | `VolCommitmentsController` -- 6 endpoints |
| Backend -- SLAs | Built | `SlasController` -- 6 endpoints |
| Prisma Models | Built | 11 models: Contract, ContractAmendment, ContractRateTable, ContractRateLane, ContractSLA, VolumeCommitment, FuelSurchargeTable, FuelSurchargeTier, ContractTemplate, ContractMetric, ContractClause + legacy RateContract |
| Frontend Pages | Not Built | 0 of 8 screens |
| React Hooks | Not Built | |
| Components | Not Built | |
| Tests | Minimal | 2 spec files exist (contracts.service.spec.ts, amendments.service.spec.ts), mostly boilerplate |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Contracts Dashboard | `/contracts` | Not Built | -- | KPIs: active, expiring, expired, revenue under contract |
| Contracts List | `/contracts/list` | Not Built | -- | Filterable by type, status, customer, carrier |
| Contract Detail | `/contracts/[id]` | Not Built | -- | Tabs: Overview, Rate Tables, Lanes, Amendments, SLAs, Volume, Documents |
| Contract Builder | `/contracts/new` | Not Built | -- | Multi-step wizard: type, party, terms, rates, SLAs, review |
| Contract Edit | `/contracts/[id]/edit` | Not Built | -- | Edit with amendment tracking for active contracts |
| Contract Templates | `/contracts/templates` | Not Built | -- | Template library for reuse |
| Contract Renewals | `/contracts/renewals` | Not Built | -- | Upcoming renewals queue, auto-renewal management |
| Contract Reports | `/contracts/reports` | Not Built | -- | Expiry reports, rate comparison, volume vs commitment |

---

## 4. API Endpoints

### Contracts (13 endpoints -- Built)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/contracts` | ContractsController | Built |
| POST | `/api/v1/contracts` | ContractsController | Built |
| GET | `/api/v1/contracts/:id` | ContractsController | Built |
| PUT | `/api/v1/contracts/:id` | ContractsController | Built |
| PATCH | `/api/v1/contracts/:id` | ContractsController | Built |
| DELETE | `/api/v1/contracts/:id` | ContractsController | Built (soft delete) |
| PATCH | `/api/v1/contracts/:id/status` | ContractsController | Built |
| POST | `/api/v1/contracts/:id/activate` | ContractsController | Built |
| POST | `/api/v1/contracts/:id/renew` | ContractsController | Built |
| POST | `/api/v1/contracts/:id/cancel` | ContractsController | Built |
| POST | `/api/v1/contracts/:id/clone` | ContractsController | Built |
| GET | `/api/v1/contracts/stats` | ContractsController | Built |
| GET | `/api/v1/contracts/expiring` | ContractsController | Built |

### Rate Tables (7 endpoints -- Built)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/contracts/:contractId/rate-tables` | RateTablesController | Built |
| POST | `/api/v1/contracts/:contractId/rate-tables` | RateTablesController | Built |
| GET | `/api/v1/contracts/:contractId/rate-tables/:id` | RateTablesController | Built |
| PUT | `/api/v1/contracts/:contractId/rate-tables/:id` | RateTablesController | Built |
| PATCH | `/api/v1/contracts/:contractId/rate-tables/:id` | RateTablesController | Built |
| DELETE | `/api/v1/contracts/:contractId/rate-tables/:id` | RateTablesController | Built |
| POST | `/api/v1/contracts/:contractId/rate-tables/:id/clone` | RateTablesController | Built |

### Rate Lanes (5 endpoints -- Built)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/rate-tables/:rateTableId/lanes` | RateLanesController | Built |
| POST | `/api/v1/rate-tables/:rateTableId/lanes` | RateLanesController | Built |
| GET | `/api/v1/rate-tables/:rateTableId/lanes/:id` | RateLanesController | Built |
| PUT | `/api/v1/rate-tables/:rateTableId/lanes/:id` | RateLanesController | Built |
| DELETE | `/api/v1/rate-tables/:rateTableId/lanes/:id` | RateLanesController | Built |

### Contract Templates (6 endpoints -- Built)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/contract-templates` | ContractTemplatesController | Built |
| POST | `/api/v1/contract-templates` | ContractTemplatesController | Built |
| GET | `/api/v1/contract-templates/:id` | ContractTemplatesController | Built |
| PUT | `/api/v1/contract-templates/:id` | ContractTemplatesController | Built |
| DELETE | `/api/v1/contract-templates/:id` | ContractTemplatesController | Built |
| POST | `/api/v1/contract-templates/:id/create-contract` | ContractTemplatesController | Built |

### Amendments (6 endpoints -- Built)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/contracts/:contractId/amendments` | AmendmentsController | Built |
| POST | `/api/v1/contracts/:contractId/amendments` | AmendmentsController | Built |
| GET | `/api/v1/contracts/:contractId/amendments/:id` | AmendmentsController | Built |
| PUT | `/api/v1/contracts/:contractId/amendments/:id` | AmendmentsController | Built |
| DELETE | `/api/v1/contracts/:contractId/amendments/:id` | AmendmentsController | Built |
| POST | `/api/v1/contracts/:contractId/amendments/:id/apply` | AmendmentsController | Built |

### Fuel Surcharge Schedules (9 endpoints -- Built)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/fuel-surcharges` | FuelSurchargeController | Built |
| POST | `/api/v1/fuel-surcharges` | FuelSurchargeController | Built |
| GET | `/api/v1/fuel-surcharges/:id` | FuelSurchargeController | Built |
| PUT | `/api/v1/fuel-surcharges/:id` | FuelSurchargeController | Built |
| PATCH | `/api/v1/fuel-surcharges/:id` | FuelSurchargeController | Built |
| DELETE | `/api/v1/fuel-surcharges/:id` | FuelSurchargeController | Built |
| POST | `/api/v1/fuel-surcharges/:id/activate` | FuelSurchargeController | Built |
| GET | `/api/v1/fuel-surcharges/active` | FuelSurchargeController | Built |
| GET | `/api/v1/fuel-surcharges/:id/calculate` | FuelSurchargeController | Built |

### Volume Commitments (6 endpoints -- Built)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/contracts/:contractId/volume-commitments` | VolCommitmentsController | Built |
| POST | `/api/v1/contracts/:contractId/volume-commitments` | VolCommitmentsController | Built |
| GET | `/api/v1/contracts/:contractId/volume-commitments/:id` | VolCommitmentsController | Built |
| PUT | `/api/v1/contracts/:contractId/volume-commitments/:id` | VolCommitmentsController | Built |
| DELETE | `/api/v1/contracts/:contractId/volume-commitments/:id` | VolCommitmentsController | Built |
| GET | `/api/v1/contracts/:contractId/volume-commitments/:id/progress` | VolCommitmentsController | Built |

### SLAs (6 endpoints -- Built)
| Method | Path | Controller | Status |
|--------|------|------------|--------|
| GET | `/api/v1/contracts/:contractId/slas` | SlasController | Built |
| POST | `/api/v1/contracts/:contractId/slas` | SlasController | Built |
| GET | `/api/v1/contracts/:contractId/slas/:id` | SlasController | Built |
| PUT | `/api/v1/contracts/:contractId/slas/:id` | SlasController | Built |
| DELETE | `/api/v1/contracts/:contractId/slas/:id` | SlasController | Built |
| GET | `/api/v1/contracts/:contractId/slas/:id/compliance` | SlasController | Built |

**Total: 58 endpoints across 8 controllers, all built.**

---

## 5. Components

No components exist. The following are needed based on design specs:

**Contracts Core** (to build):
- `contracts/contracts-list.tsx` -- Data table with filters (type, status, party, date range)
- `contracts/contract-detail.tsx` -- Tabbed detail view (Overview, Rates, Lanes, Amendments, SLAs, Volume, Documents)
- `contracts/contract-form.tsx` -- Multi-step builder wizard
- `contracts/contract-status-badge.tsx` -- Status dot-label badge (DRAFT, ACTIVE, EXPIRING, EXPIRED, CANCELLED)
- `contracts/contract-summary-card.tsx` -- Card with key terms, dates, party info
- `contracts/contract-filters.tsx` -- Filter bar (type, status, customer/carrier, date range)

**Rate Tables** (to build):
- `contracts/rate-table-editor.tsx` -- Inline editable rate table
- `contracts/rate-lane-row.tsx` -- Lane rate row with origin/destination/equipment/rate
- `contracts/rate-comparison.tsx` -- Side-by-side rate comparison (contract vs market)

**Amendments** (to build):
- `contracts/amendment-timeline.tsx` -- Timeline of contract amendments
- `contracts/amendment-form.tsx` -- Amendment creation form with diff preview

**Templates** (to build):
- `contracts/template-list.tsx` -- Template library grid/list
- `contracts/template-preview.tsx` -- Template preview with "Create Contract" action

**Fuel Surcharge** (to build):
- `contracts/fuel-surcharge-table.tsx` -- Fuel surcharge schedule editor
- `contracts/fuel-surcharge-calculator.tsx` -- Calculator preview

**SLAs & Volume** (to build):
- `contracts/sla-definitions.tsx` -- SLA definition cards with compliance indicators
- `contracts/volume-commitment-tracker.tsx` -- Progress bar / gauge showing commitment vs actual

**E-Signature** (to build):
- `contracts/esign-status.tsx` -- E-signature status indicator and actions
- `contracts/esign-dialog.tsx` -- Send for signature dialog

**Renewals** (to build):
- `contracts/renewal-queue.tsx` -- Upcoming renewals list with actions
- `contracts/renewal-dialog.tsx` -- Renewal confirmation dialog

---

## 6. Hooks

No hooks exist. The following are needed:

| Hook | File (planned) | Endpoints | Notes |
|------|---------------|-----------|-------|
| `useContracts` / `useContract` | `use-contracts.ts` | GET `/contracts`, GET `/contracts/:id` | List + detail with filters |
| `useCreateContract` / `useUpdateContract` | `use-contracts.ts` | POST/PUT `/contracts` | Mutation with cache invalidation |
| `useContractActions` | `use-contracts.ts` | POST `/contracts/:id/activate`, `/renew`, `/cancel`, `/clone` | Status change mutations |
| `useRateTables` / `useCreateRateTable` | `use-rate-tables.ts` | GET/POST/PUT/DELETE rate table endpoints | Rate table CRUD |
| `useRateLanes` | `use-rate-lanes.ts` | GET/POST/PUT/DELETE lane endpoints | Lane-level rate management |
| `useContractTemplates` | `use-contract-templates.ts` | GET/POST/PUT/DELETE template endpoints | Template library |
| `useAmendments` | `use-amendments.ts` | GET/POST/PUT/DELETE/apply amendment endpoints | Amendment lifecycle |
| `useFuelSurcharges` | `use-fuel-surcharges.ts` | All fuel surcharge endpoints | Schedule management + calculation |
| `useVolumeCommitments` | `use-volume-commitments.ts` | All volume commitment endpoints | Commitment tracking + progress |
| `useContractSlas` | `use-contract-slas.ts` | All SLA endpoints | SLA definitions + compliance |

All hooks MUST use `unwrap()` / `unwrapPaginated()` for `{ data: T }` envelope. See `dev_docs_v3/05-audit/recurring-patterns.md`.

---

## 7. Business Rules

1. **Contract Types:** CUSTOMER (outbound rate agreements with shippers), CARRIER (inbound capacity agreements with carriers), LANE (specific origin-destination lane pricing). Each type has different required fields and validation -- CUSTOMER requires `customerId`, CARRIER requires `carrierId`, LANE can be associated with either.

2. **Rate Resolution Order:** Contract rates override default rate tables. Resolution priority: (1) Customer contract lane rate (most specific), (2) Customer contract base rate, (3) General rate table (least specific). The Load Planner and quoting engine use this resolution order when calculating rates.

3. **Expiry Management:** Contracts have `effectiveDate` and `expirationDate`. System generates 30-day expiry warnings. Expired contracts warn operators but do NOT hard-block load creation -- legacy loads under expired contracts continue to settlement. The `GET /contracts/expiring` endpoint surfaces upcoming expirations.

4. **Rate Change Protocol:** Rates on ACTIVE contracts cannot be changed directly. All rate modifications require creating a `ContractAmendment` record. Amendments track the change type, old values, new values, and require acknowledgment. The `POST /amendments/:id/apply` endpoint applies the amendment to the contract.

5. **Multi-Lane Contracts:** Contracts can cover multiple origin-destination pairs via `ContractRateTable` and `ContractRateLane` models. Each lane specifies origin/destination geography, equipment type, and rate. Lane-level rates take priority over contract-level base rates.

6. **E-Signature Support:** Contracts support electronic signatures via configurable provider (`esignProvider` field). The flow: generate document -> send for signature (`esignEnvelopeId`) -> track status -> record completion (`signedAt`, `signedBy`). Provider-agnostic design allows DocuSign, HelloSign, etc.

7. **Auto-Renewal:** Contracts can be configured for automatic renewal (`autoRenew: true`). `renewalTermDays` sets the new term length. `noticeDays` sets how far in advance the system alerts before auto-renewal. If not cancelled within the notice period, the contract auto-renews via the `POST /contracts/:id/renew` endpoint.

8. **Volume Commitments:** Contracts can include volume commitments (minimum loads per period). The `GET /volume-commitments/:id/progress` endpoint tracks actual vs committed volume. Shortfall triggers alerts and may affect pricing tiers.

9. **SLA Definitions:** Contracts can define Service Level Agreements (on-time delivery %, damage rate, check call frequency, etc.). The `GET /slas/:id/compliance` endpoint measures actual performance against SLA targets.

10. **Fuel Surcharge Schedules:** Fuel surcharges are managed as separate schedules that can be linked to contracts. Schedules define price tiers and surcharge percentages. The `GET /fuel-surcharges/:id/calculate` endpoint computes the surcharge for a given fuel price. Only one schedule can be active at a time (`POST /fuel-surcharges/:id/activate`).

11. **Contract Templates:** Reusable templates store standard terms, rate structures, and SLA definitions. `POST /contract-templates/:id/create-contract` generates a new contract pre-populated from the template, reducing data entry for recurring contract patterns.

12. **Agent Association:** Contracts can be associated with an agent (`agentId` field) for agent-sourced business. This ties into the commission system -- agent contracts may have different commission structures.

---

## 8. Data Model

### Contract
```
Contract {
  id                String (UUID, PK)
  tenantId          String (FK -> Tenant)
  contractNumber    String (unique, auto-generated)
  contractType      ContractType (CUSTOMER, CARRIER, LANE)
  customerId        String? (FK -> Customer, required for CUSTOMER type)
  carrierId         String? (FK -> Carrier, required for CARRIER type)
  agentId           String? (FK -> Agent, for agent-sourced contracts)
  name              String
  description       String?
  effectiveDate     DateTime
  expirationDate    DateTime?
  status            ContractStatus (default: DRAFT)
  autoRenew         Boolean (default: false)
  renewalTermDays   Int?
  noticeDays        Int?
  documentId        String? (unique, FK -> Document, unsigned contract)
  signedDocumentId  String? (FK -> Document, signed copy)
  esignProvider     String? (DocuSign, HelloSign, etc.)
  esignEnvelopeId   String? (provider envelope/transaction ID)
  signedAt          DateTime?
  signedBy          String?
  minimumRevenue    Decimal(12,2)?
  maximumRevenue    Decimal(12,2)?
  externalId        String? (external system reference)
  sourceSystem      String? (originating system)
  customFields      Json (default: {})
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime? (soft delete)
}
```

### ContractAmendment
```
ContractAmendment {
  id            String (UUID, PK)
  contractId    String (FK -> Contract)
  amendmentType String (RATE_CHANGE, TERM_EXTENSION, SCOPE_CHANGE, etc.)
  description   String
  oldValues     Json (snapshot of changed fields before)
  newValues     Json (new values to apply)
  status        String (PENDING, APPROVED, APPLIED, REJECTED)
  appliedAt     DateTime?
  appliedBy     String?
  createdAt     DateTime
  updatedAt     DateTime
}
```

### ContractRateTable
```
ContractRateTable {
  id          String (UUID, PK)
  contractId  String (FK -> Contract)
  name        String
  description String?
  effectiveDate DateTime
  expirationDate DateTime?
  lanes       ContractRateLane[]
  createdAt   DateTime
  updatedAt   DateTime
}
```

### ContractRateLane
```
ContractRateLane {
  id            String (UUID, PK)
  rateTableId   String (FK -> ContractRateTable)
  originCity    String?
  originState   String?
  originZip     String?
  destCity      String?
  destState     String?
  destZip       String?
  equipmentType String?
  baseRate      Decimal
  rateType      String (PER_MILE, FLAT, PER_CWT, etc.)
  minCharge     Decimal?
  fuelSurcharge Decimal?
  createdAt     DateTime
  updatedAt     DateTime
}
```

### ContractSla
```
ContractSla {
  id          String (UUID, PK)
  contractId  String (FK -> Contract)
  metric      String (ON_TIME_DELIVERY, DAMAGE_RATE, CHECK_CALL_COMPLIANCE, etc.)
  target      Decimal (target percentage or value)
  threshold   Decimal? (minimum acceptable level)
  penalty     Decimal? (financial penalty for non-compliance)
  createdAt   DateTime
  updatedAt   DateTime
}
```

### ContractVolumeCommitment
```
ContractVolumeCommitment {
  id          String (UUID, PK)
  contractId  String (FK -> Contract)
  period      String (MONTHLY, QUARTERLY, ANNUAL)
  minLoads    Int?
  minRevenue  Decimal?
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime
  updatedAt   DateTime
}
```

### FuelSurchargeSchedule
```
FuelSurchargeSchedule {
  id          String (UUID, PK)
  tenantId    String (FK -> Tenant)
  name        String
  description String?
  isActive    Boolean (default: false)
  tiers       Json (array of {minPrice, maxPrice, surchargePercent})
  effectiveDate DateTime
  expirationDate DateTime?
  createdAt   DateTime
  updatedAt   DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `contractNumber` | Auto-generated, unique per tenant | "Contract number already exists" |
| `contractType` | IsEnum(ContractType): CUSTOMER, CARRIER, LANE | "Invalid contract type" |
| `customerId` | Required when `contractType` = CUSTOMER, must exist in tenant | "Customer is required for customer contracts" |
| `carrierId` | Required when `contractType` = CARRIER, must exist in tenant | "Carrier is required for carrier contracts" |
| `effectiveDate` | IsDate, required | "Effective date is required" |
| `expirationDate` | IsDate, must be after `effectiveDate` if provided | "Expiration date must be after effective date" |
| `name` | IsString, MinLength(1), MaxLength(255) | "Contract name is required" |
| `minimumRevenue` | IsDecimal, >= 0 if provided | "Minimum revenue must be non-negative" |
| `maximumRevenue` | IsDecimal, >= `minimumRevenue` if both provided | "Maximum revenue must be >= minimum revenue" |
| `renewalTermDays` | IsInt, > 0, required if `autoRenew` = true | "Renewal term is required for auto-renewing contracts" |
| `noticeDays` | IsInt, > 0, must be < `renewalTermDays` | "Notice period must be less than renewal term" |
| `baseRate` (lane) | IsDecimal, > 0 | "Rate must be positive" |
| `target` (SLA) | IsDecimal, 0-100 for percentages | "SLA target must be between 0 and 100" |
| `minLoads` (volume) | IsInt, > 0 | "Minimum loads must be positive" |
| Amendment on ACTIVE | Only ACTIVE contracts can have amendments applied | "Amendments can only be applied to active contracts" |
| Status transition | DRAFT -> ACTIVE -> EXPIRING -> EXPIRED; DRAFT/ACTIVE -> CANCELLED | "Invalid status transition" |

---

## 10. Status States

### Contract Status Machine
```
DRAFT -> ACTIVE (activated, optionally after e-signature)
ACTIVE -> EXPIRING (auto, when within noticeDays of expiration)
EXPIRING -> EXPIRED (auto, when past expirationDate)
ACTIVE -> RENEWED (via renew endpoint, creates new contract)
DRAFT -> CANCELLED
ACTIVE -> CANCELLED
EXPIRING -> CANCELLED
EXPIRING -> RENEWED (renew before expiration)
```

### Amendment Status Machine
```
PENDING -> APPROVED (reviewed and accepted)
APPROVED -> APPLIED (changes applied to contract)
PENDING -> REJECTED
```

### E-Signature Flow
```
No Document -> Document Uploaded (documentId set)
Document Uploaded -> Sent for Signature (esignEnvelopeId set)
Sent for Signature -> Signed (signedAt, signedBy set, signedDocumentId set)
Signed -> Contract Activated (status -> ACTIVE)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No frontend screens exist | P0 Blocker | -- | Not Built -- 58 endpoints with no UI |
| No hooks exist | P0 Blocker | -- | Not Built -- must build before any screens |
| No tests (backend or frontend) | P1 | -- | Open |
| Rate resolution integration with Load Planner/Quoting untested | P1 | -- | Needs verification -- contract rates may not be pulled during quoting |
| E-signature provider integration not implemented | P2 | Backend has fields but no provider SDK integration | Open |
| Auto-renewal cron job may not exist | P2 | No scheduled task found for auto-renewal processing | Needs verification |
| Fuel surcharge calculation accuracy untested | P2 | `FuelSurchargeController` | Needs test coverage |

---

## 12. Tasks

### Frontend Build (New -- required to reach C+ health)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| CONT-001 | Build `use-contracts.ts` hook (CRUD + actions) | M (3h) | P0 | Must use `unwrap()` envelope pattern |
| CONT-002 | Build `use-rate-tables.ts` + `use-rate-lanes.ts` hooks | M (3h) | P0 | Rate table and lane management |
| CONT-003 | Build `use-amendments.ts` + `use-fuel-surcharges.ts` hooks | S (2h) | P1 | Amendment and fuel surcharge hooks |
| CONT-004 | Build `use-volume-commitments.ts` + `use-contract-slas.ts` hooks | S (2h) | P1 | Volume and SLA hooks |
| CONT-005 | Build `use-contract-templates.ts` hook | S (1h) | P1 | Template library hook |
| CONT-010 | Build Contracts List page (`/contracts`) | L (6h) | P0 | Data table, filters, status badges |
| CONT-011 | Build Contract Detail page (`/contracts/[id]`) | XL (10h) | P0 | 7+ tabs: Overview, Rate Tables, Lanes, Amendments, SLAs, Volume, Documents |
| CONT-012 | Build Contract Builder wizard (`/contracts/new`) | XL (12h) | P0 | Multi-step: type, party, terms, rates, SLAs, review |
| CONT-013 | Build Contract Edit page (`/contracts/[id]/edit`) | L (6h) | P1 | Amendment-aware editing for active contracts |
| CONT-014 | Build Contract Templates page (`/contracts/templates`) | M (4h) | P1 | Template library with "Create Contract" action |
| CONT-015 | Build Contract Renewals page (`/contracts/renewals`) | M (4h) | P1 | Renewal queue and management |
| CONT-016 | Build Contract Reports page (`/contracts/reports`) | M (4h) | P2 | Expiry reports, rate comparison, volume tracking |
| CONT-017 | Build Rate Table Editor component | L (6h) | P0 | Inline editable rate table with lane rows |
| CONT-018 | Build Fuel Surcharge Schedule editor | M (3h) | P1 | Tier-based schedule editor with calculator |

### Backend Verification

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| CONT-101 | Write backend tests for ContractsController (13 endpoints) | L (6h) | P1 | Critical -- no test coverage |
| CONT-102 | Write backend tests for rate tables + lanes (12 endpoints) | M (4h) | P1 | Rate accuracy is revenue-critical |
| CONT-103 | Verify rate resolution integration with Load Planner | M (3h) | P1 | Contract rates must flow into quoting |
| CONT-104 | Verify/build auto-renewal cron job | S (2h) | P2 | May need scheduled task |
| CONT-105 | E-signature provider SDK integration | L (8h) | P2 | Fields exist, provider integration missing |

### Estimated Total Effort
- **Frontend (P0):** ~40h (hooks + list + detail + builder + rate editor)
- **Frontend (P1/P2):** ~23h (edit, templates, renewals, reports, fuel surcharge)
- **Backend tests + verification:** ~23h
- **Grand total:** ~86h

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Contracts Dashboard | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/01-contracts-dashboard.md` |
| Contracts List | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/02-contracts-list.md` |
| Contract Detail | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/03-contract-detail.md` |
| Contract Builder | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/04-contract-builder.md` |
| Contract Templates | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/05-contract-templates.md` |
| Rate Agreements | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/06-rate-agreements.md` |
| Contract Renewals | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/07-contract-renewals.md` |
| Contract Reports | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/08-contract-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Simple CRUD with 8 endpoints | 58 endpoints across 8 controllers | Backend scope far exceeded plan -- fuel surcharges, SLAs, volume commitments, amendments, templates all built |
| Contract + ContractRate models | 7 Prisma models (Contract, Amendment, RateTable, RateLane, Sla, VolumeCommitment, FuelSurchargeSchedule) | Data model is comprehensive |
| Basic contract types (CUSTOMER, CARRIER, LANE) | Same types, plus e-signature, auto-renewal, agent association | Feature-rich backend beyond original scope |
| Frontend "to be built" | Still not built | Zero frontend progress -- massive gap given 58 backend endpoints |
| No design specs mentioned | 8 design spec files exist | Design work done, implementation not started |
| Rate resolution integration | Planned but unverified | Critical integration point still untested |
| No e-signature support planned | E-signature fields and flow designed | Provider SDK integration still needed |

**Summary:** The Contracts backend is the richest P1 service in the system (58 endpoints), rivaling P0 services like TMS Core (65 endpoints). However, the complete absence of frontend makes it invisible to users. This is the highest-ROI frontend build opportunity in the P1 tier.

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId) -- P0
- CRM (customer lookup for CUSTOMER contracts) -- P0
- Carrier Management (carrier lookup for CARRIER contracts) -- P0
- Documents (contract document storage, `documentId`, `signedDocumentId`) -- P1
- Agents (agent association for agent-sourced contracts) -- P2

**Depended on by:**
- Sales & Quotes (rate resolution -- contract rates override default rates during quoting)
- TMS Core / Load Planner (rate verification on load creation -- contract lane rates feed into pricing)
- Accounting (billing per contracted rates, minimum revenue enforcement)
- Customer Portal (customers viewing their contract terms and rates)
- Carrier Portal (carriers viewing their contract terms and commitments)
- Commission (agent contracts tie into commission calculations)
- Analytics (contract performance, rate trends, volume vs commitment reporting)
