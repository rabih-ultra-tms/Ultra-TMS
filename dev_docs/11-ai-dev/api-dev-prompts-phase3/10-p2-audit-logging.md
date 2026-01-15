# P2-3: Audit Logging for Sensitive Operations

## Priority: P2 - MEDIUM
## Estimated Time: 8-10 hours
## Dependencies: Basic audit module exists

---

## Context

Sensitive operations require audit logging for:
- Compliance requirements
- Security incident investigation
- Change tracking
- Access monitoring

---

## Critical Operations to Audit

| Service | Operation | Audit Required |
|---------|-----------|----------------|
| Integration Hub | Credential view/update | Always |
| Carrier | Banking info access | Always |
| Carrier | SSN access | Always |
| Factoring | Funding decisions | Always |
| Factoring | Reserve release | Always |
| Claims | Settlement approval | Always |
| EDI | Trading partner credentials | Always |
| User Management | Role changes | Always |
| User Management | Permission grants | Always |
| All | Delete operations | Always |

---

## Implementation

### 1. Audit Event Types

```typescript
// apps/api/src/modules/audit/types/audit-event.types.ts

export enum AuditAction {
  // Data Access
  VIEW_SENSITIVE = 'VIEW_SENSITIVE',
  EXPORT_DATA = 'EXPORT_DATA',
  
  // CRUD Operations
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  // Authorization
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_GRANT = 'PERMISSION_GRANT',
  PERMISSION_REVOKE = 'PERMISSION_REVOKE',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // Financial Operations
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_APPROVED = 'PAYMENT_APPROVED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  
  // Integration
  INTEGRATION_CONNECTED = 'INTEGRATION_CONNECTED',
  INTEGRATION_DISCONNECTED = 'INTEGRATION_DISCONNECTED',
  CREDENTIALS_UPDATED = 'CREDENTIALS_UPDATED',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AuditEvent {
  action: AuditAction;
  severity: AuditSeverity;
  userId: string;
  userEmail: string;
  userRole: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
```

### 2. Audit Service Enhancement

```typescript
// apps/api/src/modules/audit/audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, AuditSeverity, AuditEvent } from './types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  
  constructor(private prisma: PrismaService) {}
  
  async log(event: Partial<AuditEvent>): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: event.action,
          severity: event.severity || AuditSeverity.MEDIUM,
          userId: event.userId,
          userEmail: event.userEmail,
          userRole: event.userRole,
          entityType: event.entityType,
          entityId: event.entityId,
          details: event.details || {},
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          timestamp: new Date(),
        },
      });
      
      // Critical events also go to external logging
      if (event.severity === AuditSeverity.CRITICAL) {
        this.logger.warn(`CRITICAL AUDIT: ${event.action}`, {
          userId: event.userId,
          entityType: event.entityType,
          entityId: event.entityId,
        });
      }
    } catch (error) {
      // Never fail the main operation due to audit failure
      this.logger.error('Failed to write audit log', error);
    }
  }
  
  // Convenience methods for common operations
  async logSensitiveDataAccess(
    user: { id: string; email: string; role: string },
    entityType: string,
    entityId: string,
    fields: string[],
    request?: { ip?: string; userAgent?: string },
  ): Promise<void> {
    await this.log({
      action: AuditAction.VIEW_SENSITIVE,
      severity: AuditSeverity.HIGH,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      entityType,
      entityId,
      details: { fields, accessedAt: new Date().toISOString() },
      ipAddress: request?.ip,
      userAgent: request?.userAgent,
    });
  }
  
  async logFinancialOperation(
    user: { id: string; email: string; role: string },
    action: AuditAction,
    entityType: string,
    entityId: string,
    amount: number,
    details: Record<string, any>,
  ): Promise<void> {
    await this.log({
      action,
      severity: AuditSeverity.CRITICAL,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      entityType,
      entityId,
      details: { amount, ...details },
    });
  }
  
  async logAccessDenied(
    user: { id: string; email: string; role: string },
    resource: string,
    requiredRoles: string[],
    request?: { ip?: string; userAgent?: string },
  ): Promise<void> {
    await this.log({
      action: AuditAction.ACCESS_DENIED,
      severity: AuditSeverity.MEDIUM,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      entityType: 'ENDPOINT',
      entityId: resource,
      details: { requiredRoles, attemptedRole: user.role },
      ipAddress: request?.ip,
      userAgent: request?.userAgent,
    });
  }
}
```

### 3. Audit Decorator for Automatic Logging

```typescript
// apps/api/src/common/decorators/audit.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditSeverity } from '../../modules/audit/types';

export interface AuditMetadata {
  action: AuditAction;
  severity?: AuditSeverity;
  entityType: string;
  sensitiveFields?: string[];
}

export const AUDIT_KEY = 'audit';

export const Audit = (metadata: AuditMetadata) =>
  SetMetadata(AUDIT_KEY, metadata);
```

### 4. Audit Interceptor

```typescript
// apps/api/src/common/interceptors/audit.interceptor.ts

import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );
    
    if (!auditMetadata) {
      return next.handle();
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const entityId = request.params.id || 'N/A';
    
    return next.handle().pipe(
      tap(() => {
        this.auditService.log({
          action: auditMetadata.action,
          severity: auditMetadata.severity,
          userId: user?.id,
          userEmail: user?.email,
          userRole: user?.role,
          entityType: auditMetadata.entityType,
          entityId,
          details: {
            sensitiveFields: auditMetadata.sensitiveFields,
            method: request.method,
            path: request.path,
          },
          ipAddress: request.ip,
          userAgent: request.get('user-agent'),
        });
      }),
    );
  }
}
```

### 5. Apply to Sensitive Endpoints

```typescript
// apps/api/src/modules/carrier/carriers.controller.ts

import { Audit } from '../../common/decorators/audit.decorator';
import { AuditAction, AuditSeverity } from '../audit/types';

@Controller('api/v1/carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class CarriersController {
  
  @Get(':id/banking')
  @Roles('ADMIN', 'ACCOUNTING')
  @Audit({
    action: AuditAction.VIEW_SENSITIVE,
    severity: AuditSeverity.HIGH,
    entityType: 'CARRIER_BANKING',
    sensitiveFields: ['accountNumber', 'routingNumber'],
  })
  getBanking(@Param('id') id: string) {
    return this.carriersService.getBanking(id);
  }
  
  @Get(':id/drivers/:driverId/ssn')
  @Roles('ADMIN', 'COMPLIANCE')
  @Audit({
    action: AuditAction.VIEW_SENSITIVE,
    severity: AuditSeverity.CRITICAL,
    entityType: 'DRIVER_SSN',
    sensitiveFields: ['ssn'],
  })
  getDriverSsn(
    @Param('id') carrierId: string,
    @Param('driverId') driverId: string,
  ) {
    return this.driversService.getSsn(driverId);
  }
}

// apps/api/src/modules/integration-hub/integrations.controller.ts

@Controller('api/v1/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class IntegrationsController {
  
  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Audit({
    action: AuditAction.VIEW_SENSITIVE,
    severity: AuditSeverity.HIGH,
    entityType: 'INTEGRATION',
    sensitiveFields: ['credentials'],
  })
  findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }
  
  @Patch(':id/credentials')
  @Roles('SUPER_ADMIN')
  @Audit({
    action: AuditAction.CREDENTIALS_UPDATED,
    severity: AuditSeverity.CRITICAL,
    entityType: 'INTEGRATION_CREDENTIALS',
  })
  updateCredentials(
    @Param('id') id: string,
    @Body() dto: UpdateCredentialsDto,
  ) {
    return this.integrationsService.updateCredentials(id, dto);
  }
}

// apps/api/src/modules/factoring-internal/factoring.controller.ts

@Controller('api/v1/factoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class FactoringController {
  
  @Post('invoices/:id/approve')
  @Roles('ADMIN', 'FACTORING_MANAGER')
  @Audit({
    action: AuditAction.PAYMENT_APPROVED,
    severity: AuditSeverity.CRITICAL,
    entityType: 'FACTORING_INVOICE',
  })
  approveForFunding(
    @Param('id') id: string,
    @Body() dto: ApproveFundingDto,
    @CurrentUser() user,
  ) {
    return this.factoringService.approveForFunding(id, dto, user.id);
  }
  
  @Post('reserves/:id/release')
  @Roles('ADMIN')
  @Audit({
    action: AuditAction.PAYMENT_INITIATED,
    severity: AuditSeverity.CRITICAL,
    entityType: 'FACTORING_RESERVE',
  })
  releaseReserve(@Param('id') id: string, @Body() dto: ReleaseReserveDto) {
    return this.factoringService.releaseReserve(id, dto);
  }
}
```

### 6. Audit Log Query Endpoint

```typescript
// apps/api/src/modules/audit/audit.controller.ts

@ApiTags('Audit')
@Controller('api/v1/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}
  
  @Get('logs')
  @Roles('ADMIN', 'SUPER_ADMIN', 'COMPLIANCE')
  @ApiOperation({ summary: 'Query audit logs' })
  async findAll(@Query() query: FindAuditLogsDto) {
    return this.auditService.findAll(query);
  }
  
  @Get('logs/user/:userId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get audit logs for specific user' })
  async findByUser(
    @Param('userId') userId: string,
    @Query() query: FindAuditLogsDto,
  ) {
    return this.auditService.findByUser(userId, query);
  }
  
  @Get('logs/entity/:entityType/:entityId')
  @Roles('ADMIN', 'SUPER_ADMIN', 'COMPLIANCE')
  @ApiOperation({ summary: 'Get audit logs for specific entity' })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, entityId);
  }
  
  @Get('reports/access-summary')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get access summary report' })
  async getAccessSummary(@Query() query: ReportPeriodDto) {
    return this.auditService.getAccessSummary(query);
  }
}
```

### 7. Prisma Schema Update

```prisma
// apps/api/prisma/schema.prisma

model AuditLog {
  id          String   @id @default(uuid())
  action      String   // AuditAction enum value
  severity    String   // AuditSeverity enum value
  userId      String?
  userEmail   String?
  userRole    String?
  entityType  String
  entityId    String
  details     Json?
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([timestamp])
  @@index([severity])
}
```

---

## Verification

```bash
# Check audit logs are being created
psql -c "SELECT * FROM \"AuditLog\" ORDER BY timestamp DESC LIMIT 10;"

# Test sensitive data access logging
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3001/api/v1/carriers/123/banking

# Verify audit log was created
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:3001/api/v1/audit/logs?action=VIEW_SENSITIVE&entityType=CARRIER_BANKING"
```

---

## Files to Create/Modify

### New Files
- [ ] `apps/api/src/modules/audit/types/audit-event.types.ts`
- [ ] `apps/api/src/common/decorators/audit.decorator.ts`
- [ ] `apps/api/src/common/interceptors/audit.interceptor.ts`

### Modify
- [ ] `apps/api/src/modules/audit/audit.service.ts`
- [ ] `apps/api/src/modules/audit/audit.controller.ts`
- [ ] `apps/api/src/modules/carrier/carriers.controller.ts`
- [ ] `apps/api/src/modules/integration-hub/integrations.controller.ts`
- [ ] `apps/api/src/modules/factoring-internal/factoring.controller.ts`
- [ ] `apps/api/src/modules/edi/trading-partners.controller.ts`
- [ ] `apps/api/prisma/schema.prisma`

---

## Success Criteria

- [ ] All sensitive data access is logged
- [ ] All financial operations are logged
- [ ] Audit logs include user context (id, email, role, IP)
- [ ] Critical events trigger additional alerting
- [ ] Audit logs are queryable by entity, user, action
- [ ] Audit logging never fails main operation
