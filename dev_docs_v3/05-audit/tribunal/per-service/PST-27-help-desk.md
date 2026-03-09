# PST-27: Help Desk — Per-Service Tribunal Audit

> **Date:** 2026-03-09
> **Auditor:** Claude Opus 4.6
> **Hub file:** `dev_docs_v3/01-services/p3-future/27-help-desk.md`
> **Verdict:** MODIFY
> **Health Score:** 7.5/10 (was 2.0/10 — delta +5.5)

---

## Phase 1: Data Model Verification

### Prisma Models (8 claimed → 8 confirmed)

| Hub Model | Prisma Model | Match | Notes |
|-----------|-------------|-------|-------|
| SupportTicket | SupportTicket | 100% | All fields match. Hub omits migration fields (externalId, sourceSystem, customFields, createdById, updatedById) — standard omission |
| TicketReply | TicketReply | 100% | All fields match. Hub omits migration fields |
| SupportTeam | SupportTeam | 100% | All fields match |
| SupportTeamMember | SupportTeamMember | 100% | All fields match. @@unique([teamId, userId]) confirmed |
| SlaPolicy | SlaPolicy | 100% | All fields match |
| CannedResponse | CannedResponse | 100% | All fields match |
| KBArticle | KBArticle | 100% | All fields match. @@unique([tenantId, slug]) confirmed |
| EscalationRule | EscalationRule | 100% | All fields match |

**Model count: 8/8 — PERFECT MATCH**
**Model names: 8/8 — PERFECT MATCH**
**Field accuracy: ~95%** — hub omits standard migration fields only, core fields 100% accurate

### Missing Model: KBCategory

Hub Section 11 flags: "KB categories have no dedicated Prisma model (may use generic or inline)." This is **ACCURATE**. Categories are stored in `TenantConfig` as a JSON array (key: `helpdesk.kb.categories`). The CategoriesService uses `prisma.tenantConfig.upsert()` to persist categories. This is a design choice, not a bug — but it means:
- No referential integrity between KBArticle.categoryId and categories
- No indexing on category fields
- Category data is denormalized JSON, not relational

### Enums (5 confirmed)

| Enum | Hub Values | Prisma Values | Match |
|------|-----------|---------------|-------|
| TicketSource | EMAIL, PORTAL, PHONE, CHAT, INTERNAL | EMAIL, PORTAL, PHONE, CHAT, INTERNAL | 100% |
| TicketType | QUESTION, PROBLEM, INCIDENT, REQUEST | QUESTION, PROBLEM, INCIDENT, REQUEST | 100% |
| TicketPriority | URGENT, HIGH, NORMAL, LOW | URGENT, HIGH, NORMAL, LOW | 100% |
| TicketStatus | NEW, OPEN, PENDING, ON_HOLD, RESOLVED, CLOSED | NEW, OPEN, PENDING, ON_HOLD, RESOLVED, CLOSED | 100% |
| ReplyType | PUBLIC, INTERNAL_NOTE, SYSTEM | PUBLIC, INTERNAL_NOTE, SYSTEM | 100% |

**All 5 enums: PERFECT MATCH**

---

## Phase 2: Endpoint Verification

### Hub claims: 31 endpoints across 5 controllers

**Actual endpoint count by controller:**

| Controller | Hub Count | Actual Count | Match |
|------------|-----------|-------------|-------|
| TicketsController (`support/tickets`) | 9 | 9 | 100% |
| CannedResponsesController (`support/canned-responses`) | 4 | 4 | 100% |
| KbController (`support/kb`) | 9 | 9 | 100% |
| SlaPoliciesController (`support/sla-policies`) | 4 | 4 | 100% |
| TeamsController (`support/teams`) | 5 | 5 | 100% |
| **TOTAL** | **31** | **31** | **100%** |

**Endpoint count: 31/31 — 13th CONSECUTIVE PERFECT MATCH** (every service since PST-15)

### Path Accuracy

| Endpoint | Hub Path | Actual Path | Match |
|----------|---------|-------------|-------|
| GET tickets | `/api/v1/support/tickets` | `support/tickets` | Yes |
| POST tickets | `/api/v1/support/tickets` | `support/tickets` | Yes |
| GET tickets/:id | `/api/v1/support/tickets/:id` | `support/tickets/:id` | Yes |
| PUT tickets/:id | `/api/v1/support/tickets/:id` | `support/tickets/:id` | Yes |
| DELETE tickets/:id | `/api/v1/support/tickets/:id` | `support/tickets/:id` | Yes |
| POST tickets/:id/reply | `/api/v1/support/tickets/:id/reply` | `support/tickets/:id/reply` | Yes |
| POST tickets/:id/assign | `/api/v1/support/tickets/:id/assign` | `support/tickets/:id/assign` | Yes |
| POST tickets/:id/close | `/api/v1/support/tickets/:id/close` | `support/tickets/:id/close` | Yes |
| POST tickets/:id/reopen | `/api/v1/support/tickets/:id/reopen` | `support/tickets/:id/reopen` | Yes |
| GET canned-responses | `/api/v1/support/canned-responses` | `support/canned-responses` | Yes |
| POST canned-responses | `/api/v1/support/canned-responses` | `support/canned-responses` | Yes |
| PUT canned-responses/:id | `/api/v1/support/canned-responses/:id` | `support/canned-responses/:id` | Yes |
| DELETE canned-responses/:id | `/api/v1/support/canned-responses/:id` | `support/canned-responses/:id` | Yes |
| GET kb/categories | `/api/v1/support/kb/categories` | `support/kb/categories` | Yes |
| POST kb/categories | `/api/v1/support/kb/categories` | `support/kb/categories` | Yes |
| PUT kb/categories/:id | `/api/v1/support/kb/categories/:id` | `support/kb/categories/:id` | Yes |
| GET kb/articles | `/api/v1/support/kb/articles` | `support/kb/articles` | Yes |
| POST kb/articles | `/api/v1/support/kb/articles` | `support/kb/articles` | Yes |
| GET kb/articles/:id | `/api/v1/support/kb/articles/:id` | `support/kb/articles/:id` | Yes |
| PUT kb/articles/:id | `/api/v1/support/kb/articles/:id` | `support/kb/articles/:id` | Yes |
| POST kb/articles/:id/publish | `/api/v1/support/kb/articles/:id/publish` | `support/kb/articles/:id/publish` | Yes |
| POST kb/articles/:id/feedback | `/api/v1/support/kb/articles/:id/feedback` | `support/kb/articles/:id/feedback` | Yes |
| GET sla-policies | `/api/v1/support/sla-policies` | `support/sla-policies` | Yes |
| POST sla-policies | `/api/v1/support/sla-policies` | `support/sla-policies` | Yes |
| PUT sla-policies/:id | `/api/v1/support/sla-policies/:id` | `support/sla-policies/:id` | Yes |
| DELETE sla-policies/:id | `/api/v1/support/sla-policies/:id` | `support/sla-policies/:id` | Yes |
| GET teams | `/api/v1/support/teams` | `support/teams` | Yes |
| POST teams | `/api/v1/support/teams` | `support/teams` | Yes |
| GET teams/:id | `/api/v1/support/teams/:id` | `support/teams/:id` | Yes |
| PUT teams/:id | `/api/v1/support/teams/:id` | `support/teams/:id` | Yes |
| POST teams/:id/members | `/api/v1/support/teams/:id/members` | `support/teams/:id/members` | Yes |

**Path accuracy: 31/31 — ~100%**

---

## Phase 3: Security & Quality Audit

### Guard Analysis

| Controller | JwtAuthGuard | RolesGuard | @Roles | Verdict |
|-----------|-------------|-----------|--------|---------|
| TicketsController | `@UseGuards(JwtAuthGuard)` | **MISSING** | Yes (decorative) | P2 |
| TeamsController | `@UseGuards(JwtAuthGuard)` | **MISSING** | Yes (decorative) | P2 |
| SlaPoliciesController | `@UseGuards(JwtAuthGuard)` | **MISSING** | Yes (decorative) | P2 |
| CannedResponsesController | `@UseGuards(JwtAuthGuard)` | **MISSING** | Yes (decorative) | P2 |
| KbController | `@UseGuards(JwtAuthGuard)` | **MISSING** | Yes (decorative) | P2 |

**RolesGuard: 0/5 controllers** — all @Roles decorators are decorative (no RolesGuard in @UseGuards). Hub says "Security: Good — All controllers: JwtAuthGuard + tenantId scoping + @Roles decorators" — this is **MISLEADING** because @Roles without RolesGuard does nothing.

**Hub claim: "Security: Good"** — PARTIALLY FALSE. JwtAuthGuard and tenantId scoping ARE good. But role enforcement is non-existent.

### Tenant Isolation

| Service | tenantId in queries | deletedAt: null | Verdict |
|---------|-------------------|-----------------|---------|
| TicketsService.list() | Yes | Yes | OK |
| TicketsService.findOne() | Yes | Yes | OK |
| TicketsService.remove() | Via findOne | Soft delete | OK |
| TeamsService.list() | Yes | Yes | OK |
| TeamsService.findOne() | Yes | Yes | OK |
| AssignmentService.autoAssign() | Yes | Yes (team + members) | OK |
| SlaService.listPolicies() | Yes | Yes | OK |
| SlaService.findPolicy() | Yes | Yes | OK |
| SlaService.deletePolicy() | Via findPolicy | Soft delete | OK |
| CannedResponsesService.list() | Yes | Yes | OK |
| CannedResponsesService.findOne() | Yes | Yes | OK |
| CannedResponsesService.remove() | Via findOne | Soft delete | OK |
| ArticlesService.list() | Yes | Yes | OK |
| ArticlesService.findOne() | Yes | Yes | OK |
| CategoriesService.loadCategories() | Yes | N/A (JSON store) | OK |

**Tenant isolation: 100%**
**Soft-delete compliance: 100%** (all deletions use soft delete, all queries filter deletedAt: null)

### Bugs Found

**BUG-1 (P2): manageMembers() HARD DELETES then re-creates**
File: `teams/teams.service.ts:53`
```typescript
const ops = [this.prisma.supportTeamMember.deleteMany({ where: { teamId: id } })];
```
This uses `deleteMany()` (hard delete), not soft delete. It then re-creates members. This means:
- Audit trail is lost for removed members
- No `deletedAt` set — inconsistent with rest of module
- Race condition: if transaction fails between delete + create, all members are lost

**BUG-2 (P2): TicketNumberService race condition**
File: `tickets/ticket-number.service.ts:13`
```typescript
const count = await this.prisma.supportTicket.count({
  where: { tenantId, ticketNumber: { startsWith: prefix } },
});
const sequence = count + 1;
```
Two concurrent requests in the same month could get the same ticket number. The count-based approach is not atomic. Should use a sequence or `$transaction` with isolation.

**BUG-3 (P3): AssignmentService doesn't check maxOpenTickets**
File: `teams/assignment.service.ts:12-14`
```typescript
const members = await this.prisma.supportTeamMember.findMany({
  where: { teamId, isAvailable: true, deletedAt: null },
  orderBy: [{ currentTicketCount: 'asc' }, { createdAt: 'asc' }],
  take: 1,
});
```
Missing filter: `currentTicketCount: { lt: maxOpenTickets }` — an agent at max capacity can still be assigned tickets. Hub Section 7 Rule 4 says "a member is eligible for assignment only if isAvailable === true AND currentTicketCount < maxOpenTickets".

**BUG-4 (P2): currentTicketCount never incremented/decremented**
The entire codebase shows no `currentTicketCount: { increment: 1 }` or `{ decrement: 1 }` anywhere in the help-desk module. When tickets are assigned, closed, or reopened, the counter doesn't change. This makes round-robin assignment broken — it always picks the same member (the oldest).
Hub Section 11 correctly flags this: "Team member `currentTicketCount` not auto-incremented/decremented — Needs verification" — CONFIRMED TRUE.

**BUG-5 (P3): Close skips RESOLVED state**
File: `tickets/tickets.service.ts:171`
The `close()` method sets status directly to `CLOSED`, skipping `RESOLVED`. Hub Section 10 status machine says `OPEN -> RESOLVED -> CLOSED`. The code doesn't enforce the RESOLVED intermediate step.

**BUG-6 (P3): Article create maps isPublic to isPublished**
File: `knowledge-base/articles.service.ts:42-43`
```typescript
isPublished: dto.isPublic ?? false,
publishedAt: dto.isPublic ? new Date() : null,
```
The DTO field is `isPublic` but the DB field is `isPublished`. This means creating an article with `isPublic: true` immediately publishes it, bypassing the draft → publish workflow described in Hub Section 10.

---

## Phase 4: Test Assessment

### Test Files and Quality

| Spec File | LOC | Tests | Quality |
|-----------|-----|-------|---------|
| tickets.service.spec.ts | 116 | 6 | **Good** — covers list, findOne (404), create+SLA, reply+status, assign+autoAssign, close+reopen |
| teams.service.spec.ts | 83 | ~4 | Good — covers CRUD + member management |
| sla.service.spec.ts | 81 | ~4 | Good — covers policy CRUD + applyPolicy matching |
| canned-responses.service.spec.ts | 67 | ~3 | Good — covers CRUD |
| articles.service.spec.ts | 110 | ~5 | Good — covers CRUD + publish + feedback |
| categories.service.spec.ts | 50 | ~3 | Good — covers JSON store CRUD |
| assignment.service.spec.ts | 40 | ~2 | Good — covers autoAssign logic |
| ticket-number.service.spec.ts | 25 | ~1 | Basic — covers number generation |
| escalation.service.spec.ts | 11 | 1 | **Stub** — tests placeholder `evaluate()` only |
| sla-tracker.service.spec.ts | 8 | 1 | **Stub** — tests placeholder `track()` only |

**Total: 10 spec files / ~30 tests / 591 LOC**

Hub claim: "Tests: Minimal — spec files exist but services are mostly placeholders" — **PARTIALLY FALSE**. Only 2/10 spec files are stubs (escalation + sla-tracker). The other 8 have real, meaningful tests. This is the **18th false "minimal tests" claim**.

---

## Phase 5: Hub Accuracy Assessment

### Hub Claim Verification

| Hub Claim | Verified | Notes |
|-----------|----------|-------|
| "Health Score: D (2/10)" | FALSE | Backend is production-quality CRUD with SLA, auto-assign, KB, events. Score should be 7.5 |
| "5 controllers, 31 endpoints" | TRUE | 31/31 perfect match |
| "Scaffolded" | **FALSE** — partially | Tickets, Teams, SLA, Canned, KB are fully implemented CRUD, not scaffolding. Only Escalation + SlaTracker are stubs |
| "Tests: Minimal" | **FALSE** | 10 spec files, ~30 tests, 591 LOC. Only 2 are stubs |
| "Security: Good" | **MISLEADING** | JwtAuthGuard + tenantId: YES. RolesGuard: 0/5 controllers. @Roles are decorative |
| "EscalationService is a stub" | TRUE | 9 LOC, single `evaluate()` returning `true` |
| "SlaTrackerService is a stub" | TRUE | 9 LOC, single `track()` returning `true` |
| "No pagination on list endpoints" | TRUE | All list methods use plain `findMany()` with no skip/take |
| "No search/filter query params" | TRUE | No `@Query` params on any list endpoint |
| "KB categories no dedicated Prisma model" | TRUE | Stored in TenantConfig JSON — confirmed |
| "currentTicketCount not auto-incremented" | TRUE | No increment/decrement anywhere in module |
| "Frontend: Not Built" | TRUE | 0 pages, 0 components, 0 hooks confirmed |

### Hub Accuracy Score: ~78%

The hub is **above average** for P3 services. Major inaccuracies:
1. "Scaffolded" label for what is mostly production CRUD
2. "Minimal" tests when 8/10 spec files have real tests
3. "Security: Good" when RolesGuard is missing from all controllers
4. Health score 2/10 is unjustified for a module with working CRUD, SLA policy matching, auto-assignment, KB with publish workflow, and 30 tests

---

## Tribunal: 5-Round Adversarial Debate

### Round 1: "Scaffolded" vs "Implemented"

**Prosecution:** Hub calls the entire backend "Scaffolded." The TicketsService has 212 LOC with SLA application, auto-assignment delegation, event emission, status transitions (NEW→OPEN on reply/assign), first-response tracking, and custom field management. The SlaService implements full policy matching with priority-ordered conditions. The ArticlesService implements slug generation, keyword serialization, publish workflow, and feedback counters. This is NOT scaffolding.

**Defense:** Two core services (EscalationService, SlaTrackerService) are literal one-method stubs. Without escalation and SLA breach detection, the module can't enforce its own business rules.

**Verdict:** Hub should use "Partial" not "Scaffolded". CRUD + SLA matching + auto-assign + KB are implemented. Escalation + breach tracking are stubs. Score reflects partial implementation.

### Round 2: Security Assessment

**Prosecution:** Hub says "Security: Good" but 0/5 controllers have RolesGuard. All @Roles decorators are decorative — any authenticated user can access any endpoint regardless of role.

**Defense:** JwtAuthGuard is present on all 5 controllers. TenantId scoping is 100%. The role issue is systemic (cross-cutting across most P3 services, not unique to Help Desk).

**Verdict:** Security is 6/10 — authentication good, authorization missing, tenant isolation perfect.

### Round 3: KB Categories Architecture

**Prosecution:** Storing categories in TenantConfig JSON means no referential integrity, no indexing, no joins with KBArticle. A category deletion doesn't cascade to articles.

**Defense:** For a P3 future service with 0 frontend consumers, JSON storage is a pragmatic choice. Category count will be small (<50) and the current approach avoids schema migration for a non-MVP feature.

**Verdict:** Acceptable for current phase. Should migrate to Prisma model before frontend build.

### Round 4: TicketNumber Race Condition

**Prosecution:** The count-based approach in TicketNumberService will produce duplicates under concurrent load. Two requests in the same millisecond get the same count, generate the same number, and the second CREATE fails with a unique constraint violation.

**Defense:** P3 service with 0 current traffic. The unique constraint on ticketNumber prevents data corruption — the second request fails gracefully.

**Verdict:** P2 bug. The failure is safe (no data corruption) but produces a poor user experience. Should use `$transaction` with isolation or database sequence before production use.

### Round 5: Event System Quality

**Prosecution:** The TicketsService emits 5 events (ticket.created, ticket.updated, ticket.replied, ticket.assigned, ticket.closed, ticket.reopened — actually 6). But there are 0 event listeners in the module. Events fire into the void.

**Defense:** Events are a good architectural pattern for future listeners (email notifications, SLA tracking, escalation). The EventEmitterModule is properly imported.

**Verdict:** Events are well-placed but unused. This is fine for P3 — future phases will wire listeners.

---

## Summary

### Health Score: 7.5/10 (was 2.0 → delta +5.5)

| Category | Score | Notes |
|----------|-------|-------|
| Data Model | 9/10 | 8/8 models, 5/5 enums, all 100% match. KB categories JSON-only is a trade-off not a bug |
| Endpoints | 10/10 | 31/31 perfect. ~100% path accuracy. 13th consecutive perfect count match |
| Security | 6/10 | JwtAuthGuard 100%. RolesGuard 0/5. Tenant isolation 100%. Soft-delete 100% |
| Implementation | 7/10 | 7/10 services fully implemented. 2 stubs (Escalation, SlaTracker). SLA policy matching works. Auto-assign works. KB works |
| Tests | 7/10 | 10 spec files / ~30 tests / 591 LOC. 8/10 files have real tests. 2 stub tests |
| Hub Accuracy | 7/10 | ~78%. Major misses: "Scaffolded" label, "Minimal tests" claim, misleading security assessment |

### Key Findings

1. **Hub "Scaffolded" is FALSE** — 7/10 services have full production CRUD. Only EscalationService and SlaTrackerService are stubs (18 LOC combined)
2. **Hub "Minimal tests" is FALSE** — 10 spec files, ~30 tests, 591 LOC. 18th false "minimal/no tests" claim
3. **0/5 RolesGuard** — all @Roles decorators are decorative (cross-cutting pattern)
4. **6 EventEmitter events** — ticket.created, .updated, .replied, .assigned, .closed, .reopened — all fire but no listeners exist
5. **TicketNumberService race condition** — count-based generation, unique constraint prevents corruption but concurrent requests will fail
6. **manageMembers() hard-deletes** — only hard-delete in module, breaks soft-delete consistency
7. **currentTicketCount never updated** — round-robin assignment broken, always picks same member
8. **KB categories in TenantConfig JSON** — no referential integrity with KBArticle.categoryId
9. **SLA policy matching IS implemented** — hub doesn't mention this works; `applyPolicy()` does condition matching and sets firstResponseDue/resolutionDue on ticket creation
10. **Auto-assignment IS wired** — ticket creation calls `AssignmentService.autoAssign()` when teamId set without assignee

### Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Add RolesGuard to all 5 controllers | P2 | 15min |
| 2 | Fix manageMembers() to use soft-delete | P2 | 30min |
| 3 | Increment/decrement currentTicketCount on assign/close/reopen | P2 | 1h |
| 4 | Add maxOpenTickets filter to AssignmentService.autoAssign() | P2 | 15min |
| 5 | Fix TicketNumberService race condition (use $transaction or sequence) | P2 | 1h |
| 6 | Fix close() to go through RESOLVED state (or document intentional skip) | P3 | 30min |
| 7 | Fix article create isPublic→isPublished mapping (separate fields or document behavior) | P3 | 30min |
| 8 | Add pagination (skip/take) to all 5 list endpoints | P2 | 2h |
| 9 | Add search/filter query params to ticket and article list endpoints | P2 | 2h |
| 10 | Update hub: "Scaffolded"→"Partial", "Minimal tests"→"30 tests / 591 LOC", security note about RolesGuard | P1 (docs) | 30min |
| 11 | Module exports nothing — add exports if other modules need Help Desk services | P3 | 5min |
| 12 | Migrate KB categories from TenantConfig JSON to dedicated Prisma model (before frontend build) | P3 | 4h |

### Module Stats

| Metric | Value |
|--------|-------|
| Active files | 17 (.ts, non-spec) |
| Active LOC | 1,463 |
| Test files | 10 (.spec.ts) |
| Test LOC | 591 |
| Total LOC | 2,054 |
| DTO classes | 15 (in single file) |
| Prisma models | 8 |
| Prisma enums | 5 |
| EventEmitter events | 6 |
| Module exports | 0 |
| .bak directory | None |
