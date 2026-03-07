# Carrier & Load Board Screen-to-API Contracts

> Verified from hook source code on 2026-03-07

---

## Carrier Management

**Source:** `apps/web/lib/hooks/operations/use-carriers.ts`

**IMPORTANT:** Carriers use `/operations/carriers` endpoint, NOT `/carriers`.

### Carrier CRUD

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCarriers` | GET | `/operations/carriers` | `{ page, limit, search?, status?, carrierType?, state?, sortBy?, sortOrder?, tier?, equipmentTypes?, compliance?, minScore? }` | `{ data: Carrier[], pagination }` |
| `useCarrier` | GET | `/operations/carriers/:id` | -- | `{ data: Carrier }` |
| `useCreateCarrier` | POST | `/operations/carriers` | `Partial<OperationsCarrier>` (empty strings stripped) | `OperationsCarrier` |
| `useUpdateCarrier` | PATCH | `/operations/carriers/:id` | `Partial<OperationsCarrier>` (empty strings stripped) | `OperationsCarrier` |
| `useDeleteCarrier` | DELETE | `/operations/carriers/:id` | -- | success |
| `useCarrierStats` | GET | `/operations/carriers/stats` | -- | `{ data: { total, byType, byStatus } }` |

### Carrier Drivers

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCarrierDrivers` | GET | `/operations/carriers/:carrierId/drivers` | -- | `OperationsCarrierDriver[]` |
| `useCarrierDriver` | GET | `/operations/carriers/:carrierId/drivers/:driverId` | -- | `OperationsCarrierDriver` |
| `useCreateDriver` | POST | `/operations/carriers/:carrierId/drivers` | `Partial<OperationsCarrierDriver>` | `OperationsCarrierDriver` |
| `useUpdateDriver` | PATCH | `/operations/carriers/:carrierId/drivers/:driverId` | `Partial<OperationsCarrierDriver>` | `OperationsCarrierDriver` |
| `useDeleteDriver` | DELETE | `/operations/carriers/:carrierId/drivers/:driverId` | -- | success |
| `useUpdateDriverById` | PATCH | `/operations/carriers/:carrierId/drivers/:driverId` | `{ driverId, data }` | `OperationsCarrierDriver` |
| `useDeleteDriverById` | DELETE | `/operations/carriers/:carrierId/drivers/:driverId` | driverId as arg | success |

### Carrier Trucks

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCarrierTrucks` | GET | `/operations/carriers/:carrierId/trucks` | -- | `OperationsCarrierTruck[]` |
| `useCarrierTruck` | GET | `/operations/carriers/:carrierId/trucks/:truckId` | -- | `OperationsCarrierTruck` |
| `useCreateTruck` | POST | `/operations/carriers/:carrierId/trucks` | `Partial<OperationsCarrierTruck>` | `OperationsCarrierTruck` |
| `useUpdateTruck` | PATCH | `/operations/carriers/:carrierId/trucks/:truckId` | `Partial<OperationsCarrierTruck>` | `OperationsCarrierTruck` |
| `useDeleteTruck` | DELETE | `/operations/carriers/:carrierId/trucks/:truckId` | -- | success |
| `useAssignDriverToTruck` | PATCH | `/operations/carriers/:carrierId/trucks/:truckId/assign-driver/:driverId` | -- | `OperationsCarrierTruck` |
| `useUpdateTruckById` | PATCH | `/operations/carriers/:carrierId/trucks/:truckId` | `{ truckId, data }` | `OperationsCarrierTruck` |
| `useDeleteTruckById` | DELETE | `/operations/carriers/:carrierId/trucks/:truckId` | truckId as arg | success |

### Carrier Documents

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCarrierDocuments` | GET | `/operations/carriers/:carrierId/documents` | -- | `OperationsCarrierDocument[]` |
| `useCreateCarrierDocument` | POST | `/operations/carriers/:carrierId/documents` | `{ documentType, name, description?, expiryDate? }` | `OperationsCarrierDocument` |
| `useDeleteCarrierDocument` | DELETE | `/operations/carriers/:carrierId/documents/:documentId` | -- | success |

### Carrier Cache Keys

```typescript
// All use "carriers" as base key
["carriers", "list", params]                    // list
["carriers", id]                                // detail
["carriers", "stats"]                           // stats
["carriers", carrierId, "drivers"]              // drivers list
["carriers", carrierId, "drivers", driverId]    // driver detail
["carriers", carrierId, "trucks"]               // trucks list
["carriers", carrierId, "trucks", truckId]      // truck detail
["carriers", carrierId, "documents"]            // documents list
```

---

## Carrier Scorecard

**Source:** `apps/web/lib/hooks/carriers/use-carrier-scorecard.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCarrierScorecard` | GET | `/operations/carriers/:carrierId/scorecard` | -- | `CarrierScorecardResponse` (unwrapped from `{ data }`) |

### Scorecard Cache Keys

```typescript
["carriers", carrierId, "scorecard"]
```

---

## FMCSA Lookup

**Source:** `apps/web/lib/hooks/carriers/use-fmcsa.ts`

**IMPORTANT:** FMCSA lookup uses `/carriers/fmcsa/lookup/dot/:dotNumber` or `/carriers/fmcsa/lookup/mc/:mcNumber`, NOT `/carriers/fmcsa/:mc`.

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useFmcsaLookup` (mutation) | GET | `/carriers/fmcsa/lookup/dot/:dotNumber` OR `/carriers/fmcsa/lookup/mc/:mcNumber` | `{ dotNumber? }` or `{ mcNumber? }` | `FmcsaCarrierRecord` (unwrapped) |
| `useCsaScores` | GET | `/carriers/:carrierId/csa-scores` | -- | `CsaScore[]` (unwrapped from `{ data }`) |

### FMCSA Cache Keys

```typescript
// useFmcsaLookup is a mutation (no cache key)
["csa-scores", carrierId]
```

---

## Load Board: Dashboard

**Source:** `apps/web/lib/hooks/load-board/use-loadboard-dashboard.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useLoadBoardDashboardStats` | GET | `/load-board/analytics/posts` | -- | `LoadBoardDashboardStats` (unwrapped) |
| `useRecentPostings` | GET | `/load-postings?limit=N&status=ACTIVE` | -- | `RecentPosting[]` (from `data` array) |

### Load Board Dashboard Cache Keys

```typescript
["load-board-dashboard", "stats"]
["load-board-dashboard", "recent", limit]
```

---

## Load Board: Posts (TMS module)

**Source:** `apps/web/lib/hooks/tms/use-load-board.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useLoadPosts` | GET | `/load-board/posts?page=&limit=&search=&status=&originState=&destState=&pickupDateFrom=&pickupDateTo=&minRate=&maxRate=&equipmentType=` | URLSearchParams | `LoadBoardListResponse` (unwrapped) |
| `useLoadPost` | GET | `/load-board/posts/:id` | -- | `LoadPost` (unwrapped) |
| `useLoadBoardStats` | GET | `/load-board/stats` | -- | `LoadBoardStats` (unwrapped) |

### Load Board Posts Cache Keys

```typescript
["load-posts", filters]
["load-post", id]
["load-board-stats"]
```

---

## Load Postings (Posting CRUD + Bids)

**Source:** `apps/web/lib/hooks/load-board/use-postings.ts`

**IMPORTANT:** Load postings use `/load-postings` endpoint, NOT `/load-board/postings`.

### Posting CRUD

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `usePostings` | GET | `/load-postings?originCity=&originState=&radiusMiles=&destCity=&destState=&equipmentType=&pickupDateFrom=&pickupDateTo=&minRate=&maxRate=&status=&page=&limit=` | URLSearchParams | `LoadPostingListResponse` (unwrapped) |
| `useSearchPostings` | POST | `/load-postings/search` | `LoadPostingSearchFilters` | `LoadPostingListResponse` (unwrapped) |
| `usePosting` | GET | `/load-postings/:id` | -- | `LoadPosting` (unwrapped) |
| `useCreatePosting` | POST | `/load-postings` | `CreateLoadPostingPayload` | `LoadPosting` (unwrapped) |
| `useUpdatePosting` | PUT | `/load-postings/:id` | `Partial<CreateLoadPostingPayload>` | `LoadPosting` (unwrapped) |
| `useCancelPosting` | PUT | `/load-postings/:id` | `{ status: "CANCELLED" }` | `LoadPosting` (unwrapped) |

### Bid Management

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useBids` | GET | `/load-bids/posting/:postingId` | -- | `LoadBidListResponse` (unwrapped) |
| `useAcceptBid` | POST | `/load-bids/:bidId/accept` | `{}` | `LoadBid` (unwrapped) |
| `useRejectBid` | POST | `/load-bids/:bidId/reject` | `{ rejectionReason }` | `LoadBid` (unwrapped) |
| `useCounterBid` | POST | `/load-bids/:bidId/counter` | `{ counterAmount, counterNotes? }` | `LoadBid` (unwrapped) |

### Carrier Matching and Tendering

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCarrierMatches` | GET | `/load-bids/posting/:postingId/matches` | -- | `CarrierMatch[]` (from `data` array) |
| `useTenderToCarrier` | POST | `/load-tenders` | `{ postingId, carrierId, tenderType: "SPECIFIC" }` | success |

### Load Posting Cache Keys

```typescript
["load-postings", "list", params]
["load-postings", "detail", id]
["load-postings", "bids", postingId]
["load-postings", "matches", postingId]
["load-postings-search", filters]
```
