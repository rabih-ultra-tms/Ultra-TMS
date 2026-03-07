# Load Board Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| LoadPosting | Load postings to external boards | Load, LoadBid, CarrierLoadView |
| LoadBid | Carrier bids on postings | LoadPosting, Load, Carrier |
| LoadPost | Internal load board posts | Load |
| LoadBoardProvider | External board providers (DAT, Truckstop) | LoadBoardAccount |
| LoadBoardAccount | Provider account credentials | LoadBoardProvider |
| PostLead | Carrier leads from postings | Carrier |
| BoardMetric | Posting performance metrics | |
| CapacitySearch | Capacity search queries | CapacityResult |
| CapacityResult | Search results with carrier matches | CapacitySearch |

## LoadPosting

Posts loads to external load boards for carrier sourcing.

| Field | Type | Notes |
|-------|------|-------|
| loadId | String | FK to Load |
| boardProviderId | String? | FK to LoadBoardProvider |
| postingNumber | String | VarChar(50) |
| status | String | @default("DRAFT") — DRAFT, POSTED, COVERED, EXPIRED |
| originCity/originState | String | |
| destCity/destState | String | |
| equipmentType | String | VarChar(50) |
| postedRate | Decimal? | Decimal(12,2) — public rate |
| targetRate | Decimal? | Internal target |
| pickupDate | DateTime | |
| deliveryDate | DateTime? | |
| weight | Decimal? | |
| length | Int? | |
| commodity | String? | |
| comments | String? | Public comments |
| contactName/contactPhone/contactEmail | String? | |
| externalPostId | String? | ID on external board |
| postedAt | DateTime? | |
| expiresAt | DateTime? | |
| viewCount | Int | @default(0) |
| bidCount | Int | @default(0) |
| leadCount | Int | @default(0) |

**Relations:** Load, LoadBid[], CarrierLoadView[], PostLead[]

## LoadBid

Carrier bid on a load posting.

| Field | Type | Notes |
|-------|------|-------|
| postingId | String | FK to LoadPosting |
| loadId | String | FK to Load |
| carrierId | String | FK to Carrier |
| bidAmount | Decimal | Decimal(12,2) |
| rateType | String? | VarChar(50) |
| notes | String? | |
| truckNumber | String? | |
| driverName | String? | |
| status | String | @default("PENDING") — PENDING, ACCEPTED, REJECTED, COUNTERED |
| counterAmount | Decimal? | Counter-offer |
| counterNotes | String? | |
| acceptedAt/rejectedAt | DateTime? | |
| rejectionReason | String? | |
| submittedAt | DateTime | |
| expiresAt | DateTime? | |
| source | String? | VarChar(50) — DAT, TRUCKSTOP, DIRECT |

**Indexes:** `[postingId, status]`, `[carrierId, status]`

## LoadBoardProvider

External load board provider configuration.

| Field | Type | Notes |
|-------|------|-------|
| providerName | String | VarChar(100) — DAT, TRUCKSTOP, 123LOADBOARD |
| providerCode | String | VarChar(50) |
| apiEndpoint | String? | VarChar(500) |
| isActive | Boolean | @default(true) |
| supportedFeatures | Json | @default("{}") |

## LoadBoardAccount

Tenant's account with a load board provider.

| Field | Type | Notes |
|-------|------|-------|
| providerId | String | FK to LoadBoardProvider |
| accountName | String | VarChar(255) |
| accountUsername | String? | |
| accountPassword | String? | Encrypted |
| accountApiKey | String? | |
| isActive | Boolean | @default(true) |
| isVerified | Boolean | @default(false) |
| postsThisMonth | Int | @default(0) |
| totalPosts | Int | @default(0) |

## BoardMetric

Load board posting performance analytics.

| Field | Type | Notes |
|-------|------|-------|
| accountId | String? | FK to LoadBoardAccount |
| periodType | String | VarChar(20) — DAILY, WEEKLY, MONTHLY |
| periodStart/periodEnd | DateTime | Date range |
| postsCreated/postsActive/postsCovered | Int | Counts |
| totalViews/totalClicks/totalLeads | Int | Engagement |
| avgClickRate/avgConversionRate | Decimal? | |
| avgPostedRate/avgAcceptedRate | Decimal? | Rate analytics |
