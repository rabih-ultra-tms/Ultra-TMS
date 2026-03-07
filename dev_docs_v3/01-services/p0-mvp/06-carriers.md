# Service Hub: Carrier Management (06)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Carrier service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/05-carrier/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/05-carrier.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (6.5/10) |
| **Confidence** | High — re-audited 2026-03-07, pages verified to exist |
| **Last Verified** | 2026-03-07 |
| **Backend** | Production (40 endpoints, all working) |
| **Frontend** | Built — 6 pages exist (list, detail, edit, scorecard, load-history list+detail). 17 components in `components/carriers/`. |
| **Tests** | Partial — 45 backend tests passing (CARR-003 done), 0 frontend |
| **PROTECTED FILE** | `apps/web/app/(dashboard)/truck-types/page.tsx` — Gold standard 8/10 |
| **Active Blockers** | None — BUG-001/BUG-002 were false (pages exist) |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Carrier service definition in dev_docs |
| Design Specs | Done | 13 files, all 15-section |
| Backend — Carriers | Production | `apps/api/src/modules/carrier/` — 2,400 LOC |
| Backend — Contacts | Production | Included in carrier module |
| Backend — Drivers | Production | Included in carrier module |
| Backend — Documents | Production | Included in carrier module |
| Backend — Insurance | Production | Included in carrier module |
| Backend — FMCSA | Production | Integration with SAFER Web |
| Prisma Models | Production | Carrier, CarrierContact, CarrierDriver, CarrierInsurance, CarrierDocument |
| Frontend Pages | Built | 6 pages: list, detail (tabbed), edit, scorecard, load-history list+detail |
| React Hooks | Partial | 7 CRUD hooks + `use-fmcsa`, `use-carrier-scorecard` in `lib/hooks/carriers/` |
| Components | Built | 17 components in `components/carriers/` (overview, insurance, docs, drivers, contacts, trucks, scorecard) |
| Tests | Partial | 45 backend tests green; frontend 0 tests |
| Security | Good | All endpoints: JwtAuthGuard + tenantId |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Carriers List | `/carriers` | Built | 5/10 | 858-line monolith, hardcoded colors. Debounce IS present (3 refs). |
| Carrier Detail | `/carriers/[id]` | Built | 7/10 | Real tabbed implementation: overview, insurance, docs, trucks, drivers, loads, contacts |
| Carrier Create | — | Built (dialog) | 5/10 | Inline dialog on list page — no separate `/carriers/new` route |
| Carrier Edit | `/carriers/[id]/edit` | Built | 6/10 | Edit form with full field set |
| Load History | `/load-history` | Built | 5/10 | List works |
| Load History Detail | `/load-history/[id]` | Built | 5/10 | page.tsx EXISTS — QS-008 to verify at runtime |
| **Truck Types** | `/truck-types` | **PROTECTED** | **8/10** | **Gold standard — DO NOT TOUCH** |
| Carrier Scorecard | `/carriers/[id]/scorecard` | Built | 6/10 | ScoreGauge, performance metrics, tier progression bar |
| Carrier Dashboard | `/carriers/dashboard` | Not Built | — | Phase 2 |
| Compliance Center | `/carriers/compliance` | Not Built | — | Phase 2 |
| Insurance Tracking | `/carriers/insurance` | Not Built | — | Phase 2 |
| Equipment List | `/carriers/[id]/equipment` | Not Built | — | Phase 2 |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/carriers` | CarrierController | Production | List (paginated, filterable by status/type) |
| POST | `/api/v1/carriers` | CarrierController | Production | Create carrier |
| GET | `/api/v1/carriers/:id` | CarrierController | Production | Full detail with contacts, drivers, insurance |
| PUT | `/api/v1/carriers/:id` | CarrierController | Production | Full update |
| PATCH | `/api/v1/carriers/:id` | CarrierController | Production | Partial update |
| DELETE | `/api/v1/carriers/:id` | CarrierController | Production | Soft delete |
| PATCH | `/api/v1/carriers/:id/status` | CarrierController | Production | Status change (PENDING/ACTIVE/INACTIVE/SUSPENDED/BLACKLISTED) |
| GET | `/api/v1/carriers/search` | CarrierController | Production | Search by name/MC#/DOT# |
| PATCH | `/api/v1/carriers/:id/preferred` | CarrierController | Production | Toggle preferred status |
| GET | `/api/v1/carriers/:id/contacts` | CarrierController | Production | Contacts list |
| POST | `/api/v1/carriers/:id/contacts` | CarrierController | Production | Create contact |
| GET | `/api/v1/carriers/:id/contacts/:contactId` | CarrierController | Production | Contact detail |
| PUT | `/api/v1/carriers/:id/contacts/:contactId` | CarrierController | Production | Update contact |
| DELETE | `/api/v1/carriers/:id/contacts/:contactId` | CarrierController | Production | Delete contact |
| GET | `/api/v1/carriers/:id/documents` | CarrierController | Production | Documents list |
| POST | `/api/v1/carriers/:id/documents` | CarrierController | Production | Upload document |
| GET | `/api/v1/carriers/:id/documents/:docId` | CarrierController | Production | Document detail |
| DELETE | `/api/v1/carriers/:id/documents/:docId` | CarrierController | Production | Delete document |
| POST | `/api/v1/carriers/:id/documents/:docId/approve` | CarrierController | Production | Approve document |
| POST | `/api/v1/carriers/:id/documents/:docId/reject` | CarrierController | Production | Reject with reason |
| GET | `/api/v1/carriers/:id/drivers` | CarrierController | Production | Drivers list |
| POST | `/api/v1/carriers/:id/drivers` | CarrierController | Production | Add driver |
| GET | `/api/v1/carriers/:id/drivers/:driverId` | CarrierController | Production | Driver detail |
| PUT | `/api/v1/carriers/:id/drivers/:driverId` | CarrierController | Production | Update driver |
| DELETE | `/api/v1/carriers/:id/drivers/:driverId` | CarrierController | Production | Remove driver |
| GET | `/api/v1/carriers/:id/insurance` | CarrierController | Production | Insurance certificates |
| POST | `/api/v1/carriers/:id/insurance` | CarrierController | Production | Upload certificate |
| GET | `/api/v1/carriers/:id/insurance/:insId` | CarrierController | Production | Certificate detail |
| DELETE | `/api/v1/carriers/:id/insurance/:insId` | CarrierController | Production | Delete certificate |
| GET | `/api/v1/carriers/:id/performance` | CarrierController | Production | Scorecard data |
| GET | `/api/v1/carriers/:id/loads` | CarrierController | Production | Load history per carrier |
| GET | `/api/v1/carriers/compliance/issues` | CarrierController | Production | All compliance issues across carriers |
| GET | `/api/v1/carriers/insurance/expiring` | CarrierController | Production | Expiring certificates (next 30 days) |
| POST | `/api/v1/carriers/fmcsa/lookup` | CarrierController | Production | Lookup by MC#/DOT# via SAFER Web |

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
Built — 17 components in `components/carriers/`:

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
| **TruckTypesPage** | `(dashboard)/truck-types/page.tsx` | **PROTECTED 8/10** |

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useCarriers` | `/carriers` | Yes | Paginated list |
| `useCarrier` | `/carriers/:id` | Yes | Single detail |
| `useCreateCarrier` | POST `/carriers` | Yes | Mutation |
| `useUpdateCarrier` | PATCH `/carriers/:id` | Yes | Mutation |
| `useDeleteCarrier` | DELETE `/carriers/:id` | Yes | Soft delete |
| `useFmcsaLookup` | POST `/carriers/fmcsa/lookup` | Yes | Mutation |
| `useCarrierLoads` | GET `/carriers/:id/loads` | Yes | Load history |
| `useExpiringInsurance` | GET `/carriers/insurance/expiring` | Unknown | May not exist |
| `useCarrierCompliance` | GET `/carriers/compliance/issues` | Unknown | May not exist |

---

## 7. Business Rules

1. **Carrier Onboarding Requirements:** A carrier cannot be set to ACTIVE status until: (1) Valid MC# or DOT# is provided, (2) FMCSA authority is AUTHORIZED, (3) Auto liability insurance ≥ $750,000 is on file, (4) Cargo insurance ≥ $100,000 is on file. All four conditions must be met.
2. **Insurance Expiry Management:** 30-day warning: system flags insurance as expiring soon and emails the carrier contact. On expiry date: carrier status auto-changes to SUSPENDED. Loads cannot be assigned to SUSPENDED carriers.
3. **Carrier Performance Scoring:** Score = (On-time delivery × 40%) + (Claims ratio inverse × 30%) + (Check call compliance × 20%) + (Service quality × 10%). Scale: 0–100. PREFERRED ≥ 85, APPROVED ≥ 70, CONDITIONAL ≥ 50, SUSPENDED < 50.
4. **Status Hierarchy:** BLACKLISTED is permanent and can only be unset by ADMIN with written reason. SUSPENDED is temporary (auto from insurance expiry, or manual). BLACKLISTED carriers cannot be assigned loads under any circumstances.
5. **FMCSA Lookup:** The system auto-verifies MC#/DOT# on carrier creation via `POST /carriers/fmcsa/lookup`. If FMCSA returns invalid or INACTIVE authority, carrier cannot progress past PENDING status. FMCSA data is cached for 24 hours.
6. **Preferred Carrier Program:** PREFERRED carriers appear at the top of carrier selection lists in the Load Planner and Dispatch Board. Preferred status requires manual admin toggle AND a performance score ≥ 85.
7. **Soft Delete:** All carrier records use soft delete. Deleted carriers still appear in load history (for audit purposes) but are excluded from active lists and cannot be assigned to new loads.
8. **CSA Scores:** Carrier Safety and Fitness Electronic Records (SAFER) CSA scores are fetched for compliance. A carrier with a CSA violation in the last 12 months triggers a compliance warning. Scores update when FMCSA lookup is refreshed.

---

## 8. Data Model

### Carrier
```
Carrier {
  id              String (UUID)
  name            String
  mcNumber        String? (unique per tenant)
  dotNumber       String? (unique per tenant)
  status          CarrierStatus (PENDING, ACTIVE, INACTIVE, SUSPENDED, BLACKLISTED)
  isPreferred     Boolean (default: false)
  performanceScore Decimal? (0-100)
  paymentTerms    String? (NET30, QUICK_PAY, etc.)
  contacts        CarrierContact[]
  drivers         CarrierDriver[]
  insurance       CarrierInsurance[]
  documents       CarrierDocument[]
  loads           Load[]
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
  external_id     String?
  custom_fields   Json?
}
```

### CarrierInsurance
```
CarrierInsurance {
  id           String (UUID)
  carrierId    String (FK → Carrier)
  type         InsuranceType (AUTO_LIABILITY, CARGO, GENERAL_LIABILITY, WORKERS_COMP)
  provider     String
  policyNumber String
  coverageAmount Decimal
  expiresAt    DateTime
  documentUrl  String?
  status       InsuranceStatus (ACTIVE, EXPIRING_SOON, EXPIRED)
  tenantId     String
  createdAt    DateTime
  updatedAt    DateTime
}
```

### CarrierDriver
```
CarrierDriver {
  id           String (UUID)
  carrierId    String (FK → Carrier)
  firstName    String
  lastName     String
  licenseNumber String
  licenseState String
  licenseClass String (CDL_A, CDL_B, CDL_C)
  hasHazmat    Boolean (default: false)
  hasTanker    Boolean (default: false)
  status       DriverStatus (ACTIVE, INACTIVE, SUSPENDED)
  tenantId     String
  createdAt    DateTime
  updatedAt    DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `mcNumber` | Optional, 1-10 digits, unique per tenant | "MC number already registered" |
| `dotNumber` | Optional, 1-8 digits, unique per tenant | "DOT number already registered" |
| MC or DOT | At least one must be provided | "MC number or DOT number is required" |
| `status` | IsEnum(CarrierStatus) | "Invalid carrier status" |
| `performanceScore` | 0-100 Decimal | "Score must be between 0 and 100" |
| Insurance `coverageAmount` | Min values per type (750000 for auto, 100000 for cargo) | "Coverage amount below minimum requirement" |
| Insurance `expiresAt` | Must be future date | "Expiry date must be in the future" |
| Carrier for assignment | Status must be ACTIVE + all insurance valid | "Carrier not eligible for load assignment" |

---

## 10. Status States

### Carrier Status Machine
```
PENDING → ACTIVE (all onboarding requirements met)
ACTIVE → INACTIVE (voluntary, admin action)
ACTIVE → SUSPENDED (auto: insurance expired; or manual with reason)
ACTIVE → BLACKLISTED (admin only, requires reason)
INACTIVE → ACTIVE (admin reactivate)
SUSPENDED → ACTIVE (insurance renewed + admin confirmation)
BLACKLISTED → ACTIVE (ADMIN only, with documented reason)
```

### Insurance Status Machine
```
ACTIVE → EXPIRING_SOON (30 days before expiry, auto)
EXPIRING_SOON → EXPIRED (on expiry date, auto)
EXPIRED → ACTIVE (new certificate uploaded + verified)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| window.confirm() used in carrier files | P1 UX | Multiple carrier files | Open |
| Carriers list is 858-line monolith | P1 Maintainability | `carriers/page.tsx` | Open |
| CarrierStatusBadge uses hardcoded colors | P2 Design | `carrier-status-badge.tsx` | Open |
| No frontend tests for carrier pages | P1 | — | Open |
| Compliance Center not built | P2 | — | Deferred |
| Insurance auto-suspension scheduled job — verify it runs | P1 | `apps/api/src/` | Needs verification |

**Previously listed — now resolved:**
- ~~BUG-001: Carrier Detail 404~~ — `carriers/[id]/page.tsx` EXISTS with full tabbed implementation (7/10)
- ~~BUG-002: Load History Detail 404~~ — `load-history/[id]/page.tsx` EXISTS (5/10, needs QS-008 runtime verify)
- ~~No search debounce~~ — debounce IS present in carriers/page.tsx (3 refs found)

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| BUG-006 | Replace window.confirm with ConfirmDialog in carrier files | S (1-2h) | Open |
| CARR-010 | QA Carrier Detail page (exists, 7/10 — verify tabs at runtime) | S (1h) | Open |
| CARR-011 | QA Load History Detail page (exists, 5/10 — verify at runtime) | S (1h) | Open |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CARR-001 | Decompose Carriers list into components (~8 files) | M (4-6h) | P1 |
| CARR-002 | Standardize status colors (use design tokens) | S (1-2h) | P1 |
| CARR-004 | Build Carrier Dashboard (KPI cards, compliance timeline) | L (8h) | P2 |
| CARR-005 | Build Compliance Center | L (8h) | P2 |
| CARR-006 | Build Insurance Tracking (expiry alerts) | M (5h) | P2 |
| CARR-007 | Build Carrier Onboarding Wizard (7 steps) | XL (12h) | P2 |
| CARR-008 | Build Carrier Scorecard page | M (5h) | P2 |
| CARR-009 | Write frontend carrier tests | M (4h) | P1 |

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
| Carrier Detail page built | Detail EXISTS with 7 tabs, 17 components | Ahead of plan |
| Single carrier module | 6 controllers (carrier, contacts, drivers, insurance, docs, FMCSA) | Better modularity |
| Compliance basic | FMCSA lookup + CSA scores implemented | Exceeds plan |
| Preferred carriers = future | Preferred carriers in P0 | Earlier than planned |
| 13 screens planned | 6 built + Truck Types (PROTECTED) | 6 not built (Phase 2) |
| Tests required | 45 backend tests (CARR-003 done), 0 frontend | Backend ahead |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId)
- FMCSA/SAFER Web API (carrier lookup — external API)
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
