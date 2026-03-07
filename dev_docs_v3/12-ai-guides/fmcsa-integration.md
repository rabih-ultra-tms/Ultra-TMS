# FMCSA Integration Guide

> AI Dev Guide | FMCSA SAFER API, data fields, refresh schedule

---

## Overview

The FMCSA (Federal Motor Carrier Safety Administration) SAFER Web System provides carrier safety and registration data. Ultra TMS queries this to validate carriers during onboarding.

## API Endpoint in Ultra TMS

```
POST /api/v1/carriers/fmcsa/lookup
Body: { mcNumber: "123456" } or { dotNumber: "1234567" }
```

Backend: `apps/api/src/modules/carrier/` -- FMCSA lookup logic.

## FMCSA Data Fields Retrieved

| Field | Type | Description |
|-------|------|-------------|
| legalName | String | Carrier's legal business name |
| dbaName | String | Doing Business As name |
| dotNumber | String | DOT number |
| mcNumber | String | MC number |
| authorityStatus | String | AUTHORIZED, NOT_AUTHORIZED, INACTIVE |
| authorityType | String | COMMON, CONTRACT, BROKER |
| operatingStatus | String | ACTIVE, INACTIVE, OUT_OF_SERVICE |
| address | Object | Physical address (street, city, state, zip) |
| phone | String | Phone number on file |
| totalDrivers | Int | Number of registered drivers |
| totalPowerUnits | Int | Number of power units (trucks) |
| safetyRating | String | SATISFACTORY, CONDITIONAL, UNSATISFACTORY, NONE |
| insuranceRequired | Boolean | Whether insurance is required |
| bipd (BIPD) | Decimal | Bodily Injury/Property Damage insurance on file |
| cargoInsurance | Decimal | Cargo insurance on file |
| csaScores | Object | CSA BASIC scores by category |

## Caching Strategy

- FMCSA data is cached for **24 hours** per carrier.
- Cache key: `fmcsa:{mcNumber}` or `fmcsa:{dotNumber}`
- Stored in Redis.
- On-demand refresh available via re-running lookup endpoint.
- Monthly batch refresh recommended for all active carriers.

## Validation Rules

### On Carrier Creation

1. Automatically runs FMCSA lookup when MC# or DOT# is provided
2. If authority is NOT AUTHORIZED: carrier cannot progress past PENDING
3. If MC#/DOT# not found in FMCSA: warn but allow (may be new registration)

### On Load Assignment

1. Verify authority status is still AUTHORIZED
2. Check insurance amounts meet minimums
3. Check for recent CSA violations

## Error Handling

| Error | Action |
|-------|--------|
| FMCSA API timeout | Cache stale data, log warning, allow manual override |
| MC# not found | Show warning: "MC number not found in FMCSA database" |
| Authority INACTIVE | Block activation: "Carrier authority is inactive per FMCSA" |
| Rate limited | Queue retry after 60 seconds |

## FMCSA SAFER Web URLs

- Public lookup: `https://safer.fmcsa.dot.gov/`
- API documentation: `https://mobile.fmcsa.dot.gov/QCDevsite/docs/qcApi`
- Data is publicly available -- no API key required for basic lookups

## CSA Score Integration

CSA (Compliance, Safety, Accountability) scores are fetched as part of FMCSA data:

| BASIC Category | Weight in TMS | Threshold |
|----------------|--------------|-----------|
| Unsafe Driving | High | > 65 = warning |
| HOS Compliance | High | > 65 = warning |
| Vehicle Maintenance | Medium | > 80 = warning |
| Controlled Substances | Critical | Any violation = flag |
| Driver Fitness | Medium | > 80 = warning |
| Hazmat | Conditional | Only checked for hazmat loads |
| Crash Indicator | High | > 65 = warning |

## Refresh Schedule

| Trigger | Action |
|---------|--------|
| Carrier creation | Immediate lookup |
| Manual refresh button | On-demand lookup |
| Monthly batch job | Refresh all active carriers |
| Insurance renewal | Re-check authority status |
| Load assignment | Verify cached data is < 24h old |

## Environment Variables

```
# No API key needed for basic FMCSA lookup
# Rate limiting: max 10 requests/minute recommended
FMCSA_BASE_URL=https://mobile.fmcsa.dot.gov/qc/services
FMCSA_CACHE_TTL=86400  # 24 hours in seconds
```
