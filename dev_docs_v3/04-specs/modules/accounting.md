# Accounting Module API Spec

**Module:** `apps/api/src/modules/accounting/`
**Base path:** `/api/v1/`
**Controllers:** AccountingController, ChartOfAccountsController, InvoicesController, JournalEntriesController, PaymentsMadeController, PaymentsReceivedController, PaymentsController, QuickbooksController, ReportsController, SettlementsController

## Auth

All controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` with `@CurrentTenant()` for multi-tenant isolation and `@CurrentUser('id')` for audit trails.

**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN (varies by controller)

---

## AccountingController

**Path prefix:** `accounting`
**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/accounting/dashboard` | ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN | Get accounting dashboard |
| GET | `/accounting/aging` | ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN | Get aging report |

---

## ChartOfAccountsController

**Path prefix:** `chart-of-accounts`
**Auth:** JwtAuthGuard only (no RolesGuard at controller level)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/chart-of-accounts` | JWT only | List chart of accounts |
| POST | `/chart-of-accounts` | JWT only | Create account |
| GET | `/chart-of-accounts/trial-balance` | JWT only | Get trial balance |
| GET | `/chart-of-accounts/:id` | JWT only | Get account by ID |
| PUT | `/chart-of-accounts/:id` | JWT only | Update account |
| DELETE | `/chart-of-accounts/:id` | JWT only | Delete account |

---

## InvoicesController

**Path prefix:** `invoices`
**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/invoices` | (class-level roles) | List invoices |
| POST | `/invoices` | (class-level roles) | Create invoice |
| GET | `/invoices/:id` | (class-level roles) | Get invoice by ID |
| PUT | `/invoices/:id` | (class-level roles) | Update invoice |
| DELETE | `/invoices/:id` | (class-level roles) | Delete invoice |
| GET | `/invoices/:id/pdf` | (class-level roles) | Generate invoice PDF |
| POST | `/invoices/:id/send` | (class-level roles) | Send invoice via email |
| POST | `/invoices/:id/remind` | (class-level roles) | Send invoice reminder |
| POST | `/invoices/:id/void` | (class-level roles) | Void invoice |
| POST | `/invoices/generate-from-load` | (class-level roles) | Generate invoice from load |

**Query params (GET list):** `page`, `limit`, `status`, `customerId`, `dateFrom`, `dateTo`

**Special:** PDF endpoint uses `@Header('Content-Type', 'application/pdf')` and `@Header('Content-Disposition', ...)`. Uses `@CurrentUser('id')` for userId tracking on mutations.

---

## JournalEntriesController

**Path prefix:** `journal-entries`
**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/journal-entries` | (class-level roles) | List journal entries |
| POST | `/journal-entries` | (class-level roles) | Create journal entry |
| GET | `/journal-entries/account-ledger` | (class-level roles) | Get account ledger |
| GET | `/journal-entries/:id` | (class-level roles) | Get journal entry by ID |
| PUT | `/journal-entries/:id` | (class-level roles) | Update journal entry |
| DELETE | `/journal-entries/:id` | (class-level roles) | Delete journal entry |
| POST | `/journal-entries/:id/post` | (class-level roles) | Post journal entry |
| POST | `/journal-entries/:id/void` | (class-level roles) | Void journal entry |

**Query params (GET list):** `skip`, `take`, `status` (uses skip/take pagination, NOT page/limit)

**Known issue:** Uses `skip/take` pagination pattern instead of `page/limit`. Frontend hooks must adapt.

---

## PaymentsMadeController

**Path prefix:** `payments-made`
**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/payments-made` | (class-level roles) | List payments made |
| POST | `/payments-made` | (class-level roles) | Create payment made |
| GET | `/payments-made/:id` | (class-level roles) | Get payment made by ID |
| PUT | `/payments-made/:id` | (class-level roles) | Update payment made |
| DELETE | `/payments-made/:id` | (class-level roles) | Delete payment made |
| POST | `/payments-made/:id/sent` | (class-level roles) | Mark payment as sent |
| POST | `/payments-made/:id/cleared` | (class-level roles) | Mark payment as cleared |
| POST | `/payments-made/:id/void` | (class-level roles) | Void payment |

**Query params (GET list):** `page`, `limit`, `status`

---

## PaymentsReceivedController

**Path prefix:** `payments-received`
**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/payments-received` | (class-level roles) | List payments received |
| POST | `/payments-received` | (class-level roles) | Create payment received |
| GET | `/payments-received/:id` | (class-level roles) | Get payment received by ID |
| PUT | `/payments-received/:id` | (class-level roles) | Update payment received |
| DELETE | `/payments-received/:id` | (class-level roles) | Delete payment received |
| POST | `/payments-received/:id/apply` | (class-level roles) | Apply payment to invoices |
| POST | `/payments-received/:id/bounced` | (class-level roles) | Mark payment as bounced |
| POST | `/payments-received/batch` | (class-level roles) | Batch create payments |

**Query params (GET list):** `page`, `limit`, `status`

---

## PaymentsController

**Path prefix:** `payments`
**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/payments/batch` | (class-level roles) | Batch payments (delegates to PaymentsReceivedService) |

**Note:** Minimal controller — only one endpoint. Delegates to PaymentsReceivedService.

---

## QuickbooksController

**Path prefix:** `quickbooks`
**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/quickbooks/sync` | (class-level roles) | Sync with QuickBooks |
| GET | `/quickbooks/status` | (class-level roles) | Get QuickBooks sync status |

**Known issue:** Stub implementation — not yet functional.

---

## ReportsController

**Path prefix:** `reports`
**Roles:** ADMIN, ACCOUNTING, MANAGER

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/reports/revenue` | ADMIN, ACCOUNTING, MANAGER | Revenue report |
| GET | `/reports/aging` | ADMIN, ACCOUNTING, MANAGER | Aging report |
| GET | `/reports/payables` | ADMIN, ACCOUNTING, MANAGER | Payables report |

---

## SettlementsController

**Path prefix:** `settlements`
**Roles:** ADMIN, ACCOUNTING, ACCOUNTING_MANAGER, MANAGER, SUPER_ADMIN

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/settlements` | (class-level roles) | List settlements |
| POST | `/settlements` | (class-level roles) | Create settlement |
| GET | `/settlements/:id` | (class-level roles) | Get settlement by ID |
| PUT | `/settlements/:id` | (class-level roles) | Update settlement |
| DELETE | `/settlements/:id` | (class-level roles) | Delete settlement |
| POST | `/settlements/:id/approve` | (class-level roles) | Approve settlement |
| POST | `/settlements/:id/void` | (class-level roles) | Void settlement |
| POST | `/settlements/generate-from-load` | (class-level roles) | Generate settlement from load |

**Query params (GET list):** `page`, `limit`, `status`, `carrierId`

---

## Known Issues

- QuickBooks integration is a stub (not implemented)
- Journal entries use `skip/take` pagination instead of standard `page/limit`
- Dashboard endpoint (`GET /accounting/dashboard`) listed as missing in QS-003 task
