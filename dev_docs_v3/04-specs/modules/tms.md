# Module: tms

## Overview

TMS Core module — the operational heart of the platform. Manages orders, loads, stops, tracking, and rate confirmations. Backend is fully implemented (LoadsService 19KB, OrdersService 22KB). Frontend was wired up in Q-Sprint.

**NestJS module path:** `apps/api/src/modules/tms/`
**Controllers:** loads.controller.ts, orders.controller.ts, stops.controller.ts, tracking.controller.ts, public-tracking.controller.ts

---

## LoadsController — `/api/v1/loads`

**Guards:** `JwtAuthGuard` (no RolesGuard at controller level — per-action `@Roles()`)

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| POST | /loads | Any JWT | Create load |
| GET | /loads | Any JWT | List loads (paginated + filtered) |
| GET | /loads/board | Any JWT | Load board view (by status/region) |
| GET | /loads/stats | ADMIN, DISPATCHER | Load statistics |
| GET | /loads/:id | Any JWT | Get load by ID |
| PUT | /loads/:id | Any JWT | Update load (full replace) |
| POST | /loads/:id/assign-carrier | Any JWT | Assign carrier to load |
| PATCH | /loads/:id/assign | Any JWT | Assign carrier (alias) |
| PATCH | /loads/:id/dispatch | Any JWT | Dispatch load |
| PATCH | /loads/:id/status | Any JWT | Update load status |
| PUT | /loads/:id/location | Any JWT | Update load location (GPS) |
| POST | /loads/:id/check-calls | Any JWT | Add check call |
| GET | /loads/:id/check-calls | Any JWT | List check calls |
| POST | /loads/:id/rate-confirmation | ADMIN, DISPATCHER | Generate rate confirmation PDF |
| DELETE | /loads/:id | Any JWT | Delete load (soft delete) |

### GET /loads Query Params (via LoadQueryDto)
- `page`, `limit`, `status`, `carrierId`, `orderId`, `search`, `dateFrom`, `dateTo`, `region`

### Load Status Machine
```
DRAFT → PENDING → ASSIGNED → DISPATCHED → IN_TRANSIT → DELIVERED → INVOICED
         ↓
      CANCELLED
```

### POST /loads/:id/assign-carrier
**Request:** `AssignCarrierDto` — `{ carrierId, driverName?, driverPhone?, truckNumber?, trailerNumber?, carrierRate? }`

### POST /loads/:id/rate-confirmation
**Returns:** PDF binary (not JSON envelope)
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="rate-confirmation-{id}.pdf"`
**Request:** `RateConfirmationOptionsDto` — `{ includeAccessorials?: boolean, includeTerms?: boolean, customMessage?: string }`

### GET /loads/board
**Query:** `status` (comma-separated), `region`
**Returns:** Loads grouped for dispatch board view (NOT paginated — designed for board UI)

### PATCH /loads/:id/status
**Request:** `{ status: string, notes?: string }`

---

## OrdersController — `/api/v1/orders`

**Guards:** `JwtAuthGuard` (no default RolesGuard at controller level)

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | /orders | Any JWT | List orders |
| GET | /orders/:id | Any JWT | Get order by ID |
| POST | /orders | Any JWT | Create order |
| POST | /orders/from-quote/:quoteId | Any JWT | Create order from quote |
| POST | /orders/from-template/:templateId | ADMIN, DISPATCHER, SALES_REP | Create from template |
| PUT | /orders/:id | Any JWT | Update order (full replace) |
| PATCH | /orders/:id/status | Any JWT | Change order status |
| DELETE | /orders/:id/cancel | Any JWT | Cancel order |
| DELETE | /orders/:id | Any JWT | Delete order (soft delete, 204) |
| POST | /orders/:id/clone | Any JWT | Clone order (201) |
| GET | /orders/:id/timeline | Any JWT | Activity timeline |
| GET | /orders/:id/history | Any JWT | Status change history |
| GET | /orders/:id/stops | Any JWT | Order stops |
| GET | /orders/:id/loads | Any JWT | Loads for order |
| POST | /orders/:id/loads | Any JWT | Create load for order (201) |
| GET | /orders/:id/items | Any JWT | Order line items |
| POST | /orders/:id/items | Any JWT | Add line item (201) |
| PUT | /orders/:id/items/:itemId | Any JWT | Update line item |
| DELETE | /orders/:id/items/:itemId | Any JWT | Remove line item (204) |

### GET /orders Query Params (via OrderQueryDto)
- `page`, `limit`, `status`, `customerId`, `salesRepId`, `search`, `dateFrom`, `dateTo`

### Order Status Machine
```
PENDING → PROCESSING → IN_TRANSIT → DELIVERED → INVOICED → CLOSED
          ↓
        CANCELLED
```

### PATCH /orders/:id/status
**Request:** `ChangeOrderStatusDto` — `{ status: string, reason?: string }`

### DELETE /orders/:id
Returns `204 No Content` (not `{ data }` envelope) — frontend must handle empty response.

---

## StopsController — `/api/v1/stops` or `/api/v1/loads/:id/stops`

Manages pickup/delivery stops for loads. Referenced by LoadFormSections.

---

## TrackingController — `/api/v1/tms/tracking`

Real-time tracking updates for loads in transit.
- WebSocket: `/tracking` namespace (QS-001 — connection status unclear)
- Polling fallback: 15-second interval

---

## PublicTrackingController — `/api/v1/tms/track/:trackingCode`

**Auth:** `@Public()` — no JWT required
Public tracking page for customers/receivers to check load status by tracking code.

---

## Notes

- `LoadsController` and `OrdersController` both use `JwtAuthGuard` only (no RolesGuard at class level) — most endpoints accessible to any authenticated user
- `DELETE /orders/:id` returns 204 (empty body) — do NOT expect `{ data }` envelope
- Rate confirmation PDF endpoint uses `@Res() res: Response` — bypasses NestJS response serialization
- FMCSA check and carrier assignment logic lives in LoadsService (19KB) and CarriersService
