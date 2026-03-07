# useRoles (admin)

**File:** `apps/web/lib/hooks/admin/use-roles.ts`
**LOC:** 88

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useRoles` | `(options?: { enabled?: boolean }) => UseQueryResult<{ data: Role[] }>` |
| `useRole` | `(id: string) => UseQueryResult<{ data: Role }>` |
| `usePermissions` | `() => UseQueryResult<{ data: Permission[] }>` |
| `useCreateRole` | `() => UseMutationResult<{ data: Role }, Error, Partial<Role> & { permissionIds?: string[] }>` |
| `useUpdateRole` | `() => UseMutationResult<{ data: Role }, Error, { id: string; data: Partial<Role> & { permissionIds?: string[] } }>` |
| `useDeleteRole` | `() => UseMutationResult<void, Error, string>` |

## API Endpoints Called
| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useRoles | GET | /roles | `{ data: Role[] }` |
| useRole | GET | /roles/:id | `{ data: Role }` |
| usePermissions | GET | /roles/permissions | `{ data: Permission[] }` |
| useCreateRole | POST | /roles | `{ data: Role }` |
| useUpdateRole | PUT | /roles/:id | `{ data: Role }` |
| useDeleteRole | DELETE | /roles/:id | void |

## Envelope Handling
Returns raw apiClient response which includes `{ data: T }` envelope. Consumer accesses `.data` on query result.

## Queries (React Query)
| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["roles", "list"]` | default | `options?.enabled` |
| `["roles", "detail", id]` | default | `!!id` |
| `["roles", "permissions"]` | default | Always |

## Mutations
| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateRole | POST /roles | `["roles", "list"]` | Yes |
| useUpdateRole | PUT /roles/:id | detail + list | Yes |
| useDeleteRole | DELETE /roles/:id | `["roles", "list"]` | Yes |

## Quality Assessment
- **Score:** 8/10
- **Anti-patterns:** None significant. Clean CRUD pattern with proper cache invalidation.
- **Dependencies:** `apiClient`, `sonner`, types from `@/lib/types/auth`
