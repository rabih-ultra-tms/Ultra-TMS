# QS-002: Soft Delete Migration

**Priority:** P0
**Effort:** S (was M — most work already done)
**Status:** **DONE** (2026-03-09)
**Assigned:** Claude Code

---

## Context Header (Read These First)

1. `apps/api/prisma/schema.prisma` — Find Order, Quote, Invoice, Settlement, PaymentMade, PaymentReceived models
2. `apps/api/src/modules/sales/quotes.service.ts` — QuotesService generateQuoteNumber (had gap)
3. `apps/api/src/modules/accounting/services/payments-received.service.ts` — markBounced (had gap)
4. `dev_docs_v3/00-foundations/domain-rules.md` — 7-year financial data retention rule

---

## Objective

Verify all 6 entities have `deletedAt DateTime?` in schema, all services use soft delete, and all queries filter `deletedAt: null`. Fix any gaps.

---

## Resolution Notes (2026-03-09)

**Schema:** All 6 models already had `deletedAt DateTime?` — no migration needed.

**Services:** All 6 services already used soft delete patterns (set `deletedAt` instead of hard delete). Only 2 minor query gaps found and fixed:

| Gap | File | Fix |
|-----|------|-----|
| `generateQuoteNumber()` query missing `deletedAt: null` | `quotes.service.ts:22` | Added `deletedAt: null` to where clause |
| `markBounced()` invoice lookup missing `deletedAt: null` | `payments-received.service.ts:231` | Changed `findUnique` to `findFirst` with `deletedAt: null` |

**Hard deletes (justified):** Orders and Quotes hard-delete child records (Stop, QuoteStop) during updates due to `@@unique` constraints on `[orderId, stopSequence]`. These are intentional and documented.

**Prisma tenant extension (QS-014):** Exists at `prisma-tenant.extension.ts` and auto-injects `deletedAt: null` into reads, but no services use `forTenant()` yet. Manual filters are correct across all 6 services.

---

## File Plan (Actual Changes)

| File | Change |
|------|--------|
| `apps/api/src/modules/sales/quotes.service.ts` | Added `deletedAt: null` to `generateQuoteNumber()` findFirst query |
| `apps/api/src/modules/accounting/services/payments-received.service.ts` | Changed `findUnique` to `findFirst` with `deletedAt: null` in `markBounced()` |

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
