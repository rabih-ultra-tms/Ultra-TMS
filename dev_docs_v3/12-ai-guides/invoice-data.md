# Invoice Data Dictionary

> AI Dev Guide | Source: Prisma schema + `dev_docs_v3/01-services/p0-mvp/07-accounting.md`

---

## Invoice Entity

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| id | String (UUID) | Auto | - | Generated | Primary key |
| invoiceNumber | String | Auto | Unique per tenant | Generated | `INV-{YYYYMM}-{NNN}` |
| status | InvoiceStatus | Yes | Enum | DRAFT | See status machine |
| orderId | String | Yes | FK -> Order | - | Source order |
| customerId | String | Yes | FK -> Customer | - | Billed customer |
| subtotal | Decimal | Yes | Positive | - | Pre-tax total |
| tax | Decimal | No | Min 0 | 0 | Tax amount |
| total | Decimal | Yes | Positive | - | subtotal + tax |
| amountPaid | Decimal | No | Min 0 | 0 | Sum of payments received |
| amountDue | Decimal | Computed | - | total - amountPaid | Outstanding balance |
| dueDate | DateTime | Yes | After invoice date | - | Payment due date |
| sentAt | DateTime | No | - | null | When sent to customer |
| paidAt | DateTime | No | - | null | When fully paid |
| tenantId | String | Yes | FK -> Tenant | - | Tenant isolation |
| external_id | String | No | - | null | QuickBooks sync ID |
| custom_fields | Json | No | - | null | Custom attributes |
| createdAt | DateTime | Auto | - | now() | Created |
| updatedAt | DateTime | Auto | - | auto | Updated |
| deletedAt | DateTime | No | - | null | Soft delete (SUPER_ADMIN only) |

## Invoice Status Machine

```
DRAFT -> SENT (manual send, creates PDF, emails customer)
SENT -> VIEWED (customer opens email, tracked via pixel)
SENT/VIEWED -> PARTIAL (partial payment received)
SENT/VIEWED/PARTIAL -> PAID (full payment recorded)
SENT/VIEWED -> OVERDUE (auto on due date pass)
OVERDUE -> PAID (payment recorded)
Any -> DISPUTED (customer disputes)
Any -> VOID (admin only, cannot be reversed)
```

## InvoiceLineItem Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID) | Auto | Primary key |
| invoiceId | String | Yes | FK -> Invoice |
| description | String | Yes | Line item description |
| quantity | Int | Yes | Quantity |
| unitRate | Decimal | Yes | Rate per unit |
| totalAmount | Decimal | Yes | quantity * unitRate |
| type | String | Yes | LINE_HAUL, FUEL_SURCHARGE, DETENTION, ACCESSORIAL |

## Payment Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID) | Auto | Primary key |
| invoiceId | String | Yes | FK -> Invoice |
| amount | Decimal | Yes | Payment amount (cannot exceed amountDue) |
| method | PaymentMethod | Yes | CHECK, ACH, WIRE, CREDIT_CARD, CASH |
| referenceNum | String | No | Check number, ACH ref, etc. |
| notes | String | No | Payment notes |
| receivedAt | DateTime | Yes | When payment was received |
| recordedBy | String | Yes | FK -> User who recorded |
| tenantId | String | Yes | FK -> Tenant |
| createdAt | DateTime | Auto | Created |

## Settlement Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID) | Auto | Primary key |
| settlementNumber | String | Auto | `SET-{YYYYMM}-{NNN}` |
| status | SettlementStatus | Yes | PENDING, APPROVED, PROCESSING, PAID, DISPUTED |
| loadId | String | Yes | FK -> Load |
| carrierId | String | Yes | FK -> Carrier |
| lineHaul | Decimal | Yes | Line haul amount |
| fuelSurcharge | Decimal | No | Fuel surcharge |
| accessorials | Decimal | No | Accessorial charges |
| totalAmount | Decimal | Yes | Must equal sum of line items |
| paidAt | DateTime | No | When paid |
| paymentMethod | String | No | CHECK, ACH, WIRE |
| checkNumber | String | No | Check number if applicable |
| tenantId | String | Yes | FK -> Tenant |
| external_id | String | No | QuickBooks sync ID |

## Aging Buckets

| Bucket | Days |
|--------|------|
| Current | 0-30 days |
| 30 Days | 31-60 days |
| 60 Days | 61-90 days |
| 90+ Days | > 90 days |

- At 60+ days overdue: auto-trigger credit hold on customer.
- Aging report endpoint: `GET /accounting/reports/aging` (not yet built).

## Relationships

```
Invoice
  |-- Order (many:1)
  |-- Customer (many:1)
  |-- InvoiceLineItem[] (1:many)
  |-- Payment[] (1:many)

Settlement
  |-- Load (many:1)
  |-- Carrier (many:1)
```

## Financial Record Rules

- CANNOT be hard deleted (7-year retention).
- Only SUPER_ADMIN can soft-delete.
- All deletes logged to AuditLog.
