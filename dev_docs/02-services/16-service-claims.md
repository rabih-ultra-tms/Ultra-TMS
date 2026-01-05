# Claims Service

## Overview

| Attribute             | Value                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Service ID**        | 09                                                                                                |
| **Category**          | Operations Services                                                                               |
| **Phase**             | A (Internal MVP)                                                                                  |
| **Development Weeks** | 57-60                                                                                             |
| **Priority**          | P1 - High                                                                                         |
| **Dependencies**      | Auth/Admin (01), TMS Core (04), Carrier (05), Accounting (06), Documents (10), Communication (11) |

## Purpose

The Claims Service manages cargo claims, freight claims, overages, shortages, and damages (OS&D). It provides a complete workflow from claim intake through investigation, valuation, and resolution, including carrier accountability tracking and subrogation management.

## Features

### Claim Intake

- Claim filing by customer, carrier, or internal staff
- Multiple claim types (damage, shortage, overage, loss, delay)
- Multiple items per claim
- Photo and document upload
- Automatic claim value calculation
- Auto-generated claim numbers (CLM-{YYYYMM}-{sequence})
- Claim acknowledgment notifications
- Web form, email, and phone intake

### Claim Investigation

- Investigation assignment to claims adjusters
- Investigation checklist by claim type
- Document collection workflow
- Carrier notification within 24 hours
- Customer communication log
- Investigation timeline tracking
- Root cause analysis documentation
- Evidence gathering workflow

### Claim Valuation

- Declared value verification
- Market value assessment
- Depreciation calculation
- Replacement cost analysis
- Maximum liability limits (Carmack Amendment, Released Value)
- Salvage value tracking
- Multi-item valuation rollup

### Claim Resolution

- Resolution workflow (approve, deny, settle, withdraw)
- Settlement negotiation tracking
- Partial payment processing
- Customer payment issuance
- Carrier chargeback generation
- Resolution letter generation (bilingual EN/ES)
- Appeal handling

### Carrier Accountability

- Carrier claim history tracking
- Carrier claims ratio calculation
- Automatic chargeback generation for carrier-responsible claims
- Carrier scorecard integration
- Impact on carrier qualification tier

### Subrogation

- Subrogation tracking for third-party recovery
- Target carrier identification
- Recovery amount tracking
- Subrogation status workflow

### Reporting & Analytics

- Claims by type, carrier, customer, lane
- Average resolution time
- Total claim cost and recovery rate
- Claims aging report
- Carrier claims ratio comparison

---

## Database Schema

### claims

Main claims table storing claim header information.

```sql
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Identification
    claim_number VARCHAR(30) NOT NULL UNIQUE,
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Related Entities
    order_id UUID REFERENCES orders(id),
    load_id UUID REFERENCES loads(id),
    customer_id UUID NOT NULL REFERENCES companies(id),
    carrier_id UUID REFERENCES carriers(id),

    -- Claim Details
    claim_type VARCHAR(30) NOT NULL CHECK (claim_type IN (
        'CARGO_DAMAGE', 'SHORTAGE', 'OVERAGE', 'TOTAL_LOSS',
        'CONCEALED_DAMAGE', 'DELAY', 'CONTAMINATION', 'TEMPERATURE', 'OTHER'
    )),

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'FILED', 'ACKNOWLEDGED', 'INVESTIGATING',
        'PENDING_DOCUMENTS', 'UNDER_REVIEW', 'APPROVED',
        'DENIED', 'SETTLED', 'PAID', 'CLOSED', 'WITHDRAWN'
    )),

    -- Filing Information
    filed_by VARCHAR(30) CHECK (filed_by IN ('CUSTOMER', 'CARRIER', 'INTERNAL')),
    filed_by_user_id UUID REFERENCES users(id),
    filed_at TIMESTAMP WITH TIME ZONE,

    -- Values
    amount_claimed DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_approved DECIMAL(12,2),
    amount_denied DECIMAL(12,2),
    amount_settled DECIMAL(12,2),
    amount_paid DECIMAL(12,2),

    -- Liability
    liability_type VARCHAR(30) CHECK (liability_type IN (
        'FULL_VALUE', 'RELEASED_VALUE', 'DECLARED_VALUE'
    )),
    released_value_rate DECIMAL(6,4), -- $/lb if released value
    declared_value DECIMAL(12,2),
    max_liability DECIMAL(12,2),

    -- Description
    description TEXT,
    incident_date DATE,
    incident_location VARCHAR(255),

    -- Investigation
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    investigation_due_at TIMESTAMP WITH TIME ZONE,
    investigation_completed_at TIMESTAMP WITH TIME ZONE,
    root_cause VARCHAR(100),
    root_cause_notes TEXT,

    -- Resolution
    resolution_type VARCHAR(30) CHECK (resolution_type IN (
        'APPROVED_FULL', 'APPROVED_PARTIAL', 'DENIED', 'SETTLED', 'WITHDRAWN'
    )),
    resolution_reason TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Payment
    payment_method VARCHAR(30),
    payment_reference VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Carrier Notification
    carrier_notified_at TIMESTAMP WITH TIME ZONE,
    carrier_response_due_at TIMESTAMP WITH TIME ZONE,
    carrier_response TEXT,
    carrier_response_at TIMESTAMP WITH TIME ZONE,

    -- Escalation
    escalated BOOLEAN DEFAULT FALSE,
    escalated_to UUID REFERENCES users(id),
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalation_reason VARCHAR(255),

    -- Chargeback
    chargeback_created BOOLEAN DEFAULT FALSE,
    chargeback_id UUID,
    chargeback_amount DECIMAL(12,2),

    -- Tracking
    sla_due_at TIMESTAMP WITH TIME ZONE,
    sla_breached BOOLEAN DEFAULT FALSE,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}',
    tags VARCHAR(50)[] DEFAULT '{}',

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Indexes
CREATE INDEX idx_claims_tenant ON claims(tenant_id);
CREATE INDEX idx_claims_number ON claims(claim_number);
CREATE INDEX idx_claims_order ON claims(order_id);
CREATE INDEX idx_claims_customer ON claims(customer_id);
CREATE INDEX idx_claims_carrier ON claims(carrier_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_type ON claims(claim_type);
CREATE INDEX idx_claims_assigned ON claims(assigned_to);
CREATE INDEX idx_claims_filed_at ON claims(filed_at);
CREATE INDEX idx_claims_sla ON claims(sla_due_at) WHERE status NOT IN ('CLOSED', 'WITHDRAWN');
```

### claim_items

Individual items within a claim.

```sql
CREATE TABLE claim_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

    -- Item Details
    item_number INTEGER NOT NULL,
    description VARCHAR(500) NOT NULL,
    commodity VARCHAR(100),

    -- Quantities
    quantity_claimed DECIMAL(10,2) NOT NULL,
    quantity_approved DECIMAL(10,2),
    unit_of_measure VARCHAR(20) DEFAULT 'EACH',
    weight_lbs DECIMAL(10,2),

    -- Values
    unit_value DECIMAL(10,2) NOT NULL,
    total_value_claimed DECIMAL(12,2) NOT NULL,
    total_value_approved DECIMAL(12,2),

    -- Damage Details
    damage_type VARCHAR(50) CHECK (damage_type IN (
        'PHYSICAL_DAMAGE', 'WATER_DAMAGE', 'TEMPERATURE_DAMAGE',
        'CONTAMINATION', 'MISSING', 'SHORTAGE', 'CONCEALED', 'OTHER'
    )),
    damage_description TEXT,
    damage_severity VARCHAR(20) CHECK (damage_severity IN ('MINOR', 'MODERATE', 'SEVERE', 'TOTAL')),

    -- Depreciation
    age_months INTEGER,
    depreciation_percent DECIMAL(5,2),
    depreciated_value DECIMAL(12,2),

    -- Salvage
    salvage_value DECIMAL(10,2),
    salvage_notes VARCHAR(500),

    -- Resolution
    item_status VARCHAR(30) DEFAULT 'PENDING' CHECK (item_status IN (
        'PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'DENIED'
    )),
    resolution_notes TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(claim_id, item_number)
);

CREATE INDEX idx_claim_items_claim ON claim_items(claim_id);
```

### claim_documents

Documents attached to claims.

```sql
CREATE TABLE claim_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

    -- Document Info
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'PHOTO', 'BOL', 'POD', 'INVOICE', 'PACKING_LIST',
        'INSPECTION_REPORT', 'CARRIER_RESPONSE', 'SETTLEMENT_AGREEMENT',
        'DENIAL_LETTER', 'CORRESPONDENCE', 'OTHER'
    )),
    document_id UUID REFERENCES documents(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),

    -- Metadata
    description VARCHAR(500),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Processing
    ocr_processed BOOLEAN DEFAULT FALSE,
    ocr_text TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_claim_docs_claim ON claim_documents(claim_id);
CREATE INDEX idx_claim_docs_type ON claim_documents(document_type);
```

### claim_notes

Internal notes and communication log for claims.

```sql
CREATE TABLE claim_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

    -- Note Details
    note_type VARCHAR(30) NOT NULL CHECK (note_type IN (
        'INTERNAL', 'CUSTOMER_COMMUNICATION', 'CARRIER_COMMUNICATION',
        'INVESTIGATION', 'RESOLUTION', 'SYSTEM'
    )),
    subject VARCHAR(255),
    content TEXT NOT NULL,

    -- Communication Details (if applicable)
    direction VARCHAR(10) CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    channel VARCHAR(20) CHECK (channel IN ('EMAIL', 'PHONE', 'PORTAL', 'SYSTEM')),
    contact_name VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(30),

    -- Visibility
    is_visible_to_customer BOOLEAN DEFAULT FALSE,
    is_visible_to_carrier BOOLEAN DEFAULT FALSE,

    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_claim_notes_claim ON claim_notes(claim_id);
CREATE INDEX idx_claim_notes_type ON claim_notes(note_type);
```

### claim_timeline

Status history and activity tracking.

```sql
CREATE TABLE claim_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,

    -- Event Details
    event_type VARCHAR(50) NOT NULL,
    event_description VARCHAR(500) NOT NULL,

    -- Status Change
    previous_status VARCHAR(30),
    new_status VARCHAR(30),

    -- Values (if changed)
    previous_value JSONB,
    new_value JSONB,

    -- Audit
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_claim_timeline_claim ON claim_timeline(claim_id);
CREATE INDEX idx_claim_timeline_date ON claim_timeline(performed_at);
```

### claim_chargebacks

Carrier chargebacks generated from claims.

```sql
CREATE TABLE claim_chargebacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Identification
    chargeback_number VARCHAR(30) NOT NULL UNIQUE,
    claim_id UUID NOT NULL REFERENCES claims(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    settlement_id UUID REFERENCES settlements(id),

    -- Amount
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,

    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'APPLIED', 'DISPUTED', 'REVERSED', 'WRITTEN_OFF'
    )),

    -- Application
    applied_to_settlement_id UUID REFERENCES settlements(id),
    applied_at TIMESTAMP WITH TIME ZONE,
    applied_by UUID REFERENCES users(id),

    -- Dispute
    disputed_at TIMESTAMP WITH TIME ZONE,
    dispute_reason TEXT,
    dispute_resolved_at TIMESTAMP WITH TIME ZONE,
    dispute_resolution VARCHAR(30),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chargebacks_tenant ON claim_chargebacks(tenant_id);
CREATE INDEX idx_chargebacks_claim ON claim_chargebacks(claim_id);
CREATE INDEX idx_chargebacks_carrier ON claim_chargebacks(carrier_id);
CREATE INDEX idx_chargebacks_status ON claim_chargebacks(status);
```

### claim_subrogation

Subrogation tracking for third-party recovery.

```sql
CREATE TABLE claim_subrogation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id),

    -- Target
    target_carrier_id UUID REFERENCES carriers(id),
    target_name VARCHAR(255),
    target_type VARCHAR(30) CHECK (target_type IN (
        'CARRIER', 'VENDOR', 'WAREHOUSE', 'SHIPPER', 'OTHER'
    )),

    -- Amounts
    amount_sought DECIMAL(12,2) NOT NULL,
    amount_recovered DECIMAL(12,2) DEFAULT 0,

    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'IDENTIFIED' CHECK (status IN (
        'IDENTIFIED', 'DEMAND_SENT', 'NEGOTIATING',
        'RECOVERED', 'PARTIAL_RECOVERY', 'UNRECOVERABLE', 'WRITTEN_OFF'
    )),

    -- Tracking
    demand_sent_at TIMESTAMP WITH TIME ZONE,
    demand_due_at TIMESTAMP WITH TIME ZONE,
    last_contact_at TIMESTAMP WITH TIME ZONE,
    recovery_date TIMESTAMP WITH TIME ZONE,

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subrogation_claim ON claim_subrogation(claim_id);
CREATE INDEX idx_subrogation_status ON claim_subrogation(status);
```

### carrier_claims_summary

Aggregated carrier claims statistics for performance tracking.

```sql
CREATE TABLE carrier_claims_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Counts
    total_loads INTEGER DEFAULT 0,
    total_claims INTEGER DEFAULT 0,
    approved_claims INTEGER DEFAULT 0,
    denied_claims INTEGER DEFAULT 0,
    pending_claims INTEGER DEFAULT 0,

    -- Values
    total_amount_claimed DECIMAL(12,2) DEFAULT 0,
    total_amount_approved DECIMAL(12,2) DEFAULT 0,
    total_amount_denied DECIMAL(12,2) DEFAULT 0,
    total_amount_pending DECIMAL(12,2) DEFAULT 0,

    -- Ratios
    claims_ratio DECIMAL(5,4), -- claims / loads
    approval_ratio DECIMAL(5,4), -- approved / total claims

    -- Audit
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, carrier_id, period_start, period_end)
);

CREATE INDEX idx_carrier_claims_carrier ON carrier_claims_summary(carrier_id);
CREATE INDEX idx_carrier_claims_period ON carrier_claims_summary(period_start, period_end);
```

---

## API Endpoints

### Claims Management

| Method | Endpoint                         | Description                |
| ------ | -------------------------------- | -------------------------- |
| GET    | `/api/v1/claims`                 | List claims with filtering |
| POST   | `/api/v1/claims`                 | Create new claim           |
| GET    | `/api/v1/claims/:id`             | Get claim details          |
| PUT    | `/api/v1/claims/:id`             | Update claim               |
| DELETE | `/api/v1/claims/:id`             | Delete claim (draft only)  |
| POST   | `/api/v1/claims/:id/file`        | File/submit claim          |
| POST   | `/api/v1/claims/:id/acknowledge` | Acknowledge receipt        |
| POST   | `/api/v1/claims/:id/assign`      | Assign investigator        |
| PUT    | `/api/v1/claims/:id/status`      | Update status              |
| POST   | `/api/v1/claims/:id/escalate`    | Escalate claim             |

### Claim Items

| Method | Endpoint                           | Description       |
| ------ | ---------------------------------- | ----------------- |
| GET    | `/api/v1/claims/:id/items`         | List claim items  |
| POST   | `/api/v1/claims/:id/items`         | Add item to claim |
| PUT    | `/api/v1/claims/:id/items/:itemId` | Update claim item |
| DELETE | `/api/v1/claims/:id/items/:itemId` | Remove claim item |

### Claim Documents

| Method | Endpoint                                       | Description          |
| ------ | ---------------------------------------------- | -------------------- |
| GET    | `/api/v1/claims/:id/documents`                 | List claim documents |
| POST   | `/api/v1/claims/:id/documents`                 | Upload document      |
| DELETE | `/api/v1/claims/:id/documents/:docId`          | Remove document      |
| GET    | `/api/v1/claims/:id/documents/:docId/download` | Download document    |

### Claim Notes

| Method | Endpoint                           | Description |
| ------ | ---------------------------------- | ----------- |
| GET    | `/api/v1/claims/:id/notes`         | List notes  |
| POST   | `/api/v1/claims/:id/notes`         | Add note    |
| PUT    | `/api/v1/claims/:id/notes/:noteId` | Update note |
| DELETE | `/api/v1/claims/:id/notes/:noteId` | Delete note |

### Resolution

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| POST   | `/api/v1/claims/:id/approve`    | Approve claim             |
| POST   | `/api/v1/claims/:id/deny`       | Deny claim                |
| POST   | `/api/v1/claims/:id/settle`     | Settle claim              |
| POST   | `/api/v1/claims/:id/withdraw`   | Withdraw claim            |
| POST   | `/api/v1/claims/:id/pay`        | Process payment           |
| POST   | `/api/v1/claims/:id/chargeback` | Create carrier chargeback |

### Carrier Notifications

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| POST   | `/api/v1/claims/:id/notify-carrier`   | Send carrier notification |
| POST   | `/api/v1/claims/:id/carrier-response` | Record carrier response   |
| GET    | `/api/v1/claims/:id/timeline`         | Get claim timeline        |

### Subrogation

| Method | Endpoint                                       | Description              |
| ------ | ---------------------------------------------- | ------------------------ |
| GET    | `/api/v1/claims/:id/subrogation`               | Get subrogation details  |
| POST   | `/api/v1/claims/:id/subrogation`               | Create subrogation entry |
| PUT    | `/api/v1/claims/:id/subrogation/:subId`        | Update subrogation       |
| POST   | `/api/v1/claims/:id/subrogation/:subId/demand` | Send demand letter       |

### Chargebacks

| Method | Endpoint                          | Description                 |
| ------ | --------------------------------- | --------------------------- |
| GET    | `/api/v1/chargebacks`             | List all chargebacks        |
| GET    | `/api/v1/chargebacks/:id`         | Get chargeback details      |
| POST   | `/api/v1/chargebacks/:id/apply`   | Apply to settlement         |
| POST   | `/api/v1/chargebacks/:id/dispute` | Carrier disputes chargeback |
| POST   | `/api/v1/chargebacks/:id/reverse` | Reverse chargeback          |

### Reporting

| Method | Endpoint                              | Description                |
| ------ | ------------------------------------- | -------------------------- |
| GET    | `/api/v1/claims/summary`              | Claims summary statistics  |
| GET    | `/api/v1/claims/by-carrier`           | Claims grouped by carrier  |
| GET    | `/api/v1/claims/by-customer`          | Claims grouped by customer |
| GET    | `/api/v1/claims/by-type`              | Claims grouped by type     |
| GET    | `/api/v1/claims/aging`                | Claims aging report        |
| GET    | `/api/v1/carriers/:id/claims-history` | Carrier claims history     |
| GET    | `/api/v1/carriers/:id/claims-ratio`   | Carrier claims ratio       |

---

## Events

### Published Events

```yaml
# Claim Lifecycle
- claim.created
- claim.filed
- claim.acknowledged
- claim.assigned
- claim.status_changed
- claim.escalated

# Documents
- claim.document_uploaded
- claim.document_deleted

# Investigation
- claim.investigation_started
- claim.investigation_completed

# Resolution
- claim.approved
- claim.denied
- claim.settled
- claim.withdrawn
- claim.paid
- claim.closed

# Carrier
- claim.carrier_notified
- claim.carrier_response_received
- claim.chargeback_created
- claim.chargeback_applied
- claim.chargeback_disputed

# Subrogation
- claim.subrogation_created
- claim.subrogation_demand_sent
- claim.subrogation_recovered

# SLA
- claim.sla_warning
- claim.sla_breached
```

### Subscribed Events

```yaml
# From TMS Core
- load.delivered # Check for claim filing deadline
- load.pod_received # Update related claims

# From Accounting
- settlement.created # Check for pending chargebacks
- payment.received # Update claim payment status

# From Carrier Service
- carrier.status_changed # Update claims for suspended carriers
```

---

## Business Rules

### Filing Rules

1. **Filing Deadline**: Claims must be filed within 9 months of delivery (Carmack Amendment)
2. **Required Fields**: Order/Load reference, claim type, and at least one item required
3. **Value Calculation**: Total claim value auto-calculated from item values
4. **Draft Status**: Draft claims can be edited freely; filed claims require status change workflow
5. **Auto-Acknowledgment**: System sends acknowledgment within 1 business day

### Investigation Rules

1. **Carrier Notification**: Carrier must be notified within 24 hours of claim receipt
2. **Response Due**: Carrier response due within 30 days (configurable)
3. **Investigation SLA**: Investigation must complete within 30 business days
4. **Auto-Escalation**: Claims auto-escalate if no action in 5 business days
5. **Document Requirements**: Specific documents required by claim type (BOL, POD, photos)

### Valuation Rules

1. **Carmack Full Value**: Default liability is full declared/market value
2. **Released Value**: If released value in effect, liability = weight Ã— $0.50/lb
3. **Declared Value**: Declared value on BOL caps liability
4. **Maximum Liability**: Cannot exceed shipper's invoice value
5. **Depreciation**: May apply depreciation based on product age

### Approval Rules

1. **Approval Authority**: Claims > $10,000 require manager approval
2. **Auto-Approval**: Claims < $500 with supporting docs may auto-approve (configurable)
3. **Denial Documentation**: Denial requires documented reason and supporting evidence
4. **Partial Approval**: Items can be individually approved/denied
5. **Appeals**: Denied claims can be appealed within 30 days

### Chargeback Rules

1. **Auto-Generation**: Chargeback auto-created when carrier-responsible claim approved
2. **Application**: Chargebacks applied to next available settlement
3. **Maximum**: Chargeback cannot exceed approved claim amount
4. **Dispute Window**: Carriers have 10 days to dispute chargebacks
5. **Write-Off Approval**: Chargeback write-offs > $1,000 require manager approval

### Carrier Impact Rules

1. **Claims Ratio**: Claims ratio = (claims count / loads hauled) Ã— 100
2. **Threshold**: Claims ratio > 3% triggers carrier review
3. **Scorecard Impact**: Each claim reduces carrier score
4. **Tier Impact**: High claims ratio prevents tier advancement
5. **Suspension**: Repeated high-value claims may trigger carrier suspension

---

## Claim Workflow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                            CLAIMS WORKFLOW                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

INTAKE                INVESTIGATION              RESOLUTION              CLOSE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  DRAFT  â”‚ â”€â”€Fileâ”€â–º â”‚    FILED    â”‚ â”€Assignâ”€â–º â”‚INVESTIGATâ”‚ â”€Reviewâ”€â–ºâ”‚APPROVEDâ”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â”‚   ING    â”‚          â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚                  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â”‚
                            â”‚                       â”‚                     â”‚
                      Acknowledge               Documents              â”Œâ”€â”€â–¼â”€â”€â”€â”€â”
                            â”‚                   Needed?                â”‚  PAY  â”‚
                            â–¼                       â”‚                  â””â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”‚                     â”‚
                     â”‚ ACKNOWLEDGED â”‚               â–¼                     â–¼
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”
                                             â”‚ PENDING   â”‚          â”‚ CLOSED â”‚
                                             â”‚ DOCUMENTS â”‚          â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                             â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                              OR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚  DENIED  â”‚
                                                                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                                        â”‚
                                              OR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”
                                                                   â”‚ SETTLED  â”‚
                                                                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                                              OR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                                                   â”‚WITHDRAWN â”‚
                                                                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Status Transitions

| From              | To                | Trigger                  |
| ----------------- | ----------------- | ------------------------ |
| DRAFT             | FILED             | User submits claim       |
| FILED             | ACKNOWLEDGED      | System auto-acknowledges |
| ACKNOWLEDGED      | INVESTIGATING     | Investigator assigned    |
| INVESTIGATING     | PENDING_DOCUMENTS | Documents requested      |
| PENDING_DOCUMENTS | INVESTIGATING     | Documents received       |
| INVESTIGATING     | UNDER_REVIEW      | Investigation complete   |
| UNDER_REVIEW      | APPROVED          | Claim approved           |
| UNDER_REVIEW      | DENIED            | Claim denied             |
| UNDER_REVIEW      | SETTLED           | Settlement reached       |
| APPROVED          | PAID              | Payment processed        |
| PAID              | CLOSED            | Auto-close after payment |
| DENIED            | CLOSED            | Auto-close or manual     |
| SETTLED           | PAID              | Settlement paid          |
| \*                | WITHDRAWN         | Claimant withdraws       |

---

## Screens

| Screen                | Type      | Description                                      |
| --------------------- | --------- | ------------------------------------------------ |
| Claims Dashboard      | Dashboard | Open claims, resolution metrics, aging, alerts   |
| Claims List           | List      | All claims with status, type, amount filtering   |
| Claim Entry           | Form      | File new claim with items and documents          |
| Claim Detail          | Detail    | Full claim view with timeline and correspondence |
| Claim Workflow        | Detail    | Track claim through stages with tasks            |
| OS&D Entry            | Form      | Quick over/short/damage report from delivery     |
| Carrier Claims Portal | List      | Claims filed against specific carriers           |
| Claim Resolution      | Form      | Record settlement, approval, or denial           |
| Claims Reports        | Report    | Claims analysis by carrier, customer, lane, type |
| Chargeback Management | List      | Manage carrier chargebacks                       |
| Subrogation Tracking  | List      | Track third-party recovery efforts               |

---

## Configuration

### Environment Variables

```bash
# Service Settings
CLAIMS_SERVICE_PORT=3009
CLAIMS_FILING_DEADLINE_MONTHS=9
CLAIMS_AUTO_ACKNOWLEDGE_HOURS=24
CLAIMS_CARRIER_NOTIFICATION_HOURS=24
CLAIMS_CARRIER_RESPONSE_DAYS=30
CLAIMS_INVESTIGATION_SLA_DAYS=30
CLAIMS_AUTO_ESCALATE_DAYS=5
CLAIMS_APPEAL_WINDOW_DAYS=30

# Auto-Approval (optional)
CLAIMS_AUTO_APPROVE_ENABLED=false
CLAIMS_AUTO_APPROVE_MAX_AMOUNT=500

# Approval Thresholds
CLAIMS_MANAGER_APPROVAL_THRESHOLD=10000
CLAIMS_CHARGEBACK_WRITEOFF_THRESHOLD=1000

# Released Value
CLAIMS_RELEASED_VALUE_RATE=0.50

# Carrier Thresholds
CLAIMS_CARRIER_RATIO_WARNING=2.0
CLAIMS_CARRIER_RATIO_CRITICAL=3.0
```

### Default Values

```yaml
claim_types:
  - CARGO_DAMAGE
  - SHORTAGE
  - OVERAGE
  - TOTAL_LOSS
  - CONCEALED_DAMAGE
  - DELAY
  - CONTAMINATION
  - TEMPERATURE
  - OTHER

damage_severities:
  - MINOR
  - MODERATE
  - SEVERE
  - TOTAL

required_documents_by_type:
  CARGO_DAMAGE:
    - PHOTO
    - BOL
    - POD
    - INSPECTION_REPORT
  SHORTAGE:
    - BOL
    - POD
    - PACKING_LIST
  TOTAL_LOSS:
    - BOL
    - POD
    - INVOICE
    - POLICE_REPORT (if theft)
  DELAY:
    - BOL
    - POD

resolution_letter_templates:
  - claim_approval_letter_en
  - claim_approval_letter_es
  - claim_denial_letter_en
  - claim_denial_letter_es
  - claim_settlement_letter_en
  - claim_settlement_letter_es
```

---

## Testing Checklist

### Unit Tests

- [ ] Claim CRUD operations
- [ ] Claim number generation (CLM-{YYYYMM}-{sequence})
- [ ] Status transition validations
- [ ] Amount calculations (claimed, approved, denied)
- [ ] Filing deadline validation (9 months)
- [ ] Approval authority checks (>$10K requires manager)
- [ ] Chargeback generation logic
- [ ] Claims ratio calculation
- [ ] Liability calculations (full, released, declared value)

### Integration Tests

- [ ] Claim filing from order/load
- [ ] Document upload and OCR processing
- [ ] Carrier notification workflow
- [ ] Chargeback application to settlement
- [ ] Carrier scorecard integration
- [ ] Payment processing integration
- [ ] Email notification delivery

### E2E Tests

- [ ] Complete claim workflow: file â†’ investigate â†’ approve â†’ pay â†’ close
- [ ] Denial workflow with appeal
- [ ] Settlement negotiation workflow
- [ ] Chargeback creation and application
- [ ] Subrogation workflow
- [ ] Customer portal claim filing
- [ ] Carrier portal claim response

### Performance Tests

- [ ] Claims list with 10,000+ records
- [ ] Document upload (25MB file)
- [ ] Claims report generation
- [ ] Carrier claims history aggregation

---

## Multi-Language Support

### Bilingual Templates

The Claims Service supports English and Spanish for all customer-facing communications:

**Claim Acknowledgment**

- `claim_acknowledgment_en.html`
- `claim_acknowledgment_es.html`

**Carrier Notification**

- `carrier_claim_notification_en.html`
- `carrier_claim_notification_es.html`

**Resolution Letters**

- `claim_approval_letter_en.pdf`
- `claim_approval_letter_es.pdf`
- `claim_denial_letter_en.pdf`
- `claim_denial_letter_es.pdf`

### Template Variables

```handlebars
{{claim_number}}
{{claim_type}}
{{filed_date}}
{{order_number}}
{{customer_name}}
{{carrier_name}}
{{amount_claimed}}
{{amount_approved}}
{{resolution_reason}}
{{contact_name}}
{{contact_phone}}
{{contact_email}}
```

---

## Navigation

| Previous                                      | Up                             | Next                                        |
| --------------------------------------------- | ------------------------------ | ------------------------------------------- |
| [08 - Commission](../08-commission/README.md) | [Services Index](../README.md) | [10 - Documents](../10-documents/README.md) |
