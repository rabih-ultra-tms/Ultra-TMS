# Service Hub: Config (31)

> **Priority:** P3 Future | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (config entries)
> **Design specs:** `dev_docs/12-Rabih-design-Process/23-config/` (9 files)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D+ (3/10) |
| **Confidence** | High — code confirmed via scan |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 9 controllers, 39 endpoints in `apps/api/src/modules/config/` |
| **Frontend** | Not Built — some config is embedded in Settings pages (Admin) |
| **Tests** | Partial — spec files exist for most sub-modules |
| **Scope** | Tenant configuration, feature flags, sequences, email templates, system settings, config caching |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Config referenced across service definitions |
| Design Specs | Done | 9 files in `dev_docs/12-Rabih-design-Process/23-config/` |
| Backend Controller | Partial | 9 controllers across 10 sub-modules |
| Backend Service | Partial | 10 services + config-cache service |
| Prisma Models | Partial | Uses Tenant.settings JSON, custom_fields columns across models |
| Frontend Pages | Not Built | No dedicated `/config` routes; some settings embedded in Admin |
| React Hooks | Not Built | No dedicated config hooks |
| Components | Not Built | No dedicated config components |
| Tests | Partial | Spec files exist for most services and feature-flag evaluator |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| System Config | `/admin/config/system` | Not Built | 0/10 | Global system settings |
| Feature Flags | `/admin/config/features` | Not Built | 0/10 | Enable/disable features per tenant |
| Email Templates | `/admin/config/email-templates` | Not Built | 0/10 | Template management with variables |
| Sequence Config | `/admin/config/sequences` | Not Built | 0/10 | Auto-numbering for invoices, loads, etc. |
| Business Hours | `/admin/config/business-hours` | Not Built | 0/10 | Tenant operating hours |
| Preferences | `/admin/config/preferences` | Not Built | 0/10 | Tenant-level preference settings |
| Tenant Services | `/admin/config/tenant-services` | Not Built | 0/10 | Enable/disable modules per tenant |
| Document Templates | `/admin/config/templates` | Not Built | 0/10 | BOL, invoice, rate confirmation templates |
| Config History | `/admin/config/history` | Not Built | 0/10 | Audit trail for config changes |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/config/tenant` | TenantConfigController | Partial | Get tenant configuration |
| PUT | `/api/v1/config/tenant` | TenantConfigController | Partial | Update tenant configuration |
| PATCH | `/api/v1/config/tenant` | TenantConfigController | Partial | Partial update tenant config |
| GET | `/api/v1/config/system` | SystemConfigController | Partial | Get system-wide config |
| PUT | `/api/v1/config/system` | SystemConfigController | Partial | Update system config |
| GET | `/api/v1/config/system/keys` | SystemConfigController | Partial | List all config keys |
| GET | `/api/v1/config/system/:key` | SystemConfigController | Partial | Get specific config value |
| GET | `/api/v1/config/features` | FeaturesController | Partial | List all feature flags |
| POST | `/api/v1/config/features` | FeaturesController | Partial | Create feature flag |
| GET | `/api/v1/config/features/:id` | FeaturesController | Partial | Get feature flag details |
| PUT | `/api/v1/config/features/:id` | FeaturesController | Partial | Update feature flag |
| DELETE | `/api/v1/config/features/:id` | FeaturesController | Partial | Remove feature flag |
| POST | `/api/v1/config/features/:id/evaluate` | FeaturesController | Partial | Evaluate flag for context |
| GET | `/api/v1/config/email-templates` | EmailTemplatesController | Partial | List email templates |
| POST | `/api/v1/config/email-templates` | EmailTemplatesController | Partial | Create email template |
| GET | `/api/v1/config/email-templates/:id` | EmailTemplatesController | Partial | Get template details |
| PUT | `/api/v1/config/email-templates/:id` | EmailTemplatesController | Partial | Update template |
| DELETE | `/api/v1/config/email-templates/:id` | EmailTemplatesController | Partial | Delete template |
| POST | `/api/v1/config/email-templates/:id/preview` | EmailTemplatesController | Partial | Preview with sample data |
| GET | `/api/v1/config/sequences` | SequencesController | Partial | List sequence generators |
| POST | `/api/v1/config/sequences` | SequencesController | Partial | Create sequence |
| GET | `/api/v1/config/sequences/:id` | SequencesController | Partial | Get sequence details |
| PUT | `/api/v1/config/sequences/:id` | SequencesController | Partial | Update sequence |
| POST | `/api/v1/config/sequences/:id/next` | SequencesController | Partial | Generate next number |
| POST | `/api/v1/config/sequences/:id/reset` | SequencesController | Partial | Reset counter |
| GET | `/api/v1/config/preferences` | PreferencesController | Partial | Get tenant preferences |
| PUT | `/api/v1/config/preferences` | PreferencesController | Partial | Update preferences |
| GET | `/api/v1/config/preferences/:key` | PreferencesController | Partial | Get specific preference |
| GET | `/api/v1/config/business-hours` | BusinessHoursController | Partial | Get business hours |
| PUT | `/api/v1/config/business-hours` | BusinessHoursController | Partial | Update business hours |
| GET | `/api/v1/config/templates` | TemplatesController | Partial | List document templates |
| POST | `/api/v1/config/templates` | TemplatesController | Partial | Create template |
| GET | `/api/v1/config/templates/:id` | TemplatesController | Partial | Get template |
| PUT | `/api/v1/config/templates/:id` | TemplatesController | Partial | Update template |
| DELETE | `/api/v1/config/templates/:id` | TemplatesController | Partial | Delete template |
| GET | `/api/v1/config/tenant-services` | TenantServicesController | Partial | List enabled services |
| PUT | `/api/v1/config/tenant-services` | TenantServicesController | Partial | Enable/disable services |
| GET | `/api/v1/config/tenant-services/:service` | TenantServicesController | Partial | Check if service enabled |
| POST | `/api/v1/config/tenant-services/:service/toggle` | TenantServicesController | Partial | Toggle service on/off |

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| SystemConfigForm | TBD | Not Built | No |
| FeatureFlagTable | TBD | Not Built | No |
| FeatureFlagEditor | TBD | Not Built | No |
| EmailTemplateEditor | TBD | Not Built | No |
| EmailTemplatePreview | TBD | Not Built | No |
| SequenceConfigTable | TBD | Not Built | No |
| SequenceFormatEditor | TBD | Not Built | No |
| BusinessHoursEditor | TBD | Not Built | No |
| PreferencesForm | TBD | Not Built | No |
| TenantServicesGrid | TBD | Not Built | No |
| DocumentTemplateEditor | TBD | Not Built | No |
| ConfigHistoryTable | TBD | Not Built | No |

---

## 6. Hooks

| Hook | Endpoints Used | Envelope Unwrapped? | Notes |
|------|---------------|---------------------|-------|
| `useSystemConfig` | `/config/system` | TBD | Not built |
| `useFeatureFlags` | `/config/features` | TBD | Not built |
| `useFeatureFlag` | `/config/features/:id` | TBD | Not built |
| `useEmailTemplates` | `/config/email-templates` | TBD | Not built |
| `useSequences` | `/config/sequences` | TBD | Not built |
| `usePreferences` | `/config/preferences` | TBD | Not built |
| `useBusinessHours` | `/config/business-hours` | TBD | Not built |
| `useTenantServices` | `/config/tenant-services` | TBD | Not built |
| `useDocumentTemplates` | `/config/templates` | TBD | Not built |

---

## 7. Business Rules

1. **Tenant Configuration:** Each tenant has company settings stored as structured JSON in `Tenant.settings` (company name, address, logo URL, timezone, currency, date format, locale). Defaults are applied on tenant creation. All changes are audit-logged with before/after snapshots via `config-history.service.ts`.

2. **Business Hours:** Business hours define the operating schedule per tenant (days of week, open/close times, timezone). Used by dispatching to calculate available windows, by SLA calculations for response time, and by automated notifications to suppress alerts outside business hours. Supports holiday overrides.

3. **Preferences:** Tenant-level preferences control behavior across the application (default pagination size, notification channels, auto-save intervals, default map provider, measurement units). Preferences are key-value pairs with type validation. Changes take effect immediately for all users in the tenant.

4. **Feature Flags:** Features can be enabled or disabled per tenant using the feature flag system. Flags support boolean on/off, percentage rollout, and user-segment targeting. The `feature-flag.evaluator.ts` evaluates flags against a context (tenantId, userId, plan tier). Used to gate P1/P2/P3 features behind flags before general availability. Flag changes are cached in Redis and invalidated on update.

5. **Sequence Generators:** Auto-numbering sequences generate unique, sequential identifiers for business entities (invoices: `INV-2026-00001`, loads: `LD-00001`, BOLs: `BOL-00001`, quotes: `QT-00001`). Each sequence has a configurable prefix, separator, zero-padding width, and optional year/month segment. Sequences are tenant-scoped and use atomic database operations to prevent duplicates. Sequences can be reset annually or manually by Admin.

6. **Email Template Management:** Email templates define the subject, body (HTML + plain text), and variable placeholders for transactional emails (load confirmation, invoice, rate confirmation, driver assignment, status updates). Templates support Handlebars-style variables (`{{load.origin}}`, `{{carrier.name}}`). Each template has a preview endpoint that renders with sample data. Templates are tenant-specific with system defaults as fallback.

7. **System Configuration:** Global system settings apply across all tenants (SMTP configuration, API rate limits, file upload size limits, maintenance mode flag, default feature flags). System config is SUPER_ADMIN only. Changes require confirmation and are logged to AuditLog. Critical settings (maintenance mode, auth settings) trigger immediate cache invalidation.

8. **Config Caching with Redis:** The `config-cache.service.ts` caches frequently accessed config values in Redis to avoid repeated database queries. Cache keys are namespaced by tenant (`config:{tenantId}:{key}`). TTL defaults to 5 minutes for preferences, 15 minutes for feature flags, 1 hour for system config. Cache is invalidated on any config write operation. All services read config through the cache layer, never directly from the database for hot-path reads.

9. **Tenant Services:** Each tenant can enable or disable entire service modules (e.g., disable EDI if not needed, disable Agent module). Disabled services return 403 for all endpoints in that module. Service availability is checked via middleware. Tied to tenant plan tier — Enterprise tenants get all services, Starter gets a subset.

10. **Document Templates:** Configurable templates for generated documents (BOL, rate confirmation, invoice PDF, carrier packet). Templates define layout, fields, and branding (logo, colors, footer). Rendered server-side to PDF. Each tenant can customize or use system defaults.

---

## 8. Data Model

### System Config (conceptual — stored as key-value)
```
SystemConfig {
  id         String (UUID)
  key        String (unique)
  value      Json
  category   String (auth, email, storage, limits, maintenance)
  dataType   String (string, number, boolean, json)
  createdAt  DateTime
  updatedAt  DateTime
}
```

### Feature Flag
```
FeatureFlag {
  id          String (UUID)
  key         String (unique per tenant)
  name        String
  description String?
  enabled     Boolean (default: false)
  rollout     Int? (percentage 0-100)
  conditions  Json? (targeting rules)
  tenantId    String? (null = global flag)
  createdAt   DateTime
  updatedAt   DateTime
}
```

### Sequence
```
Sequence {
  id          String (UUID)
  name        String (e.g., "invoice", "load", "bol")
  prefix      String (e.g., "INV", "LD", "BOL")
  separator   String (default: "-")
  padding     Int (default: 5)
  current     Int (current counter value)
  includeYear Boolean (default: true)
  tenantId    String (FK -> Tenant)
  resetPolicy String? (NEVER, YEARLY, MONTHLY)
  lastReset   DateTime?
  createdAt   DateTime
  updatedAt   DateTime
}
```

### Email Template
```
EmailTemplate {
  id          String (UUID)
  name        String
  slug        String (unique per tenant)
  subject     String (with variable placeholders)
  bodyHtml    String (Handlebars template)
  bodyText    String (plain text fallback)
  variables   Json (list of available variables with descriptions)
  category    String (load, invoice, carrier, notification)
  isDefault   Boolean (system-provided default)
  tenantId    String? (null = system default)
  createdAt   DateTime
  updatedAt   DateTime
}
```

### Config History
```
ConfigHistory {
  id         String (UUID)
  tenantId   String
  userId     String (who changed it)
  configType String (system, feature, sequence, preference, template)
  configKey  String
  before     Json?
  after      Json
  createdAt  DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `key` (system config) | IsString, unique, snake_case format | "Config key must be unique snake_case" |
| `value` (system config) | Must match declared `dataType` | "Value does not match expected type" |
| `feature flag key` | IsString, unique per tenant, kebab-case | "Feature flag key must be unique kebab-case" |
| `rollout` | IsInt, Min(0), Max(100) | "Rollout must be between 0 and 100" |
| `sequence prefix` | IsString, 1-10 chars, uppercase alpha | "Prefix must be 1-10 uppercase letters" |
| `sequence padding` | IsInt, Min(1), Max(10) | "Padding must be between 1 and 10" |
| `email template subject` | IsString, 1-200 chars | "Subject is required (max 200 chars)" |
| `email template bodyHtml` | IsString, must contain valid HTML | "Template body is required" |
| `business hours open/close` | IsString, HH:mm format, open < close | "Invalid time format or open must be before close" |
| `tenant service toggle` | Service must exist in service registry | "Unknown service identifier" |

---

## 10. Status States

### Feature Flag Lifecycle
```
DISABLED (default) -> ENABLED (admin toggle)
ENABLED -> PERCENTAGE_ROLLOUT (set rollout 1-99)
PERCENTAGE_ROLLOUT -> ENABLED (set rollout to 100)
ENABLED -> DISABLED (admin toggle)
Any -> ARCHIVED (soft removal, keeps history)
```

### Email Template Lifecycle
```
DRAFT (created) -> ACTIVE (published)
ACTIVE -> DRAFT (unpublished for editing)
ACTIVE -> ARCHIVED (replaced by new version)
System Default -> Cannot be deleted (only overridden per tenant)
```

### Sequence State
```
ACTIVE (generating numbers) -> PAUSED (admin action)
PAUSED -> ACTIVE (admin resume)
ACTIVE -> RESET (counter set to 0, auto or manual)
RESET -> ACTIVE (immediately, next call generates from 1)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No dedicated frontend UI — config is P3 | P3 UX | N/A | By Design |
| Config used internally by all services but no admin visibility | P2 Ops | N/A | Open |
| No config validation on startup (missing keys fail silently) | P2 Reliability | `config.module.ts` | Open |
| Cache invalidation may have race conditions under concurrent writes | P3 Performance | `config-cache.service.ts` | Open |
| Feature flag evaluator has no percentage rollout persistence (re-evaluates each request) | P3 Consistency | `feature-flag.evaluator.ts` | Open |
| Sequence counter could gap under failed transactions | P3 Data | `sequences.service.ts` | Open (acceptable in TMS) |
| No config export/import for tenant migration | P3 Ops | N/A | Not Built |

---

## 12. Tasks

### Backlog (P3 — build when P0/P1/P2 complete)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CFG-101 | Build System Config UI (list + edit form) | M (4h) | P3 |
| CFG-102 | Build Feature Flags UI (table + toggle + rollout slider) | L (6h) | P3 |
| CFG-103 | Build Email Template Editor (WYSIWYG + variable picker + preview) | XL (8h) | P3 |
| CFG-104 | Build Sequence Config UI (table + format editor + reset) | M (4h) | P3 |
| CFG-105 | Build Business Hours Editor (week grid + holiday overrides) | M (3h) | P3 |
| CFG-106 | Build Preferences Form (categorized key-value editor) | M (3h) | P3 |
| CFG-107 | Build Tenant Services toggle grid | S (2h) | P3 |
| CFG-108 | Build Config History / audit trail viewer | M (3h) | P3 |
| CFG-109 | Add config validation on app startup (fail-fast for missing keys) | S (2h) | P2 |
| CFG-110 | Write config service tests (unit + integration) | M (4h) | P3 |
| CFG-111 | Config export/import for tenant onboarding | M (4h) | P3 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/00-service-overview.md` |
| System Config | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/01-system-config.md` |
| Feature Flags | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/02-feature-flags.md` |
| Email Settings | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/03-email-settings.md` |
| Notification Config | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/04-notification-config.md` |
| Integration Settings | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/05-integration-settings.md` |
| Custom Fields | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/06-custom-fields.md` |
| Lookup Tables | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/07-lookup-tables.md` |
| System Health | Full 15-section | `dev_docs/12-Rabih-design-Process/23-config/08-system-health.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Config as internal service only | 9 controllers with 39 endpoints built | Backend exceeds plan |
| Simple key-value config | Full sub-module architecture (features, sequences, templates, etc.) | Scope expanded |
| No caching layer | Redis-backed config cache with TTL and invalidation | Enhancement |
| No feature flags | Feature flag evaluator with rollout support | Enhancement |
| No sequence generators | Full auto-numbering with format customization | Enhancement |
| Config UI planned | No frontend built | Frontend gap |
| No config history | Config history service tracks all changes | Enhancement |
| Basic email templates | Full template management with preview | Enhancement |
| Tests not planned | Spec files exist for most sub-modules | Partial coverage |

---

## 15. Dependencies

**Depends on:**
- PostgreSQL (Tenant.settings JSON, config key-value storage, sequence counters)
- Redis (config caching via `config-cache.service.ts`, feature flag evaluation cache)
- Auth & Admin (RBAC — only ADMIN/SUPER_ADMIN can modify config, tenantId isolation)
- AuditLog (all config changes logged via config-history service)

**Depended on by:**
- ALL services — every service reads tenant config (custom_fields, preferences, feature flags)
- TMS Core — sequence generators for load numbers, BOL numbers
- Accounting — sequence generators for invoice numbers
- Communication — email templates for transactional emails (load updates, notifications)
- Carrier Management — feature flags gate optional carrier features (CSA lookup, insurance verification)
- Sales & Quotes — sequence generators for quote numbers
- Documents — document templates for PDF generation (BOL, rate confirmation, invoice)
- Auth & Admin — tenant services toggle controls which modules are accessible

**Breaking change risk:** HIGH — Config is a foundational service. Changes to config key structure, cache invalidation logic, or feature flag evaluation affect every service in the platform.
