# Sprint Plan — Quality Sprint

> Format: SPRINT-PLAN-GENERATOR
> Last updated: 2026-03-09
> Sprint goal: Verify all 98 routes render. Fix P0 bugs. Complete missing endpoints. No more "done in code, broken at runtime."

---

## Sprint Capacity

| Agent        | Available Days | Focus Hours/Day | Total Hours |
| ------------ | -------------- | --------------- | ----------- |
| Claude Code  | 10 days        | 3h              | 30h         |
| Gemini/Codex | 10 days        | 1.5h            | 15h         |
| **Total**    |                |                 | **45h**     |

**Rule:** Never commit more than 90% capacity. Reserved 5h for bug triage + doc updates = **40h committed**.

---

## Sprint Goal

> "Every P0 bug from the audit has a task. Every task that touches a route gets runtime-verified with Playwright. `pnpm check-types` runs clean. No stub buttons, no empty handlers, no hardcoded zeros."

---

## Committed Tasks (40h total)

| ID        | Title                               | Effort    | Priority | Assigned    | Status                                       |
| --------- | ----------------------------------- | --------- | -------- | ----------- | -------------------------------------------- |
| QS-001    | WebSocket Gateways (/notifications) | XL (14h)  | P0       | Claude Code | **DONE** (2026-03-09)                        |
| QS-012    | Rate Confirmation PDF               | —         | P0       | Claude Code | **DONE** (2026-03-09) — already implemented  |
| QS-013    | BOL PDF Generation                  | —         | P0       | Claude Code | **DONE** (2026-03-09)                        |
| QS-016    | Tenant Isolation Tests              | —         | P0       | Claude Code | **DONE** (2026-03-09) — 15 integration tests |
| QS-007    | CORS Env Variable                   | S (0.5h)  | P1       | Codex       | planned                                      |
| QS-009    | Delete .bak Directories             | S (0.5h)  | P3       | Codex       | planned                                      |
| QS-004    | CSA Scores Endpoint                 | S (2h)    | P1       | Codex       | planned                                      |
| QS-006    | Check Call Form RHF Refactor        | M (3h)    | P2       | Codex       | planned                                      |
| QS-002    | Soft Delete Migration               | M (3h)    | P1       | Claude Code | planned                                      |
| QS-003    | Accounting Dashboard Endpoint       | M (3h)    | P0       | Claude Code | planned                                      |
| QS-010    | Triage 339 TODOs                    | M (3h)    | P2       | Claude Code | **DONE** (2026-03-10)                        |
| QS-008    | Runtime Verification (Playwright)   | L (6h)    | P0       | Claude Code | planned                                      |
| QS-005    | Profile Page                        | L (6h)    | P1       | Claude Code | planned                                      |
| **Total** |                                     | **41.5h** |          |             |                                              |

---

## Stretch Goals (if capacity allows)

| ID      | Title                                | Effort | Condition                     |
| ------- | ------------------------------------ | ------ | ----------------------------- |
| BUG-001 | Carrier Detail 404 (create page.tsx) | M (3h) | If QS-008 confirms it's CRASH |
| BUG-002 | Load History Detail 404              | M (2h) | If QS-008 confirms it's CRASH |
| BUG-009 | CRM Contacts — Add delete button     | S (1h) | After CRM hub review          |
| BUG-012 | localStorage token storage fix       | M (2h) | High security priority        |

---

## Dependencies

| Task                      | Depends On         | Notes                                                     |
| ------------------------- | ------------------ | --------------------------------------------------------- |
| QS-010                    | QS-008 (preferred) | Triage is more accurate with verified route knowledge     |
| BUILD-001 (stretch)       | QS-003             | Accounting screen needs endpoint first                    |
| TMS-001/002 (post-sprint) | QS-008             | QS-008 determines if TMS screens are stubs or just broken |
| TMS-003/004 (post-sprint) | QS-001             | Dispatch + Tracking need WebSocket to work                |

---

## Risks

| Risk                                                        | Likelihood | Impact | Mitigation                                                               |
| ----------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------ |
| QS-001 (WebSocket) scope creep — more complex than expected | Medium     | High   | Time-box to 14h. Ship partial if needed. Document what's left.           |
| QS-008 reveals more broken routes than expected             | High       | Medium | Expected finding. Document all. Prioritize P0 fixes only in this sprint. |
| .bak directories have unique code (QS-009)                  | Low        | Low    | Diff first before deleting. Preserve any unique code.                    |
| pnpm dev fails to start (blocks QS-008)                     | Low        | High   | Ensure Docker infra is running first. Check logs.                        |
| Prisma migration (QS-002) causes downtime                   | Low        | Medium | Test on dev DB first. Back up before running.                            |

---

## Day-by-Day Schedule

### Claude Code

| Day | Task                                  | Hours | Deliverable                                                      |
| --- | ------------------------------------- | ----- | ---------------------------------------------------------------- |
| 1   | QS-002: Soft Delete Migration         | 3h    | Migration file + service updates                                 |
| 2   | QS-003: Accounting Dashboard Endpoint | 3h    | Working `GET /accounting/dashboard`                              |
| 3-7 | QS-001: WebSocket Gateways            | 14h   | ~~4 WS namespaces~~ → /notifications DONE (tribunal scoped down) |
| 8   | QS-008: Runtime Verification          | 6h    | 98 routes verified, STATUS updated                               |
| 9   | QS-005: Profile Page                  | 6h    | Working profile with edit + MFA sections                         |
| 10  | QS-010: TODO Triage + doc updates     | 3h    | Backlog updated, STATUS.md updated                               |

### Codex/Gemini

| Day | Task                        | Hours | Deliverable                   |
| --- | --------------------------- | ----- | ----------------------------- |
| 1   | QS-007 + QS-009             | 1h    | CORS fixed, .bak dirs deleted |
| 2-3 | QS-004: CSA Scores          | 2h    | Real CsaScore data from DB    |
| 4-6 | QS-006: Check Call Form RHF | 3h    | Form uses useForm + Zod       |

---

## Definition of Done (Per Task)

A task is DONE only when ALL of these are true:

- [ ] Implementation complete
- [ ] `pnpm check-types` passes with 0 errors
- [ ] `pnpm lint` passes with 0 warnings
- [ ] Tests pass (if modified files have tests)
- [ ] Playwright screenshot taken (for any UI change)
- [ ] Acceptance criteria from task file checked individually
- [ ] STATUS.md updated (task marked done)
- [ ] Service hub updated if APIs/screens changed
- [ ] CHANGELOG.md updated

---

## Sprint Review Template (Fill at End)

**Sprint completed:** \_**\_-\_\_**-\_\_\_\_

**Committed tasks completed:** \_\_ /10

**Stretch tasks completed:** \_\_ /4

**Routes passing (from QS-008):** \_\_ /98

**P0 bugs resolved this sprint:** \_\_

**TypeScript errors (should be 0):** \_\_

**Test count (start → end):** 72 → \_\_

## **Key wins:**

## **Key learnings:**

## **Carryover to next sprint:**
