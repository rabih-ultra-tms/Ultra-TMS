# API Design Standards

> Source: `dev_docs/08-standards/66-api-design-standards.md`
> Stack: NestJS 10, prefix `/api/v1`

## Response Format (MANDATORY)

```typescript
// Single item
{ data: T, message?: string }

// List with pagination
{ data: T[], pagination: { page: number, limit: number, total: number, totalPages: number } }

// Error
{ error: string, code: string, details?: object }
```

**Frontend consumption:** Always `response.data.data` (Axios wraps in `.data`, API wraps in `.data`).

## Response Helpers

Use `ok()`, `paginated()`, `errorResponse()` from `apps/api/src/common/helpers/response.helper.ts`.

## Endpoint Naming

```
GET    /api/v1/{resource}           → List (paginated)
GET    /api/v1/{resource}/:id       → Single item
POST   /api/v1/{resource}           → Create
PATCH  /api/v1/{resource}/:id       → Update (partial)
DELETE /api/v1/{resource}/:id       → Soft delete
```

**Plural nouns:** `/carriers`, `/loads`, `/invoices` — NOT `/carrier`, `/getLoads`

## Pagination

```typescript
// Query params
?page=1&limit=20&sortBy=createdAt&sortOrder=desc

// DTO
export class PaginationDto {
  @IsOptional() @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number = 20;
  @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc' = 'desc';
}
```

## Guards (MANDATORY)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.DISPATCHER)
@Controller('api/v1/loads')
export class LoadsController { ... }
```

Every endpoint except `/health` and `/auth/login` MUST have auth guards.

## Validation

Global `ValidationPipe` in `main.ts`: `whitelist: true, transform: true, forbidNonWhitelisted: true`

DTOs strip unknown fields automatically. Define every accepted field in the DTO.

## Multi-Tenant (MANDATORY)

```typescript
// ALWAYS extract tenantId from JWT, NEVER from request body
const tenantId = req.user.tenantId;

// ALWAYS filter queries by tenant
await prisma.carrier.findMany({
  where: { tenantId, deletedAt: null }
});
```

## Error Handling

```typescript
// Use NestJS exceptions
throw new NotFoundException('Carrier not found');
throw new BadRequestException('Invalid load status');
throw new ForbiddenException('Insufficient permissions');
throw new ConflictException('Invoice number already exists');
```

## Swagger

Available at `localhost:3001/api-docs`. Use `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` decorators.
