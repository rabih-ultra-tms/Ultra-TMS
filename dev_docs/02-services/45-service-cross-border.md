# Cross-Border Service

## Overview

| Attribute             | Value                                                        |
| --------------------- | ------------------------------------------------------------ |
| **Service ID**        | 37                                                           |
| **Document**          | 45                                                           |
| **Category**          | Extended Services                                            |
| **Phase**             | B (Enhancement)                                              |
| **Development Weeks** | 89-92                                                        |
| **Priority**          | P2 - Medium                                                  |
| **Dependencies**      | Auth/Admin (01), TMS Core (04), Documents (10), Carrier (05) |

## Purpose

The Cross-Border Service manages international freight movements across US-Mexico and US-Canada borders. It handles customs documentation, permit management, broker coordination, and compliance requirements for cross-border shipments including CTPAT, C-TPAT, PIP, and FAST programs.

## Features

### Customs Documentation

- Commercial invoice generation
- Packing list management
- Bill of lading for international
- USMCA/CUSMA certificates
- Shipper's export declaration
- Canadian customs forms (B13A)

### Permit Management

- CTPAT certification tracking
- FAST card management
- Cabotage permits
- Oversize/overweight permits
- Hazmat border permits
- Single-entry vs annual permits

### Broker Coordination

- Customs broker directory
- Broker assignment workflow
- Document transmission
- Status tracking
- Fee management

### Compliance Tracking

- ACE (Automated Commercial Environment)
- ACI (Advance Commercial Information)
- e-Manifest requirements
- Bond management
- Duty/tariff tracking

### Border Crossing

- Port of entry selection
- Wait time monitoring
- Crossing appointment scheduling
- In-bond tracking
- Arrival/departure logging

## Database Schema

```sql
-- Cross-Border Shipments
CREATE TABLE cross_border_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_id UUID NOT NULL REFERENCES loads(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    -- Route
    direction VARCHAR(20) NOT NULL, -- NORTHBOUND, SOUTHBOUND
    origin_country VARCHAR(3) NOT NULL,
    destination_country VARCHAR(3) NOT NULL,

    -- Ports
    border_crossing_port VARCHAR(100),
    port_code VARCHAR(20),
    secondary_port VARCHAR(100), -- alternate

    -- Customs
    entry_number VARCHAR(50),
    entry_type VARCHAR(20), -- IMMEDIATE, WAREHOUSE, TRANSIT
    bond_type VARCHAR(20), -- SINGLE, CONTINUOUS
    bond_number VARCHAR(50),

    -- Broker
    customs_broker_id UUID REFERENCES customs_brokers(id),
    broker_reference VARCHAR(100),

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, DOCS_REQUIRED, SUBMITTED, CLEARED, IN_TRANSIT, DELIVERED, HELD

    -- Crossing details
    scheduled_crossing_date DATE,
    scheduled_crossing_time TIME,
    actual_crossing_at TIMESTAMPTZ,
    crossing_duration_minutes INTEGER,

    -- Inspection
    inspected BOOLEAN DEFAULT false,
    inspection_type VARCHAR(50),
    inspection_result VARCHAR(50),
    inspection_notes TEXT,

    -- Financials
    duty_amount DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    broker_fee DECIMAL(10,2),
    other_fees DECIMAL(10,2),

    -- Documents
    documents JSONB, -- [{type, document_id, status}]

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Customs Brokers
CREATE TABLE customs_brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Broker info
    company_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(50),
    license_country VARCHAR(3),

    -- Contact
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    fax VARCHAR(50),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(3),

    -- Capabilities
    handles_mexico BOOLEAN DEFAULT false,
    handles_canada BOOLEAN DEFAULT false,
    ports_served VARCHAR(100)[],
    specialties VARCHAR(100)[], -- HAZMAT, FOOD, PHARMA, etc.

    -- Credentials
    ace_portal_id VARCHAR(100),
    aci_portal_id VARCHAR(100),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    preferred BOOLEAN DEFAULT false,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, license_number)
);

-- Border Permits
CREATE TABLE border_permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID REFERENCES carriers(id),

    -- Permit info
    permit_type VARCHAR(50) NOT NULL,
    -- CTPAT, FAST, PIP, CABOTAGE, OVERSIZE, HAZMAT, SINGLE_ENTRY
    permit_number VARCHAR(100),

    -- Validity
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, EXPIRED, SUSPENDED, REVOKED

    -- Scope
    applicable_countries VARCHAR(3)[],
    applicable_ports VARCHAR(100)[],

    -- Holder info (for driver permits)
    holder_type VARCHAR(20), -- COMPANY, DRIVER
    holder_name VARCHAR(255),
    holder_id VARCHAR(100), -- license or ID number

    -- Documents
    permit_document_id UUID,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customs Documents
CREATE TABLE customs_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    cross_border_shipment_id UUID NOT NULL REFERENCES cross_border_shipments(id),

    -- Document info
    document_type VARCHAR(50) NOT NULL,
    -- COMMERCIAL_INVOICE, PACKING_LIST, BOL, USMCA_CERT, B13A, MANIFEST
    document_number VARCHAR(100),

    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT',
    -- DRAFT, PENDING_REVIEW, APPROVED, SUBMITTED, REJECTED

    -- File
    document_id UUID REFERENCES documents(id),

    -- Submission
    submitted_at TIMESTAMPTZ,
    submitted_to VARCHAR(100), -- CBP, CBSA, broker
    confirmation_number VARCHAR(100),

    -- Issues
    rejection_reason TEXT,
    corrections_required TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Border Crossings (history)
CREATE TABLE border_crossings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_id UUID NOT NULL REFERENCES loads(id),
    cross_border_shipment_id UUID REFERENCES cross_border_shipments(id),

    -- Crossing info
    port_of_entry VARCHAR(100) NOT NULL,
    port_code VARCHAR(20),
    direction VARCHAR(20) NOT NULL, -- INBOUND, OUTBOUND

    -- Timing
    arrival_at TIMESTAMPTZ,
    cleared_at TIMESTAMPTZ,
    departed_at TIMESTAMPTZ,
    wait_time_minutes INTEGER,

    -- Carrier/driver
    carrier_id UUID REFERENCES carriers(id),
    driver_name VARCHAR(255),
    driver_id_number VARCHAR(100),
    fast_card_number VARCHAR(50),

    -- Vehicle
    truck_number VARCHAR(50),
    trailer_number VARCHAR(50),
    seal_numbers VARCHAR(100)[],

    -- Result
    crossing_result VARCHAR(50),
    -- CLEARED, INSPECTED_CLEARED, INSPECTED_HELD, DENIED

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Port Wait Times (cached)
CREATE TABLE port_wait_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    port_code VARCHAR(20) NOT NULL,
    port_name VARCHAR(100) NOT NULL,
    direction VARCHAR(20) NOT NULL, -- NORTHBOUND, SOUTHBOUND

    -- Current times
    commercial_wait_minutes INTEGER,
    fast_wait_minutes INTEGER,
    standard_wait_minutes INTEGER,

    -- Status
    port_status VARCHAR(50), -- OPEN, CLOSED, DELAYED

    -- Timestamp
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(port_code, direction)
);

-- Indexes
CREATE INDEX idx_cross_border_tenant ON cross_border_shipments(tenant_id);
CREATE INDEX idx_cross_border_load ON cross_border_shipments(load_id);
CREATE INDEX idx_cross_border_status ON cross_border_shipments(status);
CREATE INDEX idx_customs_brokers_tenant ON customs_brokers(tenant_id);
CREATE INDEX idx_border_permits_tenant ON border_permits(tenant_id);
CREATE INDEX idx_border_permits_carrier ON border_permits(carrier_id);
CREATE INDEX idx_border_permits_expiry ON border_permits(expiry_date);
CREATE INDEX idx_customs_documents_shipment ON customs_documents(cross_border_shipment_id);
CREATE INDEX idx_border_crossings_tenant ON border_crossings(tenant_id);
CREATE INDEX idx_border_crossings_load ON border_crossings(load_id);
```

## API Endpoints

### Cross-Border Shipments

| Method | Endpoint                                    | Description          |
| ------ | ------------------------------------------- | -------------------- |
| GET    | `/api/v1/cross-border/shipments`            | List shipments       |
| GET    | `/api/v1/cross-border/shipments/:id`        | Get shipment details |
| POST   | `/api/v1/cross-border/shipments`            | Create shipment      |
| PATCH  | `/api/v1/cross-border/shipments/:id`        | Update shipment      |
| POST   | `/api/v1/cross-border/shipments/:id/submit` | Submit to customs    |
| GET    | `/api/v1/cross-border/shipments/:id/status` | Check customs status |

### Documents

| Method | Endpoint                                        | Description       |
| ------ | ----------------------------------------------- | ----------------- |
| GET    | `/api/v1/cross-border/shipments/:id/documents`  | List documents    |
| POST   | `/api/v1/cross-border/shipments/:id/documents`  | Add document      |
| POST   | `/api/v1/cross-border/documents/generate/:type` | Generate document |
| POST   | `/api/v1/cross-border/documents/:id/submit`     | Submit document   |

### Customs Brokers

| Method | Endpoint                           | Description        |
| ------ | ---------------------------------- | ------------------ |
| GET    | `/api/v1/cross-border/brokers`     | List brokers       |
| GET    | `/api/v1/cross-border/brokers/:id` | Get broker details |
| POST   | `/api/v1/cross-border/brokers`     | Add broker         |
| PATCH  | `/api/v1/cross-border/brokers/:id` | Update broker      |
| DELETE | `/api/v1/cross-border/brokers/:id` | Remove broker      |

### Permits

| Method | Endpoint                                | Description          |
| ------ | --------------------------------------- | -------------------- |
| GET    | `/api/v1/cross-border/permits`          | List permits         |
| GET    | `/api/v1/cross-border/permits/:id`      | Get permit details   |
| POST   | `/api/v1/cross-border/permits`          | Add permit           |
| PATCH  | `/api/v1/cross-border/permits/:id`      | Update permit        |
| GET    | `/api/v1/cross-border/permits/expiring` | Get expiring permits |

### Border Status

| Method | Endpoint                                      | Description       |
| ------ | --------------------------------------------- | ----------------- |
| GET    | `/api/v1/cross-border/ports`                  | List border ports |
| GET    | `/api/v1/cross-border/ports/:code/wait-times` | Get wait times    |
| GET    | `/api/v1/cross-border/ports/status`           | All ports status  |

### Crossings

| Method | Endpoint                             | Description          |
| ------ | ------------------------------------ | -------------------- |
| GET    | `/api/v1/cross-border/crossings`     | List crossings       |
| POST   | `/api/v1/cross-border/crossings`     | Log crossing         |
| GET    | `/api/v1/cross-border/crossings/:id` | Get crossing details |

## Events

### Published Events

| Event                          | Trigger              | Payload                    |
| ------------------------------ | -------------------- | -------------------------- |
| `crossborder.shipment.created` | New shipment         | `{ shipmentId, loadId }`   |
| `crossborder.docs.submitted`   | Docs sent to customs | `{ shipmentId, docType }`  |
| `crossborder.cleared`          | Customs cleared      | `{ shipmentId, loadId }`   |
| `crossborder.held`             | Shipment held        | `{ shipmentId, reason }`   |
| `crossborder.permit.expiring`  | Permit near expiry   | `{ permitId, expiryDate }` |

### Subscribed Events

| Event                 | Source    | Action                   |
| --------------------- | --------- | ------------------------ |
| `load.created`        | TMS       | Check if cross-border    |
| `load.status.changed` | TMS       | Update crossing status   |
| `schedule.daily`      | Scheduler | Check permit expirations |

## Business Rules

### Document Requirements

```typescript
// Required documents by direction
const requiredDocuments = {
  NORTHBOUND: {
    // Mexico to US
    required: ['COMMERCIAL_INVOICE', 'PACKING_LIST', 'BOL'],
    conditional: {
      USMCA_CERT: (load) => load.claimsUSMCA,
      HAZMAT_DOC: (load) => load.hasHazmat,
    },
  },
  SOUTHBOUND: {
    // US to Mexico
    required: ['COMMERCIAL_INVOICE', 'PACKING_LIST', 'BOL', 'PEDIMENTO'],
    conditional: {
      HAZMAT_DOC: (load) => load.hasHazmat,
    },
  },
  CANADA_INBOUND: {
    required: ['COMMERCIAL_INVOICE', 'BOL', 'B13A'],
    conditional: {
      USMCA_CERT: (load) => load.claimsUSMCA,
    },
  },
};

// Check document completeness
function checkDocumentsComplete(
  shipment: CrossBorderShipment
): ValidationResult {
  const required = requiredDocuments[shipment.direction].required;
  const submitted = shipment.documents.map((d) => d.document_type);

  const missing = required.filter((r) => !submitted.includes(r));

  return {
    complete: missing.length === 0,
    missing: missing,
  };
}
```

### Carrier Eligibility

| Requirement              | Mexico               | Canada          |
| ------------------------ | -------------------- | --------------- |
| CTPAT Certified          | Preferred            | Preferred       |
| FAST Approved            | Faster crossing      | Faster crossing |
| Valid MC Authority       | Required             | Required        |
| Insurance (cross-border) | Required             | Required        |
| Cabotage Permit          | Required if domestic | N/A             |

## Screens

| #   | Screen                 | Type      | Description            | Access     |
| --- | ---------------------- | --------- | ---------------------- | ---------- |
| 1   | Cross-Border Dashboard | dashboard | Active crossings       | Operations |
| 2   | Shipments List         | list      | Cross-border shipments | Operations |
| 3   | Shipment Detail        | detail    | Full shipment info     | Operations |
| 4   | Document Manager       | list      | Required documents     | Operations |
| 5   | Broker Directory       | list      | Customs brokers        | Operations |
| 6   | Permits List           | list      | Active permits         | Admin      |
| 7   | Permit Application     | form      | Apply for permits      | Admin      |
| 8   | Border Status          | dashboard | Port wait times        | Operations |
| 9   | Crossing History       | list      | Past crossings         | Operations |
| 10  | Compliance Check       | tool      | Document verification  | Operations |

## Configuration

```yaml
# Environment variables
CROSSBORDER_ACE_API_KEY: 'xxx'
CROSSBORDER_ACE_URL: 'https://ace.cbp.dhs.gov/api'
CROSSBORDER_CBSA_API_KEY: 'xxx'
CROSSBORDER_WAIT_TIME_REFRESH_MINUTES: 30
CROSSBORDER_PERMIT_EXPIRY_ALERT_DAYS: 30
```

## Testing Checklist

### Unit Tests

- [ ] Document requirement logic
- [ ] Carrier eligibility checks
- [ ] Wait time calculations
- [ ] Permit expiry alerts

### Integration Tests

- [ ] ACE portal integration
- [ ] CBSA integration
- [ ] Document generation
- [ ] Broker assignment workflow

### E2E Tests

- [ ] Complete Mexico crossing flow
- [ ] Complete Canada crossing flow
- [ ] Document submission and tracking
- [ ] Permit management

---

_Service Version: 1.0.0_
_Last Updated: January 2025_
