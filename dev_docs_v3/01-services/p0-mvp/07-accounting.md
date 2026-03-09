# Service Hub: Accounting — Invoices & Settlements (07)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-07 tribunal)
> **Original definition:** `dev_docs/02-services/` (Accounting service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/06-accounting/` (files)
> **v2 hub (historical):** `dev_docs_v2/03-services/06-accounting.md`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/batch-1-p0/PST-07-accounting.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B+ (8.2/10) |
| **Confidence** | High — code-verified via PST-07 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — full double-entry accounting platform (11 models, 54 endpoints across 10 controllers) |
| **Frontend** | Built — 11 pages exist (9 real, 2 not built). Avg quality 7.5/10 |
| **Tests** | Partial — 8 backend spec files exist |
| **Priority** | P0 — fix 4 cross-tenant bugs in payment application, add RolesGuard to 6 controllers |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Accounting service definition in dev_docs |
| Design Specs | Done | Design specs in dev_docs/12-Rabih-design-Process/06-accounting/ |
| Backend — Invoices | Production | Controller + service exist in `apps/api/src/modules/accounting/` (12 endpoints) |
| Backend — Settlements | Production | Controller + service exist (8 endpoints) |
| Backend — Payments Received | Production | Controller + service exist (7 endpoints) |
| Backend — Payments Made | Production | Controller + service exist (8 endpoints) |
| Backend — Chart of Accounts | Production | Controller + service exist (6 endpoints) |
| Backend — Journal Entries | Production | Controller + service exist (7 endpoints) |
| Backend — Dashboard | Production | `GET /accounting/dashboard` EXISTS — returns totalAR, totalAP, overdueInvoiceCount, DSO, revenueMTD, cashCollectedMTD |
| Backend — Reports | Production | Controller with 3 endpoints (aging, P&L, balance sheet) |
| Backend — QuickBooks | Stub | 2 stub endpoints (sync invoice, sync settlement) |
| Prisma Models | Production | 11 models (Invoice, InvoiceLineItem, Settlement, SettlementLineItem, PaymentReceived, PaymentMade, PaymentApplication, ChartOfAccount, JournalEntry, JournalEntryLine, PaymentPlan) |
| Frontend Pages | Built | 11 pages exist in `app/(dashboard)/accounting/` (9 real, 2 not built) |
| React Hooks | Built | 6 hooks in `lib/hooks/accounting/` — consistent `unwrap<T>()` pattern (best of all P0 services) |
| Components | Built | 18 components in `components/accounting/` |
| Tests | Partial | 8 backend spec files exist (hub previously claimed 1) |
| Security | Mixed | 4/10 controllers have RolesGuard; 6/10 lack role guards (JwtAuthGuard only) |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Accounting Dashboard | `/accounting` | Built | 7/10 | Real API calls, skeleton loading, KPI cards |
| Invoices List | `/accounting/invoices` | Built | 8/10 | Filters, pagination, search, status badges |
| Invoice Detail | `/accounting/invoices/[id]` | Built | 8/10 | 3 tabs (overview, line items, payments), error handling |
| Invoice Create | `/accounting/invoices/new` | Built | 7/10 | `any` type assertion (eslint-disable), Suspense wrapper |
| Invoice Edit | `/accounting/invoices/[id]/edit` | Not Built | — | No edit route exists |
| Settlements List | `/accounting/settlements` | Built | 7/10 | Standard list, no detail navigation issues |
| Settlement Detail | `/accounting/settlements/[id]` | Built | 8/10 | 2 tabs, approve/process workflow |
| Settlement Create | `/accounting/settlements/new` | Not Built | — | No separate create page |
| Payments List | `/accounting/payments` | Built | 8/10 | Dialog form for recording, method filters |
| Payment Detail | `/accounting/payments/[id]` | Built | 8/10 | Advanced allocation table (453 LOC), auto-calculate |
| Payables List | `/accounting/payables` | Built | 7/10 | Simple list, no detail route |
| Aging Report | `/accounting/reports/aging` | Built | 8/10 | Bar chart + detail table, customer filter |

**Average quality: 7.5/10** | **Frontend Total LOC: ~5,244**

---

## 4. API Endpoints

### Accounting Dashboard (2 endpoints — both BUILT)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/dashboard` | AccountingController | Production | Returns totalAR, totalAP, overdueInvoiceCount, DSO, revenueMTD, cashCollectedMTD |
| GET | `/api/v1/accounting/aging` | AccountingController | Production | Aging report (current, 31-60, 61-90, 91-120, 120+) |

### Invoices (12 endpoints)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/invoices` | InvoicesController | Production | List with status filter, pagination |
| POST | `/api/v1/accounting/invoices` | InvoicesController | Production | Create invoice |
| GET | `/api/v1/accounting/invoices/:id` | InvoicesController | Production | Detail |
| PUT | `/api/v1/accounting/invoices/:id` | InvoicesController | Production | Update |
| PATCH | `/api/v1/accounting/invoices/:id/status` | InvoicesController | Production | Status change |
| POST | `/api/v1/accounting/invoices/:id/send` | InvoicesController | Production | Email to customer |
| POST | `/api/v1/accounting/invoices/:id/void` | InvoicesController | Production | Void invoice (admin only) |
| POST | `/api/v1/accounting/invoices/:id/remind` | InvoicesController | Production | Send payment reminder |
| GET | `/api/v1/accounting/invoices/:id/pdf` | InvoicesController | Production | Generate invoice PDF |
| GET | `/api/v1/accounting/invoices/aging` | InvoicesController | Production | Invoice aging report |
| GET | `/api/v1/accounting/invoices/:id/statement` | InvoicesController | Production | Statement PDF for customer |
| POST | `/api/v1/accounting/invoices/generate-from-load` | InvoicesController | Production | Auto-generate invoice from delivered load |

### Settlements (8 endpoints)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/settlements` | SettlementsController | Production | List |
| POST | `/api/v1/accounting/settlements` | SettlementsController | Production | Create |
| GET | `/api/v1/accounting/settlements/:id` | SettlementsController | Production | Detail |
| PATCH | `/api/v1/accounting/settlements/:id` | SettlementsController | Production | Update |
| PATCH | `/api/v1/accounting/settlements/:id/status` | SettlementsController | Production | Status change |
| POST | `/api/v1/accounting/settlements/:id/approve` | SettlementsController | Production | Approve settlement |
| GET | `/api/v1/accounting/settlements/payables-summary` | SettlementsController | Production | AP summary |
| POST | `/api/v1/accounting/settlements/generate-from-load` | SettlementsController | Production | Auto-generate from delivered load |

### Payments Received (7 endpoints)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/payments-received` | PaymentsReceivedController | Production | List customer payments |
| POST | `/api/v1/accounting/payments-received` | PaymentsReceivedController | Production | Record payment |
| GET | `/api/v1/accounting/payments-received/:id` | PaymentsReceivedController | Production | Detail |
| PATCH | `/api/v1/accounting/payments-received/:id` | PaymentsReceivedController | Production | Update |
| POST | `/api/v1/accounting/payments-received/:id/apply` | PaymentsReceivedController | Production | Apply to invoice(s) |
| POST | `/api/v1/accounting/payments-received/:id/bounce` | PaymentsReceivedController | Production | Mark bounced |
| POST | `/api/v1/accounting/payments-received/batch` | PaymentsReceivedController | Production | Batch process payments |

### Payments Made (8 endpoints)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/payments-made` | PaymentsMadeController | Production | List carrier payments |
| POST | `/api/v1/accounting/payments-made` | PaymentsMadeController | Production | Create carrier payment |
| GET | `/api/v1/accounting/payments-made/:id` | PaymentsMadeController | Production | Detail |
| PATCH | `/api/v1/accounting/payments-made/:id` | PaymentsMadeController | Production | Update |
| PATCH | `/api/v1/accounting/payments-made/:id/status` | PaymentsMadeController | Production | Status change (PENDING -> SENT -> CLEARED) |
| POST | `/api/v1/accounting/payments-made/:id/void` | PaymentsMadeController | Production | Void payment |
| GET | `/api/v1/accounting/payments-made/summary` | PaymentsMadeController | Production | Payment summary |
| POST | `/api/v1/accounting/payments-made/batch` | PaymentsMadeController | Production | Batch carrier payments |

### Chart of Accounts (6 endpoints)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/chart-of-accounts` | ChartOfAccountsController | Production | List with parent/child hierarchy |
| POST | `/api/v1/accounting/chart-of-accounts` | ChartOfAccountsController | Production | Create account |
| GET | `/api/v1/accounting/chart-of-accounts/:id` | ChartOfAccountsController | Production | Detail |
| PATCH | `/api/v1/accounting/chart-of-accounts/:id` | ChartOfAccountsController | Production | Update |
| DELETE | `/api/v1/accounting/chart-of-accounts/:id` | ChartOfAccountsController | Production | Delete (if no journal entries) |
| GET | `/api/v1/accounting/chart-of-accounts/tree` | ChartOfAccountsController | Production | Hierarchical tree view |

### Journal Entries (7 endpoints)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/journal-entries` | JournalEntriesController | Production | List (DRAFT -> POSTED flow) |
| POST | `/api/v1/accounting/journal-entries` | JournalEntriesController | Production | Create with debit/credit lines |
| GET | `/api/v1/accounting/journal-entries/:id` | JournalEntriesController | Production | Detail with lines |
| PATCH | `/api/v1/accounting/journal-entries/:id` | JournalEntriesController | Production | Update (draft only) |
| POST | `/api/v1/accounting/journal-entries/:id/post` | JournalEntriesController | Production | Post entry (debits must equal credits) |
| POST | `/api/v1/accounting/journal-entries/:id/reverse` | JournalEntriesController | Production | Reverse posted entry |
| DELETE | `/api/v1/accounting/journal-entries/:id` | JournalEntriesController | Production | Delete (draft only) |

### Reports (3 endpoints)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/accounting/reports/aging` | ReportsController | Production | Aging report (duplicates /accounting/aging) |
| GET | `/api/v1/accounting/reports/profit-loss` | ReportsController | Production | P&L statement |
| GET | `/api/v1/accounting/reports/balance-sheet` | ReportsController | Production | Balance sheet |

### QuickBooks (2 stub endpoints)
| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| POST | `/api/v1/accounting/quickbooks/sync-invoice` | QuickBooksController | Stub | Not implemented |
| POST | `/api/v1/accounting/quickbooks/sync-settlement` | QuickBooksController | Stub | Not implemented |

**Total: 54 endpoints across 10 controllers**

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

All components use design tokens, Tailwind 4, shadcn/ui. No hardcoded colors. Status badges use centralized status config objects.

---

## 6. Hooks

6 hooks exist in `lib/hooks/accounting/` — all use consistent `unwrap<T>()` pattern (best envelope handling of any P0 service):

| Hook | File | Endpoints | Status |
|------|------|-----------|--------|
| `useInvoices` | `use-invoices.ts` | GET `/accounting/invoices`, POST, PATCH status | Built |
| `useSettlements` | `use-settlements.ts` | GET `/accounting/settlements`, POST, PATCH | Built |
| `usePayments` | `use-payments.ts` | GET `/accounting/payments`, POST | Built |
| `usePayables` | `use-payables.ts` | GET `/accounting/payables` | Built |
| `useAccountingDashboard` | `use-accounting-dashboard.ts` | GET `/accounting/dashboard` | Built |
| `useAging` | `use-aging.ts` | GET `/accounting/reports/aging` | Built |

All mutations properly invalidate caches. `useAllocatePayment()` cross-invalidates invoices cache.

> **Note:** The 6 existing hooks bundle CRUD mutations via React Query `useMutation` inside the same file, so separate create/update/pay hooks are unnecessary.

---

## 7. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles — ACCOUNTING, ACCOUNTING_MANAGER, ADMIN, SUPER_ADMIN roles)
- TMS Core (delivered orders for invoice generation, delivered loads for settlement)
- CRM (customer billing info, payment terms, credit hold integration)
- Carrier Management (carrier payment terms, bank info for ACH)
- Communication (invoice emails, payment reminder emails)

**Depended on by:**
- Commission (revenue from paid invoices for commission calculations)
- Analytics (revenue trends, profitability reports)
- Dashboard Shell (accounting dashboard KPIs — totalAR, totalAP, DSO)
- Customer Portal (customers view their invoices)
- QuickBooks/ERP (future sync)

---

## 8. Data Model

### Invoice
```
Invoice {
  id                String (UUID)
  invoiceNumber     String (auto: INV-{YYYYMM}-{NNN})
  status            InvoiceStatus (DRAFT, SENT, VIEWED, PARTIAL, PAID, OVERDUE, VOID, DISPUTED)
  orderId           String (FK -> Order)
  customerId        String (FK -> Customer)
  subtotal          Decimal
  tax               Decimal (default: 0)
  total             Decimal
  amountPaid        Decimal (default: 0)
  amountDue         Decimal (total - amountPaid)
  currency          String (default: USD)
  dueDate           DateTime
  sentAt            DateTime?
  paidAt            DateTime?
  voidedAt          DateTime? (financial void — replaces deletedAt for invoices)
  voidedById        String? (FK -> User)
  voidReason        String?
  paymentTerms      String? (NET30, NET60, etc.)
  agingBucket       String? (CURRENT, 31-60, 61-90, 91-120, 120+)
  reminderCount     Int (default: 0)
  lastReminderDate  DateTime?
  collectionStatus  String?
  notes             String?
  internalNotes     String?
  daysOutstanding   Int?
  revenueAccountId  String? (FK -> ChartOfAccount)
  arAccountId       String? (FK -> ChartOfAccount)
  lineItems         InvoiceLineItem[]
  paymentsReceived  PaymentApplication[]
  createdById       String? (FK -> User)
  updatedById       String? (FK -> User)
  tenantId          String
  createdAt         DateTime
  updatedAt         DateTime
  quickbooksId      String? (QuickBooks sync)
  external_id       String?
  custom_fields     Json?
}
```

### InvoiceLineItem
```
InvoiceLineItem {
  id          String (UUID)
  invoiceId   String (FK -> Invoice)
  type        LineItemType (FREIGHT, ACCESSORIAL, ADJUSTMENT)
  description String
  quantity    Decimal
  unitPrice   Decimal
  amount      Decimal
  loadId      String? (FK -> Load)
  orderId     String? (FK -> Order)
  accountId   String? (FK -> ChartOfAccount)
  taxRate     Decimal?
  taxAmount   Decimal?
  sortOrder   Int
  tenantId    String
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

### Settlement
```
Settlement {
  id                 String (UUID)
  settlementNumber   String (auto: SET-{YYYYMM}-{NNN})
  status             SettlementStatus (PENDING, APPROVED, PROCESSING, PAID, DISPUTED, VOID)
  loadId             String (FK -> Load)
  carrierId          String (FK -> Carrier)
  grossAmount        Decimal
  deductionsTotal    Decimal
  quickPayFee        Decimal? (quickpay discount amount)
  netAmount          Decimal (grossAmount - deductionsTotal - quickPayFee)
  isQuickPay         Boolean (default: false)
  factoringCompanyId String? (FK -> FactoringCompany)
  approvedById       String? (FK -> User)
  approvedAt         DateTime?
  paidAt             DateTime?
  paymentMethod      String? (CHECK, ACH, WIRE)
  checkNumber        String?
  expenseAccountId   String? (FK -> ChartOfAccount)
  apAccountId        String? (FK -> ChartOfAccount)
  lineItems          SettlementLineItem[]
  tenantId           String
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
  quickbooksId       String?
  external_id        String?
}
```

### SettlementLineItem
```
SettlementLineItem {
  id            String (UUID)
  settlementId  String (FK -> Settlement)
  type          String (LINE_HAUL, FUEL_SURCHARGE, ACCESSORIAL, DEDUCTION, ADJUSTMENT)
  description   String
  amount        Decimal
  loadId        String? (FK -> Load)
  accountId     String? (FK -> ChartOfAccount)
  sortOrder     Int
  tenantId      String
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?
}
```

### PaymentReceived
```
PaymentReceived {
  id            String (UUID)
  customerId    String (FK -> Customer)
  amount        Decimal
  method        PaymentMethod (CHECK, ACH, WIRE, CREDIT_CARD, CASH)
  status        PaymentReceivedStatus (RECEIVED, APPLIED, PARTIALLY_APPLIED, BOUNCED, VOID)
  referenceNum  String?
  checkNumber   String?
  bankAccount   String?
  receivedDate  DateTime
  appliedAmount Decimal (default: 0)
  unappliedAmount Decimal (amount - appliedAmount)
  bouncedAt     DateTime?
  bouncedReason String?
  notes         String?
  recordedById  String (FK -> User)
  applications  PaymentApplication[]
  depositAccountId String? (FK -> ChartOfAccount)
  tenantId      String
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?
}
```

### PaymentMade
```
PaymentMade {
  id            String (UUID)
  carrierId     String (FK -> Carrier)
  settlementId  String? (FK -> Settlement)
  amount        Decimal
  method        PaymentMethod (CHECK, ACH, WIRE)
  status        PaymentMadeStatus (PENDING, SENT, CLEARED, VOID)
  referenceNum  String?
  checkNumber   String?
  bankAccount   String?
  sentDate      DateTime?
  clearedDate   DateTime?
  voidedAt      DateTime?
  voidReason    String?
  notes         String?
  createdById   String (FK -> User)
  cashAccountId String? (FK -> ChartOfAccount)
  tenantId      String
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?
}
```

### PaymentApplication
```
PaymentApplication {
  id                String (UUID)
  paymentReceivedId String (FK -> PaymentReceived)
  invoiceId         String (FK -> Invoice)
  amount            Decimal
  appliedAt         DateTime
  reversedAt        DateTime?
  reversedReason    String?
  appliedById       String (FK -> User)
  tenantId          String
  createdAt         DateTime
  deletedAt         DateTime?
}
```

### ChartOfAccount
```
ChartOfAccount {
  id            String (UUID)
  accountNumber String (unique per tenant)
  name          String
  type          AccountType (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
  subType       String?
  parentId      String? (FK -> ChartOfAccount, self-referencing hierarchy)
  isActive      Boolean (default: true)
  isSystemAccount Boolean (default: false — cannot be deleted)
  description   String?
  normalBalance String (DEBIT, CREDIT)
  currentBalance Decimal (default: 0)
  children      ChartOfAccount[]
  journalLines  JournalEntryLine[]
  tenantId      String
  createdAt     DateTime
  updatedAt     DateTime
}
```

### JournalEntry
```
JournalEntry {
  id            String (UUID)
  entryNumber   String (auto-generated)
  date          DateTime
  status        JournalEntryStatus (DRAFT, POSTED, REVERSED)
  description   String
  reference     String? (e.g., invoice number, settlement number)
  referenceType String? (INVOICE, SETTLEMENT, PAYMENT, MANUAL)
  referenceId   String? (FK to related entity)
  totalDebits   Decimal
  totalCredits  Decimal
  postedAt      DateTime?
  postedById    String? (FK -> User)
  reversedAt    DateTime?
  reversalEntryId String? (FK -> JournalEntry)
  lines         JournalEntryLine[]
  tenantId      String
  createdAt     DateTime
  updatedAt     DateTime
  deletedAt     DateTime?
}
```

### JournalEntryLine
```
JournalEntryLine {
  id             String (UUID)
  journalEntryId String (FK -> JournalEntry)
  accountId      String (FK -> ChartOfAccount)
  debit          Decimal (default: 0)
  credit         Decimal (default: 0)
  description    String?
  customerId     String? (FK -> Customer)
  carrierId      String? (FK -> Carrier)
  loadId         String? (FK -> Load)
  orderId        String? (FK -> Order)
  sortOrder      Int
  tenantId       String
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
}
```

### PaymentPlan (orphan — no controller/service)
```
PaymentPlan {
  id             String (UUID)
  customerId     String (FK -> Customer)
  invoiceId      String? (FK -> Invoice)
  totalAmount    Decimal
  downPayment    Decimal?
  numberOfInstallments Int
  frequency      String (WEEKLY, BIWEEKLY, MONTHLY)
  startDate      DateTime
  status         String (ACTIVE, COMPLETED, DEFAULTED, CANCELLED)
  installments   Json (array of installment objects)
  notes          String?
  tenantId       String
  createdAt      DateTime
  updatedAt      DateTime
}
```

**Total: 11 core accounting models, 200+ fields. Hub previously documented 3 models with ~43 fields (~15% accuracy).**

> **Cross-Domain Model Note (2026-03-09):** 11 core accounting models are documented above. Additionally, 4 cross-domain models in other services reference accounting entities: CarrierInvoiceSubmission (Carrier Portal -- carriers submit invoices via portal), FactoredPayment (Factoring -- factoring company payment records), PortalPayment (Customer Portal -- customer online payments), PortalSavedPaymentMethod (Customer Portal -- stored payment methods). These are owned by their respective services but interact with accounting workflows (e.g., PortalPayment creates a PaymentReceived record, CarrierInvoiceSubmission creates a Settlement). Total accounting-related models in schema: 15.

---

## 9. Business Rules

1. **Invoice Auto-Generation:** When an order status changes to DELIVERED, the system automatically creates a draft invoice using the order's rate data. The invoice is NOT sent automatically — dispatcher/accounting reviews and sends manually. Invoice number format: `INV-{YYYYMM}-{NNN}`.
2. **Settlement Auto-Generation:** When a load status changes to DELIVERED and the carrier payment amount is known, a draft settlement is created. Settlement number format: `SET-{YYYYMM}-{NNN}`. Settlement cannot be paid until invoice for the same order is marked SENT or PAID.
3. **Invoice Payment Terms:** Default NET30. Configurable per customer in CRM. Due date = invoice date + payment terms. Overdue invoices auto-trigger reminder emails at: 1 day overdue, 7 days, 30 days.
4. **Credit Hold Integration:** When an invoice is 60+ days overdue, CRM customer status auto-changes to HOLD. The change is logged to AuditLog. Must be manually released by ACCOUNTING role after payment.
5. **Margin Validation:** Invoice total must equal or exceed the minimum 15% margin threshold from the original quote. If the delivered total doesn't meet margin (e.g., detention charges consumed margin), accounting is alerted. No automatic block — manual review.
6. **Financial Record Retention:** Invoice, Settlement, and Payment records CANNOT be hard deleted (financial records, 7-year retention). Invoice uses `voidedAt` (correct pattern for financial records). Settlement, PaymentReceived, PaymentMade use soft delete (`deletedAt`) — only SUPER_ADMIN can soft-delete. All deletes logged to AuditLog.
7. **Double-Entry Accounting:** All financial transactions generate journal entries with balanced debit/credit lines. Journal entries must have totalDebits === totalCredits before posting. Posted entries cannot be edited — only reversed (creates a new offsetting entry).
8. **Payment Application:** Customer payments (PaymentReceived) are applied to invoices via PaymentApplication records (many-to-many allocation). A single payment can be split across multiple invoices. Invoice `amountPaid` and `amountDue` are recalculated on each application.
9. **QuickPay/Factoring:** Settlements support quickpay (early carrier payment with fee deduction) and factoring company assignment. QuickPay fee is deducted from grossAmount to calculate netAmount.
10. **Tax Handling:** Invoices include a tax field (JSON) for state-specific tax calculations. Current implementation: tax is informational (displayed but not calculated automatically). Automated tax calculation is P3 (integrate with Avalara or TaxJar).
11. **QuickBooks/Accounting Integration:** All invoices and settlements will sync to QuickBooks Online (P1 post-MVP). The `quickbooksId` field on Invoice and Settlement stores the QB record ID for idempotent sync.

---

## 10. Status States

### Invoice Status Machine
```
DRAFT -> SENT (manual send, creates PDF, emails customer)
SENT -> VIEWED (customer opens email, tracked via pixel)
SENT/VIEWED -> PARTIAL (partial payment received)
SENT/VIEWED/PARTIAL -> PAID (full payment recorded)
SENT/VIEWED -> OVERDUE (auto on due date pass)
OVERDUE -> PAID (payment recorded)
Any -> DISPUTED (customer disputes, requires resolution)
Any -> VOID (admin only, sets voidedAt — cannot be reversed)
```

### Settlement Status Machine
```
PENDING -> APPROVED (accounting review, sets approvedById + approvedAt)
APPROVED -> PROCESSING (payment initiated)
PROCESSING -> PAID (payment cleared, sets paidAt)
PENDING/APPROVED -> DISPUTED (carrier disputes amount)
DISPUTED -> APPROVED (after resolution)
Any -> VOID (admin only)
```

### Payment Received Status Machine
```
RECEIVED -> APPLIED (full amount allocated to invoices)
RECEIVED -> PARTIALLY_APPLIED (partial allocation)
RECEIVED/PARTIALLY_APPLIED/APPLIED -> BOUNCED (check bounced, reverses all applications)
Any -> VOID (admin only)
```

### Payment Made Status Machine
```
PENDING -> SENT (payment dispatched to carrier)
SENT -> CLEARED (payment confirmed received)
Any -> VOID (admin only)
```

### Journal Entry Status Machine
```
DRAFT -> POSTED (debits must equal credits, sets postedAt)
POSTED -> REVERSED (creates offsetting entry, sets reversedAt + reversalEntryId)
```

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| 4 cross-tenant bugs in PaymentReceived service | **P0 BUG** | **Open** | `applyToInvoice()`, `markBounced()`, `processBatch()` — invoice operations lack tenantId filter. Can apply payment to / read / modify another tenant's invoice. |
| 6/10 controllers missing RolesGuard | **P0 BUG** | **Open** | ChartOfAccounts, Settlements, PaymentsReceived, PaymentsMade, JournalEntries, Payments(batch) have JwtAuthGuard only — any authenticated user can approve settlements, post journal entries, etc. |
| Soft-delete queries not filtered | P1 BUG | Open | 7 models have `deletedAt` but only `reports.service.ts` filters `deletedAt: null`. All other services return soft-deleted records in lists and calculations. |
| Invoice Edit route missing | P1 | Open | No `/invoices/[id]/edit` page exists |
| Settlement Create route missing | P2 | Open | No `/settlements/new` page exists |
| `any` type assertion in invoice-form.tsx | P1 | Open | `eslint-disable` line for type assertion |
| `window.prompt()` for void reasons | P1 | Open | Should use ConfirmDialog component |
| QuickBooks sync not implemented | P2 | Open | Both endpoints are stubs |
| PaymentPlan model orphaned | P2 | Open | Prisma model exists but no controller or service |
| 0% frontend test coverage | P2 | Open | 5,244 LOC with no frontend tests |

**Resolved Issues (closed during PST-07 tribunal):**
- ~~Accounting Dashboard endpoint missing (QS-003)~~ — **FALSE**: `GET /accounting/dashboard` EXISTS in `accounting.controller.ts`, returns totalAR, totalAP, overdueInvoiceCount, DSO, revenueMTD, cashCollectedMTD. QS-003 reclassified to "Verify at runtime" under QS-008.
- ~~Aging Report endpoint missing~~ — **FALSE**: TWO aging endpoints exist (`/accounting/aging` + `/reports/aging`)
- ~~Invoices/stats Not Built~~ — **FALSE**: Dashboard endpoint returns all invoice stats needed
- ~~Soft delete not on Invoice, Settlement, Payment~~ — **PARTIALLY FALSE**: Settlement, PaymentReceived, PaymentMade all HAVE `deletedAt`. Invoice uses `voidedAt` (correct pattern for financial records). Real issue is queries not filtering `deletedAt: null`.
- ~~Dashboard uses mock/fallback data~~ — Hook calls real endpoint; needs runtime verification (QS-008)
- ~~Test coverage "1 test file"~~ — **UNDERSTATED**: 8 backend spec files exist
- ~~All accounting sidebar links return 404~~ — Links now route to existing pages
- ~~No frontend screens built~~ — 11 pages exist (audited 2026-03-07)
- ~~No hooks exist~~ — 6 hooks built in `lib/hooks/accounting/`

---

## 12. Tasks

### Completed (verified by PST-07 tribunal)
| Task ID | Title | Status |
|---------|-------|--------|
| ACC-101 | Fix sidebar nav links | **Done** |
| ACC-108 | Write accounting hooks | **Done** — 6 hooks exist |
| QS-003 | Build Accounting Dashboard Endpoint | **Reclassified** — endpoint EXISTS, moved to QS-008 (runtime verify) |

### Open (from tribunal findings)
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| ACC-201 | Fix 4 cross-tenant bugs in `payments-received.service.ts` (add tenantId to invoice ops in applyToInvoice, markBounced, processBatch) | M (1-2h) | **P0** |
| ACC-202 | Add RolesGuard to 6 controllers (chart-of-accounts, settlements, payments-received, payments-made, journal-entries, payments batch) | S (1h) | **P0** |
| ACC-203 | Add `deletedAt: null` filters to all services querying models with `deletedAt` field | M (2h) | P1 |
| ACC-204 | Replace `window.prompt()` with ConfirmDialog in invoices and payment detail pages | S (1h) | P1 |
| ACC-205 | Fix `any` type assertion in invoice-form.tsx | XS (30min) | P1 |
| ACC-102 | QA Invoices List page (8/10) | S (1h) | P1 |
| ACC-103 | QA Invoice Detail page (8/10) | S (1h) | P1 |
| ACC-104 | QA Invoice Create flow (7/10) | S (1h) | P1 |
| ACC-105 | QA Settlements List + Detail (7-8/10) | S (1h) | P1 |
| ACC-106 | QA Accounting Dashboard (7/10) — verify endpoint works at runtime (QS-008) | S (1h) | P1 |
| ACC-107 | QA Aging Report (8/10) | S (30m) | P1 |
| ACC-109 | Expand accounting tests (8 backend spec files exist, 0 frontend tests) | L (4-6h) | P1 |
| ACC-111 | Build Invoice Edit route (`/invoices/[id]/edit`) | M (3h) | P1 |
| ACC-112 | Build Settlement Create route (`/settlements/new`) | M (3h) | P2 |
| ACC-110 | QuickBooks integration (P1 post-MVP) | XL (16h) | P2 |
| ACC-206 | Implement PaymentPlan controller/service (Prisma model exists, no backend) | L (4-6h) | P2 |

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
| 3-model invoicing system | 11-model double-entry accounting platform | Massively exceeded plan |
| 17 endpoints across 1 controller | 54 endpoints across 10 controllers (3.2x more) | Massively exceeded plan |
| Dashboard endpoint "Not Built" | Dashboard endpoint EXISTS and returns 6 KPIs | Hub was wrong |
| Aging report "Not Built" | TWO aging endpoints exist | Hub was wrong |
| Auto-invoice on delivery | Backend logic written | Backend ahead |
| QuickBooks integration in scope | Deferred to P2 (2 stub endpoints) | Descoped |
| 12 screens planned | 11 exist (9 built, 2 not built) | Minor gap |
| "1 test file" | 8 backend spec files | Hub was understated |
| 10 hooks planned | 6 hooks built (bundled CRUD mutations) | Complete (different design) |
| 9 components planned | 18 components built | Exceeded plan |
| Hub score 7.0/10 | Verified 8.2/10 by PST-07 tribunal | Hub was outdated |

---

## 15. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| Invoice `status` transitions | Must follow state machine (no skipping) | "Invalid status transition" |
| Invoice `total` | Must be positive Decimal | "Invoice total must be positive" |
| Invoice `dueDate` | Must be after invoiceDate | "Due date must be after invoice date" |
| Settlement `netAmount` | Must equal grossAmount - deductionsTotal - quickPayFee | "Settlement net amount mismatch" |
| PaymentReceived `amount` | Must be positive | "Payment amount must be positive" |
| PaymentApplication `amount` | Cannot exceed invoice `amountDue` or payment `unappliedAmount` | "Application amount exceeds available balance" |
| JournalEntry post | totalDebits must equal totalCredits | "Journal entry is not balanced" |
| JournalEntry edit | Only DRAFT entries can be edited | "Cannot edit posted journal entry" |
| `orderId` for invoice | Order must be in DELIVERED or later status | "Cannot invoice an order that hasn't been delivered" |
| `loadId` for settlement | Load must be in DELIVERED status | "Cannot settle an undelivered load" |
| ChartOfAccount delete | Cannot delete if journal entry lines reference it | "Account has journal entries and cannot be deleted" |
