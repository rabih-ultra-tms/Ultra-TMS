# Service 05: Carrier Management

> **Grade:** D+ (4.0/10) | **Priority:** Fix + Refactor | **Phase:** 0 (bugs) + 1-2 (build)
> **Web Prompt:** `dev_docs/11-ai-dev/web-dev-prompts/05-carrier-ui.md`
> **API Prompt:** `dev_docs/11-ai-dev/api-dev-prompts/02-carrier-api.md`
> **Design Specs:** `dev_docs/12-Rabih-design-Process/05-carrier/` (13 files)

---

## Status Summary

Carrier service backend is substantially implemented with 6 services, 6 controllers, ~2,400 LOC covering carriers, contacts, documents, drivers, insurances, and FMCSA integration. Frontend is ~20% complete: Carriers list works but is an 858-line monolith with hardcoded colors and no search debounce. Carrier detail page returns 404 (not built). Load history detail page also returns 404 (cross-service issue). 7 instances of `window.confirm()` should use ConfirmDialog. Truck Types page (adjacent) is gold-standard (8/10) -- use as reference. Grade reflects two blocking P0 404s, monolithic list component, missing compliance features, and poor UX polish. Backend has 40 endpoints -- all production-ready.

---

## Screens

| Screen | Route | Status | Quality | Task ID | Notes |
|--------|-------|--------|---------|---------|-------|
| Carriers List | `/carriers` | Built | 5/10 | BUG-001 | 858-line monolith, hardcoded colors, no debounce |
| **Carrier Detail** | `/carriers/[id]` | **Not Built** | **0/10** | **BUG-001** | **MISSING -- 404 error, blocks all carrier workflows** |
| Carrier Create | `/carriers/new` | Built | 5/10 | BUG-006 | Form works, window.confirm on unsaved |
| Carrier Edit | `/carriers/[id]/edit` | Built | 5/10 | BUG-006 | Shares form with create |
| Load History | `/load-history` | Built | 5/10 | BUG-002 | List works, detail 404 |
| **Load History Detail** | `/load-history/[id]` | **Not Built** | **0/10** | **BUG-002** | **MISSING -- 404 error** |
| Truck Types | `/truck-types` | Built | 8/10 | -- | Gold standard. Clean CRUD with inline editing. |
| Carrier Dashboard | `/carriers/dashboard` | Not Built | -- | -- | Phase 2 |
| Compliance Center | `/carriers/compliance` | Not Built | -- | -- | Phase 2 |
| Insurance Tracking | `/carriers/insurance` | Not Built | -- | -- | Phase 2 |
| Equipment List | `/carriers/[id]/equipment` | Not Built | -- | -- | Phase 2 |
| Carrier Scorecard | `/carriers/[id]/scorecard` | Not Built | -- | -- | Phase 2 |
| Preferred Carriers | `/carriers/preferred` | Built | 5/10 | -- | Basic list |

---

## Backend API

### Carriers (20 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/carriers` | GET/POST | Production | List (paginated) + Create |
| `/api/v1/carriers/:id` | GET/PUT/PATCH/DELETE | Production | Full CRUD |
| `/api/v1/carriers/:id/status` | PATCH | Production | PENDING/ACTIVE/INACTIVE/SUSPENDED/BLACKLISTED |
| `/api/v1/carriers/search` | GET | Production | Search by name/MC#/DOT# |
| `/api/v1/carriers/:id/preferred` | PATCH | Production | Toggle preferred status |
| `/api/v1/carriers/:id/contacts` | GET/POST | Production | List + Create contacts |
| `/api/v1/carriers/:id/contacts/:contactId` | GET/PUT/DELETE | Production | Contact CRUD |
| `/api/v1/carriers/:id/documents` | GET/POST | Production | List + Upload documents |
| `/api/v1/carriers/:id/documents/:docId` | GET/DELETE | Production | Document CRUD |
| `/api/v1/carriers/:id/documents/:docId/approve` | POST | Production | Approve document |
| `/api/v1/carriers/:id/documents/:docId/reject` | POST | Production | Reject with reason |
| `/api/v1/carriers/:id/drivers` | GET/POST | Production | List + Create drivers |
| `/api/v1/carriers/:id/drivers/:driverId` | GET/PUT/DELETE | Production | Driver CRUD |
| `/api/v1/carriers/:id/insurance` | GET/POST | Production | List + Upload certificates |
| `/api/v1/carriers/:id/insurance/:insId` | GET/DELETE | Production | Insurance CRUD |
| `/api/v1/carriers/:id/performance` | GET | Production | Scorecard data |
| `/api/v1/carriers/:id/loads` | GET | Production | Load history per carrier |
| `/api/v1/carriers/compliance/issues` | GET | Production | All compliance issues |
| `/api/v1/carriers/insurance/expiring` | GET | Production | Expiring certificates |
| `/api/v1/carriers/fmcsa/lookup` | POST | Production | Lookup by MC#/DOT# |

---

## Frontend Components

| Component | Path | Quality | Notes |
|-----------|------|---------|-------|
| CarriersTable | `components/operations/carriers/carriers-table.tsx` | 5/10 | Embedded in page monolith, no debounce |
| CarrierForm | `components/operations/carriers/carrier-form.tsx` | 5/10 | Uses window.confirm |
| CarrierDetailCard | N/A | 0/10 | Does not exist (404 on `/carriers/[id]`) |
| CarrierStatusBadge | `components/operations/carriers/carrier-status-badge.tsx` | 4/10 | Hardcoded colors |

---

## Design Specs

| Screen | Spec File | Content Level |
|--------|-----------|---------------|
| Service Overview | `00-service-overview.md` | Overview |
| Carrier Dashboard | `01-carrier-dashboard.md` | Full 15-section |
| Carriers List | `02-carriers-list.md` | Full 15-section |
| Carrier Detail | `03-carrier-detail.md` | Full 15-section |
| Carrier Onboarding | `04-carrier-onboarding.md` | Full 15-section (7-step wizard) |
| Compliance Center | `05-compliance-center.md` | Full 15-section |
| Insurance Tracking | `06-insurance-tracking.md` | Full 15-section |
| Equipment List | `07-equipment-list.md` | Full 15-section |
| Carrier Scorecard | `08-carrier-scorecard.md` | Full 15-section |
| Lane Preferences | `09-lane-preferences.md` | Full 15-section |
| Carrier Contacts | `10-carrier-contacts.md` | Full 15-section |
| FMCSA Lookup | `11-fmcsa-lookup.md` | Full 15-section |
| Preferred Carriers | `12-preferred-carriers.md` | Full 15-section |

---

## Open Bugs

| Bug ID | Title | Severity | File | Impact |
|--------|-------|----------|------|--------|
| **BUG-001** | **Carrier Detail Page 404** | **P0** | `carriers/[id]/page.tsx` | **BLOCKER -- click carrier in list -> 404** |
| **BUG-002** | **Load History Detail Page 404** | **P0** | `load-history/[id]/page.tsx` | **BLOCKER -- click load in history -> 404** |
| BUG-006 | window.confirm() x 7 | P1 | Multiple carrier files | Browser native dialog, no styling |
| BUG-007 | Search debounce missing | P1 | `carriers/page.tsx` | Every keystroke fires API request |
| -- | Carriers list is 858-line monolith | P1 | `carriers/page.tsx` | Impossible to maintain |
| -- | Hardcoded status colors | P2 | CarrierStatusBadge, list | Inconsistent with design system |

---

## Tasks

| Task ID | Title | Phase | Status | Effort |
|---------|-------|-------|--------|--------|
| **BUG-001** | **Build Carrier Detail Page** | **0** | **NOT STARTED** | **L (4-6h)** |
| **BUG-002** | **Build Load History Detail Page** | **0** | **NOT STARTED** | **M (3-4h)** |
| BUG-006 | Replace window.confirm with ConfirmDialog | 0 | NOT STARTED | S (1-2h) |
| BUG-007 | Add search debounce | 0 | NOT STARTED | S (30m) |
| CARR-001 | Decompose Carriers List into components | 2 | NOT STARTED | M (4-6h) |
| CARR-002 | Standardize status colors | 2 | NOT STARTED | S (1-2h) |
| CARR-003 | Carrier Module Tests | 2 | NOT STARTED | M (3-4h) |

---

## Key Business Rules

### Carrier Rating Formula
| Factor | Weight | Metric |
|--------|--------|--------|
| On-time delivery | 40% | Delivered within appointment window |
| Claims ratio | 30% | Claims $ / total revenue $ |
| Communication | 20% | Check call compliance rate |
| Service quality | 10% | Customer feedback score |

**Score = Σ(factor × weight) → 0–100 scale**

### Insurance Minimums
| Type | Minimum | Notes |
|------|---------|-------|
| Auto Liability | $750,000 | Required for all carriers |
| Cargo Insurance | $100,000 | Required for all carriers |
| General Liability | $1,000,000 | Required for hazmat |
| Workers Comp | State minimum | Must have active policy |

### Compliance Validation
| Rule | Detail |
|------|--------|
| **MC/DOT Required** | Must have valid MC# or DOT# to onboard |
| **FMCSA Lookup** | Auto-verify via `POST /api/v1/carriers/fmcsa/lookup` |
| **Authority Status** | Must be ACTIVE (AUTHORIZED) to assign loads |
| **Insurance Expiry** | 30-day warning; auto-suspend if expired |
| **Qualification Tiers** | PREFERRED (score ≥ 85), APPROVED (≥ 70), CONDITIONAL (≥ 50), SUSPENDED (< 50) |

## Key References

| Document | Path | What It Contains |
|----------|------|------------------|
| FMCSA Integration | `dev_docs/06-external/59-integrations-external-apis.md` | SAFER Web lookup, CSA scores |
| Data Dictionary | `dev_docs/11-ai-dev/91-data-dictionary.md` | Carrier, Contact, Insurance schemas |
| Business Rules | `dev_docs/11-ai-dev/92-business-rules-reference.md` | Rating formula, compliance rules |

---

## Dependencies

**Depends on:**
- Auth (user roles, permissions)
- TMS Core (load data for carrier assignment, load history)
- Documents Service (file storage, PDF viewer)
- Communication Service (email for onboarding, compliance reminders)

**Depended on by:**
- TMS Core (carrier assignment to loads, dispatch validation)
- Accounting (carrier payment info, payment terms)
- Load Board (carrier matching for postings)
- Claims (claims history, insurance data)

---

## What to Build Next (Ordered)

### Phase 0 (Blockers -- Week 1)

1. **BUG-001: Build Carrier Detail Page** (4-6h) -- P0. Tabs: Overview, Contacts, Insurance, Documents, Drivers, Loads. Wire to `GET /api/v1/carriers/:id`. Design spec: `03-carrier-detail.md`.

2. **BUG-002: Build Load History Detail Page** (3-4h) -- P0. Cross-service. Tabs: Overview, Stops, Tracking, Documents. Wire to `GET /api/v1/loads/:id`.

3. **BUG-006: Replace window.confirm** (1-2h) -- Replace 7 instances with ConfirmDialog component.

4. **BUG-007: Add search debounce** (30m) -- Use existing `useDebounce` hook. Apply to Carriers List search input.

### Phase 2 (Enhancements -- Weeks 3-4)

5. **CARR-001: Decompose Carriers List** (4-6h) -- Extract into ~8 components. Reference Truck Types page as gold standard.

6. **CARR-002: Standardize status colors** (1-2h) -- Replace hardcoded colors with StatusBadge component.

7. **CARR-003: Carrier Module Tests** (3-4h) -- Write tests for list, detail, form. Target 80%+ coverage.

### Post-MVP Ideas (not in 16-week sprint)

- **Carrier Dashboard** — KPI cards, compliance timeline, recent additions, performance metrics. Design spec: `01-carrier-dashboard.md`.
- **Compliance Center** — Compliance issues list, expiration timeline, FMCSA check trigger. Design spec: `05-compliance-center.md`.
- **Insurance Tracking** — Certificates list with expiry color-coding. Design spec: `06-insurance-tracking.md`.
- **Carrier Onboarding** — 7-step wizard: MC/DOT lookup > Company info > Contacts > Equipment > Insurance > Payment > Review. Design spec: `04-carrier-onboarding.md`.

---

## Reference: Gold Standard Page

**Truck Types** (`truck-types/page.tsx`) scored 8/10:
- Clean CRUD with inline editing
- Proper DataTable with pagination
- Good loading/error/empty states
- No console.logs, no `any` types
- Uses design tokens for colors
- Search has debounce

**Use as template when building other Carrier pages.**
