# Service Hub: Sales & Quotes (04)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-04 tribunal)
> **Original definition:** `dev_docs/02-services/` (Sales service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/03-sales/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/03-sales.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-04-sales-quotes.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B+ (8.0/10) |
| **Confidence** | High — code-verified via PST-04 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — 47 endpoints across 4 controllers (Quotes 21, RateContracts 12, AccessorialRates 6, SalesPerformance 8) |
| **Frontend** | Strong — 9+ pages, most at 8-9/10 quality. Load Planner PROTECTED (9/10). Quote list (9/10), Quote detail (8.5/10), Quote history (9/10) |
| **Tests** | Moderate — 5 backend spec files (~50 tests) + 3 frontend test files |
| **PROTECTED FILE** | `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` — DO NOT TOUCH |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Sales service definition in dev_docs |
| Design Specs | Done | 13 files in dev_docs/12-Rabih-design-Process/03-sales/ |
| Backend Controllers | Production | 4 controllers (Quotes, RateContracts, AccessorialRates, SalesPerformance), 47 endpoints total |
| Prisma Models | Production | Quote (50+ fields), QuoteStop (25+ fields), RateContract, ContractLaneRate, AccessorialRate |
| Frontend Pages | Production | 9+ pages: quotes list (9/10), detail (8.5/10), create/edit (8/10), quote-history (9/10), load-history, load-planner (PROTECTED) |
| React Hooks | Production | 35+ mutations across 4 hook files (use-quotes, use-load-planner-quotes, use-load-history, rate-confirmation) |
| Components | Production | 8 non-protected components (2,762 LOC) + 5 PROTECTED Load Planner components |
| Tests | Moderate | 5 backend specs (~50 tests) + 3 frontend test files |
| Security | Good | All endpoints auth-guarded with @UseGuards(JwtAuthGuard, RolesGuard). Tenant isolation gap in update/delete WHERE clauses (cross-cutting issue). |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Quote List | `/quotes` | Built | 9/10 | Search debounce (300ms), status filters, service type filters, stats cards, pagination, bulk actions UI |
| Quote Create | `/quotes/new` | Built | 8/10 | Uses quote-form-v2 (729 LOC) with Zod validation, multi-step, equipment selection |
| Quote Detail | `/quotes/[id]` | Built | 8.5/10 | Tabbed view with overview (513 LOC), timeline, versions, notes, status-driven action bar (306 LOC) |
| Quote Edit | `/quotes/[id]/edit` | Built | 8/10 | Uses quote-form-v2 with defaultValues, complete edit flow |
| **Load Planner** | `/load-planner/[id]/edit` | **PROTECTED** | **9/10** | **4,006 LOC — AI cargo extraction, Google Maps, full quote lifecycle. DO NOT TOUCH** |
| Quote History | `/quote-history` | Built | 9/10 | 668 LOC, ConfirmDialog, search debounce (300ms), batch delete, responsive |
| Load History List | `/load-history` | Built | 8.5/10 | List with stats |
| Load History Detail | `/load-history/[id]` | Built | 8.5/10 | Detail view |
| Quotes Dashboard | `/quotes/dashboard` | Not Built | — | Phase 2 |
| Rate Tables | `/sales/rate-tables` | Not Built | — | Phase 2 (backend has 18 endpoints ready) |
| Sales Reports | `/sales/reports` | Not Built | — | Phase 3 |
| Customer Rates | `/sales/customer-rates` | Not Built | — | Phase 2 |
| Quote Templates | `/sales/templates` | Not Built | — | Phase 3 |

---

## 4. API Endpoints

### Quotes Controller (21 endpoints)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/sales/quotes` | QuotesController | Production | List (paginated, filtered by status/customer/date) |
| POST | `/api/v1/sales/quotes` | QuotesController | Production | Create quote |
| POST | `/api/v1/sales/quotes/quick` | QuotesController | Production | Quick quote creation |
| GET | `/api/v1/sales/quotes/stats` | QuotesController | Production | Win rate, avg value, revenue |
| GET | `/api/v1/sales/quotes/:id` | QuotesController | Production | Full detail with stops, margin |
| PUT | `/api/v1/sales/quotes/:id` | QuotesController | Production | Full update |
| PATCH | `/api/v1/sales/quotes/:id` | QuotesController | Production | Partial update |
| DELETE | `/api/v1/sales/quotes/:id` | QuotesController | Production | Soft delete |
| POST | `/api/v1/sales/quotes/:id/send` | QuotesController | Production | Send quote to customer (email) |
| POST | `/api/v1/sales/quotes/:id/accept` | QuotesController | Production | Customer acceptance |
| POST | `/api/v1/sales/quotes/:id/reject` | QuotesController | Production | Mark rejected |
| POST | `/api/v1/sales/quotes/:id/clone` | QuotesController | Production | Duplicate with new dates |
| POST | `/api/v1/sales/quotes/:id/duplicate` | QuotesController | Production | Duplicate quote |
| POST | `/api/v1/sales/quotes/:id/convert` | QuotesController | Production | Convert to Order (sets CONVERTED status, emits event) |
| POST | `/api/v1/sales/quotes/:id/new-version` | QuotesController | Production | Create new version of quote |
| GET | `/api/v1/sales/quotes/:id/versions` | QuotesController | Production | List quote versions |
| GET | `/api/v1/sales/quotes/:id/pdf` | QuotesController | Production | Generate PDF |
| GET | `/api/v1/sales/quotes/:id/timeline` | QuotesController | Production | Quote timeline |
| GET | `/api/v1/sales/quotes/:id/notes` | QuotesController | Production | List notes |
| POST | `/api/v1/sales/quotes/:id/notes` | QuotesController | Production | Add note |
| POST | `/api/v1/sales/quotes/calculate-rate` | QuotesController | Production | Rate calculation |

### RateContracts Controller (12 endpoints)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/sales/rate-contracts` | RateContractsController | Production | List rate contracts |
| POST | `/api/v1/sales/rate-contracts` | RateContractsController | Production | Create rate contract |
| GET | `/api/v1/sales/rate-contracts/:id` | RateContractsController | Production | Detail |
| PATCH | `/api/v1/sales/rate-contracts/:id` | RateContractsController | Production | Update |
| DELETE | `/api/v1/sales/rate-contracts/:id` | RateContractsController | Production | Delete |
| POST | `/api/v1/sales/rate-contracts/:id/activate` | RateContractsController | Production | Activate contract |
| POST | `/api/v1/sales/rate-contracts/:id/renew` | RateContractsController | Production | Renew contract |
| GET | `/api/v1/sales/rate-contracts/:id/lanes` | RateContractsController | Production | List lanes |
| POST | `/api/v1/sales/rate-contracts/:id/lanes` | RateContractsController | Production | Add lane |
| PATCH | `/api/v1/sales/rate-contracts/:id/lanes/:laneId` | RateContractsController | Production | Update lane |
| DELETE | `/api/v1/sales/rate-contracts/:id/lanes/:laneId` | RateContractsController | Production | Delete lane |
| POST | `/api/v1/sales/rate-contracts/find-rate` | RateContractsController | Production | Find applicable rate |

### AccessorialRates Controller (6 endpoints)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/sales/accessorial-rates` | AccessorialRatesController | Production | List accessorial rates |
| POST | `/api/v1/sales/accessorial-rates` | AccessorialRatesController | Production | Create rate |
| GET | `/api/v1/sales/accessorial-rates/:id` | AccessorialRatesController | Production | Detail |
| PATCH | `/api/v1/sales/accessorial-rates/:id` | AccessorialRatesController | Production | Update |
| DELETE | `/api/v1/sales/accessorial-rates/:id` | AccessorialRatesController | Production | **Hard delete** (should be soft delete — see SALES-110) |
| POST | `/api/v1/sales/accessorial-rates/seed-defaults` | AccessorialRatesController | Production | Seed default rates |

### SalesPerformance Controller (8 endpoints)

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/sales/performance` | SalesPerformanceController | Production | Performance metrics |
| GET | `/api/v1/sales/performance/leaderboard` | SalesPerformanceController | Production | Sales leaderboard |
| GET | `/api/v1/sales/performance/conversion-metrics` | SalesPerformanceController | Production | Conversion metrics |
| GET | `/api/v1/sales/performance/win-loss` | SalesPerformanceController | Production | Win/loss analysis |
| GET | `/api/v1/sales/quotas` | SalesPerformanceController | Production | List quotas |
| POST | `/api/v1/sales/quotas` | SalesPerformanceController | Production | Create quota |
| PATCH | `/api/v1/sales/quotas/:id` | SalesPerformanceController | Production | Update quota |
| DELETE | `/api/v1/sales/quotas/:id` | SalesPerformanceController | Production | Delete quota |

---

## 5. Components

### Non-Protected Components (8, ~2,762 LOC total)

| Component | Path | LOC | Status | Notes |
|-----------|------|-----|--------|-------|
| quote-form-v2 | `components/sales/quotes/quote-form-v2.tsx` | 729 | Excellent | Zod validation, multi-step, equipment buttons, rate integration |
| quote-rate-section | `components/sales/quotes/quote-rate-section.tsx` | 532 | Excellent | Rate calculation UI |
| quote-detail-overview | `components/sales/quotes/quote-detail-overview.tsx` | 513 | Excellent | Margin color coding (green/amber/red), stops, rate breakdown |
| quote-stops-builder | `components/sales/quotes/quote-stops-builder.tsx` | 328 | Excellent | Stop management with address autocomplete |
| quote-actions-bar | `components/sales/quotes/quote-actions-bar.tsx` | 306 | Excellent | Status-driven action visibility with state machine |
| columns | `components/sales/quotes/columns.tsx` | 276 | Good | Column definitions for quotes table |
| quote-timeline-section | `components/sales/quotes/quote-timeline-section.tsx` | 219 | Good | Timeline + inline notes |
| quote-versions-section | `components/sales/quotes/quote-versions-section.tsx` | 108 | Good | Version comparison |
| QuoteStatusBadge | `components/sales/quotes/quote-status-badge.tsx` | 27 | Good | Status badge renderer (shared) |

### PROTECTED Components (5 — in load-planner/[id]/edit/)

| Component | Status | Notes |
|-----------|--------|-------|
| LoadPlannerMap | Protected 9/10 | Google Maps integration |
| CargoExtractor | Protected 9/10 | AI cargo extraction |
| LoadPlannerStops | Protected 9/10 | Stop management |
| LoadPlannerRateCard | Protected 9/10 | Rate display |
| LoadPlannerLayout | Protected 9/10 | Page layout |

---

## 6. Hooks

### Quotes Hooks (`lib/hooks/sales/use-quotes.ts`)

| Hook | Endpoint | Envelope | Notes |
|------|----------|----------|-------|
| `useQuotes` | `/sales/quotes` | Custom `unwrap()` | Paginated list |
| `useQuote` | `/sales/quotes/:id` | Custom `unwrap()` | Single detail |
| `useQuoteStats` | `/sales/quotes/stats` | Manual `response.data` | Stats aggregation |
| `useCreateQuote` | POST `/sales/quotes` | Custom `unwrap()` | Mutation + cache invalidation + toast |
| `useUpdateQuote` | PATCH `/sales/quotes/:id` | Custom `unwrap()` | Mutation |
| `useDeleteQuote` | DELETE `/sales/quotes/:id` | Custom `unwrap()` | Mutation |
| `useSendQuote` | POST `/sales/quotes/:id/send` | Custom `unwrap()` | Mutation |
| `useAcceptQuote` | POST `/sales/quotes/:id/accept` | Custom `unwrap()` | Mutation |
| `useRejectQuote` | POST `/sales/quotes/:id/reject` | Custom `unwrap()` | Mutation |
| `useCloneQuote` | POST `/sales/quotes/:id/clone` | Custom `unwrap()` | Creates new quote |
| `useConvertQuote` | POST `/sales/quotes/:id/convert` | Custom `unwrap()` | Creates Order |
| `useQuoteVersions` | GET `/sales/quotes/:id/versions` | Custom `unwrap()` | Version list |
| `useCreateQuoteVersion` | POST `/sales/quotes/:id/new-version` | Custom `unwrap()` | New version |
| `useQuoteTimeline` | GET `/sales/quotes/:id/timeline` | Custom `unwrap()` | Timeline entries |
| `useQuoteNotes` | GET `/sales/quotes/:id/notes` | Custom `unwrap()` | Notes list |
| `useAddQuoteNote` | POST `/sales/quotes/:id/notes` | Custom `unwrap()` | Add note |
| `useCalculateRate` | POST `/sales/quotes/calculate-rate` | Custom `unwrap()` | Rate calculation |

### Load Planner Quotes Hooks (`lib/hooks/sales/use-load-planner-quotes.ts`)

| Hook | Endpoint | Envelope | Notes |
|------|----------|----------|-------|
| `useLoadPlannerQuotes` | `/sales/load-planner-quotes` | Raw response | List |
| `useLoadPlannerQuote` | `/sales/load-planner-quotes/:id` | Raw response | Detail |
| `useLoadPlannerQuotePublic` | `/sales/load-planner-quotes/:id/public` | Raw response | Public access |
| `useLoadPlannerQuoteStats` | `/sales/load-planner-quotes/stats` | Raw response | Stats |
| `useCreateLoadPlannerQuote` | POST `/sales/load-planner-quotes` | Raw response | Create mutation |
| `useUpdateLoadPlannerQuote` | PATCH `/sales/load-planner-quotes/:id` | Raw response | Update mutation |
| `useUpdateLoadPlannerQuoteStatus` | PATCH `/sales/load-planner-quotes/:id/status` | Raw response | Status change |
| `useDuplicateLoadPlannerQuote` | POST `/sales/load-planner-quotes/:id/duplicate` | Raw response | Duplicate |
| `useDeleteLoadPlannerQuote` | DELETE `/sales/load-planner-quotes/:id` | Raw response | Delete |

### Load History Hooks (`lib/hooks/sales/use-load-history.ts`)

| Hook | Endpoint | Envelope | Notes |
|------|----------|----------|-------|
| `useLoadHistory` | `/sales/load-history` | Raw with normalization | List |
| `useLoadHistoryItem` | `/sales/load-history/:id` | Raw with normalization | Detail |
| `useLoadHistoryByCarrier` | `/sales/load-history/carrier/:id` | Raw with normalization | Carrier filter |
| `useSimilarLoads` | `/sales/load-history/similar` | Raw with normalization | Similar loads |
| `useLoadHistoryStats` | `/sales/load-history/stats` | Raw with normalization | Stats |
| `useLaneStats` | `/sales/load-history/lane-stats` | Raw with normalization | Lane analytics |
| `useCreateLoadHistory` | POST `/sales/load-history` | Raw with normalization | Create |
| `useUpdateLoadHistory` | PATCH `/sales/load-history/:id` | Raw with normalization | Update |
| `useDeleteLoadHistory` | DELETE `/sales/load-history/:id` | Raw with normalization | Delete |

**Note:** Sales hooks use 3 different envelope patterns: custom `unwrap()` (quotes), raw response (load-planner-quotes), raw with normalization (load-history). This is a cross-cutting inconsistency — see recurring-patterns.md.

---

## 7. Business Rules

1. **Minimum Margin Enforcement (DEAD CODE):** `enforceMinimumMargin()` exists in `rate-calculation.service.ts` with `DEFAULT_MINIMUM_MARGIN_PERCENT = 15`. The method exists and is tested in isolation, but is **never called** during quote creation or update. A quote with 0% margin can be created, sent, accepted, and converted. Wiring this in is SALES-107 (P0).
2. **Quote Expiry (NOT IMPLEMENTED):** `validUntil` field exists on the Quote model, but there is no cron job or scheduled task to expire quotes. Quotes remain in SENT status indefinitely past expiration and can still be accepted. Adding an expiry job is SALES-108 (P0).
3. **Quote-to-Order Conversion:** `convertToOrder()` in quotes.service.ts is production-grade. Creates a new Order, sets Quote status to CONVERTED, records `convertedOrderId` and `convertedAt`, checks idempotency (rejects if already CONVERTED), and emits `quote.converted` event for downstream services.
4. **Rate Table Priority:** `findContractRate()` queries by companyId + lane, but orders by `rateAmount ASC` (cheapest first) rather than the designed priority chain (Customer-specific > Lane-specific > Default). Volume tiers (volumeMin/Max) exist in schema but are not used in queries.
5. **AI Cargo Extraction:** AI endpoints (`/sales/ai/extract-cargo`, `/sales/ai/suggest-rate`) do NOT exist as standalone endpoints. AI integration is embedded in the PROTECTED Load Planner page (4,006 LOC).
6. **Quote Status Machine:** DRAFT > SENT > VIEWED > ACCEPTED > CONVERTED. Also: SENT/VIEWED > REJECTED. EXPIRED state exists but has no enforcement mechanism. Note: ACCEPTED > REJECTED is allowed (questionable). See Section 10 for full state diagram.
7. **Accessorial Charges:** Well-modeled via `AccessorialRate` entity with rateType (PER_HOUR, FLAT, PER_MILE), min/max charges, service type applicability. 6 CRUD endpoints including seed-defaults.
8. **Currency:** All amounts in USD. `currency String @default("USD")` on Quote. All amounts use `Decimal @db.Decimal(12,2)`. Multi-currency deferred to P3.

---

## 8. Data Model

### Quote (50+ fields — key fields shown)

```prisma
Quote {
  id                String (UUID, PK)
  quoteNumber       String @db.VarChar(50)
  status            String @default("DRAFT") — values: DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED, CONVERTED
  version           Int
  parentQuoteId     String? (FK → Quote, for versioning)

  // Customer
  companyId         String? (FK → Company)
  contactId         String? (FK → Contact)
  customerName      String?
  customerEmail     String?
  customerPhone     String?

  // Service
  serviceType       String?
  equipmentType     String?

  // Dates
  pickupDate        DateTime?
  pickupWindowStart DateTime?
  pickupWindowEnd   DateTime?
  deliveryDate      DateTime?
  deliveryWindowStart DateTime?
  deliveryWindowEnd DateTime?
  isFlexibleDates   Boolean?
  validFrom         DateTime?
  validUntil        DateTime? (expiry — NOT ENFORCED, see Business Rule #2)

  // Cargo
  commodity         String?
  weightLbs         Decimal?
  pieces            Int?
  pallets           Int?
  dimensions        Json?
  isHazmat          Boolean?
  hazmatClass       String?
  temperatureMin    Decimal?
  temperatureMax    Decimal?

  // Pricing (directly on Quote — no QuoteItem model)
  totalMiles        Decimal?
  linehaulRate      Decimal?
  fuelSurcharge     Decimal?
  accessorialsTotal Decimal?
  totalAmount       Decimal @db.Decimal(12,2)
  marginPercent     Decimal? @db.Decimal(5,2)
  marginAmount      Decimal? @db.Decimal(12,2)
  currency          String @default("USD")

  // Rate Intelligence
  rateSource        String?
  marketRateLow     Decimal?
  marketRateAvg     Decimal?
  marketRateHigh    Decimal?

  // Conversion
  convertedOrderId  String?
  convertedAt       DateTime?

  // Timestamps & Status
  sentAt            DateTime?
  viewedAt          DateTime?
  respondedAt       DateTime?
  rejectionReason   String?

  // Notes (3 separate fields, not a single "notes")
  internalNotes     String?
  customerNotes     String?
  specialInstructions String?

  // Relations
  stops             QuoteStop[]

  // Migration & Multi-Tenant
  tenantId          String
  createdById       String?
  updatedById       String?
  customFields      Json?
  externalId        String?
  sourceSystem      String?
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
}
```

### QuoteStop (25+ fields — key fields shown)

```prisma
QuoteStop {
  id              String (UUID, PK)
  quoteId         String (FK → Quote)
  stopSequence    Int (not "sequence")
  stopType        String @db.VarChar(20) (PICKUP, DELIVERY — not "type")

  // Address (individual fields, NOT a Json blob)
  facilityName    String?
  addressLine1    String?
  addressLine2    String?
  city            String?
  state           String?
  postalCode      String?
  country         String?
  latitude        Decimal?
  longitude       Decimal?

  // Contact
  contactName     String?
  contactPhone    String?
  contactEmail    String?

  // Appointment (not a single "scheduledAt")
  appointmentRequired Boolean?
  earliestTime    DateTime?
  latestTime      DateTime?

  // Distance
  milesToNext     Decimal?

  // Migration & Multi-Tenant
  tenantId        String
  customFields    Json?
  externalId      String?
  sourceSystem    String?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
}
```

### RateContract (20+ fields)

```prisma
RateContract {
  id                    String (UUID, PK)
  contractNumber        String
  companyId             String (FK → Company)
  effectiveDate         DateTime
  expirationDate        DateTime
  autoRenew             Boolean
  minimumMarginPercent  Decimal?
  status                String (DRAFT, ACTIVE, EXPIRED, TERMINATED)
  lanes                 ContractLaneRate[]
  tenantId              String
  createdAt             DateTime
  updatedAt             DateTime
  deletedAt             DateTime?
}
```

### ContractLaneRate (25+ fields)

```prisma
ContractLaneRate {
  id                String (UUID, PK)
  rateContractId    String (FK → RateContract)
  originCity        String?
  originState       String?
  originZip         String?
  originZone        String?
  originRadius      Decimal?
  destinationCity   String?
  destinationState  String?
  destinationZip    String?
  destinationZone   String?
  destinationRadius Decimal?
  rateType          String (PER_MILE, FLAT, etc.)
  rateAmount        Decimal
  volumeMin         Int? (not used in queries yet)
  volumeMax         Int? (not used in queries yet)
  tenantId          String
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
}
```

### AccessorialRate (15+ fields)

```prisma
AccessorialRate {
  id                    String (UUID, PK)
  accessorialType       String (FUEL_SURCHARGE, DETENTION, LIFTGATE, etc.)
  rateType              String (PER_HOUR, FLAT, PER_MILE)
  rateAmount            Decimal
  minimumCharge         Decimal?
  maximumCharge         Decimal?
  appliesToServiceTypes String[] (which service types this applies to)
  isDefault             Boolean
  tenantId              String
  createdAt             DateTime
  updatedAt             DateTime
  deletedAt             DateTime?
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `companyId` | IsUUID, optional (nullable) | "Company not found" |
| `validUntil` | DateTime, optional. No max-days cap enforced. | N/A |
| `totalAmount` | Decimal @db.Decimal(12,2). No minimum enforced. | N/A |
| `marginPercent` | Decimal, nullable. `enforceMinimumMargin()` exists but is **never called** — dead code | N/A — enforcement not wired in |
| `stops` | QuoteStop validated via DTO. No minimum count enforcement found. | N/A |
| `quoteNumber` | VarChar(50), format may be in service logic | N/A — system-generated |
| `status transitions` | Enforced in accept/reject/send/convert methods via status guards | "Invalid status transition" |

---

## 10. Status States

### Quote Status Machine (Actual Implementation)

```text
DRAFT → SENT (via send action)
DRAFT → DELETED (soft delete)
SENT → VIEWED (when customer views — hub previously omitted)
SENT/VIEWED → ACCEPTED (accept action)
SENT/VIEWED/ACCEPTED → REJECTED (reject action — note: ACCEPTED→REJECTED allowed)
ACCEPTED → CONVERTED (convert-to-order — creates Order, sets convertedOrderId)
CONVERTED → (terminal — idempotency check prevents re-conversion)
```

**Issues:**

- **EXPIRED** state exists as a value but has NO enforcement mechanism (no cron job, no check at accept time). Quotes can be accepted past `validUntil`. See SALES-108.
- **ACCEPTED → REJECTED** is allowed — questionable business logic. Evaluate with product team.
- Hub previously documented "REJECTED/EXPIRED → DRAFT (clone and edit)" — clone creates a NEW quote, does not change status to DRAFT.

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| ~~Quote list basic — no status filters, no search debounce~~ | ~~P1 UX~~ | **FIXED** | Has status filter, service type filter, 300ms debounce, stats cards |
| ~~Quote history uses window.confirm~~ | ~~P1 UX~~ | **FIXED** | Uses ConfirmDialog throughout (668 LOC page) |
| ~~Quote detail page is view-only stub~~ | ~~P1 Functional~~ | **FIXED** | Tabbed view with overview, timeline, versions, notes, action bar |
| ~~Zero tests for Quote flows~~ | ~~P1~~ | **FIXED** | 5 backend specs (~50 tests) + 3 frontend test files |
| 15% margin enforcement is dead code | P0 BUG | **Open** | `enforceMinimumMargin()` never called — quotes can have 0% margin. See SALES-107 |
| No quote expiry cron job | P0 BUG | **Open** | `validUntil` stored but never checked — expired quotes can be accepted. See SALES-108 |
| Tenant isolation gap in update/delete | P0 SECURITY | **Open** | `update()` / `delete()` use `where: { id }` without tenantId — same cross-cutting issue as PST-01, PST-03. See SALES-109 |
| AccessorialRates uses hard delete | P1 | **Open** | `prisma.accessorialRate.delete()` permanently destroys data. See SALES-110 |
| Rate Tables UI not built | P2 | **Open** | Backend has 18 endpoints ready |
| Load Planner needs Google Maps API key in .env | P2 Config | **Open** | Docs gap |
| `any` type casts in quotes/page.tsx and quote-form-v2.tsx | P2 | **Open** | Pagination type cast + field mapping |
| 3 different envelope unwrapping patterns across Sales hooks | P2 | **Open** | Custom unwrap() vs raw response vs raw with normalization |

---

## 12. Tasks

### Completed (verified by PST-04 tribunal)

| Task ID | Title | Status |
|---------|-------|--------|
| SALES-101 | Rebuild Quote List with filters + debounce | **Done** — 9/10 quality |
| SALES-102 | Build Quote Detail page (full spec) | **Done** — 8.5/10 with tabs |
| SALES-103 | Replace window.confirm in quote-history | **Done** — ConfirmDialog throughout |
| SALES-105 | Write Quote flow tests | **Done** — 5 backend + 3 frontend |

### Open (from tribunal findings)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SALES-107 | Wire `enforceMinimumMargin()` into quote create/update flow with UI warning | M (2h) | P0 |
| SALES-108 | Create quote expiry cron job (check validUntil, set EXPIRED) | S (1h) | P0 |
| SALES-109 | Add tenantId to WHERE clause in all update/delete operations (Quotes, RateContracts, AccessorialRates) | M (2h) | P0 |
| SALES-110 | Fix AccessorialRate hard delete → soft delete | XS (30min) | P1 |
| SALES-111 | Add send email validation (require customerEmail before send) | XS (30min) | P1 |
| SALES-104 | Build Rate Tables CRUD UI | L (6h) | P2 |
| SALES-106 | Quotes Dashboard (win rate, pipeline, revenue) | L (6h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Quotes Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/03-sales/01-quotes-dashboard.md` |
| Quote List | Full 15-section | `dev_docs/12-Rabih-design-Process/03-sales/02-quotes-list.md` |
| Quote Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/03-sales/03-quote-detail.md` |
| New Quote | Full 15-section | `dev_docs/12-Rabih-design-Process/03-sales/04-new-quote.md` |
| Load Planner | Full 15-section | `dev_docs/12-Rabih-design-Process/03-sales/05-load-planner.md` |
| Rate Tables | Full 15-section | `dev_docs/12-Rabih-design-Process/03-sales/06-rate-tables.md` |
| Quote History | Full 15-section | `dev_docs/12-Rabih-design-Process/03-sales/07-quote-history.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Quote list as primary UI | Quote list rebuilt at 9/10 with filters, debounce, stats | Exceeds plan |
| AI cargo extraction = future | Load Planner built with full AI extraction (PROTECTED, 4,006 LOC) | Exceeds plan |
| Google Maps integration = future | Load Planner has full Maps integration | Exceeds plan |
| 15% margin enforcement | `enforceMinimumMargin()` exists but is dead code — never called | Gap (SALES-107) |
| Rate Tables in scope | Backend has 18 endpoints (RateContracts 12 + AccessorialRates 6), no UI | Frontend gap |
| 11 screens planned | 8+ built at high quality (avg 8.5/10) | 3 not built |
| Hub rated 6/10 | Verified 8.0/10 by PST-04 tribunal | Hub was catastrophically outdated |

---

## 15. Dependencies

**Depends on:**

- Auth & Admin (JWT, roles, tenantId — JwtAuthGuard + RolesGuard on all controllers)
- CRM / Customers (companyId FK to Company — no credit status check found)
- Google Maps API (Load Planner — requires `GOOGLE_MAPS_API_KEY` env var)
- AI API (cargo extraction — embedded in PROTECTED Load Planner page, not a standalone endpoint)

**Depended on by:**

- TMS Core (quote → order conversion via `convertToOrder()` + `quote.converted` event emission)
- Accounting (quote value for revenue recognition — unverified direct dependency)
- Commission (quote attribution for commission calculations — unverified)
- Load Board (approved quotes become postable loads — unverified)

**Internal dependencies:**

- RateContracts <> ContractLaneRates <> AccessorialRates (rate resolution chain)
- SalesPerformance (quotas, leaderboard, conversion metrics — standalone analytics)

**PROTECT LIST:**

- `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` — 9/10, 4,006 LOC, DO NOT MODIFY
