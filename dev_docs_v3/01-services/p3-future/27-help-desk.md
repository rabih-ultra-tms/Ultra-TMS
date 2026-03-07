# Service Hub: Help Desk (27)

> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Help Desk service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/27-help-desk/` (7 files)
> **Priority:** P3 Future -- internal support ticketing system

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | High -- code-verified 2026-03-07 |
| **Last Verified** | 2026-03-07 |
| **Backend** | Scaffolded -- 5 controllers, 31 endpoints in `apps/api/src/modules/help-desk/` |
| **Frontend** | Not Built -- 0 pages, 0 components, 0 hooks |
| **Tests** | Minimal -- spec files exist but services are mostly placeholders (EscalationService, SlaTrackerService) |
| **Active Blockers** | No frontend at all; escalation and SLA tracker services are stubs |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Help Desk service definition in dev_docs |
| Design Specs | Done | 7 files in `dev_docs/12-Rabih-design-Process/27-help-desk/` |
| Backend -- Tickets | Scaffolded | `help-desk/tickets/` -- controller, service, ticket-number service |
| Backend -- Teams | Scaffolded | `help-desk/teams/` -- controller, service, assignment service |
| Backend -- SLA Policies | Scaffolded | `help-desk/sla/` -- controller, sla.service, sla-tracker.service (stub) |
| Backend -- Canned Responses | Scaffolded | `help-desk/canned-responses/` -- controller, service |
| Backend -- Knowledge Base | Scaffolded | `help-desk/knowledge-base/` -- kb.controller, articles.service, categories.service |
| Backend -- Escalation | Stub | `help-desk/escalation/escalation.service.ts` -- placeholder `evaluate()` only |
| Backend -- DTO | Done | `help-desk/dto/help-desk.dto.ts` -- 15 DTO classes with full validation |
| Prisma Models | Done | SupportTicket, TicketReply, SupportTeam, SupportTeamMember, SlaPolicy, CannedResponse, KBArticle, EscalationRule |
| Frontend Pages | Not Built | No pages exist |
| React Hooks | Not Built | No hooks exist |
| Components | Not Built | No components exist |
| Tests | Minimal | 7 `.spec.ts` files present; core services likely have basic tests but escalation/SLA tracker are stubs |
| Security | Good | All controllers: JwtAuthGuard + tenantId scoping + @Roles decorators |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Help Desk Dashboard | `/help-desk` | Not Built | -- | Design spec: `01-help-desk-dashboard.md` |
| Tickets List | `/help-desk/tickets` | Not Built | -- | Design spec: `02-tickets-list.md` |
| Ticket Detail | `/help-desk/tickets/[id]` | Not Built | -- | Design spec: `03-ticket-detail.md` |
| New Ticket | `/help-desk/tickets/new` | Not Built | -- | Design spec: `04-new-ticket.md` |
| Knowledge Base | `/help-desk/knowledge-base` | Not Built | -- | Design spec: `05-knowledge-base.md` |
| KB Article | `/help-desk/knowledge-base/[id]` | Not Built | -- | Design spec: `06-kb-article.md` |
| SLA Policies | `/help-desk/sla-policies` | Not Built | -- | No design spec yet |
| Teams Management | `/help-desk/teams` | Not Built | -- | No design spec yet |
| Canned Responses | `/help-desk/canned-responses` | Not Built | -- | No design spec yet |

---

## 4. API Endpoints

### Tickets Controller (`support/tickets`) -- 9 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/support/tickets` | TicketsController | Scaffolded | List tickets (VIEWER+) |
| POST | `/api/v1/support/tickets` | TicketsController | Scaffolded | Create ticket (USER+) |
| GET | `/api/v1/support/tickets/:id` | TicketsController | Scaffolded | Ticket detail (VIEWER+) |
| PUT | `/api/v1/support/tickets/:id` | TicketsController | Scaffolded | Update ticket (USER+) |
| DELETE | `/api/v1/support/tickets/:id` | TicketsController | Scaffolded | Delete ticket (MANAGER+) |
| POST | `/api/v1/support/tickets/:id/reply` | TicketsController | Scaffolded | Add reply (USER+) |
| POST | `/api/v1/support/tickets/:id/assign` | TicketsController | Scaffolded | Assign ticket (USER+) |
| POST | `/api/v1/support/tickets/:id/close` | TicketsController | Scaffolded | Close with resolution notes (USER+) |
| POST | `/api/v1/support/tickets/:id/reopen` | TicketsController | Scaffolded | Reopen closed ticket (USER+) |

### Canned Responses Controller (`support/canned-responses`) -- 4 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/support/canned-responses` | CannedResponsesController | Scaffolded | List responses (VIEWER+) |
| POST | `/api/v1/support/canned-responses` | CannedResponsesController | Scaffolded | Create response (ADMIN) |
| PUT | `/api/v1/support/canned-responses/:id` | CannedResponsesController | Scaffolded | Update response (ADMIN) |
| DELETE | `/api/v1/support/canned-responses/:id` | CannedResponsesController | Scaffolded | Delete response (ADMIN) |

### Knowledge Base Controller (`support/kb`) -- 9 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/support/kb/categories` | KbController | Scaffolded | List KB categories (VIEWER+) |
| POST | `/api/v1/support/kb/categories` | KbController | Scaffolded | Create category (ADMIN) |
| PUT | `/api/v1/support/kb/categories/:id` | KbController | Scaffolded | Update category (ADMIN) |
| GET | `/api/v1/support/kb/articles` | KbController | Scaffolded | List articles (VIEWER+) |
| POST | `/api/v1/support/kb/articles` | KbController | Scaffolded | Create article (USER+) |
| GET | `/api/v1/support/kb/articles/:id` | KbController | Scaffolded | Article detail (VIEWER+) |
| PUT | `/api/v1/support/kb/articles/:id` | KbController | Scaffolded | Update article (USER+) |
| POST | `/api/v1/support/kb/articles/:id/publish` | KbController | Scaffolded | Publish article (ADMIN) |
| POST | `/api/v1/support/kb/articles/:id/feedback` | KbController | Scaffolded | Submit helpful/unhelpful feedback (USER+) |

### SLA Policies Controller (`support/sla-policies`) -- 4 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/support/sla-policies` | SlaPoliciesController | Scaffolded | List SLA policies (VIEWER+) |
| POST | `/api/v1/support/sla-policies` | SlaPoliciesController | Scaffolded | Create SLA policy (ADMIN) |
| PUT | `/api/v1/support/sla-policies/:id` | SlaPoliciesController | Scaffolded | Update SLA policy (ADMIN) |
| DELETE | `/api/v1/support/sla-policies/:id` | SlaPoliciesController | Scaffolded | Delete SLA policy (ADMIN) |

### Teams Controller (`support/teams`) -- 5 endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/support/teams` | TeamsController | Scaffolded | List teams (VIEWER+) |
| POST | `/api/v1/support/teams` | TeamsController | Scaffolded | Create team (ADMIN) |
| GET | `/api/v1/support/teams/:id` | TeamsController | Scaffolded | Team detail (VIEWER+) |
| PUT | `/api/v1/support/teams/:id` | TeamsController | Scaffolded | Update team (USER+) |
| POST | `/api/v1/support/teams/:id/members` | TeamsController | Scaffolded | Manage team members (ADMIN) |

**Total: 31 endpoints across 5 controllers**

---

## 5. Components

No components built. Future components needed:

| Component | Purpose | Priority |
|-----------|---------|----------|
| TicketsList | DataTable with status/priority filters | P1 |
| TicketDetail | Threaded replies, status bar, SLA countdown | P1 |
| TicketCreateForm | Multi-field form with category/priority selection | P1 |
| TicketReplyEditor | Rich text reply with canned response insertion | P1 |
| TicketStatusBadge | Color-coded status badge (NEW/OPEN/PENDING/ON_HOLD/RESOLVED/CLOSED) | P1 |
| TicketPriorityBadge | Priority indicator (URGENT/HIGH/NORMAL/LOW) | P1 |
| SlaCountdown | Real-time SLA timer showing time remaining | P2 |
| TeamMembersList | Team members with availability toggles | P2 |
| KbArticleViewer | Article display with feedback buttons | P2 |
| KbCategoryTree | Hierarchical category navigation | P2 |
| CannedResponsePicker | Searchable dropdown for inserting canned responses | P2 |
| TicketAssignDialog | Assign to user/team dialog | P2 |

---

## 6. Hooks

No hooks built. Future hooks needed:

| Hook | Endpoints Used | Notes |
|------|---------------|-------|
| `useTickets` | GET `/support/tickets` | Paginated list with filters |
| `useTicket` | GET `/support/tickets/:id` | Single ticket with replies |
| `useCreateTicket` | POST `/support/tickets` | Mutation |
| `useUpdateTicket` | PUT `/support/tickets/:id` | Mutation |
| `useDeleteTicket` | DELETE `/support/tickets/:id` | Mutation |
| `useTicketReply` | POST `/support/tickets/:id/reply` | Mutation |
| `useAssignTicket` | POST `/support/tickets/:id/assign` | Mutation |
| `useCloseTicket` | POST `/support/tickets/:id/close` | Mutation |
| `useReopenTicket` | POST `/support/tickets/:id/reopen` | Mutation |
| `useCannedResponses` | GET `/support/canned-responses` | List for picker |
| `useKbArticles` | GET `/support/kb/articles` | Knowledge base listing |
| `useKbArticle` | GET `/support/kb/articles/:id` | Single article |
| `useSlaPolicies` | GET `/support/sla-policies` | SLA policy list |
| `useSupportTeams` | GET `/support/teams` | Teams list |

All hooks MUST unwrap the API envelope: `response.data.data` (not `response.data`).

---

## 7. Business Rules

1. **Ticket Lifecycle:** Every ticket follows the status flow: NEW -> OPEN -> PENDING/ON_HOLD -> RESOLVED -> CLOSED. A ticket enters NEW when created, transitions to OPEN when first assigned or replied to, moves to PENDING when waiting on requester input, can be placed ON_HOLD for external dependencies, is RESOLVED when the agent provides a resolution, and is CLOSED after confirmation or auto-close timeout. Tickets can be reopened from RESOLVED or CLOSED, which resets status to OPEN.

2. **SLA Policies -- Response Time:** Each SLA policy defines a `firstResponseTarget` in minutes. When a ticket is created, the system matches it against SLA policies based on `conditions` (priority and/or category). The matched policy's `firstResponseTarget` sets the `firstResponseDue` timestamp on the ticket. If `useBusinessHours` is true, only business hours count toward the timer. A ticket is SLA-compliant for first response if `firstRespondedAt <= firstResponseDue`.

3. **SLA Policies -- Resolution Time:** Each SLA policy also defines a `resolutionTarget` in minutes. The `resolutionDue` timestamp is computed at ticket creation. A ticket is SLA-compliant for resolution if `resolvedAt <= resolutionDue`. SLA policies have a `priority` field (integer) -- when multiple policies match a ticket's conditions, the highest-priority policy wins.

4. **Team Routing:** Support teams have an `autoAssign` flag and an `assignmentMethod` (default: ROUND_ROBIN). When auto-assign is enabled, new tickets routed to a team are automatically assigned to the next available member. Members have `maxOpenTickets` (default: 20) and `currentTicketCount` -- a member is eligible for assignment only if `isAvailable === true` AND `currentTicketCount < maxOpenTickets`. Round-robin assignment distributes tickets evenly across eligible members.

5. **Escalation Rules:** Escalation rules are defined in the `EscalationRule` model with `triggerType` (e.g., SLA_BREACH, NO_RESPONSE, PRIORITY_CHANGE), `triggerMinutes` (time threshold), `conditions` (matching criteria), `actionType` (e.g., REASSIGN, NOTIFY, ESCALATE_PRIORITY), and `actionConfig` (action details like target user/team). Note: The `EscalationService` is currently a stub -- rule evaluation is not yet implemented. Rules are stored in the database but not executed.

6. **Knowledge Base Articles:** Articles follow a draft/publish workflow. Articles are created with `isPublished = false`. An ADMIN can publish via the `/publish` endpoint, which sets `isPublished = true` and records `publishedAt`. Articles have `viewCount`, `helpfulCount`, and `unhelpfulCount` for tracking usefulness. Users submit feedback via the `/feedback` endpoint (helpful: true/false). Articles belong to categories (via `categoryId`), can have a `summary` for list views, and support `keywords` for search. Each article has a unique `slug` per tenant for URL-friendly access.

7. **Canned Responses for Common Issues:** Canned responses are pre-written reply templates managed by ADMINs. Each response has a `title`, `content`, `category` (for organization), and `useCount` (incremented each time it is inserted into a reply). Responses can be `isPublic` (visible to all agents) or private (visible only to the owner via `ownerId`). Agents select canned responses when composing replies to speed up resolution of frequently asked questions.

8. **Ticket Sources and Types:** Tickets can originate from five sources: EMAIL, PORTAL, PHONE, CHAT, or INTERNAL. Each ticket is classified by type: QUESTION (general inquiry), PROBLEM (something is broken), INCIDENT (service disruption), or REQUEST (feature/access request). Source and type drive SLA policy matching and reporting segmentation.

9. **Reply Types:** Ticket replies have three types: PUBLIC (visible to requester), INTERNAL_NOTE (visible only to agents/admins -- used for internal discussion), and SYSTEM (auto-generated by the system for status changes, assignments, SLA events). Replies support `bodyHtml` for rich text and `attachments` as JSON arrays.

10. **Ticket Assignment:** Tickets can be assigned to both a `teamId` and an individual `assignedToId`. Assignment can be manual (via the `/assign` endpoint) or automatic (via team auto-assign). When a ticket is assigned, the `currentTicketCount` on the team member record should be incremented. When resolved/closed, it should be decremented.

11. **Satisfaction Tracking:** After a ticket is resolved, the system can collect `satisfactionRating` (integer scale) and `satisfactionComment` from the requester. These fields are stored directly on the SupportTicket model for reporting and agent performance tracking.

12. **Ticket Numbering:** The `TicketNumberService` generates unique, sequential ticket numbers (stored in the `ticketNumber` field with a unique constraint). Format is tenant-scoped to prevent collisions across tenants.

---

## 8. Data Model

### SupportTicket
```
SupportTicket {
  id                  String (UUID)
  tenantId            String
  ticketNumber        String (unique, VarChar 50)
  subject             String (VarChar 500)
  description         String
  source              TicketSource (EMAIL, PORTAL, PHONE, CHAT, INTERNAL)
  type                TicketType (QUESTION, PROBLEM, INCIDENT, REQUEST)
  priority            TicketPriority (URGENT, HIGH, NORMAL, LOW) default: NORMAL
  status              TicketStatus (NEW, OPEN, PENDING, ON_HOLD, RESOLVED, CLOSED) default: NEW
  requesterId         String?
  requesterName       String? (VarChar 255)
  requesterEmail      String? (VarChar 255)
  assignedToId        String?
  teamId              String?
  firstResponseDue    DateTime?
  resolutionDue       DateTime?
  firstRespondedAt    DateTime?
  resolvedAt          DateTime?
  resolvedBy          String?
  resolutionNotes     String?
  satisfactionRating  Int?
  satisfactionComment String?
  TicketReply         TicketReply[]
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
}
```

### TicketReply
```
TicketReply {
  id           String (UUID)
  tenantId     String
  ticketId     String (FK -> SupportTicket)
  replyType    ReplyType (PUBLIC, INTERNAL_NOTE, SYSTEM)
  body         String
  bodyHtml     String?
  authorId     String?
  authorName   String? (VarChar 255)
  attachments  Json?
  createdAt    DateTime
  updatedAt    DateTime
  deletedAt    DateTime?
}
```

### SupportTeam
```
SupportTeam {
  id               String (UUID)
  tenantId         String
  name             String (VarChar 100)
  description      String?
  email            String? (VarChar 255)
  autoAssign       Boolean (default: false)
  assignmentMethod String (default: "ROUND_ROBIN", VarChar 20)
  managerId        String?
  isActive         Boolean (default: true)
  members          SupportTeamMember[]
  createdAt        DateTime
  updatedAt        DateTime
  deletedAt        DateTime?
}
```

### SupportTeamMember
```
SupportTeamMember {
  id                 String (UUID)
  teamId             String (FK -> SupportTeam)
  userId             String
  role               String (default: "MEMBER", VarChar 20)
  maxOpenTickets     Int (default: 20)
  currentTicketCount Int (default: 0)
  isAvailable        Boolean (default: true)
  createdAt          DateTime
  updatedAt          DateTime
  deletedAt          DateTime?
  @@unique([teamId, userId])
}
```

### SlaPolicy
```
SlaPolicy {
  id                  String (UUID)
  tenantId            String
  name                String (VarChar 100)
  description         String?
  conditions          Json   -- { priority?: string[], category?: string[] }
  firstResponseTarget Int    -- minutes
  resolutionTarget    Int    -- minutes
  useBusinessHours    Boolean (default: true)
  priority            Int (default: 0) -- higher wins when multiple match
  isActive            Boolean (default: true)
  createdAt           DateTime
  updatedAt           DateTime
  deletedAt           DateTime?
}
```

### CannedResponse
```
CannedResponse {
  id         String (UUID)
  tenantId   String
  title      String (VarChar 200)
  content    String
  category   String? (VarChar 100)
  useCount   Int (default: 0)
  isPublic   Boolean (default: false)
  ownerId    String?
  isActive   Boolean (default: true)
  createdAt  DateTime
  updatedAt  DateTime
  deletedAt  DateTime?
}
```

### KBArticle
```
KBArticle {
  id             String (UUID)
  tenantId       String
  title          String (VarChar 500)
  content        String
  summary        String? (VarChar 1000)
  categoryId     String?
  slug           String (VarChar 500) -- unique per tenant
  keywords       String?
  isPublished    Boolean (default: false)
  publishedAt    DateTime?
  viewCount      Int (default: 0)
  helpfulCount   Int (default: 0)
  unhelpfulCount Int (default: 0)
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
  @@unique([tenantId, slug])
}
```

### EscalationRule
```
EscalationRule {
  id             String (UUID)
  tenantId       String
  name           String (VarChar 100)
  description    String?
  triggerType    String (VarChar 30) -- e.g., SLA_BREACH, NO_RESPONSE
  triggerMinutes Int?
  conditions     Json?
  actionType     String (VarChar 30) -- e.g., REASSIGN, NOTIFY
  actionConfig   Json
  isActive       Boolean (default: true)
  createdAt      DateTime
  updatedAt      DateTime
  deletedAt      DateTime?
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| Ticket `subject` | Required, string | "Subject is required" |
| Ticket `description` | Required, string | "Description is required" |
| Ticket `source` | Required, IsEnum(TicketSource) | "Invalid ticket source" |
| Ticket `type` | Optional, IsEnum(TicketType) | "Invalid ticket type" |
| Ticket `priority` | Optional, IsEnum(TicketPriority) | "Invalid ticket priority" |
| Ticket `status` (update) | Optional, IsEnum(TicketStatus) | "Invalid ticket status" |
| Reply `body` | Required, string | "Reply body is required" |
| Reply `replyType` | Required, IsEnum(ReplyType) | "Invalid reply type" |
| SLA `name` | Required, string | "SLA policy name is required" |
| SLA `conditions` | Required, IsObject | "SLA conditions must be an object" |
| SLA `firstResponseTarget` | Required, IsInt, Min(1) | "First response target must be at least 1 minute" |
| SLA `resolutionTarget` | Required, IsInt, Min(1) | "Resolution target must be at least 1 minute" |
| Team `name` | Required, string | "Team name is required" |
| Team member `userId` | Required, string | "User ID is required" |
| Team member `maxOpenTickets` | Optional, IsInt | "Max open tickets must be an integer" |
| Canned response `title` | Required, string | "Response title is required" |
| Canned response `content` | Required, string | "Response content is required" |
| KB article `title` | Required, string | "Article title is required" |
| KB article `content` | Required, string | "Article content is required" |
| KB category `name` | Required, string | "Category name is required" |
| KB feedback `helpful` | Required, IsBoolean | "Helpful flag is required" |

---

## 10. Status States

### Ticket Status Machine
```
NEW -> OPEN         (assigned to agent or first reply sent)
OPEN -> PENDING     (waiting on requester input)
OPEN -> ON_HOLD     (external dependency, manual)
OPEN -> RESOLVED    (agent provides resolution)
PENDING -> OPEN     (requester replies)
ON_HOLD -> OPEN     (dependency resolved)
RESOLVED -> CLOSED  (confirmed by requester or auto-close after timeout)
RESOLVED -> OPEN    (reopened -- requester disputes resolution)
CLOSED -> OPEN      (reopened -- new information received)
```

### KB Article States
```
DRAFT -> PUBLISHED  (ADMIN publishes via /publish endpoint)
PUBLISHED -> DRAFT  (unpublished for editing -- via update with isPublished: false)
```

### SLA Compliance States
```
ON_TRACK           (current time < due time)
AT_RISK            (within warning threshold of due time)
BREACHED           (current time > due time, not yet responded/resolved)
MET                (responded/resolved before due time)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| EscalationService is a stub -- no rule evaluation logic | P1 | `help-desk/escalation/escalation.service.ts` | Open |
| SlaTrackerService is a stub -- no breach detection or scheduling | P1 | `help-desk/sla/sla-tracker.service.ts` | Open |
| No frontend pages, components, or hooks exist | P0 Build Gap | -- | Open |
| No pagination on ticket/article list endpoints | P2 | Controllers | Open |
| No search/filter query params on list endpoints | P2 | Controllers | Open |
| KB categories have no dedicated Prisma model (may use generic or inline) | P2 | schema.prisma | Needs investigation |
| No WebSocket support for real-time ticket updates | P2 | -- | Not started |
| Team member `currentTicketCount` not auto-incremented/decremented | P2 | `teams/assignment.service.ts` | Needs verification |

---

## 12. Tasks

### Phase 1: Backend Completion
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| HD-001 | Implement EscalationService rule evaluation engine | L (8h) | P1 |
| HD-002 | Implement SlaTrackerService breach detection + scheduling | L (8h) | P1 |
| HD-003 | Add pagination, search, and filter params to list endpoints | M (4h) | P1 |
| HD-004 | Wire up auto-assignment in ticket creation flow | M (4h) | P1 |
| HD-005 | Auto-increment/decrement team member currentTicketCount | S (2h) | P1 |
| HD-006 | Write comprehensive backend tests for all 5 controllers | L (8h) | P1 |

### Phase 2: Frontend Build
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| HD-010 | Build Tickets List page with DataTable, filters, status badges | L (8h) | P1 |
| HD-011 | Build Ticket Detail page with threaded replies, SLA timer | XL (12h) | P1 |
| HD-012 | Build New Ticket form with category/priority selection | M (4h) | P1 |
| HD-013 | Build Help Desk Dashboard with KPIs, SLA metrics | L (8h) | P2 |
| HD-014 | Build Knowledge Base browser with category tree | M (5h) | P2 |
| HD-015 | Build KB Article viewer with feedback buttons | M (4h) | P2 |
| HD-016 | Build Teams Management page | M (5h) | P2 |
| HD-017 | Build SLA Policies CRUD page | M (4h) | P2 |
| HD-018 | Build Canned Responses management page | S (3h) | P2 |

### Phase 3: Polish
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| HD-020 | Add WebSocket namespace for real-time ticket updates | M (5h) | P2 |
| HD-021 | Email notifications for ticket creation, reply, SLA breach | M (5h) | P2 |
| HD-022 | Satisfaction survey after ticket resolution | S (3h) | P3 |
| HD-023 | Ticket merge/link functionality | M (4h) | P3 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Overview | `dev_docs/12-Rabih-design-Process/27-help-desk/00-service-overview.md` |
| Help Desk Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/27-help-desk/01-help-desk-dashboard.md` |
| Tickets List | Full 15-section | `dev_docs/12-Rabih-design-Process/27-help-desk/02-tickets-list.md` |
| Ticket Detail | Full 15-section | `dev_docs/12-Rabih-design-Process/27-help-desk/03-ticket-detail.md` |
| New Ticket | Full 15-section | `dev_docs/12-Rabih-design-Process/27-help-desk/04-new-ticket.md` |
| Knowledge Base | Full 15-section | `dev_docs/12-Rabih-design-Process/27-help-desk/05-knowledge-base.md` |
| KB Article | Full 15-section | `dev_docs/12-Rabih-design-Process/27-help-desk/06-kb-article.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Full help desk system | Backend scaffolded only, no frontend | Behind plan |
| 5 controllers with full CRUD | 5 controllers, 31 endpoints -- all scaffolded | On track (backend) |
| SLA enforcement | SlaTrackerService is a stub | Behind -- no runtime enforcement |
| Escalation engine | EscalationService is a stub | Behind -- no rule execution |
| Knowledge base with search | Articles + categories services exist, no search | Partial |
| Canned responses | Controller + service built with CRUD | On track |
| Team routing with auto-assign | AssignmentService exists, wiring unclear | Partial |
| 7 design specs | All 7 present | On track |
| Frontend pages | 0 of 9 planned pages built | Significantly behind |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId scoping -- all controllers use JwtAuthGuard)
- User Management (agent user records for assignment, team membership)
- Communication / Email (ticket notifications, SLA breach alerts)
- EventEmitter (help-desk.module imports EventEmitterModule for internal events)

**Depended on by:**
- No other services currently depend on Help Desk (P3 future service)
- Future: All services could link tickets via `relatedType` + `relatedId` (e.g., a ticket about a specific Load, Carrier, or Invoice)

**Sub-module structure:**
```
apps/api/src/modules/help-desk/
  help-desk.module.ts
  dto/help-desk.dto.ts
  canned-responses/
    canned-responses.controller.ts
    canned-responses.service.ts
    canned-responses.service.spec.ts
  escalation/
    escalation.service.ts
    escalation.service.spec.ts
  knowledge-base/
    kb.controller.ts
    articles.service.ts
    articles.service.spec.ts
    categories.service.ts
    categories.service.spec.ts
  sla/
    sla-policies.controller.ts
    sla.service.ts
    sla.service.spec.ts
    sla-tracker.service.ts
    sla-tracker.service.spec.ts
  teams/
    teams.controller.ts
    teams.service.ts
    teams.service.spec.ts
    assignment.service.ts
    assignment.service.spec.ts
  tickets/
    tickets.controller.ts
    tickets.service.ts
    tickets.service.spec.ts
    ticket-number.service.ts
    ticket-number.service.spec.ts
```
