# Admin Components

**Path:** `apps/web/components/admin/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| AuditLogDetail | `audit-log-detail.tsx` | 22 | Detail view for a single audit log entry |
| AuditLogFilters | `audit-log-filters.tsx` | 14 | Minimal filter bar for audit logs |
| AuditLogTable | `audit-log-table.tsx` | 40 | Data table listing audit log entries |
| PermissionGroupCard | `permission-group-card.tsx` | 25 | Card displaying a permission group |
| PermissionsMatrix | `permissions-matrix.tsx` | 69 | Grid matrix of permissions with checkboxes |
| RoleForm | `role-form.tsx` | 98 | Create/edit role form |
| RolePermissionsEditor | `role-permissions-editor.tsx` | 329 | Full permissions editor for roles with grouped checkboxes |
| RoleUsersSection | `role-users-section.tsx` | 28 | Section showing users assigned to a role |
| RolesTable | `roles-table.tsx` | 50 | Data table listing roles |
| GeneralSettingsForm | `general-settings-form.tsx` | 26 | General application settings form |
| NotificationSettings | `notification-settings.tsx` | 32 | Notification preferences configuration |
| SecuritySettingsForm | `security-settings-form.tsx` | 30 | Security settings (password policy, session timeout) |
| TenantForm | `tenant-form.tsx` | 26 | Create/edit tenant form |
| TenantSettingsForm | `tenant-settings-form.tsx` | 30 | Tenant-specific settings form |
| TenantUsersSection | `tenant-users-section.tsx` | 28 | Section showing users in a tenant |
| TenantsTable | `tenants-table.tsx` | 44 | Data table listing tenants |
| UserDetailCard | `user-detail-card.tsx` | 43 | User detail display card |
| UserFilters | `user-filters.tsx` | 69 | Filter bar for users list (role, status, search) |
| UserForm | `user-form.tsx` | 246 | Create/edit user form with role assignment |
| UserRolesSection | `user-roles-section.tsx` | 30 | Section showing roles assigned to a user |
| UserStatusBadge | `user-status-badge.tsx` | 11 | Status badge for user states (Active, Inactive, Suspended) |
| UsersTable | `users-table.tsx` | 101 | Data table listing users with status and role columns |
| UsersTable (test) | `users-table.test.tsx` | 65 | Unit tests for UsersTable |

**Total:** 23 files (~22 components + 1 test), ~1,496 LOC

## Usage Patterns

Used in `(dashboard)/admin/` route group:
- `/admin/users` - `UsersTable` + `UserFilters`
- `/admin/users/[id]` - `UserDetailCard` + `UserRolesSection`
- `/admin/users/new` - `UserForm`
- `/admin/roles` - `RolesTable`
- `/admin/roles/[id]` - `RolePermissionsEditor` + `RoleUsersSection`
- `/admin/tenants` - `TenantsTable`
- `/admin/tenants/[id]` - `TenantSettingsForm` + `TenantUsersSection`
- `/admin/settings` - `GeneralSettingsForm` + `SecuritySettingsForm` + `NotificationSettings`
- `/admin/audit-log` - `AuditLogTable` + `AuditLogFilters`

## Dependencies

- `@/components/ui/` (shadcn primitives)
- `@/components/patterns/` (ListPage, FormPage, DetailPage patterns)
- Admin components are mostly thin wrappers; many under 50 LOC
- `RolePermissionsEditor` (329 LOC) is the most complex, handling grouped permission checkboxes
