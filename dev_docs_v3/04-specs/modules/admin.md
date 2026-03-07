# Admin Module API Spec

**Module:** `apps/api/src/modules/auth/` (admin controllers live in auth module)
**Base path:** `/api/v1/`
**Controllers:** UsersController, RolesController (PermissionsController shares RolesController)
**Auth:** All endpoints require `JwtAuthGuard` + `RolesGuard`
**Note:** UsersController is documented here for admin context; it also lives in auth module (see auth.md for AuthController)

---

## UsersController

**Route prefix:** `users`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/users` | ADMIN, SUPER_ADMIN | Create user |
| GET | `/users` | ADMIN, SUPER_ADMIN | List users |
| GET | `/users/me` | All authenticated | Get current user profile |
| GET | `/users/:id` | ADMIN, SUPER_ADMIN | Get user by ID |
| PATCH | `/users/:id` | ADMIN, SUPER_ADMIN | Update user |
| DELETE | `/users/:id` | ADMIN, SUPER_ADMIN | Soft-delete user |
| PATCH | `/users/:id/status` | ADMIN, SUPER_ADMIN | Activate / deactivate user |
| POST | `/users/:id/roles` | ADMIN, SUPER_ADMIN | Assign roles to user |
| DELETE | `/users/:id/roles/:roleId` | ADMIN, SUPER_ADMIN | Remove role from user |
| GET | `/users/:id/activity` | ADMIN, SUPER_ADMIN | User activity log |

### Query Params — GET /users
```
page?: string
limit?: string    // defaults 20
search?: string   // name or email search
role?: string     // filter by role name
status?: string   // ACTIVE | INACTIVE | PENDING
```

### CreateUserDto (key fields)
```typescript
{
  email: string;
  firstName: string;
  lastName: string;
  password?: string;        // if omitted, invite email is sent
  roleIds?: string[];
  isActive?: boolean;
}
```

### PATCH /users/:id/status body
```typescript
{ isActive: boolean }
```

### POST /users/:id/roles body
```typescript
{ roleIds: string[] }
```

---

## RolesController

**Route prefix:** `roles`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/roles` | ADMIN, SUPER_ADMIN | Create role |
| GET | `/roles` | ADMIN, SUPER_ADMIN | List roles |
| GET | `/roles/permissions` | ADMIN, SUPER_ADMIN | List all available permissions |
| GET | `/roles/:id` | ADMIN, SUPER_ADMIN | Get role by ID |
| PATCH | `/roles/:id` | ADMIN, SUPER_ADMIN | Update role |
| DELETE | `/roles/:id` | ADMIN, SUPER_ADMIN | Delete role |

### Route ordering note
`GET /roles/permissions` declared BEFORE `GET /roles/:id` — resolves "permissions" as literal, not param.

### CreateRoleDto
```typescript
{
  name: string;             // e.g. 'DISPATCHER', 'ACCOUNTING'
  description?: string;
  permissions: string[];    // from GET /roles/permissions list
}
```

### GET /roles/permissions response
```typescript
{
  data: {
    resource: string;       // e.g. 'loads', 'invoices', 'users'
    actions: string[];      // e.g. ['read', 'write', 'delete']
  }[]
}
```

### Built-in role names (non-deletable)
- `SUPER_ADMIN` — cross-tenant admin
- `ADMIN` — tenant admin, all permissions
- `DISPATCHER` — TMS core operations
- `ACCOUNTING` — invoices, settlements, payments
- `ACCOUNTING_MANAGER` — approve/void financial records
- `SALES_MANAGER` — quotes, commissions, reps
- `AGENT_MANAGER` — commission agents view

---

## TenantsController (SUPER_ADMIN only)

**Route prefix:** `tenants`
**Note:** Only accessible via `SUPER_ADMIN` — not for regular tenant admins

| Method | Path | Description |
|--------|------|-------------|
| POST | `/tenants` | Create new tenant |
| GET | `/tenants` | List all tenants |
| GET | `/tenants/:id` | Get tenant details |
| PATCH | `/tenants/:id` | Update tenant |
| PATCH | `/tenants/:id/status` | Activate / suspend tenant |

### Frontend: `/admin/tenants` and `/admin/tenants/[id]`

---

## AuditController

**Route prefix:** `audit`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit/logs` | ADMIN, SUPER_ADMIN | Paginated audit log |
| GET | `/audit/logs/:id` | ADMIN, SUPER_ADMIN | Single audit entry |

### Query Params — GET /audit/logs
```
page?: string
limit?: string
userId?: string
resource?: string    // 'loads' | 'invoices' | 'users' | ...
action?: string      // 'create' | 'update' | 'delete'
startDate?: string
endDate?: string
```

### Frontend: `/admin/audit-logs` screen uses `useSecurityLog` hook

---

## Frontend Hooks

| Hook | File | Calls |
|------|------|-------|
| `useUsers` | `lib/hooks/admin/use-users.ts` | GET /users |
| `useRoles` | `lib/hooks/admin/use-roles.ts` | GET /roles, GET /roles/permissions |
| `useTenant` | `lib/hooks/admin/use-tenant.ts` | GET /tenants/:id (current tenant config) |
| `useSecurityLog` | `lib/hooks/admin/use-security-log.ts` | GET /audit/logs |

---

## Admin Screen Inventory

| Route | Status |
|-------|--------|
| `/admin/users` | Exists |
| `/admin/users/new` | Exists |
| `/admin/users/[id]` | Exists |
| `/admin/users/[id]/edit` | Exists |
| `/admin/roles` | Exists |
| `/admin/roles/new` | Exists |
| `/admin/roles/[id]` | Exists |
| `/admin/permissions` | Exists |
| `/admin/settings` | Exists |
| `/admin/tenants` | Exists (SUPER_ADMIN) |
| `/admin/tenants/[id]` | Exists (SUPER_ADMIN) |
| `/admin/audit-logs` | Exists |

---

## Known Issues

1. **`admin/layout.tsx` logs JWT token** (10 `console.log` calls) — P0 security bug, must fix (see bug inventory)
2. **Role guard order in admin pages** — some admin screens missing `@Roles()` decorator (inherits controller-level only)
3. **Permissions screen** (`/admin/permissions`) may read from `/roles/permissions` — if user has no roles defined yet, page may appear empty
4. **Users soft-delete:** DELETE `/users/:id` sets `deletedAt` — user can no longer log in but record persists for audit trail
