# Users Seed Data Guide

> AI Dev Guide | Source: `dev_docs/11-ai-dev/90-seed-data-fixtures.md`

---

## Overview

Seed 20 users across all roles and multiple tenants for RBAC testing, multi-tenant isolation, and commission testing.

## Default Test Password

All seed users: `Test123!`

```typescript
// Pre-hashed bcrypt value (10 rounds)
const DEFAULT_PASSWORD_HASH = "$2a$10$K8GpSNwbzMRVZ6IjkTB/8OQZ7X8nF0YpR5jK3L9E1VzQ2W4M6N8Hy";
```

## User Distribution by Role

| Role | Count | Tenant | Purpose |
|------|-------|--------|---------|
| SUPER_ADMIN | 3 | 1 per tenant | Full system access testing |
| ADMIN | 1 | freight_masters | Tenant administration |
| DISPATCHER | 3 | 2 FM + 1 Swift | Load dispatch, carrier assignment |
| SALES_REP | 2 | freight_masters | Quote creation, commission testing |
| ACCOUNTING | 1 | freight_masters | Invoice/settlement testing |
| CARRIER_RELATIONS | 1 | freight_masters | Carrier onboarding testing |
| VIEWER | 1 | freight_masters | Read-only access testing |
| INACTIVE | 1 | freight_masters | Deactivated user testing |

## Key Test Users

```typescript
// Primary admin (use for most testing)
{ email: "admin@freightmasters.com", role: "SUPER_ADMIN", tenant: "freight_masters" }

// Primary dispatcher (dispatch board testing)
{ email: "maria.dispatcher@freightmasters.com", role: "DISPATCHER", locale: "es" }

// Sales rep #1 (commission testing -- 10% rate)
{ email: "james.sales@freightmasters.com", role: "SALES_AGENT", commissionRate: 0.10 }

// Sales rep #2 (commission comparison -- 8% rate)
{ email: "lisa.sales@freightmasters.com", role: "SALES_AGENT", commissionRate: 0.08 }

// Accounting user
{ email: "emily.ar@freightmasters.com", role: "ACCOUNTING" }

// Demo tenant admin
{ email: "demo@demo.com", role: "SUPER_ADMIN", tenant: "demo" }

// Inactive user (login block testing)
{ email: "former@freightmasters.com", role: "DISPATCHER", status: "INACTIVE" }
```

## Tenant Distribution

| Tenant | Users | Purpose |
|--------|-------|---------|
| freight_masters | 10 | Primary testing tenant |
| swift_logistics | 3 | Multi-tenant isolation testing |
| demo | 2 | Demo/trial testing |
| test | 1 | Minimal data testing |

## Test Login Credentials

| Email | Password | Role | Tenant |
|-------|----------|------|--------|
| admin@freightmasters.com | Test123! | SUPER_ADMIN | Freight Masters |
| maria.dispatcher@freightmasters.com | Test123! | DISPATCHER | Freight Masters |
| james.sales@freightmasters.com | Test123! | SALES_AGENT | Freight Masters |
| emily.ar@freightmasters.com | Test123! | ACCOUNTING | Freight Masters |
| demo@demo.com | Test123! | SUPER_ADMIN | Demo |

## Multi-Tenant Isolation Tests

- Login as `admin@freightmasters.com` -- should see only Freight Masters data.
- Login as `admin@swiftlogistics.com` -- should see only Swift Logistics data.
- Cross-tenant data should NEVER be visible.

## Seed Script Pattern

```typescript
export async function seedUsers(prisma: PrismaClient) {
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { ...user, passwordHash: DEFAULT_PASSWORD_HASH },
      create: { ...user, passwordHash: DEFAULT_PASSWORD_HASH },
    });
  }
}
```

## Tenant Seed Data (prerequisite)

Must seed tenants BEFORE users:

```typescript
const tenants = [
  { id: "tenant_freight_masters", name: "Freight Masters LLC", plan: "PROFESSIONAL" },
  { id: "tenant_swift_logistics", name: "Swift Logistics Inc", plan: "ENTERPRISE" },
  { id: "tenant_demo", name: "Demo Company", plan: "STARTER" },
  { id: "tenant_test", name: "Test Company", plan: "PROFESSIONAL" },
  { id: "tenant_inactive", name: "Inactive Corp", status: "INACTIVE" },
];
```
