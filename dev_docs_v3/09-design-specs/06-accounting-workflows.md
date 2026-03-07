# Accounting Workflows Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/06-accounting/` (files 10-14)
**MVP Tier:** P0-P1
**Frontend routes:** `(dashboard)/accounting/*`
**Backend module:** `apps/api/src/modules/accounting/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 10 | `10-bank-reconciliation.md` | — | Not built | P2 — complex financial feature |
| 11 | `11-gl-transactions.md` | — | Not built | P2 — general ledger |
| 12 | `12-chart-of-accounts.md` | — | Not built | P2 — accounting config |
| 13 | `13-financial-reports.md` | — | Not built | P2 — reporting |
| 14 | `14-ar-aging-report.md` | `/accounting/reports/aging` | `(dashboard)/accounting/reports/aging/page.tsx` | Exists |

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Settlements List | `GET /settlements` | `use-settlements.ts` |
| Settlement Detail | `GET /settlements/:id` | `use-settlements.ts` |
| Settlement Create | `POST /settlements` | `use-settlements.ts` |
| Settlement Approve | `POST /settlements/:id/approve` | `use-settlements.ts` |
| Aging Report | `GET /accounting/aging` | `use-aging.ts` |

---

## Settlement Routes (not in design spec directory but in frontend)

| Route | Page File | Status |
|-------|-----------|--------|
| `/accounting/settlements` | `(dashboard)/accounting/settlements/page.tsx` | Exists |
| `/accounting/settlements/[id]` | `(dashboard)/accounting/settlements/[id]/page.tsx` | Exists |

---

## Workflow: Load → Invoice → Payment → Settlement

```
Load Delivered → POD Received → Invoice Generated →
Invoice Sent to Customer → Payment Received → Payment Applied →
Carrier Settlement Generated → Settlement Approved → Settlement Paid
```

---

## Implementation Notes

- Bank reconciliation, GL transactions, chart of accounts are P2 — complex accounting features
- AR aging report is P0 — route exists
- Settlements controller uses approve/void lifecycle with `@HttpCode(HttpStatus.OK)` on POST actions
- Settlement can be generated from a load: `POST /settlements/generate-from-load`
- Financial reports (13) covers the same ground as analytics module reports
