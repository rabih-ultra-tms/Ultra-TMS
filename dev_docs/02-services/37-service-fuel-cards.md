# 30 - Fuel Cards Service

| Field            | Value                               |
| ---------------- | ----------------------------------- |
| **Service ID**   | 30                                  |
| **Service Name** | Fuel Cards                          |
| **Category**     | Extended                            |
| **Module Path**  | `@modules/fuel-cards`               |
| **Phase**        | C (SaaS)                            |
| **Weeks**        | 105-108                             |
| **Priority**     | P2                                  |
| **Dependencies** | Auth, Carrier, Accounting, TMS Core |

---

## Purpose

Fuel card integration service for importing and managing fuel transactions from major fuel card providers (Comdata, EFS, WEX, FleetOne). Enables fuel advance programs, transaction verification, fuel surcharge calculations, and carrier settlement deductions for fleet operations and owner-operators.

---

## Features

- **Multi-Provider Support** - Comdata, EFS, WEX, FleetOne integration
- **Transaction Import** - Automated fuel transaction download
- **Fuel Advances** - Pre-fund fuel purchases against load settlements
- **Transaction Verification** - Match fuel to loads by location/time
- **Fraud Detection** - Flag suspicious transactions
- **Fuel Surcharge** - Calculate and apply fuel surcharges
- **DOE Fuel Index** - Track Department of Energy fuel prices
- **Carrier Deductions** - Deduct fuel from settlements
- **Card Management** - Issue and manage fuel cards
- **Spending Limits** - Set transaction and daily limits
- **Reporting** - Fuel usage, cost per mile, fraud reports
- **Reconciliation** - Match transactions to payments

---

## Database Schema

```sql
-- Fuel Card Providers
CREATE TABLE fuel_card_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Provider Information
    provider_code VARCHAR(20) NOT NULL UNIQUE,      -- COMDATA, EFS, WEX, FLEETONE
    provider_name VARCHAR(100) NOT NULL,

    -- API Configuration
    api_base_url VARCHAR(500),
    api_version VARCHAR(20),

    -- Authentication
    auth_type VARCHAR(20) NOT NULL,                 -- API_KEY, OAUTH, BASIC

    -- Features
    supports_fuel_advance BOOLEAN DEFAULT true,
    supports_money_codes BOOLEAN DEFAULT true,
    supports_card_management BOOLEAN DEFAULT false,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Provider Accounts
CREATE TABLE fuel_card_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider_id UUID NOT NULL REFERENCES fuel_card_providers(id),

    -- Account Information
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(200),

    -- Authentication (encrypted)
    credentials JSONB NOT NULL,                     -- Provider-specific auth credentials

    -- Settings
    auto_import_enabled BOOLEAN DEFAULT true,
    import_frequency_minutes INTEGER DEFAULT 60,
    last_import_at TIMESTAMPTZ,
    next_import_at TIMESTAMPTZ,

    -- Defaults
    default_advance_percentage DECIMAL(5,2) DEFAULT 50.00,
    default_transaction_limit DECIMAL(10,2) DEFAULT 500.00,
    default_daily_limit DECIMAL(10,2) DEFAULT 1000.00,

    -- Fees
    transaction_fee DECIMAL(5,2) DEFAULT 0.00,
    advance_fee_percentage DECIMAL(5,2) DEFAULT 3.00,
    advance_fee_minimum DECIMAL(10,2) DEFAULT 5.00,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',            -- ACTIVE, SUSPENDED, CLOSED
    connection_status VARCHAR(20) DEFAULT 'UNKNOWN', -- CONNECTED, ERROR, UNKNOWN
    last_connection_error TEXT,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, provider_id, account_number)
);

CREATE INDEX idx_fuel_accounts_tenant ON fuel_card_accounts(tenant_id);
CREATE INDEX idx_fuel_accounts_provider ON fuel_card_accounts(provider_id);

-- Fuel Cards
CREATE TABLE fuel_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    account_id UUID NOT NULL REFERENCES fuel_card_accounts(id),

    -- Card Information
    card_number VARCHAR(50) NOT NULL,               -- Last 4 or full (encrypted)
    card_number_masked VARCHAR(20) NOT NULL,        -- ****1234
    card_type VARCHAR(20) NOT NULL,                 -- FUEL_ONLY, FUEL_PLUS, UNIVERSAL

    -- Assignment
    carrier_id UUID REFERENCES carriers(id),
    driver_id UUID REFERENCES carrier_drivers(id),
    truck_number VARCHAR(50),

    -- Card Details
    issue_date DATE,
    expiration_date DATE,

    -- Limits
    transaction_limit DECIMAL(10,2),
    daily_limit DECIMAL(10,2),
    weekly_limit DECIMAL(10,2),
    monthly_limit DECIMAL(10,2),

    -- Restrictions
    fuel_only BOOLEAN DEFAULT true,
    allowed_product_codes VARCHAR(10)[],            -- Fuel product codes

    -- PIN (hashed)
    pin_hash VARCHAR(255),
    pin_set BOOLEAN DEFAULT false,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',            -- ACTIVE, SUSPENDED, BLOCKED, CANCELLED
    status_reason VARCHAR(200),

    -- Usage Tracking
    current_daily_usage DECIMAL(10,2) DEFAULT 0,
    current_weekly_usage DECIMAL(10,2) DEFAULT 0,
    current_monthly_usage DECIMAL(10,2) DEFAULT 0,
    last_usage_at TIMESTAMPTZ,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_fuel_cards_tenant ON fuel_cards(tenant_id);
CREATE INDEX idx_fuel_cards_account ON fuel_cards(account_id);
CREATE INDEX idx_fuel_cards_carrier ON fuel_cards(carrier_id);
CREATE INDEX idx_fuel_cards_driver ON fuel_cards(driver_id);
CREATE INDEX idx_fuel_cards_number ON fuel_cards(card_number);

-- Fuel Transactions
CREATE TABLE fuel_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    account_id UUID NOT NULL REFERENCES fuel_card_accounts(id),
    card_id UUID REFERENCES fuel_cards(id),

    -- Transaction Identification
    provider_transaction_id VARCHAR(100) NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,          -- FUEL, ADVANCE, FEE, REFUND, ADJUSTMENT

    -- Card Info (for unmatched cards)
    card_number_masked VARCHAR(20),

    -- Carrier/Driver
    carrier_id UUID REFERENCES carriers(id),
    driver_id UUID REFERENCES carrier_drivers(id),

    -- Load Match
    load_id UUID REFERENCES loads(id),
    match_status VARCHAR(20) DEFAULT 'UNMATCHED',   -- MATCHED, UNMATCHED, DISPUTED
    match_confidence DECIMAL(5,2),                  -- Confidence score 0-100
    matched_at TIMESTAMPTZ,
    matched_by UUID REFERENCES users(id),

    -- Transaction Details
    transaction_date DATE NOT NULL,
    transaction_time TIME,
    transaction_datetime TIMESTAMPTZ,

    -- Location
    merchant_name VARCHAR(200),
    merchant_city VARCHAR(100),
    merchant_state VARCHAR(2),
    merchant_zip VARCHAR(10),
    truck_stop_chain VARCHAR(50),                   -- PILOT, LOVES, TA, FLYING_J
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    -- Fuel Details
    product_code VARCHAR(10),
    product_description VARCHAR(100),
    fuel_type VARCHAR(20),                          -- DIESEL, DEF, UNLEADED
    quantity DECIMAL(10,3),                         -- Gallons
    unit_price DECIMAL(10,4),                       -- Price per gallon

    -- Amounts
    fuel_amount DECIMAL(10,2),
    non_fuel_amount DECIMAL(10,2) DEFAULT 0,
    taxes DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    fees DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Vehicle Info
    odometer_reading INTEGER,
    unit_number VARCHAR(50),
    trailer_number VARCHAR(50),

    -- Settlement
    settlement_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, INCLUDED, PAID
    settlement_id UUID,                             -- Reference to carrier pay
    deducted_amount DECIMAL(10,2),

    -- Authorization
    authorization_code VARCHAR(50),
    authorization_status VARCHAR(20),               -- APPROVED, DECLINED, VOIDED
    decline_reason VARCHAR(200),

    -- Flags
    is_suspicious BOOLEAN DEFAULT false,
    suspicious_reason VARCHAR(200),
    is_disputed BOOLEAN DEFAULT false,
    dispute_reason VARCHAR(200),

    -- Import Tracking
    imported_at TIMESTAMPTZ NOT NULL,
    import_batch_id UUID,
    raw_data JSONB,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fuel_transactions_tenant ON fuel_transactions(tenant_id);
CREATE INDEX idx_fuel_transactions_account ON fuel_transactions(account_id);
CREATE INDEX idx_fuel_transactions_card ON fuel_transactions(card_id);
CREATE INDEX idx_fuel_transactions_carrier ON fuel_transactions(carrier_id);
CREATE INDEX idx_fuel_transactions_load ON fuel_transactions(load_id);
CREATE INDEX idx_fuel_transactions_date ON fuel_transactions(transaction_date DESC);
CREATE INDEX idx_fuel_transactions_provider ON fuel_transactions(provider_transaction_id);
CREATE INDEX idx_fuel_transactions_settlement ON fuel_transactions(settlement_status);

-- Fuel Advances (Money Codes)
CREATE TABLE fuel_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    account_id UUID NOT NULL REFERENCES fuel_card_accounts(id),

    -- Advance Number
    advance_number VARCHAR(50) NOT NULL,

    -- Carrier/Driver
    carrier_id UUID NOT NULL REFERENCES carriers(id),
    driver_id UUID REFERENCES carrier_drivers(id),

    -- Related Load
    load_id UUID REFERENCES loads(id),

    -- Advance Details
    advance_type VARCHAR(20) NOT NULL,              -- LUMPER, FUEL, DETENTION, OTHER

    -- Money Code (for Comdata/EFS)
    money_code VARCHAR(20),
    money_code_expires_at TIMESTAMPTZ,
    money_code_status VARCHAR(20),                  -- ACTIVE, USED, EXPIRED, CANCELLED

    -- Amount
    requested_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    used_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2),

    -- Fees
    advance_fee DECIMAL(10,2) NOT NULL,
    total_deduction DECIMAL(10,2) NOT NULL,         -- approved_amount + advance_fee

    -- Approval
    approval_status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    rejection_reason VARCHAR(200),

    -- Settlement
    settlement_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, DEDUCTED, PAID
    settlement_id UUID,
    deducted_at TIMESTAMPTZ,

    -- Provider Response
    provider_reference VARCHAR(100),
    provider_status VARCHAR(50),
    provider_response JSONB,

    -- Notes
    purpose VARCHAR(200),
    notes TEXT,

    -- Requestor
    requested_by UUID REFERENCES users(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fuel_advances_tenant ON fuel_advances(tenant_id);
CREATE INDEX idx_fuel_advances_carrier ON fuel_advances(carrier_id);
CREATE INDEX idx_fuel_advances_load ON fuel_advances(load_id);
CREATE INDEX idx_fuel_advances_status ON fuel_advances(approval_status);
CREATE INDEX idx_fuel_advances_settlement ON fuel_advances(settlement_status);
CREATE INDEX idx_fuel_advances_code ON fuel_advances(money_code);

-- DOE Fuel Price Index
CREATE TABLE doe_fuel_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Date
    effective_date DATE NOT NULL,

    -- National Prices
    diesel_national DECIMAL(6,3),
    gasoline_national DECIMAL(6,3),

    -- Regional Prices (PADD regions)
    diesel_east_coast DECIMAL(6,3),
    diesel_midwest DECIMAL(6,3),
    diesel_gulf_coast DECIMAL(6,3),
    diesel_rocky_mountain DECIMAL(6,3),
    diesel_west_coast DECIMAL(6,3),
    diesel_california DECIMAL(6,3),

    -- Source
    source VARCHAR(30) DEFAULT 'DOE',
    raw_data JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(effective_date)
);

CREATE INDEX idx_doe_fuel_prices_date ON doe_fuel_prices(effective_date DESC);

-- Fuel Surcharge Tables
CREATE TABLE fuel_surcharge_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Table Info
    table_name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Configuration
    base_fuel_price DECIMAL(6,3) NOT NULL,          -- Base price threshold
    mpg_assumption DECIMAL(4,2) NOT NULL,           -- Miles per gallon
    surcharge_type VARCHAR(20) NOT NULL,            -- PER_MILE, PERCENTAGE, FLAT

    -- Source
    fuel_source VARCHAR(30) DEFAULT 'DOE_NATIONAL', -- DOE_NATIONAL, DOE_REGIONAL, CUSTOM
    region VARCHAR(30),                             -- For regional pricing

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

CREATE INDEX idx_fuel_surcharge_tables_tenant ON fuel_surcharge_tables(tenant_id);

-- Fuel Surcharge Brackets
CREATE TABLE fuel_surcharge_brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES fuel_surcharge_tables(id) ON DELETE CASCADE,

    -- Price Range
    price_from DECIMAL(6,3) NOT NULL,
    price_to DECIMAL(6,3),                          -- NULL = no upper limit

    -- Surcharge
    surcharge_rate DECIMAL(10,4) NOT NULL,          -- Rate based on surcharge_type

    -- Order
    sort_order INTEGER NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fuel_surcharge_brackets_table ON fuel_surcharge_brackets(table_id);

-- Transaction Import Batches
CREATE TABLE fuel_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    account_id UUID NOT NULL REFERENCES fuel_card_accounts(id),

    -- Import Details
    import_type VARCHAR(20) NOT NULL,               -- SCHEDULED, MANUAL, FILE
    import_source VARCHAR(30) NOT NULL,             -- API, SFTP, UPLOAD

    -- Date Range
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,

    -- Results
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, PROCESSING, COMPLETED, FAILED
    transactions_found INTEGER DEFAULT 0,
    transactions_imported INTEGER DEFAULT 0,
    transactions_skipped INTEGER DEFAULT 0,
    transactions_errored INTEGER DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Errors
    error_message TEXT,
    error_details JSONB,

    -- File (for uploads)
    file_name VARCHAR(200),
    file_path VARCHAR(500),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_fuel_import_batches_tenant ON fuel_import_batches(tenant_id);
CREATE INDEX idx_fuel_import_batches_account ON fuel_import_batches(account_id);
CREATE INDEX idx_fuel_import_batches_status ON fuel_import_batches(status);

-- Suspicious Transaction Rules
CREATE TABLE fuel_fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),          -- NULL = system-wide

    -- Rule Info
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(30) NOT NULL,                 -- LOCATION, AMOUNT, FREQUENCY, PATTERN
    description TEXT,

    -- Rule Configuration
    conditions JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL,                  -- WARNING, ALERT, BLOCK

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fuel Transaction Alerts
CREATE TABLE fuel_transaction_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    transaction_id UUID NOT NULL REFERENCES fuel_transactions(id),
    rule_id UUID REFERENCES fuel_fraud_rules(id),

    -- Alert Info
    alert_type VARCHAR(30) NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'OPEN',              -- OPEN, REVIEWED, DISMISSED, CONFIRMED

    -- Review
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fuel_alerts_transaction ON fuel_transaction_alerts(transaction_id);
CREATE INDEX idx_fuel_alerts_status ON fuel_transaction_alerts(status);
```

---

## API Endpoints

| Method                | Endpoint                              | Description             |
| --------------------- | ------------------------------------- | ----------------------- |
| **Provider Accounts** |
| GET                   | `/api/fuel/accounts`                  | List fuel card accounts |
| POST                  | `/api/fuel/accounts`                  | Add fuel card account   |
| GET                   | `/api/fuel/accounts/{id}`             | Get account details     |
| PUT                   | `/api/fuel/accounts/{id}`             | Update account          |
| DELETE                | `/api/fuel/accounts/{id}`             | Remove account          |
| POST                  | `/api/fuel/accounts/{id}/test`        | Test connection         |
| POST                  | `/api/fuel/accounts/{id}/sync`        | Sync transactions       |
| **Fuel Cards**        |
| GET                   | `/api/fuel/cards`                     | List fuel cards         |
| POST                  | `/api/fuel/cards`                     | Add fuel card           |
| GET                   | `/api/fuel/cards/{id}`                | Get card details        |
| PUT                   | `/api/fuel/cards/{id}`                | Update card             |
| POST                  | `/api/fuel/cards/{id}/suspend`        | Suspend card            |
| POST                  | `/api/fuel/cards/{id}/activate`       | Activate card           |
| POST                  | `/api/fuel/cards/{id}/limit`          | Update limits           |
| GET                   | `/api/fuel/cards/{id}/transactions`   | Get card transactions   |
| **Transactions**      |
| GET                   | `/api/fuel/transactions`              | List transactions       |
| GET                   | `/api/fuel/transactions/{id}`         | Get transaction details |
| POST                  | `/api/fuel/transactions/{id}/match`   | Match to load           |
| POST                  | `/api/fuel/transactions/{id}/dispute` | Dispute transaction     |
| POST                  | `/api/fuel/transactions/import`       | Manual import           |
| POST                  | `/api/fuel/transactions/upload`       | Upload file             |
| **Fuel Advances**     |
| GET                   | `/api/fuel/advances`                  | List advances           |
| POST                  | `/api/fuel/advances`                  | Request advance         |
| GET                   | `/api/fuel/advances/{id}`             | Get advance details     |
| POST                  | `/api/fuel/advances/{id}/approve`     | Approve advance         |
| POST                  | `/api/fuel/advances/{id}/reject`      | Reject advance          |
| POST                  | `/api/fuel/advances/{id}/cancel`      | Cancel advance          |
| GET                   | `/api/fuel/advances/{id}/money-code`  | Get money code          |
| **Fuel Prices**       |
| GET                   | `/api/fuel/prices/current`            | Get current DOE prices  |
| GET                   | `/api/fuel/prices/history`            | Get price history       |
| POST                  | `/api/fuel/prices/refresh`            | Refresh DOE prices      |
| **Fuel Surcharge**    |
| GET                   | `/api/fuel/surcharge/tables`          | List surcharge tables   |
| POST                  | `/api/fuel/surcharge/tables`          | Create surcharge table  |
| GET                   | `/api/fuel/surcharge/tables/{id}`     | Get table details       |
| PUT                   | `/api/fuel/surcharge/tables/{id}`     | Update table            |
| DELETE                | `/api/fuel/surcharge/tables/{id}`     | Delete table            |
| POST                  | `/api/fuel/surcharge/calculate`       | Calculate surcharge     |
| **Reports**           |
| GET                   | `/api/fuel/reports/usage`             | Fuel usage report       |
| GET                   | `/api/fuel/reports/cost-per-mile`     | Cost per mile report    |
| GET                   | `/api/fuel/reports/carrier-summary`   | Carrier fuel summary    |
| GET                   | `/api/fuel/reports/suspicious`        | Suspicious transactions |
| **Alerts**            |
| GET                   | `/api/fuel/alerts`                    | List alerts             |
| POST                  | `/api/fuel/alerts/{id}/review`        | Review alert            |
| POST                  | `/api/fuel/alerts/{id}/dismiss`       | Dismiss alert           |

---

## Events

### Published Events

| Event                         | Trigger                         | Payload                      |
| ----------------------------- | ------------------------------- | ---------------------------- |
| `fuel.account.connected`      | Account connected successfully  | accountId, provider          |
| `fuel.account.error`          | Account connection error        | accountId, error             |
| `fuel.transactions.imported`  | Transactions imported           | batchId, count               |
| `fuel.transaction.matched`    | Transaction matched to load     | transactionId, loadId        |
| `fuel.transaction.suspicious` | Suspicious transaction detected | transactionId, reason        |
| `fuel.advance.requested`      | Fuel advance requested          | advanceId, carrierId, amount |
| `fuel.advance.approved`       | Advance approved                | advanceId, code              |
| `fuel.advance.rejected`       | Advance rejected                | advanceId, reason            |
| `fuel.advance.used`           | Advance money code used         | advanceId, amount            |
| `fuel.card.suspended`         | Card suspended                  | cardId, reason               |
| `fuel.card.limit_exceeded`    | Card limit exceeded             | cardId, type                 |
| `fuel.prices.updated`         | DOE prices updated              | date, prices                 |
| `fuel.alert.created`          | Fraud alert created             | alertId, severity            |

### Subscribed Events

| Event                 | Source     | Action                     |
| --------------------- | ---------- | -------------------------- |
| `scheduler.hourly`    | Scheduler  | Sync transactions          |
| `scheduler.weekly`    | Scheduler  | Refresh DOE prices         |
| `load.delivered`      | TMS        | Match pending transactions |
| `carrier.pay.created` | Accounting | Include fuel deductions    |
| `carrier.suspended`   | Carrier    | Suspend cards              |

---

## Business Rules

### Transaction Import

1. Import transactions at least hourly during business hours
2. Deduplicate by provider_transaction_id
3. Auto-match cards to carriers by card assignment
4. Match transactions to loads by date and location proximity
5. Flag transactions outside normal patterns

### Fuel Advances

1. Calculate maximum advance as percentage of estimated linehaul
2. Deduct advance fee from approved amount or add to deduction
3. Generate money code with expiration (typically 24-72 hours)
4. Track money code usage from transaction imports
5. Include all advances in carrier settlement

### Card Management

1. Track usage against daily/weekly/monthly limits
2. Reset limit counters at appropriate intervals
3. Suspend cards when limits exceeded
4. Suspend carrier cards when carrier suspended
5. Block non-fuel purchases on fuel-only cards

### Fraud Detection Rules

1. **Location**: Flag if transaction location far from expected route
2. **Amount**: Flag if significantly above normal for carrier/driver
3. **Frequency**: Flag multiple transactions same location within hours
4. **Timing**: Flag transactions outside normal driving hours
5. **Quantity**: Flag if gallons exceed truck tank capacity
6. **Velocity**: Flag if impossible time between transactions

### Fuel Surcharge Calculation

1. Use DOE weekly fuel price (Monday effective)
2. Calculate: `(Current Price - Base Price) Ã— Miles Ã· MPG`
3. Apply bracket if using tiered approach
4. Round to 2 decimal places
5. Apply to linehaul revenue or as separate charge

### Settlement Deductions

1. Include all fuel transactions for load/period
2. Include advance fees
3. Calculate net after advance recovery
4. Apply to carrier payable

---

## Screens

| Screen               | Description                             |
| -------------------- | --------------------------------------- |
| Fuel Dashboard       | Overview of fuel activity and costs     |
| Account Management   | Manage fuel card provider accounts      |
| Card List            | List and manage fuel cards              |
| Card Detail          | View card details and limits            |
| Transaction List     | List all fuel transactions              |
| Transaction Detail   | View transaction details                |
| Transaction Match    | Match transactions to loads             |
| Advance Request      | Request new fuel advance                |
| Advance List         | List pending/approved advances          |
| Advance Approval     | Review and approve advances             |
| Money Code View      | Display money code for driver           |
| DOE Prices           | View current and historical fuel prices |
| Surcharge Tables     | Manage fuel surcharge tables            |
| Surcharge Calculator | Calculate fuel surcharge                |
| Fraud Alerts         | Review suspicious transactions          |
| Usage Report         | Fuel usage by carrier/driver            |
| Cost Analysis        | Fuel cost per mile analysis             |

---

## Configuration

### Environment Variables

```env
# Comdata
COMDATA_API_URL=https://api.comdata.com
COMDATA_CLIENT_ID=your_client_id
COMDATA_CLIENT_SECRET=your_secret

# EFS
EFS_API_URL=https://api.efsllc.com
EFS_ACCOUNT_CODE=your_account
EFS_API_KEY=your_key

# WEX
WEX_API_URL=https://api.wexinc.com
WEX_MERCHANT_ID=your_merchant_id
WEX_API_KEY=your_key

# DOE
DOE_FUEL_URL=https://www.eia.gov/petroleum/gasdiesel/
DOE_API_KEY=optional_key

# Settings
FUEL_IMPORT_INTERVAL_MINUTES=60
FUEL_ADVANCE_DEFAULT_PCT=50
FUEL_ADVANCE_FEE_PCT=3
FUEL_ADVANCE_CODE_EXPIRY_HOURS=72
```

### Default Settings

```json
{
  "fuelCards": {
    "import": {
      "intervalMinutes": 60,
      "businessHoursOnly": false,
      "lookbackDays": 7
    },
    "advances": {
      "defaultPercentage": 50,
      "maxPercentage": 100,
      "feePercentage": 3.0,
      "minimumFee": 5.0,
      "codeExpiryHours": 72
    },
    "cards": {
      "defaultTransactionLimit": 500,
      "defaultDailyLimit": 1000,
      "defaultWeeklyLimit": 5000,
      "defaultMonthlyLimit": 15000
    },
    "fraudDetection": {
      "locationRadiusMiles": 100,
      "timeWindowHours": 2,
      "maxGallons": 300,
      "velocityMph": 80
    },
    "surcharge": {
      "baseFuelPrice": 1.5,
      "mpgAssumption": 6.5,
      "source": "DOE_NATIONAL"
    }
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Fuel surcharge calculation
- [ ] Limit checking logic
- [ ] Fraud rule evaluation
- [ ] Transaction matching algorithm
- [ ] Advance fee calculation
- [ ] Money code generation

### Integration Tests

- [ ] Comdata API integration
- [ ] EFS API integration
- [ ] DOE fuel price fetch
- [ ] Transaction import flow
- [ ] Advance approval workflow
- [ ] Settlement deduction

### E2E Tests

- [ ] Complete import and match flow
- [ ] Advance request to usage
- [ ] Card suspend and reactivate
- [ ] Fraud detection and alert
- [ ] Surcharge apply to invoice

---

## Navigation

- **Previous:** [29 - Safety](../29-safety/README.md)
- **Next:** [31 - Factoring](../31-factoring/README.md)
- **Index:** [All Services](../README.md)
