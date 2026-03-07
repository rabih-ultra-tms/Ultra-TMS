# useCheckCalls (TMS)

**File:** `apps/web/lib/hooks/tms/use-checkcalls.ts`
**LOC:** 167

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useCheckCalls` | `(loadId: string, params?: CheckCallParams) => UseQueryResult<PaginatedResponse<CheckCall>>` |
| `useCheckCall` | `(loadId: string, checkCallId: string) => UseQueryResult<{ data: CheckCall }>` |
| `useCreateCheckCall` | `() => UseMutationResult<{ data: CheckCall }, Error, { loadId: string; data: Partial<CheckCall> }>` |
| `useUpdateCheckCall` | `() => UseMutationResult<{ data: CheckCall }, Error, { loadId: string; checkCallId: string; data: Partial<CheckCall> }>` |
| `useDeleteCheckCall` | `() => UseMutationResult<void, Error, { loadId: string; checkCallId: string }>` |
| `useAutoCheckCall` | `() => UseMutationResult<void, Error, { loadId: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useCheckCalls | GET | /loads/:loadId/check-calls | PaginatedResponse<CheckCall> |
| useCheckCall | GET | /loads/:loadId/check-calls/:id | `{ data: CheckCall }` |
| useCreateCheckCall | POST | /loads/:loadId/check-calls | `{ data: CheckCall }` |
| useUpdateCheckCall | PATCH | /loads/:loadId/check-calls/:id | `{ data: CheckCall }` |
| useDeleteCheckCall | DELETE | /loads/:loadId/check-calls/:id | void |
| useAutoCheckCall | POST | /loads/:loadId/check-calls/auto | void |

## Envelope Handling

Uses field mapping between frontend and backend names. `normalizeCheckCall()` maps `checkCallType` -> `type`, similar to activities hook pattern.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["loads", loadId, "check-calls", "list", params]` | default | `!!loadId` |
| `["loads", loadId, "check-calls", "detail", checkCallId]` | default | `!!loadId && !!checkCallId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateCheckCall | POST /loads/:loadId/check-calls | list | Yes |
| useUpdateCheckCall | PATCH /loads/:loadId/check-calls/:id | detail + list | Yes |
| useDeleteCheckCall | DELETE /loads/:loadId/check-calls/:id | list | Yes |
| useAutoCheckCall | POST /loads/:loadId/check-calls/auto | list | Yes |

## Quality Assessment

- **Score:** 6/10
- **Anti-patterns:**
  - `useAutoCheckCall` and `useDeleteCheckCall` are stubs -- mutation functions defined but may not have backend endpoints
  - Field mapping with `as unknown as` casts -- fragile bidirectional mapping
  - Duplicates the normalization pattern from `use-activities.ts` instead of sharing a utility
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from TMS module
