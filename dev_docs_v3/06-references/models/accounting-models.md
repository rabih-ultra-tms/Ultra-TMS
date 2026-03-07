# Accounting Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Invoice | Customer invoices (AR) | Company, Order, Load, InvoiceLineItem |
| InvoiceLineItem | Line items on invoices | Invoice, ChartOfAccount |
| PaymentReceived | Customer payments (AR) | Company, PaymentApplication |
| PaymentMade | Outgoing payments (AP) | Carrier, ChartOfAccount |
| PaymentApplication | Payment-to-invoice allocation | PaymentReceived, Invoice |
| ChartOfAccount | GL account structure | Self-referential (parent/child), JournalEntryLine |
| JournalEntry | Double-entry journal entries | JournalEntryLine |
| JournalEntryLine | Debit/credit lines | JournalEntry, ChartOfAccount |
| PaymentPlan | Customer payment plans | Company |
| CollectionActivity | AR collection tracking | Company, Invoice |

## Invoice

Customer invoice — accounts receivable.

| Field | Type | Notes |
|-------|------|-------|
| invoiceNumber | String | VarChar(50), unique per tenant |
| companyId | String | FK to Company (customer) |
| orderId | String? | FK to Order |
| loadId | String? | FK to Load |
| invoiceDate | DateTime | |
| dueDate | DateTime | |
| subtotal | Decimal | Decimal(12,2) |
| taxAmount | Decimal | @default(0), Decimal(12,2) |
| totalAmount | Decimal | Decimal(12,2) |
| amountPaid | Decimal | @default(0), Decimal(12,2) |
| balanceDue | Decimal | Decimal(12,2) |
| currency | String | @default("USD") |
| status | String | @default("DRAFT") — DRAFT, SENT, PARTIAL, PAID, VOID |
| paymentTerms | String? | NET30, NET60, etc. |
| daysOutstanding | Int? | Calculated |
| agingBucket | String? | CURRENT, 30, 60, 90, 120+ |
| collectionStatus | String? | |
| revenueAccountId | String? | FK to ChartOfAccount |
| arAccountId | String? | FK to ChartOfAccount |
| quickbooksId | String? | QB integration |

**Indexes:** `[companyId]`, `[status]`, `[dueDate]`, `[invoiceDate]`, `[loadId]`, `[orderId]`, `[tenantId, status, dueDate]`

## InvoiceLineItem

| Field | Type | Notes |
|-------|------|-------|
| invoiceId | String | FK to Invoice |
| lineNumber | Int | Sequence |
| description | String | VarChar(500) |
| itemType | String? | VarChar(50) — FREIGHT, ACCESSORIAL, FUEL |
| quantity | Decimal | @default(1) |
| unitPrice | Decimal | Decimal(12,2) |
| amount | Decimal | Decimal(12,2) |
| revenueAccountId | String? | FK to ChartOfAccount |

## ChartOfAccount

General ledger account hierarchy.

| Field | Type | Notes |
|-------|------|-------|
| accountNumber | String | VarChar(20), unique per tenant |
| accountName | String | VarChar(255) |
| accountType | String | VarChar(50) — ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| accountSubType | String? | VarChar(50) |
| parentAccountId | String? | Self-referential FK |
| normalBalance | String | VarChar(10) — DEBIT, CREDIT |
| isActive | Boolean | @default(true) |
| isSystemAccount | Boolean | @default(false) — cannot be deleted |
| balance | Decimal | @default(0), Decimal(14,2) |
| quickbooksId | String? | QB integration |

**Self-relation:** parentAccount / childAccounts

## JournalEntry

Double-entry bookkeeping entries.

| Field | Type | Notes |
|-------|------|-------|
| entryNumber | String | VarChar(50), unique per tenant |
| entryDate | DateTime | |
| description | String? | |
| referenceType | String? | VarChar(50) — INVOICE, SETTLEMENT, PAYMENT |
| referenceId | String? | Polymorphic FK |
| status | String | @default("DRAFT") — DRAFT, POSTED, VOIDED |
| totalDebit | Decimal | Decimal(14,2) — must equal totalCredit |
| totalCredit | Decimal | Decimal(14,2) |
| postedById | String? | |
| postedAt | DateTime? | |

## PaymentReceived

Customer payment (cash receipt).

| Field | Type | Notes |
|-------|------|-------|
| companyId | String | FK to Company |
| paymentNumber | String | VarChar(50) |
| paymentDate | DateTime | |
| amount | Decimal | Decimal(12,2) |
| paymentMethod | String? | VarChar(50) — CHECK, ACH, WIRE |
| checkNumber | String? | |
| bankAccountId | String? | FK to ChartOfAccount |
| status | String | PENDING, APPLIED, VOIDED |
| unappliedAmount | Decimal | Remaining |

**Relations:** PaymentApplication[] (links to invoices)

## PaymentMade

Outgoing payment to carrier (AP).

| Field | Type | Notes |
|-------|------|-------|
| carrierId | String? | FK to Carrier |
| paymentNumber | String | VarChar(50) |
| paymentDate | DateTime | |
| amount | Decimal | Decimal(12,2) |
| paymentMethod | String? | CHECK, ACH, WIRE |
| bankAccountId | String? | FK to ChartOfAccount |
| status | String | PENDING, SENT, CLEARED, VOIDED |
