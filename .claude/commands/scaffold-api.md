Generate a complete NestJS API module for the given resource. Resource name: $ARGUMENTS

## Instructions

### Step 1: Understand the Resource

1. **Parse the resource name** from arguments (e.g., "invoice", "shipment", "warehouse"). If not provided, ask the user.

2. **Check if the module already exists** in `apps/api/src/modules/`. If it does, ask the user if they want to extend it or start fresh.

3. **Check the Screen-API Contract Registry** at `dev_docs/09-contracts/76-screen-api-contract-registry.md` for this resource's required endpoints, request/response formats, and roles.

4. **Check the Prisma schema** at `apps/api/prisma/schema.prisma` for the corresponding model. Note all fields, relations, and enums.

5. **Check for a design spec** in `dev_docs/12-Rabih-design-Process/` to understand required data fields and status states.

### Step 2: Generate the Module

Create the following files at `apps/api/src/modules/{resource}/`:

#### 2a. DTO files (`dto/` subdirectory)

Follow the pattern in `apps/api/src/modules/carrier/dto/`:

- **`dto/index.ts`** — barrel export for all DTOs and enums
- **`dto/enums.ts`** — status enums and any other enums for this resource
- **`dto/create-{resource}.dto.ts`** — CreateDto with class-validator decorators (`@IsString()`, `@IsOptional()`, etc.)
- **`dto/{resource}-query.dto.ts`** — QueryDto for list endpoint (search, status filter, pagination: skip/take)
- **`dto/{resource}-response.dto.ts`** — ResponseDto with `@Expose()` decorators for serialization
- **`dto/update-{resource}.dto.ts`** — UpdateDto (extend from CreateDto using `PartialType` from `@nestjs/swagger`)

#### 2b. Service file

**`{resource}s.service.ts`** — Follow the pattern in `apps/api/src/modules/carrier/carriers.service.ts`:

```typescript
@Injectable()
export class {Resource}sService {
  constructor(private prisma: PrismaService) {}

  // EVERY method must include tenantId filtering and deletedAt: null
  async create(tenantId: string, userId: string, dto: Create{Resource}Dto) { ... }
  async findAll(tenantId: string, query: {Resource}QueryDto) { ... }
  async findOne(tenantId: string, id: string) { ... }
  async update(tenantId: string, id: string, dto: Update{Resource}Dto) { ... }
  async delete(tenantId: string, id: string) { ... }  // Soft delete: set deletedAt
}
```

Key patterns to enforce:
- **All queries filter by `tenantId` AND `deletedAt: null`**
- Use `NotFoundException` when record not found
- Use `BadRequestException` for validation errors
- Soft delete sets `deletedAt: new Date()`, never hard deletes
- List endpoints return `{ data: T[], pagination: { total, page, limit, totalPages } }`
- Include related entities using Prisma `include` where appropriate
- Emit events via `EventEmitter2` for significant state changes (optional)

#### 2c. Controller file

**`{resource}s.controller.ts`** — Follow the pattern in `apps/api/src/modules/carrier/carriers.controller.ts`:

```typescript
@Controller('{resource}s')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ excludeExtraneousValues: false })
@ApiTags('{Resource}')
@ApiBearerAuth('JWT-auth')
export class {Resource}sController {
  constructor(private readonly {resource}sService: {Resource}sService) {}
  // CRUD endpoints with proper decorators
}
```

Key patterns to enforce:
- **`@UseGuards(JwtAuthGuard, RolesGuard)`** on the controller class
- **`@Roles(...)`** on each endpoint with appropriate roles from contract registry
- **`@CurrentTenant() tenantId: string`** on each method (NEVER skip this)
- **`@CurrentUser() user: { id: string }`** on create/update methods
- **`@ApiOperation({ summary: '...' })`** on each endpoint
- **`@ApiStandardResponse('...')`** and **`@ApiErrorResponses()`** on each endpoint
- **`@ApiQuery()`** for query parameters, **`@ApiParam()`** for path params
- Use `@HttpCode(HttpStatus.OK)` for POST endpoints that aren't creating (actions)
- Serialize responses using `plainToInstance(ResponseDto, data, { excludeExtraneousValues: true })`

#### 2d. Spec file

**`{resource}s.service.spec.ts`** — Basic test structure:

```typescript
describe('{Resource}sService', () => {
  let service: {Resource}sService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {Resource}sService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get({Resource}sService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });
  // Test CRUD operations with tenant isolation
});
```

#### 2e. Module file

**`{resource}.module.ts`** — Follow the pattern in `apps/api/src/modules/carrier/carrier.module.ts`:

```typescript
@Module({
  controllers: [{Resource}sController],
  providers: [PrismaService, {Resource}sService],
  exports: [{Resource}sService],
})
export class {Resource}Module {}
```

### Step 3: Register the Module

6. **Add the module to `apps/api/src/app.module.ts`**:
   - Add the import statement
   - Add to the `imports` array

### Step 4: Verify

7. **Run TypeScript check**: `pnpm --filter api exec tsc --noEmit` to verify no type errors
8. **Show the user a summary** of all files created with line counts
9. **Remind the user** to:
   - Update the Screen-API Contract Registry status
   - Run `pnpm --filter api test` to verify tests pass
   - Test endpoints via Swagger at `http://localhost:3001/api/docs`

### Important Conventions (DO NOT SKIP)

- Import guards from `../auth/guards/jwt-auth.guard` and `../../common/guards/roles.guard`
- Import decorators from `../../common/decorators/current-tenant.decorator` and `../../common/decorators/current-user.decorator`
- Import Swagger helpers from `../../common/swagger`
- Import `Roles` from `../../common/decorators/roles.decorator`
- Use `PrismaService` from `../../prisma.service`
- Resource names are **singular** for module folder, **plural** for controller route and file names
- All string IDs are UUIDs (Prisma `@default(uuid())`)
