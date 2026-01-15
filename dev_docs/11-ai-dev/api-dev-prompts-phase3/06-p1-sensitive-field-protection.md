# P1-2: Sensitive Field Protection in API Responses

## Priority: P1 - HIGH
## Estimated Time: 8-12 hours
## Dependencies: None

---

## Context

Multiple services return sensitive data in API responses that should be masked or excluded:

| Service | Sensitive Field | Current State | Risk |
|---------|----------------|---------------|------|
| Carrier | `bankingInfo.accountNumber` | Fully exposed | Financial fraud |
| Carrier | `bankingInfo.routingNumber` | Fully exposed | Financial fraud |
| Carrier | Driver `ssn` | Fully exposed | Identity theft |
| Integration Hub | `credentials.apiKey` | Fully exposed | Account takeover |
| Integration Hub | `credentials.apiSecret` | Fully exposed | Account takeover |
| Integration Hub | `webhook.secret` | Fully exposed | Security bypass |
| EDI | `tradingPartner.credentials` | Fully exposed | Partner compromise |
| Documents | `document.signedUrl` | Long-lived URLs | Unauthorized access |

---

## Solution: Response DTOs with Field Exclusion

### 1. Create Base Transformer

```typescript
// apps/api/src/common/transformers/sensitive-field.transformer.ts

import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude, Expose, Transform } from 'class-transformer';

// Decorator for sensitive fields
export function SensitiveField() {
  return Exclude();
}

// Decorator for masked fields (show last 4)
export function MaskedField() {
  return Transform(({ value }) => {
    if (!value || typeof value !== 'string') return null;
    if (value.length <= 4) return '••••';
    return '••••' + value.slice(-4);
  });
}

// Apply to controller to enable transformation
export function UseSerialization() {
  return UseInterceptors(ClassSerializerInterceptor);
}
```

### 2. Carrier Response DTOs

```typescript
// apps/api/src/modules/carrier/dto/carrier-response.dto.ts

import { Exclude, Expose, Type } from 'class-transformer';

export class BankingInfoResponseDto {
  @Expose()
  bankName: string;
  
  @Expose()
  @Transform(({ value }) => value ? '••••' + value.slice(-4) : null)
  accountNumber: string; // Shows: ••••1234
  
  @Expose()
  @Transform(({ value }) => value ? '•••••' + value.slice(-4) : null)
  routingNumber: string; // Shows: •••••6789
  
  @Expose()
  accountType: string;
  
  // Never expose these
  @Exclude()
  accountHolderName: string;
}

export class DriverResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  firstName: string;
  
  @Expose()
  lastName: string;
  
  @Expose()
  licenseNumber: string;
  
  @Expose()
  licenseState: string;
  
  @Expose()
  licenseExpiration: Date;
  
  // SSN - NEVER return in list, masked in detail view
  @Exclude()
  ssn: string;
  
  // Provide masked version for authorized users
  @Expose()
  @Transform(({ obj }) => obj.ssn ? '•••-••-' + obj.ssn.slice(-4) : null)
  ssnMasked: string; // Shows: •••-••-1234
}

export class CarrierResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  name: string;
  
  @Expose()
  mcNumber: string;
  
  @Expose()
  dotNumber: string;
  
  @Expose()
  status: string;
  
  // Banking info with masking
  @Expose()
  @Type(() => BankingInfoResponseDto)
  bankingInfo: BankingInfoResponseDto;
  
  // Tax ID - masked
  @Expose()
  @Transform(({ value }) => value ? '••-•••' + value.slice(-4) : null)
  taxId: string;
  
  // Internal fields - never expose
  @Exclude()
  internalNotes: string;
  
  @Exclude()
  creditScore: number;
}
```

### 3. Apply to Carrier Controller

```typescript
// apps/api/src/modules/carrier/carriers.controller.ts

import { SerializeOptions, ClassSerializerInterceptor } from '@nestjs/common';
import { CarrierResponseDto, DriverResponseDto } from './dto';

@Controller('api/v1/carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class CarriersController {
  
  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER')
  @SerializeOptions({ type: CarrierResponseDto })
  findAll() {
    return this.carriersService.findAll();
  }
  
  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER')
  @SerializeOptions({ type: CarrierResponseDto })
  findOne(@Param('id') id: string) {
    return this.carriersService.findOne(id);
  }
  
  // Full banking details - accounting only, still masked
  @Get(':id/banking')
  @Roles('ADMIN', 'ACCOUNTING')
  @SerializeOptions({ type: BankingInfoResponseDto })
  getBanking(@Param('id') id: string) {
    return this.carriersService.getBanking(id);
  }
  
  // Driver list - no SSN
  @Get(':id/drivers')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER')
  @SerializeOptions({ type: DriverResponseDto })
  getDrivers(@Param('id') id: string) {
    return this.driversService.findByCarrier(id);
  }
}
```

### 4. Integration Hub Response DTOs

```typescript
// apps/api/src/modules/integration-hub/dto/integration-response.dto.ts

import { Exclude, Expose, Transform } from 'class-transformer';

export class IntegrationResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  name: string;
  
  @Expose()
  provider: string;
  
  @Expose()
  type: string;
  
  @Expose()
  status: string;
  
  @Expose()
  lastSyncAt: Date;
  
  // Credentials - always masked
  @Expose()
  @Transform(({ value }) => maskCredentials(value))
  credentials: Record<string, string>;
  
  @Exclude()
  rawCredentials: any; // Never expose
}

function maskCredentials(creds: Record<string, any>): Record<string, string> {
  if (!creds) return null;
  
  const sensitiveKeys = [
    'apiKey', 'apiSecret', 'password', 'token', 'secret',
    'accessToken', 'refreshToken', 'clientSecret', 'privateKey'
  ];
  
  const masked: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(creds)) {
    const isSensitive = sensitiveKeys.some(sk => 
      key.toLowerCase().includes(sk.toLowerCase())
    );
    
    if (isSensitive && typeof value === 'string') {
      masked[key] = value.length > 4 ? '••••••••' + value.slice(-4) : '••••••••';
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

export class WebhookResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  name: string;
  
  @Expose()
  url: string;
  
  @Expose()
  events: string[];
  
  @Expose()
  isActive: boolean;
  
  // Secret - NEVER expose after creation
  @Exclude()
  secret: string;
  
  // Indicator that secret exists
  @Expose()
  hasSecret: boolean;
}
```

### 5. Document Response DTO with Signed URL Expiry

```typescript
// apps/api/src/modules/documents/dto/document-response.dto.ts

import { Expose, Transform, Exclude } from 'class-transformer';

export class DocumentResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  name: string;
  
  @Expose()
  type: string;
  
  @Expose()
  mimeType: string;
  
  @Expose()
  size: number;
  
  @Expose()
  uploadedAt: Date;
  
  @Expose()
  uploadedBy: string;
  
  // Storage path - internal only
  @Exclude()
  storagePath: string;
  
  // Generate short-lived signed URL on demand
  @Expose()
  @Transform(({ obj }) => null) // Don't include in list
  downloadUrl: string;
}

// For download endpoint - includes URL
export class DocumentDownloadDto {
  @Expose()
  id: string;
  
  @Expose()
  name: string;
  
  // Short-lived URL (15 minutes)
  @Expose()
  downloadUrl: string;
  
  @Expose()
  expiresAt: Date;
}
```

### 6. Document Service with Short-Lived URLs

```typescript
// apps/api/src/modules/documents/documents.service.ts

@Injectable()
export class DocumentsService {
  
  async getDownloadUrl(id: string): Promise<DocumentDownloadDto> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    
    // Generate signed URL with 15-minute expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    const signedUrl = await this.storageService.getSignedUrl(
      document.storagePath,
      { expiresIn: 15 * 60 } // 15 minutes in seconds
    );
    
    return {
      id: document.id,
      name: document.name,
      downloadUrl: signedUrl,
      expiresAt,
    };
  }
}
```

---

## Global Serialization Setup

Enable serialization globally in main.ts:

```typescript
// apps/api/src/main.ts

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global serialization
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true, // Only include @Expose() fields
    }),
  );
  
  // ... rest of setup
}
```

---

## Special Cases

### Full SSN Access for Authorized Users

Create a separate endpoint for full SSN when legally needed:

```typescript
// drivers.controller.ts

@Get(':id/sensitive')
@Roles('ADMIN', 'COMPLIANCE') // Very restricted
async getDriverSensitive(
  @Param('id') id: string,
  @CurrentUser() user,
) {
  // Audit log this access
  await this.auditService.log({
    userId: user.id,
    action: 'VIEW_SENSITIVE_DATA',
    entityType: 'DRIVER',
    entityId: id,
    details: { fields: ['ssn'] },
  });
  
  return this.driversService.findOneWithSensitive(id);
}
```

### Banking Info for Payments

Accounting needs actual account numbers for payments:

```typescript
// Internal service only - never exposed via API
@Injectable()
export class PaymentProcessingService {
  
  async processCarrierPayment(carrierId: string, amount: number) {
    // Get unmasked banking info internally
    const carrier = await this.prisma.carrier.findUnique({
      where: { id: carrierId },
      select: {
        bankingInfo: true, // Full info for internal processing
      },
    });
    
    // Process payment with full account details
    await this.achService.initiateTransfer({
      accountNumber: carrier.bankingInfo.accountNumber,
      routingNumber: carrier.bankingInfo.routingNumber,
      amount,
    });
  }
}
```

---

## Verification

```bash
# Verify SSN is masked
curl -H "Authorization: Bearer $DISPATCHER_TOKEN" \
  http://localhost:3001/api/v1/carriers/123/drivers
# Should show ssnMasked: "•••-••-1234", no ssn field

# Verify banking is masked
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3001/api/v1/carriers/123
# Should show accountNumber: "••••1234"

# Verify integration credentials masked
curl -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:3001/api/v1/integrations
# Should show apiKey: "••••••••abcd"

# Verify webhook secret not returned
curl -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:3001/api/v1/webhooks/456
# Should NOT have secret field, only hasSecret: true
```

---

## Files to Create/Modify

### New DTO Files
- [ ] `apps/api/src/modules/carrier/dto/carrier-response.dto.ts`
- [ ] `apps/api/src/modules/carrier/dto/driver-response.dto.ts`
- [ ] `apps/api/src/modules/carrier/dto/banking-info-response.dto.ts`
- [ ] `apps/api/src/modules/integration-hub/dto/integration-response.dto.ts`
- [ ] `apps/api/src/modules/integration-hub/dto/webhook-response.dto.ts`
- [ ] `apps/api/src/modules/documents/dto/document-response.dto.ts`
- [ ] `apps/api/src/modules/edi/dto/trading-partner-response.dto.ts`

### Controller Updates
- [ ] `apps/api/src/modules/carrier/carriers.controller.ts`
- [ ] `apps/api/src/modules/carrier/drivers.controller.ts`
- [ ] `apps/api/src/modules/integration-hub/integrations.controller.ts`
- [ ] `apps/api/src/modules/integration-hub/webhooks.controller.ts`
- [ ] `apps/api/src/modules/documents/documents.controller.ts`
- [ ] `apps/api/src/modules/edi/trading-partners.controller.ts`

### Main App Update
- [ ] `apps/api/src/main.ts` - Enable global serialization

---

## Success Criteria

- [ ] SSN never appears in any API response (only ssnMasked)
- [ ] Bank account numbers show only last 4 digits
- [ ] API keys/secrets show only last 4 characters
- [ ] Webhook secrets never returned after creation
- [ ] Document URLs are short-lived (15 min max)
- [ ] Sensitive data access is audit logged
- [ ] E2E tests verify no sensitive data leaks
