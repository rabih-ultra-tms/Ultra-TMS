# Task Dependency Graph

> All 65 tasks with their blockers and what they unlock. Use this to plan parallel work for 2 developers.

---

## Critical Path (Longest Chain)

```
COMP-001 → COMP-004 → PATT-001 → TMS-001 → TMS-002 → TMS-005 → TMS-006
  (6h)      (4h)        (6h)       (6h)       (6h)       (10h)     (4h)
```

**Total: 7 hops, ~42 hours.** This is the minimum calendar time if done sequentially.

---

## Foundation Tasks (Block the Most)

| Task | Blocks | Count |
|------|--------|-------|
| COMP-001 (Design Tokens) | COMP-002, COMP-003, COMP-010, PATT-001, PATT-002, PATT-003 | 6 |
| PATT-001 (List Page) | CARR-001, SALES-001, TMS-001, TMS-003, ACC-004, COM-002 | 6 |
| PATT-002 (Detail Page) | CARR-002, SALES-002, TMS-002, TMS-004, ACC-002, COM-002 | 6 |
| PATT-003 (Form Page) | SALES-003, TMS-005, LB-002, INTEG-001, ACC-002 | 5 |
| INFRA-001 (WebSocket) | TMS-011, TMS-012, TMS-013 | 3 |

**COMP-001 is the single most critical task.** If it's delayed, everything downstream shifts.

---

## Independent Tasks (No Blockers — Start Immediately)

| Task | Effort | Notes |
|------|--------|-------|
| BUG-001 through BUG-010 | 20-28h total | All 10 bugs are independent |
| COMP-005 (DataGrid) | L (4-6h) | No deps |
| COMP-006 (ConfirmDialog) | S (1h) | No deps |
| COMP-007 (Loading Skeletons) | M (2-3h) | No deps |
| COMP-008 (shadcn installs) | S (1h) | No deps |
| INFRA-001 (WebSocket) | L (5h) | No deps — start early! |

---

## Two-Developer Split (Suggested)

### Phase 0 (Week 1) — Both devs work bugs in parallel
| Dev A | Dev B |
|-------|-------|
| BUG-001 (Carrier 404, 4-6h) | BUG-002 (Load History 404, 3-4h) |
| BUG-004 (JWT console, 1h) | BUG-003 (Sidebar 404s, 1-2h) |
| BUG-005 (localStorage, 2-3h) | BUG-006 (window.confirm, 1-2h) |
| BUG-008 (Dashboard, 2-3h) | BUG-007 (Debounce, 30m) |
| | BUG-009 (CRM delete, 2-3h) |
| | BUG-010 (CRM features, 3-4h) |

### Phase 1 (Week 2) — Design foundation
| Dev A | Dev B |
|-------|-------|
| COMP-001 (Design Tokens, 4-6h) | COMP-005 (DataGrid, 4-6h) |
| COMP-002 (StatusBadge, 2-3h) | COMP-006 (ConfirmDialog, 1h) |
| COMP-003 (KPICard, 2-3h) | COMP-007 (Skeletons, 2-3h) |
| COMP-004 (FilterBar, 3-4h) | COMP-008 (shadcn installs, 1h) |

### Phase 2 (Weeks 3-4) — Patterns + Carrier
| Dev A | Dev B |
|-------|-------|
| PATT-001 (List Pattern, 4-6h) | CARR-001 (Carrier List refactor, 2-3h) |
| PATT-002 (Detail Pattern, 3-4h) | CARR-002 (Carrier Detail, 3-4h) |
| PATT-003 (Form Pattern, 3-4h) | CARR-003 (Carrier Tests, 3-4h) |
| COMP-009 (DateRangePicker, 2-3h) | COMP-010 (StopList, 2-3h) |

### Phase 3 (Weeks 5-7) — TMS Viewing + Sales
| Dev A (TMS) | Dev B (Sales) |
|-------------|---------------|
| TMS-001 (Orders List, 6h) | SALES-001 (Quotes List, 4h) |
| TMS-002 (Order Detail, 6h) | SALES-002 (Quote Detail, 6h) |
| TMS-003 (Loads List, 4h) | SALES-003 (Quote Form, 6h) |
| TMS-004 (Load Detail, 6h) | |

### Phase 4 (Weeks 8-10) — TMS Forms + Operations
| Dev A (Forms) | Dev B (Real-time) |
|---------------|-------------------|
| TMS-005 (New Order Form, 10h) | INFRA-001 (WebSocket, 5h) |
| TMS-006 (Edit Order, 4h) | TMS-011 (Dispatch Board, 12h) |
| TMS-007 (New Load Form, 7h) | TMS-012 (Ops Dashboard, 7h) |
| TMS-008 (Edit Load, 4h) | |
| TMS-009 (Stop Mgmt, 5h) | |
| TMS-010 (Check Calls, 5h) | |

### Phase 5 (Weeks 11-13) — Load Board + Polish
| Dev A (Load Board) | Dev B (TMS Polish) |
|--------------------|-------------------|
| LB-001 (Dashboard, 3h) | TMS-013 (Tracking Map, 8h) |
| LB-002 (Post Load, 4h) | TMS-014 (Rate Confirmation, 5h) |
| LB-003 (Search, 4h) | TEST-001 (Testing, 4h) |
| LB-004 (Posting Detail, 6h) | |
| LB-005 (Carrier Matches, 3h) | |

### Phase 6 (Weeks 14-16) — Financial + Go-Live
| Dev A (Accounting) | Dev B (Commission + Integrations) |
|--------------------|----------------------------------|
| ACC-001 (Dashboard, 4h) | COM-001 (Dashboard, 3h) |
| ACC-002 (Invoices, 6h) | COM-002 (Sales Reps, 4h) |
| ACC-003 (Payments, 4h) | COM-003 (Plans, 6h) |
| ACC-004 (Payables, 2h) | COM-004 (Transactions, 3h) |
| ACC-005 (Settlements, 4h) | COM-005 (Payouts, 4h) |
| ACC-006 (Aging, 3h) | COM-006 (Reports, 2h) |
| INTEG-002 (QuickBooks, 6h) | INTEG-001 (FMCSA, 4h) |
| | RELEASE-001 (Go-Live, 4h) |

---

## Full Dependency Table

| Task | Title | Blocked By | Blocks |
|------|-------|------------|--------|
| BUG-001 | Carrier detail 404 | None | CARR-002, INTEG-001 |
| BUG-002 | Load history 404 | None | None |
| BUG-003 | Sidebar 404 links | None | None |
| BUG-004 | JWT console logs | None | None |
| BUG-005 | localStorage tokens | None | None |
| BUG-006 | window.confirm × 7 | None | None |
| BUG-007 | Search debounce × 3 | None | None |
| BUG-008 | Dashboard hardcoded | None | None |
| BUG-009 | CRM delete buttons | None | None |
| BUG-010 | CRM missing features | None | None |
| COMP-001 | Design tokens | None | COMP-002, COMP-003, COMP-010, PATT-001, PATT-002, PATT-003 |
| COMP-002 | StatusBadge | COMP-001 | PATT-001, PATT-002, PATT-003, CARR-001 |
| COMP-003 | KPICard | COMP-001 | BUG-008, TMS-012, LB-001, ACC-001, COM-001 |
| COMP-004 | FilterBar | COMP-001 | PATT-001 |
| COMP-005 | DataGrid | None | PATT-001 |
| COMP-006 | ConfirmDialog | None | BUG-006, PATT-003 |
| COMP-007 | Loading Skeletons | None | PATT-001, PATT-002, PATT-003 |
| COMP-008 | shadcn installs | None | COMP-009 |
| COMP-009 | DateRangePicker | COMP-008 | None |
| COMP-010 | StopList | COMP-001 | TMS-009, TMS-004 |
| PATT-001 | List Page pattern | COMP-004, COMP-005 | CARR-001, SALES-001, TMS-001, TMS-003, ACC-004, COM-002 |
| PATT-002 | Detail Page pattern | COMP-002, COMP-007 | CARR-002, SALES-002, TMS-002, TMS-004, ACC-002, COM-002 |
| PATT-003 | Form Page pattern | COMP-006 | SALES-003, TMS-005, LB-002, INTEG-001, ACC-002 |
| CARR-001 | Refactor carrier list | PATT-001, COMP-002, BUG-001 | None |
| CARR-002 | Carrier detail upgrade | BUG-001, PATT-002 | CARR-003 |
| CARR-003 | Carrier tests | CARR-001, CARR-002 | None |
| SALES-001 | Quotes List rebuild | PATT-001, COMP-001, COMP-002 | SALES-002 |
| SALES-002 | Quote Detail rebuild | PATT-002, SALES-001 | SALES-003 |
| SALES-003 | Quote Form rebuild | PATT-003, SALES-001, SALES-002 | TMS-005 |
| TMS-001 | Orders List | PATT-001, COMP-001, COMP-002, COMP-004, COMP-005 | TMS-002 |
| TMS-002 | Order Detail | PATT-002, TMS-001 | TMS-005, TMS-006 |
| TMS-003 | Loads List | PATT-001, COMP-001, COMP-002, COMP-004, COMP-005 | TMS-004 |
| TMS-004 | Load Detail | PATT-002, TMS-003 | TMS-007, TMS-009, TMS-010, TMS-014 |
| TMS-005 | New Order Form | PATT-003, TMS-001, TMS-002 | TMS-006 |
| TMS-006 | Edit Order Form | TMS-005 | None |
| TMS-007 | New Load Form | PATT-003, TMS-003, TMS-004 | TMS-008 |
| TMS-008 | Edit Load Form | TMS-007 | None |
| TMS-009 | Stop Management | TMS-004, COMP-010 | TMS-010 |
| TMS-010 | Check Call Log | TMS-004 | TMS-012 |
| TMS-011 | Dispatch Board | INFRA-001, TMS-003 | None |
| TMS-012 | Ops Dashboard | COMP-003, INFRA-001 | None |
| TMS-013 | Tracking Map | INFRA-001 | None |
| TMS-014 | Rate Confirmation | TMS-004 | None |
| INFRA-001 | WebSocket Setup | None | TMS-011, TMS-012, TMS-013 |
| LB-001 | Load Board Dashboard | COMP-003, COMP-001 | LB-003 |
| LB-002 | Post Load form | PATT-003 | LB-004 |
| LB-003 | Available Loads search | LB-001 | None |
| LB-004 | Posting Detail + Bids | LB-002 | LB-005 |
| LB-005 | Carrier Matches | LB-004 | None |
| TEST-001 | Testing milestone | TMS-001, TMS-004, TMS-005 | None |
| ACC-001 | Accounting Dashboard | COMP-003, COMP-001 | None |
| ACC-002 | Invoices CRUD | PATT-001, PATT-002, PATT-003 | ACC-003, ACC-006, INTEG-002 |
| ACC-003 | Payments Received | ACC-002 | None |
| ACC-004 | Carrier Payables | PATT-001 | ACC-005 |
| ACC-005 | Settlements | ACC-004 | None |
| ACC-006 | Aging Reports | ACC-002 | None |
| COM-001 | Commission Dashboard | COMP-003 | COM-006 |
| COM-002 | Sales Reps | PATT-001, PATT-002 | None |
| COM-003 | Commission Plans | PATT-001, PATT-003 | COM-002 |
| COM-004 | Transactions | PATT-001 | COM-005 |
| COM-005 | Payouts | COM-004 | None |
| COM-006 | Commission Reports | COM-001 | None |
| INTEG-001 | FMCSA Integration | BUG-001 | None |
| INTEG-002 | QuickBooks Sync | ACC-002 | None |
| RELEASE-001 | Go-Live Checklist | All Phase 0-6 tasks | Production go-live |
