# Config Module API Spec

**Module:** `apps/api/src/modules/config/`
**Base path:** `/api/v1/`
**Controllers:** BusinessHoursController, EmailTemplatesController, FeaturesController, PreferencesController, SequencesController, SystemConfigController, TemplatesController, TenantServicesController, TenantConfigController

## Auth

All controllers use `@UseGuards(JwtAuthGuard)` with `@CurrentTenant()`. SystemConfigController and TenantServicesController add `@Roles()` on specific endpoints.

---

## BusinessHoursController

**Path prefix:** `config`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/config/business-hours` | JWT only | Get business hours |
| PUT | `/config/business-hours` | JWT only | Update business hours |
| GET | `/config/holidays` | JWT only | List holidays |
| POST | `/config/holidays` | JWT only | Add holiday |
| DELETE | `/config/holidays/:id` | JWT only | Remove holiday |

---

## EmailTemplatesController

**Path prefix:** `config/email-templates`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/config/email-templates` | JWT only | List email templates |
| GET | `/config/email-templates/:id` | JWT only | Get email template by ID |
| PUT | `/config/email-templates/:id` | JWT only | Update email template |

---

## FeaturesController

**Path prefix:** `features`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/features` | JWT only | List feature flags |
| GET | `/features/:code` | JWT only | Get feature flag by code |
| POST | `/features` | JWT only | Create feature flag |
| PUT | `/features/:code` | JWT only | Update feature flag |
| GET | `/features/:code/enabled` | JWT only | Check if feature enabled |
| PUT | `/features/:code/override` | JWT only | Set feature flag override |
| DELETE | `/features/:code/override` | JWT only | Remove feature flag override |

---

## PreferencesController

**Path prefix:** `preferences`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/preferences` | JWT only | List user preferences |
| PUT | `/preferences/:key` | JWT only | Set user preference |
| DELETE | `/preferences/:key` | JWT only | Reset user preference |
| POST | `/preferences/bulk` | JWT only | Bulk update preferences |

---

## SequencesController

**Path prefix:** `config/sequences`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/config/sequences` | JWT only | List number sequences |
| PUT | `/config/sequences/:type` | JWT only | Update number sequence |
| POST | `/config/sequences/:type/next` | JWT only | Get next sequence number |

---

## SystemConfigController

**Path prefix:** `config/system`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/config/system` | JWT only | List system configuration |
| GET | `/config/system/categories` | JWT only | List config categories |
| GET | `/config/system/:key` | JWT only | Get config value |
| PUT | `/config/system/:key` | ADMIN, SUPER_ADMIN | Update config value |
| POST | `/config/system/validate` | ADMIN, SUPER_ADMIN | Validate config value |

---

## TemplatesController

**Path prefix:** `config/templates`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/config/templates` | JWT only | List config templates |
| POST | `/config/templates/:code/apply` | JWT only | Apply config template |

---

## TenantServicesController

**Path prefix:** `tenant-services`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/tenant-services` | SUPER_ADMIN (RolesGuard) | List all tenant services |
| GET | `/tenant-services/tenants` | SUPER_ADMIN (RolesGuard) | List services grouped by tenant |
| GET | `/tenant-services/enabled` | JWT only | Get enabled service keys |
| PUT | `/tenant-services` | SUPER_ADMIN (RolesGuard) | Update tenant service |
| PUT | `/tenant-services/tenants` | SUPER_ADMIN (RolesGuard) | Update service for specific tenant |

**Note:** Manually wraps responses in `{ data: ... }` envelope.

---

## TenantConfigController

**Path prefix:** `config/tenant`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/config/tenant` | JWT only | List tenant configuration |
| GET | `/config/tenant/:key` | JWT only | Get tenant config value |
| PUT | `/config/tenant/:key` | JWT only | Set tenant config value |
| DELETE | `/config/tenant/:key` | JWT only | Reset tenant config value |
| POST | `/config/tenant/bulk` | JWT only | Bulk update tenant config |

---

## Known Issues

- 9 controllers in a single module -- very large, could benefit from sub-module extraction
- Most config endpoints lack RolesGuard -- any authenticated user can modify config
- FeaturesController and PreferencesController use different path prefixes than the `config/` convention
