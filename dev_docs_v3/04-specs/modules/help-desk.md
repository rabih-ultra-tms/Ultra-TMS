# Help Desk Module API Spec

**Module:** `apps/api/src/modules/help-desk/`
**Base path:** `/api/v1/`
**Controllers:** TicketsController, TeamsController, KbController, SLAPoliciesController, CannedResponsesController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** P3 future — no MVP relevance.

---

## TicketsController

**Route prefix:** `help-desk/tickets`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/help-desk/tickets` | Create support ticket |
| GET | `/help-desk/tickets` | List tickets |
| GET | `/help-desk/tickets/:id` | Get ticket |
| PATCH | `/help-desk/tickets/:id` | Update ticket |
| POST | `/help-desk/tickets/:id/assign` | Assign to agent/team |
| POST | `/help-desk/tickets/:id/close` | Close ticket |
| POST | `/help-desk/tickets/:id/reopen` | Reopen ticket |
| POST | `/help-desk/tickets/:id/comments` | Add comment |
| GET | `/help-desk/tickets/:id/comments` | List comments |

---

## TeamsController

**Route prefix:** `help-desk/teams`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/help-desk/teams` | Create team |
| GET | `/help-desk/teams` | List teams |
| PATCH | `/help-desk/teams/:id` | Update team |
| DELETE | `/help-desk/teams/:id` | Delete team |
| POST | `/help-desk/teams/:id/members` | Add member |
| DELETE | `/help-desk/teams/:id/members/:userId` | Remove member |

---

## KbController (Knowledge Base)

**Route prefix:** `help-desk/kb`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/help-desk/kb` | Create KB article |
| GET | `/help-desk/kb` | List articles |
| GET | `/help-desk/kb/search` | Search articles |
| GET | `/help-desk/kb/:id` | Get article |
| PATCH | `/help-desk/kb/:id` | Update article |
| DELETE | `/help-desk/kb/:id` | Delete article |

---

## SLAPoliciesController

**Route prefix:** `help-desk/sla`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/help-desk/sla` | Create SLA policy |
| GET | `/help-desk/sla` | List policies |
| PATCH | `/help-desk/sla/:id` | Update policy |
| DELETE | `/help-desk/sla/:id` | Delete policy |

---

## CannedResponsesController

**Route prefix:** `help-desk/canned-responses`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/help-desk/canned-responses` | Create canned response |
| GET | `/help-desk/canned-responses` | List responses |
| PATCH | `/help-desk/canned-responses/:id` | Update response |
| DELETE | `/help-desk/canned-responses/:id` | Delete response |

---

## Context

Help desk module has no `escalation/` controller (directory exists but may be service only). The `escalation/` subdir likely handles SLA breach auto-escalation via event listeners rather than HTTP endpoints.
