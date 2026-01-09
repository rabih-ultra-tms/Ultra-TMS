# Service 16: Factoring Service

| Field             | Value                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| **Service ID**    | 16                                                                       |
| **Service Name**  | Factoring Service                                                        |
| **Category**      | Platform Services                                                        |
| **Phase**         | B (Enhancement)                                                          |
| **Planned Weeks** | 79-82                                                                    |
| **Priority**      | P2                                                                       |
| **Dependencies**  | Auth/Admin (01), Carrier Management (05), Accounting (06), TMS Core (04) |

---

## Overview

### Purpose

Manage freight factoring relationships, NOA (Notice of Assignment) processing, quick pay programs, and carrier payment routing. Enables carriers to receive faster payment while maintaining proper payment routing to factoring companies.

### Key Features

- Factoring company database with payment instructions
- NOA receipt, verification, and lifecycle management
- Quick pay program for accelerated carrier payment
- Automatic payment routing to factoring companies
- Load verification request/response workflow
- Factoring-related reporting and analytics

---

## Database Schema

### Factoring Companies Table

```sql
CREATE TABLE factoring_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Company Info
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE,  -- Short code for reference
    dba_name VARCHAR(200),

    -- Address
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(3) DEFAULT 'USA',

    -- Primary Contact
    primary_contact_name VARCHAR(200),
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),

    -- Verification Contact
    verification_email VARCHAR(255),
    verification_phone VARCHAR(20),

    -- Payment Instructions
    payment_method VARCHAR(20) DEFAULT 'ACH',  -- ACH, CHECK, WIRE
    payment_instructions TEXT,
    ach_routing VARCHAR(20),
    ach_account VARCHAR(50),
    ach_account_type VARCHAR(20),  -- CHECKING, SAVINGS
    wire_routing VARCHAR(20),
    wire_account VARCHAR(50),
    wire_bank_name VARCHAR(200),
    wire_bank_address TEXT,
    check_payee VARCHAR(200),
    check_address TEXT,

    -- API Integration
    api_enabled BOOLEAN DEFAULT FALSE,
    api_endpoint VARCHAR(500),
    api_key_encrypted VARCHAR(500),
    api_format VARCHAR(20),  -- JSON, XML, EDI

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Notes
    notes TEXT,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_factoring_companies_tenant ON factoring_companies(tenant_id);
CREATE INDEX idx_factoring_companies_name ON factoring_companies(name);
CREATE INDEX idx_factoring_companies_code ON factoring_companies(code);
```

### NOA Records Table

```sql
CREATE TABLE noa_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    factoring_company_id UUID NOT NULL REFERENCES factoring_companies(id),

    -- NOA Reference
    noa_number VARCHAR(50),

    -- Dates
    received_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, VERIFIED, ACTIVE, EXPIRED, RELEASED

    -- Document
    document_id UUID REFERENCES documents(id),

    -- Verification
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    verification_method VARCHAR(50),  -- PHONE, EMAIL, FAX, API
    verification_notes TEXT,

    -- Release
    released_at TIMESTAMP,
    released_by UUID REFERENCES users(id),
    release_reason VARCHAR(100),
    release_document_id UUID REFERENCES documents(id),

    -- Notes
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_noa_tenant ON noa_records(tenant_id);
CREATE INDEX idx_noa_carrier ON noa_records(carrier_id);
CREATE INDEX idx_noa_factoring ON noa_records(factoring_company_id);
CREATE INDEX idx_noa_status ON noa_records(status);
CREATE INDEX idx_noa_dates ON noa_records(effective_date, expiration_date);
```

### Carrier Factoring Status Table

```sql
CREATE TABLE carrier_factoring_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id) UNIQUE,

    -- Current Status
    factoring_status VARCHAR(20) NOT NULL DEFAULT 'NONE',  -- NONE, FACTORED, QUICK_PAY_ONLY

    -- Current Factoring
    current_factoring_company_id UUID REFERENCES factoring_companies(id),
    current_noa_id UUID REFERENCES noa_records(id),

    -- Quick Pay
    quick_pay_enrolled BOOLEAN DEFAULT FALSE,
    quick_pay_enrolled_at TIMESTAMP,
    quick_pay_rate DECIMAL(5,4) DEFAULT 0.0300,  -- 3% default

    -- Payment Preference
    payment_preference VARCHAR(20) DEFAULT 'STANDARD',  -- STANDARD, QUICK_PAY, FACTORING

    -- Override (temporary payment redirect)
    override_active BOOLEAN DEFAULT FALSE,
    override_factoring_company_id UUID REFERENCES factoring_companies(id),
    override_reason TEXT,
    override_until DATE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carrier_factoring_carrier ON carrier_factoring_status(carrier_id);
CREATE INDEX idx_carrier_factoring_status ON carrier_factoring_status(factoring_status);
```

### Quick Pay Requests Table

```sql
CREATE TABLE quick_pay_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Reference
    request_number VARCHAR(30) NOT NULL UNIQUE,  -- QP-{YYYYMM}-{sequence}

    -- Load/Settlement
    load_id UUID NOT NULL REFERENCES loads(id),
    settlement_id UUID REFERENCES settlements(id),

    -- Amounts
    original_amount DECIMAL(12,2) NOT NULL,
    discount_rate DECIMAL(5,4) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    net_payment DECIMAL(12,2) NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',  -- REQUESTED, APPROVED, DECLINED, PROCESSING, PAID

    -- Approval
    requested_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    auto_approved BOOLEAN DEFAULT FALSE,

    -- Decline
    declined_at TIMESTAMP,
    declined_by UUID REFERENCES users(id),
    decline_reason TEXT,

    -- Payment
    paid_at TIMESTAMP,
    payment_reference VARCHAR(100),
    payment_method VARCHAR(20),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quick_pay_tenant ON quick_pay_requests(tenant_id);
CREATE INDEX idx_quick_pay_carrier ON quick_pay_requests(carrier_id);
CREATE INDEX idx_quick_pay_load ON quick_pay_requests(load_id);
CREATE INDEX idx_quick_pay_status ON quick_pay_requests(status);
```

### Factoring Verifications Table

```sql
CREATE TABLE factoring_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    factoring_company_id UUID NOT NULL REFERENCES factoring_companies(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    load_id UUID NOT NULL REFERENCES loads(id),

    -- Request
    request_reference VARCHAR(100),  -- Factoring company's reference
    request_method VARCHAR(20),  -- EMAIL, FAX, API, PHONE
    requested_at TIMESTAMP NOT NULL,
    requested_by VARCHAR(200),  -- Who at factoring company

    -- Load/Invoice Info Requested
    invoice_amount DECIMAL(12,2),
    pickup_date DATE,
    delivery_date DATE,

    -- Response
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, VERIFIED, PARTIAL, DECLINED
    verified_amount DECIMAL(12,2),
    discrepancy_reason TEXT,

    -- Response Details
    responded_at TIMESTAMP,
    responded_by UUID REFERENCES users(id),
    response_method VARCHAR(20),
    response_notes TEXT,

    -- SLA
    sla_deadline TIMESTAMP,
    sla_met BOOLEAN,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_factoring_verify_factoring ON factoring_verifications(factoring_company_id);
CREATE INDEX idx_factoring_verify_carrier ON factoring_verifications(carrier_id);
CREATE INDEX idx_factoring_verify_load ON factoring_verifications(load_id);
CREATE INDEX idx_factoring_verify_status ON factoring_verifications(verification_status);
```

### Factored Payments Table

```sql
CREATE TABLE factored_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Related Records
    load_id UUID NOT NULL REFERENCES loads(id),
    settlement_id UUID REFERENCES settlements(id),
    factoring_company_id UUID NOT NULL REFERENCES factoring_companies(id),
    noa_id UUID REFERENCES noa_records(id),

    -- Amounts
    original_amount DECIMAL(12,2) NOT NULL,
    payment_amount DECIMAL(12,2) NOT NULL,

    -- Payment
    payment_reference VARCHAR(100),
    payment_method VARCHAR(20),
    payment_date DATE,

    -- Remittance
    remittance_sent_at TIMESTAMP,
    remittance_method VARCHAR(20),  -- EMAIL, API, EDI
    remittance_reference VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_factored_payments_carrier ON factored_payments(carrier_id);
CREATE INDEX idx_factored_payments_factoring ON factored_payments(factoring_company_id);
CREATE INDEX idx_factored_payments_load ON factored_payments(load_id);
```

---

## API Endpoints

### Factoring Companies

| Method | Endpoint                                   | Description                     |
| ------ | ------------------------------------------ | ------------------------------- |
| GET    | `/api/v1/factoring-companies`              | List factoring companies        |
| POST   | `/api/v1/factoring-companies`              | Add factoring company           |
| GET    | `/api/v1/factoring-companies/:id`          | Get company details             |
| PUT    | `/api/v1/factoring-companies/:id`          | Update company                  |
| DELETE | `/api/v1/factoring-companies/:id`          | Deactivate company              |
| GET    | `/api/v1/factoring-companies/:id/carriers` | List carriers using this factor |

### NOA Management

| Method | Endpoint                           | Description            |
| ------ | ---------------------------------- | ---------------------- |
| GET    | `/api/v1/noa`                      | List NOAs with filters |
| POST   | `/api/v1/noa`                      | Create NOA record      |
| GET    | `/api/v1/noa/:id`                  | Get NOA details        |
| PUT    | `/api/v1/noa/:id`                  | Update NOA             |
| POST   | `/api/v1/noa/:id/verify`           | Verify NOA             |
| POST   | `/api/v1/noa/:id/activate`         | Activate NOA           |
| POST   | `/api/v1/noa/:id/release`          | Release NOA            |
| GET    | `/api/v1/carriers/:id/noa`         | Get carrier's NOAs     |
| GET    | `/api/v1/carriers/:id/noa/current` | Get current active NOA |

### Quick Pay

| Method | Endpoint                                | Description              |
| ------ | --------------------------------------- | ------------------------ |
| GET    | `/api/v1/quick-pay`                     | List quick pay requests  |
| POST   | `/api/v1/quick-pay`                     | Create quick pay request |
| GET    | `/api/v1/quick-pay/:id`                 | Get request details      |
| POST   | `/api/v1/quick-pay/:id/approve`         | Approve request          |
| POST   | `/api/v1/quick-pay/:id/decline`         | Decline request          |
| POST   | `/api/v1/quick-pay/:id/process`         | Process payment          |
| GET    | `/api/v1/loads/:id/quick-pay-eligible`  | Check eligibility        |
| POST   | `/api/v1/carriers/:id/quick-pay/enroll` | Enroll carrier           |
| DELETE | `/api/v1/carriers/:id/quick-pay/enroll` | Unenroll carrier         |

### Verifications

| Method | Endpoint                                      | Description                 |
| ------ | --------------------------------------------- | --------------------------- |
| GET    | `/api/v1/factoring-verifications`             | List verifications          |
| POST   | `/api/v1/factoring-verifications`             | Create verification request |
| GET    | `/api/v1/factoring-verifications/:id`         | Get verification            |
| POST   | `/api/v1/factoring-verifications/:id/respond` | Respond to verification     |
| GET    | `/api/v1/factoring-verifications/pending`     | Get pending verifications   |

### Carrier Factoring Status

| Method | Endpoint                                  | Description             |
| ------ | ----------------------------------------- | ----------------------- |
| GET    | `/api/v1/carriers/:id/factoring`          | Get factoring status    |
| PUT    | `/api/v1/carriers/:id/factoring`          | Update factoring status |
| POST   | `/api/v1/carriers/:id/factoring/override` | Set payment override    |
| DELETE | `/api/v1/carriers/:id/factoring/override` | Remove override         |

### Reporting

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/api/v1/factoring/report`   | Factoring activity report  |
| GET    | `/api/v1/quick-pay/report`   | Quick pay report           |
| GET    | `/api/v1/factoring/revenue`  | Quick pay discount revenue |
| GET    | `/api/v1/factoring/payments` | Factored payments report   |

---

## Events

### Published Events

| Event                              | Trigger               | Payload                                                 |
| ---------------------------------- | --------------------- | ------------------------------------------------------- |
| `noa.received`                     | NOA created           | `{tenant_id, noa_id, carrier_id, factoring_company_id}` |
| `noa.verified`                     | NOA verified          | `{tenant_id, noa_id}`                                   |
| `noa.activated`                    | NOA activated         | `{tenant_id, noa_id, carrier_id}`                       |
| `noa.expiring`                     | NOA expiring soon     | `{tenant_id, noa_id, expiration_date}`                  |
| `noa.expired`                      | NOA expired           | `{tenant_id, noa_id}`                                   |
| `noa.released`                     | NOA released          | `{tenant_id, noa_id, reason}`                           |
| `quick_pay.requested`              | Quick pay requested   | `{tenant_id, request_id, carrier_id, amount}`           |
| `quick_pay.approved`               | Quick pay approved    | `{tenant_id, request_id}`                               |
| `quick_pay.declined`               | Quick pay declined    | `{tenant_id, request_id, reason}`                       |
| `quick_pay.paid`                   | Quick pay processed   | `{tenant_id, request_id, amount}`                       |
| `factoring.verification_requested` | Verification received | `{tenant_id, verification_id}`                          |
| `factoring.verification_responded` | Verification sent     | `{tenant_id, verification_id, status}`                  |
| `factoring.payment_routed`         | Payment to factor     | `{tenant_id, payment_id, factoring_company_id}`         |

### Subscribed Events

| Event                 | Source             | Action                             |
| --------------------- | ------------------ | ---------------------------------- |
| `settlement.approved` | Accounting         | Check factoring status for routing |
| `settlement.paid`     | Accounting         | Log factored payment if applicable |
| `carrier.created`     | Carrier Management | Create factoring status record     |

---

## Business Rules

### NOA Processing

1. NOA must be verified within 2 business days of receipt
2. Only one active NOA per carrier at a time
3. New NOA auto-deactivates previous NOA
4. NOA release requires written authorization (document upload)
5. Expired NOAs do not auto-release (manual action required)

### Quick Pay

1. Quick pay discount default: 3% (configurable per carrier)
2. Quick pay requires: POD uploaded, no open disputes, load delivered
3. Quick pay processed same day if approved by 2pm local time
4. Auto-approval available for carriers meeting criteria
5. Quick pay revenue recognized as discount income

### Payment Routing

1. Factored carriers route payment to factoring company automatically
2. Payment routing based on active NOA at time of settlement
3. Override can redirect payments temporarily
4. Remittance advice sent to factoring company with payment

### Verifications

1. Verification response SLA: 4 hours
2. Verification confirms: load, amount, delivery date
3. Partial verification allowed with discrepancy notes
4. API verifications auto-respond if enabled

### Quick Pay Eligibility

- Carrier enrolled in quick pay program
- Load status: DELIVERED
- POD on file
- No open claims on load
- Settlement not already paid
- Settlement amount > minimum threshold ($100)

---

## Screens

| Screen              | Type      | Description                                         |
| ------------------- | --------- | --------------------------------------------------- |
| Factoring Dashboard | Dashboard | Overview with NOA status, payment routing, KPIs     |
| NOA Management      | List      | NOA records with status filters, verification queue |
| Add NOA             | Form      | Record new NOA with document upload                 |
| Factor Companies    | List      | Manage factoring company database                   |
| Payment Routing     | List      | Configure carrier payment routing                   |
| Quick Pay Requests  | List      | Quick pay request queue with approval workflow      |
| Factoring Reports   | Report    | Factoring activity, discount revenue reports        |

---

## Configuration

### Environment Variables

```bash
# Quick Pay
QUICK_PAY_DEFAULT_RATE=0.03
QUICK_PAY_CUTOFF_TIME=14:00
QUICK_PAY_MIN_AMOUNT=100

# Verification
VERIFICATION_SLA_HOURS=4
VERIFICATION_AUTO_RESPOND=true

# NOA
NOA_EXPIRATION_ALERT_DAYS=30
NOA_VERIFICATION_DEADLINE_DAYS=2
```

### Default Settings

```json
{
  "quick_pay_default_rate": 0.03,
  "quick_pay_cutoff_time": "14:00",
  "quick_pay_min_amount": 100.0,
  "quick_pay_auto_approve_threshold": 10000.0,
  "verification_sla_hours": 4,
  "noa_verification_deadline_days": 2,
  "noa_expiration_alert_days": [30, 14, 7],
  "auto_respond_verifications": true
}
```

---

## Quick Pay Calculation Example

```
Settlement Details:
- Load: LD-202601-0142
- Carrier Rate: $2,500
- Quick Pay Rate: 3%

Calculation:
- Original Amount: $2,500.00
- Discount (3%): $75.00
- Net Payment: $2,425.00

Payment to Carrier: $2,425.00
Discount Revenue: $75.00

If carrier is factored:
- Payment routes to factoring company
- Remittance advice sent with payment details
```

---

## Testing Checklist

### Unit Tests

- [ ] Quick pay discount calculation
- [ ] Quick pay eligibility check
- [ ] NOA status transitions
- [ ] Payment routing logic
- [ ] Verification SLA calculation

### Integration Tests

- [ ] NOA creation â†’ verification â†’ activation
- [ ] Quick pay request â†’ approval â†’ payment
- [ ] Verification request â†’ response flow
- [ ] Settlement â†’ factored payment routing
- [ ] NOA expiration alerting

### E2E Tests

- [ ] Complete NOA lifecycle
- [ ] Quick pay enrollment and request
- [ ] Verification response workflow
- [ ] Factoring company setup and payment
- [ ] Payment override temporary redirect

---

## Navigation

**Previous:** [15 - Agent Service](../15-agent/README.md)

**Next:** [17 - HR Service](../17-hr/README.md)

**[Back to Services Index](../README.md)**
