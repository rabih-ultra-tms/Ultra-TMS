# MP-10 Frontend Build Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build complete frontend for Agents (9 pages) + Credit (10 pages) services with 23 React Query hooks and 20 components using TDD approach.

**Architecture:** Parallel phase-gated build (Week 1: all hooks with TDD, Week 2: all components with tests, Week 3: all pages with integration). Each phase has quality gates (linting, types, coverage) before proceeding.

**Tech Stack:** React 19, Next.js 16 (App Router), React Query, Zod, TypeScript strict mode, shadcn/ui, Tailwind 4, Jest + React Testing Library, MSW (Mock Service Worker)

**Design Document:** `dev_docs/superpowers/specs/2026-03-17-mp10-frontend-design.md`

---

## File Structure Overview

### Phase 1: Hooks (23 files)

**Agents Hooks (10):**

```
apps/web/lib/hooks/agents/
├── use-agents.ts (+ .test.ts)
├── use-agent.ts (+ .test.ts)
├── use-agent-mutations.ts (+ .test.ts)
├── use-agent-agreements.ts (+ .test.ts)
├── use-agent-commissions.ts (+ .test.ts)
├── use-agent-leads.ts (+ .test.ts)
├── use-agent-customers.ts (+ .test.ts)
├── use-agent-statements.ts (+ .test.ts)
├── use-agent-performance.ts (+ .test.ts)
└── use-agent-rankings.ts (+ .test.ts)
```

**Credit Hooks (13):**

```
apps/web/lib/hooks/credit/
├── use-credit-applications.ts (+ .test.ts)
├── use-credit-application.ts (+ .test.ts)
├── use-create-credit-application.ts (+ .test.ts)
├── use-approve-credit-application.ts (+ .test.ts)
├── use-reject-credit-application.ts (+ .test.ts)
├── use-credit-limits.ts (+ .test.ts)
├── use-credit-limit.ts (+ .test.ts)
├── use-credit-utilization.ts (+ .test.ts)
├── use-credit-holds.ts (+ .test.ts)
├── use-collections-queue.ts (+ .test.ts)
├── use-aging-report.ts (+ .test.ts)
├── use-payment-plans.ts (+ .test.ts)
└── use-dnb-lookup.ts (+ .test.ts)
```

### Phase 2: Components (20 files)

**Agents Components (10):**

```
apps/web/components/agents/
├── agents-dashboard.tsx (+ .test.tsx, .stories.tsx)
├── agents-list.tsx (+ .test.tsx, .stories.tsx)
├── agent-detail.tsx (+ .test.tsx, .stories.tsx)
├── agent-form.tsx (+ .test.tsx, .stories.tsx)
├── agent-status-badge.tsx (+ .test.tsx, .stories.tsx)
├── agent-agreement-card.tsx (+ .test.tsx, .stories.tsx)
├── agent-commissions-table.tsx (+ .test.tsx, .stories.tsx)
├── agent-leads-table.tsx (+ .test.tsx, .stories.tsx)
├── agent-performance-chart.tsx (+ .test.tsx, .stories.tsx)
└── customer-assignments-table.tsx (+ .test.tsx, .stories.tsx)
```

**Credit Components (10):**

```
apps/web/components/credit/
├── credit-dashboard-cards.tsx (+ .test.tsx, .stories.tsx)
├── credit-application-form.tsx (+ .test.tsx, .stories.tsx)
├── credit-application-detail.tsx (+ .test.tsx, .stories.tsx)
├── credit-application-list.tsx (+ .test.tsx, .stories.tsx)
├── credit-limit-card.tsx (+ .test.tsx, .stories.tsx)
├── credit-utilization-bar.tsx (+ .test.tsx, .stories.tsx)
├── credit-hold-banner.tsx (+ .test.tsx, .stories.tsx)
├── collection-activity-log.tsx (+ .test.tsx, .stories.tsx)
├── aging-bucket-chart.tsx (+ .test.tsx, .stories.tsx)
└── payment-plan-timeline.tsx (+ .test.tsx, .stories.tsx)
```

### Phase 3: Pages (19 files)

**Agents Pages (9):**

```
apps/web/app/(dashboard)/agents/
├── page.tsx (Dashboard)
├── list/page.tsx (List)
├── new/page.tsx (Setup)
├── [id]/page.tsx (Detail)
├── [id]/performance/page.tsx (Performance)
├── [id]/commissions/page.tsx (Commission Setup)
├── [id]/portal-access/page.tsx (Portal Users)
├── territories/page.tsx (Territories)
└── reports/page.tsx (Reports)
```

**Credit Pages (10):**

```
apps/web/app/(dashboard)/credit/
├── page.tsx (Dashboard)
├── applications/page.tsx (Applications List)
├── applications/new/page.tsx (Application Form)
├── applications/[id]/page.tsx (Application Detail)
├── review/page.tsx (Review Queue)
├── limits/page.tsx (Limits)
├── monitoring/page.tsx (Monitoring)
├── collections/page.tsx (Collections Queue)
├── collections/[id]/page.tsx (Collection Detail)
├── reports/page.tsx (Reports)
└── dnb/page.tsx (D&B Integration)
```

---

# Phase 1: Hooks with TDD

## Chunk 1: Project Setup + Agents Hooks (1-5)

### Task 1: Project Setup & Test Infrastructure

**Files:**

- Modify: `apps/web/lib/hooks/agents/` (create directory structure)
- Modify: `apps/web/lib/hooks/credit/` (create directory structure)
- Reference: Existing hook patterns in `apps/web/lib/hooks/carriers/`, `apps/web/lib/hooks/commissions/`

- [ ] **Step 1: Create agents hooks directory structure**

```bash
mkdir -p apps/web/lib/hooks/agents
mkdir -p apps/web/lib/hooks/credit
```

- [ ] **Step 2: Review existing hook patterns**

Read and reference:

- `apps/web/lib/hooks/carriers/use-carrier-scorecard.ts` (query pattern)
- `apps/web/lib/hooks/commissions/` (if exists)
- Note: All hooks use React Query with `useQuery()` and `useMutation()`
- All API responses have envelope: `response.data.data` (unwrap in hook)
- Error handling: throw errors, let caller handle

- [ ] **Step 3: Commit project setup**

```bash
git add apps/web/lib/hooks/
git commit -m "chore: create hook directory structures for agents and credit"
```

---

### Task 2: `useAgents` Hook (Query + Pagination)

**Files:**

- Create: `apps/web/lib/hooks/agents/use-agents.ts`
- Create: `apps/web/lib/hooks/agents/use-agents.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/lib/hooks/agents/use-agents.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useAgents } from './use-agents'

// Mock fetch globally
global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient()
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAgents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch agents with default pagination', async () => {
    const mockData = {
      data: {
        data: [
          { id: '1', agentCode: 'A001', companyName: 'Agent 1', status: 'ACTIVE' },
          { id: '2', agentCode: 'A002', companyName: 'Agent 2', status: 'ACTIVE' },
        ],
        pagination: { page: 1, limit: 20, total: 25, totalPages: 2 },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useAgents({}), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.pagination.total).toBe(25)
  })

  it('should filter agents by status', async () => {
    const mockData = {
      data: {
        data: [{ id: '1', agentCode: 'A001', status: 'ACTIVE' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useAgents({ status: 'ACTIVE' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.every((a) => a.status === 'ACTIVE')).toBe(true)
  })

  it('should handle API error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useAgents({}), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter web test use-agents.test.ts
```

Expected output: Tests fail with "useAgents is not defined"

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/lib/hooks/agents/use-agents.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';

interface Agent {
  id: string;
  agentCode: string;
  companyName: string;
  status: string;
  [key: string]: any;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseAgentsOptions {
  status?: string;
  page?: number;
  limit?: number;
}

export function useAgents(options: UseAgentsOptions = {}) {
  const { status, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ['agents', { status, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/v1/agents?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const json = await response.json();
      return {
        data: json.data.data,
        pagination: json.data.pagination,
      };
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter web test use-agents.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/hooks/agents/use-agents.ts apps/web/lib/hooks/agents/use-agents.test.ts
git commit -m "feat(agents): add useAgents hook with pagination and filtering"
```

---

### Task 3: `useAgent` Hook (Single Item Query)

**Files:**

- Create: `apps/web/lib/hooks/agents/use-agent.ts`
- Create: `apps/web/lib/hooks/agents/use-agent.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/web/lib/hooks/agents/use-agent.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useAgent } from './use-agent'

global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient()
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch agent by ID', async () => {
    const mockData = {
      data: {
        id: '123',
        agentCode: 'A001',
        companyName: 'Test Agent',
        status: 'ACTIVE',
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData.data }),
    })

    const { result } = renderHook(() => useAgent('123'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.id).toBe('123')
    expect(result.current.data?.companyName).toBe('Test Agent')
  })

  it('should handle 404 not found', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    const { result } = renderHook(() => useAgent('invalid-id'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter web test use-agent.test.ts
```

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/lib/hooks/agents/use-agent.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';

interface Agent {
  id: string;
  agentCode: string;
  companyName: string;
  status: string;
  [key: string]: any;
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/agents/${agentId}`);
      if (!response.ok) {
        throw new Error(`Agent not found: ${response.status}`);
      }

      const json = await response.json();
      return json.data as Agent;
    },
    enabled: !!agentId,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter web test use-agent.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/hooks/agents/use-agent.ts apps/web/lib/hooks/agents/use-agent.test.ts
git commit -m "feat(agents): add useAgent hook for single agent detail"
```

---

### Task 4-5: Remaining Agents Hooks

Due to token limits, I'll provide the pattern for Tasks 4-5. Follow the same TDD approach:

**Task 4: `useAgentMutations` (create, update, activate, suspend, terminate)**

- Test file covers all 5 mutation operations
- Implementation uses `useMutation` with POST/PUT endpoints
- Each mutation has success/error handling

**Task 5: `useAgentAgreements` (list + CRUD)**

- Test file covers pagination, create, update, delete
- Implementation uses combined query + mutation hooks
- Nested resource: `/agents/:id/agreements`

**Commands for Tasks 4-5:**

```bash
# Task 4
pnpm --filter web test use-agent-mutations.test.ts
git commit -m "feat(agents): add useAgentMutations hook for agent lifecycle"

# Task 5
pnpm --filter web test use-agent-agreements.test.ts
git commit -m "feat(agents): add useAgentAgreements hook for agreements management"
```

---

## Chunk 2: Remaining Agents Hooks (6-10)

### Task 6-10: Complete Agents Hooks

Complete the following hooks using the same TDD pattern:

| Hook                  | Endpoint                         | Key Test Cases                    |
| --------------------- | -------------------------------- | --------------------------------- |
| `useAgentCommissions` | GET `/agents/:id/commissions`    | pagination, empty state, error    |
| `useAgentLeads`       | GET/POST `/agents/:id/leads`     | list, qualify, convert, reject    |
| `useAgentCustomers`   | GET/POST `/agents/:id/customers` | list, assign, transfer, terminate |
| `useAgentStatements`  | GET `/agents/:id/statements`     | pagination, PDF download          |
| `useAgentPerformance` | GET `/agents/:id/performance`    | aggregates, zero-value handling   |
| `useAgentRankings`    | GET `/agents/rankings`           | sorted results, top 10            |

**Process for each:**

1. Create `use-[name].test.ts` with 3-4 test cases
2. Run test (expect fail)
3. Create `use-[name].ts` implementation
4. Run test (expect pass)
5. Commit with message: `feat(agents): add use[Name] hook`

**Commands:**

```bash
# After completing all 6 hooks, verify they pass
pnpm --filter web test --testPathPattern=agents
```

Expected: All 10 agents hooks tests pass

---

## Chunk 3: Credit Hooks (11-23) + Phase 1 QA

### Task 11-23: All Credit Hooks

Follow same TDD pattern for all 13 Credit hooks:

| Hook                          | Endpoint                                    | Key Test Cases                          |
| ----------------------------- | ------------------------------------------- | --------------------------------------- |
| `useCreditApplications`       | GET `/credit/applications`                  | pagination, status filters, empty       |
| `useCreditApplication`        | GET `/credit/applications/:id`              | found, not found, all statuses          |
| `useCreateCreditApplication`  | POST `/credit/applications`                 | validation, required fields             |
| `useApproveCreditApplication` | POST `/credit/applications/:id/approve`     | approval with limit                     |
| `useRejectCreditApplication`  | POST `/credit/applications/:id/reject`      | rejection with reason                   |
| `useCreditLimits`             | GET `/credit/limits`                        | pagination, status filters              |
| `useCreditLimit`              | GET `/credit/limits/:companyId`             | found, not found                        |
| `useCreditUtilization`        | GET `/credit/limits/:companyId/utilization` | percent calc, thresholds                |
| `useCreditHolds`              | GET `/credit/holds`                         | pagination, reason filters, active only |
| `useCollectionsQueue`         | GET `/credit/collections`                   | pagination, aging buckets               |
| `useAgingReport`              | GET `/credit/collections/aging`             | bucket calculations                     |
| `usePaymentPlans`             | GET/POST/PUT `/credit/payment-plans`        | list, create, update, record-payment    |
| `useDnbLookup`                | GET `/credit/dnb`                           | API integration, result mapping         |

**Process:** Same TDD pattern as Agents hooks (test → implement → pass → commit)

**Verification after completing all 13:**

```bash
pnpm --filter web test --testPathPattern=credit
```

Expected: All 13 credit hooks tests pass

---

### Task 24: Phase 1 Quality Assurance

- [ ] **Step 1: Run all hook tests**

```bash
pnpm --filter web test --testPathPattern="(agents|credit)" --verbose
```

Expected: All 23 tests pass, 0 failures

- [ ] **Step 2: Verify test coverage >95%**

```bash
pnpm --filter web test:coverage --testPathPattern="(agents|credit)"
```

Expected: Coverage report shows >95% for hook logic

- [ ] **Step 3: Run linting**

```bash
pnpm lint apps/web/lib/hooks/agents apps/web/lib/hooks/credit
```

Expected: 0 errors, 0 warnings

- [ ] **Step 4: Type check**

```bash
pnpm check-types
```

Expected: 0 TypeScript errors

- [ ] **Step 5: Commit Phase 1 completion**

```bash
git add -A
git commit -m "feat: MP-10 Phase 1 - Add 23 hooks with TDD (agents + credit)

- 10 Agents hooks: useAgents, useAgent, useAgentMutations, useAgentAgreements, useAgentCommissions, useAgentLeads, useAgentCustomers, useAgentStatements, useAgentPerformance, useAgentRankings
- 13 Credit hooks: useCreditApplications, useCreditApplication, useCreateCreditApplication, useApproveCreditApplication, useRejectCreditApplication, useCreditLimits, useCreditLimit, useCreditUtilization, useCreditHolds, useCollectionsQueue, useAgingReport, usePaymentPlans, useDnbLookup
- All hooks use React Query + Zod validation
- TDD approach: test-first implementation
- Test coverage: >95%
- All linting and type checks pass"
```

Expected: Commit succeeds, Phase 1 complete

---

# Phase 2: Components with Tests & Storybook

## Chunk 4: Agents Components (1-10)

### Task 25: `AgentsDashboard` Component

**Files:**

- Create: `apps/web/components/agents/agents-dashboard.tsx`
- Create: `apps/web/components/agents/agents-dashboard.test.tsx`
- Create: `apps/web/components/agents/agents-dashboard.stories.tsx`

- [ ] **Step 1: Write failing component test**

Create `apps/web/components/agents/agents-dashboard.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { AgentsDashboard } from './agents-dashboard'

const createWrapper = () => {
  const queryClient = new QueryClient()
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Mock hooks
jest.mock('@/lib/hooks/agents/use-agent-rankings', () => ({
  useAgentRankings: () => ({
    data: [
      { agentId: '1', netCommission: 50000, agent: { companyName: 'Agent 1' } },
      { agentId: '2', netCommission: 40000, agent: { companyName: 'Agent 2' } },
    ],
    isLoading: false,
    error: null,
  }),
}))

jest.mock('@/lib/hooks/agents/use-agents', () => ({
  useAgents: () => ({
    data: Array(15).fill(null).map((_, i) => ({ id: `${i}`, agentCode: `A00${i}`, companyName: `Agent ${i}` })),
    isLoading: false,
    error: null,
  }),
}))

describe('AgentsDashboard', () => {
  it('should render dashboard with KPI cards', () => {
    render(<AgentsDashboard tenantId="test-tenant" />, { wrapper: createWrapper() })

    expect(screen.getByText(/Agents Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Agents/i)).toBeInTheDocument()
  })

  it('should display top agents ranking', async () => {
    render(<AgentsDashboard tenantId="test-tenant" />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument()
      expect(screen.getByText('Agent 2')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    jest.mock('@/lib/hooks/agents/use-agent-rankings', () => ({
      useAgentRankings: () => ({
        data: null,
        isLoading: true,
        error: null,
      }),
    }))

    render(<AgentsDashboard tenantId="test-tenant" />, { wrapper: createWrapper() })

    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter web test agents-dashboard.test.tsx
```

Expected: Test fails (component doesn't exist)

- [ ] **Step 3: Write component implementation**

Create `apps/web/components/agents/agents-dashboard.tsx`:

```typescript
'use client'

import { Suspense } from 'react'
import { useAgentRankings } from '@/lib/hooks/agents/use-agent-rankings'
import { useAgents } from '@/lib/hooks/agents/use-agents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AgentsList } from './agents-list'

interface AgentsDashboardProps {
  tenantId: string
}

export function AgentsDashboard({ tenantId }: AgentsDashboardProps) {
  const { data: agents, isLoading: agentsLoading } = useAgents({ limit: 5 })
  const { data: rankings, isLoading: rankingsLoading } = useAgentRankings()

  if (agentsLoading || rankingsLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agents Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents?.filter((a) => a.status === 'ACTIVE').length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${rankings?.reduce((sum, r) => sum + Number(r.netCommission || 0), 0).toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rankings?.[0]?.agent?.companyName || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Agents List */}
      <Card>
        <CardHeader>
          <CardTitle>Top Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-40" />}>
            <AgentsList tenantId={tenantId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array(4).fill(null).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter web test agents-dashboard.test.tsx
```

Expected: Tests pass

- [ ] **Step 5: Add Storybook story**

Create `apps/web/components/agents/agents-dashboard.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AgentsDashboard } from './agents-dashboard'

const meta: Meta<typeof AgentsDashboard> = {
  component: AgentsDashboard,
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AgentsDashboard>

export const Default: Story = {
  args: {
    tenantId: 'test-tenant',
  },
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/agents/agents-dashboard.*
git commit -m "feat(agents): add AgentsDashboard component with KPI cards and rankings"
```

---

### Tasks 26-34: Remaining Agents Components

Complete the remaining 9 Agents components using same pattern:

| Component                  | Props                                                     | Hooks Used                                  | Test Focus                                         |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `AgentsList`               | `{ tenantId: string; onSelect?: (id) => void }`           | useAgents, useAgentMutations                | pagination, filters, selection                     |
| `AgentDetail`              | `{ agentId: string; mode: 'view'\|'edit' }`               | useAgent, useAgentAgreements, useAgentLeads | tabs, loading, not found                           |
| `AgentForm`                | `{ agentId?: string; onSuccess?: () => void }`            | useAgentMutations                           | create/edit, validation, submit                    |
| `AgentStatusBadge`         | `{ status: AgentStatus }`                                 | (none)                                      | color states (PENDING/ACTIVE/SUSPENDED/TERMINATED) |
| `AgentAgreementCard`       | `{ agreement: AgentAgreement; editable?: bool }`          | useAgentMutations                           | read-only, edit mode                               |
| `AgentCommissionsTable`    | `{ agentId: string; limit?: number }`                     | useAgentCommissions                         | pagination, empty state                            |
| `AgentLeadsTable`          | `{ agentId: string }`                                     | useAgentLeads, useAgentMutations            | status pipeline, action buttons                    |
| `AgentPerformanceChart`    | `{ agentId: string; period: 'month'\|'quarter'\|'year' }` | useAgentPerformance                         | chart render, period selector                      |
| `CustomerAssignmentsTable` | `{ agentId: string }`                                     | useAgentCustomers, useAgentMutations        | assignment types, protection dates                 |

**Process for each:**

1. Create `.test.tsx` with 3-4 test cases
2. Create `.tsx` component implementation
3. Create `.stories.tsx` Storybook story
4. Run: `pnpm --filter web test [component].test.tsx`
5. Commit with: `feat(agents): add [Component] component`

**Validation after all 10:**

```bash
pnpm --filter web test --testPathPattern="components/agents"
```

Expected: All 10 component tests pass

---

## Chunk 5: Credit Components (11-20)

### Tasks 35-44: All Credit Components

Complete all 10 Credit components using same pattern:

| Component                 | Props                                                     | Hooks Used                                        | Test Focus                           |
| ------------------------- | --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| `CreditDashboardCards`    | `{ tenantId: string }`                                    | useCreditLimits, useCreditHolds                   | loading, KPI values                  |
| `CreditApplicationForm`   | `{ companyId?: string; onSuccess?: () => void }`          | useCreateCreditApplication                        | create/edit, validation              |
| `CreditApplicationDetail` | `{ applicationId: string; mode: 'view'\|'review' }`       | useCreditApplication, useApproveCreditApplication | loading, review workflow             |
| `CreditApplicationList`   | `{ status?: ApplicationStatus; onSelect?: (id) => void }` | useCreditApplications                             | pagination, status filters           |
| `CreditLimitCard`         | `{ limit: CreditLimit; showUtilization?: bool }`          | useCreditUtilization                              | utilization bar, thresholds          |
| `CreditUtilizationBar`    | `{ used: number; limit: number; threshold?: number }`     | (none)                                            | color progression (green→yellow→red) |
| `CreditHoldBanner`        | `{ companyId: string }`                                   | useCreditHolds                                    | shows active holds, dismiss          |
| `CollectionActivityLog`   | `{ companyId: string }`                                   | useCollectionsQueue, usePaymentPlans              | timeline, activity types             |
| `AgingBucketChart`        | `{ tenantId: string }`                                    | useAgingReport                                    | stacked bar chart, 5 buckets         |
| `PaymentPlanTimeline`     | `{ planId: string }`                                      | usePaymentPlans                                   | installment timeline, status         |

**Process:** Same TDD pattern (test → implement → story → pass → commit)

**Validation after all 10:**

```bash
pnpm --filter web test --testPathPattern="components/credit"
```

Expected: All 10 component tests pass

---

## Chunk 6: Phase 2 Quality Assurance

### Task 45: Phase 2 QA

- [ ] **Step 1: Run all component tests**

```bash
pnpm --filter web test --testPathPattern="components/(agents|credit)"
```

Expected: All 20 component tests pass

- [ ] **Step 2: Build Storybook**

```bash
pnpm storybook:build
```

Expected: Build succeeds, no errors

- [ ] **Step 3: Verify test coverage >85%**

```bash
pnpm --filter web test:coverage --testPathPattern="components/(agents|credit)"
```

Expected: Coverage >85%

- [ ] **Step 4: Run linting**

```bash
pnpm lint apps/web/components/agents apps/web/components/credit
```

Expected: 0 errors, 0 warnings

- [ ] **Step 5: Type check**

```bash
pnpm check-types
```

Expected: 0 TypeScript errors

- [ ] **Step 6: Commit Phase 2 completion**

```bash
git add -A
git commit -m "feat: MP-10 Phase 2 - Add 20 components with tests (agents + credit)

- 10 Agents components: AgentsDashboard, AgentsList, AgentDetail, AgentForm, AgentStatusBadge, AgentAgreementCard, AgentCommissionsTable, AgentLeadsTable, AgentPerformanceChart, CustomerAssignmentsTable
- 10 Credit components: CreditDashboardCards, CreditApplicationForm, CreditApplicationDetail, CreditApplicationList, CreditLimitCard, CreditUtilizationBar, CreditHoldBanner, CollectionActivityLog, AgingBucketChart, PaymentPlanTimeline
- TDD approach: test-first implementation with snapshot tests
- All components have TypeScript props interfaces
- 20 Storybook stories added for visual verification
- Test coverage: >85%
- All linting and type checks pass"
```

---

# Phase 3: Pages with Integration

## Chunk 7: Agents Pages (1-9)

### Task 46-54: All Agents Pages

Build all 9 Agents pages using the page layout pattern from design:

| Page             | Route                        | Key Components                          | Key Hooks                                   | Task |
| ---------------- | ---------------------------- | --------------------------------------- | ------------------------------------------- | ---- |
| Dashboard        | `/agents`                    | AgentsDashboard                         | useAgentRankings, useAgents                 | 46   |
| List             | `/agents/list`               | AgentsList, filters                     | useAgents, useAgentMutations                | 47   |
| Detail           | `/agents/[id]`               | AgentDetail (tabs)                      | useAgent, useAgentAgreements, useAgentLeads | 48   |
| Setup            | `/agents/new`                | AgentForm (multi-step)                  | useAgentMutations                           | 49   |
| Performance      | `/agents/[id]/performance`   | AgentPerformanceChart, CommissionsTable | useAgentPerformance, useAgentCommissions    | 50   |
| Commission Setup | `/agents/[id]/commissions`   | AgentAgreementCard form                 | useAgentAgreements, useAgentMutations       | 51   |
| Territories      | `/agents/territories`        | Territory map, list                     | useAgents                                   | 52   |
| Reports          | `/agents/reports`            | AgentPerformanceChart, rankings table   | useAgentRankings, useAgentPerformance       | 53   |
| Portal Users     | `/agents/[id]/portal-access` | Portal user manager                     | useAgentMutations                           | 54   |

**Template for each page:**

```typescript
// /agents/[page]/page.tsx
import { ErrorBoundary } from '@/components/error-boundary'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Suspense } from 'react'
import { [Component] } from '@/components/agents/[component]'

interface PageProps {
  params: { id?: string }
  searchParams: Record<string, string | string[] | undefined>
}

export default function Page({ params, searchParams }: PageProps) {
  return (
    <ErrorBoundary fallback={<ErrorPageFallback />}>
      <div className="container py-8">
        <Breadcrumb items={[
          { label: 'Agents', href: '/agents' },
          { label: 'Page Name', href: '#' },
        ]} />
        <Suspense fallback={<PageSkeleton />}>
          <[Component] {...props} />
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}
```

**Process for each page:**

1. Create page file at correct route
2. Wire up components and hooks
3. Add error boundary, breadcrumb, Suspense
4. Test: navigate to route, verify renders, check API calls in Network tab
5. Commit: `feat(agents): add [page name] page`

**After all 9 Agents pages:**

```bash
# Navigate each route in dev environment, verify:
# - Page loads without errors
# - Components render
# - API calls are made
# - Data displays correctly
pnpm dev
# Visit: /agents, /agents/list, /agents/new, /agents/[id], etc.
```

---

## Chunk 8: Credit Pages (10-20)

### Task 55-64: All Credit Pages

Build all 10 Credit pages using same pattern:

| Page               | Route                       | Key Components                             | Key Hooks                                         | Task |
| ------------------ | --------------------------- | ------------------------------------------ | ------------------------------------------------- | ---- |
| Dashboard          | `/credit`                   | CreditDashboardCards, AgingChart           | useCreditLimits, useAgingReport                   | 55   |
| Applications List  | `/credit/applications`      | CreditApplicationList, filters             | useCreditApplications                             | 56   |
| Application Form   | `/credit/applications/new`  | CreditApplicationForm (multi-step)         | useCreateCreditApplication                        | 57   |
| Application Detail | `/credit/applications/[id]` | CreditApplicationDetail, ApprovalForm      | useCreditApplication, useApproveCreditApplication | 58   |
| Review Queue       | `/credit/review`            | CreditApplicationList (filtered)           | useCreditApplications                             | 59   |
| Limits             | `/credit/limits`            | CreditLimitCard grid                       | useCreditLimits                                   | 60   |
| Monitoring         | `/credit/monitoring`        | CreditDashboardCards, thresholds           | useCreditLimits, useCreditHolds                   | 61   |
| Collections Queue  | `/credit/collections`       | CollectionActivityLog, filters             | useCollectionsQueue, useAgingReport               | 62   |
| Collection Detail  | `/credit/collections/[id]`  | CollectionActivityLog, PaymentPlanTimeline | useCollectionsQueue, usePaymentPlans              | 63   |
| Reports            | `/credit/reports`           | AgingBucketChart, export                   | useAgingReport, useCreditLimits                   | 64   |
| D&B Integration    | `/credit/dnb`               | DNB lookup form, viewer                    | useDnbLookup                                      | 65   |

**Process:** Same as Agents pages (template → component wiring → test routing → commit)

**After all 10 Credit pages:**

```bash
# Navigate all routes, verify same checks as Agents
pnpm dev
# Visit: /credit, /credit/applications, /credit/limits, etc.
```

---

## Chunk 9: Phase 3 Quality Assurance & Final Verification

### Task 65: Phase 3 QA + Final Verification

- [ ] **Step 1: Run all tests**

```bash
pnpm --filter web test
```

Expected: All tests pass (>80% coverage overall)

- [ ] **Step 2: Run linting**

```bash
pnpm lint
```

Expected: 0 errors for all modified files

- [ ] **Step 3: Type check**

```bash
pnpm check-types
```

Expected: 0 TypeScript errors

- [ ] **Step 4: Full build**

```bash
pnpm build
```

Expected: Build succeeds, no errors or warnings

- [ ] **Step 5: Manual verification (all 19 pages)**

```bash
pnpm dev
```

Checklist for each page:

- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Components render correctly
- [ ] API calls appear in Network tab
- [ ] Data displays correctly (no "undefined", missing fields)
- [ ] User interactions work (buttons, filters, forms)
- [ ] Loading states display while fetching
- [ ] Error states appear gracefully

**Agents pages to verify:**

- [ ] /agents (dashboard)
- [ ] /agents/list (list view)
- [ ] /agents/new (create form)
- [ ] /agents/[id] (detail view)
- [ ] /agents/[id]/performance (performance charts)
- [ ] /agents/[id]/commissions (commission setup)
- [ ] /agents/territories (territory map)
- [ ] /agents/reports (reports)
- [ ] /agents/[id]/portal-access (portal users)

**Credit pages to verify:**

- [ ] /credit (dashboard)
- [ ] /credit/applications (applications list)
- [ ] /credit/applications/new (application form)
- [ ] /credit/applications/[id] (application detail)
- [ ] /credit/review (review queue)
- [ ] /credit/limits (limits list)
- [ ] /credit/monitoring (monitoring dashboard)
- [ ] /credit/collections (collections queue)
- [ ] /credit/collections/[id] (collection detail)
- [ ] /credit/reports (reports)
- [ ] /credit/dnb (D&B integration)

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: MP-10 Phase 3 - Add 19 pages with integration (agents + credit)

**Agents Pages (9):**
- /agents (Dashboard with KPI cards)
- /agents/list (Filterable list with pagination)
- /agents/new (Multi-step agent setup form)
- /agents/[id] (Detail view with tabs)
- /agents/[id]/performance (Performance charts and metrics)
- /agents/[id]/commissions (Commission setup and agreements)
- /agents/territories (Territory mapping and assignment)
- /agents/reports (Rankings, payouts, metrics reports)
- /agents/[id]/portal-access (External agent portal management)

**Credit Pages (10):**
- /credit (Dashboard with KPI cards and aging analysis)
- /credit/applications (Filterable applications list by status)
- /credit/applications/new (Multi-step application form)
- /credit/applications/[id] (Application detail with approval workflow)
- /credit/review (Review queue for pending applications)
- /credit/limits (Credit limits grid with utilization)
- /credit/monitoring (Credit monitoring with threshold alerts)
- /credit/collections (Collections work queue with aging)
- /credit/collections/[id] (Collection detail with activity log)
- /credit/reports (Aging analysis and exposure reports)
- /credit/dnb (Dun & Bradstreet credit check lookup)

**All pages include:**
- Error boundaries for crash handling
- Suspense with skeleton fallbacks
- Breadcrumb navigation
- Responsive layouts (mobile-first)
- Loading and error states
- Integration with all hooks and components

**Test Coverage:** >80% overall
**Build Status:** ✅ Passing
**Lint Status:** ✅ 0 errors
**Type Status:** ✅ 0 errors
**Manual Verification:** ✅ All 19 pages tested and functional"
```

- [ ] **Step 7: Verify commit**

```bash
git log --oneline -5
```

Expected: Last 3 commits show:

```
[current] feat: MP-10 Phase 3 - Add 19 pages with integration
[previous] feat: MP-10 Phase 2 - Add 20 components with tests
[previous] feat: MP-10 Phase 1 - Add 23 hooks with TDD
```

---

## Summary

**Total deliverables by end of MP-10:**

✅ **23 Hooks** (10 Agents + 13 Credit) with TDD

- All hooks use React Query + Zod validation
- All tests passing (>95% coverage)
- Proper error handling and loading states

✅ **20 Components** (10 Agents + 10 Credit)

- All components have TypeScript interfaces
- Snapshot + behavior tests for each
- Storybook stories for visual verification
- Test coverage >85%

✅ **19 Pages** (9 Agents + 10 Credit)

- All pages wire hooks + components correctly
- Error boundaries, Suspense, breadcrumbs
- Responsive layouts, loading/error states
- All routes navigable and functional

✅ **Quality Gates**

- All linting: 0 errors
- All TypeScript: 0 errors
- All tests: >80% coverage
- Full build: ✅ Passing
- Manual verification: ✅ All pages tested

✅ **3 Phase Commits**

- Phase 1: Hooks with TDD
- Phase 2: Components with tests
- Phase 3: Pages with integration

---

**Status:** ✅ Ready for Implementation

**Next Step:** Execute using `superpowers:subagent-driven-development` (if available) or `superpowers:executing-plans`
