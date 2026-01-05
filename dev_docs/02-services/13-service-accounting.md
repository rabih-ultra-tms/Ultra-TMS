# Accounting Service

## Overview

| Attribute             | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| **Service ID**        | 06                                                     |
| **Category**          | Core Services                                          |
| **Phase**             | A (Internal MVP)                                       |
| **Development Weeks** | 41-50                                                  |
| **Priority**          | P0 - Critical                                          |
| **Dependencies**      | Auth/Admin (01), CRM (02), TMS Core (04), Carrier (05) |

## Purpose

The Accounting Service manages all financial operations including customer invoicing, carrier settlements, accounts receivable, accounts payable, general ledger integration, and financial reporting. It supports QuickBooks integration for Phase A with plans for multi-accounting system support.

## Features

### Customer Invoicing (AR)

- Automated invoice generation from delivered loads
- Batch invoicing by customer/period
- Invoice consolidation options
- Credit/debit memo support
- Aging reports and collections tracking
- Payment application and reconciliation

### Carrier Settlements (AP)

- Settlement generation from POD-confirmed loads
- Quick pay processing (2% fee standard)
- Standard payment terms (NET30)
- Deduction management (advances, chargebacks)
- Factoring company payments
- 1099 preparation support

### Payment Processing

- Customer payment recording
- Multiple payment methods (check, ACH, wire, credit card)
- Payment remittance matching
- Over/under payment handling
- Unapplied payment management

### General Ledger

- Chart of accounts management
- Journal entry creation
- QuickBooks sync
- Revenue recognition
- Cost tracking by load/customer/carrier

### Financial Reporting

- Profit & loss by load/customer/lane
- Aging reports (AR/AP)
- Cash flow projections
- Revenue reports
- Commission calculations
- Margin analysis

## Database Schema

```sql
-- Chart of Accounts
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    quickbooks_id VARCHAR(50),

    -- Account details
    account_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    account_subtype VARCHAR(50),
    -- BANK, AR, AP, REVENUE, COGS, EXPENSE, etc.

    description TEXT,

    -- Hierarchy
    parent_account_id UUID REFERENCES chart_of_accounts(id),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system_account BOOLEAN DEFAULT false,

    -- Balance (denormalized)
    current_balance DECIMAL(14,2) DEFAULT 0,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, account_number)
);

CREATE INDEX idx_coa_tenant ON chart_of_accounts(tenant_id);
CREATE INDEX idx_coa_type ON chart_of_accounts(tenant_id, account_type);

-- Invoices (Customer)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    quickbooks_id VARCHAR(50),

    -- Identification
    invoice_number VARCHAR(50) NOT NULL,

    -- Customer
    company_id UUID NOT NULL REFERENCES companies(id),
    billing_contact_id UUID REFERENCES contacts(id),

    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,

    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT',
    -- DRAFT, PENDING, SENT, PARTIAL, PAID, OVERDUE, VOID, DISPUTED

    -- Billing address
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(50),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(3),

    -- References
    po_number VARCHAR(100),
    reference_number VARCHAR(100),

    -- Terms
    payment_terms VARCHAR(50),

    -- Notes
    notes TEXT,
    internal_notes TEXT,

    -- Aging
    days_outstanding INTEGER,
    aging_bucket VARCHAR(20), -- CURRENT, 1-30, 31-60, 61-90, 90+

    -- Collection
    last_reminder_date DATE,
    reminder_count INTEGER DEFAULT 0,
    collection_status VARCHAR(50),

    -- GL
    revenue_account_id UUID REFERENCES chart_of_accounts(id),
    ar_account_id UUID REFERENCES chart_of_accounts(id),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    voided_at TIMESTAMP WITH TIME ZONE,
    voided_by UUID REFERENCES users(id),
    void_reason TEXT,

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',

    UNIQUE(tenant_id, invoice_number)
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(tenant_id, status);
CREATE INDEX idx_invoices_due ON invoices(tenant_id, due_date);
CREATE INDEX idx_invoices_date ON invoices(tenant_id, invoice_date);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Reference
    load_id UUID REFERENCES loads(id),
    order_id UUID REFERENCES orders(id),

    -- Line details
    line_number INTEGER NOT NULL,
    description VARCHAR(500) NOT NULL,
    item_type VARCHAR(50), -- FREIGHT, ACCESSORIAL, ADJUSTMENT

    -- Amounts
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,

    -- GL
    revenue_account_id UUID REFERENCES chart_of_accounts(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(invoice_id, line_number)
);

CREATE INDEX idx_invoice_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_items_load ON invoice_line_items(load_id);

-- Carrier Settlements (Bills/AP)
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    quickbooks_id VARCHAR(50),

    -- Identification
    settlement_number VARCHAR(50) NOT NULL,

    -- Carrier
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Dates
    settlement_date DATE NOT NULL,
    due_date DATE NOT NULL,

    -- Payment method
    payment_type VARCHAR(50), -- QUICK_PAY, NET30, FACTORING
    quick_pay_fee_percent DECIMAL(5,2),
    quick_pay_fee_amount DECIMAL(12,2),

    -- Amounts
    gross_amount DECIMAL(12,2) NOT NULL,
    deductions_total DECIMAL(12,2) DEFAULT 0,
    quick_pay_fee DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT',
    -- DRAFT, PENDING, APPROVED, PARTIAL, PAID, VOID

    -- Payment destination
    payment_method VARCHAR(50), -- CHECK, ACH, WIRE
    pay_to_name VARCHAR(255),
    pay_to_factoring BOOLEAN DEFAULT false,
    factoring_company_id UUID,
    factoring_account VARCHAR(100),

    -- GL
    expense_account_id UUID REFERENCES chart_of_accounts(id),
    ap_account_id UUID REFERENCES chart_of_accounts(id),

    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Notes
    notes TEXT,
    internal_notes TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',

    UNIQUE(tenant_id, settlement_number)
);

CREATE INDEX idx_settlements_tenant ON settlements(tenant_id);
CREATE INDEX idx_settlements_carrier ON settlements(carrier_id);
CREATE INDEX idx_settlements_status ON settlements(tenant_id, status);
CREATE INDEX idx_settlements_due ON settlements(tenant_id, due_date);

-- Settlement Line Items
CREATE TABLE settlement_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,

    -- Reference
    load_id UUID REFERENCES loads(id),

    -- Line details
    line_number INTEGER NOT NULL,
    description VARCHAR(500) NOT NULL,
    item_type VARCHAR(50), -- FREIGHT, ACCESSORIAL, DEDUCTION, ADVANCE

    -- Amounts
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_rate DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,

    -- GL
    expense_account_id UUID REFERENCES chart_of_accounts(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(settlement_id, line_number)
);

CREATE INDEX idx_settlement_items_settlement ON settlement_line_items(settlement_id);
CREATE INDEX idx_settlement_items_load ON settlement_line_items(load_id);

-- Payments Received (Customer)
CREATE TABLE payments_received (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    quickbooks_id VARCHAR(50),

    -- Identification
    payment_number VARCHAR(50) NOT NULL,

    -- Customer
    company_id UUID NOT NULL REFERENCES companies(id),

    -- Payment details
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CHECK, ACH, WIRE, CREDIT_CARD, CASH

    -- Amount
    amount DECIMAL(12,2) NOT NULL,
    unapplied_amount DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Reference
    reference_number VARCHAR(100), -- Check number, confirmation, etc.

    -- Bank
    bank_account_id UUID REFERENCES chart_of_accounts(id),
    deposit_date DATE,

    -- Status
    status VARCHAR(50) DEFAULT 'RECEIVED',
    -- RECEIVED, APPLIED, PARTIAL, BOUNCED, REFUNDED

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, payment_number)
);

CREATE INDEX idx_payments_received_tenant ON payments_received(tenant_id);
CREATE INDEX idx_payments_received_company ON payments_received(company_id);
CREATE INDEX idx_payments_received_date ON payments_received(tenant_id, payment_date);

-- Payment Applications
CREATE TABLE payment_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments_received(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),

    amount DECIMAL(12,2) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_payment_apps_payment ON payment_applications(payment_id);
CREATE INDEX idx_payment_apps_invoice ON payment_applications(invoice_id);

-- Payments Made (Carrier)
CREATE TABLE payments_made (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    quickbooks_id VARCHAR(50),

    -- Identification
    payment_number VARCHAR(50) NOT NULL,

    -- Carrier
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Payment details
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CHECK, ACH, WIRE

    -- Amount
    amount DECIMAL(12,2) NOT NULL,

    -- Reference
    reference_number VARCHAR(100),

    -- Bank
    bank_account_id UUID REFERENCES chart_of_accounts(id),

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, SENT, CLEARED, VOID

    -- ACH/Wire details
    ach_batch_id VARCHAR(100),
    ach_trace_number VARCHAR(100),

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, payment_number)
);

CREATE INDEX idx_payments_made_tenant ON payments_made(tenant_id);
CREATE INDEX idx_payments_made_carrier ON payments_made(carrier_id);
CREATE INDEX idx_payments_made_date ON payments_made(tenant_id, payment_date);

-- Journal Entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    quickbooks_id VARCHAR(50),

    -- Identification
    entry_number VARCHAR(50) NOT NULL,

    -- Details
    entry_date DATE NOT NULL,
    description TEXT,

    -- Reference
    reference_type VARCHAR(50), -- INVOICE, SETTLEMENT, PAYMENT, MANUAL
    reference_id UUID,

    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, POSTED, VOID

    -- Amounts (must balance)
    total_debit DECIMAL(14,2) NOT NULL,
    total_credit DECIMAL(14,2) NOT NULL,

    -- Posting
    posted_by UUID REFERENCES users(id),
    posted_at TIMESTAMP WITH TIME ZONE,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, entry_number)
);

CREATE INDEX idx_journal_entries_tenant ON journal_entries(tenant_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(tenant_id, entry_date);
CREATE INDEX idx_journal_entries_ref ON journal_entries(reference_type, reference_id);

-- Journal Entry Lines
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,

    line_number INTEGER NOT NULL,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),

    description VARCHAR(255),

    debit_amount DECIMAL(14,2) DEFAULT 0,
    credit_amount DECIMAL(14,2) DEFAULT 0,

    -- Dimensions (for reporting)
    customer_id UUID REFERENCES companies(id),
    carrier_id UUID REFERENCES carriers(id),
    load_id UUID REFERENCES loads(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(journal_entry_id, line_number)
);

CREATE INDEX idx_je_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_je_lines_account ON journal_entry_lines(account_id);

-- QuickBooks Sync Log
CREATE TABLE quickbooks_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    quickbooks_id VARCHAR(50),

    sync_direction VARCHAR(20) NOT NULL, -- TO_QB, FROM_QB
    sync_status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, PENDING

    payload_sent JSONB,
    payload_received JSONB,
    error_message TEXT,

    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_qb_sync_tenant ON quickbooks_sync_log(tenant_id);
CREATE INDEX idx_qb_sync_entity ON quickbooks_sync_log(entity_type, entity_id);
```

## API Endpoints

### Invoices

| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| GET    | `/api/v1/invoices`            | List invoices            |
| POST   | `/api/v1/invoices`            | Create invoice           |
| GET    | `/api/v1/invoices/:id`        | Get invoice              |
| PUT    | `/api/v1/invoices/:id`        | Update invoice           |
| DELETE | `/api/v1/invoices/:id`        | Void invoice             |
| POST   | `/api/v1/invoices/:id/send`   | Send to customer         |
| POST   | `/api/v1/invoices/:id/remind` | Send reminder            |
| GET    | `/api/v1/invoices/:id/pdf`    | Generate PDF             |
| POST   | `/api/v1/invoices/generate`   | Auto-generate from loads |
| POST   | `/api/v1/invoices/batch`      | Create batch invoice     |
| GET    | `/api/v1/invoices/aging`      | Aging report             |

### Settlements

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/v1/settlements`             | List settlements         |
| POST   | `/api/v1/settlements`             | Create settlement        |
| GET    | `/api/v1/settlements/:id`         | Get settlement           |
| PUT    | `/api/v1/settlements/:id`         | Update settlement        |
| PATCH  | `/api/v1/settlements/:id/approve` | Approve for payment      |
| DELETE | `/api/v1/settlements/:id`         | Void settlement          |
| POST   | `/api/v1/settlements/generate`    | Auto-generate from loads |
| POST   | `/api/v1/settlements/quick-pay`   | Process quick pay        |
| GET    | `/api/v1/settlements/:id/pdf`     | Generate PDF             |

### Payments

| Method | Endpoint                              | Description            |
| ------ | ------------------------------------- | ---------------------- |
| GET    | `/api/v1/payments/received`           | List received payments |
| POST   | `/api/v1/payments/received`           | Record payment         |
| GET    | `/api/v1/payments/received/:id`       | Get payment            |
| POST   | `/api/v1/payments/received/:id/apply` | Apply to invoices      |
| GET    | `/api/v1/payments/made`               | List made payments     |
| POST   | `/api/v1/payments/made`               | Create payment         |
| POST   | `/api/v1/payments/made/batch`         | Batch payment run      |
| PATCH  | `/api/v1/payments/made/:id/void`      | Void payment           |

### General Ledger

| Method | Endpoint                              | Description      |
| ------ | ------------------------------------- | ---------------- |
| GET    | `/api/v1/gl/accounts`                 | List accounts    |
| POST   | `/api/v1/gl/accounts`                 | Create account   |
| PUT    | `/api/v1/gl/accounts/:id`             | Update account   |
| GET    | `/api/v1/gl/journal-entries`          | List entries     |
| POST   | `/api/v1/gl/journal-entries`          | Create entry     |
| PATCH  | `/api/v1/gl/journal-entries/:id/post` | Post entry       |
| GET    | `/api/v1/gl/trial-balance`            | Trial balance    |
| GET    | `/api/v1/gl/account-activity`         | Account activity |

### Reports

| Method | Endpoint                                 | Description        |
| ------ | ---------------------------------------- | ------------------ |
| GET    | `/api/v1/reports/ar-aging`               | AR aging report    |
| GET    | `/api/v1/reports/ap-aging`               | AP aging report    |
| GET    | `/api/v1/reports/profit-loss`            | P&L report         |
| GET    | `/api/v1/reports/load-profitability`     | Load profit report |
| GET    | `/api/v1/reports/customer-profitability` | Customer profit    |
| GET    | `/api/v1/reports/revenue`                | Revenue report     |
| GET    | `/api/v1/reports/commissions`            | Commission report  |

### QuickBooks

| Method | Endpoint                           | Description    |
| ------ | ---------------------------------- | -------------- |
| GET    | `/api/v1/quickbooks/auth`          | Start OAuth    |
| GET    | `/api/v1/quickbooks/callback`      | OAuth callback |
| POST   | `/api/v1/quickbooks/sync/invoices` | Sync invoices  |
| POST   | `/api/v1/quickbooks/sync/bills`    | Sync bills     |
| POST   | `/api/v1/quickbooks/sync/payments` | Sync payments  |
| GET    | `/api/v1/quickbooks/status`        | Sync status    |

## Events

### Published Events

| Event                 | Trigger            | Payload              |
| --------------------- | ------------------ | -------------------- |
| `invoice.created`     | New invoice        | Invoice data         |
| `invoice.sent`        | Sent to customer   | Invoice + recipient  |
| `invoice.paid`        | Fully paid         | Invoice data         |
| `invoice.overdue`     | Past due date      | Invoice data         |
| `invoice.voided`      | Invoice voided     | Invoice + reason     |
| `settlement.created`  | New settlement     | Settlement data      |
| `settlement.approved` | Ready for payment  | Settlement data      |
| `settlement.paid`     | Payment sent       | Settlement + payment |
| `payment.received`    | Customer payment   | Payment data         |
| `payment.applied`     | Applied to invoice | Payment + invoices   |
| `payment.made`        | Carrier payment    | Payment data         |
| `payment.cleared`     | Payment cleared    | Payment data         |
| `quickbooks.synced`   | QB sync complete   | Sync results         |

### Subscribed Events

| Event                       | Source         | Action                      |
| --------------------------- | -------------- | --------------------------- |
| `load.delivered`            | TMS Core       | Generate invoice/settlement |
| `load.pod_received`         | TMS Core       | Mark ready for billing      |
| `carrier.quick_pay_request` | Carrier Portal | Process quick pay           |

## Business Rules

### Invoice Generation

1. Invoice only delivered loads with POD
2. Invoice number format: `INV-{YYYYMM}-{sequence}`
3. Default due date: Invoice date + payment terms days
4. Cannot invoice same load twice
5. Multi-load invoices allowed per customer

### Settlement Processing

1. Settlement only POD-confirmed loads
2. Settlement number format: `SET-{YYYYMM}-{sequence}`
3. Quick pay: 2% fee, payment within 2 business days
4. NET30: No fee, payment in 30 days
5. Factoring: Pay to factoring company if configured
6. Cannot settle same load twice

### Payment Application

1. Apply to oldest invoices first (FIFO)
2. Partial payments allowed
3. Overpayments create credit memos
4. Underpayments leave balance due
5. Bounced checks reverse application

### Aging Buckets

- Current: 0 days
- 1-30 days
- 31-60 days
- 61-90 days
- 90+ days

### QuickBooks Sync

1. Sync invoices when sent
2. Sync bills when approved
3. Sync payments when applied
4. Conflict: QuickBooks wins for payments
5. Retry failed syncs 3x

## Screens

| Screen              | Description            | Features                     |
| ------------------- | ---------------------- | ---------------------------- |
| Invoice List        | Browse invoices        | Status filters, aging view   |
| Invoice Detail      | View/edit invoice      | Line items, payments         |
| Invoice Generator   | Batch creation         | Date range, customer filter  |
| Settlement List     | Browse settlements     | Status, payment type filters |
| Settlement Detail   | View/edit settlement   | Deductions, approval         |
| Payment Entry       | Record payment         | Multi-invoice application    |
| Payment Run         | Batch carrier payments | ACH/check selection          |
| AR Dashboard        | Receivables overview   | Aging chart, collections     |
| AP Dashboard        | Payables overview      | Due today, cash needs        |
| GL Accounts         | Chart of accounts      | Hierarchy view               |
| Journal Entry       | Create/view entries    | Balanced validation          |
| QuickBooks Settings | Integration config     | Sync settings, mapping       |

## Configuration

### Environment Variables

```bash
# QuickBooks Integration
QB_CLIENT_ID=your_client_id
QB_CLIENT_SECRET=your_client_secret
QB_REDIRECT_URI=https://app.example.com/quickbooks/callback
QB_ENVIRONMENT=sandbox  # or production

# Payment Settings
DEFAULT_PAYMENT_TERMS=NET30
QUICK_PAY_FEE_PERCENT=2.0
QUICK_PAY_DAYS=2

# Aging
OVERDUE_REMINDER_DAYS=7,14,30
COLLECTIONS_THRESHOLD_DAYS=90
```

### Default Chart of Accounts

```json
[
  { "number": "1000", "name": "Cash", "type": "ASSET", "subtype": "BANK" },
  {
    "number": "1100",
    "name": "Accounts Receivable",
    "type": "ASSET",
    "subtype": "AR"
  },
  {
    "number": "2000",
    "name": "Accounts Payable",
    "type": "LIABILITY",
    "subtype": "AP"
  },
  { "number": "4000", "name": "Freight Revenue", "type": "REVENUE" },
  { "number": "4100", "name": "Accessorial Revenue", "type": "REVENUE" },
  {
    "number": "5000",
    "name": "Carrier Cost",
    "type": "EXPENSE",
    "subtype": "COGS"
  },
  {
    "number": "5100",
    "name": "Accessorial Cost",
    "type": "EXPENSE",
    "subtype": "COGS"
  },
  { "number": "6000", "name": "Operating Expenses", "type": "EXPENSE" }
]
```

## Testing Checklist

### Unit Tests

- [ ] Invoice CRUD and validation
- [ ] Settlement CRUD and validation
- [ ] Payment application logic
- [ ] Aging calculation
- [ ] Journal entry balancing
- [ ] Quick pay fee calculation

### Integration Tests

- [ ] Invoice from load generation
- [ ] Settlement from load generation
- [ ] Payment to invoice application
- [ ] QuickBooks sync operations
- [ ] Event publishing

### E2E Tests

- [ ] Full invoice lifecycle
- [ ] Full settlement lifecycle
- [ ] Payment entry and application
- [ ] Batch payment run
- [ ] QuickBooks OAuth and sync

---

**Navigation:** [â† Carrier](../05-carrier/README.md) | [Services Index](../README.md) | [Load Board â†’](../06-load-board/README.md)
