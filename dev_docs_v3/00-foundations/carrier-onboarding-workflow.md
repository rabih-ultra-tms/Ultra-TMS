# Carrier Onboarding Workflow

> The end-to-end process for qualifying a new carrier
> **Created:** 2026-03-09 | **Source:** PST-06 (Carrier tribunal), PST-25 (Safety tribunal), cross-cutting #14

## Overview

A 3PL must verify carrier qualifications before assigning loads. This is both a business requirement and a regulatory (FMCSA) requirement. Ultra TMS has the backend infrastructure for most steps but a critical architectural split means the onboarding-quality module is NOT what the frontend calls.

## Workflow Steps

### Step 1: Initial Contact & MC Number Collection

- Carrier provides MC/DOT number
- System looks up FMCSA authority status via SAFER Web
- **Implementation:** Safety service (`/safety/fmcsa/lookup`) — 4 endpoints built (PST-25)
- **Backend module:** `apps/api/src/modules/safety/fmcsa/`
- **Status:** STUBBED — `fmcsa-api.client.ts` returns mock data, no real SAFER Web API call is made (PST-25, SAFE-017)
- **Also available at:** Original carrier module (`/carriers/fmcsa/lookup`) — also stubbed, different code path
- **Frontend component:** `components/carriers/fmcsa-lookup.tsx` (Built) — calls carrier module, not safety module

### Step 2: Insurance Verification

- Upload certificate of insurance (COI)
- Verify minimums: auto liability >= $1M, cargo >= $100K, general liability >= $1M
- Set expiry monitoring (auto-suspend on expiry)
- **Implementation (Safety module):** `POST /safety/insurance` — full CRUD + verify + expiring list. Minimum coverage enforcement per type (PST-25, Section 7 Rule 5). 7 endpoints.
- **Implementation (Original carrier module):** Separate `CarrierInsurance` model with full CRUD (type, provider, policy#, coverage, expiry, verification). `checkExpiredInsurance()` method exists but **no cron trigger found** (PST-06, CARR-016).
- **Implementation (Operations carrier module):** 4 denormalized fields on `OperationsCarrier` (insuranceCompany, insurancePolicyNumber, insuranceExpiryDate, cargoInsuranceLimitCents). No separate tracking, no expiry monitoring.
- **Frontend:** Operations module fields are editable in CarrierForm (`components/carriers/carrier-form.tsx`). Safety insurance UI is NOT BUILT.
- **Dual-module issue:** PST-06 documents this architectural split. Insurance data lives in 3 places.

### Step 3: Safety Score Check

- Pull CSA BASICs scores from FMCSA (7 categories)
- Flag carriers above intervention thresholds
- Auto-create SafetyAlert for `CSA_THRESHOLD_EXCEEDED`
- **Implementation:** Safety CSA service (`/safety/csa/:carrierId`) — 3 endpoints (get, history, refresh)
- **Status:** STUBBED — `seededPercentile()` generates deterministic test data, not real FMCSA scores (PST-25, SAFE-018)
- **Frontend component:** `components/carriers/csa-scores-display.tsx` (Built) — calls carrier module hooks, not safety module
- **Scoring engine:** `safety/scoring/scoring.engine.ts` — weighted formula (Authority 20%, Insurance 20%, CSA 25%, Incident 20%, Compliance 10%, Performance 5%). Performance score hardcoded to 80 (SAFE-019).

### Step 4: Document Collection

- W-9 (tax identification)
- Carrier agreement (terms & conditions)
- Quick pay enrollment (optional — 2% fee, $100 minimum per PST-14 Carrier Portal tribunal)
- Driver Qualification Files (8 document types per PST-25: APPLICATION, MVR, PSP, MEDICAL_CARD, DRUG_TEST, ROAD_TEST, CLEARINGHOUSE, EMPLOYMENT_VERIFICATION)
- **Implementation (Operations):** `POST /operations/carriers/:carrierId/documents` — upload works (3 endpoints)
- **Implementation (Safety DQF):** `POST /safety/dqf` — 7 endpoints with compliance check
- **Implementation (Documents service):** `POST /documents/upload` — 20 endpoints (PST-11), but FormData vs @Body() DTO architecture mismatch
- **Missing:** No carrier packet generation (insurance cert + W-9 + carrier agreement as a single downloadable bundle)

### Step 5: Lane & Rate Setup

- Preferred lanes (origin-destination pairs)
- Rate negotiation (per-mile, flat rate, or contract-based)
- Equipment types available
- **Implementation (Operations):** `OperationsCarrier.equipmentTypes` (String[]), no lane preference model
- **Implementation (Contracts):** 58 endpoints, 11 models, 6 enums (PST-15) — full contract management exists but is P2 priority
- **Implementation (Carrier module):** `preferredLanes`, rate negotiation fields on Carrier model
- **Frontend:** Equipment types editable in CarrierForm. No lane preference UI.

### Step 6: Activation & First Load

- Final approval (manual or auto based on qualification score)
- Status -> ACTIVE
- Available for load matching in Dispatch Board and Load Planner
- **Implementation (Operations):** Simple PATCH to status string — no validation rules enforced
- **Implementation (Original carrier):** Status machine PENDING->ACTIVE requires all 4 onboarding conditions met (MC/DOT, FMCSA AUTHORIZED, auto liability >= $750K, cargo >= $100K)
- **Frontend:** Status change via CarrierForm or carrier detail actions menu

## Architectural Note: Dual Carrier Modules

The carrier domain is split across TWO backend modules with DIFFERENT Prisma models (cross-cutting #14):

| Aspect | Operations Module | Original Carrier Module |
| --- | --- | --- |
| **Path** | `apps/api/src/modules/operations/carriers/` | `apps/api/src/modules/carrier/` |
| **Endpoints** | 22 | 52 |
| **Prisma Model** | `OperationsCarrier` (40+ fields) | `Carrier` (70 fields) |
| **Frontend calls it?** | YES — all hooks use `/operations/carriers/` | NO — no frontend page calls `/carriers/` |
| **FMCSA** | Not in module | Full lookup + compliance log + CSA scores |
| **Insurance** | 4 denormalized fields | Separate `CarrierInsurance` model with full CRUD |
| **Status machine** | Simple string, no enforcement | PENDING->ACTIVE->INACTIVE/SUSPENDED/BLACKLISTED with rules |
| **Contacts** | Not present | `CarrierContact` model (21 fields) |
| **Tests** | Included in operations tests | 45+ dedicated unit tests (5 spec files) |

**Recommendation:** ADR needed to decide consolidation strategy (CARR-013). Options:
1. **Merge into Operations** — move FMCSA/compliance/insurance features into operations module
2. **Merge into Original** — redirect frontend to use `/carriers/` endpoints
3. **Intentional split** — operations = day-to-day CRUD, original = onboarding/compliance workflow

## What's Implemented vs Stubbed vs Missing

| Step | Status | Module | Notes |
| --- | --- | --- | --- |
| MC/FMCSA Lookup | Stubbed | Safety + Carrier (both) | Returns mock data, no real SAFER Web API call (PST-25) |
| Insurance Upload | Implemented | Operations (denormalized), Safety (full CRUD), Carrier (full CRUD) | 3 separate implementations, none fully wired to frontend onboarding flow |
| Insurance Expiry Monitoring | Partial | Carrier (method exists, no cron), Safety (events emitted, no consumer) | CARR-016 task open |
| CSA Scores | Stubbed | Safety | Fake percentiles via `seededPercentile()` (PST-25) |
| Document Collection | Partial | Operations (upload works), Safety DQF (compliance check), Documents (arch mismatch) | PST-11 FormData bug |
| Lane Setup | Partial | Contracts (P2), Carrier (fields exist) | No frontend for lane preferences |
| Rate Setup | Partial | Contracts (P2) | Full contract management exists but deferred |
| Activation | Implemented | Operations (no rules), Carrier (with rules) | Frontend uses operations (no enforcement) |
| Carrier Packet Generation | NOT BUILT | -- | Insurance cert + W-9 + agreement bundle needed for compliance |
| Onboarding Wizard UI | NOT BUILT | -- | CARR-007 task (P2, 12h estimated) |

## Related Tasks

| Task ID | Title | Module | Effort | Priority |
| --- | --- | --- | --- | --- |
| CARR-007 | Build Carrier Onboarding Wizard (7 steps) | Frontend | XL (12h) | P2 |
| CARR-013 | Architectural decision: dual-module consolidation | Architecture | S (2h) | P1 |
| CARR-014 | Evaluate FMCSA/compliance features for Operations module | Architecture | S (1h) | P1 |
| CARR-016 | Verify or implement insurance expiry cron job | Backend | S (1-2h) | P1 |
| SAFE-017 | Replace FMCSA API client stub with real SAFER Web integration | Backend | L (8h) | P2 |
| SAFE-018 | Replace CSA seededPercentile with real data | Backend | M (4h) | P2 |
| SAFE-019 | Implement real performance score calculation | Backend | M (4h) | P2 |

## Related Domain Rules

- Rule 46: Active MC/DOT authority required before load assignment
- Rule 47: Minimum insurance requirements ($1M auto, $100K cargo, $1M general)
- Rule 48: Insurance expiry monitoring with auto-suspend
- Rule 49: CSA score threshold requiring manual review
- Rule 11: Carrier must be qualified before load assignment
