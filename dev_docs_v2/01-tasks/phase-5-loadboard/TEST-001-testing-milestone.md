# TEST-001: Testing Milestone (Split into 4 Sub-Tasks)

> **Phase:** 5 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** XL (40-60h total) ⬆️ was 4h
> **Assigned:** BOTH developers (split below)
> **Revised:** v2 — Logistics expert review ("For a $300K system? Testing is not a Phase 5 afterthought.")

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs/08-standards/72-testing-strategy.md` — Full testing strategy
3. `dev_docs/11-ai-dev/90-seed-data-fixtures.md` — Test fixtures

## Objective

Comprehensive testing across all phases. Sets up Jest + Testing Library + MSW infrastructure, then tests every critical screen and workflow built in Phases 0-5.

**Coverage target:** 50% for new code (up from 8.7% current)

## Sub-Task Breakdown

### TEST-001a: Phase 0-2 Testing (8-10h) — Codex/Gemini

**Scope:** Bug fixes, design system components, carrier refactor

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/__tests__/setup.ts` | Test setup: MSW handlers, test utilities, custom render |
| CREATE | `apps/web/__tests__/mocks/handlers.ts` | MSW mock API handlers for all endpoints |
| CREATE | `apps/web/__tests__/components/status-badge.test.tsx` | StatusBadge renders all status families |
| CREATE | `apps/web/__tests__/components/kpi-card.test.tsx` | KPICard renders metrics correctly |
| CREATE | `apps/web/__tests__/components/data-grid.test.tsx` | DataGrid: sorting, filtering, pagination |
| CREATE | `apps/web/__tests__/components/filter-bar.test.tsx` | FilterBar: date range, status select, search |
| CREATE | `apps/web/__tests__/carriers/carriers-list.test.tsx` | Carrier list: renders, search debounce, filters |
| CREATE | `apps/web/__tests__/carriers/carrier-detail.test.tsx` | Carrier detail: renders tabs, no 404 |
| MODIFY | `apps/web/package.json` | Add msw, @testing-library/user-event if not present |

**Acceptance criteria:**

- [ ] MSW configured with mock handlers for all MVP endpoints
- [ ] Design system components: StatusBadge, KPICard, DataGrid, FilterBar tested
- [ ] Carrier list: search debounce works, filters change URL params
- [ ] Carrier detail: renders without 404, all tabs accessible
- [ ] Dashboard: shows real data (not hardcoded zeros) in test
- [ ] All Phase 0 bug fixes verified not regressed
- [ ] Coverage: >=60% for tested components

---

### TEST-001b: Phase 3 Testing (12-16h) — Claude Code

**Scope:** Orders, loads, quotes, public tracking page

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/__tests__/tms/orders-list.test.tsx` | Orders list: renders, pagination, filters, search |
| CREATE | `apps/web/__tests__/tms/order-detail.test.tsx` | Order detail: tabs, status display, navigation |
| CREATE | `apps/web/__tests__/tms/loads-list.test.tsx` | Loads list: renders, status filters |
| CREATE | `apps/web/__tests__/tms/load-detail.test.tsx` | Load detail: tabs, documents tab, status |
| CREATE | `apps/web/__tests__/tms/public-tracking.test.tsx` | Public tracking: renders without auth, no sensitive data |
| CREATE | `apps/web/__tests__/sales/quotes-list.test.tsx` | Quotes list: renders, filters |
| CREATE | `apps/web/__tests__/sales/quote-detail.test.tsx` | Quote detail: renders, status badge |

**Acceptance criteria:**

- [ ] Orders list: renders with mock data, pagination works, filter changes URL params
- [ ] Order detail: all tabs render, status transitions displayed
- [ ] Loads list: renders, status filters work
- [ ] Load detail: all tabs render including Documents tab
- [ ] Public tracking: renders without auth context, shows status timeline, NO sensitive data
- [ ] Quotes: list and detail render correctly
- [ ] Coverage: >=50% for Phase 3 components

---

### TEST-001c: Phase 4 Testing (16-24h) — BOTH developers

**Scope:** Order/load forms, dispatch board (most complex), operations dashboard

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/__tests__/tms/order-form.test.tsx` | Order form: validation, step navigation, submit |
| CREATE | `apps/web/__tests__/tms/load-form.test.tsx` | Load form: pre-fill from order, carrier assignment, submit |
| CREATE | `apps/web/__tests__/tms/dispatch-board.test.tsx` | Dispatch board: renders columns, card display |
| CREATE | `apps/web/__tests__/tms/dispatch-drag-drop.test.tsx` | Dispatch: drag-drop moves cards, invalid transitions blocked |
| CREATE | `apps/web/__tests__/tms/dispatch-realtime.test.tsx` | Dispatch: WebSocket events update board |
| CREATE | `apps/web/__tests__/tms/stop-management.test.tsx` | Stop management: add/edit/reorder stops |
| CREATE | `apps/web/__tests__/tms/check-call.test.tsx` | Check call: add call, timeline display |

**Acceptance criteria:**

- [ ] Order form: validates required fields, step navigation works, form submits
- [ ] Load form: pre-fills from order data, carrier assignment works
- [ ] Dispatch board: 6 columns render, cards display correct data
- [ ] Dispatch drag-drop: valid transitions succeed, invalid blocked
- [ ] Dispatch real-time: mock WebSocket events update board state
- [ ] Stop management: CRUD operations work
- [ ] Check call: add/view check calls in timeline
- [ ] Coverage: >=50% for Phase 4 components

---

### TEST-001d: Phase 5 Testing (8-12h) — Codex/Gemini

**Scope:** Load board, tracking map, automated emails

| Action | Path | What |
|--------|------|------|
| CREATE | `apps/web/__tests__/loadboard/load-board.test.tsx` | Load board: dashboard, post load, search |
| CREATE | `apps/web/__tests__/tms/tracking-map.test.tsx` | Tracking map: renders, loads pins |
| CREATE | `apps/web/__tests__/tms/rate-confirmation.test.tsx` | Rate con: PDF preview, download |
| CREATE | `apps/web/__tests__/communication/email-triggers.test.tsx` | Email triggers: correct events fire emails |

**Acceptance criteria:**

- [ ] Load board: dashboard renders stats, post load form works, search filters
- [ ] Tracking map: renders without errors, displays load markers
- [ ] Rate confirmation: PDF preview renders
- [ ] Email triggers: rate con sent on dispatch, delivery notification on POD upload
- [ ] Coverage: >=50% for Phase 5 components

## Dependencies

- Blocked by: All Phase 0-5 tasks (components must exist to test)
- Blocks: RELEASE-001 (go-live requires test passage)

## Reference

- Testing strategy: `dev_docs/08-standards/72-testing-strategy.md`
- Test fixtures: `dev_docs/11-ai-dev/90-seed-data-fixtures.md`
- Tools: Jest, @testing-library/react, @testing-library/user-event, MSW
- Expert: Section 7 ("Testing is an afterthought"), Section 9.3 ("Test as you go")
