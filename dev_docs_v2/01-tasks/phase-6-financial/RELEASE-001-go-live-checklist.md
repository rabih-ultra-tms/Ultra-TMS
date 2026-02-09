# RELEASE-001: Pre-Release & Go-Live Checklist

> **Phase:** 6 | **Priority:** P0 | **Status:** NOT STARTED
> **Effort:** M (4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs/04-checklists/75-pre-release-checklist.md` — Full pre-release checklist
3. `dev_docs/04-checklists/51-operations-infrastructure-sla.md` — SLA requirements

## Objective

Final quality sweep before MVP go-live. Run all quality gates across all modules, verify navigation, performance audit, security scan, and staging deployment. This is the last task before declaring the 16-week sprint complete.

## Checklist

### Code Quality
- [ ] `pnpm check-types` passes across entire monorepo
- [ ] `pnpm lint` passes with zero warnings
- [ ] No `any` types in new code (Phase 0-6)
- [ ] No `console.log` statements (except error boundaries)
- [ ] No hardcoded colors (all use design tokens)

### Navigation
- [ ] Every sidebar link works (no 404s)
- [ ] Every button/link is wired to an action
- [ ] Back buttons work on all detail/form pages
- [ ] Breadcrumbs correct on all pages

### Security
- [ ] No JWT tokens in console
- [ ] No tokens in localStorage (httpOnly cookies only)
- [ ] No hardcoded secrets in code
- [ ] RBAC enforced on all pages

### Performance
- [ ] Lighthouse score >80 on key pages (dashboard, orders list, dispatch board)
- [ ] Page load <3s on standard connection
- [ ] No memory leaks (WebSocket cleanup, React Query)

### Functionality
- [ ] All 8 MVP services have working screens
- [ ] CRUD works: create, read, update, delete for orders, loads, invoices, carriers
- [ ] Status machines work: order lifecycle, load lifecycle, invoice lifecycle
- [ ] Search/filter works on all list pages
- [ ] Pagination works on all list pages

### Deployment
- [ ] Staging deploy successful
- [ ] Smoke test on staging (login, create order, dispatch load, generate invoice)
- [ ] Error monitoring configured (Sentry or equivalent)
- [ ] Database backups verified

## Dependencies

- Blocked by: All Phase 0-6 tasks complete
- Blocks: Production go-live

## Reference

- Pre-release checklist: `dev_docs/04-checklists/75-pre-release-checklist.md`
- Quality gates: `dev_docs_v2/00-foundations/quality-gates.md`
- Operations/SLA: `dev_docs/04-checklists/51-operations-infrastructure-sla.md`
