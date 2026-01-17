# P1: Role Naming Standardization

## Priority: P1 - HIGH (Recommended for consistency)
## Estimated Time: 4 hours
## Dependencies: None

---

## Overview

Some P1 services use lowercase role names while P0 services use UPPERCASE. This inconsistency can cause silent failures if role checks are case-sensitive. Standardize all services to use UPPERCASE role names.

---

## Current State

### Services Using UPPERCASE (Standard) ✅
- Auth & Admin: `ADMIN`, `SUPER_ADMIN`, `USER`
- CRM: `ADMIN`, `SALES_REP`, `SALES_MANAGER`, `ACCOUNT_MANAGER`
- Sales: `ADMIN`, `SALES_MANAGER`, `PRICING_ANALYST`
- Carrier: `ADMIN`, `DISPATCHER`, `CARRIER_MANAGER`, `OPERATIONS`
- Load Board: `ADMIN`, `DISPATCHER`, `SALES_REP`, `CARRIER_MANAGER`
- Commission: `ADMIN`, `ACCOUNTING`, `SALES_MANAGER`, `AGENT_MANAGER`
- Documents: `ADMIN`, `OPERATIONS`, `ACCOUNTING`, `COMPLIANCE`
- Communication: `ADMIN`, `OPERATIONS`, `CUSTOMER_SERVICE`
- Analytics: `ADMIN`, `SALES_REP`, `DISPATCHER`, `ACCOUNTING`
- Integration Hub: `SUPER_ADMIN`, `ADMIN`, `SYSTEM_INTEGRATOR`
- EDI: `ADMIN`, `OPERATIONS`, `SYSTEM_INTEGRATOR`
- Safety: `ADMIN`, `SAFETY_MANAGER`, `COMPLIANCE`

### Services Using lowercase (Need Update) ⚠️
- Claims: `admin`, `manager`, `adjuster`, `viewer`
- Contracts: `admin`, `manager`, `viewer`
- Agents: `admin`, `manager`, `agent`
- Credit: `admin`, `analyst`, `viewer`

---

## Task 1: Claims Module

**Files to update:**
- `apps/api/src/modules/claims/claims.controller.ts`
- `apps/api/src/modules/claims/claim-documents.controller.ts`
- `apps/api/src/modules/claims/claim-notes.controller.ts`

### Changes Required

```typescript
// BEFORE
@Roles('admin', 'manager', 'adjuster')
async create(...) { }

@Roles('admin', 'manager', 'adjuster', 'viewer')
async findAll(...) { }

// AFTER
@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
async create(...) { }

@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'CLAIMS_VIEWER')
async findAll(...) { }
```

### Role Mapping

| Old Role | New Role | Description |
|----------|----------|-------------|
| `admin` | `ADMIN` | Full system access |
| `manager` | `CLAIMS_MANAGER` | Claims department lead |
| `adjuster` | `CLAIMS_ADJUSTER` | Process claims |
| `viewer` | `CLAIMS_VIEWER` | Read-only access |

### Search and Replace Commands

```bash
# In claims module files
sed -i "s/'admin'/'ADMIN'/g" apps/api/src/modules/claims/*.controller.ts
sed -i "s/'manager'/'CLAIMS_MANAGER'/g" apps/api/src/modules/claims/*.controller.ts
sed -i "s/'adjuster'/'CLAIMS_ADJUSTER'/g" apps/api/src/modules/claims/*.controller.ts
sed -i "s/'viewer'/'CLAIMS_VIEWER'/g" apps/api/src/modules/claims/*.controller.ts
```

---

## Task 2: Contracts Module

**Files to update:**
- `apps/api/src/modules/contracts/contracts.controller.ts`
- `apps/api/src/modules/contracts/contract-templates.controller.ts`
- `apps/api/src/modules/contracts/contract-amendments.controller.ts`

### Changes Required

```typescript
// BEFORE
@Roles('admin', 'manager')
async create(...) { }

@Roles('admin', 'manager', 'viewer')
async findAll(...) { }

// AFTER
@Roles('ADMIN', 'CONTRACTS_MANAGER')
async create(...) { }

@Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER')
async findAll(...) { }
```

### Role Mapping

| Old Role | New Role | Description |
|----------|----------|-------------|
| `admin` | `ADMIN` | Full system access |
| `manager` | `CONTRACTS_MANAGER` | Manage contracts |
| `viewer` | `CONTRACTS_VIEWER` | Read-only access |

### Search and Replace Commands

```bash
# In contracts module files
sed -i "s/'admin'/'ADMIN'/g" apps/api/src/modules/contracts/*.controller.ts
sed -i "s/'manager'/'CONTRACTS_MANAGER'/g" apps/api/src/modules/contracts/*.controller.ts
sed -i "s/'viewer'/'CONTRACTS_VIEWER'/g" apps/api/src/modules/contracts/*.controller.ts
```

---

## Task 3: Agents Module

**Files to update:**
- `apps/api/src/modules/agents/agents.controller.ts`
- `apps/api/src/modules/agents/agent-commissions.controller.ts`
- `apps/api/src/modules/agents/agent-payouts.controller.ts`

### Changes Required

```typescript
// BEFORE
@Roles('admin', 'manager', 'agent')
async findAll(...) { }

// AFTER
@Roles('ADMIN', 'AGENT_MANAGER', 'AGENT')
async findAll(...) { }
```

### Role Mapping

| Old Role | New Role | Description |
|----------|----------|-------------|
| `admin` | `ADMIN` | Full system access |
| `manager` | `AGENT_MANAGER` | Manage agent relationships |
| `agent` | `AGENT` | Agent portal user |

### Search and Replace Commands

```bash
# In agents module files
sed -i "s/'admin'/'ADMIN'/g" apps/api/src/modules/agents/*.controller.ts
sed -i "s/'manager'/'AGENT_MANAGER'/g" apps/api/src/modules/agents/*.controller.ts
sed -i "s/'agent'/'AGENT'/g" apps/api/src/modules/agents/*.controller.ts
```

---

## Task 4: Credit Module

**Files to update:**
- `apps/api/src/modules/credit/credit.controller.ts`
- `apps/api/src/modules/credit/credit-applications.controller.ts`
- `apps/api/src/modules/credit/credit-reports.controller.ts`

### Changes Required

```typescript
// BEFORE
@Roles('admin', 'analyst', 'viewer')
async findAll(...) { }

// AFTER
@Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
async findAll(...) { }
```

### Role Mapping

| Old Role | New Role | Description |
|----------|----------|-------------|
| `admin` | `ADMIN` | Full system access |
| `analyst` | `CREDIT_ANALYST` | Process credit applications |
| `viewer` | `CREDIT_VIEWER` | Read-only access |

### Search and Replace Commands

```bash
# In credit module files
sed -i "s/'admin'/'ADMIN'/g" apps/api/src/modules/credit/*.controller.ts
sed -i "s/'analyst'/'CREDIT_ANALYST'/g" apps/api/src/modules/credit/*.controller.ts
sed -i "s/'viewer'/'CREDIT_VIEWER'/g" apps/api/src/modules/credit/*.controller.ts
```

---

## Task 5: Update Role Enum (if exists)

Check if there's a central role enum and update it:

**File:** `apps/api/src/common/enums/roles.enum.ts` (or similar)

```typescript
export enum Role {
  // System roles
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  
  // Operations roles
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  DISPATCHER = 'DISPATCHER',
  OPERATIONS = 'OPERATIONS',
  
  // Sales roles
  SALES_MANAGER = 'SALES_MANAGER',
  SALES_REP = 'SALES_REP',
  ACCOUNT_MANAGER = 'ACCOUNT_MANAGER',
  PRICING_ANALYST = 'PRICING_ANALYST',
  
  // Finance roles
  ACCOUNTING = 'ACCOUNTING',
  ACCOUNTING_MANAGER = 'ACCOUNTING_MANAGER',
  
  // Carrier roles
  CARRIER_MANAGER = 'CARRIER_MANAGER',
  SAFETY_MANAGER = 'SAFETY_MANAGER',
  
  // Claims roles
  CLAIMS_MANAGER = 'CLAIMS_MANAGER',
  CLAIMS_ADJUSTER = 'CLAIMS_ADJUSTER',
  CLAIMS_VIEWER = 'CLAIMS_VIEWER',
  
  // Contracts roles
  CONTRACTS_MANAGER = 'CONTRACTS_MANAGER',
  CONTRACTS_VIEWER = 'CONTRACTS_VIEWER',
  
  // Agent roles
  AGENT_MANAGER = 'AGENT_MANAGER',
  AGENT = 'AGENT',
  
  // Credit roles
  CREDIT_ANALYST = 'CREDIT_ANALYST',
  CREDIT_VIEWER = 'CREDIT_VIEWER',
  
  // Other roles
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  COMPLIANCE = 'COMPLIANCE',
  SYSTEM_INTEGRATOR = 'SYSTEM_INTEGRATOR',
  MARKETING = 'MARKETING',
  EXECUTIVE = 'EXECUTIVE',
  
  // Portal roles
  CUSTOMER = 'CUSTOMER',
  CARRIER = 'CARRIER',
}
```

---

## Task 6: Update Database Seed Data

If roles are seeded in the database, update the seed file:

**File:** `apps/api/prisma/seed.ts` (or similar)

```typescript
const roles = [
  { name: 'SUPER_ADMIN', description: 'System administrator' },
  { name: 'ADMIN', description: 'Tenant administrator' },
  { name: 'OPERATIONS_MANAGER', description: 'Operations leadership' },
  { name: 'DISPATCHER', description: 'Load dispatch' },
  { name: 'SALES_MANAGER', description: 'Sales leadership' },
  { name: 'SALES_REP', description: 'Sales representative' },
  // ... add all new roles
  { name: 'CLAIMS_MANAGER', description: 'Claims department lead' },
  { name: 'CLAIMS_ADJUSTER', description: 'Process claims' },
  { name: 'CLAIMS_VIEWER', description: 'Claims read-only' },
  { name: 'CONTRACTS_MANAGER', description: 'Manage contracts' },
  { name: 'CONTRACTS_VIEWER', description: 'Contracts read-only' },
  { name: 'AGENT_MANAGER', description: 'Manage agent relationships' },
  { name: 'AGENT', description: 'Agent portal user' },
  { name: 'CREDIT_ANALYST', description: 'Process credit applications' },
  { name: 'CREDIT_VIEWER', description: 'Credit read-only' },
];
```

---

## Validation Steps

### 1. Search for Remaining Lowercase Roles

```bash
# Find any remaining lowercase roles in @Roles decorators
grep -rn "@Roles(" apps/api/src/modules --include="*.controller.ts" | \
  grep -E "'[a-z]+'" 
```

### 2. Run E2E Tests

```bash
pnpm run test:e2e -- --grep "claims|contracts|agents|credit"
```

### 3. Verify RolesGuard Case Sensitivity

Check the RolesGuard implementation to ensure it handles case:

```typescript
// apps/api/src/auth/guards/roles.guard.ts
// Ensure comparison is consistent (both UPPERCASE)
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
  const user = context.switchToHttp().getRequest().user;
  
  // Both should be UPPERCASE for comparison
  return requiredRoles.some(role => user.roles.includes(role.toUpperCase()));
}
```

---

## Completion Checklist

- [ ] Claims module - All roles converted to UPPERCASE
- [ ] Contracts module - All roles converted to UPPERCASE
- [ ] Agents module - All roles converted to UPPERCASE
- [ ] Credit module - All roles converted to UPPERCASE
- [ ] Role enum updated (if exists)
- [ ] Database seed data updated
- [ ] No lowercase roles found in grep search
- [ ] E2E tests pass
- [ ] RolesGuard handles case consistently

---

## Expected Outcome

After completing this prompt:
- 100% role naming consistency across all services
- No silent failures from case mismatch
- Clearer role semantics (e.g., `CLAIMS_MANAGER` vs generic `manager`)
- Better alignment with industry standards
