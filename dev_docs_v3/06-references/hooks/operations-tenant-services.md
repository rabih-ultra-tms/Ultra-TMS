# useTenantServices (operations)

**File:** `apps/web/lib/hooks/operations/use-tenant-services.ts`
**LOC:** 108

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useTenantServices` | `() => UseQueryResult<TenantService[]>` |
| `useEnableService` | `() => UseMutationResult<void, Error, string>` |
| `useDisableService` | `() => UseMutationResult<void, Error, string>` |
| `useUpdateServiceConfig` | `() => UseMutationResult<void, Error, { serviceId: string; config: Record<string, unknown> }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useTenantServices | GET | /tenant/services | TenantService[] |
| useEnableService | POST | /tenant/services/:id/enable | void |
| useDisableService | POST | /tenant/services/:id/disable | void |
| useUpdateServiceConfig | PUT | /tenant/services/:id/config | void |

## Envelope Handling

Returns raw apiClient response. No explicit envelope unwrap on the GET query.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["tenant", "services"]` | default | Always |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useEnableService | POST /tenant/services/:id/enable | `["tenant", "services"]` | Yes |
| useDisableService | POST /tenant/services/:id/disable | `["tenant", "services"]` | Yes |
| useUpdateServiceConfig | PUT /tenant/services/:id/config | `["tenant", "services"]` | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - Config payload typed as `Record<string, unknown>` -- no type safety for service configurations
  - No optimistic updates for enable/disable toggles
- **Dependencies:** `apiClient`, `sonner`
