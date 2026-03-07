# useCompanies (CRM)

**File:** `apps/web/lib/hooks/crm/use-companies.ts`
**LOC:** 22

## Signature
```typescript
export function useCompanies(params?: CompanyListParams): UseQueryResult<PaginatedResponse<Customer>>
```

## API Endpoints Called
| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useCompanies | GET | /crm/companies | PaginatedResponse<Customer> |

## Envelope Handling
Returns raw apiClient response typed as `PaginatedResponse<Customer>`.

## Queries (React Query)
| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["companies", "list", params]` | default | Always |

## Mutations
None -- read-only hook. CRUD mutations are in `use-customers.ts` which hits the same `/crm/companies` endpoint.

## Quality Assessment
- **Score:** 7/10
- **Anti-patterns:**
  - Read-only with no mutations -- split from customers hook may cause confusion
  - Uses `Customer` type but query key says "companies"
- **Dependencies:** `apiClient`, `PaginatedResponse`, types from `@/lib/types/crm`
