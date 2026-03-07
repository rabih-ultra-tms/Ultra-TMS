# TMS Core Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Order | Customer shipment orders | Company, Contact, Load, OrderItem, Stop |
| OrderItem | Line items on an order (commodities) | Order |
| Load | Carrier assignments for orders | Order, Carrier, Stop, CheckCall |
| Stop | Pickup/delivery stops | Load, Order |
| CheckCall | Tracking check calls | Load |
| StatusHistory | Load status change log | Load |

## Order

Customer shipment order — the business transaction.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| orderNumber | String | VarChar(50) | Unique per tenant |
| companyId | String | FK to Company | Shipper |
| contactId | String? | FK to Contact | |
| quoteId | String? | FK to Quote | Source quote |
| status | String | @default("PENDING"), VarChar(30) | PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED |
| serviceType | String? | VarChar(50) | FTL, LTL, DRAYAGE, etc. |
| equipmentType | String? | VarChar(50) | |
| customerRate | Decimal? | Decimal(12,2) | Revenue |
| totalCharges | Decimal? | Decimal(12,2) | |
| totalCost | Decimal? | Decimal(12,2) | Carrier cost |
| margin | Decimal? | Decimal(12,2) | |
| marginPercent | Decimal? | Decimal(5,2) | |
| commodity | String? | VarChar(255) | |
| weight | Decimal? | | |
| pieces | Int? | | |
| pallets | Int? | | |
| temperature | String? | VarChar(50) | Reefer temp |
| hazmat | Boolean | @default(false) | |
| teamRequired | Boolean | @default(false) | |
| specialInstructions | String? | | |
| bolNumber | String? | VarChar(50) | Bill of lading |
| poNumber | String? | VarChar(50) | Purchase order |
| referenceNumber | String? | VarChar(50) | |
| assignedDispatcherId | String? | | |
| billingStatus | String? | VarChar(50) | |

**Relations:** Company, Contact, Quote?, Load[], OrderItem[], Stop[], Document[], Invoice[], CommissionEntry[], AgentCommission[], Claim[]
**Unique:** `[tenantId, orderNumber]`
**Indexes:** `[companyId]`, `[status]`, `[createdAt]`, `[tenantId, status]`, `[tenantId, deletedAt]`

## Load

Carrier assignment for an order. One order can have multiple loads (split shipments).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| loadNumber | String | VarChar(50) | Unique per tenant |
| orderId | String? | FK to Order | |
| carrierId | String? | FK to Carrier | |
| driverName | String? | VarChar(100) | |
| driverPhone | String? | VarChar(20) | |
| truckNumber | String? | VarChar(20) | |
| trailerNumber | String? | VarChar(20) | |
| status | String | @default("PENDING"), VarChar(30) | PENDING, DISPATCHED, PICKED_UP, IN_TRANSIT, DELIVERED |
| carrierRate | Decimal? | Decimal(10,2) | Cost |
| accessorialCosts | Decimal | @default(0), Decimal(10,2) | |
| fuelAdvance | Decimal | @default(0), Decimal(10,2) | |
| totalCost | Decimal? | Decimal(10,2) | |
| currentLocationLat | Decimal? | Decimal(10,7) | GPS tracking |
| currentLocationLng | Decimal? | Decimal(10,7) | |
| currentCity | String? | VarChar(100) | |
| currentState | String? | VarChar(50) | |
| lastTrackingUpdate | DateTime? | | |
| eta | DateTime? | | Estimated arrival |
| equipmentType | String? | VarChar(30) | |
| equipmentLength | Int? | | |
| dispatchedAt | DateTime? | | |
| pickedUpAt | DateTime? | | |
| deliveredAt | DateTime? | | |
| rateConfirmationSent | Boolean | @default(false) | |
| rateConfirmationSigned | Boolean | @default(false) | |
| dispatchNotes | String? | | |

**Relations:** Order, Carrier, Stop[], CheckCall[], StatusHistory[], Document[], Invoice[], Settlement (via SettlementLineItem), LoadBid[], LoadPosting[], LoadPost[], CarrierPortalDocument[], Claim[], CommissionEntry[], AgentCommission[]
**Unique:** `[tenantId, loadNumber]`
**Indexes:** `[carrierId]`, `[orderId]`, `[status]`, `[tenantId, status]`, `[tenantId, carrierId]`, `[tenantId, deletedAt]`

## Stop

Pickup/delivery stops for loads and orders.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| loadId | String? | FK to Load | |
| orderId | String? | FK to Order | |
| stopNumber | Int | | Sequence |
| stopType | String | VarChar(20) | PICKUP, DELIVERY |
| facilityName | String? | VarChar(255) | |
| addressLine1 | String? | VarChar(255) | |
| addressLine2 | String? | VarChar(255) | |
| city | String? | VarChar(100) | |
| state | String? | VarChar(50) | |
| postalCode | String? | VarChar(20) | |
| country | String | @default("USA") | |
| latitude | Decimal? | Decimal(10,7) | |
| longitude | Decimal? | Decimal(10,7) | |
| scheduledDate | DateTime? | | |
| scheduledTimeFrom | String? | VarChar(5) | |
| scheduledTimeTo | String? | VarChar(5) | |
| actualArrival | DateTime? | | |
| actualDeparture | DateTime? | | |
| contactName | String? | VarChar(255) | |
| contactPhone | String? | VarChar(50) | |
| instructions | String? | | |
| status | String | @default("PENDING"), VarChar(30) | |
| appointmentRequired | Boolean | @default(false) | |
| appointmentNumber | String? | VarChar(50) | |

**Relations:** Load, Order

## CheckCall

Tracking check calls on loads.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| loadId | String | FK to Load | |
| city | String? | VarChar(100) | |
| state | String? | VarChar(50) | |
| latitude | Decimal? | Decimal(10,7) | |
| longitude | Decimal? | Decimal(10,7) | |
| status | String? | VarChar(30) | |
| notes | String? | | |
| contacted | String? | VarChar(50) | Who was contacted |
| contactMethod | String? | VarChar(20) | PHONE, EMAIL, EDI |
| eta | DateTime? | | Updated ETA |
| milesRemaining | Int? | | |
| source | String? | VarChar(30) | MANUAL, ELD, GPS |
| createdAt | DateTime | @default(now()) | |

## StatusHistory

Load status change audit trail.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| loadId | String | FK to Load | |
| status | String | VarChar(30) | New status |
| previousStatus | String? | VarChar(30) | Old status |
| notes | String? | | |
| changedById | String? | | User who changed |
| createdAt | DateTime | @default(now()) | |

**Indexes:** `[loadId]`, `[status]`, `[createdAt]`
