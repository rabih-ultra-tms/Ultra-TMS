# 18 - Audit Service API Implementation

> **Service:** Audit  
> **Priority:** P1 - High  
> **Endpoints:** 25  
> **Dependencies:** Auth ✅  
> **Doc Reference:** [29-service-audit.md](../../02-services/29-service-audit.md)

---

## 📋 Overview

Tamper-evident audit logging system providing complete traceability of all data changes, user actions, and system events. Features hash chains for integrity verification, compliance checkpoints, and configurable retention policies.

### Key Capabilities
- Complete audit trail for all entities
- Tamper-evident hash chains
- User activity tracking
- Login and API audit logs
- Compliance checkpoints
- Configurable retention policies

---

## ✅ Pre-Implementation Checklist

- [x] Auth service operational
- [x] Database models exist in `schema.prisma`
- [x] Event listeners for entity changes
- [ ] Partitioning strategy for audit_logs table

---

## 🗄️ Database Models Reference

### AuditLog Model (Partitioned)
```prisma
model AuditLog {
  id                String            @id @default(cuid())
  tenantId          String
  
  // Action details
  action            String            // CREATE, UPDATE, DELETE, VIEW, EXPORT
  actionCategory    ActionCategory
  resourceType      String            // Entity type
  resourceId        String?           // Entity ID
  resourceName      String?           // Displayable name
  
  // Actor
  userId            String?
  userName          String?
  userEmail         String?
  userRole          String?
  
  // Changes
  previousData      Json?             // Before state
  newData           Json?             // After state
  changedFields     Json?             // List of changed fields
  changeReason      String?           @db.Text
  
  // Context
  ipAddress         String?
  userAgent         String?
  requestId         String?
  sessionId         String?
  
  // Integrity
  sequenceNumber    BigInt            @default(autoincrement())
  previousHash      String?
  hash              String
  
  // Metadata
  duration          Int?              // Action duration in ms
  status            String            @default("SUCCESS")
  errorMessage      String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, createdAt])
  @@index([tenantId, resourceType, resourceId])
  @@index([tenantId, userId, createdAt])
  @@index([tenantId, action])
  // Partition by month for performance
}

enum ActionCategory {
  DATA
  AUTH
  ADMIN
  SYSTEM
}
```

### ChangeHistory Model
```prisma
model ChangeHistory {
  id                String            @id @default(cuid())
  tenantId          String
  
  entityType        String
  entityId          String
  
  version           Int
  
  operation         String            // CREATE, UPDATE, DELETE
  userId            String?
  userName          String?
  
  changes           Json              // Detailed field-by-field changes
  snapshot          Json?             // Full entity state
  
  changeReason      String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, entityType, entityId, version])
  @@index([tenantId, entityType, entityId])
}
```

### AccessLog Model
```prisma
model AccessLog {
  id                String            @id @default(cuid())
  tenantId          String
  userId            String
  
  resourceType      String
  resourceId        String
  resourceName      String?
  
  accessType        String            // VIEW, DOWNLOAD, PRINT, SHARE
  accessDuration    Int?              // Seconds
  
  context           String?           // Where accessed from
  
  ipAddress         String?
  userAgent         String?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  
  @@index([tenantId, userId, createdAt])
  @@index([tenantId, resourceType, resourceId])
}
```

### LoginAudit Model
```prisma
model LoginAudit {
  id                String            @id @default(cuid())
  tenantId          String?
  userId            String?
  
  email             String
  action            String            // LOGIN, LOGOUT, FAILED_LOGIN, PASSWORD_RESET
  status            String            // SUCCESS, FAILURE
  failureReason     String?
  
  ipAddress         String?
  userAgent         String?
  location          String?           // GeoIP
  device            String?
  
  mfaUsed           Boolean           @default(false)
  mfaMethod         String?
  
  sessionId         String?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  user              User?             @relation(fields: [userId], references: [id])
  
  @@index([email, createdAt])
  @@index([tenantId, createdAt])
  @@index([userId, createdAt])
  @@index([ipAddress, createdAt])
}
```

### ApiAuditLog Model
```prisma
model ApiAuditLog {
  id                String            @id @default(cuid())
  tenantId          String?
  
  // Request
  method            String
  path              String
  queryParams       Json?
  requestHeaders    Json?
  requestBody       Json?
  requestBodySize   Int?
  
  // Response
  statusCode        Int
  responseHeaders   Json?
  responseBodySize  Int?
  
  // Timing
  duration          Int               // ms
  
  // Actor
  userId            String?
  apiKeyId          String?
  clientId          String?
  
  // Context
  ipAddress         String?
  userAgent         String?
  requestId         String
  
  // Classification
  isError           Boolean           @default(false)
  errorMessage      String?
  isSensitive       Boolean           @default(false)
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, createdAt])
  @@index([tenantId, path, createdAt])
  @@index([userId, createdAt])
  @@index([requestId])
  @@index([statusCode, createdAt])
}
```

### ComplianceCheckpoint Model
```prisma
model ComplianceCheckpoint {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  
  checkpointType    String            // DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL
  
  startTime         DateTime
  endTime           DateTime
  
  auditLogCount     Int
  changeHistoryCount Int
  accessLogCount    Int
  loginAuditCount   Int
  apiAuditCount     Int
  
  startHash         String
  endHash           String
  checkpointHash    String
  
  status            String            @default("VERIFIED")
  verifiedAt        DateTime?
  verifiedBy        String?
  
  metadata          Json              @default("{}")
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, createdAt])
}
```

### AuditAlert Model
```prisma
model AuditAlert {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  
  conditions        Json              // Alert trigger conditions
  severity          String            // LOW, MEDIUM, HIGH, CRITICAL
  
  actions           Json              // Notification actions
  
  isActive          Boolean           @default(true)
  
  lastTriggeredAt   DateTime?
  triggerCount      Int               @default(0)
  
  createdBy         String
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  incidents         AuditAlertIncident[]
  
  @@index([tenantId, isActive])
}
```

### AuditAlertIncident Model
```prisma
model AuditAlertIncident {
  id                String            @id @default(cuid())
  tenantId          String
  alertId           String
  
  auditLogId        String?
  
  triggerData       Json
  message           String            @db.Text
  severity          String
  
  status            String            @default("OPEN")
  acknowledgedAt    DateTime?
  acknowledgedBy    String?
  resolvedAt        DateTime?
  resolvedBy        String?
  resolution        String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  alert             AuditAlert        @relation(fields: [alertId], references: [id])
  
  @@index([tenantId, status])
  @@index([alertId])
}
```

### AuditRetentionPolicy Model
```prisma
model AuditRetentionPolicy {
  id                String            @id @default(cuid())
  tenantId          String?           // null = global
  
  name              String
  logType           String            // audit_logs, change_history, etc.
  
  retentionDays     Int
  archiveFirst      Boolean           @default(true)
  archiveLocation   String?
  
  conditions        Json?             // Additional filters
  
  lastRunAt         DateTime?
  recordsPurged     Int               @default(0)
  recordsArchived   Int               @default(0)
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
}
```

---

## 🛠️ API Endpoints

### Audit Log Queries (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit/logs` | Query audit logs |
| GET | `/api/v1/audit/logs/:id` | Get log details |
| GET | `/api/v1/audit/logs/export` | Export logs |
| GET | `/api/v1/audit/logs/summary` | Summary stats |
| POST | `/api/v1/audit/logs/verify` | Verify integrity |

### Entity History (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit/history/:entityType/:entityId` | Entity history |
| GET | `/api/v1/audit/history/:entityType/:entityId/versions` | Version list |
| GET | `/api/v1/audit/history/:entityType/:entityId/versions/:version` | Get version |

### User Activity (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit/users/:userId/activity` | User activity |
| GET | `/api/v1/audit/logins` | Login audit |
| GET | `/api/v1/audit/logins/summary` | Login summary |
| GET | `/api/v1/audit/access` | Access logs |

### API Auditing (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit/api` | API audit logs |
| GET | `/api/v1/audit/api/errors` | API errors |
| GET | `/api/v1/audit/api/:requestId` | Request details |

### Compliance (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit/compliance/checkpoints` | List checkpoints |
| POST | `/api/v1/audit/compliance/checkpoints` | Create checkpoint |
| GET | `/api/v1/audit/compliance/checkpoints/:id/verify` | Verify checkpoint |

### Alerts (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit/alerts` | List alerts |
| POST | `/api/v1/audit/alerts` | Create alert |
| PUT | `/api/v1/audit/alerts/:id` | Update alert |
| GET | `/api/v1/audit/alerts/incidents` | List incidents |

### Retention (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit/retention` | List policies |
| POST | `/api/v1/audit/retention` | Create policy |
| PUT | `/api/v1/audit/retention/:id` | Update policy |

---

## 📝 DTO Specifications

### QueryAuditLogsDto
```typescript
export class QueryAuditLogsDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsEnum(ActionCategory)
  actionCategory?: ActionCategory;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
```

### ExportAuditLogsDto
```typescript
export class ExportAuditLogsDto extends QueryAuditLogsDto {
  @IsIn(['CSV', 'JSON', 'PDF'])
  format: string;

  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean;
}
```

### CreateAuditAlertDto
```typescript
export class CreateAuditAlertDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  conditions: {
    actions?: string[];
    resourceTypes?: string[];
    userIds?: string[];
    ipAddresses?: string[];
    failureThreshold?: number;
    timeWindowMinutes?: number;
  };

  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: string;

  @IsArray()
  actions: {
    type: 'EMAIL' | 'WEBHOOK' | 'SLACK';
    config: Record<string, any>;
  }[];
}
```

### CreateRetentionPolicyDto
```typescript
export class CreateRetentionPolicyDto {
  @IsString()
  name: string;

  @IsIn(['audit_logs', 'change_history', 'access_logs', 'login_audit', 'api_audit'])
  logType: string;

  @IsInt()
  @Min(30)
  retentionDays: number;

  @IsOptional()
  @IsBoolean()
  archiveFirst?: boolean;

  @IsOptional()
  @IsString()
  archiveLocation?: string;
}
```

---

## 📋 Business Rules

### Hash Chain Integrity
```typescript
class AuditHashService {
  generateHash(log: AuditLog, previousHash: string | null): string {
    const data = {
      tenantId: log.tenantId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      userId: log.userId,
      previousData: log.previousData,
      newData: log.newData,
      createdAt: log.createdAt.toISOString(),
      previousHash
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
  
  async verifyChain(tenantId: string, startId: string, endId: string): Promise<{
    valid: boolean;
    brokenAt?: string;
  }> {
    // Verify each log's hash matches recalculated hash
    // Check previousHash links correctly
  }
}
```

### Automatic Audit Logging
```typescript
// Interceptor for automatic logging
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(async (response) => {
        await this.auditService.log({
          action: this.getAction(request.method),
          resourceType: this.getResourceType(request.path),
          resourceId: request.params.id,
          userId: request.user?.id,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          duration: Date.now() - startTime,
          status: 'SUCCESS'
        });
      })
    );
  }
}
```

### Sensitive Data Handling
```typescript
const sensitiveFields = [
  'password', 'ssn', 'taxId', 'bankAccount', 
  'creditCard', 'apiKey', 'token', 'secret'
];

function redactSensitiveData(data: any): any {
  // Recursively redact sensitive fields
  for (const field of sensitiveFields) {
    if (data[field]) {
      data[field] = '[REDACTED]';
    }
  }
  return data;
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `audit.logged` | Log created | `{ logId, action }` |
| `audit.alert.triggered` | Alert triggered | `{ alertId, incident }` |
| `audit.integrity.broken` | Hash mismatch | `{ logId }` |
| `audit.checkpoint.created` | Checkpoint made | `{ checkpointId }` |
| `audit.retention.completed` | Purge complete | `{ records }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `*.created` | All services | Log creation |
| `*.updated` | All services | Log update |
| `*.deleted` | All services | Log deletion |
| `user.login` | Auth | Log login |
| `user.logout` | Auth | Log logout |
| `user.login.failed` | Auth | Log failure |

---

## 🧪 Integration Test Requirements

```typescript
describe('Audit Service API', () => {
  describe('Audit Logs', () => {
    it('should query audit logs with filters');
    it('should export logs in CSV format');
    it('should verify hash chain integrity');
    it('should automatically log CRUD operations');
  });

  describe('Entity History', () => {
    it('should track entity version history');
    it('should retrieve specific version');
    it('should show field-by-field changes');
  });

  describe('User Activity', () => {
    it('should track user actions');
    it('should log all login attempts');
    it('should summarize login patterns');
  });

  describe('Compliance', () => {
    it('should create checkpoint');
    it('should verify checkpoint integrity');
    it('should detect tampering');
  });

  describe('Alerts', () => {
    it('should trigger alert on condition match');
    it('should create incident on trigger');
    it('should notify on alert');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/audit/
├── audit.module.ts
├── logs/
│   ├── audit-logs.controller.ts
│   ├── audit-logs.service.ts
│   └── audit-hash.service.ts
├── history/
│   ├── change-history.controller.ts
│   └── change-history.service.ts
├── activity/
│   ├── user-activity.controller.ts
│   ├── login-audit.service.ts
│   └── access-log.service.ts
├── api/
│   ├── api-audit.controller.ts
│   └── api-audit.service.ts
├── compliance/
│   ├── compliance.controller.ts
│   └── checkpoint.service.ts
├── alerts/
│   ├── alerts.controller.ts
│   ├── alerts.service.ts
│   └── alert-processor.service.ts
├── retention/
│   ├── retention.controller.ts
│   └── retention.service.ts
├── interceptors/
│   └── audit.interceptor.ts
└── decorators/
    └── audit.decorator.ts
```

---

## ✅ Completion Checklist

- [x] All 25 endpoints implemented
- [x] Audit log queries with filters
- [x] Hash chain implementation
- [x] Entity change history
- [x] Login audit tracking
- [x] API request auditing
- [x] Compliance checkpoints
- [x] Alert system working
- [x] Retention policies
- [x] All integration tests passing
- [ ] Performance optimized for large logs

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>31</td>
    <td>Audit</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>25/25</td>
    <td>4/4</td>
    <td>100%</td>
    <td>Logs, History, Compliance, Alerts</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[19-config-api.md](./19-config-api.md)** - Implement Config Service API
