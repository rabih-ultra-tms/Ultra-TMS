# Phase A Backend API Implementation - Master Index

> **Purpose:** This document serves as the master tracking index for implementing all Phase A backend APIs in the Ultra-TMS project. Execute prompts in sequential order (00 → 24). Do not skip prompts or execute out of order.

## 📋 Quick Reference

| Document | Link |
|----------|------|
| API Design Standards | [66-api-design-standards.md](../../08-standards/66-api-design-standards.md) |
| Database Design Standards | [67-database-design-standards.md](../../08-standards/67-database-design-standards.md) |
| Frontend Architecture | [68-frontend-architecture-standards.md](../../08-standards/68-frontend-architecture-standards.md) |
| Progress Tracker | [progress-tracker.html](../../progress-tracker.html) |
| Prisma Schema | [schema.prisma](../../../apps/api/prisma/schema.prisma) |
| Services Overview | [07-services-overview.md](../../02-services/07-services-overview.md) |

---

## 🎯 Execution Order & Status

### Phase 0: Verification (Execute First)

| # | Prompt File | Service | Endpoints | Status | Completed |
|---|-------------|---------|-----------|--------|-----------|
| 00 | [00-verify-existing-services.md](./00-verify-existing-services.md) | Verify 8 Existing Services | 260 | ✅ Complete | 2026-01-10 |

### Phase 1: Core Operations (Critical Path)

| # | Prompt File | Service | Endpoints | Dependencies | Status | Completed |
|---|-------------|---------|-----------|--------------|--------|-----------|
| 01 | [01-tms-core-api.md](./01-tms-core-api.md) | TMS Core | 45 | Auth ✅, CRM ✅, Sales ✅ | ✅ Complete | 2026-01-11 |
| 02 | [02-carrier-api.md](./02-carrier-api.md) | Carrier | 40 | Auth ✅, TMS Core | ✅ Complete | 2026-01-11 |
| 03 | [03-credit-api.md](./03-credit-api.md) | Credit | 30 | CRM ✅, Accounting ✅ | ✅ Complete | 2026-01-11 |
| 04 | [04-claims-api.md](./04-claims-api.md) | Claims | 30 | TMS Core, Carrier, Documents ✅ | ✅ Complete | 2026-01-11 |

### Phase 2: Portal Services

| # | Prompt File | Service | Endpoints | Dependencies | Status | Completed |
|---|-------------|---------|-----------|--------------|--------|-----------|
| 05 | [05-customer-portal-api.md](./05-customer-portal-api.md) | Customer Portal | 40 | Auth ✅, CRM ✅, TMS Core, Accounting ✅ | ✅ Complete | 2026-01-11 |
| 06 | [06-carrier-portal-api.md](./06-carrier-portal-api.md) | Carrier Portal | 45 | Auth ✅, Carrier, TMS Core, Accounting ✅ | ✅ Complete | 2026-01-11 |

### Phase 3: Business Services

| # | Prompt File | Service | Endpoints | Dependencies | Status | Completed |
|---|-------------|---------|-----------|--------------|--------|-----------|
| 07 | [07-contracts-api.md](./07-contracts-api.md) | Contracts | 25 | CRM ✅, Carrier, Sales ✅, Documents ✅ | ✅ Complete | 2026-01-11 |
| 08 | [08-agent-api.md](./08-agent-api.md) | Agent | 35 | CRM ✅, Commission ✅, Contracts, Accounting ✅ | ✅ Complete | 2026-01-11 |
| 09 | [09-factoring-internal-api.md](./09-factoring-internal-api.md) | Factoring Internal | 30 | Carrier, Accounting ✅ | ✅ Complete | 2026-01-11 |

### Phase 4: Integration Services

| # | Prompt File | Service | Endpoints | Dependencies | Status | Completed |
|---|-------------|---------|-----------|--------------|--------|-----------|
| 10 | [10-edi-api.md](./10-edi-api.md) | EDI | 35 | TMS Core, Carrier, Accounting ✅ | ✅ Complete | 2026-01-11 |
| 11 | [11-safety-api.md](./11-safety-api.md) | Safety | 40 | Carrier | ✅ Complete | 2026-01-12 |
| 12 | [12-load-board-external-api.md](./12-load-board-external-api.md) | Load Board External | 35 | Load Board ✅, Carrier | ✅ Complete | 2026-01-12 |
| 13 | [13-rate-intelligence-api.md](./13-rate-intelligence-api.md) | Rate Intelligence | 25 | Sales ✅ | ✅ Complete | 2026-01-12 |

### Phase 5: Platform Services

| # | Prompt File | Service | Endpoints | Dependencies | Status | Completed |
|---|-------------|---------|-----------|--------------|--------|-----------|
| 14 | [14-analytics-api.md](./14-analytics-api.md) | Analytics | 40 | All Core Services | ✅ Complete | 2026-01-13 |
| 15 | [15-workflow-api.md](./15-workflow-api.md) | Workflow | 30 | Auth ✅, Config | ✅ Complete | 2026-01-13 |
| 16 | [16-integration-hub-api.md](./16-integration-hub-api.md) | Integration Hub | 40 | Auth ✅ | ✅ Complete | 2026-01-13 |
| 17 | [17-search-api.md](./17-search-api.md) | Search | 25 | All searchable entities | ✅ Complete | 2026-01-13 |
| 18 | [18-audit-api.md](./18-audit-api.md) | Audit | 25 | Auth ✅ | ✅ Complete | 2026-01-13 |
| 19 | [19-config-api.md](./19-config-api.md) | Config | 30 | Auth ✅ | ✅ Complete | 2026-01-14 |
| 20 | [20-scheduler-api.md](./20-scheduler-api.md) | Scheduler | 25 | Auth ✅, Config | ✅ Complete | 2026-01-14 |
| 21 | [21-cache-api.md](./21-cache-api.md) | Cache | 20 | Redis infrastructure | ✅ Complete | 2026-01-14 |

### Phase 6: Support Services    

| # | Prompt File | Service | Endpoints | Dependencies | Status | Completed |
|---|-------------|---------|-----------|--------------|--------|-----------|
| 22 | [22-hr-api.md](./22-hr-api.md) | HR | 35 | Auth ✅ | ✅ Complete | 2026-01-14 |
| 23 | [23-help-desk-api.md](./23-help-desk-api.md) | Help Desk | 30 | Auth ✅, Users | ✅ Complete | 2026-01-14 |
| 24 | [24-feedback-api.md](./24-feedback-api.md) | Feedback | 25 | Auth ✅, Users | ✅ Complete | 2026-01-14 |

### Phase A Enhancement: P5 Completion (Services 13-27)

> **NOTE:** These prompts bring Phase A services 13-27 to the same quality level as services 00-12.

| # | Prompt File | Task | Scope | Time Est. | Status | Completed |
|---|-------------|------|-------|-----------|--------|-----------|
| 17 | [17-p5-phase-a-services-rbac.md](../api-dev-prompts-phase2/17-p5-phase-a-services-rbac.md) | RBAC Implementation | 84 controllers, 496 endpoints | 4-6 hours | ⬜ Pending | - |
| 18 | [18-p5-phase-a-services-swagger.md](../api-dev-prompts-phase2/18-p5-phase-a-services-swagger.md) | Swagger Documentation | 14 modules, all DTOs | 6-8 hours | ⬜ Pending | - |
| 19 | [19-p5-phase-a-services-e2e-expansion.md](../api-dev-prompts-phase2/19-p5-phase-a-services-e2e-expansion.md) | E2E Test Expansion | 30% → 80% coverage | 8-10 hours | ⬜ Pending | - |

---

## 📊 Progress Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Prompts (00-24) | 25 | - |
| Completed | 25 | 100% |
| In Progress | 0 | 0% |
| Pending | 0 | 0% |
| Total Endpoints | 820 | - |
| Endpoints Implemented | 820 | 100% |

### P5 Enhancement Summary (Prompts 17-19)

| Metric | Count | Status |
|--------|-------|--------|
| Phase A Services (13-27) | 14 modules | Functional |
| Controllers Needing RBAC | 84 | ⚠️ 0% done |
| Endpoints Needing Swagger | 496 | ⚠️ 0% done |
| E2E Coverage | ~30% | ⚠️ Target 80% |
| P5 Total Time Estimate | 18-24 hours | ⬜ Pending |

---

## 🔗 Dependency Graph

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                     AUTH & ADMIN ✅                          │
                    │              (Foundation - All services depend)              │
                    └─────────────────────────────────────────────────────────────┘
                                                │
            ┌───────────────────────────────────┼───────────────────────────────────┐
            │                                   │                                   │
            ▼                                   ▼                                   ▼
    ┌───────────────┐                   ┌───────────────┐                   ┌───────────────┐
    │   CRM ✅       │                   │   SALES ✅     │                   │ DOCUMENTS ✅  │
    └───────────────┘                   └───────────────┘                   └───────────────┘
            │                                   │                                   │
            │                                   │                                   │
            ▼                                   ▼                                   │
    ┌───────────────────────────────────────────────────────────────────┐          │
    │                         TMS CORE (01)                              │◄─────────┘
    │                    Orders, Loads, Stops                            │
    └───────────────────────────────────────────────────────────────────┘
            │                           │                           │
            ▼                           ▼                           ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │  CARRIER (02) │           │  CREDIT (03)  │           │ ACCOUNTING ✅  │
    └───────────────┘           └───────────────┘           └───────────────┘
            │                           │                           │
            ├───────────────────────────┼───────────────────────────┤
            ▼                           ▼                           ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │  CLAIMS (04)  │           │ CUST PORTAL(05)│          │CARR PORTAL(06)│
    └───────────────┘           └───────────────┘           └───────────────┘
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │         CONTRACTS (07) → AGENT (08) → FACTORING (09)              │
    └───────────────────────────────────────────────────────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            ▼                           ▼                           ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │   EDI (10)    │           │  SAFETY (11)  │           │ LOAD BOARD    │
    │               │           │               │           │ EXTERNAL (12) │
    └───────────────┘           └───────────────┘           └───────────────┘
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │              RATE INTELLIGENCE (13) → ANALYTICS (14)              │
    └───────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │    WORKFLOW (15) → INTEGRATION HUB (16) → SEARCH (17)             │
    └───────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │        AUDIT (18) → CONFIG (19) → SCHEDULER (20) → CACHE (21)     │
    └───────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │              HR (22) → HELP DESK (23) → FEEDBACK (24)             │
    └───────────────────────────────────────────────────────────────────┘
```

---

## 📝 Developer Workflow

### For Each Prompt:

1. **Read** the entire prompt file before starting
2. **Verify** all pre-requisite services are marked complete in this index
3. **Check** that database models exist in `schema.prisma`
4. **Implement** following the NestJS module pattern:
   ```
   apps/api/src/modules/{service}/
   ├── {service}.module.ts
   ├── {entity}.controller.ts
   ├── {entity}.service.ts
   └── dto/
       ├── create-{entity}.dto.ts
       ├── update-{entity}.dto.ts
       └── {entity}-query.dto.ts
   ```
5. **Write** and pass ALL integration tests
6. **Update** this index - change status to ✅ and add completion date
7. **Update** `progress-tracker.html` with the provided HTML snippet
8. **Commit** with message: `feat(api): implement {service} service API - {X} endpoints`
9. **Proceed** to next numbered prompt

### Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Pending - Not started |
| 🔄 | In Progress - Currently implementing |
| ✅ | Complete - All tests passing |
| ❌ | Blocked - Waiting on dependency |

---

## 🔧 Common Patterns

### Controller Template
```typescript
@Controller('api/v1/{resource}')
@UseGuards(JwtAuthGuard)
@ApiTags('{Resource}')
export class {Resource}Controller {
  constructor(private readonly service: {Resource}Service) {}

  @Get()
  @ApiOperation({ summary: 'List {resources}' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: {Resource}QueryDto,
  ): Promise<PaginatedResponse<{Resource}>> {
    return this.service.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get {resource} by ID' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ): Promise<{Resource}> {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create {resource}' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Create{Resource}Dto,
  ): Promise<{Resource}> {
    return this.service.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update {resource}' })
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: Update{Resource}Dto,
  ): Promise<{Resource}> {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete {resource}' })
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.remove(tenantId, userId, id);
  }
}
```

### Service Template
```typescript
@Injectable()
export class {Resource}Service {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: {Resource}QueryDto) {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;
    const where = { tenantId, deletedAt: null, ...this.buildFilters(filters) };

    const [data, total] = await Promise.all([
      this.prisma.{resource}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.{resource}.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const entity = await this.prisma.{resource}.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!entity) {
      throw new NotFoundException(`{Resource} with ID ${id} not found`);
    }
    return entity;
  }

  async create(tenantId: string, userId: string, dto: Create{Resource}Dto) {
    const entity = await this.prisma.{resource}.create({
      data: {
        ...dto,
        tenantId,
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('{resource}.created', new {Resource}CreatedEvent(entity));
    return entity;
  }
}
```

### Integration Test Template
```typescript
describe('{Resource}Controller (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    
    // Setup test tenant and auth
    const { token, tenant } = await setupTestAuth(app);
    authToken = token;
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/{resources}', () => {
    it('should return paginated list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/{resources}')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by tenant', async () => {
      // Create in different tenant - should not appear
      // ...
    });
  });

  describe('POST /api/v1/{resources}', () => {
    it('should create new {resource}', async () => {
      const dto = { /* valid create dto */ };
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/{resources}')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  // ... more tests
});
```

---

## 📅 Last Updated

- **Date:** January 14, 2026
- **By:** System
- **Change:** Help Desk API prompt completed (30 endpoints); progress summary updated

---

## 📌 Notes

- All endpoints must include tenant isolation
- All mutations must emit domain events
- All entities must have audit fields (createdAt, updatedAt, createdById, updatedById)
- Use soft delete (deletedAt) instead of hard delete
- Follow REST naming conventions (plural nouns, hyphens for multi-word)
- API versioning: `/api/v1/`
