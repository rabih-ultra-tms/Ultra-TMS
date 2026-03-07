# Sales & TMS Core Screen-to-API Contracts

> Verified from hook source code on 2026-03-07

---

## Quotes

**Source:** `apps/web/lib/hooks/sales/use-quotes.ts`

**IMPORTANT:** Quotes use `/quotes` endpoint, NOT `/sales/quotes`.

### List and Stats

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useQuotes` | GET | `/quotes` | `{ page, limit, search?, status?, customerId?, serviceType?, fromDate?, toDate?, sortBy?, sortOrder? }` | `QuoteListResponse` |
| `useQuoteStats` | GET | `/quotes/stats` | -- | `{ data: QuoteStats }` |

### Detail and Sub-resources

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useQuote` | GET | `/quotes/:id` | -- | `QuoteDetail` (unwrapped) |
| `useQuoteVersions` | GET | `/quotes/:id/versions` | -- | `QuoteVersion[]` (unwrapped) |
| `useQuoteTimeline` | GET | `/quotes/:id/timeline` | -- | `QuoteTimelineEvent[]` (unwrapped) |
| `useQuoteNotes` | GET | `/quotes/:id/notes` | -- | `QuoteNote[]` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateQuote` | POST | `/quotes` | mapped DTO via `mapFormToDto()` | `Quote` (unwrapped) |
| `useUpdateQuote` | PATCH | `/quotes/:id` | mapped DTO via `mapFormToDto()` | `Quote` (unwrapped) |
| `useDeleteQuote` | DELETE | `/quotes/:id` | -- | success |
| `useCloneQuote` | POST | `/quotes/:id/clone` | -- | `Quote` (unwrapped) |
| `useSendQuote` | POST | `/quotes/:id/send` | -- | `Quote` (unwrapped) |
| `useAcceptQuote` | POST | `/quotes/:id/accept` | -- | `Quote` (unwrapped) |
| `useRejectQuote` | POST | `/quotes/:id/reject` | `{ reason }` | `Quote` (unwrapped) |
| `useConvertQuote` | POST | `/quotes/:id/convert` | -- | `{ orderId, orderNumber }` (unwrapped) |
| `useCreateQuoteVersion` | POST | `/quotes/:id/version` | -- | `Quote` (unwrapped) |
| `useAddQuoteNote` | POST | `/quotes/:id/notes` | `{ content }` | `QuoteNote` |
| `useCalculateRate` | POST | `/quotes/calculate-rate` | `CalculateRateRequest` | `CalculateRateResponse` |

### Quote Form DTO Mapping (`mapFormToDto`)

```typescript
// Frontend QuoteFormValues -> Backend DTO
{
  companyId: formData.customerId,
  contactId: formData.contactId,
  customerName: formData.customerName,
  serviceType, equipmentType, commodity,
  weightLbs: formData.weight,
  pieces, pallets,
  linehaulRate, fuelSurcharge,
  accessorialsTotal,  // sum of accessorials[].amount
  totalAmount,        // linehaul + fuelSurcharge + accessorialsTotal
  internalNotes,
  validUntil,         // calculated from validityDays
  stops: [{ stopType, stopSequence, city, state, addressLine1, postalCode, ... }],
}
```

### Quote Cache Keys

```typescript
// All use flat key: ["quotes", ...]
["quotes", "list", params]
["quotes", "stats"]
["quotes", "detail", id]
["quotes", "versions", id]
["quotes", "timeline", id]
["quotes", "notes", id]
```

---

## Orders

**Source:** `apps/web/lib/hooks/tms/use-orders.ts`

**IMPORTANT:** Orders use `/orders` endpoint, NOT `/tms/orders`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useOrders` | GET | `/orders?page=&limit=&search=&status=&fromDate=&toDate=` | URLSearchParams | `{ data: Order[], pagination }` (unwrapped) |
| `useOrder` | GET | `/orders/:id` | -- | `OrderDetailResponse` (unwrapped) |
| `useOrderLoads` | GET | `/orders/:orderId/loads` | -- | `OrderLoad[]` (unwrapped) |
| `useOrderTimeline` | GET | `/orders/:orderId/timeline` | -- | `TimelineEvent[]` (unwrapped) |
| `useOrderDocuments` | GET | `/orders/:orderId/documents` | -- | `OrderDocument[]` (unwrapped) |
| `useOrderFromQuote` | GET | `/quotes/:quoteId` | -- | `OrderDetailResponse` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateOrder` | POST | `/orders` | `mapFormToApi(formData, status)` | `Order` (unwrapped) |
| `useUpdateOrder` | PUT | `/orders/:id` | `mapFormToApi(formData, status)` | `Order` (unwrapped) |

### Order Form DTO Mapping (`mapFormToApi`)

```typescript
{
  customerId, status,
  customerReferenceNumber, poNumber, bolNumber,
  salesRepId, priority, internalNotes,
  commodity, weightLbs, pieceCount, palletCount,
  equipmentType, isHazmat, hazmatClass, hazmatUnNumber, hazmatPlacard,
  temperatureMin, temperatureMax,
  specialHandling,
  customerRate, fuelSurcharge, estimatedCarrierRate,
  paymentTerms, billingContactId, billingNotes,
  accessorials: [{ type, amount, notes }],
  stops: [{ stopType, stopSequence, facilityName, addressLine1, city, state, postalCode, contactName, contactPhone, appointmentDate, appointmentTimeStart, appointmentTimeEnd, specialInstructions, referenceNumber }],
}
```

### Order Cache Keys

```typescript
orderKeys = {
  all: ["orders"],
  lists: () => ["orders", "list"],
  list: (params) => ["orders", "list", params],
  detail: (id) => ["orders", "detail", id],
};
// Also: ["order-loads", orderId], ["order-timeline", orderId], ["order-documents", orderId]
```

---

## Loads

**Source:** `apps/web/lib/hooks/tms/use-loads.ts`

**IMPORTANT:** Loads use `/loads` endpoint, NOT `/tms/loads`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useLoads` | GET | `/loads?page=&limit=&search=&status=&carrierId=&equipmentType=&fromDate=&toDate=` | URLSearchParams | `{ data: Load[], total, page, limit }` |
| `useLoad` | GET | `/loads/:id` | -- | `LoadDetailResponse` (unwrapped) |
| `useLoadStats` | GET | `/loads/stats` | -- | `LoadStats` (unwrapped) |
| `useLoadTimeline` | GET | `/loads/:id/check-calls?limit=50` | -- | mapped to timeline events |
| `useCarriers` (in use-loads) | GET | `/carriers?search=&equipmentType=&...` | URLSearchParams | `{ data: CarrierWithScore[], total }` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateLoad` | POST | `/loads` | `CreateLoadInput` (mapped) | `Load` (unwrapped) |
| `useUpdateLoad` | PUT | `/loads/:loadId` | `UpdateLoadInput` (mapped) | `Load` (unwrapped) |
| `useDeleteLoad` | DELETE | `/loads/:loadId` | -- | success |
| `useBulkUpdateLoadStatus` | PATCH | `/loads/:id/status` (loop) | `{ status }` per load | `{ updated, failed }` |
| `useBulkAssignCarrier` | PATCH | `/loads/:id/assign` (loop) | `{ carrierId }` per load | `{ updated, failed }` |

### Load Field Mapping Notes

```typescript
// Frontend -> Backend
fuelSurcharge -> fuelAdvance
accessorials[] -> accessorialCosts (summed)
```

### Load Cache Keys

```typescript
["loads", params]           // list
["load", id]                // detail
["load-stats"]              // stats
["load-timeline", id]       // timeline
["carriers", "search", params]  // carrier search
```

---

## Stops

**Source:** `apps/web/lib/hooks/tms/use-stops.ts`

**IMPORTANT:** Stops are nested under orders: `/orders/:orderId/stops`, NOT `/tms/stops`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useStops` | GET | `/orders/:orderId/stops` | -- | `Stop[]` (unwrapped) |
| `useStop` | GET | `/orders/:orderId/stops/:id` | -- | `Stop` (unwrapped) |
| `useStopDetention` | -- | -- | -- | Client-side stub (disabled, no backend endpoint) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateStop` | POST | `/orders/:orderId/stops` | `Partial<Stop>` | `Stop` (unwrapped) |
| `useUpdateStop` | PUT | `/orders/:orderId/stops/:stopId` | `Partial<Stop>` | `Stop` (unwrapped) |
| `useUpdateStopStatus` | PUT | `/orders/:orderId/stops/:stopId` | `{ status }` | `Stop` (unwrapped) |
| `useMarkArrived` | POST | `/orders/:orderId/stops/:stopId/arrive` | `{ arrivedAt }` | `Stop` (unwrapped) |
| `useMarkDeparted` | POST | `/orders/:orderId/stops/:stopId/depart` | `{ departedAt }` | `Stop` (unwrapped) |
| `useDeleteStop` | DELETE | `/orders/:orderId/stops/:stopId` | -- | success |
| `useReorderStops` | PUT | `/orders/:orderId/stops/reorder` | `{ stopIds: string[] }` | `Stop[]` (unwrapped) |

### Stop Cache Keys

```typescript
["orders", orderId, "stops"]           // list
["orders", orderId, "stops", stopId]   // detail
["stops", stopId, "detention"]         // detention (disabled)
```

---

## Check Calls

**Source:** `apps/web/lib/hooks/tms/use-checkcalls.ts`

**IMPORTANT:** Check calls are nested under loads: `/loads/:loadId/check-calls`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCheckCalls` | GET | `/loads/:loadId/check-calls` | -- | `CheckCall[]` (mapped from backend fields) |
| `useOverdueCheckCalls` | -- | -- | -- | Client-side stub (disabled) |
| `useCheckCallStats` | -- | -- | -- | Client-side stub (disabled) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateCheckCall` | POST | `/loads/:loadId/check-calls` | mapped payload (see below) | `CheckCall` (unwrapped) |

### Check Call Field Mapping

```typescript
// Frontend -> Backend DTO
{
  timestamp: calledAt,     // not "calledAt"
  status: type,            // form "type" -> DTO "status"
  city, state, notes,
  location: locationDescription,  // not "locationDescription"
  lat, lng,
  eta: etaToNextStop,      // not "etaToNextStop"
}
```

### Check Call Cache Keys

```typescript
["checkcalls", loadId]       // list
["check-calls", loadId]      // alternate key (both invalidated)
["overdue-checkcalls"]       // disabled
["checkcall-stats"]          // disabled
```

---

## Rate Confirmation

**Source:** `apps/web/lib/hooks/tms/use-rate-confirmation.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useRateConfirmation.generate` | POST | `/loads/:loadId/rate-confirmation` | `RateConfirmationOptions` | `Blob` (PDF) |
| `useRateConfirmation.emailToCarrier` | POST | `/loads/:loadId/rate-confirmation` | `{ ...options, sendToCarrier: true }` | `Blob` (PDF) |

**Note:** This hook uses raw `fetch()` instead of `apiClient` because it needs blob response. It manually reads the auth cookie for the Authorization header.
