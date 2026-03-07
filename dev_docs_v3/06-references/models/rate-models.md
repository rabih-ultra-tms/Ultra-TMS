# Rate Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| RateContract | Rate contract/tariff definitions | Company, ContractLaneRate, AccessorialRate |
| ContractLaneRate | Lane-specific rates in rate contracts | RateContract |
| AccessorialRate | Accessorial charge definitions | RateContract |
| LoadTender | Electronic load tender | Load, Carrier, TenderRecipient |
| TenderRecipient | Load tender recipients | LoadTender, Carrier |

## RateContract

Rate contracts/tariffs for customers.

| Field | Type | Notes |
|-------|------|-------|
| companyId | String | FK to Company |
| contractNumber | String | VarChar(50) |
| name | String | VarChar(255) |
| effectiveDate | DateTime | Date |
| expirationDate | DateTime? | Date |
| status | String | @default("ACTIVE") |
| autoRenew | Boolean | @default(false) |
| defaultRateType | String? | VarChar(50) |
| fuelIncluded | Boolean | @default(false) |
| defaultFuelSurchargePercent | Decimal? | |
| minimumCharge | Decimal? | |
| notes | String? | |

**Relations:** ContractLaneRate[], AccessorialRate[]

## ContractLaneRate

Origin-destination lane rates within a rate contract.

| Field | Type | Notes |
|-------|------|-------|
| contractId | String | FK to RateContract |
| originCity/State/Zip | String? | |
| originZone | String? | Zone-based |
| originRadiusMiles | Int? | |
| destinationCity/State/Zip | String? | |
| destinationZone | String? | |
| destinationRadiusMiles | Int? | |
| serviceType | String? | VarChar(50) |
| equipmentType | String? | VarChar(50) |
| rateType | String | VarChar(50) — FLAT, PER_MILE, PER_CWT |
| rateAmount | Decimal | Decimal(12,2) |
| minimumCharge | Decimal? | |
| fuelIncluded | Boolean | @default(false) |
| fuelSurchargeType | String? | |
| fuelSurchargePercent | Decimal? | |
| volumeMin/volumeMax | Int? | Volume discount tiers |
| effectiveDate/expirationDate | DateTime? | |

## AccessorialRate

Standard accessorial charge definitions.

| Field | Type | Notes |
|-------|------|-------|
| contractId | String? | FK to RateContract (null = global) |
| accessorialType | String | VarChar(50) — DETENTION, LAYOVER, LUMPER, etc. |
| name | String | VarChar(255) |
| rateType | String | VarChar(50) — FLAT, PER_HOUR, PER_CWT |
| rateAmount | Decimal | Decimal(10,2) |
| minimumCharge | Decimal? | |
| maximumCharge | Decimal? | |
| appliesToServiceTypes | String[] | |
| isDefault | Boolean | @default(false) |
| status | String | @default("ACTIVE") |

## LoadTender / TenderRecipient

Electronic load tendering to carriers.

**LoadTender:** loadId, tenderNumber, status (SENT, ACCEPTED, REJECTED, EXPIRED), sentAt, expiresAt, respondedAt, notes
**TenderRecipient:** tenderId, carrierId, status, respondedAt, responseNotes, declineReason
