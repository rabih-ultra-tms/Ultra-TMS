# Load Board Service

## Overview

| Attribute             | Value                                        |
| --------------------- | -------------------------------------------- |
| **Service ID**        | 07                                           |
| **Category**          | Operations Services                          |
| **Phase**             | A (Internal MVP)                             |
| **Development Weeks** | 25-26                                        |
| **Priority**          | P1 - High                                    |
| **Dependencies**      | Auth/Admin (01), TMS Core (04), Carrier (05) |

## Purpose

The Load Board Service provides internal and external load posting capabilities, allowing dispatchers to post available loads and carriers to search and book freight. It supports both internal matching and integration with external load boards like DAT and Truckstop.

## Features

### Load Posting

- Post loads to internal board
- Broadcast to carrier network
- Multi-board posting (DAT, Truckstop)
- Auto-refresh and expiration
- Rate visibility controls

### Load Search

- Real-time load availability
- Geographic search (origin/destination)
- Equipment type filtering
- Rate range filtering
- Distance and route optimization

### Carrier Matching

- AI-suggested carrier matches
- Historical lane performance
- Capacity-based recommendations
- Preferred carrier prioritization
- Rate negotiation support

### Booking & Assignment

- One-click load booking
- Rate confirmation generation
- Carrier assignment workflow
- Multi-carrier load tendering
- Waterfall tendering (auto-offer to next carrier)

## Database Schema

```sql
-- Load Postings
CREATE TABLE load_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_id UUID NOT NULL REFERENCES loads(id),

    -- Posting details
    posting_type VARCHAR(50) NOT NULL, -- INTERNAL, EXTERNAL, BOTH
    visibility VARCHAR(50) DEFAULT 'ALL_CARRIERS',
    -- ALL_CARRIERS, PREFERRED_ONLY, SPECIFIC_CARRIERS

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, BOOKED, EXPIRED, CANCELLED

    -- Rate visibility
    show_rate BOOLEAN DEFAULT false,
    rate_type VARCHAR(50), -- ALL_IN, PER_MILE
    posted_rate DECIMAL(12,2),
    rate_min DECIMAL(12,2),
    rate_max DECIMAL(12,2),

    -- Origin (denormalized for search)
    origin_city VARCHAR(100),
    origin_state VARCHAR(50),
    origin_zip VARCHAR(20),
    origin_lat DECIMAL(10,7),
    origin_lng DECIMAL(10,7),

    -- Destination
    dest_city VARCHAR(100),
    dest_state VARCHAR(50),
    dest_zip VARCHAR(20),
    dest_lat DECIMAL(10,7),
    dest_lng DECIMAL(10,7),

    -- Load details (denormalized)
    equipment_type VARCHAR(50),
    total_miles DECIMAL(10,2),
    weight_lbs DECIMAL(10,2),
    pickup_date DATE,
    delivery_date DATE,

    -- External postings
    dat_posting_id VARCHAR(100),
    truckstop_posting_id VARCHAR(100),

    -- Timing
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_refresh BOOLEAN DEFAULT true,
    refresh_interval_hours INTEGER DEFAULT 4,
    last_refreshed_at TIMESTAMP WITH TIME ZONE,

    -- Metrics
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,

    -- Specific carriers (if visibility = SPECIFIC_CARRIERS)
    carrier_ids UUID[],

    -- Audit
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_load_postings_tenant ON load_postings(tenant_id);
CREATE INDEX idx_load_postings_status ON load_postings(tenant_id, status);
CREATE INDEX idx_load_postings_load ON load_postings(load_id);
CREATE INDEX idx_load_postings_origin ON load_postings(origin_state, origin_city);
CREATE INDEX idx_load_postings_dest ON load_postings(dest_state, dest_city);
CREATE INDEX idx_load_postings_date ON load_postings(pickup_date);
CREATE INDEX idx_load_postings_equipment ON load_postings(equipment_type);

-- Carrier Load Views (tracking engagement)
CREATE TABLE carrier_load_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posting_id UUID NOT NULL REFERENCES load_postings(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50), -- INTERNAL, DAT, TRUCKSTOP, EMAIL

    UNIQUE(posting_id, carrier_id)
);

CREATE INDEX idx_load_views_posting ON carrier_load_views(posting_id);
CREATE INDEX idx_load_views_carrier ON carrier_load_views(carrier_id);

-- Load Bids/Offers
CREATE TABLE load_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    posting_id UUID NOT NULL REFERENCES load_postings(id),
    load_id UUID NOT NULL REFERENCES loads(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Bid details
    bid_amount DECIMAL(12,2) NOT NULL,
    rate_type VARCHAR(50), -- ALL_IN, PER_MILE
    notes TEXT,

    -- Equipment offered
    truck_number VARCHAR(50),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, ACCEPTED, REJECTED, COUNTERED, EXPIRED, WITHDRAWN

    -- Counter offer
    counter_amount DECIMAL(12,2),
    counter_notes TEXT,
    counter_at TIMESTAMP WITH TIME ZONE,

    -- Resolution
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,

    -- Timing
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Source
    source VARCHAR(50), -- INTERNAL, CARRIER_PORTAL, DAT, TRUCKSTOP

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_load_bids_tenant ON load_bids(tenant_id);
CREATE INDEX idx_load_bids_posting ON load_bids(posting_id);
CREATE INDEX idx_load_bids_carrier ON load_bids(carrier_id);
CREATE INDEX idx_load_bids_status ON load_bids(tenant_id, status);

-- Load Tender Offers (Waterfall)
CREATE TABLE load_tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    load_id UUID NOT NULL REFERENCES loads(id),

    -- Tender settings
    tender_type VARCHAR(50) NOT NULL, -- BROADCAST, WATERFALL, SPECIFIC
    tender_rate DECIMAL(12,2) NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- ACTIVE, ACCEPTED, EXPIRED, CANCELLED

    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Waterfall settings
    waterfall_timeout_minutes INTEGER DEFAULT 30,
    current_position INTEGER DEFAULT 0,

    -- Result
    accepted_by_carrier_id UUID REFERENCES carriers(id),
    accepted_at TIMESTAMP WITH TIME ZONE,

    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_load_tenders_tenant ON load_tenders(tenant_id);
CREATE INDEX idx_load_tenders_load ON load_tenders(load_id);
CREATE INDEX idx_load_tenders_status ON load_tenders(tenant_id, status);

-- Tender Recipients
CREATE TABLE tender_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES load_tenders(id) ON DELETE CASCADE,
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Waterfall position (1 = first to offer)
    position INTEGER NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, OFFERED, ACCEPTED, DECLINED, EXPIRED, SKIPPED

    -- Timing
    offered_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Response
    decline_reason TEXT,

    -- Notification
    notification_sent BOOLEAN DEFAULT false,
    notification_method VARCHAR(50), -- EMAIL, SMS, APP

    UNIQUE(tender_id, carrier_id)
);

CREATE INDEX idx_tender_recipients_tender ON tender_recipients(tender_id);
CREATE INDEX idx_tender_recipients_carrier ON tender_recipients(carrier_id);

-- Carrier Capacity/Availability
CREATE TABLE carrier_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    carrier_id UUID NOT NULL REFERENCES carriers(id),

    -- Truck details
    truck_number VARCHAR(50),
    driver_id UUID REFERENCES drivers(id),

    -- Equipment
    equipment_type VARCHAR(50) NOT NULL,
    equipment_length INTEGER, -- feet

    -- Location
    current_city VARCHAR(100),
    current_state VARCHAR(50),
    current_zip VARCHAR(20),
    current_lat DECIMAL(10,7),
    current_lng DECIMAL(10,7),
    location_updated_at TIMESTAMP WITH TIME ZONE,

    -- Availability
    available_date DATE NOT NULL,
    available_time TIME,

    -- Preferences
    preferred_dest_states VARCHAR(3)[],
    max_deadhead_miles INTEGER DEFAULT 100,
    min_rate_per_mile DECIMAL(6,2),

    -- Status
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    -- AVAILABLE, BOOKED, OFFLINE

    -- Notes
    notes TEXT,

    -- Posting
    posted_to_dat BOOLEAN DEFAULT false,
    posted_to_truckstop BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_carrier_capacity_tenant ON carrier_capacity(tenant_id);
CREATE INDEX idx_carrier_capacity_carrier ON carrier_capacity(carrier_id);
CREATE INDEX idx_carrier_capacity_location ON carrier_capacity(current_state, current_city);
CREATE INDEX idx_carrier_capacity_date ON carrier_capacity(available_date);
CREATE INDEX idx_carrier_capacity_equipment ON carrier_capacity(equipment_type);
```

## API Endpoints

### Load Postings

| Method | Endpoint                                  | Description            |
| ------ | ----------------------------------------- | ---------------------- |
| GET    | `/api/v1/load-board/postings`             | List postings          |
| POST   | `/api/v1/load-board/postings`             | Create posting         |
| GET    | `/api/v1/load-board/postings/:id`         | Get posting            |
| PUT    | `/api/v1/load-board/postings/:id`         | Update posting         |
| DELETE | `/api/v1/load-board/postings/:id`         | Cancel posting         |
| POST   | `/api/v1/load-board/postings/:id/refresh` | Refresh posting        |
| POST   | `/api/v1/load-board/postings/:id/extend`  | Extend expiration      |
| GET    | `/api/v1/load-board/search`               | Search available loads |

### Bids

| Method | Endpoint                               | Description          |
| ------ | -------------------------------------- | -------------------- |
| GET    | `/api/v1/load-board/postings/:id/bids` | List bids on posting |
| POST   | `/api/v1/load-board/postings/:id/bids` | Submit bid           |
| GET    | `/api/v1/load-board/bids/:id`          | Get bid details      |
| PATCH  | `/api/v1/load-board/bids/:id/accept`   | Accept bid           |
| PATCH  | `/api/v1/load-board/bids/:id/reject`   | Reject bid           |
| PATCH  | `/api/v1/load-board/bids/:id/counter`  | Counter offer        |
| DELETE | `/api/v1/load-board/bids/:id`          | Withdraw bid         |

### Tenders

| Method | Endpoint                                 | Description       |
| ------ | ---------------------------------------- | ----------------- |
| POST   | `/api/v1/load-board/tenders`             | Create tender     |
| GET    | `/api/v1/load-board/tenders/:id`         | Get tender status |
| POST   | `/api/v1/load-board/tenders/:id/cancel`  | Cancel tender     |
| PATCH  | `/api/v1/load-board/tenders/:id/respond` | Carrier response  |

### Carrier Capacity

| Method | Endpoint                          | Description     |
| ------ | --------------------------------- | --------------- |
| GET    | `/api/v1/load-board/capacity`     | Search capacity |
| POST   | `/api/v1/load-board/capacity`     | Post capacity   |
| PUT    | `/api/v1/load-board/capacity/:id` | Update capacity |
| DELETE | `/api/v1/load-board/capacity/:id` | Remove capacity |

### Matching

| Method | Endpoint                                | Description         |
| ------ | --------------------------------------- | ------------------- |
| GET    | `/api/v1/load-board/loads/:id/matches`  | Get carrier matches |
| GET    | `/api/v1/load-board/capacity/:id/loads` | Get load matches    |

## Events

### Published Events

| Event             | Trigger            | Payload           |
| ----------------- | ------------------ | ----------------- |
| `posting.created` | Load posted        | Posting data      |
| `posting.updated` | Posting modified   | Changes           |
| `posting.expired` | Posting expired    | Posting data      |
| `posting.booked`  | Load assigned      | Posting + carrier |
| `bid.submitted`   | New bid            | Bid data          |
| `bid.accepted`    | Bid accepted       | Bid + load        |
| `bid.rejected`    | Bid rejected       | Bid + reason      |
| `bid.countered`   | Counter offer      | Bid + counter     |
| `tender.created`  | Tender started     | Tender data       |
| `tender.offered`  | Offered to carrier | Tender + carrier  |
| `tender.accepted` | Carrier accepted   | Tender + carrier  |
| `tender.declined` | Carrier declined   | Tender + reason   |
| `capacity.posted` | Capacity available | Capacity data     |

### Subscribed Events

| Event            | Source   | Action              |
| ---------------- | -------- | ------------------- |
| `load.created`   | TMS Core | Auto-post option    |
| `load.assigned`  | TMS Core | Mark posting booked |
| `load.cancelled` | TMS Core | Cancel posting      |

## Business Rules

### Load Posting

1. Only unassigned loads can be posted
2. Posting expires after 48 hours (configurable)
3. Auto-refresh every 4 hours on DAT/Truckstop
4. Rate visibility configurable per posting
5. Remove posting when load assigned

### Bidding

1. Carriers must be active and compliant
2. Bids expire after 24 hours
3. Counter offers allowed once
4. Accepted bids auto-assign carrier
5. Only one active bid per carrier per load

### Waterfall Tendering

1. Offer to position 1 first
2. Wait timeout period for response
3. No response = auto-decline, move to next
4. Process continues until accepted or exhausted
5. Real-time notifications to carriers

### Carrier Matching Score

```typescript
interface MatchScore {
  carrier_id: string;
  score: number; // 0-100
  factors: {
    lane_history: number; // Past performance on lane
    on_time_rate: number; // Overall reliability
    rate_history: number; // Historical rates
    current_location: number; // Deadhead distance
    equipment_match: number; // Equipment compatibility
    relationship: number; // Preferred carrier bonus
  };
}
```

## Screens

| Screen          | Description            | Features                     |
| --------------- | ---------------------- | ---------------------------- |
| Load Board      | Browse available loads | Filters, map view            |
| Posting Manager | Manage postings        | Status, bids, metrics        |
| Create Posting  | Post new load          | Rate, visibility options     |
| Bid Manager     | Review bids            | Accept, reject, counter      |
| Tender Builder  | Create tender          | Carrier selection, waterfall |
| Tender Monitor  | Track tender progress  | Real-time status             |
| Capacity Search | Find available trucks  | Location, equipment search   |
| Carrier Matches | AI suggestions         | Score breakdown              |

## External Integration

### DAT Integration

```typescript
interface DATPosting {
  origin: DATLocation;
  destination: DATLocation;
  equipment: string;
  weight: number;
  length: number;
  rate: number;
  rateType: 'flat' | 'perMile';
  pickupDate: string;
  deliveryDate: string;
  comments: string;
}
```

### Truckstop Integration

```typescript
interface TruckstopPosting {
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  equipmentType: string;
  loadType: 'full' | 'partial';
  weight: number;
  rate: number;
  pickupDate: string;
}
```

## Configuration

### Environment Variables

```bash
# External Load Boards
DAT_API_KEY=your_dat_key
DAT_API_SECRET=your_dat_secret
TRUCKSTOP_API_KEY=your_truckstop_key

# Posting Settings
DEFAULT_POSTING_EXPIRATION_HOURS=48
AUTO_REFRESH_INTERVAL_HOURS=4
BID_EXPIRATION_HOURS=24
WATERFALL_TIMEOUT_MINUTES=30
```

## Testing Checklist

### Unit Tests

- [ ] Posting CRUD operations
- [ ] Bid submission and validation
- [ ] Waterfall tender logic
- [ ] Match scoring algorithm
- [ ] Expiration handling

### Integration Tests

- [ ] DAT posting sync
- [ ] Truckstop posting sync
- [ ] Bid to assignment flow
- [ ] Tender notification delivery
- [ ] Event publishing

### E2E Tests

- [ ] Full posting lifecycle
- [ ] Bid and accept flow
- [ ] Waterfall tender completion
- [ ] Carrier portal bid submission
- [ ] Capacity search and match

---

**Navigation:** [â† Accounting](../06-accounting/README.md) | [Services Index](../README.md) | [Commission â†’](../08-commission/README.md)
