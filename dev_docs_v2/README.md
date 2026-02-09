# Ultra TMS — dev_docs_v2 (Execution Layer)

> This is the **"what to do now"** layer. For specs and design docs, see `dev_docs/`.

---

## For AI Agents: Start Here

1. `CLAUDE.md` loads automatically (project context)
2. **Read the service hub file** in `03-services/` for the service you're working on — it has EVERYTHING (status, screens, API, components, bugs, tasks, design links)
3. Read `STATUS.md` → find your specific task
4. Read the task file in `01-tasks/{current-phase}/`

**The service hub file is your single source of truth.** One file per service, all info consolidated.

**Maximum files before coding: 6** — see `00-foundations/session-kickoff.md`

---

## 16-Week Sprint Calendar

| Phase | Weeks | Focus | Tasks | Est. Hours |
|-------|-------|-------|-------|------------|
| **0** | **1** | **Emergency Fixes** | BUG-001→010 | 20-28h |
| 1 | 2 | Design Foundation | COMP-001→008 | 20-28h |
| 2 | 3-4 | Patterns + Carrier | PATT-001→003, CARR-001→003, COMP-009→010 | 22-32h |
| 3 | 5-7 | TMS Viewing + Sales | TMS-001→004, SALES-001→003 | 38h |
| 4 | 8-10 | TMS Forms + Operations | TMS-005→012, INFRA-001 | 57h |
| 5 | 11-13 | Load Board + Polish | TMS-013→014, LB-001→005, TEST-001 | 37h |
| 6 | 14-16 | Financial + Go-Live | ACC-001→006, COM-001→006, INTEG-001→002, RELEASE-001 | 55h |

**Total: ~250-280 hours over 16 weeks (~17h/week for 2 developers)**

### Current Phase: 0 — Emergency Fixes (Week 1)

See `STATUS.md` for full task tables across all phases.

---

## Quick Links

| What | Where |
|------|-------|
| Task dashboard | `STATUS.md` |
| Session kickoff guide | `00-foundations/session-kickoff.md` |
| Design tokens | `00-foundations/design-system.md` |
| Quality gates | `00-foundations/quality-gates.md` |
| Feature audit results | `04-audit/_summary.md` |
| Component inventory | `02-components/_index.md` |
| **Service hub files** | **`03-services/{service}.md` — single source of truth per service** |
| Service index | `03-services/_index.md` |
| Doc map (find anything) | `05-references/doc-map.md` |
| Dependency graph | `05-references/dependency-graph.md` |
| Route map (all 47 routes) | `05-references/route-map.md` |
| TypeScript cheat sheet | `05-references/typescript-cheatsheet.md` |
| React hook patterns | `05-references/react-hook-patterns.md` |
| Design spec matrix | `05-references/design-spec-matrix.md` |
| Dev environment setup | `05-references/dev-quickstart.md` |
| Risk register | `05-references/risk-register.md` |

---

## Folder Structure

```
dev_docs_v2/
├── README.md                    ← You are here
├── STATUS.md                    ← Task dashboard (check before starting work)
├── CHANGELOG.md                 ← Completed work log
│
├── 00-foundations/               ← How to work
│   ├── session-kickoff.md       ← Anti-context-rot playbook
│   ├── design-system.md         ← Design tokens, colors, typography
│   └── quality-gates.md         ← 4-level quality checklist
│
├── 01-tasks/                     ← THE bite-size task files (65 total)
│   ├── phase-0-bugs/            ← Week 1: 10 emergency fixes
│   ├── phase-1-design/          ← Week 2: 8 design foundation tasks
│   ├── phase-2-patterns/        ← Weeks 3-4: 8 pattern + refactor tasks
│   ├── phase-3-tms-viewing/     ← Weeks 5-7: 7 TMS viewing + sales tasks
│   ├── phase-4-tms-forms/       ← Weeks 8-10: 9 TMS forms + operations tasks
│   ├── phase-5-loadboard/       ← Weeks 11-13: 8 load board + polish tasks
│   └── phase-6-financial/       ← Weeks 14-16: 15 financial + go-live tasks
│
├── 02-components/                ← Component inventory
│   └── _index.md
│
├── 03-services/                  ← Service hub files (single source of truth)
│   ├── _index.md                ← All 38 services overview
│   ├── 01-auth-admin.md         ← Auth & Admin hub
│   ├── 01.1-dashboard-shell.md  ← Dashboard Shell hub
│   ├── 02-crm.md                ← CRM hub
│   ├── 03-sales.md              ← Sales hub
│   ├── 04-tms-core.md           ← TMS Core hub (most critical)
│   ├── 05-carrier.md            ← Carrier hub
│   ├── 06-accounting.md         ← Accounting hub
│   ├── 07-load-board.md         ← Load Board hub
│   └── 08-commission.md         ← Commission hub
│
├── 04-audit/                     ← Feature audit results (from live code)
│   ├── _summary.md
│   ├── auth-admin.md
│   ├── crm.md
│   ├── sales-carrier.md
│   ├── backend-wiring.md
│   └── components.md
│
└── 05-references/                ← Developer references
    ├── doc-map.md               ← Where to find anything in dev_docs/
    ├── dependency-graph.md      ← Task DAG, critical path, parallel work plan
    ├── route-map.md             ← All 47 MVP routes by service
    ├── typescript-cheatsheet.md ← Entity interfaces, shared types
    ├── react-hook-patterns.md   ← React Query conventions, copy-paste skeletons
    ├── design-spec-matrix.md    ← 98 design specs mapped to tasks
    ├── dev-quickstart.md        ← Zero-to-running setup guide
    └── risk-register.md         ← Top 7 risks with mitigations
```

---

## For Two Developers

1. Check `STATUS.md` before starting
2. If a task is unassigned, write your name and set "IN PROGRESS"
3. If a task is assigned to the other person, pick a different task
4. Dependencies listed in each task file prevent starting blocked tasks
5. Phase folders naturally separate work areas

---

## Architecture

`dev_docs_v2` is the **execution layer**. `dev_docs/` is the **spec layer**.

- **Service hub files** (`03-services/*.md`) = single source of truth per service. Links to everything.
- **Task files** (`01-tasks/`) = bite-size work items. One task = one session = one commit.
- **Design specs** → still in `dev_docs/12-Rabih-design-Process/` (linked from hub files)
- **Dev prompts** → still in `dev_docs/11-ai-dev/` (linked from hub files)
- **Review findings** → still in `dev_docs/Claude-review-v1/` (linked from audit files)
