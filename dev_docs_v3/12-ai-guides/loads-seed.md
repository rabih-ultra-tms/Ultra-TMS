# Loads Seed Data Guide

> AI Dev Guide | Source: `dev_docs/11-ai-dev/90-seed-data-fixtures.md`

---

## Overview

Seed 100 loads across all status states, equipment types, and date ranges to test dispatch, tracking, accounting, and reporting.

## Required Fields

```typescript
{
  loadNumber: string,        // Auto: LD-{YYYYMM}-{NNNNN}
  status: LoadStatus,        // See distribution below
  customerId: string,        // FK -> Customer (must be seeded first)
  carrierId?: string,        // FK -> Carrier (null for PENDING loads)
  equipmentType: string,     // DRY_VAN | REEFER | FLATBED | etc.
  origin: Address,           // Pickup location
  destination: Address,      // Delivery location
  pickupDate: DateTime,      // Scheduled pickup
  deliveryDate: DateTime,    // Scheduled delivery
  customerRate: number,      // In dollars
  carrierRate?: number,      // Null for unassigned loads
  tenantId: string
}
```

## Status Distribution (100 loads)

| Status | Count | Date Range | Purpose |
|--------|-------|------------|---------|
| PENDING | 10 | +1 to +7 days | Available for dispatch |
| COVERED | 5 | +1 to +3 days | Carrier assigned, pre-dispatch |
| DISPATCHED | 5 | Today to +1 day | Active dispatch board |
| AT_PICKUP | 5 | Today | Driver at shipper |
| PICKED_UP | 5 | Today | Loading complete |
| IN_TRANSIT | 10 | -1 to +2 days | Tracking map testing |
| AT_DELIVERY | 5 | Today | Driver at consignee |
| DELIVERED | 15 | -1 to -5 days | Invoice generation testing |
| COMPLETED | 30 | -5 to -30 days | Historical reporting |
| CANCELLED | 10 | Various | Cancellation flows |

## Stops Per Load

Every load needs minimum 2 stops:

```typescript
stops: [
  {
    sequence: 1,
    type: "PICKUP",
    address: { city: "Dallas", state: "TX", ... },
    scheduledAt: pickupDate,
    status: loadStatus >= "PICKED_UP" ? "COMPLETED" : "PENDING"
  },
  {
    sequence: 2,
    type: "DELIVERY",
    address: { city: "Chicago", state: "IL", ... },
    scheduledAt: deliveryDate,
    status: loadStatus >= "DELIVERED" ? "COMPLETED" : "PENDING"
  }
]
```

## Check Calls for In-Transit Loads

For loads in DISPATCHED through AT_DELIVERY, seed 2-5 check calls:

```typescript
checkCalls: [
  {
    type: "CHECK_CALL",
    message: "Driver en route, ETA on schedule",
    lat: 32.7767, lng: -96.7970,
    createdAt: subHours(now, 4)
  },
  {
    type: "ETA_UPDATE",
    message: "Slight delay due to traffic, new ETA 2pm",
    eta: addHours(now, 2),
    createdAt: subHours(now, 2)
  }
]
```

## Rate Data

```typescript
// Realistic rate ranges by distance
const rates = {
  short: { miles: 100-300, customerRate: 800-1500, carrierRate: 650-1200 },
  medium: { miles: 300-800, customerRate: 1500-3000, carrierRate: 1200-2500 },
  long: { miles: 800-2000, customerRate: 3000-6000, carrierRate: 2500-5000 }
};
// Target margin: 15-25%
```

## Realistic City Pairs

Use actual US freight corridors:
- Dallas TX -> Chicago IL (920 mi)
- Los Angeles CA -> Phoenix AZ (370 mi)
- Atlanta GA -> Miami FL (660 mi)
- Chicago IL -> New York NY (790 mi)
- Denver CO -> Los Angeles CA (1020 mi)
- Detroit MI -> Columbus OH (260 mi)
- Houston TX -> Phoenix AZ (1180 mi)
- Seattle WA -> Portland OR (175 mi)

## Equipment Type Mix

- DRY_VAN: 60%
- REEFER: 20%
- FLATBED: 15%
- STEP_DECK/OTHER: 5%

## Test Scenarios Enabled

| Scenario | Loads |
|----------|-------|
| Dispatch board (pending loads) | PENDING loads with future dates |
| Tracking map | IN_TRANSIT loads with currentLocation |
| Invoice generation | DELIVERED loads without invoiceId |
| Overdue check calls | IN_TRANSIT loads with stale checkCalls |
| TONU cancellation | DISPATCHED loads -> cancel |
| Multi-stop | 5-10 loads with 3+ stops |
| Hazmat | 2-3 loads with hazmat: true |
| Temperature controlled | REEFER loads with temperature requirements |
