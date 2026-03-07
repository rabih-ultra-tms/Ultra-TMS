# Contracts Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Contract | Customer/carrier/agent contracts | Company, Carrier, Agent |
| ContractAmendment | Contract change tracking | Contract, Document |
| ContractRateTable | Rate tables within contracts | Contract, ContractRateLane |
| ContractRateLane | Lane-specific rates | ContractRateTable, FuelSurchargeTable |
| ContractSLA | Service level agreements | Contract |
| ContractClause | Reusable contract clauses | |
| ContractTemplate | Contract document templates | |
| ContractMetric | Contract performance metrics | Contract |
| ContractLaneRate | Legacy lane rate model | RateContract |
| FuelSurchargeTable | Fuel surcharge schedule | Contract, FuelSurchargeTier |
| FuelSurchargeTier | Fuel price tiers | FuelSurchargeTable |
| VolumeCommitment | Volume commitment tracking | Contract |

## Contract

Master contract entity supporting customer, carrier, and agent contracts.

| Field | Type | Notes |
|-------|------|-------|
| contractNumber | String | @unique, VarChar(50) |
| contractType | ContractType enum | CUSTOMER, CARRIER, AGENT |
| customerId | String? | FK to Company |
| carrierId | String? | FK to Carrier |
| agentId | String? | FK to Agent |
| name | String | VarChar(255) |
| effectiveDate | DateTime | Date |
| expirationDate | DateTime? | Date |
| status | ContractStatus | @default(DRAFT) — DRAFT, PENDING, ACTIVE, EXPIRED, TERMINATED |
| autoRenew | Boolean | @default(false) |
| renewalTermDays | Int? | |
| noticeDays | Int? | Cancellation notice |
| documentId | String? | @unique — signed document |
| esignProvider | String? | DocuSign, etc. |
| esignEnvelopeId | String? | |
| signedAt/signedBy | DateTime?/String? | |
| minimumRevenue/maximumRevenue | Decimal? | |

**Relations:** ContractAmendment[], ContractRateTable[], ContractSLA[], ContractMetric[], FuelSurchargeTable[], VolumeCommitment[]

## ContractSLA

Service level agreements with penalty tracking.

| Field | Type | Notes |
|-------|------|-------|
| contractId | String | FK to Contract |
| slaType | SLAType enum | ON_TIME_PICKUP, ON_TIME_DELIVERY, CLAIMS_RATE, RESPONSE_TIME |
| targetPercent | Decimal | Decimal(5,2) |
| measurementPeriod | String | VarChar(50) — MONTHLY, QUARTERLY |
| penaltyAmount | Decimal? | Fixed penalty |
| penaltyPercent | Decimal? | Percentage penalty |
| status | String | @default("ACTIVE") |

## ContractRateTable / ContractRateLane

Rate tables contain lane-specific rates with equipment type and fuel surcharge links.

**ContractRateTable:** contractId, tableName, effectiveDate, expirationDate, isActive
**ContractRateLane:** rateTableId, originCity/State/Zip, destCity/State/Zip, equipmentType, rateType (enum), rateAmount, currency, fuelSurchargeTableId

## FuelSurchargeTable / FuelSurchargeTier

Fuel surcharge schedules with tiered pricing.

**Table:** name, contractId?, basePrice, effectiveDate, isDefault
**Tier:** tableId, tierNumber, priceMin/priceMax, surchargePercent
