# QS-003: Accounting Dashboard Endpoint

**Priority:** P0
**Effort:** M (2-4 hours)
**Status:** planned
**Assigned:** Claude Code

---

## Context Header (Read These First)

1. `apps/api/src/modules/accounting/accounting.controller.ts` — Check if dashboard route exists
2. `apps/api/src/modules/accounting/accounting.service.ts` — Where to add dashboard logic
3. `apps/api/prisma/schema.prisma` — Invoice, Settlement, PaymentMade, PaymentReceived models
4. `apps/web/lib/hooks/accounting/use-accounting-dashboard.ts` — Frontend hook expecting the endpoint
5. `dev_docs_v3/01-services/p0-mvp/07-accounting.md` — Accounting service hub (business rules)

---

## Objective

Create the `GET /accounting/dashboard` endpoint that returns KPI summary data for the accounting module. This is the single missing endpoint that blocks the entire accounting dashboard from working.

---

## Expected Response Shape

```typescript
interface AccountingDashboardDto {
  // Receivables
  totalReceivables: number;    // Sum of UNPAID invoice amounts
  overdueReceivables: number;  // Sum of OVERDUE invoice amounts
  invoiceCount: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };

  // Payables
  totalPayables: number;       // Sum of PENDING settlement amounts
  pendingSettlements: number;  // Count of PENDING settlements

  // This month
  revenueThisMonth: number;    // Sum of payments received this calendar month
  expensesThisMonth: number;   // Sum of payments made this calendar month
  marginThisMonth: number;     // revenue - expenses

  // Aging buckets (for aging report)
  aging: {
    current: number;     // 0-30 days
    days30: number;      // 31-60 days
    days60: number;      // 61-90 days
    days90Plus: number;  // 91+ days
  };
}
```

---

## File Plan

| File | Change |
|------|--------|
| `apps/api/src/modules/accounting/dto/accounting-dashboard.dto.ts` | Create response DTO with class-validator |
| `apps/api/src/modules/accounting/accounting.service.ts` | Add `getDashboard(tenantId)` method |
| `apps/api/src/modules/accounting/accounting.controller.ts` | Add `@Get('dashboard')` endpoint |
| `apps/api/src/modules/accounting/accounting.module.ts` | Verify PrismaService is injected (likely already is) |

---

## Implementation

```typescript
// accounting.service.ts
async getDashboard(tenantId: string): Promise<AccountingDashboardDto> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [invoices, settlements, paymentsReceived, paymentsMade] = await Promise.all([
    this.prisma.invoice.findMany({ where: { tenantId, deletedAt: null } }),
    this.prisma.settlement.findMany({ where: { tenantId, deletedAt: null } }),
    this.prisma.paymentReceived.findMany({ where: { tenantId, receivedAt: { gte: startOfMonth } } }),
    this.prisma.paymentMade.findMany({ where: { tenantId, paidAt: { gte: startOfMonth } } }),
  ]);

  // Aggregate...
  return {
    totalReceivables: invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + Number(i.amount), 0),
    // ... etc
  };
}
```

---

## Acceptance Criteria

1. `GET /api/v1/accounting/dashboard` returns HTTP 200 with valid JSON matching the DTO shape
2. Endpoint requires JWT authentication (no `@Public()` decorator)
3. All monetary amounts are filtered by `tenantId` — no cross-tenant data leakage
4. Response includes correct invoice counts by status (DRAFT, SENT, PAID, OVERDUE)
5. Aging buckets correctly categorize invoices by days past due date
6. `pnpm check-types` passes with 0 errors
7. At least 2 unit tests: one verifies empty tenant returns zeros, one verifies sums are calculated correctly

---

## Dependencies

- **Blocks:** Accounting Dashboard screen build (post-quality-sprint)
- **Blocked by:** QS-002 (if Invoice/Settlement don't have deletedAt yet — run QS-002 first or add `?? null` filter defensively)

---

## Verification

```bash
# Start API
pnpm dev

# Hit the endpoint
curl -H "Authorization: Bearer {token}" http://localhost:3001/api/v1/accounting/dashboard

# Should return 200 with the DTO shape
# Should return 401 without auth
```
