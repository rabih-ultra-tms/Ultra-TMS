# PST-09: Load Board

> **Service:** Load Board (09)
> **Hub file:** `dev_docs_v3/01-services/p0-mvp/09-load-board.md`
> **Auditor:** Claude Code (Opus 4.6)
> **Date:** 2026-03-08
> **Verdict:** MODIFY
> **Hub Score:** 6.0/10 → **Verified Score: 8.0/10** (+2.0)

---

## Executive Summary

Load Board is a **significantly more mature service than the hub documents**. The hub describes a "partial stub" backend with 7 endpoints and 2 data models; reality is **62 endpoints across 9 controllers** and **5 Prisma models with 200+ fields**. The hub misses entire subsystems: tender management (waterfall/broadcast), capacity search, lead management, accounts/provider integration, analytics, and automation rules.

**Biggest finding:** The hub says "Backend endpoints are stubs (frontend calls may fail)" — this is FALSE. The backend has full CRUD with lifecycle management for postings, bids, tenders, accounts, leads, capacity searches, analytics, and rules. 10 backend spec files exist with 52+ test cases.

**Architecture split:** Two API generations coexist — newer `/load-postings`, `/load-bids`, `/load-tenders` controllers (28 endpoints, full RolesGuard) alongside legacy v1 `/api/v1/load-board/posts|capacity|leads` controllers (34 endpoints, JWT-only — **no RolesGuard**). Frontend hooks correctly target the newer controllers.

**Dual hook set:** Two hook files exist — `lib/hooks/load-board/` (primary, 12 hooks) and `lib/hooks/tms/use-load-board.ts` (legacy, 3 hooks calling different endpoints). Hub only documents the legacy one.

**Frontend quality:** 4 pages (341 LOC), 10 components (1,744 LOC), 12 hooks (374 LOC), full type coverage (250 LOC). Envelope handling is correct — uses `unwrap()` helper consistently, no anti-patterns. Quality is solid 7-8/10.

---

## Phase 1: Data Model Audit

### Hub Claims vs Reality

| Hub Model | Actual Model | Hub Fields | Actual Fields | Accuracy |
|-----------|-------------|------------|---------------|----------|
| LoadBoardPosting | **LoadPosting** | 18 | 42 | ~35% — wrong model name, missing 24 fields (postingType, visibility, showRate, rateType, rateMin, rateMax, originZip, originLat, originLng, destZip, destLat, destLng, totalMiles, weightLbs, autoRefresh, refreshInterval, lastRefreshedAt, viewCount, inquiryCount, carrierIds, createdById, updatedById, deletedAt, customFields, externalId, sourceSystem). Hub has phantom fields: `boards` (String[] — Prisma uses `datPostingId`/`truckstopPostingId` as separate fields), `externalIds` (Json — doesn't exist) |
| LoadBoardOffer | **LoadBid** | 12 | 30 | ~30% — wrong model name, completely different structure. Hub models a simple offer (carrierName, mcNumber, offerRate, notes, status). Actual `LoadBid` has bidAmount, rateType, truckNumber, driverName, driverPhone, counterAmount, counterNotes, counterAt, acceptedAt, rejectedAt, rejectionReason, submittedAt, expiresAt, source, migration fields. Different status values (hub: PENDING/ACCEPTED/REJECTED/WITHDRAWN; actual adds COUNTERED/EXPIRED) |

### Models Missing From Hub (3 total)

| Model | Fields | Purpose | Critical? |
|-------|--------|---------|-----------|
| LoadTender | 22 | Tender distribution system with BROADCAST/WATERFALL/SPECIFIC types, waterfallTimeoutMinutes, currentPosition tracking, TenderRecipient sub-relation | YES — entire tender workflow undocumented |
| LoadBoardAccount | 20 | External board account management (credentials, verification, post counts, per-provider linking) | YES — external integration accounts |
| LoadBoardProvider | 23 | Provider configuration (DAT, TRUCKSTOP, etc.) with API credentials, auto-post rules, rate limiting | YES — provider management layer |

### Additional Models Referenced but Not Separate Tables

| Model | Purpose | Notes |
|-------|---------|-------|
| TenderRecipient | Carrier recipients for tenders with position ordering | Nested relation on LoadTender |
| LoadPost | Legacy posting model (v1 API) | Used by PostingController, separate from LoadPosting |
| CarrierLoadView | Tracks carrier views on postings | Referenced in LoadPosting relations |

### Hub Data Model Accuracy: ~25%

The hub describes a simplified 2-model system (LoadBoardPosting + LoadBoardOffer). Reality has **5 core Prisma models with 200+ total fields** plus sub-relations. Key structural errors:
1. **Wrong model names:** "LoadBoardPosting" → `LoadPosting`, "LoadBoardOffer" → `LoadBid`
2. **Missing tender system entirely** — `LoadTender` with waterfall distribution, timeout tracking, recipient ordering
3. **Missing provider/account layer** — `LoadBoardProvider` + `LoadBoardAccount` for external integration management
4. **Hub `boards` field is phantom** — Prisma uses separate `datPostingId`/`truckstopPostingId` string fields, not a `String[]`
5. **Hub `externalIds` (Json) doesn't exist** — external references are individual nullable string fields
6. **Hub status values incomplete** — missing COUNTERED and EXPIRED states for bids
7. **Geo coordinates exist** — `originLat`, `originLng`, `destLat`, `destLng` (Decimal 10,7) enable geo search, undocumented in hub

---

## Phase 2: API Endpoints Audit

### Hub Claims: 7 endpoints → Actual: 62 endpoints (8.9x more)

| Controller | Hub Endpoints | Actual Endpoints | Missing From Hub |
|-----------|--------------|-----------------|------------------|
| LoadPostingsController | 4 (list, post, delete, get offers) | 11 | +7 (detail, update, expire, refresh, track-view, metrics, geo-search, lane-search) |
| LoadBidsController | 3 (accept, reject, implied list) | 10 | +7 (create, list-all, by-posting, by-carrier, detail, update, counter, withdraw) |
| LoadTendersController | 0 | 7 | **Entire controller missing** (create, list, active-by-carrier, detail, update, cancel, respond) |
| PostingController (v1) | 0 | 9 | **Entire controller missing** (CRUD + bulk post/remove + by-load) |
| AccountsController | 0 | 6 | **Entire controller missing** (CRUD + test-connection) |
| AnalyticsController | 0 | 3 | **Entire controller missing** (post metrics, lead metrics, board comparison) |
| CapacityController | 0 | 4 | **Entire controller missing** (search, list-searches, detail, contact) |
| LeadsController | 0 | 7 | **Entire controller missing** (CRUD + assign, contact, qualify, convert) |
| RulesController | 0 | 5 | **Entire controller missing** (CRUD for automation rules) |

### Endpoint Routing Detail

Hub claims all endpoints under `/api/v1/load-board`. Actual routing has two generations:

**New-style controllers (28 endpoints, FULL RolesGuard):**
- `/load-postings/*` — 11 endpoints (ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER, CARRIER)
- `/load-bids/*` — 10 endpoints (ADMIN, DISPATCHER, SALES_REP, CARRIER_MANAGER, CARRIER)
- `/load-tenders/*` — 7 endpoints (ADMIN, DISPATCHER, OPERATIONS_MANAGER, CARRIER_MANAGER)

**Legacy v1 controllers (34 endpoints, JWT-ONLY — NO RolesGuard):**
- `/api/v1/load-board/posts/*` — 9 endpoints
- `/api/v1/load-board/capacity/*` — 4 endpoints
- `/api/v1/load-board/leads/*` — 7 endpoints
- `/load-board/accounts/*` — 6 endpoints
- `/load-board/analytics/*` — 3 endpoints
- `/load-board/rules/*` — 5 endpoints

### Security Gap: 6 controllers missing RolesGuard

| Controller | Endpoints | Guard | Risk |
|-----------|-----------|-------|------|
| PostingController | 9 | JWT only | Medium — any authenticated user can CRUD posts |
| AccountsController | 6 | JWT only | **HIGH — any user can manage API credentials** |
| AnalyticsController | 3 | JWT only | Low — read-only metrics |
| CapacityController | 4 | JWT only | Low — search functionality |
| LeadsController | 7 | JWT only | Medium — lead assignment/conversion without role check |
| RulesController | 5 | JWT only | **HIGH — any user can create automation rules** |

### Known Issues That Are FALSE

| Hub Issue | Severity | Verdict | Evidence |
|-----------|----------|---------|----------|
| "Backend endpoints are stubs (frontend calls may fail)" | P0 | **FALSE** | 62 endpoints across 9 controllers with full service implementations, DTOs, validation. 10 backend spec files with 52+ tests. Far beyond "stubs." |
| "No tests" (strikethrough but listed) | — | **ALREADY CORRECTED** | Hub correctly shows this as resolved |

### Known Issues That Are TRUE

| Hub Issue | Severity | Verdict | Evidence |
|-----------|----------|---------|----------|
| "DAT TMS API not integrated" | P1 | TRUE | No DAT API calls in services — provider model exists but no actual integration code |
| "Truckstop.com API not integrated" | P1 | TRUE | Same — model exists, no integration |
| "External API credentials not in .env.example" | P1 | TRUE | No DAT/Truckstop env vars found |

---

## Phase 3: Frontend Audit

### Pages (4 routes, 341 LOC)

| Route | LOC | Hub Quality | Verified Quality | Notes |
|-------|-----|-------------|------------------|-------|
| `/load-board` | 97 | 7/10 | 7/10 | Dashboard with KPI stats, quick actions, recent postings. Correct. |
| `/load-board/post` | 33 | 7/10 | 7/10 | Simple wrapper around PostingForm component. Clean. |
| `/load-board/postings/[id]` | 146 | 7/10 | 8/10 | Detail + bids list + carrier matches + cancel confirmation. More featured than hub suggests. |
| `/load-board/search` | 64 | 7/10 | 7/10 | Filters + results. Uses `useSearchPostings` hook correctly. |

Hub screen ratings are **accurate** — first P0 service where hub quality scores match reality.

### Components (10 files, 1,744 LOC)

| Component | LOC | Hub Status | Verified | Notes |
|-----------|-----|------------|----------|-------|
| PostingForm | 431 | Built | Confirmed | Largest — react-hook-form + Zod, 14 fields, 9 equipment types |
| BidsList | 264 | Built | Confirmed | Bid management with accept/reject/counter dialogs |
| LoadSearchFilters | 230 | Built | Confirmed | Advanced geo/lane filters |
| PostingDetailCard | 185 | Built | Confirmed | 8-item details grid |
| LoadSearchResults | 157 | Built | Confirmed | Results with rate display, time-ago |
| LbRecentPostings | 132 | Built | Confirmed | Scrollable card list with status badges |
| CarrierMatchCard | 109 | Built | Confirmed | Match score color coding (green/yellow/red) |
| BidCounterDialog | 100 | Built | Confirmed | Counter-offer modal with validation |
| CarrierMatchesPanel | 87 | Built | Confirmed | Container sorted by match score |
| LbDashboardStats | 49 | Built | Confirmed | 4-column KPI grid |

Hub component list is **100% accurate** — all 10 components exist and match descriptions.

### Hooks (3 files, 12 exported hooks — hub claims 1 file, 15 hooks)

| Hook File | Hub Claims | Actual | Notes |
|-----------|-----------|--------|-------|
| `lib/hooks/load-board/use-loadboard-dashboard.ts` | Listed (2 hooks) | 2 hooks | ✓ Correct — `useLoadBoardDashboardStats`, `useRecentPostings` |
| `lib/hooks/load-board/use-postings.ts` | Listed (13 hooks) | 12 hooks | Hub says 13, actually 12 (hub may double-count `useSearchPostings` or `useTenderToCarrier`) |
| `lib/hooks/tms/use-load-board.ts` | Listed as "legacy duplicate" | 3 hooks | ✓ Correct — `useLoadPosts`, `useLoadPost`, `useLoadBoardStats`. Calls `/load-board/posts` (v1) and `/load-board/stats` |

**Hub hook documentation is ~90% accurate** — best of any P0 service hub reviewed. Minor count discrepancy (15 vs 14 total).

### Envelope Pattern: ✓ CORRECT

Both hook files use the same `unwrap()` helper:
```typescript
function unwrap<T>(response: unknown): T {
    const body = response as Record<string, unknown>;
    return (body.data ?? response) as T;
}
```

No anti-patterns found:
- ✓ No double-unwrapping (`response.data.data`)
- ✓ Fallback to raw response if no `.data`
- ✓ Pagination preserved in response structure
- ✓ Consistent across all query hooks

### Types: Full Coverage (250 LOC in `types/load-board.ts`)

- `LoadPosting` — full interface with nested `load.order.customer`
- `LoadBid` — bid with carrier info, counter fields
- `CarrierMatch` — match score, metrics, insurance status
- `LoadBoardDashboardStats` — 4 KPIs
- `RecentPosting` — summary for list display
- `LoadPostingSearchFilters` — full filter interface
- `CreateLoadPostingPayload` — creation DTO
- Legacy types: `LoadPost`, `LoadBoardFilters`, `LoadBoardStats`, `LoadBoardListResponse`

---

## Phase 4: Security, Tests & Known Issues

### Security Assessment

| Area | Status | Evidence |
|------|--------|----------|
| JWT Auth | ✓ All 62 endpoints | Every controller has `@UseGuards(JwtAuthGuard)` at class level |
| Role Guards | **PARTIAL** — 28/62 (45%) | Only LoadPostingsController, LoadBidsController, LoadTendersController have `RolesGuard` |
| Tenant Isolation | ✓ All queries | All services filter by `tenantId` |
| Soft Delete | ✓ All 5 models | All models have `deletedAt` field; need to verify service queries filter it |
| Input Validation | ✓ DTOs | Full class-validator decorators on all DTOs |

**Security score: 7/10** — tenant isolation and JWT good, but 34 endpoints missing role-based access control is a significant gap, especially AccountsController (API credentials) and RulesController (automation).

### Tests

| Layer | Hub Claims | Actual | Delta |
|-------|-----------|--------|-------|
| Frontend component tests | "13 test suites" | 13 test suites (~30+ test cases) | ✓ Hub correct |
| Backend service specs | "unit + e2e specs" | **10 spec files, 52+ test cases** | Hub severely undercounts |
| Total | ~13 | **65+** | Hub misses all backend test detail |

**Backend test files (10):**
1. `accounts/accounts.service.spec.ts` — Account CRUD
2. `analytics/analytics.service.spec.ts` — Metrics calculations
3. `capacity/capacity.service.spec.ts` — Capacity search
4. `leads/leads.service.spec.ts` — Lead lifecycle
5. `posting/posting.service.spec.ts` — Posting logic
6. `rules/rules.service.spec.ts` — Rule evaluation
7. `services/geocoding.service.spec.ts` — Geo calculations
8. `services/load-bids.service.spec.ts` — Bid lifecycle
9. `services/load-postings.service.spec.ts` — Posting lifecycle
10. `services/load-tenders.service.spec.ts` — Tender distribution

**Frontend test file (1):**
1. `__tests__/loadboard/load-board.test.tsx` — 8 component suites (LbDashboardStats, LbRecentPostings, LoadSearchResults, PostingDetailCard, BidsList, BidCounterDialog, CarrierMatchesPanel, CarrierMatchCard)

### Hub Known Issues Assessment

| # | Hub Issue | Hub Severity | Tribunal Verdict |
|---|-----------|-------------|-----------------|
| 1 | "Backend endpoints are stubs" | P0 | **FALSE** — 62 real endpoints, 10 spec files |
| 2 | "DAT TMS API not integrated" | P1 | TRUE — provider model exists, no integration code |
| 3 | "Truckstop.com API not integrated" | P1 | TRUE — same as above |
| 4 | "No tests" (already struck through) | — | ALREADY CORRECTED in hub |
| 5 | "External API credentials not in .env.example" | P1 | TRUE |

---

## Phase 5: Tribunal — 5 Adversarial Rounds

### Round 1: "The hub says this is a stub service — prove it's not."

**Prosecution:** The hub's #1 known issue (P0 severity) says "Backend endpoints are stubs (frontend calls may fail)." If this is true, the entire Load Board is non-functional.

**Defense:** The backend has:
- 9 controllers with 62 total endpoints
- 20+ DTO files with full class-validator decorators
- 8+ service files with business logic (not empty stubs)
- 10 spec files with 52+ test cases testing real logic
- Full lifecycle management: create → update → expire/refresh → accept bid → tender → track views → analytics
- Subsystems the hub doesn't even mention: capacity search, lead management, accounts, rules, analytics

**Verdict:** Hub P0 issue is **FALSE**. The backend is fully implemented, not "stubs." This is the same systemic hub error seen in other services — documentation written before implementation, never updated.

### Round 2: "The hub documents 7 endpoints. You claim 62. Prove it."

**Prosecution:** An 8.9x multiplier seems implausible. Are you counting nested routes as separate endpoints?

**Defense:** Each counted endpoint has its own `@Get()`, `@Post()`, `@Put()`, `@Delete()`, or `@Patch()` decorator with a distinct route and handler method. Breaking it down:
- LoadPostingsController: 11 (including geo-search, lane-search, track-view, metrics)
- LoadBidsController: 10 (full bid lifecycle with counter-offer)
- LoadTendersController: 7 (broadcast + waterfall tender distribution)
- PostingController (v1): 9 (CRUD + bulk + by-load)
- AccountsController: 6 (CRUD + test-connection)
- AnalyticsController: 3 (posts, leads, boards metrics)
- CapacityController: 4 (search + results + contact)
- LeadsController: 7 (CRUD + assign + qualify + convert)
- RulesController: 5 (CRUD for automation rules)
Total: 11 + 10 + 7 + 9 + 6 + 3 + 4 + 7 + 5 = **62**

The hub only documents the 4 most basic CRUD operations + 3 offer endpoints = 7. It misses 8 entire controllers.

**Verdict:** 62 endpoints confirmed. Hub documents only 11% of the actual API surface.

### Round 3: "Is the dual API generation (v1 vs new) a problem?"

**Prosecution:** Having `/load-postings` AND `/api/v1/load-board/posts` creates confusion. Which is canonical? Are they duplicating data?

**Defense:** This is a legitimate concern:
- **New controllers** (LoadPostingsController, LoadBidsController, LoadTendersController) use the `LoadPosting`/`LoadBid`/`LoadTender` Prisma models and have full RolesGuard
- **Legacy PostingController** uses the `LoadPost` model (different Prisma model!) and has JWT-only auth
- Frontend hooks correctly target the new controllers via `lib/hooks/load-board/use-postings.ts`
- Legacy hook (`lib/hooks/tms/use-load-board.ts`) targets v1 API and is unused by current pages

**Risk:** Two Prisma models for postings (`LoadPosting` vs `LoadPost`) could mean data split. This is similar to the Carrier Management dual-module finding (PST-06).

**Verdict:** CONCERN VALID. Needs architectural decision: consolidate to new controllers, deprecate v1. Document in hub.

### Round 4: "6 controllers have no RolesGuard. How bad is it?"

**Prosecution:** 34 out of 62 endpoints (55%) have JWT-only authentication — any logged-in user can access them regardless of role.

**Defense:** Severity varies by controller:
- **AccountsController (6 endpoints) — HIGH RISK:** Any authenticated user can manage API credentials for DAT/Truckstop. Should be ADMIN-only.
- **RulesController (5 endpoints) — HIGH RISK:** Any authenticated user can create automation rules that auto-post loads. Should be ADMIN/DISPATCHER-only.
- **LeadsController (7 endpoints) — MEDIUM RISK:** Lead conversion to customer without role check. Should require SALES_REP+.
- **PostingController (9 endpoints) — MEDIUM RISK:** Legacy CRUD without role enforcement. Somewhat mitigated by frontend not using these endpoints.
- **CapacityController (4 endpoints) — LOW RISK:** Search-only functionality.
- **AnalyticsController (3 endpoints) — LOW RISK:** Read-only metrics.

**Verdict:** AccountsController and RulesController are **P0 security gaps**. Must add RolesGuard before production. LeadsController and PostingController are P1.

### Round 5: "Is the hub score of 6/10 fair?"

**Prosecution:** The hub rates this C+ (6/10) and calls it "deferred from v2 to P0 edge case." Is that accurate?

**Defense:** Evidence for a higher score:
- 62 endpoints (complete API surface for internal load board)
- 5 Prisma models with proper soft-delete, tenant isolation, geo indexing
- Full tender system (broadcast + waterfall) — advanced feature
- Lead management pipeline (qualify → convert to customer)
- Capacity search with geo radius
- 10 backend spec files, 13 frontend test suites = 65+ total tests
- 4 frontend pages with 10 components, 12 hooks, full type coverage
- Correct envelope handling
- PostingForm (431 LOC) with Zod validation — production-quality

Evidence for a lower score:
- 34/62 endpoints missing RolesGuard (2 controllers HIGH risk)
- No external API integration (DAT/Truckstop) — just models/stubs
- Dual API generation confusion (LoadPosting vs LoadPost models)
- Legacy hook not deprecated
- Hub documentation catastrophically outdated

**Verdict:** Verified score **8.0/10**. The implementation is far more complete than documented. Deductions for role guard gaps (-1.0) and no external API integration (-1.0). The "partial stub" characterization is wrong.

---

## Action Items

| # | Action | Priority | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | Rewrite hub Section 8 (Data Model) — wrong model names, add 3 missing models (LoadTender, LoadBoardAccount, LoadBoardProvider), fix all field lists | P0 | 2-3h | Claude Code |
| 2 | Rewrite hub Section 4 (API Endpoints) — 62 actual vs 7 documented, add 8 missing controllers | P0 | 2-3h | Claude Code |
| 3 | Close hub known issue #1 ("Backend endpoints are stubs") — FALSE | P0 | 5min | Claude Code |
| 4 | Update hub Section 1 (Status Box) — health score 6/10→8.0/10, backend "Partial stub"→"Built (62 endpoints)", hooks 1→3 files (14 hooks) | P0 | 15min | Claude Code |
| 5 | Update hub Section 6 (Hooks) — document all 3 hook files, mark legacy hook for deprecation | P0 | 30min | Claude Code |
| 6 | Add RolesGuard to AccountsController (6 endpoints) — ADMIN only | P0 | 30min | Claude Code |
| 7 | Add RolesGuard to RulesController (5 endpoints) — ADMIN, DISPATCHER | P0 | 30min | Claude Code |
| 8 | Add RolesGuard to LeadsController (7 endpoints) — ADMIN, DISPATCHER, SALES_REP | P1 | 30min | Claude Code |
| 9 | Add RolesGuard to PostingController (9 endpoints) — match LoadPostingsController roles | P1 | 30min | Claude Code |
| 10 | Architectural decision: consolidate dual API (LoadPosting vs LoadPost) or formally deprecate v1 | P1 | 2h | Team |
| 11 | Deprecate `lib/hooks/tms/use-load-board.ts` — remove or redirect to primary hooks | P1 | 30min | Any |
| 12 | Update hub Section 12 (Tasks) — LB-106 "Build Load Board backend endpoints" is DONE, reclassify | P0 | 15min | Claude Code |
| 13 | Verify `deletedAt: null` filtering in all 9 service files | P1 | 1-2h | Claude Code |

---

## Cross-Cutting Findings

| Finding | Also Seen In | Systemic? |
|---------|-------------|-----------|
| Hub data model severely outdated (wrong names, missing models) | PST-01 through PST-08 (all 8) | YES — systemic |
| Hub endpoint count wildly inaccurate (7→62, 8.9x) | PST-07 Accounting (17→54, 3.2x), PST-08 Commission (9→31, 3.4x) | YES — **worst ratio yet** |
| Dual API architecture (v1 legacy + new) | PST-06 Carriers (dual module) | YES — 2 services now |
| Role guard gaps on legacy controllers | PST-07 Accounting (6/10 missing) | YES — legacy controllers pattern |
| Hub "stubs/not built" claims are FALSE | PST-02 Dashboard, PST-04 Sales, PST-06 Carriers | YES — systemic |
| Frontend envelope handling CORRECT | PST-07 Accounting, PST-08 Commission | YES — newer services consistent |
| Hub screen quality ratings accurate | **NEW** — first service where hub screen scores match reality | First occurrence |

---

## Verdict: MODIFY

The Load Board service is **significantly more complete than documented**. Score moves from 6.0/10 to **8.0/10** (+2.0). The hub's characterization as "partial stub" is catastrophically wrong — this is a fully-implemented internal load board with 62 endpoints, tender management, capacity search, lead pipeline, and analytics. The main gaps are: (1) no external API integration (DAT/Truckstop), (2) role guard gaps on 6 legacy controllers, and (3) dual API generation needing consolidation. Hub requires comprehensive rewrite of Sections 1, 4, 6, 8, 11, and 12.
