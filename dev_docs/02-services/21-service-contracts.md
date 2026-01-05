# Service 14: Contracts Service

| Field             | Value                                                                          |
| ----------------- | ------------------------------------------------------------------------------ |
| **Service ID**    | 14                                                                             |
| **Service Name**  | Contracts Service                                                              |
| **Category**      | Operations Services                                                            |
| **Phase**         | A (MVP)                                                                        |
| **Planned Weeks** | 65-70                                                                          |
| **Priority**      | P2                                                                             |
| **Dependencies**  | Auth/Admin (01), CRM (02), Carrier Management (05), Sales (03), Documents (10) |

---

## Overview

### Purpose

Manage customer and carrier contracts, rate agreements, volume commitments, SLAs, and the complete contract lifecycle from creation through renewal or termination. Provides the foundation for contracted pricing that takes precedence over spot rates.

### Key Features

- Contract templates (customer, carrier, agent)
- Rate card management with lane-specific pricing
- Volume commitment tracking with shortfall penalties
- SLA definition and performance monitoring
- E-signature integration (DocuSign)
- Contract versioning and amendment management
- Expiration alerts and auto-renewal options
- Fuel surcharge table management

---

## Database Schema

### Contracts Table

```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Reference
    contract_number VARCHAR(30) NOT NULL UNIQUE,  -- C-{YYYYMM}-{sequence}
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Contract Type
    contract_type VARCHAR(50) NOT NULL,  -- CUSTOMER_RATE, CARRIER_RATE, DEDICATED_CAPACITY, VOLUME_COMMITMENT, AGENT_AGREEMENT

    -- Party
    party_type VARCHAR(20) NOT NULL,  -- CUSTOMER, CARRIER, AGENT
    party_id UUID NOT NULL,  -- References companies, carriers, or agents

    -- Dates
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    signed_date DATE,

    -- Renewal
    auto_renew BOOLEAN DEFAULT FALSE,
    renewal_period_months INTEGER,
    renewal_notice_days INTEGER DEFAULT 30,
    renewal_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- DRAFT, PENDING_APPROVAL, APPROVED, SENT_FOR_SIGNATURE, ACTIVE, EXPIRED, TERMINATED

    -- Approval
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    -- Signatures
    signed_by_us BOOLEAN DEFAULT FALSE,
    signed_by_us_date TIMESTAMP,
    signed_by_them BOOLEAN DEFAULT FALSE,
    signed_by_them_date TIMESTAMP,

    -- E-Signature
    esign_provider VARCHAR(20),  -- DOCUSIGN
    esign_envelope_id VARCHAR(100),
    esign_status VARCHAR(20),

    -- Documents
    document_id UUID REFERENCES documents(id),  -- Signed contract PDF

    -- Terms
    payment_terms VARCHAR(50),  -- NET30, NET45, etc.
    currency VARCHAR(3) DEFAULT 'USD',

    -- Termination
    terminated_by UUID REFERENCES users(id),
    terminated_at TIMESTAMP,
    termination_reason TEXT,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}',

    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_party ON contracts(party_type, party_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_dates ON contracts(effective_date, expiration_date);
CREATE INDEX idx_contracts_type ON contracts(contract_type);
CREATE INDEX idx_contracts_number ON contracts(contract_number);
```

### Contract Templates Table

```sql
CREATE TABLE contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Template Info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    contract_type VARCHAR(50) NOT NULL,

    -- Content
    template_content TEXT NOT NULL,  -- Rich text with merge fields
    merge_fields JSONB DEFAULT '[]',  -- Available merge fields

    -- Clauses
    default_clauses JSONB DEFAULT '[]',  -- [{clause_id, required}]

    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,

    -- Versioning
    version INTEGER DEFAULT 1,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contract_templates_tenant ON contract_templates(tenant_id);
CREATE INDEX idx_contract_templates_type ON contract_templates(contract_type);
```

### Contract Clauses Table

```sql
CREATE TABLE contract_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    contract_id UUID NOT NULL REFERENCES contracts(id),

    -- Clause Info
    clause_type VARCHAR(50) NOT NULL,  -- TERMS, LIABILITY, INSURANCE, PAYMENT, TERMINATION, CUSTOM
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,

    -- Ordering
    sequence INTEGER NOT NULL,

    -- Flags
    is_required BOOLEAN DEFAULT FALSE,
    is_negotiable BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contract_clauses_contract ON contract_clauses(contract_id);
```

### Contract Rate Tables Table

```sql
CREATE TABLE contract_rate_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    contract_id UUID NOT NULL REFERENCES contracts(id),

    -- Table Info
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Scope
    mode VARCHAR(20),  -- LTL, TL, PARTIAL
    equipment_type VARCHAR(50),  -- VAN, REEFER, FLATBED, ALL

    -- Dates
    effective_date DATE NOT NULL,
    expiration_date DATE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Version
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES contract_rate_tables(id),  -- Previous version

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_tables_contract ON contract_rate_tables(contract_id);
CREATE INDEX idx_rate_tables_dates ON contract_rate_tables(effective_date, expiration_date);
```

### Contract Rate Lanes Table

```sql
CREATE TABLE contract_rate_lanes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    rate_table_id UUID NOT NULL REFERENCES contract_rate_tables(id),

    -- Origin
    origin_city VARCHAR(100),
    origin_state VARCHAR(50),
    origin_zip VARCHAR(10),
    origin_zip_start VARCHAR(5),
    origin_zip_end VARCHAR(5),
    origin_region VARCHAR(50),  -- WEST, MIDWEST, SOUTH, NORTHEAST

    -- Destination
    dest_city VARCHAR(100),
    dest_state VARCHAR(50),
    dest_zip VARCHAR(10),
    dest_zip_start VARCHAR(5),
    dest_zip_end VARCHAR(5),
    dest_region VARCHAR(50),

    -- Weight/Volume
    min_weight_lbs INTEGER,
    max_weight_lbs INTEGER,

    -- Rate
    rate_type VARCHAR(20) NOT NULL,  -- FLAT, PER_MILE, PER_CWT, PER_PALLET
    rate_amount DECIMAL(10,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Fuel
    fuel_included BOOLEAN DEFAULT FALSE,
    fuel_table_id UUID REFERENCES fuel_surcharge_tables(id),

    -- Minimums
    min_charge DECIMAL(10,2),

    -- Transit
    transit_days INTEGER,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_lanes_table ON contract_rate_lanes(rate_table_id);
CREATE INDEX idx_rate_lanes_origin ON contract_rate_lanes(origin_state, origin_city);
CREATE INDEX idx_rate_lanes_dest ON contract_rate_lanes(dest_state, dest_city);
```

### Fuel Surcharge Tables Table

```sql
CREATE TABLE fuel_surcharge_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Table Info
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Source
    fuel_index VARCHAR(50) DEFAULT 'DOE_NATIONAL',  -- DOE_NATIONAL, DOE_REGIONAL, CUSTOM

    -- Dates
    effective_date DATE NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fuel_tables_tenant ON fuel_surcharge_tables(tenant_id);
```

### Fuel Surcharge Tiers Table

```sql
CREATE TABLE fuel_surcharge_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fuel_table_id UUID NOT NULL REFERENCES fuel_surcharge_tables(id),

    -- Fuel Price Range
    fuel_price_min DECIMAL(6,3) NOT NULL,
    fuel_price_max DECIMAL(6,3) NOT NULL,

    -- Surcharge
    surcharge_type VARCHAR(20) NOT NULL,  -- PERCENT, PER_MILE, FLAT
    surcharge_amount DECIMAL(10,4) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fuel_tiers_table ON fuel_surcharge_tiers(fuel_table_id);
```

### Contract SLAs Table

```sql
CREATE TABLE contract_slas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    contract_id UUID NOT NULL REFERENCES contracts(id),

    -- SLA Definition
    sla_type VARCHAR(50) NOT NULL,  -- ON_TIME_PICKUP, ON_TIME_DELIVERY, CLAIMS_RATIO, TENDER_ACCEPTANCE, TRACKING_COMPLIANCE, INVOICE_ACCURACY
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Target
    metric VARCHAR(50) NOT NULL,  -- PERCENT, COUNT, HOURS, DAYS
    target_value DECIMAL(10,2) NOT NULL,
    comparison VARCHAR(10) NOT NULL,  -- GTE, LTE, EQ (greater/less than or equal)

    -- Measurement
    measurement_period VARCHAR(20) NOT NULL,  -- WEEKLY, MONTHLY, QUARTERLY

    -- Penalty
    penalty_type VARCHAR(20),  -- PERCENT_REBATE, FLAT_FEE, CREDIT
    penalty_rate DECIMAL(10,4),
    max_penalty DECIMAL(10,2),

    -- Bonus
    bonus_type VARCHAR(20),
    bonus_rate DECIMAL(10,4),
    max_bonus DECIMAL(10,2),

    -- Thresholds
    warning_threshold DECIMAL(10,2),  -- Alert at this level

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contract_slas_contract ON contract_slas(contract_id);
CREATE INDEX idx_contract_slas_type ON contract_slas(sla_type);
```

### Volume Commitments Table

```sql
CREATE TABLE volume_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    contract_id UUID NOT NULL REFERENCES contracts(id),

    -- Commitment Type
    commitment_type VARCHAR(50) NOT NULL,  -- SHIPMENTS, REVENUE, LOADS, WEIGHT

    -- Period
    period_type VARCHAR(20) NOT NULL,  -- MONTHLY, QUARTERLY, ANNUAL

    -- Volumes
    min_volume DECIMAL(12,2) NOT NULL,
    max_volume DECIMAL(12,2),

    -- Shortfall
    shortfall_penalty_type VARCHAR(20),  -- PERCENT, FLAT_PER_UNIT, TIERED
    shortfall_penalty_rate DECIMAL(10,4),

    -- Excess
    excess_discount_type VARCHAR(20),
    excess_discount_rate DECIMAL(10,4),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_volume_commitments_contract ON volume_commitments(contract_id);
```

### Contract Amendments Table

```sql
CREATE TABLE contract_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    contract_id UUID NOT NULL REFERENCES contracts(id),

    -- Amendment Info
    amendment_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,

    -- Changes
    changes JSONB NOT NULL,  -- [{field, old_value, new_value}]

    -- Effective Date
    effective_date DATE NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE, REJECTED

    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    -- E-Signature
    esign_envelope_id VARCHAR(100),
    signed_at TIMESTAMP,

    -- Document
    document_id UUID REFERENCES documents(id),

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_amendments_contract ON contract_amendments(contract_id);
CREATE INDEX idx_amendments_status ON contract_amendments(status);
```

### Contract Metrics Table

```sql
CREATE TABLE contract_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    contract_id UUID NOT NULL REFERENCES contracts(id),

    -- Metric Type
    metric_type VARCHAR(50) NOT NULL,  -- SLA, VOLUME, REVENUE, MARGIN
    sla_id UUID REFERENCES contract_slas(id),
    volume_commitment_id UUID REFERENCES volume_commitments(id),

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Values
    target_value DECIMAL(12,2) NOT NULL,
    actual_value DECIMAL(12,2),
    variance DECIMAL(12,2),
    variance_percent DECIMAL(6,2),

    -- Compliance
    is_compliant BOOLEAN,

    -- Financial Impact
    penalty_amount DECIMAL(10,2),
    bonus_amount DECIMAL(10,2),

    -- Calculation
    calculated_at TIMESTAMP NOT NULL,

    -- Details
    details JSONB DEFAULT '{}',  -- Supporting detail for the metric

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contract_metrics_contract ON contract_metrics(contract_id);
CREATE INDEX idx_contract_metrics_period ON contract_metrics(period_start, period_end);
CREATE INDEX idx_contract_metrics_type ON contract_metrics(metric_type);
```

---

## API Endpoints

### Contracts

| Method | Endpoint                                   | Description                  |
| ------ | ------------------------------------------ | ---------------------------- |
| GET    | `/api/v1/contracts`                        | List contracts with filters  |
| POST   | `/api/v1/contracts`                        | Create contract              |
| GET    | `/api/v1/contracts/:id`                    | Get contract details         |
| PUT    | `/api/v1/contracts/:id`                    | Update contract              |
| DELETE | `/api/v1/contracts/:id`                    | Delete contract (draft only) |
| POST   | `/api/v1/contracts/:id/submit`             | Submit for approval          |
| POST   | `/api/v1/contracts/:id/approve`            | Approve contract             |
| POST   | `/api/v1/contracts/:id/reject`             | Reject contract              |
| POST   | `/api/v1/contracts/:id/send-for-signature` | Send for e-signature         |
| POST   | `/api/v1/contracts/:id/activate`           | Activate contract            |
| POST   | `/api/v1/contracts/:id/terminate`          | Terminate contract           |
| POST   | `/api/v1/contracts/:id/renew`              | Renew contract               |
| GET    | `/api/v1/contracts/:id/history`            | Get contract history         |

### Contract Templates

| Method | Endpoint                               | Description     |
| ------ | -------------------------------------- | --------------- |
| GET    | `/api/v1/contract-templates`           | List templates  |
| POST   | `/api/v1/contract-templates`           | Create template |
| GET    | `/api/v1/contract-templates/:id`       | Get template    |
| PUT    | `/api/v1/contract-templates/:id`       | Update template |
| DELETE | `/api/v1/contract-templates/:id`       | Delete template |
| POST   | `/api/v1/contract-templates/:id/clone` | Clone template  |

### Rate Tables

| Method | Endpoint                                | Description                   |
| ------ | --------------------------------------- | ----------------------------- |
| GET    | `/api/v1/contracts/:id/rate-tables`     | List rate tables for contract |
| POST   | `/api/v1/contracts/:id/rate-tables`     | Add rate table                |
| GET    | `/api/v1/rate-tables/:id`               | Get rate table                |
| PUT    | `/api/v1/rate-tables/:id`               | Update rate table             |
| DELETE | `/api/v1/rate-tables/:id`               | Delete rate table             |
| GET    | `/api/v1/rate-tables/:id/lanes`         | Get lanes in table            |
| POST   | `/api/v1/rate-tables/:id/lanes`         | Add lane rate                 |
| PUT    | `/api/v1/rate-tables/:id/lanes/:laneId` | Update lane rate              |
| DELETE | `/api/v1/rate-tables/:id/lanes/:laneId` | Delete lane rate              |
| POST   | `/api/v1/rate-tables/:id/import`        | Import lanes from CSV         |
| GET    | `/api/v1/rate-tables/:id/export`        | Export lanes to CSV           |

### Fuel Surcharge

| Method | Endpoint                           | Description                |
| ------ | ---------------------------------- | -------------------------- |
| GET    | `/api/v1/fuel-tables`              | List fuel surcharge tables |
| POST   | `/api/v1/fuel-tables`              | Create fuel table          |
| GET    | `/api/v1/fuel-tables/:id`          | Get fuel table             |
| PUT    | `/api/v1/fuel-tables/:id`          | Update fuel table          |
| DELETE | `/api/v1/fuel-tables/:id`          | Delete fuel table          |
| GET    | `/api/v1/fuel-tables/:id/tiers`    | Get surcharge tiers        |
| POST   | `/api/v1/fuel-tables/:id/tiers`    | Add tier                   |
| GET    | `/api/v1/fuel-surcharge/calculate` | Calculate surcharge        |

### SLAs

| Method | Endpoint                            | Description         |
| ------ | ----------------------------------- | ------------------- |
| GET    | `/api/v1/contracts/:id/slas`        | List contract SLAs  |
| POST   | `/api/v1/contracts/:id/slas`        | Add SLA             |
| PUT    | `/api/v1/slas/:id`                  | Update SLA          |
| DELETE | `/api/v1/slas/:id`                  | Delete SLA          |
| GET    | `/api/v1/slas/:id/performance`      | Get SLA performance |
| GET    | `/api/v1/contracts/:id/sla-summary` | Get all SLA summary |

### Volume Commitments

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/v1/contracts/:id/volumes`   | List volume commitments  |
| POST   | `/api/v1/contracts/:id/volumes`   | Add volume commitment    |
| PUT    | `/api/v1/volumes/:id`             | Update volume commitment |
| DELETE | `/api/v1/volumes/:id`             | Delete volume commitment |
| GET    | `/api/v1/volumes/:id/performance` | Get volume vs commitment |

### Amendments

| Method | Endpoint                           | Description       |
| ------ | ---------------------------------- | ----------------- |
| GET    | `/api/v1/contracts/:id/amendments` | List amendments   |
| POST   | `/api/v1/contracts/:id/amendments` | Create amendment  |
| GET    | `/api/v1/amendments/:id`           | Get amendment     |
| PUT    | `/api/v1/amendments/:id`           | Update amendment  |
| POST   | `/api/v1/amendments/:id/approve`   | Approve amendment |
| POST   | `/api/v1/amendments/:id/reject`    | Reject amendment  |

### Rate Lookup

| Method | Endpoint                               | Description                   |
| ------ | -------------------------------------- | ----------------------------- |
| GET    | `/api/v1/contracts/rate-lookup`        | Find rate for lane            |
| GET    | `/api/v1/customers/:id/contract-rates` | Get customer's contract rates |
| GET    | `/api/v1/carriers/:id/contract-rates`  | Get carrier's contract rates  |

### Reports

| Method | Endpoint                          | Description                 |
| ------ | --------------------------------- | --------------------------- |
| GET    | `/api/v1/contracts/expiring`      | List expiring contracts     |
| GET    | `/api/v1/contracts/sla-breaches`  | List SLA breaches           |
| GET    | `/api/v1/contracts/:id/metrics`   | Get contract metrics        |
| GET    | `/api/v1/contracts/volume-report` | Volume vs commitment report |

---

## Events

### Published Events

| Event                         | Trigger                 | Payload                                          |
| ----------------------------- | ----------------------- | ------------------------------------------------ |
| `contract.created`            | Contract created        | `{tenant_id, contract_id, party_type, party_id}` |
| `contract.submitted`          | Submitted for approval  | `{tenant_id, contract_id}`                       |
| `contract.approved`           | Contract approved       | `{tenant_id, contract_id, approved_by}`          |
| `contract.sent_for_signature` | Sent to DocuSign        | `{tenant_id, contract_id, envelope_id}`          |
| `contract.signed`             | Both parties signed     | `{tenant_id, contract_id}`                       |
| `contract.activated`          | Contract now active     | `{tenant_id, contract_id}`                       |
| `contract.amended`            | Amendment applied       | `{tenant_id, contract_id, amendment_id}`         |
| `contract.expiring_90_days`   | 90 days to expiration   | `{tenant_id, contract_id}`                       |
| `contract.expiring_30_days`   | 30 days to expiration   | `{tenant_id, contract_id}`                       |
| `contract.expired`            | Contract expired        | `{tenant_id, contract_id}`                       |
| `contract.terminated`         | Contract terminated     | `{tenant_id, contract_id, reason}`               |
| `contract.auto_renewed`       | Auto-renewed            | `{tenant_id, contract_id, new_expiration}`       |
| `sla.breach_detected`         | SLA breach occurred     | `{tenant_id, contract_id, sla_id, actual_value}` |
| `sla.warning`                 | SLA approaching breach  | `{tenant_id, contract_id, sla_id}`               |
| `volume.shortfall_detected`   | Volume below commitment | `{tenant_id, contract_id, period, shortfall}`    |

### Subscribed Events

| Event                         | Source             | Action                             |
| ----------------------------- | ------------------ | ---------------------------------- |
| `load.delivered`              | TMS Core           | Update volume/SLA metrics          |
| `invoice.created`             | Accounting         | Update revenue metrics             |
| `docusign.signed`             | Integration Hub    | Update contract signature status   |
| `carrier.performance_updated` | Carrier Management | Recalculate carrier SLA compliance |

---

## Business Rules

### Contract Lifecycle

1. Contracts must be approved before sending for signature
2. Only legal/admin roles can approve contracts over $100K annually
3. Cannot edit contract once sent for signature
4. Both signatures required to activate
5. Active contracts cannot be deleted, only terminated

### Rate Tables

1. Rate table effective date cannot be before contract start
2. Only one active rate table per equipment type per contract
3. Lane rates inherit fuel table from rate table unless overridden
4. Rate lookup priority: ZIP match > City match > State match > Region match

### SLAs

1. SLA measurements calculated on defined period (monthly default)
2. Penalty/bonus calculated at period end
3. SLA breach auto-creates adjustment memo
4. Three consecutive breaches trigger contract review alert

### Volume Commitments

1. Volume shortfall calculated at period end
2. Shortfall penalty invoiced automatically
3. Excess volume discount applied to next invoice
4. Year-to-date tracking for annual commitments

### Expiration & Renewal

1. Expiration alerts sent at 90, 60, 30, 7 days
2. Auto-renewal runs 30 days before expiration (if enabled)
3. Auto-renewal disabled if >3 SLA breaches in current term
4. Renewal creates new version, preserves history

### Contract Rates Precedence

1. Contract rates always override spot rates
2. Most specific rate (ZIP level) takes precedence
3. Rate lookup checks effective dates automatically
4. No rate found falls back to spot pricing

---

## Screens

| Screen               | Type      | Description                                             |
| -------------------- | --------- | ------------------------------------------------------- |
| Contracts Dashboard  | Dashboard | Overview with KPIs, expiring contracts, volume tracking |
| Contracts List       | List      | All contracts with filters by type, status, party       |
| Contract Editor      | Form      | Create/edit contract with party selection, terms        |
| Contract Detail      | Detail    | Full view with rates, SLAs, performance, amendments     |
| Rate Card Management | List      | Manage rate tables and lane rates                       |
| SLA Configuration    | Form      | Define SLAs with metrics, targets, penalties            |
| Contract Templates   | List      | Manage reusable templates                               |
| Renewal Queue        | List      | Contracts pending renewal decision                      |

---

## Configuration

### Environment Variables

```bash
# E-Signature
DOCUSIGN_INTEGRATION_KEY=xxx
DOCUSIGN_SECRET_KEY=xxx
DOCUSIGN_ACCOUNT_ID=xxx
DOCUSIGN_BASE_URL=https://demo.docusign.net

# Fuel Index
DOE_FUEL_API_URL=https://api.eia.gov/v2/petroleum/pri/gnd/data
DOE_API_KEY=xxx

# Alerts
CONTRACT_EXPIRATION_ALERT_DAYS=90,60,30,7
```

### Default Settings

```json
{
  "default_payment_terms": "NET30",
  "auto_renew_default": false,
  "renewal_notice_days": 30,
  "sla_measurement_period": "MONTHLY",
  "volume_measurement_period": "MONTHLY",
  "sla_breach_review_threshold": 3,
  "rate_lookup_cache_minutes": 15,
  "expiration_alert_days": [90, 60, 30, 7],
  "high_value_approval_threshold": 100000
}
```

---

## Rate Lookup Algorithm

```
function findContractRate(customer_id, origin, destination, equipment_type, pickup_date):

    1. Find active contracts for customer
       - status = ACTIVE
       - effective_date <= pickup_date <= expiration_date

    2. Find active rate tables for equipment type
       - equipment_type matches OR equipment_type = ALL
       - effective_date <= pickup_date
       - expiration_date is null OR >= pickup_date

    3. Search for matching lane (in priority order):
       a. Exact ZIP to ZIP match
       b. ZIP range match
       c. City to City match
       d. State to State match
       e. Region to Region match

    4. For matched lane:
       - Apply fuel surcharge from fuel table
       - Apply minimum charge if applicable
       - Calculate based on rate_type (FLAT, PER_MILE, etc.)

    5. Return best match or null if no contract rate found
```

---

## Testing Checklist

### Unit Tests

- [ ] Contract number generation
- [ ] Rate lookup priority logic
- [ ] Fuel surcharge calculation
- [ ] SLA compliance calculation
- [ ] Volume shortfall calculation
- [ ] Expiration date validation

### Integration Tests

- [ ] Contract creation â†’ approval â†’ signature flow
- [ ] DocuSign envelope creation and callback
- [ ] Rate lookup with contract rates
- [ ] SLA breach â†’ credit memo creation
- [ ] Volume shortfall â†’ penalty invoice
- [ ] Auto-renewal trigger

### E2E Tests

- [ ] Complete contract lifecycle
- [ ] Rate table import/export
- [ ] Amendment workflow
- [ ] SLA performance dashboard
- [ ] Renewal queue processing

---

## Navigation

**Previous:** [13 - Carrier Portal Service](../13-carrier-portal/README.md)

**Next:** [15 - Agent Service](../15-agent/README.md)

**[Back to Services Index](../README.md)**
