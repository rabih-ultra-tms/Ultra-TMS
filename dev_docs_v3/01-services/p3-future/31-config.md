# Service Hub: Config (31)

> **Priority:** P3 Future | **Status:** Backend Production, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-31 tribunal)
> **Original definition:** `dev_docs/02-services/` (config entries)
> **Design specs:** `dev_docs/12-Rabih-design-Process/23-config/` (9 files)
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-31-config.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | A- (8.0/10) |
| **Confidence** | High — code-verified via PST-31 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — 9 controllers, 11 services, 39 endpoints, 43 TypeScript files in `apps/api/src/modules/config/` |
| **Frontend** | Not Built — some config is embedded in Settings pages (Admin) |
| **Tests** | Partial — 11 spec files, 42 tests, 743 LOC (10/11 services covered) |
| **Scope** | Tenant configuration, feature flags, sequences, email templates, system settings, config caching, business hours, preferences, tenant services, document templates |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Config referenced across service definitions |
| Design Specs | Done | 9 files in `dev_docs/12-Rabih-design-Process/23-config/` |
| Backend Controllers | Production | 9 controllers across sub-modules |
| Backend Services | Production | 11 services (including ConfigCacheService, ConfigHistoryService, FeatureFlagEvaluator) |
| Prisma Models | Production | 15 models (SystemConfig, FeatureFlag, NumberSequence, CommunicationTemplate, ConfigHistory, FeatureFlagOverride, TenantConfig, TenantService, BusinessHours, Holiday, CacheConfig, CacheInvalidationRule, ConfigTemplate, DocumentTemplate, UserPreference) |
| Frontend Pages | Not Built | No dedicated `/config` routes; some settings embedded in Admin |
| React Hooks | Not Built | No dedicated config hooks |
| Components | Not Built | No dedicated config components |
| Tests | Partial | 11 spec files, 42 tests, 743 LOC — 10/11 services covered (TenantServicesService lacks spec) |
| Security | Weak | JwtAuthGuard on all 9 controllers, but RolesGuard on only 1/9 (TenantServicesController) |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| System Config | `/admin/config/system` | Not Built | 0/10 | Global system settings — backend has 5 endpoints |
| Feature Flags | `/admin/config/features` | Not Built | 0/10 | Enable/disable features — backend has 7 endpoints |
| Email Templates | `/admin/config/email-templates` | Not Built | 0/10 | Template management — backend has 3 endpoints |
| Sequence Config | `/admin/config/sequences` | Not Built | 0/10 | Auto-numbering — backend has 3 endpoints |
| Business Hours | `/admin/config/business-hours` | Not Built | 0/10 | Tenant operating hours + holidays — backend has 5 endpoints |
| Preferences | `/admin/config/preferences` | Not Built | 0/10 | Tenant-level preferences — backend has 4 endpoints |
| Tenant Services | `/admin/config/tenant-services` | Not Built | 0/10 | Module toggle — backend has 5 endpoints (SUPER_ADMIN guarded) |
| Document Templates | `/admin/config/templates` | Not Built | 0/10 | BOL, invoice, rate confirmation templates — backend has 2 endpoints |
| Config History | `/admin/config/history` | Not Built | 0/10 | Audit trail for config changes |

---

## 4. API Endpoints

**Total: 39 endpoints across 9 controllers (verified by PST-31)**

### SystemConfigController (5 endpoints — prefix: `config/system`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/config/system` | Production | Get system-wide config |
| GET | `/api/v1/config/system/keys` | Production | List all config keys |
| GET | `/api/v1/config/system/categories` | Production | List config categories |
| PUT | `/api/v1/config/system/:key` | Production | Update config value — has @Roles but NO RolesGuard (decorative!) |
| POST | `/api/v1/config/system/validate` | Production | Validate config value — has @Roles but NO RolesGuard (decorative!) |

### FeaturesController (7 endpoints — prefix: `features` — NOT `config/features`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/features` | Production | List all feature flags |
| POST | `/api/v1/features` | Production | Create feature flag |
| GET | `/api/v1/features/:code` | Production | Get feature flag by code |
| PUT | `/api/v1/features/:code` | Production | Update feature flag |
| GET | `/api/v1/features/:code/enabled` | Production | Check if flag is enabled |
| PUT | `/api/v1/features/:code/override` | Production | Set per-tenant/user override |
| DELETE | `/api/v1/features/:code/override` | Production | Remove override |

### EmailTemplatesController (3 endpoints — prefix: `config/email-templates`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/config/email-templates` | Production | List email templates |
| GET | `/api/v1/config/email-templates/:id` | Production | Get template details |
| PUT | `/api/v1/config/email-templates/:id` | Production | Update template |

### SequencesController (3 endpoints — prefix: `config/sequences`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/config/sequences` | Production | List sequence generators |
| PUT | `/api/v1/config/sequences/:id` | Production | Update sequence |
| POST | `/api/v1/config/sequences/:id/next` | Production | Generate next number |

### BusinessHoursController (5 endpoints — prefix: `config`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/config/business-hours` | Production | Get business hours |
| PUT | `/api/v1/config/business-hours` | Production | Update business hours |
| GET | `/api/v1/config/holidays` | Production | List holidays |
| POST | `/api/v1/config/holidays` | Production | Create holiday |
| DELETE | `/api/v1/config/holidays/:id` | Production | Delete holiday (hard-delete violation!) |

### PreferencesController (4 endpoints — prefix: `preferences` — NOT `config/preferences`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/preferences` | Production | Get tenant preferences |
| PUT | `/api/v1/preferences` | Production | Update preferences |
| DELETE | `/api/v1/preferences/:key` | Production | Delete preference |
| POST | `/api/v1/preferences/bulk` | Production | Bulk update preferences |

### TemplatesController (2 endpoints — prefix: `config/templates`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/config/templates` | Production | List document templates |
| POST | `/api/v1/config/templates/:code/apply` | Production | Apply template to tenant |

### TenantConfigController (5 endpoints — prefix: `config/tenant`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/config/tenant` | Production | Get tenant configuration |
| PUT | `/api/v1/config/tenant` | Production | Update tenant configuration |
| PATCH | `/api/v1/config/tenant` | Production | Partial update tenant config |
| DELETE | `/api/v1/config/tenant/:key` | Production | Delete config key |
| POST | `/api/v1/config/tenant/bulk` | Production | Bulk update tenant config |

### TenantServicesController (5 endpoints — prefix: `tenant-services` — NOT `config/tenant-services`)
| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/tenant-services` | Production | List enabled services |
| PUT | `/api/v1/tenant-services` | Production | Enable/disable services |
| GET | `/api/v1/tenant-services/tenants` | Production | List tenants with service info |
| GET | `/api/v1/tenant-services/enabled` | Production | Get enabled services for tenant |
| PUT | `/api/v1/tenant-services/tenants` | Production | Update tenant service assignments |

---

## 5. Components

| Component | Path | Status | Shared? |
|-----------|------|--------|---------|
| SystemConfigForm | TBD | Not Built | No |
| FeatureFlagTable | TBD | Not Built | No |
| FeatureFlagEditor | TBD | Not Built | No |
| EmailTemplateEditor | TBD | Not Built | No |
| SequenceConfigTable | TBD | Not Built | No |
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
| `useFeatureFlags` | `/features` | TBD | Not built |
| `useEmailTemplates` | `/config/email-templates` | TBD | Not built |
| `useSequences` | `/config/sequences` | TBD | Not built |
| `usePreferences` | `/preferences` | TBD | Not built |
| `useBusinessHours` | `/config/business-hours` | TBD | Not built |
| `useTenantServices` | `/tenant-services` | TBD | Not built |
| `useDocumentTemplates` | `/config/templates` | TBD | Not built |

---

## 7. Business Rules

1. **Tenant Configuration:** Each tenant has scoped key-value config stored in TenantConfig (@@unique tenantId+configKey). Defaults are applied on tenant creation. All changes are audit-logged with before/after snapshots via ConfigHistoryService.

2. **Business Hours:** Business hours define the operating schedule per tenant (days of week, open/close times, timezone, location support via BusinessHours model — 15 fields). Holiday model supports recurring holidays. Used by dispatching to calculate available windows, by SLA calculations for response time, and by automated notifications to suppress alerts outside business hours.

3. **Preferences:** Tenant-level preferences stored in UserPreference model (per-user key-value pairs, 13 fields) control behavior across the application. Preferences are key-value pairs with type validation. Changes take effect immediately. Supports bulk update via POST /preferences/bulk.

4. **Feature Flags:** Flags support boolean on/off (via `enabled` boolean), percentage rollout (via `rolloutPercent` int), and per-tenant/user override system (FeatureFlagOverride model with expiry). The FeatureFlagEvaluator uses `crypto.createHash('sha256')` for deterministic stateless percentage rollout per userId. Flag changes are cached in Redis and invalidated on update. 4 EventEmitter events: `feature.enabled`, `feature.disabled`, `config.system.updated`, `config.tenant.updated`.

5. **Sequence Generators:** NumberSequence model (14 fields) generates unique, sequential identifiers for business entities. Uses `sequenceName` (not `name`), `currentNumber` (not `current`), `resetFrequency` enum (NEVER, DAILY, MONTHLY, YEARLY — not `resetPolicy` string). Sequences are tenant-scoped and use atomic database operations to prevent duplicates.

6. **Email Template Management:** CommunicationTemplate model (18 fields) supports multi-channel templates with `channel`, `subjectEn`/`subjectEs`, `bodyEn`/`bodyEs`, `fromName`, `fromEmail`, `replyTo`, `isSystem` fields. Templates are tenant-specific with system defaults as fallback. No create or delete endpoints — only GET list, GET :id, PUT :id.

7. **System Configuration:** Global system settings via SystemConfig model (12 fields including category enum, validationRules, deletedAt, createdById, updatedById). ConfigCategory enum values: SECURITY, LIMITS, DEFAULTS, INTEGRATIONS, EMAIL, NOTIFICATIONS. **WARNING:** @Roles('ADMIN', 'SUPER_ADMIN') on PUT/:key and POST/validate is DECORATIVE — RolesGuard is not applied, so any authenticated user can modify system config.

8. **Config Caching with Redis:** ConfigCacheService caches frequently accessed config values in Redis. Cache keys namespaced as `config:{category}:{identifier}`. TTL defaults to 5 minutes. Cache is invalidated on any config write operation. 5/11 services use the cache layer. CacheConfig model (12 fields) stores per-tenant cache TTL configuration. CacheInvalidationRule model (12 fields) defines event-driven cache invalidation rules.

9. **Tenant Services:** TenantService model (12 fields) enables/disables entire service modules per tenant. TenantServicesController is the ONLY controller with proper RolesGuard + @Roles('SUPER_ADMIN') on 4/5 endpoints. Only TenantServicesService checks `deletedAt: null` — the sole soft-delete compliant service.

10. **Document Templates:** ConfigTemplate model (13 fields) provides reusable config schemas with defaults. DocumentTemplate model (18 fields) handles document generation templates (BOL, invoice, rate confirmation). Only 2 endpoints: GET list and POST :code/apply.

11. **Config History:** ConfigHistory model (9 fields) logs all config changes. Uses `configKey` (not `configType`+`configKey`), `changedBy` (not `userId`), `oldValue`/`newValue` (not `before`/`after`).

---

## 8. Data Model

### SystemConfig (12 fields)
```
SystemConfig {
  id              String (UUID)
  key             String (unique)
  value           Json
  category        ConfigCategory (SECURITY, LIMITS, DEFAULTS, INTEGRATIONS, EMAIL, NOTIFICATIONS)
  dataType        DataType (STRING, NUMBER, BOOLEAN, JSON, DATE)
  description     String?
  validationRules Json?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
  createdById     String?
  updatedById     String?
}
```

### FeatureFlag (14 fields)
```
FeatureFlag {
  id             String (UUID)
  code           String (unique)
  name           String
  description    String?
  enabled        Boolean (default: false)
  status         FeatureFlagStatus (ACTIVE, DEPRECATED, ARCHIVED)
  rolloutPercent Int? (percentage 0-100)
  conditions     Json? (targeting rules)
  tenantIds      String[]? (targeted tenants)
  userIds        String[]? (targeted users)
  tenantId       String? (null = global flag)
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
  createdById    String?
}
```

### FeatureFlagOverride (13 fields)
```
FeatureFlagOverride {
  id           String (UUID)
  featureCode  String
  tenantId     String?
  userId       String?
  enabled      Boolean
  expiresAt    DateTime?
  reason       String?
  createdAt    DateTime
  updatedAt    DateTime
  deletedAt    DateTime?
  createdById  String?
  ...          (13 fields total)
}
```

### NumberSequence (14 fields — hub previously called "Sequence")
```
NumberSequence {
  id              String (UUID)
  sequenceName    String (e.g., "invoice", "load", "bol")
  prefix          String (e.g., "INV", "LD", "BOL")
  separator       String (default: "-")
  padding         Int (default: 5)
  currentNumber   Int (current counter value)
  includeYear     Boolean (default: true)
  tenantId        String (FK -> Tenant)
  resetFrequency  ResetFrequency (NEVER, DAILY, MONTHLY, YEARLY)
  lastReset       DateTime?
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime?
  ...             (14 fields total)
}
```

### CommunicationTemplate (18 fields — hub previously called "EmailTemplate")
```
CommunicationTemplate {
  id          String (UUID)
  code        String (unique per tenant)
  name        String
  channel     String
  subjectEn   String
  subjectEs   String?
  bodyEn      String (template)
  bodyEs      String?
  fromName    String?
  fromEmail   String?
  replyTo     String?
  variables   Json
  isSystem    Boolean
  tenantId    String? (null = system default)
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
  ...         (18 fields total)
}
```

### ConfigHistory (9 fields)
```
ConfigHistory {
  id         String (UUID)
  tenantId   String
  changedBy  String (who changed it)
  configKey  String
  oldValue   Json?
  newValue   Json
  metadata   Json?
  createdAt  DateTime
  ...        (9 fields total)
}
```

### TenantConfig (12 fields)
```
TenantConfig {
  id         String (UUID)
  tenantId   String
  configKey  String (@@unique with tenantId)
  value      Json
  dataType   DataType
  ...        (12 fields total)
}
```

### TenantService (12 fields)
```
TenantService {
  id         String (UUID)
  tenantId   String
  serviceKey String
  enabled    Boolean
  ...        (12 fields total)
}
```

### BusinessHours (15 fields)
```
BusinessHours {
  id         String (UUID)
  tenantId   String
  dayOfWeek  Int
  openTime   String (HH:mm)
  closeTime  String (HH:mm)
  timezone   String
  location   String?
  ...        (15 fields total)
}
```

### Holiday (12 fields)
```
Holiday {
  id         String (UUID)
  tenantId   String
  name       String
  date       DateTime
  recurring  Boolean
  ...        (12 fields total)
}
```

### CacheConfig (12 fields)
```
CacheConfig {
  id         String (UUID)
  tenantId   String
  cacheType  CacheType (ENTITY, QUERY, SESSION, CONFIG)
  ttlSeconds Int
  ...        (12 fields total)
}
```

### CacheInvalidationRule (12 fields)
```
CacheInvalidationRule {
  id           String (UUID)
  eventPattern String
  cacheType    CacheType
  ...          (12 fields total)
}
```

### ConfigTemplate (13 fields)
```
ConfigTemplate {
  id           String (UUID)
  code         String
  name         String
  schema       Json
  defaults     Json
  ...          (13 fields total)
}
```

### DocumentTemplate (18 fields)
```
DocumentTemplate {
  id           String (UUID)
  tenantId     String?
  templateType String (BOL, invoice, rate_con)
  layout       Json
  branding     Json
  ...          (18 fields total)
}
```

### UserPreference (13 fields)
```
UserPreference {
  id         String (UUID)
  tenantId   String
  userId     String
  prefKey    String
  value      Json
  ...        (13 fields total)
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `key` (system config) | IsString, unique, snake_case format | "Config key must be unique snake_case" |
| `value` (system config) | Must match declared `dataType` | "Value does not match expected type" |
| `feature flag code` | IsString, unique per tenant, kebab-case | "Feature flag code must be unique kebab-case" |
| `rolloutPercent` | IsInt, Min(0), Max(100) | "Rollout must be between 0 and 100" |
| `sequence prefix` | IsString, 1-10 chars, uppercase alpha | "Prefix must be 1-10 uppercase letters" |
| `sequence padding` | IsInt, Min(1), Max(10) | "Padding must be between 1 and 10" |
| `email template subjectEn` | IsString, 1-200 chars | "Subject is required (max 200 chars)" |
| `email template bodyEn` | IsString, must contain valid HTML | "Template body is required" |
| `business hours open/close` | IsString, HH:mm format, open < close | "Invalid time format or open must be before close" |
| `tenant service toggle` | Service must exist in service registry | "Unknown service identifier" |

---

## 10. Status States

### Feature Flag Lifecycle (CORRECTED per PST-31)
```
FeatureFlagStatus enum: ACTIVE | DEPRECATED | ARCHIVED
Enabled/disabled controlled by separate `enabled` boolean field.
Percentage rollout controlled by `rolloutPercent` int field (0-100).
Override system via FeatureFlagOverride model (per-tenant/user with expiry).

ACTIVE + enabled:true  -> Flag is live
ACTIVE + enabled:false -> Flag exists but is off
ACTIVE -> DEPRECATED   -> Flag marked for removal
Any -> ARCHIVED         -> Soft removal, keeps history
```

### Email Template Lifecycle
```
DRAFT (created) -> ACTIVE (published)
ACTIVE -> DRAFT (unpublished for editing)
ACTIVE -> ARCHIVED (replaced by new version)
System Default -> Cannot be deleted (only overridden per tenant)
Note: No create or delete endpoints exist — only GET list, GET :id, PUT :id
```

### Sequence State
```
ACTIVE (generating numbers)
Reset via resetFrequency enum: NEVER, DAILY, MONTHLY, YEARLY
Note: No PAUSED state, no reset endpoint — reset is automatic based on resetFrequency
```

### Enums (5 — from Prisma schema)

| Enum | Values |
|------|--------|
| FeatureFlagStatus | ACTIVE, DEPRECATED, ARCHIVED |
| ConfigCategory | SECURITY, LIMITS, DEFAULTS, INTEGRATIONS, EMAIL, NOTIFICATIONS |
| ResetFrequency | NEVER, DAILY, MONTHLY, YEARLY |
| DataType | STRING, NUMBER, BOOLEAN, JSON, DATE |
| CacheType | ENTITY, QUERY, SESSION, CONFIG |

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| SystemConfigController @Roles is decorative — no RolesGuard | P1 Security | **Open** | Has @Roles('ADMIN','SUPER_ADMIN') on PUT/:key and POST/validate but NO @UseGuards(RolesGuard) — system config writable by any authenticated user |
| 0/8 controllers have RolesGuard (except TenantServices) | P1 Security | **Open** | Feature flags, email templates, sequences, preferences, business hours — all ADMIN operations open to all authenticated users |
| 3 hard-delete violations | P2 Data | **Open** | BusinessHours holidays .delete(), Preferences .deleteMany(), TenantConfig .deleteMany() — use hard delete despite having deletedAt fields |
| 8/9 services skip deletedAt:null filter | P2 Data | **Open** | Only TenantServicesService checks deletedAt:null — all others may return soft-deleted records |
| No dedicated frontend UI — config is P3 | P3 UX | By Design | Backend is production-ready but no admin visibility |
| Config used internally by all services but no admin visibility | P2 Ops | Open | |
| No config validation on startup (missing keys fail silently) | P2 Reliability | Open | `config.module.ts` |
| Cache invalidation may have race conditions under concurrent writes | P3 Performance | Open | `config-cache.service.ts` |
| Feature flag evaluator has no percentage rollout persistence (re-evaluates each request) | P3 Consistency | Open | Architectural — stateless crypto-hash is standard (LaunchDarkly, Unleash do the same) |
| Sequence counter could gap under failed transactions | P3 Data | Open | Acceptable in TMS |
| No config export/import for tenant migration | P3 Ops | Not Built | |

---

## 12. Tasks

### Completed (verified by PST-31 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| CFG-109 | ~~Add config validation on app startup~~ | **Open** (not yet done) |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CFG-112 | Add RolesGuard to SystemConfigController (enforce existing @Roles) | XS (5min) | P1 |
| CFG-113 | Add @UseGuards(RolesGuard) + @Roles('ADMIN') to all 8 unguarded controllers | S (30min) | P1 |
| CFG-114 | Replace 3 hard-delete operations with soft-delete (update deletedAt) | S (30min) | P2 |
| CFG-115 | Add deletedAt:null filter to all 8 non-compliant services | M (45min) | P2 |
| CFG-109 | Add config validation on app startup (fail-fast for missing keys) | S (2h) | P2 |
| CFG-110 | Write TenantServicesService spec (only service without test coverage) | S (1h) | P3 |

### Backlog (P3 — build when P0/P1/P2 complete)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CFG-101 | Build System Config UI (list + edit form) | M (4h) | P3 |
| CFG-102 | Build Feature Flags UI (table + toggle + rollout slider) | L (6h) | P3 |
| CFG-103 | Build Email Template Editor (WYSIWYG + variable picker) | XL (8h) | P3 |
| CFG-104 | Build Sequence Config UI (table + format editor) | M (4h) | P3 |
| CFG-105 | Build Business Hours Editor (week grid + holiday overrides) | M (3h) | P3 |
| CFG-106 | Build Preferences Form (categorized key-value editor) | M (3h) | P3 |
| CFG-107 | Build Tenant Services toggle grid | S (2h) | P3 |
| CFG-108 | Build Config History / audit trail viewer | M (3h) | P3 |
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
| Config as internal service only | 9 controllers with 39 endpoints, 43 TypeScript files, 2,616 LOC | Backend massively exceeds plan |
| Simple key-value config | Full sub-module architecture (features, sequences, templates, etc.) | Scope expanded |
| No caching layer | Redis-backed config cache with TTL and invalidation (ConfigCacheService) | Enhancement |
| No feature flags | Feature flag evaluator with crypto-hash percentage rollout + override system | Enhancement |
| No sequence generators | Full auto-numbering with format customization (NumberSequence) | Enhancement |
| Config UI planned | No frontend built | Frontend gap |
| No config history | ConfigHistoryService tracks all changes with before/after snapshots | Enhancement |
| Basic email templates | CommunicationTemplate with multi-channel, i18n (En/Es) support | Enhancement |
| Tests not planned | 11 spec files, 42 tests, 743 LOC covering 10/11 services | Partial coverage |
| Hub scored 3/10 | Verified 8.0/10 by PST-31 tribunal (+5.0) | Hub was catastrophically outdated |

---

## 15. Dependencies

**Depends on:**
- PostgreSQL (15 Prisma models, config key-value storage, sequence counters)
- Redis (config caching via ConfigCacheService, 5-minute TTL, key format `config:{category}:{identifier}`)
- Auth (JwtAuthGuard on all controllers — but RolesGuard only on TenantServicesController)
- EventEmitter (4 events: feature.enabled, feature.disabled, config.system.updated, config.tenant.updated)

**Depended on by:**
- ALL services — every service reads tenant config (preferences, feature flags)
- TMS Core — sequence generators for load numbers, BOL numbers
- Accounting — sequence generators for invoice numbers
- Communication — CommunicationTemplate for transactional emails (load updates, notifications)
- Carrier Management — feature flags gate optional carrier features (CSA lookup, insurance verification)
- Sales & Quotes — sequence generators for quote numbers
- Documents — DocumentTemplate for PDF generation (BOL, rate confirmation, invoice)
- Auth & Admin — tenant services toggle controls which modules are accessible

**Breaking change risk:** HIGH — Config is a foundational service. Changes to config key structure, cache invalidation logic, or feature flag evaluation affect every service in the platform.

**Module exports:** 5 services (SystemConfigService, TenantConfigService, PreferencesService, FeaturesService, TenantServicesService)
