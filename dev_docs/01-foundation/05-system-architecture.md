# System Architecture

This section documents the technical architecture of the 3PL Platform.

## Contents

| Document                                   | Description                                  |
| ------------------------------------------ | -------------------------------------------- |
| [OVERVIEW.md](./OVERVIEW.md)               | High-level architecture diagram and patterns |
| [TECH-STACK.md](./TECH-STACK.md)           | Complete technology stack details            |
| [DATABASE.md](./DATABASE.md)               | Database design principles and patterns      |
| [API-DESIGN.md](./API-DESIGN.md)           | API conventions and standards                |
| [EVENT-DRIVEN.md](./EVENT-DRIVEN.md)       | Event architecture and messaging             |
| [MIGRATION-FIRST.md](./MIGRATION-FIRST.md) | Migration-first design principles            |
| [MULTI-TENANCY.md](./MULTI-TENANCY.md)     | Multi-tenant architecture (Phase C)          |
| [SECURITY.md](./SECURITY.md)               | Security architecture                        |

---

## Architecture Overview

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│   │   Web App    │   │ Mobile App   │   │   Customer   │   │   Carrier    │ │
│   │   (React)    │   │(React Native)│   │    Portal    │   │    Portal    │ │
│   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY / LOAD BALANCER                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         NestJS Modular Monolith                      │   │
│   │                                                                       │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│   │  │  Auth   │  │   CRM   │  │  Sales  │  │   TMS   │  │ Carrier │   │   │
│   │  │ Module  │  │ Module  │  │ Module  │  │ Module  │  │ Module  │   │   │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│   │                                                                       │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│   │  │Accounting│ │Commission│ │ Credit  │  │ Claims  │  │  Docs   │   │   │
│   │  │ Module  │  │ Module  │  │ Module  │  │ Module  │  │ Module  │   │   │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│   │                                                                       │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│   │  │Analytics│  │Workflow │  │ Search  │  │  Audit  │  │  More...│   │   │
│   │  │ Module  │  │ Module  │  │ Module  │  │ Module  │  │         │   │   │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│   │                                                                       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                │                    │                    │
                │                    │                    │
                ▼                    ▼                    ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│      PostgreSQL      │  │        Redis         │  │    File Storage      │
│   (Primary DB)       │  │  (Cache/Sessions/Q)  │  │     (S3/MinIO)       │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

---

## Architecture Principles

### 1. Modular Monolith

**Why not microservices?**

- Team size: 2 engineers
- Operational complexity: Microservices need DevOps expertise
- Development speed: Monolith is faster to iterate
- Future ready: Modules can be extracted later

**Our approach:**

- One NestJS application
- 34 feature modules with clear boundaries
- Shared database with schema separation
- Event-driven communication between modules

### 2. Migration-First Design

Every database table includes:

```typescript
// Standard migration columns on all entities
external_id: string | null; // ID from source system
source_system: string | null; // 'hubspot', 'mcleod', 'quickbooks'
custom_fields: Json; // Unmapped data from migration
created_at: DateTime;
updated_at: DateTime;
```

### 3. Multi-Tenant Ready

Phase A: Single tenant (your brokerage)
Phase C: Multi-tenant with data isolation

**Tenant isolation strategy:**

- Row-level security in PostgreSQL
- `tenant_id` on all tables
- Tenant context in request middleware
- Schema-per-tenant option for enterprise

### 4. Event-Driven

Modules communicate via events, not direct calls:

```typescript
// Publishing
this.eventBus.publish(new OrderCreatedEvent(order));

// Subscribing
@EventSubscriber(OrderCreatedEvent)
handleOrderCreated(event: OrderCreatedEvent) {
  // Create invoice, notify carrier, etc.
}
```

### 5. API-First

All functionality exposed via REST API:

- OpenAPI/Swagger documentation
- Versioned endpoints (`/api/v1/`)
- Consistent error responses
- Rate limiting
- CORS configuration

---

## Technology Decisions

### Why NestJS?

| Consideration        | Decision                            |
| -------------------- | ----------------------------------- |
| TypeScript first     | ✅ Strong typing throughout         |
| Modular architecture | ✅ Built-in module system           |
| Enterprise patterns  | ✅ DI, guards, pipes, interceptors  |
| Documentation        | ✅ Excellent docs and community     |
| Team experience      | ✅ JavaScript ecosystem familiarity |

### Why PostgreSQL?

| Consideration      | Decision                        |
| ------------------ | ------------------------------- |
| Relational data    | ✅ Orders, invoices need ACID   |
| JSON support       | ✅ JSONB for flexible fields    |
| Full-text search   | ✅ Built-in search capabilities |
| Row-level security | ✅ Multi-tenant isolation       |
| Extensions         | ✅ PostGIS for location         |

### Why Redis?

| Use Case        | Implementation                  |
| --------------- | ------------------------------- |
| Session storage | User sessions with TTL          |
| Caching         | Rate lookups, carrier data      |
| Job queues      | Bull queues for background jobs |
| Real-time       | Pub/sub for WebSocket events    |

### Why React + TailwindCSS?

| Consideration     | Decision                     |
| ----------------- | ---------------------------- |
| Component model   | ✅ Reusable UI components    |
| State management  | ✅ React Query + Zustand     |
| Styling           | ✅ Tailwind for rapid UI     |
| Component library | ✅ shadcn/ui for consistency |

---

## Service Categories

### Core Services (7)

Essential business logic for freight brokerage.

### Operations Services (7)

Day-to-day operational support.

### Platform Services (8)

Infrastructure and cross-cutting concerns.

### Support Services (2)

Customer and user support.

### Extended Services (9)

Industry integrations and advanced features.

### Admin Services (1)

Platform administration.

---

## Key Patterns

### Repository Pattern

```typescript
@Injectable()
class OrderRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string, tenantId: string): Promise<Order | null> {
    return this.prisma.order.findFirst({
      where: { id, tenantId },
    });
  }
}
```

### Service Pattern

```typescript
@Injectable()
class OrderService {
  constructor(
    private repository: OrderRepository,
    private eventBus: EventBus
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.repository.create(dto);
    await this.eventBus.publish(new OrderCreatedEvent(order));
    return order;
  }
}
```

### Guard Pattern

```typescript
@Injectable()
class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];
    // Validate tenant access
    return true;
  }
}
```

---

## Scalability Strategy

### Phase A (Single Tenant)

- Single application instance
- PostgreSQL with connection pooling
- Redis for caching
- S3 for file storage

### Phase C (Multi-Tenant)

- Horizontal scaling (2-4 instances)
- Load balancer with session affinity
- Read replicas for reporting
- CDN for static assets

### Future Scale

- Service extraction for high-load modules
- Message queue for async processing
- Elasticsearch for advanced search
- Data warehouse for analytics

---

## See Also

- [Tech Stack Details](./TECH-STACK.md)
- [Database Design](./DATABASE.md)
- [API Design](./API-DESIGN.md)
- [Security](./SECURITY.md)
