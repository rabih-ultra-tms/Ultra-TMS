# CRM Service

## Overview

| Attribute             | Value                                        |
| --------------------- | -------------------------------------------- |
| **Service ID**        | 02                                           |
| **Category**          | Core Services                                |
| **Phase**             | A (Internal MVP)                             |
| **Development Weeks** | 7-12 (HubSpot), 27-30 (Internal CRM Phase B) |
| **Priority**          | P0 - Critical                                |
| **Dependencies**      | Auth/Admin (01)                              |

## Purpose

The CRM Service manages customer relationships, contacts, companies, and opportunities. During Phase A, this service integrates with HubSpot as the primary CRM. In Phase B, it transitions to a fully internal CRM module while maintaining HubSpot sync capabilities for historical data and optional continued use.

## Features

### Customer Management

- Company/account profiles with hierarchies
- Contact management with role assignments
- Customer classification and segmentation
- Credit terms and payment preferences
- Shipping preferences and requirements
- Communication history tracking

### Opportunity Pipeline

- Sales opportunity tracking
- Pipeline stages and workflows
- Win/loss analysis
- Revenue forecasting
- Quote-to-order conversion

### Activity Management

- Tasks and reminders
- Call logging and notes
- Email integration
- Meeting scheduling
- Activity timeline

### HubSpot Integration (Phase A)

- Bi-directional sync of contacts and companies
- Deal/opportunity synchronization
- Activity logging to HubSpot
- Custom field mapping
- Webhook handlers for real-time updates

## Database Schema

```sql
-- Companies/Accounts
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    hubspot_id VARCHAR(50),

    -- Core fields
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    dba_name VARCHAR(255),
    company_type VARCHAR(50) NOT NULL, -- CUSTOMER, PROSPECT, PARTNER, VENDOR
    status VARCHAR(50) DEFAULT 'ACTIVE',

    -- Classification
    industry VARCHAR(100),
    segment VARCHAR(50), -- ENTERPRISE, MID_MARKET, SMB
    tier VARCHAR(20), -- PLATINUM, GOLD, SILVER, BRONZE

    -- Contact info
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(3) DEFAULT 'USA',

    -- Financial
    credit_limit DECIMAL(12,2),
    payment_terms VARCHAR(50), -- NET30, NET15, COD, PREPAID
    tax_id VARCHAR(50),
    duns_number VARCHAR(20),

    -- Shipping preferences
    default_pickup_instructions TEXT,
    default_delivery_instructions TEXT,
    requires_appointment BOOLEAN DEFAULT false,
    requires_lumper BOOLEAN DEFAULT false,

    -- Relationships
    parent_company_id UUID REFERENCES companies(id),
    assigned_sales_rep_id UUID REFERENCES users(id),
    assigned_ops_rep_id UUID REFERENCES users(id),

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    tags VARCHAR(100)[],

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, external_id, source_system)
);

CREATE INDEX idx_companies_tenant ON companies(tenant_id);
CREATE INDEX idx_companies_name ON companies(tenant_id, name);
CREATE INDEX idx_companies_type ON companies(tenant_id, company_type);
CREATE INDEX idx_companies_hubspot ON companies(tenant_id, hubspot_id);
CREATE INDEX idx_companies_sales_rep ON companies(assigned_sales_rep_id);

-- Contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID REFERENCES companies(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    hubspot_id VARCHAR(50),

    -- Core fields
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    department VARCHAR(100),
    role_type VARCHAR(50), -- PRIMARY, BILLING, SHIPPING, OPERATIONS, EXECUTIVE

    -- Contact info
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    fax VARCHAR(50),

    -- Preferences
    preferred_contact_method VARCHAR(20), -- EMAIL, PHONE, SMS
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50),

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_primary BOOLEAN DEFAULT false,
    receives_invoices BOOLEAN DEFAULT false,
    receives_tracking BOOLEAN DEFAULT false,

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    tags VARCHAR(100)[],

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, external_id, source_system)
);

CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(tenant_id, email);
CREATE INDEX idx_contacts_hubspot ON contacts(tenant_id, hubspot_id);

-- Opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    company_id UUID NOT NULL REFERENCES companies(id),

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    hubspot_deal_id VARCHAR(50),

    -- Core fields
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stage VARCHAR(50) NOT NULL, -- LEAD, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST
    probability INTEGER DEFAULT 0, -- 0-100

    -- Financial
    estimated_value DECIMAL(12,2),
    estimated_loads_per_month INTEGER,
    avg_load_value DECIMAL(10,2),

    -- Dates
    expected_close_date DATE,
    actual_close_date DATE,

    -- Details
    service_types VARCHAR(50)[], -- FTL, LTL, DRAYAGE, etc.
    lanes JSONB, -- [{origin, destination, volume}]
    competition TEXT,

    -- Outcome
    win_reason TEXT,
    loss_reason TEXT,

    -- Relationships
    primary_contact_id UUID REFERENCES contacts(id),
    owner_id UUID NOT NULL REFERENCES users(id),

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    tags VARCHAR(100)[],

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, external_id, source_system)
);

CREATE INDEX idx_opportunities_tenant ON opportunities(tenant_id);
CREATE INDEX idx_opportunities_company ON opportunities(company_id);
CREATE INDEX idx_opportunities_stage ON opportunities(tenant_id, stage);
CREATE INDEX idx_opportunities_owner ON opportunities(owner_id);

-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Polymorphic relationship
    entity_type VARCHAR(50) NOT NULL, -- COMPANY, CONTACT, OPPORTUNITY, ORDER
    entity_id UUID NOT NULL,

    -- Migration support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    hubspot_engagement_id VARCHAR(50),

    -- Core fields
    activity_type VARCHAR(50) NOT NULL, -- CALL, EMAIL, MEETING, NOTE, TASK
    subject VARCHAR(255),
    description TEXT,

    -- Timing
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,

    -- For tasks
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20), -- HIGH, MEDIUM, LOW

    -- Relationships
    owner_id UUID REFERENCES users(id),
    contact_id UUID REFERENCES contacts(id),

    -- Custom fields
    custom_fields JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_activities_tenant ON activities(tenant_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_owner ON activities(owner_id);
CREATE INDEX idx_activities_type ON activities(tenant_id, activity_type);
CREATE INDEX idx_activities_due ON activities(tenant_id, due_date) WHERE due_date IS NOT NULL;

-- HubSpot Sync Log
CREATE TABLE hubspot_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    entity_type VARCHAR(50) NOT NULL, -- COMPANY, CONTACT, DEAL, ENGAGEMENT
    entity_id UUID NOT NULL,
    hubspot_id VARCHAR(50) NOT NULL,

    sync_direction VARCHAR(20) NOT NULL, -- TO_HUBSPOT, FROM_HUBSPOT
    sync_status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, PENDING

    payload_sent JSONB,
    payload_received JSONB,
    error_message TEXT,

    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hubspot_sync_tenant ON hubspot_sync_log(tenant_id);
CREATE INDEX idx_hubspot_sync_entity ON hubspot_sync_log(entity_type, entity_id);
```

## API Endpoints

### Companies

| Method | Endpoint                              | Description                 |
| ------ | ------------------------------------- | --------------------------- |
| GET    | `/api/v1/companies`                   | List companies with filters |
| POST   | `/api/v1/companies`                   | Create company              |
| GET    | `/api/v1/companies/:id`               | Get company details         |
| PUT    | `/api/v1/companies/:id`               | Update company              |
| DELETE | `/api/v1/companies/:id`               | Soft delete company         |
| GET    | `/api/v1/companies/:id/contacts`      | List company contacts       |
| GET    | `/api/v1/companies/:id/opportunities` | List company opportunities  |
| GET    | `/api/v1/companies/:id/orders`        | List company orders         |
| GET    | `/api/v1/companies/:id/activities`    | List company activities     |
| POST   | `/api/v1/companies/:id/sync-hubspot`  | Force HubSpot sync          |

### Contacts

| Method | Endpoint                            | Description                |
| ------ | ----------------------------------- | -------------------------- |
| GET    | `/api/v1/contacts`                  | List contacts with filters |
| POST   | `/api/v1/contacts`                  | Create contact             |
| GET    | `/api/v1/contacts/:id`              | Get contact details        |
| PUT    | `/api/v1/contacts/:id`              | Update contact             |
| DELETE | `/api/v1/contacts/:id`              | Soft delete contact        |
| GET    | `/api/v1/contacts/:id/activities`   | List contact activities    |
| POST   | `/api/v1/contacts/:id/sync-hubspot` | Force HubSpot sync         |

### Opportunities

| Method | Endpoint                            | Description             |
| ------ | ----------------------------------- | ----------------------- |
| GET    | `/api/v1/opportunities`             | List opportunities      |
| POST   | `/api/v1/opportunities`             | Create opportunity      |
| GET    | `/api/v1/opportunities/:id`         | Get opportunity details |
| PUT    | `/api/v1/opportunities/:id`         | Update opportunity      |
| DELETE | `/api/v1/opportunities/:id`         | Soft delete opportunity |
| PATCH  | `/api/v1/opportunities/:id/stage`   | Update stage            |
| POST   | `/api/v1/opportunities/:id/convert` | Convert to customer     |
| GET    | `/api/v1/opportunities/pipeline`    | Pipeline summary        |

### Activities

| Method | Endpoint                          | Description          |
| ------ | --------------------------------- | -------------------- |
| GET    | `/api/v1/activities`              | List activities      |
| POST   | `/api/v1/activities`              | Create activity      |
| GET    | `/api/v1/activities/:id`          | Get activity details |
| PUT    | `/api/v1/activities/:id`          | Update activity      |
| DELETE | `/api/v1/activities/:id`          | Delete activity      |
| PATCH  | `/api/v1/activities/:id/complete` | Mark task complete   |
| GET    | `/api/v1/activities/tasks/my`     | Get my tasks         |

### HubSpot Integration

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| POST   | `/api/v1/hubspot/webhook`        | HubSpot webhook handler |
| POST   | `/api/v1/hubspot/sync/companies` | Bulk sync companies     |
| POST   | `/api/v1/hubspot/sync/contacts`  | Bulk sync contacts      |
| POST   | `/api/v1/hubspot/sync/deals`     | Bulk sync deals         |
| GET    | `/api/v1/hubspot/sync/status`    | Get sync status         |
| POST   | `/api/v1/hubspot/field-mapping`  | Configure field mapping |

## Events

### Published Events

| Event                       | Trigger              | Payload              |
| --------------------------- | -------------------- | -------------------- |
| `company.created`           | New company          | Company data         |
| `company.updated`           | Company modified     | Changes + company    |
| `company.deleted`           | Company removed      | Company ID           |
| `company.tier_changed`      | Tier updated         | Old/new tier         |
| `contact.created`           | New contact          | Contact data         |
| `contact.updated`           | Contact modified     | Changes + contact    |
| `contact.deleted`           | Contact removed      | Contact ID           |
| `opportunity.created`       | New opportunity      | Opportunity data     |
| `opportunity.updated`       | Opportunity modified | Changes              |
| `opportunity.stage_changed` | Stage transition     | Old/new stage        |
| `opportunity.won`           | Deal closed won      | Opportunity + value  |
| `opportunity.lost`          | Deal closed lost     | Opportunity + reason |
| `activity.created`          | New activity         | Activity data        |
| `activity.completed`        | Task completed       | Activity data        |
| `hubspot.sync_completed`    | Sync finished        | Stats + errors       |
| `hubspot.sync_failed`       | Sync error           | Error details        |

### Subscribed Events

| Event              | Source     | Action                 |
| ------------------ | ---------- | ---------------------- |
| `order.created`    | TMS Core   | Link to company        |
| `order.completed`  | TMS Core   | Update customer stats  |
| `invoice.created`  | Accounting | Link to company        |
| `payment.received` | Accounting | Update payment history |

## Business Rules

### Company Management

1. Company names must be unique within tenant
2. Primary contact required for active customers
3. Credit limit requires approval for amounts > $100,000
4. Parent-child relationships max 3 levels deep
5. Cannot delete companies with active orders

### Opportunity Pipeline

1. Stages flow: LEAD â†’ QUALIFIED â†’ PROPOSAL â†’ NEGOTIATION â†’ WON/LOST
2. Cannot skip stages (can go backward)
3. Won opportunities auto-create customer if prospect
4. Loss reason required when marking lost
5. Expected value required to move past QUALIFIED

### HubSpot Sync

1. Internal changes sync to HubSpot within 5 minutes
2. HubSpot webhooks process in real-time
3. Conflict resolution: Last modified wins
4. Failed syncs retry 3 times with exponential backoff
5. Custom field mappings configurable per tenant

### Activity Management

1. Calls auto-log from phone integration
2. Emails sync from connected accounts
3. Overdue tasks trigger reminder notifications
4. Activities visible to assigned user + managers

## Screens

| Screen               | Description          | Features                                     |
| -------------------- | -------------------- | -------------------------------------------- |
| Company List         | Browse all companies | Search, filters, bulk actions                |
| Company Detail       | Full company view    | Tabs: Overview, Contacts, Orders, Activities |
| Company Form         | Create/edit company  | Validation, address lookup                   |
| Contact List         | Browse contacts      | Company filter, role filter                  |
| Contact Detail       | Contact profile      | Activity timeline, communication prefs       |
| Opportunity Pipeline | Kanban board         | Drag-drop stages, filters                    |
| Opportunity Detail   | Deal information     | Stage history, activities                    |
| Activity Timeline    | Activity feed        | Filter by type, date range                   |
| Task List            | My tasks             | Due date, priority sorting                   |
| HubSpot Settings     | Integration config   | Field mapping, sync settings                 |

## HubSpot Integration Details

### Authentication

- OAuth 2.0 with refresh tokens
- Scopes: `crm.objects.contacts`, `crm.objects.companies`, `crm.objects.deals`

### Field Mapping (Default)

| TMS Field                     | HubSpot Field       |
| ----------------------------- | ------------------- |
| `company.name`                | `company.name`      |
| `company.website`             | `company.website`   |
| `company.phone`               | `company.phone`     |
| `company.industry`            | `company.industry`  |
| `contact.email`               | `contact.email`     |
| `contact.first_name`          | `contact.firstname` |
| `contact.last_name`           | `contact.lastname`  |
| `opportunity.name`            | `deal.dealname`     |
| `opportunity.stage`           | `deal.dealstage`    |
| `opportunity.estimated_value` | `deal.amount`       |

### Webhook Events

| HubSpot Event            | Handler Action        |
| ------------------------ | --------------------- |
| `contact.creation`       | Create/update contact |
| `contact.propertyChange` | Update contact fields |
| `contact.deletion`       | Soft delete contact   |
| `company.creation`       | Create/update company |
| `company.propertyChange` | Update company fields |
| `deal.creation`          | Create opportunity    |
| `deal.propertyChange`    | Update opportunity    |

## Configuration

### Environment Variables

```bash
# HubSpot Integration
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
HUBSPOT_REDIRECT_URI=https://app.example.com/hubspot/callback
HUBSPOT_WEBHOOK_SECRET=webhook_verification_secret

# Sync Settings
CRM_SYNC_INTERVAL_MINUTES=5
CRM_SYNC_BATCH_SIZE=100
CRM_CONFLICT_RESOLUTION=LAST_MODIFIED
```

### Default Settings

```json
{
  "defaultPaymentTerms": "NET30",
  "defaultCreditLimit": 50000,
  "opportunityStages": [
    { "name": "LEAD", "probability": 10 },
    { "name": "QUALIFIED", "probability": 25 },
    { "name": "PROPOSAL", "probability": 50 },
    { "name": "NEGOTIATION", "probability": 75 },
    { "name": "WON", "probability": 100 },
    { "name": "LOST", "probability": 0 }
  ],
  "activityTypes": ["CALL", "EMAIL", "MEETING", "NOTE", "TASK"],
  "hubspotSyncEnabled": true
}
```

## Testing Checklist

### Unit Tests

- [ ] Company CRUD operations
- [ ] Contact CRUD operations
- [ ] Opportunity stage transitions
- [ ] Activity management
- [ ] Credit limit validation
- [ ] Parent-child relationship validation

### Integration Tests

- [ ] HubSpot OAuth flow
- [ ] HubSpot webhook processing
- [ ] Bi-directional sync
- [ ] Field mapping
- [ ] Conflict resolution
- [ ] Event publishing

### E2E Tests

- [ ] Create company with contacts
- [ ] Full opportunity pipeline flow
- [ ] Win opportunity â†’ Create customer
- [ ] Activity timeline
- [ ] HubSpot sync verification

---

**Navigation:** [â† Auth/Admin](../01-auth-admin/README.md) | [Services Index](../README.md) | [Sales â†’](../03-sales/README.md)
