# 32 - Load Board Service

| Field            | Value                          |
| ---------------- | ------------------------------ |
| **Service ID**   | 32                             |
| **Service Name** | Load Board                     |
| **Category**     | Extended                       |
| **Module Path**  | `@modules/load-board`          |
| **Phase**        | A (MVP)                        |
| **Weeks**        | 67-70                          |
| **Priority**     | P1                             |
| **Dependencies** | Auth, TMS Core, Carrier, Sales |

---

## Purpose

Load board integration service for posting available loads and finding capacity on external load boards (DAT, Truckstop, 123Loadboard, Trucker Path). Enables automated posting of available freight, real-time capacity search, load matching, and carrier discovery from the largest freight marketplace networks.

---

## Features

- **Multi-Board Support** - DAT, Truckstop, 123Loadboard, Trucker Path
- **Load Posting** - Post loads to multiple boards simultaneously
- **Capacity Search** - Search for available trucks and carriers
- **Auto-Posting** - Automatic posting of unassigned loads
- **Post Management** - Update, refresh, and remove posts
- **Carrier Discovery** - Find new carriers from board inquiries
- **Rate Insights** - Leverage board rate data for pricing
- **Post Analytics** - Track post performance and responses
- **Lead Capture** - Capture and route carrier inquiries
- **Posting Rules** - Conditional posting based on criteria
- **Bulk Operations** - Mass post/remove capabilities
- **Scheduling** - Schedule posts for optimal visibility

---

## Database Schema

```sql
-- Load Board Providers
CREATE TABLE load_board_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Provider Info
    provider_code VARCHAR(20) NOT NULL UNIQUE,      -- DAT, TRUCKSTOP, 123LOADBOARD, TRUCKERPATH
    provider_name VARCHAR(100) NOT NULL,

    -- API Info
    api_base_url VARCHAR(500),
    api_version VARCHAR(20),

    -- Features
    supports_posting BOOLEAN DEFAULT true,
    supports_searching BOOLEAN DEFAULT true,
    supports_rate_data BOOLEAN DEFAULT false,
    supports_carrier_data BOOLEAN DEFAULT false,

    -- Limits
    max_posts_per_hour INTEGER,
    max_searches_per_hour INTEGER,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant Board Accounts
CREATE TABLE load_board_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider_id UUID NOT NULL REFERENCES load_board_providers(id),

    -- Account Info
    account_name VARCHAR(100) NOT NULL,
    username VARCHAR(100),

    -- Authentication (encrypted)
    credentials JSONB NOT NULL,                     -- API key, username/password, OAuth tokens

    -- Company Info for Posts
    company_name VARCHAR(200) NOT NULL,
    mc_number VARCHAR(10),
    dot_number VARCHAR(10),
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(200),

    -- Posting Defaults
    default_contact_phone VARCHAR(20),
    default_comment_template TEXT,

    -- Settings
    auto_post_enabled BOOLEAN DEFAULT false,
    auto_post_delay_minutes INTEGER DEFAULT 30,     -- Delay before auto-posting
    auto_refresh_enabled BOOLEAN DEFAULT true,
    refresh_interval_hours INTEGER DEFAULT 4,
    auto_remove_on_book BOOLEAN DEFAULT true,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',            -- ACTIVE, SUSPENDED, EXPIRED
    connection_status VARCHAR(20) DEFAULT 'UNKNOWN',
    last_connection_at TIMESTAMPTZ,
    last_error TEXT,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    UNIQUE(tenant_id, provider_id, username)
);

CREATE INDEX idx_load_board_accounts_tenant ON load_board_accounts(tenant_id);
CREATE INDEX idx_load_board_accounts_provider ON load_board_accounts(provider_id);

-- Load Posts (loads posted to boards)
CREATE TABLE load_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_id UUID NOT NULL REFERENCES loads(id),
    account_id UUID NOT NULL REFERENCES load_board_accounts(id),

    -- Post Identification
    provider_post_id VARCHAR(100),                  -- ID returned by load board
    post_reference VARCHAR(50),                     -- Our reference

    -- Post Status
    post_status VARCHAR(20) DEFAULT 'PENDING',      -- PENDING, POSTED, REFRESHED, REMOVED, FAILED
    posted_at TIMESTAMPTZ,
    refreshed_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Post Details (snapshot at time of posting)
    origin_city VARCHAR(100) NOT NULL,
    origin_state VARCHAR(2) NOT NULL,
    origin_zip VARCHAR(10),
    destination_city VARCHAR(100) NOT NULL,
    destination_state VARCHAR(2) NOT NULL,
    destination_zip VARCHAR(10),

    pickup_date DATE NOT NULL,
    pickup_date_end DATE,                           -- For date ranges
    delivery_date DATE,

    equipment_type VARCHAR(50) NOT NULL,
    equipment_length INTEGER,
    weight INTEGER,

    -- Rate Info
    rate_type VARCHAR(20),                          -- ALL_IN, PER_MILE, OPEN
    rate_amount DECIMAL(10,2),
    rate_per_mile DECIMAL(8,2),
    total_miles INTEGER,

    -- Additional Details
    full_or_partial VARCHAR(10),                    -- FULL, PARTIAL
    commodity VARCHAR(200),
    comments TEXT,

    -- Post Settings
    contact_phone VARCHAR(20),
    contact_name VARCHAR(100),

    -- Posting Method
    posted_manually BOOLEAN DEFAULT false,
    posted_by UUID REFERENCES users(id),

    -- Response Tracking
    views_count INTEGER DEFAULT 0,
    calls_count INTEGER DEFAULT 0,
    emails_count INTEGER DEFAULT 0,

    -- Errors
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_load_posts_tenant ON load_posts(tenant_id);
CREATE INDEX idx_load_posts_load ON load_posts(load_id);
CREATE INDEX idx_load_posts_account ON load_posts(account_id);
CREATE INDEX idx_load_posts_status ON load_posts(post_status);
CREATE INDEX idx_load_posts_expires ON load_posts(expires_at);
CREATE INDEX idx_load_posts_provider ON load_posts(provider_post_id);

-- Post Leads (responses/inquiries from posts)
CREATE TABLE post_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_post_id UUID NOT NULL REFERENCES load_posts(id),
    load_id UUID NOT NULL REFERENCES loads(id),

    -- Lead Source
    source_board VARCHAR(20) NOT NULL,              -- Provider code
    lead_type VARCHAR(20) NOT NULL,                 -- CALL, EMAIL, BOOK_NOW, INQUIRY

    -- Contact Info
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(200),
    company_name VARCHAR(200),
    mc_number VARCHAR(10),
    dot_number VARCHAR(10),

    -- Carrier Match
    carrier_id UUID REFERENCES carriers(id),        -- If matched to existing carrier
    carrier_matched_at TIMESTAMPTZ,

    -- Inquiry Details
    inquiry_message TEXT,
    offered_rate DECIMAL(10,2),
    equipment_offered VARCHAR(50),
    available_date DATE,

    -- Lead Status
    status VARCHAR(20) DEFAULT 'NEW',               -- NEW, CONTACTED, QUALIFIED, BOOKED, DECLINED, SPAM

    -- Follow-up
    assigned_to UUID REFERENCES users(id),
    contacted_at TIMESTAMPTZ,
    contacted_by UUID REFERENCES users(id),
    follow_up_notes TEXT,

    -- Outcome
    outcome VARCHAR(20),                            -- BOOKED, RATE_TOO_HIGH, EQUIPMENT_MISMATCH, NO_RESPONSE
    outcome_notes TEXT,

    -- Provider Data
    provider_lead_id VARCHAR(100),
    raw_data JSONB,

    -- Timestamps
    received_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_leads_load_post ON post_leads(load_post_id);
CREATE INDEX idx_post_leads_load ON post_leads(load_id);
CREATE INDEX idx_post_leads_carrier ON post_leads(carrier_id);
CREATE INDEX idx_post_leads_status ON post_leads(status);
CREATE INDEX idx_post_leads_mc ON post_leads(mc_number);

-- Capacity Searches
CREATE TABLE capacity_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    account_id UUID NOT NULL REFERENCES load_board_accounts(id),

    -- Search Criteria
    origin_city VARCHAR(100),
    origin_state VARCHAR(2),
    origin_zip VARCHAR(10),
    origin_radius_miles INTEGER,

    destination_city VARCHAR(100),
    destination_state VARCHAR(2),
    destination_zip VARCHAR(10),
    destination_radius_miles INTEGER,

    available_date_from DATE,
    available_date_to DATE,

    equipment_types VARCHAR(50)[],

    -- Search Context
    related_load_id UUID REFERENCES loads(id),

    -- Results
    search_status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, COMPLETED, FAILED
    results_count INTEGER DEFAULT 0,
    searched_at TIMESTAMPTZ,

    -- Errors
    error_message TEXT,

    -- Metadata
    search_duration_ms INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_capacity_searches_tenant ON capacity_searches(tenant_id);
CREATE INDEX idx_capacity_searches_load ON capacity_searches(related_load_id);

-- Capacity Search Results
CREATE TABLE capacity_search_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID NOT NULL REFERENCES capacity_searches(id) ON DELETE CASCADE,

    -- Truck Info
    provider_result_id VARCHAR(100),
    source_board VARCHAR(20) NOT NULL,

    -- Carrier Info
    company_name VARCHAR(200),
    mc_number VARCHAR(10),
    dot_number VARCHAR(10),
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(200),

    -- Carrier Match
    matched_carrier_id UUID REFERENCES carriers(id),

    -- Truck Details
    equipment_type VARCHAR(50),
    equipment_length INTEGER,
    available_date DATE,

    -- Location
    origin_city VARCHAR(100),
    origin_state VARCHAR(2),
    destination_preference VARCHAR(200),            -- Where they want to go

    -- Additional Info
    truck_type VARCHAR(50),                         -- SOLO, TEAM
    driver_type VARCHAR(50),                        -- OWNER_OP, COMPANY

    -- Rate
    target_rate DECIMAL(10,2),
    target_rate_per_mile DECIMAL(8,2),

    -- Actions
    contacted BOOLEAN DEFAULT false,
    contacted_at TIMESTAMPTZ,
    contacted_by UUID REFERENCES users(id),
    contact_result VARCHAR(50),
    notes TEXT,

    -- Raw Data
    raw_data JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capacity_results_search ON capacity_search_results(search_id);
CREATE INDEX idx_capacity_results_mc ON capacity_search_results(mc_number);
CREATE INDEX idx_capacity_results_carrier ON capacity_search_results(matched_carrier_id);

-- Posting Rules (conditions for auto-posting)
CREATE TABLE posting_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Rule Info
    rule_name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Conditions (when to apply)
    conditions JSONB NOT NULL,                      -- Lane, equipment, customer, etc.

    -- Actions
    auto_post BOOLEAN DEFAULT true,
    post_accounts UUID[],                           -- Which accounts to post to
    post_delay_minutes INTEGER DEFAULT 30,

    -- Post Settings Override
    rate_adjustment_type VARCHAR(20),               -- NONE, PERCENTAGE, FLAT
    rate_adjustment_value DECIMAL(10,2),
    custom_comments TEXT,

    -- Priority
    priority INTEGER DEFAULT 100,                   -- Lower = higher priority

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_posting_rules_tenant ON posting_rules(tenant_id);
CREATE INDEX idx_posting_rules_active ON posting_rules(is_active);

-- Post Refresh Queue
CREATE TABLE post_refresh_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_post_id UUID NOT NULL REFERENCES load_posts(id),

    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    refresh_type VARCHAR(20) NOT NULL,              -- SCHEDULED, MANUAL

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',           -- PENDING, PROCESSING, COMPLETED, FAILED
    processed_at TIMESTAMPTZ,

    -- Result
    success BOOLEAN,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_refresh_queue_scheduled ON post_refresh_queue(scheduled_at);
CREATE INDEX idx_post_refresh_queue_status ON post_refresh_queue(status);

-- Post Analytics (aggregated stats)
CREATE TABLE post_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Time Period
    date DATE NOT NULL,

    -- Dimensions
    provider_code VARCHAR(20),
    origin_state VARCHAR(2),
    destination_state VARCHAR(2),
    equipment_type VARCHAR(50),

    -- Metrics
    posts_count INTEGER DEFAULT 0,
    refreshes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    booked_count INTEGER DEFAULT 0,

    -- Rates
    avg_posted_rate DECIMAL(10,2),
    avg_booked_rate DECIMAL(10,2),

    -- Timing
    avg_time_to_book_hours DECIMAL(8,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, date, provider_code, origin_state, destination_state, equipment_type)
);

CREATE INDEX idx_post_analytics_tenant_date ON post_analytics(tenant_id, date);
```

---

## API Endpoints

| Method              | Endpoint                                        | Description              |
| ------------------- | ----------------------------------------------- | ------------------------ |
| **Board Accounts**  |
| GET                 | `/api/load-board/accounts`                      | List load board accounts |
| POST                | `/api/load-board/accounts`                      | Add load board account   |
| GET                 | `/api/load-board/accounts/{id}`                 | Get account details      |
| PUT                 | `/api/load-board/accounts/{id}`                 | Update account           |
| DELETE              | `/api/load-board/accounts/{id}`                 | Remove account           |
| POST                | `/api/load-board/accounts/{id}/test`            | Test connection          |
| **Load Posting**    |
| GET                 | `/api/load-board/posts`                         | List posted loads        |
| POST                | `/api/load-board/posts`                         | Post load to boards      |
| GET                 | `/api/load-board/posts/{id}`                    | Get post details         |
| PUT                 | `/api/load-board/posts/{id}`                    | Update post              |
| POST                | `/api/load-board/posts/{id}/refresh`            | Refresh post             |
| DELETE              | `/api/load-board/posts/{id}`                    | Remove post              |
| POST                | `/api/load-board/posts/bulk`                    | Bulk post loads          |
| DELETE              | `/api/load-board/posts/bulk`                    | Bulk remove posts        |
| GET                 | `/api/load-board/loads/{loadId}/posts`          | Get posts for load       |
| **Capacity Search** |
| POST                | `/api/load-board/capacity/search`               | Search for trucks        |
| GET                 | `/api/load-board/capacity/searches`             | List recent searches     |
| GET                 | `/api/load-board/capacity/searches/{id}`        | Get search results       |
| POST                | `/api/load-board/capacity/results/{id}/contact` | Log contact attempt      |
| **Leads**           |
| GET                 | `/api/load-board/leads`                         | List leads               |
| GET                 | `/api/load-board/leads/{id}`                    | Get lead details         |
| PUT                 | `/api/load-board/leads/{id}`                    | Update lead              |
| POST                | `/api/load-board/leads/{id}/assign`             | Assign lead              |
| POST                | `/api/load-board/leads/{id}/contact`            | Log contact              |
| POST                | `/api/load-board/leads/{id}/qualify`            | Qualify lead             |
| POST                | `/api/load-board/leads/{id}/convert`            | Convert to carrier       |
| **Posting Rules**   |
| GET                 | `/api/load-board/rules`                         | List posting rules       |
| POST                | `/api/load-board/rules`                         | Create rule              |
| GET                 | `/api/load-board/rules/{id}`                    | Get rule details         |
| PUT                 | `/api/load-board/rules/{id}`                    | Update rule              |
| DELETE              | `/api/load-board/rules/{id}`                    | Delete rule              |
| **Analytics**       |
| GET                 | `/api/load-board/analytics/posts`               | Post performance metrics |
| GET                 | `/api/load-board/analytics/leads`               | Lead conversion metrics  |
| GET                 | `/api/load-board/analytics/boards`              | Board comparison         |
| **Webhooks**        |
| POST                | `/api/load-board/webhooks/dat`                  | DAT webhook handler      |
| POST                | `/api/load-board/webhooks/truckstop`            | Truckstop webhook        |

---

## Events

### Published Events

| Event                         | Trigger                   | Payload                |
| ----------------------------- | ------------------------- | ---------------------- |
| `loadboard.account.connected` | Account connected         | accountId, provider    |
| `loadboard.account.error`     | Connection error          | accountId, error       |
| `loadboard.post.created`      | Load posted               | postId, loadId, boards |
| `loadboard.post.refreshed`    | Post refreshed            | postId                 |
| `loadboard.post.removed`      | Post removed              | postId, loadId         |
| `loadboard.post.failed`       | Post failed               | postId, error          |
| `loadboard.post.expiring`     | Post expiring soon        | postId, expiresAt      |
| `loadboard.lead.received`     | New lead received         | leadId, loadId, source |
| `loadboard.lead.qualified`    | Lead qualified            | leadId, carrierId      |
| `loadboard.lead.converted`    | Lead converted to carrier | leadId, carrierId      |
| `loadboard.capacity.found`    | Capacity search complete  | searchId, resultCount  |

### Subscribed Events

| Event              | Source    | Action                 |
| ------------------ | --------- | ---------------------- |
| `load.created`     | TMS       | Evaluate posting rules |
| `load.updated`     | TMS       | Update active posts    |
| `load.assigned`    | TMS       | Remove posts for load  |
| `load.cancelled`   | TMS       | Remove posts for load  |
| `carrier.created`  | Carrier   | Match to pending leads |
| `scheduler.hourly` | Scheduler | Refresh expiring posts |

---

## Business Rules

### Load Posting

1. Only post loads with status AVAILABLE or PENDING
2. Auto-remove posts when load is booked
3. Auto-refresh posts per account settings
4. Apply posting rules to determine which boards
5. Rate posting rate limits per board
6. Include required fields per board specs

### Auto-Posting

1. Check posting rules for matching conditions
2. Delay posting by configured minutes
3. Cancel auto-post if load assigned before delay
4. Post to all accounts matching rule
5. Log all auto-posting decisions

### Post Refresh

1. Refresh posts before expiration (typically 24 hours)
2. Update post if load details changed
3. Track refresh count and history
4. Remove and repost if refresh fails

### Lead Management

1. Capture all inbound inquiries
2. Match to existing carriers by MC/DOT
3. Auto-assign to load owner or dispatch
4. Track lead through qualification
5. Convert qualified leads to carrier records

### Capacity Search

1. Search across configured boards
2. Match results to existing carriers
3. Flag known carriers vs. new
4. Track contact attempts
5. Respect API rate limits

### Board Priorities

1. DAT - largest network, best for FTL
2. Truckstop - strong carrier base
3. 123Loadboard - budget option
4. Trucker Path - mobile-first carriers

---

## Screens

| Screen               | Description                  |
| -------------------- | ---------------------------- |
| Load Board Dashboard | Overview of posting activity |
| Account Management   | Manage load board accounts   |
| Post Load            | Post load to boards          |
| Active Posts         | View all active posts        |
| Post Detail          | View post status and leads   |
| Bulk Posting         | Post multiple loads          |
| Lead List            | View all leads               |
| Lead Detail          | View/manage lead             |
| Lead Qualification   | Qualify and convert leads    |
| Capacity Search      | Search for available trucks  |
| Search Results       | View and contact results     |
| Posting Rules        | Manage auto-posting rules    |
| Rule Builder         | Create/edit posting rules    |
| Board Analytics      | Performance by board         |
| Lead Analytics       | Lead conversion metrics      |

---

## Configuration

### Environment Variables

```env
# DAT
DAT_API_URL=https://api.dat.com
DAT_CLIENT_ID=your_client_id
DAT_CLIENT_SECRET=your_secret

# Truckstop
TRUCKSTOP_API_URL=https://api.truckstop.com
TRUCKSTOP_API_KEY=your_api_key

# 123Loadboard
LOADBOARD123_API_URL=https://api.123loadboard.com
LOADBOARD123_API_KEY=your_key

# Trucker Path
TRUCKERPATH_API_URL=https://api.truckerpath.com
TRUCKERPATH_API_KEY=your_key

# Settings
POST_REFRESH_HOURS=4
POST_EXPIRY_HOURS=24
AUTO_POST_DELAY_MINUTES=30
MAX_POSTS_PER_BATCH=50
```

### Default Settings

```json
{
  "loadBoard": {
    "posting": {
      "autoPostEnabled": false,
      "autoPostDelayMinutes": 30,
      "autoRefreshEnabled": true,
      "refreshIntervalHours": 4,
      "autoRemoveOnBook": true,
      "defaultExpiryHours": 24
    },
    "search": {
      "defaultRadiusMiles": 100,
      "maxResultsPerBoard": 50,
      "cacheDurationMinutes": 15
    },
    "leads": {
      "autoAssignToOwner": true,
      "notifyOnNewLead": true,
      "matchToExistingCarriers": true
    },
    "rateLimits": {
      "postsPerHour": 100,
      "searchesPerHour": 50
    }
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Posting rule evaluation
- [ ] Lead matching logic
- [ ] Rate limit checking
- [ ] Post expiry calculation
- [ ] Bulk post batching

### Integration Tests

- [ ] DAT API integration
- [ ] Truckstop API integration
- [ ] Webhook handling
- [ ] Lead capture flow
- [ ] Capacity search

### E2E Tests

- [ ] Post load to multiple boards
- [ ] Auto-posting with rules
- [ ] Lead receive to carrier conversion
- [ ] Capacity search and contact
- [ ] Auto-remove on booking

---

## Navigation

- **Previous:** [31 - Factoring](../31-factoring/README.md)
- **Next:** [33 - Mobile App](../33-mobile-app/README.md)
- **Index:** [All Services](../README.md)
