# P1-1: Standardize Role Naming Convention

## Priority: P1 - HIGH
## Estimated Time: 4-6 hours
## Dependencies: None (can be done in parallel with P0 tasks)

---

## Context

The codebase currently has **inconsistent role naming** across services:

| Service | Current Usage | Example |
|---------|--------------|---------|
| Auth Module | UPPERCASE | `@Roles('ADMIN', 'SUPER_ADMIN')` |
| TMS Core | UPPERCASE | `@Roles('DISPATCHER', 'ADMIN')` |
| Accounting | UPPERCASE | `@Roles('ACCOUNTING')` |
| Claims | lowercase | `@Roles('admin', 'manager')` |
| Contracts | lowercase | `@Roles('admin', 'contract-manager')` |

This inconsistency causes:
1. Role checks to fail silently (case-sensitive comparison)
2. Confusion during development
3. Maintenance nightmare

---

## Decision: Use UPPERCASE

All roles should use **UPPERCASE with underscore separators**:

### Standard Role Names

```typescript
// apps/api/src/common/constants/roles.constant.ts

export const ROLES = {
  // System roles
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  
  // Sales roles
  SALES_REP: 'SALES_REP',
  SALES_MANAGER: 'SALES_MANAGER',
  PRICING_ANALYST: 'PRICING_ANALYST',
  
  // Operations roles
  DISPATCHER: 'DISPATCHER',
  OPERATIONS: 'OPERATIONS',
  OPERATIONS_MANAGER: 'OPERATIONS_MANAGER',
  
  // Carrier roles
  CARRIER_MANAGER: 'CARRIER_MANAGER',
  SAFETY_MANAGER: 'SAFETY_MANAGER',
  
  // Finance roles
  ACCOUNTING: 'ACCOUNTING',
  ACCOUNTING_MANAGER: 'ACCOUNTING_MANAGER',
  
  // Support roles
  CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
  
  // External roles (portal users)
  CUSTOMER: 'CUSTOMER',
  CARRIER: 'CARRIER',
  AGENT: 'AGENT',
  
  // Marketing
  MARKETING: 'MARKETING',
  
  // Specialized
  COMPLIANCE: 'COMPLIANCE',
  CLAIMS_HANDLER: 'CLAIMS_HANDLER',
  CONTRACT_MANAGER: 'CONTRACT_MANAGER',
  AGENT_MANAGER: 'AGENT_MANAGER',
  EXECUTIVE: 'EXECUTIVE',
  SYSTEM_INTEGRATOR: 'SYSTEM_INTEGRATOR',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
```

---

## Implementation Steps

### Step 1: Create Constants File

Create `apps/api/src/common/constants/roles.constant.ts` with the content above.

### Step 2: Update RolesGuard to Handle Legacy

Temporarily support both formats during migration:

```typescript
// apps/api/src/common/guards/roles.guard.ts

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Normalize both required roles and user roles to uppercase
    const normalizedRequired = requiredRoles.map(r => r.toUpperCase());
    const normalizedUserRoles = user.roles.map(r => r.toUpperCase());
    
    return normalizedRequired.some(role => 
      normalizedUserRoles.includes(role)
    );
  }
}
```

### Step 3: Update All Controllers

Search and replace across all controllers:

#### Claims Module
```typescript
// BEFORE
@Roles('admin', 'manager', 'claims-handler')

// AFTER
@Roles(ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.CLAIMS_HANDLER)
// Or: @Roles('ADMIN', 'SALES_MANAGER', 'CLAIMS_HANDLER')
```

#### Contracts Module
```typescript
// BEFORE
@Roles('admin', 'contract-manager')

// AFTER
@Roles(ROLES.ADMIN, ROLES.CONTRACT_MANAGER)
```

### Step 4: Update Database Seeds/Migrations

Ensure role data in database uses UPPERCASE:

```typescript
// prisma/seed.ts

const roles = [
  { name: 'SUPER_ADMIN', description: 'System Administrator' },
  { name: 'ADMIN', description: 'Tenant Administrator' },
  { name: 'SALES_REP', description: 'Sales Representative' },
  { name: 'SALES_MANAGER', description: 'Sales Manager' },
  { name: 'DISPATCHER', description: 'Load Dispatcher' },
  // ... etc
];

// Migration to fix existing data
await prisma.$executeRaw`
  UPDATE "Role" 
  SET name = UPPER(REPLACE(name, '-', '_'))
  WHERE name != UPPER(REPLACE(name, '-', '_'))
`;

await prisma.$executeRaw`
  UPDATE "UserRole" 
  SET role = UPPER(REPLACE(role, '-', '_'))
  WHERE role != UPPER(REPLACE(role, '-', '_'))
`;
```

---

## Files to Update

### Controllers Using Lowercase Roles

Search for: `@Roles\(['"]([a-z]` (regex to find lowercase roles)

- [ ] `apps/api/src/modules/claims/claims.controller.ts`
- [ ] `apps/api/src/modules/claims/claim-items.controller.ts`
- [ ] `apps/api/src/modules/contracts/contracts.controller.ts`
- [ ] `apps/api/src/modules/contracts/contract-rates.controller.ts`
- [ ] `apps/api/src/modules/agents/agents.controller.ts`
- [ ] Any other controllers found with lowercase roles

### New Files to Create

- [ ] `apps/api/src/common/constants/roles.constant.ts`

### Files to Update

- [ ] `apps/api/src/common/guards/roles.guard.ts` (normalize comparison)
- [ ] `prisma/seed.ts` (use UPPERCASE roles)
- [ ] Any migration scripts

---

## Search Commands

Use these to find all occurrences:

```bash
# Find all @Roles decorators
grep -r "@Roles(" apps/api/src --include="*.ts"

# Find lowercase role strings
grep -rE "@Roles\(['\"]([a-z])" apps/api/src --include="*.ts"

# Find hyphenated roles
grep -rE "@Roles.*-" apps/api/src --include="*.ts"
```

---

## Verification

After changes, verify:

```bash
# Run all tests
pnpm -C apps/api test

# Test specific role check
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3001/api/v1/claims
# Should work regardless of token having 'ADMIN' or 'admin'
```

---

## Migration Script

For existing databases with mixed case roles:

```sql
-- Standardize roles to UPPERCASE
UPDATE "Role" 
SET name = UPPER(REPLACE(name, '-', '_'));

UPDATE "User" 
SET roles = (
  SELECT array_agg(UPPER(REPLACE(role, '-', '_')))
  FROM unnest(roles) AS role
);

-- Or if using a join table
UPDATE "UserRole" 
SET "roleName" = UPPER(REPLACE("roleName", '-', '_'));
```

---

## Success Criteria

- [ ] All `@Roles()` decorators use UPPERCASE
- [ ] Roles constant file created and exported
- [ ] RolesGuard normalizes comparison (temporary backward compatibility)
- [ ] Database roles are UPPERCASE
- [ ] All tests pass
- [ ] No case-sensitivity issues in manual testing
