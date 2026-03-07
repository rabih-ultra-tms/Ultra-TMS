# Carrier Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Carrier | Trucking company entity | Load, CarrierContact, CarrierInsurance, CarrierDocument |
| CarrierContact | Contacts at carrier companies | Carrier |
| CarrierDocument | Carrier compliance documents | Carrier |
| CarrierInsurance | Insurance policies (GL, Auto, Cargo, etc.) | Carrier |
| CarrierCapacity | Available truck capacity | Carrier |
| CarrierWatchlist | Risk/compliance watchlist | Carrier |
| CarrierPerformanceHistory | Historical performance metrics | Carrier |
| CarrierFactoringStatus | Factoring company linkage | Carrier, FactoringCompany |
| Driver | Carrier drivers | Carrier, DriverQualificationFile |
| DriverQualificationFile | Driver compliance docs (CDL, medical, etc.) | Driver |
| InsuranceCertificate | Detailed insurance certificates | Carrier |
| AuthorityChange | FMCSA authority change tracking | Carrier |

## Carrier

Core carrier/trucking company entity. ~120 fields covering identity, compliance, performance, and payment.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | String | @id @default(uuid()) | |
| tenantId | String | @index | |
| mcNumber | String? | VarChar(20) | Motor carrier number |
| dotNumber | String? | VarChar(20) | DOT number |
| scacCode | String? | VarChar(10) | Standard carrier alpha code |
| carrierCode | String? | VarChar(50) | Internal code |
| legalName | String | VarChar(255) | |
| dbaName | String? | VarChar(255) | |
| status | String | @default("PENDING"), VarChar(50) | PENDING, APPROVED, ACTIVE, SUSPENDED, BLACKLISTED |
| equipmentTypes | String[] | VarChar(50) | DRY_VAN, REEFER, FLATBED, etc. |
| truckCount | Int? | | |
| serviceStates | String[] | VarChar(3) | Operating states |
| preferredLanes | Json | @default("[]") | |
| qualificationTier | String? | VarChar(20) | GOLD, SILVER, BRONZE |
| fmcsaAuthorityStatus | String? | VarChar(50) | |
| fmcsaSafetyRating | String? | VarChar(50) | |
| fmcsaOutOfService | Boolean | @default(false) | |
| complianceScore | Int? | | |
| safetyScore | Int? | | |
| totalLoads | Int | @default(0) | |
| onTimePickupRate | Decimal? | Decimal(5,2) | |
| onTimeDeliveryRate | Decimal? | Decimal(5,2) | |
| avgRating | Decimal? | Decimal(3,2) | |
| paymentTerms | String? | VarChar(50) | |
| quickPayFeePercent | Decimal? | Decimal(5,2) | |
| w9OnFile | Boolean | @default(false) | |
| tags | String[] | VarChar(100) | |

**Relations:** Load[], CarrierContact[], CarrierDocument[], CarrierInsurance[], CarrierCapacity[], Driver[], Contract[], Settlement[], Claim[], LoadBid[], CsaScore[], FmcsaCarrierRecord?, CarrierPortalUser[], CarrierWatchlist[], SafetyIncident[], SafetyInspection[]

**Unique:** `[tenantId, dotNumber]`, `[tenantId, mcNumber]`
**Indexes:** `[mcNumber]`, `[dotNumber]`, `[scacCode]`, `[status]`, `[equipmentTypes]`, `[serviceStates]`, `[qualificationTier]`, `[tenantId, status]`, `[tenantId, deletedAt]`

## CarrierContact

| Field | Type | Notes |
|-------|------|-------|
| id | String | UUID PK |
| carrierId | String | FK to Carrier |
| firstName/lastName | String | VarChar(100) |
| title | String? | VarChar(100) |
| role | String? | VarChar(50) — DISPATCH, BILLING, SAFETY |
| email/phone/mobile | String? | |
| isPrimary | Boolean | @default(false) |
| receivesRateConfirms | Boolean | @default(false) |
| receivesPodRequests | Boolean | @default(false) |
| receivesPayments | Boolean | @default(false) |
| isActive | Boolean | @default(true) |

## CarrierInsurance

| Field | Type | Notes |
|-------|------|-------|
| insuranceType | InsuranceType enum | AUTO_LIABILITY, CARGO, GENERAL_LIABILITY, etc. |
| policyNumber | String | VarChar(100) |
| carrierName | String | Insurance company name |
| coverageAmount | Decimal | Decimal(15,2) |
| effectiveDate/expirationDate | DateTime | Date range |
| isExpired | Boolean | @default(false) |
| isVerified | Boolean | @default(false) |
| certificateUrl | String? | VarChar(500) |

## CarrierDocument

| Field | Type | Notes |
|-------|------|-------|
| documentType | String | VarChar(50) — W9, AUTHORITY, INSURANCE_CERT, etc. |
| name | String | VarChar(255) |
| filePath | String? | VarChar(500) — S3 path |
| fileSize | Int? | Bytes |
| mimeType | String? | VarChar(100) |
| status | String | @default("PENDING") — PENDING, APPROVED, REJECTED |
| expirationDate | DateTime? | |

## Driver

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | FK to Carrier |
| firstName/lastName | String | VarChar(100) |
| cdlNumber | String? | VarChar(50) |
| cdlState | String? | VarChar(3) |
| cdlExpiration | DateTime? | |
| cdlClass | String? | VarChar(5) — A, B, C |
| endorsements | String[] | VarChar(20) — H, N, T, X |
| status | String | @default("ACTIVE") |
| currentLocationLat/Lng | Decimal? | GPS position |
| eldProvider | String? | VarChar(50) |
| eldDriverId | String? | VarChar(100) |

**Unique:** `[tenantId, carrierId, cdlNumber]`

## CarrierCapacity

Available truck capacity for load matching.

| Field | Type | Notes |
|-------|------|-------|
| equipmentType | String | VarChar(50) |
| availableUnits | Int | @default(0) |
| totalUnits | Int | |
| city/state/zipCode | String? | Location |
| lat/lng | Decimal? | Decimal(10,7) |
| effectiveDate | DateTime | Date |
| status | CapacityStatus | AVAILABLE, COMMITTED, etc. |
