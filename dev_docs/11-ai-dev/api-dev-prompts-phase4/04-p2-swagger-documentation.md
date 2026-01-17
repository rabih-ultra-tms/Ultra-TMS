# P2: Swagger Documentation Enhancement

## Priority: P2 - MEDIUM (Parallel with frontend)
## Estimated Time: 3-4 days
## Dependencies: None (can start immediately)

---

## Overview

17 services need Swagger API documentation enhancement for frontend developers. This includes request/response schemas, examples, error responses, and authentication requirements.

---

## Current State

| Service | Swagger Status | Priority |
|---------|----------------|----------|
| Auth | Partial | HIGH |
| CRM | Missing | HIGH |
| Sales | Missing | HIGH |
| TMS Core | Partial | HIGH |
| Carrier | Partial | MEDIUM |
| Accounting | Missing | HIGH |
| Load Board | Partial | MEDIUM |
| Commission | Missing | MEDIUM |
| Claims | Missing | LOW |
| Documents | Missing | MEDIUM |
| Communication | Missing | LOW |
| Customer Portal | Partial | HIGH |
| Carrier Portal | Partial | HIGH |
| Contracts | Missing | LOW |
| Agents | Missing | LOW |
| Analytics | Missing | LOW |
| Integration Hub | Partial | MEDIUM |

---

## Standard Swagger Decorators

### Controller Level

```typescript
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiExtraModels 
} from '@nestjs/swagger';

@ApiTags('Companies')
@ApiBearerAuth()
@ApiExtraModels(CompanyResponseDto, CreateCompanyDto, UpdateCompanyDto)
@Controller('companies')
export class CompaniesController {}
```

### Endpoint Level

```typescript
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiOperation({ 
  summary: 'Get all companies',
  description: 'Returns a paginated list of companies for the current tenant'
})
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiQuery({ name: 'search', required: false, type: String })
@ApiQuery({ name: 'type', required: false, enum: CompanyType })
@ApiResponse({ 
  status: 200, 
  description: 'List of companies',
  type: PaginatedCompanyResponseDto,
})
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
@Get()
findAll(@Query() query: FindAllCompaniesDto) {}
```

---

## Task 1: CRM Service Documentation

### File: `apps/api/src/crm/companies/companies.controller.ts`

```typescript
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';

@ApiTags('Companies')
@ApiBearerAuth()
@ApiExtraModels(CompanyResponseDto, CreateCompanyDto, UpdateCompanyDto, PaginatedResponseDto)
@Controller('companies')
export class CompaniesController {
  
  @ApiOperation({ 
    summary: 'List all companies',
    description: 'Returns paginated list of companies. Supports filtering by type, status, and search.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, MC#, DOT#' })
  @ApiQuery({ name: 'type', required: false, enum: ['SHIPPER', 'CONSIGNEE', 'BOTH'], description: 'Company type filter' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'PENDING'], description: 'Status filter' })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated company list',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Acme Shipping',
            type: 'SHIPPER',
            email: 'contact@acme.com',
            status: 'ACTIVE',
            createdAt: '2024-01-15T10:00:00Z'
          }
        ],
        meta: { total: 100, page: 1, limit: 10, totalPages: 10 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Role not authorized' })
  @Get()
  findAll() {}

  @ApiOperation({ summary: 'Create company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Company created',
    type: CompanyResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['name must not be empty', 'email must be valid'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Company with email already exists' })
  @Post()
  create() {}

  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company details', type: CompanyResponseDto })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @Get(':id')
  findOne() {}

  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'id', type: String, description: 'Company UUID' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Company updated', type: CompanyResponseDto })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @Patch(':id')
  update() {}

  @ApiOperation({ summary: 'Delete company (soft delete)' })
  @ApiParam({ name: 'id', type: String, description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company deleted' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @Delete(':id')
  remove() {}
}
```

### DTO Documentation

```typescript
// create-company.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ 
    description: 'Company name',
    example: 'Acme Shipping LLC',
    minLength: 2,
    maxLength: 255 
  })
  name: string;

  @ApiProperty({ 
    description: 'Company type',
    enum: ['SHIPPER', 'CONSIGNEE', 'BOTH'],
    example: 'SHIPPER'
  })
  type: CompanyType;

  @ApiProperty({ 
    description: 'Primary contact email',
    example: 'contact@acme.com'
  })
  email: string;

  @ApiPropertyOptional({ 
    description: 'Company phone number',
    example: '+1-555-123-4567'
  })
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'MC Number (Motor Carrier)',
    example: 'MC-123456'
  })
  mcNumber?: string;

  @ApiPropertyOptional({ 
    description: 'DOT Number (Department of Transportation)',
    example: '1234567'
  })
  dotNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Billing address',
    type: () => AddressDto
  })
  billingAddress?: AddressDto;
}
```

---

## Task 2: Sales Service Documentation

### File: `apps/api/src/sales/quotes/quotes.controller.ts`

```typescript
@ApiTags('Quotes')
@ApiBearerAuth()
@Controller('quotes')
export class QuotesController {
  
  @ApiOperation({ 
    summary: 'Create a new quote',
    description: 'Creates a quote with automatic pricing calculation based on origin, destination, and equipment type'
  })
  @ApiBody({ type: CreateQuoteDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Quote created with calculated pricing',
    schema: {
      example: {
        id: 'uuid',
        quoteNumber: 'Q-2024-001234',
        customerId: 'uuid',
        origin: { city: 'Chicago', state: 'IL', zip: '60601' },
        destination: { city: 'New York', state: 'NY', zip: '10001' },
        equipmentType: 'DRY_VAN',
        amount: 2500.00,
        status: 'DRAFT',
        validUntil: '2024-02-15T00:00:00Z',
        createdAt: '2024-01-15T10:00:00Z'
      }
    }
  })
  @Post()
  create() {}

  @ApiOperation({ 
    summary: 'Update quote status',
    description: 'Updates quote status. SALES_MANAGER required for APPROVED status.'
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      properties: {
        status: { 
          type: 'string', 
          enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'],
          example: 'APPROVED'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'SALES_MANAGER required for approval' })
  @Patch(':id/status')
  updateStatus() {}

  @ApiOperation({ summary: 'Convert quote to load' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ 
    status: 201, 
    description: 'Load created from quote',
    schema: {
      example: {
        loadId: 'uuid',
        loadNumber: 'L-2024-001234',
        quoteId: 'uuid'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Quote must be APPROVED to convert' })
  @Post(':id/convert')
  convertToLoad() {}
}
```

---

## Task 3: Accounting Service Documentation

### File: `apps/api/src/accounting/invoices/invoices.controller.ts`

```typescript
@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  
  @ApiOperation({ 
    summary: 'List all invoices',
    description: 'Returns invoices with filtering by status, date range, and customer'
  })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'toDate', required: false, type: String, example: '2024-12-31' })
  @ApiResponse({ 
    status: 200,
    schema: {
      example: {
        data: [{
          id: 'uuid',
          invoiceNumber: 'INV-2024-001234',
          customerId: 'uuid',
          customerName: 'Acme Shipping',
          loadId: 'uuid',
          loadNumber: 'L-2024-001234',
          amount: 2500.00,
          status: 'SENT',
          dueDate: '2024-02-15',
          sentAt: '2024-01-20T10:00:00Z'
        }],
        meta: { total: 50, page: 1, limit: 10 }
      }
    }
  })
  @Get()
  findAll() {}

  @ApiOperation({ 
    summary: 'Create invoice from load',
    description: 'Generates invoice from delivered load with line items'
  })
  @ApiBody({
    schema: {
      properties: {
        loadId: { type: 'string', format: 'uuid' },
        dueDate: { type: 'string', format: 'date', example: '2024-02-15' },
        notes: { type: 'string', example: 'Payment terms: Net 30' }
      },
      required: ['loadId']
    }
  })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  @ApiResponse({ status: 400, description: 'Load must be DELIVERED status' })
  @Post()
  create() {}

  @ApiOperation({ summary: 'Send invoice to customer' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Invoice sent via email' })
  @Post(':id/send')
  send() {}

  @ApiOperation({ summary: 'Record payment' })
  @ApiBody({ type: RecordPaymentDto })
  @ApiResponse({ status: 201, description: 'Payment recorded' })
  @Post('payments')
  recordPayment() {}
}
```

---

## Task 4: Customer Portal Documentation

### File: `apps/api/src/customer-portal/customer-portal.controller.ts`

```typescript
@ApiTags('Customer Portal')
@ApiBearerAuth()
@ApiExtraModels(CustomerLoadDto, CustomerInvoiceDto)
@Controller('customer-portal')
export class CustomerPortalController {

  @ApiOperation({ 
    summary: 'Get my loads',
    description: 'Returns loads for the authenticated customer company (CompanyScopeGuard enforced)'
  })
  @ApiQuery({ name: 'status', required: false, enum: LoadStatus })
  @ApiResponse({ 
    status: 200,
    schema: {
      example: {
        data: [{
          id: 'uuid',
          loadNumber: 'L-2024-001234',
          origin: { city: 'Chicago', state: 'IL' },
          destination: { city: 'New York', state: 'NY' },
          status: 'IN_TRANSIT',
          pickupDate: '2024-01-20',
          estimatedDelivery: '2024-01-22',
          currentLocation: { lat: 41.8781, lng: -87.6298, city: 'Chicago' }
        }],
        meta: { total: 25, page: 1, limit: 10 }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Only CUSTOMER role can access portal' })
  @Get('loads')
  getMyLoads() {}

  @ApiOperation({ 
    summary: 'Track load',
    description: 'Real-time tracking for specific load. Validates load belongs to customer.'
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ 
    status: 200,
    schema: {
      example: {
        loadId: 'uuid',
        status: 'IN_TRANSIT',
        currentLocation: { lat: 41.8781, lng: -87.6298 },
        events: [
          { type: 'PICKUP', timestamp: '2024-01-20T08:00:00Z', location: 'Chicago, IL' },
          { type: 'CHECKPOINT', timestamp: '2024-01-20T14:00:00Z', location: 'Cleveland, OH' }
        ],
        estimatedArrival: '2024-01-22T10:00:00Z'
      }
    }
  })
  @Get('loads/:id/track')
  trackLoad() {}

  @ApiOperation({ summary: 'Get my invoices' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE'] })
  @ApiResponse({ status: 200, description: 'Customer invoices' })
  @Get('invoices')
  getMyInvoices() {}

  @ApiOperation({ summary: 'Submit new quote request' })
  @ApiBody({ type: CreateQuoteRequestDto })
  @ApiResponse({ status: 201, description: 'Quote request submitted' })
  @Post('quotes/request')
  requestQuote() {}
}
```

---

## Task 5: Carrier Portal Documentation

### File: `apps/api/src/carrier-portal/carrier-portal.controller.ts`

```typescript
@ApiTags('Carrier Portal')
@ApiBearerAuth()
@Controller('carrier-portal')
export class CarrierPortalController {

  @ApiOperation({ 
    summary: 'Get available loads',
    description: 'Returns load board postings available for bidding (CarrierScopeGuard enforced)'
  })
  @ApiQuery({ name: 'origin', required: false, type: String, example: 'Chicago, IL' })
  @ApiQuery({ name: 'destination', required: false, type: String })
  @ApiQuery({ name: 'radius', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'equipmentType', required: false, enum: EquipmentType })
  @ApiResponse({ 
    status: 200,
    schema: {
      example: {
        data: [{
          postingId: 'uuid',
          origin: { city: 'Chicago', state: 'IL', zip: '60601' },
          destination: { city: 'New York', state: 'NY', zip: '10001' },
          pickupDate: '2024-01-25',
          deliveryDate: '2024-01-27',
          equipmentType: 'DRY_VAN',
          weight: 40000,
          rate: 2500.00,
          distance: 789,
          ratePerMile: 3.17
        }]
      }
    }
  })
  @Get('available-loads')
  getAvailableLoads() {}

  @ApiOperation({ summary: 'Submit bid on posting' })
  @ApiParam({ name: 'postingId', type: String })
  @ApiBody({
    schema: {
      properties: {
        amount: { type: 'number', example: 2400.00 },
        notes: { type: 'string', example: 'Available same day' },
        driverInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            truckNumber: { type: 'string' }
          }
        }
      },
      required: ['amount']
    }
  })
  @ApiResponse({ status: 201, description: 'Bid submitted' })
  @Post('postings/:postingId/bid')
  submitBid() {}

  @ApiOperation({ summary: 'Get my assigned loads' })
  @ApiResponse({ status: 200, description: 'Carrier assigned loads' })
  @Get('my-loads')
  getMyLoads() {}

  @ApiOperation({ summary: 'Update load status' })
  @ApiParam({ name: 'loadId', type: String })
  @ApiBody({
    schema: {
      properties: {
        status: { type: 'string', enum: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'] },
        location: { 
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' }
          }
        },
        notes: { type: 'string' }
      },
      required: ['status']
    }
  })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @Patch('loads/:loadId/status')
  updateLoadStatus() {}
}
```

---

## Global Swagger Configuration

### File: `apps/api/src/main.ts`

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Ultra-TMS API')
    .setDescription(`
## Transportation Management System API

### Authentication
All endpoints require Bearer token authentication unless marked as public.

### Roles
- **ADMIN** - Full system access
- **SALES_MANAGER** - Sales operations + approvals
- **SALES_REP** - Quote creation, read-only
- **DISPATCHER** - Load management, carrier assignment
- **ACCOUNTING** - Invoice and payment management
- **CARRIER_MANAGER** - Carrier operations
- **DRIVER** - Mobile app, status updates
- **CUSTOMER** - Customer portal access

### Multi-Tenant Isolation
All data is isolated by tenant. Users can only access data within their tenant.

### Error Responses
Standard error response format:
\`\`\`json
{
  "statusCode": 400,
  "message": ["error message"],
  "error": "Bad Request"
}
\`\`\`
    `)
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication and user management')
    .addTag('Companies', 'Customer and shipper management')
    .addTag('Contacts', 'Company contacts')
    .addTag('Locations', 'Pickup and delivery locations')
    .addTag('Quotes', 'Sales quotes and pricing')
    .addTag('Loads', 'Load management and dispatch')
    .addTag('Carriers', 'Carrier management')
    .addTag('Invoices', 'Customer invoicing')
    .addTag('Payments', 'Payment processing')
    .addTag('Load Board', 'Load posting and bidding')
    .addTag('Customer Portal', 'Customer self-service')
    .addTag('Carrier Portal', 'Carrier self-service')
    .addTag('Documents', 'Document management')
    .addTag('Analytics', 'Reports and dashboards')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(3001);
}
```

---

## Completion Checklist

### High Priority (Required for Frontend)
- [ ] Auth service - login, register, token refresh
- [ ] CRM service - companies, contacts, locations
- [ ] Sales service - quotes, rate contracts
- [ ] TMS Core service - loads, shipments
- [ ] Accounting service - invoices, payments
- [ ] Customer Portal - all endpoints
- [ ] Carrier Portal - all endpoints

### Medium Priority
- [ ] Carrier service
- [ ] Load Board service
- [ ] Commission service
- [ ] Documents service
- [ ] Integration Hub service

### Low Priority (Can defer)
- [ ] Claims service
- [ ] Communication service
- [ ] Contracts service
- [ ] Agents service
- [ ] Analytics service

---

## Validation Steps

1. Start API server: `pnpm run dev`
2. Open Swagger UI: `http://localhost:3001/api/docs`
3. Verify all endpoints are documented
4. Test "Try it out" functionality
5. Export OpenAPI spec for frontend:
   ```bash
   curl http://localhost:3001/api/docs-json > openapi.json
   ```
