# useEmailLogs (communication)

**File:** `apps/web/lib/hooks/communication/use-email-logs.ts`
**LOC:** 54

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useEmailLogs` | `(params?: EmailLogParams) => UseQueryResult<PaginatedResponse<EmailLog>>` |
| `useEmailLog` | `(id: string) => UseQueryResult<{ data: EmailLog }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useEmailLogs | GET | /communication/email-logs | PaginatedResponse<EmailLog> |
| useEmailLog | GET | /communication/email-logs/:id | `{ data: EmailLog }` |

## Envelope Handling

Returns raw apiClient responses. Standard envelope pattern.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["communication", "email-logs", "list", params]` | default | Always |
| `["communication", "email-logs", "detail", id]` | default | `!!id` |

## Mutations

None -- read-only log viewer.

## Quality Assessment

- **Score:** 8/10
- **Anti-patterns:** None significant -- clean read-only pattern
- **Dependencies:** `apiClient`, `PaginatedResponse`
