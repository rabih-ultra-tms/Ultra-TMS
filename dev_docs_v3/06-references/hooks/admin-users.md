# useUsers (admin)

**File:** `apps/web/lib/hooks/admin/use-users.ts`
**LOC:** 141

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useUsers` | `(params?: UsersListParams, options?: { enabled?: boolean }) => UseQueryResult<PaginatedResponse<User>>` |
| `useUser` | `(id: string) => UseQueryResult<{ data: User }>` |
| `useCreateUser` | `() => UseMutationResult<{ data: User }, Error, Partial<User> & { password?: string; sendInvite?: boolean }>` |
| `useUpdateUser` | `() => UseMutationResult<{ data: User }, Error, { id: string; data: Partial<User> }>` |
| `useUpdateUserStatus` | `() => UseMutationResult<void, Error, { id: string; status: string; reason?: string }>` |
| `useAssignRoles` | `() => UseMutationResult<void, Error, { userId: string; roleIds: string[] }>` |
| `useResetUserPassword` | `() => UseMutationResult<void, Error, string>` |
| `useUnlockUser` | `() => UseMutationResult<void, Error, string>` |

## API Endpoints Called
| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useUsers | GET | /users | PaginatedResponse<User> |
| useUser | GET | /users/:id | `{ data: User }` |
| useCreateUser | POST | /users | `{ data: User }` |
| useUpdateUser | PUT | /users/:id | `{ data: User }` |
| useUpdateUserStatus | POST | /users/:id/activate or /deactivate | void |
| useAssignRoles | PATCH | /users/:userId/roles | void |
| useResetUserPassword | POST | /users/:userId/reset-password | void |
| useUnlockUser | POST | /users/:userId/activate | void |

## Envelope Handling
`useUsers` uses `PaginatedResponse<User>` type. `useUser` returns `{ data: User }` envelope directly.

## Queries (React Query)
| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["admin", "users", "list", params]` | default | `options?.enabled` |
| `["admin", "users", "detail", id]` | default | `!!id` |

## Mutations
| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateUser | POST /users | list | Yes |
| useUpdateUser | PUT /users/:id | detail + list | Yes |
| useUpdateUserStatus | POST /users/:id/(de)activate | detail + list | Yes |
| useAssignRoles | PATCH /users/:userId/roles | detail | Yes |
| useResetUserPassword | POST /users/:userId/reset-password | None | Yes |
| useUnlockUser | POST /users/:userId/activate | detail + list | Yes |

## Quality Assessment
- **Score:** 8/10
- **Anti-patterns:**
  - `useUpdateUserStatus` accepts `reason` param but never sends it to the API
  - `useUnlockUser` always calls `/activate` regardless
- **Dependencies:** `apiClient`, `PaginatedResponse`, `sonner`
