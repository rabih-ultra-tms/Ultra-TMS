# MVP Dev Prompts Index

**Quick reference to AI development prompts for the 8 P0 MVP services only.**

> There are 25 API prompts and 28 web prompts in this folder. **Only the ones below are in MVP scope.** Everything else is post-MVP — ignore unless explicitly asked.

---

## MVP Services → Prompt Files

| # | Service | API Prompt | Web Prompt | Design Spec Folder | Backend Status |
|---|---------|-----------|------------|-------------------|---------------|
| 01 | Auth & Admin | Already built | [01-auth-admin-ui.md](web-dev-prompts/01-auth-admin-ui.md) | `12-Rabih-design-Process/01-auth-admin/` | Working |
| 01.1 | Dashboard Shell | Already built | [01.1-dashboard-shell-ui.md](web-dev-prompts/01.1-dashboard-shell-ui.md) | `12-Rabih-design-Process/01.1-dashboard-shell/` | Working |
| 02 | CRM | Already built | [02-crm-ui.md](web-dev-prompts/02-crm-ui.md) | `12-Rabih-design-Process/02-crm/` | Working (basic) |
| 03 | Sales | Already built | [03-sales-ui.md](web-dev-prompts/03-sales-ui.md) | `12-Rabih-design-Process/03-sales/` | Working (basic) |
| 04 | TMS Core | [01-tms-core-api.md](api-dev-prompts/01-tms-core-api.md) | [04-tms-core-ui.md](web-dev-prompts/04-tms-core-ui.md) | `12-Rabih-design-Process/04-tms-core/` | **Backend exists but disconnected** |
| 05 | Carrier | [02-carrier-api.md](api-dev-prompts/02-carrier-api.md) | [05-carrier-ui.md](web-dev-prompts/05-carrier-ui.md) | `12-Rabih-design-Process/05-carrier/` | Working (buggy — 4 critical bugs) |
| 06 | Accounting | Not in api-dev-prompts | [06-accounting-ui.md](web-dev-prompts/06-accounting-ui.md) | `12-Rabih-design-Process/06-accounting/` (placeholder) | Not built |
| 07 | Load Board | Not in api-dev-prompts | [07-load-board-ui.md](web-dev-prompts/07-load-board-ui.md) | `12-Rabih-design-Process/07-load-board/` (placeholder) | Not built |
| 08 | Commission | Not in api-dev-prompts | [08-commission-ui.md](web-dev-prompts/08-commission-ui.md) | `12-Rabih-design-Process/08-commission/` (placeholder) | Not built |

---

## Critical: Backend-First Workflow

Before building ANY MVP feature, follow this order:

```
1. grep -r "Service" apps/api/src/modules/{service}/  → Does the backend already exist?
2. If YES → Read the service file, understand its methods, wire up to frontend
3. If NO  → Build API first (controller → service → DTOs), then frontend
4. NEVER rebuild a backend service that already exists
```

### Known Backend Services That Already Exist (DO NOT REBUILD)

| Service | File Size | What It Does |
|---------|----------|--------------|
| LoadsService | 19KB | Full CRUD, status management, filtering, pagination |
| OrdersService | 22KB | Full CRUD, multi-stop orders, status workflow |
| RateConfirmationService | — | PDF generation for rate confirmations |
| Check Calls | — | Fully implemented endpoint and service |
| assignCarrier (dispatch) | — | Carrier assignment logic in LoadsService |

---

## Non-MVP Prompts (for reference only)

### API Prompts (post-MVP)
`03-credit-api.md` through `24-feedback-api.md` — 23 files, all post-MVP

### Web Prompts (post-MVP)
`09-claims-ui.md` through `27-help-desk-ui.md` — 19 files, all post-MVP

---

## Related Docs

- **Quality gates before shipping:** `Claude-review-v1/03-design-strategy/05-quality-gates.md`
- **Screen priority matrix:** `Claude-review-v1/04-screen-integration/03-screen-priority-matrix.md`
- **Design-to-code workflow:** `Claude-review-v1/04-screen-integration/01-design-to-code-workflow.md`
- **Bug inventory (fix first):** `Claude-review-v1/01-code-review/05-bug-inventory.md`
- **AI development playbook:** `11-ai-dev/89-ai-development-playbook.md`

---

_Last Updated: February 2026_
