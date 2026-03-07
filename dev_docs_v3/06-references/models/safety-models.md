# Safety Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| SafetyIncident | Safety incident reports | Carrier, Load, Driver |
| SafetyInspection | DOT/safety inspections | Carrier, Driver |
| CsaScore | CSA BASIC scores | Carrier, FmcsaCarrierRecord |
| SafetyAlert | Safety-triggered alerts | Carrier |
| SafetyAuditTrail | Safety audit records | Carrier |
| FmcsaCarrierRecord | FMCSA SAFER data cache | Carrier, CsaScore |
| FmcsaComplianceLog | FMCSA check history | Carrier |

## SafetyIncident

Safety incident reporting.

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | FK to Carrier |
| loadId | String? | FK to Load |
| driverId | String? | FK to Driver |
| incidentType | String | VarChar(100) — ACCIDENT, SPILL, INJURY, etc. |
| incidentDate | DateTime | |
| location | String? | VarChar(500) |
| severity | String | VarChar(50) — MINOR, MAJOR, CRITICAL |
| description | String | |
| rootCause | String? | |
| correctiveAction | String? | |
| injuryCount | Int | @default(0) |
| fatalityCount | Int | @default(0) |
| propertyDamage | Decimal? | Decimal(12,2) |
| reportedToAuthority | Boolean | @default(false) |
| status | String | @default("REPORTED") — REPORTED, INVESTIGATING, RESOLVED, CLOSED |

## SafetyInspection

DOT roadside inspections.

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | FK to Carrier |
| driverId | String? | FK to Driver |
| inspectionDate | DateTime | |
| inspectionType | String | VarChar(100) |
| inspectionLevel | Int? | DOT levels 1-5 |
| location | String? | |
| state | String? | VarChar(2) |
| inspectorName | String? | |
| reportNumber | String? | VarChar(100) |
| violations | Json | @default("[]") |
| violationCount | Int | @default(0) |
| oosViolations | Int | @default(0) — out of service |
| isOutOfService | Boolean | @default(false) |
| result | String | VarChar(50) — PASS, VIOLATION, OOS |

## CsaScore

FMCSA CSA BASIC safety scores.

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | FK to Carrier |
| fmcsaRecordId | String? | FK to FmcsaCarrierRecord |
| basicType | CSABasicType enum | UNSAFE_DRIVING, HOS, VEHICLE_MAINTENANCE, etc. |
| score | Decimal? | Decimal(5,2) |
| percentile | Int? | |
| threshold | Int? | |
| isAboveThreshold | Boolean | @default(false) |
| isAlert | Boolean | @default(false) |
| inspectionCount/violationCount | Int | |
| asOfDate | DateTime | Date |

**Unique:** `[tenantId, carrierId, basicType, asOfDate]`

## FmcsaCarrierRecord

Cached FMCSA SAFER data for carriers.

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String | @unique — FK to Carrier |
| dotNumber/mcNumber | String? | |
| legalName/dbaName | String? | |
| operatingStatus | SaferDataStatus? | |
| commonAuthority/contractAuthority/brokerAuthority | Boolean | |
| physicalAddress/City/State/Zip | String? | |
| powerUnitCount/driverCount | Int? | |
| saferDataJson | Json? | Raw SAFER data |
| lastSyncedAt | DateTime? | |

**Relations:** CsaScore[]
