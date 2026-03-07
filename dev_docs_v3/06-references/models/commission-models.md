# Commission Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| CommissionPlan | Plan definitions with rules | CommissionPlanTier, CommissionEntry, UserCommissionAssignment |
| CommissionPlanTier | Tiered rate structures | CommissionPlan |
| CommissionEntry | Individual commission calculations | User, Load, Order, CommissionPlan, CommissionPayout |
| CommissionPayout | Payout batches | User, CommissionEntry |
| UserCommissionAssignment | User-to-plan assignments | User, CommissionPlan |
| CustomerCommissionOverride | Per-customer rate overrides | Company, User |

## CommissionPlan

Defines how commissions are calculated for sales reps.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(255) |
| description | String? | |
| planType | String | VarChar(50) — FLAT, PERCENTAGE, TIERED |
| status | String | @default("ACTIVE") |
| isDefault | Boolean | @default(false) |
| effectiveDate | DateTime | Date |
| endDate | DateTime? | Date |
| flatAmount | Decimal? | Decimal(10,2) — for FLAT type |
| percentRate | Decimal? | Decimal(5,2) — for PERCENTAGE type |
| calculationBasis | String? | VarChar(50) — REVENUE, MARGIN, PROFIT |
| minimumMarginPercent | Decimal? | Minimum margin to qualify |
| rules | Json | @default("{}") — complex rule definitions |

**Unique:** `[tenantId, name, effectiveDate]`

## CommissionPlanTier

Tiered commission rates (e.g., 10% up to $50K, 12% from $50K-$100K).

| Field | Type | Notes |
|-------|------|-------|
| planId | String | FK to CommissionPlan |
| tierNumber | Int | Sequence |
| tierName | String? | VarChar(100) |
| thresholdType | String | VarChar(50) — REVENUE, LOADS, MARGIN |
| thresholdMin | Decimal | Decimal(14,2) |
| thresholdMax | Decimal? | Decimal(14,2) — null = unlimited |
| rateType | String | VarChar(50) — FLAT, PERCENTAGE |
| rateAmount | Decimal | Decimal(10,2) |
| periodType | String? | VarChar(50) — MONTHLY, QUARTERLY |

**Unique:** `[planId, tierNumber]`

## CommissionEntry

Individual commission calculation record per load/order.

| Field | Type | Notes |
|-------|------|-------|
| userId | String | FK to User (sales rep) |
| loadId | String? | FK to Load |
| orderId | String? | FK to Order |
| entryType | String | VarChar(50) — STANDARD, BONUS, ADJUSTMENT, REVERSAL |
| planId | String? | FK to CommissionPlan |
| calculationBasis | String? | REVENUE, MARGIN, etc. |
| basisAmount | Decimal? | Decimal(12,2) — base amount |
| rateApplied | Decimal? | Decimal(5,2) — rate used |
| commissionAmount | Decimal | Decimal(12,2) — calculated amount |
| isSplit | Boolean | @default(false) |
| splitPercent | Decimal | @default(100) |
| parentEntryId | String? | For split entries |
| status | String | @default("PENDING") — PENDING, APPROVED, PAID, REVERSED |
| commissionPeriod | DateTime | Date — period this belongs to |
| payoutId | String? | FK to CommissionPayout |
| paidAt | DateTime? | |
| reversedAt/reversedBy/reversalReason | | Reversal tracking |

**Self-relation:** parentEntry / splitEntries
**Indexes:** `[tenantId, commissionPeriod]`, `[tenantId, status]`, `[userId]`, `[loadId]`

## CommissionPayout

Batch payout to a sales rep for a period.

| Field | Type | Notes |
|-------|------|-------|
| payoutNumber | String | VarChar(50), unique per tenant |
| payoutDate | DateTime | Date |
| periodStart/periodEnd | DateTime | Date range |
| userId | String | FK to User |
| grossCommission | Decimal | Decimal(12,2) |
| drawRecovery | Decimal | @default(0) — draw recovery deduction |
| adjustments | Decimal | @default(0) |
| netPayout | Decimal | Decimal(12,2) |
| status | String | @default("PENDING") — PENDING, APPROVED, PAID |
| approvedBy/approvedAt | | Approval workflow |
| paymentMethod | String? | CHECK, ACH |
| paymentReference | String? | |
| paidAt | DateTime? | |

**Relations:** CommissionEntry[], User (recipient), User (approver)

## UserCommissionAssignment

Links users to commission plans with effective dates.

| Field | Type | Notes |
|-------|------|-------|
| userId | String | FK to User |
| planId | String | FK to CommissionPlan |
| effectiveDate | DateTime | Date |
| endDate | DateTime? | Date |
| overrideRate | Decimal? | Decimal(5,2) — override plan rate |
| status | String | @default("ACTIVE") |

**Unique:** `[userId, planId, effectiveDate]`
