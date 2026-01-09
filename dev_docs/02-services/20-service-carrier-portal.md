# Service 13: Carrier Portal

| Field             | Value                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Service ID**    | 13                                                                                                                            |
| **Service Name**  | Carrier Portal                                                                                                                |
| **Category**      | Portal Services                                                                                                               |
| **Phase**         | A (MVP)                                                                                                                       |
| **Planned Weeks** | 61-64                                                                                                                         |
| **Priority**      | P1                                                                                                                            |
| **Dependencies**  | Auth/Admin (01), Carrier Management (05), TMS Core (04), Documents (10), Communication (11), Accounting (06), Load Board (07) |

---

## Overview

### Purpose

Self-service web portal for carriers to view available loads, accept tenders, update shipment status, upload PODs, submit invoices, and track payments. Supports both English and Spanish interfaces to serve the diverse trucking workforce.

### Key Features

- Available load browsing with lane preferences
- One-click load acceptance and tender response
- Real-time status updates from drivers
- POD upload via mobile camera or file upload
- Invoice submission and payment tracking
- Document management (insurance, authority, W-9)
- Settlement history and quick pay requests
- Spanish language support throughout
- Mobile-optimized responsive design

---

## Database Schema

### Carrier Portal Users Table

```sql
CREATE TABLE carrier_portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- User Info
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    job_title VARCHAR(100),

    -- Portal Access
    role VARCHAR(50) NOT NULL DEFAULT 'DISPATCHER',  -- OWNER, ADMIN, DISPATCHER, DRIVER
    permissions JSONB DEFAULT '[]',
    is_primary_contact BOOLEAN DEFAULT FALSE,

    -- Linked Driver (if applicable)
    driver_id UUID REFERENCES drivers(id),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, ACTIVE, SUSPENDED, DEACTIVATED
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,

    -- Authentication
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    failed_login_count INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    password_changed_at TIMESTAMP,
    must_change_password BOOLEAN DEFAULT FALSE,

    -- Preferences
    language VARCHAR(10) DEFAULT 'en',  -- en, es
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    notification_preferences JSONB DEFAULT '{}',

    -- Lane Preferences
    preferred_lanes JSONB DEFAULT '[]',  -- [{origin_state, dest_state}]
    preferred_equipment JSONB DEFAULT '[]',  -- [VAN, REEFER, FLATBED]

    -- Invitation
    invited_by UUID,
    invitation_token VARCHAR(255),
    invitation_sent_at TIMESTAMP,
    invitation_accepted_at TIMESTAMP,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_carrier_portal_users_tenant ON carrier_portal_users(tenant_id);
CREATE INDEX idx_carrier_portal_users_carrier ON carrier_portal_users(carrier_id);
CREATE INDEX idx_carrier_portal_users_email ON carrier_portal_users(email);
CREATE INDEX idx_carrier_portal_users_driver ON carrier_portal_users(driver_id);
CREATE INDEX idx_carrier_portal_users_status ON carrier_portal_users(status);
```

### Carrier Portal Sessions Table

```sql
CREATE TABLE carrier_portal_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    portal_user_id UUID NOT NULL REFERENCES carrier_portal_users(id),

    -- Session Info
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),

    -- Device/Location
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(20),  -- DESKTOP, MOBILE, TABLET
    browser VARCHAR(50),
    os VARCHAR(50),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT NOW(),

    -- Termination
    terminated_at TIMESTAMP,
    termination_reason VARCHAR(50),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carrier_portal_sessions_user ON carrier_portal_sessions(portal_user_id);
CREATE INDEX idx_carrier_portal_sessions_token ON carrier_portal_sessions(session_token);
```

### Load Views Table

```sql
CREATE TABLE carrier_load_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    portal_user_id UUID NOT NULL REFERENCES carrier_portal_users(id),
    load_id UUID NOT NULL REFERENCES loads(id),

    -- View Details
    viewed_at TIMESTAMP DEFAULT NOW(),
    view_duration_seconds INTEGER,
    view_source VARCHAR(20),  -- SEARCH, NOTIFICATION, DIRECT_LINK

    -- Actions Taken
    action VARCHAR(20),  -- VIEWED, SAVED, BID, ACCEPTED, DECLINED
    action_at TIMESTAMP,

    UNIQUE(carrier_id, load_id, viewed_at)
);

CREATE INDEX idx_carrier_load_views_carrier ON carrier_load_views(carrier_id);
CREATE INDEX idx_carrier_load_views_load ON carrier_load_views(load_id);
CREATE INDEX idx_carrier_load_views_date ON carrier_load_views(viewed_at);
```

### Saved Loads Table

```sql
CREATE TABLE carrier_saved_loads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    portal_user_id UUID NOT NULL REFERENCES carrier_portal_users(id),
    load_id UUID NOT NULL REFERENCES loads(id),

    -- Notes
    notes TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(carrier_id, load_id)
);

CREATE INDEX idx_carrier_saved_loads_carrier ON carrier_saved_loads(carrier_id);
```

### Portal Documents Table

```sql
CREATE TABLE carrier_portal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    portal_user_id UUID NOT NULL REFERENCES carrier_portal_users(id),

    -- Document Reference
    document_id UUID NOT NULL REFERENCES documents(id),

    -- Type
    document_type VARCHAR(50) NOT NULL,  -- POD, LUMPER_RECEIPT, SCALE_TICKET, BOL_SIGNED, ACCESSORIAL_APPROVAL

    -- Linked Entity
    load_id UUID REFERENCES loads(id),
    settlement_id UUID REFERENCES settlements(id),

    -- Upload Details
    original_filename VARCHAR(255),
    file_size INTEGER,
    upload_source VARCHAR(20),  -- WEB, MOBILE, EMAIL

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'UPLOADED',  -- UPLOADED, REVIEWING, APPROVED, REJECTED
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carrier_portal_docs_carrier ON carrier_portal_documents(carrier_id);
CREATE INDEX idx_carrier_portal_docs_load ON carrier_portal_documents(load_id);
CREATE INDEX idx_carrier_portal_docs_type ON carrier_portal_documents(document_type);
CREATE INDEX idx_carrier_portal_docs_status ON carrier_portal_documents(status);
```

### Carrier Invoice Submissions Table

```sql
CREATE TABLE carrier_invoice_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    portal_user_id UUID NOT NULL REFERENCES carrier_portal_users(id),

    -- Invoice Reference
    carrier_invoice_number VARCHAR(50) NOT NULL,

    -- Linked Loads
    load_ids UUID[] NOT NULL,

    -- Amounts
    total_amount DECIMAL(10,2) NOT NULL,
    line_items JSONB NOT NULL,  -- [{load_id, line_haul, fuel_surcharge, accessorials, total}]

    -- Attachments
    invoice_document_id UUID REFERENCES documents(id),
    supporting_documents UUID[],  -- Array of document IDs

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',  -- SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID

    -- Review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    variance_amount DECIMAL(10,2),  -- Difference from expected
    variance_reason TEXT,

    -- Approval
    approved_amount DECIMAL(10,2),
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),

    -- Settlement Link
    settlement_id UUID REFERENCES settlements(id),

    -- Notes
    carrier_notes TEXT,
    internal_notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carrier_invoice_carrier ON carrier_invoice_submissions(carrier_id);
CREATE INDEX idx_carrier_invoice_status ON carrier_invoice_submissions(status);
CREATE INDEX idx_carrier_invoice_number ON carrier_invoice_submissions(carrier_invoice_number);
```

### Quick Pay Requests Table

```sql
CREATE TABLE quick_pay_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    portal_user_id UUID NOT NULL REFERENCES carrier_portal_users(id),

    -- Request Details
    settlement_id UUID NOT NULL REFERENCES settlements(id),
    original_amount DECIMAL(10,2) NOT NULL,
    fee_percent DECIMAL(4,2) NOT NULL,  -- Quick pay fee (e.g., 2%)
    fee_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',  -- REQUESTED, APPROVED, REJECTED, PROCESSED

    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    -- Payment
    processed_at TIMESTAMP,
    payment_reference VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quick_pay_carrier ON quick_pay_requests(carrier_id);
CREATE INDEX idx_quick_pay_settlement ON quick_pay_requests(settlement_id);
CREATE INDEX idx_quick_pay_status ON quick_pay_requests(status);
```

### Carrier Portal Activity Log

```sql
CREATE TABLE carrier_portal_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    portal_user_id UUID NOT NULL REFERENCES carrier_portal_users(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Activity
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,

    -- Details
    description TEXT,
    metadata JSONB DEFAULT '{}',

    -- Location
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carrier_portal_activity_carrier ON carrier_portal_activity_log(carrier_id);
CREATE INDEX idx_carrier_portal_activity_user ON carrier_portal_activity_log(portal_user_id);
CREATE INDEX idx_carrier_portal_activity_type ON carrier_portal_activity_log(activity_type);
CREATE INDEX idx_carrier_portal_activity_date ON carrier_portal_activity_log(created_at);
```

---

## API Endpoints

### Authentication

| Method | Endpoint                                   | Description                     |
| ------ | ------------------------------------------ | ------------------------------- |
| POST   | `/carrier-portal/auth/login`               | Portal user login               |
| POST   | `/carrier-portal/auth/logout`              | Logout                          |
| POST   | `/carrier-portal/auth/refresh`             | Refresh access token            |
| POST   | `/carrier-portal/auth/forgot-password`     | Request password reset          |
| POST   | `/carrier-portal/auth/reset-password`      | Complete password reset         |
| POST   | `/carrier-portal/auth/register`            | Accept invitation/self-register |
| GET    | `/carrier-portal/auth/verify-email/:token` | Verify email address            |

### Dashboard

| Method | Endpoint                                    | Description             |
| ------ | ------------------------------------------- | ----------------------- |
| GET    | `/carrier-portal/dashboard`                 | Get dashboard data      |
| GET    | `/carrier-portal/dashboard/active-loads`    | Get active load summary |
| GET    | `/carrier-portal/dashboard/payment-summary` | Get payment overview    |
| GET    | `/carrier-portal/dashboard/compliance`      | Get compliance status   |
| GET    | `/carrier-portal/dashboard/alerts`          | Get important alerts    |

### Available Loads

| Method | Endpoint                                   | Description                    |
| ------ | ------------------------------------------ | ------------------------------ |
| GET    | `/carrier-portal/loads/available`          | Search available loads         |
| GET    | `/carrier-portal/loads/available/:id`      | Get load details               |
| POST   | `/carrier-portal/loads/available/:id/save` | Save load for later            |
| DELETE | `/carrier-portal/loads/saved/:id`          | Remove saved load              |
| GET    | `/carrier-portal/loads/saved`              | List saved loads               |
| POST   | `/carrier-portal/loads/:id/bid`            | Submit bid for load            |
| GET    | `/carrier-portal/loads/matching`           | Get loads matching preferences |

### My Loads

| Method | Endpoint                             | Description                 |
| ------ | ------------------------------------ | --------------------------- |
| GET    | `/carrier-portal/loads`              | List carrier's booked loads |
| GET    | `/carrier-portal/loads/:id`          | Get load details            |
| POST   | `/carrier-portal/loads/:id/accept`   | Accept tendered load        |
| POST   | `/carrier-portal/loads/:id/decline`  | Decline tendered load       |
| POST   | `/carrier-portal/loads/:id/status`   | Update load status          |
| POST   | `/carrier-portal/loads/:id/location` | Update current location     |
| POST   | `/carrier-portal/loads/:id/eta`      | Update ETA                  |
| POST   | `/carrier-portal/loads/:id/message`  | Send message to broker      |

### Documents & POD

| Method | Endpoint                              | Description              |
| ------ | ------------------------------------- | ------------------------ |
| GET    | `/carrier-portal/documents`           | List carrier's documents |
| POST   | `/carrier-portal/documents`           | Upload document          |
| GET    | `/carrier-portal/documents/:id`       | Get document             |
| DELETE | `/carrier-portal/documents/:id`       | Delete document          |
| POST   | `/carrier-portal/loads/:id/pod`       | Upload POD for load      |
| POST   | `/carrier-portal/loads/:id/documents` | Upload load document     |

### Invoices & Payments

| Method | Endpoint                                  | Description             |
| ------ | ----------------------------------------- | ----------------------- |
| POST   | `/carrier-portal/invoices`                | Submit invoice          |
| GET    | `/carrier-portal/invoices`                | List submitted invoices |
| GET    | `/carrier-portal/invoices/:id`            | Get invoice details     |
| GET    | `/carrier-portal/settlements`             | List settlements        |
| GET    | `/carrier-portal/settlements/:id`         | Get settlement details  |
| GET    | `/carrier-portal/settlements/:id/pdf`     | Download settlement PDF |
| POST   | `/carrier-portal/quick-pay/:settlementId` | Request quick pay       |
| GET    | `/carrier-portal/payment-history`         | Get payment history     |

### Compliance Documents

| Method | Endpoint                                   | Description             |
| ------ | ------------------------------------------ | ----------------------- |
| GET    | `/carrier-portal/compliance`               | Get compliance status   |
| GET    | `/carrier-portal/compliance/documents`     | List required documents |
| POST   | `/carrier-portal/compliance/documents`     | Upload compliance doc   |
| GET    | `/carrier-portal/compliance/documents/:id` | Get document status     |
| GET    | `/carrier-portal/compliance/expiring`      | Get expiring documents  |

### Account Management

| Method | Endpoint                                | Description                  |
| ------ | --------------------------------------- | ---------------------------- |
| GET    | `/carrier-portal/profile`               | Get current user profile     |
| PUT    | `/carrier-portal/profile`               | Update profile               |
| GET    | `/carrier-portal/carrier`               | Get carrier info             |
| PUT    | `/carrier-portal/carrier`               | Update carrier info          |
| GET    | `/carrier-portal/users`                 | List carrier's portal users  |
| POST   | `/carrier-portal/users`                 | Invite new user              |
| PUT    | `/carrier-portal/users/:id`             | Update user                  |
| DELETE | `/carrier-portal/users/:id`             | Deactivate user              |
| PUT    | `/carrier-portal/preferences/lanes`     | Update lane preferences      |
| PUT    | `/carrier-portal/preferences/equipment` | Update equipment preferences |

### Notifications

| Method | Endpoint                                   | Description        |
| ------ | ------------------------------------------ | ------------------ |
| GET    | `/carrier-portal/notifications`            | Get notifications  |
| PUT    | `/carrier-portal/notifications/:id/read`   | Mark as read       |
| PUT    | `/carrier-portal/notifications/read-all`   | Mark all as read   |
| GET    | `/carrier-portal/notification-preferences` | Get preferences    |
| PUT    | `/carrier-portal/notification-preferences` | Update preferences |

---

## Events

### Published Events

| Event                               | Trigger                     | Payload                                         |
| ----------------------------------- | --------------------------- | ----------------------------------------------- |
| `carrier_portal.user.registered`    | User completes registration | `{tenant_id, portal_user_id, carrier_id}`       |
| `carrier_portal.user.login`         | Successful login            | `{tenant_id, portal_user_id, carrier_id}`       |
| `carrier_portal.load.viewed`        | Carrier views load details  | `{tenant_id, carrier_id, load_id}`              |
| `carrier_portal.load.accepted`      | Carrier accepts tender      | `{tenant_id, carrier_id, load_id}`              |
| `carrier_portal.load.declined`      | Carrier declines tender     | `{tenant_id, carrier_id, load_id}`              |
| `carrier_portal.bid.submitted`      | Carrier submits bid         | `{tenant_id, carrier_id, load_id, bid_id}`      |
| `carrier_portal.status.updated`     | Status update submitted     | `{tenant_id, carrier_id, load_id, status}`      |
| `carrier_portal.pod.uploaded`       | POD uploaded                | `{tenant_id, carrier_id, load_id, document_id}` |
| `carrier_portal.invoice.submitted`  | Invoice submitted           | `{tenant_id, carrier_id, invoice_id}`           |
| `carrier_portal.quickpay.requested` | Quick pay requested         | `{tenant_id, carrier_id, settlement_id}`        |
| `carrier_portal.document.uploaded`  | Compliance doc uploaded     | `{tenant_id, carrier_id, document_type}`        |

### Subscribed Events

| Event                        | Source             | Action                                    |
| ---------------------------- | ------------------ | ----------------------------------------- |
| `load.posted`                | Load Board         | Notify carriers with matching preferences |
| `load.tender.sent`           | TMS Core           | Show tender in portal                     |
| `load.assigned`              | TMS Core           | Move load to "My Loads"                   |
| `load.status_changed`        | TMS Core           | Update load status display                |
| `settlement.created`         | Accounting         | Show settlement in portal                 |
| `settlement.paid`            | Accounting         | Update payment status                     |
| `carrier.document.expiring`  | Carrier Management | Alert carrier of expiration               |
| `carrier.compliance.changed` | Carrier Management | Update compliance status                  |

---

## Business Rules

### Portal Access

1. Carrier must have ACTIVE or APPROVED status to access portal
2. Carrier must have valid MC authority verified
3. Portal users linked to specific carrier only
4. Session expires after 8 hours of inactivity (shorter for security)

### User Roles

1. **OWNER**: Full access, all permissions
2. **ADMIN**: Manage users, view payments, submit invoices
3. **DISPATCHER**: View loads, update status, upload PODs
4. **DRIVER**: View assigned loads, update status, upload PODs

### Load Acceptance

1. Can only accept loads tendered to carrier
2. Must respond to tender within tender expiration time
3. Cannot accept load if carrier suspended or non-compliant
4. Acceptance confirms rate agreement

### Status Updates

1. Required statuses: DISPATCHED, AT_PICKUP, LOADED, IN_TRANSIT, AT_DELIVERY, DELIVERED
2. Status must follow logical progression
3. Location update required with each status
4. ETA update required when delayed

### POD Requirements

1. POD required within 24 hours of delivery
2. Acceptable formats: PDF, JPG, PNG, TIFF
3. Maximum file size: 10MB
4. OCR validation checks for signatures

### Invoice Submission

1. Invoice only after POD uploaded
2. Invoice amount validated against rate confirmation
3. Variance over 5% flagged for review
4. Supporting documents required for accessorials

### Quick Pay

1. Available only for delivered loads with POD
2. Quick pay fee: configurable (default 2%)
3. Payment within 2 business days of approval
4. Cannot request quick pay after NET30 period

### Spanish Language Support

1. All public-facing content available in Spanish
2. User preference stored, auto-detected on registration
3. Rate confirmations generated in carrier's preferred language
4. Notifications sent in preferred language

---

## Screens

| Screen              | Type      | Description                                             |
| ------------------- | --------- | ------------------------------------------------------- |
| Carrier Portal Home | Dashboard | Overview with active loads, payments, compliance status |
| Available Loads     | List      | Browse/search loads with map view, filters              |
| Load Detail         | Detail    | Complete load information, instructions, documents      |
| My Loads            | List      | Carrier's booked loads with status tabs                 |
| Update Status       | Form      | Update load status with location, notes                 |
| Upload POD          | Form      | POD upload with camera capture option                   |
| My Payments         | List      | Settlement history, payment status                      |
| Invoice Submission  | Form      | Submit carrier invoice for loads                        |
| Document Upload     | Form      | Upload compliance documents                             |
| Carrier Profile     | Form      | Manage carrier info, equipment, lanes                   |

---

## Configuration

### Environment Variables

```bash
# Portal
CARRIER_PORTAL_URL=https://carriers.company.com
CARRIER_PORTAL_SESSION_TIMEOUT=28800  # 8 hours in seconds

# Quick Pay
QUICK_PAY_FEE_PERCENT=2.0
QUICK_PAY_PROCESSING_DAYS=2

# POD
POD_MAX_FILE_SIZE_MB=10
POD_REQUIRED_WITHIN_HOURS=24

# Tender Response
TENDER_DEFAULT_EXPIRATION_HOURS=2
```

### Default Settings

```json
{
  "session_timeout_minutes": 480,
  "max_concurrent_sessions": 3,
  "tender_response_hours": 2,
  "pod_required_within_hours": 24,
  "pod_max_file_size_mb": 10,
  "quick_pay_fee_percent": 2.0,
  "quick_pay_processing_days": 2,
  "invoice_variance_threshold_percent": 5.0,
  "status_update_interval_hours": 4,
  "location_update_required": true,
  "spanish_enabled": true
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Portal user registration validation
- [ ] User role permission checks
- [ ] Load search filters and matching
- [ ] Quick pay fee calculation
- [ ] Invoice variance detection
- [ ] Status progression validation

### Integration Tests

- [ ] Login/logout flow
- [ ] Load tender â†’ acceptance flow
- [ ] Status update â†’ tracking update
- [ ] POD upload â†’ document storage
- [ ] Invoice submission â†’ settlement link
- [ ] Quick pay request â†’ payment processing

### E2E Tests

- [ ] Complete tender acceptance journey
- [ ] Status update flow (pickup â†’ delivery)
- [ ] POD upload via mobile
- [ ] Invoice submission for multiple loads
- [ ] Quick pay request and approval
- [ ] Spanish language navigation

---

## Bilingual Content Examples

### Load Tender Notification

**English:**

```
New load available!
Load #: LD-202601-0142
Route: Dallas, TX â†’ Chicago, IL
Pickup: Jan 15, 2026
Rate: $2,850
[Accept Load] [View Details] [Decline]
```

**Spanish:**

```
Â¡Nueva carga disponible!
Carga #: LD-202601-0142
Ruta: Dallas, TX â†’ Chicago, IL
Recogida: 15 de enero, 2026
Tarifa: $2,850
[Aceptar Carga] [Ver Detalles] [Rechazar]
```

### POD Request

**English:**

```
POD Required
Please upload the Proof of Delivery for Load #LD-202601-0142.
Delivered to: ABC Distribution Center
Delivery Date: January 16, 2026
[Upload POD]
```

**Spanish:**

```
POD Requerido
Por favor suba la Prueba de Entrega para la Carga #LD-202601-0142.
Entregado a: ABC Distribution Center
Fecha de Entrega: 16 de enero, 2026
[Subir POD]
```

---

## Navigation

**Previous:** [12 - Customer Portal Service](../12-customer-portal/README.md)

**Next:** [14 - Contracts Service](../14-contracts/README.md)

**[Back to Services Index](../README.md)**
