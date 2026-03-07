# Commission Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/08-commission/` (7 files)
**MVP Tier:** P0
**Frontend routes:** `(dashboard)/commissions/*`
**Backend module:** `apps/api/src/modules/commission/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-commission-dashboard.md` | `/commissions` | `(dashboard)/commissions/page.tsx` | Exists |
| 02 | `02-commission-plans.md` | `/commissions/plans` | `(dashboard)/commissions/plans/page.tsx` | Exists |
| 03 | `03-plan-editor.md` | `/commissions/plans/[id]/edit` | `(dashboard)/commissions/plans/[id]/edit/page.tsx` | Exists |
| 04 | `04-commission-calculator.md` | `/commissions/transactions` | `(dashboard)/commissions/transactions/page.tsx` | Exists |
| 05 | `05-commission-statements.md` | `/commissions/payouts` | `(dashboard)/commissions/payouts/page.tsx` | Exists |
| 06 | `06-payout-history.md` | `/commissions/payouts/[id]` | `(dashboard)/commissions/payouts/[id]/page.tsx` | Exists |

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Dashboard | `GET /commissions/dashboard` | `use-commission-dashboard.ts` |
| Plans List | `GET /commissions/plans` | `use-plans.ts` |
| Plan Detail | `GET /commissions/plans/:id` | `use-plans.ts` |
| Plan Create | `POST /commissions/plans` | `use-plans.ts` |
| Plan Edit | `PATCH /commissions/plans/:id` | `use-plans.ts` |
| Transactions | `GET /commissions/transactions` | `use-transactions.ts` |
| Payouts | `GET /commissions/payouts` | `use-payouts.ts` |
| Payout Detail | `GET /commissions/payouts/:id` | `use-payouts.ts` |
| Payout Approve | `POST /commissions/payouts/:id/approve` | `use-payouts.ts` |
| Reps | `GET /commissions/reps` | `use-reps.ts` |

---

## Implementation Notes

- **CRITICAL:** Backend uses plural `commissions` (not `commission`) in route prefix
- Commission plans controller uses `@Request() req` pattern (not `@CurrentTenant()`)
- Payout workflow: create → approve → process → void
- Commission calculator (04) maps to transactions page — shows calculated commissions per load
- Commission statements (05) maps to payouts page — approved commission payments
- Additional routes exist: `/commissions/plans/new`, `/commissions/plans/[id]`, `/commissions/reps/[id]`, `/commissions/reports`
