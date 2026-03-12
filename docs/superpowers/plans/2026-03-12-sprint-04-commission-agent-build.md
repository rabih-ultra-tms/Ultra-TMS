# Sprint 04 — Commission & Agent Build Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix commission backend bugs (COMM-107/110/111/113) and build agent management frontend (4 pages, 23 hooks, 10 components) wired to 37 existing backend endpoints.

**Architecture:** Two independent streams — backend fixes (commission event system + soft-delete + transactions) and frontend build (agent CRUD following commission module patterns). Frontend uses React Query hooks, RHF+Zod forms, shadcn/ui components with ListPage/FormPage patterns.

**Tech Stack:** NestJS 10, Prisma 6, EventEmitter2 (backend); Next.js 16, React 19, @tanstack/react-query, react-hook-form, zod, shadcn/ui (frontend)

**Spec:** `docs/superpowers/specs/2026-03-12-sprint-04-commission-agent-build.md`

---

## File Map

### Backend (Stream 1 — Commission Fixes)

| Action | File                                                                      | Responsibility                                                                  |
| ------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Modify | `apps/api/src/modules/accounting/services/payments-received.service.ts`   | Add EventEmitter2 injection, emit `invoice.paid` after PAID status              |
| Modify | `apps/api/src/modules/commission/listeners/commission-events.listener.ts` | Add `@OnEvent('invoice.paid')` handler                                          |
| Modify | `apps/api/src/modules/commission/services/commission-entries.service.ts`  | Add `deletedAt: null` to 5 query methods                                        |
| Modify | `apps/api/src/modules/commission/services/commission-payouts.service.ts`  | Add `deletedAt: null` to 6 methods + wrap create/process/void in `$transaction` |

### Frontend (Stream 2 — Agent Management)

| Action | File                                                   | Responsibility                                       |
| ------ | ------------------------------------------------------ | ---------------------------------------------------- |
| Create | `apps/web/lib/hooks/agents/use-agents.ts`              | 11 hooks: CRUD + status actions + contacts           |
| Create | `apps/web/lib/hooks/agents/use-agent-agreements.ts`    | 5 hooks: agreement CRUD + activate/terminate         |
| Create | `apps/web/lib/hooks/agents/use-agent-assignments.ts`   | 5 hooks: assignment CRUD + transfer/sunset/terminate |
| Create | `apps/web/lib/hooks/agents/use-agent-commissions.ts`   | 2 hooks: commission list + performance               |
| Create | `apps/web/components/agents/agent-list-table.tsx`      | Column definitions + status badge for agent list     |
| Create | `apps/web/components/agents/agent-form.tsx`            | RHF+Zod form for create/edit agent                   |
| Create | `apps/web/components/agents/agent-detail-tabs.tsx`     | Tabbed container for agent detail                    |
| Create | `apps/web/components/agents/agent-overview-tab.tsx`    | Agent info + contacts + performance                  |
| Create | `apps/web/components/agents/agent-agreements-tab.tsx`  | Agreements table + create/edit dialog                |
| Create | `apps/web/components/agents/agent-customers-tab.tsx`   | Customer assignments table + assign dialog           |
| Create | `apps/web/components/agents/agent-commissions-tab.tsx` | Commission history read-only table                   |
| Create | `apps/web/app/(dashboard)/agents/page.tsx`             | Agent list page                                      |
| Create | `apps/web/app/(dashboard)/agents/new/page.tsx`         | Agent create page (wrapper)                          |
| Create | `apps/web/app/(dashboard)/agents/[id]/page.tsx`        | Agent detail page (tabbed)                           |
| Create | `apps/web/app/(dashboard)/agents/[id]/edit/page.tsx`   | Agent edit page (wrapper)                            |

---

## Chunk 1: Commission Backend Fixes

### Task 1: COMM-107 — Invoice PAID Event Emission

**Files:**

- Modify: `apps/api/src/modules/accounting/services/payments-received.service.ts`
- Modify: `apps/api/src/modules/commission/listeners/commission-events.listener.ts`

- [ ] **Step 1: Add EventEmitter2 to PaymentsReceivedService**

In `payments-received.service.ts`, add the import and inject EventEmitter2:

```typescript
// Add import at top
import { EventEmitter2 } from '@nestjs/event-emitter';

// Add to constructor
constructor(
  private readonly prisma: PrismaService,
  private readonly eventEmitter: EventEmitter2,
) {}
```

- [ ] **Step 2: Emit invoice.paid in applyToInvoice()**

In `applyToInvoice()` (~line 168), the status is set inside a `$transaction`. Collect PAID invoiceIds inside the tx, emit **after** the tx commits:

```typescript
// Inside the method, BEFORE the $transaction call, declare:
let paidInvoiceId: string | null = null;

// Inside the $transaction callback, after the invoice.update():
if (newStatus === 'PAID') {
  paidInvoiceId = application.invoiceId;
}

// AFTER the $transaction return (outside the tx block):
if (paidInvoiceId) {
  this.eventEmitter.emit('invoice.paid', {
    invoiceId: paidInvoiceId,
    tenantId,
  });
}
```

- [ ] **Step 3: Emit invoice.paid in processBatch()**

In `processBatch()` (~line 264), collect all paid invoiceIds during the loop, emit after all processing:

```typescript
// At the start of the method:
const paidInvoiceIds: string[] = [];

// Inside the loop, after the invoice update that sets status:
if (newStatus === 'PAID') {
  paidInvoiceIds.push(invoiceId);
}

// After the loop completes:
for (const invoiceId of paidInvoiceIds) {
  this.eventEmitter.emit('invoice.paid', {
    invoiceId,
    tenantId,
  });
}
```

- [ ] **Step 4: Add invoice.paid handler to CommissionEventsListener**

In `commission-events.listener.ts`, add a new handler:

```typescript
// Add interface at top
interface InvoicePaidPayload {
  invoiceId: string;
  tenantId: string;
}

// Add handler method
@OnEvent('invoice.paid')
async handleInvoicePaid(payload: InvoicePaidPayload) {
  const { invoiceId, tenantId } = payload;
  this.logger.log(`Invoice PAID event received: ${invoiceId}`);

  try {
    // Fetch invoice with order relation to find linked loads
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      select: { orderId: true },
    });

    if (!invoice?.orderId) {
      this.logger.warn(`Invoice ${invoiceId} has no linked order, skipping commission`);
      return;
    }

    // Find loads linked to this order
    const loads = await this.prisma.load.findMany({
      where: { orderId: invoice.orderId, tenantId },
      select: { id: true },
    });

    for (const load of loads) {
      // Check if commission entry already exists for this load
      const existing = await this.prisma.commissionEntry.findFirst({
        where: { loadId: load.id, tenantId, deletedAt: null },
      });

      if (existing) {
        this.logger.log(`Commission entry already exists for load ${load.id}, skipping`);
        continue;
      }

      const result = await this.commissionEntriesService.calculateLoadCommission(
        tenantId,
        load.id,
      );

      if (result.eligible) {
        this.logger.log(`Commission calculated for load ${load.id}: ${result.calculation?.commissionAmount}`);
      } else {
        this.logger.warn(`Load ${load.id} not eligible for commission: ${result.reason}`);
      }
    }
  } catch (error) {
    this.logger.error(`Failed to process invoice.paid for ${invoiceId}: ${error}`);
  }
}
```

Also inject PrismaService into the listener constructor:

```typescript
constructor(
  private readonly commissionEntriesService: CommissionEntriesService,
  private readonly prisma: PrismaService,
) {}
```

Add the import:

```typescript
import { PrismaService } from '../../../prisma.service';
```

- [ ] **Step 5: Run tests to verify no regressions**

Run: `pnpm --filter api test:unit -- --testPathPattern="commission|payments-received" --passWithNoTests`
Expected: All existing tests pass

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/accounting/services/payments-received.service.ts apps/api/src/modules/commission/listeners/commission-events.listener.ts
git commit -m "feat(commission): wire invoice.paid event to auto-calculate commission (COMM-107)"
```

---

### Task 2: COMM-110/111 — Soft-Delete Filters

**Files:**

- Modify: `apps/api/src/modules/commission/services/commission-entries.service.ts`
- Modify: `apps/api/src/modules/commission/services/commission-payouts.service.ts`

**Note:** COMM-112 (AgentCommission) is SKIPPED — the `AgentCommission` Prisma model has no `deletedAt` field.

- [ ] **Step 1: Add deletedAt: null to CommissionEntriesService (5 methods)**

In `commission-entries.service.ts`, add `deletedAt: null` to the `where` clause of these methods:

1. `findAll()` — add to the main `where` object
2. `findOne()` — add alongside `id` and `tenantId`
3. `approve()` — add to the `findFirst` where clause
4. `reverse()` — add to the `findFirst` where clause
5. `getUserEarnings()` — add to the `findMany` where clause

Pattern for each:

```typescript
// Before:
where: { tenantId, ...otherFilters }
// After:
where: { tenantId, deletedAt: null, ...otherFilters }
```

- [ ] **Step 2: Add deletedAt: null to CommissionPayoutsService (6 methods)**

In `commission-payouts.service.ts`, add `deletedAt: null` to:

1. `create()` — the `findMany` query that fetches entries (~L26)
2. `findAll()` — the main `findMany` query
3. `findOne()` — the `findFirst` query
4. `approve()` — the `findFirst` query
5. `process()` — the `findFirst` query
6. `void()` — the `findFirst` query

- [ ] **Step 3: Run tests**

Run: `pnpm --filter api test:unit -- --testPathPattern="commission" --passWithNoTests`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/commission/services/commission-entries.service.ts apps/api/src/modules/commission/services/commission-payouts.service.ts
git commit -m "fix(commission): add deletedAt:null filter to all query methods (COMM-110/111)"
```

---

### Task 3: COMM-113 — Transaction Wrapping

**Files:**

- Modify: `apps/api/src/modules/commission/services/commission-payouts.service.ts`

- [ ] **Step 1: Wrap createPayout() in $transaction**

The `create()` method creates a payout then links entries. Wrap in `prisma.$transaction()`:

```typescript
async create(tenantId: string, userId: string, dto: CreateCommissionPayoutDto) {
  return this.prisma.$transaction(async (tx) => {
    // Move existing findMany (entries query) to use tx
    const entries = await tx.commissionEntry.findMany({
      where: { tenantId, userId, status: 'APPROVED', payoutId: null, deletedAt: null, /* existing period filters */ },
    });

    // ... existing validation logic ...

    // Create payout using tx
    const payout = await tx.commissionPayout.create({ /* existing data */ });

    // Link entries using tx
    await tx.commissionEntry.updateMany({
      where: { id: { in: entries.map(e => e.id) } },
      data: { payoutId: payout.id },
    });

    return payout;
  });
}
```

- [ ] **Step 2: Wrap process() in $transaction**

The `process()` method updates payout status then marks entries PAID:

```typescript
async process(id: string, tenantId: string, userId: string) {
  return this.prisma.$transaction(async (tx) => {
    const payout = await tx.commissionPayout.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    // ... existing validation ...

    const updated = await tx.commissionPayout.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    });

    await tx.commissionEntry.updateMany({
      where: { payoutId: id },
      data: { status: 'PAID', paidAt: new Date() },
    });

    return updated;
  });
}
```

- [ ] **Step 3: Wrap void() in $transaction**

The `void()` method updates payout then unlinks entries:

```typescript
async void(id: string, tenantId: string, userId: string) {
  return this.prisma.$transaction(async (tx) => {
    const payout = await tx.commissionPayout.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    // ... existing validation ...

    const updated = await tx.commissionPayout.update({
      where: { id },
      data: { status: 'VOID' },
    });

    await tx.commissionEntry.updateMany({
      where: { payoutId: id },
      data: { payoutId: null, status: 'APPROVED' },
    });

    return updated;
  });
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter api test:unit -- --testPathPattern="commission-payouts" --passWithNoTests`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/commission/services/commission-payouts.service.ts
git commit -m "fix(commission): wrap payout operations in $transaction for atomicity (COMM-113)"
```

---

## Chunk 2: Agent Hooks (Foundation Layer)

### Task 4: Agent Core Hooks — use-agents.ts

**Files:**

- Create: `apps/web/lib/hooks/agents/use-agents.ts`

- [ ] **Step 1: Create the hook file with types, query keys, and helpers**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface Agent {
  id: string;
  tenantId: string;
  agentCode: string;
  companyName: string;
  dbaName?: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone?: string;
  agentType: string;
  status: string;
  tier?: string;
  territories?: string[];
  industryFocus?: string[];
  legalEntityType?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  paymentMethod?: string;
  bankName?: string;
  bankRouting?: string;
  bankAccount?: string;
  bankAccountType?: string;
  activatedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentContact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  role?: string;
  isPrimary: boolean;
  isActive: boolean;
  hasPortalAccess: boolean;
}

export interface AgentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  agentType?: string;
  tier?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AgentListResponse {
  data: Agent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAgentInput {
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  agentType: string;
  dbaName?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  legalEntityType?: string;
  taxId?: string;
  tier?: string;
  territories?: string[];
  industryFocus?: string[];
  paymentMethod?: string;
  bankName?: string;
  bankRouting?: string;
  bankAccount?: string;
  bankAccountType?: string;
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  id: string;
}

export interface AgentContactInput {
  agentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  role?: string;
  isPrimary?: boolean;
  hasPortalAccess?: boolean;
}

// ===========================
// Query Keys
// ===========================

export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (params: AgentListParams) => [...agentKeys.lists(), params] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  contacts: (agentId: string) =>
    [...agentKeys.all, 'contacts', agentId] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function useAgents(params: AgentListParams = {}) {
  return useQuery<AgentListResponse>({
    queryKey: agentKeys.list(params),
    queryFn: async () => {
      const searchParams: Record<string, string | number | undefined> = {};
      if (params.page) searchParams.page = params.page;
      if (params.limit) searchParams.limit = params.limit;
      if (params.search) searchParams.search = params.search;
      if (params.status && params.status !== 'all')
        searchParams.status = params.status;
      if (params.agentType && params.agentType !== 'all')
        searchParams.agentType = params.agentType;
      if (params.tier && params.tier !== 'all') searchParams.tier = params.tier;
      if (params.sortBy) searchParams.sortBy = params.sortBy;
      if (params.sortOrder) searchParams.sortOrder = params.sortOrder;

      const response = await apiClient.get('/agents', searchParams);
      const raw = response as AgentListResponse;
      return {
        data: raw.data ?? [],
        pagination: raw.pagination ?? {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: agentKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${id}`);
      return unwrap<Agent>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useAgentContacts(agentId: string) {
  return useQuery<AgentContact[]>({
    queryKey: agentKeys.contacts(agentId),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${agentId}/contacts`);
      return unwrap<AgentContact[]>(response);
    },
    enabled: !!agentId,
    staleTime: 30_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CreateAgentInput, 'id'>) => {
      const response = await apiClient.post('/agents', input);
      return unwrap<Agent>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create agent');
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateAgentInput) => {
      const response = await apiClient.put(`/agents/${id}`, input);
      return unwrap<Agent>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update agent');
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete agent');
    },
  });
}

export function useActivateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/agents/${id}/activate`);
      return unwrap<Agent>(response);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent activated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate agent');
    },
  });
}

export function useSuspendAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await apiClient.post(`/agents/${id}/suspend`, {
        reason,
      });
      return unwrap<Agent>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent suspended');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to suspend agent');
    },
  });
}

export function useTerminateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await apiClient.post(`/agents/${id}/terminate`, {
        reason,
      });
      return unwrap<Agent>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast.success('Agent terminated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to terminate agent');
    },
  });
}

export function useAddContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, ...input }: AgentContactInput) => {
      const response = await apiClient.post(
        `/agents/${agentId}/contacts`,
        input
      );
      return unwrap<AgentContact>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.contacts(variables.agentId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add contact');
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agentId,
      contactId,
      ...input
    }: Partial<AgentContactInput> & { agentId: string; contactId: string }) => {
      const response = await apiClient.put(
        `/agents/${agentId}/contacts/${contactId}`,
        input
      );
      return unwrap<AgentContact>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentKeys.contacts(variables.agentId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contact');
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/hooks/agents/use-agents.ts
git commit -m "feat(agents): add core agent hooks - CRUD, status actions, contacts (COM-FE1)"
```

---

### Task 5: Agent Agreement Hooks — use-agent-agreements.ts

**Files:**

- Create: `apps/web/lib/hooks/agents/use-agent-agreements.ts`

- [ ] **Step 1: Create the hook file**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentAgreement {
  id: string;
  agentId: string;
  agreementNumber: string;
  effectiveDate: string;
  expirationDate?: string;
  splitType: string;
  splitRate?: number;
  minimumPayout?: number;
  minimumPerLoad?: number;
  drawAmount?: number;
  drawFrequency?: string;
  drawRecoverable?: boolean;
  sunsetEnabled?: boolean;
  sunsetPeriodMonths?: number;
  protectionPeriodMonths?: number;
  paymentDay?: number;
  status: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgreementInput {
  agentId: string;
  effectiveDate: string;
  splitType: string;
  expirationDate?: string;
  splitRate?: number;
  minimumPerLoad?: number;
  protectionPeriodMonths?: number;
  sunsetEnabled?: boolean;
  sunsetPeriodMonths?: number;
  drawAmount?: number;
  paymentDay?: number;
}

export interface UpdateAgreementInput {
  agreementId: string;
  agentId: string; // for cache invalidation
  effectiveDate?: string;
  expirationDate?: string;
  splitType?: string;
  splitRate?: number;
  status?: string;
  name?: string;
  minimumPerLoad?: number;
  protectionPeriodMonths?: number;
  sunsetEnabled?: boolean;
  sunsetPeriodMonths?: number;
  drawAmount?: number;
  paymentDay?: number;
}

// ===========================
// Query Keys
// ===========================

export const agreementKeys = {
  all: ['agents', 'agreements'] as const,
  byAgent: (agentId: string) => [...agreementKeys.all, agentId] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function useAgentAgreements(agentId: string) {
  return useQuery<AgentAgreement[]>({
    queryKey: agreementKeys.byAgent(agentId),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${agentId}/agreements`);
      return unwrap<AgentAgreement[]>(response);
    },
    enabled: !!agentId,
    staleTime: 30_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useCreateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, ...input }: CreateAgreementInput) => {
      const response = await apiClient.post(
        `/agents/${agentId}/agreements`,
        input
      );
      return unwrap<AgentAgreement>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.byAgent(variables.agentId),
      });
      toast.success('Agreement created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create agreement');
    },
  });
}

export function useUpdateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agreementId,
      agentId: _agentId,
      ...input
    }: UpdateAgreementInput) => {
      const response = await apiClient.put(
        `/agent-agreements/${agreementId}`,
        input
      );
      return unwrap<AgentAgreement>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.byAgent(variables.agentId),
      });
      toast.success('Agreement updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update agreement');
    },
  });
}

export function useActivateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agreementId,
    }: {
      agreementId: string;
      agentId: string;
    }) => {
      const response = await apiClient.post(
        `/agent-agreements/${agreementId}/activate`
      );
      return unwrap<AgentAgreement>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.byAgent(variables.agentId),
      });
      toast.success('Agreement activated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate agreement');
    },
  });
}

export function useTerminateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agreementId,
    }: {
      agreementId: string;
      agentId: string;
    }) => {
      const response = await apiClient.post(
        `/agent-agreements/${agreementId}/terminate`
      );
      return unwrap<AgentAgreement>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: agreementKeys.byAgent(variables.agentId),
      });
      toast.success('Agreement terminated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to terminate agreement');
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/hooks/agents/use-agent-agreements.ts
git commit -m "feat(agents): add agreement hooks - CRUD + activate/terminate (COM-FE1)"
```

---

### Task 6: Agent Assignment + Commission Hooks

**Files:**

- Create: `apps/web/lib/hooks/agents/use-agent-assignments.ts`
- Create: `apps/web/lib/hooks/agents/use-agent-commissions.ts`

- [ ] **Step 1: Create use-agent-assignments.ts**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentCustomerAssignment {
  id: string;
  agentId: string;
  customerId: string;
  assignmentType: string;
  status: string;
  splitPercent?: number;
  isProtected: boolean;
  protectionStart?: string;
  protectionEnd?: string;
  inSunset: boolean;
  sunsetStartDate?: string;
  currentSunsetRate?: number;
  overrideSplitRate?: number;
  overrideReason?: string;
  customer?: { id: string; name: string; companyName?: string };
  createdAt: string;
  updatedAt: string;
}

export interface AssignCustomerInput {
  agentId: string;
  customerId: string;
  assignmentType: string;
  protectionEnd?: string;
  splitPercent?: number;
  source?: string;
}

// ===========================
// Query Keys
// ===========================

export const assignmentKeys = {
  all: ['agents', 'assignments'] as const,
  byAgent: (agentId: string) => [...assignmentKeys.all, agentId] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function useAgentCustomers(agentId: string) {
  return useQuery<AgentCustomerAssignment[]>({
    queryKey: assignmentKeys.byAgent(agentId),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${agentId}/customers`);
      return unwrap<AgentCustomerAssignment[]>(response);
    },
    enabled: !!agentId,
    staleTime: 30_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function useAssignCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, ...input }: AssignCustomerInput) => {
      const response = await apiClient.post(
        `/agents/${agentId}/customers`,
        input
      );
      return unwrap<AgentCustomerAssignment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.agentId),
      });
      toast.success('Customer assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign customer');
    },
  });
}

export function useTransferAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      toAgentId,
      reason,
    }: {
      assignmentId: string;
      agentId: string;
      toAgentId: string;
      reason?: string;
    }) => {
      const response = await apiClient.post(
        `/agent-assignments/${assignmentId}/transfer`,
        {
          toAgentId,
          reason,
        }
      );
      return unwrap<AgentCustomerAssignment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.agentId),
      });
      toast.success('Customer transferred');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to transfer customer');
    },
  });
}

export function useStartSunset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      startDate,
      reason,
    }: {
      assignmentId: string;
      agentId: string;
      startDate?: string;
      reason?: string;
    }) => {
      const response = await apiClient.post(
        `/agent-assignments/${assignmentId}/start-sunset`,
        {
          startDate,
          reason,
        }
      );
      return unwrap<AgentCustomerAssignment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.agentId),
      });
      toast.success('Sunset started');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start sunset');
    },
  });
}

export function useTerminateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      reason,
    }: {
      assignmentId: string;
      agentId: string;
      reason?: string;
    }) => {
      const response = await apiClient.post(
        `/agent-assignments/${assignmentId}/terminate`,
        {
          reason,
        }
      );
      return unwrap<AgentCustomerAssignment>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byAgent(variables.agentId),
      });
      toast.success('Assignment terminated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to terminate assignment');
    },
  });
}
```

- [ ] **Step 2: Create use-agent-commissions.ts**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface AgentCommission {
  id: string;
  agentId: string;
  loadId?: string;
  orderId?: string;
  customerId?: string;
  splitType: string;
  splitRate: number;
  commissionBase: number;
  grossCommission: number;
  netCommission: number;
  loadRevenue?: number;
  loadMargin?: number;
  status: string;
  commissionPeriod?: string;
  createdAt: string;
}

export interface AgentPerformance {
  totalCommissions: number;
  totalPaid: number;
  avgCommission: number;
  loadCount: number;
  pendingAmount: number;
}

export interface AgentCommissionParams {
  page?: number;
  limit?: number;
  status?: string;
}

// ===========================
// Query Keys
// ===========================

export const agentCommissionKeys = {
  all: ['agents', 'commissions'] as const,
  byAgent: (agentId: string, params?: AgentCommissionParams) =>
    [...agentCommissionKeys.all, agentId, params] as const,
  performance: (agentId: string) =>
    [...agentCommissionKeys.all, 'performance', agentId] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function useAgentCommissions(
  agentId: string,
  params: AgentCommissionParams = {}
) {
  return useQuery({
    queryKey: agentCommissionKeys.byAgent(agentId, params),
    queryFn: async () => {
      const searchParams: Record<string, string | number | undefined> = {};
      if (params.page) searchParams.page = params.page;
      if (params.limit) searchParams.limit = params.limit;
      if (params.status && params.status !== 'all')
        searchParams.status = params.status;

      const response = await apiClient.get(
        `/agents/${agentId}/commissions`,
        searchParams
      );
      const raw = response as {
        data: AgentCommission[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
      return {
        data: raw.data ?? [],
        pagination: raw.pagination ?? {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
    },
    enabled: !!agentId,
    placeholderData: (previousData) => previousData,
  });
}

export function useAgentPerformance(agentId: string) {
  return useQuery<AgentPerformance>({
    queryKey: agentCommissionKeys.performance(agentId),
    queryFn: async () => {
      const response = await apiClient.get(`/agents/${agentId}/performance`);
      return unwrap<AgentPerformance>(response);
    },
    enabled: !!agentId,
    staleTime: 30_000,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/hooks/agents/use-agent-assignments.ts apps/web/lib/hooks/agents/use-agent-commissions.ts
git commit -m "feat(agents): add assignment + commission hooks (COM-FE1)"
```

---

## Chunk 3: Agent List Page

### Task 7: Agent List Table Component

**Files:**

- Create: `apps/web/components/agents/agent-list-table.tsx`

- [ ] **Step 1: Create the column definitions component**

```typescript
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Agent } from '@/lib/hooks/agents/use-agents';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  PENDING: 'outline',
  SUSPENDED: 'secondary',
  TERMINATED: 'destructive',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getAgentColumns(): ColumnDef<Agent>[] {
  return [
    {
      accessorKey: 'agentCode',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-text-primary">
          {row.original.agentCode}
        </span>
      ),
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-text-primary">
            {row.original.companyName}
          </span>
          {row.original.dbaName && (
            <p className="text-xs text-text-muted">DBA: {row.original.dbaName}</p>
          )}
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => (
        <div>
          <span className="text-sm text-text-primary">
            {row.original.contactFirstName} {row.original.contactLastName}
          </span>
          <p className="text-xs text-text-muted">{row.original.contactEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: 'agentType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-sm text-text-primary">{row.original.agentType}</span>
      ),
    },
    {
      accessorKey: 'tier',
      header: 'Tier',
      cell: ({ row }) =>
        row.original.tier ? (
          <Badge variant="outline">{row.original.tier}</Badge>
        ) : (
          <span className="text-sm italic text-text-muted">—</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] ?? 'outline'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-text-muted">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/agents/agent-list-table.tsx
git commit -m "feat(agents): add agent list table column definitions (COM-FE2)"
```

---

### Task 8: Agent List Page

**Files:**

- Create: `apps/web/app/(dashboard)/agents/page.tsx`

- [ ] **Step 1: Create the list page**

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListPage } from '@/components/patterns/list-page';
import { useAgents } from '@/lib/hooks/agents/use-agents';
import { getAgentColumns } from '@/components/agents/agent-list-table';

export default function AgentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;
  const statusFilter = searchParams.get('status') || 'all';
  const typeFilter = searchParams.get('agentType') || 'all';

  const [searchInput, setSearchInput] = useState(search ?? '');

  const { data, isLoading, error, refetch } = useAgents({
    page,
    limit,
    search,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    agentType: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const columns = getAgentColumns();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [searchInput, searchParams, router]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (row: { original: { id: string } }) => {
    router.push(`/agents/${row.original.id}`);
  };

  return (
    <ListPage
      title="Agents"
      description="Manage sales agents, agreements, and customer assignments."
      headerActions={
        <Button asChild>
          <Link href="/agents/new">
            <Plus className="mr-2 size-4" />
            New Agent
          </Link>
        </Button>
      }
      filters={
        <div className="flex items-center gap-3 p-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-text-muted" />
            <Input
              placeholder="Search agents..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => handleFilterChange('status', v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="TERMINATED">Terminated</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(v) => handleFilterChange('agentType', v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INDEPENDENT">Independent</SelectItem>
              <SelectItem value="COMPANY">Company</SelectItem>
              <SelectItem value="REFERRAL">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      data={data?.data || []}
      columns={columns}
      total={data?.pagination?.total || 0}
      page={page}
      pageSize={limit}
      pageCount={data?.pagination?.totalPages || 1}
      onPageChange={handlePageChange}
      isLoading={isLoading}
      error={error ? (error as Error) : null}
      onRetry={refetch}
      onRowClick={handleRowClick}
      entityLabel="agents"
    />
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run: `pnpm --filter web build 2>&1 | head -30`
Expected: No build errors for agents/page.tsx

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(dashboard\)/agents/page.tsx
git commit -m "feat(agents): add agent list page with search, filters, pagination (COM-FE2)"
```

---

## Chunk 4: Agent Create/Edit Form

### Task 9: Agent Form Component

**Files:**

- Create: `apps/web/components/agents/agent-form.tsx`

- [ ] **Step 1: Create the form component with Zod schema and RHF**

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormPage, FormSection } from '@/components/patterns/form-page';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateAgent,
  useUpdateAgent,
  type Agent,
  type CreateAgentInput,
} from '@/lib/hooks/agents/use-agents';

const agentSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  dbaName: z.string().max(200).optional().or(z.literal('')),
  contactFirstName: z.string().min(1, 'First name is required').max(100),
  contactLastName: z.string().min(1, 'Last name is required').max(100),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().max(20).optional().or(z.literal('')),
  agentType: z.enum(['INDEPENDENT', 'COMPANY', 'REFERRAL']),
  legalEntityType: z.string().max(50).optional().or(z.literal('')),
  taxId: z.string().max(20).optional().or(z.literal('')),
  addressLine1: z.string().max(200).optional().or(z.literal('')),
  addressLine2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(50).optional().or(z.literal('')),
  zip: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(50).optional().or(z.literal('')),
  tier: z.string().optional().or(z.literal('')),
  paymentMethod: z.string().optional().or(z.literal('')),
  bankName: z.string().max(200).optional().or(z.literal('')),
  bankRouting: z.string().max(20).optional().or(z.literal('')),
  bankAccount: z.string().max(30).optional().or(z.literal('')),
  bankAccountType: z.string().optional().or(z.literal('')),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface AgentFormProps {
  agent?: Agent;
}

export function AgentForm({ agent }: AgentFormProps) {
  const router = useRouter();
  const isEditing = !!agent;
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();

  const defaultValues: AgentFormValues = {
    companyName: agent?.companyName ?? '',
    dbaName: agent?.dbaName ?? '',
    contactFirstName: agent?.contactFirstName ?? '',
    contactLastName: agent?.contactLastName ?? '',
    contactEmail: agent?.contactEmail ?? '',
    contactPhone: agent?.contactPhone ?? '',
    agentType: (agent?.agentType as AgentFormValues['agentType']) ?? 'INDEPENDENT',
    legalEntityType: agent?.legalEntityType ?? '',
    taxId: agent?.taxId ?? '',
    addressLine1: agent?.addressLine1 ?? '',
    addressLine2: agent?.addressLine2 ?? '',
    city: agent?.city ?? '',
    state: agent?.state ?? '',
    zip: agent?.zip ?? '',
    country: agent?.country ?? '',
    tier: agent?.tier ?? '',
    paymentMethod: agent?.paymentMethod ?? '',
    bankName: agent?.bankName ?? '',
    bankRouting: agent?.bankRouting ?? '',
    bankAccount: agent?.bankAccount ?? '',
    bankAccountType: agent?.bankAccountType ?? '',
  };

  const handleSubmit = async (values: AgentFormValues) => {
    try {
      const payload: CreateAgentInput = {
        companyName: values.companyName,
        contactFirstName: values.contactFirstName,
        contactLastName: values.contactLastName,
        contactEmail: values.contactEmail,
        agentType: values.agentType,
        dbaName: values.dbaName || undefined,
        contactPhone: values.contactPhone || undefined,
        addressLine1: values.addressLine1 || undefined,
        addressLine2: values.addressLine2 || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        zip: values.zip || undefined,
        country: values.country || undefined,
        legalEntityType: values.legalEntityType || undefined,
        taxId: values.taxId || undefined,
        tier: values.tier || undefined,
        paymentMethod: values.paymentMethod || undefined,
        bankName: values.bankName || undefined,
        bankRouting: values.bankRouting || undefined,
        bankAccount: values.bankAccount || undefined,
        bankAccountType: values.bankAccountType || undefined,
      };

      if (isEditing) {
        await updateAgent.mutateAsync({ id: agent.id, ...payload });
        toast.success('Agent updated');
      } else {
        await createAgent.mutateAsync(payload);
        toast.success('Agent created');
      }
      router.push('/agents');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save agent';
      toast.error(message);
    }
  };

  return (
    <FormPage<AgentFormValues>
      title={isEditing ? `Edit Agent: ${agent.companyName}` : 'New Agent'}
      description={
        isEditing
          ? 'Update agent information'
          : 'Register a new sales agent'
      }
      backPath="/agents"
      schema={agentSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={createAgent.isPending || updateAgent.isPending}
      submitLabel={isEditing ? 'Update Agent' : 'Create Agent'}
    >
      {(form) => (
        <>
          <FormSection title="Company Information" description="Agent's business details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Acme Logistics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dbaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DBA Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doing business as..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INDEPENDENT">Independent</SelectItem>
                        <SelectItem value="COMPANY">Company</SelectItem>
                        <SelectItem value="REFERRAL">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BRONZE">Bronze</SelectItem>
                        <SelectItem value="SILVER">Silver</SelectItem>
                        <SelectItem value="GOLD">Gold</SelectItem>
                        <SelectItem value="PLATINUM">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legalEntityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Entity Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., LLC, Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID / EIN</FormLabel>
                    <FormControl>
                      <Input placeholder="XX-XXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <FormSection title="Primary Contact" description="Main point of contact">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <FormSection title="Address" description="Business address">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Suite 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Chicago" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="IL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="60601" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="US" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <FormSection title="Banking" description="Payment information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACH">ACH</SelectItem>
                        <SelectItem value="CHECK">Check</SelectItem>
                        <SelectItem value="WIRE">Wire Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Bank of America" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankRouting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Number</FormLabel>
                    <FormControl>
                      <Input placeholder="XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="XXXXXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankAccountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CHECKING">Checking</SelectItem>
                        <SelectItem value="SAVINGS">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        </>
      )}
    </FormPage>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/agents/agent-form.tsx
git commit -m "feat(agents): add agent create/edit form with Zod validation (COM-FE3)"
```

---

### Task 10: Agent Create + Edit Pages

**Files:**

- Create: `apps/web/app/(dashboard)/agents/new/page.tsx`
- Create: `apps/web/app/(dashboard)/agents/[id]/edit/page.tsx`

- [ ] **Step 1: Create the create page (minimal wrapper)**

```typescript
'use client';

import { AgentForm } from '@/components/agents/agent-form';

export default function NewAgentPage() {
  return <AgentForm />;
}
```

- [ ] **Step 2: Create the edit page**

```typescript
'use client';

import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { AgentForm } from '@/components/agents/agent-form';
import { useAgent } from '@/lib/hooks/agents/use-agents';

export default function EditAgentPage() {
  const params = useParams();
  const agentId = params.id as string;
  const { data: agent, isLoading, error } = useAgent(agentId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error loading agent"
          message={(error as Error).message}
        />
      </div>
    );
  }

  if (!agent) return null;

  return <AgentForm agent={agent} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(dashboard\)/agents/new/page.tsx apps/web/app/\(dashboard\)/agents/\[id\]/edit/page.tsx
git commit -m "feat(agents): add create and edit page wrappers (COM-FE3)"
```

---

## Chunk 5: Agent Detail Page (Tabbed)

### Task 11: Agent Detail Page + Tab Components

**Files:**

- Create: `apps/web/app/(dashboard)/agents/[id]/page.tsx`
- Create: `apps/web/components/agents/agent-detail-tabs.tsx`
- Create: `apps/web/components/agents/agent-overview-tab.tsx`
- Create: `apps/web/components/agents/agent-agreements-tab.tsx`
- Create: `apps/web/components/agents/agent-customers-tab.tsx`
- Create: `apps/web/components/agents/agent-commissions-tab.tsx`

- [ ] **Step 1: Create the detail page shell**

Create `apps/web/app/(dashboard)/agents/[id]/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAgent, useDeleteAgent, useActivateAgent, useSuspendAgent, useTerminateAgent } from '@/lib/hooks/agents/use-agents';
import { AgentDetailTabs } from '@/components/agents/agent-detail-tabs';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  PENDING: 'outline',
  SUSPENDED: 'secondary',
  TERMINATED: 'destructive',
};

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const { data: agent, isLoading } = useAgent(agentId);
  const deleteAgent = useDeleteAgent();
  const activateAgent = useActivateAgent();
  const suspendAgent = useSuspendAgent();
  const terminateAgent = useTerminateAgent();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteAgent.mutateAsync(agentId);
      toast.success('Agent deleted');
      router.push('/agents');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete agent';
      toast.error(message);
    }
  };

  const handleActivate = async () => {
    try {
      await activateAgent.mutateAsync(agentId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to activate agent';
      toast.error(message);
    }
  };

  const handleSuspend = async () => {
    try {
      await suspendAgent.mutateAsync({ id: agentId });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to suspend agent';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/agents">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent">
                    <Users className="size-4" />
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    {agent?.companyName}
                  </h1>
                </div>
                {agent && (
                  <div className="ml-10 mt-1 flex items-center gap-2">
                    <Badge variant="outline">{agent.agentCode}</Badge>
                    <Badge variant={statusVariant[agent.status] ?? 'outline'}>
                      {agent.status}
                    </Badge>
                    <Badge variant="outline">{agent.agentType}</Badge>
                    {agent.tier && <Badge variant="outline">{agent.tier}</Badge>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {agent && (
          <div className="flex items-center gap-2">
            {agent.status === 'SUSPENDED' && (
              <Button
                variant="outline"
                onClick={handleActivate}
                disabled={activateAgent.isPending}
              >
                Activate
              </Button>
            )}
            {agent.status === 'ACTIVE' && (
              <Button
                variant="outline"
                onClick={handleSuspend}
                disabled={suspendAgent.isPending}
              >
                Suspend
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/agents/${agentId}/edit`}>
                <Edit className="mr-2 size-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tabbed Content */}
      {agent && <AgentDetailTabs agentId={agentId} />}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Agent"
        description={`Are you sure you want to delete "${agent?.companyName}"? This action cannot be undone.`}
        confirmLabel="Delete Agent"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create AgentDetailTabs container**

Create `apps/web/components/agents/agent-detail-tabs.tsx`:

```typescript
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentOverviewTab } from './agent-overview-tab';
import { AgentAgreementsTab } from './agent-agreements-tab';
import { AgentCustomersTab } from './agent-customers-tab';
import { AgentCommissionsTab } from './agent-commissions-tab';

interface AgentDetailTabsProps {
  agentId: string;
}

export function AgentDetailTabs({ agentId }: AgentDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="agreements">Agreements</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
        <TabsTrigger value="commissions">Commissions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <AgentOverviewTab agentId={agentId} />
      </TabsContent>
      <TabsContent value="agreements">
        <AgentAgreementsTab agentId={agentId} />
      </TabsContent>
      <TabsContent value="customers">
        <AgentCustomersTab agentId={agentId} />
      </TabsContent>
      <TabsContent value="commissions">
        <AgentCommissionsTab agentId={agentId} />
      </TabsContent>
    </Tabs>
  );
}
```

- [ ] **Step 3: Create AgentOverviewTab**

Create `apps/web/components/agents/agent-overview-tab.tsx`:

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgent, useAgentContacts } from '@/lib/hooks/agents/use-agents';
import { useAgentPerformance } from '@/lib/hooks/agents/use-agent-commissions';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface AgentOverviewTabProps {
  agentId: string;
}

export function AgentOverviewTab({ agentId }: AgentOverviewTabProps) {
  const { data: agent, isLoading } = useAgent(agentId);
  const { data: contacts, isLoading: contactsLoading } = useAgentContacts(agentId);
  const { data: performance, isLoading: perfLoading } = useAgentPerformance(agentId);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Agent Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>
          ) : agent ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Company</dt>
                <dd className="font-medium text-text-primary">{agent.companyName}</dd>
              </div>
              {agent.dbaName && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">DBA</dt>
                  <dd className="text-text-primary">{agent.dbaName}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-text-muted">Contact</dt>
                <dd className="text-text-primary">
                  {agent.contactFirstName} {agent.contactLastName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Email</dt>
                <dd className="text-text-primary">{agent.contactEmail}</dd>
              </div>
              {agent.contactPhone && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Phone</dt>
                  <dd className="text-text-primary">{agent.contactPhone}</dd>
                </div>
              )}
              {agent.addressLine1 && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Address</dt>
                  <dd className="text-right text-text-primary">
                    {agent.addressLine1}
                    {agent.addressLine2 && <>, {agent.addressLine2}</>}
                    <br />
                    {agent.city}, {agent.state} {agent.zip}
                  </dd>
                </div>
              )}
            </dl>
          ) : null}
        </CardContent>
      </Card>

      {/* Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {perfLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          ) : performance ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Total Commissions</dt>
                <dd className="font-medium text-text-primary">
                  {formatCurrency(performance.totalCommissions)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Total Paid</dt>
                <dd className="text-text-primary">{formatCurrency(performance.totalPaid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Avg Commission</dt>
                <dd className="text-text-primary">{formatCurrency(performance.avgCommission)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Load Count</dt>
                <dd className="text-text-primary">{performance.loadCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Pending</dt>
                <dd className="text-text-primary">{formatCurrency(performance.pendingAmount)}</dd>
              </div>
            </dl>
          ) : (
            <p className="py-4 text-center text-sm text-text-muted">
              No performance data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contacts Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Contact Persons</CardTitle>
        </CardHeader>
        <CardContent>
          {contactsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !contacts?.length ? (
            <p className="py-4 text-center text-sm text-text-muted">
              No contacts added yet.
            </p>
          ) : (
            <div className="divide-y">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium text-text-primary">
                      {contact.firstName} {contact.lastName}
                    </span>
                    {contact.role && (
                      <span className="ml-2 text-xs text-text-muted">{contact.role}</span>
                    )}
                    <p className="text-xs text-text-muted">{contact.email}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    {contact.isPrimary && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">Primary</span>
                    )}
                    {contact.hasPortalAccess && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">Portal</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Create AgentAgreementsTab**

Create `apps/web/components/agents/agent-agreements-tab.tsx`:

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAgentAgreements } from '@/lib/hooks/agents/use-agent-agreements';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPercent(value?: number): string {
  if (value == null) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  PENDING: 'outline',
  TERMINATED: 'destructive',
  EXPIRED: 'secondary',
};

interface AgentAgreementsTabProps {
  agentId: string;
}

export function AgentAgreementsTab({ agentId }: AgentAgreementsTabProps) {
  const { data: agreements, isLoading } = useAgentAgreements(agentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission Agreements</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !agreements?.length ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No agreements found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement #</TableHead>
                <TableHead>Split Type</TableHead>
                <TableHead>Split Rate</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agreement) => (
                <TableRow key={agreement.id}>
                  <TableCell className="font-mono text-sm">
                    {agreement.agreementNumber}
                  </TableCell>
                  <TableCell>{agreement.splitType}</TableCell>
                  <TableCell>{formatPercent(agreement.splitRate)}</TableCell>
                  <TableCell>{formatDate(agreement.effectiveDate)}</TableCell>
                  <TableCell>
                    {agreement.expirationDate
                      ? formatDate(agreement.expirationDate)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[agreement.status] ?? 'outline'}>
                      {agreement.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create AgentCustomersTab**

Create `apps/web/components/agents/agent-customers-tab.tsx`:

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAgentCustomers } from '@/lib/hooks/agents/use-agent-assignments';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  SUNSET: 'secondary',
  TERMINATED: 'destructive',
  TRANSFERRED: 'outline',
};

interface AgentCustomersTabProps {
  agentId: string;
}

export function AgentCustomersTab({ agentId }: AgentCustomersTabProps) {
  const { data: assignments, isLoading } = useAgentCustomers(agentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !assignments?.length ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No customers assigned.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Split %</TableHead>
                <TableHead>Protected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium text-text-primary">
                    {assignment.customer?.companyName ??
                      assignment.customer?.name ??
                      assignment.customerId}
                  </TableCell>
                  <TableCell>{assignment.assignmentType}</TableCell>
                  <TableCell>
                    {assignment.splitPercent != null
                      ? `${(assignment.splitPercent * 100).toFixed(0)}%`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {assignment.isProtected ? (
                      <Badge variant="outline">Protected</Badge>
                    ) : (
                      <span className="text-text-muted">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[assignment.status] ?? 'outline'}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {formatDate(assignment.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Create AgentCommissionsTab**

Create `apps/web/components/agents/agent-commissions-tab.tsx`:

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAgentCommissions } from '@/lib/hooks/agents/use-agent-commissions';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CALCULATED: 'outline',
  SUBMITTED: 'secondary',
  APPROVED: 'default',
  PAID: 'default',
  ADJUSTED: 'secondary',
  REVERSED: 'destructive',
};

interface AgentCommissionsTabProps {
  agentId: string;
}

export function AgentCommissionsTab({ agentId }: AgentCommissionsTabProps) {
  const { data, isLoading } = useAgentCommissions(agentId);
  const commissions = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : commissions.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No commission entries yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Split Type</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="text-text-muted">
                    {commission.commissionPeriod ?? '—'}
                  </TableCell>
                  <TableCell>{commission.splitType}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(commission.commissionBase)}
                  </TableCell>
                  <TableCell className="text-right">
                    {(commission.splitRate * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(commission.grossCommission)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(commission.netCommission)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[commission.status] ?? 'outline'}>
                      {commission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {formatDate(commission.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 7: Verify build**

Run: `pnpm --filter web build 2>&1 | tail -20`
Expected: Build succeeds or only pre-existing errors

- [ ] **Step 8: Commit all detail page files**

```bash
git add apps/web/app/\(dashboard\)/agents/\[id\]/page.tsx apps/web/components/agents/agent-detail-tabs.tsx apps/web/components/agents/agent-overview-tab.tsx apps/web/components/agents/agent-agreements-tab.tsx apps/web/components/agents/agent-customers-tab.tsx apps/web/components/agents/agent-commissions-tab.tsx
git commit -m "feat(agents): add agent detail page with overview, agreements, customers, commissions tabs (COM-FE4/5/6/7)"
```

---

## Chunk 6: Sprint Docs Update + Final Verification

### Task 12: Update Sprint Docs

**Files:**

- Modify: `dev_docs_v3/08-sprints/sprint-04-commission-build.md`

- [ ] **Step 1: Mark all tasks as done in sprint-04 doc**

Update the status column for all COM tasks from `planned` to `done`.

- [ ] **Step 2: Update STATUS.md**

Update `dev_docs_v3/STATUS.md` current sprint reference and commission/agents service health entries.

- [ ] **Step 3: Run full build verification**

Run: `pnpm build`
Expected: Build succeeds

Run: `pnpm check-types`
Expected: No type errors

Run: `pnpm lint`
Expected: No new lint errors

- [ ] **Step 4: Commit docs**

```bash
git add dev_docs_v3/08-sprints/sprint-04-commission-build.md dev_docs_v3/STATUS.md
git commit -m "docs: mark Sprint 04 tasks complete, update STATUS.md"
```
