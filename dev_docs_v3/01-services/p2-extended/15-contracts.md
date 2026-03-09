# Service Hub: Contracts (15)

> **Priority:** P2 Extended (Financial) | **Status:** Backend Rich, Frontend Not Built
> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-09 (PST-15 tribunal)
> **Original definition:** `dev_docs/02-services/` (Contracts service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/14-contracts/` (8 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/` (if applicable)
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-15-contracts.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.5/10) -- richest P2 backend (58 endpoints!), but zero frontend, ~65% endpoint path accuracy |
| **Confidence** | High -- code-verified via PST-15 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Substantial -- 8 controllers, 9 services, 58 endpoints, 13 Prisma models (12 active + 1 legacy), 6 enums, DocuSign integration (stubbed), 13 event types |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | Moderate -- 9 spec files, 60 test cases covering business logic (state transitions, SLA violations, fuel calculations, volume shortfall) |
| **Revenue Impact** | HIGH -- contract rates drive pricing for all loads; rate resolution affects every quote and invoice |
| **Security** | Partial -- 100% tenant isolation, 100% soft delete, but only 2/8 controllers have RolesGuard |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Contracts definition in dev_docs |
| Design Specs | Done | 8 files in `dev_docs/12-Rabih-design-Process/14-contracts/` |
| Backend -- Contracts | Built | `ContractsController` -- 14 endpoints (CRUD, approval workflow, activate, renew, terminate, history) |
| Backend -- Rate Tables | Built | `RateTablesController` -- 7 endpoints (rate table CRUD + import/export) |
| Backend -- Rate Lanes | Built | `RateLanesController` -- 5 endpoints (lane-level rates) |
| Backend -- Templates | Built | `ContractTemplatesController` -- 6 endpoints |
| Backend -- Amendments | Built | `AmendmentsController` -- 6 endpoints |
| Backend -- Fuel Surcharge | Built | `FuelSurchargeController` -- 9 endpoints (path: `/fuel-tables`, NOT `/fuel-surcharges`) |
| Backend -- Volume Commitments | Built | `VolCommitmentsController` -- 6 endpoints |
| Backend -- SLAs | Built | `SlasController` -- 6 endpoints |
| Prisma Models | Built | 13 models: Contract, ContractAmendment, ContractRateTable, ContractRateLane, ContractSLA, VolumeCommitment, FuelSurchargeTable, FuelSurchargeTier, ContractTemplate, ContractMetric, ContractClause, ContractLaneRate (legacy), RateContract (legacy) |
| Frontend Pages | Not Built | 0 of 8 screens |
| React Hooks | Not Built | |
| Components | Not Built | |
| Tests | Moderate | 9 spec files, 60 test cases -- NOT boilerplate (state transitions, amendment numbering, SLA violations, fuel surcharge calculations, volume shortfall detection) |
| Security | Partial | 2/8 controllers have RolesGuard (Contracts, RateTables); 6/8 missing RolesGuard |

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

### Contracts (14 endpoints -- Built)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/contracts` | ContractsController | Built | List with filters |
| POST | `/api/v1/contracts` | ContractsController | Built | Create contract |
| GET | `/api/v1/contracts/:id` | ContractsController | Built | Get by ID |
| PUT | `/api/v1/contracts/:id` | ContractsController | Built | Full update |
| DELETE | `/api/v1/contracts/:id` | ContractsController | Built | Soft delete |
| POST | `/api/v1/contracts/:id/submit` | ContractsController | Built | Submit for approval |
| POST | `/api/v1/contracts/:id/approve` | ContractsController | Built | Approve contract |
| POST | `/api/v1/contracts/:id/reject` | ContractsController | Built | Reject contract |
| POST | `/api/v1/contracts/:id/send-for-signature` | ContractsController | Built | Send for e-signature |
| POST | `/api/v1/contracts/:id/activate` | ContractsController | Built | Activate contract |
| POST | `/api/v1/contracts/:id/renew` | ContractsController | Built | Renew contract |
| POST | `/api/v1/contracts/:id/terminate` | ContractsController | Built | Terminate contract (NOT cancel) |
| GET | `/api/v1/contracts/:id/history` | ContractsController | Built | Contract change history |

> **PST-15 corrections:** Removed 4 phantom endpoints (PATCH /:id, PATCH /:id/status, POST /:id/clone, GET /stats, GET /expiring). Added 5 undocumented endpoints (submit, approve, reject, send-for-signature, history). Fixed cancel -> terminate.

### Rate Tables (7 endpoints -- Built)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/contracts/:contractId/rate-tables` | RateTablesController | Built | List rate tables for contract |
| POST | `/api/v1/contracts/:contractId/rate-tables` | RateTablesController | Built | Create rate table |
| GET | `/api/v1/rate-tables/:id` | RateTablesController | Built | Get by ID (flat path) |
| PUT | `/api/v1/rate-tables/:id` | RateTablesController | Built | Update (flat path) |
| DELETE | `/api/v1/rate-tables/:id` | RateTablesController | Built | Delete (flat path) |
| POST | `/api/v1/rate-tables/:id/import` | RateTablesController | Built | CSV import |
| GET | `/api/v1/rate-tables/:id/export` | RateTablesController | Built | CSV export |

> **PST-15 corrections:** Fixed paths -- GET/PUT/DELETE use flat `/rate-tables/:id`, NOT nested `/contracts/:contractId/rate-tables/:id`. Removed 2 phantom endpoints (PATCH, clone). Added 2 undocumented endpoints (import, export).

### Rate Lanes (5 endpoints -- Built)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/rate-tables/:rateTableId/lanes` | RateLanesController | Built | ~100% accurate |
| POST | `/api/v1/rate-tables/:rateTableId/lanes` | RateLanesController | Built | |
| GET | `/api/v1/rate-tables/:rateTableId/lanes/:id` | RateLanesController | Built | |
| PUT | `/api/v1/rate-tables/:rateTableId/lanes/:id` | RateLanesController | Built | |
| DELETE | `/api/v1/rate-tables/:rateTableId/lanes/:id` | RateLanesController | Built | |

### Contract Templates (6 endpoints -- Built)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/contract-templates` | ContractTemplatesController | Built | |
| POST | `/api/v1/contract-templates` | ContractTemplatesController | Built | |
| GET | `/api/v1/contract-templates/:id` | ContractTemplatesController | Built | |
| PUT | `/api/v1/contract-templates/:id` | ContractTemplatesController | Built | |
| DELETE | `/api/v1/contract-templates/:id` | ContractTemplatesController | Built | |
| POST | `/api/v1/contract-templates/:id/clone` | ContractTemplatesController | Built | Clone template (NOT create-contract) |

> **PST-15 correction:** Fixed endpoint name from `create-contract` to `clone`.

### Amendments (6 endpoints -- Built)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/contracts/:contractId/amendments` | AmendmentsController | Built | ~83% accurate |
| POST | `/api/v1/contracts/:contractId/amendments` | AmendmentsController | Built | |
| GET | `/api/v1/contracts/:contractId/amendments/:id` | AmendmentsController | Built | |
| PUT | `/api/v1/contracts/:contractId/amendments/:id` | AmendmentsController | Built | |
| DELETE | `/api/v1/contracts/:contractId/amendments/:id` | AmendmentsController | Built | |
| POST | `/api/v1/contracts/:contractId/amendments/:id/apply` | AmendmentsController | Built | |

### Fuel Surcharge Tables (9 endpoints -- Built)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/fuel-tables` | FuelSurchargeController | Built | |
| POST | `/api/v1/fuel-tables` | FuelSurchargeController | Built | |
| GET | `/api/v1/fuel-tables/:id` | FuelSurchargeController | Built | |
| PUT | `/api/v1/fuel-tables/:id` | FuelSurchargeController | Built | |
| DELETE | `/api/v1/fuel-tables/:id` | FuelSurchargeController | Built | |
| GET | `/api/v1/fuel-tables/:id/tiers` | FuelSurchargeController | Built | List tiers for table |
| POST | `/api/v1/fuel-tables/:id/tiers` | FuelSurchargeController | Built | Add tier |
| PUT | `/api/v1/fuel-tiers/:tierId` | FuelSurchargeController | Built | Update tier |
| GET | `/api/v1/fuel-surcharge/calculate` | FuelSurchargeController | Built | Calculate surcharge for fuel price |

> **PST-15 corrections:** Path is `/fuel-tables`, NOT `/fuel-surcharges` (0% path match in old hub). Removed 3 phantom endpoints (PATCH, activate, active). Added 3 undocumented tier management endpoints. Calculate endpoint uses `/fuel-surcharge/calculate` (singular).

### Volume Commitments (6 endpoints -- Built)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/contracts/:contractId/volume-commitments` | VolCommitmentsController | Built | ~83% accurate |
| POST | `/api/v1/contracts/:contractId/volume-commitments` | VolCommitmentsController | Built | |
| GET | `/api/v1/contracts/:contractId/volume-commitments/:id` | VolCommitmentsController | Built | |
| PUT | `/api/v1/contracts/:contractId/volume-commitments/:id` | VolCommitmentsController | Built | |
| DELETE | `/api/v1/contracts/:contractId/volume-commitments/:id` | VolCommitmentsController | Built | |
| GET | `/api/v1/contracts/:contractId/volume-commitments/:id/performance` | VolCommitmentsController | Built | Performance tracking (NOT progress) |

> **PST-15 correction:** Endpoint is `/performance`, NOT `/progress`.

### SLAs (6 endpoints -- Built)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/contracts/:contractId/slas` | SlasController | Built | ~83% accurate |
| POST | `/api/v1/contracts/:contractId/slas` | SlasController | Built | |
| GET | `/api/v1/contracts/:contractId/slas/:id` | SlasController | Built | |
| PUT | `/api/v1/contracts/:contractId/slas/:id` | SlasController | Built | |
| DELETE | `/api/v1/contracts/:contractId/slas/:id` | SlasController | Built | |
| GET | `/api/v1/contracts/:contractId/slas/:id/performance` | SlasController | Built | Performance measurement (NOT compliance) |

> **PST-15 correction:** Endpoint is `/performance`, NOT `/compliance`.

**Total: 58 endpoints across 8 controllers, all built.**

---

## 5. Components

No components exist. The following are needed based on design specs:

**Contracts Core** (to build):
- `contracts/contracts-list.tsx` -- Data table with filters (type, status, party, date range)
- `contracts/contract-detail.tsx` -- Tabbed detail view (Overview, Rates, Lanes, Amendments, SLAs, Volume, Documents)
- `contracts/contract-form.tsx` -- Multi-step builder wizard
- `contracts/contract-status-badge.tsx` -- Status dot-label badge (DRAFT, PENDING_APPROVAL, APPROVED, SENT_FOR_SIGNATURE, ACTIVE, EXPIRED, TERMINATED)
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
- `contracts/template-preview.tsx` -- Template preview with "Clone" action

**Fuel Surcharge** (to build):
- `contracts/fuel-surcharge-table.tsx` -- Fuel surcharge table editor (path: `/fuel-tables`)
- `contracts/fuel-surcharge-calculator.tsx` -- Calculator preview

**SLAs & Volume** (to build):
- `contracts/sla-definitions.tsx` -- SLA definition cards with performance indicators
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
| `useContractActions` | `use-contracts.ts` | POST `/contracts/:id/submit`, `/approve`, `/reject`, `/send-for-signature`, `/activate`, `/renew`, `/terminate` | Approval workflow + status change mutations |
| `useContractHistory` | `use-contracts.ts` | GET `/contracts/:id/history` | Change history |
| `useRateTables` / `useCreateRateTable` | `use-rate-tables.ts` | GET/POST rate table endpoints, POST import, GET export | Rate table CRUD + CSV import/export |
| `useRateLanes` | `use-rate-lanes.ts` | GET/POST/PUT/DELETE lane endpoints | Lane-level rate management |
| `useContractTemplates` | `use-contract-templates.ts` | GET/POST/PUT/DELETE template endpoints, POST clone | Template library |
| `useAmendments` | `use-amendments.ts` | GET/POST/PUT/DELETE/apply amendment endpoints | Amendment lifecycle |
| `useFuelTables` | `use-fuel-tables.ts` | All `/fuel-tables` + `/fuel-tiers` + `/fuel-surcharge/calculate` endpoints | Table + tier management + calculation |
| `useVolumeCommitments` | `use-volume-commitments.ts` | All volume commitment endpoints + `/performance` | Commitment tracking + performance |
| `useContractSlas` | `use-contract-slas.ts` | All SLA endpoints + `/performance` | SLA definitions + performance |

All hooks MUST use `unwrap()` / `unwrapPaginated()` for `{ data: T }` envelope. See `dev_docs_v3/05-audit/recurring-patterns.md`.

---

## 7. Business Rules

1. **Contract Types:** CUSTOMER (outbound rate agreements with shippers), CARRIER (inbound capacity agreements with carriers), LANE (specific origin-destination lane pricing). Each type has different required fields and validation -- CUSTOMER requires `customerId`, CARRIER requires `carrierId`, LANE can be associated with either.

2. **Approval Workflow:** Contracts follow a multi-step approval flow: DRAFT -> submit -> PENDING_APPROVAL -> approve -> APPROVED -> send-for-signature -> SENT_FOR_SIGNATURE -> activate -> ACTIVE. Contracts can be rejected at PENDING_APPROVAL (returns to DRAFT). This workflow ensures contracts are reviewed before becoming effective.

3. **Rate Resolution Order:** Contract rates override default rate tables. Resolution priority: (1) Customer contract lane rate (most specific), (2) Customer contract base rate, (3) General rate table (least specific). The Load Planner and quoting engine use this resolution order when calculating rates.

4. **Expiry Management:** Contracts have `effectiveDate` and `expirationDate`. Expired contracts warn operators but do NOT hard-block load creation -- legacy loads under expired contracts continue to settlement.

5. **Rate Change Protocol:** Rates on ACTIVE contracts cannot be changed directly. All rate modifications require creating a `ContractAmendment` record. Amendments track the change type, old values, new values, and require acknowledgment. The `POST /amendments/:id/apply` endpoint applies the amendment to the contract.

6. **Multi-Lane Contracts:** Contracts can cover multiple origin-destination pairs via `ContractRateTable` and `ContractRateLane` models. Each lane specifies origin/destination geography, equipment type, and rate. Lane-level rates take priority over contract-level base rates.

7. **E-Signature Support:** Contracts support electronic signatures via configurable provider (`esignProvider` field). The flow: generate document -> send for signature (`POST /contracts/:id/send-for-signature`) -> track status -> record completion (`signedAt`, `signedBy`). Provider-agnostic design allows DocuSign, HelloSign, etc. Currently stubbed with mock envelope IDs.

8. **Auto-Renewal:** Contracts can be configured for automatic renewal (`autoRenew: true`). `renewalTermDays` sets the new term length. `noticeDays` sets how far in advance the system alerts before auto-renewal. If not cancelled within the notice period, the contract auto-renews via the `POST /contracts/:id/renew` endpoint. **Note:** No cron job for auto-renewal processing has been found -- this is a documented business rule without automated implementation.

9. **Volume Commitments:** Contracts can include volume commitments (minimum loads per period). The `GET /volume-commitments/:id/performance` endpoint tracks actual vs committed volume. Shortfall triggers alerts and may affect pricing tiers.

10. **SLA Definitions:** Contracts can define Service Level Agreements (on-time delivery %, damage rate, check call frequency, etc.). The `GET /slas/:id/performance` endpoint measures actual performance against SLA targets.

11. **Fuel Surcharge Tables:** Fuel surcharges are managed as separate tables (path: `/fuel-tables`) that can be linked to contracts. Tables contain tiers (`FuelSurchargeTier` model) with price ranges and surcharge percentages. The `GET /fuel-surcharge/calculate` endpoint computes the surcharge for a given fuel price.

12. **Contract Templates:** Reusable templates store standard terms, rate structures, and SLA definitions. `POST /contract-templates/:id/clone` generates a new contract pre-populated from the template, reducing data entry for recurring contract patterns.

13. **Agent Association:** Contracts can be associated with an agent (`agentId` field) for agent-sourced business. This ties into the commission system -- agent contracts may have different commission structures.

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
> Hub documents 27 fields; schema has ~32. Field accuracy ~85%.

### ContractAmendment
```
ContractAmendment {
  id            String (UUID, PK)
  tenantId      String (FK -> Tenant)
  contractId    String (FK -> Contract)
  amendmentNumber String (auto-generated)
  amendmentType String (RATE_CHANGE, TERM_EXTENSION, SCOPE_CHANGE, etc.)
  description   String
  oldValues     Json (snapshot of changed fields before)
  newValues     Json (new values to apply)
  status        String (PENDING, APPROVED, APPLIED, REJECTED)
  appliedAt     DateTime?
  appliedBy     String?
  externalId    String?
  sourceSystem  String?
  customFields  Json (default: {})
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?
}
```
> Hub documents ~10 fields; schema has ~21. Field accuracy ~50%.

### ContractRateTable
```
ContractRateTable {
  id             String (UUID, PK)
  tenantId       String (FK -> Tenant)
  contractId     String (FK -> Contract)
  name           String
  description    String?
  effectiveDate  DateTime
  expirationDate DateTime?
  lanes          ContractRateLane[]
  externalId     String?
  sourceSystem   String?
  customFields   Json (default: {})
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
}
```

### ContractRateLane
```
ContractRateLane {
  id            String (UUID, PK)
  tenantId      String (FK -> Tenant)
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
  currency      String? (e.g., USD)
  fuelTableId   String? (FK -> FuelSurchargeTable)
  externalId    String?
  sourceSystem  String?
  customFields  Json (default: {})
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?
}
```
> Hub documents 9 fields; schema has ~22. Adds currency, fuel table link.

### ContractSLA
```
ContractSLA {
  id          String (UUID, PK)
  tenantId    String (FK -> Tenant)
  contractId  String (FK -> Contract)
  slaType     SLAType (enum)
  metric      String (ON_TIME_DELIVERY, DAMAGE_RATE, CHECK_CALL_COMPLIANCE, etc.)
  target      Decimal (target percentage or value)
  threshold   Decimal? (minimum acceptable level)
  penalty     Decimal? (financial penalty for non-compliance)
  status      String
  externalId  String?
  sourceSystem String?
  customFields Json (default: {})
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```
> Hub documents ~11 fields; schema has ~17. Adds slaType enum, status.

### ContractClause
```
ContractClause {
  id          String (UUID, PK)
  tenantId    String (FK -> Tenant)
  contractId  String (FK -> Contract)
  clauseType  ContractClauseType (9-value enum)
  title       String
  content     String
  position    Int
  isRequired  Boolean
  externalId  String?
  sourceSystem String?
  customFields Json (default: {})
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```
> **Previously undocumented** -- 16-field model for contract clause management with 9-value ContractClauseType enum.

### VolumeCommitment
```
VolumeCommitment {
  id          String (UUID, PK)
  tenantId    String (FK -> Tenant)
  contractId  String (FK -> Contract)
  period      String (MONTHLY, QUARTERLY, ANNUAL)
  minLoads    Int?
  minRevenue  Decimal?
  startDate   DateTime
  endDate     DateTime?
  externalId  String?
  sourceSystem String?
  customFields Json (default: {})
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```
> **Name correction:** Model is `VolumeCommitment`, NOT `ContractVolumeCommitment`.

### FuelSurchargeTable
```
FuelSurchargeTable {
  id             String (UUID, PK)
  tenantId       String (FK -> Tenant)
  name           String
  description    String?
  isActive       Boolean (default: false)
  version        Int?
  effectiveDate  DateTime
  expirationDate DateTime?
  tiers          FuelSurchargeTier[] (relation, NOT Json)
  externalId     String?
  sourceSystem   String?
  customFields   Json (default: {})
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
}
```
> **Name correction:** Model is `FuelSurchargeTable`, NOT `FuelSurchargeSchedule`. Tiers are a relation to `FuelSurchargeTier`, NOT a Json array.

### FuelSurchargeTier
```
FuelSurchargeTier {
  id              String (UUID, PK)
  fuelTableId     String (FK -> FuelSurchargeTable)
  minPrice        Decimal
  maxPrice        Decimal
  surchargePercent Decimal
  createdAt       DateTime
  updatedAt       DateTime
}
```
> **CRITICAL BUG:** FuelSurchargeTier is missing `tenantId` field -- potential data leak across tenants. See Action Items P0-1.

### ContractTemplate
```
ContractTemplate {
  id          String (UUID, PK)
  tenantId    String (FK -> Tenant)
  name        String
  description String?
  templateData Json (standard terms, rate structures, SLA definitions)
  version     Int?
  isActive    Boolean (default: true)
  externalId  String?
  sourceSystem String?
  customFields Json (default: {})
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

### ContractMetric
```
ContractMetric {
  id          String (UUID, PK)
  tenantId    String (FK -> Tenant)
  contractId  String (FK -> Contract)
  metricType  MetricType (enum)
  value       Decimal
  period      String
  ... (~20 fields total, hub documents sparse)
  createdAt   DateTime
  updatedAt   DateTime
}
```

### ContractLaneRate (legacy)
```
ContractLaneRate {
  ... (35 fields -- legacy model for RateContract system)
}
```
> **Previously undocumented.** Legacy model associated with RateContract. 35 fields. Migration status to Contract model unclear.

### RateContract (legacy)
```
RateContract {
  ... (23 fields -- legacy rate contract model)
}
```
> Confirmed present. Dual model system with Contract -- migration plan needed.

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
| Status transition | See Section 10 status machine | "Invalid status transition" |

---

## 10. Status States

### Contract Status Machine
```
DRAFT -> PENDING_APPROVAL (via POST /contracts/:id/submit)
PENDING_APPROVAL -> APPROVED (via POST /contracts/:id/approve)
PENDING_APPROVAL -> DRAFT (via POST /contracts/:id/reject -- returns to draft)
APPROVED -> SENT_FOR_SIGNATURE (via POST /contracts/:id/send-for-signature)
SENT_FOR_SIGNATURE -> ACTIVE (via POST /contracts/:id/activate -- after e-signature complete)
APPROVED -> ACTIVE (via POST /contracts/:id/activate -- if no e-signature required)
ACTIVE -> EXPIRED (auto, when past expirationDate)
ACTIVE -> RENEWED (via POST /contracts/:id/renew -- creates new contract)
ACTIVE -> TERMINATED (via POST /contracts/:id/terminate)
DRAFT -> TERMINATED
```

> **PST-15 correction:** Added 3 missing states: PENDING_APPROVAL, APPROVED, SENT_FOR_SIGNATURE. Fixed CANCELLED -> TERMINATED. Removed EXPIRING state (not in code). Full enum: DRAFT, PENDING_APPROVAL, APPROVED, SENT_FOR_SIGNATURE, ACTIVE, EXPIRED, TERMINATED (7 values).

### ContractStatus Enum (7 values)
```
DRAFT | PENDING_APPROVAL | APPROVED | SENT_FOR_SIGNATURE | ACTIVE | EXPIRED | TERMINATED
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
Document Uploaded -> Sent for Signature (POST /contracts/:id/send-for-signature, status -> SENT_FOR_SIGNATURE)
Sent for Signature -> Signed (signedAt, signedBy set, signedDocumentId set)
Signed -> Contract Activated (POST /contracts/:id/activate, status -> ACTIVE)
```

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| No frontend screens exist | P0 Blocker | Not Built | 58 endpoints with no UI |
| No hooks exist | P0 Blocker | Not Built | Must build before any screens |
| **FuelSurchargeTier missing tenantId** | **P0 BUG** | **Open** | Data isolation bug -- potential cross-tenant data leak in financial model |
| **6/8 controllers missing RolesGuard** | **P0 BUG** | **Open** | Amendments, RateLanes, SLAs, FuelSurcharge, Templates, VolumeCommitments only have JwtAuthGuard (no role enforcement) |
| Rate resolution integration with Load Planner/Quoting untested | P1 | Open | Contract rates may not be pulled during quoting -- no integration tests found |
| E-signature provider integration not implemented | P2 | Open | DocuSign stubbed with mock envelope IDs only |
| Auto-renewal cron job not found | P2 | Open | Business rule documented but no scheduled task implements it |
| Dual model system (Contract + RateContract) | P2 | Open | Migration status unclear -- needs migration plan |

**Resolved Issues (closed during PST-15 tribunal):**
- ~~No tests (backend or frontend)~~ -- **FALSE:** 9 spec files, 60 test cases covering state transitions, amendment numbering, SLA violations, fuel surcharge calculations, volume shortfall detection
- ~~Fuel surcharge calculation accuracy untested~~ -- **FALSE:** 8 test cases cover tier-based fuel surcharge calculations

---

## 12. Tasks

### Frontend Build (New -- required to reach C+ health)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| CONT-001 | Build `use-contracts.ts` hook (CRUD + approval workflow + history) | M (3h) | P0 | Must use `unwrap()` envelope pattern, include submit/approve/reject/send-for-signature/terminate |
| CONT-002 | Build `use-rate-tables.ts` + `use-rate-lanes.ts` hooks | M (3h) | P0 | Rate table CRUD + CSV import/export, flat paths for GET/PUT/DELETE |
| CONT-003 | Build `use-amendments.ts` + `use-fuel-tables.ts` hooks | S (2h) | P1 | Amendment and fuel table hooks (path: `/fuel-tables`) |
| CONT-004 | Build `use-volume-commitments.ts` + `use-contract-slas.ts` hooks | S (2h) | P1 | Volume `/performance` and SLA `/performance` endpoints |
| CONT-005 | Build `use-contract-templates.ts` hook | S (1h) | P1 | Template library hook, clone endpoint |
| CONT-010 | Build Contracts List page (`/contracts`) | L (6h) | P0 | Data table, filters, status badges (7-value status enum) |
| CONT-011 | Build Contract Detail page (`/contracts/[id]`) | XL (10h) | P0 | 7+ tabs: Overview, Rate Tables, Lanes, Amendments, SLAs, Volume, Documents |
| CONT-012 | Build Contract Builder wizard (`/contracts/new`) | XL (12h) | P0 | Multi-step: type, party, terms, rates, SLAs, review, submit for approval |
| CONT-013 | Build Contract Edit page (`/contracts/[id]/edit`) | L (6h) | P1 | Amendment-aware editing for active contracts |
| CONT-014 | Build Contract Templates page (`/contracts/templates`) | M (4h) | P1 | Template library with "Clone" action |
| CONT-015 | Build Contract Renewals page (`/contracts/renewals`) | M (4h) | P1 | Renewal queue and management |
| CONT-016 | Build Contract Reports page (`/contracts/reports`) | M (4h) | P2 | Expiry reports, rate comparison, volume tracking |
| CONT-017 | Build Rate Table Editor component | L (6h) | P0 | Inline editable rate table with lane rows, CSV import/export |
| CONT-018 | Build Fuel Surcharge Table editor | M (3h) | P1 | Tier-based table editor with calculator (path: `/fuel-tables`) |

### Backend Fixes (from PST-15 tribunal)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| CONT-100 | Add tenantId to FuelSurchargeTier model | S (1h) | **P0** | Data isolation bug -- migration + backfill |
| CONT-101 | Add RolesGuard to 6 controllers | M (2h) | **P0** | Amendments, RateLanes, SLAs, FuelSurcharge, Templates, VolumeCommitments |
| CONT-102 | Verify rate resolution integration with Load Planner | M (3h) | P1 | Contract rates must flow into quoting |
| CONT-103 | Verify/build auto-renewal cron job | S (2h) | P2 | May need scheduled task |
| CONT-104 | E-signature provider SDK integration | L (8h) | P2 | Fields exist, provider integration missing |
| CONT-105 | Clarify Contract vs RateContract dual model system | S (1h) | P2 | Needs migration plan |

### Estimated Total Effort
- **Backend fixes (P0):** ~3h (tenantId fix + RolesGuard)
- **Frontend (P0):** ~40h (hooks + list + detail + builder + rate editor)
- **Frontend (P1/P2):** ~23h (edit, templates, renewals, reports, fuel surcharge)
- **Backend verification + integration:** ~14h
- **Grand total:** ~80h

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Contracts Dashboard | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/01-contracts-dashboard.md` |
| Contracts List | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/02-contracts-list.md` |
| Contract Detail | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/03-contract-detail.md` |
| Contract Builder | Design spec | `dev_docs/12-Rabib-design-Process/14-contracts/04-contract-builder.md` |
| Contract Templates | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/05-contract-templates.md` |
| Rate Agreements | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/06-rate-agreements.md` |
| Contract Renewals | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/07-contract-renewals.md` |
| Contract Reports | Design spec | `dev_docs/12-Rabih-design-Process/14-contracts/08-contract-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Simple CRUD with 8 endpoints | 58 endpoints across 8 controllers | Backend scope far exceeded plan -- fuel surcharges, SLAs, volume commitments, amendments, templates all built |
| Contract + ContractRate models | 13 Prisma models (Contract, Amendment, RateTable, RateLane, SLA, VolumeCommitment, FuelSurchargeTable, FuelSurchargeTier, Template, Metric, Clause, ContractLaneRate, RateContract) | Data model is comprehensive -- includes 2 previously undocumented models |
| Basic contract types (CUSTOMER, CARRIER, LANE) | Same types, plus approval workflow, e-signature, auto-renewal, agent association | Feature-rich backend beyond original scope |
| Frontend "to be built" | Still not built | Zero frontend progress -- massive gap given 58 backend endpoints |
| No design specs mentioned | 8 design spec files exist | Design work done, implementation not started |
| Simple DRAFT -> ACTIVE status | 7-state machine with approval workflow | Much richer than originally planned |
| "2 spec files, boilerplate" | 9 spec files, 60 real test cases | Tests significantly underreported in original hub |
| Rate resolution integration | Planned but unverified | Critical integration point still untested |
| No e-signature support planned | E-signature fields and flow designed | Provider SDK integration still needed |

**Summary:** The Contracts backend is the richest P2 service in the system (58 endpoints), rivaling P0 services like TMS Core (65 endpoints). However, the complete absence of frontend makes it invisible to users. This is the highest-ROI frontend build opportunity in the P2 tier. PST-15 tribunal revealed the hub had ~65% endpoint path accuracy (worst of any count-accurate service) and completely missed the approval workflow.

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
