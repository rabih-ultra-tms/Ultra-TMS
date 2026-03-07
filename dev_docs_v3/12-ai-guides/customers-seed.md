# Customers Seed Data Guide

> AI Dev Guide | Source: `dev_docs/11-ai-dev/90-seed-data-fixtures.md`

---

## Overview

Seed 30 customers across credit statuses, payment terms, and industries to test CRM, sales, and accounting workflows.

## Required Fields

```typescript
{
  name: string,              // Company name
  code: string,              // 2-20 uppercase alphanumeric (e.g., "ABCMFG")
  status: CustomerStatus,    // ACTIVE | INACTIVE | PROSPECT
  creditStatus: CreditStatus,// PENDING | APPROVED | HOLD | COD | PREPAID | DENIED
  creditLimit: number,       // In dollars (e.g., 50000)
  currentBalance: number,    // Outstanding AR (e.g., 12500)
  paymentTerms: number,      // Days (15, 21, 30, 45)
  email: string,
  billingAddress: Address,
  tenantId: string
}
```

## Seed Data Distribution

| Credit Status | Count | Purpose |
|---------------|-------|---------|
| APPROVED | 20 | Normal order creation |
| HOLD | 3 | Credit block testing (over limit or overdue) |
| COD | 3 | Cash-on-delivery flows |
| PREPAID | 1 | Prepayment flows |
| PENDING | 2 | New customer onboarding |
| DENIED | 1 | Denied credit testing |

## Named Customers (Specific Scenarios)

```typescript
// 1. Standard customer (happy path)
{ name: "ABC Manufacturing", code: "ABCMFG", creditStatus: "APPROVED",
  creditLimit: 50000, currentBalance: 12500, paymentTerms: 30 }

// 2. High-value customer
{ name: "Tech Distributors Inc", code: "TECHDIST", creditStatus: "APPROVED",
  creditLimit: 100000, currentBalance: 45000, paymentTerms: 15 }

// 3. Refrigerated shipper
{ name: "Food Service Supply Co", code: "FOODSVC", creditStatus: "APPROVED",
  requiresRefrigerated: true, temperatureRequirements: { min: 34, max: 40 } }

// 4. Credit hold (over limit)
{ name: "Struggling Retailer", code: "STRRET", creditStatus: "HOLD",
  creditLimit: 25000, currentBalance: 28000,
  creditHoldReason: "Over credit limit, past due invoices" }

// 5. COD customer
{ name: "Cash Only Corp", code: "CASHONLY", creditStatus: "COD",
  creditLimit: 0, currentBalance: 0, paymentTerms: 0 }
```

## Contacts Per Customer

Seed 2-4 contacts per customer:
- 1 PRIMARY contact (required for most flows)
- 1 BILLING contact (for invoice emails)
- 0-1 OPERATIONS contact
- 0-1 OTHER contact

## Sales Rep Assignment

- 50% assigned to `user_sales_1` (James Wilson)
- 50% assigned to `user_sales_2` (Lisa Brown)
- This enables commission testing per rep.

## Multi-Tenant Distribution

- 75% to `tenant_freight_masters`
- 25% to `tenant_swift_logistics`

## Test Scenarios Enabled

| Scenario | Customer |
|----------|----------|
| Normal order flow | APPROVED customers |
| Credit block | HOLD customer (over limit) |
| COD order | COD customer |
| Invoice aging | Customer with past-due balance |
| Reefer requirement | Food Service Supply (temperature) |
| Commission split | Different sales rep assignments |
| Multi-tenant | Customers across tenants |
