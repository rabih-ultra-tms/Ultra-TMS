# Prisma Patterns

> AI Dev Guide | Prisma usage patterns in this codebase

---

## Schema Location

```
apps/api/prisma/schema.prisma
```

- 260 models, 114 enums, 31 migrations
- PostgreSQL database

## Mandatory Query Patterns

### 1. Tenant Filtering

EVERY query must include `tenantId`:

```typescript
// findMany
const carriers = await this.prisma.carrier.findMany({
  where: { tenantId, deletedAt: null },
});

// findUnique -- also check tenant
const carrier = await this.prisma.carrier.findUnique({
  where: { id, tenantId },
});
// If carrier.tenantId !== requestTenantId, throw ForbiddenException
```

### 2. Soft Delete

EVERY query must exclude soft-deleted records (except audit/history views):

```typescript
// List query
where: { tenantId, deletedAt: null }

// Delete operation -- set deletedAt, never hard delete
await this.prisma.carrier.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

### 3. Pagination

Standard pagination pattern:

```typescript
async findAll(tenantId: string, params: { page?: number; limit?: number; search?: string }) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where = { tenantId, deletedAt: null };

  const [data, total] = await Promise.all([
    this.prisma.carrier.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.carrier.count({ where }),
  ]);

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
```

## Include Patterns

### Nested Relations

```typescript
const order = await this.prisma.order.findUnique({
  where: { id },
  include: {
    customer: true,
    loads: {
      include: {
        carrier: true,
        stops: { orderBy: { sequence: 'asc' } },
        checkCalls: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    },
  },
});
```

### Select for Performance

When you don't need all fields:

```typescript
const carriers = await this.prisma.carrier.findMany({
  where: { tenantId, deletedAt: null },
  select: {
    id: true,
    name: true,
    mcNumber: true,
    status: true,
  },
});
```

## Transaction Patterns

### Multi-Model Operations

```typescript
// Quote acceptance: create order + update quote status
const result = await this.prisma.$transaction(async (tx) => {
  // 1. Create order from quote data
  const order = await tx.order.create({
    data: { ...orderData, tenantId },
  });

  // 2. Update quote status
  await tx.quote.update({
    where: { id: quoteId },
    data: { status: 'ACCEPTED' },
  });

  // 3. Create loads for the order
  await tx.load.createMany({
    data: loads.map(l => ({ ...l, orderId: order.id, tenantId })),
  });

  return order;
});
```

### Status Transitions with Validation

```typescript
// Validate transition before applying
const load = await this.prisma.load.findUnique({ where: { id } });
if (!VALID_TRANSITIONS[load.status]?.includes(newStatus)) {
  throw new BadRequestException(`Cannot transition from ${load.status} to ${newStatus}`);
}

await this.prisma.load.update({
  where: { id },
  data: { status: newStatus, updatedAt: new Date() },
});
```

## Migration-First Fields

Every entity includes these standard fields:

```prisma
model Entity {
  // ... business fields ...
  tenantId      String
  external_id   String?     // Migration source ID
  source_system String?     // Migration source name
  custom_fields Json?       // Tenant-specific custom fields
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  deletedAt     DateTime?   // Soft delete

  tenant Tenant @relation(fields: [tenantId], references: [id])
  @@index([tenantId])
}
```

## Enum Usage

```prisma
enum CarrierStatus {
  PENDING
  ACTIVE
  INACTIVE
  SUSPENDED
  BLACKLISTED
}
```

In service code:
```typescript
import { CarrierStatus } from '@prisma/client';

if (carrier.status === CarrierStatus.BLACKLISTED) {
  throw new BadRequestException('Carrier is blacklisted');
}
```

## Common Prisma Commands

```bash
pnpm --filter api prisma:generate   # Regenerate client after schema change
pnpm --filter api prisma:migrate    # Apply pending migrations
pnpm --filter api prisma:studio     # Visual database browser
pnpm --filter api prisma:seed       # Run seed script
```

## Performance Tips

1. Use `select` instead of `include` when you only need specific fields
2. Use `findFirst` instead of `findMany` + `[0]` for single results
3. Use `count` with the same `where` clause for pagination totals
4. Use `$transaction` for multi-model operations to ensure consistency
5. Add database indexes for frequently queried fields (tenantId, status, createdAt)
