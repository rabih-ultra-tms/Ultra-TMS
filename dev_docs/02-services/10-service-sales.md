# Sales Service

## Overview

| Attribute             | Value                                    |
| --------------------- | ---------------------------------------- |
| **Service ID**        | 03                                       |
| **Category**          | Core Services                            |
| **Phase**             | A (Internal MVP)                         |
| **Development Weeks** | 13-20                                    |
| **Priority**          | P0 - Critical                            |
| **Dependencies**      | Auth/Admin (01), CRM (02), TMS Core (04) |

## Purpose

The Sales Service manages the complete quote-to-order workflow including rate calculation, quote generation, customer pricing, contract management, and sales performance tracking. It integrates with rate intelligence services to provide competitive market-based pricing.

## Features

### Quote Management

- Quick quote generation (under 60 seconds)
- Multi-stop and multi-leg quotes
- Quote templates and favorites
- Quote versioning and history
- Quote expiration and follow-up
- Clone and modify quotes

### Rate Calculation

- Distance-based pricing
- Weight/commodity considerations
- Accessorial charges
- Fuel surcharge calculation
- Market rate integration (DAT, Truckstop)
- Customer-specific pricing rules

### Customer Pricing

- Contract rates and pricing agreements
- Lane-specific pricing
- Volume discounts
- Spot vs contract rate management
- Rate validity periods
- Minimum margins enforcement

### Sales Performance

- Quota tracking
- Win/loss analysis
- Revenue by sales rep
- Quote conversion metrics
- Customer acquisition tracking

## Database Schema

```sql
-- Quotes
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Identification
    quote_number VARCHAR(50) NOT NULL,
    version INTEGER DEFAULT 1,
    parent_quote_id UUID REFERENCES quotes(id),

    -- Customer
    company_id UUID REFERENCES companies(id),
    contact_id UUID REFERENCES contacts(id),
    customer_name VARCHAR(255), -- For quick quotes without customer
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    -- DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED, CONVERTED

    -- Service
    service_type VARCHAR(50) NOT NULL, -- FTL, LTL, PARTIAL, DRAYAGE
    equipment_type VARCHAR(50), -- DRY_VAN, REEFER, FLATBED, etc.

    -- Timing
    pickup_date DATE,
    pickup_window_start TIME,
    pickup_window_end TIME,
    delivery_date DATE,
    delivery_window_start TIME,
    delivery_window_end TIME,
    is_flexible_dates BOOLEAN DEFAULT false,

    -- Cargo
    commodity VARCHAR(255),
    weight_lbs DECIMAL(10,2),
    pieces INTEGER,
    pallets INTEGER,
    dimensions JSONB, -- {length, width, height, unit}
    is_hazmat BOOLEAN DEFAULT false,
    hazmat_class VARCHAR(20),
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),

    -- Pricing
    total_miles DECIMAL(10,2),
    linehaul_rate DECIMAL(12,2),
    fuel_surcharge DECIMAL(12,2),
    accessorials_total DECIMAL(12,2),
    total_amount DECIMAL(12,2) NOT NULL,
    margin_amount DECIMAL(12,2),
    margin_percent DECIMAL(5,2),
    currency VARCHAR(3) DEFAULT 'USD',

    -- Rate source
    rate_source VARCHAR(50), -- MANUAL, CONTRACT, MARKET, CALCULATED
    market_rate_low DECIMAL(12,2),
    market_rate_avg DECIMAL(12,2),
    market_rate_high DECIMAL(12,2),

    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,

    -- Conversion
    converted_order_id UUID,
    converted_at TIMESTAMP WITH TIME ZONE,

    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,

    -- Notes
    internal_notes TEXT,
    customer_notes TEXT,
    special_instructions TEXT,

    -- Assignment
    sales_rep_id UUID REFERENCES users(id),

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    tags VARCHAR(100)[],

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, quote_number, version)
);

CREATE INDEX idx_quotes_tenant ON quotes(tenant_id);
CREATE INDEX idx_quotes_number ON quotes(tenant_id, quote_number);
CREATE INDEX idx_quotes_company ON quotes(company_id);
CREATE INDEX idx_quotes_status ON quotes(tenant_id, status);
CREATE INDEX idx_quotes_sales_rep ON quotes(sales_rep_id);
CREATE INDEX idx_quotes_dates ON quotes(tenant_id, pickup_date);

-- Quote Stops
CREATE TABLE quote_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

    stop_sequence INTEGER NOT NULL,
    stop_type VARCHAR(20) NOT NULL, -- PICKUP, DELIVERY

    -- Location
    facility_name VARCHAR(255),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(3) DEFAULT 'USA',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    -- Contact
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),

    -- Timing
    appointment_required BOOLEAN DEFAULT false,
    earliest_time TIME,
    latest_time TIME,

    -- Instructions
    instructions TEXT,

    -- Calculated
    miles_to_next DECIMAL(10,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(quote_id, stop_sequence)
);

CREATE INDEX idx_quote_stops_quote ON quote_stops(quote_id);

-- Quote Accessorials
CREATE TABLE quote_accessorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

    accessorial_type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    is_billable BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_accessorials_quote ON quote_accessorials(quote_id);

-- Customer Rate Contracts
CREATE TABLE rate_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Identification
    contract_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,

    -- Customer
    company_id UUID NOT NULL REFERENCES companies(id),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE', -- DRAFT, ACTIVE, EXPIRED, TERMINATED

    -- Validity
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,

    -- Terms
    payment_terms VARCHAR(50),
    auto_renew BOOLEAN DEFAULT false,
    renewal_notice_days INTEGER DEFAULT 30,

    -- Defaults
    default_fuel_surcharge_type VARCHAR(50), -- DOE_NATIONAL, DOE_REGIONAL, CUSTOM
    default_fuel_surcharge_percent DECIMAL(5,2),
    minimum_margin_percent DECIMAL(5,2),

    -- Notes
    notes TEXT,

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, contract_number)
);

CREATE INDEX idx_rate_contracts_tenant ON rate_contracts(tenant_id);
CREATE INDEX idx_rate_contracts_company ON rate_contracts(company_id);
CREATE INDEX idx_rate_contracts_status ON rate_contracts(tenant_id, status);

-- Contract Lane Rates
CREATE TABLE contract_lane_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES rate_contracts(id) ON DELETE CASCADE,

    -- Lane definition
    origin_city VARCHAR(100),
    origin_state VARCHAR(50),
    origin_zip VARCHAR(20),
    origin_zone VARCHAR(50), -- For zone-based pricing
    origin_radius_miles INTEGER,

    destination_city VARCHAR(100),
    destination_state VARCHAR(50),
    destination_zip VARCHAR(20),
    destination_zone VARCHAR(50),
    destination_radius_miles INTEGER,

    -- Service
    service_type VARCHAR(50), -- FTL, LTL, PARTIAL
    equipment_type VARCHAR(50),

    -- Rate
    rate_type VARCHAR(50) NOT NULL, -- PER_MILE, FLAT, PER_CWT
    rate_amount DECIMAL(12,2) NOT NULL,
    minimum_charge DECIMAL(12,2),

    -- Fuel
    fuel_included BOOLEAN DEFAULT false,
    fuel_surcharge_type VARCHAR(50),
    fuel_surcharge_percent DECIMAL(5,2),

    -- Volume
    volume_min INTEGER, -- Minimum loads for this rate
    volume_max INTEGER,

    -- Validity
    effective_date DATE,
    expiration_date DATE,

    -- Notes
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contract_lanes_contract ON contract_lane_rates(contract_id);
CREATE INDEX idx_contract_lanes_origin ON contract_lane_rates(origin_state, origin_city);
CREATE INDEX idx_contract_lanes_dest ON contract_lane_rates(destination_state, destination_city);

-- Accessorial Rates
CREATE TABLE accessorial_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Can be tenant-wide or contract-specific
    contract_id UUID REFERENCES rate_contracts(id),

    accessorial_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Rate
    rate_type VARCHAR(50) NOT NULL, -- FLAT, PER_HOUR, PER_MILE, PERCENT
    rate_amount DECIMAL(10,2) NOT NULL,
    minimum_charge DECIMAL(10,2),
    maximum_charge DECIMAL(10,2),

    -- Applicability
    applies_to_service_types VARCHAR(50)[], -- FTL, LTL, etc.
    is_default BOOLEAN DEFAULT false,

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_accessorial_rates_tenant ON accessorial_rates(tenant_id);
CREATE INDEX idx_accessorial_rates_contract ON accessorial_rates(contract_id);
CREATE INDEX idx_accessorial_rates_type ON accessorial_rates(tenant_id, accessorial_type);

-- Sales Quotas
CREATE TABLE sales_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    period_type VARCHAR(20) NOT NULL, -- MONTHLY, QUARTERLY, ANNUAL
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Targets
    revenue_target DECIMAL(14,2),
    loads_target INTEGER,
    new_customers_target INTEGER,

    -- Actuals (denormalized for performance)
    revenue_actual DECIMAL(14,2) DEFAULT 0,
    loads_actual INTEGER DEFAULT 0,
    new_customers_actual INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id, period_start)
);

CREATE INDEX idx_sales_quotas_tenant ON sales_quotas(tenant_id);
CREATE INDEX idx_sales_quotas_user ON sales_quotas(user_id);
CREATE INDEX idx_sales_quotas_period ON sales_quotas(tenant_id, period_start, period_end);
```

## API Endpoints

### Quotes

| Method | Endpoint                         | Description                |
| ------ | -------------------------------- | -------------------------- |
| GET    | `/api/v1/quotes`                 | List quotes with filters   |
| POST   | `/api/v1/quotes`                 | Create quote               |
| GET    | `/api/v1/quotes/:id`             | Get quote details          |
| PUT    | `/api/v1/quotes/:id`             | Update quote               |
| DELETE | `/api/v1/quotes/:id`             | Delete quote               |
| POST   | `/api/v1/quotes/:id/duplicate`   | Clone quote                |
| POST   | `/api/v1/quotes/:id/new-version` | Create new version         |
| POST   | `/api/v1/quotes/:id/send`        | Send to customer           |
| POST   | `/api/v1/quotes/:id/convert`     | Convert to order           |
| GET    | `/api/v1/quotes/:id/pdf`         | Generate PDF               |
| POST   | `/api/v1/quotes/quick`           | Quick quote (minimal data) |
| POST   | `/api/v1/quotes/calculate-rate`  | Calculate rate only        |

### Rate Contracts

| Method | Endpoint                                   | Description          |
| ------ | ------------------------------------------ | -------------------- |
| GET    | `/api/v1/rate-contracts`                   | List contracts       |
| POST   | `/api/v1/rate-contracts`                   | Create contract      |
| GET    | `/api/v1/rate-contracts/:id`               | Get contract details |
| PUT    | `/api/v1/rate-contracts/:id`               | Update contract      |
| DELETE | `/api/v1/rate-contracts/:id`               | Delete contract      |
| GET    | `/api/v1/rate-contracts/:id/lanes`         | Get contract lanes   |
| POST   | `/api/v1/rate-contracts/:id/lanes`         | Add lane rate        |
| PUT    | `/api/v1/rate-contracts/:id/lanes/:laneId` | Update lane rate     |
| DELETE | `/api/v1/rate-contracts/:id/lanes/:laneId` | Remove lane rate     |
| POST   | `/api/v1/rate-contracts/:id/renew`         | Renew contract       |
| GET    | `/api/v1/rate-contracts/find-rate`         | Find applicable rate |

### Accessorials

| Method | Endpoint                        | Description            |
| ------ | ------------------------------- | ---------------------- |
| GET    | `/api/v1/accessorial-rates`     | List accessorial rates |
| POST   | `/api/v1/accessorial-rates`     | Create rate            |
| PUT    | `/api/v1/accessorial-rates/:id` | Update rate            |
| DELETE | `/api/v1/accessorial-rates/:id` | Delete rate            |

### Sales Performance

| Method | Endpoint                           | Description            |
| ------ | ---------------------------------- | ---------------------- |
| GET    | `/api/v1/sales/quotas`             | Get sales quotas       |
| POST   | `/api/v1/sales/quotas`             | Create/update quota    |
| GET    | `/api/v1/sales/performance`        | Performance dashboard  |
| GET    | `/api/v1/sales/leaderboard`        | Sales leaderboard      |
| GET    | `/api/v1/sales/conversion-metrics` | Quote conversion stats |
| GET    | `/api/v1/sales/win-loss`           | Win/loss analysis      |

## Events

### Published Events

| Event               | Trigger            | Payload             |
| ------------------- | ------------------ | ------------------- |
| `quote.created`     | New quote          | Quote data          |
| `quote.updated`     | Quote modified     | Changes + quote     |
| `quote.sent`        | Sent to customer   | Quote + recipient   |
| `quote.viewed`      | Customer viewed    | Quote + timestamp   |
| `quote.accepted`    | Customer accepted  | Quote data          |
| `quote.rejected`    | Customer rejected  | Quote + reason      |
| `quote.expired`     | Past validity      | Quote data          |
| `quote.converted`   | Converted to order | Quote + order ID    |
| `contract.created`  | New contract       | Contract data       |
| `contract.updated`  | Contract modified  | Changes             |
| `contract.expiring` | 30 days to expire  | Contract data       |
| `contract.expired`  | Contract expired   | Contract data       |
| `quota.achieved`    | Hit quota target   | Quota + achievement |

### Subscribed Events

| Event                 | Source            | Action                    |
| --------------------- | ----------------- | ------------------------- |
| `order.created`       | TMS Core          | Update conversion metrics |
| `order.completed`     | TMS Core          | Update revenue actuals    |
| `company.created`     | CRM               | Available for quotes      |
| `market_rate.updated` | Rate Intelligence | Cache new rates           |

## Business Rules

### Quote Generation

1. Quote numbers format: `Q-{YYYYMM}-{sequence}` (e.g., Q-202501-0001)
2. Minimum 1 pickup and 1 delivery stop required
3. Pickup date must be today or future
4. Delivery date must be >= pickup date
5. Default validity: 7 days from creation
6. Hazmat requires hazmat class specification

### Rate Calculation

1. Contract rates take precedence over spot rates
2. Minimum margin enforced (configurable, default 15%)
3. Fuel surcharge auto-calculated from DOE index
4. Accessorials added after base rate
5. Round total to 2 decimal places

### Contract Management

1. Cannot have overlapping contracts for same customer
2. Expiration notifications sent at 30, 14, 7 days
3. Auto-renewal creates new contract version
4. Lane rates inherit contract defaults if not specified

### Quote Conversion

1. All required fields must be populated
2. Customer must exist in CRM (or create new)
3. Creates order with PENDING status
4. Quote marked as CONVERTED

## Screens

| Screen            | Description         | Features                                 |
| ----------------- | ------------------- | ---------------------------------------- |
| Quote List        | Browse quotes       | Status filters, date range, bulk actions |
| Quick Quote       | Fast quote entry    | Minimal fields, instant rate             |
| Quote Builder     | Full quote form     | Multi-stop, accessorials                 |
| Quote Detail      | View/edit quote     | Version history, send options            |
| Quote PDF Preview | PDF generation      | Customizable template                    |
| Contract List     | Browse contracts    | Status, expiration filters               |
| Contract Detail   | Contract management | Lanes, rates, history                    |
| Lane Rate Builder | Add/edit lanes      | Bulk import, zone mapping                |
| Sales Dashboard   | Performance metrics | Charts, quota progress                   |
| Leaderboard       | Sales rankings      | Period selection, metrics                |

## Configuration

### Environment Variables

```bash
# Rate Calculation
DEFAULT_MINIMUM_MARGIN_PERCENT=15
DEFAULT_QUOTE_VALIDITY_DAYS=7
FUEL_SURCHARGE_UPDATE_FREQUENCY=WEEKLY

# PDF Generation
QUOTE_PDF_TEMPLATE=default
QUOTE_PDF_COMPANY_LOGO_URL=
QUOTE_PDF_TERMS_TEXT=
```

### Default Accessorial Types

```json
[
  {
    "type": "DETENTION",
    "name": "Detention",
    "rateType": "PER_HOUR",
    "defaultRate": 75
  },
  {
    "type": "LAYOVER",
    "name": "Layover",
    "rateType": "FLAT",
    "defaultRate": 350
  },
  {
    "type": "LUMPER",
    "name": "Lumper Fee",
    "rateType": "FLAT",
    "defaultRate": 0
  },
  {
    "type": "TONU",
    "name": "Truck Order Not Used",
    "rateType": "FLAT",
    "defaultRate": 250
  },
  {
    "type": "STOP_OFF",
    "name": "Stop-Off Charge",
    "rateType": "FLAT",
    "defaultRate": 150
  },
  {
    "type": "APPOINTMENT",
    "name": "Appointment Scheduling",
    "rateType": "FLAT",
    "defaultRate": 50
  },
  {
    "type": "RESIDENTIAL",
    "name": "Residential Delivery",
    "rateType": "FLAT",
    "defaultRate": 100
  },
  {
    "type": "LIFTGATE",
    "name": "Liftgate Service",
    "rateType": "FLAT",
    "defaultRate": 75
  },
  {
    "type": "INSIDE_DELIVERY",
    "name": "Inside Delivery",
    "rateType": "FLAT",
    "defaultRate": 100
  },
  {
    "type": "HAZMAT",
    "name": "Hazmat Handling",
    "rateType": "FLAT",
    "defaultRate": 200
  }
]
```

## Rate Calculation Logic

```typescript
interface RateCalculationInput {
  origin: Address;
  destination: Address;
  stops: Stop[];
  serviceType: ServiceType;
  equipmentType: EquipmentType;
  weight?: number;
  customerId?: string;
  pickupDate: Date;
}

interface RateCalculationResult {
  totalMiles: number;
  linehaul: number;
  fuelSurcharge: number;
  accessorials: Accessorial[];
  total: number;
  margin: number;
  marginPercent: number;
  rateSource: 'CONTRACT' | 'MARKET' | 'CALCULATED';
  marketComparison?: {
    low: number;
    avg: number;
    high: number;
  };
}

// Rate calculation priority:
// 1. Check for active contract rate for customer + lane
// 2. Check for market rate from DAT/Truckstop
// 3. Calculate from base rate table (per mile by equipment)
// 4. Apply minimum margin floor
// 5. Add fuel surcharge
// 6. Add applicable accessorials
```

## Testing Checklist

### Unit Tests

- [ ] Quote CRUD operations
- [ ] Quote number generation
- [ ] Rate calculation logic
- [ ] Contract lane matching
- [ ] Margin validation
- [ ] Fuel surcharge calculation
- [ ] Quote expiration logic

### Integration Tests

- [ ] Quote to order conversion
- [ ] Contract rate lookup
- [ ] Market rate integration
- [ ] PDF generation
- [ ] Email sending
- [ ] Event publishing

### E2E Tests

- [ ] Quick quote flow
- [ ] Full quote builder
- [ ] Quote send and tracking
- [ ] Contract creation with lanes
- [ ] Sales dashboard metrics
- [ ] Quote conversion to order

---

**Navigation:** [â† CRM](../02-crm/README.md) | [Services Index](../README.md) | [TMS Core â†’](../04-tms-core/README.md)
