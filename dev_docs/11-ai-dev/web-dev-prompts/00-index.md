# Phase A Frontend UI Implementation - Master Index

> **Purpose:** This document serves as the master tracking index for implementing all Phase A frontend UI components in the Ultra-TMS web application. Execute prompts in sequential order (00 → 24). Complete the foundation prompt (00) before any service prompts.

---

## 📋 Quick Reference

| Document | Link |
|----------|------|
| Frontend Architecture Standards | [68-frontend-architecture-standards.md](../../08-standards/68-frontend-architecture-standards.md) |
| UI Component Standards | [69-ui-component-standards.md](../../08-standards/69-ui-component-standards.md) |
| Testing Strategy | [72-testing-strategy.md](../../08-standards/72-testing-strategy.md) |
| Design System Components | [46-design-system-components.md](../../03-design/46-design-system-components.md) |
| API Dev Prompts (Backend) | [api-dev-prompts/00-index.md](../api-dev-prompts/00-index.md) |
| Services Overview | [07-services-overview.md](../../02-services/07-services-overview.md) |

---

## 🛠️ Tech Stack

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| **Framework** | Next.js | 16.1.0 | App Router, Server/Client Components |
| **UI Library** | React | 19.2.0 | Component library |
| **Styling** | Tailwind CSS | 4.1.18 | Utility-first CSS |
| **Components** | shadcn/ui | latest | Radix UI primitives + Tailwind |
| **Server State** | @tanstack/react-query | 5.x | Data fetching, caching, mutations |
| **Client State** | Zustand | 4.x | Per-service UI state stores |
| **Forms** | react-hook-form | 7.70.0 | Form state management |
| **Validation** | Zod | 4.3.5 | Schema validation |
| **Tables** | @tanstack/react-table | 8.21.3 | Data tables |
| **Icons** | Lucide React | latest | Icon library |
| **Dates** | date-fns | 3.x | Date formatting |
| **Testing** | Jest + RTL | latest | Unit & component tests |
| **API Mocking** | MSW | 2.x | Mock Service Worker |

---

## 📦 Required Package Installations

Run these commands in the `apps/web` directory before starting:

```bash
# State Management & Data Fetching
pnpm add @tanstack/react-query zustand

# Utilities
pnpm add lucide-react date-fns

# Testing (devDependencies)
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @types/jest

# shadcn/ui components (run after foundation setup)
npx shadcn@latest add toast sonner skeleton alert-dialog sheet command popover calendar
```

---

## 🏗️ Architecture Patterns

### React Query Key Conventions

```typescript
// Pattern: ['service', 'entity', params?]
['carriers', 'list', { page: 1, search: 'abc' }]
['carriers', 'detail', carrierId]
['orders', 'list', { status: 'PENDING' }]
['orders', 'detail', orderId]
['claims', 'list', { page: 1 }]
```

### Per-Service Zustand Stores

```
lib/stores/
├── carrier-store.ts      # Carrier filters, selected items
├── order-store.ts        # Order filters, view preferences
├── claim-store.ts        # Claim filters, selected claim
├── ...
```

### Route Structure

```
app/
├── (auth)/                    # Public auth pages
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/               # Protected pages (main app)
│   ├── layout.tsx             # Dashboard layout with sidebar
│   ├── dashboard/             # Main dashboard
│   ├── orders/                # TMS Core - Orders
│   ├── loads/                 # TMS Core - Loads
│   ├── carriers/              # Carrier management
│   ├── credit/                # Credit management
│   ├── claims/                # Claims management
│   ├── contracts/             # Contract management
│   ├── agents/                # Agent management
│   ├── factoring/             # Internal factoring
│   ├── edi/                   # EDI management
│   ├── safety/                # Safety & compliance
│   ├── load-board/            # External load boards
│   ├── rates/                 # Rate intelligence
│   ├── analytics/             # Analytics dashboards
│   ├── workflows/             # Workflow automation
│   ├── integrations/          # Integration hub
│   ├── audit/                 # Audit logs
│   ├── settings/              # Config & settings
│   ├── scheduler/             # Job scheduler
│   ├── hr/                    # HR management
│   ├── help-desk/             # Help desk tickets
│   ├── feedback/              # Feedback & NPS
│   └── admin/                 # Admin pages
└── portal/                    # Portal routes (in main app)
    ├── customer/              # Customer portal
    │   ├── dashboard/
    │   ├── orders/
    │   ├── quotes/
    │   ├── documents/
    │   └── invoices/
    └── carrier/               # Carrier portal
        ├── dashboard/
        ├── loads/
        ├── documents/
        ├── settlements/
        └── compliance/
```

---

## 🎯 Execution Order & Status

> **Phase A Services:** Based on [api-review-docs](../../api-review-docs/) - 27 services ready for frontend implementation

### Phase 0: Foundation (Execute First)

| # | Prompt File | Scope | Components | Status | Completed |
|---|-------------|-------|------------|--------|-----------|
| 00 | [00-frontend-foundation.md](./00-frontend-foundation.md) | Foundation Setup | Providers, Shared Components, Hooks, Testing | ⬜ Pending | - |

### Phase 1: Auth & Core (Critical Path)

| # | Prompt File | Service | Pages | API Review | Status | Completed |
|---|-------------|---------|-------|------------|--------|-----------|
| 01 | [01-auth-admin-ui.md](./01-auth-admin-ui.md) | Auth & Admin | 12 | [01-auth-admin-review](../../api-review-docs/01-auth-admin-review.html) | ⬜ Pending | - |
| 02 | [02-crm-ui.md](./02-crm-ui.md) | CRM | 8 | [02-crm-review](../../api-review-docs/02-crm-review.html) | ⬜ Pending | - |
| 03 | [03-sales-ui.md](./03-sales-ui.md) | Sales | 10 | [03-sales-review](../../api-review-docs/03-sales-review.html) | ⬜ Pending | - |
| 04 | [04-tms-core-ui.md](./04-tms-core-ui.md) | TMS Core | 12 | [04-tms-core-review](../../api-review-docs/04-tms-core-review.html) | ⬜ Pending | - |
| 05 | [05-carrier-ui.md](./05-carrier-ui.md) | Carrier | 8 | [05-carrier-review](../../api-review-docs/05-carrier-review.html) | ⬜ Pending | - |

### Phase 2: Operations & Finance

| # | Prompt File | Service | Pages | API Review | Status | Completed |
|---|-------------|---------|-------|------------|--------|-----------|
| 06 | [06-accounting-ui.md](./06-accounting-ui.md) | Accounting | 8 | [06-accounting-review](../../api-review-docs/06-accounting-review.html) | ⬜ Pending | - |
| 07 | [07-load-board-ui.md](./07-load-board-ui.md) | Load Board (Internal) | 5 | [07-load-board-review](../../api-review-docs/07-load-board-review.html) | ⬜ Pending | - |
| 08 | [08-commission-ui.md](./08-commission-ui.md) | Commission | 5 | [08-commission-review](../../api-review-docs/08-commission-review.html) | ⬜ Pending | - |
| 09 | [09-claims-ui.md](./09-claims-ui.md) | Claims | 6 | [09-claims-review](../../api-review-docs/09-claims-review.html) | ⬜ Pending | - |
| 10 | [10-documents-ui.md](./10-documents-ui.md) | Documents | 4 | [10-documents-review](../../api-review-docs/10-documents-review.html) | ⬜ Pending | - |
| 11 | [11-communication-ui.md](./11-communication-ui.md) | Communication | 4 | [11-communication-review](../../api-review-docs/11-communication-review.html) | ⬜ Pending | - |

### Phase 3: Portal Services

| # | Prompt File | Service | Pages | API Review | Status | Completed |
|---|-------------|---------|-------|------------|--------|-----------|
| 12 | [12-customer-portal-ui.md](./12-customer-portal-ui.md) | Customer Portal | 10 | [12-customer-portal-review](../../api-review-docs/12-customer-portal-review.html) | ⬜ Pending | - |
| 13 | [13-carrier-portal-ui.md](./13-carrier-portal-ui.md) | Carrier Portal | 12 | [13-carrier-portal-review](../../api-review-docs/13-carrier-portal-review.html) | ⬜ Pending | - |

### Phase 4: Business Services

| # | Prompt File | Service | Pages | API Review | Status | Completed |
|---|-------------|---------|-------|------------|--------|-----------|
| 14 | [14-contracts-ui.md](./14-contracts-ui.md) | Contracts | 8 | [14-contracts-review](../../api-review-docs/14-contracts-review.html) | ⬜ Pending | - |
| 15 | [15-agents-ui.md](./15-agents-ui.md) | Agents | 6 | [15-agents-review](../../api-review-docs/15-agents-review.html) | ⬜ Pending | - |
| 16 | [16-credit-ui.md](./16-credit-ui.md) | Credit | 6 | [16-credit-review](../../api-review-docs/16-credit-review.html) | ⬜ Pending | - |
| 17 | [17-factoring-ui.md](./17-factoring-ui.md) | Factoring (Internal) | 6 | [17-factoring-review](../../api-review-docs/17-factoring-review.html) | ⬜ Pending | - |

### Phase 5: Platform & Analytics

| # | Prompt File | Service | Pages | API Review | Status | Completed |
|---|-------------|---------|-------|------------|--------|-----------|
| 18 | [18-analytics-ui.md](./18-analytics-ui.md) | Analytics | 8 | [18-analytics-review](../../api-review-docs/18-analytics-review.html) | ⬜ Pending | - |
| 19 | [19-workflow-ui.md](./19-workflow-ui.md) | Workflow | 5 | [19-workflow-review](../../api-review-docs/19-workflow-review.html) | ⬜ Pending | - |
| 20 | [20-integration-hub-ui.md](./20-integration-hub-ui.md) | Integration Hub | 6 | [20-integration-hub-review](../../api-review-docs/20-integration-hub-review.html) | ⬜ Pending | - |
| 21 | [21-search-ui.md](./21-search-ui.md) | Search | 3 | [21-search-review](../../api-review-docs/21-search-review.html) | ⬜ Pending | - |
| 22 | [22-audit-ui.md](./22-audit-ui.md) | Audit | 3 | [22-audit-review](../../api-review-docs/22-audit-review.html) | ⬜ Pending | - |
| 23 | [23-config-ui.md](./23-config-ui.md) | Config | 5 | [23-config-review](../../api-review-docs/23-config-review.html) | ⬜ Pending | - |

### Phase 6: Integration & External

| # | Prompt File | Service | Pages | API Review | Status | Completed |
|---|-------------|---------|-------|------------|--------|-----------|
| 24 | [24-edi-ui.md](./24-edi-ui.md) | EDI | 5 | [24-edi-review](../../api-review-docs/24-edi-review.html) | ⬜ Pending | - |
| 25 | [25-safety-ui.md](./25-safety-ui.md) | Safety | 6 | [25-safety-review](../../api-review-docs/25-safety-review.html) | ⬜ Pending | - |
| 26 | [26-rate-intelligence-ui.md](./26-rate-intelligence-ui.md) | Rate Intelligence | 5 | [26-rate-intelligence-review](../../api-review-docs/26-rate-intelligence-review.html) | ⬜ Pending | - |

### Phase 7: Support Services

| # | Prompt File | Service | Pages | API Review | Status | Completed |
|---|-------------|---------|-------|------------|--------|-----------|
| 27 | [27-help-desk-ui.md](./27-help-desk-ui.md) | Help Desk | 5 | [27-help-desk-review](../../api-review-docs/27-help-desk-review.html) | ⬜ Pending | - |

---

## 📊 Progress Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Prompts (00-27) | 28 | - |
| Completed | 0 | 0% |
| In Progress | 0 | 0% |
| Pending | 28 | 100% |
| Total Pages | ~175 | - |
| Phase A Services | 27 | - |

---

## 📝 Prompt Execution Guidelines

### Before Starting Each Prompt

1. **Verify API is ready** - Check corresponding API prompt is complete
2. **Run existing tests** - Ensure no regressions: `pnpm test`
3. **Check TypeScript** - No type errors: `pnpm check-types`

### During Implementation

1. **Follow page templates** from [68-frontend-architecture-standards.md](../../08-standards/68-frontend-architecture-standards.md)
2. **Include all states** - Loading, Error, Empty, Success
3. **Use React Query** for all data fetching
4. **Use Zustand** for UI state (filters, selections, modals)
5. **Write tests** for each component

### After Completing Each Prompt

1. **Run full test suite**: `pnpm test`
2. **Check for type errors**: `pnpm check-types`
3. **Run linter**: `pnpm lint`
4. **Update status** in this index
5. **Commit with message**: `feat(web): implement [service] UI - prompt XX`

---

## 🔗 Related Documentation

- [API Dev Prompts](../api-dev-prompts/00-index.md) - Backend API implementation prompts
- [Frontend Architecture](../../08-standards/68-frontend-architecture-standards.md) - Page templates, patterns
- [Testing Strategy](../../08-standards/72-testing-strategy.md) - Jest + RTL patterns
- [Design System](../../03-design/46-design-system-components.md) - Component library reference
