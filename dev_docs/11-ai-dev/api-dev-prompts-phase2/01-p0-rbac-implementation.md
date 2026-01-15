# Prompt 01: RBAC Implementation

**Priority:** P0 (Critical)  
**Estimated Time:** 4-6 hours  
**Dependencies:** None  

---

## Objective

Implement a comprehensive Role-Based Access Control (RBAC) system with a reusable `RolesGuard` and `@Roles()` decorator to enforce permission-based access across all API endpoints. Currently, all controllers only use `JwtAuthGuard` without any role or permission checking.

---

## Files to Create

| File | Description |
|------|-------------|
| `apps/api/src/common/guards/roles.guard.ts` | Guard that validates user roles/permissions |
| `apps/api/src/common/decorators/roles.decorator.ts` | Decorators for role and permission requirements |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/api/src/common/decorators/index.ts` | Export new decorators |
| All controllers in `apps/api/src/modules/*/` | Apply RBAC guards |

---

## Implementation Steps

### Step 1: Create Roles Decorator

Create `apps/api/src/common/decorators/roles.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Permission-based variant for granular control
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

// Combined decorator for convenience
export const RequireAccess = (roles: string[], permissions?: string[]) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata(ROLES_KEY, roles)(target, key, descriptor);
    if (permissions) {
      SetMetadata(PERMISSIONS_KEY, permissions)(target, key, descriptor);
    }
  };
};
```

### Step 2: Create Roles Guard

Create `apps/api/src/common/guards/roles.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles or permissions required, allow access
    if (!requiredRoles?.length && !requiredPermissions?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Check if user exists and has a role
    if (!user) {
      throw new ForbiddenException('Access denied: Authentication required');
    }
    
    if (!user.role) {
      throw new ForbiddenException('Access denied: No role assigned');
    }

    // Check roles (user must have at least one of the required roles)
    if (requiredRoles?.length) {
      const userRole = user.role.name || user.role;
      const hasRole = requiredRoles.some(role => 
        userRole === role || userRole === 'SUPER_ADMIN'
      );
      
      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied: Required role(s): ${requiredRoles.join(', ')}`
        );
      }
    }

    // Check permissions (user must have ALL required permissions)
    if (requiredPermissions?.length) {
      const userPermissions: string[] = user.role.permissions || user.permissions || [];
      
      // Super admin bypasses permission checks
      if (user.role.name !== 'SUPER_ADMIN') {
        const hasAllPermissions = requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        );
        
        if (!hasAllPermissions) {
          const missing = requiredPermissions.filter(p => !userPermissions.includes(p));
          throw new ForbiddenException(
            `Access denied: Missing permission(s): ${missing.join(', ')}`
          );
        }
      }
    }

    return true;
  }
}
```

### Step 3: Export Decorators

Update or create `apps/api/src/common/decorators/index.ts`:

```typescript
export * from './roles.decorator';
export * from './current-user.decorator';
export * from './current-tenant.decorator';
```

### Step 4: Apply Guards to Controllers

Apply `RolesGuard` alongside `JwtAuthGuard` on all controllers. Use the `@Roles()` or `@Permissions()` decorators on methods requiring specific access.

**Pattern for controller updates:**

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Permissions } from '../../common/decorators';

@Controller('resource')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourceController {
  
  @Get()
  @Permissions('resource:read')
  async findAll() {
    // Anyone with resource:read permission
  }

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @Permissions('resource:create')
  async create() {
    // Only ADMIN or MANAGER with resource:create permission
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove() {
    // Only ADMIN role
  }
}
```

### Step 5: Service-Specific Role Mappings

Apply these role requirements based on service sensitivity:

| Service | Read Access | Write Access | Admin Actions |
|---------|-------------|--------------|---------------|
| **TMS Core** | All authenticated | DISPATCHER, OPERATIONS, ADMIN | ADMIN |
| **Accounting** | ACCOUNTANT, FINANCE, ADMIN | ACCOUNTANT, ADMIN | ADMIN |
| **Sales/CRM** | SALES_REP, SALES_MANAGER, ADMIN | SALES_REP, ADMIN | ADMIN |
| **Carrier** | All authenticated | CARRIER_MANAGER, ADMIN | ADMIN |
| **HR** | HR_MANAGER, ADMIN | HR_MANAGER, ADMIN | ADMIN |
| **Config** | All authenticated | ADMIN | SUPER_ADMIN |
| **Audit** | COMPLIANCE, ADMIN | - (read only) | SUPER_ADMIN |
| **Customer Portal** | CUSTOMER_USER, CUSTOMER_ADMIN | CUSTOMER_ADMIN | - |
| **Carrier Portal** | CARRIER_USER, CARRIER_ADMIN | CARRIER_ADMIN | - |

### Step 6: Update JWT Strategy to Include Permissions

Ensure the JWT strategy loads user permissions. Update `apps/api/src/modules/auth/strategies/jwt.strategy.ts`:

```typescript
async validate(payload: JwtPayload) {
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          permissions: true, // Ensure permissions are loaded
        },
      },
    },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedException('User not found or inactive');
  }

  return {
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role,
    permissions: user.role?.permissions || [],
  };
}
```

---

## Acceptance Criteria

- [ ] `RolesGuard` exists and validates user roles from JWT payload
- [ ] `@Roles()` decorator accepts multiple role names
- [ ] `@Permissions()` decorator supports granular permission checks
- [ ] Guard throws `ForbiddenException` with descriptive message on access denial
- [ ] SUPER_ADMIN role bypasses all role/permission checks
- [ ] All 60+ controllers have `RolesGuard` applied
- [ ] Critical endpoints have appropriate role restrictions
- [ ] JWT strategy returns user permissions in payload
- [ ] Unit tests pass for guard with mock users/roles

---

## Testing

Create a test file to verify guard behavior:

```typescript
// apps/api/src/common/guards/roles.guard.spec.ts
describe('RolesGuard', () => {
  it('should allow access when no roles required', () => {});
  it('should allow access when user has required role', () => {});
  it('should deny access when user lacks required role', () => {});
  it('should allow SUPER_ADMIN to bypass all checks', () => {});
  it('should check all required permissions', () => {});
  it('should throw ForbiddenException with descriptive message', () => {});
});
```

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 01 row in the status table:
```markdown
| 01 | [RBAC Implementation](...) | P0 | 2-3h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| RBAC Implementation | 0% | 100% | 100% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 01: RBAC Implementation
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Created RolesGuard with role and permission validation
- Created @Roles() and @Permissions() decorators
- Applied guards to 60+ controllers
- JWT strategy now returns user permissions

#### Metrics Updated
- RBAC Implementation: 0% → 100%
```

---

## Notes

- Do NOT apply RBAC to public endpoints (login, register, password reset)
- Portal endpoints (customer-portal, carrier-portal) use separate auth guards
- Consider caching role/permission lookups for performance
- Log access denials to audit service for security monitoring
