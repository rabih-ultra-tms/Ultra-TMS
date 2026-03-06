# Sprint 1 — Phase 4: Sales + TMS Core Quality (Weeks 7-8)
> 9 tasks | 40-55h estimated | Prereq: FIX-001 (socket), FIX-002 (envelope) complete

---

## SVC-SALES-001: Sales Hook Fixes [P0]
**Effort:** M (3-4h) | 11+ hooks reported broken

### Hooks to Fix
| Hook | File | Action |
|------|------|--------|
| useQuotes | `lib/hooks/use-quotes.ts` | Verify & fix all queryFn/mutationFn |

**Note:** Sales has fewer hook files but the `useQuotes` hook likely has many query/mutation functions inside. Need to check every function.

### Sub-tasks
1. **SALES-001a:** Open `use-quotes.ts`, check every `queryFn` and `mutationFn` for envelope unwrapping
2. **SALES-001b:** Check quote-related hooks in other files (rate confirmation, accessorial rates)
3. **SALES-001c:** Verify quote creation flow: new quote → add line items → calculate totals → save
4. **SALES-001d:** Verify quote-to-order conversion
5. **SALES-001e:** Fix mutation responses (create/update quote should return the created/updated object)

### Acceptance Criteria
- [ ] All sales hooks return unwrapped data
- [ ] Quote CRUD works end-to-end
- [ ] Quote-to-order conversion works
- [ ] Rate calculations produce correct numbers

---

## SVC-SALES-002: Quote Pages Quality Pass [P1]
**Effort:** M (4-6h) | PROTECT Load Planner

### Pages to Fix (4 pages + PROTECTED Load Planner)
| Page | Route | Key Checks |
|------|-------|-----------|
| Quotes List | `/quotes` | Data table, filters, search, pagination |
| Quote Detail | `/quotes/[id]` | All sections render, status badge, actions |
| Quote New | `/quotes/new` | Form validation, line item management |
| Quote Edit | `/quotes/[id]/edit` | Pre-population, save |
| Quote History | `/quote-history` | Historical data loads |
| **Load Planner** | `/load-planner/[id]/edit` | **PROTECTED — DO NOT TOUCH** |

### Sub-tasks
1. **SALES-002a:** Fix quotes list page — data loading, pagination, search
2. **SALES-002b:** Fix quote detail page — all sections render correctly
3. **SALES-002c:** Fix quote create/edit forms — validation, line items, rate calculation
4. **SALES-002d:** Verify 4-state on each page (loading/error/empty/data)
5. **SALES-002e:** Verify quote status workflow: Draft → Sent → Accepted → Converted to Order
6. **SALES-002f:** Test rate confirmation PDF generation (if exists)

### PROTECT Rules
- `/load-planner/[id]/edit` — 1,825 LOC, working, AI cargo extraction — **DO NOT MODIFY**
- Any component in `components/load-planner/` — read-only unless specifically broken

### Acceptance Criteria
- [ ] Quote CRUD pages work end-to-end
- [ ] Quote status transitions work
- [ ] All pages show 4 states
- [ ] Load Planner untouched and still working

---

## SVC-SALES-003: Sales Module Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Sub-tasks
1. **SALES-003a:** Audit existing 5 backend test files
2. **SALES-003b:** Add tests for:
   - Quote CRUD with tenant isolation
   - Rate calculation accuracy
   - Quote-to-order conversion
   - Accessorial rate application
   - Quote status transitions
3. **SALES-003c:** Frontend test: quote form validation

### Acceptance Criteria
- [ ] 15+ tests passing for sales module
- [ ] Rate calculations verified with known inputs/outputs
- [ ] Quote lifecycle tested

---

## SVC-TMS-001: TMS Hook Fixes [P0]
**Effort:** M (3-4h)

### Hooks to Fix (10 files)
| Hook | File | Action |
|------|------|--------|
| useCheckcalls | `lib/hooks/tms/use-checkcalls.ts` | Verify & fix |
| useDispatch | `lib/hooks/tms/use-dispatch.ts` | Verify & fix |
| useDispatchWs | `lib/hooks/tms/use-dispatch-ws.ts` | Socket — verify event handling |
| useLoadBoard | `lib/hooks/tms/use-load-board.ts` | Verify & fix |
| useLoads | `lib/hooks/tms/use-loads.ts` | CORRECT — migrate local unwrap to shared |
| useOpsDashboard | `lib/hooks/tms/use-ops-dashboard.ts` | Verify & fix |
| useOrders | `lib/hooks/tms/use-orders.ts` | Verify & fix |
| useRateConfirmation | `lib/hooks/tms/use-rate-confirmation.ts` | Verify & fix |
| useStops | `lib/hooks/tms/use-stops.ts` | Verify & fix |
| useTracking | `lib/hooks/tms/use-tracking.ts` | Verify & fix |

### Sub-tasks
1. **TMS-001a:** Fix all REST hooks (9 files) — apply shared `unwrap()`
2. **TMS-001b:** Migrate `useLoads` local unwrap to shared import
3. **TMS-001c:** Verify `useDispatchWs` handles socket events correctly
4. **TMS-001d:** Test each hook's consumer page after fix
5. **TMS-001e:** Remove any stubs that have backend endpoints now (check `useLoadStats`, `useLoadTimeline`)

### Acceptance Criteria
- [ ] All 10 TMS hooks verified and fixed
- [ ] REST hooks use shared `unwrap()`
- [ ] Socket hook handles events correctly
- [ ] Stubs with existing backends converted to real API calls

---

## SVC-TMS-002: Dispatch Board Runtime Fix [P0 CRITICAL]
**Effort:** L (6-8h) | Depends: FIX-001 (SocketProvider)

### Context
The dispatch board is the #1 operational screen — dispatchers live in it all day. Currently broken due to socket issues and potential data loading problems.

### Files
- `apps/web/app/(dashboard)/operations/dispatch/page.tsx`
- `apps/web/lib/hooks/tms/use-dispatch.ts`
- `apps/web/lib/hooks/tms/use-dispatch-ws.ts`
- `apps/web/lib/socket/socket-provider.tsx` (fixed in FIX-001)
- Related components in `apps/web/components/operations/` or `apps/web/components/dispatch/`

### Sub-tasks
1. **TMS-002a:** Verify dispatch page loads with data (after hook fix)
2. **TMS-002b:** Verify WebSocket connection establishes and receives real-time updates
3. **TMS-002c:** Test load assignment: drag load → assign to carrier → status updates
4. **TMS-002d:** Test status transitions on dispatch board: Available → Dispatched → In Transit → Delivered
5. **TMS-002e:** Verify dispatch board stays stable for 10+ minutes (no memory leak, no disconnects)
6. **TMS-002f:** Add error recovery: if WebSocket drops, show banner + auto-reconnect
7. **TMS-002g:** Add optimistic updates for drag-and-drop operations

### Acceptance Criteria
- [ ] Dispatch board loads with real data
- [ ] Real-time updates via WebSocket work
- [ ] Load assignment works
- [ ] Status transitions work
- [ ] Stable for 10+ minutes without degradation
- [ ] Graceful degradation on WebSocket failure

---

## SVC-TMS-003: Operations Dashboard Fix [P0]
**Effort:** M (4-6h)

### Context
The main operations dashboard aggregates key metrics. Needs to show real data from the API.

### Files
- `apps/web/app/(dashboard)/operations/page.tsx`
- `apps/web/lib/hooks/tms/use-ops-dashboard.ts`

### Sub-tasks
1. **TMS-003a:** Verify dashboard data loads (hook unwraps correctly)
2. **TMS-003b:** Verify KPI cards show real numbers (not zeros or stubs)
3. **TMS-003c:** Check if backend endpoint exists for dashboard data — if not, create it
4. **TMS-003d:** Add 4-state handling (loading skeleton, error, empty, data)
5. **TMS-003e:** Verify chart/graph components render with data

### Acceptance Criteria
- [ ] Dashboard shows real operational metrics
- [ ] KPI cards: total loads, in-transit, delivered today, revenue
- [ ] 4-state handling works
- [ ] Refresh on interval (auto-update every 30s)

---

## SVC-TMS-004: Tracking Map Fix [P0]
**Effort:** L (6-8h)

### Context
Load tracking with map display. Requires Google Maps integration and real-time position updates.

### Files
- `apps/web/app/(dashboard)/operations/tracking/page.tsx`
- `apps/web/lib/hooks/tms/use-tracking.ts`
- `apps/web/components/load-planner/route-map.tsx` (PROTECTED — read patterns from it)

### Sub-tasks
1. **TMS-004a:** Verify tracking page loads with data
2. **TMS-004b:** Verify Google Maps renders with markers
3. **TMS-004c:** Verify shipment status timeline renders
4. **TMS-004d:** Verify real-time position updates via WebSocket
5. **TMS-004e:** Test tracking search by load number, reference, BOL
6. **TMS-004f:** Add public tracking page verification (`/tracking/[id]`)
7. **TMS-004g:** Add shipment status indicators (color-coded markers on map)

### Google Maps Key
Already configured: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`

### Acceptance Criteria
- [ ] Map renders with shipment locations
- [ ] Real-time updates move markers
- [ ] Status timeline shows chronological events
- [ ] Public tracking page works (no auth required)
- [ ] Search by load number works

---

## SVC-TMS-005: TMS Pages Quality Pass [P1]
**Effort:** M (4-6h)

### Pages to Fix (17 operations pages)
| Page | Route | Key Checks |
|------|-------|-----------|
| Operations Home | `/operations` | Dashboard data |
| Dispatch Board | `/operations/dispatch` | Fixed in TMS-002 |
| Load List | `/operations/loads` | Data table |
| Load Detail | `/operations/loads/[id]` | All tabs |
| Load Create | `/operations/loads/new` | Form validation |
| Order List | `/operations/orders` | Has TODO comment — fix |
| Order Detail | `/operations/orders/[id]` | Detail view |
| Order Create | `/operations/orders/new` | Form |
| Tracking | `/operations/tracking` | Fixed in TMS-004 |
| Load History | `/load-history` | Historical data |
| Load History Detail | `/load-history/[id]` | **MISSING — create** |

### Sub-tasks
1. **TMS-005a:** Quality pass on each page — 4-state verification
2. **TMS-005b:** Create missing `/load-history/[id]` detail page
3. **TMS-005c:** Fix orders page TODO comment
4. **TMS-005d:** Verify load CRUD works end-to-end
5. **TMS-005e:** Verify order CRUD works end-to-end
6. **TMS-005f:** Check all data tables have pagination, search, and filters

### Acceptance Criteria
- [ ] All 17 TMS pages show 4 states
- [ ] Load and order CRUD works
- [ ] Missing detail pages created
- [ ] TODO comments resolved

---

## SVC-TMS-006: TMS Module Tests [P1]
**Effort:** L (6-8h) | Operations: 4,869 LOC, 0 tests → target 25+ tests

### Test Files
- **Existing:** `apps/api/src/modules/tms/` has 4 spec files
- **Missing:** `apps/api/src/modules/operations/` has 0 spec files (4,869 LOC)
- **Target:** 25+ meaningful tests total

### Sub-tasks

#### TMS-006a: Operations Module Tests (highest priority)
**Create:** `apps/api/src/modules/operations/carriers/carriers.service.spec.ts`
```typescript
describe('OperationsCarriersService', () => {
  it('should list carriers for tenant')
  it('should not leak carriers across tenants')
  it('should create carrier with driver and truck')
  it('should update carrier status')
  it('should handle FMCSA lookup')
});
```

**Create:** `apps/api/src/modules/operations/equipment/equipment.service.spec.ts`
**Create:** `apps/api/src/modules/operations/truck-types/truck-types.service.spec.ts`
**Create:** `apps/api/src/modules/operations/load-history/load-history.service.spec.ts`

#### TMS-006b: TMS Core Module Tests
Add to existing test files:
- Loads: CRUD, status transitions, tenant isolation
- Orders: CRUD, order-to-load conversion
- Stops: CRUD, sequence management
- Tracking: Status updates, timeline

#### TMS-006c: Frontend TMS Tests
**Create:** `apps/web/__tests__/tms/dispatch-board.test.tsx`
**Create:** `apps/web/__tests__/tms/load-list.test.tsx`

### Acceptance Criteria
- [ ] 25+ tests passing for TMS + Operations modules
- [ ] Operations module: 10+ tests (carriers, equipment, truck-types)
- [ ] TMS core: 10+ tests (loads, orders, stops, tracking)
- [ ] Frontend: 5+ tests (dispatch board, load list)
- [ ] Tenant isolation verified in operations module

---

## Phase 4 Summary

| Task | Priority | Effort | Scope |
|------|----------|--------|-------|
| SVC-SALES-001 | P0 | M (3-4h) | Sales hooks |
| SVC-SALES-002 | P1 | M (4-6h) | 4 quote pages + history |
| SVC-SALES-003 | P1 | M (3-4h) | 15+ tests |
| SVC-TMS-001 | P0 | M (3-4h) | 10 TMS hooks |
| SVC-TMS-002 | P0 CRITICAL | L (6-8h) | Dispatch board |
| SVC-TMS-003 | P0 | M (4-6h) | Ops dashboard |
| SVC-TMS-004 | P0 | L (6-8h) | Tracking map |
| SVC-TMS-005 | P1 | M (4-6h) | 17 pages quality |
| SVC-TMS-006 | P1 | L (6-8h) | 25+ tests (4,869 LOC) |
| **TOTAL** | | **40-55h** | |

### Execution Order
1. SVC-SALES-001 + SVC-TMS-001 (hook fixes — parallel, independent)
2. SVC-TMS-002 (dispatch board — critical, depends on FIX-001)
3. SVC-TMS-003 + SVC-TMS-004 (dashboard + tracking — can parallel)
4. SVC-SALES-002 + SVC-TMS-005 (page quality — can parallel)
5. SVC-SALES-003 + SVC-TMS-006 (tests — do after fixes)
