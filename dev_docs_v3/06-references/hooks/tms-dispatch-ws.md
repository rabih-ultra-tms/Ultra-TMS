# useDispatchBoardUpdates (TMS WebSocket)

**File:** `apps/web/lib/hooks/tms/use-dispatch-ws.ts`
**LOC:** 526

## Exported Hooks / Classes

| Export | Type | Signature |
|--------|------|-----------|
| `useDispatchBoardUpdates` | Hook | `(options?: DispatchWSOptions) => { isConnected: boolean; lastUpdate: Date }` |
| `EventBatcher` | Class | `new EventBatcher(callback: Function, interval: number)` |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `load:updated` | Server -> Client | Load status/assignment changed |
| `load:created` | Server -> Client | New load created |
| `load:deleted` | Server -> Client | Load removed |
| `driver:status` | Server -> Client | Driver availability changed |
| `dispatch:assignment` | Server -> Client | Carrier/driver assigned to load |
| `dispatch:unassignment` | Server -> Client | Assignment removed |

## API Endpoints Called

None -- pure WebSocket hook. Connects to `/dispatch` namespace.

## Envelope Handling

N/A -- WebSocket events use their own message format, not the REST API envelope.

## Queries (React Query)

No queries defined. Invalidates existing queries on WebSocket events:

- `load:updated` -> invalidates `["dispatch", "board"]`, `["loads", "detail", loadId]`
- `load:created` -> invalidates `["dispatch", "board"]`
- `dispatch:assignment` -> invalidates `["dispatch", "board"]`, `["loads", "detail", loadId]`

## Mutations

None -- receives events only, triggers cache invalidation.

## EventBatcher

Custom class that batches rapid WebSocket events to prevent excessive re-renders:

- Collects events over a configurable interval (default 100ms)
- Flushes batched events as a single update
- Prevents N+1 invalidation storms during bulk operations

## Quality Assessment

- **Score:** 6/10
- **Anti-patterns:**
  - **526 LOC** -- second largest hook file, mixes WebSocket connection management, event batching, and React Query invalidation
  - `EventBatcher` class should be extracted to a utility module
  - No reconnection backoff strategy -- relies on socket-provider defaults
  - No event deduplication -- duplicate events cause redundant invalidations
  - WebSocket namespace `/dispatch` may not exist on backend yet (QS-001 task)
  - Heavy `any` usage in event handler callbacks
- **Dependencies:** `useSocket` from `@/lib/socket/socket-provider`, `useQueryClient`, `EventBatcher` (inline class)
