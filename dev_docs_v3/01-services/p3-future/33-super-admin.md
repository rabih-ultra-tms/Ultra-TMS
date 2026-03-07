# Service Hub: Super Admin (33)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Priority:** P3 Future (part of Auth module — cross-tenant admin access)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — SUPER_ADMIN role exists in auth module, limited cross-tenant functionality |
| **Frontend** | Not Built — no dedicated super admin UI |
| **Tests** | None |
| **Note** | Not a standalone module. Super Admin is a role-based access layer on top of the Auth module. |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Role | Built | `SUPER_ADMIN` role exists in auth/roles enum |
| Cross-Tenant Query | Partial | Some endpoints skip tenantId filter for SUPER_ADMIN |
| Frontend | Not Built | No dedicated super admin dashboard |
| Tests | None | |

---

## 3. Screens (Planned)

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Super Admin Dashboard | `/super-admin` | Not Built | Cross-tenant overview |
| Tenant Management | `/super-admin/tenants` | Not Built | Create, configure, suspend tenants |
| Tenant Detail | `/super-admin/tenants/[id]` | Not Built | Tenant config, users, stats |
| Global User Management | `/super-admin/users` | Not Built | Cross-tenant user search |
| System Health | `/super-admin/system` | Not Built | Infrastructure monitoring |

---

## 4. Business Rules

1. **SUPER_ADMIN Role:** Highest privilege level. Can access any tenant's data. NOT a per-tenant role — it's a platform-level role.
2. **Cross-Tenant Queries:** When SUPER_ADMIN is detected, tenantId filter is bypassed. This must be carefully implemented to avoid data leaks.
3. **Tenant Provisioning:** Creating a new tenant requires: database seed, default config, admin user creation, feature flag setup.
4. **Audit Trail:** All SUPER_ADMIN actions are logged with enhanced audit detail (which tenant was accessed, what was changed).

---

## 5. Design Links

| Screen | Path |
|--------|------|
| Super Admin specs | `dev_docs/12-Rabih-design-Process/38-super-admin/` |

---

## 6. Dependencies

**Depends on:** Auth & Admin (role system), Config (tenant configuration), All services (cross-tenant access)

**Depended on by:** Tenant onboarding, platform administration
