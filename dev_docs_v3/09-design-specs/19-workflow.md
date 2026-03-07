# Workflow Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/19-workflow/` (9 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/workflow/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-workflow-dashboard.md` | — | Not built | P2 |
| 02 | `02-workflow-templates.md` | — | Not built | P2 |
| 03 | `03-workflow-builder.md` | — | Not built | P2 |
| 04 | `04-workflow-instances.md` | — | Not built | P2 |
| 05 | `05-approval-queue.md` | — | Not built | P2 |
| 06 | `06-workflow-history.md` | — | Not built | P2 |
| 07 | `07-automation-rules.md` | — | Not built | P2 |
| 08 | `08-workflow-reports.md` | — | Not built | P2 |

---

## Backend

- Controller at `workflow/workflows.controller.ts`
- Exposes `actionLibrary` and `triggerSchemas` from constants file
- Full CRUD for workflow definitions + execution

---

## Implementation Notes

- Workflow automation engine — define triggers, conditions, and actions
- Action library: pre-built actions (send email, update status, create task, etc.)
- Trigger schemas: define when workflows fire (status change, time-based, etc.)
- Workflow builder (03) would be a complex visual editor — significant frontend effort
- All screens P2 — not in MVP scope
