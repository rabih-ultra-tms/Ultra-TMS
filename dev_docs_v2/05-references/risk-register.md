# Risk Register

> Top risks for the 16-week MVP sprint. Reviewed at each phase boundary.

---

## Active Risks

| # | Risk | Impact | Likelihood | Phase | Mitigation |
|---|------|--------|-----------|-------|------------|
| 1 | **COMP-001 (Design Tokens) quality issues cascade** — every Phase 2+ screen depends on tokens. Poor tokens = poor UI everywhere. | High | Low | 1 | Quality gate: 2-person review of COMP-001 before any Phase 2 work begins. Test tokens against 3+ screens before declaring done. |
| 2 | **WebSocket infra (INFRA-001) delayed** — blocks Dispatch Board (TMS-011), Ops Dashboard (TMS-012), Tracking Map (TMS-013). Three screens dead in water. | High | Medium | 4 | INFRA-001 has zero blockers — start it Week 8 Day 1. Fallback: polling-based MVP if WebSocket proves complex. |
| 3 | **858-line carrier monolith harder to refactor** — `carrier-detail-page.tsx` is a single file with mixed concerns. Decomposition may surface hidden bugs. | Medium | Medium | 2 | CARR-001 can reference Truck Types page as gold standard. Read existing code first, extract incrementally, test after each extraction. |
| 4 | **TMS-005 (New Order Form) too large for one session** — estimated at XL (10h). Context rot risk if attempted in single sitting. | Medium | High | 4 | Split into sub-tasks at execution time: form skeleton → validation → API wiring → stop management → review. Max 3h per sub-session. |
| 5 | **Two developers stepping on each other** — Claude Code + Codex/Gemini working on same codebase. Merge conflicts, duplicated work, inconsistent patterns. | Medium | Medium | All | Phase-based separation (Dev A = TMS, Dev B = Sales in Phase 3). STATUS.md tracks assignments. Shared components built first (Phase 1-2). |
| 6 | **Context rot in long AI sessions** — AI loses track of requirements mid-implementation. Drift from plan, missed details, wrong patterns. | High | High | All | Anti-context-rot protocol: max 6 files before coding, session kickoff reads hub file, Context Headers in every task file. |
| 7 | **QuickBooks OAuth complexity underestimated** — INTEG-002 requires OAuth 2.0 flow, webhook handling, entity mapping. Could take 2-3x estimated time. | Medium | Medium | 6 | Spike during Phase 5 to validate OAuth flow. Backend team has OAuth experience from auth module. Fallback: CSV export if OAuth fails. |

---

## Risk Matrix

```
              Low Impact    Medium Impact    High Impact
            ┌─────────────┬────────────────┬────────────────┐
High        │             │ #4 TMS-005     │ #6 Context rot │
Likelihood  │             │                │                │
            ├─────────────┼────────────────┼────────────────┤
Medium      │             │ #3 Carrier     │ #2 WebSocket   │
Likelihood  │             │ #5 Dev overlap │                │
            │             │ #7 QuickBooks  │                │
            ├─────────────┼────────────────┼────────────────┤
Low         │             │                │ #1 Design      │
Likelihood  │             │                │    tokens      │
            └─────────────┴────────────────┴────────────────┘
```

---

## Retired Risks

| # | Risk | Outcome | Date |
|---|------|---------|------|
| — | No retired risks yet | — | — |

---

## Review Schedule

| When | Action |
|------|--------|
| Phase 0 → 1 boundary (Week 2) | Review risks #1, #5, #6 |
| Phase 2 → 3 boundary (Week 5) | Review risks #1, #3, #5 |
| Phase 3 → 4 boundary (Week 8) | Review risks #2, #4, #5 |
| Phase 5 → 6 boundary (Week 14) | Review risks #2, #7 |
| Go-live (Week 16) | Final risk assessment |
