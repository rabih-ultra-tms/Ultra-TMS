# useTruckTypes (operations)

**File:** `apps/web/lib/hooks/operations/use-truck-types.ts`
**LOC:** 155

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useTruckTypes` | `(params?: TruckTypeListParams) => UseQueryResult<PaginatedResponse<TruckType>>` |
| `useTruckType` | `(id: string) => UseQueryResult<{ data: TruckType }>` |
| `useCreateTruckType` | `() => UseMutationResult<{ data: TruckType }, Error, Partial<TruckType>>` |
| `useUpdateTruckType` | `() => UseMutationResult<{ data: TruckType }, Error, { id: string; data: Partial<TruckType> }>` |
| `useDeleteTruckType` | `() => UseMutationResult<void, Error, string>` |
| `useTruckTypeCategories` | `() => UseQueryResult<TruckTypeCategory[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useTruckTypes | GET | /truck-types | PaginatedResponse<TruckType> |
| useTruckType | GET | /truck-types/:id | `{ data: TruckType }` |
| useCreateTruckType | POST | /truck-types | `{ data: TruckType }` |
| useUpdateTruckType | PUT | /truck-types/:id | `{ data: TruckType }` |
| useDeleteTruckType | DELETE | /truck-types/:id | void |
| useTruckTypeCategories | GET | /truck-types/categories | TruckTypeCategory[] |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Categories query returns raw array.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["truck-types", "list", params]` | default | Always |
| `["truck-types", "detail", id]` | default | `!!id` |
| `["truck-types", "categories"]` | default | Always |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateTruckType | POST /truck-types | list | Yes |
| useUpdateTruckType | PUT /truck-types/:id | detail + list | Yes |
| useDeleteTruckType | DELETE /truck-types/:id | list | Yes |

## Quality Assessment

- **Score:** 8/10
- **Anti-patterns:**
  - Categories endpoint may return `{ data: T[] }` envelope but hook doesn't unwrap
  - Uses PUT for update (most other hooks use PATCH) -- inconsistency
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from truck-types module
