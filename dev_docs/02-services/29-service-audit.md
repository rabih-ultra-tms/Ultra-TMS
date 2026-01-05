# 22 - Audit Service

| Field            | Value            |
| ---------------- | ---------------- |
| **Service ID**   | 22               |
| **Service Name** | Audit            |
| **Category**     | Platform         |
| **Module Path**  | `@modules/audit` |
| **Phase**        | A (MVP)          |
| **Weeks**        | 45-46            |
| **Priority**     | P1               |
| **Dependencies** | Auth             |

---

## Purpose

Comprehensive audit and compliance service capturing all system activities, data changes, and user actions for regulatory compliance, security monitoring, and forensic analysis. Provides immutable audit trails with tamper-evident logging.

---

## Features

- **Activity Logging** - Record all user actions in the system
- **Data Change History** - Track all entity modifications with before/after
- **Access Logging** - Monitor data access patterns
- **Login Auditing** - Track authentication events
- **API Request Logging** - Log all API calls
- **Export Capabilities** - Generate audit reports for compliance
- **Retention Policies** - Configurable log retention by type
- **Search & Filter** - Query audit logs by user, entity, date
- **Tamper Evidence** - Hash chains for log integrity
- **Real-Time Alerts** - Notify on suspicious activities
- **Compliance Reports** - Pre-built compliance report templates
- **Data Lineage** - Track data origins and transformations

---

## Database Schema

```sql
-- Audit Log (main activity log)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Actor Information
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),                 -- Denormalized for history
    user_name VARCHAR(200),                  -- Denormalized for history
    impersonator_id UUID REFERENCES users(id), -- If impersonating

    -- Action Details
    action VARCHAR(50) NOT NULL,             -- CREATE, READ, UPDATE, DELETE, LOGIN, etc.
    action_category VARCHAR(50) NOT NULL,    -- DATA, AUTH, ADMIN, SYSTEM

    -- Entity Information
    entity_type VARCHAR(50),                 -- Order, Load, Carrier, etc.
    entity_id UUID,
    entity_name VARCHAR(200),                -- Denormalized identifier

    -- Change Details
    changes JSONB,                           -- {field: {old: x, new: y}}
    metadata JSONB DEFAULT '{}',             -- Additional context

    -- Request Context
    request_id UUID,                         -- Correlation ID
    ip_address VARCHAR(45),
    user_agent TEXT,
    endpoint VARCHAR(500),
    method VARCHAR(10),

    -- Location (if available)
    geo_country VARCHAR(2),
    geo_city VARCHAR(100),

    -- Integrity
    hash VARCHAR(64),                        -- SHA-256 of content
    previous_hash VARCHAR(64),               -- Chain to previous log

    -- Status
    severity VARCHAR(20) DEFAULT 'INFO',     -- INFO, WARNING, CRITICAL

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Partition by date for performance
    CONSTRAINT audit_logs_partition_check CHECK (created_at >= '2024-01-01')
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for each month

CREATE INDEX idx_audit_tenant_date ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(tenant_id, entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(tenant_id, action, created_at DESC);
CREATE INDEX idx_audit_severity ON audit_logs(tenant_id, severity, created_at DESC);

-- Data Change History (detailed field changes)
CREATE TABLE change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    audit_log_id UUID REFERENCES audit_logs(id),

    -- Entity
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,

    -- Change
    field_name VARCHAR(100) NOT NULL,
    field_path VARCHAR(500),                 -- For nested fields (e.g., address.city)
    old_value TEXT,
    new_value TEXT,
    value_type VARCHAR(20),                  -- STRING, NUMBER, BOOLEAN, JSON, etc.

    -- Actor
    changed_by UUID REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_change_entity ON change_history(tenant_id, entity_type, entity_id, created_at DESC);
CREATE INDEX idx_change_field ON change_history(tenant_id, entity_type, field_name);

-- Access Log (data access tracking)
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Actor
    user_id UUID REFERENCES users(id),

    -- Access Details
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    access_type VARCHAR(20) NOT NULL,        -- VIEW, DOWNLOAD, EXPORT, PRINT
    fields_accessed JSONB,                   -- Specific fields viewed

    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_access_tenant ON access_logs(tenant_id, created_at DESC);
CREATE INDEX idx_access_user ON access_logs(user_id, created_at DESC);
CREATE INDEX idx_access_entity ON access_logs(tenant_id, entity_type, entity_id);

-- Login Audit
CREATE TABLE login_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for pre-auth attempts

    -- User
    user_id UUID REFERENCES users(id),       -- NULL if unknown user
    email VARCHAR(255),

    -- Event
    event_type VARCHAR(30) NOT NULL,         -- LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT,
                                             -- PASSWORD_RESET, MFA_ENABLED, etc.
    auth_method VARCHAR(30),                 -- PASSWORD, SSO, MFA, API_KEY

    -- Result
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),             -- INVALID_PASSWORD, LOCKED, MFA_FAILED

    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),

    -- Location
    geo_country VARCHAR(2),
    geo_region VARCHAR(100),
    geo_city VARCHAR(100),

    -- Risk
    risk_score INTEGER,                      -- 0-100
    risk_factors JSONB,                      -- Factors contributing to risk

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_user ON login_audit(user_id, created_at DESC);
CREATE INDEX idx_login_email ON login_audit(email, created_at DESC);
CREATE INDEX idx_login_ip ON login_audit(ip_address, created_at DESC);
CREATE INDEX idx_login_failed ON login_audit(success, created_at DESC) WHERE success = false;

-- API Audit Log
CREATE TABLE api_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),

    -- Request
    request_id UUID NOT NULL,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    query_params JSONB,
    headers JSONB,                           -- Sanitized (no auth)
    body_size INTEGER,

    -- Response
    status_code INTEGER,
    response_time_ms INTEGER,
    response_size INTEGER,

    -- Actor
    user_id UUID REFERENCES users(id),
    api_key_id UUID,                         -- If API key auth

    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Result
    success BOOLEAN,
    error_code VARCHAR(50),
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_api_audit_tenant ON api_audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_api_audit_user ON api_audit_logs(user_id, created_at DESC);
CREATE INDEX idx_api_audit_path ON api_audit_logs(path, created_at DESC);
CREATE INDEX idx_api_audit_status ON api_audit_logs(status_code, created_at DESC);

-- Compliance Checkpoints
CREATE TABLE compliance_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Checkpoint
    checkpoint_type VARCHAR(50) NOT NULL,    -- DAILY, WEEKLY, MONTHLY, ANNUAL
    checkpoint_date DATE NOT NULL,

    -- Hash Chain Verification
    first_log_id UUID REFERENCES audit_logs(id),
    last_log_id UUID REFERENCES audit_logs(id),
    log_count INTEGER NOT NULL,
    computed_hash VARCHAR(64) NOT NULL,      -- Hash of all logs in period

    -- Verification
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    verification_status VARCHAR(20),         -- PENDING, VERIFIED, FAILED

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_tenant ON compliance_checkpoints(tenant_id, checkpoint_date DESC);

-- Audit Alerts
CREATE TABLE audit_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Alert Definition
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Trigger Conditions
    trigger_action VARCHAR(50),              -- Action to monitor
    trigger_entity_type VARCHAR(50),         -- Entity type to monitor
    trigger_conditions JSONB,                -- Additional conditions

    -- Threshold
    threshold_type VARCHAR(30),              -- COUNT, FREQUENCY, PATTERN
    threshold_value INTEGER,
    threshold_window_minutes INTEGER,

    -- Notification
    notification_channels JSONB,             -- email, slack, webhook
    notification_recipients JSONB,

    -- Status
    is_enabled BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Alert Incidents
CREATE TABLE audit_alert_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES audit_alerts(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Incident
    triggered_at TIMESTAMPTZ NOT NULL,
    trigger_count INTEGER,
    sample_logs JSONB,                       -- Sample of triggering logs

    -- Status
    status VARCHAR(20) DEFAULT 'OPEN',       -- OPEN, ACKNOWLEDGED, RESOLVED, FALSE_POSITIVE
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_incidents ON audit_alert_incidents(alert_id, created_at DESC);

-- Retention Policies
CREATE TABLE audit_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for system default

    -- Policy
    log_type VARCHAR(50) NOT NULL,           -- AUDIT, ACCESS, LOGIN, API
    retention_days INTEGER NOT NULL,

    -- Archive
    archive_enabled BOOLEAN DEFAULT true,
    archive_location VARCHAR(500),           -- S3 bucket, etc.

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### Audit Logs

| Method | Endpoint                              | Description            |
| ------ | ------------------------------------- | ---------------------- |
| GET    | `/api/v1/audit/logs`                  | Search audit logs      |
| GET    | `/api/v1/audit/logs/:id`              | Get log details        |
| GET    | `/api/v1/audit/logs/entity/:type/:id` | Get entity history     |
| GET    | `/api/v1/audit/logs/user/:userId`     | Get user activity      |
| GET    | `/api/v1/audit/logs/export`           | Export logs (CSV/JSON) |

### Change History

| Method | Endpoint                                              | Description           |
| ------ | ----------------------------------------------------- | --------------------- |
| GET    | `/api/v1/audit/changes`                               | Search change history |
| GET    | `/api/v1/audit/changes/entity/:type/:id`              | Get entity changes    |
| GET    | `/api/v1/audit/changes/entity/:type/:id/field/:field` | Get field history     |
| GET    | `/api/v1/audit/changes/diff/:id`                      | Get change diff view  |

### Access Logs

| Method | Endpoint                                | Description               |
| ------ | --------------------------------------- | ------------------------- |
| GET    | `/api/v1/audit/access`                  | Search access logs        |
| GET    | `/api/v1/audit/access/entity/:type/:id` | Get entity access history |
| GET    | `/api/v1/audit/access/user/:userId`     | Get user access patterns  |

### Login Audit

| Method | Endpoint                            | Description               |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/api/v1/audit/logins`              | Search login events       |
| GET    | `/api/v1/audit/logins/user/:userId` | Get user login history    |
| GET    | `/api/v1/audit/logins/failed`       | Get failed login attempts |
| GET    | `/api/v1/audit/logins/suspicious`   | Get suspicious logins     |

### API Audit

| Method | Endpoint                             | Description           |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/api/v1/audit/api-calls`            | Search API audit logs |
| GET    | `/api/v1/audit/api-calls/:requestId` | Get request details   |
| GET    | `/api/v1/audit/api-calls/errors`     | Get error requests    |

### Alerts

| Method | Endpoint                             | Description       |
| ------ | ------------------------------------ | ----------------- |
| GET    | `/api/v1/audit/alerts`               | List audit alerts |
| POST   | `/api/v1/audit/alerts`               | Create alert      |
| GET    | `/api/v1/audit/alerts/:id`           | Get alert details |
| PUT    | `/api/v1/audit/alerts/:id`           | Update alert      |
| DELETE | `/api/v1/audit/alerts/:id`           | Delete alert      |
| GET    | `/api/v1/audit/alerts/incidents`     | List incidents    |
| PUT    | `/api/v1/audit/alerts/incidents/:id` | Update incident   |

### Compliance

| Method | Endpoint                               | Description                |
| ------ | -------------------------------------- | -------------------------- |
| GET    | `/api/v1/audit/compliance/checkpoints` | List checkpoints           |
| POST   | `/api/v1/audit/compliance/verify`      | Verify integrity           |
| GET    | `/api/v1/audit/compliance/report`      | Generate compliance report |

### Administration

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| GET    | `/api/v1/audit/retention` | Get retention policies |
| PUT    | `/api/v1/audit/retention` | Update retention       |
| POST   | `/api/v1/audit/archive`   | Archive old logs       |
| GET    | `/api/v1/audit/stats`     | Get audit statistics   |

---

## Events

### Published Events

| Event                       | Trigger             | Payload           |
| --------------------------- | ------------------- | ----------------- |
| `audit.logged`              | Activity recorded   | Log entry         |
| `audit.alert_triggered`     | Alert condition met | Alert, incident   |
| `audit.integrity_failed`    | Hash chain broken   | Checkpoint, error |
| `audit.suspicious_activity` | Unusual pattern     | Activity details  |

### Subscribed Events

| Event                   | Action                  |
| ----------------------- | ----------------------- |
| `*`                     | Log all system events   |
| `user.login`            | Create login audit      |
| `user.logout`           | Create logout audit     |
| `user.password_changed` | Log security event      |
| `*.created`             | Log create action       |
| `*.updated`             | Log update with changes |
| `*.deleted`             | Log delete action       |

---

## Business Rules

### Logging

1. **Immutability**: Audit logs cannot be modified or deleted
2. **Real-Time**: Events logged within 100ms of occurrence
3. **Actor Required**: All logs must have actor (user/system)
4. **Context Capture**: IP, user agent, request ID captured automatically
5. **Change Tracking**: Before/after values for all updates
6. **Sensitive Data**: Mask PII in log content

### Integrity

1. **Hash Chain**: Each log includes hash of previous log
2. **Daily Checkpoints**: Compute daily integrity checkpoint
3. **Tamper Detection**: Alert on hash chain breaks
4. **Verification**: Support third-party verification

### Retention

| Log Type       | Default Retention | Archive     |
| -------------- | ----------------- | ----------- |
| Audit Logs     | 7 years           | S3 Glacier  |
| Change History | 7 years           | S3 Glacier  |
| Access Logs    | 1 year            | S3 Standard |
| Login Audit    | 2 years           | S3 Standard |
| API Logs       | 90 days           | S3 Standard |

### Alerts

1. **Multiple Failed Logins**: 5 failures in 10 minutes
2. **Unusual Access Hours**: Activity outside normal hours
3. **Mass Data Access**: Large export or bulk access
4. **Privilege Escalation**: Admin permission changes
5. **Geographic Anomaly**: Login from new country

---

## Compliance Support

### Regulations

| Regulation | Features Used                             |
| ---------- | ----------------------------------------- |
| SOC 2      | Activity logs, access controls, integrity |
| HIPAA      | Access logs, encryption, audit trails     |
| GDPR       | Data access tracking, export capabilities |
| PCI DSS    | Cardholder data access, login auditing    |
| SOX        | Financial data changes, integrity         |

### Reports

| Report                 | Contents                       |
| ---------------------- | ------------------------------ |
| Activity Summary       | User actions by day/week/month |
| Access Report          | Who accessed what data         |
| Change Report          | All data modifications         |
| Login Report           | Authentication events          |
| Compliance Certificate | Integrity verification         |

---

## Screens

| Screen               | Description                   |
| -------------------- | ----------------------------- |
| Audit Log Search     | Query and filter audit logs   |
| Entity History       | View all changes to an entity |
| User Activity        | View user's actions           |
| Login History        | Authentication events         |
| API Log Viewer       | API request explorer          |
| Alert Management     | Configure audit alerts        |
| Incident Queue       | Manage alert incidents        |
| Compliance Dashboard | Integrity status, reports     |

---

## Configuration

### Environment Variables

```bash
# Storage
AUDIT_LOG_RETENTION_DAYS=2555        # 7 years
ACCESS_LOG_RETENTION_DAYS=365
API_LOG_RETENTION_DAYS=90

# Archive
AUDIT_ARCHIVE_ENABLED=true
AUDIT_ARCHIVE_BUCKET=s3://audit-archive

# Integrity
AUDIT_HASH_ALGORITHM=SHA-256
AUDIT_CHECKPOINT_ENABLED=true
AUDIT_CHECKPOINT_SCHEDULE=0 0 * * *  # Daily

# Alerts
AUDIT_ALERT_EMAIL_ENABLED=true
AUDIT_ALERT_SLACK_ENABLED=true

# Performance
AUDIT_BATCH_SIZE=1000
AUDIT_FLUSH_INTERVAL_MS=1000
```

### Alert Thresholds

| Alert            | Default Threshold  |
| ---------------- | ------------------ |
| Failed logins    | 5 in 10 minutes    |
| Mass export      | >1000 records      |
| Off-hours access | Outside 6am-10pm   |
| New geo login    | First from country |

---

## Testing Checklist

### Unit Tests

- [ ] Log creation with all fields
- [ ] Hash chain computation
- [ ] Change diff generation
- [ ] Alert condition evaluation
- [ ] Retention policy application
- [ ] Data masking

### Integration Tests

- [ ] Event subscription and logging
- [ ] Query performance on large datasets
- [ ] Archive and retrieval
- [ ] Alert triggering and notification
- [ ] Checkpoint creation and verification

### E2E Tests

- [ ] Full audit trail for entity lifecycle
- [ ] Compliance report generation
- [ ] Integrity verification flow
- [ ] Alert incident workflow

---

## Navigation

- **Previous:** [21 - Search](../21-search/README.md)
- **Next:** [23 - Config](../23-config/README.md)
- **Index:** [All Services](../README.md)
