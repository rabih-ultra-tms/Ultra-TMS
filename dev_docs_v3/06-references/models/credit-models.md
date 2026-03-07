# Credit Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| CreditApplication | Credit application workflow | Company |
| CreditLimit | Customer credit limits | Company |
| CreditHold | Credit hold/freeze records | Company |
| CollectionActivity | AR collection tracking | Company, Invoice |
| PaymentPlan | Structured payment plans | Company |

## CreditApplication

Customer credit application with full underwriting data.

| Field | Type | Notes |
|-------|------|-------|
| applicationNumber | String | @unique, VarChar(50) |
| companyId | String | FK to Company |
| status | CreditApplicationStatus | PENDING, UNDER_REVIEW, APPROVED, DENIED, EXPIRED |
| requestedLimit | Decimal | Decimal(12,2) |
| approvedLimit | Decimal? | Decimal(12,2) |
| businessName | String | VarChar(255) |
| federalTaxId | String? | VarChar(20) |
| dunsNumber | String? | |
| yearsInBusiness | Int? | |
| annualRevenue | Decimal? | Decimal(15,2) |
| bankName/bankContactName/bankContactPhone | String? | Bank reference |
| tradeReferences | Json? | Array of references |
| ownerName/ownerSSN/ownerAddress | String? | Personal guarantee |
| creditScore | Int? | |
| creditCheckDate | DateTime? | |
| reviewedById/reviewedAt | | Underwriter |
| denialReason | String? | |
| approvedAt | DateTime? | |
| expiresAt | DateTime? | |

## CreditLimit

Active credit limit for a customer.

| Field | Type | Notes |
|-------|------|-------|
| companyId | String | FK to Company |
| creditLimit | Decimal | Decimal(12,2) — total limit |
| availableCredit | Decimal | Decimal(12,2) — remaining |
| usedCredit | Decimal | @default(0) |
| status | CreditLimitStatus | ACTIVE, SUSPENDED, EXPIRED |
| paymentTerms | String? | NET30, NET60 |
| gracePeriodDays | Int | @default(0) |
| singleLoadLimit | Decimal? | Max per load |
| monthlyLimit | Decimal? | Max per month |
| lastReviewDate/nextReviewDate | DateTime? | |
| reviewFrequencyDays | Int | @default(90) |
| approvedById/approvedAt | | |
| expiresAt | DateTime? | |

**Unique:** `[tenantId, companyId]`

## CreditHold

Holds placed on customer accounts.

| Field | Type | Notes |
|-------|------|-------|
| companyId | String | FK to Company |
| reason | CreditHoldReason enum | OVER_LIMIT, PAST_DUE, BANKRUPTCY, MANUAL |
| description | String? | |
| amountHeld | Decimal? | |
| isActive | Boolean | @default(true) |
| resolvedById/resolvedAt/resolutionNotes | | Resolution |

## CollectionActivity

AR collection activity log.

| Field | Type | Notes |
|-------|------|-------|
| companyId | String | FK to Company |
| invoiceId | String? | FK to Invoice |
| activityType | CollectionActivityType enum | PHONE_CALL, EMAIL, LETTER, DEMAND, AGENCY_REFERRAL |
| subject | String? | |
| outcome | String? | |
| contactedName/Title/Phone/Email | String? | |
| followUpDate | DateTime? | |
| promisedPaymentDate | DateTime? | |
| promisedAmount | Decimal? | |

## PaymentPlan

Structured payment plans for past-due accounts.

| Field | Type | Notes |
|-------|------|-------|
| companyId | String | FK to Company |
| planNumber | String | VarChar(50) |
| totalAmount | Decimal | Decimal(12,2) |
| installmentAmount | Decimal | |
| frequency | String | WEEKLY, BIWEEKLY, MONTHLY |
| startDate | DateTime | |
| endDate | DateTime? | |
| remainingBalance | Decimal | |
| status | String | ACTIVE, COMPLETED, DEFAULTED |
