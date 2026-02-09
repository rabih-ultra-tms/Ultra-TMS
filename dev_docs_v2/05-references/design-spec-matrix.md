# Design Spec → Task Matrix

> Maps all 98 design specs in `dev_docs/12-Rabih-design-Process/` to their corresponding task files.
> **28 specs are actively referenced by tasks. 70 are foundational or post-MVP.**

---

## Referenced Specs (28 — mapped to tasks)

| Spec Path | Task ID | Phase | Screen |
|-----------|---------|-------|--------|
| `00-global/03-status-color-system.md` | COMP-001, COMP-002 | 1 | Design tokens + StatusBadge |
| `00-global/11-bulk-operations-patterns.md` | COMP-004 | 1 | FilterBar |
| `01.1-dashboard-shell/01-main-dashboard.md` | BUG-008, COMP-003 | 0, 1 | Dashboard + KPICard |
| `03-sales/02-quotes-list.md` | SALES-001 | 3 | Quotes List |
| `03-sales/03-quote-detail.md` | SALES-002 | 3 | Quote Detail |
| `03-sales/04-quote-builder.md` | SALES-003 | 3 | Quote Create/Edit |
| `04-tms-core/01-operations-dashboard.md` | TMS-012 | 4 | Operations Dashboard |
| `04-tms-core/02-orders-list.md` | TMS-001 | 3 | Orders List |
| `04-tms-core/03-order-detail.md` | TMS-002 | 3 | Order Detail |
| `04-tms-core/04-order-entry.md` | TMS-005 | 4 | New Order Form |
| `04-tms-core/05-loads-list.md` | TMS-003 | 3 | Loads List |
| `04-tms-core/06-load-detail.md` | TMS-004 | 3 | Load Detail |
| `04-tms-core/07-load-builder.md` | TMS-007 | 4 | New Load Form |
| `04-tms-core/08-dispatch-board.md` | TMS-011 | 4 | Dispatch Board |
| `04-tms-core/09-stop-management.md` | TMS-009 | 4 | Stop Management |
| `04-tms-core/10-tracking-map.md` | TMS-013 | 5 | Tracking Map |
| `04-tms-core/13-check-calls.md` | TMS-010 | 4 | Check Call Log |
| `05-carrier/02-carrier-detail.md` | BUG-001, CARR-002 | 0, 2 | Carrier Detail |
| `06-accounting/01-accounting-dashboard.md` | ACC-001 | 6 | Accounting Dashboard |
| `06-accounting/02-invoices-list.md` | ACC-002 | 6 | Invoices List |
| `06-accounting/03-invoice-detail.md` | ACC-002 | 6 | Invoice Detail |
| `06-accounting/07-payments-received.md` | ACC-003 | 6 | Payments Received |
| `07-load-board/01-load-board-dashboard.md` | LB-001 | 5 | Load Board Dashboard |
| `08-commission/01-commission-dashboard.md` | COM-001 | 6 | Commission Dashboard |
| `08-commission/02-commission-plans.md` | COM-003 | 6 | Commission Plans |

---

## Orphaned Specs by Service (70 — not referenced by tasks)

### 00-global (14 specs)

| Spec | Why Orphaned |
|------|-------------|
| `00-design-principles.md` | Foundational reference (not a task) |
| `01-layout-patterns.md` | Foundational reference |
| `02-component-library.md` | Foundational reference |
| `04-loading-states.md` | Covered by COMP-007 implicitly |
| `05-error-handling.md` | Covered by quality-gates.md |
| `06-empty-states.md` | Covered by quality-gates.md |
| `07-form-patterns.md` | Covered by PATT-003 implicitly |
| `08-table-patterns.md` | Covered by PATT-001 implicitly |
| `09-navigation-patterns.md` | Covered by BUG-003 sidebar fix |
| `10-responsive-breakpoints.md` | Reference for all tasks |
| `12-accessibility.md` | Reference for all tasks |
| `13-animation-motion.md` | Post-MVP polish |
| `14-dark-mode.md` | Post-MVP |
| `15-user-journeys.md` | Foundational reference |

### 01-auth-admin (6 specs)

| Spec | Why Orphaned |
|------|-------------|
| `01-login.md` | PROTECTED — already 8/10 |
| `02-register.md` | Post-MVP (stub page) |
| `03-forgot-password.md` | Post-MVP (stub page) |
| `04-user-profile.md` | Post-MVP |
| `05-user-management.md` | Post-MVP |
| `06-settings.md` | Post-MVP |

### 01.1-dashboard-shell (4 specs)

| Spec | Why Orphaned |
|------|-------------|
| `02-sidebar.md` | Partially covered by BUG-003 |
| `03-header.md` | Not a separate task |
| `04-notifications.md` | Post-MVP |
| `05-search.md` | Post-MVP |

### 02-crm (8 specs)

| Spec | Why Orphaned |
|------|-------------|
| `01-crm-dashboard.md` | Post-MVP (CRM is minimal in MVP) |
| `02-companies-list.md` | Already built, good enough |
| `03-company-detail.md` | Already built, good enough |
| `04-contacts-list.md` | Partially covered by BUG-009 |
| `05-contact-detail.md` | Already built |
| `06-leads-list.md` | Partially covered by BUG-010 |
| `07-lead-detail.md` | Already built |
| `08-opportunities.md` | Post-MVP (Wave 2) |

### 03-sales (5 specs)

| Spec | Why Orphaned |
|------|-------------|
| `01-sales-dashboard.md` | Post-MVP (not in 16-week sprint) |
| `05-rate-tables.md` | Post-MVP |
| `06-rate-table-editor.md` | Post-MVP |
| `07-lane-pricing.md` | Post-MVP |
| `08-accessorial-charges.md` | Post-MVP |

### 04-tms-core (6 specs)

| Spec | Why Orphaned |
|------|-------------|
| `11-status-updates.md` | Covered inline by detail pages |
| `12-load-timeline.md` | Covered inline by TMS-002, TMS-004 |
| `14-appointment-scheduler.md` | Post-MVP |
| `15-*`, `16-*`, `17-*` | Post-MVP extensions |

### 05-carrier (8 specs)

| Spec | Why Orphaned |
|------|-------------|
| `01-carrier-dashboard.md` | Post-MVP (not in 16-week sprint) |
| `04-carrier-onboarding.md` | Post-MVP (not in 16-week sprint) |
| `05-compliance-center.md` | Post-MVP |
| `06-insurance-tracking.md` | Post-MVP |
| `07-equipment-list.md` | Post-MVP |
| `08-carrier-scorecard.md` | Post-MVP |
| `09-lane-preferences.md` | Post-MVP |

### 06-accounting (7 specs)

| Spec | Why Orphaned |
|------|-------------|
| `04-invoice-entry.md` | Covered by ACC-002 implicitly |
| `05-carrier-payables.md` | Covered by ACC-004 implicitly |
| `06-bill-entry.md` | Post-MVP |
| `08-payments-made.md` | Post-MVP (carrier payouts via settlements) |
| `09-payment-entry.md` | Covered by ACC-003 |
| `10-bank-reconciliation.md` | Post-MVP |
| `11-gl-transactions.md` | Post-MVP |

### 07-load-board (5 specs)

| Spec | Why Orphaned |
|------|-------------|
| `02-post-load.md` | Covered by LB-002 implicitly |
| `03-available-loads.md` | Covered by LB-003 implicitly |
| `04-posting-detail.md` | Covered by LB-004 implicitly |
| `05-carrier-matching.md` | Covered by LB-005 implicitly |
| `06-load-map.md` | Post-MVP (LB-006 not in sprint) |

### 08-commission (5 specs)

| Spec | Why Orphaned |
|------|-------------|
| `03-plan-editor.md` | Covered by COM-003 implicitly |
| `04-commission-calculator.md` | Post-MVP |
| `05-commission-statements.md` | Post-MVP |
| `06-payout-history.md` | Covered by COM-005 implicitly |

---

## Coverage Summary

| Category | Count | Percentage |
|----------|-------|------------|
| Actively referenced by tasks | 28 | 29% |
| Implicitly covered (task uses spec without explicit reference) | ~15 | 15% |
| Post-MVP / future phases | ~35 | 36% |
| Foundational / reference only | ~20 | 20% |
| **Total design specs** | **98** | **100%** |

**Key Insight:** All 8 MVP services have their critical screens covered. The "orphaned" specs are intentionally deferred — they're for features beyond the 16-week sprint.
