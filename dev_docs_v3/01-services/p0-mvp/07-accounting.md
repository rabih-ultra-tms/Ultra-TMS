# Service Hub: Accounting — Invoices & Settlements (07)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Accounting service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/06-accounting/` (files)
> **v2 hub (historical):** `dev_docs_v2/03-services/06-accounting.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (3/10) |
| **Confidence** | Medium — backend reviewed; frontend confirmed not built |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — core endpoints exist; dashboard endpoint missing (QS-003) |
| **Frontend** | Not Built — all screens require fresh build from spec |
| **Tests** | None |
| **Active Sprint** | QS-003 (Accounting Dashboard Endpoint) |
| **Navigation** | 5 sidebar links point to 404s (invoices, settlements, reports) |

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
| Frontend Pages | Not Built | 0 screens exist |
| React Hooks | Not Built | Must be created |
| Components | Not Built | Must be created |
| Tests | None | |
| Security | Good | Endpoints require JwtAuthGuard, ACCOUNTING role |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Invoices List | `/accounting/invoices` | Not Built | — | Sidebar link active but 404s |
| Invoice Detail | `/accounting/invoices/[id]` | Not Built | — | |
| Invoice Create | `/accounting/invoices/new` | Not Built | — | Auto-generated from delivered orders |
| Invoice Edit | `/accounting/invoices/[id]/edit` | Not Built | — | |
| Settlements List | `/accounting/settlements` | Not Built | — | Sidebar link 404s |
| Settlement Detail | `/accounting/settlements/[id]` | Not Built | — | Carrier payment details |
| Settlement Create | `/accounting/settlements/new` | Not Built | — | From load delivery |
| Payments List | `/accounting/payments` | Not Built | — | |
| Payment Detail | `/accounting/payments/[id]` | Not Built | — | |
| Accounting Dashboard | `/accounting` | Not Built | — | KPI: AR, AP, cash flow, aging |
| Reports | `/accounting/reports` | Not Built | — | Sidebar link 404s. Phase 3 |
| Aging Report | `/accounting/reports/aging` | Not Built | — | Phase 3 |

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

All must be built:

| Component | Planned Path | Priority |
|-----------|-------------|----------|
| InvoicesTable | `components/accounting/invoices/invoices-table.tsx` | P0 |
| InvoiceForm | `components/accounting/invoices/invoice-form.tsx` | P0 |
| InvoiceDetailCard | `components/accounting/invoices/invoice-detail-card.tsx` | P0 |
| InvoiceStatusBadge | `components/accounting/invoices/invoice-status-badge.tsx` | P0 |
| PaymentForm | `components/accounting/payments/payment-form.tsx` | P0 |
| SettlementsTable | `components/accounting/settlements/settlements-table.tsx` | P0 |
| SettlementDetailCard | `components/accounting/settlements/settlement-detail-card.tsx` | P0 |
| AccountingDashboardKPI | `components/accounting/dashboard/accounting-kpi.tsx` | P0 |
| AgingReport | `components/accounting/reports/aging-report.tsx` | P1 |

---

## 6. Hooks

All must be built:

| Hook | Endpoints | Priority |
|------|-----------|----------|
| `useInvoices` | GET `/accounting/invoices` | P0 |
| `useInvoice` | GET `/accounting/invoices/:id` | P0 |
| `useCreateInvoice` | POST `/accounting/invoices` | P0 |
| `useUpdateInvoiceStatus` | PATCH `/accounting/invoices/:id/status` | P0 |
| `useRecordPayment` | POST `/accounting/invoices/:id/payment` | P0 |
| `useSettlements` | GET `/accounting/settlements` | P0 |
| `useSettlement` | GET `/accounting/settlements/:id` | P0 |
| `useCreateSettlement` | POST `/accounting/settlements` | P0 |
| `usePaySettlement` | POST `/accounting/settlements/:id/pay` | P0 |
| `useAccountingDashboard` | GET `/accounting/dashboard` | P0 |

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
| All accounting sidebar links return 404 | P0 | `lib/config/navigation.ts` | Open |
| No frontend screens built | P0 | `(dashboard)/accounting/` | Open |
| Accounting Dashboard endpoint missing | P0 | Backend controller | QS-003 |
| Aging Report endpoint missing | P1 | Backend controller | Backlog |
| Soft delete not on Invoice, Settlement, Payment | P1 | Prisma schema | QS-002 |
| No hooks exist | P0 | — | Must Build |
| No tests | P0 | — | Must Build |
| QuickBooks sync not implemented | P2 | — | Deferred |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| QS-003 | Build Accounting Dashboard Endpoint (AR total, AP total, aging, cash flow) | M (2-4h) | Open |
| QS-002 | Soft Delete Migration for Invoice, Settlement, Payment | M (2-4h) | Open |

### Backlog
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| ACC-101 | Fix sidebar nav links (accounting routes) | S (30m) | P0 — QS-related |
| ACC-102 | Build Invoices List page | L (6h) | P0 |
| ACC-103 | Build Invoice Detail page (PDF preview, payment record) | L (6h) | P0 |
| ACC-104 | Build Invoice Create flow (from order) | M (4h) | P0 |
| ACC-105 | Build Settlements List + Detail | L (6h) | P0 |
| ACC-106 | Build Accounting Dashboard | L (6h) | P0 |
| ACC-107 | Build Aging Report | M (4h) | P1 |
| ACC-108 | Write accounting hooks (10 hooks) | M (3h) | P0 |
| ACC-109 | Write accounting tests | M (4h) | P1 |
| ACC-110 | QuickBooks integration (P1 post-MVP) | XL (16h) | P2 |

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
| Accounting frontend in scope | Frontend 0% built | Major gap |
| Auto-invoice on delivery | Backend logic written | Backend ahead |
| QuickBooks integration in scope | Deferred to P2 | Descoped |
| 12 screens planned | 0 built | 100% gap |
| Sidebar links functional | All 404s | Regression |
| Tests required | 0 tests | Critical gap |

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
