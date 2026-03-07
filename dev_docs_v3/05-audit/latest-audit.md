# Latest Audit — Ultra TMS Consolidated Findings

> **Format:** AUDIT-GENERATOR format
> **Source:** Consolidated from Claude Review v1 (Jan 2026), Gemini Review v2 (Jan 2026), Sonnet Audit (Feb 16-17 2026), Security Audit (Mar 6 2026)
> **Last updated:** 2026-03-07
> **Grade: C+ (6.2/10)**

---

## Header

| Field | Value |
|-------|-------|
| Project | Ultra TMS — 3PL Logistics Platform |
| Auditors | Claude (v1), Gemini (v2), Sonnet 4.5 (Feb audit), Sonnet 4.6 (Mar security audit) |
| Audit Date Range | Jan 2026 → Mar 2026 |
| Files Reviewed | 37 (Claude v1) + 2 (Gemini v2) + 4 focused (Sonnet) = ~43 unique files |
| Codebase Size | 98 routes, 304 components, 42 backend modules, 260 Prisma models |
| Grade | C+ (6.2/10) |
| Previous Grade | D+ (4/10) — after 57 bug fixes in Feb, grade improved |
| Next Review Target | B- (7/10) — after Quality Sprint completion |

---

## Grade & Scoring Breakdown

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Code Quality | 25% | 5.5/10 | TypeScript strict passes, but 5 bugs still open, localStorage tokens, stub patterns |
| Completeness | 30% | 6.0/10 | 8 services, ~60% screens built, 93% APIs exist, WebSocket missing |
| Standards Compliance | 25% | 7.0/10 | JWT guards, RBAC, multi-tenant isolation all correct |
| Tests | 20% | 4.0/10 | 72 tests pass, 8.7% coverage, no E2E, no integration tests for most services |
| **Overall** | 100% | **6.2/10** | C+ — strong foundation, execution gaps |

---

## Bug Inventory — P0 (Critical, Fix Immediately)

| # | Bug | File | Line | Impact | Status |
|---|-----|------|------|--------|--------|
| P0-001 | localStorage token storage (XSS risk) | `apps/web/lib/api/client.ts` | 59, 77 | Security — tokens exposed to XSS | OPEN |
| P0-002 | JWT logged to console (credential leak) | `apps/web/app/(dashboard)/admin/layout.tsx` | ~10 console.logs | Security — JWT visible in browser devtools | FIXED (Feb 2026) |
| P0-003 | Carrier Detail 404 — page.tsx missing | `apps/web/app/(dashboard)/carriers/[id]/page.tsx` | N/A — file missing | Core CRUD completely broken for carriers | FIXED (file exists — real implementation with tabs) |
| P0-004 | Load History Detail 404 — page.tsx missing | `apps/web/app/(dashboard)/load-history/[id]/page.tsx` | N/A — file missing | Load history drilldown broken | FIXED (file exists — quality TBD, QS-008 to verify) |

---

## Bug Inventory — P1 (High Priority)

| # | Bug | File | Line | Impact | Status |
|---|-----|------|------|--------|--------|
| P1-001 | CORS hardcoded to localhost — must use env variable | `apps/api/src/main.ts` | CORS config | Production deployment blocker | OPEN (QS-007) |
| P1-002 | SocketProvider infinite loop | `apps/web/components/providers/socket-provider.tsx` | useEffect | All WebSocket features affected | FIXED (Feb 2026) |
| P1-003 | `useMemo` with side effects | `apps/web/app/(dashboard)/truck-types/page.tsx` | ~270 | Form data won't populate in React 19 | FIXED (Feb 2026) |
| P1-004 | 5 sidebar links → 404 routes | `apps/web/lib/config/navigation.ts` | nav config | invoices, settlements, reports, help, settings | FIXED (Feb 2026) |
| P1-005 | `window.confirm()` used in 7 places | carriers, load-history, quote-history, truck-types pages | Various | Not accessible; deprecated pattern | PARTIAL — truck-types fixed |
| P1-006 | No search debounce on 3 list pages | carriers, load-history, quote-history | Search input | API hammered on every keystroke | PARTIAL |
| P1-007 | Delete buttons missing on contacts list | `apps/web/app/(dashboard)/crm/contacts/page.tsx` | N/A | CRM contacts can't be deleted from list | OPEN (BUG-009) |
| P1-008 | Delete buttons missing on leads list | `apps/web/app/(dashboard)/crm/opportunities/page.tsx` | N/A | Leads can't be deleted from list | OPEN (BUG-010) |
| P1-009 | Lead convert button missing | `apps/web/app/(dashboard)/crm/opportunities/[id]/page.tsx` | N/A | Cannot convert lead to customer | OPEN (BUG-011) |
| P1-010 | Pipeline stage confirm dialog missing | `apps/web/app/(dashboard)/crm/opportunities/page.tsx` | Pipeline view | Stage changes have no confirmation | OPEN |

---

## Bug Inventory — P2 (Medium Priority)

| # | Bug | File | Impact | Status |
|---|-----|------|--------|--------|
| P2-001 | Profile page is 0/10 stub | `apps/web/app/(dashboard)/profile/page.tsx` | User profile completely non-functional | OPEN (QS-005) |
| P2-002 | Profile edit not wired to API | `apps/web/app/(dashboard)/profile/page.tsx` | `PATCH /auth/me` endpoint exists but not called | OPEN (QS-005) |
| P2-003 | useDashboard hardcoded zeros | `apps/web/lib/hooks/operations/use-dashboard.ts` | KPI cards show 0/0/0/0 always | OPEN |
| P2-004 | Check call form uses raw form (not RHF) | `apps/web/app/(dashboard)/operations/check-calls/page.tsx` | Form validation inconsistent | OPEN (QS-006) |
| P2-005 | Accounting sidebar → 404 | All accounting routes | No accounting screens built | OPEN (P0 service gap) |
| P2-006 | Commission sidebar → 404 | All commission routes | No commission screens built | OPEN (P0 service gap) |
| P2-007 | API envelope not unwrapped in some hooks | Various hooks | Data renders as `[object Object]` | FIXED (57 bugs in Feb) |
| P2-008 | Stub buttons with empty onClick | Various pages | Buttons appear but do nothing | FIXED (57 bugs in Feb) |
| P2-009 | Unstable deps in useEffect | Various hooks | Infinite render loops | FIXED (57 bugs in Feb) |
| P2-010 | Mock data with `enabled: true` | Various hooks | Mock data served even in production builds | FIXED (57 bugs in Feb) |

---

## Bug Inventory — P3 (Low Priority / Tech Debt)

| # | Bug | Impact | Status |
|---|-----|--------|--------|
| P3-001 | 339 TODOs across codebase | Future features undocumented | OPEN (QS-010) |
| P3-002 | `.bak` directories: analytics.bak, workflow.bak, integration-hub.bak, documents.bak, carrier.bak | Dead code, confusing directory structure | OPEN (QS-009) |
| P3-003 | No Order soft delete | Orders can be permanently deleted | OPEN (QS-002) |
| P3-004 | No Quote soft delete | Quotes can be permanently deleted | OPEN (QS-002) |
| P3-005 | No Invoice soft delete | Invoices can be permanently deleted | OPEN (QS-002) |
| P3-006 | Hardcoded hex colors in components | Uses hex instead of CSS tokens | PARTIAL — ongoing |
| P3-007 | Missing CSP headers | No Content Security Policy configured | OPEN |
| P3-008 | No rate limiting | API can be abused without throttling | OPEN |
| P3-009 | No structured logging | NestJS default logger only | OPEN |
| P3-010 | No correlation IDs | Cross-service tracing impossible | OPEN |

---

## Security Findings (Detailed)

See `dev_docs_v3/05-audit/security-findings.md` for full details.

**Summary:**
- 4 P0 security issues — all FIXED as of Mar 6 2026
- 2 P1 security issues — OPEN (CORS env variable, localStorage tokens)
- 4 P2 security issues — OPEN (CSP headers, rate limiting, CSRF, secret scanning)

---

## Recommendations (Prioritized)

### Immediate (This Sprint — Quality Sprint)

1. **QS-001: WebSocket Gateways** — dispatch + tracking + notifications + dashboard. Entire real-time layer is missing. 4 screens affected.
2. **QS-003: Accounting Dashboard Endpoint** — `GET /accounting/dashboard` missing. Blocks entire accounting module.
3. **P0-001: localStorage Token Storage** — XSS vulnerability. Replace with secure HttpOnly cookie reads.
4. **P0-003/004: Carrier 404s** — Create missing `page.tsx` files for carrier detail and load history detail.
5. **QS-008: Runtime Verification** — Click every route with Playwright. Many screens marked "Done" in v2 may be stubs.

### Short-Term (Next 4 Weeks)

6. Build accounting screens (invoices, settlements, payments) — all APIs exist and are Production.
7. Build commission screens — APIs exist (partial), frontend completely missing.
8. Build TMS Core frontend screens — 12 routes, all APIs Production, page.tsx files may be stubs.
9. Fix check call form (QS-006) — refactor to React Hook Form.
10. Add soft delete to Order, Quote, Invoice, Settlement, Payment (QS-002).

### Medium-Term (2-3 Months)

11. Add search debounce to all list pages.
12. Replace all `window.confirm()` with ConfirmDialog component.
13. Implement structured logging (Pino).
14. Add correlation IDs.
15. Set up CI/CD pipeline.

---

## Protect List (Files That Must Not Be Modified)

| File | Reason | Quality |
|------|--------|---------|
| `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` | 1,825 LOC, AI cargo extraction, Google Maps, full quote lifecycle. Production-ready. | 9/10 |
| `apps/web/app/(dashboard)/truck-types/page.tsx` | Clean CRUD with inline editing. Gold standard for the codebase. | 8/10 |
| `apps/web/app/(auth)/login/page.tsx` | Working auth flow, properly secured. | 8/10 |

---

## Files Reviewed

| File | LOC | Quality | Notes |
|------|-----|---------|-------|
| `apps/api/src/modules/auth/auth.controller.ts` | ~200 | 8/10 | JWT guards correct, proper RBAC |
| `apps/api/src/modules/loads/loads.service.ts` | ~750 | 9/10 | Comprehensive, all business logic |
| `apps/api/src/modules/orders/orders.service.ts` | ~850 | 9/10 | Comprehensive, all business logic |
| `apps/api/src/modules/carriers/carriers.service.ts` | ~400 | 7/10 | Good but CSA scores stub |
| `apps/api/src/main.ts` | ~60 | 7/10 | Guards correct, CORS needs env var |
| `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` | 1,825 | 9/10 | PROTECTED — gold standard |
| `apps/web/app/(dashboard)/truck-types/page.tsx` | ~400 | 8/10 | PROTECTED |
| `apps/web/app/(auth)/login/page.tsx` | ~200 | 8/10 | PROTECTED |
| `apps/web/lib/api/client.ts` | ~150 | 5/10 | localStorage token storage is P0 bug |
| `apps/web/components/providers/socket-provider.tsx` | ~100 | 6/10 | Infinite loop fixed, WS not implemented |
| `apps/web/app/(dashboard)/crm/` (all pages) | ~1,200 total | 7/10 | CRUD works, missing delete/convert |
| `apps/web/app/(dashboard)/carriers/page.tsx` | ~350 | 5/10 | List works, detail 404 |
| `apps/web/app/(dashboard)/profile/page.tsx` | ~50 | 0/10 | Complete stub — no data |
| `apps/api/prisma/schema.prisma` | ~3,500 | 8/10 | 260 models, well-structured |

---

## Summary

**What's working well:**
- NestJS backend is strong — 42 modules, 260 models, production logic in core services
- Auth, RBAC, multi-tenant isolation are correctly implemented
- Design system (31 TMS components) is approved and consistent
- Core services (CRM CRUD, basic carriers) work end-to-end

**What needs the most attention:**
1. Frontend completeness — 40% of planned screens are stubs or unverified
2. WebSocket infrastructure — entire real-time layer missing (QS-001)
3. Runtime verification — 57 bugs were fixed "in theory" but never verified by clicking actual routes
4. Test coverage — 8.7% is dangerously low; most bug fixes have no regression tests

**Health trajectory:**
- Jan 2026: D+ (4/10) — initial audit revealed 29 bugs in first 8 services
- Feb 2026: C+ (6.2/10) — 57 of 62 runtime bugs fixed, design system built
- Target after Quality Sprint: B- (7/10) — WebSocket gateways + accounting + runtime verification
