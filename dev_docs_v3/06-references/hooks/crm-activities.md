# useActivities (CRM)

**File:** `apps/web/lib/hooks/crm/use-activities.ts`
**LOC:** 170

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useActivities` | `(params?: ActivityListParams) => UseQueryResult<PaginatedResponse<Activity>>` |
| `useActivity` | `(id: string) => UseQueryResult<{ data: Activity }>` |
| `useCreateActivity` | `() => UseMutationResult<{ data: Activity }, Error, Partial<Activity>>` |
| `useUpdateActivity` | `() => UseMutationResult<{ data: Activity }, Error, { id: string; data: Partial<Activity> }>` |
| `useDeleteActivity` | `() => UseMutationResult<void, Error, string>` |

## API Endpoints Called
| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useActivities | GET | /crm/activities | PaginatedResponse<Activity> |
| useActivity | GET | /crm/activities/:id | `{ data: Activity }` |
| useCreateActivity | POST | /crm/activities | `{ data: Activity }` |
| useUpdateActivity | PATCH | /crm/activities/:id | `{ data: Activity }` |
| useDeleteActivity | DELETE | /crm/activities/:id | void |

## Envelope Handling
Correctly uses `response.data` and applies `normalizeActivity()` to map backend field names (`activityType` -> `type`, `opportunityId` -> `leadId`, `ownerId` -> `assignedToId`).

## Queries (React Query)
| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["activities", "list", params]` | default | Always |
| `["activities", "detail", id]` | default | `!!id` |

## Mutations
| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateActivity | POST /crm/activities | list | Yes |
| useUpdateActivity | PATCH /crm/activities/:id | detail + list | Yes |
| useDeleteActivity | DELETE /crm/activities/:id | list | Yes |

## Quality Assessment
- **Score:** 7/10
- **Anti-patterns:**
  - Heavy `as unknown as` casts in normalizeActivity
  - `mapActivityUpdateInput` casts to access `priority`, `status`, `outcome` -- should be in Activity type
  - Complex bidirectional field mapping between frontend and backend names is fragile
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from `@/lib/types/crm`
