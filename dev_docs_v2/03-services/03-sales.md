# Service 03: Sales

> **Grade:** D+ (4.0/10) | **Priority:** Rebuild from spec | **Phase:** 1-2 (build)
> **Web Prompt:** `dev_docs/11-ai-dev/web-dev-prompts/03-sales-ui.md`
> **Design Specs:** `dev_docs/12-Rabih-design-Process/03-sales/` (11 files)

---

## UI Strategy

**Rebuild all quote screens from design specs.** Existing Quotes UI is 5-6/10 quality with hardcoded colors, missing features. Build fresh.

**PROTECTED: Load Planner** (`/load-planner/[id]/edit`) — Do NOT rebuild. 1,825 LOC, production-ready, works. Has AI cargo extraction (Claude API), Google Maps routing, full quote lifecycle, public sharing. See Load Planner section below.

---

## Status Summary

Backend is substantially implemented with 5 services, 4 controllers, ~1,945 LOC covering Quotes, Rate Contracts, Accessorial Rates, Performance tracking, and Rate Calculation. Additionally, the **Load Planner** has its own backend service (837 LOC, 9 endpoints) for AI-powered load quoting. Frontend is ~15% complete for quotes (basic tables), but the **Load Planner is production-ready** (1,825 LOC page + 2 components). Grade reflects missing screens (rate tables, lane pricing, sales reports, dashboard), hardcoded status colors in quotes, and no market rate integration. Backend has 48+ endpoints — all production-ready.

---

## Screens

| Screen | Route | Status | Quality | Task ID | Notes |
|--------|-------|--------|---------|---------|-------|
| Quotes List | `/quotes` | Rebuild | 6/10 | — | Rebuild from spec with design tokens |
| Quote Detail | `/quotes/[id]` | Rebuild | 5/10 | — | Rebuild from spec with tabs, timeline |
| Quote Create | `/quotes/new` | Rebuild | 5/10 | — | Rebuild from spec with quick/full modes |
| Quote Edit | `/quotes/[id]/edit` | Rebuild | 5/10 | — | Rebuild from spec |
| **Load Planner** | `/load-planner/[id]/edit` | **PROTECTED** | **8/10** | — | **DO NOT REBUILD. Works. AI cargo + maps.** |
| Sales Dashboard | `/sales` | Not Built | — | — | Build from spec |
| Rate Tables | `/sales/rate-tables` | Not Built | — | — | Build from spec |
| Rate Table Editor | `/sales/rate-tables/[id]/edit` | Not Built | — | — | Build from spec (high complexity) |
| Lane Pricing | `/sales/lane-pricing` | Not Built | — | — | Build from spec |
| Accessorial Charges | `/sales/accessorials` | Not Built | — | — | Build from spec |
| Proposal Templates | `/sales/templates` | Not Built | — | — | Phase 3+ |
| Sales Reports | `/sales/reports` | Not Built | — | — | Phase 3+ |

---

## Backend API

### Quotes (22 endpoints — Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/quotes` | GET/POST | Production | List (paginated) + Create |
| `/api/v1/quotes/:id` | GET/PUT/PATCH/DELETE | Production | Full CRUD |
| `/api/v1/quotes/:id/status` | PATCH | Production | State machine validated |
| `/api/v1/quotes/:id/send` | POST | Production | Send to customer |
| `/api/v1/quotes/:id/accept` | POST | Production | Mark accepted |
| `/api/v1/quotes/:id/reject` | POST | Production | Mark rejected with reason |
| `/api/v1/quotes/:id/convert` | POST | Production | Convert to TMS order |
| `/api/v1/quotes/:id/clone` | POST | Production | Clone quote |
| `/api/v1/quotes/:id/version` | POST | Production | Create new version |
| `/api/v1/quotes/:id/versions` | GET | Production | Version history |
| `/api/v1/quotes/:id/timeline` | GET | Production | Activity timeline |
| `/api/v1/quotes/stats` | GET | Production | Pipeline stats |
| `/api/v1/quotes/calculate-rate` | POST | Production | Rate calculation engine |
| `/api/v1/quotes/market-rates` | GET | Production | DAT/Truckstop rates |

### Rate Tables (12 endpoints — Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/rate-tables` | GET/POST | Production | List + Create |
| `/api/v1/rate-tables/:id` | GET/PUT/DELETE | Production | CRUD |
| `/api/v1/rate-tables/:id/activate` | PATCH | Production | Activate/deactivate |
| `/api/v1/rate-tables/:id/clone` | POST | Production | Clone |
| `/api/v1/rate-tables/:id/entries` | POST | Production | Add entry |
| `/api/v1/rate-tables/:id/import` | POST | Production | CSV/Excel import |

### Accessorials (6 endpoints — Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/accessorials` | GET/POST | Production | List + Create |
| `/api/v1/accessorials/:id` | GET/PUT/DELETE | Production | CRUD |
| `/api/v1/accessorials/:id/toggle` | PATCH | Production | Enable/disable |

### Sales Dashboard (8 endpoints — Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/sales/dashboard` | GET | Production | KPI data |
| `/api/v1/sales/dashboard/charts` | GET | Production | Chart data |
| `/api/v1/sales/dashboard/pipeline` | GET | Production | Pipeline grouped |
| `/api/v1/sales/reports/win-loss` | GET | Production | Win/loss analysis |
| `/api/v1/sales/reports/revenue` | GET | Production | Revenue data |
| `/api/v1/sales/reports/agent-performance` | GET | Production | Agent comparison |

---

## Frontend Components

| Component | Path | Quality | Notes |
|-----------|------|---------|-------|
| QuotesTable | `components/sales/quotes/quotes-table.tsx` | 6/10 | Basic, needs inline status |
| QuoteForm | `components/sales/quotes/quote-form.tsx` | 5/10 | Works, missing quick/full modes |
| QuoteDetailCard | `components/sales/quotes/quote-detail-card.tsx` | 5/10 | Missing timeline, versions |
| QuoteStatusBadge | `components/sales/quotes/quote-status-badge.tsx` | 4/10 | Hardcoded colors |
| CustomerForm (quotes) | `components/quotes/customer-form.tsx` | Good | Address autocomplete |
| EmailSignatureDialog | `components/quotes/email-signature-dialog.tsx` | Good | Email builder |
| RouteMap | `components/load-planner/route-map.tsx` | Good | Google Maps integration |

---

## Load Planner (PROTECTED)

> **DO NOT REBUILD.** This feature works and is production-ready. Only make changes if explicitly requested.

**Route:** `/load-planner/[id]/edit` (supports `id=new` for create)

**What it does:** AI-powered load quoting with 7 tabs (customer, route, cargo, trucks, pricing, permits, PDF). Supports file upload (PDF/Excel/CSV/images) for AI cargo extraction via Claude API. Google Maps route mapping with distance/duration. Full quote lifecycle (create, edit, duplicate, share via public link, status tracking).

**Files (6 frontend + 2 backend = 3,035 LOC):**

| File | LOC | Purpose |
|------|-----|---------|
| `app/(dashboard)/load-planner/[id]/edit/page.tsx` | 1,825 | Main page with 7 tabs |
| `components/load-planner/route-map.tsx` | 316 | Google Maps directions + geocoding |
| `components/load-planner/UniversalDropzone.tsx` | 290 | AI file upload + text parsing |
| `lib/hooks/operations/use-load-planner-quotes.ts` | 184 | React Query hooks (8 mutations + 1 query) |
| `types/load-planner-quotes.ts` | 170 | TypeScript types |
| `app/api/load-planner/analyze/route.ts` | 239 | Next.js API route (Claude AI parsing) |
| `apps/api/.../load-planner-quotes.controller.ts` | 176 | NestJS controller (9 endpoints) |
| `apps/api/.../load-planner-quotes.service.ts` | 837 | NestJS service (Prisma transactions) |

**Backend API (9 endpoints -- Production):**

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/operations/load-planner-quotes` | GET/POST | Production | List + Create |
| `/api/v1/operations/load-planner-quotes/:id` | GET/PATCH/DELETE | Production | CRUD |
| `/api/v1/operations/load-planner-quotes/stats` | GET | Production | Pipeline stats |
| `/api/v1/operations/load-planner-quotes/public/:token` | GET | Production | Public share (no auth) |
| `/api/v1/operations/load-planner-quotes/:id/status` | PATCH | Production | Status change |
| `/api/v1/operations/load-planner-quotes/:id/duplicate` | POST | Production | Clone quote |

**External deps:** `@react-google-maps/api`, `@anthropic-ai/sdk` (Claude Sonnet 4)
**Env vars:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `ANTHROPIC_API_KEY`

---

## Design Specs

| Screen | Spec File | Content Level |
|--------|-----------|---------------|
| Service Overview | `00-service-overview.md` | Overview |
| Sales Dashboard | `01-sales-dashboard.md` | Full 15-section |
| Quotes List | `02-quotes-list.md` | Full 15-section |
| Quote Detail | `03-quote-detail.md` | Full 15-section |
| Quote Builder | `04-quote-builder.md` | Full 15-section |
| Rate Tables | `05-rate-tables.md` | Full 15-section |
| Rate Table Editor | `06-rate-table-editor.md` | Full 15-section |
| Lane Pricing | `07-lane-pricing.md` | Full 15-section |
| Accessorial Charges | `08-accessorial-charges.md` | Full 15-section |
| Proposal Templates | `09-proposal-templates.md` | Full 15-section |
| Sales Reports | `10-sales-reports.md` | Full 15-section |

---

## Open Bugs

| Bug ID | Title | Severity | File |
|--------|-------|----------|------|
| BUG-007 | Search debounce missing on Quotes list | P1 | `quotes/page.tsx` |
| — | Hardcoded status colors | P2 | QuoteStatusBadge |

---

## Tasks

| Task ID | Title | Phase | Status | Effort |
|---------|-------|-------|--------|--------|
| BUG-007 | Add search debounce to Quotes | 0 | NOT STARTED | S (30m) |

---

## Key Business Rules

| Rule | Detail |
|------|--------|
| **Minimum Margin** | 15% — quotes below this require manager approval |
| **Quote Expiration** | Default 7 days from creation; configurable per customer |
| **Rate Validity** | Quoted rate valid for expiration period only |
| **Rate Calculation** | `customerRate = baseRate + fuelSurcharge + accessorials` |
| **Margin Formula** | `margin% = ((customerRate - carrierCost) / customerRate) × 100` |
| **Quote Versioning** | Each edit creates a new version; previous versions are read-only |
| **Quote-to-Order** | Converts via `POST /api/v1/orders/from-quote/:quoteId`; pre-fills all fields |
| **Status Flow** | DRAFT → PENDING → SENT → ACCEPTED / REJECTED / EXPIRED |

## Key References

| Document | Path | What It Contains |
|----------|------|------------------|
| Data Dictionary | `dev_docs/11-ai-dev/91-data-dictionary.md` | All entity schemas (Quote, RateTable, Accessorial) |
| Contract Registry | `dev_docs/06-external/76-contract-structure.md` | Rate contract structure |
| Business Rules | `dev_docs/11-ai-dev/92-business-rules-reference.md` | Margin rules, pricing logic |

---

## Dependencies

- **Depends on:** Auth, CRM (customer selection), design tokens (COMP-001)
- **Depended on by:** TMS Core (quote-to-order conversion), Accounting (invoice from quotes), Commission (margin calc)

---

## What to Build Next (Ordered)

**Strategy: Rebuild all quote screens from design specs. PROTECT Load Planner.**

1. **Rebuild Quotes List** — Fresh build from `02-quotes-list.md` spec. Design tokens, proper filters, debounce built-in. 4h.
2. **Rebuild Quote Detail** — Fresh build from `03-quote-detail.md` spec. Tabs, timeline, version switcher. 4h.
3. **Rebuild Quote Create/Edit** — Fresh build from `04-quote-builder.md` spec. Quick/full modes, rate calculator. 6h.
4. **Build Sales Dashboard** — Fresh from `01-sales-dashboard.md` spec. KPI cards, pipeline kanban, charts. Wire to backend. 6h.
5. **Build Rate Tables UI** — Fresh from `05-rate-tables.md` + `06-rate-table-editor.md`. List + editable grid. 8h.
6. **Build Lane Pricing** — Fresh from `07-lane-pricing.md`. Market rate display. 3h.
7. **Build Accessorial Charges** — Fresh from `08-accessorial-charges.md`. List + modal editor. 2h.
