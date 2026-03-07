# Service Hub: Carrier Management (06)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Carrier service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/05-carrier/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/05-carrier.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D+ (4.0/10) |
| **Confidence** | High — audited Feb 2026, 45 carrier tests passing |
| **Last Verified** | 2026-03-07 |
| **Backend** | Production (40 endpoints, all working) |
| **Frontend** | Partial — 2 P0 404s blocking all carrier workflows |
| **Tests** | Partial — 45 backend tests passing (CARR-003 done) |
| **PROTECTED FILE** | `apps/web/app/(dashboard)/truck-types/page.tsx` — Gold standard 8/10 |
| **Active Blockers** | BUG-001 (Carrier Detail 404), BUG-002 (Load History Detail 404) |

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
| Frontend Pages | Partial | List works (858-line monolith), Detail 404, Load History Detail 404 |
| React Hooks | Partial | Basic CRUD hooks; compliance hooks missing |
| Components | Partial | StatusBadge (hardcoded colors), Form (window.confirm), Detail (missing) |
| Tests | Partial | 45 backend tests green; frontend 0 tests |
| Security | Good | All endpoints: JwtAuthGuard + tenantId |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Carriers List | `/carriers` | Built | 5/10 | 858-line monolith, hardcoded colors, no search debounce |
| Carrier Detail | `/carriers/[id]` | Built | 6/10 | Real implementation: overview, insurance, docs, trucks, drivers, loads, contacts tabs |
| Carrier Create | — | Built (dialog) | 5/10 | Inline dialog on list page — no separate `/carriers/new` route |
| Carrier Edit | `/carriers/[id]/edit` | Built | 5/10 | Edit form with full field set |
| Load History | `/load-history` | Built | 5/10 | List works; detail page exists but quality TBD |
| Load History Detail | `/load-history/[id]` | Built | 4/10 | page.tsx exists — QS-008 to verify at runtime |
| **Truck Types** | `/truck-types` | **PROTECTED** | **8/10** | **Gold standard — DO NOT TOUCH** |
| Carrier Scorecard | `/carriers/[id]/scorecard` | Built | 5/10 | Real implementation with ScoreGauge, charts, tier progression |
| Carrier Dashboard | `/carriers/dashboard` | Not Built | — | Phase 2 |
| Compliance Center | `/carriers/compliance` | Not Built | — | Phase 2 |
| Insurance Tracking | `/carriers/insurance` | Not Built | — | Phase 2 |
| Equipment List | `/carriers/[id]/equipment` | Not Built | — | Phase 2 |
| Preferred Carriers | `/carriers/preferred` | Built | 5/10 | Basic list |

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
| CarriersTable | `components/operations/carriers/carriers-table.tsx` | 5/10 — embedded in monolith | No |
| CarrierForm | `components/operations/carriers/carrier-form.tsx` | 5/10 — window.confirm | No |
| CarrierStatusBadge | `components/operations/carriers/carrier-status-badge.tsx` | 4/10 — hardcoded colors | Yes |
| **TruckTypesPage** | `(dashboard)/truck-types/page.tsx` | **PROTECTED 8/10** | No |
| CarrierDetailCard | N/A | Not Built — causes 404 | No |
| CarrierContactsList | N/A | Not Built | No |
| CarrierDriversList | N/A | Not Built | No |
| CarrierInsuranceList | N/A | Not Built | No |
| CarrierCompliancePanel | N/A | Not Built | No |

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
| **Carrier Detail page returns 404** | **P0 Blocker** | `carriers/[id]/page.tsx` — missing | Open |
| **Load History Detail page returns 404** | **P0 Blocker** | `load-history/[id]/page.tsx` — missing | Open |
| window.confirm() used 7 times | P1 UX | Multiple carrier files | Open |
| No search debounce on Carriers list | P1 Performance | `carriers/page.tsx` | Open |
| Carriers list is 858-line monolith | P1 Maintainability | `carriers/page.tsx` | Open |
| CarrierStatusBadge uses hardcoded colors | P2 Design | `carrier-status-badge.tsx` | Open |
| No frontend tests for carrier pages | P1 | — | Open |
| Compliance Center not built | P2 | — | Deferred |
| Insurance auto-suspension scheduled job — verify it runs | P1 | `apps/api/src/` | Needs verification |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| BUG-001 | Build Carrier Detail Page (tabs: Overview, Contacts, Insurance, Docs, Drivers, Loads) | L (4-6h) | Open |
| BUG-002 | Build Load History Detail Page (tabs: Overview, Stops, Tracking, Docs) | M (3-4h) | Open |
| BUG-006 | Replace window.confirm (7 instances) with ConfirmDialog | S (1-2h) | Open |
| BUG-007 | Add search debounce to Carriers list | S (30m) | Open |

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
| Carrier Detail page built | Carrier Detail is 404 | Regression |
| Single carrier module | 6 controllers (carrier, contacts, drivers, insurance, docs, FMCSA) | Better modularity |
| Compliance basic | FMCSA lookup + CSA scores implemented | Exceeds plan |
| Preferred carriers = future | Preferred carriers in P0 | Earlier than planned |
| 13 screens planned | 4 built (with quality issues), 2 are 404s | 11 not built |
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
