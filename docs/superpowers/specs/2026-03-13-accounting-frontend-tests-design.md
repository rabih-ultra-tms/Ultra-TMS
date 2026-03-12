# Accounting Frontend Testing Design (MP-03-006)

> **Date:** 2026-03-13
> **Task:** MP-03-006 - Frontend accounting tests (0 tests for 5,244 LOC)
> **Priority:** P2
> **Estimate:** 6h
> **Reference:** PST-07 audit findings

---

## Executive Summary

The Accounting module has 5,244 lines of production frontend code (7.5/10 quality) with zero test coverage. This spec designs a comprehensive testing strategy covering all 11 pages, 18+ components, and 6 hooks using a hybrid approach: isolated component tests + smart API mocking for hooks + critical workflow tests at the page level.

**Target:** 47-52 tests organized by type (components, hooks, pages, workflows) with full error matrix coverage (validation, permissions, soft-delete, API errors).

---

## 1. Current State (from PST-07)

### Accounting Module Scope

| Layer                 | Count | Quality | Notes                                                                                        |
| --------------------- | ----- | ------- | -------------------------------------------------------------------------------------------- |
| **Pages**             | 11    | 7.5/10  | Dashboard, Invoices (list/detail/create/edit), Settlements, Payments, Payables, Aging Report |
| **Components**        | 18+   | 8/10    | Consistent patterns, design tokens, no hardcoded colors                                      |
| **Hooks**             | 6     | 8/10    | Consistent `unwrap<T>()` envelope pattern; best of all P0 services                           |
| **Backend Endpoints** | 54    | 9/10    | 10 controllers, full double-entry accounting platform                                        |
| **Frontend LOC**      | 5,244 | —       | Distributed across pages/components/hooks                                                    |
| **Frontend Tests**    | 0     | —       | **This task**                                                                                |

### Key Quality Notes

- ✓ Consistent API envelope handling (best of P0 services)
- ✓ Design token compliance, no hardcoded colors
- ✓ Proper loading/error/empty states on all pages
- ✓ Form validation (React Hook Form + Zod)
- ⚠ 2 missing pages (Invoice Edit, Settlement Create)
- ⚠ Zero test coverage
- ⚠ 4 cross-tenant bugs in payments-received service (separate fix, not this task)
- ⚠ 6 controllers lack RolesGuard (separate fix, not this task)
- ⚠ Soft-delete not filtered in some services (test will verify frontend doesn't rely on backend fix)

---

## 2. Testing Architecture

### Directory Structure

```
apps/web/
├── components/accounting/
│   ├── acc-dashboard-stats.test.tsx
│   ├── acc-recent-invoices.test.tsx
│   ├── aging-report.test.tsx
│   ├── chart-of-accounts-table.test.tsx
│   ├── create-account-form.test.tsx
│   ├── create-settlement-form.test.tsx
│   ├── invoice-detail-card.test.tsx
│   ├── invoice-filters.test.tsx
│   ├── invoice-form.test.tsx
│   ├── invoice-status-badge.test.tsx
│   ├── invoices-table.test.tsx
│   ├── journal-entries-table.test.tsx
│   ├── journal-entry-status-badge.test.tsx
│   ├── payable-filters.test.tsx
│   ├── payable-status-badge.test.tsx
│   ├── payables-table.test.tsx
│   ├── payment-allocation.test.tsx
│   ├── payment-filters.test.tsx
│   ├── payment-status-badge.test.tsx
│   ├── payments-table.test.tsx
│   ├── settlement-detail-card.test.tsx
│   ├── settlement-filters.test.tsx
│   ├── settlement-status-badge.test.tsx
│   └── settlements-table.test.tsx
│
├── lib/hooks/accounting/
│   ├── use-invoices.test.ts
│   ├── use-invoice-detail.test.ts
│   ├── use-settlements.test.ts
│   ├── use-payments-received.test.ts
│   ├── use-payments-made.test.ts
│   └── use-accounting.test.ts
│
├── __tests__/accounting/
│   ├── pages/
│   │   ├── dashboard.test.tsx
│   │   ├── invoices-list.test.tsx
│   │   ├── invoices-create.test.tsx
│   │   ├── invoices-detail.test.tsx
│   │   ├── invoices-edit.test.tsx
│   │   ├── settlements-list.test.tsx
│   │   ├── settlements-detail.test.tsx
│   │   ├── settlements-create.test.tsx
│   │   ├── payments-list.test.tsx
│   │   ├── payments-detail.test.tsx
│   │   ├── payables-list.test.tsx
│   │   ├── payables-detail.test.tsx
│   │   ├── journal-entries.test.tsx
│   │   ├── chart-of-accounts.test.tsx
│   │   └── aging-report.test.tsx
│   │
│   └── workflows/
│       ├── invoice-to-payment.test.tsx
│       ├── settlement-lifecycle.test.tsx
│       ├── payment-error-recovery.test.tsx
│       ├── soft-delete-filtering.test.tsx
│       ├── role-based-access.test.tsx
│       ├── concurrent-modifications.test.tsx
│       ├── pdf-generation.test.tsx
│       └── currency-handling.test.tsx
│
└── test/
    ├── mocks/
    │   └── hooks-accounting.ts (expand existing)
    ├── data/
    │   └── accounting-fixtures.ts (new)
    └── setup.ts (existing)
```

---

## 3. Component Tests (18 tests)

Test reusable components in isolation with mock props. Each test file covers rendering, user interactions, callbacks, and error states.

### 3.1 Status Badge Tests (4 tests)

**Files:**

- `invoice-status-badge.test.tsx`
- `payment-status-badge.test.tsx`
- `settlement-status-badge.test.tsx`
- `journal-entry-status-badge.test.tsx`

**Per-badge tests:**

- ✓ Renders correct status label
- ✓ Applies correct color/background for status
- ✓ Displays optional icon if present
- ✓ Handles unknown status gracefully

**Error matrix:** Invalid status prop, missing label, null status.

### 3.2 Table Component Tests (6 tests)

**Files:**

- `invoices-table.test.tsx`
- `settlements-table.test.tsx`
- `payments-table.test.tsx`
- `payables-table.test.tsx`
- `journal-entries-table.test.tsx`
- `chart-of-accounts-table.test.tsx`

**Per-table tests:**

- ✓ Renders rows with correct data
- ✓ Renders column headers
- ✓ Sorting works (click header → sort ascending/descending)
- ✓ Pagination controls render and trigger callbacks
- ✓ Row actions (view, edit, delete) trigger callbacks with correct ID
- ✓ Empty state displays when no rows
- ✓ Loading skeleton displays while loading
- ✓ Respects `maxHeight` prop for scrolling

**Error matrix:** Empty array, null data, missing columns, disabled rows, click on sorted column twice.

### 3.3 Filter Component Tests (3 tests)

**Files:**

- `invoice-filters.test.tsx`
- `payment-filters.test.tsx`
- `payable-filters.test.tsx`

**Per-filter tests:**

- ✓ Renders all filter options (select, checkbox, date picker)
- ✓ Filter option change triggers callback with correct value
- ✓ Reset button clears all filters
- ✓ Date range picker works correctly
- ✓ Multi-select options work correctly

**Error matrix:** Invalid filter value, null onChange callback, disabled filter, date boundary violations.

### 3.4 Form Component Tests (3 tests)

**Files:**

- `invoice-form.test.tsx`
- `create-settlement-form.test.tsx`
- `payment-allocation.test.tsx`

**Per-form tests:**

- ✓ All form fields render
- ✓ Form submission calls callback with correct data shape
- ✓ Validation errors display on invalid input
- ✓ Submit button disabled while loading
- ✓ Cancel button closes form

**Error matrix:** Required field empty, invalid email, invalid amount (negative, zero), duplicate line items, over-allocation.

### 3.5 Card & Stat Tests (2 tests)

**Files:**

- `acc-dashboard-stats.test.tsx`
- `invoice-detail-card.test.tsx`

**Per-card tests:**

- ✓ Renders data correctly
- ✓ Shows loading skeleton while loading
- ✓ Shows error state if data fetch fails
- ✓ Shows empty state if no data

**Error matrix:** Null data, missing fields, very large numbers, API error.

---

## 4. Hook Tests (6 tests)

Test hooks with API mocking via MSW. Each hook test covers happy path, errors, and edge cases.

### 4.1 Hook Test Setup

**MSW mock handlers** (`test/mocks/accounting-handlers.ts` — new):

- `GET /api/v1/accounting/invoices` → return mock invoices with pagination
- `GET /api/v1/accounting/invoices/:id` → return invoice detail
- `PUT /api/v1/accounting/invoices/:id` → update invoice
- `POST /api/v1/accounting/invoices/:id/void` → void invoice
- Similar for settlements, payments, chart of accounts, journal entries
- Error handlers: 400 validation, 403 permission, 404 not found, 500 server error

**Test data** (`test/data/accounting-fixtures.ts` — new):

- Sample invoices (draft, sent, partially paid, overpaid, voided)
- Sample settlements (pending, approved, processed)
- Sample payments received (received, applied, bounced, partial)
- Sample payments made (pending, sent, cleared, voided)
- Sample chart of accounts (asset, liability, revenue, expense)

### 4.2 useInvoices Hook Tests

**File:** `lib/hooks/accounting/use-invoices.test.ts`

**Test cases:**

| Case        | Scenario                             | Assertions                       |
| ----------- | ------------------------------------ | -------------------------------- |
| Happy path  | Fetch invoice list                   | Returns data, pagination correct |
| Filters     | Filter by status (DRAFT, SENT, PAID) | Only matching invoices returned  |
| Search      | Search by customer name              | Matching invoices returned       |
| Pagination  | Go to page 2                         | Correct page returned            |
| Empty       | No invoices exist                    | Returns empty array              |
| Error: 400  | Invalid filter param                 | Error message displays           |
| Error: 403  | User not authorized                  | Permission denied shown          |
| Error: 500  | Server error                         | Retry mechanism works            |
| Soft-delete | Soft-deleted invoice in DB           | Not returned in list             |

### 4.3 useInvoiceDetail Hook Tests

**File:** `lib/hooks/accounting/use-invoice-detail.test.ts`

**Test cases:**

| Case         | Scenario                       | Assertions                         |
| ------------ | ------------------------------ | ---------------------------------- |
| Happy path   | Load invoice with line items   | Data complete, line items rendered |
| Update       | Change invoice amount          | Update call made, state refreshed  |
| Void         | Void invoice                   | Void call made, status updated     |
| Error: 404   | Invoice not found              | Not found error shown              |
| Error: 403   | User not authorized            | Permission denied                  |
| Cross-tenant | Load invoice from other tenant | Should fail (negative test)        |

### 4.4 useSettlements Hook Tests

**File:** `lib/hooks/accounting/use-settlements.test.ts`

**Test cases:**

| Case       | Scenario                       | Assertions                         |
| ---------- | ------------------------------ | ---------------------------------- |
| Happy path | List settlements               | Data returned with pagination      |
| Filter     | Filter by status               | Only matching settlements returned |
| Approve    | Approve settlement             | Approval call made, status updated |
| Void       | Void settlement                | Void call made, status updated     |
| Error: 400 | Approval without complete data | Validation error shown             |
| Error: 403 | Non-accountant approves        | Permission denied                  |

### 4.5 usePaymentsReceived Hook Tests

**File:** `lib/hooks/accounting/use-payments-received.test.ts`

**Test cases:**

| Case               | Scenario                           | Assertions                          |
| ------------------ | ---------------------------------- | ----------------------------------- |
| Happy path         | Record payment                     | Payment created, state updated      |
| Apply to invoice   | Apply payment to single invoice    | Allocation created                  |
| Partial allocation | Apply payment to multiple invoices | Split correctly                     |
| Over-allocation    | Allocate more than payment amount  | Validation error                    |
| Bounce             | Mark payment as bounced            | Status changed, allocations cleared |
| Error: 400         | Invalid payment amount             | Validation error                    |
| Concurrent apply   | Two applies to same invoice        | Conflict detected                   |

### 4.6 usePaymentsMade Hook Tests

**File:** `lib/hooks/accounting/use-payments-made.test.ts`

**Test cases:**

| Case        | Scenario                  | Assertions               |
| ----------- | ------------------------- | ------------------------ |
| Happy path  | Create carrier payment    | Payment created          |
| Status flow | PENDING → SENT → CLEARED  | Each transition works    |
| Void        | Void payment              | Status changed to VOIDED |
| Batch       | Process multiple payments | All processed            |
| Error: 400  | Invalid carrier ID        | Validation error         |
| Error: 403  | Non-accountant creates    | Permission denied        |

### 4.7 useAccounting Hook Tests

**File:** `lib/hooks/accounting/use-accounting.test.ts`

**Test cases:**

| Case       | Scenario                 | Assertions                                                                                 |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| Happy path | Load dashboard KPIs      | All 6 metrics returned (totalAR, totalAP, overdueCount, DSO, revenueMTD, cashCollectedMTD) |
| Empty      | No invoices/payments     | Metrics show zero                                                                          |
| Aging      | Get aging report         | Buckets correct (current, 31-60, 61-90, 91-120, 120+)                                      |
| Error: 500 | Dashboard endpoint fails | Error state shown                                                                          |

---

## 5. Page Workflow Tests (15-18 tests)

Test critical user journeys at the page level. Use hook mocks for predictable data, user interactions via `userEvent`.

### 5.1 Dashboard Tests

**File:** `__tests__/accounting/pages/dashboard.test.tsx`

**Test cases:**

- ✓ KPI cards render with correct values
- ✓ Skeleton loading shows while fetching
- ✓ Error state shows if dashboard endpoint fails
- ✓ Recent invoices section loads and displays
- ✓ Clicking invoice card navigates to detail

### 5.2 Invoices List Tests

**File:** `__tests__/accounting/pages/invoices-list.test.tsx`

**Test cases:**

- ✓ Invoice table renders with sample data
- ✓ Filter by status (DRAFT, SENT, PAID) works
- ✓ Search by customer name works
- ✓ Pagination works (next/previous buttons)
- ✓ Clicking invoice row navigates to detail
- ✓ Empty state shows when no invoices
- ✓ Error state shows if list endpoint fails

### 5.3 Invoice Create Tests

**File:** `__tests__/accounting/pages/invoices-create.test.tsx`

**Test cases:**

- ✓ Form renders with all fields
- ✓ Required field validation (customer, amount)
- ✓ Email validation works
- ✓ Amount must be positive
- ✓ Can add multiple line items
- ✓ Submit button calls create endpoint
- ✓ Success shows toast and redirects
- ✓ Duplicate customer name suggests existing customers

**Error matrix:**

- Missing required field → error message
- Invalid email → error message
- Negative amount → error message
- API error (400) → error toast
- API error (403) → permission denied
- API error (500) → retry option

### 5.4 Invoice Detail Tests

**File:** `__tests__/accounting/pages/invoices-detail.test.tsx`

**Test cases:**

- ✓ Overview tab loads invoice data
- ✓ Line Items tab shows line items table
- ✓ Payments tab shows payment allocation table
- ✓ Void button calls void endpoint
- ✓ Void confirmation dialog works
- ✓ Send invoice button calls send endpoint
- ✓ Error on void shows error message

**Error matrix:**

- Invoice not found → 404 message
- Void already-voided invoice → validation error
- Permission denied → 403 message
- Network error → retry option

### 5.5 Invoice Edit Tests

**File:** `__tests__/accounting/pages/invoices-edit.test.tsx`

**Test cases:**

- ✓ Form pre-fills with invoice data
- ✓ Can update amount and line items
- ✓ Cannot edit if invoice is already paid
- ✓ Submit calls update endpoint
- ✓ Success redirects to detail

### 5.6 Settlements List Tests

**File:** `__tests__/accounting/pages/settlements-list.test.tsx`

**Test cases:**

- ✓ Settlement table renders with sample data
- ✓ Filter by status (PENDING, APPROVED, PROCESSED)
- ✓ Pagination works
- ✓ Clicking settlement row navigates to detail
- ✓ Empty state shows

### 5.7 Settlement Detail Tests

**File:** `__tests__/accounting/pages/settlements-detail.test.tsx`

**Test cases:**

- ✓ Settlement data renders in two tabs (overview, line items)
- ✓ Approve button calls approve endpoint
- ✓ Process button calls process endpoint
- ✓ Void button calls void endpoint
- ✓ Approval dialog shows confirmation
- ✓ Cannot approve if already processed

### 5.8 Settlement Create Tests

**File:** `__tests__/accounting/pages/settlements-create.test.tsx`

**Test cases:**

- ✓ Form renders with carrier selector
- ✓ Can add multiple line items
- ✓ Submit calls create endpoint
- ✓ Success redirects to settlements list

### 5.9 Payments List Tests

**File:** `__tests__/accounting/pages/payments-list.test.tsx`

**Test cases:**

- ✓ Payment table renders
- ✓ Filter by method (CASH, CHECK, ACH, etc.)
- ✓ "Record Payment" button opens dialog
- ✓ Record payment form submits correctly
- ✓ Mark bounced button works
- ✓ Bounce confirmation shows

### 5.10 Payment Detail Tests

**File:** `__tests__/accounting/pages/payments-detail.test.tsx`

**Test cases:**

- ✓ Payment header shows amount and status
- ✓ Allocation table renders all allocated invoices
- ✓ Total allocations equals payment amount
- ✓ Can add new allocation (if unallocated balance exists)
- ✓ Can remove allocation
- ✓ Total updates automatically when allocations change
- ✓ Error if trying to over-allocate

### 5.11 Payables List Tests

**File:** `__tests__/accounting/pages/payables-list.test.tsx`

**Test cases:**

- ✓ Payables table renders (carrier payments owed)
- ✓ Filter by status
- ✓ Pagination works
- ✓ Total AP calculation correct

### 5.12 Payables Detail Tests

**File:** `__tests__/accounting/pages/payables-detail.test.tsx`

**Test cases:**

- ✓ Payable detail loads
- ✓ Can create payment for payable
- ✓ Can void payable if unpaid

### 5.13 Journal Entries Tests

**File:** `__tests__/accounting/pages/journal-entries.test.tsx`

**Test cases:**

- ✓ Journal entry table renders
- ✓ Filter by status (DRAFT, POSTED)
- ✓ Post button posts entry (debits must equal credits)
- ✓ Reverse button reverses posted entry
- ✓ Delete button deletes draft entries only
- ✓ Error if debits ≠ credits

### 5.14 Chart of Accounts Tests

**File:** `__tests__/accounting/pages/chart-of-accounts.test.tsx`

**Test cases:**

- ✓ Account tree renders with hierarchy
- ✓ Can expand/collapse parent accounts
- ✓ Create account form works
- ✓ Delete account fails if has journal entries
- ✓ Search/filter works

### 5.15 Aging Report Tests

**File:** `__tests__/accounting/pages/aging-report.test.tsx`

**Test cases:**

- ✓ Aging chart renders with buckets (current, 31-60, 61-90, 91-120, 120+)
- ✓ Detail table below chart shows invoices in each bucket
- ✓ Filter by customer works
- ✓ Clicking chart bucket filters table to that bucket
- ✓ Chart updates when filters change

---

## 6. Cross-Page Workflow Tests (8 tests)

Test realistic business scenarios that span multiple pages/features.

### 6.1 Invoice-to-Payment Workflow

**File:** `__tests__/accounting/workflows/invoice-to-payment.test.tsx`

**Scenario:**

1. Create invoice for Customer A ($1,000)
2. Verify invoice appears in invoices list
3. Verify AR increased on dashboard
4. Record payment of $1,000 from Customer A
5. Apply payment to invoice
6. Verify invoice marked as PAID
7. Verify AR decreased on dashboard

**Assertions:**

- Invoice balance goes from $1,000 → $0
- Payment allocation correct
- AR calculation reflects paid invoice

### 6.2 Settlement Lifecycle Workflow

**File:** `__tests__/accounting/workflows/settlement-lifecycle.test.tsx`

**Scenario:**

1. Create settlement for Carrier B (line items add up to $5,000)
2. Status = PENDING
3. Approve settlement
4. Status = APPROVED
5. Process settlement
6. Status = PROCESSED
7. Verify carrier payment created

**Assertions:**

- Each status transition triggers correct API call
- Buttons disabled at appropriate stages

### 6.3 Payment Error Recovery Workflow

**File:** `__tests__/accounting/workflows/payment-error-recovery.test.tsx`

**Scenario:**

1. Create invoice ($1,000)
2. Record payment ($1,500)
3. Try to allocate $1,500 to invoice ($1,000)
4. Over-allocation error shown
5. Correct allocation to $1,000
6. Success

**Assertions:**

- Over-allocation prevented
- Error message clear
- Can retry after correction

### 6.4 Soft-Delete Filtering Workflow

**File:** `__tests__/accounting/workflows/soft-delete-filtering.test.tsx`

**Scenario:**

1. Create invoice with 3 line items
2. Soft-delete one line item (via API)
3. Verify deleted line item doesn't appear in frontend list
4. Verify invoice total doesn't include deleted line

**Assertions:**

- Soft-deleted items hidden in tables
- Calculations exclude soft-deleted items

### 6.5 Role-Based Access Control Workflow

**File:** `__tests__/accounting/workflows/role-based-access.test.tsx`

**Scenario:**

1. Login as DISPATCHER (not accounting role)
2. Navigate to `/accounting/settlements/[id]`
3. Try to click "Approve" button
4. Button disabled or permission error shown

**Assertions:**

- Non-accountant can't approve settlements
- Non-accountant can't void invoices

### 6.6 Concurrent Modifications Workflow

**File:** `__tests__/accounting/workflows/concurrent-modifications.test.tsx`

**Scenario:**

1. Load payment detail in Component A
2. In Component B, allocate same payment to Invoice A
3. Try in Component A to allocate same payment to Invoice B
4. Conflict detected

**Assertions:**

- Conflict error shown
- Prevents over-allocation

### 6.7 PDF Generation Workflow

**File:** `__tests__/accounting/workflows/pdf-generation.test.tsx`

**Scenario:**

1. Load invoice detail
2. Click "Download Invoice PDF"
3. Verify endpoint called: `GET /api/v1/accounting/invoices/:id/pdf`
4. Verify file download triggered

**Assertions:**

- Correct endpoint called with invoice ID
- Download triggered

### 6.8 Currency Handling Workflow

**File:** `__tests__/accounting/workflows/currency-handling.test.tsx`

**Scenario:**

1. Create invoice in USD ($1,000)
2. Create invoice in CAD (C$1,200)
3. List invoices
4. Verify amounts formatted with correct currency symbol

**Assertions:**

- Currency symbol displays correctly
- Amounts not summed across currencies
- Dashboard shows totals by currency or converted

---

## 7. Test Data & Mocking

### 7.1 Mock Hooks (`test/mocks/hooks-accounting.ts`)

Expand existing mock to provide:

```typescript
export const mockUseInvoices = () => ({
  data: [/* sample invoices */],
  isLoading: false,
  error: null,
  mutate: jest.fn(),
});

export const mockUseInvoiceDetail = () => ({
  data: /* invoice detail */,
  isLoading: false,
  error: null,
  update: jest.fn(),
  void: jest.fn(),
});

// Similar for useSettlements, usePaymentsReceived, usePaymentsMade, useAccounting
```

### 7.2 Test Fixtures (`test/data/accounting-fixtures.ts`)

```typescript
export const mockInvoices = [
  {
    id: 'inv-1',
    customerId: 'cust-1',
    amount: 1000,
    status: 'DRAFT',
    createdAt: '2026-03-01T10:00:00Z',
    lineItems: [
      { id: 'li-1', type: 'FREIGHT', amount: 800 },
      { id: 'li-2', type: 'ACCESSORIAL', amount: 200 },
    ],
    // ... other fields
  },
  // ... more invoices with different statuses
];

export const mockSettlements = [
  /* sample settlements */
];
export const mockPaymentsReceived = [
  /* sample payments */
];
// ... etc
```

### 7.3 MSW Handlers (`test/mocks/accounting-handlers.ts`)

```typescript
export const accountingHandlers = [
  http.get("/api/v1/accounting/invoices", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const filtered = status
      ? mockInvoices.filter(i => i.status === status)
      : mockInvoices;
    return HttpResponse.json({ data: filtered, pagination: {...} });
  }),

  http.post("/api/v1/accounting/invoices/:id/void", ({ params }) => {
    return HttpResponse.json({ data: { ...mockInvoice, status: "VOIDED" } });
  }),

  // Error handlers
  http.get("/api/v1/accounting/invoices/invalid-id", () => {
    return HttpResponse.json({ error: "Not found" }, { status: 404 });
  }),

  // ... 50+ handlers covering all endpoints
];
```

---

## 8. Testing Patterns & Best Practices

### 8.1 Component Test Pattern

```typescript
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { InvoicesTable } from "./invoices-table";

describe("InvoicesTable", () => {
  it("renders invoice rows correctly", () => {
    const mockInvoices = [{ id: "1", amount: 1000, status: "SENT" }];
    const mockOnView = jest.fn();

    render(<InvoicesTable invoices={mockInvoices} onView={mockOnView} />);

    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("SENT")).toBeInTheDocument();
  });

  it("calls onView with invoice ID when row clicked", async () => {
    const user = userEvent.setup();
    const mockOnView = jest.fn();

    render(<InvoicesTable invoices={mockInvoices} onView={mockOnView} />);
    await user.click(screen.getByRole("button", { name: /view/i }));

    expect(mockOnView).toHaveBeenCalledWith("1");
  });
});
```

### 8.2 Hook Test Pattern

```typescript
import { renderHook, waitFor } from '@/test/utils';
import { useInvoices } from '@/lib/hooks/accounting';
import { server } from '@/test/mocks/server';
import { HttpResponse, http } from 'msw';

describe('useInvoices', () => {
  it('fetches invoices on mount', async () => {
    const { result } = renderHook(() => useInvoices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(3);
  });

  it('handles 404 error', async () => {
    server.use(
      http.get('/api/v1/accounting/invoices', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useInvoices());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### 8.3 Page Test Pattern

```typescript
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import InvoicesPage from "@/app/(dashboard)/accounting/invoices/page";

describe("Invoices Page", () => {
  it("renders invoice list with filters", async () => {
    render(<InvoicesPage />);

    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    expect(screen.getByText("SENT")).toBeInTheDocument(); // Status badge
  });

  it("filters invoices by status", async () => {
    const user = userEvent.setup();
    render(<InvoicesPage />);

    const statusFilter = screen.getByRole("combobox", { name: /status/i });
    await user.selectOption(statusFilter, "DRAFT");

    await waitFor(() => {
      expect(screen.queryByText("SENT")).not.toBeInTheDocument();
    });
  });
});
```

### 8.4 Error Test Pattern

```typescript
describe("InvoiceForm", () => {
  it("shows validation error for required fields", async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText("Customer is required")).toBeInTheDocument();
    expect(screen.getByText("Amount is required")).toBeInTheDocument();
  });

  it("shows validation error for negative amount", async () => {
    const user = userEvent.setup();
    render(<InvoiceForm onSubmit={jest.fn()} />);

    await user.type(screen.getByLabelText(/amount/i), "-100");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText("Amount must be positive")).toBeInTheDocument();
  });

  it("shows API error message from server", async () => {
    server.use(
      http.post("/api/v1/accounting/invoices", () => {
        return HttpResponse.json(
          { error: "Customer not found" },
          { status: 400 }
        );
      })
    );

    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<InvoiceForm onSubmit={onSubmit} />);

    await user.fill(/* form */);
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText("Customer not found")).toBeInTheDocument();
    });
  });
});
```

---

## 9. Test Execution & Coverage

### 9.1 Running Tests

```bash
# Run all accounting tests
pnpm --filter web test -- accounting

# Run with coverage
pnpm --filter web test:coverage -- accounting

# Run in watch mode
pnpm --filter web test:watch -- accounting

# Run specific test file
pnpm --filter web test -- invoices-list.test.tsx
```

### 9.2 Coverage Targets

**Current state:** 0% coverage on accounting pages/components/hooks

**Target (this task):**

- Lines: 70%+ (5,244 LOC → ~3,670 covered)
- Branches: 70%+
- Functions: 70%+
- Statements: 70%+

**Coverage map by component:**

- Status badges: 95%+ (simple, complete coverage)
- Tables: 80%+ (core rendering + interactions)
- Forms: 85%+ (validation important)
- Hooks: 85%+ (error scenarios important)
- Pages: 70%+ (composition, happy path + critical errors)
- Workflows: 75%+ (integration scenarios)

### 9.3 Test Execution Time

**Target:** All 47-52 tests should run in <30 seconds

**Breakdown:**

- Component tests: ~2-3 sec (18 tests, fast)
- Hook tests: ~8-10 sec (6 tests, API mocking adds latency)
- Page tests: ~10-12 sec (15-18 tests, includes navigation, routing)
- Workflow tests: ~5-7 sec (8 tests, longer flows)

---

## 10. Success Criteria

### Definition of Done

✓ **All 47-52 tests implemented and passing**

- 18 component tests
- 6 hook tests with MSW mocking
- 15-18 page workflow tests
- 8 workflow tests

✓ **Coverage threshold met: 70% lines, branches, functions, statements**

- Accounting pages/components/hooks folder covers 70%+
- No "untested" warnings in coverage report

✓ **All error scenarios from PST-07 tested**

- ✓ Soft-delete filtering (invoice line items)
- ✓ Role-based access (accountant vs non-accountant)
- ✓ Validation errors (required fields, invalid amounts)
- ✓ API errors (400, 403, 404, 500)
- ✓ Permission denials (403 on unauthorized actions)

✓ **No flaky tests**

- All tests pass consistently
- No timeout issues
- No race conditions

✓ **Test suite is maintainable**

- Clear naming (describes what is tested)
- Reusable fixtures and mocks
- DRY test patterns (no copy-paste)

✓ **Documentation**

- Each test file has clear describe blocks
- Complex test scenarios have comments explaining the "why"
- `test/data/accounting-fixtures.ts` is well-documented

---

## 11. Known Risks & Mitigations

| Risk                          | Impact                                  | Mitigation                                                                              |
| ----------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------- |
| **MSW setup complexity**      | Tests fail due to mock misconfiguration | Start with simple hook tests, build MSW setup incrementally; test handlers in isolation |
| **Navigation mocking**        | Page tests fail on route navigation     | Use existing next/navigation mock in jest config                                        |
| **AsyncStorage/localStorage** | Tests fail if components use storage    | Mock localStorage at test setup level (already done)                                    |
| **External dependencies**     | Google Maps, Stripe, etc. fail in tests | Use existing mocks in jest config (already configured)                                  |
| **Test flakiness**            | Timing issues with async operations     | Use `waitFor()` consistently; avoid `setTimeout` in tests                               |
| **Performance regression**    | Tests become slow as coverage grows     | Monitor test execution time; profile slow tests; use test sharding if >60 sec           |

---

## 12. Implementation Phases

### Phase 1: Setup (30 min)

- Create test file structure
- Expand hooks-accounting.ts mock
- Create accounting-fixtures.ts
- Set up MSW handlers

### Phase 2: Component Tests (90 min)

- Status badge tests (4 tests)
- Table tests (6 tests)
- Filter tests (3 tests)
- Form tests (3 tests)
- Card tests (2 tests)

### Phase 3: Hook Tests (75 min)

- useInvoices (6 tests covering list, filter, search, pagination, errors)
- useInvoiceDetail (5 tests)
- useSettlements (5 tests)
- usePaymentsReceived (6 tests)
- usePaymentsMade (5 tests)
- useAccounting (3 tests)

### Phase 4: Page Tests (120 min)

- Dashboard (1 test)
- Invoices: list, create, detail, edit (4 tests)
- Settlements: list, detail, create (3 tests)
- Payments: list, detail (2 tests)
- Payables: list, detail (2 tests)
- Journal entries, chart of accounts, aging report (3 tests)

### Phase 5: Workflow Tests (60 min)

- Invoice-to-payment workflow
- Settlement lifecycle
- Payment error recovery
- Soft-delete filtering
- Role-based access
- Concurrent modifications
- PDF generation
- Currency handling

**Total: ~6 hours** (matches MP-03-006 estimate)

---

## 13. References

- **PST-07 Audit:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-07-accounting.md`
- **Hub File:** `dev_docs_v3/01-services/p0-mvp/07-accounting.md`
- **Existing Test Patterns:** `apps/web/components/auth/login-form.test.tsx`, `apps/web/components/crm/customers/customer-table.test.tsx`
- **Jest Config:** `apps/web/jest.config.ts`
- **Test Utilities:** `apps/web/test/utils.tsx`, `apps/web/test/setup.ts`
- **Design Specs:** `dev_docs/12-Rabih-design-Process/06-accounting/` (89 design files)
