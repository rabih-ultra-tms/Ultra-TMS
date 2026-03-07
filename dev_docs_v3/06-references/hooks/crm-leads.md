# useLeads (CRM)

**File:** `apps/web/lib/hooks/crm/use-leads.ts`
**LOC:** 102

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useLeads` | `(params?: LeadListParams) => UseQueryResult<PaginatedResponse<Lead>>` |
| `useLead` | `(id: string) => UseQueryResult<{ data: Lead }>` |
| `useCreateLead` | `() => UseMutationResult<{ data: Lead }, Error, Partial<Lead>>` |
| `useUpdateLead` | `() => UseMutationResult<{ data: Lead }, Error, { id: string; data: Partial<Lead> }>` |
| `useDeleteLead` | `() => UseMutationResult<void, Error, string>` |
| `useLeadsByPipeline` | `(pipelineId: string) => UseQueryResult<PaginatedResponse<Lead>>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useLeads | GET | /crm/leads | PaginatedResponse<Lead> |
| useLead | GET | /crm/leads/:id | `{ data: Lead }` |
| useCreateLead | POST | /crm/leads | `{ data: Lead }` |
| useUpdateLead | PATCH | /crm/leads/:id | `{ data: Lead }` |
| useDeleteLead | DELETE | /crm/leads/:id | void |
| useLeadsByPipeline | GET | /crm/leads?pipelineId=:id | PaginatedResponse<Lead> |

## Envelope Handling

Returns raw apiClient response. Standard envelope pattern for both list and detail queries.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["leads", "list", params]` | default | Always |
| `["leads", "detail", id]` | default | `!!id` |
| `["leads", "pipeline", pipelineId]` | default | `!!pipelineId` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateLead | POST /crm/leads | list + pipeline | Yes |
| useUpdateLead | PATCH /crm/leads/:id | detail + list + pipeline | Yes |
| useDeleteLead | DELETE /crm/leads/:id | list + pipeline | Yes |

## Quality Assessment

- **Score:** 8/10
- **Anti-patterns:**
  - `useLeadsByPipeline` duplicates filtering logic that could be handled by `useLeads` with params
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from `@/lib/types/crm`
