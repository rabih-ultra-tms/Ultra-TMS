# P2-2: Swagger Documentation Enhancement

## Priority: P2 - MEDIUM
## Estimated Time: 8-12 hours
## Dependencies: RBAC implementation complete

---

## Context

Current Swagger documentation lacks:
- Role requirements per endpoint
- Response schema definitions
- Error response documentation
- Example payloads

Frontend developers need complete API documentation to work efficiently.

---

## Implementation

### 1. Global Swagger Setup Enhancement

```typescript
// apps/api/src/main.ts

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enhanced Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Ultra-TMS API')
    .setDescription(`
## Authentication
All endpoints require JWT authentication unless marked as public.
Include the token in the Authorization header: \`Bearer <token>\`

## Role-Based Access
Each endpoint documents the required roles. Access without proper roles returns 403 Forbidden.

## Common Error Responses
- **401** - Missing or invalid authentication token
- **403** - Insufficient role permissions
- **404** - Resource not found
- **422** - Validation error (see error details)
- **500** - Internal server error
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'JWT',
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('CRM', 'Customer relationship management')
    .addTag('Sales', 'Sales quotes and opportunities')
    .addTag('Carriers', 'Carrier management')
    .addTag('Load Board', 'Load and shipment management')
    .addTag('Customer Portal', 'Customer self-service portal')
    .addTag('Carrier Portal', 'Carrier self-service portal')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Ultra-TMS API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  
  await app.listen(3001);
}
```

### 2. Custom Decorators for RBAC Documentation

```typescript
// apps/api/src/common/decorators/api-roles.decorator.ts

import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';

export function ApiRoles(...roles: string[]) {
  const roleList = roles.join(', ');
  
  return applyDecorators(
    SetMetadata('roles', roles),
    ApiSecurity('JWT'),
    ApiOperation({
      description: `**Required Roles:** ${roleList}`,
    }),
    ApiForbiddenResponse({
      description: `Access denied. Required roles: ${roleList}`,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Forbidden resource' },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    }),
  );
}
```

### 3. Common Response DTOs

```typescript
// apps/api/src/common/dto/api-responses.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];
  
  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;
  
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;
  
  @ApiProperty({ example: 20, description: 'Items per page' })
  limit: number;
  
  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages: number;
  
  @ApiProperty({ example: true, description: 'Has more pages' })
  hasMore: boolean;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;
  
  @ApiProperty({ example: 'Bad Request' })
  error: string;
  
  @ApiProperty({ example: 'Validation failed' })
  message: string;
  
  @ApiProperty({
    example: [{ field: 'email', message: 'Invalid email format' }],
    description: 'Validation error details',
    required: false,
  })
  details?: { field: string; message: string }[];
}

export class SuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
  
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}
```

### 4. Example: CRM Controller Documentation

```typescript
// apps/api/src/modules/crm/companies.controller.ts

import { 
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery,
  ApiBearerAuth, ApiBody 
} from '@nestjs/swagger';
import { ApiRoles } from '../../common/decorators/api-roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { 
  CreateCompanyDto, UpdateCompanyDto, CompanyResponseDto,
  CompanyListResponseDto, FindCompaniesDto 
} from './dto';

@ApiTags('CRM')
@ApiBearerAuth('JWT')
@Controller('api/v1/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  
  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'ACCOUNTING')
  @ApiOperation({ 
    summary: 'List all companies',
    description: `
Retrieve a paginated list of companies with optional filtering.

**Required Roles:** ADMIN, SALES_MANAGER, SALES_REP, ACCOUNTING
    `,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['PROSPECT', 'ACTIVE', 'INACTIVE'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'List of companies',
    type: CompanyListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  findAll(@Query() query: FindCompaniesDto) {
    return this.companiesService.findAll(query);
  }
  
  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP', 'ACCOUNTING')
  @ApiOperation({ 
    summary: 'Get company by ID',
    description: '**Required Roles:** ADMIN, SALES_MANAGER, SALES_REP, ACCOUNTING',
  })
  @ApiParam({ name: 'id', type: String, description: 'Company UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Company details',
    type: CompanyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
  
  @Post()
  @Roles('ADMIN', 'SALES_MANAGER')
  @ApiOperation({ 
    summary: 'Create new company',
    description: '**Required Roles:** ADMIN, SALES_MANAGER',
  })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Company created successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 422 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Unprocessable Entity' },
      },
    },
  })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }
  
  @Patch(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES_REP')
  @ApiOperation({ 
    summary: 'Update company',
    description: '**Required Roles:** ADMIN, SALES_MANAGER, SALES_REP',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, type: CompanyResponseDto })
  @ApiResponse({ status: 404, description: 'Company not found' })
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }
  
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ 
    summary: 'Delete company',
    description: `
Soft delete a company. Only ADMIN can perform this operation.

**Required Roles:** ADMIN
    `,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
```

### 5. DTO Documentation

```typescript
// apps/api/src/modules/crm/dto/company.dto.ts

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ 
    example: 'Acme Corporation',
    description: 'Company legal name',
  })
  @IsString()
  name: string;
  
  @ApiPropertyOptional({ 
    example: 'ACME',
    description: 'Company short name or alias',
  })
  @IsString()
  @IsOptional()
  shortName?: string;
  
  @ApiProperty({ 
    enum: ['PROSPECT', 'ACTIVE', 'INACTIVE'],
    example: 'PROSPECT',
    description: 'Company status',
  })
  @IsEnum(['PROSPECT', 'ACTIVE', 'INACTIVE'])
  status: string;
  
  @ApiPropertyOptional({ 
    example: 'contact@acme.com',
    description: 'Primary contact email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
  
  @ApiPropertyOptional({ 
    example: '+1-555-123-4567',
    description: 'Primary phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;
  
  @ApiPropertyOptional({
    type: 'object',
    example: {
      street: '123 Main St',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'USA',
    },
    description: 'Company address',
  })
  @IsOptional()
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export class CompanyResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;
  
  @ApiProperty({ example: 'Acme Corporation' })
  name: string;
  
  @ApiProperty({ example: 'ACTIVE' })
  status: string;
  
  @ApiProperty({ example: 'contact@acme.com' })
  email: string;
  
  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
  
  @ApiProperty({ example: '2024-01-20T14:45:00Z' })
  updatedAt: Date;
}

export class CompanyListResponseDto {
  @ApiProperty({ type: [CompanyResponseDto] })
  data: CompanyResponseDto[];
  
  @ApiProperty({ example: 150 })
  total: number;
  
  @ApiProperty({ example: 1 })
  page: number;
  
  @ApiProperty({ example: 20 })
  limit: number;
}
```

### 6. Portal-Specific Documentation

```typescript
// apps/api/src/modules/customer-portal/customer-portal.controller.ts

@ApiTags('Customer Portal')
@ApiBearerAuth('JWT')
@Controller('api/v1/customer-portal')
@UseGuards(JwtAuthGuard, CustomerPortalGuard)
export class CustomerPortalController {
  
  @Get('loads')
  @ApiOperation({
    summary: 'Get customer loads',
    description: `
Returns loads belonging to the authenticated customer's company only.

**Access:** Customer Portal users only

**Data Isolation:** Results are automatically filtered to the customer's company.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Customer loads (filtered by company)',
  })
  getLoads(@Query() query: FindLoadsDto, @CurrentUser() user) {
    return this.loadService.findByCompany(user.companyId, query);
  }
}

// apps/api/src/modules/carrier-portal/carrier-portal.controller.ts

@ApiTags('Carrier Portal')
@ApiBearerAuth('JWT')
@Controller('api/v1/carrier-portal')
@UseGuards(JwtAuthGuard, CarrierPortalGuard)
export class CarrierPortalController {
  
  @Get('loads')
  @ApiOperation({
    summary: 'Get carrier loads',
    description: `
Returns loads assigned to the authenticated carrier only.

**Access:** Carrier Portal users only

**Data Isolation:** Results are automatically filtered to the carrier's assigned loads.
    `,
  })
  getLoads(@Query() query: FindLoadsDto, @CurrentUser() user) {
    return this.loadService.findByCarrier(user.carrierId, query);
  }
  
  @Patch('loads/:id/status')
  @ApiOperation({
    summary: 'Update load status',
    description: `
Update the status of a load assigned to the carrier.

**Allowed Status Transitions:**
- ASSIGNED → DISPATCHED
- DISPATCHED → IN_TRANSIT  
- IN_TRANSIT → DELIVERED

**Access:** Carrier Portal users only
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED'],
        },
        location: { type: 'string', example: 'Chicago, IL' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLoadStatusDto,
    @CurrentUser() user,
  ) {
    return this.loadService.updateStatusByCarrier(id, dto, user.carrierId);
  }
}
```

---

## Verification

After implementation, verify:

```bash
# Start API server
pnpm run start:dev

# Access Swagger UI
open http://localhost:3001/api/docs
```

Check that:
1. All endpoints show required roles
2. Request/response schemas are complete
3. Examples are provided
4. Error responses are documented
5. Portal endpoints explain data isolation

---

## Files to Modify

### Core Setup
- [ ] `apps/api/src/main.ts` - Enhanced Swagger config

### Common Utilities
- [ ] `apps/api/src/common/decorators/api-roles.decorator.ts` - CREATE
- [ ] `apps/api/src/common/dto/api-responses.dto.ts` - CREATE

### Controllers (add documentation decorators)
- [ ] All CRM controllers
- [ ] All Sales controllers
- [ ] All Carrier controllers
- [ ] All Load Board controllers
- [ ] All Commission controllers
- [ ] All Documents controllers
- [ ] All Communication controllers
- [ ] Customer Portal controller
- [ ] Carrier Portal controller
- [ ] Analytics controllers
- [ ] Integration Hub controllers

### DTOs (add ApiProperty decorators)
- [ ] All request DTOs
- [ ] All response DTOs

---

## Success Criteria

- [ ] Swagger UI accessible at /api/docs
- [ ] All endpoints document required roles
- [ ] Request schemas have examples
- [ ] Response schemas are complete
- [ ] Error responses are documented
- [ ] Portal data isolation is explained
- [ ] Frontend team can work from docs alone
