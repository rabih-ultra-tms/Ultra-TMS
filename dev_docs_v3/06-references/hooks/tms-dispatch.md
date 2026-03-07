# useDispatch (TMS)

**File:** `apps/web/lib/hooks/tms/use-dispatch.ts`
**LOC:** 612

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useDispatchBoard` | `(params?: DispatchBoardParams) => UseQueryResult<DispatchBoardData>` |
| `useDispatchLoad` | `(loadId: string) => UseQueryResult<{ data: DispatchLoad }>` |
| `useAssignLoad` | `() => UseMutationResult<void, Error, AssignLoadInput>` |
| `useUnassignLoad` | `() => UseMutationResult<void, Error, string>` |
| `useUpdateDispatchStatus` | `() => UseMutationResult<void, Error, { loadId: string; status: string }>` |
| `useBulkAssign` | `() => UseMutationResult<void, Error, BulkAssignInput>` |
| `useBulkUpdateStatus` | `() => UseMutationResult<void, Error, { loadIds: string[]; status: string }>` |
| `useAvailableDrivers` | `(params?: DriverSearchParams) => UseQueryResult<AvailableDriver[]>` |
| `useAvailableTrucks` | `(params?: TruckSearchParams) => UseQueryResult<AvailableTruck[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useDispatchBoard | GET | /dispatch/board | DispatchBoardData |
| useDispatchLoad | GET | /dispatch/loads/:id | `{ data: DispatchLoad }` |
| useAssignLoad | POST | /dispatch/loads/:id/assign | void |
| useUnassignLoad | POST | /dispatch/loads/:id/unassign | void |
| useUpdateDispatchStatus | PATCH | /dispatch/loads/:id/status | void |
| useBulkAssign | POST | /dispatch/bulk-assign | void |
| useBulkUpdateStatus | PATCH | /dispatch/bulk-status | void |
| useAvailableDrivers | GET | /dispatch/available-drivers | AvailableDriver[] |
| useAvailableTrucks | GET | /dispatch/available-trucks | AvailableTruck[] |

## Envelope Handling

Board query returns complex object (not paginated). Detail uses standard `{ data: T }` envelope. Available drivers/trucks return raw arrays.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["dispatch", "board", params]` | default | Always |
| `["dispatch", "loads", "detail", loadId]` | default | `!!loadId` |
| `["dispatch", "available-drivers", params]` | default | Always |
| `["dispatch", "available-trucks", params]` | default | Always |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useAssignLoad | POST /dispatch/loads/:id/assign | board + detail | Yes |
| useUnassignLoad | POST /dispatch/loads/:id/unassign | board + detail | Yes |
| useUpdateDispatchStatus | PATCH /dispatch/loads/:id/status | board + detail | Yes |
| useBulkAssign | POST /dispatch/bulk-assign | board | Yes |
| useBulkUpdateStatus | PATCH /dispatch/bulk-status | board | Yes |

## Optimistic Updates

`useAssignLoad` and `useUnassignLoad` implement optimistic updates:

- Immediately update the dispatch board cache via `setQueryData`
- Roll back on error via `onError` callback with saved previous data
- Re-fetch on settlement via `onSettled` invalidation

## Quality Assessment

- **Score:** 6/10
- **Anti-patterns:**
  - **612 LOC** -- largest hook file in the codebase, mixes board queries, assignment mutations, bulk operations, and resource availability queries
  - Should be split into `use-dispatch-board.ts`, `use-dispatch-assignments.ts`, `use-dispatch-resources.ts`
  - Optimistic update rollback uses `any` for previous data snapshot
  - `useAvailableDrivers` and `useAvailableTrucks` duplicate carrier sub-resource queries from `use-carriers.ts`
  - Bulk operations have no progress tracking or partial failure handling
- **Dependencies:** `apiClient`, `useQueryClient`, `sonner`, types from TMS/dispatch module
