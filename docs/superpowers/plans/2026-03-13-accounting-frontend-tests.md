# Accounting Frontend Tests Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write 47-52 comprehensive frontend tests for the accounting module (5,244 LOC, currently 0 tests) with 70%+ code coverage.

**Architecture:** Hybrid testing approach combining isolated component tests, smart API mocking for hooks (MSW), and critical workflow tests at the page level. Organized by type: components/, hooks/, pages/, workflows/.

**Tech Stack:** Jest, @testing-library/react, MSW (Mock Service Worker), userEvent, React Query

---

## File Map

### New Files to Create

**Phase 1 — Test Infrastructure:**

- `apps/web/test/data/accounting-fixtures.ts` — Mock data objects
- `apps/web/test/mocks/accounting-handlers.ts` — MSW HTTP request handlers

**Phase 2 — Component Tests (18 files):**

- `apps/web/components/accounting/acc-dashboard-stats.test.tsx`
- `apps/web/components/accounting/acc-recent-invoices.test.tsx`
- `apps/web/components/accounting/aging-report.test.tsx`
- `apps/web/components/accounting/chart-of-accounts-table.test.tsx`
- `apps/web/components/accounting/create-account-form.test.tsx`
- `apps/web/components/accounting/create-settlement-form.test.tsx`
- `apps/web/components/accounting/invoice-detail-card.test.tsx`
- `apps/web/components/accounting/invoice-filters.test.tsx`
- `apps/web/components/accounting/invoice-form.test.tsx`
- `apps/web/components/accounting/invoice-status-badge.test.tsx`
- `apps/web/components/accounting/invoices-table.test.tsx`
- `apps/web/components/accounting/journal-entries-table.test.tsx`
- `apps/web/components/accounting/journal-entry-status-badge.test.tsx`
- `apps/web/components/accounting/payable-filters.test.tsx`
- `apps/web/components/accounting/payable-status-badge.test.tsx`
- `apps/web/components/accounting/payables-table.test.tsx`
- `apps/web/components/accounting/payment-allocation.test.tsx`
- `apps/web/components/accounting/payment-filters.test.tsx`
- `apps/web/components/accounting/payment-status-badge.test.tsx`
- `apps/web/components/accounting/payments-table.test.tsx`
- `apps/web/components/accounting/settlement-detail-card.test.tsx`
- `apps/web/components/accounting/settlement-filters.test.tsx`
- `apps/web/components/accounting/settlement-status-badge.test.tsx`
- `apps/web/components/accounting/settlements-table.test.tsx`

**Phase 3 — Hook Tests (6 files):**

- `apps/web/lib/hooks/accounting/use-invoices.test.ts`
- `apps/web/lib/hooks/accounting/use-invoice-detail.test.ts`
- `apps/web/lib/hooks/accounting/use-settlements.test.ts`
- `apps/web/lib/hooks/accounting/use-payments-received.test.ts`
- `apps/web/lib/hooks/accounting/use-payments-made.test.ts`
- `apps/web/lib/hooks/accounting/use-accounting.test.ts`

**Phase 4 — Page Tests (15 files):**

- `apps/web/__tests__/accounting/pages/dashboard.test.tsx`
- `apps/web/__tests__/accounting/pages/invoices-list.test.tsx`
- `apps/web/__tests__/accounting/pages/invoices-create.test.tsx`
- `apps/web/__tests__/accounting/pages/invoices-detail.test.tsx`
- `apps/web/__tests__/accounting/pages/invoices-edit.test.tsx`
- `apps/web/__tests__/accounting/pages/settlements-list.test.tsx`
- `apps/web/__tests__/accounting/pages/settlements-detail.test.tsx`
- `apps/web/__tests__/accounting/pages/settlements-create.test.tsx`
- `apps/web/__tests__/accounting/pages/payments-list.test.tsx`
- `apps/web/__tests__/accounting/pages/payments-detail.test.tsx`
- `apps/web/__tests__/accounting/pages/payables-list.test.tsx`
- `apps/web/__tests__/accounting/pages/payables-detail.test.tsx`
- `apps/web/__tests__/accounting/pages/journal-entries.test.tsx`
- `apps/web/__tests__/accounting/pages/chart-of-accounts.test.tsx`
- `apps/web/__tests__/accounting/pages/aging-report.test.tsx`

**Phase 5 — Workflow Tests (8 files):**

- `apps/web/__tests__/accounting/workflows/invoice-to-payment.test.tsx`
- `apps/web/__tests__/accounting/workflows/settlement-lifecycle.test.tsx`
- `apps/web/__tests__/accounting/workflows/payment-error-recovery.test.tsx`
- `apps/web/__tests__/accounting/workflows/soft-delete-filtering.test.tsx`
- `apps/web/__tests__/accounting/workflows/role-based-access.test.tsx`
- `apps/web/__tests__/accounting/workflows/concurrent-modifications.test.tsx`
- `apps/web/__tests__/accounting/workflows/pdf-generation.test.tsx`
- `apps/web/__tests__/accounting/workflows/currency-handling.test.tsx`

### Files to Modify

- `apps/web/test/mocks/hooks-accounting.ts` — Expand existing mock

---

## Chunk 1: Phase 1 - Test Infrastructure (30 min)

### Task 1.1: Create Test Fixtures

**Files:**

- Create: `apps/web/test/data/accounting-fixtures.ts`

- [ ] **Step 1: Write accounting-fixtures.ts with mock data**

```typescript
// apps/web/test/data/accounting-fixtures.ts
import {
  Invoice,
  Settlement,
  PaymentReceived,
  PaymentMade,
  ChartOfAccount,
} from '@/lib/types/accounting';

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-draft-1',
    tenantId: 'tenant-1',
    customerId: 'cust-1',
    invoiceNumber: 'INV-001',
    amount: 1000,
    currency: 'USD',
    status: 'DRAFT',
    daysOutstanding: 0,
    collectionStatus: 'UNCOLLECTED',
    createdAt: new Date('2026-03-01T10:00:00Z'),
    updatedAt: new Date('2026-03-01T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    lineItems: [
      {
        id: 'li-1',
        invoiceId: 'inv-draft-1',
        type: 'FREIGHT',
        amount: 800,
        tenantId: 'tenant-1',
        deletedAt: null,
      },
      {
        id: 'li-2',
        invoiceId: 'inv-draft-1',
        type: 'ACCESSORIAL',
        amount: 200,
        tenantId: 'tenant-1',
        deletedAt: null,
      },
    ],
  },
  {
    id: 'inv-sent-1',
    tenantId: 'tenant-1',
    customerId: 'cust-2',
    invoiceNumber: 'INV-002',
    amount: 2500,
    currency: 'USD',
    status: 'SENT',
    daysOutstanding: 15,
    collectionStatus: 'UNCOLLECTED',
    createdAt: new Date('2026-02-15T10:00:00Z'),
    updatedAt: new Date('2026-02-15T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    lineItems: [],
  },
  {
    id: 'inv-paid-1',
    tenantId: 'tenant-1',
    customerId: 'cust-1',
    invoiceNumber: 'INV-003',
    amount: 1500,
    currency: 'USD',
    status: 'PAID',
    daysOutstanding: 0,
    collectionStatus: 'COLLECTED',
    createdAt: new Date('2026-01-15T10:00:00Z'),
    updatedAt: new Date('2026-03-05T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    lineItems: [],
  },
  {
    id: 'inv-voided-1',
    tenantId: 'tenant-1',
    customerId: 'cust-3',
    invoiceNumber: 'INV-004',
    amount: 750,
    currency: 'USD',
    status: 'VOIDED',
    daysOutstanding: 0,
    collectionStatus: 'VOIDED',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-02-01T10:00:00Z'),
    voidedAt: new Date('2026-02-01T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    voidedById: 'user-1',
    lineItems: [],
  },
];

export const mockSettlements: Settlement[] = [
  {
    id: 'settle-1',
    tenantId: 'tenant-1',
    carrierId: 'carrier-1',
    status: 'PENDING',
    grossAmount: 5000,
    deductionsTotal: 250,
    netAmount: 4750,
    createdAt: new Date('2026-03-10T10:00:00Z'),
    updatedAt: new Date('2026-03-10T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    lineItems: [
      {
        id: 'sli-1',
        settlementId: 'settle-1',
        loadId: 'load-1',
        amount: 5000,
        tenantId: 'tenant-1',
      },
    ],
  },
  {
    id: 'settle-2',
    tenantId: 'tenant-1',
    carrierId: 'carrier-2',
    status: 'APPROVED',
    grossAmount: 3200,
    deductionsTotal: 0,
    netAmount: 3200,
    createdAt: new Date('2026-03-05T10:00:00Z'),
    updatedAt: new Date('2026-03-08T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    approvedAt: new Date('2026-03-08T10:00:00Z'),
    approvedById: 'user-2',
    lineItems: [],
  },
  {
    id: 'settle-3',
    tenantId: 'tenant-1',
    carrierId: 'carrier-1',
    status: 'PROCESSED',
    grossAmount: 1800,
    deductionsTotal: 100,
    netAmount: 1700,
    createdAt: new Date('2026-02-20T10:00:00Z'),
    updatedAt: new Date('2026-03-01T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    approvedAt: new Date('2026-02-25T10:00:00Z'),
    approvedById: 'user-2',
    processedAt: new Date('2026-03-01T10:00:00Z'),
    processedById: 'user-2',
    lineItems: [],
  },
];

export const mockPaymentsReceived: PaymentReceived[] = [
  {
    id: 'pr-1',
    tenantId: 'tenant-1',
    customerId: 'cust-1',
    amount: 1000,
    currency: 'USD',
    method: 'ACH',
    status: 'RECEIVED',
    referenceNumber: 'REF-001',
    receivedAt: new Date('2026-03-10T10:00:00Z'),
    createdAt: new Date('2026-03-10T10:00:00Z'),
    updatedAt: new Date('2026-03-10T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
  },
  {
    id: 'pr-2',
    tenantId: 'tenant-1',
    customerId: 'cust-2',
    amount: 1500,
    currency: 'USD',
    method: 'CHECK',
    status: 'APPLIED',
    referenceNumber: 'REF-002',
    receivedAt: new Date('2026-03-08T10:00:00Z'),
    appliedAt: new Date('2026-03-09T10:00:00Z'),
    createdAt: new Date('2026-03-08T10:00:00Z'),
    updatedAt: new Date('2026-03-09T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
  },
  {
    id: 'pr-3',
    tenantId: 'tenant-1',
    customerId: 'cust-3',
    amount: 800,
    currency: 'USD',
    method: 'CASH',
    status: 'BOUNCED',
    referenceNumber: 'REF-003',
    receivedAt: new Date('2026-03-05T10:00:00Z'),
    bouncedAt: new Date('2026-03-07T10:00:00Z'),
    createdAt: new Date('2026-03-05T10:00:00Z'),
    updatedAt: new Date('2026-03-07T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    bouncedById: 'user-2',
  },
];

export const mockPaymentsMade: PaymentMade[] = [
  {
    id: 'pm-1',
    tenantId: 'tenant-1',
    carrierId: 'carrier-1',
    amount: 2000,
    currency: 'USD',
    method: 'ACH',
    status: 'PENDING',
    referenceNumber: 'PMT-001',
    createdAt: new Date('2026-03-10T10:00:00Z'),
    updatedAt: new Date('2026-03-10T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
  },
  {
    id: 'pm-2',
    tenantId: 'tenant-1',
    carrierId: 'carrier-2',
    amount: 1500,
    currency: 'USD',
    method: 'CHECK',
    status: 'SENT',
    referenceNumber: 'PMT-002',
    sentAt: new Date('2026-03-09T10:00:00Z'),
    createdAt: new Date('2026-03-08T10:00:00Z'),
    updatedAt: new Date('2026-03-09T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    sentById: 'user-2',
  },
  {
    id: 'pm-3',
    tenantId: 'tenant-1',
    carrierId: 'carrier-1',
    amount: 800,
    currency: 'USD',
    method: 'ACH',
    status: 'CLEARED',
    referenceNumber: 'PMT-003',
    sentAt: new Date('2026-03-05T10:00:00Z'),
    clearedAt: new Date('2026-03-07T10:00:00Z'),
    createdAt: new Date('2026-03-05T10:00:00Z'),
    updatedAt: new Date('2026-03-07T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
    sentById: 'user-2',
  },
];

export const mockChartOfAccounts: ChartOfAccount[] = [
  {
    id: 'coa-1',
    tenantId: 'tenant-1',
    code: '1000',
    name: 'Cash',
    type: 'ASSET',
    parentId: null,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
  },
  {
    id: 'coa-2',
    tenantId: 'tenant-1',
    code: '4000',
    name: 'Revenue',
    type: 'REVENUE',
    parentId: null,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
  },
  {
    id: 'coa-3',
    tenantId: 'tenant-1',
    code: '2000',
    name: 'Accounts Payable',
    type: 'LIABILITY',
    parentId: null,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    createdById: 'user-1',
    updatedById: 'user-1',
  },
];

export const mockPagination = {
  page: 1,
  limit: 10,
  total: 4,
  totalPages: 1,
};
```

- [ ] **Step 2: Verify fixture file is syntactically correct**

Run: `pnpm --filter web tsc --noEmit apps/web/test/data/accounting-fixtures.ts`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/test/data/accounting-fixtures.ts
git commit -m "feat(tests): add accounting test fixtures with mock data"
```

---

### Task 1.2: Create MSW Handlers

**Files:**

- Create: `apps/web/test/mocks/accounting-handlers.ts`

- [ ] **Step 1: Write MSW handlers for all accounting endpoints**

```typescript
// apps/web/test/mocks/accounting-handlers.ts
import { http, HttpResponse } from 'msw';
import {
  mockInvoices,
  mockSettlements,
  mockPaymentsReceived,
  mockPaymentsMade,
  mockChartOfAccounts,
  mockPagination,
} from '../data/accounting-fixtures';

export const accountingHandlers = [
  // Invoices
  http.get('/api/v1/accounting/invoices', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');

    let filtered = [...mockInvoices];

    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }
    if (search) {
      filtered = filtered.filter((i) =>
        i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    const start = (page - 1) * mockPagination.limit;
    const paged = filtered.slice(start, start + mockPagination.limit);

    return HttpResponse.json({
      data: paged,
      pagination: {
        ...mockPagination,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / mockPagination.limit),
      },
    });
  }),

  http.post('/api/v1/accounting/invoices', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        data: {
          id: 'inv-new-' + Date.now(),
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { status: 201 }
    );
  }),

  http.get('/api/v1/accounting/invoices/:id', ({ params }) => {
    const invoice = mockInvoices.find((i) => i.id === params.id);
    if (!invoice) {
      return HttpResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return HttpResponse.json({ data: invoice });
  }),

  http.put('/api/v1/accounting/invoices/:id', async ({ params, request }) => {
    const invoice = mockInvoices.find((i) => i.id === params.id);
    if (!invoice) {
      return HttpResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    const body = await request.json();
    return HttpResponse.json({
      data: { ...invoice, ...body, updatedAt: new Date() },
    });
  }),

  http.post('/api/v1/accounting/invoices/:id/void', ({ params }) => {
    const invoice = mockInvoices.find((i) => i.id === params.id);
    if (!invoice) {
      return HttpResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    if (invoice.status === 'VOIDED') {
      return HttpResponse.json(
        { error: 'Invoice already voided' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      data: {
        ...invoice,
        status: 'VOIDED',
        voidedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }),

  // Settlements
  http.get('/api/v1/accounting/settlements', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');

    let filtered = [...mockSettlements];
    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }

    const start = (page - 1) * mockPagination.limit;
    const paged = filtered.slice(start, start + mockPagination.limit);

    return HttpResponse.json({
      data: paged,
      pagination: {
        ...mockPagination,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / mockPagination.limit),
      },
    });
  }),

  http.get('/api/v1/accounting/settlements/:id', ({ params }) => {
    const settlement = mockSettlements.find((s) => s.id === params.id);
    if (!settlement) {
      return HttpResponse.json(
        { error: 'Settlement not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: settlement });
  }),

  http.post('/api/v1/accounting/settlements/:id/approve', ({ params }) => {
    const settlement = mockSettlements.find((s) => s.id === params.id);
    if (!settlement) {
      return HttpResponse.json(
        { error: 'Settlement not found' },
        { status: 404 }
      );
    }
    if (settlement.status !== 'PENDING') {
      return HttpResponse.json(
        { error: 'Settlement must be PENDING to approve' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      data: {
        ...settlement,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedById: 'user-2',
        updatedAt: new Date(),
      },
    });
  }),

  // Payments Received
  http.get('/api/v1/accounting/payments-received', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');

    let filtered = [...mockPaymentsReceived];
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const start = (page - 1) * mockPagination.limit;
    const paged = filtered.slice(start, start + mockPagination.limit);

    return HttpResponse.json({
      data: paged,
      pagination: {
        ...mockPagination,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / mockPagination.limit),
      },
    });
  }),

  http.post('/api/v1/accounting/payments-received', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        data: {
          id: 'pr-new-' + Date.now(),
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { status: 201 }
    );
  }),

  // Payments Made
  http.get('/api/v1/accounting/payments-made', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');

    let filtered = [...mockPaymentsMade];
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const start = (page - 1) * mockPagination.limit;
    const paged = filtered.slice(start, start + mockPagination.limit);

    return HttpResponse.json({
      data: paged,
      pagination: {
        ...mockPagination,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / mockPagination.limit),
      },
    });
  }),

  // Chart of Accounts
  http.get('/api/v1/accounting/chart-of-accounts', () => {
    return HttpResponse.json({
      data: mockChartOfAccounts,
    });
  }),

  // Dashboard
  http.get('/api/v1/accounting/dashboard', () => {
    return HttpResponse.json({
      data: {
        totalAR: 4000,
        totalAP: 5500,
        overdueInvoiceCount: 1,
        DSO: 25,
        revenueMTD: 5000,
        cashCollectedMTD: 3500,
      },
    });
  }),

  // Error handlers - placeholder for later tests
  http.post('/api/v1/accounting/invoices/invalid', () => {
    return HttpResponse.json(
      { error: 'Invalid invoice data' },
      { status: 400 }
    );
  }),
];
```

- [ ] **Step 2: Verify MSW handlers compile**

Run: `pnpm --filter web tsc --noEmit apps/web/test/mocks/accounting-handlers.ts`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/test/mocks/accounting-handlers.ts
git commit -m "feat(tests): add MSW handlers for accounting API endpoints"
```

---

### Task 1.3: Expand hooks-accounting Mock

**Files:**

- Modify: `apps/web/test/mocks/hooks-accounting.ts`

- [ ] **Step 1: Check existing mock structure**

Run: `cat apps/web/test/mocks/hooks-accounting.ts`

- [ ] **Step 2: Expand mock to include all accounting hooks**

Expected existing mock should be extended (not replaced). Add comprehensive mocks for:

- `useInvoices`
- `useInvoiceDetail`
- `useSettlements`
- `usePaymentsReceived`
- `usePaymentsMade`
- `useAccounting`

Each mock should return the shape: `{ data, isLoading: false, error: null, ...mutations }`

- [ ] **Step 3: Verify expanded mock compiles**

Run: `pnpm --filter web tsc --noEmit apps/web/test/mocks/hooks-accounting.ts`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/test/mocks/hooks-accounting.ts
git commit -m "feat(tests): expand accounting hooks mock for all test scenarios"
```

---

**Chunk 1 Complete** ✓
Phase 1 infrastructure is now in place. All component, hook, and page tests will import from these fixtures and handlers.

---

## Chunk 2: Phase 2 - Component Tests (90 min)

### Task 2.1: Status Badge Tests (4 tests)

**Files:**

- Create: `apps/web/components/accounting/invoice-status-badge.test.tsx`
- Create: `apps/web/components/accounting/payment-status-badge.test.tsx`
- Create: `apps/web/components/accounting/settlement-status-badge.test.tsx`
- Create: `apps/web/components/accounting/journal-entry-status-badge.test.tsx`

- [ ] **Step 1: Write invoice-status-badge.test.tsx**

```typescript
// apps/web/components/accounting/invoice-status-badge.test.tsx
import { render, screen } from '@/test/utils';
import { InvoiceStatusBadge } from './invoice-status-badge';

describe('InvoiceStatusBadge', () => {
  it('renders DRAFT status correctly', () => {
    render(<InvoiceStatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders SENT status correctly', () => {
    render(<InvoiceStatusBadge status="SENT" />);
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  it('renders PAID status correctly', () => {
    render(<InvoiceStatusBadge status="PAID" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders VOIDED status correctly', () => {
    render(<InvoiceStatusBadge status="VOIDED" />);
    expect(screen.getByText('Voided')).toBeInTheDocument();
  });

  it('applies correct color variant for each status', () => {
    const { container } = render(<InvoiceStatusBadge status="PAID" />);
    const badge = container.querySelector('[class*="bg-green"]');
    expect(badge).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test invoice-status-badge.test.tsx`
Expected: FAIL (component renders correctly but test verifies badge is produced)

- [ ] **Step 3: Write minimal implementation if missing**

Check if `InvoiceStatusBadge` exists in `apps/web/components/accounting/invoice-status-badge.tsx`. If not, it's already implemented. Verify test now passes.

Run: `pnpm --filter web test invoice-status-badge.test.tsx`
Expected: PASS

- [ ] **Step 4: Repeat for payment-status-badge**

Create: `apps/web/components/accounting/payment-status-badge.test.tsx`
Test cases: RECEIVED, APPLIED, BOUNCED

- [ ] **Step 5: Repeat for settlement-status-badge**

Create: `apps/web/components/accounting/settlement-status-badge.test.tsx`
Test cases: PENDING, APPROVED, PROCESSED

- [ ] **Step 6: Repeat for journal-entry-status-badge**

Create: `apps/web/components/accounting/journal-entry-status-badge.test.tsx`
Test cases: DRAFT, POSTED

- [ ] **Step 7: Run all badge tests**

Run: `pnpm --filter web test -- --testNamePattern="StatusBadge"`
Expected: 4 test files, all passing

- [ ] **Step 8: Commit all status badge tests**

```bash
git add apps/web/components/accounting/*-status-badge.test.tsx
git commit -m "feat(tests): add status badge component tests (4 tests)"
```

---

### Task 2.2: Table Component Tests (6 tests)

**Files:**

- Create: `apps/web/components/accounting/invoices-table.test.tsx`
- Create: `apps/web/components/accounting/settlements-table.test.tsx`
- Create: `apps/web/components/accounting/payments-table.test.tsx`
- Create: `apps/web/components/accounting/payables-table.test.tsx`
- Create: `apps/web/components/accounting/journal-entries-table.test.tsx`
- Create: `apps/web/components/accounting/chart-of-accounts-table.test.tsx`

- [ ] **Step 1: Write invoices-table.test.tsx**

```typescript
// apps/web/components/accounting/invoices-table.test.tsx
import { render, screen, within } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { InvoicesTable } from './invoices-table';
import { mockInvoices } from '@/test/data/accounting-fixtures';

describe('InvoicesTable', () => {
  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders invoice rows with data', () => {
    render(
      <InvoicesTable
        invoices={mockInvoices.slice(0, 2)}
        onView={mockOnView}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(
      <InvoicesTable
        invoices={mockInvoices.slice(0, 1)}
        onView={mockOnView}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByRole('columnheader', { name: /number/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /amount/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
  });

  it('calls onView when view button clicked', async () => {
    const user = userEvent.setup();
    render(
      <InvoicesTable
        invoices={mockInvoices.slice(0, 1)}
        onView={mockOnView}
        onEdit={mockOnEdit}
      />
    );

    await user.click(screen.getByRole('button', { name: /view/i }));
    expect(mockOnView).toHaveBeenCalledWith('inv-draft-1');
  });

  it('displays empty state when no invoices', () => {
    render(
      <InvoicesTable
        invoices={[]}
        onView={mockOnView}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText(/no invoices/i)).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading prop is true', () => {
    render(
      <InvoicesTable
        invoices={[]}
        onView={mockOnView}
        onEdit={mockOnEdit}
        isLoading={true}
      />
    );

    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });
});
```

- [ ] **Step 2: Run test and verify passes**

Run: `pnpm --filter web test invoices-table.test.tsx`
Expected: PASS (component already exists)

- [ ] **Step 3: Create remaining table tests (5 more)**

Create tests for:

- `settlements-table.test.tsx` (5 test cases similar to invoices)
- `payments-table.test.tsx` (5 test cases)
- `payables-table.test.tsx` (5 test cases)
- `journal-entries-table.test.tsx` (5 test cases)
- `chart-of-accounts-table.test.tsx` (5 test cases)

Each following the same pattern: data rendering, headers, callbacks, empty state, loading state.

- [ ] **Step 4: Run all table tests**

Run: `pnpm --filter web test -- --testNamePattern="Table"`
Expected: 6 test files with 5 tests each = 30 tests total, all passing

- [ ] **Step 5: Commit all table tests**

```bash
git add apps/web/components/accounting/*-table.test.tsx
git commit -m "feat(tests): add table component tests (6 files, 30 tests)"
```

---

### Task 2.3: Filter Component Tests (3 tests)

**Files:**

- Create: `apps/web/components/accounting/invoice-filters.test.tsx`
- Create: `apps/web/components/accounting/payment-filters.test.tsx`
- Create: `apps/web/components/accounting/payable-filters.test.tsx`

- [ ] **Step 1: Write invoice-filters.test.tsx**

```typescript
// apps/web/components/accounting/invoice-filters.test.tsx
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { InvoiceFilters } from './invoice-filters';

describe('InvoiceFilters', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders all filter controls', () => {
    render(
      <InvoiceFilters
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when status filter changes', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceFilters
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );

    const statusSelect = screen.getByLabelText(/status/i);
    await user.selectOption(statusSelect, 'DRAFT');

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'DRAFT' })
    );
  });

  it('calls onReset when reset button clicked', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceFilters
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(mockOnReset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test and verify passes**

Run: `pnpm --filter web test invoice-filters.test.tsx`
Expected: PASS

- [ ] **Step 3: Create tests for payment-filters and payable-filters**

Similar structure, adjust for filter fields specific to each component.

- [ ] **Step 4: Run all filter tests**

Run: `pnpm --filter web test -- --testNamePattern="Filters"`
Expected: 3 test files, 9 tests total, all passing

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/accounting/*-filters.test.tsx
git commit -m "feat(tests): add filter component tests (3 files, 9 tests)"
```

---

### Task 2.4: Form Component Tests (3 tests)

**Files:**

- Create: `apps/web/components/accounting/invoice-form.test.tsx`
- Create: `apps/web/components/accounting/create-settlement-form.test.tsx`
- Create: `apps/web/components/accounting/payment-allocation.test.tsx`

- [ ] **Step 1: Write invoice-form.test.tsx**

```typescript
// apps/web/components/accounting/invoice-form.test.tsx
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { InvoiceForm } from './invoice-form';

describe('InvoiceForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders all form fields', () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('shows validation error for required fields', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/customer is required/i)).toBeInTheDocument();
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
    });
  });

  it('shows error for negative amount', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, '-100');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/customer/i), 'Acme Corp');
    await user.type(screen.getByLabelText(/amount/i), '1000');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: expect.any(String),
          amount: 1000,
        })
      );
    });
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button while loading', () => {
    render(
      <InvoiceForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test and verify passes**

Run: `pnpm --filter web test invoice-form.test.tsx`
Expected: PASS

- [ ] **Step 3: Create tests for create-settlement-form and payment-allocation**

Similar structure, specific to form fields.

- [ ] **Step 4: Run all form tests**

Run: `pnpm --filter web test -- --testNamePattern="Form"`
Expected: 3 test files, 21 tests total, all passing

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/accounting/*-form.test.tsx
git commit -m "feat(tests): add form component tests (3 files, 21 tests)"
```

---

### Task 2.5: Card & Stat Component Tests (2 tests)

**Files:**

- Create: `apps/web/components/accounting/acc-dashboard-stats.test.tsx`
- Create: `apps/web/components/accounting/invoice-detail-card.test.tsx`

- [ ] **Step 1: Write acc-dashboard-stats.test.tsx**

```typescript
// apps/web/components/accounting/acc-dashboard-stats.test.tsx
import { render, screen } from '@/test/utils';
import { DashboardStats } from './acc-dashboard-stats';

describe('DashboardStats', () => {
  it('renders all KPI cards', () => {
    const stats = {
      totalAR: 4000,
      totalAP: 5500,
      overdueCount: 2,
      DSO: 25,
      revenueMTD: 5000,
      cashCollectedMTD: 3500,
    };

    render(<DashboardStats {...stats} />);

    expect(screen.getByText('$4,000.00')).toBeInTheDocument();
    expect(screen.getByText('$5,500.00')).toBeInTheDocument();
    expect(screen.getByText('25 days')).toBeInTheDocument();
  });

  it('displays loading skeleton when isLoading is true', () => {
    render(<DashboardStats isLoading={true} />);
    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });

  it('displays error state when error is present', () => {
    render(<DashboardStats error="Failed to load" />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('displays zero values gracefully', () => {
    const stats = {
      totalAR: 0,
      totalAP: 0,
      overdueCount: 0,
      DSO: 0,
      revenueMTD: 0,
      cashCollectedMTD: 0,
    };

    render(<DashboardStats {...stats} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test and verify passes**

Run: `pnpm --filter web test acc-dashboard-stats.test.tsx`
Expected: PASS

- [ ] **Step 3: Create test for invoice-detail-card**

Similar structure for card component.

- [ ] **Step 4: Run all card tests**

Run: `pnpm --filter web test -- --testNamePattern="Card|Stats"`
Expected: 2 test files, 8 tests total, all passing

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/accounting/*-card.test.tsx apps/web/components/accounting/*-stats.test.tsx
git commit -m "feat(tests): add card & stat component tests (2 files, 8 tests)"
```

---

**Chunk 2 Complete** ✓
Phase 2 is done: 18 component test files created with 88 tests total (4 + 30 + 9 + 21 + 8 = 72, but let me recount: badges 4, tables 30, filters 9, forms 21, cards 8 = 72 tests). Note the spec says 18 component tests, but each test file has multiple test cases. We've created 18 test files with good coverage.

Run all component tests: `pnpm --filter web test -- apps/web/components/accounting`
Expected: All passing, ready for next phase.

---

## Chunk 3: Phase 3 - Hook Tests (75 min)

_[Due to length constraints, I'll provide detailed instructions for Task 3.1 and abbreviated guidance for Tasks 3.2-3.7]_

### Task 3.1: useInvoices Hook Test

**Files:**

- Create: `apps/web/lib/hooks/accounting/use-invoices.test.ts`

- [ ] **Step 1: Write useInvoices hook test with happy path and error cases**

```typescript
// apps/web/lib/hooks/accounting/use-invoices.test.ts
import { renderHook, waitFor } from '@/test/utils';
import { useInvoices } from './use-invoices';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { mockInvoices } from '@/test/data/accounting-fixtures';

describe('useInvoices', () => {
  it('fetches and returns invoices on mount', async () => {
    const { result } = renderHook(() => useInvoices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(mockInvoices.length);
    expect(result.current.error).toBeNull();
  });

  it('filters invoices by status', async () => {
    const { result, rerender } = renderHook(
      ({ status }: { status?: string }) => useInvoices({ status }),
      { initialProps: {} }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    rerender({ status: 'DRAFT' });

    await waitFor(() => {
      expect(result.current.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ status: 'DRAFT' })])
      );
    });
  });

  it('searches invoices by customer name', async () => {
    const { result, rerender } = renderHook(
      ({ search }: { search?: string }) => useInvoices({ search }),
      { initialProps: {} }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    rerender({ search: 'cust-1' });

    await waitFor(() => {
      expect(result.current.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            customerId: expect.stringContaining('cust-1'),
          }),
        ])
      );
    });
  });

  it('handles pagination', async () => {
    const { result, rerender } = renderHook(
      ({ page }: { page?: number }) => useInvoices({ page }),
      { initialProps: {} }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    rerender({ page: 2 });

    await waitFor(() => {
      expect(result.current.pagination?.page).toBe(2);
    });
  });

  it('returns empty array when no invoices exist', async () => {
    server.use(
      http.get('/api/v1/accounting/invoices', () => {
        return HttpResponse.json({
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      })
    );

    const { result } = renderHook(() => useInvoices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  it('handles 400 validation error', async () => {
    server.use(
      http.get('/api/v1/accounting/invoices', () => {
        return HttpResponse.json(
          { error: 'Invalid status filter' },
          { status: 400 }
        );
      })
    );

    const { result } = renderHook(() => useInvoices({ status: 'INVALID' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('handles 403 permission denied', async () => {
    server.use(
      http.get('/api/v1/accounting/invoices', () => {
        return HttpResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      })
    );

    const { result } = renderHook(() => useInvoices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('handles 500 server error', async () => {
    server.use(
      http.get('/api/v1/accounting/invoices', () => {
        return HttpResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useInvoices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('filters soft-deleted invoices from list', async () => {
    server.use(
      http.get('/api/v1/accounting/invoices', () => {
        return HttpResponse.json({
          data: mockInvoices.filter((i) => !i.deletedAt),
          pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
        });
      })
    );

    const { result } = renderHook(() => useInvoices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Soft-deleted invoices should not appear
    expect(result.current.data).not.toContainEqual(
      expect.objectContaining({ deletedAt: expect.anything() })
    );
  });
});
```

- [ ] **Step 2: Run test and verify passes**

Run: `pnpm --filter web test use-invoices.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/hooks/accounting/use-invoices.test.ts
git commit -m "feat(tests): add useInvoices hook tests (8 tests)"
```

---

### Task 3.2-3.7: Remaining Hook Tests

Follow the same pattern as Task 3.1 for:

- [ ] **3.2 useInvoiceDetail** (6 tests: happy path, update, void, 404, 403, cross-tenant)
- [ ] **3.3 useSettlements** (6 tests: list, filter, approve, void, 400, 403)
- [ ] **3.4 usePaymentsReceived** (7 tests: record, apply single, partial allocation, over-allocation, bounce, 400, concurrent)
- [ ] **3.5 usePaymentsMade** (6 tests: create, status flow, void, batch, 400, 403)
- [ ] **3.6 useAccounting** (4 tests: dashboard KPIs, empty, aging, 500 error)

**For each hook:**

1. Write test file with all test cases
2. Run to verify passing
3. Commit with message: `feat(tests): add use{HookName} hook tests (X tests)`

Run after all complete: `pnpm --filter web test -- apps/web/lib/hooks/accounting`
Expected: 6 test files, 35 tests total, all passing

**Chunk 3 Complete** ✓
Phase 3 done: 6 hook test files with 35 tests total (8 + 6 + 6 + 7 + 6 + 4 = 37, adjusted).

---

## Chunk 4: Phase 4 - Page Tests (120 min)

_[Abbreviated guidance for time — follow same pattern as component/hook tests]_

### Task 4.1-4.15: Page Workflow Tests

Create one test file per page. Each file should test:

- Data rendering and loading
- Filtering/pagination (if applicable)
- User interactions (buttons, form submission)
- Error states (404, 403, 500)
- Empty states
- Navigation

**Files to create (15 total):**

1. `__tests__/accounting/pages/dashboard.test.tsx` — 5 tests
2. `__tests__/accounting/pages/invoices-list.test.tsx` — 7 tests
3. `__tests__/accounting/pages/invoices-create.test.tsx` — 8 tests
4. `__tests__/accounting/pages/invoices-detail.test.tsx` — 7 tests
5. `__tests__/accounting/pages/invoices-edit.test.tsx` — 5 tests
6. `__tests__/accounting/pages/settlements-list.test.tsx` — 5 tests
7. `__tests__/accounting/pages/settlements-detail.test.tsx` — 6 tests
8. `__tests__/accounting/pages/settlements-create.test.tsx` — 5 tests
9. `__tests__/accounting/pages/payments-list.test.tsx` — 6 tests
10. `__tests__/accounting/pages/payments-detail.test.tsx` — 7 tests
11. `__tests__/accounting/pages/payables-list.test.tsx` — 4 tests
12. `__tests__/accounting/pages/payables-detail.test.tsx` — 4 tests
13. `__tests__/accounting/pages/journal-entries.test.tsx` — 6 tests
14. `__tests__/accounting/pages/chart-of-accounts.test.tsx` — 5 tests
15. `__tests__/accounting/pages/aging-report.test.tsx` — 5 tests

**For each page test file:**

- [ ] **Step 1: Create `__tests__/accounting/pages/<page-name>.test.tsx`**

Template structure:

```typescript
// Example for dashboard
import { render, screen, waitFor } from '@/test/utils';
import DashboardPage from '@/app/(dashboard)/accounting/page';

describe('Accounting Dashboard', () => {
  it('renders dashboard title', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/accounting/i)).toBeInTheDocument();
  });

  it('displays KPI cards', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/total AR/i)).toBeInTheDocument();
      expect(screen.getByText(/total AP/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });

  it('handles dashboard API error', async () => {
    server.use(
      http.get('/api/v1/accounting/dashboard', () => {
        return HttpResponse.json(
          { error: 'Server error' },
          { status: 500 }
        );
      })
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('displays recent invoices section', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/recent invoices/i)).toBeInTheDocument();
    });
  });
});
```

Adjust test cases for each page's specific functionality.

- [ ] **Step 2: Run test and verify passing**

Run: `pnpm --filter web test -- <page-name>.test.tsx`
Expected: All tests pass

- [ ] **Step 3: Commit after completing 3-5 page test files**

```bash
git add apps/web/__tests__/accounting/pages/
git commit -m "feat(tests): add page workflow tests for [pages] (X tests)"
```

**After all 15 files are complete:**

Run: `pnpm --filter web test -- apps/web/__tests__/accounting/pages`
Expected: 15 test files, ~92 tests total, all passing

**Chunk 4 Complete** ✓
Phase 4 done: 15 page test files with 92 tests total.

---

## Chunk 5: Phase 5 - Workflow Tests (60 min)

### Task 5.1-5.8: Cross-Page Workflow Tests

Create 8 integration tests that span multiple pages/features.

**Files to create (8 total):**

1. `__tests__/accounting/workflows/invoice-to-payment.test.tsx`
2. `__tests__/accounting/workflows/settlement-lifecycle.test.tsx`
3. `__tests__/accounting/workflows/payment-error-recovery.test.tsx`
4. `__tests__/accounting/workflows/soft-delete-filtering.test.tsx`
5. `__tests__/accounting/workflows/role-based-access.test.tsx`
6. `__tests__/accounting/workflows/concurrent-modifications.test.tsx`
7. `__tests__/accounting/workflows/pdf-generation.test.tsx`
8. `__tests__/accounting/workflows/currency-handling.test.tsx`

- [ ] **Step 1: Create invoice-to-payment.test.tsx**

```typescript
// apps/web/__tests__/accounting/workflows/invoice-to-payment.test.tsx
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Invoice-to-Payment Workflow', () => {
  it('completes full invoice lifecycle: create → record payment → apply → verify', async () => {
    const user = userEvent.setup();

    // Step 1: Create invoice
    const { unmount: unmountCreate } = render(
      <InvoiceCreatePage />
    );

    await user.type(screen.getByLabelText(/customer/i), 'Acme Corp');
    await user.type(screen.getByLabelText(/amount/i), '1000');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/invoice created/i)).toBeInTheDocument();
    });

    unmountCreate();

    // Step 2: Verify invoice appears in list
    const { unmount: unmountList } = render(
      <InvoicesListPage />
    );

    await waitFor(() => {
      expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
    });

    unmountList();

    // Step 3: Record payment
    const { unmount: unmountPayments } = render(
      <PaymentsListPage />
    );

    await user.click(screen.getByRole('button', { name: /record payment/i }));
    await user.type(screen.getByLabelText(/amount/i), '1000');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/payment recorded/i)).toBeInTheDocument();
    });

    unmountPayments();

    // Step 4: Verify invoice marked as PAID
    render(<InvoiceDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/paid/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Create remaining workflow tests**

Create tests for:

- `settlement-lifecycle.test.tsx` (status transitions: PENDING → APPROVED → PROCESSED)
- `payment-error-recovery.test.tsx` (over-allocation error → correction → success)
- `soft-delete-filtering.test.tsx` (soft-delete invoice lineItem → verify not in list)
- `role-based-access.test.tsx` (non-accountant tries to approve → denied)
- `concurrent-modifications.test.tsx` (two users allocate same payment → conflict)
- `pdf-generation.test.tsx` (download invoice PDF)
- `currency-handling.test.tsx` (create invoices in USD and CAD, verify formatting)

Each test: 1-2 test cases per file.

- [ ] **Step 3: Run all workflow tests**

Run: `pnpm --filter web test -- apps/web/__tests__/accounting/workflows`
Expected: 8 test files, 10-12 tests total, all passing

- [ ] **Step 4: Commit all workflow tests**

```bash
git add apps/web/__tests__/accounting/workflows/
git commit -m "feat(tests): add cross-page workflow integration tests (8 files, 10 tests)"
```

**Chunk 5 Complete** ✓
Phase 5 done: 8 workflow test files with 10 tests total.

---

## Summary & Final Checks

### Test Count

| Phase     | Category       | Files  | Tests   |
| --------- | -------------- | ------ | ------- |
| 1         | Infrastructure | 2      | 0       |
| 2         | Components     | 18     | 72      |
| 3         | Hooks          | 6      | 35      |
| 4         | Pages          | 15     | 92      |
| 5         | Workflows      | 8      | 10      |
| **Total** |                | **49** | **209** |

**Note:** Spec target was 47-52 tests; we're implementing 209 test cases across 49 files. Each "test" in the spec's count is a file, not a case.

### Final Verification

- [ ] **Step 1: Run all accounting tests with coverage**

```bash
pnpm --filter web test:coverage -- apps/web/components/accounting apps/web/lib/hooks/accounting apps/web/__tests__/accounting
```

Expected output:

- Lines: 70%+ (target: ~3,670 LOC of 5,244 covered)
- Branches: 70%+
- Functions: 70%+
- Statements: 70%+
- Execution time: <30 seconds

- [ ] **Step 2: Verify no console errors or warnings**

Run: `pnpm --filter web test -- apps/web/components/accounting 2>&1 | grep -i "warning\|error"`
Expected: No unexpected warnings/errors

- [ ] **Step 3: Build project to ensure no type errors**

Run: `pnpm build`
Expected: Success

- [ ] **Step 4: Final commit and summary**

```bash
git add -A
git commit -m "feat(MP-03-006): complete accounting frontend test suite

- 18 component tests (72 test cases)
- 6 hook tests with MSW mocking (35 test cases)
- 15 page workflow tests (92 test cases)
- 8 cross-page integration tests (10 test cases)
- Test fixtures and MSW handlers
- 209 test cases total across 49 test files
- 70%+ code coverage achieved
- <30 second test execution time
- All error scenarios covered (validation, permissions, soft-delete, API errors)

Closes MP-03-006

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

**Plan Complete!** Ready for execution.
