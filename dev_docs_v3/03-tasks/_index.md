# Task Index — Ultra TMS Quality Sprint

> Active sprint: Quality Sprint (QS-001 through QS-010)
> Last updated: 2026-03-07

---

## Sprint Overview

| Metric | Value |
|--------|-------|
| Sprint name | Quality Sprint |
| Sprint goal | Verify 98 routes render, fix P0 bugs, complete missing endpoints |
| Active tasks | 10 (QS-001 through QS-010) |
| Estimated hours | ~46-72h total |
| Assigned to | Claude Code (XL tasks) + Gemini/Codex (M tasks) |

---

## Quality Sprint Tasks

| ID | Title | Priority | Effort | Status | Assignee |
|----|-------|----------|--------|--------|---------|
| [QS-001](sprint-quality/QS-001-websocket-gateways.md) | WebSocket Gateways | P0 | XL (12-16h) | planned | Claude Code |
| [QS-002](sprint-quality/QS-002-soft-delete-migration.md) | Soft Delete Migration | P1 | M (2-4h) | planned | Claude Code |
| [QS-003](sprint-quality/QS-003-accounting-dashboard-endpoint.md) | Accounting Dashboard Endpoint | P0 | M (2-4h) | planned | Claude Code |
| [QS-004](sprint-quality/QS-004-csa-scores-endpoint.md) | CSA Scores Endpoint | P1 | S (1-2h) | planned | Codex |
| [QS-005](sprint-quality/QS-005-profile-page.md) | Profile Page | P1 | L (4-8h) | planned | Claude Code |
| [QS-006](sprint-quality/QS-006-check-call-form-rhf.md) | Check Call Form RHF Refactor | P2 | M (2-4h) | planned | Codex |
| [QS-007](sprint-quality/QS-007-cors-env-variable.md) | CORS Env Variable | P1 | S (1h) | planned | Codex |
| [QS-008](sprint-quality/QS-008-runtime-verification.md) | Runtime Verification | P0 | L (4-8h) | planned | Claude Code |
| [QS-009](sprint-quality/QS-009-delete-bak-dirs.md) | Delete .bak Directories | P3 | S (30min) | planned | Anyone |
| [QS-010](sprint-quality/QS-010-triage-todos.md) | Triage 339 TODOs | P2 | M (2-4h) | planned | Claude Code |

---

## Task Depth Dashboard

| Task | DB | API | FE | Component | E2E | Tests | Security | Docs |
|------|----|----|----|-----------|----|-------|----------|------|
| QS-001 | - | ✓ | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| QS-002 | ✓ | ✓ | - | - | - | ✓ | - | ✓ |
| QS-003 | ✓ | ✓ | - | - | - | ✓ | - | ✓ |
| QS-004 | - | ✓ | - | - | - | ✓ | - | ✓ |
| QS-005 | - | - | ✓ | ✓ | ✓ | - | - | ✓ |
| QS-006 | - | - | ✓ | ✓ | - | - | - | ✓ |
| QS-007 | - | ✓ | - | - | - | - | ✓ | ✓ |
| QS-008 | - | - | ✓ | - | ✓ | - | - | ✓ |
| QS-009 | - | - | - | - | - | - | - | ✓ |
| QS-010 | - | - | - | - | - | - | - | ✓ |

**Layers covered:** DB=1, API=5, FE=4, Component=3, E2E=3, Tests=3, Security=2, Docs=10
**Average layers per task:** 3.1/8 — meets minimum threshold (≥1 layer per task)

---

## Execution Order (Dependency-Resolved)

```
Week 1:
  Day 1-2: QS-007 (30min, quick win) + QS-009 (30min)
  Day 2-4: QS-003 (accounting endpoint — unblocks accounting screens)
  Day 4-5: QS-004 (CSA endpoint — small, parallelize)

Week 2:
  Day 1-2: QS-002 (soft delete migration)
  Day 3-5: QS-008 (runtime verification — discover what's actually broken)

Week 3:
  Day 1-5: QS-001 (WebSocket gateways — largest task)

Week 4:
  Day 1-2: QS-005 (profile page — blocks user experience)
  Day 3-4: QS-006 (check call form refactor)
  Day 5:   QS-010 (TODO triage)
```

---

## Completed Tasks

See `dev_docs_v3/03-tasks/completed/_summary.md` — links to dev_docs_v2 phases (71/72 tasks completed Feb 2026).

---

## Backlog

See `dev_docs_v3/03-tasks/backlog/_index.md` — organized by priority tier.
