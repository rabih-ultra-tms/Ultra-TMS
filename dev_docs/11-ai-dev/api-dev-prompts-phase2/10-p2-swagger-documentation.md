# Prompt 10: Swagger Documentation

**Priority:** P2 (Medium)  
**Estimated Time:** 4-6 hours  
**Dependencies:** All P0 and P1 prompts completed  
**Current Coverage:** 0% → Target: 100%

---

## Objective

Implement comprehensive Swagger/OpenAPI documentation for all API endpoints, enabling frontend developers to explore, understand, and test the API directly from auto-generated documentation.

---

## Requirements

- Full OpenAPI 3.0 specification
- Interactive Swagger UI at `/api/docs`
- All endpoints documented with:
  - Request/response schemas
  - Example payloads
  - Error responses
  - Authentication requirements
- DTOs annotated with Swagger decorators
- Proper grouping by module/tag

---

## Files to Create

| File | Description |
|------|-------------|
| `apps/api/src/swagger.ts` | Swagger configuration |
| `apps/api/src/common/decorators/api-response.decorator.ts` | Response decorators |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/api/src/main.ts` | Add Swagger setup |
| All controllers | Add Swagger decorators |
| All DTOs | Add ApiProperty decorators |

---

## Implementation Steps

### Step 1: Install Swagger Dependencies

```bash
cd apps/api
pnpm add @nestjs/swagger swagger-ui-express
```

### Step 2: Create Swagger Configuration

**File: `apps/api/src/swagger.ts`**

```typescript
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Ultra TMS API')
    .setDescription(`
## Transportation Management System API

This API powers the Ultra TMS platform, providing comprehensive
transportation management capabilities including:

- **Authentication & Authorization** - JWT-based auth with RBAC
- **Customer Management** - Full CRM functionality
- **Order Management** - Order lifecycle handling
- **Load Management** - Dispatch and tracking
- **Carrier Management** - Carrier onboarding and compliance
- **Accounting** - Invoicing, payments, and reporting
- **Configuration** - System settings and preferences

### Authentication

All endpoints except \`/auth/login\` and \`/auth/register\` require a valid JWT token.
Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-token>
\`\`\`

### Multi-Tenancy

All operations are scoped to the tenant associated with the authenticated user.
The tenant context is automatically extracted from the JWT token.

### Response Format

All successful responses follow this format:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
\`\`\`

Paginated responses include:
\`\`\`json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
\`\`\`
    `)
    .setVersion(version || '1.0.0')
    .setContact(
      'Ultra TMS Support',
      'https://ultra-tms.com/support',
      'support@ultra-tms.com'
    )
    .addServer('http://localhost:3001', 'Development')
    .addServer('https://api.ultra-tms.com', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Users', 'User management')
    .addTag('Customers', 'Customer/CRM management')
    .addTag('Orders', 'Order management')
    .addTag('Loads', 'Load and dispatch management')
    .addTag('Carriers', 'Carrier management')
    .addTag('Tracking', 'Real-time tracking')
    .addTag('Accounting', 'Invoicing and payments')
    .addTag('Reports', 'Financial and operational reports')
    .addTag('Audit', 'Audit logs and compliance')
    .addTag('Config', 'System configuration')
    .addTag('Documents', 'Document management')
    .addTag('Search', 'Full-text search')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 2em; }
    `,
    customSiteTitle: 'Ultra TMS API Documentation',
  });

  // Also expose OpenAPI JSON
  app.getHttpAdapter().get('/api/docs/json', (req, res) => {
    res.json(document);
  });
}
```

### Step 3: Update Main Bootstrap

**File: `apps/api/src/main.ts`** - Add:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger documentation
  setupSwagger(app);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
  
  console.log(`Application running on: ${await app.getUrl()}`);
  console.log(`Swagger docs: ${await app.getUrl()}/api/docs`);
}
bootstrap();
```

### Step 4: Create Standard Response Decorators

**File: `apps/api/src/common/decorators/api-response.decorator.ts`**

```typescript
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  getSchemaPath,
} from '@nestjs/swagger';

// Standard response wrapper
export class ApiResponseDto<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export class ErrorResponseDto {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Decorator for standard OK response
export function ApiStandardResponse<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Successful response',
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: { $ref: getSchemaPath(model) },
              message: { type: 'string', example: 'Operation successful' },
            },
          },
        ],
      },
    }),
  );
}

// Decorator for paginated response
export function ApiPaginatedResponse<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Paginated response',
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 20 },
                  total: { type: 'number', example: 100 },
                  totalPages: { type: 'number', example: 5 },
                },
              },
            },
          },
        ],
      },
    }),
  );
}

// Decorator for created response
export function ApiCreatedStandardResponse<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      description: 'Resource created successfully',
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: { $ref: getSchemaPath(model) },
              message: { type: 'string', example: 'Created successfully' },
            },
          },
        ],
      },
    }),
  );
}

// Common error responses decorator
export function ApiCommonErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Validation error',
      schema: {
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Validation failed' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'must be a valid email' },
                  },
                },
              },
            },
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
      schema: {
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'UNAUTHORIZED' },
              message: { type: 'string', example: 'Invalid or expired token' },
            },
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Insufficient permissions',
      schema: {
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'FORBIDDEN' },
              message: { type: 'string', example: 'You do not have permission to perform this action' },
            },
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Resource not found',
      schema: {
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'NOT_FOUND' },
              message: { type: 'string', example: 'Resource not found' },
            },
          },
        },
      },
    }),
  );
}
```

### Step 5: Annotate DTOs with Swagger Decorators

**Example: `apps/api/src/modules/customers/dto/create-customer.dto.ts`**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Legal name of the customer company',
    example: 'Acme Corporation',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Primary contact email address',
    example: 'contact@acme.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Primary phone number',
    example: '555-123-4567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer status',
    enum: CustomerStatus,
    default: CustomerStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({
    description: 'Credit limit in USD',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({
    description: 'Payment terms in days',
    example: 30,
    minimum: 0,
    maximum: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  paymentTerms?: number;
}
```

**Example Response DTO: `apps/api/src/modules/customers/dto/customer.dto.ts`**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Customer name',
    example: 'Acme Corporation',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'contact@acme.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Customer phone',
    example: '555-123-4567',
  })
  phone?: string;

  @ApiProperty({
    description: 'Customer status',
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    example: 'ACTIVE',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Account number',
    example: 'CUST-000001',
  })
  accountNumber?: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}
```

### Step 6: Annotate Controllers

**Example: `apps/api/src/modules/customers/customers.controller.ts`**

```typescript
import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { 
  ApiStandardResponse, 
  ApiPaginatedResponse, 
  ApiCreatedStandardResponse,
  ApiCommonErrors 
} from '../../common/decorators/api-response.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerDto, CustomerQueryDto } from './dto';
import { ok, paginated, created } from '../../common/helpers/response.helper';

@ApiTags('Customers')
@ApiBearerAuth('JWT-auth')
@ApiCommonErrors()
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('ADMIN', 'SALES_REP')
  @ApiOperation({
    summary: 'Create a new customer',
    description: 'Creates a new customer record in the system. Requires ADMIN or SALES_REP role.',
  })
  @ApiCreatedStandardResponse(CustomerDto)
  async create(
    @Body() dto: CreateCustomerDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    const customer = await this.customersService.create(tenantId, user.id, dto);
    return created(customer, 'Customer created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'List customers',
    description: 'Returns a paginated list of customers with optional filtering.',
  })
  @ApiPaginatedResponse(CustomerDto)
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or account number' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'PENDING'], description: 'Filter by status' })
  async findAll(
    @Query() query: CustomerQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    const result = await this.customersService.findAll(tenantId, query);
    return paginated(result.data, result.total, query.page || 1, query.limit || 20);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Returns detailed information about a specific customer.',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiStandardResponse(CustomerDto)
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const customer = await this.customersService.findOne(tenantId, id);
    return ok(customer);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_REP')
  @ApiOperation({
    summary: 'Update customer',
    description: 'Updates an existing customer record.',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiStandardResponse(CustomerDto)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentTenant() tenantId: string,
  ) {
    const customer = await this.customersService.update(tenantId, id, dto);
    return ok(customer, 'Customer updated successfully');
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Delete customer',
    description: 'Soft deletes a customer record. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiStandardResponse(CustomerDto)
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.customersService.remove(tenantId, id);
    return ok(null, 'Customer deleted successfully');
  }
}
```

### Step 7: Document All Controllers

Apply similar Swagger decorators to all controllers. Here's a checklist:

| Controller | Decorators Needed |
|------------|-------------------|
| AuthController | ✅ @ApiTags, @ApiOperation, @ApiBody |
| UsersController | @ApiTags, @ApiBearerAuth, responses |
| CustomersController | @ApiTags, @ApiBearerAuth, responses |
| OrdersController | @ApiTags, @ApiBearerAuth, responses |
| LoadsController | @ApiTags, @ApiBearerAuth, responses |
| CarriersController | @ApiTags, @ApiBearerAuth, responses |
| InvoicesController | @ApiTags, @ApiBearerAuth, responses |
| PaymentsController | @ApiTags, @ApiBearerAuth, responses |
| ReportsController | @ApiTags, @ApiBearerAuth, responses |
| AuditController | @ApiTags, @ApiBearerAuth, responses |
| ConfigController | @ApiTags, @ApiBearerAuth, responses |
| TrackingController | @ApiTags, @ApiBearerAuth, responses |
| DocumentsController | @ApiTags, @ApiBearerAuth, responses |
| SearchController | @ApiTags, @ApiBearerAuth, responses |

### Step 8: Script to Add Decorators

For efficiency, here's a pattern to follow for each DTO:

```typescript
// Before (plain class)
export class MyDto {
  id: string;
  name: string;
  status?: string;
}

// After (with Swagger)
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MyDto {
  @ApiProperty({ description: 'Unique identifier', example: 'uuid-here' })
  id: string;

  @ApiProperty({ description: 'Name of the entity', example: 'Sample Name' })
  name: string;

  @ApiPropertyOptional({ description: 'Current status', enum: ['ACTIVE', 'INACTIVE'] })
  status?: string;
}
```

---

## Verification

After implementation:

1. Start the API server: `pnpm --filter api dev`
2. Navigate to `http://localhost:3001/api/docs`
3. Verify:
   - All endpoints are listed
   - Schemas are documented
   - Authentication works (try "Authorize" button)
   - Examples are shown
   - Request/response bodies are correct

---

## Acceptance Criteria

- [ ] Swagger UI accessible at `/api/docs`
- [ ] OpenAPI JSON available at `/api/docs/json`
- [ ] All controllers have @ApiTags decorator
- [ ] All endpoints have @ApiOperation decorator
- [ ] All DTOs have @ApiProperty decorators
- [ ] Authentication documented and testable
- [ ] Response schemas match actual responses
- [ ] Error responses documented
- [ ] Examples provided for complex payloads
- [ ] API versioning reflected in docs

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 10 row in the status table:
```markdown
| 10 | [Swagger Documentation](...) | P2 | 4-6h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| Swagger Documentation | 0% | 100% | 100% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 10: Swagger Documentation
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Swagger UI available at /api/docs
- OpenAPI 3.0 specification generated
- All controllers and DTOs documented
- Interactive testing enabled
- Response schemas standardized

#### Metrics Updated
- Swagger Documentation: 0% → 100%
```

---

## Final Metrics After All Prompts

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Endpoint Coverage | 84.3% | 95%+ | 95% |
| E2E Test Coverage | 38.7% | 100% | 100% |
| Swagger Docs | 0% | 100% | 100% |
| RBAC Implementation | 0% | 100% | 100% |
| Response Consistency | ~60% | 100% | 100% |

**Phase A completion: API is now 95% frontend-ready!**
