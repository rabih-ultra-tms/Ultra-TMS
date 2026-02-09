# Service 06: Accounting

> **Grade:** A- (8.5/10) Backend / 0% Frontend | **Priority:** Build | **Phase:** 6 (weeks 14-16)
> **Web Prompt:** `dev_docs/11-ai-dev/web-dev-prompts/06-accounting-ui.md`
> **Design Specs:** `dev_docs/12-Rabih-design-Process/06-accounting/` (14 files)

---

## Status Summary

Backend is production-ready with 10 services, 8 controllers, ~2,056 LOC covering Invoices, Settlements, Payments (received/made), Journal Entries, Chart of Accounts, and financial reporting. Frontend is 0% complete -- no screens built yet. Grade reflects strong backend foundation (A-) ready to wire to UI. Phase 6 placement means this builds after TMS Core, Load Board, and Operations are complete.

---

## Screens

| Screen | Route | Status | Quality | Task ID | Notes |
|--------|-------|--------|---------|---------|-------|
| Accounting Dashboard | `/accounting` | Not Built | -- | -- | Phase 6 |
| Invoices List | `/accounting/invoices` | Not Built | -- | -- | Phase 6 |
| Invoice Detail | `/accounting/invoices/[id]` | Not Built | -- | -- | Phase 6 |
| Invoice Create | `/accounting/invoices/new` | Not Built | -- | -- | Phase 6 |
| Payments (Received) | `/accounting/payments` | Not Built | -- | -- | Phase 6 |
| Payment Detail | `/accounting/payments/[id]` | Not Built | -- | -- | Phase 6 |
| Carrier Payables | `/accounting/payables` | Not Built | -- | -- | Phase 6 |
| Carrier Settlements | `/accounting/settlements` | Not Built | -- | -- | Phase 6 |
| Settlement Detail | `/accounting/settlements/[id]` | Not Built | -- | -- | Phase 6 |
| Aging Reports | `/accounting/aging` | Not Built | -- | -- | Phase 6 |
| GL Settings | `/accounting/settings` | Not Built | -- | -- | Phase 6 |

---

## Backend API

### Invoices (12 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/invoices` | GET/POST | Production | List (paginated) + Create |
| `/api/v1/invoices/:id` | GET/PUT/DELETE | Production | Full CRUD |
| `/api/v1/invoices/:id/status` | PATCH | Production | Status transitions |
| `/api/v1/invoices/:id/send` | POST | Production | Send to customer |
| `/api/v1/invoices/:id/void` | POST | Production | Void invoice with reason |
| `/api/v1/invoices/:id/pdf` | GET | Production | PDF export |

### Payments Received (8 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/payments-received` | GET/POST | Production | List + Create payment |
| `/api/v1/payments-received/:id` | GET/PUT/DELETE | Production | CRUD |
| `/api/v1/payments-received/:id/allocate` | POST | Production | Allocate to invoices |

### Payments Made (8 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/payments-made` | GET/POST | Production | List + Create payout |
| `/api/v1/payments-made/:id` | GET/PUT/DELETE | Production | CRUD |
| `/api/v1/payments-made/:id/process` | POST | Production | Process payment |

### Settlements (10 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/settlements` | GET/POST | Production | List + Create |
| `/api/v1/settlements/:id` | GET/PUT/DELETE | Production | CRUD |
| `/api/v1/settlements/:id/approve` | POST | Production | Approve settlement |
| `/api/v1/settlements/:id/process` | POST | Production | Process payout |

### Journal Entries (6 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/journal-entries` | GET/POST | Production | List + Create |
| `/api/v1/journal-entries/:id` | GET/PUT/DELETE | Production | CRUD |

### Chart of Accounts (4 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/chart-of-accounts` | GET | Production | List accounts |
| `/api/v1/chart-of-accounts/:id` | GET | Production | Account detail |

### Reports (5 endpoints -- Production)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/accounting/dashboard` | GET | Production | KPI data (AR/AP) |
| `/api/v1/accounting/aging` | GET | Production | Aging bucket analysis |
| `/api/v1/accounting/reports/:type` | GET | Production | Financial reports |

---

## Frontend Components

**Status: 0 components exist. All must be built in Phase 6.**

| Component | Path | Notes |
|-----------|------|-------|
| InvoicesTable | `components/accounting/invoices-table.tsx` | To build |
| InvoiceForm | `components/accounting/invoice-form.tsx` | To build |
| InvoiceDetailCard | `components/accounting/invoice-detail-card.tsx` | To build |
| InvoiceStatusBadge | `components/accounting/invoice-status-badge.tsx` | To build |
| PaymentsTable | `components/accounting/payments-table.tsx` | To build |
| PaymentAllocation | `components/accounting/payment-allocation.tsx` | To build |
| SettlementTable | `components/accounting/settlement-table.tsx` | To build |
| AgingReport | `components/accounting/aging-report.tsx` | To build |
| AccountingFilters | `components/accounting/accounting-filters.tsx` | To build |

---

## Design Specs

| Screen | Spec File | Content Level |
|--------|-----------|---------------|
| Service Overview | `00-service-overview.md` | Overview |
| Accounting Dashboard | `01-accounting-dashboard.md` | Full 15-section |
| Invoices List | `02-invoices-list.md` | Full 15-section |
| Invoice Detail | `03-invoice-detail.md` | Full 15-section |
| Invoice Entry | `04-invoice-entry.md` | Full 15-section |
| Carrier Payables | `05-carrier-payables.md` | Full 15-section |
| Bill Entry | `06-bill-entry.md` | Full 15-section |
| Payments Received | `07-payments-received.md` | Full 15-section |
| Payments Made | `08-payments-made.md` | Full 15-section |
| Payment Entry | `09-payment-entry.md` | Full 15-section |
| Bank Reconciliation | `10-bank-reconciliation.md` | Full 15-section |
| GL Transactions | `11-gl-transactions.md` | Full 15-section |
| Chart of Accounts | `12-chart-of-accounts.md` | Full 15-section |
| Financial Reports | `13-financial-reports.md` | Full 15-section |

---

## Open Bugs

None known. Backend verified production-ready.

---

## Tasks

> **Revised v2** — Estimates updated per logistics expert review. QuickBooks removed. Own accounting is priority.

| Task ID | Title | Phase | Status | Effort |
|---------|-------|-------|--------|--------|
| ACC-001 | Build Accounting Dashboard | 6 | NOT STARTED | M (5h) ⬆️ |
| ACC-002 | Build Invoices (list, detail, CRUD) | 6 | NOT STARTED | L (8h) ⬆️ |
| ACC-003 | Build Payments Received (list, detail, allocate) | 6 | NOT STARTED | M (5h) ⬆️ |
| ACC-004 | Build Carrier Payables (list, detail) | 6 | NOT STARTED | M (3h) ⬆️ |
| ACC-005 | Build Settlements (list, detail, process) | 6 | NOT STARTED | M (5h) ⬆️ |
| ACC-006 | Build Aging Reports | 6 | NOT STARTED | M (4h) ⬆️ |
| ~~INTEG-002~~ | ~~QuickBooks Sync~~ | ~~6~~ | REMOVED | — |
| **DOC-002** | **Business Rules Reference Doc** | 5 | NOT STARTED | M (4-6h) |

---

## Key Business Rules

### Payment Terms
| Code | Days | Notes |
|------|------|-------|
| COD | 0 | Cash on delivery |
| NET15 | 15 | Standard quick pay |
| NET21 | 21 | Common carrier term |
| NET30 | 30 | Standard customer term |
| NET45 | 45 | Extended term (approved customers only) |

### Invoice Rules
| Rule | Detail |
|------|--------|
| **Auto-Invoice** | Invoice auto-generated when load status = DELIVERED + POD received |
| **Due Date Calc** | `dueDate = invoiceDate + paymentTerms (days)` |
| **Overdue** | Status auto-changes to OVERDUE when past dueDate + 1 day grace |
| **DSO Calculation** | `DSO = (accountsReceivable / totalCreditSales) × numberOfDays` |
| **Late Fee** | 1.5% per month on overdue balance (configurable per customer) |

### Quick Pay (Carrier)
| Rule | Detail |
|------|--------|
| **Discount Formula** | `discount = (daysEarly × 0.02 × carrierRate) / 30` |
| **Eligibility** | Carrier must have: DELIVERED status + POD uploaded + payment terms elapsed |
| **Standard Terms** | Carriers paid NET21; quick pay available at NET3-7 with discount |

### Detention Billing
| Rule | Detail |
|------|--------|
| **Free Time** | 2 hours (configurable) |
| **Rate** | $75/hour after free time |
| **Cap** | 8 hours maximum |
| **Invoice Line** | Added as accessorial line item on customer invoice |

### Settlement Workflow
```
Load DELIVERED → Carrier Payable created → Group into Settlement → Approve → Process Payout
```

## Key References

| Document | Path | What It Contains |
|----------|------|------------------|
| Data Dictionary | `dev_docs/11-ai-dev/91-data-dictionary.md` | Invoice, Payment, Settlement schemas |
| Business Rules | `dev_docs/11-ai-dev/92-business-rules-reference.md` | Payment terms, DSO, quick pay formulas |
| ~~QuickBooks Integration~~ | ~~`dev_docs/06-external/59-integrations-external-apis.md`~~ | REMOVED from MVP — own accounting built instead |
| Business Rules Quick Ref | `dev_docs_v2/05-references/business-rules-quick-ref.md` | Margin, credit, detention, TONU rules (DOC-002) |

---

## Dependencies

- **Depends on:** Auth, CRM (customer lookup), TMS Core (order/load reference), design tokens (COMP-001)
- **Depended on by:** Financial dashboards, executive reporting

---

## What to Build Next (Ordered)

1. **Build Accounting Dashboard** -- KPI cards (AR/AP balance, overdue count, cash collected). 4h.
2. **Build Invoices UI** -- List with pagination + filters, detail view, create/edit forms. 6h.
3. **Build Payments Received UI** -- List, detail, allocation grid. 4h.
4. **Build Carrier Payables UI** -- List + detail (from load data). 2h.
5. **Build Settlements UI** -- List, detail, process button. 4h.
6. **Build Aging Reports** -- Bucket visualization (0-30, 31-60, 61-90, 90+ days). 3h.

---

## Implementation Notes

- Invoice state machine: DRAFT > PENDING > SENT > VIEWED > PARTIAL/PAID/OVERDUE/VOID
- Payment allocation: split one payment across multiple invoices
- Settlements: group multiple carrier payables into single payout
- Aging buckets: automatic grouping by days overdue
- PDF generation: invoices + statements
