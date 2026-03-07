# TMS Core Domain Rules

> AI Dev Guide | Source: `dev_docs_v3/01-services/p0-mvp/05-tms-core.md`

---

## Core Lifecycle

```
Order -> Load(s) -> Stop(s) -> CheckCall(s) -> TrackingEvent(s)
```

An Order can have multiple Loads. Each Load has 2+ Stops. Stops are sequenced. Check Calls track driver progress.

## Order Status Machine

```
PENDING -> QUOTED -> BOOKED -> DISPATCHED -> IN_TRANSIT -> DELIVERED -> INVOICED -> COMPLETED
PENDING/QUOTED/BOOKED/DISPATCHED/IN_TRANSIT -> CANCELLED
```

- Status transitions are validated server-side -- no skip-ahead allowed.
- Cancellation is allowed from PENDING through IN_TRANSIT only.

## Load Status Machine

```
PLANNING -> PENDING -> TENDERED -> ACCEPTED -> DISPATCHED
DISPATCHED -> AT_PICKUP -> PICKED_UP -> IN_TRANSIT -> AT_DELIVERY -> DELIVERED -> COMPLETED
TENDERED -> CANCELLED (carrier rejects)
```

## Stop Status Machine

```
PENDING -> ARRIVED (driver arrives) -> DEPARTED (driver departs) -> COMPLETED
```

## Number Formats

- **Order:** `ORD-{YYYYMM}-{NNN}` -- sequential per tenant per month
- **Load:** `LD-{YYYYMM}-{NNNNN}` -- sequential per tenant per month
- Generated server-side on create. Never user-supplied.

## Carrier Assignment Validation

Before assigning a carrier to a load, ALL four checks must pass:
1. Carrier status must be ACTIVE
2. Insurance must not be expired
3. Authority must be AUTHORIZED per FMCSA
4. If load is hazmat, carrier must have Hazmat endorsement

Assignment fails with specific error if any check fails.

## Carrier Lock-Down Rule

- Once a load reaches PICKED_UP status, the assigned carrier CANNOT be changed.
- Carrier field becomes read-only in UI.
- Backend rejects PATCH requests to it.
- Only ADMIN can override via super-admin panel.

## Weight Limits

- Loads must be between 1 and 80,000 lbs.
- Validated at DTO level: `"Weight must be between 1 and 80,000 lbs"`

## Check Call Intervals

| Phase | Interval |
|-------|----------|
| Pre-pickup | 1 hour before |
| In-transit | Every 4 hours |
| Pre-delivery | 1 hour before |

Overdue check calls appear in `/checkcalls/overdue` and surface as P1 alerts on the Operations Dashboard.

## Detention Calculation

```
detentionCharge = max(0, (actualTime - freeTime)) * hourlyRate
```

- Default free time: 2 hours
- Default rate: $75/hr
- Maximum detention: 8 hours per stop
- Automatically calculated when stop moves from ARRIVED to DEPARTED beyond free time

## TONU (Truck Order Not Used)

- If a carrier is dispatched and load is cancelled, TONU fee applies.
- Default: $250 flat. Configurable per carrier.
- Automatically added as accessorial charge.
- Dispatcher must acknowledge TONU before cancellation completes.

## WebSocket Events (QS-001 -- Not Built Yet)

| Namespace | Events |
|-----------|--------|
| `/dispatch` | `load:status:changed`, `load:created`, `load:assigned` |
| `/tracking` | `load:location:updated`, `load:eta:updated` |

WebSocket auth uses same JWT cookie.

## Soft Delete

- Orders, Loads, and Stops use soft delete (`deletedAt` field).
- Hard deletes are forbidden.
- Deleted records excluded from all list queries by default.

## API Endpoints (65 total, all Production)

### Orders: 18 endpoints
### Loads: 22 endpoints
### Stops: 10 endpoints (including arrive/depart actions)
### Check Calls: 8 endpoints (including overdue + bulk)
### Operations Dashboard: 5 endpoints
### Tracking: 2 endpoints

## Critical Status

- Backend: A- (9/10) -- all 65 endpoints production-ready
- Frontend: 0/10 -- zero screens exist
- This is the highest-priority build gap in the entire platform
