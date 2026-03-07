# Module: sales

## Overview

Sales and quoting module. Manages the full quote lifecycle: create, version, send, accept/reject, convert to order. Also handles quick quotes, rate calculation, accessorial rates, and rate contracts. PDF generation is built-in.

**NestJS module path:** `apps/api/src/modules/sales/`
**Controllers:** quotes.controller.ts, accessorial-rates.controller.ts, rate-contracts.controller.ts, sales-performance.controller.ts

---

## QuotesController — `/api/v1/quotes`

**Guards:** `JwtAuthGuard + RolesGuard`

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | /quotes | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | List quotes |
| GET | /quotes/stats | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | Quote statistics |
| GET | /quotes/:id | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | Get quote by ID |
| POST | /quotes | ADMIN, SALES_REP, SALES_MANAGER | Create quote |
| PATCH | /quotes/:id | ADMIN, SALES_REP, SALES_MANAGER | Update quote |
| DELETE | /quotes/:id | ADMIN, SALES_REP, SALES_MANAGER | Delete quote |
| GET | /quotes/:id/versions | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | Get all quote versions |
| GET | /quotes/:id/timeline | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | Quote activity timeline |
| GET | /quotes/:id/notes | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | Quote notes |
| POST | /quotes/:id/notes | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | Add note to quote |
| POST | /quotes/:id/accept | ADMIN, SALES_REP, SALES_MANAGER | Accept quote |
| POST | /quotes/:id/reject | ADMIN, SALES_REP, SALES_MANAGER | Reject quote |
| POST | /quotes/:id/clone | ADMIN, SALES_REP, SALES_MANAGER | Clone quote |
| POST | /quotes/:id/version | ADMIN, SALES_REP, SALES_MANAGER | Create new version |
| POST | /quotes/:id/new-version | ADMIN, SALES_REP, SALES_MANAGER | Create new version (alias) |
| POST | /quotes/:id/duplicate | ADMIN, SALES_REP, SALES_MANAGER | Duplicate quote (alias for clone) |
| POST | /quotes/:id/convert | ADMIN, SALES_REP, SALES_MANAGER | Convert quote to order |
| POST | /quotes/:id/send | ADMIN, SALES_REP, SALES_MANAGER | Send quote to customer |
| GET | /quotes/:id/pdf | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | Download quote PDF (binary) |
| POST | /quotes/quick | ADMIN, SALES_REP, SALES_MANAGER | Create quick quote |
| POST | /quotes/calculate-rate | ADMIN, SALES_REP, SALES_MANAGER, PRICING_ANALYST | Calculate shipping rate |

### GET /quotes Query Params
- `page`, `limit`, `status`, `companyId`, `salesRepId`, `search`, `serviceType`
**Response:** `{ data: Quote[], pagination: {...} }`

### Quote Status Lifecycle
```
DRAFT → SENT → ACCEPTED / REJECTED / EXPIRED
DRAFT → CANCELLED
```

### GET /quotes/:id/pdf
Returns raw PDF binary (not JSON envelope).
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename=quote-{id}.pdf`

### POST /quotes/:id/convert
Converts accepted quote to an order.
**Response:** `{ data: { orderId: string } }` — navigate to /operations/orders/{orderId}

### POST /quotes/:id/reject
**Request:** `{ reason?: string }`

### POST /quotes/calculate-rate
**Request:** `CalculateRateDto` — origin, destination, weight, equipment type, etc.
**Response:** `{ data: { rate: number, breakdown: {...} } }`

---

## DTOs

| DTO | Purpose |
|---|---|
| CreateQuoteDto | Full quote creation |
| UpdateQuoteDto | Partial update |
| QuickQuoteDto | Streamlined quote (fewer required fields) |
| CalculateRateDto | Rate calculation inputs |

---

## AccessorialRatesController — `/api/v1/accessorial-rates`

Manages additional charges on top of base freight rate.
- CRUD for accessorial rate configurations
- Types: fuel surcharge, detention, lumper, layover, etc.

---

## RateContractsController — `/api/v1/rate-contracts`

Customer-specific contracted rates. Used to auto-populate quote rates.

---

## Notes

- `/quotes/clone` and `/quotes/duplicate` call the same `quotesService.duplicate()` — both endpoints exist as aliases
- `/quotes/version` and `/quotes/new-version` call the same `quotesService.createNewVersion()` — duplicate endpoints
- PRICING_ANALYST role can read/calculate but cannot create/modify/delete quotes
