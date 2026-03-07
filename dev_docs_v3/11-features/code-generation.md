# Code Generation Templates

> Source: `dev_docs/10-features/87-code-generation-templates.md`
> Last updated: 2026-03-07

---

## Overview

Scaffolding scripts accelerate development by generating CRUD modules that follow all project standards. With 38 services and hundreds of endpoints, generators save 2-4 hours per entity vs. manual coding.

---

## Generator CLI

```bash
# Generate full CRUD module (backend + frontend)
npm run g:crud -- --name Carrier --plural Carriers

# Generate backend module only
npm run g:module -- --name Carrier

# Generate frontend screens only
npm run g:screen -- --name Carrier --type list
npm run g:screen -- --name Carrier --type detail
npm run g:screen -- --name Carrier --type form
```

---

## What Gets Generated

### Backend Module (`g:module`)

```
apps/api/src/modules/{name}/
├── {name}.module.ts          # NestJS module
├── {name}.controller.ts      # REST controller with guards
├── {name}.service.ts         # Business logic with tenant filtering
├── dto/
│   ├── create-{name}.dto.ts  # Zod-validated create DTO
│   ├── update-{name}.dto.ts  # Partial of create DTO
│   └── query-{name}.dto.ts   # Pagination + filters
└── {name}.service.spec.ts    # Unit test file
```

### Frontend Screens (`g:screen`)

```
apps/web/app/(dashboard)/{name}/
├── page.tsx                  # List page with DataTable
├── [id]/
│   └── page.tsx              # Detail page with tabs
└── new/
    └── page.tsx              # Create form
```

---

## Backend Module Template

### Controller

```typescript
@Controller('api/v1/{pluralLower}')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('{PluralName}')
export class {Name}Controller {
  constructor(private readonly service: {Name}Service) {}

  @Get()
  @Roles('ADMIN', 'DISPATCH', 'OPERATIONS')
  async findAll(
    @Query() query: Query{Name}Dto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.findAll(query, user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCH', 'OPERATIONS')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.findOne(id, user.tenantId);
  }

  @Post()
  @Roles('ADMIN', 'DISPATCH')
  async create(
    @Body() dto: Create{Name}Dto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.create(dto, user.tenantId, user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DISPATCH')
  async update(
    @Param('id') id: string,
    @Body() dto: Update{Name}Dto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.remove(id, user.tenantId);
  }
}
```

### Service

```typescript
@Injectable()
export class {Name}Service {
  constructor(private prisma: PrismaService) {}

  async findAll(query: Query{Name}Dto, tenantId: string) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: Prisma.{Name}WhereInput = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.{nameLower}.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.{nameLower}.count({ where }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, tenantId: string) {
    const item = await this.prisma.{nameLower}.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('{Name} not found');
    return { data: item };
  }

  async create(dto: Create{Name}Dto, tenantId: string, userId: string) {
    const item = await this.prisma.{nameLower}.create({
      data: { ...dto, tenantId, createdById: userId },
    });
    return { data: item, message: '{Name} created successfully' };
  }

  async update(id: string, dto: Update{Name}Dto, tenantId: string) {
    await this.findOne(id, tenantId); // Verify existence + tenant
    const item = await this.prisma.{nameLower}.update({
      where: { id },
      data: dto,
    });
    return { data: item, message: '{Name} updated successfully' };
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.{nameLower}.update({
      where: { id },
      data: { deletedAt: new Date() }, // Soft delete
    });
    return { message: '{Name} deleted successfully' };
  }
}
```

---

## Frontend List Page Template

```typescript
'use client';

export default function {PluralName}Page() {
  const { filters, setFilters } = useUrlFilters();
  const { data, isLoading } = use{PluralName}(filters);
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setFilters({ search: value, page: '1' });
  }, 300);

  if (isLoading) return <PageSkeleton />;

  return (
    <PageContainer>
      <PageHeader title="{PluralName}" description="Manage your {pluralLower}">
        <Link href="/{pluralLower}/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add {Name}</Button>
        </Link>
      </PageHeader>

      <SearchInput placeholder="Search {pluralLower}..." onChange={debouncedSearch} />

      {data?.data.length === 0 ? (
        <EmptyState title="No {pluralLower}" description="Get started by creating your first {nameLower}." />
      ) : (
        <DataTable columns={columns} data={data.data} pagination={data.pagination} />
      )}
    </PageContainer>
  );
}
```

---

## DTO Template

```typescript
// create-{name}.dto.ts
export class Create{Name}Dto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum({Name}Status)
  @IsOptional()
  status?: {Name}Status;
}

// update-{name}.dto.ts
export class Update{Name}Dto extends PartialType(Create{Name}Dto) {}

// query-{name}.dto.ts
export class Query{Name}Dto extends PaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum({Name}Status)
  @IsOptional()
  status?: {Name}Status;
}
```

---

## Standards Enforced by Templates

- Multi-tenant: `tenantId` filter on all queries
- Soft delete: `deletedAt: null` check on all reads
- Auth guards: `JwtAuthGuard` + `RolesGuard` on all controllers
- API envelope: `{ data: T }` / `{ data: T[], pagination }` responses
- Pagination: skip/take with total count
- Validation: DTO whitelist with `class-validator`
- Search debounce: 300ms on frontend inputs
- Loading/error/empty states: all three handled
