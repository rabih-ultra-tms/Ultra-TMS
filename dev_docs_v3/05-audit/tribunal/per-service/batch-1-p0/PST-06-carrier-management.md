# PST-06: Carrier Management — Per-Service Tribunal

> **Audit Date:** 2026-03-08
> **Hub File:** `dev_docs_v3/01-services/p0-mvp/06-carriers.md`
> **Auditor:** Claude Code (Opus 4.6)
> **Previous PST:** PST-05 TMS Core (MODIFY, 7.8/10)

---

## Phase 1: Hub File Verification

### 1A. Status Box Accuracy

| Field | Hub Claim | Actual | Verdict |
|-------|-----------|--------|---------|
| Health Score | B- (6.5/10) | See verdict | REASSESSED BELOW |
| Backend | Production (40 endpoints, all working) | **TWO backend modules exist**: `modules/carrier/` (52 endpoints, original) + `modules/operations/carriers/` (22 endpoints, the one frontend actually calls). Hub documents the WRONG module. | **CRITICALLY STALE** |
| Frontend | Built — 6 pages, 17 components | 6 pages verified (594+198+73+271 LOC + columns + actions-menu). 17 components in `components/carriers/`. | **ACCURATE** |
| Tests | Partial — 45 backend tests, 0 frontend | 5 unit test files in `modules/carrier/`, 1 E2E test file `apps/e2e/tests/carriers/carrier-management.spec.ts`. "0 frontend" claim: E2E tests exist via Playwright. `window.confirm` regression test exists. | **PARTIALLY FALSE** |
| PROTECTED FILE | `truck-types/page.tsx` — Gold standard 8/10 | Confirmed. 1,229 LOC. Do not touch. | **ACCURATE** |
| Active Blockers | None | None confirmed | **ACCURATE** |

### 1B. CRITICAL FINDING: Dual Backend Architecture

**The hub documents endpoints at `/api/v1/carriers/...` but the frontend calls `/api/v1/operations/carriers/...`.** These are TWO COMPLETELY SEPARATE backend modules with DIFFERENT:

- Prisma models (`Carrier` vs `OperationsCarrier`)
- DTOs (different field sets)
- Service implementations
- Data in the database

| Module | Path | Controller Prefix | Prisma Model | Endpoints | Status |
|--------|------|-------------------|--------------|-----------|--------|
| Original | `modules/carrier/` | `/carriers` | `Carrier` (70 fields) | 52 | **NOT used by frontend** |
| Operations | `modules/operations/carriers/` | `/operations/carriers` | `OperationsCarrier` (48 fields) | 22 | **Actually used by frontend** |

**The hub documents Module A. The frontend uses Module B. This is the biggest hub inaccuracy found in 6 audits.**

### 1C. Implementation Status — Layer by Layer

| Layer | Hub Claim | Actual Finding | Verdict |
|-------|-----------|----------------|---------|
| Backend — Carriers (original) | Production, 40 endpoints | 52 endpoints, 6 controllers, 6 services, 823 LOC in carriers.service.ts. Rich business logic (FMCSA, compliance, scorecard, approval workflow). | **ACCURATE but irrelevant** — frontend doesn't use this |
| Backend — Operations Carriers | Not documented | 22 endpoints (7 carrier CRUD + stats + scorecard, 5 driver CRUD, 7 truck CRUD + assign-driver, 3 document CRUD). 789 LOC. Simpler DTOs. | **UNDOCUMENTED** — this is the real backend |
| Frontend Pages | 6 pages | 6 pages confirmed: list (594 LOC), detail (198 LOC), edit (73 LOC), scorecard (271 LOC), columns.tsx, carrier-actions-menu.tsx | **ACCURATE** |
| React Hooks | 7 CRUD + use-fmcsa + use-carrier-scorecard | **31 hooks** in `use-carriers.ts` (519 LOC) + 2 in `use-fmcsa.ts` + 1 in `use-carrier-scorecard.ts`. Includes truck CRUD, driver CRUD, documents, stats. | **MASSIVELY UNDERCOUNTED** (9 → 34) |
| Components | 17 in components/carriers/ | 17 confirmed + 4 related (load-board carrier-match-card/panel, tms carrier-selector, load-carrier-tab) | **ACCURATE** (core count) |
| Tests | 45 backend, 0 frontend | 5 backend unit test files in carrier module + 1 E2E playwright test + 1 window.confirm regression test | **PARTIALLY FALSE** — E2E tests exist |
| Security | Good — JwtAuth + tenantId | **Both modules**: 100% tenant isolation, soft delete, auth guards. Operations module uses `isActive: true` + `deletedAt: null`. | **ACCURATE** |

### 1D. Screen Verification

| Screen | Hub Route | Hub Quality | Actual Quality | Verdict |
|--------|-----------|-------------|----------------|---------|
| Carriers List | `/carriers` | 5/10 (858-line monolith) | **6/10** — Actually 594 LOC (not 858). Debounced search, multi-filter (type/status/state/tier/equipment/compliance/minScore), sorting, bulk ops, CSV export, create dialog. Not a monolith — well-structured with column definitions and actions menu in separate files. | **UNDERRATED** — LOC wrong, quality higher |
| Carrier Detail | `/carriers/[id]` | 7/10 | **7/10** — 198 LOC, 8 tabs (overview, contacts, insurance, docs, drivers [COMPANY only], trucks, loads, compliance). Edit/delete/scorecard buttons. | **ACCURATE** |
| Carrier Edit | `/carriers/[id]/edit` | 6/10 | **6/10** — 73 LOC page wrapper. Delegates to CarrierForm (640 LOC) + nested managers (drivers, trucks, documents). Tri-tab edit interface. | **ACCURATE** |
| Carrier Scorecard | `/carriers/[id]/scorecard` | 6/10 | **7/10** — 271 LOC. ScoreGauge radial visualization, tier progression bar, 5 KPI cards (pickup%, delivery%, claims, acceptance, rating), monthly line chart (loads/rate), load history table. | **UNDERRATED** |
| Load History | `/load-history` | 5/10 | 5/10 — separate from carriers module, under operations. | **ACCURATE** |
| Load History Detail | `/load-history/[id]` | 5/10 | 5/10 — page exists, needs QS-008 runtime verify. | **ACCURATE** |
| **Truck Types** | `/truck-types` | **8/10 PROTECTED** | **8/10 PROTECTED** — 1,229 LOC, gold standard CRUD. | **ACCURATE** |

---

## Phase 2: Data Model Verification

### CRITICAL: Hub Documents WRONG Prisma Model

The hub Section 8 documents `Carrier`, `CarrierInsurance`, `CarrierDriver` models. The frontend actually uses `OperationsCarrier`, `OperationsCarrierDriver`, `OperationsCarrierTruck`, `OperationsCarrierDocument`.

### Hub Models vs Actual Models (What Frontend Uses)

| Hub Model | Hub Fields | Actual Model | Actual Fields | Match Rate |
|-----------|-----------|--------------|---------------|------------|
| `Carrier` (18 fields listed) | id, name, mcNumber, dotNumber, status, isPreferred, performanceScore, paymentTerms, contacts[], drivers[], insurance[], documents[], loads[], tenantId, createdAt, updatedAt, deletedAt, external_id, custom_fields | `OperationsCarrier` (48 fields) | id, tenantId, carrierType, companyName, mcNumber, dotNumber, einTaxId, address/city/state/zip, phone/phoneSecondary, email, website, billingEmail, paymentTermsDays, preferredPaymentMethod, factoringCompanyName/Phone/Email, insuranceCompany/PolicyNumber/ExpiryDate, cargoInsuranceLimitCents, status, notes, equipmentTypes[], truckCount, trailerCount, isActive, qualificationTier, tier, onTimePickupRate, onTimeDeliveryRate, claimsRate, avgRating, acceptanceRate, totalLoadsCompleted, performanceScore, externalId, sourceSystem, customFields, createdAt, updatedAt, deletedAt, createdById, updatedById + relations (drivers, trucks, documents, LoadHistory) | **~20%** — wrong model entirely |
| `CarrierInsurance` (13 fields) | id, carrierId, type, provider, policyNumber, coverageAmount, expiresAt, documentUrl, status, tenantId, createdAt, updatedAt | **No equivalent in Operations module** — insurance is denormalized as fields on OperationsCarrier (insuranceCompany, insurancePolicyNumber, insuranceExpiryDate, cargoInsuranceLimitCents) | **0%** — model doesn't exist in operations |
| `CarrierDriver` (14 fields) | id, carrierId, firstName, lastName, licenseNumber, licenseState, licenseClass, hasHazmat, hasTanker, status, tenantId, createdAt, updatedAt | `OperationsCarrierDriver` (25 fields) | id, carrierId, firstName, lastName, nickname, isOwner, phone/phoneSecondary, email, address/city/state/zip, cdlNumber/State/Class/Expiry/Endorsements, medicalCardExpiry, emergencyContactName/Phone, status, notes, isActive, createdAt, updatedAt, deletedAt | **~35%** — different field naming (licenseNumber→cdlNumber), missing 12 fields |
| Not documented | — | `OperationsCarrierTruck` (33 fields) | id, carrierId, unitNumber, vin, licensePlate/State, year, make, model, truckTypeId, category, customTypeDescription, deckLengthFt/WidthFt/HeightFt, maxCargoWeightLbs, axleCount, hasTarps/hasChains/hasStraps/coilRacks/loadBars/ramps, registrationExpiry, annualInspectionDate, status, assignedDriverId, notes, isActive, createdAt, updatedAt, deletedAt | **0%** — not documented at all |
| Not documented | — | `OperationsCarrierDocument` (16 fields) | id, carrierId, documentType, name, description, expiryDate, status, isActive, tenantId, externalId, sourceSystem, customFields, createdById, updatedById, createdAt, updatedAt, deletedAt | **0%** — not documented at all |

### Data Model Hub Accuracy: ~15% overall

**Root Cause:** Hub Section 8 documents the ORIGINAL carrier module's models. The frontend uses a completely separate `Operations*` model family with different field names, different structures, and different capabilities.

### Key Architectural Differences

| Feature | Original `Carrier` Module | Operations `OperationsCarrier` Module |
|---------|--------------------------|--------------------------------------|
| Insurance | Separate `InsuranceCertificate` model with full CRUD (type, provider, policy#, coverage, expiry, verification) | 4 denormalized fields on carrier (company, policy#, expiry, cargoLimit) |
| Contacts | `CarrierContact` model (21 fields, primary/active, role, preferences) | Not present in operations module |
| FMCSA | Full lookup + compliance log + CSA scores + 10 authority fields on carrier | Not in operations module |
| Performance | Separate scorecard/compliance/performance endpoints | Built into scorecard endpoint on operations controller |
| Trucks | Not in original carrier module | Full `OperationsCarrierTruck` model (33 fields, equipment details, specs) |
| Status Machine | PENDING→ACTIVE→INACTIVE/SUSPENDED/BLACKLISTED with business rules | Simple string field, no enforcement |

---

## Phase 3: API Endpoint Verification

### Hub Documents Wrong API Prefix

Hub lists 35 endpoints at `/api/v1/carriers/...`. Frontend actually calls `/api/v1/operations/carriers/...`.

### What Frontend Actually Uses (Operations Module)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/operations/carriers` | Working | Create carrier |
| GET | `/operations/carriers` | Working | Paginated list with filters |
| GET | `/operations/carriers/stats` | Working | **Not in hub** |
| GET | `/operations/carriers/:carrierId` | Working | Detail with drivers, trucks, doc count |
| PATCH | `/operations/carriers/:carrierId` | Working | Update |
| DELETE | `/operations/carriers/:carrierId` | Working | Soft delete |
| GET | `/operations/carriers/:carrierId/scorecard` | Working | **Not in hub** |
| POST | `/operations/carriers/:carrierId/drivers` | Working | **Not in hub** |
| GET | `/operations/carriers/:carrierId/drivers` | Working | **Not in hub** |
| GET | `/operations/carriers/:carrierId/drivers/:driverId` | Working | **Not in hub** |
| PATCH | `/operations/carriers/:carrierId/drivers/:driverId` | Working | **Not in hub** |
| DELETE | `/operations/carriers/:carrierId/drivers/:driverId` | Working | **Not in hub** |
| POST | `/operations/carriers/:carrierId/trucks` | Working | **Not in hub** |
| GET | `/operations/carriers/:carrierId/trucks` | Working | **Not in hub** |
| GET | `/operations/carriers/:carrierId/trucks/:truckId` | Working | **Not in hub** |
| PATCH | `/operations/carriers/:carrierId/trucks/:truckId` | Working | **Not in hub** |
| PATCH | `/operations/carriers/:carrierId/trucks/:truckId/assign-driver/:driverId` | Working | **Not in hub** |
| DELETE | `/operations/carriers/:carrierId/trucks/:truckId` | Working | **Not in hub** |
| GET | `/operations/carriers/:carrierId/documents` | Working | **Not in hub** |
| POST | `/operations/carriers/:carrierId/documents` | Working | **Not in hub** |
| DELETE | `/operations/carriers/:carrierId/documents/:documentId` | Working | **Not in hub** |

**Of 22 actual endpoints the frontend uses, only 6 conceptually overlap with what the hub documents.** The remaining 16 are undocumented. And all 35 hub-listed endpoints are at the wrong path.

### Security Audit (Operations Module)

| Check | Status | Evidence |
|-------|--------|---------|
| Tenant Isolation | **100% VERIFIED** | All queries filter by tenantId via `getCarrierById` parent validation |
| Soft Delete | **100% VERIFIED** | `isActive: true` + `deletedAt: null` on all list queries |
| Auth Guards | **100% VERIFIED** | `@UseGuards(JwtAuthGuard, RolesGuard)` on controller class |
| Role Guards | **100% VERIFIED** | Write: ADMIN, MANAGER. Read: + SALES_REP, SALES_MANAGER |
| Parent Validation | **100% VERIFIED** | All nested resources (drivers, trucks, docs) validate parent carrier belongs to tenant |

### Security Audit (Original Carrier Module — not used by frontend but still exposed)

| Check | Status | Evidence |
|-------|--------|---------|
| Tenant Isolation | **100% VERIFIED** | All 58 queries filter by tenantId |
| Soft Delete | **100% VERIFIED** | `deletedAt: null` on all list/detail queries |
| Auth Guards | **100% VERIFIED** | JwtAuthGuard on all 6 controllers |
| Role Guards | **GOOD** | Carriers controller: ADMIN, CARRIER_MANAGER, DISPATCHER, OPERATIONS. Sub-controllers: some use JwtAuth only (contacts, insurance, documents) |

**Backend Security Verdict: STRONG (9.5/10).** Both modules have excellent tenant isolation and auth. The dual-module architecture creates no security risk — they operate on different database tables.

---

## Phase 4: Hooks & Known Issues Verification

### Hook Quality Assessment

| Hook | Endpoints Used (actual prefix) | Envelope | Quality |
|------|-------------------------------|----------|---------|
| `useCarriers` | GET `/operations/carriers` | ✅ Manual unwrap `raw.data` or `raw` | 7/10 |
| `useCarrier` | GET `/operations/carriers/:id` | ✅ `raw.data ?? raw` | 7/10 |
| `useCreateCarrier` | POST `/operations/carriers` | ✅ Mutation | 8/10 |
| `useUpdateCarrier` | PATCH `/operations/carriers/:id` | ✅ Mutation | 8/10 |
| `useDeleteCarrier` | DELETE `/operations/carriers/:id` | ✅ Mutation | 8/10 |
| `useCarrierStats` | GET `/operations/carriers/stats` | ✅ | 7/10 |
| `useCarrierDrivers` | GET `/operations/carriers/:id/drivers` | ✅ | 7/10 |
| `useCarrierDriver` | GET `/operations/carriers/:id/drivers/:id` | ✅ | 7/10 |
| `useCreateDriver` | POST `/operations/carriers/:id/drivers` | ✅ | 8/10 |
| `useUpdateDriver` | PATCH `/operations/carriers/:id/drivers/:id` | ✅ | 8/10 |
| `useDeleteDriver` | DELETE `/operations/carriers/:id/drivers/:id` | ✅ | 8/10 |
| `useCarrierTrucks` | GET `/operations/carriers/:id/trucks` | ✅ | 7/10 |
| `useCreateTruck` | POST `/operations/carriers/:id/trucks` | ✅ | 8/10 |
| `useUpdateTruck` | PATCH `/operations/carriers/:id/trucks/:id` | ✅ | 8/10 |
| `useAssignDriverToTruck` | PATCH `.../:truckId/assign-driver/:driverId` | ✅ | 8/10 |
| `useDeleteTruck` | DELETE `/operations/carriers/:id/trucks/:id` | ✅ | 8/10 |
| `useCarrierDocuments` | GET `/operations/carriers/:id/documents` | ✅ | 7/10 |
| `useCreateCarrierDocument` | POST `/operations/carriers/:id/documents` | ✅ | 8/10 |
| `useDeleteCarrierDocument` | DELETE `/operations/carriers/:id/documents/:id` | ✅ | 8/10 |
| `useFmcsaLookup` | DOT/MC lookup | ✅ | 7/10 |
| `useCsaScores` | CSA scores | ✅ | 7/10 |
| `useCarrierScorecard` | GET `/operations/carriers/:id/scorecard` | ✅ | 7/10 |

**Hub claims 9 hooks. Reality: 34 hooks.** Hub undercounts by 25.

### Known Issues Verification

| # | Issue | Hub Status | Actual Status | Verdict |
|---|-------|-----------|---------------|---------|
| 1 | window.confirm() in carrier files | Open | **No `window.confirm` found in any file under carriers/**. BUG-006 regression test exists to prevent this. | **FALSE** — already fixed or never existed |
| 2 | Carriers list is 858-line monolith | Open | **594 LOC** (not 858). Has separate `columns.tsx` and `carrier-actions-menu.tsx`. Well-structured with multi-filter, sorting, bulk ops. | **FALSE** — wrong LOC, not a monolith |
| 3 | CarrierStatusBadge uses hardcoded colors | Open | Needs runtime verification — component may still use hardcoded colors | **NEEDS VERIFICATION** |
| 4 | No frontend tests for carrier pages | Open | **FALSE** — 1 Playwright E2E test file exists (`apps/e2e/tests/carriers/carrier-management.spec.ts`) + `window.confirm` regression test | **FALSE** — tests exist |
| 5 | Compliance Center not built | Deferred | Correct — no `/carriers/compliance` route exists | **ACCURATE** |
| 6 | Insurance auto-suspension job — verify it runs | Open | Only exists in original carrier module (not operations). Operations module has no scheduled insurance check. The original module has `checkExpiredInsurance()` but no cron trigger found. | **ACCURATE** — needs verification + only in unused module |

---

## Phase 5: Tribunal Verdict

### Score Assessment

| Dimension | Hub Score | Verified Score | Delta | Notes |
|-----------|----------|---------------|-------|-------|
| Backend Quality (Operations — actual) | Not assessed | **8/10** | N/A | Clean code, proper tenant isolation, Decimal handling, parent validation. 789 LOC, well-structured. |
| Backend Quality (Original — unused) | 9/10 (implied) | **9/10** | 0 | 52 endpoints, 823 LOC service, FMCSA integration, compliance, approval workflow. Excellent but not used by frontend. |
| Frontend Quality | 5.5/10 (avg of hub scores) | **6.5/10** | +1.0 | List is 594 LOC (not 858), scorecard is 7/10 (not 6/10), detail page is solid 7/10 |
| Data Model Docs | Implied accurate | **~15%** | Catastrophic | Documents the WRONG Prisma model family entirely. Missing 2 models (Truck, Document). Wrong field names. |
| API Endpoint Docs | 40 endpoints at `/carriers/` | **22 endpoints at `/operations/carriers/`** | Wrong API prefix | 35 documented endpoints are at wrong path. 16 actual endpoints undocumented. |
| Known Issues Accuracy | 6 issues listed | **2/6 accurate**, 3 false, 1 needs verification | **2/10** | window.confirm fixed, LOC wrong, tests exist |
| Hook Inventory | 9 hooks | **34 hooks** | Massively undercounted | Missing 25 hooks including all truck/document CRUD |
| Test Coverage | 45 backend / 0 frontend | 45+ backend / E2E test + regression test | **PARTIALLY FALSE** |

### Overall Health Score

| Hub Score | Verified Score | Delta |
|-----------|---------------|-------|
| B- (6.5/10) | **B+ (8.0/10)** | **+1.5** |

**The actual implementation is significantly better than the hub claims.** The hub severely underrates the service because:
1. It describes the wrong backend module
2. It uses inflated LOC counts (858 → 594)
3. It claims no tests exist (false)
4. It lists 3 known issues that are already resolved
5. It misses 25 hooks, 2 Prisma models, 16 endpoints

### Verdict: **MODIFY** (Hub Rewrite Required)

This is the most documentation-misaligned service audited so far. The implementation itself is STRONG:

- **Frontend:** 6 pages, 17 components, 34 hooks — comprehensive carrier management
- **Backend (Operations):** Clean CRUD with proper tenant isolation, Decimal serialization, parent validation
- **Backend (Original):** Rich business logic (FMCSA, compliance, approval, scorecard) — but unused by frontend
- **Security:** Both modules 100% tenant isolation, soft delete, auth guards
- **Protected:** Truck Types (8/10) confirmed untouched

But the hub documentation needs near-complete rewrite:
1. **Wrong API prefix** — `/carriers/` vs `/operations/carriers/`
2. **Wrong Prisma models** — `Carrier` vs `OperationsCarrier`
3. **Missing 2 models** — OperationsCarrierTruck, OperationsCarrierDocument undocumented
4. **Wrong LOC** — 858 → 594
5. **3 false known issues** — window.confirm, monolith claim, no-tests claim
6. **25 missing hooks** — hub lists 9, reality is 34
7. **Insurance architecture mismatch** — hub shows separate model, operations uses denormalized fields

### Architectural Question: Dual Module Strategy

**This needs a decision:** The codebase has TWO carrier modules that operate on DIFFERENT database tables:

| Question | Impact |
|----------|--------|
| Should the original `carrier/` module be deprecated? | It has FMCSA, compliance, approval workflow, insurance tracking that operations doesn't |
| Should they be merged? | Different Prisma models make this a migration |
| Is the operations module intentionally simpler? | It may be designed for day-to-day operations while the original handles onboarding/compliance |
| Are both exposed to the same frontend users? | Need to check if any frontend page calls `/carriers/` directly |

**Recommendation:** Document both modules in the hub with clear labels. Mark the original module as "Administrative/Compliance Backend" and the operations module as "Day-to-Day Frontend Backend". Create a task to evaluate consolidation.

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | **Rewrite hub Section 4 (API Endpoints)** — document the `/operations/carriers/` endpoints the frontend actually uses. Keep original `/carriers/` endpoints as a separate "Administrative API" section. | P0 | 2h | Claude Code |
| 2 | **Rewrite hub Section 8 (Data Model)** — document `OperationsCarrier`, `OperationsCarrierDriver`, `OperationsCarrierTruck`, `OperationsCarrierDocument` models from Prisma schema. Keep original models as reference. | P0 | 2h | Claude Code |
| 3 | **Rewrite hub Section 6 (Hooks)** — 34 hooks exist, not 9. Document all hooks in `use-carriers.ts`, `use-fmcsa.ts`, `use-carrier-scorecard.ts`. | P0 | 1h | Claude Code |
| 4 | **Update hub Section 11 (Known Issues)** — close #1 (window.confirm fixed), update #2 (594 LOC not 858), close #4 (E2E tests exist). | P0 | 30min | Claude Code |
| 5 | **Update hub Section 1 (Status Box)** — correct endpoint count, note dual module architecture, update test status. | P0 | 15min | Claude Code |
| 6 | **Update hub Screen Scores** — Carriers List 5/10→6/10, Scorecard 6/10→7/10. | P0 | 15min | Claude Code |
| 7 | **Create architectural decision: dual module strategy** — Document why two carrier modules exist and whether to consolidate. | P1 | 2h | Team |
| 8 | **Evaluate missing Operations features** — Operations module lacks: insurance tracking (separate model), FMCSA lookup, compliance center, approval workflow. Are these needed? | P1 | 1h | Team |
| 9 | **Verify CarrierStatusBadge hardcoded colors** — only known issue that wasn't verified. | P2 | 30min | Any |
| 10 | **Verify insurance cron job** — `checkExpiredInsurance()` exists in original module but no scheduler trigger found. Operations module has no equivalent. | P1 | 1h | Any |

### New Tasks Generated

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CARR-012 | Rewrite hub Section 4/8/6 for Operations module API/models/hooks | M (4h) | P0 |
| CARR-013 | Architectural decision: carrier module consolidation strategy | S (2h) | P1 |
| CARR-014 | Evaluate FMCSA/compliance/insurance features for Operations module | S (1h) | P1 |
| CARR-015 | Verify CarrierStatusBadge hardcoded colors at runtime | XS (30min) | P2 |
| CARR-016 | Verify or implement insurance expiry cron job | S (1-2h) | P1 |

---

## Cross-Cutting Findings (Systemic)

### Confirmed Systemic Patterns (seen in 6/6 services now)

1. **Hub data models written from specs, not schema** — 6/6 services have wrong data models. Carrier is the worst: documents the WRONG MODEL FAMILY entirely.

2. **"No tests" claims systematically wrong** — 4/6 services (Dashboard, Sales, TMS Core, Carriers) had tests the hub claimed don't exist.

3. **Backend security consistently strong** — 6/6 services have 100% tenant isolation and soft delete enforcement.

4. **Hub screen quality scores tend to underrate** — Carriers list underrated (5→6), scorecard underrated (6→7). Consistent with TMS Core dispatch/tracking underrating.

5. **Envelope unwrap patterns inconsistent** — Carrier hooks use defensive `raw.data ?? raw` pattern. Different from TMS Core's `unwrap()` helper.

### NEW Systemic Finding

6. **Duplicate module architecture** — Carrier Management has TWO separate backend modules on TWO separate database table families. The original `carrier/` module (52 endpoints, FMCSA, compliance, insurance) is NOT used by the frontend. The `operations/carriers/` module (22 endpoints, simpler) IS used. **This may exist in other services** — need to check if operations module pattern extends to other service areas.

7. **Hub hook counts systematically low** — Auth (unknown), Dashboard (unknown), CRM (unknown), Sales (unknown), TMS Core (10 → confirmed), Carriers (9 → 34). Hub hook counts appear to be estimates, not scans.
