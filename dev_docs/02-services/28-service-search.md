# 21 - Search Service

| Field            | Value                         |
| ---------------- | ----------------------------- |
| **Service ID**   | 21                            |
| **Service Name** | Search                        |
| **Category**     | Platform                      |
| **Module Path**  | `@modules/search`             |
| **Phase**        | A (MVP)                       |
| **Weeks**        | 43-44                         |
| **Priority**     | P2                            |
| **Dependencies** | Auth, all searchable services |

---

## Purpose

Enterprise search platform providing full-text search, filtering, faceted navigation, and saved searches across all platform entities. Uses Elasticsearch for high-performance indexing and query capabilities with real-time updates.

---

## Features

- **Full-Text Search** - Natural language search across all entities
- **Faceted Navigation** - Filter by attributes, status, dates, etc.
- **Type-Ahead** - Instant suggestions as you type
- **Fuzzy Matching** - Tolerance for typos and variations
- **Saved Searches** - Save and share frequently used searches
- **Recent Searches** - Quick access to search history
- **Global Search** - Single search bar across all modules
- **Advanced Query** - Boolean operators, wildcards, phrases
- **Highlighting** - Show matching terms in results
- **Relevance Tuning** - Boost important fields
- **Real-Time Indexing** - Updates reflected immediately
- **Multi-Language** - Support for Spanish and English

---

## Database Schema

```sql
-- Search Index Configuration
CREATE TABLE search_indexes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for global indexes

    -- Index Identity
    index_name VARCHAR(100) NOT NULL,        -- orders, carriers, loads, etc.
    entity_type VARCHAR(50) NOT NULL,        -- Entity being indexed

    -- Configuration
    mapping JSONB NOT NULL,                  -- Elasticsearch mapping
    settings JSONB DEFAULT '{}',             -- Index settings
    analyzers JSONB DEFAULT '{}',            -- Custom analyzers

    -- Field Weights (for relevance)
    field_boosts JSONB DEFAULT '{}',         -- field -> boost factor

    -- Sync Config
    sync_enabled BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    last_full_reindex_at TIMESTAMPTZ,
    document_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, REBUILDING, ERROR
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_indexes_tenant ON search_indexes(tenant_id);

-- Saved Searches
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Search Definition
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Query
    entity_type VARCHAR(50) NOT NULL,        -- orders, loads, carriers, etc.
    query_text VARCHAR(500),                 -- Original search text
    filters JSONB DEFAULT '{}',              -- Applied filters
    sort_field VARCHAR(100),
    sort_direction VARCHAR(4) DEFAULT 'DESC',
    columns JSONB,                           -- Custom column selection

    -- Sharing
    is_shared BOOLEAN DEFAULT false,
    shared_with JSONB,                       -- User/role IDs
    is_system BOOLEAN DEFAULT false,         -- Pre-built by system

    -- Usage
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Organization
    category VARCHAR(50),                    -- Personal categorization
    is_pinned BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(tenant_id, user_id);
CREATE INDEX idx_saved_searches_shared ON saved_searches(tenant_id, is_shared);
CREATE INDEX idx_saved_searches_entity ON saved_searches(tenant_id, entity_type);

-- Search History
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Search Details
    query_text VARCHAR(500) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    filters JSONB DEFAULT '{}',

    -- Results
    result_count INTEGER,
    time_ms INTEGER,                         -- Search execution time

    -- Context
    source VARCHAR(50),                      -- global_search, module_search, etc.
    session_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(tenant_id, user_id, created_at DESC);
CREATE INDEX idx_search_history_query ON search_history(tenant_id, query_text);

-- Search Suggestions (type-ahead)
CREATE TABLE search_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Suggestion
    suggestion_text VARCHAR(200) NOT NULL,
    display_text VARCHAR(300),               -- Formatted display
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,                          -- Link to actual entity

    -- Metadata
    category VARCHAR(50),                    -- company, carrier, load, etc.
    icon VARCHAR(50),                        -- Icon to display

    -- Ranking
    popularity INTEGER DEFAULT 0,            -- Usage frequency
    priority INTEGER DEFAULT 0,              -- Manual boost

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suggestions_tenant ON search_suggestions(tenant_id);
CREATE INDEX idx_suggestions_text ON search_suggestions(tenant_id, suggestion_text);
CREATE INDEX idx_suggestions_entity ON search_suggestions(tenant_id, entity_type);

-- Search Synonyms
CREATE TABLE search_synonyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for system-wide

    -- Synonym Set
    terms JSONB NOT NULL,                    -- Array of equivalent terms
    is_bidirectional BOOLEAN DEFAULT true,   -- All terms equivalent
    primary_term VARCHAR(100),               -- For unidirectional

    -- Scope
    entity_types JSONB,                      -- Applicable entity types

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_synonyms_tenant ON search_synonyms(tenant_id);

-- Index Queue (for async indexing)
CREATE TABLE search_index_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Entity to Index
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL,          -- INDEX, UPDATE, DELETE

    -- Priority
    priority INTEGER DEFAULT 5,              -- 1=highest, 10=lowest

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, PROCESSING, COMPLETED, FAILED
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_index_queue_status ON search_index_queue(status, priority, created_at);
CREATE INDEX idx_index_queue_entity ON search_index_queue(tenant_id, entity_type, entity_id);
```

---

## Indexed Entities

### Core Entities

| Entity    | Searchable Fields                          | Filters                            |
| --------- | ------------------------------------------ | ---------------------------------- |
| Orders    | Order #, BOL, PO, customer name, addresses | Status, date range, customer, mode |
| Loads     | Load #, carrier, driver, equipment         | Status, pickup date, origin/dest   |
| Companies | Name, MC#, DOT#, contacts                  | Type, status, state, credit rating |
| Carriers  | Name, MC#, DOT#, equipment                 | Status, lanes, equipment type      |
| Contacts  | Name, email, phone, title                  | Company, role, status              |
| Invoices  | Invoice #, customer, amount                | Status, date range, aging          |

### Secondary Entities

| Entity    | Searchable Fields             | Filters                      |
| --------- | ----------------------------- | ---------------------------- |
| Quotes    | Quote #, customer, lanes      | Status, expiry, amount range |
| Claims    | Claim #, order #, description | Type, status, amount         |
| Documents | Name, type, OCR content       | Entity, type, date range     |
| Users     | Name, email, role             | Department, status           |

---

## API Endpoints

### Global Search

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| GET    | `/api/v1/search`             | Global search across entities |
| GET    | `/api/v1/search/suggestions` | Type-ahead suggestions        |
| GET    | `/api/v1/search/recent`      | Recent searches               |

### Entity Search

| Method | Endpoint                   | Description      |
| ------ | -------------------------- | ---------------- |
| GET    | `/api/v1/search/orders`    | Search orders    |
| GET    | `/api/v1/search/loads`     | Search loads     |
| GET    | `/api/v1/search/companies` | Search companies |
| GET    | `/api/v1/search/carriers`  | Search carriers  |
| GET    | `/api/v1/search/contacts`  | Search contacts  |
| GET    | `/api/v1/search/invoices`  | Search invoices  |
| GET    | `/api/v1/search/documents` | Search documents |

### Saved Searches

| Method | Endpoint                             | Description          |
| ------ | ------------------------------------ | -------------------- |
| GET    | `/api/v1/searches/saved`             | List saved searches  |
| POST   | `/api/v1/searches/saved`             | Create saved search  |
| GET    | `/api/v1/searches/saved/:id`         | Get saved search     |
| PUT    | `/api/v1/searches/saved/:id`         | Update saved search  |
| DELETE | `/api/v1/searches/saved/:id`         | Delete saved search  |
| POST   | `/api/v1/searches/saved/:id/execute` | Execute saved search |
| POST   | `/api/v1/searches/saved/:id/share`   | Share saved search   |

### Search Administration

| Method | Endpoint                               | Description        |
| ------ | -------------------------------------- | ------------------ |
| GET    | `/api/v1/search/indexes`               | List indexes       |
| POST   | `/api/v1/search/indexes/:name/reindex` | Trigger reindex    |
| GET    | `/api/v1/search/indexes/:name/status`  | Get index status   |
| GET    | `/api/v1/search/synonyms`              | List synonyms      |
| POST   | `/api/v1/search/synonyms`              | Add synonym set    |
| DELETE | `/api/v1/search/synonyms/:id`          | Remove synonym set |
| GET    | `/api/v1/search/analytics`             | Search analytics   |

---

## Query Syntax

### Basic Search

```
# Simple term search
flatbed Chicago

# Phrase search
"dry van"

# Field-specific
customer:acme origin_city:Chicago

# Wildcard
MC123*
```

### Advanced Operators

```
# Boolean
flatbed AND Chicago
reefer OR refrigerated
-cancelled (exclude)

# Range
revenue:[1000 TO 5000]
pickup_date:[2024-01-01 TO 2024-01-31]

# Fuzzy
Acme~       # matches Acne, Acmes
Chicgo~1    # matches Chicago (edit distance 1)
```

---

## Events

### Published Events

| Event             | Trigger               | Payload              |
| ----------------- | --------------------- | -------------------- |
| `search.executed` | Search performed      | Query, results count |
| `search.saved`    | Search saved          | Search definition    |
| `index.updated`   | Entity indexed        | Entity type, ID      |
| `index.rebuilt`   | Full reindex complete | Index name           |
| `index.error`     | Indexing failed       | Error details        |

### Subscribed Events

| Event               | Action               |
| ------------------- | -------------------- |
| `order.created`     | Index order          |
| `order.updated`     | Update order index   |
| `order.deleted`     | Remove from index    |
| `load.created`      | Index load           |
| `load.updated`      | Update load index    |
| `carrier.created`   | Index carrier        |
| `carrier.updated`   | Update carrier index |
| `company.created`   | Index company        |
| `company.updated`   | Update company index |
| `contact.created`   | Index contact        |
| `contact.updated`   | Update contact index |
| `document.uploaded` | Index document (OCR) |

---

## Business Rules

### Search Behavior

1. **Default Sort**: Relevance score, then most recent
2. **Page Size**: Default 25, max 100
3. **Highlighting**: Match terms highlighted in results
4. **Min Characters**: 2 characters minimum for search
5. **Max Results**: 10,000 per query
6. **Timeout**: 10 second query timeout

### Indexing

1. **Real-Time**: Changes indexed within 1 second
2. **Batch Processing**: Queue for high-volume updates
3. **Full Reindex**: Nightly or on-demand
4. **Tenant Isolation**: Separate indexes per tenant
5. **Soft Deletes**: Deleted items removed from index

### Saved Searches

1. **Personal Limit**: 50 saved searches per user
2. **Shared Searches**: Require admin permission
3. **System Searches**: Cannot be deleted by users
4. **History Retention**: 30 days

### Security

1. **Permission Check**: Search respects entity permissions
2. **Field Masking**: Sensitive fields excluded from results
3. **Audit Logging**: All searches logged

---

## Screens

| Screen            | Description              |
| ----------------- | ------------------------ |
| Global Search Bar | Omnipresent search input |
| Search Results    | Unified results page     |
| Advanced Search   | Query builder interface  |
| Saved Searches    | Manage saved searches    |
| Search History    | View recent searches     |
| Search Admin      | Index management         |

---

## Configuration

### Environment Variables

```bash
# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=3pl

# Search Settings
SEARCH_DEFAULT_PAGE_SIZE=25
SEARCH_MAX_PAGE_SIZE=100
SEARCH_TIMEOUT_MS=10000
SEARCH_MIN_CHARS=2

# Indexing
INDEX_BATCH_SIZE=1000
INDEX_QUEUE_WORKERS=4
INDEX_REFRESH_INTERVAL=1s

# History
SEARCH_HISTORY_RETENTION_DAYS=30
SEARCH_HISTORY_MAX_PER_USER=1000

# Suggestions
SUGGESTION_LIMIT=10
SUGGESTION_MIN_CHARS=2
```

### Field Boost Defaults

| Field Type       | Boost |
| ---------------- | ----- |
| ID/Number fields | 10.0  |
| Names            | 5.0   |
| Address          | 2.0   |
| Description      | 1.0   |
| Notes            | 0.5   |

---

## Testing Checklist

### Unit Tests

- [ ] Query parsing
- [ ] Boolean operator handling
- [ ] Fuzzy matching configuration
- [ ] Result highlighting
- [ ] Permission filtering
- [ ] Saved search CRUD

### Integration Tests

- [ ] Elasticsearch connectivity
- [ ] Real-time indexing
- [ ] Multi-entity search
- [ ] Faceted filtering
- [ ] Type-ahead suggestions
- [ ] Search history tracking

### E2E Tests

- [ ] Global search flow
- [ ] Save and execute search
- [ ] Share saved search
- [ ] Reindex operation
- [ ] Search across permissions

---

## Navigation

- **Previous:** [20 - Integration Hub](../20-integration-hub/README.md)
- **Next:** [22 - Audit](../22-audit/README.md)
- **Index:** [All Services](../README.md)
