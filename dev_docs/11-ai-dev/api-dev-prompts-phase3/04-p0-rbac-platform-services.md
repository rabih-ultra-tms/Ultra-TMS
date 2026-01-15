# P0-4: Add RBAC Guards to Platform Services (Analytics, Integration Hub)

## Priority: P0 - CRITICAL BLOCKER
## Estimated Time: 12-16 hours
## Dependencies: None

---

## Context

Two platform services have **0% RBAC coverage** exposing extremely sensitive data:

- **Analytics**: Executive KPIs, revenue figures, profit margins, customer rankings
- **Integration Hub**: API keys, OAuth tokens, webhook secrets, third-party credentials

These are among the most security-critical services in the system.

---

## 1. Analytics Module - CRITICAL

### Current Risk
Any authenticated user can see:
- Company-wide revenue and profit figures
- Customer profitability rankings
- Carrier performance metrics
- Executive dashboards

### analytics.controller.ts
```typescript
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  
  // Executive dashboard - highly restricted
  @Get('executive-dashboard')
  @Roles('ADMIN', 'SUPER_ADMIN', 'EXECUTIVE')
  getExecutiveDashboard() { ... }
  
  // Financial KPIs - restricted to finance/executives
  @Get('financial-kpis')
  @Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  getFinancialKPIs() { ... }
  
  // Revenue reports
  @Get('revenue')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'EXECUTIVE')
  getRevenueReport() { ... }
  
  // Profitability analysis - highly sensitive
  @Get('profitability')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  getProfitability() { ... }
  
  // Customer rankings by revenue
  @Get('customer-rankings')
  @Roles('ADMIN', 'SALES_MANAGER', 'EXECUTIVE')
  getCustomerRankings() { ... }
  
  // Carrier performance
  @Get('carrier-performance')
  @Roles('ADMIN', 'CARRIER_MANAGER', 'OPERATIONS_MANAGER')
  getCarrierPerformance() { ... }
  
  // Operations metrics - broader access
  @Get('operations-metrics')
  @Roles('ADMIN', 'OPERATIONS', 'DISPATCHER', 'OPERATIONS_MANAGER')
  getOperationsMetrics() { ... }
  
  // Sales pipeline
  @Get('sales-pipeline')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  getSalesPipeline() { ... }
  
  // My performance (individual user)
  @Get('my-performance')
  @Roles('SALES_REP', 'DISPATCHER', 'AGENT')
  getMyPerformance(@CurrentUser() user) {
    // Service MUST filter by user.id
    return this.analyticsService.getUserPerformance(user.id);
  }
}
```

### reports.controller.ts
```typescript
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  
  // Report generation
  @Post('generate')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  generateReport() { ... }
  
  // Scheduled reports configuration
  @Get('schedules')
  @Roles('ADMIN')
  getSchedules() { ... }
  
  @Post('schedules')
  @Roles('ADMIN')
  createSchedule() { ... }
  
  // Download generated reports
  @Get(':id/download')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
  downloadReport() { ... }
}
```

### dashboards.controller.ts
```typescript
@Controller('api/v1/dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardsController {
  
  // Custom dashboard configurations
  @Get('my-dashboard')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  getMyDashboard(@CurrentUser() user) {
    return this.dashboardsService.getUserDashboard(user.id);
  }
  
  @Put('my-dashboard')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  updateMyDashboard(@CurrentUser() user, @Body() dto) {
    return this.dashboardsService.updateUserDashboard(user.id, dto);
  }
  
  // Dashboard templates - admin creates
  @Get('templates')
  @Roles('ADMIN')
  getTemplates() { ... }
  
  @Post('templates')
  @Roles('ADMIN')
  createTemplate() { ... }
}
```

---

## 2. Integration Hub Module - MOST CRITICAL

### Current Risk
Any authenticated user can see:
- API keys for DAT, Truckstop, ELD providers
- OAuth tokens for QuickBooks, accounting systems
- Webhook secrets
- Database connection strings
- FTP credentials

### integrations.controller.ts
```typescript
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/v1/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN') // Default: SUPER_ADMIN only for entire controller
export class IntegrationsController {
  
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  findAll() {
    // MUST mask credentials in response
    return this.integrationsService.findAllMasked();
  }
  
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  findOne(@Param('id') id: string) {
    // MUST mask credentials
    return this.integrationsService.findOneMasked(id);
  }
  
  @Post()
  @Roles('SUPER_ADMIN')
  create() { ... }
  
  @Put(':id')
  @Roles('SUPER_ADMIN')
  update() { ... }
  
  // Separate endpoint for credential updates (write-only)
  @Put(':id/credentials')
  @Roles('SUPER_ADMIN')
  updateCredentials(@Param('id') id: string, @Body() dto: UpdateCredentialsDto) {
    // Credentials are write-only, never returned
    return this.integrationsService.updateCredentials(id, dto);
  }
  
  @Post(':id/test')
  @Roles('SUPER_ADMIN')
  testConnection() { ... }
  
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove() { ... }
}
```

### webhooks.controller.ts
```typescript
@Controller('api/v1/webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class WebhooksController {
  
  @Get()
  findAll() {
    // MUST mask secrets
    return this.webhooksService.findAllMasked();
  }
  
  @Post()
  create(@Body() dto: CreateWebhookDto) {
    // Return secret ONLY on creation, never again
    const webhook = await this.webhooksService.create(dto);
    return {
      ...webhook,
      secret: webhook.secret, // Show once
      secretHint: 'Save this secret now. It will not be shown again.',
    };
  }
  
  @Get(':id')
  findOne() {
    // Secret is masked
    return this.webhooksService.findOneMasked(id);
  }
  
  // Regenerate secret
  @Post(':id/regenerate-secret')
  regenerateSecret(@Param('id') id: string) {
    const newSecret = await this.webhooksService.regenerateSecret(id);
    return {
      secret: newSecret,
      secretHint: 'Save this new secret. The old secret is now invalid.',
    };
  }
}
```

### sync-logs.controller.ts
```typescript
@Controller('api/v1/sync-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncLogsController {
  
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  findAll() { ... }
  
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SYSTEM_INTEGRATOR')
  findOne() {
    // Ensure sensitive data in logs is masked
  }
}
```

---

## 3. Credential Masking Service

Create a dedicated service for masking sensitive data:

```typescript
// apps/api/src/modules/integration-hub/services/credential-masker.service.ts

@Injectable()
export class CredentialMaskerService {
  
  maskIntegration(integration: Integration): MaskedIntegration {
    return {
      ...integration,
      credentials: this.maskCredentials(integration.credentials),
    };
  }
  
  maskCredentials(credentials: any): any {
    if (!credentials) return null;
    
    const masked = {};
    for (const [key, value] of Object.entries(credentials)) {
      if (this.isSensitiveKey(key)) {
        masked[key] = this.maskValue(value as string);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }
  
  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'apiKey', 'apiSecret', 'password', 'token', 'accessToken',
      'refreshToken', 'secret', 'privateKey', 'clientSecret',
    ];
    return sensitiveKeys.some(sk => 
      key.toLowerCase().includes(sk.toLowerCase())
    );
  }
  
  private maskValue(value: string): string {
    if (!value || value.length < 8) {
      return '••••••••';
    }
    // Show last 4 characters
    return '••••••••' + value.slice(-4);
  }
  
  maskWebhook(webhook: Webhook): MaskedWebhook {
    return {
      ...webhook,
      secret: '••••••••', // Never show webhook secrets
    };
  }
}
```

---

## 4. Encryption at Rest for Credentials

Add encryption for stored credentials:

```typescript
// apps/api/src/modules/integration-hub/services/encryption.service.ts

import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  
  constructor(private configService: ConfigService) {
    // Key should be in environment variables
    const keyHex = this.configService.get('ENCRYPTION_KEY');
    this.key = Buffer.from(keyHex, 'hex');
  }
  
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Usage in Integration Service:
```typescript
@Injectable()
export class IntegrationsService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private maskerService: CredentialMaskerService,
  ) {}
  
  async create(dto: CreateIntegrationDto) {
    // Encrypt credentials before storing
    const encryptedCredentials = this.encryptionService.encrypt(
      JSON.stringify(dto.credentials)
    );
    
    return this.prisma.integration.create({
      data: {
        ...dto,
        credentials: encryptedCredentials,
      },
    });
  }
  
  async findAllMasked() {
    const integrations = await this.prisma.integration.findMany();
    return integrations.map(i => this.maskerService.maskIntegration(i));
  }
  
  // Internal use only - for making API calls
  async getDecryptedCredentials(id: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
    });
    
    return JSON.parse(
      this.encryptionService.decrypt(integration.credentials)
    );
  }
}
```

---

## Verification Steps

### Analytics Security
```bash
# Verify dispatcher cannot see executive dashboard
curl -H "Authorization: Bearer $DISPATCHER_TOKEN" \
  http://localhost:3001/api/v1/analytics/executive-dashboard
# Should return 403

# Verify profitability is restricted
curl -H "Authorization: Bearer $SALES_REP_TOKEN" \
  http://localhost:3001/api/v1/analytics/profitability
# Should return 403

# Verify sales rep can see their own performance
curl -H "Authorization: Bearer $SALES_REP_TOKEN" \
  http://localhost:3001/api/v1/analytics/my-performance
# Should return 200 with user-specific data
```

### Integration Hub Security
```bash
# Verify non-admin cannot access integrations
curl -H "Authorization: Bearer $OPERATIONS_TOKEN" \
  http://localhost:3001/api/v1/integrations
# Should return 403

# Verify credentials are masked in response
curl -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:3001/api/v1/integrations
# Response should show: "apiKey": "••••••••1234"

# Verify webhook secret is not returned
curl -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:3001/api/v1/webhooks/webhook-id
# Secret should be "••••••••"
```

---

## Files to Modify/Create

### Analytics Module
- [ ] `apps/api/src/modules/analytics/analytics.controller.ts`
- [ ] `apps/api/src/modules/analytics/reports.controller.ts`
- [ ] `apps/api/src/modules/analytics/dashboards.controller.ts`

### Integration Hub Module
- [ ] `apps/api/src/modules/integration-hub/integrations.controller.ts`
- [ ] `apps/api/src/modules/integration-hub/webhooks.controller.ts`
- [ ] `apps/api/src/modules/integration-hub/sync-logs.controller.ts`
- [ ] Create: `apps/api/src/modules/integration-hub/services/credential-masker.service.ts`
- [ ] Create: `apps/api/src/modules/integration-hub/services/encryption.service.ts`
- [ ] Update: `apps/api/src/modules/integration-hub/integrations.service.ts`
- [ ] Update: `apps/api/src/modules/integration-hub/webhooks.service.ts`

### Environment Updates
- [ ] Add `ENCRYPTION_KEY` to `.env` (32-byte hex string for AES-256)

---

## Success Criteria

- [ ] Analytics endpoints have role-based access
- [ ] Executive/financial data restricted to appropriate roles
- [ ] Individual performance endpoints filter by user
- [ ] Integration Hub SUPER_ADMIN only for modifications
- [ ] All credentials masked in API responses
- [ ] Webhook secrets shown only on creation
- [ ] Credentials encrypted at rest in database
- [ ] E2E tests verify access restrictions
- [ ] No sensitive data in error messages or logs
