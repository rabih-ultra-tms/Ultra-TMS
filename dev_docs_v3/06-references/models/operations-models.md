# Operations Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| InlandServiceType | Service type definitions | |
| TenantService | Tenant-specific service configs | Tenant |
| OperationsCarrier | Operations-specific carrier data | OperationsCarrierDriver, OperationsCarrierTruck |
| OperationsCarrierDriver | Operations driver records | OperationsCarrier |
| OperationsCarrierTruck | Operations truck/equipment records | OperationsCarrier |
| Location | Physical locations/facilities | BusinessHours, Employee |
| BusinessHours | Operating hours per location | Location |
| Holiday | Holiday calendar | |

## InlandServiceType

Defines available service types (drayage, intermodal, etc.).

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(100) |
| description | String? | |
| defaultRateCents | Int | @default(0) |
| billingUnit | String | VarChar(50) — PER_LOAD, PER_MILE, PER_HOUR |
| sortOrder | Int | @default(0) |
| isActive | Boolean | @default(true) |

**Table map:** `inland_service_types`

## TenantService

Per-tenant service configuration and defaults.

| Field | Type | Notes |
|-------|------|-------|
| tenantId | String | |
| serviceCode | String | VarChar(50) |
| serviceName | String | VarChar(255) |
| isEnabled | Boolean | @default(true) |
| defaultConfig | Json | @default("{}") |
| pricingRules | Json? | |

## OperationsCarrier / Driver / Truck

Operations-specific carrier data extending the core Carrier model.

**OperationsCarrier:** carrierId, preferredLanes, serviceTypes, capacityConfig
**OperationsCarrierDriver:** operationsCarrierId, driverName, cdlNumber, status, availability
**OperationsCarrierTruck:** operationsCarrierId, truckNumber, equipmentType, status, currentLocation

## Location

Physical office/warehouse locations.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(255) |
| locationType | String | VarChar(50) — OFFICE, WAREHOUSE, YARD |
| addressLine1/Line2 | String? | |
| city/state/postalCode/country | String? | |
| latitude/longitude | Decimal? | Decimal(10,7) |
| phone/fax | String? | |
| isActive | Boolean | @default(true) |
| isHeadquarters | Boolean | @default(false) |

**Relations:** BusinessHours[], Employee[]

## BusinessHours

Operating hours per day of week per location.

| Field | Type | Notes |
|-------|------|-------|
| locationId | String? | FK to Location |
| dayOfWeek | DayOfWeek enum | MON, TUE, WED, THU, FRI, SAT, SUN |
| openTime | String | VarChar(5) — "08:00" |
| closeTime | String | VarChar(5) — "17:00" |
| isClosed | Boolean | @default(false) |
| timezone | String | VarChar(50) |
