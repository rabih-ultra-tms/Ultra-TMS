# PST-04: Sales & Quotes — Per-Service Tribunal

> **Audit Date:** 2026-03-08
> **Hub File:** `dev_docs_v3/01-services/p0-mvp/04-sales-quotes.md`
> **Auditor:** Claude Code (Opus 4.6)
> **Previous PST:** PST-03 CRM / Customers (MODIFY, 7.5/10)

---

## Phase 1: Hub File Verification

### 1A. Status Box Accuracy

| Field | Hub Claim | Actual | Verdict |
|-------|-----------|--------|---------|
| Health Score | C+ (6/10) | See verdict | REASSESSED BELOW |
| Backend | Production (30+ endpoints) | **47 endpoints** across 4 controllers (Quotes 21, RateContracts 12, AccessorialRates 6, SalesPerformance 8) | **STALE** — undercounted by 17 |
| Frontend | Partial — Load Planner PROTECTED (9/10); Quote list basic; others not built | **9+ pages** built: quotes list (9/10), quote detail with tabs, quote create/edit with v2 form (729 LOC), quote-history (9/10), load-history (8.5/10), load-planner (4006 LOC) | **FALSE** — far more built and higher quality than claimed |
| Tests | Minimal — Load Planner has some; Quote list none | **5 backend spec files** (~50 test cases) + **3 frontend test files** (quotes-list, quote-detail, rate-confirmation) | **FALSE** — tests exist across backend and frontend |
| PROTECTED FILE | `load-planner/[id]/edit/page.tsx` — DO NOT TOUCH | Confirmed at 4,006 LOC | **ACCURATE** |

### 1B. Implementation Status — Layer by Layer

| Layer | Hub Claim | Verification | Actual Finding | Verdict |
|-------|-----------|-------------|----------------|---------|
| Backend module | Production, `apps/api/src/modules/sales/` | Glob confirmed | 4 controllers, 4+ services (quotes, rate-contracts, accessorial-rates, sales-performance, rate-calculation), DTOs, specs | **STALE** — hub implies single controller |
| Controllers | "SalesController" (implied 1) | Read all controllers | 4 controllers: Quotes (21 endpoints), RateContracts (12), AccessorialRates (6), SalesPerformance (8) | **STALE** — hub implies single controller |
| Services | Not fully documented | Read all services | quotes.service.ts, rate-contracts.service.ts, accessorial-rates.service.ts, sales-performance.service.ts, rate-calculation.service.ts — 5 services | **MISSING** from hub |
| Frontend pages | "Partial — Load Planner protected, Quote list basic, others not built" | Glob + read | 9+ page files: quotes (list, new, [id], [id]/edit), quote-history, load-history (list, [id]), load-planner/[id]/edit | **FALSE** — most pages built, many at high quality |
| React hooks | "Partial — Quote hooks exist" | Read hook files | 4 hook files: use-quotes.ts (351 LOC, 17 mutations), use-load-planner-quotes.ts (204 LOC, 9 mutations), use-load-history.ts (233 LOC, 9 mutations), use-rate-confirmation.ts (121 LOC) — **35+ mutations total** | **STALE** — massively undercounted |
| Components | 9 listed (4 basic + 5 PROTECTED) | Glob components | **8 non-protected components** in `components/sales/quotes/`: quote-form-v2 (729), quote-rate-section (532), quote-detail-overview (513), quote-stops-builder (328), quote-actions-bar (306), quote-timeline-section (219), quote-versions-section (108), quote-status-badge (27) — **2,762 LOC total** | **STALE** — hub lists basic stubs; actual components are substantial |
| Tests | Minimal | Glob spec/test files | **5 backend specs** (~50 test cases) + **3 frontend tests** (quotes-list, quote-detail, rate-confirmation) | **FALSE** — meaningful coverage exists |

### 1C. Screen Verification

| Screen | Hub Route | Hub Status | Hub Quality | Actual Status | Actual Quality | Verdict |
|--------|-----------|-----------|-------------|---------------|---------------|---------|
| Quote List | `/quotes` | Built | 5/10 "Basic list, no filters" | Built — 262 LOC, search debounce (300ms), status filters, service type filters, stats cards, pagination, bulk actions UI | **9/10** | **FALSE** — much better than claimed |
| Quote Create | `/quotes/new` | Built | 5/10 "Basic form" | Built — 7 LOC wrapper using quote-form-v2 (729 LOC, Zod validation, multi-step) | **8/10** | **FALSE** — substantial form |
| Quote Detail | `/quotes/[id]` | Built | 5/10 "View only" | Built — tabbed view with overview, timeline, versions, notes, actions bar | **8.5/10** | **FALSE** — full featured, not "view only" |
| Quote Edit | `/quotes/[id]/edit` | Built | 4/10 "Incomplete" | Built — uses quote-form-v2 with defaultValues | **8/10** | **FALSE** — complete edit form |
| **Load Planner** | `/load-planner/[id]/edit` | **PROTECTED** | **9/10** | PROTECTED — 4,006 LOC, multi-tab (Route, Cargo, Trucks, Photos, Route Intel, Plan Comparison) | **9/10** (PROTECTED) | **ACCURATE** |
| Quote History | `/quote-history` | Built | 4/10 "window.confirm" | Built — 668 LOC, NO window.confirm (uses ConfirmDialog), search debounce, 6 stats cards, batch delete, responsive cards+table | **9/10** | **FALSE** — window.confirm claim is wrong |
| Load History | `/load-history` | Not in hub | — | Built — 825 LOC, search debounce, stats, inline record form, responsive | **8.5/10** | **MISSING** from hub |
| Load History Detail | `/load-history/[id]` | Not in hub | — | Built — detail page with loading states | **7/10** | **MISSING** from hub |
| Quotes Dashboard | `/quotes/dashboard` | Not Built | — | Not Built | — | **ACCURATE** |
| Rate Tables | `/sales/rate-tables` | Not Built | — | Not Built (backend has 18 endpoints for RateContracts + AccessorialRates) | — | **ACCURATE** (frontend gap) |
| Sales Reports | `/sales/reports` | Not Built | — | Not Built | — | **ACCURATE** |
| Customer Rates | `/sales/customer-rates` | Not Built | — | Not Built | — | **ACCURATE** |
| Quote Templates | `/sales/templates` | Not Built | — | Not Built | — | **ACCURATE** |

**Screens in code NOT in hub:** Load History list and detail pages (2 routes). Quote columns.tsx (276 LOC column definitions).

### 1D. Endpoint Verification

Hub claims ~24 endpoints under a single "SalesController." Actual: **47 endpoints** across 4 controllers.

| Controller | Hub Endpoints | Actual Endpoints | Missing from Hub |
|-----------|--------------|-----------------|-----------------|
| Quotes | 16 (CRUD + actions + stats + PDF + rate tables) | 21 (CRUD + accept/reject/clone/convert/duplicate/send/version/new-version + notes + timeline + stats + PDF + quick + calculate-rate) | quick quote, calculate-rate, duplicate, new-version, notes CRUD, timeline, versions |
| RateContracts | 5 (listed as "rate-tables") | 12 (CRUD + lanes CRUD + find-rate + activate + renew) | 7 endpoints — activate, renew, lanes CRUD, find-rate |
| AccessorialRates | 0 (not mentioned) | 6 (CRUD + seed-defaults) | **Entire controller undocumented** |
| SalesPerformance | 0 (not mentioned) | 8 (quotas CRUD + performance + leaderboard + conversion-metrics + win-loss) | **Entire controller undocumented** |

All controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` at class level with proper `@Roles()` decorators per endpoint. Roles include: ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST.

### 1E. Component & Hook Verification

**Components — Hub claims 9 (4 basic + 5 PROTECTED), actual 8 non-protected + 5 PROTECTED:**

| Hub Component | Exists? | Hub Status | Actual Status | LOC |
|--------------|---------|-----------|---------------|-----|
| QuotesTable | YES (quotes/page.tsx inline) | Basic | Inline in page with columns.tsx (276 LOC) — debounce, filters, stats | Good |
| QuoteForm | Replaced by **quote-form-v2.tsx** | Basic | **729 LOC** — Zod validation, multi-step, equipment buttons, rate integration | Excellent |
| QuoteDetailCard | Replaced by **quote-detail-overview.tsx** | Basic | **513 LOC** — margin color coding (green/amber/red), stops, rate breakdown | Excellent |
| QuoteStatusBadge | YES | Basic | 27 LOC — status badge renderer | Good |
| QuoteHistoryTable | YES (quote-history/page.tsx inline) | Basic | 668 LOC page with ConfirmDialog, batch ops, responsive | Excellent |

**Components NOT in hub (new, substantial):**
- `quote-form-v2.tsx` (729 LOC) — replaces basic QuoteForm
- `quote-rate-section.tsx` (532 LOC) — rate calculation UI
- `quote-detail-overview.tsx` (513 LOC) — replaces QuoteDetailCard
- `quote-stops-builder.tsx` (328 LOC) — stop management with address autocomplete
- `quote-actions-bar.tsx` (306 LOC) — status-driven action visibility with state machine
- `quote-timeline-section.tsx` (219 LOC) — timeline + inline notes
- `quote-versions-section.tsx` (108 LOC) — version comparison

**Hooks — Hub claims 8, actual 35+ mutations across 4 files:**

| Hub Hook | Hub "Envelope Unwrapped?" | Actual | Verdict |
|----------|--------------------------|--------|---------|
| useQuotes | Yes | Custom `unwrap()` function — `(body.data ?? response) as T` | **DIFFERENT** — uses custom unwrap, not `data?.data` |
| useQuote | Yes | Same unwrap pattern | **ACCURATE** |
| useCreateQuote | Yes | Mutation with cache invalidation + toast | **ACCURATE** |
| useUpdateQuote | Yes | PATCH mutation | **ACCURATE** |
| useSendQuote | Yes | POST mutation | **ACCURATE** |
| useAcceptQuote | Yes | POST mutation | **ACCURATE** |
| useLoadPlanner | Yes | Separate hook file (use-load-planner-quotes.ts) — not "internal to page" | **STALE** — it's a proper shared hook |
| useAIExtract | Yes "PROTECTED — internal to page" | **NOT FOUND** as standalone endpoint/hook | **FALSE** — AI extraction may be embedded in Load Planner page logic |

**Hooks NOT in hub (27+ missing):** useQuoteStats, useDeleteQuote, useCloneQuote, useConvertQuote, useQuoteVersions, useQuoteTimeline, useQuoteNotes, useAddQuoteNote, useRejectQuote, useCreateQuoteVersion, useCalculateRate, useLoadPlannerQuotes (list), useLoadPlannerQuote (detail), useLoadPlannerQuotePublic, useLoadPlannerQuoteStats, useCreateLoadPlannerQuote, useUpdateLoadPlannerQuote, useUpdateLoadPlannerQuoteStatus, useDuplicateLoadPlannerQuote, useDeleteLoadPlannerQuote, useLoadHistory, useLoadHistoryItem, useLoadHistoryByCarrier, useSimilarLoads, useLoadHistoryStats, useLaneStats, useCreateLoadHistory, useUpdateLoadHistory, useDeleteLoadHistory.

Note: Sales hooks use a custom `unwrap()` function (unlike CRM's `data?.data` pattern). This is a third envelope handling pattern in the codebase — CRM uses `data?.data`, Sales uses custom `unwrap()`, Load Planner hooks return raw response.

### 1F. Data Model Verification

**Quote model — Hub lists 15 fields, actual has 50+:**

| Hub Claim | Prisma Actual | Verdict |
|-----------|--------------|---------|
| Field: `quoteNumber` (auto-generated Q-{YYYYMM}-{NNN}) | `quoteNumber String @db.VarChar(50)` — no auto-generation format visible in schema | **PARTIAL** — field exists, format may be in service logic |
| Field: `status` (QuoteStatus enum: DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED) | `status String @default("DRAFT") @db.VarChar(50)` — values include DRAFT, SENT, **VIEWED**, ACCEPTED, REJECTED, EXPIRED, **CONVERTED** | **STALE** — missing VIEWED and CONVERTED states |
| Field: `customerId` (FK → Customer) | `companyId String?` (FK → Company) | **FALSE** — wrong field name, nullable |
| Field: `contactId` (FK → Contact) | `contactId String?` | **ACCURATE** |
| Field: `expiresAt` (DateTime) | `validUntil DateTime?` | **FALSE** — different name, nullable |
| Field: `totalRevenue` (Decimal) | `totalAmount Decimal @db.Decimal(12,2)` | **FALSE** — different name |
| Field: `totalCost` (Decimal) | Does not exist on Quote model | **FALSE** — no totalCost field |
| Field: `marginPercent` (Decimal, calculated) | `marginPercent Decimal? @db.Decimal(5,2)` + `marginAmount Decimal? @db.Decimal(12,2)` | **PARTIAL** — exists but nullable |
| Field: `notes` (String?) | `internalNotes String?` + `customerNotes String?` + `specialInstructions String?` | **FALSE** — split into 3 fields |
| Field: `items` (QuoteItem[]) | **QuoteItem model does not exist in Prisma** | **FALSE** — phantom relation |
| Field: `stops` (QuoteStop[]) | QuoteStop relation exists | **ACCURATE** |
| Hub lists 15 fields | Actual model has **50+ fields** | **STALE** — 35+ fields undocumented |

**Missing from hub's Quote model (35+ fields):** version, parentQuoteId, customerName, customerEmail, customerPhone, serviceType, equipmentType, pickupDate, pickupWindowStart/End, deliveryDate, deliveryWindowStart/End, isFlexibleDates, commodity, weightLbs, pieces, pallets, dimensions (Json), isHazmat, hazmatClass, temperatureMin/Max, totalMiles, linehaulRate, fuelSurcharge, accessorialsTotal, marginAmount, currency, rateSource, marketRateLow/Avg/High, validFrom, validUntil, convertedOrderId, convertedAt, sentAt, viewedAt, respondedAt, rejectionReason, internalNotes, customerNotes, specialInstructions, customFields, createdById, updatedById

**QuoteItem model:**
- Hub documents QuoteItem with fields: id, quoteId, type, description, quantity, unitRate, totalAmount, isRevenue
- **QuoteItem model does NOT exist in Prisma schema.** Pricing fields (linehaulRate, fuelSurcharge, accessorialsTotal) are directly on the Quote model.
- **Verdict: FALSE** — hub documents a non-existent model

**QuoteStop model — Hub lists 7 fields, actual has 25+:**

| Hub Claim | Prisma Actual | Verdict |
|-----------|--------------|---------|
| Field: `sequence` (Int) | `stopSequence Int` | **FALSE** — different name |
| Field: `type` (StopType: PICKUP, DELIVERY, INTERMEDIATE) | `stopType String @db.VarChar(20)` | **FALSE** — different name |
| Field: `address` (Json) | Individual fields: addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude | **FALSE** — not a single Json blob |
| Field: `scheduledAt` (DateTime?) | Not found — appointment fields exist: appointmentRequired, earliestTime, latestTime | **FALSE** — different structure |
| Hub lists 7 fields | Actual: **25+ fields** including facilityName, contactName/Phone/Email, milesToNext, customFields, externalId, sourceSystem | **STALE** — 18+ undocumented |

**Models NOT in hub at all:**
- `RateContract` — 20+ fields (contractNumber, effectiveDate, autoRenew, minimumMarginPercent, etc.)
- `ContractLaneRate` — 25+ fields (origin/destination city/state/zip/zone/radius, rateType, rateAmount, volumeMin/Max, etc.)
- `AccessorialRate` — 15+ fields (accessorialType, rateType, rateAmount, appliesToServiceTypes, isDefault, etc.)

**Data model error count: 12+ factual errors + 1 phantom model (QuoteItem).** Confirms cross-cutting finding — hub data models are systemically written from specs, not code.

---

## Phase 2: Code Quality Assessment

### 2A. Security Audit

| Check | Quotes | RateContracts | AccessorialRates | SalesPerformance |
|-------|--------|--------------|-----------------|-----------------|
| `@UseGuards(JwtAuthGuard)` | YES (class level) | YES | YES | YES |
| `@UseGuards(RolesGuard)` + `@Roles()` | YES | YES | YES | YES |
| tenantId filtering (findAll) | YES | YES | YES | YES |
| tenantId filtering (findOne) | YES | YES | YES | YES |
| tenantId on create | YES | YES | YES | YES |
| **tenantId on update** | **NO** — findOne check then `where: { id }` | **NO** — same pattern | **NO** — same pattern | N/A |
| **tenantId on delete** | **NO** — findOne check then `where: { id }` | **NO** — same pattern | **NO** — hard delete with `where: { id }` | N/A |
| `deletedAt: null` on reads | YES | YES | YES | N/A |
| No raw SQL | YES | YES | YES | YES |
| No console.log of sensitive data | YES | YES | YES | YES |
| Input validation via DTOs | YES | YES | YES | YES |
| No hardcoded secrets | YES | YES | YES | YES |

**CRITICAL SECURITY GAP (same as PST-01, PST-03):** All update/delete operations use `findOne(tenantId, id)` verification before the mutation, but the actual Prisma `update()` / `delete()` call only uses `where: { id }` without `tenantId`. Race condition or direct Prisma access could bypass tenant isolation.

**Additional finding:** AccessorialRates uses **hard delete** (`prisma.accessorialRate.delete()`) instead of soft delete. This is the only service in Sales that permanently destroys data.

### 2B. Code Health Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Total backend files | ~20+ | 4 controllers, 5 services, DTOs, 5 specs, module |
| Total backend LOC | ~3,500+ | Quotes service largest |
| Total frontend files | ~28 | 9 pages + 8 components + 4 hooks + columns + types |
| Total frontend LOC | ~6,250 | Load Planner alone is 4,006 LOC |
| Largest backend file | quotes.service.ts | Under threshold but complex |
| Largest frontend file | **load-planner/[id]/edit/page.tsx (4,006 LOC)** | PROTECTED — exceeds 500 LOC threshold by 8x |
| `any` type count (backend) | Low | Mostly in DTOs |
| `any` type count (frontend) | 2 | quotes/page.tsx line 90, quote-form-v2.tsx line 135 |
| `as any` count (frontend) | 2 | Same as above — pagination response shape + field mapping |
| TODO/FIXME count | Low | No critical TODOs found |
| `console.log` count | 0 (backend), minimal (frontend) | Clean |
| `window.confirm` count | **0** | All uses replaced with ConfirmDialog |

### 2C. API Contract Compliance

| Check | Status | Notes |
|-------|--------|-------|
| `{ data: T }` envelope | YES | All service methods return proper structure |
| `{ data: T[], pagination }` for lists | YES | page, limit, total, totalPages present |
| Error responses | Standard NestJS exceptions | HttpException with proper status codes |
| DTOs with class-validator | YES | Decorators across all DTO files |
| Event emission | YES | quotes.service emits events for create, convert, send |

### 2D. Hook Quality

| Check | Status | Notes |
|-------|--------|-------|
| Envelope unwrapping | INCONSISTENT | Quotes: custom `unwrap()`. Load Planner: raw response. Load History: raw with normalization |
| Proper TanStack Query keys | YES | Structured: `['quotes', 'list', params]`, `['quotes', 'detail', id]` etc. |
| Cache invalidation on mutations | YES | All mutations invalidate relevant query keys |
| Error handling | YES | Toast notifications on errors |
| Loading/error states exposed | YES | All pages handle isLoading, error, empty |
| Debouncing | YES | 300ms on quotes page and quote-history page |
| `any` types | 2 instances | Pagination type cast + field mapping |

### 2E. Test Assessment

**Backend (5 spec files, ~50 test cases):**

| Spec File | Test Cases | What's Tested |
|-----------|-----------|--------------|
| quotes.service.spec.ts | ~14 | Quote CRUD, versioning, conversion, PDF generation, state transitions |
| rate-contracts.service.spec.ts | ~15 | Contract CRUD, lane rates, deletion, uniqueness |
| accessorial-rates.service.spec.ts | ~10 | Rate CRUD, seed defaults |
| sales-performance.service.spec.ts | ~10 | Quota CRUD, performance metrics, duplicate prevention |
| rate-calculation.service.spec.ts | ~5 | Rate source priority (CONTRACT > MARKET), minimum margin enforcement |

**Frontend (3 test files):**
- `__tests__/sales/quotes-list.test.tsx` — page render, stats, deletion, cloning, sending, conversion
- `__tests__/sales/quote-detail.test.tsx` — quote number, version badge, status badge, tabs
- `__tests__/tms/rate-confirmation.test.tsx` — loading/error/empty/PDF-loaded states (5 tests, excellent quality)

**Critical test gap:** `quotes.service.spec.ts` expects `BadRequestException` when sending quote without email, but the actual service code doesn't implement this validation. Test expectation exists but code doesn't match.

**Coverage gaps:**
- No security tests (tenant isolation, role enforcement)
- No state machine transition rejection tests (e.g., accepting an already CONVERTED quote)
- No margin enforcement tests at quote creation level
- No quote expiry tests (feature doesn't exist)
- Load Planner page has zero tests (4,006 LOC untested)

---

## Phase 3: Business Logic Verification

### 3A. Business Rules vs Code

| # | Hub Rule | Implemented? | Evidence | Correctly? | Notes |
|---|---------|-------------|----------|-----------|-------|
| 1 | 15% minimum margin enforcement | PARTIAL | `rate-calculation.service.ts` has `DEFAULT_MINIMUM_MARGIN_PERCENT = 15` and `enforceMinimumMargin()` method | **NO** — method exists but is **NEVER CALLED** during quote creation or update | Dead code — margin can be 0% |
| 2 | Quote expiry (7-day default, auto-expire at midnight) | NOT IMPLEMENTED | `validUntil` field exists on Quote model. No cron job or scheduled task found | **NO** — quotes remain in SENT status indefinitely past expiration | P0 gap |
| 3 | Quote-to-order conversion | YES | `quotes.service.ts` `convertToOrder()` creates Order, updates Quote status to CONVERTED, emits event | **YES** — properly implemented with idempotency check (rejects if already CONVERTED) | Hub doesn't mention CONVERTED status |
| 4 | Rate table priority (Customer → Lane → Default) | PARTIAL | `rate-calculation.service.ts` `findContractRate()` queries by companyId + lane | **PARTIAL** — orders by `rateAmount ASC` not by priority. No fallback chain (Customer → Lane → Default). No volume-based escalation despite volumeMin/Max fields | |
| 5 | AI cargo extraction | NOT FOUND | No `/sales/ai/extract-cargo` or `/sales/ai/suggest-rate` endpoints in current controllers | **FALSE** — hub lists 2 AI endpoints that don't exist. AI may be embedded in Load Planner page (PROTECTED) | Phantom endpoints in hub |
| 6 | Quote status machine (DRAFT → SENT → ACCEPTED/REJECTED/EXPIRED) | YES | `quotes.service.ts` accept(), reject(), send() methods with status guards | **PARTIAL** — actual states include VIEWED and CONVERTED (not in hub). EXPIRED state has no enforcement (no expiry job). Guards check `includes()` against allowed source states | |
| 7 | Accessorial charges (fuel surcharge, detention, etc.) | YES | `AccessorialRate` model, `AccessorialRatesController` with 6 endpoints including seed-defaults | **YES** — well-modeled with rateType (PER_HOUR, FLAT, PER_MILE), min/max charges, service type applicability | |
| 8 | Currency: all USD, Decimal type | YES | `currency String @default("USD")`, all amounts use `Decimal @db.Decimal(12,2)` | **YES** — consistent across Quote, RateContract, ContractLaneRate, AccessorialRate | |

### 3B. Validation Rules vs DTOs

| Field | Hub Rule | Actual | Match? |
|-------|---------|--------|--------|
| `customerId` | IsUUID, must exist in tenant | Field is `companyId` — validated | **FALSE** field name |
| `expiresAt` | Must be future date, max 90 days | Field is `validUntil` — no max 90 days check found | **FALSE** field name, **MISSING** 90-day cap |
| `totalRevenue` | Decimal, min $50 | Field is `totalAmount` — no $50 minimum found | **FALSE** field name, **MISSING** minimum |
| `marginPercent` | Min 15% (warn) with override | No validation on DTO or service level | **NOT IMPLEMENTED** — enforceMinimumMargin() never called |
| `stops` | Min 2 (1 pickup + 1 delivery) | QuoteStop validated but no minimum count enforcement found | **NOT VERIFIED** |
| `status transitions` | Only allowed transitions | Enforced in accept/reject/send methods | **ACCURATE** |

### 3C. Status State Machine Verification

**Hub documents:**
```
DRAFT → SENT → ACCEPTED/REJECTED/EXPIRED
```

**Actual implementation:**
```
DRAFT → SENT (via send action)
DRAFT → DELETED (soft delete)
SENT → VIEWED (when customer views — additional state)
SENT/VIEWED → ACCEPTED (accept action)
SENT/VIEWED/ACCEPTED → REJECTED (reject action — note: ACCEPTED can be rejected)
ACCEPTED → CONVERTED (convert-to-order action — additional state)
CONVERTED → (terminal, idempotency check prevents re-conversion)
```

**Differences from hub:**
1. **VIEWED** state exists — not documented
2. **CONVERTED** state exists — not documented
3. **EXPIRED** state — no enforcement mechanism (no cron job)
4. Hub says "REJECTED/EXPIRED → DRAFT (clone and edit)" — clone creates a NEW quote, doesn't change status to DRAFT
5. ACCEPTED → REJECTED is allowed — questionable business logic (accepting then rejecting?)

### 3D. Dependencies Verification

| Direction | Hub Claim | Actual | Verdict |
|-----------|----------|--------|---------|
| Depends on: Auth & Admin | JWT, roles, tenantId | YES — JwtAuthGuard, RolesGuard, @CurrentTenant() | **ACCURATE** |
| Depends on: CRM | Customer lookup, credit status check | YES — Quote has companyId FK to Company. No credit check verified. | **PARTIAL** — no credit status check found |
| Depends on: Carrier Management | Rate tables, carrier lookup | YES — RateContract has companyId; Load Planner references equipment | **ACCURATE** |
| Depends on: Google Maps API | Load Planner | YES — Load Planner page integrates Maps | **ACCURATE** |
| Depends on: OpenAI/Gemini API | AI cargo extraction | NOT VERIFIED — AI endpoints not found in Sales controllers. May be in Load Planner page directly. | **UNKNOWN** |
| Depended on by: TMS Core | Quote → order conversion | YES — convertToOrder creates Order, emits event | **ACCURATE** |
| Depended on by: Accounting | Quote value for revenue | UNVERIFIED — no direct import found | **NEEDS CHECK** |
| Depended on by: Commission | Quote attribution | UNVERIFIED | **NEEDS CHECK** |
| Depended on by: Load Board | Approved quotes → postable loads | UNVERIFIED | **NEEDS CHECK** |

---

## Phase 4: 5-Round Tribunal Debate

### Round 1: Opening Arguments

**PROSECUTION — The Case Against Sales & Quotes**

1. **Hub quality scores are fiction.** The hub rates Quote List at 5/10, Quote Detail at 5/10, Quote Edit at 4/10, and Quote History at 4/10 with "window.confirm." Actual: Quote List is 9/10 with debounce + filters + stats. Quote Detail has tabs with overview/timeline/versions/notes. Quote History is 668 LOC with ConfirmDialog, responsive design, and batch ops. The hub's quality ratings are off by 4-5 points per screen.

2. **Phantom API endpoints.** Hub lists `POST /sales/ai/extract-cargo` and `GET /sales/ai/suggest-rate` as "Production" endpoints. These do not exist in any controller. Two entire controllers (AccessorialRates, SalesPerformance) with 14 endpoints are undocumented. The endpoint section is simultaneously overcounting (phantom AI endpoints) and undercounting (23 real endpoints missing).

3. **QuoteItem model doesn't exist.** Hub's Section 8 documents a QuoteItem model with 8 fields. This model is not in the Prisma schema. The actual Quote model has pricing fields (linehaulRate, fuelSurcharge, accessorialsTotal, totalAmount) directly on the Quote. Any developer building against this will create a non-existent join table.

4. **15% margin enforcement is dead code.** `enforceMinimumMargin()` exists in rate-calculation.service.ts but is never called anywhere. A quote with 0% margin can be created and sent. This directly contradicts Business Rule #1 which states "the system shows a warning and requires dispatcher/manager override with written justification."

5. **No quote expiry mechanism.** Hub describes auto-expiry at midnight. No cron job, no scheduled task, no TTL. The `validUntil` field exists but is never checked. Quotes can remain in SENT status forever, allowing acceptance of expired quotes.

**DEFENSE — The Case For Sales & Quotes**

1. **The codebase far exceeds documentation.** 47 backend endpoints (vs 24 documented). 35+ frontend mutations (vs 8 documented). 8 substantial components totaling 2,762 LOC (vs "4 basic" documented). The hub dramatically underreports what's built. The actual implementation is one of the strongest in the codebase.

2. **Quote-to-order conversion is production-grade.** `convertToOrder()` creates a proper Order with all quote details, sets Quote to CONVERTED status, checks idempotency, and emits events for downstream services. The event system (`this.eventEmitter.emit('quote.converted')`) enables loose coupling with TMS Core, Accounting, and Commission.

3. **Frontend quality is genuinely excellent.** Every page has loading/error/empty states. Search debounce (300ms) on quotes and quote-history. No window.confirm anywhere — all destructive actions use ConfirmDialog. Stats cards with real API data. Responsive design with mobile card views + desktop tables. This is model implementation quality.

4. **Rate system is well-architected.** RateContract + ContractLaneRate + AccessorialRate form a proper rate management system. Lane-level pricing with origin/destination by city/state/zip/zone. Volume tiers (volumeMin/Max). Fuel surcharge configuration. Auto-renew contracts. This exceeds the hub's simple "Rate Tables" description.

5. **State machine works.** The quote-actions-bar.tsx (306 LOC) implements a complete status-driven action visibility system: DRAFT shows [edit, send, clone], SENT shows [clone], VIEWED shows [accept, clone], ACCEPTED shows [convert, clone], etc. Backend enforces valid transitions with proper guards and error messages.

### Round 2: Rebuttal

**PROSECUTION REBUTTAL**

1. Re: "Codebase far exceeds documentation" — A source-of-truth document that underreports by 50% is worse than useless. Sprint planners will allocate 4-6h to build Quote List ("basic, 5/10") when it's already at 9/10. Sprint planners will build tests for Quote flows ("Zero tests") when 50+ exist. This wastes hundreds of hours of development time.

2. Re: "Frontend quality is excellent" — Two `any` type casts exist: `(data as any)?.pagination?.total` in quotes/page.tsx and `const d = detail as any` in quote-form-v2.tsx. The pagination cast reveals an API response shape inconsistency that should be fixed in the hook, not papered over with `any`. Also, the rate-confirmation hook extracts cookies manually from `document.cookie` — an XSS vector.

3. Re: "State machine works" — The state machine allows ACCEPTED → REJECTED (accept a quote, then reject it?). No audit trail exists for state transitions. The EXPIRED state has zero enforcement. And the hub doesn't even document VIEWED or CONVERTED states, so any developer reading the docs will build an incomplete state machine.

4. Re: "Rate system is well-architected" — `findContractRate()` orders by `rateAmount ASC`, not by priority. The hub says "Rates are resolved in priority order: Customer → Lane → Default" but the actual code just picks the cheapest lane rate. Volume tiers (volumeMin/Max) exist in the schema but are never used in queries.

**DEFENSE REBUTTAL**

1. Re: "Phantom AI endpoints" — The hub was written from design specs that included AI features. The Load Planner (PROTECTED, 4006 LOC) likely contains the AI integration inline. The hub should be updated to reflect where AI lives, but this is a documentation error, not a missing feature.

2. Re: "QuoteItem doesn't exist" — The architectural decision to put pricing on the Quote model directly (linehaulRate, fuelSurcharge, accessorialsTotal) is actually cleaner than a separate QuoteItem join table for simple pricing. This is a better design than what was speced. The hub should document the actual, better design.

3. Re: "15% margin is dead code" — The method exists and is tested (`rate-calculation.service.spec.ts`). It's ready to be wired in. The enforcement was likely deferred due to UX concerns (blocking quote creation is disruptive). The infrastructure exists; the policy enforcement is a product decision.

4. Re: "No quote expiry" — True, but `validUntil` is stored, so adding a cron job is a 30-minute task. The data model supports it. This is a missing scheduled task, not a fundamental architecture gap.

5. Re: "Cookie extraction" — The rate-confirmation hook needs raw binary access for PDF generation (blob URL). Standard apiClient may not handle binary responses well. The cookie extraction, while not ideal, is pragmatic for this use case.

### Round 3: Cross-Examination

**Q1: How many of the hub's endpoint claims are accurate?**

Finding: Hub lists 24 endpoints. Of those: ~16 match real endpoints (with different names/paths). 2 are phantom (AI endpoints). 23 real endpoints are undocumented. **Accuracy: ~67% of listed endpoints exist, but 49% of actual endpoints are unlisted.**

**Q2: Can a user from Tenant A modify a Quote belonging to Tenant B?**

Finding: **Same pattern as CRM.** `quotes.service.ts` update method calls `findOne(tenantId, id)` first, then runs `prisma.quote.update({ where: { id } })`. The findOne provides implicit protection in normal flow, but the update WHERE clause doesn't include tenantId. Same for delete, and same pattern in rate-contracts and accessorial-rates services.

**Q3: Are the 7 known issues in Section 11 actually open?**

| Issue | Hub Status | Actual Status | Verdict |
|-------|-----------|--------------|---------|
| Quote list basic — no status filters, no search debounce | Open | **FIXED** — has status filter, service type filter, 300ms debounce | **STALE** |
| Quote history uses window.confirm | Open | **FIXED** — uses ConfirmDialog throughout | **STALE** |
| Quote detail page is view-only stub | Open | **FIXED** — tabbed view with overview, timeline, versions, notes, actions | **STALE** |
| No margin display on Quote list | Open | **NEEDS VERIFICATION** — margin shown in detail but list unclear | **PARTIALLY STALE** |
| Rate Tables UI not built | Open (P2) | Still not built (backend has 18 endpoints ready) | **ACCURATE** |
| Load Planner needs Google Maps API key in .env | Open | Still a docs gap | **ACCURATE** |
| Zero tests for Quote flows | Open | **FALSE** — 5 backend specs + 3 frontend tests | **STALE** |

**At least 4 of 7 issues are stale.** The known issues list is ~57% inaccurate.

**Q4: Does the 15% margin enforcement work end-to-end?**

Finding: **NO.** `enforceMinimumMargin()` exists, is tested in isolation, but is never called in `createQuote()`, `updateQuote()`, or `calculateRate()`. A quote with `marginPercent: 0` can be created, sent, accepted, and converted to an order with no warning or block. The hub claims this is enforced — it is not.

**Q5: Is the quote-to-order conversion reliable?**

Finding: **YES.** `convertToOrder()` in quotes.service.ts:
- Validates quote exists and belongs to tenant
- Checks idempotency (rejects if already CONVERTED)
- Creates Order with all quote details
- Sets convertedOrderId and convertedAt on Quote
- Changes status to CONVERTED
- Emits 'quote.converted' event
- Returns the created Order

This is one of the cleanest cross-service integrations in the codebase.

### Round 4: Evidence Exhibits & Closing Statements

| Exhibit | Source | Key Finding | Favors |
|---------|--------|-------------|--------|
| E1 | Hub §3 | Quote List rated 5/10 — actual has debounce, filters, stats, 9/10 | Defense |
| E2 | Hub §3 | Quote History rated 4/10 "window.confirm" — no window.confirm exists | Defense |
| E3 | Hub §4 | Lists 2 AI endpoints as "Production" — don't exist | Prosecution |
| E4 | Hub §8 | Documents QuoteItem model — doesn't exist in Prisma | Prosecution |
| E5 | Hub §8 | `customerId` field — actual is `companyId` | Prosecution |
| E6 | Hub §8 | `expiresAt` field — actual is `validUntil` | Prosecution |
| E7 | Hub §8 | `totalRevenue` field — actual is `totalAmount` | Prosecution |
| E8 | Hub §11 | "Zero tests" — 50+ backend + 3 frontend test files exist | Defense |
| E9 | `rate-calculation.service.ts` | `enforceMinimumMargin()` never called | Prosecution |
| E10 | `quotes.service.ts` convertToOrder | Clean conversion with events + idempotency | Defense |
| E11 | `quote-actions-bar.tsx` | Status-driven action visibility state machine | Defense |
| E12 | All 4 services | update/delete WHERE uses `{ id }` only | Prosecution |
| E13 | `quote-form-v2.tsx` | 729 LOC with Zod, multi-step — hub says "Basic form" | Defense |
| E14 | All controllers | @UseGuards(JwtAuthGuard, RolesGuard) on all | Defense |
| E15 | `accessorial-rates.service.ts` | Hard delete instead of soft delete | Prosecution |
| E16 | Hub §4 | AccessorialRates (6 endpoints) + SalesPerformance (8 endpoints) = 14 undocumented | Defense (more built) / Prosecution (undocumented) |

**PROSECUTION CLOSING STATEMENT**

Sales & Quotes has the widest gap between documentation and reality of any service audited. The hub claims screens are "basic" (4-5/10) when they're genuinely excellent (8-9/10). It documents phantom models (QuoteItem) and phantom endpoints (AI extraction). It lists known issues that are resolved and misses actual issues (dead margin enforcement, no expiry job, tenant isolation gaps). The field names in the data model section are wrong across 5+ fields. Two entire controllers with 14 endpoints are invisible. If this hub is the "source of truth," it's a source of fiction that will waste sprint effort on already-solved problems while ignoring real gaps.

**DEFENSE CLOSING STATEMENT**

Sales & Quotes is the second-strongest module in the codebase after Load Planner. 47 production endpoints across a well-structured 4-controller architecture. 35+ frontend mutations with proper cache invalidation. Every page has loading/error/empty states, search debounce, and ConfirmDialog. The quote-to-order conversion is production-grade with events and idempotency. The rate system (RateContract + ContractLaneRate + AccessorialRate) is a proper enterprise feature. Frontend quality averages 8.5/10 across non-protected pages. The problems are entirely in documentation — the hub was written before v2 sprint and never updated. Fix the docs and wire in the margin enforcement, and this service is ready for production.

### Round 5: Binding Verdict

**Verdict: MODIFY**

**Revised Health Score: 8.0/10** (up from hub's 6/10)

**Rationale:**

Sales & Quotes is dramatically better than its documentation suggests. The hub's C+ (6/10) rating is the single most inaccurate score in the codebase — the actual implementation warrants a strong B+ (8/10). Every screen the hub rates as "basic" (4-5/10) has been substantially rebuilt with modern patterns, proper state handling, and excellent UX.

The backend is robust: 47 endpoints, 4 well-structured controllers, proper auth/roles, event emission on key transitions, and a clean quote-to-order conversion. The frontend is genuinely excellent: 2,762 LOC of non-protected components, 35+ mutations, no window.confirm, ConfirmDialog everywhere, responsive design.

However, three real issues prevent a higher score:
1. **15% margin enforcement is dead code** — the core business rule is unimplemented despite the method existing
2. **No quote expiry job** — validUntil is stored but never enforced, allowing expired quote acceptance
3. **Tenant isolation gap** in mutations — same cross-cutting issue as PST-01 and PST-03

The verdict is MODIFY, not AFFIRM, because: (1) the hub file needs a near-complete rewrite — data model is wrong, quality scores are wrong by 4-5 points, endpoints are 50% undocumented, a phantom model is documented, and 4 of 7 known issues are stale; (2) margin enforcement must be wired in; (3) a quote expiry cron job is needed.

The score improves from 6.0 to 8.0 — a **+2.0 point jump**, the largest correction so far. The code earned this; the stale documentation buried it.

---

## Phase 5: Outputs & Corrections

### 5A. Hub File Corrections

| Section | Current Text | Corrected Text | Reason |
|---------|-------------|----------------|--------|
| §1 Status Box | "C+ (6/10)" | "B+ (8.0/10)" | Code quality far exceeds documentation |
| §1 Backend | "Production (30+ endpoints)" | "Production (47 endpoints across 4 controllers: Quotes 21, RateContracts 12, AccessorialRates 6, SalesPerformance 8)" | 47 actual |
| §1 Frontend | "Partial — Load Planner PROTECTED; Quote list basic; others not built" | "Strong — 9+ pages, most at 8-9/10 quality. Load Planner PROTECTED (9/10). Quote list (9/10), Quote detail (8.5/10), Quote history (9/10)" | Pages are built and high quality |
| §1 Tests | "Minimal — Load Planner has some; Quote list none" | "Moderate — 5 backend spec files (~50 tests) + 3 frontend test files" | Tests exist |
| §3 Quote List | "5/10, Basic list, no filters" | "9/10, Search debounce (300ms), status filters, service type filters, stats cards, pagination, bulk actions UI" | Substantially rebuilt |
| §3 Quote Create | "5/10, Basic form" | "8/10, Uses quote-form-v2 (729 LOC) with Zod validation, multi-step, equipment selection" | Substantial form |
| §3 Quote Detail | "5/10, View only" | "8.5/10, Tabbed view with overview, timeline, versions, notes, status-driven action bar" | Full featured |
| §3 Quote Edit | "4/10, Incomplete" | "8/10, Uses quote-form-v2 with defaultValues, complete edit flow" | Complete |
| §3 Quote History | "4/10, window.confirm" | "9/10, 668 LOC, ConfirmDialog (no window.confirm), search debounce, batch delete, responsive" | window.confirm claim FALSE |
| §4 Endpoints | 24 under single SalesController | 47 across 4 controllers. REMOVE phantom AI endpoints. ADD RateContracts (12), AccessorialRates (6), SalesPerformance (8) | Accurate count |
| §5 Components | 9 listed (4 basic + 5 PROTECTED) | 8 non-protected components (2,762 LOC total) + 5 PROTECTED. Update component names and LOC. | Accurate inventory |
| §6 Hooks | 8 hooks | 35+ mutations across 4 hook files. Add load-planner-quotes, load-history, rate-confirmation hooks. | Accurate count |
| §7 Rule 1 | "15% margin enforced" | "15% margin: enforceMinimumMargin() exists in rate-calculation.service.ts but is NEVER CALLED. Dead code." | Not enforced |
| §7 Rule 2 | "Auto-expire at midnight" | "validUntil field stored but NO expiry job exists. Quotes can be accepted past expiry." | Not implemented |
| §8 Data Model | QuoteItem model documented | DELETE QuoteItem model — does not exist. Pricing is directly on Quote model. | Phantom model |
| §8 Quote fields | customerId, expiresAt, totalRevenue, totalCost, notes | companyId, validUntil, totalAmount, (no totalCost), internalNotes/customerNotes/specialInstructions — rewrite entirely with 50+ actual fields | 12+ field errors |
| §8 QuoteStop | 7 fields with wrong names | 25+ fields: stopSequence (not sequence), stopType (not type), individual address fields (not Json blob) | Wrong field names |
| §8 Missing models | — | ADD: RateContract (20+ fields), ContractLaneRate (25+ fields), AccessorialRate (15+ fields) | 3 undocumented models |
| §10 Status States | DRAFT → SENT → ACCEPTED/REJECTED/EXPIRED | Add VIEWED and CONVERTED states. Note EXPIRED has no enforcement. | 2 missing states |
| §11 Known Issues | 7 issues (all "Open") | Update: 4 are FIXED (quote list filters, window.confirm, detail stub, zero tests). Add: dead margin enforcement, no expiry job, tenant isolation gap. | 4 stale + 3 missing |

### 5B. Action Items

| # | Action | Priority | Effort | Owner | Blocked By |
|---|--------|----------|--------|-------|------------|
| 1 | Wire `enforceMinimumMargin()` into quote create/update flow with UI warning | P0 | 2h | Claude Code | — |
| 2 | Create quote expiry cron job (check validUntil, set status to EXPIRED) | P0 | 1h | Claude Code | — |
| 3 | Add tenantId to WHERE clause in all update/delete operations (Quotes, RateContracts, AccessorialRates services) | P0 | 2h | Claude Code | — |
| 4 | Rewrite hub Section 8 (Data Model) — Quote (50+ fields), QuoteStop (25+ fields), DELETE QuoteItem, ADD RateContract, ContractLaneRate, AccessorialRate | P0 | 3h | Claude Code | — |
| 5 | Update hub Sections 1-7, 10-12 with verified data from this audit | P0 | 2h | Claude Code | — |
| 6 | Fix `any` type casts in quotes/page.tsx (pagination) and quote-form-v2.tsx (field mapping) | P1 | 1h | Any | — |
| 7 | Replace manual cookie extraction in rate-confirmation hook with apiClient auth | P1 | 1h | Any | — |
| 8 | Change AccessorialRates from hard delete to soft delete (consistency) | P1 | 30min | Any | — |
| 9 | Add send validation (require customerEmail before sending quote) | P1 | 30min | Any | — |
| 10 | Add tenant isolation tests for Sales services | P1 | 3h | Claude Code | #3 |
| 11 | Add margin enforcement tests at quote creation level | P1 | 1h | Any | #1 |
| 12 | Evaluate ACCEPTED → REJECTED transition — is this intended? | P2 | 30min | Product | — |

### 5C. New Tasks

| ID | Title | Priority | Effort | Description |
|----|-------|----------|--------|-------------|
| SALES-107 | Wire margin enforcement into quote creation | P0 | 2h | Call `enforceMinimumMargin()` in createQuote/updateQuote. Show UI warning when margin < 15%. Require manager override for below-threshold quotes. |
| SALES-108 | Create quote expiry cron job | P0 | 1h | Scheduled task to check `validUntil < now()` on SENT/VIEWED quotes, set status to EXPIRED, optionally notify |
| SALES-109 | Fix tenant isolation in Sales mutations | P0 | 2h | Add `tenantId` to WHERE clause in all update/delete queries across Quotes, RateContracts, AccessorialRates services |
| SALES-110 | Fix AccessorialRate hard delete | P1 | 30min | Change `prisma.accessorialRate.delete()` to soft delete pattern (set deletedAt) |
| SALES-111 | Add send email validation | P1 | 30min | Validate customerEmail exists before allowing quote send. Match test expectation in quotes.service.spec.ts |

### 5D. ADR Candidates

| Topic | Trigger | Recommendation |
|-------|---------|---------------|
| Margin enforcement policy | 15% minimum exists as dead code | ADR: "Margin enforcement should warn (not block) below 15%, require manager role for override, log to AuditLog" |
| Quote expiry mechanism | validUntil stored but unchecked | ADR: "Use NestJS @Cron() decorator for nightly expiry check. Consider also rejecting accept/convert on expired quotes at service level." |
| Envelope unwrapping patterns | 3 different patterns across Sales hooks | ADR: "Standardize on single unwrap pattern project-wide" (escalate to cross-cutting) |

### 5E. Cross-Service Findings

| Finding | Affects Services | Severity |
|---------|-----------------|----------|
| Update/delete mutations don't verify tenantId — confirmed in 3rd service (Sales). Systemic. | ALL services with CRUD operations | **CRITICAL** — now confirmed in Auth, CRM, Sales |
| Hub data model errors confirmed in 3rd service (12+ errors + phantom model). Systemic. | ALL 35 remaining services | HIGH |
| Hub quality scores can be wrong by 4-5 points. Sprint planning based on hub scores will misallocate effort. | ALL services with screen ratings | HIGH |
| Known issues list stale in 3rd service (~57% inaccurate). Cannot be trusted for planning. | ALL services with known issues | MEDIUM |
| Envelope unwrapping has 3 different patterns: `data?.data` (CRM), custom `unwrap()` (Sales), raw response (Load Planner) | ALL frontend hook files | MEDIUM — inconsistency risk |
| AccessorialRate is the first hard delete found. May exist in other services. | Need to check all services | MEDIUM |

### 5F. Updated Dependency Map

**Corrected:**
```
Sales & Quotes Depends On:
  - Auth & Admin (JWT, roles, tenantId) ✓
  - CRM / Customers (companyId FK, customer lookup) ✓ — but no credit status check found
  - Google Maps API (Load Planner — PROTECTED) ✓
  - AI API (cargo extraction — location unclear, may be in PROTECTED Load Planner code)

Sales & Quotes Depended On By:
  - TMS Core (quote → order conversion via convertToOrder + event emission) ✓
  - Accounting (quote value for revenue) — UNVERIFIED
  - Commission (quote attribution) — UNVERIFIED
  - Load Board (approved quotes → loads) — UNVERIFIED

Sales & Quotes Internal:
  - RateContracts ↔ ContractLaneRates ↔ AccessorialRates (rate resolution chain)
  - SalesPerformance (quotas, leaderboard, conversion metrics) — standalone analytics
```
