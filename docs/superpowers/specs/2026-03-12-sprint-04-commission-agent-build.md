# Sprint 04 — Commission & Agent Build Design Spec

> **Date:** 2026-03-12
> **Sprint:** 04
> **Goal:** Fix commission backend bugs + build agent management frontend
> **Effort:** ~20h total (6h backend fixes + 14h frontend build)

---

## Context

- Commission frontend is fully built: 11 pages, 10 components, 5 hook files (18 hooks), 8.5/10 quality
- Commission backend has known bugs: missing auto-calc trigger, soft-delete gaps, missing transactions
- Agent backend is fully built: 37 endpoints across 6 controllers, 9 Prisma models
- Agent frontend: zero pages exist

---

## Stream 1: Commission Backend Fixes (~6h)

### COMM-107: Auto-Calculation Trigger on Invoice PAID

**Problem:** `calculateLoadCommission()` method exists and works. A `load.delivered` event listener is wired. But the hub docs specify commission should also trigger on invoice PAID. No `invoice.paid` event is emitted anywhere.

**Fix:**

1. In `PaymentsReceivedService.applyToInvoice()` — inside the `$transaction` callback, after the `invoice.update()` call that sets status, collect invoices that became PAID (where `newBalanceDue <= 0`). Emit `invoice.paid` event **after** the transaction commits (not inside the tx block) to avoid emitting for rolled-back transactions. Payload: `{ invoiceId, tenantId }`
2. In `PaymentsReceivedService.processBatch()` — inside the for-loop, after each `invoice.update()`, check if `newStatus === 'PAID'` and collect those invoiceIds. Emit events after the batch transaction commits.
3. Add `@OnEvent('invoice.paid')` handler in `CommissionEventsListener` that:
   - Fetches the invoice with its `orderId` relation
   - Finds loads linked to that order
   - Calls `calculateLoadCommission(tenantId, loadId)` for each linked load
   - Guards against duplicate calculation (check if CommissionEntry already exists for this load)
4. Inject `EventEmitter2` into `PaymentsReceivedService` (if not already present)

**Key detail:** The listener resolves orderId/loadId itself from the invoiceId, since PaymentsReceivedService doesn't include order relations in its invoice queries.

**Files modified:**

- `apps/api/src/modules/accounting/services/payments-received.service.ts` — emit events
- `apps/api/src/modules/commission/listeners/commission-events.listener.ts` — add handler

### COMM-110: Soft-Delete Filter on CommissionEntry (~5 query methods)

Add `deletedAt: null` to all query WHERE clauses in `commission-entries.service.ts` (`findAll`, `findOne`, `approve`, `reverse`, `getUserEarnings`). Skip `create` and `calculateLoadCommission` (different model).

### COMM-111: Soft-Delete Filter on CommissionPayout (~5 query methods)

Same pattern in `commission-payouts.service.ts` (`findAll`, `findOne`, `approve`, `process`, `void`). Verify exact count during implementation.

### COMM-112: Soft-Delete Filter on AgentCommission (3 methods)

Same pattern in `agents/commissions/agent-commissions.service.ts` (`listForAgent`, `performance`, `rankings`). **Pre-check:** Verify `AgentCommission` Prisma model has `deletedAt` field before adding filters. If missing, add via migration or skip this task.

### COMM-113: Transaction Wrapping

Wrap these multi-step operations in `prisma.$transaction()`:

- `createPayout()` in `commission-payouts.service.ts` — creates payout + links entries
- `processPayout()` in `commission-payouts.service.ts` — updates payout + marks entries PAID
- `void()` in `commission-payouts.service.ts` — updates payout + updateMany entries (same atomicity need)

---

## Stream 2: Agent Management Frontend (~14h)

### Architecture

Follow the commission module pattern (gold standard at 8.5/10):

```
apps/web/
  app/(dashboard)/agents/
    page.tsx                    # Agent List
    new/page.tsx               # Agent Create
    [id]/page.tsx              # Agent Detail (tabbed)
    [id]/edit/page.tsx         # Agent Edit
  components/agents/
    agent-list-table.tsx       # DataTable with filters
    agent-form.tsx             # RHF+Zod create/edit form
    agent-detail-tabs.tsx      # Tab container
    agent-overview-tab.tsx     # Overview content
    agent-agreements-tab.tsx   # Agreements list + create dialog
    agent-customers-tab.tsx    # Customer assignments list
    agent-commissions-tab.tsx  # Commission history (read-only)
    agent-status-badge.tsx     # Status badge component
    agreement-form-dialog.tsx  # Agreement create/edit dialog
    assignment-dialog.tsx      # Customer assignment dialog
  lib/hooks/agents/
    use-agents.ts              # CRUD + status actions + contacts
    use-agent-agreements.ts    # Agreement CRUD + activate/terminate
    use-agent-assignments.ts   # Customer assignment CRUD + transfer/sunset
    use-agent-commissions.ts   # Commission list + performance (read-only)
```

### API Path Reference

**Important:** The agents backend uses split-path routing. Listing/creating is nested under the agent, but individual operations use standalone paths:

| Operation                 | HTTP   | Path                                      |
| ------------------------- | ------ | ----------------------------------------- |
| List agents               | GET    | `/agents`                                 |
| Create agent              | POST   | `/agents`                                 |
| Get agent                 | GET    | `/agents/:id`                             |
| Update agent              | PUT    | `/agents/:id`                             |
| Delete agent              | DELETE | `/agents/:id`                             |
| Activate agent            | POST   | `/agents/:id/activate`                    |
| Suspend agent             | POST   | `/agents/:id/suspend`                     |
| Terminate agent           | POST   | `/agents/:id/terminate`                   |
| List contacts             | GET    | `/agents/:id/contacts`                    |
| Add contact               | POST   | `/agents/:id/contacts`                    |
| Update contact            | PUT    | `/agents/:id/contacts/:contactId`         |
| Delete contact            | DELETE | `/agents/:id/contacts/:contactId`         |
| List agreements           | GET    | `/agents/:id/agreements`                  |
| Create agreement          | POST   | `/agents/:id/agreements`                  |
| Get agreement             | GET    | **`/agent-agreements/:id`**               |
| Update agreement          | PUT    | **`/agent-agreements/:id`**               |
| Activate agreement        | POST   | **`/agent-agreements/:id/activate`**      |
| Terminate agreement       | POST   | **`/agent-agreements/:id/terminate`**     |
| List customer assignments | GET    | `/agents/:id/customers`                   |
| Assign customer           | POST   | `/agents/:id/customers`                   |
| Get assignment            | GET    | **`/agent-assignments/:id`**              |
| Update assignment         | PUT    | **`/agent-assignments/:id`**              |
| Transfer assignment       | POST   | **`/agent-assignments/:id/transfer`**     |
| Start sunset              | POST   | **`/agent-assignments/:id/start-sunset`** |
| Terminate assignment      | POST   | **`/agent-assignments/:id/terminate`**    |
| Get customer's agent      | GET    | `/customers/:id/agent`                    |
| List agent commissions    | GET    | `/agents/:id/commissions`                 |
| Agent performance         | GET    | `/agents/:id/performance`                 |
| Agent rankings            | GET    | `/agents/rankings`                        |

**Bold paths** = standalone routes (not nested under `/agents/:id`).

### Screen: Agent List (`/agents`)

**Wires to:** `GET /api/v1/agents`

| Feature       | Implementation                                                                      |
| ------------- | ----------------------------------------------------------------------------------- |
| DataTable     | Columns: Agent Code, Company, Contact, Type, Tier, Status, Actions                  |
| Search        | Debounced text search (backend searches companyName, contactEmail, contactLastName) |
| Filters       | Status (ACTIVE/SUSPENDED/TERMINATED), Agent Type, Tier                              |
| Pagination    | Server-side, 20 per page                                                            |
| Actions       | View, Edit, Activate/Suspend (status-dependent)                                     |
| Create button | Links to `/agents/new`                                                              |

### Screen: Agent Create/Edit (`/agents/new`, `/agents/[id]/edit`)

**Wires to:** `POST /api/v1/agents`, `PUT /api/v1/agents/:id`

RHF + Zod form with sections:

1. **Company Info** — companyName, dbaName, agentCode (auto-generated on create), agentType, legalEntityType, taxId
2. **Primary Contact** — contactFirstName, contactLastName, contactEmail, contactPhone
3. **Address** — addressLine1, addressLine2, city, state, zip, country
4. **Banking** — paymentMethod, bankName, bankRouting, bankAccount, bankAccountType (verify these fields exist in Agent Prisma model; if not, defer this section)
5. **Settings** — tier, territories (multi-select), industryFocus (multi-select)

### Screen: Agent Detail (`/agents/[id]`)

**Wires to:** `GET /api/v1/agents/:id` + sub-resources

Tabbed layout (like carrier detail):

**Overview Tab:**

- Agent info card (company, contact, status, tier)
- Status actions: Activate, Suspend, Terminate (role-dependent)
- Contact persons list (`GET /agents/:id/contacts`) with add/edit/delete
- Performance metrics card (`GET /agents/:id/performance`)

**Agreements Tab:**

- Agreements table (`GET /agents/:id/agreements`)
- Create agreement dialog (split type, split rate, effective date, protection period, draw config)
- Activate/Terminate agreement actions (via `/agent-agreements/:id/activate|terminate`)
- Agreement detail expandable rows

**Customers Tab:**

- Customer assignments table (`GET /agents/:id/customers`)
- Assign customer dialog (customer select, assignment type, split percent, protection end)
- Transfer (`/agent-assignments/:id/transfer`), Start Sunset, Terminate actions per assignment

**Commissions Tab:**

- Commission entries table (`GET /agents/:id/commissions`) — read-only
- Performance summary card
- Filter by period, status

### Hooks

All hooks follow the commission pattern: React Query with `unwrap<T>()` envelope helper.

**`use-agents.ts`** (11 hooks — includes contacts):

- `useAgents(params)` — list with pagination + filters
- `useAgent(id)` — single agent detail
- `useCreateAgent()` — mutation
- `useUpdateAgent()` — mutation
- `useDeleteAgent()` — soft-delete mutation, navigate away after
- `useActivateAgent()` — mutation
- `useSuspendAgent()` — mutation
- `useTerminateAgent()` — mutation
- `useAgentContacts(agentId)` — list contacts
- `useAddContact()` — mutation
- `useUpdateContact()` — mutation

**`use-agent-agreements.ts`** (5 hooks):

- `useAgentAgreements(agentId)` — list via `/agents/:id/agreements`
- `useCreateAgreement()` — POST to `/agents/:agentId/agreements`
- `useUpdateAgreement()` — PUT to `/agent-agreements/:id`
- `useActivateAgreement()` — POST to `/agent-agreements/:id/activate`
- `useTerminateAgreement()` — POST to `/agent-agreements/:id/terminate`

**`use-agent-assignments.ts`** (5 hooks):

- `useAgentCustomers(agentId)` — list via `/agents/:id/customers`
- `useAssignCustomer()` — POST to `/agents/:agentId/customers`
- `useTransferAssignment()` — POST to `/agent-assignments/:id/transfer`
- `useStartSunset()` — POST to `/agent-assignments/:id/start-sunset`
- `useTerminateAssignment()` — POST to `/agent-assignments/:id/terminate`

**`use-agent-commissions.ts`** (2 hooks):

- `useAgentCommissions(agentId, params)` — list commissions
- `useAgentPerformance(agentId)` — performance metrics

---

## Out of Scope

- Agent Leads UI (COM-009 listed as P2 in sprint, backend exists but not priority)
- Agent Statements/PDF download UI
- Agent Portal pages (separate auth domain)
- Commission frontend changes (already 8.5/10, no QA needed this sprint)
- Agent Payout View (COM-010, P2 — can be added as tab later)

---

## Task Breakdown

| ID      | Title                                                              | Effort | Priority | Depends On |
| ------- | ------------------------------------------------------------------ | ------ | -------- | ---------- |
| COM-BF1 | COMM-107: Invoice PAID event + commission listener                 | M (2h) | P0       | —          |
| COM-BF2 | COMM-110/111/112: Soft-delete filters (~13 methods)                | M (2h) | P0       | —          |
| COM-BF3 | COMM-113: Transaction wrapping for payouts (create, process, void) | S (1h) | P1       | —          |
| COM-FE1 | Agent hooks (4 files, 23 hooks)                                    | M (2h) | P0       | —          |
| COM-FE2 | Agent List page + table component                                  | M (3h) | P0       | COM-FE1    |
| COM-FE3 | Agent Create/Edit form                                             | M (3h) | P0       | COM-FE1    |
| COM-FE4 | Agent Detail (tabbed) + Overview tab                               | M (3h) | P0       | COM-FE1    |
| COM-FE5 | Agreement tab + dialog                                             | M (2h) | P1       | COM-FE4    |
| COM-FE6 | Customers tab + assignment dialog                                  | M (2h) | P1       | COM-FE4    |
| COM-FE7 | Commissions tab (read-only)                                        | S (1h) | P2       | COM-FE4    |

**Critical path:** COM-FE1 (hooks) → COM-FE2/FE3/FE4 (parallel) → COM-FE5/FE6/FE7 (parallel)
**Backend fixes are independent** — can run in parallel with frontend work.

---

## Design Quality Targets

- Agent List: 8/10+ (match commission quality)
- Agent Form: 8/10+ (RHF+Zod, proper validation)
- Agent Detail: 8/10+ (tabbed, responsive)
- All pages: loading/error/empty states, breadcrumbs, proper navigation
