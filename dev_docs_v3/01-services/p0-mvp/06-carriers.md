# Service Hub: Carrier Management (06)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-06 tribunal)
> **Original definition:** `dev_docs/02-services/` (Carrier service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/05-carrier/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/05-carrier.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-06-carrier-management.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B+ (8.0/10) |
| **Confidence** | High — code-verified via PST-06 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | DUAL MODULE ARCHITECTURE: (1) `modules/operations/carriers/` — 22 endpoints, `OperationsCarrier` model, **used by frontend**. (2) `modules/carrier/` — 50 endpoints, `Carrier` model, rich FMCSA/compliance/insurance logic, **not used by frontend**. Hub documents the Operations module (what frontend calls). |
| **Frontend** | Built — 6 pages (594+198+73+271 LOC + columns + actions-menu), 17 components in `components/carriers/`, 34 hooks |
| **Tests** | 45+ backend unit tests (5 files in `modules/carrier/`), 1 E2E Playwright test (`apps/e2e/tests/carriers/carrier-management.spec.ts`), 1 `window.confirm` regression test |
| **PROTECTED FILE** | `apps/web/app/(dashboard)/truck-types/page.tsx` — Gold standard 8/10 |
| **Active Blockers** | None — architectural decision needed on dual-module consolidation (CARR-013) |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Carrier service definition in dev_docs |
| Design Specs | Done | 13 files, all 15-section |
| Backend — Operations Carriers | Production | `apps/api/src/modules/operations/carriers/` — 22 endpoints, 789 LOC. **This is what frontend calls.** |
| Backend — Carriers (Original) | Production | `apps/api/src/modules/carrier/` — 50 endpoints, 6 controllers, 6 services, 823 LOC service. FMCSA, compliance, insurance, approval workflow. **Not called by frontend.** |
| Prisma Models | Production | `OperationsCarrier`, `OperationsCarrierDriver`, `OperationsCarrierTruck`, `OperationsCarrierDocument` (frontend). Original: `Carrier`, `CarrierContact`, `Driver`, `InsuranceCertificate`, `CarrierDocument` (unused by frontend). |
| Frontend Pages | Built | 6 pages: list (594 LOC), detail (198 LOC), edit (73 LOC), scorecard (271 LOC), + columns.tsx, carrier-actions-menu.tsx |
| React Hooks | Built | 34 hooks across 3 files: `use-carriers.ts` (31 hooks, 519 LOC), `use-fmcsa.ts` (2 hooks), `use-carrier-scorecard.ts` (1 hook) |
| Components | Built | 17 components in `components/carriers/` + 4 related (load-board carrier-match-card/panel, tms carrier-selector, load-carrier-tab) |
| Tests | Partial | 45+ backend tests (5 unit files) + 1 E2E Playwright + 1 regression test. Not "0 frontend" — E2E tests exist. |
| Security | Strong | Both modules: 100% tenant isolation, soft delete, auth guards. Operations: `isActive: true` + `deletedAt: null` on all list queries. |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Carriers List | `/carriers` | Built | 6/10 | 594 LOC (not 858). Debounced search, multi-filter (type/status/state/tier/equipment/compliance/minScore), sorting, bulk ops, CSV export, create dialog. Well-structured with column definitions and actions menu in separate files. |
| Carrier Detail | `/carriers/[id]` | Built | 7/10 | 198 LOC. 8 tabs: overview, contacts, insurance, docs, drivers (COMPANY only), trucks, loads, compliance. Edit/delete/scorecard buttons. |
| Carrier Create | — | Built (dialog) | 5/10 | Inline dialog on list page — no separate `/carriers/new` route |
| Carrier Edit | `/carriers/[id]/edit` | Built | 6/10 | 73 LOC page wrapper. Delegates to CarrierForm (640 LOC) + nested managers (drivers, trucks, documents). Tri-tab edit interface. |
| Carrier Scorecard | `/carriers/[id]/scorecard` | Built | 7/10 | 271 LOC. ScoreGauge radial visualization, tier progression bar, 5 KPI cards (pickup%, delivery%, claims, acceptance, rating), monthly line chart (loads/rate), load history table. |
| Load History | `/load-history` | Built | 5/10 | List works — separate from carriers module, under operations |
| Load History Detail | `/load-history/[id]` | Built | 5/10 | page.tsx EXISTS — QS-008 to verify at runtime |
| **Truck Types** | `/truck-types` | **PROTECTED** | **8/10** | **Gold standard — DO NOT TOUCH** (1,229 LOC) |
| Carrier Dashboard | `/carriers/dashboard` | Not Built | — | Phase 2 |
| Compliance Center | `/carriers/compliance` | Not Built | — | Phase 2 |
| Insurance Tracking | `/carriers/insurance` | Not Built | — | Phase 2 |
| Equipment List | `/carriers/[id]/equipment` | Not Built | — | Phase 2 |

---

## 4. API Endpoints

### Operations Carriers — Frontend Backend (what the frontend actually calls)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| POST | `/api/v1/operations/carriers` | OperationsCarriersController | Production | Create carrier |
| GET | `/api/v1/operations/carriers` | OperationsCarriersController | Production | Paginated list with filters |
| GET | `/api/v1/operations/carriers/stats` | OperationsCarriersController | Production | Carrier statistics |
| GET | `/api/v1/operations/carriers/:carrierId` | OperationsCarriersController | Production | Detail with drivers, trucks, doc count |
| PATCH | `/api/v1/operations/carriers/:carrierId` | OperationsCarriersController | Production | Update carrier |
| DELETE | `/api/v1/operations/carriers/:carrierId` | OperationsCarriersController | Production | Soft delete |
| GET | `/api/v1/operations/carriers/:carrierId/scorecard` | OperationsCarriersController | Production | Scorecard data |
| POST | `/api/v1/operations/carriers/:carrierId/drivers` | OperationsCarriersController | Production | Create driver |
| GET | `/api/v1/operations/carriers/:carrierId/drivers` | OperationsCarriersController | Production | List drivers |
| GET | `/api/v1/operations/carriers/:carrierId/drivers/:driverId` | OperationsCarriersController | Production | Driver detail |
| PATCH | `/api/v1/operations/carriers/:carrierId/drivers/:driverId` | OperationsCarriersController | Production | Update driver |
| DELETE | `/api/v1/operations/carriers/:carrierId/drivers/:driverId` | OperationsCarriersController | Production | Remove driver |
| POST | `/api/v1/operations/carriers/:carrierId/trucks` | OperationsCarriersController | Production | Create truck |
| GET | `/api/v1/operations/carriers/:carrierId/trucks` | OperationsCarriersController | Production | List trucks |
| GET | `/api/v1/operations/carriers/:carrierId/trucks/:truckId` | OperationsCarriersController | Production | Truck detail |
| PATCH | `/api/v1/operations/carriers/:carrierId/trucks/:truckId` | OperationsCarriersController | Production | Update truck |
| PATCH | `/api/v1/operations/carriers/:carrierId/trucks/:truckId/assign-driver/:driverId` | OperationsCarriersController | Production | Assign driver to truck |
| DELETE | `/api/v1/operations/carriers/:carrierId/trucks/:truckId` | OperationsCarriersController | Production | Remove truck |
| GET | `/api/v1/operations/carriers/:carrierId/documents` | OperationsCarriersController | Production | List documents |
| POST | `/api/v1/operations/carriers/:carrierId/documents` | OperationsCarriersController | Production | Upload document |
| DELETE | `/api/v1/operations/carriers/:carrierId/documents/:documentId` | OperationsCarriersController | Production | Delete document |

**Total: 21 endpoints** — 7 carrier CRUD + stats + scorecard, 5 driver CRUD, 6 truck CRUD + assign-driver, 3 document CRUD.

### Original Carrier Module — Administrative/Compliance Backend (not used by frontend)

The original `modules/carrier/` module has 50 endpoints across 6 controllers (carriers, contacts, drivers, insurance, documents, FMCSA). It uses the `Carrier` Prisma model (70 fields) with rich features:

- FMCSA lookup + compliance log + CSA scores + 10 authority fields
- Separate `InsuranceCertificate` model with full CRUD (type, provider, policy#, coverage, expiry, verification)
- `CarrierContact` model (21 fields, primary/active, role, preferences)
- Carrier status machine with business rule enforcement (PENDING→ACTIVE→INACTIVE/SUSPENDED/BLACKLISTED)
- Performance scorecard, compliance endpoints, approval workflow

**Note:** These endpoints are exposed at `/api/v1/carriers/...` but NO frontend page calls them. See CARR-013 for the architectural decision task on whether to consolidate or deprecate.

### Security (Both Modules)

| Check | Operations Module | Original Module |
|-------|-------------------|-----------------|
| Tenant Isolation | 100% — all queries filter by tenantId via parent validation | 100% — all 58 queries filter by tenantId |
| Soft Delete | 100% — `isActive: true` + `deletedAt: null` on all list queries | 100% — `deletedAt: null` on all list/detail queries |
| Auth Guards | `@UseGuards(JwtAuthGuard, RolesGuard)` on controller class | JwtAuthGuard on all 6 controllers |
| Role Guards | Write: ADMIN, MANAGER. Read: + SALES_REP, SALES_MANAGER | ADMIN, CARRIER_MANAGER, DISPATCHER, OPERATIONS. Some sub-controllers JwtAuth only. |
| Parent Validation | All nested resources validate parent carrier belongs to tenant | Yes |

---

## 5. Components

17 components in `components/carriers/` + 4 related:

### Core Components
| Component | Path | Status |
|-----------|------|--------|
| CarrierOverviewCard | `components/carriers/carrier-overview-card.tsx` | Built |
| CarrierInsuranceSection | `components/carriers/carrier-insurance-section.tsx` | Built |
| CarrierDriversSection | `components/carriers/carrier-drivers-section.tsx` | Built |
| CarrierDocumentsSection | `components/carriers/carrier-documents-section.tsx` | Built |
| CarrierDocumentsManager | `components/carriers/carrier-documents-manager.tsx` | Built |
| CarrierContactsTab | `components/carriers/carrier-contacts-tab.tsx` | Built |
| CarrierLoadsTab | `components/carriers/carrier-loads-tab.tsx` | Built |
| CarrierDriversManager | `components/carriers/carrier-drivers-manager.tsx` | Built |
| CarrierTrucksManager | `components/carriers/carrier-trucks-manager.tsx` | Built |
| CarrierForm | `components/carriers/carrier-form.tsx` | Built |
| FmcsaLookup | `components/carriers/fmcsa-lookup.tsx` | Built |
| CsaScoresDisplay | `components/carriers/csa-scores-display.tsx` | Built |
| TierBadge | `components/carriers/tier-badge.tsx` | Built |
| PerformanceMetricCard | `components/carriers/scorecard/performance-metric-card.tsx` | Built |
| ScoreGauge | `components/carriers/scorecard/score-gauge.tsx` | Built |
| ScorecardLoadHistory | `components/carriers/scorecard/scorecard-load-history.tsx` | Built |
| TierProgressionBar | `components/carriers/scorecard/tier-progression-bar.tsx` | Built |

### Related Components (other directories)
| Component | Path | Status |
|-----------|------|--------|
| CarrierMatchCard | `components/load-board/carrier-match-card.tsx` | Built |
| CarrierMatchPanel | `components/load-board/carrier-match-panel.tsx` | Built |
| CarrierSelector | `components/tms/carrier-selector.tsx` | Built |
| LoadCarrierTab | `components/tms/load-carrier-tab.tsx` | Built |

### Protected
| Component | Path | Status |
|-----------|------|--------|
| **TruckTypesPage** | `(dashboard)/truck-types/page.tsx` | **PROTECTED 8/10** |

---

## 6. Hooks

34 hooks across 3 files — all calling `/operations/carriers/` endpoints:

### Carrier CRUD Hooks (`lib/hooks/carriers/use-carriers.ts`, 519 LOC — 31 hooks)
| Hook | Endpoint | Envelope | Quality |
|------|----------|----------|---------|
| `useCarriers` | GET `/operations/carriers` | `raw.data` or `raw` | 7/10 |
| `useCarrier` | GET `/operations/carriers/:id` | `raw.data ?? raw` | 7/10 |
| `useCreateCarrier` | POST `/operations/carriers` | Mutation | 8/10 |
| `useUpdateCarrier` | PATCH `/operations/carriers/:id` | Mutation | 8/10 |
| `useDeleteCarrier` | DELETE `/operations/carriers/:id` | Mutation | 8/10 |
| `useCarrierStats` | GET `/operations/carriers/stats` | Yes | 7/10 |
| `useCarrierDrivers` | GET `/operations/carriers/:id/drivers` | Yes | 7/10 |
| `useCarrierDriver` | GET `/operations/carriers/:id/drivers/:driverId` | Yes | 7/10 |
| `useCreateDriver` | POST `/operations/carriers/:id/drivers` | Mutation | 8/10 |
| `useUpdateDriver` | PATCH `/operations/carriers/:id/drivers/:driverId` | Mutation | 8/10 |
| `useDeleteDriver` | DELETE `/operations/carriers/:id/drivers/:driverId` | Mutation | 8/10 |
| `useCarrierTrucks` | GET `/operations/carriers/:id/trucks` | Yes | 7/10 |
| `useCreateTruck` | POST `/operations/carriers/:id/trucks` | Mutation | 8/10 |
| `useUpdateTruck` | PATCH `/operations/carriers/:id/trucks/:truckId` | Mutation | 8/10 |
| `useAssignDriverToTruck` | PATCH `.../:truckId/assign-driver/:driverId` | Mutation | 8/10 |
| `useDeleteTruck` | DELETE `/operations/carriers/:id/trucks/:truckId` | Mutation | 8/10 |
| `useCarrierDocuments` | GET `/operations/carriers/:id/documents` | Yes | 7/10 |
| `useCreateCarrierDocument` | POST `/operations/carriers/:id/documents` | Mutation | 8/10 |
| `useDeleteCarrierDocument` | DELETE `/operations/carriers/:id/documents/:documentId` | Mutation | 8/10 |
| + 12 additional hooks | Various carrier-related utilities | — | — |

### FMCSA Hooks (`lib/hooks/carriers/use-fmcsa.ts` — 2 hooks)
| Hook | Endpoint | Envelope | Quality |
|------|----------|----------|---------|
| `useFmcsaLookup` | DOT/MC lookup | Yes | 7/10 |
| `useCsaScores` | CSA scores | Yes | 7/10 |

### Scorecard Hook (`lib/hooks/carriers/use-carrier-scorecard.ts` — 1 hook)
| Hook | Endpoint | Envelope | Quality |
|------|----------|----------|---------|
| `useCarrierScorecard` | GET `/operations/carriers/:id/scorecard` | Yes | 7/10 |

**Envelope pattern:** Defensive `raw.data ?? raw` — different from Dashboard's `unwrap<T>()` helper. Inconsistent but functional.

---

## 7. Business Rules

1. **Carrier Onboarding Requirements:** A carrier cannot be set to ACTIVE status until: (1) Valid MC# or DOT# is provided, (2) FMCSA authority is AUTHORIZED, (3) Auto liability insurance >= $750,000 is on file, (4) Cargo insurance >= $100,000 is on file. All four conditions must be met. **Note:** These rules are enforced in the original `carrier/` module. The operations module uses a simple status string field with no enforcement.
2. **Insurance Tracking — Architecture Split:** Original module: separate `InsuranceCertificate` model with full CRUD (type, provider, policy#, coverage, expiry, verification) + `checkExpiredInsurance()` job (no cron trigger found). Operations module: 4 denormalized fields on `OperationsCarrier` (insuranceCompany, insurancePolicyNumber, insuranceExpiryDate, cargoInsuranceLimitCents) — no separate tracking.
3. **Carrier Performance Scoring:** Score = (On-time delivery x 40%) + (Claims ratio inverse x 30%) + (Check call compliance x 20%) + (Service quality x 10%). Scale: 0-100. PREFERRED >= 85, APPROVED >= 70, CONDITIONAL >= 50, SUSPENDED < 50. Operations module stores: onTimePickupRate, onTimeDeliveryRate, claimsRate, avgRating, acceptanceRate, totalLoadsCompleted, performanceScore.
4. **Status Hierarchy (Original Module):** BLACKLISTED is permanent and can only be unset by ADMIN with written reason. SUSPENDED is temporary (auto from insurance expiry, or manual). BLACKLISTED carriers cannot be assigned loads under any circumstances. **Operations module:** Simple string status field with no state machine enforcement.
5. **FMCSA Lookup:** The system auto-verifies MC#/DOT# on carrier creation via FMCSA hooks. FMCSA data is cached for 24 hours. **Note:** FMCSA integration lives in the original carrier module, not operations.
6. **Preferred Carrier Program:** PREFERRED carriers appear at the top of carrier selection lists in the Load Planner and Dispatch Board. Operations module has `qualificationTier` and `tier` fields.
7. **Soft Delete:** Both modules use soft delete. Operations module: `isActive: true` + `deletedAt: null` on all queries. Original module: `deletedAt: null` on all queries.
8. **Carrier Types:** Operations module supports `carrierType` field — COMPANY carriers show drivers tab, others may not. Frontend conditionally renders driver-related tabs based on carrier type.

---

## 8. Data Model

### OperationsCarrier (Frontend Model — what hooks/pages actually use)
```
OperationsCarrier {
  id                      String (UUID)
  tenantId                String
  carrierType             String
  companyName             String
  mcNumber                String?
  dotNumber               String?
  einTaxId                String?
  address                 String?
  city                    String?
  state                   String?
  zip                     String?
  phone                   String?
  phoneSecondary          String?
  email                   String?
  website                 String?
  billingEmail            String?
  paymentTermsDays        Int?
  preferredPaymentMethod  String?
  factoringCompanyName    String?
  factoringCompanyPhone   String?
  factoringCompanyEmail   String?
  insuranceCompany        String?
  insurancePolicyNumber   String?
  insuranceExpiryDate     DateTime?
  cargoInsuranceLimitCents Int?
  status                  String
  notes                   String?
  equipmentTypes          String[]
  truckCount              Int?
  trailerCount            Int?
  isActive                Boolean (default: true)
  qualificationTier       String?
  tier                    String?
  onTimePickupRate        Decimal?
  onTimeDeliveryRate      Decimal?
  claimsRate              Decimal?
  avgRating               Decimal?
  acceptanceRate          Decimal?
  totalLoadsCompleted     Int?
  performanceScore        Decimal?
  externalId              String?
  sourceSystem            String?
  customFields            Json?
  createdAt               DateTime
  updatedAt               DateTime
  deletedAt               DateTime?
  createdById             String?
  updatedById             String?
  // Relations
  drivers                 OperationsCarrierDriver[]
  trucks                  OperationsCarrierTruck[]
  documents               OperationsCarrierDocument[]
  loadHistory             LoadHistory[]
}
```

### OperationsCarrierDriver (25 fields)
```
OperationsCarrierDriver {
  id                    String (UUID)
  carrierId             String (FK -> OperationsCarrier)
  firstName             String
  lastName              String
  nickname              String?
  isOwner               Boolean?
  phone                 String?
  phoneSecondary        String?
  email                 String?
  address               String?
  city                  String?
  state                 String?
  zip                   String?
  cdlNumber             String?
  cdlState              String?
  cdlClass              String?
  cdlExpiry             DateTime?
  cdlEndorsements       String[]?
  medicalCardExpiry     DateTime?
  emergencyContactName  String?
  emergencyContactPhone String?
  status                String
  notes                 String?
  isActive              Boolean (default: true)
  createdAt             DateTime
  updatedAt             DateTime
  deletedAt             DateTime?
}
```

### OperationsCarrierTruck (33 fields)
```
OperationsCarrierTruck {
  id                    String (UUID)
  carrierId             String (FK -> OperationsCarrier)
  unitNumber            String?
  vin                   String?
  licensePlate          String?
  licensePlateState     String?
  year                  Int?
  make                  String?
  model                 String?
  truckTypeId           String?
  category              String?
  customTypeDescription String?
  deckLengthFt          Decimal?
  deckWidthFt           Decimal?
  deckHeightFt          Decimal?
  maxCargoWeightLbs     Int?
  axleCount             Int?
  hasTarps              Boolean?
  hasChains             Boolean?
  hasStraps             Boolean?
  coilRacks             Boolean?
  loadBars              Boolean?
  ramps                 Boolean?
  registrationExpiry    DateTime?
  annualInspectionDate  DateTime?
  status                String
  assignedDriverId      String? (FK -> OperationsCarrierDriver)
  notes                 String?
  isActive              Boolean (default: true)
  createdAt             DateTime
  updatedAt             DateTime
  deletedAt             DateTime?
}
```

### OperationsCarrierDocument (16 fields)
```
OperationsCarrierDocument {
  id                String (UUID)
  carrierId         String (FK -> OperationsCarrier)
  documentType      String
  name              String
  description       String?
  expiryDate        DateTime?
  status            String
  isActive          Boolean (default: true)
  tenantId          String
  externalId        String?
  sourceSystem      String?
  customFields      Json?
  createdById       String?
  updatedById       String?
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
}
```

### Original Module Models (not used by frontend — reference only)

The original `modules/carrier/` uses separate Prisma models: `Carrier` (70 fields), `CarrierContact` (21 fields), `Driver` (31 fields), `InsuranceCertificate` (28 fields), `CarrierDocument`. Key architectural differences:

| Feature | Operations Module | Original Module |
|---------|-------------------|-----------------|
| Insurance | 4 denormalized fields on carrier | Separate `InsuranceCertificate` model with full CRUD |
| Contacts | Not present | `CarrierContact` model (21 fields) |
| FMCSA | Not in module | Full lookup + compliance log + CSA scores |
| Trucks | Full `OperationsCarrierTruck` (33 fields) | Not in module |
| Status Machine | Simple string, no enforcement | PENDING->ACTIVE->INACTIVE/SUSPENDED/BLACKLISTED with rules |

### Driver (31 scalar fields) (Added post-verification)

```
Driver {
  id                      String (UUID, PK)
  tenantId                String (FK → Tenant)
  carrierId               String (FK → Carrier)
  firstName               String @db.VarChar(100)
  lastName                String @db.VarChar(100)
  email                   String? @db.VarChar(255)
  phone                   String? @db.VarChar(50)
  cdlNumber               String? @db.VarChar(50)
  cdlState                String? @db.VarChar(3)
  cdlExpiration            DateTime?
  cdlClass                String? @db.VarChar(5)
  endorsements            String[] @db.VarChar(20)
  status                  String @default("ACTIVE") @db.VarChar(50)
  currentLocationLat      Decimal? @db.Decimal(10,7)
  currentLocationLng      Decimal? @db.Decimal(10,7)
  locationUpdatedAt       DateTime?
  totalLoads              Int @default(0)
  onTimeRate              Decimal? @db.Decimal(5,2)
  avgRating               Decimal? @db.Decimal(3,2)
  preferredLanguage       String @default("en") @db.VarChar(10)
  appUserId               String?
  eldProvider             String? @db.VarChar(50)
  eldDriverId             String? @db.VarChar(100)
  externalId              String?
  sourceSystem            String?
  customFields            Json
  createdAt               DateTime
  updatedAt               DateTime
  deletedAt               DateTime?
  createdById             String?
  updatedById             String?
}
```

**Note:** The Prisma model name is `Driver` (not `CarrierDriver`). Linked to Carrier via `carrierId` FK. Has unique constraint on `[tenantId, carrierId, cdlNumber]`. Relations: `DriverQualificationFile[]`, `SafetyIncident[]`, `SafetyInspection[]`.

### InsuranceCertificate (28 scalar fields) (Added post-verification)

```
InsuranceCertificate {
  id                    String (UUID, PK)
  tenantId              String (FK → Tenant)
  carrierId             String (FK → Carrier)
  insuranceType         String @db.VarChar(50)
  policyNumber          String? @db.VarChar(100)
  insuranceCompany      String @db.VarChar(255)
  coverageAmount        Decimal @db.Decimal(14,2)
  deductible            Decimal? @db.Decimal(12,2)
  effectiveDate         DateTime
  expirationDate        DateTime
  certificateHolderName String? @db.VarChar(255)
  additionalInsured     Boolean @default(false)
  documentUrl           String? @db.VarChar(500)
  status                String @default("ACTIVE") @db.VarChar(50)
  verified              Boolean @default(false)
  verifiedById          String?
  verifiedAt            DateTime?
  expirationNotified30  Boolean @default(false)
  expirationNotified14  Boolean @default(false)
  expirationNotified7   Boolean @default(false)
  createdAt             DateTime
  updatedAt             DateTime
  createdById           String?
  customFields          Json
  deletedAt             DateTime?
  externalId            String?
  sourceSystem          String?
  updatedById           String?
}
```

**Note:** The Prisma model name is `InsuranceCertificate` (not `CarrierInsurance`). Has unique constraint on `[carrierId, insuranceType, policyNumber]`. Includes 3 expiration notification flags (30/14/7 day).

### FmcsaComplianceLog (28 scalar fields) (Added post-verification)

```
FmcsaComplianceLog {
  id                   String (UUID, PK)
  tenantId             String (FK → Tenant)
  carrierId            String (FK → Carrier)
  checkedAt            DateTime
  dotNumber            String? @db.VarChar(20)
  mcNumber             String? @db.VarChar(20)
  authorityStatus      String? @db.VarChar(50)
  commonAuthority      Boolean?
  contractAuthority    Boolean?
  brokerAuthority      Boolean?
  safetyRating         String? @db.VarChar(50)
  outOfService         Boolean?
  driverInspections    Int?
  driverOosRate        Decimal? @db.Decimal(5,2)
  vehicleInspections   Int?
  vehicleOosRate       Decimal? @db.Decimal(5,2)
  fmcsaInsuranceOnFile Boolean?
  fmcsaInsuranceAmount Decimal? @db.Decimal(14,2)
  changesDetected      Json @default("[]")
  rawResponse          Json?
  createdAt            DateTime
  createdById          String?
  customFields         Json
  deletedAt            DateTime?
  externalId           String?
  sourceSystem         String?
  updatedAt            DateTime
  updatedById          String?
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `mcNumber` | Optional, 1-10 digits, unique per tenant | "MC number already registered" |
| `dotNumber` | Optional, 1-8 digits, unique per tenant | "DOT number already registered" |
| MC or DOT | At least one must be provided | "MC number or DOT number is required" |
| `status` | String (operations module — no enum enforcement) | — |
| `performanceScore` | 0-100 Decimal | "Score must be between 0 and 100" |
| Insurance fields | Denormalized on OperationsCarrier — no separate validation | — |
| `carrierType` | String (COMPANY, OWNER_OPERATOR, etc.) | — |
| Nested resources | Parent carrier must exist, belong to tenant, be active | "Carrier not found" |

---

## 10. Status States

### Operations Module (Frontend)
The operations module uses a simple string `status` field with no state machine enforcement. Values observed: ACTIVE, INACTIVE, PENDING, SUSPENDED. No transition rules enforced at the backend level.

### Original Carrier Module (Reference — not used by frontend)
```
PENDING -> ACTIVE (all onboarding requirements met)
ACTIVE -> INACTIVE (voluntary, admin action)
ACTIVE -> SUSPENDED (auto: insurance expired; or manual with reason)
ACTIVE -> BLACKLISTED (admin only, requires reason)
INACTIVE -> ACTIVE (admin reactivate)
SUSPENDED -> ACTIVE (insurance renewed + admin confirmation)
BLACKLISTED -> ACTIVE (ADMIN only, with documented reason)
```

### Insurance Status (Original Module Only)
```
ACTIVE -> EXPIRING_SOON (30 days before expiry, auto)
EXPIRING_SOON -> EXPIRED (on expiry date, auto)
EXPIRED -> ACTIVE (new certificate uploaded + verified)
```

**Note:** Operations module has no insurance status machine — uses denormalized `insuranceExpiryDate` field only.

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| ~~window.confirm() in carrier files~~ | ~~P1 UX~~ | — | **Closed** — no `window.confirm` found in carriers/. BUG-006 regression test exists. |
| ~~Carriers list is 858-line monolith~~ | ~~P1~~ | — | **Closed** — actually 594 LOC with separate columns.tsx and actions-menu. Well-structured, not a monolith. |
| CarrierStatusBadge uses hardcoded colors | P2 Design | `carrier-status-badge.tsx` | Open — needs runtime verification |
| ~~No frontend tests for carrier pages~~ | ~~P1~~ | — | **Closed** — 1 Playwright E2E test + window.confirm regression test exist. |
| Compliance Center not built | P2 | — | Deferred (Phase 2) |
| Insurance auto-suspension job — verify it runs | P1 | `modules/carrier/` | Open — `checkExpiredInsurance()` exists in original module only. No cron trigger found. Operations module has no equivalent. |
| **Dual module architecture — needs consolidation decision** | **P1 Architecture** | Both modules | **Open** — frontend calls `/operations/carriers/` but rich business logic (FMCSA, compliance, insurance tracking, status machine) lives in unused `/carriers/` module. Need decision: merge, deprecate, or intentional split. |

**Previously listed — now resolved:**
- ~~BUG-001: Carrier Detail 404~~ — `carriers/[id]/page.tsx` EXISTS with full tabbed implementation (7/10)
- ~~BUG-002: Load History Detail 404~~ — `load-history/[id]/page.tsx` EXISTS (5/10, needs QS-008 runtime verify)
- ~~No search debounce~~ — debounce IS present in carriers/page.tsx (3 refs found)

---

## 12. Tasks

### Completed (verified by PST-06 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| CARR-003 | Backend unit tests for carrier module | **Done** — 45+ tests passing |
| BUG-006 | Replace window.confirm with ConfirmDialog in carrier files | **Done** — regression test confirms fix |
| CARR-012 | Rewrite hub for Operations module API/models/hooks | **Done** — this hub update |

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| CARR-010 | QA Carrier Detail page (exists, 7/10 — verify tabs at runtime) | S (1h) | Open |
| CARR-011 | QA Load History Detail page (exists, 5/10 — verify at runtime) | S (1h) | Open |
| CARR-015 | Verify CarrierStatusBadge hardcoded colors at runtime | XS (30min) | Open |
| CARR-016 | Verify or implement insurance expiry cron job | S (1-2h) | Open |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| **CARR-013** | **Architectural decision: carrier dual-module consolidation strategy** — decide whether to merge operations/carrier modules, deprecate original, or intentionally keep split (operations = day-to-day, original = onboarding/compliance) | **S (2h)** | **P1** |
| CARR-014 | Evaluate FMCSA/compliance/insurance features for Operations module — original module has rich features frontend doesn't use | S (1h) | P1 |
| CARR-002 | Standardize status colors (use design tokens) | S (1-2h) | P1 |
| CARR-009 | Write additional frontend carrier tests | M (4h) | P1 |
| CARR-004 | Build Carrier Dashboard (KPI cards, compliance timeline) | L (8h) | P2 |
| CARR-005 | Build Compliance Center | L (8h) | P2 |
| CARR-006 | Build Insurance Tracking (expiry alerts) | M (5h) | P2 |
| CARR-007 | Build Carrier Onboarding Wizard (7 steps) | XL (12h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Carrier Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/01-carrier-dashboard.md` |
| Carriers List | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/02-carriers-list.md` |
| Carrier Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/03-carrier-detail.md` |
| Carrier Onboarding | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/04-carrier-onboarding.md` |
| Compliance Center | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/05-compliance-center.md` |
| Insurance Tracking | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/06-insurance-tracking.md` |
| Equipment List | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/07-equipment-list.md` |
| Carrier Scorecard | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/08-carrier-scorecard.md` |
| Lane Preferences | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/09-lane-preferences.md` |
| Carrier Contacts | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/10-carrier-contacts.md` |
| FMCSA Lookup | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/11-fmcsa-lookup.md` |
| Preferred Carriers | Full 15-section | `dev_docs/12-Rabih-design-Process/05-carrier/12-preferred-carriers.md` |

**Gold Standard Reference:** `dev_docs/12-Rabih-design-Process/05-carrier/` — Use Truck Types (`/truck-types`) as the coding gold standard: clean CRUD, inline editing, debounced search, design tokens.

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Carrier Detail page built | Detail EXISTS with 8 tabs, 17 components | Ahead of plan |
| Single carrier module | **TWO modules**: operations (22 endpoints, frontend) + original (50 endpoints, unused) | Architectural divergence |
| Compliance basic | FMCSA lookup + CSA scores implemented (in original module) | Exceeds plan — but in wrong module |
| Preferred carriers = future | qualificationTier + tier fields on OperationsCarrier | Earlier than planned |
| 13 screens planned | 6 built + Truck Types (PROTECTED) | 6 not built (Phase 2) |
| Tests required | 45+ backend tests + 1 E2E + 1 regression | Better than documented |
| Hub documented 9 hooks | 34 hooks actually exist | Hub massively undercounted |
| Hub documented `/carriers/` API | Frontend uses `/operations/carriers/` API | Hub documented wrong module |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId)
- FMCSA/SAFER Web API (carrier lookup — external API, via original module)
- Storage service (document/insurance certificate uploads)
- Communication (email for compliance reminders, insurance expiry alerts)

**Depended on by:**
- TMS Core (carrier assignment to loads, compliance validation before dispatch)
- Accounting (carrier payment terms, settlement calculations)
- Load Board (carrier matching for posted loads)
- Claims (claims history, insurance data for coverage)
- Carrier Portal (carrier's view of their own loads and documents)

**PROTECT LIST:**
- `apps/web/app/(dashboard)/truck-types/page.tsx` — 8/10, DO NOT MODIFY
