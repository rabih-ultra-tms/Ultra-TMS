# Carriers Seed Data Guide

> AI Dev Guide | Source: `dev_docs/11-ai-dev/90-seed-data-fixtures.md`

---

## Overview

Seed 50 carriers across multiple statuses, compliance states, equipment types, and tenants to enable realistic testing.

## Required Fields

```typescript
{
  name: string,           // Legal company name (e.g., "Express Freight Lines")
  mcNumber: string,       // 6-digit MC number (e.g., "123456")
  dotNumber: string,      // 5-8 digit DOT number (e.g., "1234567")
  status: CarrierStatus,  // PENDING | ACTIVE | INACTIVE | SUSPENDED | BLACKLISTED
  email: string,          // dispatch@company.com
  phone: string,          // E.164 format
  address: Address,       // { street, city, state, zip }
  insuranceExpiry: Date,  // Future date for ACTIVE carriers
  insuranceAmount: number,// Min $750,000 for auto liability
  tenantId: string        // FK -> Tenant
}
```

## Seed Data Distribution

| Status | Count | Purpose |
|--------|-------|---------|
| ACTIVE + COMPLIANT | 35 | Normal dispatch operations |
| ACTIVE + WARNING | 5 | Insurance expiring soon (within 30 days) |
| ACTIVE + EXPIRED | 3 | Compliance block testing |
| INACTIVE | 4 | Reactivation flows |
| BLACKLISTED | 2 | Permanent block testing |
| PENDING | 1 | Onboarding flow |

## Realistic MC/DOT Numbers

- MC numbers: 6 digits, starting from 100000
- DOT numbers: 7 digits, starting from 1000000
- Each must be unique per tenant

## Equipment Type Coverage

Ensure carriers cover all common equipment types:
- DRY_VAN (most common, ~60%)
- REEFER (~15%)
- FLATBED (~15%)
- STEP_DECK, LOWBOY, POWER_ONLY (~10%)

## Lane Preferences

Use realistic US freight lanes:
- TX-CA, TX-IL, TX-FL (Texas hub)
- IL-TX, IL-CA, IL-NY (Chicago hub)
- CA-WA, CA-AZ (West coast)
- GA-FL, GA-NC (Southeast)

## Insurance Data

```typescript
// Active carrier insurance
{
  type: "AUTO_LIABILITY",
  provider: "Progressive Commercial",
  policyNumber: "PCL-" + String(100000 + i),
  coverageAmount: 1000000,
  expiresAt: addMonths(today, randomInt(3, 12)),
  status: "ACTIVE"
}
```

## Multi-Tenant Distribution

- 80% to `tenant_freight_masters` (primary testing tenant)
- 20% to `tenant_swift_logistics` (multi-tenant isolation testing)

## Test Scenarios Enabled

| Scenario | Carriers |
|----------|----------|
| Happy path dispatch | ACTIVE + COMPLIANT carriers |
| Insurance warning | ACTIVE + WARNING (expiring < 30 days) |
| Compliance block | ACTIVE + EXPIRED insurance |
| Blacklist prevention | BLACKLISTED carrier |
| Multi-tenant isolation | Carriers split across tenants |
| FMCSA lookup | Carriers with realistic MC#/DOT# |
| Spanish language | At least 1 carrier with `primaryLanguage: "es"` |

## Seed Script Pattern

```typescript
import { PrismaClient } from '@prisma/client';

export async function seedCarriers(prisma: PrismaClient) {
  const carriers = [
    // Define 8 named carriers with specific scenarios...
    // Generate 42 more programmatically...
  ];

  for (const carrier of carriers) {
    await prisma.carrier.upsert({
      where: { id: carrier.id },
      update: carrier,
      create: carrier,
    });
  }
}
```

## Related Seed Data

After seeding carriers, also seed:
- CarrierContacts (2-3 per carrier)
- CarrierInsurance (1-2 certificates per carrier)
- CarrierDrivers (1-3 per carrier)
- CarrierDocuments (W9, insurance cert per carrier)
