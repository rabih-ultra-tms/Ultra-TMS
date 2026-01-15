# P0-2: Add RBAC Guards to Operations Services (Commission, Documents, Communication)

## Priority: P0 - CRITICAL BLOCKER
## Estimated Time: 12-16 hours
## Dependencies: None

---

## Context

The following operations services have **0% RBAC coverage** exposing highly sensitive data:
- **Commission**: Financial payouts, agent earnings, commission structures (FRAUD RISK)
- **Documents**: W-9 forms, insurance certificates, contracts, sensitive attachments
- **Communication**: Email/SMS sending capabilities (SPAM/COST RISK)

These services handle financial data and external communications - security is critical.

---

## Required Changes

### 1. Commission Module (`apps/api/src/modules/commission/`)

#### commissions.controller.ts
```typescript
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/v1/commissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionsController {
  
  // View commission records - restricted to accounting and managers
  @Get()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  findAll() { ... }
  
  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'AGENT_MANAGER')
  findOne() { ... }
  
  // Calculate commission - restricted
  @Post('calculate')
  @Roles('ADMIN', 'ACCOUNTING')
  calculate() { ... }
  
  // CRITICAL: Approve commission payouts - highly restricted
  @Post(':id/approve')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER')
  approve() { ... }
  
  // CRITICAL: Process payments - most restricted
  @Post(':id/pay')
  @Roles('ADMIN')
  processPayment() { ... }
  
  // Agents can view ONLY their own commissions
  @Get('my-commissions')
  @Roles('AGENT', 'SALES_REP')
  getMyCommissions(@CurrentUser() user) {
    // Service must filter by user.id
  }
}
```

#### commission-plans.controller.ts
```typescript
@Controller('api/v1/commission-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionPlansController {
  
  @Get()
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER')
  findAll() { ... }
  
  // CRITICAL: Creating/modifying commission structures
  @Post()
  @Roles('ADMIN')
  create() { ... }
  
  @Put(':id')
  @Roles('ADMIN')
  update() { ... }
  
  @Delete(':id')
  @Roles('ADMIN')
  remove() { ... }
}
```

### 2. Documents Module (`apps/api/src/modules/documents/`)

#### documents.controller.ts
```typescript
@Controller('api/v1/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  
  // List documents - need entity-level filtering
  @Get()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findAll() { ... }
  
  @Get(':id')
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findOne() { ... }
  
  // Download - needs additional entity ownership check
  @Get(':id/download')
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE', 'CARRIER', 'CUSTOMER')
  download(@Param('id') id: string, @CurrentUser() user) {
    // MUST verify user has access to parent entity (order, carrier, customer)
  }
  
  @Post()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  upload() { ... }
  
  // CRITICAL: Delete should be restricted
  @Delete(':id')
  @Roles('ADMIN', 'COMPLIANCE')
  remove() { ... }
}
```

#### Add Document Type Restrictions
```typescript
// document-access.guard.ts - NEW FILE
@Injectable()
export class DocumentAccessGuard implements CanActivate {
  constructor(private documentsService: DocumentsService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const documentId = request.params.id;
    
    const document = await this.documentsService.findOne(documentId);
    
    // W-9 and tax documents - ACCOUNTING only
    if (document.type === 'W9' || document.type === 'TAX') {
      return user.roles.includes('ADMIN') || user.roles.includes('ACCOUNTING');
    }
    
    // Insurance documents - broader access
    if (document.type === 'INSURANCE') {
      return ['ADMIN', 'OPERATIONS', 'COMPLIANCE', 'CARRIER_MANAGER'].some(
        role => user.roles.includes(role)
      );
    }
    
    // Carrier documents - carrier can view their own
    if (document.entityType === 'CARRIER') {
      if (user.roles.includes('CARRIER')) {
        return document.entityId === user.carrierId;
      }
    }
    
    // Customer documents - customer can view their own
    if (document.entityType === 'CUSTOMER') {
      if (user.roles.includes('CUSTOMER')) {
        return document.entityId === user.customerId;
      }
    }
    
    return true;
  }
}
```

### 3. Communication Module (`apps/api/src/modules/communication/`)

#### emails.controller.ts
```typescript
@Controller('api/v1/emails')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailsController {
  
  // View email history
  @Get()
  @Roles('ADMIN', 'OPERATIONS', 'SALES_REP', 'CUSTOMER_SERVICE')
  findAll() { ... }
  
  // CRITICAL: Sending emails has cost implications
  @Post('send')
  @Roles('ADMIN', 'OPERATIONS', 'SALES_REP', 'CUSTOMER_SERVICE', 'DISPATCHER')
  send() { ... }
  
  // Bulk email - highly restricted (spam risk)
  @Post('send-bulk')
  @Roles('ADMIN', 'MARKETING')
  sendBulk() { ... }
  
  // Templates - admin only
  @Get('templates')
  @Roles('ADMIN', 'MARKETING')
  getTemplates() { ... }
  
  @Post('templates')
  @Roles('ADMIN')
  createTemplate() { ... }
}
```

#### sms.controller.ts
```typescript
@Controller('api/v1/sms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SmsController {
  
  // CRITICAL: SMS has per-message cost
  @Post('send')
  @Roles('ADMIN', 'DISPATCHER', 'OPERATIONS')
  send() { ... }
  
  // Bulk SMS - most restricted
  @Post('send-bulk')
  @Roles('ADMIN')
  sendBulk() { ... }
  
  @Get('history')
  @Roles('ADMIN', 'OPERATIONS')
  getHistory() { ... }
}
```

#### notifications.controller.ts
```typescript
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  
  // Users can only see their own notifications
  @Get('my-notifications')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'CARRIER', 'CUSTOMER', 'AGENT')
  getMyNotifications(@CurrentUser() user) {
    // Service MUST filter by user.id
  }
  
  @Put(':id/read')
  // Must verify notification belongs to user
  markAsRead(@Param('id') id: string, @CurrentUser() user) { ... }
  
  // System-wide notification settings - admin only
  @Get('settings')
  @Roles('ADMIN')
  getSettings() { ... }
  
  @Put('settings')
  @Roles('ADMIN')
  updateSettings() { ... }
}
```

---

## Additional Security: Rate Limiting for Communication

Add rate limiting to prevent abuse:

```typescript
// communication.module.ts
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 1 minute window
      limit: 10, // 10 requests per minute for email
    }),
  ],
})

// emails.controller.ts
@UseGuards(ThrottlerGuard)
@Post('send')
send() { ... }

@Throttle(1, 3600) // 1 bulk email per hour
@Post('send-bulk')
sendBulk() { ... }
```

---

## Verification Steps

### Commission Security
```bash
# Verify agent can only see own commissions
curl -H "Authorization: Bearer $AGENT_TOKEN" \
  http://localhost:3001/api/v1/commissions
# Should return 403

curl -H "Authorization: Bearer $AGENT_TOKEN" \
  http://localhost:3001/api/v1/commissions/my-commissions
# Should return only their commissions

# Verify payout approval requires admin
curl -X POST -H "Authorization: Bearer $ACCOUNTING_TOKEN" \
  http://localhost:3001/api/v1/commissions/123/pay
# Should return 403 (needs ADMIN)
```

### Document Security
```bash
# Verify W-9 access restricted
curl -H "Authorization: Bearer $DISPATCHER_TOKEN" \
  http://localhost:3001/api/v1/documents/w9-doc-id/download
# Should return 403

# Verify carrier can access own docs
curl -H "Authorization: Bearer $CARRIER_TOKEN" \
  http://localhost:3001/api/v1/documents/carrier-own-doc/download
# Should return 200
```

### Communication Security
```bash
# Verify bulk email restricted
curl -X POST -H "Authorization: Bearer $SALES_REP_TOKEN" \
  http://localhost:3001/api/v1/emails/send-bulk
# Should return 403

# Verify rate limiting works
for i in {1..15}; do
  curl -X POST -H "Authorization: Bearer $TOKEN" \
    http://localhost:3001/api/v1/sms/send
done
# Should get 429 Too Many Requests after 10
```

---

## Files to Modify

### Commission Module
- [ ] `apps/api/src/modules/commission/commissions.controller.ts`
- [ ] `apps/api/src/modules/commission/commission-plans.controller.ts`
- [ ] `apps/api/src/modules/commission/commission-payouts.controller.ts`

### Documents Module
- [ ] `apps/api/src/modules/documents/documents.controller.ts`
- [ ] `apps/api/src/modules/documents/document-types.controller.ts`
- [ ] Create: `apps/api/src/modules/documents/guards/document-access.guard.ts`

### Communication Module
- [ ] `apps/api/src/modules/communication/emails.controller.ts`
- [ ] `apps/api/src/modules/communication/sms.controller.ts`
- [ ] `apps/api/src/modules/communication/notifications.controller.ts`
- [ ] `apps/api/src/modules/communication/communication.module.ts` (add throttling)

---

## Success Criteria

- [ ] Commission payouts require ADMIN approval
- [ ] Agents can only view their own commission records
- [ ] W-9 documents restricted to ACCOUNTING
- [ ] Entity owners can access their own documents
- [ ] Bulk email/SMS requires ADMIN or MARKETING role
- [ ] Rate limiting prevents communication abuse
- [ ] E2E tests verify all access rules
