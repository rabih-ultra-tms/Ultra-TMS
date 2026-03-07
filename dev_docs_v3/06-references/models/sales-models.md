# Sales Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Quote | Customer rate quotes | Company, Contact, QuoteStop, QuoteAccessorial |
| QuoteStop | Pickup/delivery stops on a quote | Quote |
| QuoteAccessorial | Additional charges on a quote | Quote |
| QuoteRequest | Inbound quote requests | Company |

## Quote

Rate quotation for customers. Converts to Order when accepted.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| quoteNumber | String | VarChar(50) | Unique per tenant |
| companyId | String | FK to Company | |
| contactId | String? | FK to Contact | |
| serviceType | String? | VarChar(50) | FTL, LTL, etc. |
| equipmentType | String? | VarChar(50) | |
| status | String | @default("DRAFT"), VarChar(50) | DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED |
| totalRate | Decimal? | Decimal(12,2) | |
| rateType | String? | VarChar(50) | FLAT, PER_MILE, etc. |
| margin | Decimal? | Decimal(5,2) | |
| carrierCost | Decimal? | Decimal(12,2) | Estimated |
| transitDays | Int? | | |
| expirationDate | DateTime? | | |
| acceptedAt | DateTime? | | |
| rejectedAt | DateTime? | | |
| rejectionReason | String? | | |
| convertedToOrderId | String? | | FK to Order |
| notes | String? | | |
| internalNotes | String? | | |
| assignedUserId | String? | | Sales rep |

**Relations:** Company, Contact, QuoteStop[], QuoteAccessorial[], QuoteRequest?
**Unique:** `[tenantId, quoteNumber]`

## QuoteStop

Stops (pickup/delivery points) on a quote.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| quoteId | String | FK to Quote | |
| stopNumber | Int | | Sequence order |
| stopType | String | VarChar(20) | PICKUP, DELIVERY |
| facilityName | String? | VarChar(255) | |
| addressLine1 | String? | VarChar(255) | |
| city | String? | VarChar(100) | |
| state | String? | VarChar(50) | |
| postalCode | String? | VarChar(20) | |
| country | String | @default("USA") | |
| scheduledDate | DateTime? | | |
| scheduledTimeFrom | String? | VarChar(5) | |
| scheduledTimeTo | String? | VarChar(5) | |
| contactName | String? | VarChar(255) | |
| contactPhone | String? | VarChar(50) | |
| notes | String? | | |

**Unique:** `[quoteId, stopNumber]`

## QuoteAccessorial

Accessorial charges attached to quotes.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| quoteId | String | FK to Quote | |
| accessorialType | String | VarChar(50) | |
| description | String? | VarChar(255) | |
| amount | Decimal | Decimal(10,2) | |
| quantity | Int | @default(1) | |

## QuoteRequest

Inbound quote requests from customers/portal.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| requestNumber | String | VarChar(50) | |
| companyId | String? | FK to Company | |
| status | String | @default("NEW"), VarChar(50) | NEW, IN_PROGRESS, QUOTED, CLOSED |
| serviceType | String? | VarChar(50) | |
| equipmentType | String? | VarChar(50) | |
| originCity | String? | VarChar(100) | |
| originState | String? | VarChar(50) | |
| destinationCity | String? | VarChar(100) | |
| destinationState | String? | VarChar(50) | |
| requestedPickupDate | DateTime? | | |
| commodity | String? | VarChar(255) | |
| weight | Decimal? | | |
| notes | String? | | |
| assignedUserId | String? | | |
| quoteId | String? | | FK to generated Quote |

**Unique:** `[tenantId, requestNumber]`
