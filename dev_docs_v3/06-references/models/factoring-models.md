# Factoring Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| FactoringCompany | Factoring company records | CarrierFactoringStatus, NOARecord, FactoredPayment |
| NOARecord | Notice of Assignment records | FactoringCompany, Carrier, FactoringVerification |
| FactoredPayment | Payments to factoring companies | FactoringCompany, Settlement |
| FactoringVerification | NOA verification records | NOARecord, Document |
| CarrierFactoringStatus | Carrier's factoring linkage | Carrier, FactoringCompany |

## FactoringCompany

Factoring company entity.

| Field | Type | Notes |
|-------|------|-------|
| companyCode | String | @unique, VarChar(50) |
| name | String | VarChar(255) |
| email/phone/fax | String? | |
| address | String? | |
| verificationMethod | String | VarChar(50) — EMAIL, PHONE, API |
| apiEndpoint | String? | VarChar(500) |
| apiKey | String? | VarChar(255) |
| verificationSLAHours | Int | @default(24) |
| status | String | @default("ACTIVE") |

**Relations:** CarrierFactoringStatus[], FactoredPayment[], NOARecord[]

## NOARecord

Notice of Assignment — factoring company claims payment rights.

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | FK to Carrier |
| factoringCompanyId | String | FK to FactoringCompany |
| noaNumber | String | VarChar(50) |
| receivedDate | DateTime | Date |
| effectiveDate | DateTime | Date |
| expirationDate | DateTime? | |
| status | String | @default("PENDING") — PENDING, VERIFIED, ACTIVE, REVOKED, EXPIRED |
| verificationStatus | String? | |
| verifiedAt/verifiedBy | DateTime?/String? | |
| revokedAt/revokedBy/revocationReason | | |
| documentUrl | String? | Scanned NOA document |

**Relations:** FactoringVerification[]

## FactoredPayment

Payment made to factoring company instead of carrier.

| Field | Type | Notes |
|-------|------|-------|
| settlementId | String | FK to Settlement |
| factoringCompanyId | String | FK to FactoringCompany |
| paymentAmount | Decimal | Decimal(12,2) |
| paymentDate | DateTime | Date |
| paymentMethod | PaymentMethod enum | CHECK, ACH, WIRE |
| verificationCode | String? | VarChar(100) |

## FactoringVerification

NOA verification audit trail.

| Field | Type | Notes |
|-------|------|-------|
| noaRecordId | String | FK to NOARecord |
| verificationDate | DateTime | Date |
| verificationMethod | VerificationMethod enum | EMAIL, PHONE, API, FAX |
| contactedPerson | String? | |
| verificationStatus | VerificationStatus enum | VERIFIED, FAILED, PENDING |
| verificationDocumentId | String? | FK to Document |
| nextVerificationDate | DateTime? | |

## CarrierFactoringStatus

Links carrier to active factoring arrangement.

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | @unique — one per carrier |
| factoringStatus | FactoringStatus | @default(NONE) — NONE, ACTIVE, SUSPENDED |
| factoringCompanyId | String? | FK to FactoringCompany |
| activeNoaId | String? | |
| quickPayEnabled | Boolean | @default(false) |
| quickPayFeePercent | Decimal? | |
