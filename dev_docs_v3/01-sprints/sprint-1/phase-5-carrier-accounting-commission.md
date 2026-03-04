# Sprint 1 — Phase 5: Carrier + Accounting + Commission (Weeks 9-10)
> 9 tasks | 35-45h estimated | Prereq: FIX-002 complete

---

## SVC-CARR-001: Carrier Hook Fixes [P0]
**Effort:** M (3-4h) | 14/18 hooks reported broken

### Hooks to Fix
| Hook | File | Status |
|------|------|--------|
| useCarriers | `lib/hooks/use-carriers.ts` | **CONFIRMED BROKEN** (lines 34-40) |
| useFmcsa | `lib/hooks/use-fmcsa.ts` | VERIFY |

**Plus operations-level carrier hooks:**
| Hook | File | Status |
|------|------|--------|
| Various carrier queries in useCarriers | `lib/hooks/use-carriers.ts` | Multiple queryFn/mutationFn need unwrap |

### Sub-tasks
1. **CARR-001a:** Fix `useCarriers` — apply `unwrap()` to lines 34-40 and all other query functions
2. **CARR-001b:** Fix `useFmcsa` — verify FMCSA lookup returns clean data
3. **CARR-001c:** Verify carrier creation flow: new carrier → FMCSA verification → add trucks/drivers → activate
4. **CARR-001d:** Verify carrier search and filtering works
5. **CARR-001e:** Test carrier detail page loads all tabs (info, trucks, drivers, documents, compliance)

### Acceptance Criteria
- [ ] All carrier hooks return unwrapped data
- [ ] Carrier CRUD works end-to-end
- [ ] FMCSA lookup returns and displays carrier data
- [ ] Carrier detail tabs all render

---

## SVC-CARR-002: Carrier Pages Quality Pass [P1]
**Effort:** M (4-6h) | FMCSA verification must work

### Pages to Fix (12 pages)
| Page | Route | Key Checks |
|------|-------|-----------|
| Carrier List | `/carriers` | Data table, search, filters |
| Carrier Detail | `/carriers/[id]` | All tabs render |
| Carrier Edit | `/carriers/[id]/edit` | Has console.log — remove |
| Carrier New | `/carriers/new` | FMCSA lookup on DOT# |
| Carrier Documents | `/carriers/[id]/documents` | Has TODO — resolve |
| Carrier Compliance | `/carriers/[id]/compliance` | Insurance, authority |

### Sub-tasks
1. **CARR-002a:** Fix carrier list — pagination, search, status filters
2. **CARR-002b:** Fix carrier detail page — all tabs load data
3. **CARR-002c:** Remove console.log from carrier edit page
4. **CARR-002d:** Resolve TODO in carrier-documents-section.tsx
5. **CARR-002e:** Verify FMCSA integration:
   - Enter DOT# → lookup via FMCSA API → auto-populate fields
   - Display authority status (active/inactive)
   - Show insurance on file
6. **CARR-002f:** 4-state verification on all carrier pages
7. **CARR-002g:** Verify truck and driver management within carrier detail

### Known Issues
- `carriers/[id]/edit/page.tsx` — console.log (remove)
- `components/carriers/carrier-documents-section.tsx` — TODO comment (resolve)

### Acceptance Criteria
- [ ] All carrier pages show 4 states
- [ ] FMCSA lookup works (or gracefully mocked for dev)
- [ ] Truck and driver management works
- [ ] Zero console.log/TODO in carrier code
- [ ] Insurance verification status displays

---

## SVC-CARR-003: Carrier Module Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Sub-tasks
1. **CARR-003a:** Audit existing 5 backend carrier test files
2. **CARR-003b:** Add operations module carrier tests (currently 0):
   - Carrier CRUD with tenant isolation
   - Truck CRUD under carrier
   - Driver CRUD under carrier
   - FMCSA data fetch (mocked HTTP)
3. **CARR-003c:** Frontend tests:
   - Carrier list renders
   - Carrier form validates DOT number format

### Acceptance Criteria
- [ ] 15+ tests passing for carrier module
- [ ] FMCSA integration tested with mocked responses
- [ ] Tenant isolation verified

---

## SVC-ACC-001: Accounting Hook Audit & Fixes [P0]
**Effort:** M (2-3h)

### Hooks to Fix (6 files)
| Hook | File | Status |
|------|------|--------|
| useAccountingDashboard | `lib/hooks/use-accounting-dashboard.ts` | VERIFY |
| useAging | `lib/hooks/use-aging.ts` | VERIFY |
| useInvoices | `lib/hooks/use-invoices.ts` | CORRECT — has local unwrap |
| usePayables | `lib/hooks/use-payables.ts` | VERIFY |
| usePayments | `lib/hooks/use-payments.ts` | VERIFY |
| useSettlements | `lib/hooks/use-settlements.ts` | VERIFY |

### Sub-tasks
1. **ACC-001a:** Verify all 6 hooks — apply shared `unwrap()` where missing
2. **ACC-001b:** Migrate `useInvoices` from local unwrap to shared import
3. **ACC-001c:** Verify invoice creation flow: create → approve → send → record payment
4. **ACC-001d:** Verify payable creation flow: receive invoice → approve → schedule payment → pay
5. **ACC-001e:** Verify settlement flow: carrier settlement → calculate → approve → pay

### Acceptance Criteria
- [ ] All 6 accounting hooks return unwrapped data
- [ ] Invoice lifecycle works end-to-end
- [ ] Payables and settlements work

---

## SVC-ACC-002: Accounting Pages Quality Pass [P1]
**Effort:** M (4-6h)

### Pages to Fix (9 pages)
| Page | Route | Key Checks |
|------|-------|-----------|
| Accounting Dashboard | `/accounting` | Revenue, AR, AP summary |
| Invoice List | `/accounting/invoices` | Data table, status filters |
| Invoice Detail | `/accounting/invoices/[id]` | Line items, payments, PDF |
| Invoice Create | `/accounting/invoices/new` | Form, auto-calculate |
| Payment List | `/accounting/payments` | Payment records |
| Payment Detail | `/accounting/payments/[id]` | Payment allocation |
| Payables | `/accounting/payables` | AP tracking |
| Settlement List | `/accounting/settlements` | Carrier settlements |
| Settlement Detail | `/accounting/settlements/[id]` | Breakdown |
| Aging Report | `/accounting/reports/aging` | AR/AP aging buckets |

### Sub-tasks per page
1. 4-state verification
2. CRUD operations work
3. Financial calculations are correct
4. PDF generation works (invoices, settlements)
5. Aging report shows accurate bucket totals

### Acceptance Criteria
- [ ] All accounting pages show 4 states
- [ ] Invoice CRUD works with line items and calculations
- [ ] Payment recording works
- [ ] Settlement calculations are correct
- [ ] Aging report generates accurately

---

## SVC-ACC-003: Accounting Module Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Sub-tasks
1. **ACC-003a:** Audit existing 8 backend test files
2. **ACC-003b:** Add tests for:
   - Invoice calculation accuracy (line items × rate × quantity)
   - Payment allocation to invoices
   - Settlement calculation (carrier pay - deductions)
   - Aging bucket assignment (current, 30, 60, 90+ days)
   - Tenant isolation on financial data
3. **ACC-003c:** Frontend: invoice form calculates totals correctly

### Acceptance Criteria
- [ ] 15+ tests passing
- [ ] Financial calculations verified with known inputs
- [ ] No cross-tenant financial data leakage

---

## SVC-COM-001: Commission Hook Fixes [P0]
**Effort:** M (2-3h)

### Hooks to Fix (5 files)
| Hook | File | Status |
|------|------|--------|
| useCommissionDashboard | `lib/hooks/use-commission-dashboard.ts` | VERIFY |
| usePayouts | `lib/hooks/use-payouts.ts` | VERIFY |
| usePlans | `lib/hooks/use-plans.ts` | VERIFY |
| useReps | `lib/hooks/use-reps.ts` | VERIFY |
| useTransactions | `lib/hooks/use-transactions.ts` | VERIFY |

### Sub-tasks
1. **COM-001a:** Verify all 5 hooks — apply shared `unwrap()`
2. **COM-001b:** Verify commission plan assignment to reps
3. **COM-001c:** Verify commission calculation on load completion
4. **COM-001d:** Verify payout generation flow

### Acceptance Criteria
- [ ] All 5 commission hooks return unwrapped data
- [ ] Commission calculations work
- [ ] Payout flow works end-to-end

---

## SVC-COM-002: Commission Pages Quality Pass [P1]
**Effort:** M (4-6h)

### Pages to Fix (8 pages)
| Page | Route | Key Checks |
|------|-------|-----------|
| Commission Dashboard | `/commissions` | Revenue, earned, pending |
| Plans List | `/commissions/plans` | Plan configurations |
| Plan Detail | `/commissions/plans/[id]` | Tiers, rates |
| Plan Create | `/commissions/plans/new` | Tier configuration |
| Reps List | `/commissions/reps` | Sales rep list |
| Rep Detail | `/commissions/reps/[id]` | Rep's commissions |
| Payouts | `/commissions/payouts` | Payout history |
| Transactions | `/commissions/transactions` | Transaction log |
| Reports | `/commissions/reports` | Summary reports |

### Sub-tasks per page
1. 4-state verification
2. Commission plan CRUD works
3. Rep assignment to plans works
4. Payout calculations are correct
5. Transaction history loads

### Acceptance Criteria
- [ ] All commission pages show 4 states
- [ ] Plan CRUD with tiers works
- [ ] Commission calculations match plan rules
- [ ] Payout generation works

---

## SVC-COM-003: Commission Module Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Sub-tasks
1. **COM-003a:** Audit existing 3 backend test files (low count)
2. **COM-003b:** Add critical tests:
   - Commission calculation: flat rate, percentage, tiered
   - Plan tier boundaries (e.g., 0-10k = 5%, 10k-50k = 7%, 50k+ = 10%)
   - Payout generation with correct amounts
   - Commission split between multiple reps
   - Tenant isolation on commission data
3. **COM-003c:** Frontend: plan form correctly configures tiers

### Acceptance Criteria
- [ ] 15+ tests passing (up from 3)
- [ ] All commission calculation methods tested
- [ ] Tier boundary calculations verified
- [ ] Split calculations verified

---

## Phase 5 Summary

| Task | Priority | Effort | Scope |
|------|----------|--------|-------|
| SVC-CARR-001 | P0 | M (3-4h) | Carrier hooks |
| SVC-CARR-002 | P1 | M (4-6h) | 12 carrier pages |
| SVC-CARR-003 | P1 | M (3-4h) | 15+ tests |
| SVC-ACC-001 | P0 | M (2-3h) | 6 accounting hooks |
| SVC-ACC-002 | P1 | M (4-6h) | 9 accounting pages |
| SVC-ACC-003 | P1 | M (3-4h) | 15+ tests |
| SVC-COM-001 | P0 | M (2-3h) | 5 commission hooks |
| SVC-COM-002 | P1 | M (4-6h) | 8 commission pages |
| SVC-COM-003 | P1 | M (3-4h) | 15+ tests |
| **TOTAL** | | **35-45h** | **3 services** |

### Execution Order
1. Hook fixes (CARR-001 + ACC-001 + COM-001) — all parallel, independent
2. Page quality passes (CARR-002 + ACC-002 + COM-002) — can parallel after hooks
3. Tests (CARR-003 + ACC-003 + COM-003) — after pages stabilize
