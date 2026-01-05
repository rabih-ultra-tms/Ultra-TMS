# 62 - API Design Standards

**NestJS REST API patterns for the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Before Building ANY API Endpoint

1. Check the Screen-API Contract Registry (doc 72) for the contract
2. If no contract exists, define it FIRST
3. Follow the response format EXACTLY as specified below
4. Add authentication and authorization guards
5. Validate all input with DTOs

---

## Response Format Standard

### CRITICAL: Use ONE Format Everywhere

Every API endpoint in this project MUST return data in this exact format:

```typescript
// For single items
{
  "data": { ... },
  "message": "Optional success message"
}

// For lists/collections with pagination
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// For errors
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": { ... }
}
```

### Response Helper Implementation

Create and use these helpers in `apps/api/src/common/helpers/response.helper.ts`:

```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// Helper functions
export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { data, ...(message && { message }) };
}

export function paginated<T>(
  data: T[],
  total: number,
  page = 1,
  limit = 20
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function errorResponse(
  error: string,
  code: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return { error, code, ...(details && { details }) };
}
```

---

## Endpoint Naming Conventions

### URL Structure

```
/api/v1/{resource}/{id?}/{sub-resource?}
```

### Examples

```
GET    /api/v1/carriers                    # List all carriers
GET    /api/v1/carriers/123                # Get carrier 123
POST   /api/v1/carriers                    # Create carrier
PUT    /api/v1/carriers/123                # Full update carrier 123
PATCH  /api/v1/carriers/123                # Partial update carrier 123
DELETE /api/v1/carriers/123                # Delete carrier 123

# Sub-resources
GET    /api/v1/carriers/123/equipment      # Get equipment for carrier
POST   /api/v1/carriers/123/equipment      # Add equipment to carrier

# Actions (when REST doesn't fit)
POST   /api/v1/carriers/123/activate       # Activate carrier
POST   /api/v1/carriers/123/deactivate     # Deactivate carrier
POST   /api/v1/loads/123/dispatch          # Dispatch load
```

### Naming Rules

| Rule                       | Good                   | Bad                           |
| -------------------------- | ---------------------- | ----------------------------- |
| Use plural nouns           | `/carriers`, `/loads`  | `/carrier`, `/load`           |
| Use lowercase              | `/carriers`            | `/Carriers`                   |
| Use hyphens for multi-word | `/load-boards`         | `/loadBoards`, `/load_boards` |
| No verbs in URL            | `DELETE /carriers/123` | `/deleteCarrier/123`          |
| Version in URL             | `/api/v1/carriers`     | `/api/carriers`               |

---

## HTTP Methods & Status Codes

### Method Usage

| Method | Purpose        | Request Body | Success Response                       |
| ------ | -------------- | ------------ | -------------------------------------- |
| GET    | Read data      | No           | 200 with data                          |
| POST   | Create new     | Yes          | 201 with created data                  |
| PUT    | Full update    | Yes          | 200 with updated data                  |
| PATCH  | Partial update | Yes          | 200 with updated data                  |
| DELETE | Remove         | No           | 200 with `{ data: { deleted: true } }` |

### Status Codes

```typescript
// Success
200 OK              // General success
201 Created         // Resource created
204 No Content      // Success, no body

// Client Errors
400 Bad Request     // Invalid input
401 Unauthorized    // Not authenticated
403 Forbidden       // Authenticated but not authorized
404 Not Found       // Resource doesn't exist
409 Conflict        // Duplicate, constraint violation
422 Unprocessable   // Validation failed

// Server Errors
500 Internal Error  // Unexpected server error
503 Service Unavailable
```

---

## NestJS Controller Pattern

### Complete Controller Template

```typescript
// apps/api/src/modules/carrier/carrier.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CarrierService } from './carrier.service';
import { CreateCarrierDto, UpdateCarrierDto, CarrierQueryDto } from './dto';
import { ok, paginated } from '@/common/helpers/response.helper';

@ApiTags('Carriers')
@ApiBearerAuth()
@Controller('api/v1/carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  // GET /api/v1/carriers - List with pagination
  @Get()
  @Roles('ADMIN', 'DISPATCH', 'OPERATIONS')
  @ApiOperation({ summary: 'Get all carriers' })
  @ApiResponse({ status: 200, description: 'Carriers retrieved successfully' })
  async findAll(@Query() query: CarrierQueryDto, @CurrentUser() user: User) {
    const { data, total } = await this.carrierService.findAll(
      query,
      user.tenantId
    );
    return paginated(data, total, query.page, query.limit);
  }

  // GET /api/v1/carriers/:id - Get single
  @Get(':id')
  @Roles('ADMIN', 'DISPATCH', 'OPERATIONS')
  @ApiOperation({ summary: 'Get carrier by ID' })
  @ApiResponse({ status: 200, description: 'Carrier retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Carrier not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const carrier = await this.carrierService.findOne(id, user.tenantId);
    return ok(carrier);
  }

  // POST /api/v1/carriers - Create
  @Post()
  @Roles('ADMIN', 'DISPATCH')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new carrier' })
  @ApiResponse({ status: 201, description: 'Carrier created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Carrier already exists' })
  async create(@Body() dto: CreateCarrierDto, @CurrentUser() user: User) {
    const carrier = await this.carrierService.create(
      dto,
      user.tenantId,
      user.id
    );
    return ok(carrier, 'Carrier created successfully');
  }

  // PUT /api/v1/carriers/:id - Full update
  @Put(':id')
  @Roles('ADMIN', 'DISPATCH')
  @ApiOperation({ summary: 'Update carrier (full)' })
  @ApiResponse({ status: 200, description: 'Carrier updated successfully' })
  @ApiResponse({ status: 404, description: 'Carrier not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCarrierDto,
    @CurrentUser() user: User
  ) {
    const carrier = await this.carrierService.update(id, dto, user.tenantId);
    return ok(carrier, 'Carrier updated successfully');
  }

  // PATCH /api/v1/carriers/:id - Partial update
  @Patch(':id')
  @Roles('ADMIN', 'DISPATCH')
  @ApiOperation({ summary: 'Update carrier (partial)' })
  async partialUpdate(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateCarrierDto>,
    @CurrentUser() user: User
  ) {
    const carrier = await this.carrierService.update(id, dto, user.tenantId);
    return ok(carrier);
  }

  // DELETE /api/v1/carriers/:id
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete carrier' })
  @ApiResponse({ status: 200, description: 'Carrier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Carrier not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.carrierService.remove(id, user.tenantId);
    return ok({ deleted: true }, 'Carrier deleted successfully');
  }

  // POST /api/v1/carriers/:id/activate - Action endpoint
  @Post(':id/activate')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Activate carrier' })
  async activate(@Param('id') id: string, @CurrentUser() user: User) {
    const carrier = await this.carrierService.updateStatus(
      id,
      'ACTIVE',
      user.tenantId
    );
    return ok(carrier, 'Carrier activated successfully');
  }
}
```

---

## DTO (Data Transfer Object) Patterns

### Create DTO

```typescript
// apps/api/src/modules/carrier/dto/create-carrier.dto.ts

import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarrierStatus, CarrierType } from '@prisma/client';

class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street1: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  street2?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zipCode: string;
}

export class CreateCarrierDto {
  @ApiProperty({ description: 'Carrier company name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'MC Number' })
  @IsString()
  @IsNotEmpty()
  mcNumber: string;

  @ApiProperty({ description: 'DOT Number' })
  @IsString()
  @IsNotEmpty()
  dotNumber: string;

  @ApiPropertyOptional({ enum: CarrierType })
  @IsEnum(CarrierType)
  @IsOptional()
  type?: CarrierType;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;
}
```

### Query/Filter DTO

```typescript
// apps/api/src/modules/carrier/dto/carrier-query.dto.ts

import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CarrierStatus } from '@prisma/client';

export class CarrierQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: CarrierStatus })
  @IsEnum(CarrierStatus)
  @IsOptional()
  status?: CarrierStatus;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

---

## Service Pattern

### Complete Service Template

```typescript
// apps/api/src/modules/carrier/carrier.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCarrierDto, UpdateCarrierDto, CarrierQueryDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CarrierService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CarrierQueryDto, tenantId: string) {
    const { page = 1, limit = 20, search, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CarrierWhereInput = {
      tenantId,
      deletedAt: null, // Soft delete filter
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { mcNumber: { contains: search, mode: 'insensitive' } },
          { dotNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.carrier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          address: true,
          _count: {
            select: { loads: true },
          },
        },
      }),
      this.prisma.carrier.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string, tenantId: string) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        address: true,
        contacts: true,
        equipment: true,
        insurance: true,
        loads: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    return carrier;
  }

  async create(dto: CreateCarrierDto, tenantId: string, userId: string) {
    // Check for duplicate MC number
    const existing = await this.prisma.carrier.findFirst({
      where: { mcNumber: dto.mcNumber, tenantId, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Carrier with this MC number already exists');
    }

    return this.prisma.carrier.create({
      data: {
        ...dto,
        tenantId,
        createdById: userId,
        address: dto.address ? { create: dto.address } : undefined,
      },
      include: { address: true },
    });
  }

  async update(id: string, dto: UpdateCarrierDto, tenantId: string) {
    await this.findOne(id, tenantId); // Verify exists

    return this.prisma.carrier.update({
      where: { id },
      data: {
        ...dto,
        address: dto.address ? { update: dto.address } : undefined,
      },
      include: { address: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // Verify exists

    // Soft delete
    return this.prisma.carrier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateStatus(id: string, status: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.carrier.update({
      where: { id },
      data: { status },
      include: { address: true },
    });
  }
}
```

---

## Error Handling

### Global Exception Filter

```typescript
// apps/api/src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        error = (res.message as string) || exception.message;
        code = (res.code as string) || this.getCodeFromStatus(status);
        details = res.details as Record<string, unknown>;
      } else {
        error = exceptionResponse;
      }
    }

    // Log server errors
    if (status >= 500) {
      this.logger.error(exception);
    }

    response.status(status).json({
      error,
      code,
      ...(details && { details }),
    });
  }

  private getCodeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      500: 'INTERNAL_ERROR',
    };
    return codes[status] || 'ERROR';
  }
}
```

### Custom Exceptions

```typescript
// apps/api/src/common/exceptions/business.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: string,
    details?: Record<string, unknown>
  ) {
    super({ message, code, details }, HttpStatus.BAD_REQUEST);
  }
}

// Usage
throw new BusinessException(
  'Cannot delete carrier with active loads',
  'CARRIER_HAS_ACTIVE_LOADS',
  { activeLoadCount: 5 }
);
```

---

## Authentication & Authorization

### Every Endpoint MUST Have Auth

```typescript
// âŒ WRONG - No auth
@Get()
async findAll() {
  return this.service.findAll();
}

// âœ… CORRECT - Auth guards
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'DISPATCH')
async findAll(@CurrentUser() user: User) {
  return this.service.findAll(user.tenantId);
}
```

### Role Decorator

```typescript
// apps/api/src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### Roles Guard

```typescript
// apps/api/src/common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

---

## API Checklist

### Before Shipping ANY Endpoint

- [ ] Uses standard response format (`{ data }` or `{ data, pagination }`)
- [ ] Has `@UseGuards(JwtAuthGuard, RolesGuard)`
- [ ] Has `@Roles()` with appropriate roles
- [ ] Validates input with DTO and class-validator
- [ ] Has try/catch or global exception filter
- [ ] Returns proper status codes
- [ ] Doesn't expose sensitive data (passwords, tokens)
- [ ] Handles not found cases (404)
- [ ] Handles duplicate/conflict cases (409)
- [ ] Supports pagination for list endpoints
- [ ] Filters by tenantId for multi-tenancy
- [ ] Excludes soft-deleted records
- [ ] Has Swagger documentation
- [ ] Has TypeScript types for request/response

---

## Common Mistakes to Avoid

### 1. Inconsistent Response Format

```typescript
// âŒ WRONG - Different formats
return NextResponse.json(carriers);                    // No wrapper
return NextResponse.json({ items: carriers });         // Wrong key
return NextResponse.json({ carriers });               // Wrong key

// âœ… CORRECT - Always use standard format
return { data: carriers, pagination: { ... } };
```

### 2. Missing Auth Check

```typescript
// âŒ WRONG - No auth
@Get()
async findAll() {
  return this.service.findAll();
}

// âœ… CORRECT
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async findAll(@CurrentUser() user: User) {
  return this.service.findAll(user.tenantId);
}
```

### 3. Not Filtering by Tenant

```typescript
// âŒ WRONG - Returns all tenants' data
async findAll() {
  return this.prisma.carrier.findMany();
}

// âœ… CORRECT - Filter by tenant
async findAll(tenantId: string) {
  return this.prisma.carrier.findMany({
    where: { tenantId, deletedAt: null },
  });
}
```

### 4. Missing Relations

```typescript
// âŒ WRONG - carrier.address will be undefined
const carrier = await this.prisma.carrier.findUnique({
  where: { id },
});

// âœ… CORRECT - Include needed relations
const carrier = await this.prisma.carrier.findUnique({
  where: { id },
  include: {
    address: true,
    contacts: true,
  },
});
```

---

## Navigation

- **Previous:** [Development Standards Overview](./61-development-standards-overview.md)
- **Next:** [Database Design Standards](./63-database-design-standards.md)
