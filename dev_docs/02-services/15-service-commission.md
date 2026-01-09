# Commission Service

## Overview

| Attribute             | Value                                                     |
| --------------------- | --------------------------------------------------------- |
| **Service ID**        | 08                                                        |
| **Category**          | Support Services                                          |
| **Phase**             | A (Internal MVP)                                          |
| **Development Weeks** | 51-52                                                     |
| **Priority**          | P1 - High                                                 |
| **Dependencies**      | Auth/Admin (01), CRM (02), TMS Core (04), Accounting (06) |

## Purpose

The Commission Service manages sales representative and agent commission calculations, tracking, and payouts. It supports multiple commission structures including flat fees, percentage-based, tiered rates, and split commissions between multiple parties.

## Features

### Commission Plans

- Multiple commission structures
- Flat fee per load
- Percentage of margin
- Tiered rates based on volume
- Customer-specific overrides
- Effective date ranges

### Commission Calculation

- Automatic calculation on load completion
- Split commission support
- Draw against commission
- Bonus calculations
- Retroactive adjustments

### Commission Tracking

- Real-time earnings dashboard
- Period-based reporting
- Goal tracking
- Comparison to prior periods
- Pipeline projections

### Payouts

- Configurable payout schedules
- Statement generation
- Payout approval workflow
- Integration with payroll

## Database Schema

```sql
-- Commission Plans
CREATE TABLE commission_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Plan details
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Type
    plan_type VARCHAR(50) NOT NULL,
    -- FLAT_FEE, PERCENT_REVENUE, PERCENT_MARGIN, TIERED, CUSTOM

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    is_default BOOLEAN DEFAULT false,

    -- Validity
    effective_date DATE NOT NULL,
    end_date DATE,

    -- Base rates
    flat_amount DECIMAL(10,2),
    percent_rate DECIMAL(5,2), -- e.g., 10.00 = 10%

    -- Basis
    calculation_basis VARCHAR(50), -- GROSS_REVENUE, NET_MARGIN, LINEHAUL

    -- Conditions
    minimum_margin_percent DECIMAL(5,2), -- Minimum margin to earn commission

    -- Custom rules
    rules JSONB,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, name, effective_date)
);

CREATE INDEX idx_commission_plans_tenant ON commission_plans(tenant_id);
CREATE INDEX idx_commission_plans_status ON commission_plans(tenant_id, status);

-- Commission Plan Tiers
CREATE TABLE commission_plan_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES commission_plans(id) ON DELETE CASCADE,

    -- Tier definition
    tier_number INTEGER NOT NULL,
    tier_name VARCHAR(100),

    -- Thresholds (revenue or load count)
    threshold_type VARCHAR(50) NOT NULL, -- REVENUE, LOAD_COUNT, MARGIN
    threshold_min DECIMAL(14,2) NOT NULL,
    threshold_max DECIMAL(14,2),

    -- Rate
    rate_type VARCHAR(50) NOT NULL, -- FLAT, PERCENT
    rate_amount DECIMAL(10,2) NOT NULL,

    -- Per what period?
    period_type VARCHAR(50), -- MONTHLY, QUARTERLY, ANNUAL

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(plan_id, tier_number)
);

CREATE INDEX idx_plan_tiers_plan ON commission_plan_tiers(plan_id);

-- User Commission Assignments
CREATE TABLE user_commission_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Plan
    plan_id UUID NOT NULL REFERENCES commission_plans(id),

    -- Override rates (if different from plan)
    override_rate DECIMAL(5,2),
    override_flat DECIMAL(10,2),

    -- Validity
    effective_date DATE NOT NULL,
    end_date DATE,

    -- Draw
    draw_amount DECIMAL(10,2) DEFAULT 0, -- Monthly draw
    draw_recoverable BOOLEAN DEFAULT true,

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id, effective_date)
);

CREATE INDEX idx_user_comm_tenant ON user_commission_assignments(tenant_id);
CREATE INDEX idx_user_comm_user ON user_commission_assignments(user_id);
CREATE INDEX idx_user_comm_plan ON user_commission_assignments(plan_id);

-- Customer Commission Overrides
CREATE TABLE customer_commission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Override rate
    rate_type VARCHAR(50) NOT NULL, -- FLAT, PERCENT
    rate_amount DECIMAL(10,2) NOT NULL,
    calculation_basis VARCHAR(50), -- GROSS_REVENUE, NET_MARGIN

    -- Validity
    effective_date DATE NOT NULL,
    end_date DATE,

    -- Notes
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, company_id, user_id, effective_date)
);

CREATE INDEX idx_cust_comm_tenant ON customer_commission_overrides(tenant_id);
CREATE INDEX idx_cust_comm_company ON customer_commission_overrides(company_id);
CREATE INDEX idx_cust_comm_user ON customer_commission_overrides(user_id);

-- Commission Entries
CREATE TABLE commission_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Who earns
    user_id UUID NOT NULL REFERENCES users(id),

    -- What for
    load_id UUID REFERENCES loads(id),
    order_id UUID REFERENCES orders(id),

    -- Entry type
    entry_type VARCHAR(50) NOT NULL,
    -- LOAD_COMMISSION, BONUS, ADJUSTMENT, DRAW, DRAW_RECOVERY

    -- Calculation details
    plan_id UUID REFERENCES commission_plans(id),
    calculation_basis VARCHAR(50),
    basis_amount DECIMAL(12,2), -- Revenue/margin used for calc
    rate_applied DECIMAL(5,2),

    -- Commission
    commission_amount DECIMAL(12,2) NOT NULL,

    -- Split info
    is_split BOOLEAN DEFAULT false,
    split_percent DECIMAL(5,2) DEFAULT 100,
    parent_entry_id UUID REFERENCES commission_entries(id),

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, APPROVED, PAID, REVERSED

    -- Period
    commission_period DATE NOT NULL, -- First of month

    -- Notes
    notes TEXT,

    -- Reversal
    reversed_at TIMESTAMP WITH TIME ZONE,
    reversed_by UUID REFERENCES users(id),
    reversal_reason TEXT,

    -- Payout
    payout_id UUID,
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_comm_entries_tenant ON commission_entries(tenant_id);
CREATE INDEX idx_comm_entries_user ON commission_entries(user_id);
CREATE INDEX idx_comm_entries_load ON commission_entries(load_id);
CREATE INDEX idx_comm_entries_period ON commission_entries(tenant_id, commission_period);
CREATE INDEX idx_comm_entries_status ON commission_entries(tenant_id, status);

-- Commission Payouts
CREATE TABLE commission_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Payout details
    payout_number VARCHAR(50) NOT NULL,
    payout_date DATE NOT NULL,

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- User
    user_id UUID NOT NULL REFERENCES users(id),

    -- Amounts
    gross_commission DECIMAL(12,2) NOT NULL,
    draw_recovery DECIMAL(12,2) DEFAULT 0,
    adjustments DECIMAL(12,2) DEFAULT 0,
    net_payout DECIMAL(12,2) NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, APPROVED, PROCESSING, PAID, VOID

    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Payment
    payment_method VARCHAR(50), -- CHECK, ACH, PAYROLL
    payment_reference VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, payout_number)
);

CREATE INDEX idx_payouts_tenant ON commission_payouts(tenant_id);
CREATE INDEX idx_payouts_user ON commission_payouts(user_id);
CREATE INDEX idx_payouts_period ON commission_payouts(tenant_id, period_start);
CREATE INDEX idx_payouts_status ON commission_payouts(tenant_id, status);

-- Draw Balances
CREATE TABLE draw_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Balance
    current_balance DECIMAL(12,2) DEFAULT 0, -- Positive = owed to company

    -- History
    last_draw_amount DECIMAL(10,2),
    last_draw_date DATE,
    last_recovery_amount DECIMAL(10,2),
    last_recovery_date DATE,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_draw_balances_tenant ON draw_balances(tenant_id);
CREATE INDEX idx_draw_balances_user ON draw_balances(user_id);
```

## API Endpoints

### Commission Plans

| Method | Endpoint                             | Description     |
| ------ | ------------------------------------ | --------------- |
| GET    | `/api/v1/commission/plans`           | List plans      |
| POST   | `/api/v1/commission/plans`           | Create plan     |
| GET    | `/api/v1/commission/plans/:id`       | Get plan        |
| PUT    | `/api/v1/commission/plans/:id`       | Update plan     |
| DELETE | `/api/v1/commission/plans/:id`       | Deactivate plan |
| GET    | `/api/v1/commission/plans/:id/tiers` | Get tiers       |
| POST   | `/api/v1/commission/plans/:id/tiers` | Add tier        |

### User Assignments

| Method | Endpoint                             | Description       |
| ------ | ------------------------------------ | ----------------- |
| GET    | `/api/v1/commission/assignments`     | List assignments  |
| POST   | `/api/v1/commission/assignments`     | Assign plan       |
| PUT    | `/api/v1/commission/assignments/:id` | Update assignment |
| DELETE | `/api/v1/commission/assignments/:id` | Remove assignment |
| GET    | `/api/v1/commission/users/:id/plan`  | Get user's plan   |

### Commission Entries

| Method | Endpoint                                 | Description        |
| ------ | ---------------------------------------- | ------------------ |
| GET    | `/api/v1/commission/entries`             | List entries       |
| POST   | `/api/v1/commission/entries`             | Create entry       |
| GET    | `/api/v1/commission/entries/:id`         | Get entry          |
| PATCH  | `/api/v1/commission/entries/:id/approve` | Approve entry      |
| POST   | `/api/v1/commission/entries/:id/reverse` | Reverse entry      |
| POST   | `/api/v1/commission/calculate`           | Calculate for load |

### Payouts

| Method | Endpoint                                   | Description       |
| ------ | ------------------------------------------ | ----------------- |
| GET    | `/api/v1/commission/payouts`               | List payouts      |
| POST   | `/api/v1/commission/payouts/generate`      | Generate payouts  |
| GET    | `/api/v1/commission/payouts/:id`           | Get payout        |
| PATCH  | `/api/v1/commission/payouts/:id/approve`   | Approve payout    |
| POST   | `/api/v1/commission/payouts/:id/process`   | Process payment   |
| GET    | `/api/v1/commission/payouts/:id/statement` | Get statement PDF |

### Reports & Dashboard

| Method | Endpoint                                 | Description         |
| ------ | ---------------------------------------- | ------------------- |
| GET    | `/api/v1/commission/dashboard`           | User dashboard      |
| GET    | `/api/v1/commission/reports/summary`     | Summary report      |
| GET    | `/api/v1/commission/reports/by-user`     | By user report      |
| GET    | `/api/v1/commission/reports/by-customer` | By customer report  |
| GET    | `/api/v1/commission/pipeline`            | Pipeline projection |

## Events

### Published Events

| Event                   | Trigger          | Payload        |
| ----------------------- | ---------------- | -------------- |
| `commission.calculated` | Load completed   | Entry data     |
| `commission.approved`   | Entry approved   | Entry data     |
| `commission.reversed`   | Entry reversed   | Entry + reason |
| `payout.generated`      | Payout created   | Payout data    |
| `payout.approved`       | Payout approved  | Payout data    |
| `payout.paid`           | Payout processed | Payout data    |

### Subscribed Events

| Event                 | Source     | Action             |
| --------------------- | ---------- | ------------------ |
| `load.delivered`      | TMS Core   | Queue calculation  |
| `invoice.paid`        | Accounting | Trigger commission |
| `load.margin_updated` | TMS Core   | Recalculate        |

## Business Rules

### Commission Calculation

1. Calculate on load delivery (or invoice payment)
2. Use margin at time of calculation
3. Apply customer override if exists
4. Apply tier based on period-to-date totals
5. Minimum margin threshold required
6. Round to 2 decimal places

### Split Commissions

1. Primary rep gets base split (configurable)
2. Secondary reps get remaining splits
3. Splits must total 100%
4. Each split creates separate entry

### Draw Recovery

1. Draw paid monthly regardless of earnings
2. If earnings < draw, balance accumulates
3. If earnings > draw, recover balance first
4. Recoverable draws tracked separately
5. Non-recoverable draws are guaranteed

### Payout Processing

1. Generate payouts monthly (configurable)
2. Include all approved entries in period
3. Deduct draw recovery
4. Require approval for payouts > $10,000
5. Generate statements automatically

## Calculation Examples

### Percent of Margin

```typescript
// 10% of net margin
const marginCommission = {
  revenue: 5000,
  carrierCost: 4000,
  netMargin: 1000, // revenue - carrierCost
  commissionRate: 0.1,
  commission: 100, // 1000 * 0.10
};
```

### Tiered Commission

```typescript
// Monthly revenue tiers
const tiers = [
  { min: 0, max: 50000, rate: 0.08 },
  { min: 50000, max: 100000, rate: 0.1 },
  { min: 100000, max: null, rate: 0.12 },
];

// $120K in revenue this month
const tieredCommission = {
  tier1: 50000 * 0.08, // $4,000
  tier2: 50000 * 0.1, // $5,000
  tier3: 20000 * 0.12, // $2,400
  total: 11400, // $11,400
};
```

### Split Commission

```typescript
// 60/40 split between two reps
const splitCommission = {
  loadMargin: 1000,
  totalCommission: 100,
  splits: [
    { user: 'rep1', percent: 60, amount: 60 },
    { user: 'rep2', percent: 40, amount: 40 },
  ],
};
```

## Screens

| Screen               | Description        | Features                  |
| -------------------- | ------------------ | ------------------------- |
| Commission Dashboard | User earnings view | Period totals, trends     |
| Plan Management      | Configure plans    | Tiers, rates              |
| User Assignments     | Assign plans       | Override rates            |
| Entry List           | View entries       | Filters, exports          |
| Payout Manager       | Generate/approve   | Statements                |
| Reports              | Commission reports | By user, customer, period |
| Pipeline             | Projected earnings | Based on booked loads     |

## Configuration

### Environment Variables

```bash
# Commission Settings
COMMISSION_CALCULATION_TRIGGER=ON_DELIVERY  # or ON_PAYMENT
DEFAULT_COMMISSION_RATE=0.10
DEFAULT_MINIMUM_MARGIN=0.10  # 10% minimum margin
PAYOUT_GENERATION_DAY=1  # Day of month
PAYOUT_APPROVAL_THRESHOLD=10000
```

## Testing Checklist

### Unit Tests

- [ ] Plan CRUD operations
- [ ] Tier calculation logic
- [ ] Split commission calculation
- [ ] Draw tracking
- [ ] Payout generation

### Integration Tests

- [ ] Load to commission flow
- [ ] Customer override application
- [ ] Period aggregation
- [ ] Event handling
- [ ] Statement generation

### E2E Tests

- [ ] Complete commission cycle
- [ ] Tiered calculation accuracy
- [ ] Split commission workflow
- [ ] Payout approval and processing
- [ ] Dashboard accuracy

---

**Navigation:** [â† Load Board](../07-load-board/README.md) | [Services Index](../README.md) | [Credit â†’](../09-credit/README.md)
