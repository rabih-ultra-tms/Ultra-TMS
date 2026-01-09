# 23 - Config Service

| Field            | Value             |
| ---------------- | ----------------- |
| **Service ID**   | 23                |
| **Service Name** | Config            |
| **Category**     | Platform          |
| **Module Path**  | `@modules/config` |
| **Phase**        | A (MVP)           |
| **Weeks**        | 47-48             |
| **Priority**     | P1                |
| **Dependencies** | Auth              |

---

## Purpose

Centralized configuration management service handling tenant settings, feature flags, user preferences, and system configuration. Enables runtime configuration changes without deployments and supports A/B testing through feature flag targeting.

---

## Features

- **Tenant Settings** - Company-wide configuration options
- **Feature Flags** - Enable/disable features per tenant/user
- **User Preferences** - Personal settings and customizations
- **System Config** - Platform-wide settings
- **Environment Overrides** - Environment-specific values
- **Configuration Versioning** - Track config changes over time
- **Hierarchical Settings** - System â†’ Tenant â†’ User inheritance
- **A/B Testing** - Feature rollout with targeting rules
- **Real-Time Updates** - Push config changes without refresh
- **Configuration Export** - Backup and migrate settings
- **Default Templates** - Pre-configured tenant templates
- **Validation Rules** - Schema validation for settings

---

## Database Schema

```sql
-- System Configuration (platform-wide)
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Configuration Key
    key VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,           -- SECURITY, LIMITS, FEATURES, etc.

    -- Value
    value JSONB NOT NULL,
    value_type VARCHAR(20) NOT NULL,         -- STRING, NUMBER, BOOLEAN, JSON, ARRAY

    -- Metadata
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,      -- Mask in UI
    is_runtime BOOLEAN DEFAULT true,         -- Can change without restart

    -- Validation
    validation_schema JSONB,                 -- JSON Schema for validation
    allowed_values JSONB,                    -- Enum values if applicable
    min_value NUMERIC,
    max_value NUMERIC,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_system_config_category ON system_config(category);

-- Tenant Configuration
CREATE TABLE tenant_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Configuration Key
    key VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,

    -- Value
    value JSONB NOT NULL,
    value_type VARCHAR(20) NOT NULL,

    -- Override Info
    overrides_system BOOLEAN DEFAULT false,  -- Overrides system default
    system_config_id UUID REFERENCES system_config(id),

    -- Metadata
    description TEXT,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, key)
);

CREATE INDEX idx_tenant_config_tenant ON tenant_config(tenant_id);
CREATE INDEX idx_tenant_config_category ON tenant_config(tenant_id, category);

-- User Preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Preference Key
    key VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,           -- UI, NOTIFICATIONS, DEFAULTS, etc.

    -- Value
    value JSONB NOT NULL,
    value_type VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, key)
);

CREATE INDEX idx_user_prefs_user ON user_preferences(user_id);
CREATE INDEX idx_user_prefs_category ON user_preferences(user_id, category);

-- Feature Flags
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Flag Identity
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),                    -- BILLING, UI, INTEGRATIONS, etc.

    -- Default State
    default_enabled BOOLEAN DEFAULT false,

    -- Rollout Configuration
    rollout_percentage INTEGER DEFAULT 0,    -- 0-100 for gradual rollout

    -- Lifecycle
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, DEPRECATED, ARCHIVED
    deprecated_message TEXT,
    sunset_date DATE,

    -- Metadata
    owner VARCHAR(100),                      -- Team/person responsible
    documentation_url VARCHAR(500),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_status ON feature_flags(status);
CREATE INDEX idx_feature_flags_category ON feature_flags(category);

-- Feature Flag Overrides (per tenant)
CREATE TABLE feature_flag_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_flag_id UUID NOT NULL REFERENCES feature_flags(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Override
    is_enabled BOOLEAN NOT NULL,

    -- Targeting (optional further restrictions)
    user_ids JSONB,                          -- Specific users
    role_ids JSONB,                          -- Specific roles
    percentage INTEGER,                      -- Override rollout %

    -- Schedule
    enabled_from TIMESTAMPTZ,
    enabled_until TIMESTAMPTZ,

    -- Metadata
    reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(feature_flag_id, tenant_id)
);

CREATE INDEX idx_flag_overrides_tenant ON feature_flag_overrides(tenant_id);
CREATE INDEX idx_flag_overrides_flag ON feature_flag_overrides(feature_flag_id);

-- Configuration Templates
CREATE TABLE config_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template Identity
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Template Content
    settings JSONB NOT NULL,                 -- Key-value pairs
    feature_flags JSONB,                     -- Feature flag overrides

    -- Type
    template_type VARCHAR(50) NOT NULL,      -- TENANT, USER
    industry VARCHAR(50),                    -- TRUCKING, FREIGHT_FORWARD, etc.

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration History (track changes)
CREATE TABLE config_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference
    config_type VARCHAR(50) NOT NULL,        -- SYSTEM, TENANT, USER, FLAG
    config_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id),

    -- Change
    key VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(20) NOT NULL,        -- CREATE, UPDATE, DELETE

    -- Actor
    changed_by UUID REFERENCES users(id),
    change_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_config_history_config ON config_history(config_type, config_id);
CREATE INDEX idx_config_history_tenant ON config_history(tenant_id, created_at DESC);

-- Business Hours Configuration
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Schedule
    day_of_week INTEGER NOT NULL,            -- 0=Sunday, 6=Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,

    -- Timezone
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Chicago',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, day_of_week)
);

-- Holiday Calendar
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for system holidays

    -- Holiday
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,      -- Same date each year

    -- Observance
    is_full_day BOOLEAN DEFAULT true,
    open_time TIME,                          -- If not full day
    close_time TIME,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_holidays_tenant ON holidays(tenant_id, date);

-- Number Sequences (for auto-numbering)
CREATE TABLE number_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Sequence Identity
    sequence_type VARCHAR(50) NOT NULL,      -- ORDER, LOAD, INVOICE, etc.

    -- Format
    prefix VARCHAR(20),                      -- ORD-, LD-
    suffix VARCHAR(20),
    padding INTEGER DEFAULT 6,               -- Zero padding
    include_year BOOLEAN DEFAULT true,
    include_month BOOLEAN DEFAULT true,

    -- Current Value
    current_value INTEGER DEFAULT 0,
    reset_frequency VARCHAR(20),             -- YEARLY, MONTHLY, NEVER
    last_reset_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, sequence_type)
);
```

---

## Configuration Categories

### System Settings

| Category     | Settings                              |
| ------------ | ------------------------------------- |
| Security     | Password policy, session timeout, MFA |
| Limits       | Max file size, API rate limits        |
| Defaults     | Default timezone, currency, units     |
| Integrations | API endpoints, timeouts               |
| Email        | SMTP settings, templates              |

### Tenant Settings

| Category      | Settings                   |
| ------------- | -------------------------- |
| Branding      | Logo, colors, company info |
| Operations    | Business hours, holidays   |
| Accounting    | Payment terms, GL codes    |
| Documents     | Templates, numbering       |
| Notifications | Alert preferences          |

### User Preferences

| Category      | Settings                 |
| ------------- | ------------------------ |
| UI            | Theme, language, density |
| Notifications | Email, SMS, in-app       |
| Defaults      | Default views, filters   |
| Dashboard     | Widget layout, favorites |
| Display       | Date/time format, units  |

---

## API Endpoints

### System Config

| Method | Endpoint                                   | Description           |
| ------ | ------------------------------------------ | --------------------- |
| GET    | `/api/v1/config/system`                    | Get all system config |
| GET    | `/api/v1/config/system/:key`               | Get specific config   |
| PUT    | `/api/v1/config/system/:key`               | Update config         |
| GET    | `/api/v1/config/system/category/:category` | Get by category       |

### Tenant Config

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/api/v1/config/tenant`        | Get tenant config    |
| GET    | `/api/v1/config/tenant/:key`   | Get specific setting |
| PUT    | `/api/v1/config/tenant/:key`   | Update setting       |
| POST   | `/api/v1/config/tenant/bulk`   | Bulk update settings |
| GET    | `/api/v1/config/tenant/export` | Export configuration |
| POST   | `/api/v1/config/tenant/import` | Import configuration |

### User Preferences

| Method | Endpoint                           | Description           |
| ------ | ---------------------------------- | --------------------- |
| GET    | `/api/v1/config/preferences`       | Get my preferences    |
| GET    | `/api/v1/config/preferences/:key`  | Get specific pref     |
| PUT    | `/api/v1/config/preferences/:key`  | Update preference     |
| POST   | `/api/v1/config/preferences/bulk`  | Bulk update           |
| DELETE | `/api/v1/config/preferences/:key`  | Reset to default      |
| POST   | `/api/v1/config/preferences/reset` | Reset all to defaults |

### Feature Flags

| Method | Endpoint                                 | Description               |
| ------ | ---------------------------------------- | ------------------------- |
| GET    | `/api/v1/config/features`                | Get all features for user |
| GET    | `/api/v1/config/features/:code`          | Check specific feature    |
| GET    | `/api/v1/config/features/admin`          | Admin: list all flags     |
| POST   | `/api/v1/config/features`                | Admin: create flag        |
| PUT    | `/api/v1/config/features/:code`          | Admin: update flag        |
| POST   | `/api/v1/config/features/:code/override` | Set tenant override       |
| DELETE | `/api/v1/config/features/:code/override` | Remove override           |

### Templates

| Method | Endpoint                               | Description     |
| ------ | -------------------------------------- | --------------- |
| GET    | `/api/v1/config/templates`             | List templates  |
| GET    | `/api/v1/config/templates/:code`       | Get template    |
| POST   | `/api/v1/config/templates/:code/apply` | Apply to tenant |

### Business Hours

| Method | Endpoint                        | Description        |
| ------ | ------------------------------- | ------------------ |
| GET    | `/api/v1/config/business-hours` | Get business hours |
| PUT    | `/api/v1/config/business-hours` | Update hours       |
| GET    | `/api/v1/config/holidays`       | Get holidays       |
| POST   | `/api/v1/config/holidays`       | Add holiday        |
| DELETE | `/api/v1/config/holidays/:id`   | Remove holiday     |

### Number Sequences

| Method | Endpoint                               | Description         |
| ------ | -------------------------------------- | ------------------- |
| GET    | `/api/v1/config/sequences`             | List sequences      |
| GET    | `/api/v1/config/sequences/:type`       | Get sequence config |
| PUT    | `/api/v1/config/sequences/:type`       | Update sequence     |
| POST   | `/api/v1/config/sequences/:type/next`  | Get next number     |
| POST   | `/api/v1/config/sequences/:type/reset` | Reset sequence      |

### History

| Method | Endpoint                           | Description          |
| ------ | ---------------------------------- | -------------------- |
| GET    | `/api/v1/config/history`           | Get config changes   |
| GET    | `/api/v1/config/history/:type/:id` | Get specific history |

---

## Events

### Published Events

| Event                   | Trigger               | Payload            |
| ----------------------- | --------------------- | ------------------ |
| `config.updated`        | Setting changed       | Key, old/new value |
| `config.tenant_updated` | Tenant config changed | Tenant, key, value |
| `config.user_updated`   | User pref changed     | User, key, value   |
| `feature.enabled`       | Feature flag enabled  | Flag, tenant       |
| `feature.disabled`      | Feature flag disabled | Flag, tenant       |
| `sequence.reset`        | Sequence reset        | Type, tenant       |

### Subscribed Events

| Event            | Action                        |
| ---------------- | ----------------------------- |
| `tenant.created` | Apply default config template |
| `user.created`   | Initialize user preferences   |

---

## Business Rules

### Configuration Hierarchy

1. **Inheritance**: User â†’ Tenant â†’ System (most specific wins)
2. **Defaults**: System config provides defaults
3. **Override**: Lower levels can override if allowed
4. **Validation**: All values validated against schema

### Feature Flags

1. **Evaluation Order**: User override â†’ Tenant override â†’ Rollout â†’ Default
2. **Percentage Rollout**: Consistent per user (hash-based)
3. **Schedule**: Time-based enable/disable
4. **Deprecation**: Warn before sunset date
5. **Audit**: Log all flag evaluations in aggregate

### Number Sequences

1. **Atomicity**: Next number generation is atomic
2. **No Gaps**: Guaranteed sequential (no skips)
3. **Tenant Isolation**: Separate sequences per tenant
4. **Reset**: Can reset yearly/monthly per config

### Business Hours

1. **Timezone**: All times in tenant timezone
2. **Holidays**: Override regular hours
3. **SLA Impact**: Business hours affect SLA calculations

---

## Default Settings

### System Defaults

```json
{
  "security.password_min_length": 8,
  "security.password_require_special": true,
  "security.session_timeout_minutes": 480,
  "security.mfa_required": false,
  "limits.max_file_size_mb": 25,
  "limits.api_rate_limit_minute": 100,
  "defaults.timezone": "America/Chicago",
  "defaults.currency": "USD",
  "defaults.date_format": "MM/DD/YYYY",
  "defaults.distance_unit": "miles"
}
```

### Tenant Defaults

```json
{
  "accounting.default_payment_terms": 30,
  "accounting.invoice_prefix": "INV-",
  "operations.default_pickup_hours": "08:00-17:00",
  "operations.default_delivery_hours": "08:00-17:00",
  "notifications.low_margin_threshold": 10,
  "documents.auto_generate_bol": true
}
```

### User Preference Defaults

```json
{
  "ui.theme": "light",
  "ui.density": "comfortable",
  "ui.language": "en",
  "notifications.email_frequency": "immediate",
  "notifications.sms_enabled": false,
  "dashboard.default_view": "summary"
}
```

---

## Screens

| Screen                | Description                |
| --------------------- | -------------------------- |
| System Settings       | Platform admin settings    |
| Company Settings      | Tenant configuration       |
| My Preferences        | User personal settings     |
| Feature Management    | Admin feature flag control |
| Business Hours        | Hours and holidays setup   |
| Number Sequences      | Auto-number configuration  |
| Configuration History | Audit trail of changes     |

---

## Configuration

### Environment Variables

```bash
# Feature Flags
FEATURE_FLAG_CACHE_TTL_SECONDS=60
FEATURE_FLAG_DEFAULT_ROLLOUT=0

# Config Cache
CONFIG_CACHE_ENABLED=true
CONFIG_CACHE_TTL_SECONDS=300

# History
CONFIG_HISTORY_RETENTION_DAYS=365

# Real-time Updates
CONFIG_REALTIME_ENABLED=true
CONFIG_WEBSOCKET_CHANNEL=config-updates
```

---

## Testing Checklist

### Unit Tests

- [ ] Configuration inheritance
- [ ] Feature flag evaluation
- [ ] Rollout percentage calculation
- [ ] Number sequence generation
- [ ] Business hours calculation
- [ ] Validation schema enforcement

### Integration Tests

- [ ] Cache invalidation
- [ ] Real-time config updates
- [ ] Template application
- [ ] History tracking
- [ ] Multi-tenant isolation

### E2E Tests

- [ ] Full config update flow
- [ ] Feature flag rollout
- [ ] User preference sync
- [ ] Config export/import

---

## Navigation

- **Previous:** [22 - Audit](../22-audit/README.md)
- **Next:** [24 - Scheduler](../24-scheduler/README.md)
- **Index:** [All Services](../README.md)
