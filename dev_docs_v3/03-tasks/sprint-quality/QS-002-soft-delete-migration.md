# QS-002: Soft Delete Migration

**Priority:** P1
**Effort:** M (2-4 hours)
**Status:** planned
**Assigned:** Claude Code

---

## Context Header (Read These First)

1. `apps/api/prisma/schema.prisma` — Find Order, Quote, Invoice, Settlement, PaymentMade, PaymentReceived models
2. `apps/api/src/modules/operations/orders.service.ts` — OrdersService delete method (may do hard delete)
3. `apps/api/src/modules/accounting/invoices.service.ts` — InvoicesService delete method
4. `dev_docs_v3/00-foundations/domain-rules.md` — 7-year financial data retention rule

---

## Objective

Add `deletedAt DateTime?` field to 5 entities that currently lack soft delete. Create Prisma migration. Update service delete methods to set `deletedAt` instead of using `prisma.entity.delete()`. Update all find queries to filter `deletedAt: null`.

---

## Entities Missing Soft Delete

| Entity | Model | Risk of Missing |
|--------|-------|----------------|
| Order | `Order` | Orders permanently deleted — breaks order history |
| Quote | `Quote` | Quotes permanently deleted — breaks quote history |
| Invoice | `Invoice` | Financial audit trail broken — compliance risk |
| Settlement | `Settlement` | Financial audit trail broken — compliance risk |
| PaymentMade | `PaymentMade` | Payment records lost |
| PaymentReceived | `PaymentReceived` | Payment records lost |

---

## File Plan

| File | Change |
|------|--------|
| `apps/api/prisma/schema.prisma` | Add `deletedAt DateTime?` to 6 models |
| `apps/api/prisma/migrations/YYYYMMDD_add_soft_delete/migration.sql` | Auto-generated migration |
| `apps/api/src/modules/operations/orders.service.ts` | Replace `prisma.order.delete()` with `update({data: {deletedAt: new Date()}})` + add `deletedAt: null` to all findMany |
| `apps/api/src/modules/operations/loads.service.ts` | Add `deletedAt: null` filter (verify if already has soft delete) |
| `apps/api/src/modules/sales/quotes.service.ts` | Same pattern as orders |
| `apps/api/src/modules/accounting/invoices.service.ts` | Same pattern |
| `apps/api/src/modules/accounting/settlements.service.ts` | Same pattern |
| `apps/api/src/modules/accounting/payments.service.ts` | Same pattern |

---

## Acceptance Criteria

1. `pnpm check-types` passes with 0 errors after migration
2. `pnpm --filter api prisma:migrate` runs without error
3. Calling `DELETE /orders/:id` returns 200 but the order still exists in the database with `deletedAt` set
4. `GET /orders` does NOT return soft-deleted orders
5. `GET /orders/:id` with a soft-deleted order ID returns 404
6. All 6 affected entities follow the same pattern (verified by grepping for `.delete(` in affected service files — should return 0 results for these entities)

---

## Migration Pattern

```prisma
// schema.prisma — add to each model
model Order {
  // ... existing fields ...
  deletedAt   DateTime?  // ← add this
}
```

```typescript
// Service pattern — replace delete with soft delete
async remove(id: string, tenantId: string): Promise<void> {
  const order = await this.prisma.order.findFirst({
    where: { id, tenantId, deletedAt: null }
  });
  if (!order) throw new NotFoundException('Order not found');

  await this.prisma.order.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

// All findMany must include deletedAt: null
async findAll(tenantId: string) {
  return this.prisma.order.findMany({
    where: { tenantId, deletedAt: null }  // ← always include this
  });
}
```

---

## Dependencies

- **Blocks:** Nothing in quality sprint
- **Blocked by:** None
- **Requires:** Running database (docker-compose up)

---

## Verification

```bash
pnpm --filter api prisma:migrate
pnpm check-types
pnpm --filter api test

# Verify soft delete works
curl -X DELETE http://localhost:3001/api/v1/orders/{id}
# Verify it's soft-deleted (should return 404 now)
curl http://localhost:3001/api/v1/orders/{id}
# Verify it's still in DB
pnpm --filter api prisma:studio  # Check orders table
```
