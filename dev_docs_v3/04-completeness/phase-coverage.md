# Phase Coverage Matrix — Ultra TMS

> Cross-references: services × tasks × phases
> Last updated: 2026-03-07
> Purpose: Verify every service has tasks, every feature has implementation coverage

---

## Phase Map

| Phase | ID Prefix | Focus | Status |
|-------|-----------|-------|--------|
| Quality Sprint | QS-001 to QS-010 | Fix existing, verify routes, add missing endpoints | **Active** |
| Post-Quality | BUILD-001 to BUILD-011, BUG-001 to BUG-016 | Build missing screens, fix known bugs | Queued |
| TMS Core Completion | TMS-001 to TMS-005 | Verify + fix TMS Core screens (post QS-008) | Blocked (QS-008 first) |
| Testing | TEST-001 to TEST-006 | E2E and unit test coverage | Queued |
| Infrastructure | INFRA-001 to INFRA-005 | CI/CD, logging, monitoring | Queued |
| Pre-Launch | LEGAL, LAUNCH | Legal docs, production deploy | Deferred |

---

## Service × Phase Coverage

| Service | Quality Sprint | Post-Quality | TMS Core | Testing | Infra | Total Tasks |
|---------|---------------|-------------|----------|---------|-------|-------------|
| Auth & Admin | QS-005 (profile) | BUG-012, SEC-001-005 | — | TEST-001 | — | 7 |
| CRM | — | BUG-009, BUG-010, BUG-011, BUG-013 | — | — | — | 4 |
| Sales & Quotes | — | — | — | TEST-002 | — | 1 |
| TMS Core | QS-001 (WS), QS-008 (verify) | — | TMS-001 to TMS-005 | TEST-003 | — | 8 |
| Carriers | — | BUG-001, BUG-002, BUG-015 | — | — | — | 3 |
| Accounting | QS-002, QS-003 | BUILD-001 to BUILD-007 | — | TEST-004 | — | 9 |
| Commission | — | BUILD-008 to BUILD-010 | — | TEST-005 | — | 4 |
| Load Board | — | BUILD-011 | — | — | — | 1 |
| All Services | QS-007 (CORS), QS-008 (verify), QS-009 (bak dirs), QS-010 (TODOs) | UX-001, UX-002 | — | — | INFRA-001 to 005 | 9 |

---

## Feature × Task Layer Coverage

8-layer model: DB | API | FE | Component | E2E | Tests | Security | Docs

| Feature | DB | API | FE | Component | E2E | Tests | Security | Docs | Score |
|---------|----|----|----|-----------|----|-------|----------|------|-------|
| Auth flows | ✓ | ✓ | ✓ | ✓ | TEST-001 | ✓ | SEC-001-005 | ✓ | 8/8 |
| User profile | ✓ | ✓ | QS-005 | QS-005 | QS-005 | — | SEC-003 | ✓ | 6/8 |
| CRM CRUD | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | 5/8 |
| CRM delete/convert | ✓ | ✓ | BUG-009/010/011 | BUG-009/010/011 | — | — | — | ✓ | 5/8 |
| Sales & Quotes | ✓ | ✓ | ✓ | ✓ | TEST-002 | — | — | ✓ | 6/8 |
| Load Planner | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | 6/8 (PROTECTED) |
| Orders (TMS) | ✓ | ✓ | TMS-001 | TMS-001 | TEST-003 | TEST-006 | — | ✓ | 6/8 |
| Loads (TMS) | ✓ | ✓ | TMS-002 | TMS-002 | TEST-003 | TEST-006 | — | ✓ | 6/8 |
| Dispatch Board | ✓ | ✓ | QS-001 | QS-001 | — | — | — | ✓ | 6/8 |
| Tracking Map | ✓ | ✓ | QS-001 | QS-001 | — | — | — | ✓ | 6/8 |
| Check Calls | ✓ | ✓ | QS-006 | QS-006 | — | — | — | ✓ | 6/8 |
| Carriers | ✓ | ✓ | BUG-001/002 | BUG-001/002 | — | ✓ | — | ✓ | 6/8 |
| Carrier Scorecard | ✓ | QS-004 | — | — | — | QS-004 | — | ✓ | 4/8 |
| Accounting | QS-002 | QS-003 | BUILD-001-007 | BUILD-001-007 | — | TEST-004 | — | ✓ | 5/8 |
| Commission | ✓ | ✓ | BUILD-008-010 | BUILD-008-010 | — | TEST-005 | — | ✓ | 5/8 |
| Load Board | ✓ | — | BUILD-011 | BUILD-011 | — | — | — | ✓ | 4/8 |
| WebSocket/Real-time | — | QS-001 | QS-001 | QS-001 | — | — | QS-001 | ✓ | 5/8 |

---

## Services Without Tasks (Gap Analysis)

Services that have backend code but NO tasks assigned:

| Service | Backend Status | Why No Task | Action |
|---------|---------------|-------------|--------|
| Documents | Partial | P1 — queued for post-TMS-Core phase | Add to backlog when TMS Core done |
| Communication | Partial | P1 — needs design spec review | Add BUILD task when ready |
| Customer Portal | Partial | P2 | Add to P2 backlog |
| Carrier Portal | Partial | P2 | Add to P2 backlog |
| Contracts | Partial | P2 | Add to P2 backlog |
| Credit | Partial | P2 | Add to P2 backlog |
| Factoring | Partial | P2 | Add to P2 backlog |
| Claims | Partial | P1 | Add BUILD task when TMS Core done |
| Agents | Partial | P2 | Add to P2 backlog |
| Analytics | Partial | P2 | Add to P2 backlog |
| Workflow | Partial | P3 | Deferred |
| Search | Partial | P2 | Add to P2 backlog |

**Status:** These services have no tasks because they're not in the current sprint scope. This is intentional — not a gap.

---

## Coverage Summary

| Metric | Value |
|--------|-------|
| P0 services with active tasks | 8/8 (100%) |
| P0 features with ≥6/8 layers covered | 14/17 (82%) |
| P0 features with ≥8/8 layers covered | 1/17 (6%) |
| P1 services with backlog tasks | 5/6 (83%) |
| P2 services with backlog tasks | 0/7 (0% — intentional deferral) |
| Total sprint tasks | 10 (QS-001 to QS-010) |
| Total backlog tasks | 45+ |

**Target after Quality Sprint:** P0 features at ≥7/8 layers — achievable when BUILD and TMS tasks complete.
