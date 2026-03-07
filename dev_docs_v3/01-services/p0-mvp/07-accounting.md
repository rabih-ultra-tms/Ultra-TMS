# Service Hub: Accounting — Invoices & Settlements (07)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Accounting service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/06-accounting/` (files)
> **v2 hub (historical):** `dev_docs_v2/03-services/06-accounting.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B (7.9/10 frontend, backend partial) / Overall: B- (7/10) |
| **Confidence** | High — frontend audited 2026-03-07, all 10 pages reviewed |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — core endpoints exist; dashboard endpoint missing (QS-003) |
| **Frontend** | Built — 10 pages exist (8 real, 1 partial, 1 broken link). Avg quality 7.9/10 |
| **Tests** | None |
| **Active Sprint** | QS-003 (Accounting Dashboard Endpoint) |
| **Navigation** | Sidebar links now route to existing pages |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Accounting service definition in dev_docs |
| Design Specs | Done | Design specs in dev_docs/12-Rabih-design-Process/06-accounting/ |
| Backend — Invoices | Partial | Controller + service exist in `apps/api/src/modules/accounting/` |
| Backend — Settlements | Partial | Controller + service exist |
| Backend — Payments | Partial | Controller + service exist |
| Backend — Dashboard | Not Built | Missing — QS-003 task to build this |
| Prisma Models | Partial | Invoice, Settlement, Payment models; soft delete missing on some |
| Frontend Pages | Built | 10 pages exist in `app/(dashboard)/accounting/` |
| React Hooks | Built | 6 hooks in `lib/hooks/accounting/` |
| Components | Built | 18 components in `components/accounting/` |
| Tests | Partial | 1 test file `__tests__/accounting/accounting.test.tsx` |
| Security | Good | Endpoints require JwtAuthGuard, ACCOUNTING role |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Invoices List | `/accounting/invoices` | Built | 8/10 | Table with filters, status badges, pagination, search |
| Invoice Detail | `/accounting/invoices/[id]` | Built | 8/10 | Detail card with line items, payment history |
| Invoice Create | `/accounting/invoices/new` | Built | 8/10 | Form with order lookup, line items, validation |
| Invoice Edit | `/accounting/invoices/[id]/edit` | Not Built | — | No edit route exists — create handles updates |
| Settlements List | `/accounting/settlements` | Built | 8/10 | Table with filters, status badges |
| Settlement Detail | `/accounting/settlements/[id]` | Built | 8/10 | Detail with carrier info, approval workflow |
| Settlement Create | `/accounting/settlements/new` | Not Built | — | No separate create page |
| Payments List | `/accounting/payments` | Built | 8/10 | Table with payment method, allocation view |
| Payment Detail | `/accounting/payments/[id]` | Built | 7/10 | Basic detail view |
| Payables List | `/accounting/payables` | Built | 8/10 | Table with payable status, filters |
| Accounting Dashboard | `/accounting` | Built | 7/10 | KPI stats + recent invoices (needs QS-003 endpoint) |
| Aging Report | `/accounting/reports/aging` | Built | 7/10 | Aging buckets visualization |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/invoices` | AccountingController | Partial | List with status filter |
| POST | `/api/v1/accounting/invoices` | AccountingController | Partial | Create invoice from order |
| GET | `/api/v1/accounting/invoices/:id` | AccountingController | Partial | Detail |
| PUT | `/api/v1/accounting/invoices/:id` | AccountingController | Partial | Update |
| PATCH | `/api/v1/accounting/invoices/:id/status` | AccountingController | Partial | Status change |
| POST | `/api/v1/accounting/invoices/:id/send` | AccountingController | Partial | Email to customer |
| POST | `/api/v1/accounting/invoices/:id/payment` | AccountingController | Partial | Record payment |
| GET | `/api/v1/accounting/invoices/stats` | AccountingController | **Not Built** | QS-003 — needed for dashboard |
| GET | `/api/v1/accounting/settlements` | AccountingController | Partial | List |
| POST | `/api/v1/accounting/settlements` | AccountingController | Partial | Create from delivered load |
| GET | `/api/v1/accounting/settlements/:id` | AccountingController | Partial | Detail |
| PATCH | `/api/v1/accounting/settlements/:id/status` | AccountingController | Partial | Approve/reject |
| POST | `/api/v1/accounting/settlements/:id/pay` | AccountingController | Partial | Mark paid |
| GET | `/api/v1/accounting/payments` | AccountingController | Partial | List |
| POST | `/api/v1/accounting/payments` | AccountingController | Partial | Record payment |
| GET | `/api/v1/accounting/dashboard` | AccountingController | **Not Built** | QS-003 — AR total, AP total, aging |
| GET | `/api/v1/accounting/reports/aging` | AccountingController | **Not Built** | Aging buckets: 30/60/90/90+ days |

---

## 5. Components

18 components exist in `components/accounting/`:

**Invoices (5):**
| Component | Path | Status |
|-----------|------|--------|
| InvoicesTable | `components/accounting/invoices-table.tsx` | Built |
| InvoiceForm | `components/accounting/invoice-form.tsx` | Built |
| InvoiceDetailCard | `components/accounting/invoice-detail-card.tsx` | Built |
| InvoiceStatusBadge | `components/accounting/invoice-status-badge.tsx` | Built |
| InvoiceFilters | `components/accounting/invoice-filters.tsx` | Built |

**Payments (5):**
| Component | Path | Status |
|-----------|------|--------|
| PaymentsTable | `components/accounting/payments-table.tsx` | Built |
| PaymentStatusBadge | `components/accounting/payment-status-badge.tsx` | Built |
| PaymentAllocation | `components/accounting/payment-allocation.tsx` | Built |
| PaymentFilters | `components/accounting/payment-filters.tsx` | Built |
| RecordPaymentForm | `app/(dashboard)/accounting/payments/record-payment-form.tsx` | Built |

**Settlements (3):**
| Component | Path | Status |
|-----------|------|--------|
| SettlementTable | `components/accounting/settlement-table.tsx` | Built |
| SettlementStatusBadge | `components/accounting/settlement-status-badge.tsx` | Built |
| SettlementFilters | `components/accounting/settlement-filters.tsx` | Built |

**Payables (3):**
| Component | Path | Status |
|-----------|------|--------|
| PayablesTable | `components/accounting/payables-table.tsx` | Built |
| PayableStatusBadge | `components/accounting/payable-status-badge.tsx` | Built |
| PayableFilters | `components/accounting/payable-filters.tsx` | Built |

**Dashboard & Reports (2):**
| Component | Path | Status |
|-----------|------|--------|
| AccDashboardStats | `components/accounting/acc-dashboard-stats.tsx` | Built |
| AccRecentInvoices | `components/accounting/acc-recent-invoices.tsx` | Built |
| AgingReport | `components/accounting/aging-report.tsx` | Built |

---

## 6. Hooks

6 hooks exist in `lib/hooks/accounting/`:

| Hook | File | Endpoints | Status |
|------|------|-----------|--------|
| `useInvoices` | `use-invoices.ts` | GET `/accounting/invoices`, POST, PATCH status | Built |
| `useSettlements` | `use-settlements.ts` | GET `/accounting/settlements`, POST, PATCH | Built |
| `usePayments` | `use-payments.ts` | GET `/accounting/payments`, POST | Built |
| `usePayables` | `use-payables.ts` | GET `/accounting/payables` | Built |
| `useAccountingDashboard` | `use-accounting-dashboard.ts` | GET `/accounting/dashboard` | Built (needs QS-003 endpoint) |
| `useAging` | `use-aging.ts` | GET `/accounting/reports/aging` | Built |

**Not built (from original plan):**

| Hook | Endpoints | Priority |
|------|-----------|----------|
| `useCreateInvoice` (separate) | POST `/accounting/invoices` | Low — bundled in useInvoices |
| `useUpdateInvoiceStatus` (separate) | PATCH `/accounting/invoices/:id/status` | Low — bundled in useInvoices |
| `usePaySettlement` (separate) | POST `/accounting/settlements/:id/pay` | Low — bundled in useSettlements |

> **Note:** The 6 existing hooks bundle CRUD mutations via React Query `useMutation` inside the same file, so separate create/update/pay hooks are unnecessary.

---

## 7. Business Rules

1. **Invoice Auto-Generation:** When an order status changes to DELIVERED, the system automatically creates a draft invoice using the order's rate data. The invoice is NOT sent automatically — dispatcher/accounting reviews and sends manually. Invoice number format: `INV-{YYYYMM}-{NNN}`.
2. **Settlement Auto-Generation:** When a load status changes to DELIVERED and the carrier payment amount is known, a draft settlement is created. Settlement number format: `SET-{YYYYMM}-{NNN}`. Settlement cannot be paid until invoice for the same order is marked SENT or PAID.
3. **Invoice Payment Terms:** Default NET30. Configurable per customer in CRM. Due date = invoice date + payment terms. Overdue invoices auto-trigger reminder emails at: 1 day overdue, 7 days, 30 days.
4. **Credit Hold Integration:** When an invoice is 60+ days overdue, CRM customer status auto-changes to HOLD. The change is logged to AuditLog. Must be manually released by ACCOUNTING role after payment.
5. **Margin Validation:** Invoice total must equal or exceed the minimum 15% margin threshold from the original quote. If the delivered total doesn't meet margin (e.g., detention charges consumed margin), accounting is alerted. No automatic block — manual review.
6. **Soft Delete Required:** Invoice, Settlement, and Payment records CANNOT be hard deleted (financial records, 7-year retention). Soft delete is used but only SUPER_ADMIN can soft-delete financial records. All deletes logged to AuditLog.
7. **Tax Handling:** Invoices include a tax field (JSON) for state-specific tax calculations. Current implementation: tax is informational (displayed but not calculated automatically). Automated tax calculation is P3 (integrate with Avalara or TaxJar).
8. **QuickBooks/Accounting Integration:** All invoices and settlements will sync to QuickBooks Online (P1 post-MVP). The `external_id` field on Invoice and Settlement stores the QB record ID for idempotent sync.

---

## 8. Data Model

### Invoice
```
Invoice {
  id              String (UUID)
  invoiceNumber   String (auto: INV-{YYYYMM}-{NNN})
  status          InvoiceStatus (DRAFT, SENT, VIEWED, PARTIAL, PAID, OVERDUE, VOID, DISPUTED)
  orderId         String (FK → Order)
  customerId      String (FK → Customer)
  subtotal        Decimal
  tax             Decimal (default: 0)
  total           Decimal
  amountPaid      Decimal (default: 0)
  amountDue       Decimal (total - amountPaid)
  dueDate         DateTime
  sentAt          DateTime?
  paidAt          DateTime?
  lineItems       InvoiceLineItem[]
  payments        Payment[]
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
  deletedAt       DateTime? (soft delete — SUPER_ADMIN only)
  external_id     String? (QuickBooks sync)
  custom_fields   Json?
}
```

### Settlement
```
Settlement {
  id                String (UUID)
  settlementNumber  String (auto: SET-{YYYYMM}-{NNN})
  status            SettlementStatus (PENDING, APPROVED, PROCESSING, PAID, DISPUTED)
  loadId            String (FK → Load)
  carrierId         String (FK → Carrier)
  lineHaul          Decimal
  fuelSurcharge     Decimal
  accessorials      Decimal
  totalAmount       Decimal
  paidAt            DateTime?
  paymentMethod     String? (CHECK, ACH, WIRE)
  checkNumber       String?
  tenantId          String
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?
  external_id       String?
}
```

### Payment
```
Payment {
  id            String (UUID)
  invoiceId     String (FK → Invoice)
  amount        Decimal
  method        PaymentMethod (CHECK, ACH, WIRE, CREDIT_CARD, CASH)
  referenceNum  String?
  notes         String?
  receivedAt    DateTime
  recordedBy    String (FK → User)
  tenantId      String
  createdAt     DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| Invoice `status` transitions | DRAFT→SENT→PAID (no skip) | "Invalid status transition" |
| `total` | Must be positive Decimal | "Invoice total must be positive" |
| `dueDate` | Must be after invoiceDate | "Due date must be after invoice date" |
| Settlement `totalAmount` | Must match sum of lineHaul + fuelSurcharge + accessorials | "Settlement total does not match line items" |
| Payment `amount` | Cannot exceed remaining amountDue | "Payment amount exceeds outstanding balance" |
| `orderId` for invoice | Order must be in DELIVERED or later status | "Cannot invoice an order that hasn't been delivered" |
| `loadId` for settlement | Load must be in DELIVERED status | "Cannot settle an undelivered load" |

---

## 10. Status States

### Invoice Status Machine
```
DRAFT → SENT (manual send, creates PDF, emails customer)
SENT → VIEWED (customer opens email, tracked via pixel)
SENT/VIEWED → PARTIAL (partial payment received)
SENT/VIEWED/PARTIAL → PAID (full payment recorded)
SENT/VIEWED → OVERDUE (auto on due date pass)
OVERDUE → PAID (payment recorded)
Any → DISPUTED (customer disputes, requires resolution)
Any → VOID (admin only, cannot be reversed)
```

### Settlement Status Machine
```
PENDING → APPROVED (accounting review) → PROCESSING (payment initiated) → PAID
PENDING/APPROVED → DISPUTED (carrier disputes amount)
DISPUTED → APPROVED (after resolution)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| Accounting Dashboard endpoint missing | P0 | Backend controller | QS-003 |
| Invoice Edit route missing | P1 | `(dashboard)/accounting/invoices/[id]/edit/` | No page exists |
| Settlement Create route missing | P1 | `(dashboard)/accounting/settlements/new/` | No page exists |
| Aging Report endpoint missing | P1 | Backend controller | Backlog |
| Soft delete not on Invoice, Settlement, Payment | P1 | Prisma schema | QS-002 |
| Dashboard uses mock/fallback data without QS-003 endpoint | P1 | `acc-dashboard-stats.tsx` | Blocked by QS-003 |
| QuickBooks sync not implemented | P2 | — | Deferred |
| Test coverage minimal | P2 | `__tests__/accounting/` | 1 test file only |

**Previously listed — now resolved:**
- ~~All accounting sidebar links return 404~~ — Links now route to existing pages
- ~~No frontend screens built~~ — 10 pages exist (audited 2026-03-07)
- ~~No hooks exist~~ — 6 hooks built in `lib/hooks/accounting/`

---

## 12. Tasks

### Quality Sprint (Active)

| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| QS-003 | Build Accounting Dashboard Endpoint (AR total, AP total, aging, cash flow) | M (2-4h) | Open |
| QS-002 | Soft Delete Migration for Invoice, Settlement, Payment | M (2-4h) | Open |

### Backlog (updated 2026-03-07 — reflects actual build state)

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| ACC-101 | ~~Fix sidebar nav links~~ | — | ~~P0~~ | DONE — links route to existing pages |
| ACC-102 | QA Invoices List page (exists, 8/10) | S (1h) | P1 | Verify filters, pagination, API wiring |
| ACC-103 | QA Invoice Detail page (exists, 8/10) | S (1h) | P1 | Verify line items, payment history |
| ACC-104 | QA Invoice Create flow (exists, 8/10) | S (1h) | P1 | Verify order lookup, validation |
| ACC-105 | QA Settlements List + Detail (exist, 8/10) | S (1h) | P1 | Verify approval workflow |
| ACC-106 | QA Accounting Dashboard (exists, 7/10 — blocked by QS-003) | S (1h) | P0 | Needs QS-003 endpoint first |
| ACC-107 | QA Aging Report (exists, 7/10) | S (30m) | P1 | Verify aging buckets |
| ACC-108 | ~~Write accounting hooks~~ | — | ~~P0~~ | DONE — 6 hooks exist in `lib/hooks/accounting/` |
| ACC-109 | Expand accounting tests | M (4h) | P1 | Only 1 test file exists |
| ACC-110 | QuickBooks integration (P1 post-MVP) | XL (16h) | P2 | Deferred |
| ACC-111 | Build Invoice Edit route (`/invoices/[id]/edit`) | M (3h) | P1 | Missing route |
| ACC-112 | Build Settlement Create route (`/settlements/new`) | M (3h) | P2 | Missing route |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Accounting Service Overview | Overview | `dev_docs/12-Rabih-design-Process/06-accounting/00-service-overview.md` |
| Invoices List | Full 15-section | `dev_docs/12-Rabih-design-Process/06-accounting/01-invoices-list.md` |
| Invoice Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/06-accounting/02-invoice-detail.md` |
| Invoice Create | Full 15-section | `dev_docs/12-Rabih-design-Process/06-accounting/03-invoice-create.md` |
| Settlements List | Full 15-section | `dev_docs/12-Rabih-design-Process/06-accounting/04-settlements-list.md` |
| Settlement Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/06-accounting/05-settlement-detail.md` |
| Accounting Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/06-accounting/06-accounting-dashboard.md` |
| Payments | Full 15-section | `dev_docs/12-Rabih-design-Process/06-accounting/07-payments.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Accounting frontend in scope | 10 pages built, avg 7.9/10 quality | Ahead of plan |
| Auto-invoice on delivery | Backend logic written | Backend ahead |
| QuickBooks integration in scope | Deferred to P2 | Descoped |
| 12 screens planned | 10 built, 2 missing (edit, settlement create) | Minor gap |
| Sidebar links functional | All routing correctly | Resolved |
| Tests required | 1 test file exists | Partial gap |
| 10 hooks planned | 6 hooks built (bundled CRUD mutations) | Complete (different design) |
| 9 components planned | 18 components built | Exceeded plan |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles — only ACCOUNTING and ADMIN roles can access)
- TMS Core (delivered orders for invoice generation, delivered loads for settlement)
- CRM (customer billing info, payment terms, credit hold integration)
- Carrier Management (carrier payment terms, bank info for ACH)
- Communication (invoice emails, payment reminder emails)

**Depended on by:**
- Commission (revenue from paid invoices for commission calculations)
- Analytics (revenue trends, profitability reports)
- Customer Portal (customers view their invoices)
- QuickBooks/ERP (future sync)
