# Service 12: Customer Portal

| Field             | Value                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| **Service ID**    | 12                                                                                                        |
| **Service Name**  | Customer Portal                                                                                           |
| **Category**      | Portal Services                                                                                           |
| **Phase**         | A (MVP)                                                                                                   |
| **Planned Weeks** | 57-60                                                                                                     |
| **Priority**      | P1                                                                                                        |
| **Dependencies**  | Auth/Admin (01), CRM (02), Sales (03), TMS Core (04), Documents (10), Communication (11), Accounting (06) |

---

## Overview

### Purpose

Self-service web portal enabling customers to request quotes, track shipments in real-time, access documents, view and pay invoices, and manage their account. Reduces operational workload by empowering customers with direct access to information and common actions.

### Key Features

- Quote request submission with instant estimates
- Real-time shipment tracking with map visualization
- Document library access (BOLs, PODs, rate confirmations)
- Invoice viewing and online payment processing
- Multi-user account management with role-based access
- Notification preferences and communication history
- White-label/branding customization per tenant
- Mobile-responsive design

---

## Database Schema

### Portal Users Table

```sql
CREATE TABLE portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID NOT NULL REFERENCES companies(id),

    -- User Info
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    job_title VARCHAR(100),

    -- Portal Access
    role VARCHAR(50) NOT NULL DEFAULT 'USER',  -- ADMIN, USER, VIEW_ONLY
    permissions JSONB DEFAULT '[]',
    is_primary_contact BOOLEAN DEFAULT FALSE,

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
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    notification_preferences JSONB DEFAULT '{}',

    -- Invitation
    invited_by UUID REFERENCES users(id),
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

CREATE INDEX idx_portal_users_tenant ON portal_users(tenant_id);
CREATE INDEX idx_portal_users_company ON portal_users(company_id);
CREATE INDEX idx_portal_users_email ON portal_users(email);
CREATE INDEX idx_portal_users_status ON portal_users(status);
```

### Portal Sessions Table

```sql
CREATE TABLE portal_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    portal_user_id UUID NOT NULL REFERENCES portal_users(id),

    -- Session Info
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),

    -- Device/Location
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(20),  -- DESKTOP, MOBILE, TABLET
    browser VARCHAR(50),
    os VARCHAR(50),
    location_city VARCHAR(100),
    location_country VARCHAR(100),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT NOW(),

    -- Termination
    terminated_at TIMESTAMP,
    termination_reason VARCHAR(50),  -- LOGOUT, EXPIRED, ADMIN_REVOKE, SECURITY

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portal_sessions_user ON portal_sessions(portal_user_id);
CREATE INDEX idx_portal_sessions_token ON portal_sessions(session_token);
CREATE INDEX idx_portal_sessions_active ON portal_sessions(is_active, expires_at);
```

### Quote Requests Table

```sql
CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    portal_user_id UUID NOT NULL REFERENCES portal_users(id),

    -- Reference
    request_number VARCHAR(20) NOT NULL UNIQUE,  -- QR-{YYYYMM}-{sequence}

    -- Origin
    origin_city VARCHAR(100) NOT NULL,
    origin_state VARCHAR(50) NOT NULL,
    origin_zip VARCHAR(20),
    origin_country VARCHAR(3) DEFAULT 'USA',

    -- Destination
    dest_city VARCHAR(100) NOT NULL,
    dest_state VARCHAR(50) NOT NULL,
    dest_zip VARCHAR(20),
    dest_country VARCHAR(3) DEFAULT 'USA',

    -- Shipment Details
    pickup_date DATE NOT NULL,
    delivery_date DATE,
    is_flexible_dates BOOLEAN DEFAULT FALSE,

    equipment_type VARCHAR(50) NOT NULL,  -- VAN, REEFER, FLATBED, etc.
    commodity VARCHAR(200),
    weight_lbs DECIMAL(10,2),
    pieces INTEGER,
    pallets INTEGER,
    dimensions JSONB,  -- {length, width, height, unit}

    -- Special Requirements
    is_hazmat BOOLEAN DEFAULT FALSE,
    hazmat_class VARCHAR(20),
    is_high_value BOOLEAN DEFAULT FALSE,
    declared_value DECIMAL(12,2),
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    special_instructions TEXT,

    -- Accessorials
    requested_accessorials JSONB DEFAULT '[]',  -- [{code, description}]

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',  -- SUBMITTED, REVIEWING, QUOTED, ACCEPTED, DECLINED, EXPIRED

    -- Linked Quote
    quote_id UUID REFERENCES quotes(id),
    quoted_at TIMESTAMP,
    quoted_by UUID REFERENCES users(id),

    -- Response
    customer_response VARCHAR(20),  -- ACCEPTED, DECLINED, REVISION_REQUESTED
    response_at TIMESTAMP,
    response_notes TEXT,

    -- Estimated Rate (instant estimate)
    estimated_rate DECIMAL(10,2),
    estimated_miles INTEGER,

    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quote_requests_tenant ON quote_requests(tenant_id);
CREATE INDEX idx_quote_requests_company ON quote_requests(company_id);
CREATE INDEX idx_quote_requests_user ON quote_requests(portal_user_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_number ON quote_requests(request_number);
```

### Portal Activity Log Table

```sql
CREATE TABLE portal_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    portal_user_id UUID NOT NULL REFERENCES portal_users(id),
    session_id UUID REFERENCES portal_sessions(id),

    -- Activity
    activity_type VARCHAR(50) NOT NULL,  -- LOGIN, LOGOUT, VIEW, CREATE, UPDATE, DOWNLOAD, PAYMENT
    entity_type VARCHAR(50),  -- QUOTE, ORDER, INVOICE, DOCUMENT
    entity_id UUID,

    -- Details
    description TEXT,
    metadata JSONB DEFAULT '{}',

    -- Location
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portal_activity_tenant ON portal_activity_log(tenant_id);
CREATE INDEX idx_portal_activity_user ON portal_activity_log(portal_user_id);
CREATE INDEX idx_portal_activity_type ON portal_activity_log(activity_type);
CREATE INDEX idx_portal_activity_date ON portal_activity_log(created_at);
```

### Portal Payments Table

```sql
CREATE TABLE portal_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    portal_user_id UUID NOT NULL REFERENCES portal_users(id),

    -- Reference
    payment_reference VARCHAR(50) NOT NULL UNIQUE,

    -- Amount
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Payment Method
    payment_method VARCHAR(20) NOT NULL,  -- CARD, ACH, WIRE

    -- Card Details (tokenized)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    card_exp_month INTEGER,
    card_exp_year INTEGER,

    -- ACH Details
    bank_name VARCHAR(100),
    account_last_four VARCHAR(4),
    account_type VARCHAR(20),  -- CHECKING, SAVINGS

    -- Processor
    processor VARCHAR(20),  -- STRIPE, AUTHORIZE_NET
    processor_transaction_id VARCHAR(100),
    processor_response JSONB,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
    failure_reason TEXT,

    -- Invoices Paid
    invoices_paid JSONB NOT NULL,  -- [{invoice_id, amount}]

    -- Timestamps
    initiated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portal_payments_tenant ON portal_payments(tenant_id);
CREATE INDEX idx_portal_payments_company ON portal_payments(company_id);
CREATE INDEX idx_portal_payments_status ON portal_payments(status);
CREATE INDEX idx_portal_payments_reference ON portal_payments(payment_reference);
```

### Saved Payment Methods Table

```sql
CREATE TABLE portal_saved_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    portal_user_id UUID NOT NULL REFERENCES portal_users(id),

    -- Nickname
    nickname VARCHAR(100),

    -- Type
    method_type VARCHAR(20) NOT NULL,  -- CARD, ACH
    is_default BOOLEAN DEFAULT FALSE,

    -- Processor Token
    processor VARCHAR(20) NOT NULL,
    processor_token VARCHAR(255) NOT NULL,

    -- Card Info (for display)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    card_exp_month INTEGER,
    card_exp_year INTEGER,

    -- ACH Info (for display)
    bank_name VARCHAR(100),
    account_last_four VARCHAR(4),
    account_type VARCHAR(20),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_portal_saved_payments_company ON portal_saved_payment_methods(company_id);
CREATE INDEX idx_portal_saved_payments_user ON portal_saved_payment_methods(portal_user_id);
```

### Portal Branding Table

```sql
CREATE TABLE portal_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) UNIQUE,

    -- Logo
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),

    -- Colors
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    accent_color VARCHAR(7) DEFAULT '#10B981',

    -- Custom Domain
    custom_domain VARCHAR(255),
    ssl_certificate_id VARCHAR(255),

    -- Content
    welcome_message TEXT,
    support_email VARCHAR(255),
    support_phone VARCHAR(20),

    -- Features Toggle
    enabled_features JSONB DEFAULT '{
        "quote_requests": true,
        "tracking": true,
        "documents": true,
        "invoices": true,
        "payments": true,
        "multi_user": true
    }',

    -- Custom CSS
    custom_css TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Authentication

| Method | Endpoint                           | Description                          |
| ------ | ---------------------------------- | ------------------------------------ |
| POST   | `/portal/auth/login`               | Portal user login                    |
| POST   | `/portal/auth/logout`              | Logout (invalidate session)          |
| POST   | `/portal/auth/refresh`             | Refresh access token                 |
| POST   | `/portal/auth/forgot-password`     | Request password reset               |
| POST   | `/portal/auth/reset-password`      | Complete password reset              |
| POST   | `/portal/auth/register`            | Accept invitation and create account |
| GET    | `/portal/auth/verify-email/:token` | Verify email address                 |
| POST   | `/portal/auth/change-password`     | Change password                      |

### Dashboard

| Method | Endpoint                             | Description                        |
| ------ | ------------------------------------ | ---------------------------------- |
| GET    | `/portal/dashboard`                  | Get dashboard data                 |
| GET    | `/portal/dashboard/active-shipments` | Get active shipments summary       |
| GET    | `/portal/dashboard/recent-activity`  | Get recent activity feed           |
| GET    | `/portal/dashboard/alerts`           | Get important alerts/notifications |

### Quote Requests

| Method | Endpoint                      | Description               |
| ------ | ----------------------------- | ------------------------- |
| GET    | `/portal/quotes`              | List customer's quotes    |
| POST   | `/portal/quotes/request`      | Submit quote request      |
| GET    | `/portal/quotes/:id`          | Get quote details         |
| POST   | `/portal/quotes/:id/accept`   | Accept quote              |
| POST   | `/portal/quotes/:id/decline`  | Decline quote             |
| POST   | `/portal/quotes/:id/revision` | Request quote revision    |
| GET    | `/portal/quotes/:id/pdf`      | Download quote PDF        |
| POST   | `/portal/quotes/estimate`     | Get instant rate estimate |

### Shipments/Orders

| Method | Endpoint                          | Description                 |
| ------ | --------------------------------- | --------------------------- |
| GET    | `/portal/shipments`               | List customer's shipments   |
| GET    | `/portal/shipments/:id`           | Get shipment details        |
| GET    | `/portal/shipments/:id/tracking`  | Get real-time tracking data |
| GET    | `/portal/shipments/:id/events`    | Get shipment event history  |
| GET    | `/portal/shipments/:id/documents` | Get shipment documents      |
| POST   | `/portal/shipments/:id/contact`   | Send message to broker      |

### Invoices & Payments

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| GET    | `/portal/invoices`          | List customer's invoices   |
| GET    | `/portal/invoices/:id`      | Get invoice details        |
| GET    | `/portal/invoices/:id/pdf`  | Download invoice PDF       |
| GET    | `/portal/invoices/aging`    | Get aging summary          |
| POST   | `/portal/payments`          | Make payment               |
| GET    | `/portal/payments`          | List payment history       |
| GET    | `/portal/payments/:id`      | Get payment details        |
| GET    | `/portal/statements/:month` | Download monthly statement |

### Payment Methods

| Method | Endpoint                              | Description                |
| ------ | ------------------------------------- | -------------------------- |
| GET    | `/portal/payment-methods`             | List saved payment methods |
| POST   | `/portal/payment-methods`             | Add payment method         |
| PUT    | `/portal/payment-methods/:id`         | Update payment method      |
| DELETE | `/portal/payment-methods/:id`         | Remove payment method      |
| POST   | `/portal/payment-methods/:id/default` | Set as default             |

### Documents

| Method | Endpoint                                 | Description               |
| ------ | ---------------------------------------- | ------------------------- |
| GET    | `/portal/documents`                      | List accessible documents |
| GET    | `/portal/documents/:id`                  | Get document details      |
| GET    | `/portal/documents/:id/download`         | Download document         |
| POST   | `/portal/documents/bulk-download`        | Download multiple as ZIP  |
| GET    | `/portal/documents/by-shipment/:orderId` | Get docs for shipment     |

### Account Management

| Method | Endpoint                          | Description                      |
| ------ | --------------------------------- | -------------------------------- |
| GET    | `/portal/profile`                 | Get current user profile         |
| PUT    | `/portal/profile`                 | Update profile                   |
| GET    | `/portal/company`                 | Get company info                 |
| PUT    | `/portal/company`                 | Update company info (admin only) |
| GET    | `/portal/users`                   | List company's portal users      |
| POST   | `/portal/users`                   | Invite new user (admin only)     |
| PUT    | `/portal/users/:id`               | Update user (admin only)         |
| DELETE | `/portal/users/:id`               | Deactivate user (admin only)     |
| POST   | `/portal/users/:id/resend-invite` | Resend invitation                |

### Notifications

| Method | Endpoint                           | Description        |
| ------ | ---------------------------------- | ------------------ |
| GET    | `/portal/notifications`            | Get notifications  |
| PUT    | `/portal/notifications/:id/read`   | Mark as read       |
| PUT    | `/portal/notifications/read-all`   | Mark all as read   |
| GET    | `/portal/notification-preferences` | Get preferences    |
| PUT    | `/portal/notification-preferences` | Update preferences |

---

## Events

### Published Events

| Event                        | Trigger                 | Payload                                    |
| ---------------------------- | ----------------------- | ------------------------------------------ |
| `portal.user.registered`     | User accepts invitation | `{tenant_id, portal_user_id, company_id}`  |
| `portal.user.login`          | Successful login        | `{tenant_id, portal_user_id, session_id}`  |
| `portal.quote.requested`     | Quote request submitted | `{tenant_id, request_id, company_id}`      |
| `portal.quote.accepted`      | Customer accepts quote  | `{tenant_id, quote_id, company_id}`        |
| `portal.quote.declined`      | Customer declines quote | `{tenant_id, quote_id, company_id}`        |
| `portal.payment.initiated`   | Payment started         | `{tenant_id, payment_id, amount}`          |
| `portal.payment.completed`   | Payment successful      | `{tenant_id, payment_id, amount}`          |
| `portal.payment.failed`      | Payment failed          | `{tenant_id, payment_id, reason}`          |
| `portal.document.downloaded` | Document downloaded     | `{tenant_id, document_id, portal_user_id}` |

### Subscribed Events

| Event                      | Source        | Action                                         |
| -------------------------- | ------------- | ---------------------------------------------- |
| `quote.created`            | Sales Service | Send notification to customer                  |
| `quote.updated`            | Sales Service | Update portal quote status                     |
| `load.status_changed`      | TMS Core      | Update tracking, send notification             |
| `load.tracking_updated`    | TMS Core      | Update real-time tracking data                 |
| `invoice.created`          | Accounting    | Make invoice visible in portal                 |
| `invoice.payment_received` | Accounting    | Update invoice status in portal                |
| `document.uploaded`        | Documents     | Make document available if customer-accessible |

---

## Business Rules

### Portal Access

1. Portal users must be linked to a company account
2. Company must have portal access enabled by tenant
3. Email verification required before full access
4. Session expires after 24 hours of inactivity
5. Maximum 5 concurrent sessions per user

### User Roles

1. **ADMIN**: Full access, can manage other users
2. **USER**: Standard access, can request quotes and make payments
3. **VIEW_ONLY**: Read-only access, cannot request quotes or make payments

### Quote Requests

1. Customer must provide minimum: origin, destination, pickup date, equipment type
2. Instant estimates provided using current market rates
3. Quote requests reviewed within 2 business hours (SLA)
4. Quotes valid for configurable period (default 7 days)
5. Accepted quotes automatically create orders

### Payments

1. Payment methods must be verified before use
2. ACH payments require micro-deposit verification
3. Credit card payments subject to 3% processing fee (configurable)
4. Partial payments allowed
5. Payment application follows FIFO (oldest invoice first)
6. Overpayment creates credit balance

### Security

1. Password minimum 8 characters with complexity requirements
2. Account locks after 5 failed login attempts
3. Password reset links expire after 24 hours
4. Sensitive actions require re-authentication
5. All API calls logged for audit

---

## Screens

| Screen            | Type      | Description                                                |
| ----------------- | --------- | ---------------------------------------------------------- |
| Portal Dashboard  | Dashboard | Customer home with active shipments, alerts, quick actions |
| Quote Request     | Form      | Submit new quote request with shipment details             |
| My Quotes         | List      | View all quotes with status, accept/decline actions        |
| My Shipments      | List      | All orders with status, tracking links                     |
| Shipment Tracking | Detail    | Real-time tracking with map, timeline, ETA                 |
| My Invoices       | List      | Invoice history with aging, payment options                |
| Document Library  | List      | Access BOLs, PODs, rate confirmations                      |
| Portal Settings   | Form      | Profile, preferences, user management                      |

---

## Configuration

### Environment Variables

```bash
# Portal
PORTAL_URL=https://portal.company.com
PORTAL_SESSION_TIMEOUT=86400  # 24 hours in seconds
PORTAL_MAX_SESSIONS=5

# Payments
STRIPE_PUBLIC_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PAYMENT_CARD_FEE_PERCENT=3.0

# Email
PORTAL_SUPPORT_EMAIL=support@company.com
PORTAL_FROM_EMAIL=portal@company.com
```

### Default Settings

```json
{
  "session_timeout_minutes": 1440,
  "max_concurrent_sessions": 5,
  "password_min_length": 8,
  "password_require_special": true,
  "max_failed_logins": 5,
  "lockout_duration_minutes": 30,
  "quote_request_sla_hours": 2,
  "quote_validity_days": 7,
  "card_processing_fee_percent": 3.0,
  "ach_processing_fee_percent": 0.5,
  "ach_max_amount": 50000,
  "enable_instant_estimates": true
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Portal user registration validation
- [ ] Password complexity rules
- [ ] Quote request validation (required fields)
- [ ] Instant estimate calculation
- [ ] Payment amount validation
- [ ] User role permission checks

### Integration Tests

- [ ] Login/logout flow
- [ ] Session management (timeout, concurrent)
- [ ] Quote request â†’ Quote creation flow
- [ ] Payment processing â†’ Invoice update
- [ ] Document access permissions
- [ ] Multi-user account management

### E2E Tests

- [ ] Complete quote request journey
- [ ] Shipment tracking with live updates
- [ ] Invoice payment with saved card
- [ ] Add new payment method
- [ ] Invite and onboard new user
- [ ] Password reset flow

---

## Navigation

**Previous:** [11 - Communication Service](../11-communication/README.md)

**Next:** [13 - Carrier Portal Service](../13-carrier-portal/README.md)

**[Back to Services Index](../README.md)**
