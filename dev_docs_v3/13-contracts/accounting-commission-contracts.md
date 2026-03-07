# Accounting & Commission Screen-to-API Contracts

> Verified from hook source code on 2026-03-07

---

## Accounting Dashboard

**Source:** `apps/web/lib/hooks/accounting/use-accounting-dashboard.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useAccountingDashboard` | GET | `/accounting/dashboard` | -- | `AccountingDashboardData` (unwrapped) |
| `useRecentInvoices` | GET | `/invoices?limit=N&sortBy=createdAt&sortOrder=desc` | URLSearchParams | `Invoice[]` (from `data` array) |

**Note:** The `/accounting/dashboard` endpoint may not exist yet (QS-003 task).

### Dashboard Cache Keys

```typescript
["accounting-dashboard"]
["accounting-dashboard", "recent-invoices", limit]
```

---

## Invoices

**Source:** `apps/web/lib/hooks/accounting/use-invoices.ts`

**IMPORTANT:** Invoices use `/invoices` endpoint, NOT `/accounting/invoices`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useInvoices` | GET | `/invoices?page=&limit=&search=&status=&customerId=&fromDate=&toDate=&sortBy=&sortOrder=` | URLSearchParams | `{ data: Invoice[], pagination }` (unwrapped) |
| `useInvoice` | GET | `/invoices/:id` | -- | `Invoice` (unwrapped) |
| `useInvoiceStats` | GET | `/invoices/stats` | -- | `InvoiceStats` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateInvoice` | POST | `/invoices` | `CreateInvoicePayload` | `Invoice` (unwrapped) |
| `useUpdateInvoice` | PUT | `/invoices/:id` | `Partial<CreateInvoicePayload>` | `Invoice` (unwrapped) |
| `useDeleteInvoice` | DELETE | `/invoices/:id` | -- | success |
| `useSendInvoice` | POST | `/invoices/:id/send` | -- | `Invoice` (unwrapped) |
| `useVoidInvoice` | POST | `/invoices/:id/void` | `{ reason? }` | `Invoice` (unwrapped) |
| `useUpdateInvoiceStatus` | PATCH | `/invoices/:id/status` | `{ status }` | `Invoice` (unwrapped) |

### Invoice Cache Keys

```typescript
["invoices", "list", params]
["invoices", "detail", id]
["invoices", "stats"]
```

---

## Settlements

**Source:** `apps/web/lib/hooks/accounting/use-settlements.ts`

**IMPORTANT:** Settlements use `/settlements` endpoint, NOT `/accounting/settlements`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useSettlements` | GET | `/settlements?page=&limit=&search=&status=&carrierId=&fromDate=&toDate=` | URLSearchParams | `{ data: Settlement[], pagination }` (unwrapped) |
| `useSettlement` | GET | `/settlements/:id` | -- | `Settlement` (unwrapped) |
| `useSettlementStats` | GET | `/settlements/stats` | -- | `SettlementStats` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateSettlement` | POST | `/settlements` | `CreateSettlementPayload` | `Settlement` (unwrapped) |
| `useUpdateSettlement` | PUT | `/settlements/:id` | `Partial<CreateSettlementPayload>` | `Settlement` (unwrapped) |
| `useDeleteSettlement` | DELETE | `/settlements/:id` | -- | success |
| `useApproveSettlement` | POST | `/settlements/:id/approve` | -- | `Settlement` (unwrapped) |
| `useProcessSettlement` | POST | `/settlements/:id/process` | `{ paymentMethod?, referenceNumber? }` | `Settlement` (unwrapped) |

### Settlement Cache Keys

```typescript
["settlements", "list", params]
["settlements", "detail", id]
["settlements", "stats"]
```

---

## Payments Received

**Source:** `apps/web/lib/hooks/accounting/use-payments.ts`

**IMPORTANT:** Payments received use `/payments-received` endpoint, NOT `/payments` or `/accounting/payments`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `usePayments` | GET | `/payments-received?page=&limit=&search=&status=&customerId=&fromDate=&toDate=` | URLSearchParams | `{ data: Payment[], pagination }` (unwrapped) |
| `usePayment` | GET | `/payments-received/:id` | -- | `Payment` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreatePayment` | POST | `/payments-received` | `CreatePaymentPayload` | `Payment` (unwrapped) |
| `useUpdatePayment` | PUT | `/payments-received/:id` | `Partial<CreatePaymentPayload>` | `Payment` (unwrapped) |
| `useDeletePayment` | DELETE | `/payments-received/:id` | -- | success |
| `useAllocatePayment` | POST | `/payments-received/:id/allocate` | `{ invoiceId, amount }` | `Payment` (unwrapped) |

### Payment Cache Keys

```typescript
["payments", "list", params]
["payments", "detail", id]
```

---

## Payments Made (Payables)

**Source:** `apps/web/lib/hooks/accounting/use-payables.ts`

**IMPORTANT:** Payables use `/payments-made` endpoint, NOT `/payables` or `/accounting/payables`.

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `usePayables` | GET | `/payments-made?page=&limit=&search=&status=&carrierId=&fromDate=&toDate=` | URLSearchParams | `{ data: Payable[], pagination }` (unwrapped) |
| `usePayable` | GET | `/payments-made/:id` | -- | `Payable` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreatePayable` | POST | `/payments-made` | `CreatePayablePayload` | `Payable` (unwrapped) |
| `useUpdatePayable` | PUT | `/payments-made/:id` | `Partial<CreatePayablePayload>` | `Payable` (unwrapped) |
| `useDeletePayable` | DELETE | `/payments-made/:id` | -- | success |
| `useProcessPayable` | POST | `/payments-made/:id/process` | `{ paymentMethod?, referenceNumber? }` | `Payable` (unwrapped) |

### Payable Cache Keys

```typescript
["payables", "list", params]
["payables", "detail", id]
```

---

## Aging Report

**Source:** `apps/web/lib/hooks/accounting/use-aging.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useAgingReport` | GET | `/accounting/aging?type=&asOfDate=` | URLSearchParams | `AgingReport` (unwrapped) |

### Aging Cache Keys

```typescript
["aging", type, asOfDate]
```

---

## Commission Dashboard

**Source:** `apps/web/lib/hooks/commissions/use-commission-dashboard.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCommissionDashboard` | GET | `/commissions/dashboard` | -- | `CommissionDashboardData` (unwrapped) |

### Commission Dashboard Cache Keys

```typescript
["commission-dashboard"]
```

---

## Commission Plans

**Source:** `apps/web/lib/hooks/commissions/use-plans.ts`

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `usePlans` | GET | `/commissions/plans?page=&limit=&search=&status=` | URLSearchParams | `{ data: CommissionPlan[], pagination }` (unwrapped) |
| `usePlan` | GET | `/commissions/plans/:id` | -- | `CommissionPlan` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreatePlan` | POST | `/commissions/plans` | `CreatePlanPayload` | `CommissionPlan` (unwrapped) |
| `useUpdatePlan` | PUT | `/commissions/plans/:id` | `Partial<CreatePlanPayload>` | `CommissionPlan` (unwrapped) |
| `useDeletePlan` | DELETE | `/commissions/plans/:id` | -- | success |
| `useActivatePlan` | POST | `/commissions/plans/:id/activate` | -- | `CommissionPlan` (unwrapped) |

### Plan Cache Keys

```typescript
["commission-plans", "list", params]
["commission-plans", "detail", id]
```

---

## Commission Transactions

**Source:** `apps/web/lib/hooks/commissions/use-transactions.ts`

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useTransactions` | GET | `/commissions/transactions?page=&limit=&search=&status=&repId=&fromDate=&toDate=` | URLSearchParams | `{ data: CommissionTransaction[], pagination }` (unwrapped) |
| `useTransaction` | GET | `/commissions/transactions/:id` | -- | `CommissionTransaction` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useApproveTransaction` | POST | `/commissions/transactions/:id/approve` | -- | `CommissionTransaction` (unwrapped) |
| `useVoidTransaction` | POST | `/commissions/transactions/:id/void` | `{ reason? }` | `CommissionTransaction` (unwrapped) |

### Transaction Cache Keys

```typescript
["commission-transactions", "list", params]
["commission-transactions", "detail", id]
```

---

## Commission Reps

**Source:** `apps/web/lib/hooks/commissions/use-reps.ts`

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useReps` | GET | `/commissions/reps?page=&limit=&search=` | URLSearchParams | `{ data: CommissionRep[], pagination }` (unwrapped) |
| `useRep` | GET | `/commissions/reps/:id` | -- | `CommissionRep` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCreateRep` | POST | `/commissions/reps` | `CreateRepPayload` | `CommissionRep` (unwrapped) |
| `useUpdateRep` | PUT | `/commissions/reps/:id` | `Partial<CreateRepPayload>` | `CommissionRep` (unwrapped) |
| `useDeleteRep` | DELETE | `/commissions/reps/:id` | -- | success |
| `useAssignPlan` | POST | `/commissions/reps/:id/plan` | `{ planId }` | `CommissionRep` (unwrapped) |

### Rep Cache Keys

```typescript
["commission-reps", "list", params]
["commission-reps", "detail", id]
```

---

## Commission Payouts

**Source:** `apps/web/lib/hooks/commissions/use-payouts.ts`

### Queries

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `usePayouts` | GET | `/commissions/payouts?page=&limit=&status=&repId=&fromDate=&toDate=` | URLSearchParams | `{ data: CommissionPayout[], pagination }` (unwrapped) |
| `usePayout` | GET | `/commissions/payouts/:id` | -- | `CommissionPayout` (unwrapped) |

### Mutations

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useGeneratePayout` | POST | `/commissions/payouts/generate` | `{ repId, periodStart, periodEnd }` | `CommissionPayout` (unwrapped) |
| `useProcessPayout` | POST | `/commissions/payouts/:id/process` | `{ paymentMethod?, referenceNumber? }` | `CommissionPayout` (unwrapped) |

### Payout Cache Keys

```typescript
["commission-payouts", "list", params]
["commission-payouts", "detail", id]
```
