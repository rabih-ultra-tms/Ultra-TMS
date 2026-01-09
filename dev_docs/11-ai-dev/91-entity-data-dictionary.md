# 86 - Entity Data Dictionary

**Field-by-field specifications for all platform entities**

---

## Purpose

This document provides complete field specifications for every entity in the 3PL platform. Each entry includes:

- Field name and type
- Required/optional status
- Validation rules
- Default values
- Business meaning
- Example values

**Claude Code should reference this document when:**

- Building forms (know which fields to include)
- Building API DTOs (know validation rules)
- Building database queries (know field types)
- Displaying data (know field meanings)

---

## Core Entities

### 1. Tenant

Multi-tenant company/organization.

| Field     | Type     | Required | Validation                        | Default     | Description              | Example                           |
| --------- | -------- | -------- | --------------------------------- | ----------- | ------------------------ | --------------------------------- |
| id        | string   | Auto     | cuid                              | Generated   | Unique identifier        | `tenant_abc123`                   |
| name      | string   | âœ…      | 2-100 chars                       | -           | Company name             | `Freight Masters LLC`             |
| slug      | string   | âœ…      | lowercase, alphanumeric+dash      | -           | URL-safe identifier      | `freight-masters`                 |
| status    | enum     | âœ…      | ACTIVE, INACTIVE, SUSPENDED       | ACTIVE      | Account status           | `ACTIVE`                          |
| plan      | enum     | âœ…      | STARTER, PROFESSIONAL, ENTERPRISE | STARTER     | Subscription tier        | `PROFESSIONAL`                    |
| settings  | json     | -        | Valid JSON                        | `{}`        | Tenant-specific settings | `{"timezone": "America/Chicago"}` |
| logoUrl   | string   | -        | Valid URL                         | null        | Company logo             | `https://...`                     |
| domain    | string   | -        | Valid domain                      | null        | Custom domain            | `app.freightmasters.com`          |
| createdAt | datetime | Auto     | -                                 | now()       | Creation timestamp       | `2025-01-05T10:00:00Z`            |
| updatedAt | datetime | Auto     | -                                 | Auto-update | Last modification        | `2025-01-05T10:00:00Z`            |

**Tenant Settings Object:**

```typescript
{
  timezone: string; // e.g., "America/Chicago"
  currency: string; // e.g., "USD"
  dateFormat: string; // e.g., "MM/DD/YYYY"
  defaultPaymentTerms: number; // e.g., 30
  requirePOD: boolean; // Require POD before invoice
  autoInvoice: boolean; // Auto-generate invoices on delivery
}
```

---

### 2. User

Platform user account.

| Field           | Type     | Required | Validation                     | Default        | Description       | Example                |
| --------------- | -------- | -------- | ------------------------------ | -------------- | ----------------- | ---------------------- |
| id              | string   | Auto     | cuid                           | Generated      | Unique identifier | `user_xyz789`          |
| email           | string   | âœ…      | Valid email, unique per tenant | -              | Login email       | `john@company.com`     |
| passwordHash    | string   | âœ…      | Bcrypt hash                    | -              | Hashed password   | `$2a$10$...`           |
| firstName       | string   | âœ…      | 1-50 chars                     | -              | First name        | `John`                 |
| lastName        | string   | âœ…      | 1-50 chars                     | -              | Last name         | `Smith`                |
| role            | enum     | âœ…      | See roles below                | -              | Primary role      | `DISPATCHER`           |
| status          | enum     | âœ…      | ACTIVE, INACTIVE, PENDING      | ACTIVE         | Account status    | `ACTIVE`               |
| phone           | string   | -        | E.164 format                   | null           | Phone number      | `+15551234567`         |
| avatarUrl       | string   | -        | Valid URL                      | null           | Profile picture   | `https://...`          |
| preferredLocale | string   | -        | en, es                         | `en`           | UI language       | `es`                   |
| timezone        | string   | -        | Valid timezone                 | Tenant default | User timezone     | `America/Chicago`      |
| lastLoginAt     | datetime | -        | -                              | null           | Last login time   | `2025-01-05T10:00:00Z` |
| mfaEnabled      | boolean  | -        | -                              | false          | 2FA enabled       | `true`                 |
| mfaSecret       | string   | -        | Encrypted                      | null           | TOTP secret       | (encrypted)            |
| tenantId        | string   | âœ…      | FK to Tenant                   | -              | Parent tenant     | `tenant_abc123`        |
| createdAt       | datetime | Auto     | -                              | now()          | Created           | -                      |
| updatedAt       | datetime | Auto     | -                              | Auto           | Updated           | -                      |
| deletedAt       | datetime | -        | -                              | null           | Soft delete       | -                      |

**User Roles:**
| Role | Code | Description |
|------|------|-------------|
| Super Admin | `SUPER_ADMIN` | Full system access |
| Admin | `ADMIN` | Tenant administration |
| Operations Manager | `OPS_MANAGER` | Oversee all operations |
| Dispatcher | `DISPATCHER` | Manage loads and carriers |
| Sales Agent | `SALES_AGENT` | Customer/lead management |
| Accounting | `ACCOUNTING` | Invoices, payments, AR/AP |
| Carrier Relations | `CARRIER_RELATIONS` | Carrier onboarding/compliance |
| Read Only | `READ_ONLY` | View-only access |

---

### 3. Carrier

Trucking company or owner-operator.

| Field                   | Type     | Required | Validation               | Default   | Description            | Example                 |
| ----------------------- | -------- | -------- | ------------------------ | --------- | ---------------------- | ----------------------- |
| id                      | string   | Auto     | cuid                     | Generated | Unique identifier      | `carrier_123`           |
| name                    | string   | âœ…      | 2-200 chars              | -         | Legal company name     | `Express Freight Lines` |
| dba                     | string   | -        | 2-200 chars              | null      | Doing business as      | `Express Freight`       |
| mcNumber                | string   | âœ…      | 6 digits                 | -         | Motor Carrier number   | `123456`                |
| dotNumber               | string   | âœ…      | 5-8 digits               | -         | DOT number             | `1234567`               |
| status                  | enum     | âœ…      | See below                | PENDING   | Carrier status         | `ACTIVE`                |
| complianceStatus        | enum     | âœ…      | See below                | PENDING   | Compliance state       | `COMPLIANT`             |
| email                   | string   | âœ…      | Valid email              | -         | Primary contact email  | `dispatch@carrier.com`  |
| phone                   | string   | âœ…      | E.164                    | -         | Primary phone          | `+15551234567`          |
| fax                     | string   | -        | E.164                    | null      | Fax number             | `+15551234568`          |
| address                 | json     | âœ…      | Address object           | -         | Physical address       | See Address             |
| mailingAddress          | json     | -        | Address object           | null      | Mailing if different   | See Address             |
| insuranceExpiry         | date     | âœ…      | Future date              | -         | Insurance expiration   | `2026-06-30`            |
| insuranceAmount         | number   | âœ…      | Min 750000               | -         | Liability coverage     | `1000000`               |
| cargoInsurance          | number   | -        | Min 100000               | null      | Cargo coverage         | `100000`                |
| insuranceProvider       | string   | -        | 2-100 chars              | null      | Insurance company      | `Progressive`           |
| insurancePolicyNumber   | string   | -        | -                        | null      | Policy number          | `POL-123456`            |
| insuranceCertificateUrl | string   | -        | Valid URL                | null      | Certificate document   | `https://...`           |
| authorityType           | enum     | -        | COMMON, CONTRACT, BROKER | null      | Authority type         | `COMMON`                |
| authorityStatus         | string   | -        | From FMCSA               | null      | FMCSA authority status | `AUTHORIZED`            |
| saferData               | json     | -        | From FMCSA API           | null      | SAFER database info    | See SAFER               |
| rating                  | decimal  | -        | 0.0-5.0                  | null      | Performance rating     | `4.5`                   |
| onTimePercentage        | decimal  | -        | 0-100                    | null      | On-time delivery %     | `96.5`                  |
| totalLoads              | number   | -        | Min 0                    | 0         | Lifetime loads         | `150`                   |
| equipmentTypes          | array    | -        | Valid equipment          | []        | Equipment operated     | `["DRY_VAN", "REEFER"]` |
| preferredLanes          | array    | -        | State pairs              | []        | Preferred routes       | `["TX-CA", "TX-IL"]`    |
| fleetSize               | number   | -        | Min 1                    | null      | Number of trucks       | `5`                     |
| paymentTerms            | number   | -        | 0-90                     | 30        | Payment terms (days)   | `30`                    |
| factoring               | boolean  | -        | -                        | false     | Uses factoring         | `true`                  |
| factoringCompany        | string   | -        | 2-100 chars              | null      | Factoring company      | `RTS Financial`         |
| w9OnFile                | boolean  | -        | -                        | false     | W9 received            | `true`                  |
| w9Url                   | string   | -        | Valid URL                | null      | W9 document            | `https://...`           |
| notes                   | text     | -        | -                        | null      | Internal notes         | `Reliable carrier...`   |
| blacklistReason         | string   | -        | -                        | null      | If blacklisted, why    | `Insurance fraud`       |
| blacklistedAt           | datetime | -        | -                        | null      | When blacklisted       | -                       |
| primaryLanguage         | string   | -        | en, es                   | `en`      | Preferred language     | `es`                    |
| tenantId                | string   | âœ…      | FK to Tenant             | -         | Parent tenant          | -                       |
| externalId              | string   | -        | -                        | null      | Migration source ID    | `OLD-CAR-123`           |
| sourceSystem            | string   | -        | -                        | null      | Migration source       | `McLeod`                |
| customFields            | json     | -        | -                        | null      | Custom attributes      | `{}`                    |
| createdAt               | datetime | Auto     | -                        | now()     | Created                | -                       |
| updatedAt               | datetime | Auto     | -                        | Auto      | Updated                | -                       |
| deletedAt               | datetime | -        | -                        | null      | Soft delete            | -                       |

**Carrier Status Values:**
| Status | Description | Can Dispatch? |
|--------|-------------|---------------|
| `PENDING` | Awaiting approval | âŒ |
| `ACTIVE` | Approved, can use | âœ… |
| `INACTIVE` | Temporarily disabled | âŒ |
| `BLACKLISTED` | Permanently blocked | âŒ |

**Compliance Status Values:**
| Status | Description | Can Dispatch? |
|--------|-------------|---------------|
| `PENDING` | Documents under review | âŒ |
| `COMPLIANT` | All requirements met | âœ… |
| `WARNING` | Something expiring soon | âœ… (with warning) |
| `EXPIRED` | Insurance/authority expired | âŒ |
| `SUSPENDED` | FMCSA suspension | âŒ |

**Equipment Types:**

```typescript
type EquipmentType =
  | 'DRY_VAN' // Standard 53' dry van
  | 'REEFER' // Refrigerated trailer
  | 'FLATBED' // Flatbed trailer
  | 'STEP_DECK' // Step deck/drop deck
  | 'LOWBOY' // Lowboy for heavy equipment
  | 'CONESTOGA' // Curtain-side
  | 'POWER_ONLY' // Tractor only, no trailer
  | 'SPRINTER' // Cargo van
  | 'HOTSHOT' // Expedited flatbed
  | 'TANKER' // Liquid tanker
  | 'HOPPER' // Grain/bulk hopper
  | 'CONTAINER'; // Intermodal container
```

---

### 4. Customer

Shipper/customer company.

| Field                   | Type     | Required | Validation                 | Default   | Description          | Example               |
| ----------------------- | -------- | -------- | -------------------------- | --------- | -------------------- | --------------------- |
| id                      | string   | Auto     | cuid                       | Generated | Unique identifier    | `customer_456`        |
| name                    | string   | âœ…      | 2-200 chars                | -         | Company name         | `ABC Manufacturing`   |
| code                    | string   | âœ…      | 2-20 chars, unique         | -         | Short code           | `ABCMFG`              |
| status                  | enum     | âœ…      | ACTIVE, INACTIVE, PROSPECT | ACTIVE    | Customer status      | `ACTIVE`              |
| creditStatus            | enum     | âœ…      | See below                  | PENDING   | Credit status        | `APPROVED`            |
| creditLimit             | decimal  | -        | Min 0                      | 0         | Credit limit ($)     | `50000`               |
| currentBalance          | decimal  | -        | -                          | 0         | Outstanding AR       | `12500`               |
| availableCredit         | decimal  | Computed | -                          | -         | Limit - Balance      | `37500`               |
| paymentTerms            | number   | -        | 0-90                       | 30        | Net terms (days)     | `30`                  |
| email                   | string   | âœ…      | Valid email                | -         | Primary email        | `orders@abc.com`      |
| phone                   | string   | -        | E.164                      | null      | Primary phone        | `+15551234567`        |
| website                 | string   | -        | Valid URL                  | null      | Company website      | `https://abc.com`     |
| billingAddress          | json     | âœ…      | Address object             | -         | Invoice address      | See Address           |
| shippingAddresses       | json     | -        | Array of Address           | []        | Saved ship-from      | See Address           |
| primaryContactName      | string   | -        | 2-100 chars                | null      | Primary contact      | `John Smith`          |
| primaryContactEmail     | string   | -        | Valid email                | null      | Contact email        | `jsmith@abc.com`      |
| primaryContactPhone     | string   | -        | E.164                      | null      | Contact phone        | `+15551234567`        |
| salesRepId              | string   | -        | FK to User                 | null      | Assigned sales rep   | `user_sales_1`        |
| accountManagerId        | string   | -        | FK to User                 | null      | Account manager      | `user_ops_1`          |
| industry                | string   | -        | -                          | null      | Industry type        | `Manufacturing`       |
| requiresRefrigerated    | boolean  | -        | -                          | false     | Primarily reefer     | `true`                |
| temperatureRequirements | json     | -        | min/max temps              | null      | Temp specs           | `{"min":34,"max":40}` |
| specialRequirements     | text     | -        | -                          | null      | Special instructions | `Dock appt required`  |
| creditHoldReason        | string   | -        | -                          | null      | If on hold, why      | `Past due 60+ days`   |
| taxExempt               | boolean  | -        | -                          | false     | Tax exempt           | `false`               |
| taxExemptCertUrl        | string   | -        | Valid URL                  | null      | Tax exempt cert      | `https://...`         |
| tenantId                | string   | âœ…      | FK to Tenant               | -         | Parent tenant        | -                     |
| externalId              | string   | -        | -                          | null      | Migration ID         | -                     |
| sourceSystem            | string   | -        | -                          | null      | Migration source     | -                     |
| customFields            | json     | -        | -                          | null      | Custom attributes    | -                     |
| createdAt               | datetime | Auto     | -                          | now()     | Created              | -                     |
| updatedAt               | datetime | Auto     | -                          | Auto      | Updated              | -                     |
| deletedAt               | datetime | -        | -                          | null      | Soft delete          | -                     |

**Credit Status Values:**
| Status | Description | Can Create Load? |
|--------|-------------|------------------|
| `PENDING` | Awaiting credit review | âŒ |
| `APPROVED` | Credit approved | âœ… |
| `HOLD` | Credit hold (past due) | âŒ |
| `COD` | Cash on delivery only | âœ… (COD only) |
| `PREPAID` | Must prepay | âœ… (prepay only) |
| `DENIED` | Credit denied | âŒ |

---

### 5. Load

Shipment/freight order.

| Field               | Type     | Required | Validation         | Default   | Description          | Example                           |
| ------------------- | -------- | -------- | ------------------ | --------- | -------------------- | --------------------------------- |
| id                  | string   | Auto     | cuid               | Generated | Unique identifier    | `load_789`                        |
| loadNumber          | string   | Auto     | Unique per tenant  | Generated | Human-readable ID    | `FM-2025-0001`                    |
| status              | enum     | âœ…      | See status machine | PENDING   | Load status          | `DISPATCHED`                      |
| customerId          | string   | âœ…      | FK to Customer     | -         | Shipper              | `customer_456`                    |
| carrierId           | string   | -        | FK to Carrier      | null      | Assigned carrier     | `carrier_123`                     |
| driverId            | string   | -        | FK to Driver       | null      | Assigned driver      | `driver_001`                      |
| equipmentType       | enum     | âœ…      | Valid equipment    | -         | Required equipment   | `DRY_VAN`                         |
| origin              | json     | âœ…      | Address + details  | -         | Pickup location      | See Stop                          |
| destination         | json     | âœ…      | Address + details  | -         | Delivery location    | See Stop                          |
| stops               | json     | -        | Array of Stop      | []        | Additional stops     | See Stop                          |
| pickupDate          | datetime | âœ…      | Future or today    | -         | Scheduled pickup     | `2025-01-10T08:00:00Z`            |
| deliveryDate        | datetime | âœ…      | After pickup       | -         | Scheduled delivery   | `2025-01-11T14:00:00Z`            |
| pickupWindow        | json     | -        | Start/end times    | null      | Pickup time window   | `{"start":"08:00","end":"16:00"}` |
| deliveryWindow      | json     | -        | Start/end times    | null      | Delivery window      | `{"start":"08:00","end":"17:00"}` |
| weight              | number   | -        | 1-80000 lbs        | null      | Total weight (lbs)   | `42000`                           |
| pieces              | number   | -        | Min 1              | null      | Number of pieces     | `24`                              |
| pallets             | number   | -        | Min 1              | null      | Number of pallets    | `24`                              |
| commodity           | string   | -        | 2-200 chars        | null      | Freight description  | `Auto parts`                      |
| temperature         | json     | -        | Min/max temps      | null      | Temp requirements    | `{"min":34,"max":40}`             |
| hazmat              | boolean  | -        | -                  | false     | Hazardous materials  | `false`                           |
| hazmatClass         | string   | -        | DOT class          | null      | Hazmat class         | `3`                               |
| miles               | number   | -        | Min 1              | null      | Total distance       | `450`                             |
| customerRate        | decimal  | âœ…      | Min 0              | -         | Customer rate ($)    | `2500.00`                         |
| carrierRate         | decimal  | -        | Min 0              | null      | Carrier pay ($)      | `2100.00`                         |
| margin              | decimal  | Computed | -                  | -         | Revenue - Cost       | `400.00`                          |
| marginPercent       | decimal  | Computed | -                  | -         | Margin / Revenue     | `16.0`                            |
| fuelSurcharge       | decimal  | -        | Min 0              | 0         | Fuel surcharge       | `125.00`                          |
| accessorials        | json     | -        | Array of charges   | []        | Additional charges   | See Accessorial                   |
| specialInstructions | text     | -        | -                  | null      | Driver instructions  | `Call before arrival`             |
| internalNotes       | text     | -        | -                  | null      | Internal notes       | `High-value customer`             |
| referenceNumbers    | json     | -        | Key/value pairs    | {}        | External references  | `{"PO":"12345"}`                  |
| bolNumber           | string   | -        | -                  | null      | Bill of lading #     | `BOL-2025-001`                    |
| proNumber           | string   | -        | -                  | null      | PRO number           | `PRO123456`                       |
| dispatchedAt        | datetime | -        | -                  | null      | When dispatched      | -                                 |
| dispatchedById      | string   | -        | FK to User         | null      | Who dispatched       | -                                 |
| arrivedPickupAt     | datetime | -        | -                  | null      | Arrived at shipper   | -                                 |
| loadedAt            | datetime | -        | -                  | null      | Finished loading     | -                                 |
| departedPickupAt    | datetime | -        | -                  | null      | Left shipper         | -                                 |
| arrivedDeliveryAt   | datetime | -        | -                  | null      | Arrived at consignee | -                                 |
| deliveredAt         | datetime | -        | -                  | null      | Delivery complete    | -                                 |
| currentLocation     | json     | -        | Lat/lng/time       | null      | Latest GPS           | See Location                      |
| eta                 | datetime | -        | -                  | null      | Estimated arrival    | -                                 |
| podReceived         | boolean  | -        | -                  | false     | POD on file          | `true`                            |
| podReceivedAt       | datetime | -        | -                  | null      | When POD received    | -                                 |
| invoicedAt          | datetime | -        | -                  | null      | When invoiced        | -                                 |
| invoiceId           | string   | -        | FK to Invoice      | null      | Related invoice      | `invoice_001`                     |
| paidAt              | datetime | -        | -                  | null      | When paid            | -                                 |
| cancelledAt         | datetime | -        | -                  | null      | If cancelled, when   | -                                 |
| cancelledById       | string   | -        | FK to User         | null      | Who cancelled        | -                                 |
| cancellationReason  | string   | -        | -                  | null      | Why cancelled        | -                                 |
| claimId             | string   | -        | FK to Claim        | null      | Related claim        | -                                 |
| tenantId            | string   | âœ…      | FK to Tenant       | -         | Parent tenant        | -                                 |
| createdById         | string   | âœ…      | FK to User         | -         | Who created          | -                                 |
| externalId          | string   | -        | -                  | null      | Migration ID         | -                                 |
| sourceSystem        | string   | -        | -                  | null      | Migration source     | -                                 |
| customFields        | json     | -        | -                  | null      | Custom attributes    | -                                 |
| createdAt           | datetime | Auto     | -                  | now()     | Created              | -                                 |
| updatedAt           | datetime | Auto     | -                  | Auto      | Updated              | -                                 |
| deletedAt           | datetime | -        | -                  | null      | Soft delete          | -                                 |

**Load Status State Machine:**

```
PENDING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚                    â”‚
    â–¼                    â”‚
COVERED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
    â”‚                    â”‚
    â–¼                    â”‚
DISPATCHED               â”‚
    â”‚                    â”‚
    â–¼                    â”‚
EN_ROUTE_PICKUP          â”‚
    â”‚                    â”‚
    â–¼                    â”‚
AT_PICKUP                â”‚
    â”‚                    â”‚
    â–¼                    â”‚
LOADED                   â”‚
    â”‚                    â”œâ”€â”€â–º CANCELLED
    â–¼                    â”‚
EN_ROUTE_DELIVERY        â”‚
    â”‚                    â”‚
    â–¼                    â”‚
AT_DELIVERY              â”‚
    â”‚                    â”‚
    â–¼                    â”‚
DELIVERED                â”‚
    â”‚                    â”‚
    â–¼                    â”‚
COMPLETED â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### 6. Address Object (Embedded)

Used in Carrier, Customer, Load origins/destinations.

| Field               | Type    | Required | Validation    | Example                   |
| ------------------- | ------- | -------- | ------------- | ------------------------- |
| name                | string  | -        | 2-200 chars   | `ABC Warehouse`           |
| street              | string  | âœ…      | 5-200 chars   | `123 Main St`             |
| street2             | string  | -        | -             | `Suite 100`               |
| city                | string  | âœ…      | 2-100 chars   | `Dallas`                  |
| state               | string  | âœ…      | 2 chars (US)  | `TX`                      |
| zip                 | string  | âœ…      | 5 or 9 digits | `75201`                   |
| country             | string  | -        | ISO 2-char    | `US`                      |
| lat                 | decimal | -        | -90 to 90     | `32.7767`                 |
| lng                 | decimal | -        | -180 to 180   | `-96.7970`                |
| contactName         | string  | -        | -             | `John Smith`              |
| contactPhone        | string  | -        | E.164         | `+15551234567`            |
| contactEmail        | string  | -        | Valid email   | `john@abc.com`            |
| notes               | string  | -        | -             | `Dock 5, call on arrival` |
| appointmentRequired | boolean | -        | -             | `true`                    |
| hours               | string  | -        | -             | `Mon-Fri 8am-5pm`         |

---

### 7. Location Object (Embedded)

GPS tracking data.

| Field     | Type     | Required | Description      | Example                   |
| --------- | -------- | -------- | ---------------- | ------------------------- |
| lat       | decimal  | âœ…      | Latitude         | `32.7767`                 |
| lng       | decimal  | âœ…      | Longitude        | `-96.7970`                |
| address   | string   | -        | Reverse geocoded | `Dallas, TX`              |
| speed     | number   | -        | MPH              | `65`                      |
| heading   | number   | -        | Degrees (0-360)  | `180`                     |
| updatedAt | datetime | âœ…      | Timestamp        | `2025-01-05T10:30:00Z`    |
| source    | string   | -        | Data source      | `ELD`, `MOBILE`, `MANUAL` |

---

## Quick Reference: Required Fields by Form

### Create Carrier Form

```
Required: name, mcNumber, dotNumber, email, phone, address, insuranceExpiry, insuranceAmount
Optional: dba, fax, cargoInsurance, equipmentTypes, paymentTerms, notes
```

### Create Customer Form

```
Required: name, code, email, billingAddress
Optional: phone, website, creditLimit, paymentTerms, primaryContact*, salesRepId
```

### Create Load Form

```
Required: customerId, equipmentType, origin, destination, pickupDate, deliveryDate, customerRate
Optional: weight, pieces, commodity, specialInstructions, referenceNumbers
```

### Dispatch Load Form

```
Required: carrierId, carrierRate
Optional: driverId, dispatchNotes
```

---

## Navigation

- **Previous:** [Seed Data & Test Fixtures](./85-seed-data-fixtures.md)
- **Next:** [Business Rules Reference](./87-business-rules-reference.md)
