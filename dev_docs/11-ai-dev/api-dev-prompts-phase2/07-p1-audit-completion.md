# Prompt 07: Audit Service Completion

**Priority:** P1 (High)  
**Estimated Time:** 3-4 hours  
**Dependencies:** P0 prompts completed  
**Current Coverage:** 40% → Target: 90%

---

## Objective

Complete the Audit service by implementing entity change tracking, login audit logging, API request logging, and compliance report generation to provide comprehensive audit trail capabilities for TMS operations.

---

## Missing Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/audit/entities/:entityType` | GET | Entity change history |
| `/audit/entities/:entityType/:entityId` | GET | Specific entity changes |
| `/audit/logins` | GET | Login attempt history |
| `/audit/api-calls` | GET | API request log |
| `/audit/reports/compliance` | GET | Compliance report |
| `/audit/reports/user-activity` | GET | User activity summary |
| `/audit/search` | POST | Advanced audit search |

---

## Files to Create

| File | Description |
|------|-------------|
| `apps/api/src/modules/audit/audit.controller.ts` | Main audit endpoints |
| `apps/api/src/modules/audit/audit.service.ts` | Audit business logic |
| `apps/api/src/modules/audit/audit.listener.ts` | Event listeners for tracking |
| `apps/api/src/modules/audit/audit.interceptor.ts` | API logging interceptor |
| `apps/api/src/modules/audit/dto/audit.dto.ts` | Query DTOs |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/api/src/modules/audit/audit.module.ts` | Register components |
| `apps/api/src/app.module.ts` | Apply global interceptor (optional) |

---

## Implementation Steps

### Step 1: Create Audit DTOs

**File: `apps/api/src/modules/audit/dto/audit.dto.ts`**

```typescript
import { IsOptional, IsString, IsDateString, IsNumber, IsEnum, IsArray, IsUUID } from 'class-validator';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
}

export class AuditQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 50;
}

export class EntityAuditQueryDto extends AuditQueryDto {
  @IsOptional()
  @IsString()
  fieldName?: string;
}

export class LoginAuditQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  status?: 'success' | 'failed';

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 50;
}

export class ApiAuditQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @IsOptional()
  @IsNumber()
  minDuration?: number;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 100;
}

export class AdvancedSearchDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(AuditAction, { each: true })
  actions?: AuditAction[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  searchText?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 50;
}

export class ComplianceReportDto {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeCategories?: string[];
}
```

### Step 2: Create Audit Service

**File: `apps/api/src/modules/audit/audit.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { 
  AuditQueryDto, 
  EntityAuditQueryDto, 
  LoginAuditQueryDto, 
  ApiAuditQueryDto,
  AdvancedSearchDto,
  ComplianceReportDto,
  AuditAction 
} from './dto/audit.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  // Entity audit trail
  async getEntityChanges(
    tenantId: string,
    entityType: string,
    query: EntityAuditQueryDto,
  ) {
    const { page = 1, limit = 50, fromDate, toDate, userId, action, fieldName } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      entityType: entityType.toUpperCase(),
    };

    if (fromDate) where.timestamp = { ...where.timestamp, gte: new Date(fromDate) };
    if (toDate) where.timestamp = { ...where.timestamp, lte: new Date(toDate) };
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (fieldName) where.fieldName = fieldName;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getEntityHistory(
    tenantId: string,
    entityType: string,
    entityId: string,
    query: EntityAuditQueryDto,
  ) {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      entityType: entityType.toUpperCase(),
      entityId,
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // Login audit
  async getLoginHistory(tenantId: string, query: LoginAuditQueryDto) {
    const { page = 1, limit = 50, fromDate, toDate, userId, email, ipAddress, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (fromDate) where.timestamp = { ...where.timestamp, gte: new Date(fromDate) };
    if (toDate) where.timestamp = { ...where.timestamp, lte: new Date(toDate) };
    if (userId) where.userId = userId;
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (ipAddress) where.ipAddress = ipAddress;
    if (status) where.success = status === 'success';

    const [data, total] = await Promise.all([
      this.prisma.loginAudit.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.loginAudit.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // API request audit
  async getApiCalls(tenantId: string, query: ApiAuditQueryDto) {
    const { page = 1, limit = 100, fromDate, toDate, userId, method, path, statusCode, minDuration } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (fromDate) where.timestamp = { ...where.timestamp, gte: new Date(fromDate) };
    if (toDate) where.timestamp = { ...where.timestamp, lte: new Date(toDate) };
    if (userId) where.userId = userId;
    if (method) where.method = method.toUpperCase();
    if (path) where.path = { contains: path };
    if (statusCode) where.statusCode = statusCode;
    if (minDuration) where.durationMs = { gte: minDuration };

    const [data, total] = await Promise.all([
      this.prisma.apiAuditLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true } },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.apiAuditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // Advanced search
  async advancedSearch(tenantId: string, dto: AdvancedSearchDto) {
    const { page = 1, limit = 50, entityTypes, actions, userIds, fromDate, toDate, searchText } = dto;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (entityTypes?.length) where.entityType = { in: entityTypes.map(t => t.toUpperCase()) };
    if (actions?.length) where.action = { in: actions };
    if (userIds?.length) where.userId = { in: userIds };
    if (fromDate) where.timestamp = { ...where.timestamp, gte: new Date(fromDate) };
    if (toDate) where.timestamp = { ...where.timestamp, lte: new Date(toDate) };
    if (searchText) {
      where.OR = [
        { entityId: { contains: searchText } },
        { fieldName: { contains: searchText, mode: 'insensitive' } },
        { newValue: { contains: searchText, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // Compliance report
  async generateComplianceReport(tenantId: string, dto: ComplianceReportDto) {
    const { fromDate, toDate, includeCategories } = dto;

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Gather statistics
    const [
      totalLogins,
      failedLogins,
      dataModifications,
      dataExports,
      sensitiveAccess,
      userActivity,
    ] = await Promise.all([
      // Total successful logins
      this.prisma.loginAudit.count({
        where: { tenantId, timestamp: { gte: from, lte: to }, success: true },
      }),
      // Failed login attempts
      this.prisma.loginAudit.count({
        where: { tenantId, timestamp: { gte: from, lte: to }, success: false },
      }),
      // Data modifications by type
      this.prisma.auditLog.groupBy({
        by: ['entityType', 'action'],
        where: { tenantId, timestamp: { gte: from, lte: to } },
        _count: true,
      }),
      // Data exports
      this.prisma.auditLog.count({
        where: { tenantId, timestamp: { gte: from, lte: to }, action: 'EXPORT' },
      }),
      // Sensitive data access (customize based on entity types)
      this.prisma.auditLog.count({
        where: { 
          tenantId, 
          timestamp: { gte: from, lte: to },
          entityType: { in: ['USER', 'PAYMENT', 'INVOICE', 'CUSTOMER'] },
        },
      }),
      // User activity summary
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where: { tenantId, timestamp: { gte: from, lte: to } },
        _count: true,
      }),
    ]);

    // Get user details for activity
    const userIds = userActivity.map(u => u.userId).filter(Boolean);
    const users = userIds.length ? await this.prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, email: true, firstName: true, lastName: true },
    }) : [];

    const userMap = new Map(users.map(u => [u.id, u]));

    return {
      reportPeriod: { from: fromDate, to: toDate },
      generatedAt: new Date().toISOString(),
      summary: {
        totalLogins,
        failedLogins,
        failedLoginRate: totalLogins > 0 ? (failedLogins / (totalLogins + failedLogins) * 100).toFixed(2) : '0',
        dataModificationCount: dataModifications.reduce((sum, d) => sum + d._count, 0),
        dataExports,
        sensitiveDataAccess: sensitiveAccess,
      },
      dataModifications: dataModifications.map(d => ({
        entityType: d.entityType,
        action: d.action,
        count: d._count,
      })),
      userActivity: userActivity.map(u => ({
        userId: u.userId,
        user: userMap.get(u.userId as string),
        actionsCount: u._count,
      })).sort((a, b) => b.actionsCount - a.actionsCount).slice(0, 20),
    };
  }

  // User activity report
  async generateUserActivityReport(
    tenantId: string,
    userId: string,
    fromDate: string,
    toDate: string,
  ) {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    const [user, loginHistory, auditActions, apiCalls] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      }),
      this.prisma.loginAudit.findMany({
        where: { tenantId, userId, timestamp: { gte: from, lte: to } },
        orderBy: { timestamp: 'desc' },
        take: 50,
      }),
      this.prisma.auditLog.groupBy({
        by: ['entityType', 'action'],
        where: { tenantId, userId, timestamp: { gte: from, lte: to } },
        _count: true,
      }),
      this.prisma.apiAuditLog.groupBy({
        by: ['method', 'path'],
        where: { tenantId, userId, timestamp: { gte: from, lte: to } },
        _count: true,
      }),
    ]);

    return {
      user,
      reportPeriod: { from: fromDate, to: toDate },
      loginHistory: {
        totalLogins: loginHistory.filter(l => l.success).length,
        failedAttempts: loginHistory.filter(l => !l.success).length,
        recentLogins: loginHistory.slice(0, 10),
      },
      entityActions: auditActions.map(a => ({
        entityType: a.entityType,
        action: a.action,
        count: a._count,
      })),
      apiUsage: apiCalls.slice(0, 20).map(c => ({
        method: c.method,
        path: c.path,
        count: c._count,
      })),
    };
  }

  // Log helper methods
  async logEntityChange(
    tenantId: string,
    userId: string | null,
    entityType: string,
    entityId: string,
    action: AuditAction,
    changes?: { field: string; oldValue: any; newValue: any }[],
  ) {
    const logs = changes?.map(change => ({
      tenantId,
      userId,
      entityType: entityType.toUpperCase(),
      entityId,
      action,
      fieldName: change.field,
      oldValue: change.oldValue != null ? String(change.oldValue) : null,
      newValue: change.newValue != null ? String(change.newValue) : null,
      timestamp: new Date(),
    })) || [{
      tenantId,
      userId,
      entityType: entityType.toUpperCase(),
      entityId,
      action,
      timestamp: new Date(),
    }];

    await this.prisma.auditLog.createMany({ data: logs });
  }

  async logLogin(
    tenantId: string,
    userId: string | null,
    email: string,
    success: boolean,
    ipAddress: string,
    userAgent?: string,
    failureReason?: string,
  ) {
    await this.prisma.loginAudit.create({
      data: {
        tenantId,
        userId,
        email,
        success,
        ipAddress,
        userAgent,
        failureReason,
        timestamp: new Date(),
      },
    });
  }

  async logApiCall(
    tenantId: string,
    userId: string | null,
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    requestBody?: any,
    responseSize?: number,
  ) {
    await this.prisma.apiAuditLog.create({
      data: {
        tenantId,
        userId,
        method,
        path,
        statusCode,
        durationMs,
        requestBody: requestBody ? JSON.stringify(requestBody).substring(0, 5000) : null,
        responseSize,
        timestamp: new Date(),
      },
    });
  }
}
```

### Step 3: Create Audit Controller

**File: `apps/api/src/modules/audit/audit.controller.ts`**

```typescript
import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators';
import { AuditService } from './audit.service';
import { 
  EntityAuditQueryDto, 
  LoginAuditQueryDto, 
  ApiAuditQueryDto,
  AdvancedSearchDto,
  ComplianceReportDto,
} from './dto/audit.dto';
import { ok, paginated } from '../../common/helpers/response.helper';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'AUDITOR', 'COMPLIANCE')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('entities/:entityType')
  async getEntityChanges(
    @Param('entityType') entityType: string,
    @Query() query: EntityAuditQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    const result = await this.auditService.getEntityChanges(tenantId, entityType, query);
    return paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('entities/:entityType/:entityId')
  async getEntityHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() query: EntityAuditQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    const result = await this.auditService.getEntityHistory(tenantId, entityType, entityId, query);
    return paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('logins')
  async getLoginHistory(
    @Query() query: LoginAuditQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    const result = await this.auditService.getLoginHistory(tenantId, query);
    return paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('api-calls')
  async getApiCalls(
    @Query() query: ApiAuditQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    const result = await this.auditService.getApiCalls(tenantId, query);
    return paginated(result.data, result.total, result.page, result.limit);
  }

  @Post('search')
  async advancedSearch(
    @Body() dto: AdvancedSearchDto,
    @CurrentTenant() tenantId: string,
  ) {
    const result = await this.auditService.advancedSearch(tenantId, dto);
    return paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('reports/compliance')
  async getComplianceReport(
    @Query() dto: ComplianceReportDto,
    @CurrentTenant() tenantId: string,
  ) {
    const report = await this.auditService.generateComplianceReport(tenantId, dto);
    return ok(report);
  }

  @Get('reports/user-activity')
  async getUserActivityReport(
    @Query('userId') userId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @CurrentTenant() tenantId: string,
  ) {
    const report = await this.auditService.generateUserActivityReport(
      tenantId,
      userId,
      fromDate,
      toDate,
    );
    return ok(report);
  }
}
```

### Step 4: Create Audit Event Listener

**File: `apps/api/src/modules/audit/audit.listener.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from './audit.service';
import { AuditAction } from './dto/audit.dto';

@Injectable()
export class AuditListener {
  constructor(private auditService: AuditService) {}

  // Order events
  @OnEvent('order.created')
  async handleOrderCreated(payload: { order: any; userId?: string }) {
    await this.auditService.logEntityChange(
      payload.order.tenantId,
      payload.userId || payload.order.createdById,
      'ORDER',
      payload.order.id,
      AuditAction.CREATE,
    );
  }

  @OnEvent('order.updated')
  async handleOrderUpdated(payload: { order: any; userId?: string; changes?: any[] }) {
    await this.auditService.logEntityChange(
      payload.order.tenantId,
      payload.userId,
      'ORDER',
      payload.order.id,
      AuditAction.UPDATE,
      payload.changes,
    );
  }

  @OnEvent('order.deleted')
  async handleOrderDeleted(payload: { tenantId: string; orderId: string; userId: string }) {
    await this.auditService.logEntityChange(
      payload.tenantId,
      payload.userId,
      'ORDER',
      payload.orderId,
      AuditAction.DELETE,
    );
  }

  // Load events
  @OnEvent('load.created')
  async handleLoadCreated(payload: { load: any; userId?: string }) {
    await this.auditService.logEntityChange(
      payload.load.tenantId,
      payload.userId,
      'LOAD',
      payload.load.id,
      AuditAction.CREATE,
    );
  }

  @OnEvent('load.status.changed')
  async handleLoadStatusChanged(payload: { load: any; userId?: string; oldStatus: string; newStatus: string }) {
    await this.auditService.logEntityChange(
      payload.load.tenantId,
      payload.userId,
      'LOAD',
      payload.load.id,
      AuditAction.UPDATE,
      [{ field: 'status', oldValue: payload.oldStatus, newValue: payload.newStatus }],
    );
  }

  // Customer events
  @OnEvent('customer.created')
  async handleCustomerCreated(payload: { customer: any; userId?: string }) {
    await this.auditService.logEntityChange(
      payload.customer.tenantId,
      payload.userId,
      'CUSTOMER',
      payload.customer.id,
      AuditAction.CREATE,
    );
  }

  // Invoice events
  @OnEvent('invoice.created')
  async handleInvoiceCreated(payload: { invoice: any; userId?: string }) {
    await this.auditService.logEntityChange(
      payload.invoice.tenantId,
      payload.userId,
      'INVOICE',
      payload.invoice.id,
      AuditAction.CREATE,
    );
  }

  @OnEvent('invoice.sent')
  async handleInvoiceSent(payload: { invoice: any; userId?: string }) {
    await this.auditService.logEntityChange(
      payload.invoice.tenantId,
      payload.userId,
      'INVOICE',
      payload.invoice.id,
      AuditAction.UPDATE,
      [{ field: 'status', oldValue: 'DRAFT', newValue: 'SENT' }],
    );
  }

  // Payment events
  @OnEvent('payment.created')
  async handlePaymentCreated(payload: { payment: any; userId?: string }) {
    await this.auditService.logEntityChange(
      payload.payment.tenantId,
      payload.userId,
      'PAYMENT',
      payload.payment.id,
      AuditAction.CREATE,
    );
  }

  // User events
  @OnEvent('user.login.success')
  async handleLoginSuccess(payload: { tenantId: string; userId: string; email: string; ip: string; userAgent?: string }) {
    await this.auditService.logLogin(
      payload.tenantId,
      payload.userId,
      payload.email,
      true,
      payload.ip,
      payload.userAgent,
    );
  }

  @OnEvent('user.login.failed')
  async handleLoginFailed(payload: { tenantId: string; email: string; ip: string; userAgent?: string; reason?: string }) {
    await this.auditService.logLogin(
      payload.tenantId,
      null,
      payload.email,
      false,
      payload.ip,
      payload.userAgent,
      payload.reason,
    );
  }

  // Export events
  @OnEvent('data.exported')
  async handleDataExport(payload: { tenantId: string; userId: string; entityType: string; entityId?: string }) {
    await this.auditService.logEntityChange(
      payload.tenantId,
      payload.userId,
      payload.entityType,
      payload.entityId || 'BULK',
      AuditAction.EXPORT,
    );
  }
}
```

### Step 5: Create API Logging Interceptor (Optional)

**File: `apps/api/src/modules/audit/audit.interceptor.ts`**

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // Skip health check and static asset requests
    if (request.path === '/health' || request.path.startsWith('/public')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.logRequest(request, 200, startTime, response);
        },
        error: (error) => {
          this.logRequest(request, error.status || 500, startTime);
        },
      }),
    );
  }

  private async logRequest(request: any, statusCode: number, startTime: number, response?: any) {
    const durationMs = Date.now() - startTime;
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;

    if (!tenantId) return; // Skip if no tenant context

    // Only log mutating operations or errors to reduce noise
    const shouldLog = 
      request.method !== 'GET' || 
      statusCode >= 400 ||
      durationMs > 5000; // Slow requests

    if (!shouldLog) return;

    try {
      await this.auditService.logApiCall(
        tenantId,
        request.user?.id || null,
        request.method,
        request.path,
        statusCode,
        durationMs,
        request.method !== 'GET' ? request.body : undefined,
        response ? JSON.stringify(response).length : undefined,
      );
    } catch (error) {
      // Don't let audit logging failures affect the request
      console.error('Audit logging failed:', error);
    }
  }
}
```

### Step 6: Update Audit Module

**File: `apps/api/src/modules/audit/audit.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditListener } from './audit.listener';
import { AuditInterceptor } from './audit.interceptor';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditListener,
    AuditInterceptor,
    PrismaService,
  ],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
```

### Step 7: Required Prisma Models

Ensure these models exist in `prisma/schema.prisma`:

```prisma
model AuditLog {
  id          String    @id @default(uuid())
  tenantId    String
  userId      String?
  entityType  String
  entityId    String
  action      String    // CREATE, UPDATE, DELETE, VIEW, EXPORT
  fieldName   String?
  oldValue    String?
  newValue    String?
  timestamp   DateTime  @default(now())
  
  tenant      Tenant    @relation(fields: [tenantId], references: [id])
  user        User?     @relation(fields: [userId], references: [id])

  @@index([tenantId, entityType, timestamp])
  @@index([tenantId, entityId])
  @@index([tenantId, userId])
}

model LoginAudit {
  id            String    @id @default(uuid())
  tenantId      String
  userId        String?
  email         String
  success       Boolean
  ipAddress     String
  userAgent     String?
  failureReason String?
  timestamp     DateTime  @default(now())

  tenant        Tenant    @relation(fields: [tenantId], references: [id])
  user          User?     @relation(fields: [userId], references: [id])

  @@index([tenantId, timestamp])
  @@index([tenantId, email])
}

model ApiAuditLog {
  id            String    @id @default(uuid())
  tenantId      String
  userId        String?
  method        String
  path          String
  statusCode    Int
  durationMs    Int
  requestBody   String?
  responseSize  Int?
  timestamp     DateTime  @default(now())

  tenant        Tenant    @relation(fields: [tenantId], references: [id])
  user          User?     @relation(fields: [userId], references: [id])

  @@index([tenantId, timestamp])
  @@index([tenantId, userId])
  @@index([tenantId, path])
}
```

---

## Acceptance Criteria

- [ ] `GET /audit/entities/:entityType` returns paginated entity changes
- [ ] `GET /audit/entities/:entityType/:entityId` returns specific entity history
- [ ] `GET /audit/logins` returns login attempt history with filtering
- [ ] `GET /audit/api-calls` returns API request logs
- [ ] `POST /audit/search` allows advanced multi-field searching
- [ ] `GET /audit/reports/compliance` generates compliance statistics
- [ ] `GET /audit/reports/user-activity` generates user activity report
- [ ] Event listeners capture entity changes automatically
- [ ] Login events (success/failure) are logged
- [ ] All endpoints restricted to ADMIN/AUDITOR/COMPLIANCE roles

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 07 row in the status table:
```markdown
| 07 | [Audit Completion](...) | P1 | 3-4h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| Endpoint Coverage | [prev]% | 93% | 95% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 07: Audit Completion
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Entity change tracking endpoints implemented
- Login audit history available
- API request logging with interceptor
- Compliance and user activity reports
- Event-driven audit logging via listeners
- Audit now at 90% endpoint coverage

#### Metrics Updated
- Endpoint Coverage: [prev]% → 93%
```
