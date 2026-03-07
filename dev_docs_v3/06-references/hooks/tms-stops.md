# useStops (TMS)

**File:** `apps/web/lib/hooks/tms/use-stops.ts`
**LOC:** 271

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useStops` | `(loadId: string) => UseQueryResult<Stop[]>` |
| `useStop` | `(loadId: string, stopId: string) => UseQueryResult<{ data: Stop }>` |
| `useCreateStop` | `() => UseMutationResult<{ data: Stop }, Error, { loadId: string; data: Partial<Stop> }>` |
| `useUpdateStop` | `() => UseMutationResult<{ data: Stop }, Error, { loadId: string; stopId: string; data: Partial<Stop> }>` |
| `useDeleteStop` | `() => UseMutationResult<void, Error, { loadId: string; stopId: string }>` |
| `useReorderStops` | `() => UseMutationResult<void, Error, { loadId: string; stopIds: string[] }>` |
| `useUpdateStopStatus` | `() => UseMutationResult<void, Error, { loadId: string; stopId: string; status: string }>` |
| `useDetentionTime` | `(loadId: string, stopId: string) => UseQueryResult<DetentionInfo>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useStops | GET | /loads/:loadId/stops | Stop[] |
| useStop | GET | /loads/:loadId/stops/:stopId | `{ data: Stop }` |
| useCreateStop | POST | /loads/:loadId/stops | `{ data: Stop }` |
| useUpdateStop | PATCH | /loads/:loadId/stops/:stopId | `{ data: Stop }` |
| useDeleteStop | DELETE | /loads/:loadId/stops/:stopId | void |
| useReorderStops | POST | /loads/:loadId/stops/reorder | void |
| useUpdateStopStatus | PATCH | /loads/:loadId/stops/:stopId/status | void |
| useDetentionTime | GET | /loads/:loadId/stops/:stopId/detention | DetentionInfo |

## Envelope Handling

Uses custom `unwrap<T>()` helper to extract `response.data.data` from API responses. List query returns array directly (not paginated).

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["loads", loadId, "stops", "list"]` | default | `!!loadId` |
| `["loads", loadId, "stops", "detail", stopId]` | default | `!!loadId && !!stopId` |
| `["loads", loadId, "stops", stopId, "detention"]` | default | `!!loadId && !!stopId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateStop | POST /loads/:loadId/stops | stops list | Yes |
| useUpdateStop | PATCH /loads/:loadId/stops/:stopId | detail + list | Yes |
| useDeleteStop | DELETE /loads/:loadId/stops/:stopId | stops list | Yes |
| useReorderStops | POST .../reorder | stops list | Yes |
| useUpdateStopStatus | PATCH .../status | detail + list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - `useDetentionTime` is a stub -- query is defined but the endpoint may not exist yet
  - Custom `unwrap` helper duplicates logic that should be centralized
  - No optimistic reordering for drag-and-drop stop reorder
- **Dependencies:** `apiClient`, `sonner`, custom `unwrap` helper, types from TMS module
