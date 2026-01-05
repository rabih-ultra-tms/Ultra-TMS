# Credit Service

## Overview

| Attribute             | Value                                      |
| --------------------- | ------------------------------------------ |
| **Service ID**        | 16                                         |
| **Document**          | 42                                         |
| **Category**          | Operations Services                        |
| **Phase**             | A (Internal MVP)                           |
| **Development Weeks** | 51-54                                      |
| **Priority**          | P1 - High                                  |
| **Dependencies**      | Auth/Admin (01), CRM (02), Accounting (06) |

## Purpose

The Credit Service manages customer creditworthiness assessment, credit limit assignment, credit holds, and collections workflow. It enables brokerages to extend credit to customers while managing financial risk through automated monitoring and alerts.

## Features

### Credit Applications

- Online credit application form
- Document upload (financials, references)
- Application status tracking
- Approval workflow with multiple reviewers
- Automated credit scoring integration

### Credit Limit Management

- Customer credit limit assignment
- Credit utilization tracking
- Automatic limit recommendations
- Temporary limit increases
- Credit tier classifications

### Credit Holds

- Automatic hold triggers (over limit, past due)
- Manual hold capability
- Hold release workflow
- Hold history tracking
- Notification to sales/operations

### Collections Management

- Aging report generation
- Collection queue prioritization
- Collection activity logging
- Payment plan setup
- Write-off processing

### Credit Monitoring

- Real-time credit utilization dashboard
- Past due alerts
- Credit limit breach notifications
- Customer payment pattern analysis
- Risk score updates

## Database Schema

```sql
-- Credit Applications
CREATE TABLE credit_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    -- Application info
    company_id UUID NOT NULL REFERENCES companies(id),
    requested_amount DECIMAL(12,2) NOT NULL,
    requested_terms INTEGER, -- days
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Business info
    years_in_business INTEGER,
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    business_type VARCHAR(50),

    -- References
    trade_references JSONB, -- [{company, contact, phone, email}]
    bank_references JSONB, -- [{bank, contact, account_type}]

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, UNDER_REVIEW, APPROVED, DENIED, EXPIRED

    -- Decision
    approved_amount DECIMAL(12,2),
    approved_terms INTEGER,
    decision_date DATE,
    decision_by UUID REFERENCES users(id),
    decision_notes TEXT,

    -- Credit score
    credit_score INTEGER,
    credit_score_source VARCHAR(50),
    credit_score_date DATE,

    -- Documents
    documents JSONB, -- [{type, file_id, uploaded_at}]

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Credit Limits
CREATE TABLE credit_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    company_id UUID NOT NULL REFERENCES companies(id),

    -- Limit info
    credit_limit DECIMAL(12,2) NOT NULL,
    available_credit DECIMAL(12,2) NOT NULL,
    current_balance DECIMAL(12,2) DEFAULT 0,

    -- Terms
    payment_terms INTEGER DEFAULT 30, -- days

    -- Tier
    credit_tier VARCHAR(20), -- PLATINUM, GOLD, SILVER, BRONZE, STANDARD

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, SUSPENDED, ON_HOLD, CLOSED

    -- Temporary increase
    temp_increase_amount DECIMAL(12,2),
    temp_increase_expiry DATE,
    temp_increase_reason TEXT,

    -- Review
    last_review_date DATE,
    next_review_date DATE,
    reviewed_by UUID REFERENCES users(id),

    -- Effective dates
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, company_id)
);

-- Credit Holds
CREATE TABLE credit_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    company_id UUID NOT NULL REFERENCES companies(id),

    -- Hold info
    hold_type VARCHAR(50) NOT NULL,
    -- OVER_LIMIT, PAST_DUE, MANUAL, NSF, DISPUTE
    hold_reason TEXT NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, RELEASED, EXPIRED

    -- Release info
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES users(id),
    release_reason TEXT,

    -- Auto-release conditions
    auto_release_on_payment BOOLEAN DEFAULT false,
    auto_release_amount DECIMAL(12,2),

    -- Notifications sent
    notifications_sent JSONB, -- [{type, sent_at, recipient}]

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Collection Activities
CREATE TABLE collection_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    company_id UUID NOT NULL REFERENCES companies(id),
    invoice_id UUID REFERENCES invoices(id),

    -- Activity info
    activity_type VARCHAR(50) NOT NULL,
    -- CALL, EMAIL, LETTER, PROMISE_TO_PAY, PAYMENT_PLAN, ESCALATION, WRITE_OFF
    activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Details
    contact_name VARCHAR(255),
    contact_method VARCHAR(50),
    notes TEXT,

    -- Outcome
    outcome VARCHAR(50),
    -- CONTACTED, LEFT_MESSAGE, NO_ANSWER, PROMISED_PAYMENT, DISPUTED, ESCALATED

    -- Follow-up
    follow_up_date DATE,
    follow_up_assigned_to UUID REFERENCES users(id),

    -- Promise to pay
    promised_amount DECIMAL(12,2),
    promised_date DATE,
    promise_kept BOOLEAN,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Payment Plans
CREATE TABLE payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    company_id UUID NOT NULL REFERENCES companies(id),

    -- Plan info
    total_amount DECIMAL(12,2) NOT NULL,
    remaining_amount DECIMAL(12,2) NOT NULL,
    installment_amount DECIMAL(12,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- WEEKLY, BIWEEKLY, MONTHLY

    -- Schedule
    start_date DATE NOT NULL,
    next_payment_date DATE,

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, COMPLETED, DEFAULTED, CANCELLED

    -- Invoices covered
    invoice_ids UUID[],

    -- Payments made
    payments_made INTEGER DEFAULT 0,
    payments_total INTEGER NOT NULL,

    -- Terms
    terms_accepted_at TIMESTAMPTZ,
    terms_accepted_by VARCHAR(255),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_credit_applications_tenant ON credit_applications(tenant_id);
CREATE INDEX idx_credit_applications_company ON credit_applications(company_id);
CREATE INDEX idx_credit_applications_status ON credit_applications(status);
CREATE INDEX idx_credit_limits_tenant ON credit_limits(tenant_id);
CREATE INDEX idx_credit_limits_company ON credit_limits(company_id);
CREATE INDEX idx_credit_holds_tenant ON credit_holds(tenant_id);
CREATE INDEX idx_credit_holds_company ON credit_holds(company_id);
CREATE INDEX idx_credit_holds_status ON credit_holds(status);
CREATE INDEX idx_collection_activities_tenant ON collection_activities(tenant_id);
CREATE INDEX idx_collection_activities_company ON collection_activities(company_id);
```

## API Endpoints

### Credit Applications

| Method | Endpoint                                    | Description                    |
| ------ | ------------------------------------------- | ------------------------------ |
| GET    | `/api/v1/credit/applications`               | List applications with filters |
| GET    | `/api/v1/credit/applications/:id`           | Get application details        |
| POST   | `/api/v1/credit/applications`               | Create new application         |
| PATCH  | `/api/v1/credit/applications/:id`           | Update application             |
| POST   | `/api/v1/credit/applications/:id/approve`   | Approve application            |
| POST   | `/api/v1/credit/applications/:id/deny`      | Deny application               |
| POST   | `/api/v1/credit/applications/:id/documents` | Upload documents               |

### Credit Limits

| Method | Endpoint                                  | Description                |
| ------ | ----------------------------------------- | -------------------------- |
| GET    | `/api/v1/credit/limits`                   | List all credit limits     |
| GET    | `/api/v1/credit/limits/:companyId`        | Get company credit limit   |
| POST   | `/api/v1/credit/limits`                   | Set credit limit           |
| PATCH  | `/api/v1/credit/limits/:id`               | Update credit limit        |
| POST   | `/api/v1/credit/limits/:id/temp-increase` | Request temporary increase |
| GET    | `/api/v1/credit/limits/:id/utilization`   | Get utilization history    |

### Credit Holds

| Method | Endpoint                                  | Description        |
| ------ | ----------------------------------------- | ------------------ |
| GET    | `/api/v1/credit/holds`                    | List all holds     |
| GET    | `/api/v1/credit/holds/:id`                | Get hold details   |
| POST   | `/api/v1/credit/holds`                    | Create manual hold |
| POST   | `/api/v1/credit/holds/:id/release`        | Release hold       |
| GET    | `/api/v1/credit/holds/company/:companyId` | Get company holds  |

### Collections

| Method | Endpoint                                | Description          |
| ------ | --------------------------------------- | -------------------- |
| GET    | `/api/v1/credit/collections/queue`      | Get collection queue |
| GET    | `/api/v1/credit/collections/activities` | List activities      |
| POST   | `/api/v1/credit/collections/activities` | Log activity         |
| GET    | `/api/v1/credit/collections/aging`      | Get aging report     |
| POST   | `/api/v1/credit/payment-plans`          | Create payment plan  |
| PATCH  | `/api/v1/credit/payment-plans/:id`      | Update payment plan  |

### Dashboard & Reports

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/v1/credit/dashboard`     | Credit dashboard metrics |
| GET    | `/api/v1/credit/reports/aging` | Detailed aging report    |
| GET    | `/api/v1/credit/reports/risk`  | Risk analysis report     |

## Events

### Published Events

| Event                          | Trigger              | Payload                                |
| ------------------------------ | -------------------- | -------------------------------------- |
| `credit.application.submitted` | New application      | `{ applicationId, companyId }`         |
| `credit.application.approved`  | Application approved | `{ applicationId, companyId, amount }` |
| `credit.application.denied`    | Application denied   | `{ applicationId, companyId, reason }` |
| `credit.limit.updated`         | Limit changed        | `{ companyId, oldLimit, newLimit }`    |
| `credit.hold.placed`           | Hold activated       | `{ companyId, holdType, reason }`      |
| `credit.hold.released`         | Hold removed         | `{ companyId, holdId }`                |
| `credit.collection.activity`   | Collection logged    | `{ companyId, activityType }`          |

### Subscribed Events

| Event              | Source     | Action                                      |
| ------------------ | ---------- | ------------------------------------------- |
| `invoice.created`  | Accounting | Update credit utilization                   |
| `payment.received` | Accounting | Update available credit, check hold release |
| `invoice.past_due` | Accounting | Trigger collection queue                    |

## Business Rules

### Credit Limit Rules

```typescript
// Check if order can be placed
function canPlaceOrder(companyId: string, orderAmount: number): boolean {
  const credit = getCreditLimit(companyId);

  if (!credit || credit.status !== 'ACTIVE') return false;
  if (hasActiveHold(companyId)) return false;
  if (credit.available_credit < orderAmount) return false;

  return true;
}

// Calculate available credit
function calculateAvailableCredit(companyId: string): number {
  const credit = getCreditLimit(companyId);
  const openInvoices = getOpenInvoiceTotal(companyId);
  const pendingOrders = getPendingOrderTotal(companyId);

  const effectiveLimit =
    credit.credit_limit + (credit.temp_increase_amount || 0);
  return effectiveLimit - openInvoices - pendingOrders;
}
```

### Auto-Hold Rules

| Condition                     | Action                |
| ----------------------------- | --------------------- |
| Balance exceeds limit by 10%  | Place OVER_LIMIT hold |
| Any invoice 60+ days past due | Place PAST_DUE hold   |
| NSF payment received          | Place NSF hold        |
| Credit limit expired          | Place EXPIRED hold    |

### Credit Tier Benefits

| Tier     | Credit Limit | Payment Terms    | Benefits                        |
| -------- | ------------ | ---------------- | ------------------------------- |
| PLATINUM | $500K+       | Net 45           | Priority service, dedicated rep |
| GOLD     | $100K-$500K  | Net 30           | Standard service                |
| SILVER   | $25K-$100K   | Net 30           | Standard service                |
| BRONZE   | $5K-$25K     | Net 15           | Prepay option                   |
| STANDARD | <$5K         | Net 15 or Prepay | -                               |

## Screens

| #   | Screen              | Type      | Description                       | Access            |
| --- | ------------------- | --------- | --------------------------------- | ----------------- |
| 1   | Credit Dashboard    | dashboard | Credit overview, at-risk accounts | Accounting, Admin |
| 2   | Credit Applications | list      | Pending applications queue        | Accounting        |
| 3   | Application Review  | form      | Review and approve/deny           | Admin             |
| 4   | Credit Limits       | list      | All customer limits               | Accounting        |
| 5   | Credit Limit Editor | form      | Set/modify limits                 | Admin             |
| 6   | Credit Holds        | list      | Active holds                      | Accounting        |
| 7   | Collections Queue   | list      | Past due accounts                 | Accounting        |
| 8   | Collection Activity | form      | Log collection activity           | Accounting        |
| 9   | Payment Plans       | list      | Active payment plans              | Accounting        |
| 10  | Credit Reports      | report    | Aging, risk analysis              | Admin             |

## Configuration

```yaml
# Environment variables
CREDIT_AUTO_HOLD_ENABLED: true
CREDIT_OVER_LIMIT_THRESHOLD: 0.10 # 10% over triggers hold
CREDIT_PAST_DUE_DAYS: 60 # Days before auto-hold
CREDIT_SCORE_PROVIDER: 'dnb' # D&B, Experian, etc.
CREDIT_REVIEW_INTERVAL_DAYS: 365 # Annual review
CREDIT_TEMP_INCREASE_MAX_DAYS: 90 # Max temp increase duration
```

## Testing Checklist

### Unit Tests

- [ ] Credit limit calculations
- [ ] Available credit updates
- [ ] Hold trigger logic
- [ ] Aging calculations
- [ ] Payment plan scheduling

### Integration Tests

- [ ] Application approval workflow
- [ ] Credit utilization on invoice creation
- [ ] Available credit on payment receipt
- [ ] Auto-hold triggers
- [ ] Event publishing

### E2E Tests

- [ ] Complete credit application flow
- [ ] Credit hold and release cycle
- [ ] Collection activity logging
- [ ] Payment plan creation and tracking

---

_Service Version: 1.0.0_
_Last Updated: January 2025_
