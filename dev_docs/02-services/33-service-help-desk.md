# 26 - Help Desk Service

| Field            | Value                          |
| ---------------- | ------------------------------ |
| **Service ID**   | 26                             |
| **Service Name** | Help Desk                      |
| **Category**     | Support                        |
| **Module Path**  | `@modules/help-desk`           |
| **Phase**        | C (SaaS)                       |
| **Weeks**        | 53-56                          |
| **Priority**     | P2                             |
| **Dependencies** | Auth, Communication, Documents |

---

## Purpose

Internal support ticket system for managing customer inquiries, technical issues, and service requests. Provides ticket lifecycle management, SLA tracking, knowledge base, and support team collaboration tools.

---

## Features

- **Ticket Management** - Create, assign, track support tickets
- **Email Integration** - Create tickets from email
- **SLA Tracking** - Response and resolution time targets
- **Knowledge Base** - Self-service articles and FAQs
- **Canned Responses** - Pre-written reply templates
- **Escalation Rules** - Automatic ticket escalation
- **Team Queues** - Route tickets to teams
- **Priority Management** - Urgent, high, normal, low
- **Ticket Merging** - Combine duplicate tickets
- **Internal Notes** - Private team collaboration
- **Customer Satisfaction** - Post-resolution surveys
- **Reporting** - Support metrics and analytics

---

## Database Schema

```sql
-- Support Tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Ticket Identity
    ticket_number VARCHAR(20) NOT NULL,      -- TKT-{YYYYMM}-{sequence}

    -- Source
    source VARCHAR(30) NOT NULL,             -- EMAIL, PORTAL, PHONE, CHAT, INTERNAL
    source_email VARCHAR(255),
    source_phone VARCHAR(20),

    -- Requester
    requester_type VARCHAR(20) NOT NULL,     -- USER, CONTACT, ANONYMOUS
    requester_user_id UUID REFERENCES users(id),
    requester_contact_id UUID,               -- External contact
    requester_name VARCHAR(200),
    requester_email VARCHAR(255),

    -- Ticket Details
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,

    -- Classification
    category VARCHAR(50) NOT NULL,           -- TECHNICAL, BILLING, OPERATIONS, etc.
    subcategory VARCHAR(50),
    ticket_type VARCHAR(30) DEFAULT 'QUESTION', -- QUESTION, PROBLEM, INCIDENT, REQUEST

    -- Priority & Status
    priority VARCHAR(20) DEFAULT 'NORMAL',   -- URGENT, HIGH, NORMAL, LOW
    status VARCHAR(30) DEFAULT 'NEW',        -- NEW, OPEN, PENDING, ON_HOLD, RESOLVED, CLOSED

    -- Assignment
    assigned_team_id UUID REFERENCES support_teams(id),
    assigned_user_id UUID REFERENCES users(id),

    -- Related Entity
    related_type VARCHAR(50),                -- Order, Load, Invoice, etc.
    related_id UUID,

    -- SLA
    sla_policy_id UUID REFERENCES sla_policies(id),
    first_response_due_at TIMESTAMPTZ,
    resolution_due_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    sla_first_response_breached BOOLEAN DEFAULT false,
    sla_resolution_breached BOOLEAN DEFAULT false,

    -- Satisfaction
    satisfaction_rating INTEGER,             -- 1-5
    satisfaction_comment TEXT,
    satisfaction_sent_at TIMESTAMPTZ,
    satisfaction_responded_at TIMESTAMPTZ,

    -- Merging
    merged_into_id UUID REFERENCES support_tickets(id),

    -- Tracking
    reopened_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,

    UNIQUE(tenant_id, ticket_number)
);

CREATE INDEX idx_tickets_tenant ON support_tickets(tenant_id);
CREATE INDEX idx_tickets_status ON support_tickets(tenant_id, status);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_user_id, status);
CREATE INDEX idx_tickets_team ON support_tickets(assigned_team_id, status);
CREATE INDEX idx_tickets_requester ON support_tickets(requester_user_id);
CREATE INDEX idx_tickets_sla ON support_tickets(first_response_due_at, resolution_due_at);

-- Ticket Replies
CREATE TABLE ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id),

    -- Author
    author_type VARCHAR(20) NOT NULL,        -- AGENT, REQUESTER, SYSTEM
    author_user_id UUID REFERENCES users(id),
    author_name VARCHAR(200),
    author_email VARCHAR(255),

    -- Content
    body TEXT NOT NULL,
    body_html TEXT,

    -- Type
    reply_type VARCHAR(30) NOT NULL,         -- PUBLIC, INTERNAL_NOTE, SYSTEM

    -- Email
    email_message_id VARCHAR(200),

    -- Attachments (handled via Documents service)
    attachment_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id, created_at);

-- Support Teams
CREATE TABLE support_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Team Details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    email VARCHAR(255),                      -- Team email address

    -- Settings
    auto_assign BOOLEAN DEFAULT false,       -- Auto-assign to team members
    assignment_method VARCHAR(20) DEFAULT 'ROUND_ROBIN', -- ROUND_ROBIN, LOAD_BALANCED

    -- Manager
    manager_id UUID REFERENCES users(id),

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_teams_tenant ON support_teams(tenant_id);

-- Team Members
CREATE TABLE support_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES support_teams(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Role
    role VARCHAR(20) DEFAULT 'MEMBER',       -- LEAD, MEMBER

    -- Capacity
    max_open_tickets INTEGER DEFAULT 20,
    current_ticket_count INTEGER DEFAULT 0,

    -- Status
    is_available BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(team_id, user_id)
);

-- SLA Policies
CREATE TABLE sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Policy Details
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Conditions (when to apply)
    conditions JSONB NOT NULL,               -- {priority: ['URGENT'], category: ['TECHNICAL']}

    -- Targets (in minutes)
    first_response_target INTEGER NOT NULL,  -- Time to first response
    resolution_target INTEGER NOT NULL,      -- Time to resolution

    -- Business Hours
    use_business_hours BOOLEAN DEFAULT true,

    -- Priority
    priority INTEGER DEFAULT 0,              -- Higher = check first

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sla_policies_tenant ON sla_policies(tenant_id);

-- Escalation Rules
CREATE TABLE escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Rule Details
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Trigger
    trigger_type VARCHAR(30) NOT NULL,       -- SLA_BREACH, NO_RESPONSE, CUSTOMER_REPLY
    trigger_minutes INTEGER,                 -- Minutes after trigger

    -- Conditions
    conditions JSONB,                        -- {priority: ['URGENT']}

    -- Actions
    action_type VARCHAR(30) NOT NULL,        -- NOTIFY, REASSIGN, CHANGE_PRIORITY
    action_config JSONB NOT NULL,            -- {notify_users: [], reassign_to: 'team_id'}

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canned Responses
CREATE TABLE canned_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Response Details
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT,

    -- Organization
    category VARCHAR(50),
    shortcut VARCHAR(50),                    -- Quick access code

    -- Scope
    visibility VARCHAR(20) DEFAULT 'TEAM',   -- PERSONAL, TEAM, ALL
    created_by UUID REFERENCES users(id),
    team_id UUID REFERENCES support_teams(id),

    -- Usage
    use_count INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_canned_responses_tenant ON canned_responses(tenant_id);

-- Knowledge Base Categories
CREATE TABLE kb_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Category Details
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),

    -- Hierarchy
    parent_id UUID REFERENCES kb_categories(id),

    -- Ordering
    display_order INTEGER DEFAULT 0,

    -- Visibility
    is_public BOOLEAN DEFAULT true,          -- Visible to customers

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, slug)
);

-- Knowledge Base Articles
CREATE TABLE kb_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    category_id UUID NOT NULL REFERENCES kb_categories(id),

    -- Article Details
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    content_html TEXT,

    -- Author
    author_id UUID REFERENCES users(id),

    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    keywords JSONB DEFAULT '[]',

    -- Visibility
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,

    -- Status
    status VARCHAR(20) DEFAULT 'DRAFT',      -- DRAFT, PUBLISHED, ARCHIVED
    published_at TIMESTAMPTZ,

    -- Metrics
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- Version
    version INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_kb_articles_tenant ON kb_articles(tenant_id);
CREATE INDEX idx_kb_articles_category ON kb_articles(category_id);
CREATE INDEX idx_kb_articles_status ON kb_articles(status, is_public);

-- Ticket Tags
CREATE TABLE ticket_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Tag Details
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366F1',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, name)
);

-- Ticket Tag Assignments
CREATE TABLE ticket_tag_assignments (
    ticket_id UUID NOT NULL REFERENCES support_tickets(id),
    tag_id UUID NOT NULL REFERENCES ticket_tags(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY(ticket_id, tag_id)
);
```

---

## API Endpoints

### Tickets

| Method | Endpoint                               | Description        |
| ------ | -------------------------------------- | ------------------ |
| GET    | `/api/v1/support/tickets`              | List tickets       |
| POST   | `/api/v1/support/tickets`              | Create ticket      |
| GET    | `/api/v1/support/tickets/:id`          | Get ticket details |
| PUT    | `/api/v1/support/tickets/:id`          | Update ticket      |
| DELETE | `/api/v1/support/tickets/:id`          | Delete ticket      |
| POST   | `/api/v1/support/tickets/:id/reply`    | Add reply          |
| POST   | `/api/v1/support/tickets/:id/note`     | Add internal note  |
| POST   | `/api/v1/support/tickets/:id/assign`   | Assign ticket      |
| POST   | `/api/v1/support/tickets/:id/escalate` | Escalate ticket    |
| POST   | `/api/v1/support/tickets/:id/merge`    | Merge tickets      |
| POST   | `/api/v1/support/tickets/:id/resolve`  | Resolve ticket     |
| POST   | `/api/v1/support/tickets/:id/reopen`   | Reopen ticket      |
| POST   | `/api/v1/support/tickets/:id/close`    | Close ticket       |
| GET    | `/api/v1/support/tickets/:id/history`  | Get ticket history |
| POST   | `/api/v1/support/tickets/from-email`   | Create from email  |

### Queue Management

| Method | Endpoint                             | Description        |
| ------ | ------------------------------------ | ------------------ |
| GET    | `/api/v1/support/queue`              | My ticket queue    |
| GET    | `/api/v1/support/queue/unassigned`   | Unassigned tickets |
| GET    | `/api/v1/support/queue/team/:teamId` | Team queue         |
| POST   | `/api/v1/support/queue/claim/:id`    | Claim ticket       |

### Teams

| Method | Endpoint                                    | Description   |
| ------ | ------------------------------------------- | ------------- |
| GET    | `/api/v1/support/teams`                     | List teams    |
| POST   | `/api/v1/support/teams`                     | Create team   |
| GET    | `/api/v1/support/teams/:id`                 | Get team      |
| PUT    | `/api/v1/support/teams/:id`                 | Update team   |
| GET    | `/api/v1/support/teams/:id/members`         | List members  |
| POST   | `/api/v1/support/teams/:id/members`         | Add member    |
| DELETE | `/api/v1/support/teams/:id/members/:userId` | Remove member |

### SLA & Escalation

| Method | Endpoint                           | Description       |
| ------ | ---------------------------------- | ----------------- |
| GET    | `/api/v1/support/sla-policies`     | List SLA policies |
| POST   | `/api/v1/support/sla-policies`     | Create policy     |
| PUT    | `/api/v1/support/sla-policies/:id` | Update policy     |
| GET    | `/api/v1/support/escalation-rules` | List rules        |
| POST   | `/api/v1/support/escalation-rules` | Create rule       |

### Knowledge Base

| Method | Endpoint                                   | Description     |
| ------ | ------------------------------------------ | --------------- |
| GET    | `/api/v1/support/kb/categories`            | List categories |
| POST   | `/api/v1/support/kb/categories`            | Create category |
| GET    | `/api/v1/support/kb/articles`              | List articles   |
| POST   | `/api/v1/support/kb/articles`              | Create article  |
| GET    | `/api/v1/support/kb/articles/:id`          | Get article     |
| PUT    | `/api/v1/support/kb/articles/:id`          | Update article  |
| POST   | `/api/v1/support/kb/articles/:id/publish`  | Publish article |
| POST   | `/api/v1/support/kb/articles/:id/feedback` | Submit feedback |
| GET    | `/api/v1/support/kb/search`                | Search articles |

### Canned Responses

| Method | Endpoint                               | Description     |
| ------ | -------------------------------------- | --------------- |
| GET    | `/api/v1/support/canned-responses`     | List responses  |
| POST   | `/api/v1/support/canned-responses`     | Create response |
| PUT    | `/api/v1/support/canned-responses/:id` | Update response |
| DELETE | `/api/v1/support/canned-responses/:id` | Delete response |

### Reporting

| Method | Endpoint                                    | Description     |
| ------ | ------------------------------------------- | --------------- |
| GET    | `/api/v1/support/reports/overview`          | Overview stats  |
| GET    | `/api/v1/support/reports/sla`               | SLA performance |
| GET    | `/api/v1/support/reports/agent-performance` | Agent metrics   |
| GET    | `/api/v1/support/reports/satisfaction`      | CSAT report     |

---

## Events

### Published Events

| Event                 | Trigger             | Payload          |
| --------------------- | ------------------- | ---------------- |
| `ticket.created`      | New ticket          | Ticket details   |
| `ticket.assigned`     | Ticket assigned     | Ticket, assignee |
| `ticket.replied`      | Reply added         | Ticket, reply    |
| `ticket.escalated`    | Ticket escalated    | Ticket, reason   |
| `ticket.resolved`     | Ticket resolved     | Ticket           |
| `ticket.closed`       | Ticket closed       | Ticket           |
| `ticket.sla_warning`  | SLA breach imminent | Ticket, SLA      |
| `ticket.sla_breached` | SLA breached        | Ticket, SLA      |

### Subscribed Events

| Event                  | Action                   |
| ---------------------- | ------------------------ |
| `email.received`       | Create ticket from email |
| `order.issue_reported` | Create linked ticket     |

---

## Business Rules

### Ticket Lifecycle

1. **Status Flow**: New â†’ Open â†’ Pending â†’ Resolved â†’ Closed
2. **Auto-Close**: Resolved tickets close after 7 days no response
3. **Reopen Limit**: Max 3 reopens per ticket
4. **First Response**: Clock starts at ticket creation
5. **Pending Status**: Pauses SLA timers

### SLA Calculation

1. **Business Hours**: Apply business hours calendar
2. **Holiday Exclusion**: Exclude holidays from SLA
3. **Policy Matching**: First matching policy applies
4. **Breach Notification**: Alert at 80% of target
5. **Override**: Manual SLA override with reason

### Assignment

1. **Round Robin**: Even distribution across team
2. **Load Balanced**: Consider current workload
3. **Skill-Based**: Match ticket category to skills
4. **Auto-Assign**: New tickets to team queue

### Knowledge Base

1. **Draft Review**: Require review before publish
2. **Version History**: Track all changes
3. **Feedback Loop**: Link articles to resolved tickets

---

## Screens

| Screen            | Description                   |
| ----------------- | ----------------------------- |
| Ticket List       | View and filter tickets       |
| Ticket Detail     | Full ticket view with replies |
| My Queue          | Agent's assigned tickets      |
| Team Queue        | Team's tickets                |
| Unassigned        | Tickets needing assignment    |
| Create Ticket     | New ticket form               |
| Knowledge Base    | Article listing               |
| Article Editor    | Create/edit articles          |
| Support Dashboard | Metrics overview              |
| SLA Management    | Configure SLAs                |

---

## Configuration

### Environment Variables

```bash
# Email Integration
SUPPORT_EMAIL_ENABLED=true
SUPPORT_EMAIL_ADDRESS=support@company.com

# SLA Defaults
SLA_DEFAULT_FIRST_RESPONSE_MINUTES=60
SLA_DEFAULT_RESOLUTION_MINUTES=480

# Auto-Close
TICKET_AUTO_CLOSE_DAYS=7
TICKET_MAX_REOPENS=3

# Satisfaction Survey
CSAT_SURVEY_ENABLED=true
CSAT_SURVEY_DELAY_HOURS=24
```

---

## Testing Checklist

### Unit Tests

- [ ] Ticket number generation
- [ ] SLA calculation with business hours
- [ ] Escalation rule evaluation
- [ ] Assignment algorithm
- [ ] Status transition validation

### Integration Tests

- [ ] Email to ticket creation
- [ ] SLA breach notifications
- [ ] Escalation execution
- [ ] Knowledge base search

### E2E Tests

- [ ] Full ticket lifecycle
- [ ] Agent assignment flow
- [ ] Customer satisfaction survey
- [ ] Knowledge base workflow

---

## Navigation

- **Previous:** [25 - Cache](../25-cache/README.md)
- **Next:** [27 - Feedback](../27-feedback/README.md)
- **Index:** [All Services](../README.md)
