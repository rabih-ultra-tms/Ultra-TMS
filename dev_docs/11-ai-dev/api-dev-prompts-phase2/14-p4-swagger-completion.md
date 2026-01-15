# Prompt 14: Swagger Documentation Completion

> **Priority:** P4 - Enhancement  
> **Estimated Time:** 6-8 hours  
> **Target:** Swagger Documentation 60% → 100%  
> **Prerequisites:** Prompts 01-13 completed

---

## Objective

Complete comprehensive Swagger/OpenAPI documentation for all API endpoints, ensuring 100% coverage with proper schemas, examples, and error responses.

---

## Current State Analysis

### What Exists (60%)
- Basic Swagger setup at `/api/docs`
- Standard API response decorator helpers
- Partial documentation on key controllers
- Basic DTO decorators on some models

### What's Missing (40%)
- Complete DTO property decorations
- Response examples for all endpoints
- Error response documentation
- Query parameter descriptions
- Authentication/authorization documentation
- Complex object schema definitions

---

## Implementation Tasks

### Task 1: Complete DTO Documentation

Add `@ApiProperty()` decorators to ALL DTOs in each module:

```typescript
// Example: Complete DTO documentation
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoadDto {
  @ApiProperty({
    description: 'Customer ID for the load',
    example: 'cust_12345',
  })
  customerId: string;

  @ApiProperty({
    description: 'Origin location details',
    type: () => LocationDto,
  })
  origin: LocationDto;

  @ApiPropertyOptional({
    description: 'Special instructions for the driver',
    example: 'Call before arrival',
    maxLength: 500,
  })
  instructions?: string;

  @ApiProperty({
    description: 'Load weight in pounds',
    minimum: 0,
    maximum: 80000,
    example: 42000,
  })
  weight: number;

  @ApiProperty({
    description: 'Load status',
    enum: LoadStatus,
    enumName: 'LoadStatus',
    example: LoadStatus.PENDING,
  })
  status: LoadStatus;
}
```

### Task 2: Document Controller Endpoints

Apply comprehensive decorators to each controller method:

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Loads')
@ApiBearerAuth()
@Controller('loads')
export class LoadsController {
  @Get()
  @ApiOperation({
    summary: 'List all loads',
    description: 'Retrieve a paginated list of loads with optional filtering',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: LoadStatus })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of loads',
    schema: {
      example: {
        success: true,
        data: [{ id: 'load_123', status: 'PENDING' }],
        meta: { page: 1, limit: 20, total: 150, totalPages: 8 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll(@Query() query: LoadQueryDto) {
    // ...
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get load by ID' })
  @ApiParam({ name: 'id', description: 'Load ID', example: 'load_123' })
  @ApiResponse({ status: 200, description: 'Load details', type: LoadResponseDto })
  @ApiResponse({ status: 404, description: 'Load not found' })
  async findOne(@Param('id') id: string) {
    // ...
  }

  @Post()
  @ApiOperation({ summary: 'Create a new load' })
  @ApiBody({ type: CreateLoadDto })
  @ApiResponse({ status: 201, description: 'Load created successfully', type: LoadResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateLoadDto) {
    // ...
  }
}
```

### Task 3: Modules to Document

Complete documentation for each module in priority order:

#### High Priority (Core Business)
1. **TMS Core** (`src/modules/tms/`)
   - loads, orders, stops, tracking controllers
   - All load-related DTOs
   
2. **Accounting** (`src/modules/accounting/`)
   - invoices, payments, settlements controllers
   - Financial DTOs with currency/decimal handling

3. **CRM** (`src/modules/crm/`)
   - customers, contacts, companies controllers
   - Customer relationship DTOs

4. **Carrier** (`src/modules/carrier/`)
   - carriers, drivers, equipment controllers
   - Carrier compliance DTOs

#### Medium Priority (Operations)
5. **Load Board** (`src/modules/load-board/`)
6. **Documents** (`src/modules/documents/`)
7. **Communication** (`src/modules/communication/`)
8. **Sales** (`src/modules/sales/`)

#### Lower Priority (Support)
9. **Audit** (`src/modules/audit/`)
10. **Config** (`src/modules/config/`)
11. **Auth** (`src/modules/auth/`)
12. **Search** (`src/modules/search/`)
13. **Cache** (`src/modules/cache/`)

### Task 4: Document Error Responses

Create standard error response schemas:

```typescript
// src/common/swagger/error-responses.ts
import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({
    example: [
      { field: 'email', message: 'Invalid email format' },
      { field: 'weight', message: 'Must be a positive number' },
    ],
  })
  errors: { field: string; message: string }[];
}

export class NotFoundErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Resource not found' })
  message: string;

  @ApiProperty({ example: 'RESOURCE_NOT_FOUND' })
  code: string;
}

export class UnauthorizedErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Invalid or expired token' })
  message: string;

  @ApiProperty({ example: 'UNAUTHORIZED' })
  code: string;
}

export class ForbiddenErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Insufficient permissions' })
  message: string;

  @ApiProperty({ example: 'FORBIDDEN' })
  code: string;

  @ApiProperty({ example: ['loads:write'] })
  requiredPermissions: string[];
}
```

### Task 5: Document Complex Types

Create proper schemas for nested/complex objects:

```typescript
// src/common/swagger/common-schemas.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 20, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 150, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 8, description: 'Total number of pages' })
  totalPages: number;
}

export class AddressSchema {
  @ApiProperty({ example: '123 Main St' })
  street: string;

  @ApiProperty({ example: 'Suite 100', required: false })
  street2?: string;

  @ApiProperty({ example: 'Chicago' })
  city: string;

  @ApiProperty({ example: 'IL' })
  state: string;

  @ApiProperty({ example: '60601' })
  zipCode: string;

  @ApiProperty({ example: 'US', default: 'US' })
  country: string;
}

export class GeoCoordinates {
  @ApiProperty({ example: 41.8781, description: 'Latitude' })
  lat: number;

  @ApiProperty({ example: -87.6298, description: 'Longitude' })
  lng: number;
}

export class MoneySchema {
  @ApiProperty({ example: 2500.00, description: 'Amount in decimal' })
  amount: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  currency: string;
}
```

### Task 6: Add Authentication Documentation

Document security schemes in main.ts:

```typescript
// src/main.ts - Swagger setup
const config = new DocumentBuilder()
  .setTitle('Ultra-TMS API')
  .setDescription(`
    # Ultra-TMS Transportation Management System API
    
    ## Authentication
    All endpoints except /auth/login require a valid JWT token.
    Include the token in the Authorization header: \`Bearer <token>\`
    
    ## Rate Limiting
    - Standard endpoints: 100 requests/minute
    - Login endpoint: 5 requests/minute
    
    ## Response Format
    All responses follow a standard format:
    \`\`\`json
    {
      "success": true|false,
      "data": {...} | [...],
      "message": "optional message",
      "meta": { "page": 1, "limit": 20, "total": 100 }
    }
    \`\`\`
  `)
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    },
    'JWT-auth',
  )
  .addTag('Auth', 'Authentication and authorization')
  .addTag('TMS', 'Transportation management - loads, orders, tracking')
  .addTag('CRM', 'Customer relationship management')
  .addTag('Accounting', 'Invoices, payments, settlements')
  .addTag('Carrier', 'Carrier and driver management')
  .addTag('Load Board', 'Load posting and matching')
  .addTag('Documents', 'Document management')
  .addTag('Communication', 'Notifications and messaging')
  .addTag('Config', 'System configuration')
  .addTag('Audit', 'Audit logging and compliance')
  .build();
```

---

## Verification Checklist

### Documentation Coverage
- [ ] All controllers have `@ApiTags()` decorator
- [ ] All endpoints have `@ApiOperation()` with summary
- [ ] All endpoints have `@ApiResponse()` for success and errors
- [ ] All `@Param()` have `@ApiParam()` documentation
- [ ] All `@Query()` have `@ApiQuery()` documentation
- [ ] All `@Body()` DTOs have complete `@ApiProperty()` decorators

### Quality Checks
- [ ] All examples are realistic and consistent
- [ ] Enum values are properly documented with `enumName`
- [ ] Nested objects use `type: () => NestedDto` syntax
- [ ] Optional fields marked with `@ApiPropertyOptional()`
- [ ] Array types properly documented with `isArray: true`

### Testing
- [ ] Swagger UI loads without errors at `/api/docs`
- [ ] All schemas render correctly
- [ ] "Try it out" works for all endpoints
- [ ] Authentication flow works in Swagger UI
- [ ] Response examples match actual responses

---

## Acceptance Criteria

1. **100% Endpoint Documentation**
   - Every controller method has Swagger decorators
   - Every DTO property has ApiProperty decorator

2. **Complete Response Documentation**
   - Success responses with examples
   - Error responses (400, 401, 403, 404, 500)
   - Pagination metadata documented

3. **Quality Documentation**
   - Realistic examples for all fields
   - Clear descriptions for complex fields
   - Properly documented enums and unions

4. **Functional Swagger UI**
   - All endpoints testable via "Try it out"
   - Authentication works correctly
   - Schemas render without errors

---

## Files to Modify

### DTOs (add @ApiProperty to all)
```
src/modules/tms/dto/*.dto.ts
src/modules/accounting/dto/*.dto.ts
src/modules/crm/dto/*.dto.ts
src/modules/carrier/dto/*.dto.ts
src/modules/load-board/dto/*.dto.ts
src/modules/documents/dto/*.dto.ts
src/modules/communication/dto/*.dto.ts
src/modules/sales/dto/*.dto.ts
src/modules/audit/dto/*.dto.ts
src/modules/config/dto/*.dto.ts
src/modules/auth/dto/*.dto.ts
```

### Controllers (add full Swagger decorators)
```
src/modules/*/controllers/*.controller.ts
```

### Common (create shared schemas)
```
src/common/swagger/error-responses.ts
src/common/swagger/common-schemas.ts
src/common/swagger/pagination.schema.ts
```

---

## Progress Tracker Update

After completing this prompt, update the README.md:

```markdown
| Metric | Before | Current | Target |
|--------|--------|---------|--------|
| Swagger Documentation | ~60% | 100% | 100% |
```

Add changelog entry:
```markdown
### YYYY-MM-DD - Prompt 14: Swagger Completion
**Completed by:** [Name]
**Time spent:** [X hours]

#### Changes
- Added complete @ApiProperty decorators to all DTOs
- Added full Swagger decorators to all controllers
- Created common error response schemas
- Added authentication documentation

#### Metrics Updated
- Swagger Documentation: 60% → 100%
```
