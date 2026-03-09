# Roadmap Phases — Ultra TMS

> **Total timeline:** 16 weeks MVP, ongoing post-MVP
> **Last updated:** 2026-03-09

---

## Phase Overview

```
Week 01-02  ████ Quality Sprint (IN PROGRESS — 4/13 tasks done)
Week 03-04  ████ Sprint 02: Accounting Build
Week 05-06  ████ Sprint 03: TMS Core Build
Week 07-08  ████ Sprint 04: Commission & Agent Build
Week 09-10  ████ Sprint 05: Security Hardening
Week 11-12  ████ Sprint 06: Testing & Stabilization
Week 13-14  ████ Sprint 07: Load Board + Polish
Week 15-16  ████ Sprint 08: Beta Launch Prep
```

---

## Phase 1: Foundation (Weeks 1-4) — Quality + Accounting

**Sprint Quality (in progress — 4/13 done):**

- ~~QS-001: WebSocket /notifications gateway~~ DONE (2026-03-09)
- ~~QS-012: Rate Confirmation PDF~~ DONE (2026-03-09)
- ~~QS-013: BOL PDF Generation~~ DONE (2026-03-09)
- ~~QS-016: Tenant Isolation Tests~~ DONE (2026-03-09)
- Runtime verification of all 98 routes (QS-008 — next up)
- Fix remaining P0 bugs (accounting endpoint, soft deletes)
- Delete .bak directories, triage TODOs, CORS fix, profile page

**Sprint 02 — Accounting:**
- Invoice CRUD (create, send, track aging)
- Payment recording (received + made)
- Settlement list and detail
- Chart of accounts view
- Accounting dashboard

**Exit criteria:** Accounting module fully functional, all routes verified

---

## Phase 2: Core Operations (Weeks 5-8) — TMS Core + Commission

**Sprint 03 — TMS Core:**
- Order lifecycle (create → assign → dispatch → deliver)
- Load management and tracking
- Dispatch board with real-time updates
- Check calls and status history
- Rate confirmation workflow

**Sprint 04 — Commission & Agents:**
- Commission plan configuration (flat, %, tiered)
- Auto-calculation on load delivery
- Payout workflow (calculate → approve → pay)
- Agent management and customer assignments

**Exit criteria:** Full order-to-cash flow works end-to-end

---

## Phase 3: Hardening (Weeks 9-12) — Security + Testing

**Sprint 05 — Security:**
- HttpOnly cookie migration (remove localStorage tokens)
- CSRF protection
- Rate limiting
- RBAC audit
- Audit logging

**Sprint 06 — Testing:**
- 40% backend test coverage (from ~15%)
- 25% frontend test coverage (from 8.7%)
- 5 E2E critical path tests
- CI pipeline setup
- Bug bash: zero P0/P1 bugs

**Exit criteria:** Production-grade security, reliable test suite

---

## Phase 4: Launch Prep (Weeks 13-16)

**Sprint 07 — Load Board + Polish:**
- Load board posting/bidding
- Carrier capacity search
- UI polish pass (loading states, empty states, transitions)
- Mobile responsiveness audit

**Sprint 08 — Beta Launch:**
- Performance optimization (bundle size, API latency)
- Monitoring setup (error tracking, APM)
- Documentation review
- Staging deployment
- Beta user onboarding
- Go/no-go checklist

**Exit criteria:** MVP ready for beta customers

---

## Post-MVP Roadmap (P1/P2/P3)

| Quarter | Services | Notes |
|---------|----------|-------|
| Q1 Post-MVP | Claims, Documents, Communication | P1 services |
| Q2 Post-MVP | Customer Portal, Carrier Portal, Contracts | P1 services |
| Q3 Post-MVP | Agents (full), Credit, Factoring, Analytics | P2 services |
| Q4 Post-MVP | Workflow, Integration Hub, Search | P2 services |
| Year 2 | Safety, EDI, HR, Help Desk, Feedback, etc. | P3 services |

---

## Key Metrics

| Metric | Current | MVP Target | Notes |
|--------|---------|-----------|-------|
| Overall Score | 6.2/10 (C+) | 8.0/10 (B+) | |
| Test Coverage (BE) | ~15% | 40% | |
| Test Coverage (FE) | 8.7% | 25% | |
| P0 Bugs | 3 | 0 | |
| P1 Bugs | 5 | 0 | |
| Routes Verified | 0/98 | 98/98 | Playwright |
| Screens Built | ~30 | ~50 | MVP scope |
| API Endpoints | ~187 | ~200 | |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-08 | v2 scope: 8 MVP services, not 38 | Focus on what customers need first |
| 2026-02-12 | Design system V1 approved | Navy accent, Inter font, dot-label badges |
| 2026-02-16 | Sonnet audit: 62 bugs found, 57 fixed | Quality gate before feature sprint |
| 2026-03-07 | v3 docs: cover all 38 services | Document everything, build in priority order |
| 2026-03-07 | Quality Sprint before new features | Runtime verification + P0 fixes first |
| 2026-03-09 | Consolidated sprints into 08-sprints/ | Deleted 01-sprints/ (stale pre-audit plans). 08-sprints/ is single source of truth |
