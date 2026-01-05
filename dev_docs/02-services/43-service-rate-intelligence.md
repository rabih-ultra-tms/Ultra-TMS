# Rate Intelligence Service

## Overview

| Attribute             | Value                                                            |
| --------------------- | ---------------------------------------------------------------- |
| **Service ID**        | 35                                                               |
| **Document**          | 43                                                               |
| **Category**          | Extended Services                                                |
| **Phase**             | A (Internal MVP)                                                 |
| **Development Weeks** | 63-66                                                            |
| **Priority**          | P2 - Medium                                                      |
| **Dependencies**      | Auth/Admin (01), Sales (03), TMS Core (04), Integration Hub (20) |

## Purpose

The Rate Intelligence Service provides real-time market rate data from external sources (DAT, Truckstop, Greenscreens) to support accurate pricing decisions. It enables rate lookups, historical analysis, lane benchmarking, and margin optimization through market insights.

## Features

### Rate Lookup

- Real-time spot rate queries
- Lane-specific rate data
- Equipment type filtering
- Multi-source aggregation
- Rate confidence scoring

### Historical Analysis

- Rate trend visualization
- Seasonal pattern analysis
- Year-over-year comparisons
- Lane volatility metrics
- Market movement alerts

### Benchmarking

- Lane profitability analysis
- Margin comparison to market
- Rate competitiveness scoring
- Win/loss rate correlation
- Customer rate positioning

### Rate Alerts

- Custom alert configuration
- Lane rate change notifications
- Market spike/drop alerts
- Capacity indicator alerts
- Email/SMS/in-app delivery

### Predictive Analytics

- Rate forecasting
- Capacity predictions
- Seasonal adjustments
- Fuel surcharge projections
- Market condition indicators

## Database Schema

```sql
-- Rate Queries (cached results)
CREATE TABLE rate_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Query parameters
    origin_city VARCHAR(100),
    origin_state VARCHAR(3),
    origin_zip VARCHAR(10),
    dest_city VARCHAR(100),
    dest_state VARCHAR(3),
    dest_zip VARCHAR(10),
    equipment_type VARCHAR(50),
    query_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Source
    data_source VARCHAR(50) NOT NULL, -- DAT, TRUCKSTOP, GREENSCREENS

    -- Results
    low_rate DECIMAL(10,2),
    average_rate DECIMAL(10,2),
    high_rate DECIMAL(10,2),
    fuel_surcharge DECIMAL(10,2),

    -- Confidence/quality
    sample_size INTEGER,
    confidence_score INTEGER, -- 0-100
    data_age_hours INTEGER,

    -- Metadata
    raw_response JSONB,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    queried_by UUID REFERENCES users(id)
);

-- Rate History (aggregated daily)
CREATE TABLE rate_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id), -- null for global data

    -- Lane
    origin_market VARCHAR(100) NOT NULL,
    dest_market VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(50) NOT NULL,

    -- Date
    rate_date DATE NOT NULL,

    -- Rates
    low_rate DECIMAL(10,2),
    average_rate DECIMAL(10,2),
    high_rate DECIMAL(10,2),
    rate_per_mile DECIMAL(8,4),

    -- Volume indicators
    load_to_truck_ratio DECIMAL(6,2),
    posted_loads INTEGER,
    posted_trucks INTEGER,

    -- Source
    data_source VARCHAR(50) NOT NULL,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(origin_market, dest_market, equipment_type, rate_date, data_source)
);

-- Rate Alerts
CREATE TABLE rate_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Alert config
    name VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    -- RATE_INCREASE, RATE_DECREASE, THRESHOLD, MARKET_SPIKE

    -- Lane criteria
    origin_market VARCHAR(100),
    dest_market VARCHAR(100),
    equipment_type VARCHAR(50),

    -- Trigger conditions
    threshold_type VARCHAR(50), -- PERCENTAGE, ABSOLUTE
    threshold_value DECIMAL(10,2),
    comparison_period VARCHAR(50), -- DAY, WEEK, MONTH

    -- Notification
    notify_users UUID[],
    notify_email VARCHAR(255)[],
    notify_sms VARCHAR(50)[],

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Alert History
CREATE TABLE rate_alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    alert_id UUID NOT NULL REFERENCES rate_alerts(id),

    -- Trigger details
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trigger_data JSONB NOT NULL,
    -- { old_rate, new_rate, change_percent, lane, etc. }

    -- Notifications sent
    notifications_sent JSONB,
    -- [{ type, recipient, sent_at, status }]

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lane Analytics (computed metrics)
CREATE TABLE lane_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Lane
    origin_market VARCHAR(100) NOT NULL,
    dest_market VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(50) NOT NULL,

    -- Period
    period_type VARCHAR(20) NOT NULL, -- WEEK, MONTH, QUARTER
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Volume
    loads_quoted INTEGER DEFAULT 0,
    loads_booked INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),

    -- Rates
    avg_quoted_rate DECIMAL(10,2),
    avg_booked_rate DECIMAL(10,2),
    avg_market_rate DECIMAL(10,2),

    -- Margins
    avg_margin_percent DECIMAL(5,2),
    avg_margin_amount DECIMAL(10,2),

    -- Comparison
    rate_vs_market_percent DECIMAL(5,2), -- positive = above market

    -- Audit
    calculated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, origin_market, dest_market, equipment_type, period_type, period_start)
);

-- Provider Configurations
CREATE TABLE rate_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    provider VARCHAR(50) NOT NULL, -- DAT, TRUCKSTOP, GREENSCREENS

    -- Credentials (encrypted)
    api_key_encrypted VARCHAR(500),
    api_secret_encrypted VARCHAR(500),
    username VARCHAR(255),

    -- Settings
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- for fallback ordering

    -- Usage tracking
    daily_quota INTEGER,
    queries_today INTEGER DEFAULT 0,
    quota_reset_at TIMESTAMPTZ,

    -- Status
    last_successful_query TIMESTAMPTZ,
    last_error TEXT,
    error_count INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, provider)
);

-- Indexes
CREATE INDEX idx_rate_queries_tenant ON rate_queries(tenant_id);
CREATE INDEX idx_rate_queries_lane ON rate_queries(origin_state, dest_state);
CREATE INDEX idx_rate_queries_date ON rate_queries(query_date);
CREATE INDEX idx_rate_history_lane ON rate_history(origin_market, dest_market);
CREATE INDEX idx_rate_history_date ON rate_history(rate_date);
CREATE INDEX idx_rate_alerts_tenant ON rate_alerts(tenant_id);
CREATE INDEX idx_lane_analytics_tenant ON lane_analytics(tenant_id);
CREATE INDEX idx_lane_analytics_lane ON lane_analytics(origin_market, dest_market);
```

## API Endpoints

### Rate Lookup

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| POST   | `/api/v1/rates/lookup`       | Get real-time rates |
| POST   | `/api/v1/rates/lookup/batch` | Batch rate lookup   |
| GET    | `/api/v1/rates/history`      | Get rate history    |
| GET    | `/api/v1/rates/trends`       | Get rate trends     |

### Lane Analysis

| Method | Endpoint                           | Description         |
| ------ | ---------------------------------- | ------------------- |
| GET    | `/api/v1/rates/lanes`              | List analyzed lanes |
| GET    | `/api/v1/rates/lanes/:id`          | Get lane details    |
| GET    | `/api/v1/rates/lanes/:id/history`  | Lane rate history   |
| GET    | `/api/v1/rates/lanes/:id/forecast` | Lane rate forecast  |

### Alerts

| Method | Endpoint                           | Description           |
| ------ | ---------------------------------- | --------------------- |
| GET    | `/api/v1/rates/alerts`             | List alerts           |
| POST   | `/api/v1/rates/alerts`             | Create alert          |
| PATCH  | `/api/v1/rates/alerts/:id`         | Update alert          |
| DELETE | `/api/v1/rates/alerts/:id`         | Delete alert          |
| GET    | `/api/v1/rates/alerts/:id/history` | Alert trigger history |

### Analytics

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/v1/rates/analytics/dashboard`       | Rate analytics dashboard |
| GET    | `/api/v1/rates/analytics/margins`         | Margin analysis          |
| GET    | `/api/v1/rates/analytics/competitiveness` | Rate competitiveness     |
| GET    | `/api/v1/rates/analytics/market`          | Market overview          |

### Provider Management

| Method | Endpoint                           | Description               |
| ------ | ---------------------------------- | ------------------------- |
| GET    | `/api/v1/rates/providers`          | List configured providers |
| POST   | `/api/v1/rates/providers`          | Add provider              |
| PATCH  | `/api/v1/rates/providers/:id`      | Update provider config    |
| POST   | `/api/v1/rates/providers/:id/test` | Test provider connection  |

## Events

### Published Events

| Event                  | Trigger             | Payload                               |
| ---------------------- | ------------------- | ------------------------------------- |
| `rate.alert.triggered` | Alert condition met | `{ alertId, lane, oldRate, newRate }` |
| `rate.market.spike`    | Market volatility   | `{ lane, change, direction }`         |
| `rate.query.completed` | Rate lookup done    | `{ queryId, results }`                |

### Subscribed Events

| Event            | Source    | Action                                 |
| ---------------- | --------- | -------------------------------------- |
| `quote.created`  | Sales     | Track quoted rates                     |
| `load.booked`    | TMS       | Track booked rates for margin analysis |
| `schedule.daily` | Scheduler | Trigger daily rate refresh             |

## Business Rules

### Rate Query Logic

```typescript
// Multi-source rate aggregation
async function getRates(lane: Lane): Promise<RateResult> {
  const providers = getActiveProviders();
  const results = await Promise.allSettled(
    providers.map((p) => queryProvider(p, lane))
  );

  const validResults = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  if (validResults.length === 0) {
    throw new Error('No rate data available');
  }

  return aggregateRates(validResults);
}

// Rate confidence scoring
function calculateConfidence(result: RateResult): number {
  let score = 100;

  // Reduce for old data
  if (result.dataAgeHours > 24) score -= 20;
  if (result.dataAgeHours > 72) score -= 30;

  // Reduce for small sample
  if (result.sampleSize < 10) score -= 20;
  if (result.sampleSize < 5) score -= 30;

  // Reduce for single source
  if (result.sourceCount === 1) score -= 10;

  return Math.max(0, score);
}
```

### Alert Trigger Logic

| Alert Type    | Trigger Condition                           |
| ------------- | ------------------------------------------- |
| RATE_INCREASE | Rate up by threshold vs comparison period   |
| RATE_DECREASE | Rate down by threshold vs comparison period |
| THRESHOLD     | Rate crosses specified value                |
| MARKET_SPIKE  | Rate changes >15% in 24 hours               |
| CAPACITY_LOW  | Load-to-truck ratio >10:1                   |

## Screens

| #   | Screen           | Type      | Description                  | Access          |
| --- | ---------------- | --------- | ---------------------------- | --------------- |
| 1   | Market Dashboard | dashboard | Rate trends, market overview | Sales, Dispatch |
| 2   | Rate Lookup      | tool      | Search lane rates            | Sales, Dispatch |
| 3   | Rate History     | chart     | Historical rate charts       | Sales           |
| 4   | Rate Alerts      | list      | Alert configuration          | Sales, Admin    |
| 5   | Alert Editor     | form      | Create/edit alerts           | Sales, Admin    |
| 6   | Lane Analysis    | report    | Lane profitability           | Admin           |
| 7   | Market Reports   | report    | Market intelligence          | Admin           |
| 8   | Provider Setup   | config    | Configure DAT/Truckstop      | Admin           |

## External Integrations

### DAT RateView

- Real-time spot rates
- 13-month historical data
- Load-to-truck ratios
- Regional market data

### Truckstop ITS

- Spot rate data
- Contract rate benchmarks
- Capacity indicators
- Market trends

### Greenscreens

- AI-powered rate predictions
- Confidence scoring
- Market forecasts

## Configuration

```yaml
# Environment variables
RATE_DAT_API_KEY: 'xxx'
RATE_DAT_API_URL: 'https://api.dat.com/v3'
RATE_TRUCKSTOP_USERNAME: 'xxx'
RATE_TRUCKSTOP_PASSWORD: 'xxx'
RATE_CACHE_TTL_MINUTES: 60
RATE_HISTORY_RETENTION_DAYS: 365
RATE_ALERT_CHECK_INTERVAL: '*/15 * * * *' # every 15 min
```

## Testing Checklist

### Unit Tests

- [ ] Rate aggregation logic
- [ ] Confidence score calculation
- [ ] Alert trigger evaluation
- [ ] Margin calculations

### Integration Tests

- [ ] DAT API integration
- [ ] Truckstop API integration
- [ ] Rate caching
- [ ] Alert notifications

### E2E Tests

- [ ] Complete rate lookup flow
- [ ] Alert creation and triggering
- [ ] Historical data retrieval
- [ ] Multi-source aggregation

---

_Service Version: 1.0.0_
_Last Updated: January 2025_
