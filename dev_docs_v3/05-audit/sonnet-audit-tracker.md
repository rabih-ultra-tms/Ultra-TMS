# Sonnet Audit Tracker — Ultra TMS

> **Audit conducted:** 2026-02-16 through 2026-02-17
> **Auditor:** Claude Sonnet 4.5
> **Files audited:** TMS-013, TMS-012, TMS-011d, TMS-011e (from dev_docs_v2 task IDs)
> **Finding:** None of the audited features worked at runtime despite being marked "DONE"

---

## Summary

| Metric | Count |
|--------|-------|
| Total bugs found | 62 |
| Fixed (Batch 1 - Feb 16) | 23 |
| Fixed (Batch 2 - Feb 17 morning) | 22 |
| Fixed (Batch 3 - Feb 17 afternoon) | 12 |
| Skipped / Deferred | 5 |
| **Total Fixed** | **57** |
| Still Open | 5 |

---

## Batch 1 Fixes (Feb 16 2026) — 23 bugs

Focus: API envelope unwrapping, stub button handlers, critical form bugs

| # | Bug | Fix Applied |
|---|-----|-------------|
| S001 | Orders list — data not unwrapped from `{data: {data: []}}` | Changed `response.data` to `response.data.data` |
| S002 | Orders list — empty handler on "New Order" button | Wired to router.push('/operations/orders/create') |
| S003 | Orders detail — status update button empty handler | Wired to PATCH /orders/:id endpoint |
| S004 | Orders detail — loading state never showed | Added isLoading check before rendering data |
| S005 | Loads list — pagination ignored (always page 1) | Added pagination state + URL params |
| S006 | Loads list — data not unwrapped | Fixed envelope |
| S007 | Loads detail — carrier display showed [object Object] | Fixed to show carrier.name |
| S008 | Loads detail — stops list empty (wrong prop name) | Fixed prop: `data.stops` not `data.load.stops` |
| S009 | Loads create form — no validation on submit | Added Zod schema validation |
| S010 | Loads create — form submitted even with errors | Fixed early return on validation failure |
| S011 | Dispatch board — all data from mock (enabled: true) | Changed to proper API call with enabled: !!loadId |
| S012 | Dispatch board — assign carrier button empty handler | Wired to POST /loads/:id/assign-carrier |
| S013 | Dispatch board — socket connection not attempted | Fixed SocketProvider to actually connect |
| S014 | Tracking map — positions not loaded | Fixed useTracking hook to call GET /tracking/positions |
| S015 | Tracking map — map never initialized | Fixed conditional rendering to show map only when loaded |
| S016 | Stop management — arrive/depart buttons empty | Wired to PATCH /stops/:id/arrive and /depart |
| S017 | Check calls — submit form not connected to API | Wired to POST /checkcalls |
| S018 | Check calls — existing calls not loaded | Fixed to call GET /checkcalls with loadId filter |
| S019 | Rate confirmation — PDF download button empty | Wired to GET /loads/:id/rate-confirmation (blob download) |
| S020 | Operations dashboard — KPI cards all 0 | Fixed useDashboard to call GET /operations/dashboard |
| S021 | Operations dashboard — charts not rendered | Fixed chart data parsing from API response |
| S022 | Operations dashboard — alerts not shown | Fixed useAlerts hook to call GET /operations/alerts |
| S023 | Operations activity — infinite scroll not working | Added IntersectionObserver + next page fetch |

---

## Batch 2 Fixes (Feb 17 morning) — 22 bugs

Focus: CRM, Sales, Auth, Admin pages

| # | Bug | Fix Applied |
|---|-----|-------------|
| S024 | CRM companies list — search didn't filter server-side | Added q param to API call |
| S025 | CRM company detail — no edit form | Added edit modal with PATCH /crm/customers/:id |
| S026 | CRM company detail — contact list used mock data | Fixed to call GET /crm/contacts?customerId=:id |
| S027 | CRM contacts list — no pagination | Added pagination to useContacts hook |
| S028 | CRM contact detail — form fields not populated on load | Fixed to map API response to form defaults |
| S029 | CRM leads list — status filter broken (wrong param name) | Fixed param: `status` not `leadStatus` |
| S030 | CRM lead detail — activity timeline not loaded | Fixed useOpportunityTimeline hook |
| S031 | CRM pipeline — drag-and-drop not wired | Added PATCH /crm/opportunities/:id on drop |
| S032 | Quotes list — data not unwrapped | Fixed envelope |
| S033 | Quotes list — "New Quote" button empty | Wired to router.push('/sales/quotes/create') |
| S034 | Quote detail — status badge wrong color | Fixed to use StatusBadge from design system |
| S035 | Quote create — cargo items not sent to API | Fixed form data serialization |
| S036 | Admin users list — delete button empty | Wired to DELETE /admin/users/:id |
| S037 | Admin user detail — role assignment not saved | Fixed PATCH /admin/users/:id with roles array |
| S038 | Admin roles list — create form not submitted | Fixed POST /admin/roles |
| S039 | Admin permissions — matrix changes not saved | Fixed PUT /admin/permissions |
| S040 | Auth register page — form submit empty handler | Wired to POST /auth/register |
| S041 | Auth forgot password — no success state shown | Added success message after API call |
| S042 | Auth reset password — token not read from URL | Fixed to read token from searchParams |
| S043 | MFA enable — QR code not displayed | Fixed to display base64 QR image from API |
| S044 | MFA verify — success not handled (loop) | Fixed to redirect to dashboard on success |
| S045 | Audit logs — filters not applied to API call | Fixed to include all active filters as query params |

---

## Batch 3 Fixes (Feb 17 afternoon) — 12 bugs

Focus: Carriers, shared hooks, global patterns

| # | Bug | Fix Applied |
|---|-----|-------------|
| S046 | Carrier list — sortBy/sortOrder not sent to API | Fixed to include sort params |
| S047 | Carrier create form — truck types not loaded | Fixed to call GET /truck-types for dropdown |
| S048 | Carrier edit — form fields blank on load | Fixed to populate from GET /carriers/:id |
| S049 | Carrier scorecard — all metrics 0 | Fixed useCarrierPerformance hook API call |
| S050 | Truck types — useMemo side effect (form reset) | Fixed: moved form reset to useEffect |
| S051 | Navigation — 5 links pointing to 404 routes | Fixed navigation.ts: invoices→/accounting/invoices etc. |
| S052 | Global — API client adding wrong Authorization header | Fixed: removed manual Bearer token (uses cookies) |
| S053 | Global — SocketProvider infinite loop | Fixed: moved socket.connect() outside useEffect dep array |
| S054 | Global — all hooks missing error handling | Added onError callbacks to all useQuery calls |
| S055 | Global — 8 pages missing empty state | Added EmptyState component to list pages |
| S056 | Global — loading states using bare "Loading..." text | Replaced with Skeleton components from design system |
| S057 | Global — window.confirm() in 7 places | Replaced in 4/7 with ConfirmDialog; 3 remain |

---

## Skipped / Deferred (5 bugs)

| # | Bug | Reason Skipped |
|---|-----|----------------|
| S058 | WebSocket gateways not implemented | Too large for audit session — became QS-001 |
| S059 | Accounting screens not built | Not in scope for Feb audit — became accounting backlog |
| S060 | Commission screens not built | Not in scope for Feb audit — became commission backlog |
| S061 | window.confirm() in 3 remaining places | Time constraint — added to P1 backlog |
| S062 | Profile page is 0/10 stub | Became QS-005 |

---

## Recurring Bug Patterns Identified

See `dev_docs_v3/05-audit/recurring-patterns.md` for detailed patterns.

Top 5 patterns found (>5 occurrences each):

1. **API envelope not unwrapped** (14 occurrences) — `response.data` instead of `response.data.data`
2. **Empty onClick handlers** (11 occurrences) — buttons with `onClick={() => {}}` or no handler
3. **Mock data left enabled** (8 occurrences) — `enabled: true` on mock queries in production code
4. **Unstable useEffect dependencies** (7 occurrences) — functions in dep arrays causing infinite loops
5. **Missing loading/error/empty states** (8 + 7 + 5 occurrences) — components crash or show blank

---

## Post-Audit Quality Score

Before Sonnet audit: **D+ (4/10)** — 62 bugs in 4 task areas
After Sonnet audit fixes: **C+ (6.2/10)** — 57 bugs fixed, 5 deferred

**Key observation:** The bugs were not about missing features — they were about code that *appears* complete but doesn't work at runtime. Every feature existed as a shell (component file, imports, JSX) but API calls were wrong, responses weren't unwrapped, and handlers were empty. This pattern suggests the original code was generated rapidly without runtime testing.

**Prevention:** QS-008 (runtime verification) + mandatory Playwright screenshots before any task can be marked complete.
