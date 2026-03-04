# UI Design Overhaul — Command Center

**Direction:** A — Command Center (Samsara/project44 inspired)
**Started:** 2026-02-17
**Constraint:** Dispatch board design preserved

---

## Quick Start (New Session)

1. Read this file
2. Read `token-mapping.md` for the old→new class reference
3. Find the next unchecked phase below
4. Open the phase doc in `phases/`
5. Work through the checklist, build after each file
6. Update checkboxes here when phase is done

---

## What's Done

- [x] **Phase 0** — Discovery & Audit (119 pages, 285 components, 1,193 violations found)
- [x] **Phase 1** — Design research + 3 directions proposed → **Command Center** chosen
- [x] **Phase 3** — Token foundation updated in `globals.css`:
  - Brand hue: 222→250 (electric indigo)
  - Brand chroma: 0.18→0.22 (richer)
  - Background: warm near-white → cool gray
  - Borders: warm beige (hue 35) → cool slate (hue 260)
  - Shadows: single layer → double layer (premium depth)
  - Sidebar tokens: refined dark navy
  - Dark mode: all tokens updated to match
- [x] **Phase 4** — Shell transformed:
  - Sidebar: `bg-background` → `bg-sidebar` (dark navy)
  - Nav items: use sidebar color tokens
  - Group labels: uppercase tracking, sidebar-foreground/40
  - All sidebar borders use sidebar-border token
- [x] **Phase 5.1** — Dashboard polished:
  - KPI cards with colored left accent bars
  - Uppercase tracking-wider labels
  - Quick actions grid with hover effects
  - Removed logout button from dashboard (accessible via user menu)
- [x] **Phase 5.2** — Table base component:
  - Header bg: `bg-muted/50`
  - Header text: uppercase tracking-wider text-text-secondary
- [x] **Phase 5.5** — Login page:
  - Dark navy background (`bg-sidebar`)
  - Brand logo + tagline above card
  - White card floats on dark backdrop

---

## What's Next

- [ ] **Phase 7A** — TMS Core migration (~312 patterns) → `phases/phase-7a-tms-core.md`
- [ ] **Phase 7B** — Load Planner migration (~523 patterns, PROTECTED) → `phases/phase-7b-load-planner.md`
- [ ] **Phase 7C** — Sales/Accounting/Carriers migration (~121 patterns) → `phases/phase-7c-sales-accounting-carriers.md`
- [ ] **Phase 7D** — UI Primitives & Shared (~44 patterns) → `phases/phase-7d-ui-primitives-shared.md`

---

## Progress Tracker

| Phase | Files | Patterns | Status |
|-------|-------|----------|--------|
| 7A — TMS Core | 28 | 312 | Not started |
| 7B — Load Planner (PROTECTED) | 10 | 523 | Not started |
| 7C — Sales/Accounting/Carriers | 14 | 121 | Not started |
| 7D — UI/Shared | 16 | 44 | Not started |
| **TOTAL** | **68** | **1,000** | **0%** |

(~193 patterns already fixed by token changes + dashboard rewrite)

---

## Key Rules

1. **Never break functionality** — build after every file
2. **Dispatch board is sacred** — only change structural grays, never status colors
3. **Load Planner is PROTECTED** — change colors only, zero logic changes
4. **Intent/status colors stay semantic** — red=danger, green=success, yellow=warning, blue=info
5. **Use `token-mapping.md`** — every replacement is documented there
6. **One commit per phase** — easy rollback
7. **Build command:** `cd apps/web && npx next build`

---

## File Reference

| File | Purpose |
|------|---------|
| `audit-report.md` | Phase 0 complete inventory |
| `design-system.md` | Command Center design spec |
| `token-mapping.md` | Old→new class replacement table |
| `phases/phase-7a-tms-core.md` | TMS migration checklist |
| `phases/phase-7b-load-planner.md` | Load Planner migration checklist |
| `phases/phase-7c-sales-accounting-carriers.md` | Sales/Accounting/Carriers checklist |
| `phases/phase-7d-ui-primitives-shared.md` | UI primitives checklist |

---

## Tech Reference

- **Build:** `cd apps/web && npx next build`
- **Dev:** `cd apps/web && pnpm dev`
- **Storybook:** `cd apps/web && pnpm storybook`
- **Tokens:** `apps/web/app/globals.css` (all 3 layers)
- **Tailwind:** `apps/web/tailwind.config.ts`

---

*Last updated: 2026-02-17*
