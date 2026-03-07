# Sprint 04 — Commission & Agent Build

> **Duration:** 2 weeks
> **Goal:** Commission calculation engine + agent management frontend
> **Depends on:** Sprint 02 (Accounting), Sprint 03 (TMS Core — loads must exist)

---

## Sprint Capacity

| Agent | Available Days | Focus Hours/Day | Total Hours |
|-------|---------------|----------------|-------------|
| Claude Code | 10 | 3h | 30h |
| Gemini/Codex | 10 | 1.5h | 15h |
| **Total** | | | **45h** |

**Committed:** 38h

---

## Sprint Goal

> "Commission plans can be created, assigned to users, and auto-calculate when loads are delivered. Agent portal users can view their commissions and payouts."

---

## Committed Tasks

| ID | Title | Effort | Priority | Assigned | Status |
|----|-------|--------|----------|----------|--------|
| COM-001 | Commission Plan CRUD | M (4h) | P0 | Claude Code | planned |
| COM-002 | Commission Plan Tiers UI | M (3h) | P0 | Codex | planned |
| COM-003 | User Commission Assignment | M (3h) | P0 | Codex | planned |
| COM-004 | Commission Entry List + Detail | M (4h) | P0 | Claude Code | planned |
| COM-005 | Commission Payout Workflow | L (6h) | P0 | Claude Code | planned |
| COM-006 | Commission Dashboard | M (4h) | P1 | Claude Code | planned |
| COM-007 | Agent List + Create/Edit | M (4h) | P1 | Codex | planned |
| COM-008 | Agent Agreement Management | M (4h) | P1 | Claude Code | planned |
| COM-009 | Agent Customer Assignment | M (3h) | P2 | Codex | planned |
| COM-010 | Agent Payout View | M (3h) | P2 | Codex | planned |
| **Total** | | **38h** | | | |

---

## Acceptance Criteria

- [ ] Commission plans: FLAT, PERCENTAGE, TIERED types configurable
- [ ] Tier configuration with threshold ranges
- [ ] User-to-plan assignment with effective dates
- [ ] Auto-calculation trigger on load delivery (event-driven)
- [ ] Commission entry list: filter by period, user, status
- [ ] Payout workflow: calculate → approve → pay
- [ ] Agent CRUD with agreement management
- [ ] Agent customer assignments with protection periods

---

## Design Specs

- `dev_docs/12-Rabih-design-Process/08-commission/` — Commission screen specs
- `dev_docs/12-Rabih-design-Process/16-agents/` — Agent screen specs
- Hub: `dev_docs_v3/01-services/p0-mvp/commission.md`
