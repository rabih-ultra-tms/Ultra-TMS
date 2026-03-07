# Global UX Patterns & Standards

**Source:** `dev_docs/12-Rabih-design-Process/00-global/` (files 10-17)
**Scope:** Interaction patterns that apply across all services

---

## File Index

| # | File | Purpose | Integration Point |
|---|------|---------|-------------------|
| 10 | `10-bulk-operations-patterns.md` | Multi-select, bulk actions (delete, status change, export) | Maps to: DataTable multi-select, BACK-023 (bulk operations task) |
| 11 | `11-keyboard-shortcuts-map.md` | Power-user keyboard shortcuts (Cmd+K search, navigation) | Maps to: UX-008 (keyboard shortcuts task), command palette |
| 12 | `12-notification-patterns.md` | Toast, banner, badge, and sound notification patterns | Maps to: `components/ui/toast`, notification bell, UX-020 |
| 13 | `13-missing-screens-proposals.md` | Screens identified as needed but not yet specified | Maps to: backlog planning, P2/P3 service screens |
| 14 | `14-competitive-benchmarks.md` | Feature comparison with McLeod, TMW, Revenova, etc. | Reference: industry readiness gap analysis |
| 15 | `15-animation-micro-interactions.md` | Transition, hover, loading, and success animations | Maps to: Tailwind `transition-*` classes, ACC-010 (reduced motion) |
| 16 | `16-stitch-tips-and-patterns.md` | Tips for using Stitch design tool to generate components | Reference: design-to-code workflow |
| 17 | `17-accessibility-checklist.md` | WCAG 2.1 AA checklist for all screens | Maps to: ACC-001 through ACC-010 (accessibility tasks) |

---

## Implementation Status

| Pattern | Design Spec | Implemented | Notes |
|---------|-------------|-------------|-------|
| Bulk operations | Multi-select + action bar | Not built | DataTable doesn't support selection yet |
| Keyboard shortcuts | Cmd+K, navigation hotkeys | Not built | UX-008 backlog task |
| Toast notifications | Success/error/warning toasts | Partial | shadcn Toast exists but not used consistently |
| Notification system | Bell icon + dropdown + unread count | Partial | Backend endpoint exists (`communication/notifications`), frontend not wired |
| Animations | Micro-interactions, transitions | Minimal | Basic Tailwind transitions only |
| Accessibility | ARIA, keyboard nav, screen reader | Minimal | ACC-001 through ACC-010 backlog tasks |
| Command palette | Cmd+K global search/action | Not built | Dashboard shell spec has it |

---

## Priority for MVP

Only these global patterns are P0 for the 16-week MVP:
1. **Status color system** (03) — required for all list/detail pages
2. **Screen template** (04) — consistent layout pattern
3. **Notification toasts** (12) — user feedback for CRUD operations
4. **Print layouts** (08) — rate confirmation PDF is P0

Everything else (bulk ops, keyboard shortcuts, animations, accessibility) is P1/P2 and tracked in the backlog.
