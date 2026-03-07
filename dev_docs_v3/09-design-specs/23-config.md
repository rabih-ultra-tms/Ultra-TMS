# Config Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/23-config/` (9 files)
**MVP Tier:** P1
**Frontend routes:** `/admin/settings` (basic)
**Backend module:** `apps/api/src/modules/config/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-system-config.md` | `/admin/settings` | `(dashboard)/admin/settings/page.tsx` | Exists (basic) |
| 02 | `02-feature-flags.md` | — | Not built | P1 |
| 03 | `03-email-settings.md` | — | Not built | P1 |
| 04 | `04-notification-config.md` | — | Not built | P2 |
| 05 | `05-integration-settings.md` | — | Not built | P2 |
| 06 | `06-custom-fields.md` | — | Not built | P2 |
| 07 | `07-lookup-tables.md` | — | Not built | P2 |
| 08 | `08-system-health.md` | — | Not built | P1 (uses health module) |

---

## Backend

- `TenantConfigController` at `config/tenant/tenant-config.controller.ts`
- Key-value configuration CRUD per tenant

---

## Implementation Notes

- Basic settings page exists at `/admin/settings`
- Feature flags (02), email settings (03), system health (08) are P1
- Custom fields (06) and lookup tables (07) are powerful P2 features for tenant customization
- Config module uses key-value pattern — flexible but needs UI for structured editing
