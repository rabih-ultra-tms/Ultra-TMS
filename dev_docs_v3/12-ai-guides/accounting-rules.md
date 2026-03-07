# Accounting Domain Rules

> AI Dev Guide | Source: `dev_docs_v3/01-services/p0-mvp/07-accounting.md`

---

## Invoice Workflow

### Invoice Auto-Generation

- When an order status changes to DELIVERED, system auto-creates a draft invoice using order rate data.
- Invoice is NOT sent automatically -- dispatcher/accounting reviews and sends manually.
- Invoice number format: `INV-{YYYYMM}-{NNN}`

### Invoice Status Machine

```
DRAFT -> SENT (manual send, creates PDF, emails customer)
SENT -> VIEWED (customer opens email, tracked via pixel)
SENT/VIEWED -> PARTIAL (partial payment received)
SENT/VIEWED/PARTIAL -> PAID (full payment recorded)
SENT/VIEWED -> OVERDUE (auto on due date pass)
OVERDUE -> PAID (payment recorded)
Any -> DISPUTED (customer disputes, requires resolution)
Any -> VOID (admin only, cannot be reversed)
```

### Payment Terms

| Code | Days | Description |
|------|------|-------------|
| NET15 | 15 | Due in 15 days |
| NET21 | 21 | Due in 21 days |
| NET30 | 30 | Due in 30 days (default) |
| NET45 | 45 | Due in 45 days |
| COD | 0 | Cash on delivery |
| PREPAID | -1 | Payment before service |

- Due date = invoice date + payment terms.
- Overdue invoices auto-trigger reminder emails at: 1 day, 7 days, 30 days.

## Settlement Workflow

### Settlement Auto-Generation

- When a load status changes to DELIVERED and carrier payment amount is known, a draft settlement is created.
- Settlement number format: `SET-{YYYYMM}-{NNN}`
- Settlement cannot be paid until invoice for same order is marked SENT or PAID.

### Settlement Status Machine

```
PENDING -> APPROVED (accounting review) -> PROCESSING (payment initiated) -> PAID
PENDING/APPROVED -> DISPUTED (carrier disputes amount)
DISPUTED -> APPROVED (after resolution)
```

## AR/AP Integration

- **Accounts Receivable (AR):** Customer invoices. Track: total outstanding, aging buckets (30/60/90/90+).
- **Accounts Payable (AP):** Carrier settlements. Track: total owed, payment schedule.

## Credit Hold Integration

- When invoice is 60+ days overdue, CRM customer status auto-changes to HOLD.
- Change logged to AuditLog.
- Must be manually released by ACCOUNTING role after payment.

## Margin Validation

- Invoice total must equal or exceed 15% margin threshold from original quote.
- If delivered total doesn't meet margin (e.g., detention consumed margin), accounting is alerted.
- No automatic block -- manual review.

## Financial Record Retention

- Invoice, Settlement, and Payment records CANNOT be hard deleted.
- 7-year retention. Only SUPER_ADMIN can soft-delete financial records.
- All deletes logged to AuditLog.

## Tax Handling

- Invoices include tax field (JSON) for state-specific tax calculations.
- Current: tax is informational (displayed but not calculated automatically).
- Automated tax calculation is P3 (integrate with Avalara or TaxJar).

## QuickBooks Integration (P1 Post-MVP)

- `external_id` field on Invoice and Settlement stores QB record ID.
- Used for idempotent sync. Not yet implemented.

## Validation Rules

| Field | Rule |
|-------|------|
| Invoice `total` | Must be positive Decimal |
| `dueDate` | Must be after invoice date |
| Settlement `totalAmount` | Must match sum of lineHaul + fuelSurcharge + accessorials |
| Payment `amount` | Cannot exceed remaining amountDue |
| Invoice creation | Order must be in DELIVERED or later status |
| Settlement creation | Load must be in DELIVERED status |

## API Endpoints

| Method | Path | Status |
|--------|------|--------|
| GET/POST | `/api/v1/accounting/invoices` | Partial |
| GET/PUT | `/api/v1/accounting/invoices/:id` | Partial |
| PATCH | `/api/v1/accounting/invoices/:id/status` | Partial |
| POST | `/api/v1/accounting/invoices/:id/send` | Partial |
| POST | `/api/v1/accounting/invoices/:id/payment` | Partial |
| GET | `/api/v1/accounting/invoices/stats` | **Not Built** (QS-003) |
| GET/POST | `/api/v1/accounting/settlements` | Partial |
| GET | `/api/v1/accounting/settlements/:id` | Partial |
| PATCH | `/api/v1/accounting/settlements/:id/status` | Partial |
| POST | `/api/v1/accounting/settlements/:id/pay` | Partial |
| GET/POST | `/api/v1/accounting/payments` | Partial |
| GET | `/api/v1/accounting/dashboard` | **Not Built** (QS-003) |
| GET | `/api/v1/accounting/reports/aging` | **Not Built** |

## Critical Status

- Frontend: 0% built -- all sidebar links return 404
- Backend: partially built -- dashboard and aging endpoints missing (QS-003)
- No hooks, no tests, no components exist
