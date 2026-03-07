# useLoads (TMS)

**File:** `apps/web/lib/hooks/tms/use-loads.ts`
**LOC:** 377

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useLoads` | `(params?: LoadListParams) => UseQueryResult<PaginatedResponse<Load>>` |
| `useLoad` | `(id: string) => UseQueryResult<{ data: Load }>` |
| `useCreateLoad` | `() => UseMutationResult<{ data: Load }, Error, Partial<Load>>` |
| `useUpdateLoad` | `() => UseMutationResult<{ data: Load }, Error, { id: string; data: Partial<Load> }>` |
| `useDeleteLoad` | `() => UseMutationResult<void, Error, string>` |
| `useUpdateLoadStatus` | `() => UseMutationResult<void, Error, { id: string; status: string }>` |
| `useSearchCarriers` | `(loadId: string, params?: CarrierSearchParams) => UseQueryResult<CarrierMatch[]>` |
| `useAssignCarrier` | `() => UseMutationResult<void, Error, { loadId: string; carrierId: string; rate: number }>` |
| `useBulkUpdateLoads` | `() => UseMutationResult<void, Error, { ids: string[]; data: Partial<Load> }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useLoads | GET | /loads | PaginatedResponse<Load> |
| useLoad | GET | /loads/:id | `{ data: Load }` |
| useCreateLoad | POST | /loads | `{ data: Load }` |
| useUpdateLoad | PATCH | /loads/:id | `{ data: Load }` |
| useDeleteLoad | DELETE | /loads/:id | void |
| useUpdateLoadStatus | PATCH | /loads/:id/status | void |
| useSearchCarriers | GET | /loads/:id/carrier-search | CarrierMatch[] |
| useAssignCarrier | POST | /loads/:id/assign-carrier | void |
| useBulkUpdateLoads | PATCH | /loads/bulk | void |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Carrier search returns raw array. Bulk update returns void.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["loads", "list", params]` | default | Always |
| `["loads", "detail", id]` | default | `!!id` |
| `["loads", loadId, "carrier-search", params]` | default | `!!loadId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateLoad | POST /loads | list | Yes |
| useUpdateLoad | PATCH /loads/:id | detail + list | Yes |
| useDeleteLoad | DELETE /loads/:id | list | Yes |
| useUpdateLoadStatus | PATCH /loads/:id/status | detail + list | Yes |
| useAssignCarrier | POST /loads/:id/assign-carrier | detail + list + carrier-search | Yes |
| useBulkUpdateLoads | PATCH /loads/bulk | list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - 377 LOC -- large file mixing load CRUD with carrier search/assignment logic
  - `useSearchCarriers` should arguably live in carrier hooks
  - Bulk update payload typed as `Partial<Load>` -- too broad, should restrict to bulk-updatable fields
  - No optimistic updates for status changes
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from TMS module
