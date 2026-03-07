# useContacts (CRM)

**File:** `apps/web/lib/hooks/crm/use-contacts.ts`
**LOC:** 76

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useContacts` | `(params?: ContactListParams) => UseQueryResult<PaginatedResponse<Contact>>` |
| `useContact` | `(id: string) => UseQueryResult<{ data: Contact }>` |
| `useCreateContact` | `() => UseMutationResult<{ data: Contact }, Error, Partial<Contact>>` |
| `useUpdateContact` | `() => UseMutationResult<{ data: Contact }, Error, { id: string; data: Partial<Contact> }>` |
| `useDeleteContact` | `() => UseMutationResult<void, Error, string>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useContacts | GET | /crm/contacts | PaginatedResponse<Contact> |
| useContact | GET | /crm/contacts/:id | `{ data: Contact }` |
| useCreateContact | POST | /crm/contacts | `{ data: Contact }` |
| useUpdateContact | PATCH | /crm/contacts/:id | `{ data: Contact }` |
| useDeleteContact | DELETE | /crm/contacts/:id | void |

## Envelope Handling

Returns raw apiClient response. Standard `{ data: T }` envelope for single items, `PaginatedResponse` for list.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["contacts", "list", params]` | default | Always |
| `["contacts", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateContact | POST /crm/contacts | list | Yes |
| useUpdateContact | PATCH /crm/contacts/:id | detail + list | Yes |
| useDeleteContact | DELETE /crm/contacts/:id | list | Yes |

## Quality Assessment

- **Score:** 8/10
- **Anti-patterns:** None significant -- clean standard CRUD pattern
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`, types from `@/lib/types/crm`
