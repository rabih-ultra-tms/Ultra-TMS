# 31 - Factoring Service

| Field            | Value                                |
| ---------------- | ------------------------------------ |
| **Service ID**   | 31                                   |
| **Service Name** | Factoring                            |
| **Category**     | Extended                             |
| **Module Path**  | `@modules/factoring`                 |
| **Phase**        | C (SaaS)                             |
| **Weeks**        | 109-112                              |
| **Priority**     | P2                                   |
| **Dependencies** | Auth, Carrier, Accounting, Documents |

---

## Purpose

Quick pay and factoring integration service for carriers enabling fast payment options. Supports both in-house quick pay programs (broker-funded) and third-party factoring company integrations (Triumph, RTS, OTR Solutions). Manages NOAs (Notice of Assignment), payment routing, and factoring company relationships.

---

## Features

- **Quick Pay Program** - In-house fast payment at discounted rate
- **Factoring Integration** - Third-party factoring company support
- **NOA Management** - Track Notice of Assignment documents
- **Payment Routing** - Route payments to factoring companies
- **Verification Calls** - Track verification of loads
- **Funding Requests** - Manage carrier funding requests
- **Fee Calculation** - Automatic quick pay fee computation
- **Settlement Splitting** - Split payments between carrier and factor
- **Debtor Setup** - Manage shipper/debtor relationships
- **Reserves** - Track factoring reserves and holdbacks
- **Reporting** - Quick pay utilization and cost reports
- **Carrier Preference** - Carrier payment preference management

---

## Database Schema

```sql
-- Factoring Companies
CREATE TABLE factoring_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Company Information
    company_name VARCHAR(200) NOT NULL,
    company_code VARCHAR(20) NOT NULL,              -- Short code

    -- Contact Info
    primary_contact_name VARCHAR(100),
    primary_contact_email VARCHAR(200),
    primary_contact_phone VARCHAR(20),
    verification_phone VARCHAR(20),                 -- For verification calls
    verification_email VARCHAR(200),
    funding_email VARCHAR(200),                     -- For sending funding docs

    -- Address
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(10),

    -- Payment Details
    payment_method VARCHAR(20) DEFAULT 'ACH',       -- ACH, CHECK, WIRE
    bank_name VARCHAR(100),
    routing_number VARCHAR(9),
    account_number_encrypted VARCHAR(255),
    account_type VARCHAR(20),                       -- CHECKING, SAVINGS

    -- Remittance
    remit_to_name VARCHAR(200),
    remit_to_address JSONB,

    -- Integration
    has_api_integration BOOLEAN DEFAULT false,
    api_config JSONB,                               -- API credentials/settings

    -- Settings
    requires_verification_call BOOLEAN DEFAULT true,
    requires_noa_on_file BOOLEAN DEFAULT true,
    accepts_split_payments BOOLEAN DEFAULT true,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',            -- ACTIVE, INACTIVE

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_factoring_companies_tenant ON factoring_companies(tenant_id);
CREATE INDEX idx_factoring_companies_code ON factoring_companies(company_code);

-- Carrier Factoring Relationships
CREATE TABLE carrier_factoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Factoring Setup
    uses_factoring BOOLEAN DEFAULT false,
    factoring_company_id UUID REFERENCES factoring_companies(id),

    -- Quick Pay Preference
    quick_pay_preferred BOOLEAN DEFAULT false,
    quick_pay_eligible BOOLEAN DEFAULT true,

    -- Factoring Account Details
    factoring_account_number VARCHAR(50),
    factoring_client_code VARCHAR(50),

    -- NOA (Notice of Assignment)
    noa_on_file BOOLEAN DEFAULT false,
    noa_document_id UUID REFERENCES documents(id),
    noa_received_date DATE,
    noa_effective_date DATE,
    noa_expiration_date DATE,

    -- Verification
    verification_required BOOLEAN DEFAULT true,
    verification_contact_name VARCHAR(100),
    verification_contact_phone VARCHAR(20),
    verification_contact_email VARCHAR(200),

    -- Payment Routing
    route_all_payments BOOLEAN DEFAULT false,       -- Route all or just factored loads
    minimum_invoice_amount DECIMAL(10,2),           -- Min for factoring

    -- Reserve
    reserve_percentage DECIMAL(5,2) DEFAULT 0,
    reserve_balance DECIMAL(15,2) DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',
    status_reason VARCHAR(200),

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, carrier_id)
);

CREATE INDEX idx_carrier_factoring_carrier ON carrier_factoring(carrier_id);
CREATE INDEX idx_carrier_factoring_company ON carrier_factoring(factoring_company_id);

-- Quick Pay Program Configuration
CREATE TABLE quick_pay_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Program Info
    program_name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Fee Structure
    fee_type VARCHAR(20) NOT NULL,                  -- FLAT, PERCENTAGE, TIERED
    fee_percentage DECIMAL(5,2),                    -- e.g., 2.5%
    fee_flat_amount DECIMAL(10,2),                  -- Flat fee
    minimum_fee DECIMAL(10,2),
    maximum_fee DECIMAL(10,2),

    -- Tiered Fees (if fee_type = TIERED)
    fee_tiers JSONB,                                -- [{days: 3, rate: 1.5}, {days: 7, rate: 2.0}]

    -- Payment Terms
    standard_payment_days INTEGER NOT NULL,         -- Normal payment terms (e.g., 30)
    quick_pay_days INTEGER NOT NULL,                -- Quick pay terms (e.g., 3)

    -- Eligibility
    minimum_invoice_amount DECIMAL(10,2),
    maximum_invoice_amount DECIMAL(10,2),
    new_carrier_eligible BOOLEAN DEFAULT true,
    new_carrier_wait_days INTEGER DEFAULT 0,

    -- Automation
    auto_approve BOOLEAN DEFAULT false,
    auto_approve_threshold DECIMAL(10,2),
    require_pod BOOLEAN DEFAULT true,

    -- Status
    is_default BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'ACTIVE',

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_quick_pay_programs_tenant ON quick_pay_programs(tenant_id);

-- Quick Pay Requests
CREATE TABLE quick_pay_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Request Number
    request_number VARCHAR(50) NOT NULL,

    -- Carrier
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Program
    program_id UUID NOT NULL REFERENCES quick_pay_programs(id),

    -- Related Records
    load_ids UUID[] NOT NULL,                       -- Can include multiple loads
    carrier_pay_ids UUID[],                         -- Carrier payables
    invoice_ids UUID[],                             -- Customer invoices (for factoring)

    -- Amounts
    gross_amount DECIMAL(15,2) NOT NULL,            -- Total before fees
    fee_percentage DECIMAL(5,2) NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(15,2) NOT NULL,              -- Amount to pay carrier

    -- Timing
    requested_at TIMESTAMPTZ NOT NULL,
    standard_pay_date DATE,                         -- When would pay normally
    quick_pay_date DATE,                            -- When will pay with quick pay
    days_early INTEGER,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, APPROVED, REJECTED, PAID, CANCELLED

    -- Approval
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    rejection_reason VARCHAR(200),

    -- Payment
    payment_method VARCHAR(20),
    payment_reference VARCHAR(100),
    paid_at TIMESTAMPTZ,
    paid_by UUID REFERENCES users(id),

    -- Factoring (if routed to factor)
    routed_to_factoring BOOLEAN DEFAULT false,
    factoring_company_id UUID REFERENCES factoring_companies(id),

    -- Notes
    notes TEXT,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_quick_pay_requests_tenant ON quick_pay_requests(tenant_id);
CREATE INDEX idx_quick_pay_requests_carrier ON quick_pay_requests(carrier_id);
CREATE INDEX idx_quick_pay_requests_status ON quick_pay_requests(status);
CREATE INDEX idx_quick_pay_requests_number ON quick_pay_requests(request_number);

-- Factoring Funding Requests
CREATE TABLE factoring_funding_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Request Info
    request_number VARCHAR(50) NOT NULL,

    -- Carrier & Factor
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    factoring_company_id UUID NOT NULL REFERENCES factoring_companies(id),

    -- Related Records
    load_ids UUID[] NOT NULL,
    carrier_pay_ids UUID[],
    invoice_ids UUID[],

    -- Amounts
    invoice_amount DECIMAL(15,2) NOT NULL,          -- Customer invoice amount
    carrier_pay_amount DECIMAL(15,2) NOT NULL,      -- Amount owed to carrier

    -- Verification
    verification_status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, VERIFIED, FAILED
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    verification_reference VARCHAR(100),
    verification_notes TEXT,

    -- Documents Sent
    documents_sent BOOLEAN DEFAULT false,
    documents_sent_at TIMESTAMPTZ,
    documents JSONB DEFAULT '[]',                   -- Document references

    -- Factor Response
    factor_reference VARCHAR(100),
    factor_status VARCHAR(30),                      -- RECEIVED, APPROVED, FUNDED, REJECTED
    factor_response_at TIMESTAMPTZ,
    factor_notes TEXT,

    -- Funding Details
    funded_amount DECIMAL(15,2),
    reserve_held DECIMAL(15,2),
    fee_charged DECIMAL(10,2),
    funded_at TIMESTAMPTZ,

    -- Settlement
    settlement_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ROUTED, PAID
    settlement_reference VARCHAR(100),
    settlement_amount DECIMAL(15,2),
    settled_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, VERIFIED, SENT, FUNDED, REJECTED, CANCELLED

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_factoring_funding_tenant ON factoring_funding_requests(tenant_id);
CREATE INDEX idx_factoring_funding_carrier ON factoring_funding_requests(carrier_id);
CREATE INDEX idx_factoring_funding_company ON factoring_funding_requests(factoring_company_id);
CREATE INDEX idx_factoring_funding_status ON factoring_funding_requests(status);

-- Verification Calls Log
CREATE TABLE factoring_verification_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    funding_request_id UUID NOT NULL REFERENCES factoring_funding_requests(id),

    -- Call Details
    call_type VARCHAR(20) NOT NULL,                 -- INBOUND, OUTBOUND
    caller_name VARCHAR(100),
    caller_phone VARCHAR(20),
    caller_company VARCHAR(200),

    -- Verification
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ NOT NULL,

    -- Load Details Verified
    load_numbers VARCHAR(50)[],
    verified_pickup BOOLEAN,
    verified_delivery BOOLEAN,
    verified_amount BOOLEAN,

    -- Results
    verification_result VARCHAR(20) NOT NULL,       -- VERIFIED, PARTIAL, FAILED
    result_notes TEXT,

    -- Recording (if applicable)
    call_recording_url VARCHAR(500),
    call_duration_seconds INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verification_calls_request ON factoring_verification_calls(funding_request_id);

-- Debtor Setup (Shippers in factoring system)
CREATE TABLE factoring_debtors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    factoring_company_id UUID NOT NULL REFERENCES factoring_companies(id),

    -- Shipper/Debtor
    company_id UUID NOT NULL REFERENCES companies(id),

    -- Factoring Info
    debtor_code VARCHAR(50),
    debtor_name VARCHAR(200) NOT NULL,

    -- Credit Status
    credit_status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, APPROVED, LIMITED, DECLINED
    credit_limit DECIMAL(15,2),
    current_balance DECIMAL(15,2) DEFAULT 0,
    available_credit DECIMAL(15,2),

    -- Terms
    payment_terms_days INTEGER,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',
    status_updated_at TIMESTAMPTZ,
    status_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_factoring_debtors_company ON factoring_debtors(company_id);
CREATE INDEX idx_factoring_debtors_factor ON factoring_debtors(factoring_company_id);

-- Payment Routing Records
CREATE TABLE factoring_payment_routing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Original Payment
    carrier_pay_id UUID NOT NULL REFERENCES carrier_payables(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Routing
    routed_to VARCHAR(20) NOT NULL,                 -- CARRIER, FACTORING_COMPANY
    factoring_company_id UUID REFERENCES factoring_companies(id),

    -- Amounts
    original_amount DECIMAL(15,2) NOT NULL,
    routed_amount DECIMAL(15,2) NOT NULL,
    carrier_amount DECIMAL(15,2) DEFAULT 0,         -- If split payment

    -- Payment Info
    payment_reference VARCHAR(100),
    payment_method VARCHAR(20),
    paid_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, ROUTED, PAID, FAILED

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_routing_carrier_pay ON factoring_payment_routing(carrier_pay_id);
CREATE INDEX idx_payment_routing_carrier ON factoring_payment_routing(carrier_id);

-- Reserve Transactions
CREATE TABLE factoring_reserve_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    factoring_company_id UUID REFERENCES factoring_companies(id),

    -- Transaction Type
    transaction_type VARCHAR(20) NOT NULL,          -- HOLD, RELEASE, DEDUCTION

    -- Related Records
    funding_request_id UUID REFERENCES factoring_funding_requests(id),
    load_id UUID REFERENCES loads(id),

    -- Amount
    amount DECIMAL(15,2) NOT NULL,
    running_balance DECIMAL(15,2) NOT NULL,

    -- Reason
    reason VARCHAR(200),
    notes TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'POSTED',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_reserve_transactions_carrier ON factoring_reserve_transactions(carrier_id);
```

---

## API Endpoints

| Method                      | Endpoint                                           | Description                   |
| --------------------------- | -------------------------------------------------- | ----------------------------- |
| **Factoring Companies**     |
| GET                         | `/api/factoring/companies`                         | List factoring companies      |
| POST                        | `/api/factoring/companies`                         | Add factoring company         |
| GET                         | `/api/factoring/companies/{id}`                    | Get company details           |
| PUT                         | `/api/factoring/companies/{id}`                    | Update company                |
| DELETE                      | `/api/factoring/companies/{id}`                    | Remove company                |
| **Carrier Factoring Setup** |
| GET                         | `/api/factoring/carriers/{carrierId}`              | Get carrier factoring setup   |
| PUT                         | `/api/factoring/carriers/{carrierId}`              | Update carrier setup          |
| POST                        | `/api/factoring/carriers/{carrierId}/noa`          | Upload NOA document           |
| **Quick Pay Programs**      |
| GET                         | `/api/factoring/quick-pay/programs`                | List quick pay programs       |
| POST                        | `/api/factoring/quick-pay/programs`                | Create program                |
| GET                         | `/api/factoring/quick-pay/programs/{id}`           | Get program details           |
| PUT                         | `/api/factoring/quick-pay/programs/{id}`           | Update program                |
| DELETE                      | `/api/factoring/quick-pay/programs/{id}`           | Delete program                |
| **Quick Pay Requests**      |
| GET                         | `/api/factoring/quick-pay/requests`                | List quick pay requests       |
| POST                        | `/api/factoring/quick-pay/requests`                | Request quick pay             |
| GET                         | `/api/factoring/quick-pay/requests/{id}`           | Get request details           |
| POST                        | `/api/factoring/quick-pay/requests/{id}/approve`   | Approve request               |
| POST                        | `/api/factoring/quick-pay/requests/{id}/reject`    | Reject request                |
| POST                        | `/api/factoring/quick-pay/requests/{id}/pay`       | Process payment               |
| POST                        | `/api/factoring/quick-pay/calculate`               | Calculate quick pay fee       |
| **Funding Requests**        |
| GET                         | `/api/factoring/funding`                           | List funding requests         |
| POST                        | `/api/factoring/funding`                           | Create funding request        |
| GET                         | `/api/factoring/funding/{id}`                      | Get request details           |
| POST                        | `/api/factoring/funding/{id}/verify`               | Record verification           |
| POST                        | `/api/factoring/funding/{id}/send`                 | Send to factoring company     |
| PUT                         | `/api/factoring/funding/{id}/response`             | Record factor response        |
| **Verification**            |
| GET                         | `/api/factoring/verifications`                     | List pending verifications    |
| POST                        | `/api/factoring/verifications`                     | Log verification call         |
| GET                         | `/api/factoring/verifications/{requestId}`         | Get verifications for request |
| **Debtors**                 |
| GET                         | `/api/factoring/debtors`                           | List debtors                  |
| POST                        | `/api/factoring/debtors/check`                     | Check debtor credit           |
| GET                         | `/api/factoring/debtors/{id}`                      | Get debtor details            |
| **Payment Routing**         |
| GET                         | `/api/factoring/routing`                           | List routing records          |
| GET                         | `/api/factoring/routing/pending`                   | Get pending for routing       |
| POST                        | `/api/factoring/routing/process`                   | Process routing batch         |
| **Reserves**                |
| GET                         | `/api/factoring/reserves/{carrierId}`              | Get carrier reserve balance   |
| GET                         | `/api/factoring/reserves/{carrierId}/transactions` | Get reserve history           |
| POST                        | `/api/factoring/reserves/{carrierId}/release`      | Release reserve               |
| **Reports**                 |
| GET                         | `/api/factoring/reports/quick-pay`                 | Quick pay utilization report  |
| GET                         | `/api/factoring/reports/fees`                      | Fees collected report         |
| GET                         | `/api/factoring/reports/factoring-volume`          | Factoring volume report       |

---

## Events

### Published Events

| Event                           | Trigger                      | Payload                      |
| ------------------------------- | ---------------------------- | ---------------------------- |
| `factoring.company.added`       | Factoring company added      | companyId, name              |
| `factoring.carrier.setup`       | Carrier factoring configured | carrierId, factorId          |
| `factoring.noa.received`        | NOA document uploaded        | carrierId, factorId          |
| `factoring.quick_pay.requested` | Quick pay requested          | requestId, carrierId, amount |
| `factoring.quick_pay.approved`  | Quick pay approved           | requestId, netAmount         |
| `factoring.quick_pay.rejected`  | Quick pay rejected           | requestId, reason            |
| `factoring.quick_pay.paid`      | Quick pay processed          | requestId, amount            |
| `factoring.funding.requested`   | Funding request created      | requestId, carrierId         |
| `factoring.funding.verified`    | Load verified for funding    | requestId                    |
| `factoring.funding.sent`        | Documents sent to factor     | requestId, factorId          |
| `factoring.funding.funded`      | Factor funded the load       | requestId, amount            |
| `factoring.payment.routed`      | Payment routed to factor     | carrierId, factorId, amount  |
| `factoring.reserve.updated`     | Reserve balance changed      | carrierId, balance           |

### Subscribed Events

| Event                  | Source     | Action                         |
| ---------------------- | ---------- | ------------------------------ |
| `load.delivered`       | TMS        | Check quick pay eligibility    |
| `carrier.pay.created`  | Accounting | Check for factoring routing    |
| `carrier.pay.approved` | Accounting | Process quick pay if requested |
| `document.uploaded`    | Documents  | Check if NOA                   |
| `carrier.created`      | Carrier    | Set default factoring prefs    |

---

## Business Rules

### Quick Pay Eligibility

1. Carrier must opt-in to quick pay program
2. Load must have POD on file (if required)
3. Invoice amount within program limits
4. Carrier in good standing (no holds)
5. New carriers may have waiting period

### Quick Pay Fee Calculation

1. Calculate days early: standard_pay_date - quick_pay_date
2. Apply fee structure:
   - Percentage: gross_amount Ã— fee_percentage
   - Flat: fixed fee
   - Tiered: rate based on days early
3. Apply minimum/maximum fee caps
4. Net amount = gross - fee

### Factoring Integration

1. Verify NOA on file before routing payments
2. Verify NOA not expired
3. Log all verification calls
4. Send required documents to factoring company
5. Route payment per carrier preference

### Verification Process

1. Factor calls to verify load details
2. Log caller information and verification result
3. Verify: pickup, delivery, amount, carrier assigned
4. Update funding request status
5. Send documents only after verification

### Payment Routing

1. Check carrier factoring setup
2. If NOA active and route_all_payments, route to factor
3. If specific loads factored, route those only
4. Create payment routing record
5. Update carrier payable with routing info
6. Send remittance to factoring company

### Reserve Management

1. Hold reserve percentage on funded loads
2. Track reserve balance by carrier
3. Release reserve after customer payment
4. Deduct from reserve for chargebacks
5. Report reserve balance to carriers

---

## Screens

| Screen                   | Description                       |
| ------------------------ | --------------------------------- |
| Quick Pay Dashboard      | Overview of quick pay activity    |
| Quick Pay Request        | Request quick pay for loads       |
| Quick Pay Approval       | Review pending quick pay requests |
| Quick Pay History        | View quick pay history            |
| Factoring Companies      | Manage factoring company records  |
| Factoring Company Detail | View/edit factoring company       |
| Carrier Factoring Setup  | Configure carrier factoring       |
| NOA Upload               | Upload NOA document               |
| Funding Request List     | View funding requests             |
| Funding Request Detail   | View/manage funding request       |
| Verification Log         | View verification call history    |
| Log Verification         | Log new verification call         |
| Payment Routing Queue    | View pending payment routing      |
| Debtor List              | View/manage debtors               |
| Reserve Balance          | View carrier reserve              |
| Reserve History          | View reserve transactions         |
| Factoring Reports        | Factoring activity reports        |

---

## Configuration

### Environment Variables

```env
# Triumph Factoring API
TRIUMPH_API_URL=https://api.triumph.com
TRIUMPH_API_KEY=your_key
TRIUMPH_CLIENT_ID=your_client

# RTS Factoring API
RTS_API_URL=https://api.rtsinc.com
RTS_API_KEY=your_key

# OTR Solutions API
OTR_API_URL=https://api.otrsolutions.com
OTR_API_KEY=your_key

# Quick Pay Settings
QUICK_PAY_DEFAULT_DAYS=3
QUICK_PAY_DEFAULT_FEE_PCT=2.5
QUICK_PAY_MIN_FEE=5.00
```

### Default Settings

```json
{
  "factoring": {
    "quickPay": {
      "enabled": true,
      "defaultDays": 3,
      "standardPaymentDays": 30,
      "defaultFeePercentage": 2.5,
      "minimumFee": 5.0,
      "requirePod": true,
      "autoApprove": false,
      "autoApproveThreshold": 5000,
      "newCarrierWaitDays": 30
    },
    "factoring": {
      "verificationRequired": true,
      "noaRequired": true,
      "reservePercentage": 5,
      "autoRoutePayments": false
    },
    "notifications": {
      "notifyOnQuickPayRequest": true,
      "notifyOnVerificationNeeded": true,
      "notifyOnFunded": true
    }
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Quick pay fee calculation
- [ ] Tiered fee structure
- [ ] Eligibility checking
- [ ] NOA validation
- [ ] Reserve calculations
- [ ] Payment routing logic

### Integration Tests

- [ ] Quick pay request workflow
- [ ] Factoring company API integration
- [ ] Document send to factor
- [ ] Payment routing process
- [ ] Reserve hold and release

### E2E Tests

- [ ] Complete quick pay flow
- [ ] Factoring funding request to funded
- [ ] Verification call logging
- [ ] Payment split between carrier and factor
- [ ] Reserve management cycle

---

## Navigation

- **Previous:** [30 - Fuel Cards](../30-fuel-cards/README.md)
- **Next:** [32 - Load Board](../32-load-board/README.md)
- **Index:** [All Services](../README.md)
