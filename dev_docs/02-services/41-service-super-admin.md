# 34 - Super Admin Service

| Field            | Value                        |
| ---------------- | ---------------------------- |
| **Service ID**   | 34                           |
| **Service Name** | Super Admin                  |
| **Category**     | Admin                        |
| **Module Path**  | `@modules/super-admin`       |
| **Phase**        | C (SaaS)                     |
| **Weeks**        | 113-118                      |
| **Priority**     | P1                           |
| **Dependencies** | Auth, Config, Audit, Billing |

---

## Purpose

Platform administration service for managing tenants, subscriptions, billing, system configuration, and platform-wide operations. This service is used exclusively by platform operators (Anthropic/hosting company staff) to manage the multi-tenant SaaS platform, onboard new customers, and monitor system health.

---

## Features

- **Tenant Management** - Create, configure, suspend, delete tenants
- **Subscription Management** - Plans, pricing, feature entitlements
- **Billing Administration** - Invoices, payments, usage tracking
- **User Impersonation** - Support access to tenant accounts
- **System Configuration** - Global settings, feature flags
- **Platform Monitoring** - Health, performance, usage metrics
- **Announcements** - Platform-wide notifications
- **Support Tools** - Tenant diagnostics, data recovery
- **Audit & Compliance** - Platform-level audit logs
- **Provisioning** - Automated tenant setup workflows
- **Data Export** - Tenant data export for compliance
- **Resource Limits** - Quotas and usage enforcement

---

## Database Schema

```sql
-- Platform Administrators (Super Admins)
CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Admin Info
    email VARCHAR(200) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Role
    admin_role VARCHAR(30) NOT NULL,                -- SUPER_ADMIN, ADMIN, SUPPORT, BILLING, READ_ONLY

    -- Permissions
    permissions VARCHAR(50)[] DEFAULT '{}',

    -- MFA
    mfa_enabled BOOLEAN DEFAULT true,
    mfa_secret VARCHAR(100),
    mfa_backup_codes VARCHAR(100)[],

    -- Session
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(45),

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',            -- ACTIVE, SUSPENDED, LOCKED

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES platform_admins(id)
);

CREATE INDEX idx_platform_admins_email ON platform_admins(email);
CREATE INDEX idx_platform_admins_role ON platform_admins(admin_role);

-- Subscription Plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Plan Info
    plan_code VARCHAR(50) NOT NULL UNIQUE,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Pricing
    billing_cycle VARCHAR(20) NOT NULL,             -- MONTHLY, ANNUAL
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Usage Pricing
    per_user_price DECIMAL(10,2),
    per_load_price DECIMAL(10,2),
    included_users INTEGER,
    included_loads INTEGER,

    -- Feature Entitlements
    features JSONB NOT NULL,                        -- {feature_key: true/false or limit}

    -- Limits
    max_users INTEGER,
    max_loads_per_month INTEGER,
    max_storage_gb INTEGER,
    max_api_calls_per_day INTEGER,

    -- Trial
    trial_days INTEGER DEFAULT 14,

    -- Display
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    highlight_text VARCHAR(100),                    -- "Most Popular"

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',            -- ACTIVE, DEPRECATED, HIDDEN

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_code ON subscription_plans(plan_code);
CREATE INDEX idx_subscription_plans_status ON subscription_plans(status);

-- Tenant Subscriptions
CREATE TABLE tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),

    -- Subscription Status
    status VARCHAR(20) DEFAULT 'ACTIVE',            -- TRIALING, ACTIVE, PAST_DUE, SUSPENDED, CANCELLED

    -- Dates
    start_date DATE NOT NULL,
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    trial_end_date DATE,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Billing
    payment_method_id UUID,
    stripe_subscription_id VARCHAR(100),

    -- Overrides
    custom_pricing JSONB,                           -- Custom pricing overrides
    custom_limits JSONB,                            -- Custom limit overrides
    custom_features JSONB,                          -- Custom feature overrides

    -- Usage This Period
    users_count INTEGER DEFAULT 0,
    loads_count INTEGER DEFAULT 0,
    storage_used_gb DECIMAL(10,2) DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,

    -- Billing Contact
    billing_email VARCHAR(200),
    billing_name VARCHAR(200),
    billing_address JSONB,

    -- Notes
    internal_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES platform_admins(id)
);

CREATE INDEX idx_tenant_subscriptions_tenant ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_plan ON tenant_subscriptions(plan_id);
CREATE INDEX idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX idx_tenant_subscriptions_period ON tenant_subscriptions(current_period_end);

-- Billing Invoices
CREATE TABLE billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    subscription_id UUID REFERENCES tenant_subscriptions(id),

    -- Invoice Number
    invoice_number VARCHAR(50) NOT NULL UNIQUE,

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    due_date DATE NOT NULL,

    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    amount_due DECIMAL(15,2) NOT NULL,

    currency VARCHAR(3) DEFAULT 'USD',

    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT',             -- DRAFT, SENT, PAID, PAST_DUE, VOID, REFUNDED

    -- Payment
    paid_at TIMESTAMPTZ,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    stripe_invoice_id VARCHAR(100),

    -- Line Items
    line_items JSONB NOT NULL,

    -- PDF
    pdf_url VARCHAR(500),

    -- Dunning
    reminder_count INTEGER DEFAULT 0,
    last_reminder_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_invoices_tenant ON billing_invoices(tenant_id);
CREATE INDEX idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX idx_billing_invoices_due ON billing_invoices(due_date);
CREATE INDEX idx_billing_invoices_number ON billing_invoices(invoice_number);

-- Payment Methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Method Type
    method_type VARCHAR(20) NOT NULL,               -- CARD, ACH, INVOICE

    -- Card Details (masked)
    card_brand VARCHAR(20),                         -- VISA, MASTERCARD, AMEX
    card_last_four VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,

    -- ACH Details (masked)
    bank_name VARCHAR(100),
    account_last_four VARCHAR(4),
    account_type VARCHAR(20),                       -- CHECKING, SAVINGS

    -- Stripe
    stripe_payment_method_id VARCHAR(100),
    stripe_customer_id VARCHAR(100),

    -- Status
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'ACTIVE',            -- ACTIVE, EXPIRED, FAILED

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_tenant ON payment_methods(tenant_id);

-- Usage Records (for metered billing)
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    subscription_id UUID NOT NULL REFERENCES tenant_subscriptions(id),

    -- Usage Type
    usage_type VARCHAR(50) NOT NULL,                -- USERS, LOADS, STORAGE, API_CALLS

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Quantities
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,4),
    total_price DECIMAL(15,2),

    -- Aggregation
    is_aggregated BOOLEAN DEFAULT false,
    aggregated_at TIMESTAMPTZ,

    -- Invoice
    invoice_id UUID REFERENCES billing_invoices(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (period_start);

CREATE INDEX idx_usage_records_tenant ON usage_records(tenant_id);
CREATE INDEX idx_usage_records_period ON usage_records(period_start, period_end);
CREATE INDEX idx_usage_records_type ON usage_records(usage_type);

-- Create partitions
CREATE TABLE usage_records_y2025m01 PARTITION OF usage_records
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Tenant Provisioning Tasks
CREATE TABLE provisioning_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Task Info
    task_type VARCHAR(50) NOT NULL,                 -- CREATE_DATABASE, CREATE_STORAGE, SEED_DATA, etc.
    task_order INTEGER NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Result
    result_message TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Metadata
    task_data JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provisioning_tasks_tenant ON provisioning_tasks(tenant_id);
CREATE INDEX idx_provisioning_tasks_status ON provisioning_tasks(status);

-- Platform Announcements
CREATE TABLE platform_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT,

    -- Type
    announcement_type VARCHAR(30) NOT NULL,         -- INFO, MAINTENANCE, FEATURE, WARNING, CRITICAL

    -- Targeting
    target_plans VARCHAR(50)[],                     -- Empty = all plans
    target_tenants UUID[],                          -- Empty = all tenants

    -- Display
    display_type VARCHAR(20) NOT NULL,              -- BANNER, MODAL, NOTIFICATION
    dismissable BOOLEAN DEFAULT true,

    -- Scheduling
    publish_at TIMESTAMPTZ NOT NULL,
    expire_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT',             -- DRAFT, PUBLISHED, EXPIRED

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES platform_admins(id)
);

CREATE INDEX idx_announcements_status ON platform_announcements(status);
CREATE INDEX idx_announcements_publish ON platform_announcements(publish_at);

-- Impersonation Sessions
CREATE TABLE impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Admin
    admin_id UUID NOT NULL REFERENCES platform_admins(id),

    -- Target
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    impersonated_user_id UUID NOT NULL REFERENCES users(id),

    -- Reason
    reason VARCHAR(500) NOT NULL,
    support_ticket_id VARCHAR(100),

    -- Session
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    -- Activity Log
    actions_performed JSONB DEFAULT '[]',

    -- IP
    admin_ip VARCHAR(45),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_impersonation_admin ON impersonation_sessions(admin_id);
CREATE INDEX idx_impersonation_tenant ON impersonation_sessions(tenant_id);
CREATE INDEX idx_impersonation_active ON impersonation_sessions(ended_at) WHERE ended_at IS NULL;

-- Platform Audit Log
CREATE TABLE platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Actor
    admin_id UUID REFERENCES platform_admins(id),
    admin_email VARCHAR(200),

    -- Action
    action VARCHAR(100) NOT NULL,
    action_category VARCHAR(50) NOT NULL,           -- TENANT, SUBSCRIPTION, BILLING, CONFIG, ADMIN

    -- Target
    target_type VARCHAR(50),
    target_id UUID,
    target_name VARCHAR(200),
    tenant_id UUID REFERENCES tenants(id),

    -- Details
    old_values JSONB,
    new_values JSONB,
    description TEXT,

    -- Request
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Timestamp
    occurred_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (occurred_at);

CREATE INDEX idx_platform_audit_admin ON platform_audit_log(admin_id);
CREATE INDEX idx_platform_audit_tenant ON platform_audit_log(tenant_id);
CREATE INDEX idx_platform_audit_action ON platform_audit_log(action);
CREATE INDEX idx_platform_audit_occurred ON platform_audit_log(occurred_at DESC);

-- Create partitions
CREATE TABLE platform_audit_log_y2025m01 PARTITION OF platform_audit_log
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- System Health Metrics
CREATE TABLE system_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Metric Info
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL,           -- DATABASE, API, QUEUE, STORAGE

    -- Value
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20),

    -- Threshold
    warning_threshold DECIMAL(15,4),
    critical_threshold DECIMAL(15,4),
    status VARCHAR(20) DEFAULT 'OK',                -- OK, WARNING, CRITICAL

    -- Timestamp
    recorded_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (recorded_at);

CREATE INDEX idx_health_metrics_name ON system_health_metrics(metric_name);
CREATE INDEX idx_health_metrics_category ON system_health_metrics(metric_category);
CREATE INDEX idx_health_metrics_recorded ON system_health_metrics(recorded_at DESC);

-- Tenant Data Export Requests
CREATE TABLE data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Request Info
    export_type VARCHAR(30) NOT NULL,               -- FULL, PARTIAL, GDPR
    requested_by_admin UUID REFERENCES platform_admins(id),
    requested_by_user UUID REFERENCES users(id),
    reason VARCHAR(500),

    -- Scope
    include_tables VARCHAR(100)[],
    exclude_tables VARCHAR(100)[],
    date_from DATE,
    date_to DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, PROCESSING, COMPLETED, FAILED
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Result
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    download_url VARCHAR(500),
    download_expires_at TIMESTAMPTZ,

    -- Errors
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_export_tenant ON data_export_requests(tenant_id);
CREATE INDEX idx_data_export_status ON data_export_requests(status);
```

---

## API Endpoints

| Method                   | Endpoint                                  | Description                 |
| ------------------------ | ----------------------------------------- | --------------------------- |
| **Platform Auth**        |
| POST                     | `/api/admin/auth/login`                   | Admin login                 |
| POST                     | `/api/admin/auth/mfa`                     | MFA verification            |
| POST                     | `/api/admin/auth/logout`                  | Admin logout                |
| **Admin Management**     |
| GET                      | `/api/admin/admins`                       | List platform admins        |
| POST                     | `/api/admin/admins`                       | Create admin                |
| GET                      | `/api/admin/admins/{id}`                  | Get admin details           |
| PUT                      | `/api/admin/admins/{id}`                  | Update admin                |
| DELETE                   | `/api/admin/admins/{id}`                  | Remove admin                |
| POST                     | `/api/admin/admins/{id}/reset-mfa`        | Reset MFA                   |
| **Tenant Management**    |
| GET                      | `/api/admin/tenants`                      | List all tenants            |
| POST                     | `/api/admin/tenants`                      | Create tenant               |
| GET                      | `/api/admin/tenants/{id}`                 | Get tenant details          |
| PUT                      | `/api/admin/tenants/{id}`                 | Update tenant               |
| POST                     | `/api/admin/tenants/{id}/suspend`         | Suspend tenant              |
| POST                     | `/api/admin/tenants/{id}/activate`        | Activate tenant             |
| DELETE                   | `/api/admin/tenants/{id}`                 | Delete tenant               |
| GET                      | `/api/admin/tenants/{id}/usage`           | Get tenant usage            |
| GET                      | `/api/admin/tenants/{id}/health`          | Get tenant health           |
| **Subscription Plans**   |
| GET                      | `/api/admin/plans`                        | List plans                  |
| POST                     | `/api/admin/plans`                        | Create plan                 |
| GET                      | `/api/admin/plans/{id}`                   | Get plan details            |
| PUT                      | `/api/admin/plans/{id}`                   | Update plan                 |
| DELETE                   | `/api/admin/plans/{id}`                   | Delete plan                 |
| **Tenant Subscriptions** |
| GET                      | `/api/admin/subscriptions`                | List subscriptions          |
| POST                     | `/api/admin/subscriptions`                | Create subscription         |
| GET                      | `/api/admin/subscriptions/{id}`           | Get subscription            |
| PUT                      | `/api/admin/subscriptions/{id}`           | Update subscription         |
| POST                     | `/api/admin/subscriptions/{id}/cancel`    | Cancel subscription         |
| POST                     | `/api/admin/subscriptions/{id}/upgrade`   | Upgrade plan                |
| POST                     | `/api/admin/subscriptions/{id}/downgrade` | Downgrade plan              |
| **Billing**              |
| GET                      | `/api/admin/invoices`                     | List all invoices           |
| GET                      | `/api/admin/invoices/{id}`                | Get invoice                 |
| POST                     | `/api/admin/invoices/{id}/send`           | Send invoice                |
| POST                     | `/api/admin/invoices/{id}/void`           | Void invoice                |
| POST                     | `/api/admin/invoices/{id}/refund`         | Refund invoice              |
| POST                     | `/api/admin/invoices/{id}/payment`        | Record payment              |
| **Impersonation**        |
| POST                     | `/api/admin/impersonate`                  | Start impersonation         |
| DELETE                   | `/api/admin/impersonate`                  | End impersonation           |
| GET                      | `/api/admin/impersonations`               | List impersonation sessions |
| **Announcements**        |
| GET                      | `/api/admin/announcements`                | List announcements          |
| POST                     | `/api/admin/announcements`                | Create announcement         |
| GET                      | `/api/admin/announcements/{id}`           | Get announcement            |
| PUT                      | `/api/admin/announcements/{id}`           | Update announcement         |
| DELETE                   | `/api/admin/announcements/{id}`           | Delete announcement         |
| POST                     | `/api/admin/announcements/{id}/publish`   | Publish announcement        |
| **System Monitoring**    |
| GET                      | `/api/admin/health`                       | System health status        |
| GET                      | `/api/admin/metrics`                      | System metrics              |
| GET                      | `/api/admin/metrics/tenants`              | Tenant metrics              |
| GET                      | `/api/admin/metrics/usage`                | Usage metrics               |
| **Platform Audit**       |
| GET                      | `/api/admin/audit-log`                    | Platform audit log          |
| GET                      | `/api/admin/audit-log/export`             | Export audit log            |
| **Data Export**          |
| POST                     | `/api/admin/export`                       | Request data export         |
| GET                      | `/api/admin/export/{id}`                  | Get export status           |
| GET                      | `/api/admin/export/{id}/download`         | Download export             |
| **Configuration**        |
| GET                      | `/api/admin/config`                       | Get platform config         |
| PUT                      | `/api/admin/config`                       | Update platform config      |
| GET                      | `/api/admin/feature-flags`                | List global feature flags   |
| PUT                      | `/api/admin/feature-flags/{key}`          | Update feature flag         |

---

## Events

### Published Events

| Event                          | Trigger                | Payload                          |
| ------------------------------ | ---------------------- | -------------------------------- |
| `admin.tenant.created`         | New tenant created     | tenantId, planId                 |
| `admin.tenant.suspended`       | Tenant suspended       | tenantId, reason                 |
| `admin.tenant.activated`       | Tenant activated       | tenantId                         |
| `admin.tenant.deleted`         | Tenant deleted         | tenantId                         |
| `admin.subscription.created`   | Subscription created   | subscriptionId, tenantId         |
| `admin.subscription.upgraded`  | Plan upgraded          | subscriptionId, oldPlan, newPlan |
| `admin.subscription.cancelled` | Subscription cancelled | subscriptionId, reason           |
| `admin.invoice.created`        | Invoice generated      | invoiceId, tenantId              |
| `admin.invoice.paid`           | Invoice paid           | invoiceId, amount                |
| `admin.invoice.past_due`       | Invoice past due       | invoiceId, tenantId              |
| `admin.impersonation.started`  | Impersonation started  | adminId, tenantId, userId        |
| `admin.impersonation.ended`    | Impersonation ended    | sessionId, actions               |
| `admin.announcement.published` | Announcement published | announcementId                   |
| `admin.health.warning`         | Health warning         | metric, value                    |
| `admin.health.critical`        | Health critical        | metric, value                    |

### Subscribed Events

| Event                    | Source     | Action                     |
| ------------------------ | ---------- | -------------------------- |
| `scheduler.daily`        | Scheduler  | Generate usage records     |
| `scheduler.monthly`      | Scheduler  | Generate invoices          |
| `tenant.usage.threshold` | Config     | Check quota limits         |
| `payment.failed`         | Billing    | Update subscription status |
| `system.metric.recorded` | Monitoring | Check health thresholds    |

---

## Business Rules

### Tenant Lifecycle

1. Create tenant with trial subscription
2. Trial converts to paid or suspends
3. Suspended tenants: read-only access
4. Deleted tenants: 30-day grace period
5. Purge data after grace period

### Subscription Management

1. Pro-rate on plan changes
2. Downgrade takes effect at period end
3. Upgrade takes effect immediately
4. Cancel maintains access until period end
5. Past due: 7-day grace before suspend

### Billing

1. Invoice on period start
2. Net-15 payment terms
3. Auto-charge if payment method on file
4. Dunning: Day 1, 7, 14 reminders
5. Suspend at 15 days past due

### Usage Limits

1. Soft limits: warn at 80%, alert at 100%
2. Hard limits: block at limit
3. Overage billing for metered features
4. Reset usage at period start

### Impersonation

1. Require reason and optional ticket
2. Log all actions during session
3. Session expires after 1 hour
4. Visible indicator to impersonated user
5. Full audit trail

### Data Compliance

1. GDPR export within 30 days
2. Include all personal data
3. Provide in portable format
4. Secure download with expiry
5. Log all data exports

---

## Screens

| Screen              | Description                |
| ------------------- | -------------------------- |
| Admin Dashboard     | Platform overview and KPIs |
| Admin Login         | Admin authentication       |
| Admin Users         | Manage platform admins     |
| Tenant List         | View all tenants           |
| Tenant Detail       | View/edit tenant details   |
| Tenant Usage        | Tenant usage analytics     |
| Tenant Health       | Tenant system health       |
| Create Tenant       | New tenant wizard          |
| Plan Management     | Manage subscription plans  |
| Plan Editor         | Create/edit plan           |
| Subscription List   | All subscriptions          |
| Subscription Detail | View/edit subscription     |
| Invoice List        | All invoices               |
| Invoice Detail      | View invoice               |
| Payment History     | Payment records            |
| Impersonation       | Start/view impersonation   |
| Announcements       | Manage announcements       |
| Announcement Editor | Create/edit announcement   |
| System Health       | Platform health dashboard  |
| System Metrics      | Detailed metrics           |
| Platform Audit      | Audit log viewer           |
| Platform Config     | Global configuration       |
| Feature Flags       | Manage feature flags       |
| Data Export         | Request/download exports   |

---

## Configuration

### Environment Variables

```env
# Admin Auth
ADMIN_JWT_SECRET=super_secret_key
ADMIN_JWT_EXPIRY=1h
ADMIN_MFA_REQUIRED=true

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_DEFAULT_CURRENCY=USD

# Storage (for exports)
EXPORT_S3_BUCKET=platform-exports
EXPORT_LINK_EXPIRY_HOURS=24

# Limits
DEFAULT_TRIAL_DAYS=14
GRACE_PERIOD_DAYS=7
SUSPEND_DAYS_PAST_DUE=15
PURGE_DAYS_AFTER_DELETE=30

# Impersonation
IMPERSONATION_MAX_HOURS=1
IMPERSONATION_REQUIRE_REASON=true
```

### Default Settings

```json
{
  "superAdmin": {
    "authentication": {
      "mfaRequired": true,
      "sessionTimeoutMinutes": 60,
      "maxLoginAttempts": 5,
      "lockoutMinutes": 30
    },
    "tenants": {
      "defaultTrialDays": 14,
      "gracePeriodDays": 7,
      "suspendDaysPastDue": 15,
      "purgeDaysAfterDelete": 30
    },
    "billing": {
      "currency": "USD",
      "paymentTermsDays": 15,
      "dunningSchedule": [1, 7, 14],
      "autoChargeEnabled": true
    },
    "limits": {
      "softLimitWarningPercent": 80,
      "hardLimitEnforced": true
    },
    "impersonation": {
      "maxDurationHours": 1,
      "requireReason": true,
      "notifyUser": true
    },
    "monitoring": {
      "healthCheckIntervalMinutes": 5,
      "metricsRetentionDays": 90
    }
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Plan pricing calculations
- [ ] Proration logic
- [ ] Usage aggregation
- [ ] Quota enforcement
- [ ] Invoice generation

### Integration Tests

- [ ] Stripe subscription lifecycle
- [ ] Stripe payment processing
- [ ] Tenant provisioning workflow
- [ ] Impersonation session
- [ ] Data export generation

### E2E Tests

- [ ] Complete tenant onboarding
- [ ] Upgrade/downgrade flow
- [ ] Invoice to payment
- [ ] Past due to suspension
- [ ] Impersonation full flow

---

## Navigation

- **Previous:** [33 - Mobile App](../33-mobile-app/README.md)
- **Index:** [All Services](../README.md)
