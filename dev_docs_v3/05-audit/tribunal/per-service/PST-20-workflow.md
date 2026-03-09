# PST-20: Workflow Engine — Per-Service Tribunal Audit

> **Service:** Workflow Engine (#20)
> **Priority:** P2 Extended | **Batch:** 4 (P2 Platform)
> **Date:** 2026-03-09
> **Hub file:** `dev_docs_v3/01-services/p2-extended/20-workflow.md`
> **Verdict:** MODIFY | **Health Score:** 7.5/10 (was 2.0/10, +5.5 delta)

---

## Phase 1: Endpoint Verification

| Controller | Hub Count | Actual Count | Path Accuracy |
|---|---|---|---|
| WorkflowsController (`/workflows`) | 15 | 15 | ~100% |
| TemplatesController (`/workflow-templates`) | 6 | 6 | ~100% |
| ApprovalsController (`/approvals`) | 7 | 7 | ~100% |
| ExecutionsController (`/workflow-executions`) | 6 | 6 | ~100% |
| WorkflowExecutionsController (`/workflows/:id/executions`) | 1 | 1 | ~100% |
| **TOTAL** | **35** | **35** | **~100%** |

**Endpoint count: 100% accurate (8th perfect count match across all services).**
**Path accuracy: ~100%** — all paths verified against controller decorators.

---

## Phase 2: Data Model Verification

### Models

| Hub Model | Prisma Model | Match | Notes |
|---|---|---|---|
| Workflow | Workflow | Yes | Fields ~90% accurate |
| WorkflowTemplate | WorkflowTemplate | Yes | Fields ~90% accurate |
| WorkflowStep | WorkflowStep | Yes | Fields ~95% accurate |
| WorkflowExecution | WorkflowExecution | Yes | Fields ~90% accurate |
| ScheduledWorkflowRun | ScheduledWorkflowRun | Yes | 2 field name errors |
| ApprovalRequest | ApprovalRequest | Yes | `requestedById` → `createdById` |
| *(not documented)* | **StepExecution** | **MISSING** | 17 fields, execution tracking backbone |

### Errors

| Hub Claim | Reality |
|---|---|
| 6 Prisma models | **7 models** — StepExecution undocumented |
| Workflow `@@unique([tenantId, name])` | **Phantom constraint** — not in schema |
| WorkflowTemplate `@@unique([tenantId, templateName])` | **Phantom constraint** — not in schema |
| ScheduledWorkflowRun.`cronExpression` | Actually `scheduleExpression` |
| ScheduledWorkflowRun.`timezone` field | **Doesn't exist** in Prisma |
| ApprovalRequest.`requestedById` | Actually `createdById` |

---

## Phase 3: Security Verification

| Controller | JwtAuthGuard | RolesGuard | Effective |
|---|---|---|---|
| WorkflowsController | Yes | **Yes** | Enforced |
| TemplatesController | Yes | **Yes** | Enforced |
| ApprovalsController | Yes | **NO** | **@Roles decorative only** |
| ExecutionsController | Yes | **NO** | **@Roles decorative only** |
| WorkflowExecutionsController | Yes | **NO** | **@Roles decorative only** |

**Hub claim: "All endpoints: JwtAuthGuard + RolesGuard" — FALSE.**

3/5 controllers have `@Roles()` decorators but no `RolesGuard` in `@UseGuards`. Without RolesGuard, roles are not enforced — any authenticated user can approve/reject/delegate approvals, cancel/retry executions.

**Tenant isolation: 100%** — all services use `@CurrentTenant()`.

**Soft-delete gaps:**
- ApprovalRequest `findAll`, `findOne`, `findPending` do NOT filter `deletedAt: null`

---

## Phase 4: Test Verification

| Hub Claim | Actual |
|---|---|
| "3 spec files" (but lists 4 names) | **4 spec files** |
| Coverage unknown | 626 LOC total |

| File | LOC | Tests |
|---|---|---|
| workflows.service.spec.ts | 201 | 14 |
| approvals.service.spec.ts | 183 | ~10 |
| executions.service.spec.ts | 141 | ~8 |
| templates.service.spec.ts | 101 | ~6 |
| **Total** | **626** | **~38** |

Hub self-contradicts: says "3 spec files" then parenthetically lists 4 file names.

---

## Phase 5: Critical Findings

### P0 — Action Library is Metadata-Only Stub

The execution engine (`startExecution()`) does NOT actually execute actions from the action library. All non-APPROVAL steps are immediately marked COMPLETED with `{ message: 'Step completed' }`. The 6 action types:

- `tms.update_order_status` — **not wired** to OrdersService
- `tms.assign_carrier` — **not wired** to CarriersService
- `comm.send_email` — **not wired** to CommunicationService
- `comm.create_task` — **not wired** to any task service
- `accounting.create_invoice` — **not wired** to AccountingService
- `system.delay` — **not wired** to any delay mechanism

These are metadata objects with `{ name, params }` only. No dispatch function, no service injection.

### P1 — 3/5 Controllers Missing RolesGuard

ApprovalsController, ExecutionsController, WorkflowExecutionsController all have `@UseGuards(JwtAuthGuard)` without RolesGuard. The `@Roles()` decorators are present but non-functional without the guard.

### P1 — 5/6 Step Types Unimplemented

| Step Type | Status |
|---|---|
| ACTION | Stub (marks complete, doesn't execute) |
| APPROVAL | **Functional** (creates ApprovalRequest, pauses execution) |
| CONDITION | Not implemented (treated as instant-complete) |
| WAIT | Not implemented |
| PARALLEL | Not implemented |
| LOOP | Not implemented |

### P1 — No Scheduled Workflow Runner

`ScheduledWorkflowRun` model exists with `scheduleExpression`, `nextRunAt`, `lastRunAt`, `isActive` — but no cron service reads or processes this table. SCHEDULE-type workflows cannot execute on schedule.

### P2 — ApprovalRequest Soft-Delete Not Filtered

`ApprovalsService.findAll()`, `findOne()`, `findPending()` do NOT filter `deletedAt: null`.

### P2 — Retry Resets ALL Steps

`retry()` calls `stepExecution.updateMany()` on ALL steps, then re-executes from `fromStepNumber`. Previously-completed steps before that number lose their output data.

### P2 — Random Request Number

`generateRequestNumber()` uses `Math.random()` for `APR-YYYYMMDD-XXXX` — collision risk.

### P3 — Module Exports Nothing

`WorkflowModule` has no `exports` array. Other modules cannot inject workflow services for cross-module integration.

### P3 — .bak (2,301 LOC)

`workflow.bak/` is a previous version. Same structure, larger services. Safe to delete per QS-009.

---

## Tribunal Rounds

### Round 1: Hub Health Score Challenge
Hub claims D (2/10). Endpoint docs are excellent (100% count, ~100% paths). Data model ~80% (misses StepExecution, 2 phantom constraints). Security claim is FALSE. Test count self-contradicts.

### Round 2: Code Quality
- CRUD: Production-quality (transactions, pagination, soft-delete, search)
- Execution: Fundamentally a stub — action library is metadata, no real execution
- Approvals: Fully functional with EventEmitter integration
- Templates: Functional with parameterized `{{placeholder}}` substitution
- DTOs: Comprehensive — Swagger, validation, response classes

### Round 3: What Works vs What Doesn't

**Works:** Workflow CRUD lifecycle (create/update/publish/activate/deactivate/delete), template management, approval workflow (create from step, approve/reject/delegate), execution tracking, step-level detail, validation endpoint.

**Doesn't work:** Actual action execution, scheduled triggers, condition evaluation, wait/parallel/loop steps, cross-module service integration.

### Round 4: Score

| Area | Score |
|---|---|
| CRUD operations | 9/10 |
| Execution engine | 4/10 |
| Security | 6/10 |
| Approval system | 8/10 |
| Template system | 8/10 |
| Tests | 7/10 |
| **Overall** | **7.5/10** |

### Round 5: Final Verdict — MODIFY

**Reasoning:** Backend CRUD and lifecycle management are production-quality. Approval system is real and functional. But the execution engine — the core purpose of a workflow service — is a pass-through stub. Calling the backend "Built" in the hub without noting that 5/6 step types are unimplemented and the action library isn't wired is misleading.

---

## Action Items

| # | Priority | Action | Target |
|---|---|---|---|
| 1 | P1 | Add `RolesGuard` to ApprovalsController, ExecutionsController, WorkflowExecutionsController | 3 controller files |
| 2 | P1 | Hub: Add StepExecution model to Section 8 | Hub |
| 3 | P1 | Hub: Correct security claim — note 3/5 controllers missing RolesGuard | Hub Sections 1, 2, 42 |
| 4 | P1 | Hub: Add known issue — execution engine is pass-through stub | Hub Section 11 |
| 5 | P1 | Hub: Add known issue — 5/6 step types unimplemented | Hub Section 11 |
| 6 | P2 | Hub: Fix ScheduledWorkflowRun fields (scheduleExpression, no timezone) | Hub Section 8 |
| 7 | P2 | Hub: Remove phantom @@unique constraints | Hub Section 8 |
| 8 | P2 | Hub: Fix spec file count from 3 to 4 | Hub Section 1 |
| 9 | P2 | Add `deletedAt: null` filter to ApprovalRequest queries | approvals.service.ts |
| 10 | P3 | Delete `workflow.bak/` per QS-009 (2,301 LOC) | QS-009 |
| 11 | P3 | Module exports: Export services for cross-module use | workflow.module.ts |
| 12 | P3 | Replace Math.random() in request number generation | approvals.service.ts |

---

## LOC Summary

| Area | LOC |
|---|---|
| Active module (19 files) | 2,950 |
| .bak (14 files) | 2,301 |
| Tests (4 spec files) | 626 |
| DTOs (4 files) | 643 |
