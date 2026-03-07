# Load Data Dictionary

> AI Dev Guide | Source: Prisma schema + `dev_docs/11-ai-dev/91-entity-data-dictionary.md`

---

## Load Entity

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| id | String (UUID) | Auto | - | Generated | Primary key |
| loadNumber | String | Auto | Unique per tenant | Generated | `LD-{YYYYMM}-{NNNNN}` |
| status | LoadStatus | Yes | Enum | PLANNING | See status machine below |
| orderId | String | Yes | FK -> Order | - | Parent order |
| carrierId | String | No | FK -> Carrier | null | Assigned carrier |
| driverId | String | No | FK -> Driver | null | Assigned driver |
| equipmentType | EquipmentType | Yes | Enum | - | DRY_VAN, REEFER, FLATBED, etc. |
| weight | Decimal | No | 1-80,000 lbs | null | Total weight |
| commodity | String | No | 2-200 chars | null | Freight description |
| customerRate | Decimal | Yes | Min 0 | - | Customer rate ($) |
| carrierRate | Decimal | No | Min 0 | null | Carrier pay ($) |
| margin | Decimal | Computed | - | - | revenue - cost |
| marginPercent | Decimal | Computed | - | - | margin / revenue * 100 |
| fuelSurcharge | Decimal | No | Min 0 | 0 | Fuel surcharge |
| accessorials | Json | No | Array of charges | [] | Additional charges |
| miles | Int | No | Min 1 | null | Total distance |
| hazmat | Boolean | No | - | false | Hazardous materials |
| hazmatClass | String | No | DOT class | null | Hazmat class |
| specialInstructions | Text | No | - | null | Driver instructions |
| internalNotes | Text | No | - | null | Internal notes |
| referenceNumbers | Json | No | Key/value pairs | {} | External references (PO#, etc.) |
| bolNumber | String | No | - | null | Bill of lading # |
| proNumber | String | No | - | null | PRO number |
| dispatchedAt | DateTime | No | - | null | When dispatched |
| dispatchedById | String | No | FK -> User | null | Who dispatched |
| currentLocation | Json | No | lat/lng/time | null | Latest GPS position |
| eta | DateTime | No | - | null | Estimated arrival |
| podReceived | Boolean | No | - | false | POD on file |
| tenantId | String | Yes | FK -> Tenant | - | Tenant isolation |
| createdAt | DateTime | Auto | - | now() | Created |
| updatedAt | DateTime | Auto | - | auto | Updated |
| deletedAt | DateTime | No | - | null | Soft delete |

## Load Status Lifecycle

```
PLANNING -> PENDING -> TENDERED -> ACCEPTED -> DISPATCHED
DISPATCHED -> AT_PICKUP -> PICKED_UP -> IN_TRANSIT -> AT_DELIVERY -> DELIVERED -> COMPLETED
TENDERED -> CANCELLED (carrier rejects)
```

### Key Status Rules

- **PLANNING:** Load being configured, not yet ready for dispatch
- **PENDING:** Ready for carrier assignment
- **TENDERED:** Sent to carrier, awaiting acceptance
- **ACCEPTED:** Carrier accepted, ready to dispatch
- **DISPATCHED:** Driver has dispatch instructions
- **PICKED_UP:** Carrier lock-down begins -- carrier cannot be changed after this point
- **DELIVERED -> COMPLETED:** Triggers invoice auto-generation

## Relationships

```
Load
  |-- Order (many:1, via orderId)
  |-- Carrier (many:1, via carrierId, nullable)
  |-- Stop[] (1:many)
  |-- CheckCall[] (1:many)
  |-- TrackingEvent[] (1:many)
```

## Stop Entity (Embedded in Load)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | String (UUID) | Auto | Generated | Primary key |
| loadId | String | Yes | - | FK -> Load |
| sequence | Int | Yes | - | Order within load |
| type | StopType | Yes | - | PICKUP, DELIVERY, INTERMEDIATE |
| status | StopStatus | Yes | PENDING | PENDING, ARRIVED, DEPARTED, COMPLETED |
| address | Json | Yes | - | street, city, state, zip, lat, lng |
| scheduledAt | DateTime | Yes | - | Scheduled arrival |
| arrivedAt | DateTime | No | null | Actual arrival (set on arrive action) |
| departedAt | DateTime | No | null | Actual departure (set on depart action) |
| freeTimeHrs | Decimal | No | 2 | Hours before detention starts |
| detention | Decimal | No | null | Calculated detention charge |
| notes | String | No | null | Stop notes |

## CheckCall Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID) | Auto | Primary key |
| loadId | String | Yes | FK -> Load |
| type | CheckCallType | Yes | CHECK_CALL, ARRIVAL, DEPARTURE, DELAY, ISSUE, ETA_UPDATE |
| message | String | Yes | Check call notes |
| lat | Decimal | No | GPS latitude |
| lng | Decimal | No | GPS longitude |
| eta | DateTime | No | Updated ETA |
| createdBy | String | Yes | FK -> User |
| createdAt | DateTime | Auto | Timestamp |

## Margin Calculation

```
totalRevenue = customerRate + fuelSurcharge + sum(customer accessorials)
totalCost = carrierRate + sum(carrier accessorials)
margin = totalRevenue - totalCost
marginPercent = (margin / totalRevenue) * 100
```

Minimum margin threshold: 15% (warning, requires override if below).
