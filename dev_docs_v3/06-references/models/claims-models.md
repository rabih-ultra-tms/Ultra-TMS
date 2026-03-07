# Claims Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Claim | Freight claims (damage, loss, shortage) | Load, Order, Carrier, Company |
| ClaimItem | Damaged/lost items | Claim |
| ClaimDocument | Supporting documents | Claim, Document |
| ClaimNote | Internal/external notes | Claim |
| ClaimAdjustment | Amount adjustments | Claim |
| ClaimContact | Involved parties | Claim |
| ClaimTimeline | Event timeline | Claim |
| SubrogationRecord | Subrogation tracking | Claim |

## Claim

Master claim record for freight damage, loss, or shortage.

| Field | Type | Notes |
|-------|------|-------|
| claimNumber | String | @unique, VarChar(50) |
| loadId | String? | FK to Load |
| orderId | String? | FK to Order |
| carrierId | String? | FK to Carrier |
| companyId | String? | FK to Company (customer) |
| claimType | ClaimType enum | DAMAGE, LOSS, SHORTAGE, DELAY, OVERCHARGE |
| status | ClaimStatus | @default(DRAFT) — DRAFT, FILED, UNDER_REVIEW, APPROVED, DENIED, SETTLED, CLOSED |
| disposition | ClaimDisposition? | |
| claimedAmount | Decimal | Decimal(12,2) |
| approvedAmount | Decimal? | Decimal(12,2) |
| paidAmount | Decimal | @default(0), Decimal(12,2) |
| incidentDate | DateTime | Date |
| incidentLocation | String? | VarChar(500) |
| description | String | |
| claimantName | String | VarChar(255) |
| claimantCompany/Email/Phone | String? | |
| filedDate | DateTime | @default(now()) |
| dueDate | DateTime? | |
| closedDate | DateTime? | |
| assignedToId | String? | |
| investigationNotes | String? | |
| rootCause | String? | |
| preventionNotes | String? | |

**Relations:** ClaimItem[], ClaimDocument[], ClaimNote[], ClaimAdjustment[], ClaimContact[], ClaimTimeline[], SubrogationRecord[]

## ClaimItem

Individual items claimed.

| Field | Type | Notes |
|-------|------|-------|
| claimId | String | FK to Claim |
| description | String | VarChar(500) |
| quantity | Int | |
| unitPrice | Decimal | Decimal(10,2) |
| totalValue | Decimal | Decimal(12,2) |
| damageType | String? | VarChar(100) |
| damageExtent | String? | VarChar(100) — TOTAL, PARTIAL |

## ClaimTimeline

Audit trail of claim events.

| Field | Type | Notes |
|-------|------|-------|
| claimId | String | FK to Claim |
| eventType | String | VarChar(100) — FILED, STATUS_CHANGE, NOTE_ADDED, etc. |
| eventData | Json? | |
| description | String? | VarChar(500) |
| oldValue/newValue | String? | VarChar(500) |
