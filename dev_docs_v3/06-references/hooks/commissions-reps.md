# useReps (commissions)

**File:** `apps/web/lib/hooks/commissions/use-reps.ts`
**LOC:** 177

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useReps` | `(params?: RepListParams) => UseQueryResult<PaginatedResponse<Rep>>` |
| `useRep` | `(id: string) => UseQueryResult<{ data: Rep }>` |
| `useCreateRep` | `() => UseMutationResult<{ data: Rep }, Error, any>` |
| `useUpdateRep` | `() => UseMutationResult<{ data: Rep }, Error, { id: string; data: any }>` |
| `useDeleteRep` | `() => UseMutationResult<void, Error, string>` |
| `useAssignPlanToRep` | `() => UseMutationResult<void, Error, { repId: string; planId: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useReps | GET | /commissions/reps | PaginatedResponse<Rep> |
| useRep | GET | /commissions/reps/:id | `{ data: Rep }` |
| useCreateRep | POST | /commissions/reps | `{ data: Rep }` |
| useUpdateRep | PATCH | /commissions/reps/:id | `{ data: Rep }` |
| useDeleteRep | DELETE | /commissions/reps/:id | void |
| useAssignPlanToRep | POST | /commissions/reps/:id/assign-plan | void |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["commissions", "reps", "list", params]` | default | Always |
| `["commissions", "reps", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateRep | POST /commissions/reps | list | Yes |
| useUpdateRep | PATCH /commissions/reps/:id | detail + list | Yes |
| useDeleteRep | DELETE /commissions/reps/:id | list | Yes |
| useAssignPlanToRep | POST .../assign-plan | detail | Yes |

## Quality Assessment

- **Score:** 5/10
- **Anti-patterns:**
  - **ANTI-PATTERN:** `useCreateRep` and `useUpdateRep` mutation inputs typed as `any` -- no type safety
  - `useAssignPlanToRep` only invalidates detail, not the list -- stale data in list view
  - Rep type should reference User type but appears to be a separate entity
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from commissions module
