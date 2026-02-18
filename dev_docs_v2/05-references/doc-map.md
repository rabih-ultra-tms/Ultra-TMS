# Documentation Map

Where to find things across the project documentation.

---

## Quick Lookup

| Need | Location |
|------|----------|
| **Project context (AI auto-reads)** | `CLAUDE.md` |
| **Current project state** | `dev_docs/CURRENT-STATE.md` |
| **MVP scope (8 services, 16 weeks)** | `CLAUDE.md` → "P0 MVP Scope" section |
| **16-week action plan** | `dev_docs/Claude-review-v1/00-executive-summary/prioritized-action-plan.md` |
| **Task tracking** | `dev_docs_v2/STATUS.md` |
| **Business rules quick ref** | `dev_docs_v2/05-references/business-rules-quick-ref.md` |
| **Screen-to-API registry** | `dev_docs_v2/05-references/screen-api-registry.md` |

---

## By Task Type

### Building a new screen

| What | Location |
|------|----------|
| Web dev prompt (routes, components, hooks) | `dev_docs/11-ai-dev/web-dev-prompts/{service}-ui.md` |
| Full design spec (15-section format) | `dev_docs/12-Rabih-design-Process/{service-folder}/{screen}.md` |
| Design-to-code workflow | `dev_docs/Claude-review-v1/04-screen-integration/01-design-to-code-workflow.md` |
| Screen priority matrix | `dev_docs/Claude-review-v1/04-screen-integration/03-screen-priority-matrix.md` |
| Quality gates checklist | `dev_docs_v2/00-foundations/quality-gates.md` |
| Pre-feature checklist | `dev_docs/08-standards/74-pre-feature-checklist.md` |

### Fixing bugs

| What | Location |
|------|----------|
| Full bug inventory (29 bugs) | `dev_docs/Claude-review-v1/01-code-review/05-bug-inventory.md` |
| Bug task files | `dev_docs_v2/01-tasks/phase-0-bugs/` |

### Building API endpoints

| What | Location |
|------|----------|
| API dev prompt | `dev_docs/11-ai-dev/api-dev-prompts/{service}-api.md` |
| API standards | `dev_docs/08-standards/66-api-standards.md` |
| Database standards | `dev_docs/08-standards/67-database-standards.md` |
| Prisma schema | `apps/api/prisma/schema.prisma` |
| Existing API modules | `apps/api/src/modules/` |
| MVP prompt index | `dev_docs/11-ai-dev/00-MVP-PROMPTS-INDEX.md` |

### Understanding the design system

| What | Location |
|------|----------|
| Design tokens reference | `dev_docs_v2/00-foundations/design-system.md` |
| Status color system (full) | `dev_docs/12-Rabih-design-Process/00-global/03-status-color-system.md` |
| Design system audit | `dev_docs/12-Rabih-design-Process/00-global/01-design-system-audit.md` |
| Component inventory | `dev_docs_v2/02-components/_index.md` |
| Quality gates | `dev_docs_v2/00-foundations/quality-gates.md` |

### Understanding scope and priorities

| What | Location |
|------|----------|
| Roadmap overview | `dev_docs/05-roadmap/52-roadmap-overview.md` |
| MVP reprioritization | `dev_docs/Claude-review-v1/02-plan-review/03-mvp-reprioritization.md` |
| Service specifications | `dev_docs/02-services/` (38 files) |
| Screen catalog (362 screens) | `dev_docs/03-design/47-screen-catalog.md` |
| Master screen catalog | `dev_docs/12-Rabih-design-Process/00-global/00-master-screen-catalog.md` |

---

## Design Specs by Service

| Service | Design Spec Folder | Content Level |
|---------|-------------------|---------------|
| 01 Auth & Admin | `12-Rabih-design-Process/01-auth-admin/` | Full (13 files) |
| 01.1 Dashboard Shell | `12-Rabih-design-Process/01.1-dashboard-shell/` | Full (6 files) |
| 02 CRM | `12-Rabih-design-Process/02-crm/` | Full (13 files) |
| 03 Sales | `12-Rabih-design-Process/03-sales/` | Full (11 files) |
| 04 TMS Core | `12-Rabih-design-Process/04-tms-core/` | Full (15 files) |
| 05 Carrier | `12-Rabih-design-Process/05-carrier/` | Full (13 files) |
| 06 Accounting | `12-Rabih-design-Process/06-accounting/` | Placeholder |
| 07 Load Board | `12-Rabih-design-Process/07-load-board/` | Placeholder |
| 08 Commission | `12-Rabih-design-Process/08-commission/` | Placeholder |
| 09-38 (Future) | `12-Rabih-design-Process/{folder}/` | Placeholder |

---

## Dev Prompts by Service

| Service | API Prompt | Web Prompt |
|---------|-----------|------------|
| 01 Auth & Admin | Already built | `web-dev-prompts/01-auth-admin-ui.md` |
| 01.1 Dashboard | Already built | `web-dev-prompts/01.1-dashboard-shell-ui.md` |
| 02 CRM | Already built | `web-dev-prompts/02-crm-ui.md` |
| 03 Sales | Already built | `web-dev-prompts/03-sales-ui.md` |
| 04 TMS Core | `api-dev-prompts/01-tms-core-api.md` | `web-dev-prompts/04-tms-core-ui.md` |
| 05 Carrier | `api-dev-prompts/02-carrier-api.md` | `web-dev-prompts/05-carrier-ui.md` |
| 06 Accounting | Not created | `web-dev-prompts/06-accounting-ui.md` |
| 07 Load Board | Not created | `web-dev-prompts/07-load-board-ui.md` |
| 08 Commission | Not created | `web-dev-prompts/08-commission-ui.md` |

All prompts are at: `dev_docs/11-ai-dev/`
