# Accounting Components

**Path:** `apps/web/components/accounting/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| AccDashboardStats | `acc-dashboard-stats.tsx` | 101 | Dashboard stat cards for accounting overview (revenue, outstanding, etc.) |
| AccRecentInvoices | `acc-recent-invoices.tsx` | 125 | Recent invoices list widget for the accounting dashboard |
| AgingReport | `aging-report.tsx` | 242 | Accounts receivable aging report with 30/60/90/120+ day buckets |
| InvoiceDetailCard | `invoice-detail-card.tsx` | 368 | Full invoice detail view with line items, totals, and payment history |
| InvoiceFilters | `invoice-filters.tsx` | 139 | Filter bar for invoices list (status, date range, customer) |
| InvoiceForm | `invoice-form.tsx` | 406 | Create/edit invoice form with line items, tax, and payment terms |
| InvoiceStatusBadge | `invoice-status-badge.tsx` | 30 | Status badge for invoice states (Draft, Sent, Paid, Overdue, etc.) |
| InvoicesTable | `invoices-table.tsx` | 175 | Data table for invoices list with sorting and pagination |
| PayableFilters | `payable-filters.tsx` | 135 | Filter bar for accounts payable list |
| PayableStatusBadge | `payable-status-badge.tsx` | 30 | Status badge for payable states |
| PayablesTable | `payables-table.tsx` | 143 | Data table for accounts payable |
| PaymentAllocation | `payment-allocation.tsx` | 245 | Payment allocation dialog for applying payments to invoices |
| PaymentFilters | `payment-filters.tsx` | 161 | Filter bar for payments list |
| PaymentStatusBadge | `payment-status-badge.tsx` | 30 | Status badge for payment states |
| PaymentsTable | `payments-table.tsx` | 169 | Data table for payments list |
| SettlementFilters | `settlement-filters.tsx` | 135 | Filter bar for carrier settlements |
| SettlementStatusBadge | `settlement-status-badge.tsx` | 30 | Status badge for settlement states |
| SettlementTable | `settlement-table.tsx` | 137 | Data table for carrier settlements |

**Total:** 18 files, ~2,851 LOC

## Usage Patterns

Used exclusively in `(dashboard)/accounting/` route group:
- `/accounting` - Dashboard with `AccDashboardStats` + `AccRecentInvoices`
- `/accounting/invoices` - `InvoicesTable` + `InvoiceFilters`
- `/accounting/invoices/[id]` - `InvoiceDetailCard`
- `/accounting/invoices/new` - `InvoiceForm`
- `/accounting/payables` - `PayablesTable` + `PayableFilters`
- `/accounting/payments` - `PaymentsTable` + `PaymentFilters`
- `/accounting/settlements` - `SettlementTable` + `SettlementFilters`
- `/accounting/aging` - `AgingReport`

## Dependencies

- `@/components/ui/` (shadcn: Badge, Card, Table, Select, Input, Button)
- `@/lib/hooks/` (accounting hooks for data fetching)
- Status badges are standalone 30-LOC components using CVA or simple conditional classes
- `InvoiceForm` depends on React Hook Form + Zod validation
