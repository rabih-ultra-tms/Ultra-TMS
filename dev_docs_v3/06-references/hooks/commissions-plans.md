# usePlans (commissions)

**File:** `apps/web/lib/hooks/commissions/use-plans.ts`
**LOC:** 255

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `usePlans` | `(params?: PlanListParams) => UseQueryResult<PaginatedResponse<CommissionPlan>>` |
| `usePlan` | `(id: string) => UseQueryResult<{ data: CommissionPlan }>` |
| `useCreatePlan` | `() => UseMutationResult<{ data: CommissionPlan }, Error, any>` |
| `useUpdatePlan` | `() => UseMutationResult<{ data: CommissionPlan }, Error, { id: string; data: any }>` |
| `useDeletePlan` | `() => UseMutationResult<void, Error, string>` |
| `useActivatePlan` | `() => UseMutationResult<void, Error, string>` |
| `useDeactivatePlan` | `() => UseMutationResult<void, Error, string>` |
| `usePlanTiers` | `(planId: string) => UseQueryResult<PlanTier[]>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| usePlans | GET | /commissions/plans | PaginatedResponse<CommissionPlan> |
| usePlan | GET | /commissions/plans/:id | `{ data: CommissionPlan }` |
| useCreatePlan | POST | /commissions/plans | `{ data: CommissionPlan }` |
| useUpdatePlan | PATCH | /commissions/plans/:id | `{ data: CommissionPlan }` |
| useDeletePlan | DELETE | /commissions/plans/:id | void |
| useActivatePlan | POST | /commissions/plans/:id/activate | void |
| useDeactivatePlan | POST | /commissions/plans/:id/deactivate | void |
| usePlanTiers | GET | /commissions/plans/:id/tiers | PlanTier[] |

## Envelope Handling

Standard `{ data: T }` envelope for CRUD. Tiers return raw array.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["commissions", "plans", "list", params]` | default | Always |
| `["commissions", "plans", "detail", id]` | default | `!!id` |
| `["commissions", "plans", id, "tiers"]` | default | `!!planId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreatePlan | POST /commissions/plans | list | Yes |
| useUpdatePlan | PATCH /commissions/plans/:id | detail + list | Yes |
| useDeletePlan | DELETE /commissions/plans/:id | list | Yes |
| useActivatePlan | POST .../activate | detail + list | Yes |
| useDeactivatePlan | POST .../deactivate | detail + list | Yes |

## Quality Assessment

- **Score:** 5/10
- **Anti-patterns:**
  - **ANTI-PATTERN:** `useCreatePlan` and `useUpdatePlan` mutation inputs typed as `any` -- no type safety for plan creation/update payloads
  - Plan tier structure is complex (percentage tiers, flat rates, thresholds) but has no typed interface
  - 255 LOC with CRUD + lifecycle + tiers -- should split tiers into separate hook
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from commissions module
