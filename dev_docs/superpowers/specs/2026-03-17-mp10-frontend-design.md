# MP-10 Frontend Build Design: Agents + Credit Services

**Date:** 2026-03-17
**Status:** Approved
**Scope:** 19 frontend pages (Agents 9 + Credit 10), 20 components, 23 React Query hooks
**Timeline:** 3 weeks (15 business days)
**Approach:** Parallel phase-gated build with TDD

---

## 1. Overview

MP-10 builds the complete frontend for two P2 Extended services:

- **Agents (Service 16):** 9 pages, 10 hooks, 10 components — agent management, performance tracking, commission configuration
- **Credit (Service 17):** 10 pages, 13 hooks, 10 components — credit assessment, limit management, collections

Both services have complete backend APIs (42 + 31 endpoints), detailed design specs (9 + 11 files), and verified Prisma schemas.

**Core Constraint:** Build both services in parallel to maximize pattern reuse and consistency.

---

## 2. Architecture & Code Organization

### 2.1 Directory Structure

```
apps/web/
├── lib/hooks/
│   ├── agents/
│   │   ├── use-agents.ts
│   │   ├── use-agent.ts
│   │   ├── use-agent-mutations.ts
│   │   ├── use-agent-agreements.ts
│   │   ├── use-agent-commissions.ts
│   │   ├── use-agent-leads.ts
│   │   ├── use-agent-customers.ts
│   │   ├── use-agent-statements.ts
│   │   ├── use-agent-performance.ts
│   │   └── use-agent-rankings.ts
│   └── credit/
│       ├── use-credit-applications.ts
│       ├── use-credit-application.ts
│       ├── use-create-credit-application.ts
│       ├── use-approve-credit-application.ts
│       ├── use-reject-credit-application.ts
│       ├── use-credit-limits.ts
│       ├── use-credit-limit.ts
│       ├── use-credit-utilization.ts
│       ├── use-credit-holds.ts
│       ├── use-collections-queue.ts
│       ├── use-aging-report.ts
│       ├── use-payment-plans.ts
│       └── use-dnb-lookup.ts
│
├── components/
│   ├── agents/
│   │   ├── agents-dashboard.tsx
│   │   ├── agents-list.tsx
│   │   ├── agent-detail.tsx
│   │   ├── agent-form.tsx
│   │   ├── agent-status-badge.tsx
│   │   ├── agent-agreement-card.tsx
│   │   ├── agent-commissions-table.tsx
│   │   ├── agent-leads-table.tsx
│   │   ├── agent-performance-chart.tsx
│   │   └── customer-assignments-table.tsx
│   └── credit/
│       ├── credit-dashboard-cards.tsx
│       ├── credit-application-form.tsx
│       ├── credit-application-detail.tsx
│       ├── credit-application-list.tsx
│       ├── credit-limit-card.tsx
│       ├── credit-utilization-bar.tsx
│       ├── credit-hold-banner.tsx
│       ├── collection-activity-log.tsx
│       ├── aging-bucket-chart.tsx
│       └── payment-plan-timeline.tsx
│
└── app/(dashboard)/
    ├── agents/
    │   ├── page.tsx (Dashboard)
    │   ├── list/page.tsx (List)
    │   ├── [id]/page.tsx (Detail)
    │   ├── new/page.tsx (Setup)
    │   ├── [id]/performance/page.tsx (Performance)
    │   ├── [id]/commissions/page.tsx (Commission Setup)
    │   ├── territories/page.tsx (Territories)
    │   ├── reports/page.tsx (Reports)
    │   └── [id]/portal-access/page.tsx (Portal Users)
    │
    └── credit/
        ├── page.tsx (Dashboard)
        ├── applications/page.tsx (List)
        ├── applications/new/page.tsx (Form)
        ├── applications/[id]/page.tsx (Detail)
        ├── review/page.tsx (Review Queue)
        ├── limits/page.tsx (Limits)
        ├── monitoring/page.tsx (Monitoring)
        ├── collections/page.tsx (Collections Queue)
        ├── collections/[id]/page.tsx (Collection Detail)
        ├── reports/page.tsx (Reports)
        └── dnb/page.tsx (D&B Integration)
```

### 2.2 Pattern Consistency

All code follows existing project patterns from Commission, Load Board, and Carriers:

**Hooks:**

- Use React Query (`useQuery`, `useMutation`) for server state
- Wrap API responses: `response.data.data` envelope handling
- Export mutation hooks as `useSomethingMutation` with optimistic updates where appropriate
- Use Zod for runtime validation
- Error handling: throw on 4xx/5xx, caller handles errors

**Components:**

- Use shadcn/ui + Tailwind 4 for styling
- Accept props interface, no direct hook calls except where necessary
- Export TypeScript interface for props: `interface ComponentNameProps { ... }`
- Use Lucide React icons
- Loading states: skeleton screens or spinners
- Empty states: illustration + message + action
- Error states: error boundary compatible

**Pages:**

- Use `<ErrorBoundary>` wrapper (from MP-06)
- Use `<Suspense>` with skeleton fallbacks
- Add breadcrumb navigation
- Use shadcn/ui layouts (header, sidebar integration)
- Responsive grid/flex layouts
- No direct API calls; all via hooks

---

## 3. Phase 1: Hooks (Week 1 - All 23 Hooks with TDD)

### 3.1 Agents Hooks (10 total)

| Hook                  | Endpoint                          | Query Type                                               | Test Cases                        |
| --------------------- | --------------------------------- | -------------------------------------------------------- | --------------------------------- |
| `useAgents`           | GET `/agents`                     | Query with pagination/filters                            | pagination, filters, empty, error |
| `useAgent`            | GET `/agents/:id`                 | Query single                                             | found, not found, error           |
| `useAgentMutations`   | POST/PUT/action `/agents/*`       | Mutations (create, update, activate, suspend, terminate) | all 5 ops, validation, success    |
| `useAgentAgreements`  | GET/POST `/agents/:id/agreements` | Query list + mutation                                    | list, create, error               |
| `useAgentCommissions` | GET `/agents/:id/commissions`     | Query with pagination                                    | pagination, empty, error          |
| `useAgentLeads`       | GET/POST `/agents/:id/leads`      | Query list + mutations                                   | list, qualify, convert, reject    |
| `useAgentCustomers`   | GET/POST `/agents/:id/customers`  | Query list + mutations                                   | list, assign, transfer, terminate |
| `useAgentStatements`  | GET `/agents/:id/statements`      | Query list + PDF download                                | pagination, PDF fetch, error      |
| `useAgentPerformance` | GET `/agents/:id/performance`     | Query aggregates                                         | metrics calculation, zero values  |
| `useAgentRankings`    | GET `/agents/rankings`            | Query top 10                                             | sorted results, empty, error      |

### 3.2 Credit Hooks (13 total)

| Hook                          | Endpoint                                    | Query Type                    | Test Cases                                      |
| ----------------------------- | ------------------------------------------- | ----------------------------- | ----------------------------------------------- |
| `useCreditApplications`       | GET `/credit/applications`                  | Query with pagination/filters | pagination, status filters, empty, error        |
| `useCreditApplication`        | GET `/credit/applications/:id`              | Query single                  | found, not found, all statuses                  |
| `useCreateCreditApplication`  | POST `/credit/applications`                 | Mutation create               | validation, required fields, success            |
| `useApproveCreditApplication` | POST `/credit/applications/:id/approve`     | Mutation approve              | approval with limit, role check, error          |
| `useRejectCreditApplication`  | POST `/credit/applications/:id/reject`      | Mutation reject               | rejection with reason, success                  |
| `useCreditLimits`             | GET `/credit/limits`                        | Query with pagination/filters | pagination, status filters, error               |
| `useCreditLimit`              | GET `/credit/limits/:companyId`             | Query single                  | found, not found, error                         |
| `useCreditUtilization`        | GET `/credit/limits/:companyId/utilization` | Query read-only               | percent calc, thresholds (80%, 100%), error     |
| `useCreditHolds`              | GET `/credit/holds`                         | Query with pagination/filters | pagination, reason filters, active only, error  |
| `useCollectionsQueue`         | GET `/credit/collections`                   | Query with pagination         | pagination, aging buckets, follow-ups           |
| `useAgingReport`              | GET `/credit/collections/aging`             | Query aggregates              | bucket calculations, total accuracy, error      |
| `usePaymentPlans`             | GET/POST/PUT `/credit/payment-plans`        | Query list + mutations        | list, create, update, record-payment, cancel    |
| `useDnbLookup`                | GET `/credit/dnb`                           | Query read-only               | API integration, result mapping, error handling |

### 3.3 TDD Implementation Pattern

```typescript
// Step 1: Write test file
// use-agents.test.ts
describe('useAgents', () => {
  it('should fetch agents with default pagination', async () => {
    const { result } = renderHook(() => useAgents({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(10);
    expect(result.current.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 25,
    });
  });

  it('should filter agents by status', async () => {
    const { result } = renderHook(() => useAgents({ status: 'ACTIVE' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.every((a) => a.status === 'ACTIVE')).toBe(true);
  });

  it('should handle API error gracefully', async () => {
    // Mock API error
    const { result } = renderHook(() => useAgents({}));
    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error.message).toContain('Failed to fetch');
  });

  // ... more test cases
});

// Step 2: Implement hook to pass tests
// use-agents.ts
export function useAgents(
  options: { status?: string; page?: number; limit?: number } = {}
) {
  const { status, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ['agents', { status, page, limit }],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/agents?status=${status}&page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch agents');
      const json = await response.json();
      return json.data; // unwrap envelope
    },
  });
}

// Step 3: Run tests
// pnpm test use-agents.test.ts → PASS
```

### 3.4 Success Criteria for Phase 1

- ✅ 23 hook files created (agents/_ + credit/_)
- ✅ 23 hook test files created (\*.test.ts)
- ✅ All 23 test suites passing (0 failures)
- ✅ Test coverage >95% for hook logic
- ✅ No linting errors: `pnpm lint`
- ✅ No TypeScript errors: `pnpm check-types`
- ✅ All API envelope unwrapping verified (response.data.data)

---

## 4. Phase 2: Components (Week 2 - All 20 Components)

### 4.1 Agents Components (10 total)

| Component                  | Props Type                                                | Hooks Used                                  | Key States                                                            |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| `AgentsDashboard`          | `{ tenantId: string }`                                    | useAgentRankings, useAgents                 | loading, empty (0 agents), error, success (10+ agents)                |
| `AgentsList`               | `{ tenantId: string; onSelect?: (id) => void }`           | useAgents, useAgentMutations                | pagination, filters (status), selection, bulk actions                 |
| `AgentDetail`              | `{ agentId: string; mode: 'view'\|'edit' }`               | useAgent, useAgentAgreements, useAgentLeads | loading, not found (404), tabs, edit mode                             |
| `AgentForm`                | `{ agentId?: string; onSuccess?: () => void }`            | useAgentMutations                           | create mode, edit mode, validation errors, submit loading             |
| `AgentStatusBadge`         | `{ status: AgentStatus }`                                 | (none)                                      | PENDING (gray), ACTIVE (green), SUSPENDED (yellow), TERMINATED (red)  |
| `AgentAgreementCard`       | `{ agreement: AgentAgreement; editable?: bool }`          | useAgentMutations                           | read-only display, edit mode, split breakdown                         |
| `AgentCommissionsTable`    | `{ agentId: string; limit?: number }`                     | useAgentCommissions                         | pagination, sorting by date/amount, empty state                       |
| `AgentLeadsTable`          | `{ agentId: string }`                                     | useAgentLeads, useAgentMutations            | status pipeline (SUBMITTED→QUALIFIED→CONVERTED), action buttons       |
| `AgentPerformanceChart`    | `{ agentId: string; period: 'month'\|'quarter'\|'year' }` | useAgentPerformance                         | chart render, zero-value handling, period selector                    |
| `CustomerAssignmentsTable` | `{ agentId: string }`                                     | useAgentCustomers, useAgentMutations        | assignment types (PRIMARY/SECONDARY/SPLIT), protection dates, actions |

### 4.2 Credit Components (10 total)

| Component                 | Props Type                                                | Hooks Used                                              | Key States                                                              |
| ------------------------- | --------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `CreditDashboardCards`    | `{ tenantId: string }`                                    | useCreditLimits, useCreditHolds, useCollectionsQueue    | loading, KPI cards, trend indicators                                    |
| `CreditApplicationForm`   | `{ companyId?: string; onSuccess?: () => void }`          | useCreateCreditApplication, useApproveCreditApplication | create mode, edit mode, approval mode, validation                       |
| `CreditApplicationDetail` | `{ applicationId: string; mode: 'view'\|'review' }`       | useCreditApplication, useApproveCreditApplication       | loading, review queue, decision form, document display                  |
| `CreditApplicationList`   | `{ status?: ApplicationStatus; onSelect?: (id) => void }` | useCreditApplications                                   | pagination, status filters, row selection                               |
| `CreditLimitCard`         | `{ limit: CreditLimit; showUtilization?: bool }`          | useCreditUtilization                                    | utilization bar (green→yellow→red), threshold badges                    |
| `CreditUtilizationBar`    | `{ used: number; limit: number; threshold?: number }`     | (none)                                                  | color progression: <50% green, 50-80% yellow, 80-100% orange, >100% red |
| `CreditHoldBanner`        | `{ companyId: string }`                                   | useCreditHolds                                          | shows active holds, dismiss, reason display, alert styling              |
| `CollectionActivityLog`   | `{ companyId: string }`                                   | useCollectionsQueue, usePaymentPlans                    | timeline layout, activity types, follow-up badges, add activity form    |
| `AgingBucketChart`        | `{ tenantId: string }`                                    | useAgingReport                                          | stacked bar chart (CURRENT, 1-30, 31-60, 61-90, 90+), $ amounts, legend |
| `PaymentPlanTimeline`     | `{ planId: string }`                                      | usePaymentPlans                                         | installment timeline, paid/remaining visual, status badges              |

### 4.3 Component Test Pattern

```typescript
// credit-application-form.test.tsx
describe('CreditApplicationForm', () => {
  it('should render form with all required fields', () => {
    render(<CreditApplicationForm />)
    expect(screen.getByLabelText('Company')).toBeInTheDocument()
    expect(screen.getByLabelText('Federal Tax ID')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('should show validation errors on submit', async () => {
    render(<CreditApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.getByText('Company is required')).toBeInTheDocument()
    })
  })

  it('should call mutation on valid submit', async () => {
    const { useCreateCreditApplication: mockHook } = jest.mock('...')
    render(<CreditApplicationForm />)
    // Fill form...
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(mockHook).toHaveBeenCalledWith(expectedDto)
    })
  })
})

// Snapshot test (auto-generated)
it('should match snapshot', () => {
  const { container } = render(<CreditApplicationForm />)
  expect(container).toMatchSnapshot()
})
```

### 4.4 Success Criteria for Phase 2

- ✅ 20 component files created (agents/_ + credit/_)
- ✅ 20 component test files created (\*.test.tsx)
- ✅ All 20 test suites passing
- ✅ 20 Storybook stories created (`.stories.tsx`)
- ✅ Test coverage >85% for component logic
- ✅ No linting errors: `pnpm lint`
- ✅ All components render without errors in Storybook

---

## 5. Phase 3: Pages (Week 3 - All 19 Pages + Integration)

### 5.1 Agents Pages (9 total)

| Page             | Route                        | Components                                                                 | Hooks                                                            | Key Features                                                   |
| ---------------- | ---------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Dashboard        | `/agents`                    | AgentsDashboard, top 5 from AgentsList                                     | useAgentRankings, useAgents                                      | KPI cards, top agents ranking, quick actions                   |
| List             | `/agents/list`               | AgentsList, filters, pagination                                            | useAgents, useAgentMutations                                     | advanced filters (status, tier, type), bulk suspend/activate   |
| Detail           | `/agents/[id]`               | AgentDetail with tabs (profile, agreements, commissions, leads, customers) | useAgent, useAgentAgreements, useAgentCommissions, useAgentLeads | tabbed layout, edit mode, nested resource management           |
| Setup            | `/agents/new`                | AgentForm multi-step                                                       | useAgentMutations                                                | Step 1: contact info, Step 2: agreements, Step 3: bank details |
| Performance      | `/agents/[id]/performance`   | AgentPerformanceChart, CommissionsTable                                    | useAgentPerformance, useAgentCommissions                         | period selector (month/quarter/year), revenue/volume charts    |
| Commission Setup | `/agents/[id]/commissions`   | AgentAgreementCard form, tier editor                                       | useAgentAgreements, useAgentMutations                            | create agreement, define split type, configure tiers           |
| Territories      | `/agents/territories`        | Territory map (future: Google Maps), list view                             | useAgents                                                        | draw territories, assign agents, territory list table          |
| Reports          | `/agents/reports`            | AgentPerformanceChart, rankings table, export button                       | useAgentRankings, useAgentPerformance                            | rankings, payouts, lead conversion metrics, CSV export         |
| Portal Users     | `/agents/[id]/portal-access` | Portal user manager                                                        | useAgentMutations                                                | create external agent portal users, reset password, delete     |

### 5.2 Credit Pages (10 total)

| Page               | Route                       | Components                                                   | Hooks                                                                         | Key Features                                                              |
| ------------------ | --------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Dashboard          | `/credit`                   | CreditDashboardCards, AgingChart, CreditHoldBanner           | useCreditLimits, useAgingReport, useCreditHolds                               | KPI cards (exposure, holds, aging), alert badges, quick actions           |
| Applications List  | `/credit/applications`      | CreditApplicationList, status filters, pagination            | useCreditApplications                                                         | filterable by status (PENDING/UNDER_REVIEW/APPROVED/REJECTED), pagination |
| Application Form   | `/credit/applications/new`  | CreditApplicationForm multi-step                             | useCreateCreditApplication                                                    | Step 1: company select, Step 2: business info, Step 3: trade references   |
| Application Detail | `/credit/applications/[id]` | CreditApplicationDetail, ApprovalForm                        | useCreditApplication, useApproveCreditApplication, useRejectCreditApplication | full application view, approve/reject/conditions workflow                 |
| Review Queue       | `/credit/review`            | CreditApplicationList (filtered: UNDER_REVIEW), DecisionForm | useCreditApplications                                                         | quick approve/reject interface, bulk actions                              |
| Limits             | `/credit/limits`            | CreditLimitCard grid, update form                            | useCreditLimits                                                               | grid of limits, increase/suspend/adjust terms actions                     |
| Monitoring         | `/credit/monitoring`        | CreditDashboardCards, threshold alerts                       | useCreditLimits, useCreditHolds                                               | 80%/100% threshold warnings, active holds list                            |
| Collections Queue  | `/credit/collections`       | CollectionActivityLog, activity filters, aging view          | useCollectionsQueue, useAgingReport                                           | collections work queue, activity history, follow-up due dates             |
| Collection Detail  | `/credit/collections/[id]`  | CollectionActivityLog detailed, PaymentPlanTimeline          | useCollectionsQueue, usePaymentPlans                                          | customer history, activities, payment plan option                         |
| Reports            | `/credit/reports`           | AgingBucketChart, risk analysis, export                      | useAgingReport, useCreditLimits                                               | aging analysis, customer exposure, CSV export                             |
| D&B Integration    | `/credit/dnb`               | DNB lookup form, credit report viewer                        | useDnbLookup                                                                  | search company, fetch credit check, save to application                   |

### 5.3 Page Layout Pattern (All 19 Pages)

```typescript
// Example: /agents/[id]/page.tsx
import { ErrorBoundary } from '@/components/error-boundary'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { AgentDetail } from '@/components/agents/agent-detail'

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        <Breadcrumb
          items={[
            { label: 'Agents', href: '/agents' },
            { label: 'Detail', href: '#' }
          ]}
        />
        <Suspense fallback={<DetailSkeleton />}>
          <AgentDetail agentId={params.id} />
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}
```

### 5.4 Success Criteria for Phase 3

- ✅ 19 page files created (agents/_ + credit/_)
- ✅ All pages render without errors
- ✅ All API calls complete successfully (Network tab verification)
- ✅ Data displays correctly (no missing fields, correct formatting)
- ✅ User interactions work (navigate, filter, submit, delete)
- ✅ Error states show gracefully (error boundaries catch crashes)
- ✅ Loading states display (skeletons, spinners)
- ✅ No console errors or warnings
- ✅ Build succeeds: `pnpm build`

---

## 6. Testing Strategy

### 6.1 Phase 1 - Hook Tests (TDD)

**Approach:** Write test first, implement to pass

**Test Levels:**

- ✅ Query logic: correct endpoint, correct query params
- ✅ Mutations: request body shape, optimistic updates
- ✅ Error handling: 404, 403, 500, timeout
- ✅ Edge cases: pagination limits, empty results, null values

**Tools:** Jest + `@testing-library/react` + MSW (Mock Service Worker)

**Example:**

```typescript
describe('useAgents', () => {
  it('should fetch agents', async () => { ... })
  it('should paginate', async () => { ... })
  it('should filter by status', async () => { ... })
  it('should handle 500 error', async () => { ... })
})
```

**Target Coverage:** >95% of query/mutation paths

### 6.2 Phase 2 - Component Tests (Snapshot + Behavior)

**Approach:** Snapshot test for render, behavior tests for interactions

**Test Levels:**

- ✅ Render snapshot (catch unintended UI changes)
- ✅ Props interface (all combinations)
- ✅ User interactions (click, type, select)
- ✅ Hook integration (mock hooks, verify calls)
- ✅ Error/loading/empty states

**Tools:** Jest + React Testing Library + `@storybook/test-runner`

**Example:**

```typescript
describe('CreditApplicationForm', () => {
  it('should render form with all fields', () => {
    const { container } = render(<CreditApplicationForm />)
    expect(container).toMatchSnapshot()
  })

  it('should validate on submit', async () => {
    render(<CreditApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    // verify validation messages appear
  })
})
```

**Target Coverage:** >85% of component logic

### 6.3 Phase 3 - Integration Tests (E2E)

**Approach:** Full page render, user journey verification

**Test Levels:**

- ✅ Page render (hooks + components wired correctly)
- ✅ API calls (MSW intercepts, returns mocked data)
- ✅ User journeys (navigate, interact, submit)
- ✅ Data display (API response → UI correctly formatted)
- ✅ Error states (404 page, error boundary fallback)

**Tools:** Playwright (if available) or Jest + MSW

**Example:**

```typescript
describe('Agents List Page E2E', () => {
  it('should display agents from API', async () => {
    render(<AgentsListPage />)
    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument()
    })
  })

  it('should filter and navigate to detail', async () => {
    render(<AgentsListPage />)
    // filter by status
    // click agent
    // verify detail page loads
  })
})
```

**Target Coverage:** All 19 pages + happy path + error path

### 6.4 Quality Gates (Before Each Phase Completion)

**Before Phase 1 Completion:**

```bash
pnpm lint                          # 0 errors
pnpm check-types                   # 0 errors
pnpm --filter web test             # All tests pass
pnpm --filter web test:coverage    # >95% coverage
```

**Before Phase 2 Completion:**

```bash
pnpm lint
pnpm check-types
pnpm --filter web test             # All tests pass
pnpm --filter web test:coverage    # >85% coverage
pnpm storybook:build               # Storybook builds
```

**Before Phase 3 Completion:**

```bash
pnpm lint
pnpm check-types
pnpm --filter web test             # All tests pass
pnpm --filter web test:coverage    # >80% overall
pnpm build                         # Full build succeeds
# Manual verification: click all routes, verify API calls work
```

---

## 7. Build Sequence & Daily Plan

### 7.1 Week 1: Phase 1 - Hooks (23 hooks)

**Day 1-2: Agents Hooks (hooks 1-10)**

- Implement: `use-agents`, `use-agent`, `use-agent-mutations`, `use-agent-agreements`, `use-agent-commissions`
- Implement: `use-agent-leads`, `use-agent-customers`, `use-agent-statements`, `use-agent-performance`, `use-agent-rankings`
- Run tests: `pnpm test --testPathPattern=agents`

**Day 3-4: Credit Hooks (hooks 11-23)**

- Implement: `use-credit-applications`, `use-credit-application`, `use-create-credit-application`, `use-approve-credit-application`, `use-reject-credit-application`
- Implement: `use-credit-limits`, `use-credit-limit`, `use-credit-utilization`, `use-credit-holds`, `use-collections-queue`, `use-aging-report`, `use-payment-plans`, `use-dnb-lookup`
- Run tests: `pnpm test --testPathPattern=credit`

**Day 5: Phase 1 QA**

- Run full test suite: `pnpm test` → All 23 passing
- Run linting: `pnpm lint` → 0 errors
- Verify coverage: >95%
- Commit: `feat: MP-10 Phase 1 - Add 23 hooks with TDD (agents + credit)`

### 7.2 Week 2: Phase 2 - Components (20 components)

**Day 6-7: Agents Components (components 1-10)**

- Implement: AgentsDashboard, AgentsList, AgentDetail, AgentForm, AgentStatusBadge
- Implement: AgentAgreementCard, AgentCommissionsTable, AgentLeadsTable, AgentPerformanceChart, CustomerAssignmentsTable
- Add tests + Storybook stories
- Run tests: `pnpm test --testPathPattern=agents`

**Day 8-9: Credit Components (components 11-20)**

- Implement: CreditDashboardCards, CreditApplicationForm, CreditApplicationDetail, CreditApplicationList, CreditLimitCard
- Implement: CreditUtilizationBar, CreditHoldBanner, CollectionActivityLog, AgingBucketChart, PaymentPlanTimeline
- Add tests + Storybook stories
- Run tests: `pnpm test --testPathPattern=credit`

**Day 10: Phase 2 QA**

- Run full component tests: `pnpm test` → All 20 passing
- Build Storybook: `pnpm storybook:build` → Success
- Verify coverage: >85%
- Commit: `feat: MP-10 Phase 2 - Add 20 components with tests (agents + credit)`

### 7.3 Week 3: Phase 3 - Pages (19 pages + integration)

**Day 11-12: Agents Pages (pages 1-9)**

- Implement: Dashboard, List, Detail, Setup, Performance, CommissionSetup, Territories, Reports, PortalAccess
- Wire hooks + components
- Add error boundaries, loading states, breadcrumbs
- Run manual verification: Click all routes, verify API calls work

**Day 13-14: Credit Pages (pages 10-20)**

- Implement: Dashboard, ApplicationsList, ApplicationForm, ApplicationDetail, ReviewQueue, Limits, Monitoring, CollectionsQueue, CollectionDetail, Reports, DnbIntegration
- Wire hooks + components
- Add error boundaries, loading states, breadcrumbs
- Run manual verification: Click all routes, verify API calls work

**Day 15: Phase 3 QA + Final Verification**

- Run full test suite: `pnpm test` → All tests pass
- Run linting: `pnpm lint` → 0 errors
- Type check: `pnpm check-types` → 0 errors
- Build: `pnpm build` → Success
- Manual testing: Navigate all 19 pages, verify interactions, check console for errors
- Commit: `feat: MP-10 Phase 3 - Add 19 pages with integration (agents + credit)`

---

## 8. Risk Mitigation

| Risk                                      | Mitigation Strategy                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| **Hooks take longer than expected**       | Simplify edge case tests, focus on happy path first                               |
| **Component complexity explodes**         | Split large components (e.g., DetailTabs → separate tab components)               |
| **Pages fail to render**                  | Check hook/component mocking, verify API envelope format, debug with Network tab  |
| **Tests slow down development**           | Use snapshot tests more, reduce assertion count per test, focus on critical paths |
| **D&B API integration blocks**            | Mark as TODO/stubbed, implement in P1 post-launch                                 |
| **Google Maps integration (territories)** | Use placeholder static map initially, enhance in P1                               |
| **Timeline pressure in Week 3**           | Pre-stage page routes early, reduce integration test scope                        |

---

## 9. Success Criteria (Final)

### Phase 1 (Hooks)

- ✅ 23 hooks implemented with TDD
- ✅ All hook tests pass
- ✅ Test coverage >95%

### Phase 2 (Components)

- ✅ 20 components implemented with props interfaces
- ✅ All component tests pass (snapshot + behavior)
- ✅ 20 Storybook stories created
- ✅ Test coverage >85%

### Phase 3 (Pages)

- ✅ 19 pages wired (hooks + components)
- ✅ All pages render and work
- ✅ All API calls verified
- ✅ Full build passes
- ✅ No console errors

### Overall

- ✅ Code follows project patterns (Commission, Load Board, Carriers)
- ✅ No linting errors
- ✅ No TypeScript errors
- ✅ All 19 screens are interactive and functional
- ✅ Ready for QA testing

---

## 10. Deliverables

**By End of MP-10:**

1. ✅ 23 hook files + 23 test files
2. ✅ 20 component files + 20 test files + 20 Storybook stories
3. ✅ 19 page files (Agents 9 + Credit 10)
4. ✅ All tests passing, coverage >85%
5. ✅ Full build succeeding
6. ✅ 3 commits (Phase 1, Phase 2, Phase 3)
7. ✅ Ready for QA/UAT

---

**Document Status:** Approved and Ready for Implementation
**Next Step:** Invoke `superpowers:writing-plans` to create detailed implementation plan
