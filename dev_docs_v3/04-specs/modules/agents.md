# Agents Module API Spec

**Module:** `apps/api/src/modules/agents/`
**Base path:** `/api/v1/`
**Controllers:** AgentsController, AgentAgreementsController, CustomerAssignmentsController, AgentCommissionsController, AgentLeadsController, AgentStatementsController

## Auth

All controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` with `@Request() req` pattern (accesses `req.user.tenantId` and `req.user.userId`). Several include `ensureAgentSelfAccess` private method for self-service access.

**Roles:** ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT (varies per endpoint)

---

## AgentsController

**Path prefix:** `agents`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/agents` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | List agents |
| POST | `/agents` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Create agent |
| GET | `/agents/:id` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | Get agent by ID |
| PUT | `/agents/:id` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Update agent |
| DELETE | `/agents/:id` | ADMIN, SUPER_ADMIN | Delete agent |
| POST | `/agents/:id/activate` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Activate agent |
| POST | `/agents/:id/suspend` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Suspend agent |
| POST | `/agents/:id/terminate` | ADMIN, SUPER_ADMIN | Terminate agent |
| GET | `/agents/:id/contacts` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | List agent contacts |
| POST | `/agents/:id/contacts` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Create agent contact |
| PUT | `/agents/:id/contacts/:contactId` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Update agent contact |
| DELETE | `/agents/:id/contacts/:contactId` | ADMIN, SUPER_ADMIN | Delete agent contact |

**Query params (GET list):** `page`, `limit`, `search`, `status`

**Note:** Uses `ensureAgentSelfAccess` -- agents with AGENT role can only access their own record.

---

## AgentAgreementsController

**Path prefix:** (mixed routes)

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/agents/:id/agreements` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | List agent agreements |
| POST | `/agents/:id/agreements` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Create agent agreement |
| GET | `/agent-agreements/:id` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | Get agreement by ID |
| PUT | `/agent-agreements/:id` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Update agreement |
| DELETE | `/agent-agreements/:id` | ADMIN, SUPER_ADMIN | Delete agreement |

---

## CustomerAssignmentsController

**Path prefix:** `agents/:agentId/assignments`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/agents/:agentId/assignments` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | List customer assignments |
| POST | `/agents/:agentId/assignments` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Assign customer |
| POST | `/agents/:agentId/assignments/:id/transfer` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Transfer assignment |
| POST | `/agents/:agentId/assignments/:id/sunset` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Sunset assignment |
| POST | `/agents/:agentId/assignments/:id/terminate` | ADMIN, SUPER_ADMIN | Terminate assignment |

---

## AgentCommissionsController

**Path prefix:** `agents/:agentId/commissions`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/agents/:agentId/commissions` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | List agent commissions |
| GET | `/agents/:agentId/commissions/performance` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | Get agent performance |
| GET | `/agents/:agentId/commissions/rankings` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Get agent rankings |

**Note:** Uses `ensureAgentSelfAccess` for self-service.

---

## AgentLeadsController

**Path prefix:** `agents/:agentId/leads`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/agents/:agentId/leads` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | List agent leads |
| POST | `/agents/:agentId/leads` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | Submit lead |
| POST | `/agents/:agentId/leads/:id/qualify` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Qualify lead |
| POST | `/agents/:agentId/leads/:id/convert` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Convert lead |
| POST | `/agents/:agentId/leads/:id/reject` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Reject lead |

---

## AgentStatementsController

**Path prefix:** `agents/:agentId/statements`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/agents/:agentId/statements` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | List statements |
| POST | `/agents/:agentId/statements/generate` | ADMIN, SUPER_ADMIN, AGENT_MANAGER | Generate statement |
| GET | `/agents/:agentId/statements/:id` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | Get statement by ID |
| GET | `/agents/:agentId/statements/:id/pdf` | ADMIN, SUPER_ADMIN, AGENT_MANAGER, AGENT | Download statement PDF |

**Special:** PDF endpoint uses `@Res()` for streaming PDF response.

---

## Known Issues

- Uses `@Request() req` pattern instead of `@CurrentTenant()` decorator -- inconsistent with other modules
