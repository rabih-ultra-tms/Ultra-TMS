# useTenant (admin)

**File:** `apps/web/lib/hooks/admin/use-tenant.ts`
**LOC:** 53

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useTenant` | `() => UseQueryResult<Tenant>` |
| `useTenantSettings` | `() => UseQueryResult<TenantSettings>` |
| `useUpdateTenant` | `() => UseMutationResult<void, Error, Record<string, unknown>>` |
| `useUpdateTenantSettings` | `() => UseMutationResult<void, Error, Record<string, unknown>>` |

## API Endpoints Called
| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useTenant | GET | /tenant | Tenant |
| useTenantSettings | GET | /tenant/settings | TenantSettings |
| useUpdateTenant | PUT | /tenant | void |
| useUpdateTenantSettings | PUT | /tenant/settings | void |

## Envelope Handling
**ANTI-PATTERN:** Both query hooks use `apiClient.get<Tenant>` and `apiClient.get<TenantSettings>` WITHOUT wrapping in `{ data: T }`. If the API returns `{ data: Tenant }`, the consumer gets the envelope object instead of the inner data.

## Queries (React Query)
| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["admin", "tenant"]` | default | Always |
| `["admin", "tenant", "settings"]` | default | Always |

## Mutations
| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useUpdateTenant | PUT /tenant | `["admin", "tenant"]` | Yes |
| useUpdateTenantSettings | PUT /tenant/settings | `["admin", "tenant", "settings"]` | Yes |

## Quality Assessment
- **Score:** 6/10
- **Anti-patterns:**
  - **ANTI-PATTERN:** Missing `{ data: T }` envelope unwrap on GET queries
  - Mutation payloads typed as `Record<string, unknown>` -- no type safety
- **Dependencies:** `apiClient`, `sonner`, types from `@/lib/types/auth`
