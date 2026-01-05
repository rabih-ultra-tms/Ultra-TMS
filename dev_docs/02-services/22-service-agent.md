# Service 15: Agent Service

| Field             | Value                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| **Service ID**    | 15                                                                          |
| **Service Name**  | Agent Service                                                               |
| **Category**      | Operations Services                                                         |
| **Phase**         | A (MVP)                                                                     |
| **Planned Weeks** | 71-74                                                                       |
| **Priority**      | P2                                                                          |
| **Dependencies**  | Auth/Admin (01), CRM (02), Commission (08), Contracts (14), Accounting (06) |

---

## Overview

### Purpose

Manage the agent network for lead generation, sales referrals, and commission splits. Agents are independent sales partners who refer customers and receive a split of commissions generated from their accounts.

### Key Features

- Agent onboarding and agreement management
- Customer-to-agent assignment with ownership rules
- Commission split configuration (fixed, tiered, custom)
- Lead submission and conversion tracking
- Protection periods and sunset provisions
- Agent performance metrics and rankings
- Self-service agent portal
- Commission statements and payment processing

---

## Database Schema

### Agents Table

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Agent Reference
    agent_code VARCHAR(20) NOT NULL UNIQUE,  -- A-{sequence}

    -- Company Info
    company_name VARCHAR(200) NOT NULL,
    dba_name VARCHAR(200),
    legal_entity_type VARCHAR(50),  -- LLC, CORPORATION, SOLE_PROP, PARTNERSHIP
    tax_id VARCHAR(20),

    -- Address
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(3) DEFAULT 'USA',

    -- Primary Contact
    contact_first_name VARCHAR(100) NOT NULL,
    contact_last_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),

    -- Agent Type
    agent_type VARCHAR(20) NOT NULL,  -- REFERRING, SELLING, HYBRID
    -- REFERRING: Brings leads, earns referral fee
    -- SELLING: Actively sells and manages accounts
    -- HYBRID: Does both

    -- Territory
    territories JSONB DEFAULT '[]',  -- [{state, region}]
    industry_focus JSONB DEFAULT '[]',  -- [AUTOMOTIVE, RETAIL, FOOD, etc.]

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, ACTIVE, SUSPENDED, TERMINATED

    -- Onboarding
    application_date TIMESTAMP,
    background_check_status VARCHAR(20),  -- PENDING, PASSED, FAILED
    background_check_date TIMESTAMP,
    training_completed BOOLEAN DEFAULT FALSE,
    training_completed_date TIMESTAMP,

    -- Agreement
    agreement_id UUID REFERENCES contracts(id),
    agreement_signed_at TIMESTAMP,
    agreement_version INTEGER DEFAULT 1,

    -- Activation
    activated_at TIMESTAMP,
    activated_by UUID REFERENCES users(id),

    -- Tier/Level
    tier VARCHAR(20) DEFAULT 'STANDARD',  -- STANDARD, SILVER, GOLD, PLATINUM

    -- Payment Info
    payment_method VARCHAR(20),  -- ACH, CHECK, WIRE
    bank_name VARCHAR(100),
    bank_routing VARCHAR(20),
    bank_account VARCHAR(50),
    bank_account_type VARCHAR(20),

    -- Termination
    terminated_at TIMESTAMP,
    terminated_by UUID REFERENCES users(id),
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

CREATE INDEX idx_agents_tenant ON agents(tenant_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_type ON agents(agent_type);
CREATE INDEX idx_agents_code ON agents(agent_code);
CREATE INDEX idx_agents_email ON agents(contact_email);
```

### Agent Contacts Table

```sql
CREATE TABLE agent_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- Contact Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),

    -- Role
    role VARCHAR(50),  -- OWNER, SALES_REP, ACCOUNTING, ADMIN
    is_primary BOOLEAN DEFAULT FALSE,

    -- Portal Access
    has_portal_access BOOLEAN DEFAULT FALSE,
    portal_user_id UUID,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_contacts_agent ON agent_contacts(agent_id);
```

### Agent Agreements Table

```sql
CREATE TABLE agent_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- Agreement Info
    agreement_number VARCHAR(30) NOT NULL,
    name VARCHAR(200),

    -- Dates
    effective_date DATE NOT NULL,
    expiration_date DATE,

    -- Commission Structure
    split_type VARCHAR(20) NOT NULL,  -- PERCENT_OF_REP, PERCENT_OF_MARGIN, FLAT_PER_LOAD, TIERED
    split_rate DECIMAL(5,4),  -- e.g., 0.4000 = 40%
    minimum_per_load DECIMAL(10,2),

    -- Tiered Structure (if split_type = TIERED)
    tiers JSONB DEFAULT '[]',  -- [{min_volume, max_volume, rate}]

    -- Protection Period
    protection_period_months INTEGER DEFAULT 12,

    -- Sunset Provisions
    sunset_enabled BOOLEAN DEFAULT FALSE,
    sunset_period_months INTEGER DEFAULT 12,
    sunset_schedule JSONB DEFAULT '[]',  -- [{month, rate}] e.g., [{1-3: 75%}, {4-6: 50%}, ...]

    -- Draw
    draw_amount DECIMAL(10,2),
    draw_frequency VARCHAR(20),  -- MONTHLY, QUARTERLY
    draw_recoverable BOOLEAN DEFAULT TRUE,

    -- Payment Terms
    payment_day INTEGER DEFAULT 15,  -- Day of month for payment
    minimum_payout DECIMAL(10,2) DEFAULT 100.00,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- DRAFT, ACTIVE, EXPIRED, TERMINATED

    -- Version
    version INTEGER DEFAULT 1,
    previous_agreement_id UUID REFERENCES agent_agreements(id),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_agreements_agent ON agent_agreements(agent_id);
CREATE INDEX idx_agent_agreements_status ON agent_agreements(status);
```

### Agent Customer Assignments Table

```sql
CREATE TABLE agent_customer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES agents(id),
    customer_id UUID NOT NULL REFERENCES companies(id),

    -- Assignment Type
    assignment_type VARCHAR(20) NOT NULL,  -- PRIMARY, SECONDARY, SPLIT

    -- Protection Period
    protection_start DATE NOT NULL,
    protection_end DATE,  -- Null = indefinite
    is_protected BOOLEAN DEFAULT TRUE,

    -- Split (if multiple agents on account)
    split_percent DECIMAL(5,4),  -- If shared with another agent

    -- Lead Source
    lead_id UUID REFERENCES agent_leads(id),
    source VARCHAR(50),  -- AGENT_LEAD, TRANSFER, COMPANY_ASSIGNED

    -- Override (different from agreement default)
    override_split_rate DECIMAL(5,4),
    override_reason TEXT,

    -- Sunset Status
    in_sunset BOOLEAN DEFAULT FALSE,
    sunset_start_date DATE,
    current_sunset_rate DECIMAL(5,4),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, SUNSET, TRANSFERRED, TERMINATED

    -- Termination
    terminated_at TIMESTAMP,
    terminated_reason TEXT,
    transferred_to_agent_id UUID REFERENCES agents(id),

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(agent_id, customer_id)
);

CREATE INDEX idx_agent_customers_agent ON agent_customer_assignments(agent_id);
CREATE INDEX idx_agent_customers_customer ON agent_customer_assignments(customer_id);
CREATE INDEX idx_agent_customers_status ON agent_customer_assignments(status);
CREATE INDEX idx_agent_customers_protected ON agent_customer_assignments(is_protected, protection_end);
```

### Agent Leads Table

```sql
CREATE TABLE agent_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- Lead Reference
    lead_number VARCHAR(20) NOT NULL UNIQUE,  -- AL-{YYYYMM}-{sequence}

    -- Company Info
    company_name VARCHAR(200) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100),
    estimated_monthly_volume INTEGER,
    estimated_monthly_revenue DECIMAL(12,2),

    -- Primary Contact
    contact_first_name VARCHAR(100) NOT NULL,
    contact_last_name VARCHAR(100) NOT NULL,
    contact_title VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),

    -- Address
    city VARCHAR(100),
    state VARCHAR(50),

    -- Lead Details
    lead_source VARCHAR(50),  -- REFERRAL, COLD_CALL, TRADE_SHOW, ONLINE
    notes TEXT,

    -- Lanes
    primary_lanes JSONB DEFAULT '[]',  -- [{origin, destination}]
    equipment_needs JSONB DEFAULT '[]',  -- [VAN, REEFER, etc.]

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',  -- SUBMITTED, REVIEWING, QUALIFIED, WORKING, CONVERTED, REJECTED, EXPIRED

    -- Qualification
    qualified_by UUID REFERENCES users(id),
    qualified_at TIMESTAMP,
    rejection_reason TEXT,

    -- Conversion
    converted_at TIMESTAMP,
    converted_customer_id UUID REFERENCES companies(id),
    conversion_deadline DATE,  -- 90 days from submission

    -- Assignment
    assigned_to UUID REFERENCES users(id),  -- Sales rep working the lead
    assigned_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_leads_agent ON agent_leads(agent_id);
CREATE INDEX idx_agent_leads_status ON agent_leads(status);
CREATE INDEX idx_agent_leads_number ON agent_leads(lead_number);
CREATE INDEX idx_agent_leads_deadline ON agent_leads(conversion_deadline);
```

### Agent Commissions Table

```sql
CREATE TABLE agent_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- Source
    customer_id UUID REFERENCES companies(id),
    load_id UUID REFERENCES loads(id),
    invoice_id UUID REFERENCES invoices(id),
    assignment_id UUID REFERENCES agent_customer_assignments(id),

    -- Amounts
    load_revenue DECIMAL(12,2),
    load_margin DECIMAL(12,2),
    sales_rep_commission DECIMAL(10,2),  -- What rep earned

    -- Split Calculation
    split_rate DECIMAL(5,4) NOT NULL,
    split_type VARCHAR(20) NOT NULL,
    commission_base DECIMAL(12,2),  -- What the split is calculated from

    -- Agent Commission
    gross_commission DECIMAL(10,2) NOT NULL,
    adjustments DECIMAL(10,2) DEFAULT 0,
    net_commission DECIMAL(10,2) NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'CALCULATED',  -- CALCULATED, APPROVED, PAID, ADJUSTED, VOIDED

    -- Period
    commission_period VARCHAR(7),  -- YYYY-MM

    -- Payment
    payout_id UUID REFERENCES agent_payouts(id),
    paid_at TIMESTAMP,

    -- Notes
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_commissions_agent ON agent_commissions(agent_id);
CREATE INDEX idx_agent_commissions_load ON agent_commissions(load_id);
CREATE INDEX idx_agent_commissions_period ON agent_commissions(commission_period);
CREATE INDEX idx_agent_commissions_status ON agent_commissions(status);
CREATE INDEX idx_agent_commissions_customer ON agent_commissions(customer_id);
```

### Agent Payouts Table

```sql
CREATE TABLE agent_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- Payout Reference
    payout_number VARCHAR(30) NOT NULL UNIQUE,  -- AP-{YYYYMM}-{sequence}

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Amounts
    gross_commissions DECIMAL(12,2) NOT NULL,
    adjustments DECIMAL(10,2) DEFAULT 0,
    draw_recovery DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, APPROVED, PROCESSING, PAID, FAILED

    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    -- Payment
    payment_method VARCHAR(20),
    payment_reference VARCHAR(100),
    payment_date DATE,

    -- Documents
    statement_document_id UUID REFERENCES documents(id),

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_payouts_agent ON agent_payouts(agent_id);
CREATE INDEX idx_agent_payouts_status ON agent_payouts(status);
CREATE INDEX idx_agent_payouts_period ON agent_payouts(period_start, period_end);
```

### Agent Draw Balance Table

```sql
CREATE TABLE agent_draw_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- Period
    period VARCHAR(7) NOT NULL,  -- YYYY-MM

    -- Draw
    draw_amount DECIMAL(10,2) NOT NULL,
    draw_paid_at TIMESTAMP,

    -- Earnings
    commissions_earned DECIMAL(10,2) DEFAULT 0,

    -- Balance
    shortfall DECIMAL(10,2) DEFAULT 0,  -- If draw > commissions
    carryover_balance DECIMAL(10,2) DEFAULT 0,  -- Cumulative shortfall

    -- Recovery
    amount_recovered DECIMAL(10,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_draw_agent ON agent_draw_balances(agent_id);
CREATE INDEX idx_agent_draw_period ON agent_draw_balances(period);
```

### Agent Portal Users Table

```sql
CREATE TABLE agent_portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_id UUID NOT NULL REFERENCES agents(id),
    agent_contact_id UUID REFERENCES agent_contacts(id),

    -- User Info
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    -- Role
    role VARCHAR(20) NOT NULL DEFAULT 'USER',  -- ADMIN, USER, VIEW_ONLY

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    -- Authentication
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_agent_portal_users_agent ON agent_portal_users(agent_id);
CREATE INDEX idx_agent_portal_users_email ON agent_portal_users(email);
```

---

## API Endpoints

### Agents

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/v1/agents`               | List agents with filters |
| POST   | `/api/v1/agents`               | Create agent             |
| GET    | `/api/v1/agents/:id`           | Get agent details        |
| PUT    | `/api/v1/agents/:id`           | Update agent             |
| DELETE | `/api/v1/agents/:id`           | Delete agent (soft)      |
| POST   | `/api/v1/agents/:id/activate`  | Activate agent           |
| POST   | `/api/v1/agents/:id/suspend`   | Suspend agent            |
| POST   | `/api/v1/agents/:id/terminate` | Terminate agent          |
| GET    | `/api/v1/agents/:id/contacts`  | Get agent contacts       |
| POST   | `/api/v1/agents/:id/contacts`  | Add contact              |

### Agent Agreements

| Method | Endpoint                                      | Description           |
| ------ | --------------------------------------------- | --------------------- |
| GET    | `/api/v1/agents/:id/agreements`               | List agreements       |
| POST   | `/api/v1/agents/:id/agreements`               | Create agreement      |
| GET    | `/api/v1/agent-agreements/:id`                | Get agreement         |
| PUT    | `/api/v1/agent-agreements/:id`                | Update agreement      |
| GET    | `/api/v1/agents/:id/commission-plans`         | Get commission config |
| PUT    | `/api/v1/agents/:id/commission-plans/:planId` | Update plan           |

### Customer Assignments

| Method | Endpoint                                     | Description              |
| ------ | -------------------------------------------- | ------------------------ |
| GET    | `/api/v1/agents/:id/customers`               | List agent's customers   |
| POST   | `/api/v1/agents/:id/customers`               | Assign customer to agent |
| GET    | `/api/v1/agent-assignments/:id`              | Get assignment details   |
| PUT    | `/api/v1/agent-assignments/:id`              | Update assignment        |
| DELETE | `/api/v1/agent-assignments/:id`              | Remove assignment        |
| POST   | `/api/v1/agent-assignments/transfer`         | Transfer customer        |
| POST   | `/api/v1/agent-assignments/:id/start-sunset` | Start sunset period      |

### Leads

| Method | Endpoint                          | Description         |
| ------ | --------------------------------- | ------------------- |
| GET    | `/api/v1/agents/:id/leads`        | List agent's leads  |
| POST   | `/api/v1/agents/:id/leads`        | Submit lead         |
| GET    | `/api/v1/agent-leads/:id`         | Get lead details    |
| PUT    | `/api/v1/agent-leads/:id`         | Update lead         |
| POST   | `/api/v1/agent-leads/:id/qualify` | Mark as qualified   |
| POST   | `/api/v1/agent-leads/:id/reject`  | Reject lead         |
| POST   | `/api/v1/agent-leads/:id/convert` | Convert to customer |

### Commissions

| Method | Endpoint                                  | Description      |
| ------ | ----------------------------------------- | ---------------- |
| GET    | `/api/v1/agents/:id/commissions`          | List commissions |
| GET    | `/api/v1/agents/:id/commission-statement` | Get statement    |
| POST   | `/api/v1/agents/:id/adjustments`          | Add adjustment   |
| GET    | `/api/v1/agents/:id/draw-balance`         | Get draw balance |

### Payouts

| Method | Endpoint                               | Description         |
| ------ | -------------------------------------- | ------------------- |
| GET    | `/api/v1/agents/:id/payouts`           | List payouts        |
| GET    | `/api/v1/agent-payouts/:id`            | Get payout details  |
| POST   | `/api/v1/agent-payouts`                | Create payout batch |
| POST   | `/api/v1/agent-payouts/:id/approve`    | Approve payout      |
| POST   | `/api/v1/agent-payouts/:id/process`    | Process payment     |
| GET    | `/api/v1/agent-payouts/:id/remittance` | Download remittance |

### Reporting

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| GET    | `/api/v1/agents/:id/scorecard`   | Get agent scorecard     |
| GET    | `/api/v1/agents/:id/performance` | Get performance metrics |
| GET    | `/api/v1/agents/ranking`         | Get agent rankings      |
| GET    | `/api/v1/agents/revenue-summary` | Revenue by agent        |

### Agent Portal

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| POST   | `/api/agent/v1/auth/login`  | Agent portal login |
| GET    | `/api/agent/v1/dashboard`   | Agent dashboard    |
| GET    | `/api/agent/v1/customers`   | My customers       |
| GET    | `/api/agent/v1/orders`      | Customer orders    |
| GET    | `/api/agent/v1/commissions` | My commissions     |
| GET    | `/api/agent/v1/statements`  | My statements      |
| POST   | `/api/agent/v1/leads`       | Submit lead        |
| GET    | `/api/agent/v1/leads`       | My leads           |

---

## Events

### Published Events

| Event                         | Trigger               | Payload                                          |
| ----------------------------- | --------------------- | ------------------------------------------------ |
| `agent.created`               | Agent created         | `{tenant_id, agent_id}`                          |
| `agent.updated`               | Agent updated         | `{tenant_id, agent_id, changes}`                 |
| `agent.activated`             | Agent activated       | `{tenant_id, agent_id}`                          |
| `agent.suspended`             | Agent suspended       | `{tenant_id, agent_id, reason}`                  |
| `agent.terminated`            | Agent terminated      | `{tenant_id, agent_id}`                          |
| `agent.agreement.signed`      | Agreement executed    | `{tenant_id, agent_id, agreement_id}`            |
| `agent.customer.assigned`     | Customer assigned     | `{tenant_id, agent_id, customer_id}`             |
| `agent.customer.removed`      | Customer removed      | `{tenant_id, agent_id, customer_id}`             |
| `agent.customer.transferred`  | Customer transferred  | `{tenant_id, from_agent, to_agent, customer_id}` |
| `agent.lead.submitted`        | Lead submitted        | `{tenant_id, agent_id, lead_id}`                 |
| `agent.lead.qualified`        | Lead qualified        | `{tenant_id, agent_id, lead_id}`                 |
| `agent.lead.converted`        | Lead converted        | `{tenant_id, agent_id, lead_id, customer_id}`    |
| `agent.commission.calculated` | Commission calculated | `{tenant_id, agent_id, load_id, amount}`         |
| `agent.commission.adjusted`   | Commission adjusted   | `{tenant_id, agent_id, adjustment}`              |
| `agent.payment.processed`     | Payment sent          | `{tenant_id, agent_id, payout_id, amount}`       |
| `agent.protection.expiring`   | Protection ending     | `{tenant_id, agent_id, customer_id}`             |
| `agent.sunset.starting`       | Sunset beginning      | `{tenant_id, agent_id, customer_id}`             |

### Subscribed Events

| Event                   | Source             | Action                        |
| ----------------------- | ------------------ | ----------------------------- |
| `load.delivered`        | TMS Core           | Calculate agent commission    |
| `invoice.paid`          | Accounting         | Update commission status      |
| `commission.calculated` | Commission Service | Create agent commission entry |
| `customer.created`      | CRM                | Check for agent lead match    |

---

## Business Rules

### Agent Onboarding

1. Background check must pass before activation
2. Agreement must be signed before customer assignment
3. Training must be completed before activation
4. Tax ID (W-9) required for payment setup

### Customer Assignments

1. Customer can only have one PRIMARY agent
2. Protection period default: 12 months
3. Protected accounts cannot be reassigned without transfer
4. Transfer requires approval from both agents or admin override

### Lead Conversion

1. Leads must convert within 90 days for agent credit
2. Converted leads auto-create customer assignment
3. Qualified leads assigned to internal sales rep
4. Agent receives credit if conversion within deadline

### Commission Calculation

1. Agent split calculated AFTER sales rep commission
2. Example: $500 margin â†’ $100 rep commission (20%) â†’ $40 agent (40% of rep)
3. Minimum per load applies if configured
4. Override rates on customer assignment take precedence

### Sunset Provisions

1. When customer removed, sunset period begins
2. Sunset reduces commission rate over time
3. Example: Month 1-3: 75%, Month 4-6: 50%, Month 7-9: 25%, Month 10-12: 0%
4. Sunset can be bypassed by admin for cause

### Draw Advances

1. Draw paid monthly regardless of commissions
2. If commissions < draw, shortfall carries forward
3. If commissions > draw, excess pays down balance first
4. Recoverable draws deducted from future payouts
5. Non-recoverable draws are guaranteed minimum

### Payments

1. Payments processed monthly (default 15th)
2. Minimum payout threshold: $100
3. Below threshold rolls to next period
4. Payment requires approved payout record

---

## Screens

| Screen                 | Type      | Description                                     |
| ---------------------- | --------- | ----------------------------------------------- |
| Agent Dashboard        | Dashboard | Overview with agent count, revenue, commissions |
| Agents List            | List      | All agents with status, type filters            |
| Agent Detail           | Detail    | Full profile with customers, commissions        |
| Agent Form             | Form      | Create/edit agent with agreement config         |
| Agent Customers        | List      | Customer assignments for agent                  |
| Agent Leads            | List      | Leads submitted by agent                        |
| Lead Form              | Form      | Submit/edit lead                                |
| Agent Commissions      | List      | Commission history                              |
| Agent Payouts          | List      | Payout history                                  |
| Agent Portal Dashboard | Dashboard | Agent self-service home                         |

---

## Configuration

### Environment Variables

```bash
# Agent Settings
AGENT_DEFAULT_PROTECTION_MONTHS=12
AGENT_DEFAULT_SUNSET_MONTHS=12
AGENT_LEAD_CONVERSION_DAYS=90
AGENT_MINIMUM_PAYOUT=100.00
AGENT_PAYMENT_DAY=15

# Background Check
BACKGROUND_CHECK_PROVIDER=CHECKR
CHECKR_API_KEY=xxx
```

### Default Settings

```json
{
  "default_protection_period_months": 12,
  "default_sunset_period_months": 12,
  "default_sunset_schedule": [
    { "months": "1-3", "rate": 0.75 },
    { "months": "4-6", "rate": 0.5 },
    { "months": "7-9", "rate": 0.25 },
    { "months": "10-12", "rate": 0.0 }
  ],
  "lead_conversion_days": 90,
  "minimum_payout": 100.0,
  "payment_day": 15,
  "require_background_check": true,
  "require_training": true
}
```

---

## Commission Calculation Example

```
Load Details:
- Revenue: $3,000
- Carrier Cost: $2,500
- Margin: $500

Sales Rep Commission (20% of margin):
- Rep Commission: $500 Ã— 0.20 = $100

Agent Split (40% of rep commission):
- Agent Commission: $100 Ã— 0.40 = $40

Final Distribution:
- Company: $400 (margin - rep - agent)
- Sales Rep: $60 (rep commission - agent)
- Agent: $40

Note: Agent split comes FROM the rep's commission, not additional.
```

---

## Testing Checklist

### Unit Tests

- [ ] Agent code generation
- [ ] Commission split calculation
- [ ] Protection period validation
- [ ] Sunset rate calculation
- [ ] Draw balance tracking
- [ ] Lead conversion deadline

### Integration Tests

- [ ] Agent onboarding â†’ activation flow
- [ ] Lead submission â†’ conversion â†’ assignment
- [ ] Load delivery â†’ commission calculation
- [ ] Payout generation â†’ approval â†’ payment
- [ ] Customer transfer between agents
- [ ] Sunset period progression

### E2E Tests

- [ ] Complete agent onboarding journey
- [ ] Agent portal lead submission
- [ ] Commission statement generation
- [ ] Payout processing
- [ ] Customer assignment with override

---

## Navigation

**Previous:** [14 - Contracts Service](../14-contracts/README.md)

**Next:** [16 - Factoring Service](../16-factoring/README.md)

**[Back to Services Index](../README.md)**
