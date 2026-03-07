# Super Admin Core Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/38-super-admin/` (files 00-10)
**MVP Tier:** P1
**Frontend routes:** `(dashboard)/superadmin/*`
**Backend module:** Platform-level admin (cross-tenant)

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-super-admin-dashboard.md` | — | Not built | P1 |
| 02 | `02-tenants-list.md` | `/superadmin/tenant-services` | `(dashboard)/superadmin/tenant-services/page.tsx` | Exists (basic) |
| 03 | `03-tenant-detail.md` | — | Not built | P1 |
| 04 | `04-create-tenant.md` | — | Not built | P1 |
| 05 | `05-tenant-settings.md` | — | Not built | P1 |
| 06 | `06-user-directory.md` | — | Not built | P1 |
| 07 | `07-user-override.md` | — | Not built | P2 |
| 08 | `08-impersonate-user.md` | — | Not built | P2 |
| 09 | `09-platform-settings.md` | — | Not built | P1 |
| 10 | `10-feature-flags.md` | — | Not built | P1 |

---

## Implementation Notes

- Super admin is the platform-level admin (manages all tenants)
- Separate login at `/superadmin/login` with elevated privileges
- Tenant services page exists — basic list of tenants and their enabled services
- User impersonation (08) is a powerful debugging tool — P2 with security implications
- Feature flags (10) overlaps with config module feature flags
- 29 design spec files total — split into 3 integration files by scope
