# Admin & Profile Screen-to-API Contracts

> Verified from hook source code on 2026-03-07

---

## Users

**Source:** `apps/web/lib/hooks/admin/use-users.ts`

**IMPORTANT:** Users use `/users` endpoint, NOT `/admin/users`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useUsers` | GET | `/users?page=&limit=&search=&role=&status=` | URLSearchParams | `{ data: User[], pagination }` (unwrapped) |
| `useUser` | GET | `/users/:id` | -- | `User` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateUser` | POST | `/users` | `CreateUserPayload` | `User` (unwrapped) |
| `useUpdateUser` | PATCH | `/users/:id` | `Partial<CreateUserPayload>` | `User` (unwrapped) |
| `useDeleteUser` | DELETE | `/users/:id` | -- | success |
| `useActivateUser` | POST | `/users/:id/activate` | -- | `User` (unwrapped) |
| `useDeactivateUser` | POST | `/users/:id/deactivate` | -- | `User` (unwrapped) |
| `useAssignRoles` | POST | `/users/:id/assign-roles` | `{ roleIds: string[] }` | `User` (unwrapped) |
| `useResetUserPassword` | POST | `/users/:id/reset-password` | -- | success |

### User Cache Keys

```typescript
["users", "list", params]
["users", "detail", id]
```

---

## Roles

**Source:** `apps/web/lib/hooks/admin/use-roles.ts`

**IMPORTANT:** Roles use `/roles` endpoint, NOT `/admin/roles`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useRoles` | GET | `/roles` | -- | `Role[]` (unwrapped) |
| `useRole` | GET | `/roles/:id` | -- | `Role` (unwrapped) |
| `usePermissions` | GET | `/roles/permissions` | -- | `Permission[]` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateRole` | POST | `/roles` | `CreateRolePayload` | `Role` (unwrapped) |
| `useUpdateRole` | PATCH | `/roles/:id` | `Partial<CreateRolePayload>` | `Role` (unwrapped) |
| `useDeleteRole` | DELETE | `/roles/:id` | -- | success |

### Role Cache Keys

```typescript
["roles", "list"]
["roles", "detail", id]
["roles", "permissions"]
```

---

## Tenant Settings

**Source:** `apps/web/lib/hooks/admin/use-tenant.ts`

**IMPORTANT:** Tenant uses `/tenant` endpoint, NOT `/admin/tenants/:id`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useTenant` | GET | `/tenant` | -- | `Tenant` (unwrapped) |
| `useTenantSettings` | GET | `/tenant/settings` | -- | `TenantSettings` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useUpdateTenant` | PATCH | `/tenant` | `Partial<Tenant>` | `Tenant` (unwrapped) |
| `useUpdateTenantSettings` | PATCH | `/tenant/settings` | `Partial<TenantSettings>` | `TenantSettings` (unwrapped) |

### Tenant Cache Keys

```typescript
["tenant"]
["tenant", "settings"]
```

---

## Sessions & Security Log

**Source:** `apps/web/lib/hooks/admin/use-security-log.ts`

**IMPORTANT:** Security log uses `/sessions` endpoint, NOT `/audit` or `/admin/audit-logs`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useSessions` | GET | `/sessions?page=&limit=&userId=&fromDate=&toDate=` | URLSearchParams | `{ data: Session[], pagination }` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useRevokeSession` | DELETE | `/sessions/:sessionId` | -- | success |
| `useLogoutAll` | POST | `/auth/logout-all` | -- | success |

### Session Cache Keys

```typescript
["sessions", "list", params]
```

---

## Documents

**Source:** `apps/web/lib/hooks/documents/use-documents.ts`

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useDocuments` | GET | `/documents/entity/:entityType/:entityId` | -- | `Document[]` (unwrapped) |
| `useDocument` | GET | `/documents/:id` | -- | `Document` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useUploadDocument` | POST | `/documents/entity/:entityType/:entityId` | `FormData` (file + metadata) | `Document` (unwrapped) |
| `useDeleteDocument` | DELETE | `/documents/:id` | -- | success |
| `useDownloadDocument` | GET | `/documents/:id/download` | -- | `Blob` |

### Document Upload FormData Shape

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', type);
formData.append('name', name);
formData.append('description', description);
```

### Document Cache Keys

```typescript
["documents", entityType, entityId]
["documents", "detail", id]
```

---

## Email Logs

**Source:** `apps/web/lib/hooks/communication/use-email-logs.ts`

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useEmailLogs` | GET | `/communication/email/logs?page=&limit=&search=&status=&fromDate=&toDate=` | URLSearchParams | `{ data: EmailLog[], pagination }` (unwrapped) |
| `useEmailLog` | GET | `/communication/email/logs/:id` | -- | `EmailLog` (unwrapped) |

### Email Log Cache Keys

```typescript
["email-logs", "list", params]
["email-logs", "detail", id]
```

---

## Public Tracking (No Auth)

**Source:** `apps/web/lib/hooks/tracking/use-public-tracking.ts`

**IMPORTANT:** This hook uses raw `fetch()` instead of `apiClient` because it requires no authentication. The endpoint is `/api/v1/public/tracking/:trackingCode`.

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `usePublicTracking` | GET | `/public/tracking/:trackingCode` | -- | `PublicTrackingData` (unwrapped) |

### Public Tracking Cache Keys

```typescript
["public-tracking", trackingCode]
```
