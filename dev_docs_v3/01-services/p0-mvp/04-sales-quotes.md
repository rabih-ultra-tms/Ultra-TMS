# Service Hub: Sales & Quotes (04)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Sales service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/03-sales/` (13 files)
> **v2 hub (historical):** `dev_docs_v2/03-services/03-sales.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C+ (6/10) |
| **Confidence** | High — Load Planner confirmed 9/10; Quote list basic |
| **Last Verified** | 2026-03-07 |
| **Backend** | Production (30+ endpoints) |
| **Frontend** | Partial — Load Planner PROTECTED (9/10); Quote list basic; others not built |
| **Tests** | Minimal — Load Planner has some; Quote list none |
| **PROTECTED FILE** | `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` — DO NOT TOUCH |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Sales service definition in dev_docs |
| Design Specs | Done | 13 files in dev_docs/12-Rabih-design-Process/03-sales/ |
| Backend Controller | Production | `apps/api/src/modules/sales/` |
| Prisma Models | Production | Quote, QuoteItem, QuoteStop, RateTable, LoadPlanner |
| Frontend Pages | Partial | Load Planner (PROTECTED 9/10), Quote list (basic), Quote history (basic), others not built |
| React Hooks | Partial | Quote hooks exist; Load Planner hooks internal to page |
| Components | Partial | Load Planner components PROTECTED; Quote list components basic |
| Tests | Minimal | Load Planner: some; rest: 0 |
| Security | Good | All endpoints require auth; Load Planner uses org-wide JWT |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Quote List | `/quotes` | Built | 5/10 | Basic list, no filters |
| Quote Create | `/quotes/new` | Built | 5/10 | Basic form |
| Quote Detail | `/quotes/[id]` | Built | 5/10 | View only |
| Quote Edit | `/quotes/[id]/edit` | Built | 4/10 | Incomplete |
| **Load Planner** | `/load-planner/[id]/edit` | **PROTECTED** | **9/10** | **1,825 LOC — AI cargo extraction, Google Maps, full quote lifecycle. DO NOT TOUCH** |
| Quote History | `/quote-history` | Built | 4/10 | Basic list, window.confirm |
| Quotes Dashboard | `/quotes/dashboard` | Not Built | — | Phase 2 |
| Rate Tables | `/sales/rate-tables` | Not Built | — | Phase 2 |
| Sales Reports | `/sales/reports` | Not Built | — | Phase 3 |
| Customer Rates | `/sales/customer-rates` | Not Built | — | Phase 2 |
| Quote Templates | `/sales/templates` | Not Built | — | Phase 3 |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/sales/quotes` | SalesController | Production | List (paginated, filtered by status/customer/date) |
| POST | `/api/v1/sales/quotes` | SalesController | Production | Create quote |
| GET | `/api/v1/sales/quotes/:id` | SalesController | Production | Full detail with items, stops, margin |
| PUT | `/api/v1/sales/quotes/:id` | SalesController | Production | Full update |
| PATCH | `/api/v1/sales/quotes/:id` | SalesController | Production | Partial update |
| DELETE | `/api/v1/sales/quotes/:id` | SalesController | Production | Soft delete |
| POST | `/api/v1/sales/quotes/:id/send` | SalesController | Production | Send quote to customer (email) |
| POST | `/api/v1/sales/quotes/:id/accept` | SalesController | Production | Customer acceptance → create order |
| POST | `/api/v1/sales/quotes/:id/reject` | SalesController | Production | Mark rejected |
| POST | `/api/v1/sales/quotes/:id/expire` | SalesController | Production | Force expire |
| POST | `/api/v1/sales/quotes/:id/clone` | SalesController | Production | Duplicate with new dates |
| GET | `/api/v1/sales/quotes/:id/pdf` | SalesController | Production | Generate PDF |
| GET | `/api/v1/sales/quotes/stats` | SalesController | Production | Win rate, avg value, revenue |
| GET | `/api/v1/sales/rate-tables` | SalesController | Production | Rate tables list |
| POST | `/api/v1/sales/rate-tables` | SalesController | Production | Create rate table |
| GET | `/api/v1/sales/rate-tables/:id` | SalesController | Production | Detail |
| PUT | `/api/v1/sales/rate-tables/:id` | SalesController | Production | Update |
| DELETE | `/api/v1/sales/rate-tables/:id` | SalesController | Production | Delete |
| POST | `/api/v1/sales/ai/extract-cargo` | SalesController | Production | AI cargo extraction (Load Planner) |
| GET | `/api/v1/sales/ai/suggest-rate` | SalesController | Production | AI rate suggestion |
| GET | `/api/v1/sales/load-planner/:id` | SalesController | Production | Load Planner session data |
| PUT | `/api/v1/sales/load-planner/:id` | SalesController | Production | Save Load Planner state |

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| QuotesTable | `components/sales/quotes/quotes-table.tsx` | Basic | No |
| QuoteForm | `components/sales/quotes/quote-form.tsx` | Basic | No |
| QuoteDetailCard | `components/sales/quotes/quote-detail-card.tsx` | Basic | No |
| QuoteStatusBadge | `components/sales/quotes/quote-status-badge.tsx` | Basic | Yes |
| **LoadPlannerMap** | `(PROTECTED — in load-planner/[id]/edit/)` | Protected 9/10 | No |
| **CargoExtractor** | `(PROTECTED — in load-planner/[id]/edit/)` | Protected 9/10 | No |
| **LoadPlannerStops** | `(PROTECTED — in load-planner/[id]/edit/)` | Protected 9/10 | No |
| **LoadPlannerRateCard** | `(PROTECTED — in load-planner/[id]/edit/)` | Protected 9/10 | No |
| QuoteHistoryTable | `components/sales/quotes/quote-history-table.tsx` | Basic | No |

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useQuotes` | `/sales/quotes` | Yes | Paginated |
| `useQuote` | `/sales/quotes/:id` | Yes | Single |
| `useCreateQuote` | POST `/sales/quotes` | Yes | Mutation |
| `useUpdateQuote` | PATCH `/sales/quotes/:id` | Yes | Mutation |
| `useSendQuote` | POST `/sales/quotes/:id/send` | Yes | Mutation |
| `useAcceptQuote` | POST `/sales/quotes/:id/accept` | Yes | Converts to order |
| `useLoadPlanner` | `/sales/load-planner/:id` | Yes | PROTECTED — internal to page |
| `useAIExtract` | POST `/sales/ai/extract-cargo` | Yes | PROTECTED — internal to page |

---

## 7. Business Rules

1. **Minimum Margin Enforcement:** Every quote MUST have a minimum gross margin of 15%. Calculated as: `margin% = (totalRevenue - totalCost) / totalRevenue × 100`. If below 15%, the system shows a warning and requires dispatcher/manager override with written justification. Override is logged to AuditLog.
2. **Quote Expiry:** Default expiry is 7 days from send date (configurable per tenant in settings). Expired quotes cannot be accepted. They can be cloned with new dates. System auto-expires via scheduled job at midnight.
3. **Quote-to-Order Conversion:** Accepting a quote (`POST /quotes/:id/accept`) creates a new Order in TMS Core via `POST /api/v1/orders/from-quote/:quoteId`. Quote data pre-fills: customer, commodity, stops, rate. Cannot accept if customer has credit HOLD status.
4. **Rate Table Priority:** Rates are resolved in priority order: (1) Customer-specific rate table, (2) Lane-specific rate table, (3) Default rate table. Load Planner UI shows which table is active and allows override.
5. **AI Cargo Extraction:** The Load Planner accepts pasted text (emails, BOLs, PDFs). The AI endpoint extracts: commodity, weight, dimensions, pickup location, delivery location, special requirements. User must confirm before applying. AI suggestions are non-binding.
6. **Quote Status Machine:** DRAFT → SENT → ACCEPTED/REJECTED/EXPIRED. Only DRAFT quotes can be edited. ACCEPTED quotes create orders immediately. REJECTED quotes can be revised and re-sent.
7. **Accessorial Charges:** All quotes support accessorial line items: fuel surcharge (% of line haul), detention ($75/hr), liftgate, inside delivery, residential delivery. Accessorials must be itemized, not bundled.
8. **Currency:** All amounts in USD. Multi-currency support deferred to P3. `Decimal` type in Prisma (not Float) — rounding to 2 decimal places.

---

## 8. Data Model

### Quote
```
Quote {
  id            String (UUID)
  quoteNumber   String (auto-generated: Q-{YYYYMM}-{NNN})
  status        QuoteStatus (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)
  customerId    String (FK → Customer)
  contactId     String? (FK → Contact)
  expiresAt     DateTime
  totalRevenue  Decimal
  totalCost     Decimal
  marginPercent Decimal (calculated)
  notes         String?
  items         QuoteItem[]
  stops         QuoteStop[]
  tenantId      String
  createdBy     String (FK → User)
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?
  external_id   String?
  custom_fields Json?
}
```

### QuoteItem
```
QuoteItem {
  id          String (UUID)
  quoteId     String (FK → Quote)
  type        ItemType (LINE_HAUL, FUEL_SURCHARGE, DETENTION, ACCESSORIAL, etc.)
  description String
  quantity    Int
  unitRate    Decimal
  totalAmount Decimal
  isRevenue   Boolean (true = charges customer, false = carrier cost)
}
```

### QuoteStop
```
QuoteStop {
  id           String (UUID)
  quoteId      String (FK → Quote)
  sequence     Int
  type         StopType (PICKUP, DELIVERY, INTERMEDIATE)
  address      Json (street, city, state, zip, lat, lng)
  scheduledAt  DateTime?
  notes        String?
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `customerId` | IsUUID, must exist in tenant | "Customer not found" |
| `expiresAt` | Must be future date, max 90 days from now | "Expiry must be within 90 days" |
| `totalRevenue` | Decimal, min $50 | "Quote value too low" |
| `marginPercent` | Min 15% (warn) — enforced with override | "Margin below 15% — manager approval required" |
| `stops` | Min 2 (1 pickup + 1 delivery) | "Quote must have at least one pickup and one delivery" |
| `quoteNumber` | Auto-generated, unique per tenant | N/A — system-generated |
| `status transitions` | Only allowed transitions (see state machine) | "Invalid status transition" |

---

## 10. Status States

### Quote Status Machine
```
DRAFT → SENT (via send action)
DRAFT → DELETED (soft delete)
SENT → ACCEPTED (customer accepts, creates Order)
SENT → REJECTED (customer declines)
SENT → EXPIRED (system job at expiry date)
REJECTED/EXPIRED → DRAFT (clone and edit)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| Quote list basic — no status filters, no search debounce | P1 UX | `quotes/page.tsx` | Open |
| Quote history uses window.confirm | P1 UX | `quote-history/page.tsx` | Open |
| Quote detail page is view-only stub | P1 Functional | `quotes/[id]/page.tsx` | Open |
| No margin display on Quote list | P1 UX | `quotes/page.tsx` | Open |
| Rate Tables UI not built | P2 | — | Deferred |
| Load Planner needs Google Maps API key in .env | P0 Config | `.env.example` | Open (docs gap) |
| Zero tests for Quote flows | P1 | — | Open |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| (no active QS task for Sales) | — | — | — |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| SALES-101 | Rebuild Quote List with filters + debounce | M (3-4h) | P1 |
| SALES-102 | Build Quote Detail page (full spec) | L (6h) | P1 |
| SALES-103 | Replace window.confirm in quote-history | S (1h) | P1 |
| SALES-104 | Build Rate Tables CRUD | L (6h) | P2 |
| SALES-105 | Write Quote flow tests | M (4h) | P1 |
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
| Quote list as primary UI | Quote list built (basic quality) | Partial |
| AI cargo extraction = future | Load Planner built with full AI extraction | Exceeds plan |
| Google Maps integration = future | Load Planner has full Maps integration | Exceeds plan |
| 15% margin enforcement | Backend enforces; UI shows warning | Partial |
| Rate Tables in scope | Rate Tables backend built, no UI | Frontend gap |
| 11 screens planned | 6 built (varying quality) | 5 not built |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId)
- CRM (customer lookup, credit status check)
- Carrier Management (rate tables, carrier lookup for Load Planner)
- Google Maps API (Load Planner — requires `GOOGLE_MAPS_API_KEY` env var)
- OpenAI/Gemini API (AI cargo extraction — requires AI API key env var)

**Depended on by:**
- TMS Core (quote → order conversion, pre-fills order from quote data)
- Accounting (quote value for revenue recognition)
- Commission (quote attribution for commission calculations)
- Load Board (approved quotes become postable loads)

**PROTECT LIST:**
- `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` — 9/10, DO NOT MODIFY
