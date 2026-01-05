# Carrier Management Service

## Overview

| Attribute             | Value                          |
| --------------------- | ------------------------------ |
| **Service ID**        | 05                             |
| **Category**          | Core Services                  |
| **Phase**             | A (Internal MVP)               |
| **Development Weeks** | 33-40                          |
| **Priority**          | P0 - Critical                  |
| **Dependencies**      | Auth/Admin (01), TMS Core (04) |

## Purpose

The Carrier Management Service handles the complete carrier lifecycle including onboarding, compliance verification, qualification, performance tracking, and relationship management. It integrates with FMCSA SAFER for compliance data and supports multi-language communication for Hispanic drivers (20% of US trucking workforce).

## Features

### Carrier Onboarding

- Self-service carrier registration portal
- Document collection and verification
- Insurance certificate management
- W-9 and payment setup
- Carrier packet generation
- Multi-language support (English/Spanish)

### Compliance Management

- FMCSA SAFER integration
- Authority status monitoring
- Insurance expiration tracking
- Safety rating verification
- Automatic compliance alerts
- Compliance score calculation

### Carrier Qualification

- Tiered qualification levels
- Performance-based upgrades/downgrades
- Equipment capabilities tracking
- Lane preferences and history
- Capacity and availability

### Performance Tracking

- On-time pickup/delivery rates
- Claim frequency
- Communication responsiveness
- Load acceptance rate
- Customer feedback scores

### Driver Management

- Driver profiles under carrier
- CDL verification
- Driver scorecards
- Preferred driver assignment
- Driver app connectivity

## Database Schema

```sql
-- Carriers
CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Identification
    mc_number VARCHAR(20),
    dot_number VARCHAR(20),
    scac_code VARCHAR(10),
    carrier_code VARCHAR(50), -- Internal reference

    -- Company info
    legal_name VARCHAR(255) NOT NULL,
    dba_name VARCHAR(255),
    company_type VARCHAR(50), -- CARRIER, OWNER_OPERATOR, BROKER, ASSET_BASED

    -- Contact
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    dispatch_email VARCHAR(255),
    dispatch_phone VARCHAR(50),
    after_hours_phone VARCHAR(50),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(3) DEFAULT 'USA',

    -- Tax
    tax_id VARCHAR(50),
    w9_on_file BOOLEAN DEFAULT false,
    tax_classification VARCHAR(50),

    -- Payment
    payment_terms VARCHAR(50), -- QUICK_PAY, NET30, NET15
    quick_pay_fee_percent DECIMAL(5,2),
    factoring_company VARCHAR(255),
    factoring_account VARCHAR(100),

    -- Banking
    bank_name VARCHAR(255),
    bank_routing_number VARCHAR(50),
    bank_account_number_encrypted VARCHAR(255),
    bank_account_type VARCHAR(20), -- CHECKING, SAVINGS

    -- Equipment
    equipment_types VARCHAR(50)[], -- DRY_VAN, REEFER, FLATBED, etc.
    truck_count INTEGER,
    trailer_count INTEGER,

    -- Service area
    service_states VARCHAR(3)[],
    preferred_lanes JSONB, -- [{origin_state, dest_state}]

    -- Status and qualification
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, ACTIVE, SUSPENDED, INACTIVE, BLACKLISTED
    qualification_tier VARCHAR(20), -- PLATINUM, GOLD, SILVER, BRONZE, UNQUALIFIED
    qualification_date DATE,

    -- FMCSA data (cached)
    fmcsa_authority_status VARCHAR(50),
    fmcsa_common_authority BOOLEAN,
    fmcsa_contract_authority BOOLEAN,
    fmcsa_broker_authority BOOLEAN,
    fmcsa_safety_rating VARCHAR(50),
    fmcsa_out_of_service BOOLEAN DEFAULT false,
    fmcsa_last_checked TIMESTAMP WITH TIME ZONE,

    -- Compliance scores
    compliance_score INTEGER, -- 0-100
    safety_score INTEGER, -- 0-100

    -- Performance (denormalized)
    total_loads INTEGER DEFAULT 0,
    on_time_pickup_rate DECIMAL(5,2),
    on_time_delivery_rate DECIMAL(5,2),
    claims_rate DECIMAL(5,2),
    avg_rating DECIMAL(3,2),

    -- Preferences
    preferred_language VARCHAR(10) DEFAULT 'en', -- en, es
    communication_preference VARCHAR(20), -- EMAIL, PHONE, SMS, APP

    -- Notes
    internal_notes TEXT,
    onboarding_notes TEXT,

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    tags VARCHAR(100)[],

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, mc_number),
    UNIQUE(tenant_id, dot_number)
);

CREATE INDEX idx_carriers_tenant ON carriers(tenant_id);
CREATE INDEX idx_carriers_mc ON carriers(mc_number);
CREATE INDEX idx_carriers_dot ON carriers(dot_number);
CREATE INDEX idx_carriers_status ON carriers(tenant_id, status);
CREATE INDEX idx_carriers_tier ON carriers(tenant_id, qualification_tier);
CREATE INDEX idx_carriers_equipment ON carriers USING GIN(equipment_types);

-- Carrier Contacts
CREATE TABLE carrier_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    role VARCHAR(50), -- OWNER, DISPATCHER, ACCOUNTING, SAFETY, DRIVER

    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),

    is_primary BOOLEAN DEFAULT false,
    receives_rate_confirms BOOLEAN DEFAULT false,
    receives_pod_requests BOOLEAN DEFAULT false,
    receives_payments BOOLEAN DEFAULT false,

    preferred_language VARCHAR(10) DEFAULT 'en',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_carrier_contacts_carrier ON carrier_contacts(carrier_id);

-- Drivers
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Personal info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),

    -- License
    cdl_number VARCHAR(50),
    cdl_state VARCHAR(3),
    cdl_expiration DATE,
    cdl_class VARCHAR(5), -- A, B, C
    endorsements VARCHAR(20)[], -- H, N, P, S, T, X

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED

    -- Tracking
    current_location_lat DECIMAL(10,7),
    current_location_lng DECIMAL(10,7),
    location_updated_at TIMESTAMP WITH TIME ZONE,

    -- Performance
    total_loads INTEGER DEFAULT 0,
    on_time_rate DECIMAL(5,2),
    avg_rating DECIMAL(3,2),

    -- Preferences
    preferred_language VARCHAR(10) DEFAULT 'en',

    -- App
    app_user_id UUID, -- Link to mobile app user
    eld_provider VARCHAR(50),
    eld_driver_id VARCHAR(100),

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, cdl_number, cdl_state)
);

CREATE INDEX idx_drivers_tenant ON drivers(tenant_id);
CREATE INDEX idx_drivers_carrier ON drivers(carrier_id);
CREATE INDEX idx_drivers_status ON drivers(tenant_id, status);

-- Insurance Certificates
CREATE TABLE insurance_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,

    insurance_type VARCHAR(50) NOT NULL,
    -- AUTO_LIABILITY, CARGO, GENERAL_LIABILITY, WORKERS_COMP

    policy_number VARCHAR(100),
    insurance_company VARCHAR(255) NOT NULL,

    coverage_amount DECIMAL(14,2) NOT NULL,
    deductible DECIMAL(12,2),

    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,

    -- Certificate holder
    certificate_holder_name VARCHAR(255),
    additional_insured BOOLEAN DEFAULT false,

    -- Document
    document_id UUID, -- Reference to document service
    document_url VARCHAR(500),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, EXPIRING_SOON, EXPIRED, CANCELLED

    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Notifications
    expiration_notified_30 BOOLEAN DEFAULT false,
    expiration_notified_14 BOOLEAN DEFAULT false,
    expiration_notified_7 BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_insurance_carrier ON insurance_certificates(carrier_id);
CREATE INDEX idx_insurance_expiration ON insurance_certificates(expiration_date);
CREATE INDEX idx_insurance_type ON insurance_certificates(carrier_id, insurance_type);

-- Carrier Documents
CREATE TABLE carrier_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,

    document_type VARCHAR(50) NOT NULL,
    -- W9, CARRIER_AGREEMENT, AUTHORITY_LETTER, VOID_CHECK, OTHER

    name VARCHAR(255) NOT NULL,
    description TEXT,

    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, APPROVED, REJECTED, EXPIRED

    -- Review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,

    -- Validity
    expiration_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_carrier_docs_carrier ON carrier_documents(carrier_id);
CREATE INDEX idx_carrier_docs_type ON carrier_documents(carrier_id, document_type);

-- Carrier Performance History
CREATE TABLE carrier_performance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Metrics
    loads_completed INTEGER DEFAULT 0,
    loads_cancelled INTEGER DEFAULT 0,
    on_time_pickups INTEGER DEFAULT 0,
    on_time_deliveries INTEGER DEFAULT 0,
    late_pickups INTEGER DEFAULT 0,
    late_deliveries INTEGER DEFAULT 0,
    claims_count INTEGER DEFAULT 0,
    claims_amount DECIMAL(12,2) DEFAULT 0,

    -- Calculated
    on_time_pickup_rate DECIMAL(5,2),
    on_time_delivery_rate DECIMAL(5,2),
    claims_rate DECIMAL(5,2),

    -- Revenue
    total_paid DECIMAL(14,2) DEFAULT 0,
    avg_rate_per_mile DECIMAL(8,2),

    -- Rating
    avg_dispatcher_rating DECIMAL(3,2),
    avg_customer_rating DECIMAL(3,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(carrier_id, period_start)
);

CREATE INDEX idx_carrier_perf_carrier ON carrier_performance_history(carrier_id);
CREATE INDEX idx_carrier_perf_period ON carrier_performance_history(period_start, period_end);

-- FMCSA Compliance Log
CREATE TABLE fmcsa_compliance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    check_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Results
    dot_number VARCHAR(20),
    authority_status VARCHAR(50),
    common_authority BOOLEAN,
    contract_authority BOOLEAN,
    broker_authority BOOLEAN,
    safety_rating VARCHAR(50),
    out_of_service BOOLEAN,

    -- Safety data
    driver_inspections INTEGER,
    driver_oos_rate DECIMAL(5,2),
    vehicle_inspections INTEGER,
    vehicle_oos_rate DECIMAL(5,2),

    -- Insurance from FMCSA
    fmcsa_insurance_on_file BOOLEAN,
    fmcsa_insurance_amount DECIMAL(14,2),

    -- Changes detected
    changes_detected JSONB, -- [{field, old_value, new_value}]

    raw_response JSONB
);

CREATE INDEX idx_fmcsa_log_carrier ON fmcsa_compliance_log(carrier_id);
CREATE INDEX idx_fmcsa_log_date ON fmcsa_compliance_log(check_date);
```

## API Endpoints

### Carriers

| Method | Endpoint                            | Description                |
| ------ | ----------------------------------- | -------------------------- |
| GET    | `/api/v1/carriers`                  | List carriers with filters |
| POST   | `/api/v1/carriers`                  | Create carrier             |
| GET    | `/api/v1/carriers/:id`              | Get carrier details        |
| PUT    | `/api/v1/carriers/:id`              | Update carrier             |
| DELETE | `/api/v1/carriers/:id`              | Soft delete carrier        |
| GET    | `/api/v1/carriers/:id/compliance`   | Get compliance status      |
| POST   | `/api/v1/carriers/:id/verify-fmcsa` | Check FMCSA status         |
| GET    | `/api/v1/carriers/:id/performance`  | Performance metrics        |
| GET    | `/api/v1/carriers/:id/loads`        | Carrier load history       |
| PATCH  | `/api/v1/carriers/:id/status`       | Update status              |
| PATCH  | `/api/v1/carriers/:id/tier`         | Update qualification tier  |
| POST   | `/api/v1/carriers/lookup-mc`        | Lookup by MC number        |
| POST   | `/api/v1/carriers/lookup-dot`       | Lookup by DOT number       |
| GET    | `/api/v1/carriers/search`           | Search carriers            |

### Carrier Contacts

| Method | Endpoint                                   | Description           |
| ------ | ------------------------------------------ | --------------------- |
| GET    | `/api/v1/carriers/:id/contacts`            | List carrier contacts |
| POST   | `/api/v1/carriers/:id/contacts`            | Add contact           |
| PUT    | `/api/v1/carriers/:id/contacts/:contactId` | Update contact        |
| DELETE | `/api/v1/carriers/:id/contacts/:contactId` | Remove contact        |

### Drivers

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/api/v1/drivers`              | List all drivers     |
| GET    | `/api/v1/carriers/:id/drivers` | List carrier drivers |
| POST   | `/api/v1/carriers/:id/drivers` | Add driver           |
| GET    | `/api/v1/drivers/:id`          | Get driver details   |
| PUT    | `/api/v1/drivers/:id`          | Update driver        |
| DELETE | `/api/v1/drivers/:id`          | Remove driver        |
| GET    | `/api/v1/drivers/:id/location` | Get current location |
| GET    | `/api/v1/drivers/:id/loads`    | Driver load history  |

### Insurance

| Method | Endpoint                                        | Description          |
| ------ | ----------------------------------------------- | -------------------- |
| GET    | `/api/v1/carriers/:id/insurance`                | List insurance certs |
| POST   | `/api/v1/carriers/:id/insurance`                | Add certificate      |
| PUT    | `/api/v1/carriers/:id/insurance/:certId`        | Update certificate   |
| DELETE | `/api/v1/carriers/:id/insurance/:certId`        | Remove certificate   |
| POST   | `/api/v1/carriers/:id/insurance/:certId/verify` | Verify certificate   |
| GET    | `/api/v1/insurance/expiring`                    | List expiring soon   |

### Documents

| Method | Endpoint                                       | Description     |
| ------ | ---------------------------------------------- | --------------- |
| GET    | `/api/v1/carriers/:id/documents`               | List documents  |
| POST   | `/api/v1/carriers/:id/documents`               | Upload document |
| GET    | `/api/v1/carriers/:id/documents/:docId`        | Get document    |
| DELETE | `/api/v1/carriers/:id/documents/:docId`        | Delete document |
| PATCH  | `/api/v1/carriers/:id/documents/:docId/review` | Review document |

### Carrier Portal (Self-Service)

| Method | Endpoint                                   | Description          |
| ------ | ------------------------------------------ | -------------------- |
| POST   | `/api/v1/carrier-portal/register`          | Start registration   |
| GET    | `/api/v1/carrier-portal/onboarding-status` | Check status         |
| POST   | `/api/v1/carrier-portal/documents`         | Upload document      |
| GET    | `/api/v1/carrier-portal/available-loads`   | View available loads |
| POST   | `/api/v1/carrier-portal/bid`               | Submit load bid      |

## Events

### Published Events

| Event                      | Trigger                | Payload          |
| -------------------------- | ---------------------- | ---------------- |
| `carrier.created`          | New carrier            | Carrier data     |
| `carrier.updated`          | Carrier modified       | Changes          |
| `carrier.activated`        | Status â†’ ACTIVE      | Carrier data     |
| `carrier.suspended`        | Status â†’ SUSPENDED   | Carrier + reason |
| `carrier.blacklisted`      | Status â†’ BLACKLISTED | Carrier + reason |
| `carrier.tier_changed`     | Qualification changed  | Old/new tier     |
| `carrier.compliance_alert` | Compliance issue       | Alert details    |
| `driver.created`           | New driver             | Driver data      |
| `driver.updated`           | Driver modified        | Changes          |
| `insurance.expiring`       | 30/14/7 days out       | Certificate      |
| `insurance.expired`        | Certificate expired    | Certificate      |
| `insurance.verified`       | Verified by staff      | Certificate      |
| `fmcsa.checked`            | FMCSA lookup done      | Results          |
| `fmcsa.authority_change`   | Authority changed      | Old/new status   |
| `fmcsa.out_of_service`     | Carrier OOS            | Carrier data     |

### Subscribed Events

| Event            | Source     | Action              |
| ---------------- | ---------- | ------------------- |
| `load.completed` | TMS Core   | Update performance  |
| `load.cancelled` | TMS Core   | Track cancellation  |
| `claim.filed`    | Claims     | Update claims count |
| `payment.sent`   | Accounting | Track payments      |

## Business Rules

### Carrier Qualification Tiers

| Tier        | Requirements                                      |
| ----------- | ------------------------------------------------- |
| PLATINUM    | 100+ loads, 95%+ on-time, <1% claims, 4.5+ rating |
| GOLD        | 50+ loads, 90%+ on-time, <2% claims, 4.0+ rating  |
| SILVER      | 20+ loads, 85%+ on-time, <3% claims, 3.5+ rating  |
| BRONZE      | 5+ loads, active status                           |
| UNQUALIFIED | New carriers, pending verification                |

### Compliance Requirements

1. Valid MC or DOT number required
2. Active FMCSA operating authority
3. Minimum insurance: $100K cargo, $1M auto liability
4. W-9 required for payment setup
5. FMCSA checked weekly for active carriers
6. Out-of-service carriers auto-suspended

### Insurance Rules

1. Cargo insurance minimum: $100,000
2. Auto liability minimum: $1,000,000
3. 30-day advance expiration notifications
4. Expired insurance = carrier suspension
5. Certificate holder must match broker entity

### Onboarding Flow

1. MC/DOT lookup â†’ Auto-populate from FMCSA
2. Contact information collection
3. Insurance certificate upload
4. W-9 and banking setup
5. Carrier agreement signature
6. Compliance verification
7. Tier assignment â†’ UNQUALIFIED initially
8. First load completion â†’ BRONZE

## Screens

| Screen              | Description           | Features                                     |
| ------------------- | --------------------- | -------------------------------------------- |
| Carrier List        | Browse carriers       | Status/tier filters, search                  |
| Carrier Detail      | Full carrier view     | Tabs: Profile, Compliance, Docs, Performance |
| Carrier Onboarding  | Registration wizard   | Step-by-step, document upload                |
| Carrier Scorecard   | Performance dashboard | Metrics, trends, comparisons                 |
| Driver List         | Browse drivers        | Carrier filter, status filter                |
| Driver Detail       | Driver profile        | Load history, ratings                        |
| Insurance Dashboard | Insurance management  | Expiring, expired, pending                   |
| Compliance Monitor  | Compliance overview   | Alerts, FMCSA status                         |
| Carrier Search      | Find carriers         | Equipment, lanes, availability               |
| Carrier Portal      | Self-service portal   | Available loads, documents                   |

## Multi-Language Support

### Spanish Language Elements

- Carrier registration form
- Carrier agreement (bilingual)
- Rate confirmation (bilingual)
- Load notifications (SMS/email)
- Driver app interface
- POD submission forms

### Implementation

```typescript
// Example notification in Spanish
const notifications = {
  load_assigned: {
    en: 'Load #{loadNumber} assigned. Pickup: {pickup}',
    es: 'Carga #{loadNumber} asignada. Recogida: {pickup}',
  },
  rate_confirm: {
    en: 'Please confirm rate for load #{loadNumber}',
    es: 'Por favor confirme la tarifa para la carga #{loadNumber}',
  },
};
```

## FMCSA Integration

### Data Retrieved

- Operating authority status
- Common/Contract/Broker authority flags
- Safety rating
- Out-of-service status
- Insurance on file
- Inspection history
- Crash history
- Driver OOS rate
- Vehicle OOS rate

### Check Frequency

- New carriers: Immediate
- Active carriers: Weekly
- Suspended carriers: On reactivation request
- Manual refresh: On demand

## Configuration

### Environment Variables

```bash
# FMCSA Integration
FMCSA_API_KEY=your_api_key
FMCSA_CHECK_INTERVAL_HOURS=168  # Weekly

# Insurance Requirements
MIN_CARGO_INSURANCE=100000
MIN_AUTO_LIABILITY=1000000
INSURANCE_EXPIRATION_WARNING_DAYS=30,14,7

# Qualification
QUALIFICATION_RECALC_INTERVAL_DAYS=30
```

## Testing Checklist

### Unit Tests

- [ ] Carrier CRUD operations
- [ ] Insurance validation
- [ ] Qualification tier calculation
- [ ] Performance score calculation
- [ ] FMCSA data parsing
- [ ] Document validation

### Integration Tests

- [ ] FMCSA API integration
- [ ] Document upload/storage
- [ ] Event publishing
- [ ] Performance history aggregation
- [ ] Insurance expiration notifications

### E2E Tests

- [ ] Complete onboarding flow
- [ ] Carrier portal registration
- [ ] Compliance check flow
- [ ] Insurance certificate lifecycle
- [ ] Tier upgrade/downgrade
- [ ] Spanish language notifications

---

**Navigation:** [â† TMS Core](../04-tms-core/README.md) | [Services Index](../README.md) | [Load Board â†’](../06-load-board/README.md)
