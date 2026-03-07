# Accounting Screens Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/06-accounting/` (files 00-09)
**MVP Tier:** P0
**Frontend routes:** `(dashboard)/accounting/*`
**Backend module:** `apps/api/src/modules/accounting/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-accounting-dashboard.md` | `/accounting` | `(dashboard)/accounting/page.tsx` | Exists |
| 02 | `02-invoices-list.md` | `/accounting/invoices` | `(dashboard)/accounting/invoices/page.tsx` | Exists |
| 03 | `03-invoice-detail.md` | `/accounting/invoices/[id]` | `(dashboard)/accounting/invoices/[id]/page.tsx` | Exists |
| 04 | `04-invoice-entry.md` | `/accounting/invoices/new` | `(dashboard)/accounting/invoices/new/page.tsx` | Exists |
| 05 | `05-carrier-payables.md` | `/accounting/payables` | `(dashboard)/accounting/payables/page.tsx` | Exists |
| 06 | `06-bill-entry.md` | — | Not built | P1 — separate bill creation |
| 07 | `07-payments-received.md` | `/accounting/payments` | `(dashboard)/accounting/payments/page.tsx` | Exists |
| 08 | `08-payments-made.md` | — | Not built | Combined with payments list |
| 09 | `09-payment-entry.md` | `/accounting/payments/[id]` | `(dashboard)/accounting/payments/[id]/page.tsx` | Exists |

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Dashboard | `GET /accounting/dashboard` | `use-accounting-dashboard.ts` |
| Invoices | `GET/POST /accounting/invoices` | `use-invoices.ts` |
| Invoice Detail | `GET/PATCH /accounting/invoices/:id` | `use-invoices.ts` |
| Payables | `GET /accounting/payables` | `use-payables.ts` |
| Payments | `GET/POST /accounting/payments` | `use-payments.ts` |
| Payment Detail | `GET /accounting/payments/:id` | `use-payments.ts` |

---

## Implementation Notes

- Accounting dashboard endpoint (`GET /accounting/dashboard`) may not exist yet (QS-003 task)
- Bill entry (06) and payments made (08) are design specs without dedicated routes — may be combined into existing pages
- Accounting module uses standard `page/limit` pagination
- Invoice generation from loads (BACK-007) is a key workflow
