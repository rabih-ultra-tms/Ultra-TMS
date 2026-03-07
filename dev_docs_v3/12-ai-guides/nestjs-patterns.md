# NestJS Patterns

> AI Dev Guide | NestJS patterns used in Ultra TMS backend

---

## Project Structure

```
apps/api/src/
  main.ts                    # Bootstrap (guards, CORS, validation, Swagger)
  app.module.ts              # Root module
  modules/
    auth/                    # Auth module (JWT, sessions, MFA)
    admin/                   # Admin module (users, roles, permissions, tenants)
    crm/                     # CRM module (customers, contacts, leads)
    sales/                   # Sales module (quotes, rate tables, Load Planner)
    tms/                     # TMS module (orders, loads, stops, check calls)
      orders/
      loads/
      stops/
      checkcalls/
    carrier/                 # Carrier module (2,400 LOC)
    accounting/              # Accounting module (invoices, settlements, payments)
    commission/              # Commission module
    load-board/              # Load Board module (stubs)
    operations/              # Operations dashboard
    communication/           # Email (SendGrid) + SMS (Twilio)
    ...                      # 35 active + 5 .bak = 40 dirs
  prisma/
    prisma.service.ts        # PrismaClient wrapper
    prisma.module.ts         # Global module
  common/
    guards/                  # JwtAuthGuard, RolesGuard
    decorators/              # @Roles, @CurrentUser, @TenantId
    pipes/                   # Custom validation pipes
    filters/                 # Exception filters
    interceptors/            # Response transform, logging
```

## Module Pattern

```typescript
// carrier.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [CarrierController],
  providers: [CarrierService],
  exports: [CarrierService],  // Export for use by other modules
})
export class CarrierModule {}
```

## Controller Pattern

```typescript
@Controller('carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.DISPATCHER, RoleEnum.CARRIER_RELATIONS)
  async findAll(
    @TenantId() tenantId: string,
    @Query() params: ListCarriersDto,
  ) {
    return this.carrierService.findAll(tenantId, params);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.CARRIER_RELATIONS)
  async create(
    @TenantId() tenantId: string,
    @Body() dto: CreateCarrierDto,
  ) {
    return this.carrierService.create(tenantId, dto);
  }

  @Get(':id')
  async findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.carrierService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.CARRIER_RELATIONS)
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarrierDto,
  ) {
    return this.carrierService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  async remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.carrierService.softDelete(tenantId, id);
  }
}
```

## Service Pattern

```typescript
@Injectable()
export class CarrierService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: ListCarriersDto) {
    const { page = 1, limit = 10, search, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CarrierWhereInput = {
      tenantId,
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { mcNumber: { contains: search } },
          { dotNumber: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.carrier.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.carrier.count({ where }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async softDelete(tenantId: string, id: string) {
    // Verify tenant ownership
    const carrier = await this.prisma.carrier.findFirst({ where: { id, tenantId } });
    if (!carrier) throw new NotFoundException('Carrier not found');

    return this.prisma.carrier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

## DTO Pattern (class-validator)

```typescript
export class CreateCarrierDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1,10}$/)
  mcNumber?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1,8}$/)
  dotNumber?: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsEnum(CarrierStatus)
  @IsOptional()
  status?: CarrierStatus;
}

export class UpdateCarrierDto extends PartialType(CreateCarrierDto) {}
```

## Guards

```typescript
// JwtAuthGuard -- validates JWT cookie, extracts user + tenantId
@UseGuards(JwtAuthGuard)

// RolesGuard -- checks user role against @Roles() decorator
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.DISPATCHER)
```

## Custom Decorators

```typescript
@TenantId()    // Extracts tenantId from JWT
@CurrentUser() // Extracts full user from JWT
@Roles(...)    // Specifies allowed roles
```

## Response Format

Global interceptor transforms all responses to envelope format:

```typescript
// Single item
{ data: T, message?: string }

// Paginated list
{ data: T[], pagination: { page, limit, total, totalPages } }

// Error
{ error: string, code: string, details?: object }
```

## Global Configuration (main.ts)

```typescript
// ValidationPipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  transform: true,           // Auto-transform types
  forbidNonWhitelisted: true // Reject unknown properties
}));

// CORS
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
});

// Swagger
SwaggerModule.setup('api-docs', app, document);
// Available at: http://localhost:3001/api-docs
```

## API prefix

All endpoints: `/api/v1/{resource}`
