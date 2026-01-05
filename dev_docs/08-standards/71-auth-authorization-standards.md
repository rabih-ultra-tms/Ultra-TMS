# 67 - Authentication & Authorization Standards

**Multi-tenant, role-based access control for the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Auth Rules

1. **EVERY API endpoint MUST have auth check FIRST**
2. **EVERY endpoint MUST filter by tenantId**
3. **NEVER return data without checking ownership**
4. **Role checks after authentication**

---

## Core Concepts

### Authentication vs Authorization

| Authentication        | Authorization         |
| --------------------- | --------------------- |
| WHO are you?          | WHAT can you do?      |
| Verify identity       | Check permissions     |
| JWT token validation  | Role/permission check |
| Returns 401 if failed | Returns 403 if denied |

### Multi-Tenancy

Every data access MUST include tenant filtering:

```typescript
// âŒ WRONG - Returns all tenants' data
const carriers = await prisma.carrier.findMany();

// âœ… CORRECT - Filter by tenant
const carriers = await prisma.carrier.findMany({
  where: {
    tenantId: user.tenantId,
    deletedAt: null,
  },
});
```

---

## User Roles

### Role Hierarchy

```
SUPER_ADMIN (Platform owner)
    â””â”€â”€ Full system access across all tenants

ADMIN (Tenant owner)
    â””â”€â”€ Full tenant access, user management

OPERATIONS_MANAGER
    â””â”€â”€ Operations oversight, reporting

DISPATCH
    â””â”€â”€ Load management, carrier assignment

SALES
    â””â”€â”€ CRM, quotes, customer management

ACCOUNTING
    â””â”€â”€ Invoices, payments, financial

CARRIER (External)
    â””â”€â”€ Portal access for carriers

CUSTOMER (External)
    â””â”€â”€ Portal access for customers

DRIVER (External)
    â””â”€â”€ Mobile app access
```

### Role Permissions Matrix

```typescript
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'], // All permissions

  ADMIN: [
    'users:*',
    'roles:*',
    'settings:*',
    'carriers:*',
    'customers:*',
    'loads:*',
    'orders:*',
    'invoices:*',
    'reports:*',
  ],

  DISPATCH: [
    'carriers:read',
    'carriers:write',
    'loads:*',
    'orders:read',
    'customers:read',
    'tracking:*',
  ],

  SALES: ['customers:*', 'leads:*', 'quotes:*', 'orders:read', 'orders:create'],

  ACCOUNTING: [
    'invoices:*',
    'payments:*',
    'carriers:read',
    'customers:read',
    'loads:read',
    'reports:financial',
  ],

  CARRIER: [
    'loads:read:assigned',
    'loads:update:status',
    'documents:upload',
    'profile:own',
  ],

  CUSTOMER: [
    'orders:read:own',
    'orders:create',
    'tracking:read:own',
    'documents:read:own',
    'profile:own',
  ],

  DRIVER: [
    'loads:read:assigned',
    'loads:update:status',
    'documents:upload',
    'tracking:update',
    'profile:own',
  ],
};
```

---

## NestJS Implementation

### JWT Strategy

```typescript
// apps/api/src/modules/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

interface JwtPayload {
  sub: string; // User ID
  email: string;
  tenantId: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles.map((r) => r.role.name),
    };
  }
}
```

### JWT Auth Guard

```typescript
// apps/api/src/common/guards/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
```

### Roles Guard

```typescript
// apps/api/src/common/guards/roles.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // No roles required = allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Super admin can do anything
    if (user.roles.includes('SUPER_ADMIN')) {
      return true;
    }

    // Check if user has any required role
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

### Decorators

```typescript
// apps/api/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// apps/api/src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// apps/api/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;

    return data ? user?.[data] : user;
  }
);
```

---

## Controller Pattern

### Protected Endpoint (Standard)

```typescript
@Controller('api/v1/carriers')
@UseGuards(JwtAuthGuard, RolesGuard) // ALWAYS both guards
export class CarrierController {
  @Get()
  @Roles('ADMIN', 'DISPATCH', 'OPERATIONS')
  async findAll(
    @Query() query: CarrierQueryDto,
    @CurrentUser() user: CurrentUserData // Get authenticated user
  ) {
    // ALWAYS filter by tenant
    return this.service.findAll(query, user.tenantId);
  }

  @Post()
  @Roles('ADMIN', 'DISPATCH')
  async create(
    @Body() dto: CreateCarrierDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.service.create(dto, user.tenantId, user.id);
  }

  @Delete(':id')
  @Roles('ADMIN') // Only admins can delete
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.remove(id, user.tenantId);
  }
}
```

### Public Endpoint (Auth Routes)

```typescript
@Controller('api/v1/auth')
export class AuthController {
  @Post('login')
  @Public() // No auth required
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // Auth required, no role check
  async getProfile(@CurrentUser() user: CurrentUserData) {
    return this.authService.getProfile(user.id);
  }
}
```

---

## Resource Ownership Checks

### Check User Can Access Resource

```typescript
// Service level ownership check

@Injectable()
export class LoadService {
  async findOne(id: string, user: CurrentUserData): Promise<Load> {
    const load = await this.prisma.load.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        deletedAt: null,
      },
      include: {
        carrier: true,
        stops: true,
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    // Additional ownership checks based on role
    if (user.roles.includes('CARRIER')) {
      // Carriers can only see their assigned loads
      if (load.carrierId !== user.carrierId) {
        throw new ForbiddenException('Access denied');
      }
    }

    if (user.roles.includes('CUSTOMER')) {
      // Customers can only see their own loads
      if (load.customerId !== user.customerId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return load;
  }
}
```

### Scoped Queries by Role

```typescript
async findAll(query: LoadQueryDto, user: CurrentUserData) {
  const where: Prisma.LoadWhereInput = {
    tenantId: user.tenantId,
    deletedAt: null,
  };

  // Scope data based on role
  if (user.roles.includes('CARRIER')) {
    where.carrierId = user.carrierId;
  }

  if (user.roles.includes('CUSTOMER')) {
    where.customerId = user.customerId;
  }

  if (user.roles.includes('DRIVER')) {
    where.driverId = user.driverId;
  }

  // Admin, Dispatch, Operations see all tenant data
  // (no additional filter needed)

  return this.prisma.load.findMany({
    where,
    // ...
  });
}
```

---

## Frontend Auth Integration

### Auth Context

```typescript
// contexts/auth-context.tsx

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasRole = useCallback((role: string) => {
    if (!user) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return user.roles.includes(role);
  }, [user]);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;

    return user.roles.some(role => {
      const rolePerms = ROLE_PERMISSIONS[role] || [];
      return rolePerms.includes('*') || rolePerms.includes(permission);
    });
  }, [user]);

  // ... login, logout, etc.

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Route Component

```typescript
// components/auth/protected-route.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  roles,
  permissions,
  fallback = <AccessDenied />,
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  // Check role requirement
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return fallback;
    }
  }

  // Check permission requirement
  if (permissions && permissions.length > 0) {
    const hasRequiredPermission = permissions.some(perm => hasPermission(perm));
    if (!hasRequiredPermission) {
      return fallback;
    }
  }

  return children;
}
```

### Conditional UI Based on Permissions

```typescript
function CarrierActions({ carrier }: { carrier: Carrier }) {
  const { hasPermission } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Everyone with read access can view */}
        <DropdownMenuItem onClick={() => handleView(carrier)}>
          View
        </DropdownMenuItem>

        {/* Only users with write permission can edit */}
        {hasPermission('carriers:write') && (
          <DropdownMenuItem onClick={() => handleEdit(carrier)}>
            Edit
          </DropdownMenuItem>
        )}

        {/* Only admins can delete */}
        {hasPermission('carriers:delete') && (
          <DropdownMenuItem onClick={() => handleDelete(carrier)}>
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Security Checklist

### Every API Endpoint

- [ ] Has `@UseGuards(JwtAuthGuard, RolesGuard)` OR `@Public()`
- [ ] Has `@Roles()` with appropriate roles
- [ ] Filters by `tenantId` in all queries
- [ ] Checks resource ownership for user-specific data
- [ ] Returns 401 for unauthenticated
- [ ] Returns 403 for unauthorized
- [ ] Never exposes data across tenants

### Every Protected Page

- [ ] Wrapped in `<ProtectedRoute>`
- [ ] Redirects to login if not authenticated
- [ ] Shows appropriate UI for user's role
- [ ] Hides actions user can't perform
- [ ] Handles session expiry gracefully

---

## Navigation

- **Previous:** [Type Safety Standards](./66-type-safety-standards.md)
- **Next:** [Testing Strategy](./68-testing-strategy.md)
