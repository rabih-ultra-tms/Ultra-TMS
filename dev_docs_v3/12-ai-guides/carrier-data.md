# Carrier Data Dictionary

> AI Dev Guide | Source: Prisma schema + `dev_docs/11-ai-dev/91-entity-data-dictionary.md`

---

## Carrier Entity

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| id | String (UUID) | Auto | - | Generated | Primary key |
| name | String | Yes | 2-200 chars | - | Legal company name |
| dba | String | No | 2-200 chars | null | Doing business as |
| mcNumber | String | Conditional | 1-10 digits, unique per tenant | null | Motor Carrier number |
| dotNumber | String | Conditional | 1-8 digits, unique per tenant | null | DOT number |
| status | CarrierStatus | Yes | Enum | PENDING | PENDING, ACTIVE, INACTIVE, SUSPENDED, BLACKLISTED |
| isPreferred | Boolean | No | - | false | Preferred carrier flag |
| performanceScore | Decimal | No | 0-100 | null | Calculated performance score |
| email | String | Yes | Valid email | - | Primary contact email |
| phone | String | Yes | E.164 | - | Primary phone |
| address | Json | Yes | Address object | - | Physical address |
| paymentTerms | String | No | - | NET30 | NET30, QUICK_PAY, etc. |
| tenantId | String | Yes | FK -> Tenant | - | Tenant isolation |
| external_id | String | No | - | null | Migration source ID |
| custom_fields | Json | No | - | null | Custom attributes |
| createdAt | DateTime | Auto | - | now() | Created timestamp |
| updatedAt | DateTime | Auto | - | auto | Updated timestamp |
| deletedAt | DateTime | No | - | null | Soft delete |

**Constraint:** At least one of `mcNumber` or `dotNumber` must be provided.

## CarrierInsurance Entity

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| id | String (UUID) | Auto | - | Generated | Primary key |
| carrierId | String | Yes | FK -> Carrier | - | Parent carrier |
| type | InsuranceType | Yes | Enum | - | AUTO_LIABILITY, CARGO, GENERAL_LIABILITY, WORKERS_COMP |
| provider | String | Yes | - | - | Insurance company name |
| policyNumber | String | Yes | - | - | Policy number |
| coverageAmount | Decimal | Yes | Min $750k (auto), $100k (cargo) | - | Coverage amount |
| expiresAt | DateTime | Yes | Must be future | - | Expiration date |
| documentUrl | String | No | Valid URL | null | Certificate document |
| status | InsuranceStatus | Yes | Enum | ACTIVE | ACTIVE, EXPIRING_SOON, EXPIRED |
| tenantId | String | Yes | FK -> Tenant | - | Tenant isolation |

## CarrierDriver Entity

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| id | String (UUID) | Auto | - | Generated | Primary key |
| carrierId | String | Yes | FK -> Carrier | - | Parent carrier |
| firstName | String | Yes | - | - | Driver first name |
| lastName | String | Yes | - | - | Driver last name |
| licenseNumber | String | Yes | - | - | CDL number |
| licenseState | String | Yes | 2-char state | - | Issuing state |
| licenseClass | String | Yes | Enum | - | CDL_A, CDL_B, CDL_C |
| hasHazmat | Boolean | No | - | false | Hazmat endorsement |
| hasTanker | Boolean | No | - | false | Tanker endorsement |
| status | DriverStatus | Yes | Enum | ACTIVE | ACTIVE, INACTIVE, SUSPENDED |
| tenantId | String | Yes | FK -> Tenant | - | Tenant isolation |

## CarrierContact Entity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | String (UUID) | Auto | Primary key |
| carrierId | String | Yes | FK -> Carrier |
| firstName | String | Yes | - |
| lastName | String | Yes | - |
| email | String | Yes | Valid email |
| phone | String | No | E.164 |
| title | String | No | Job title |
| isPrimary | Boolean | No | Default false |
| tenantId | String | Yes | FK -> Tenant |

## CarrierDocument Entity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | String (UUID) | Auto | Primary key |
| carrierId | String | Yes | FK -> Carrier |
| type | String | Yes | W9, INSURANCE_CERT, AUTHORITY_LETTER, etc. |
| fileName | String | Yes | Original file name |
| fileUrl | String | Yes | Storage URL |
| status | String | Yes | PENDING, APPROVED, REJECTED |
| tenantId | String | Yes | FK -> Tenant |

## Relationships

```
Carrier
  |-- CarrierContact[] (1:many)
  |-- CarrierDriver[] (1:many)
  |-- CarrierInsurance[] (1:many)
  |-- CarrierDocument[] (1:many)
  |-- Load[] (1:many, via Load.carrierId)
```

## Equipment Types (Enum)

DRY_VAN, REEFER, FLATBED, STEP_DECK, LOWBOY, CONESTOGA, POWER_ONLY, SPRINTER, HOTSHOT, TANKER, HOPPER, CONTAINER
