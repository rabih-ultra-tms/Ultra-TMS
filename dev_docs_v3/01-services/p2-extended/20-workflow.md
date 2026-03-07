# Service Hub: Workflow Engine (20)

> **Priority:** P2 Extended | **Status:** Backend Built, Frontend Not Built
> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Workflow service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/19-workflow/` (8 files)
> **v2 hub (historical):** N/A

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Confidence** | High -- source-verified 2026-03-07, all controllers and DTOs read |
| **Last Verified** | 2026-03-07 |
| **Backend** | Built -- 5 controllers, 35 endpoints, 4 services, ~2,950 LOC in `apps/api/src/modules/workflow/` |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | Partial -- 3 spec files (`approvals.service.spec.ts`, `executions.service.spec.ts`, `templates.service.spec.ts`, `workflows.service.spec.ts`) |
| **Note** | `workflow.bak/` directory exists -- needs resolution per QS-009. Backend is surprisingly complete for a P2 service. |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Workflow service definition in dev_docs |
| Design Specs | Done | 8 screen specs in `dev_docs/12-Rabih-design-Process/19-workflow/` |
| Backend -- Workflows | Built | `workflows.controller.ts` -- 15 endpoints (CRUD + publish/activate/deactivate/execute/stats + action/trigger library) |
| Backend -- Templates | Built | `templates.controller.ts` -- 6 endpoints (CRUD + create-workflow-from-template) |
| Backend -- Approvals | Built | `approvals.controller.ts` -- 7 endpoints (list/pending/stats/detail + approve/reject/delegate) |
| Backend -- Executions | Built | `executions.controller.ts` -- 7 endpoints (list/detail/steps/logs + cancel/retry + nested by-workflow) |
| Backend -- Actions Library | Built | `actions.constants.ts` -- 6 action types, 10 trigger events, 4 trigger schemas |
| DTOs | Built | `workflow.dto.ts`, `execution.dto.ts`, `approval.dto.ts`, `template.dto.ts` -- full validation + Swagger |
| Prisma Models | Built | Workflow, WorkflowTemplate, WorkflowExecution, WorkflowStep, ScheduledWorkflowRun, ApprovalRequest |
| Frontend Pages | Not Built | 0 of 8 planned screens |
| React Hooks | Not Built | No hooks |
| Components | Not Built | No components |
| Tests | Partial | Spec files exist but coverage unknown |
| Security | Good | All endpoints: JwtAuthGuard + RolesGuard with role-specific access |

---

## 3. Screens

| Screen | Route | Status | Quality | Design Spec |
|--------|-------|--------|---------|-------------|
| Workflow Dashboard | `/workflows` | Not Built | -- | `01-workflow-dashboard.md` |
| Workflow Templates | `/workflows/templates` | Not Built | -- | `02-workflow-templates.md` |
| Workflow Builder | `/workflows/builder` | Not Built | -- | `03-workflow-builder.md` |
| Workflow Instances | `/workflows/[id]` | Not Built | -- | `04-workflow-instances.md` |
| Approval Queue | `/approvals` | Not Built | -- | `05-approval-queue.md` |
| Workflow History | `/workflows/history` | Not Built | -- | `06-workflow-history.md` |
| Automation Rules | `/workflows/automation` | Not Built | -- | `07-automation-rules.md` |
| Workflow Reports | `/workflows/reports` | Not Built | -- | `08-workflow-reports.md` |

---

## 4. API Endpoints

### WorkflowsController (`@Controller('workflows')`) -- 15 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/workflows/actions` | Built | List all action types from action library |
| GET | `/api/v1/workflows/actions/:type` | Built | Get single action type details |
| GET | `/api/v1/workflows/triggers` | Built | List all trigger schemas (EVENT, SCHEDULE, MANUAL, WEBHOOK) |
| GET | `/api/v1/workflows/triggers/:type` | Built | Get single trigger schema with events |
| POST | `/api/v1/workflows/validate` | Built | Validate workflow definition (dry run) |
| GET | `/api/v1/workflows` | Built | List workflows (paginated, filterable by status/triggerType/search) |
| POST | `/api/v1/workflows` | Built | Create workflow with steps |
| GET | `/api/v1/workflows/:id` | Built | Workflow detail |
| PUT | `/api/v1/workflows/:id` | Built | Update workflow definition |
| DELETE | `/api/v1/workflows/:id` | Built | Delete workflow (ADMIN only) |
| POST | `/api/v1/workflows/:id/publish` | Built | Publish workflow (ADMIN only) |
| POST | `/api/v1/workflows/:id/activate` | Built | Activate workflow (ADMIN only) |
| POST | `/api/v1/workflows/:id/deactivate` | Built | Deactivate workflow (ADMIN only) |
| POST | `/api/v1/workflows/:id/execute` | Built | Manually execute workflow with trigger data |
| GET | `/api/v1/workflows/:id/stats` | Built | Execution totals + last executed timestamp |

### TemplatesController (`@Controller('workflow-templates')`) -- 6 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/workflow-templates` | Built | List templates (filterable by category) |
| GET | `/api/v1/workflow-templates/:id` | Built | Template detail |
| POST | `/api/v1/workflow-templates` | Built | Create template (ADMIN only) |
| PUT | `/api/v1/workflow-templates/:id` | Built | Update template (ADMIN only) |
| DELETE | `/api/v1/workflow-templates/:id` | Built | Delete template (ADMIN only) |
| POST | `/api/v1/workflow-templates/:id/create-workflow` | Built | Instantiate workflow from template |

### ApprovalsController (`@Controller('approvals')`) -- 7 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/approvals` | Built | List approvals (filterable by status/entityType/entityId) |
| GET | `/api/v1/approvals/pending` | Built | List pending approvals for current user |
| GET | `/api/v1/approvals/stats` | Built | Approval stats (total/pending/approved/rejected) |
| GET | `/api/v1/approvals/:id` | Built | Approval detail |
| POST | `/api/v1/approvals/:id/approve` | Built | Approve request (MANAGER/ADMIN) |
| POST | `/api/v1/approvals/:id/reject` | Built | Reject with required reason (MANAGER/ADMIN) |
| POST | `/api/v1/approvals/:id/delegate` | Built | Delegate approval to another user |

### ExecutionsController (`@Controller('workflow-executions')`) -- 6 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/workflow-executions` | Built | List executions (filterable by workflowId/status) |
| GET | `/api/v1/workflow-executions/:id` | Built | Execution detail with steps |
| GET | `/api/v1/workflow-executions/:id/steps` | Built | Step-by-step execution breakdown |
| GET | `/api/v1/workflow-executions/:id/logs` | Built | Execution audit logs |
| POST | `/api/v1/workflow-executions/:id/cancel` | Built | Cancel running execution |
| POST | `/api/v1/workflow-executions/:id/retry` | Built | Retry from specific step number |

### WorkflowExecutionsController (`@Controller('workflows/:workflowId/executions')`) -- 1 endpoint

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/workflows/:workflowId/executions` | Built | List executions scoped to a specific workflow |

---

## 5. Components

No frontend components exist. Planned components based on design specs:

| Component | Purpose | Status |
|-----------|---------|--------|
| WorkflowDashboardPage | KPI cards, active workflows list, recent executions | Not Built |
| WorkflowBuilder | Visual drag-and-drop step builder (NODE + EDGE model) | Not Built |
| WorkflowStepEditor | Configure individual step (action type, conditions, timeout) | Not Built |
| WorkflowTemplateCard | Template preview card with category badge | Not Built |
| ApprovalQueueTable | Pending approvals list with approve/reject inline actions | Not Built |
| ExecutionTimeline | Step-by-step execution timeline with status indicators | Not Built |
| TriggerConfigForm | Configure trigger type (event selector, cron editor, webhook URL) | Not Built |
| ActionConfigForm | Configure action (email template, field update, task creation) | Not Built |
| WorkflowStatusBadge | ACTIVE/INACTIVE/DRAFT status badge | Not Built |
| ExecutionStatusBadge | PENDING/RUNNING/COMPLETED/FAILED/CANCELLED/WAITING badge | Not Built |

---

## 6. Hooks

No frontend hooks exist. Required hooks based on API endpoints:

| Hook | Endpoints Used | Status |
|------|---------------|--------|
| `useWorkflows` | GET `/workflows` | Not Built |
| `useWorkflow` | GET `/workflows/:id` | Not Built |
| `useCreateWorkflow` | POST `/workflows` | Not Built |
| `useUpdateWorkflow` | PUT `/workflows/:id` | Not Built |
| `useDeleteWorkflow` | DELETE `/workflows/:id` | Not Built |
| `usePublishWorkflow` | POST `/workflows/:id/publish` | Not Built |
| `useActivateWorkflow` | POST `/workflows/:id/activate` | Not Built |
| `useDeactivateWorkflow` | POST `/workflows/:id/deactivate` | Not Built |
| `useExecuteWorkflow` | POST `/workflows/:id/execute` | Not Built |
| `useWorkflowStats` | GET `/workflows/:id/stats` | Not Built |
| `useWorkflowActions` | GET `/workflows/actions` | Not Built |
| `useWorkflowTriggers` | GET `/workflows/triggers` | Not Built |
| `useValidateWorkflow` | POST `/workflows/validate` | Not Built |
| `useWorkflowTemplates` | GET `/workflow-templates` | Not Built |
| `useCreateFromTemplate` | POST `/workflow-templates/:id/create-workflow` | Not Built |
| `useApprovals` | GET `/approvals` | Not Built |
| `usePendingApprovals` | GET `/approvals/pending` | Not Built |
| `useApprovalStats` | GET `/approvals/stats` | Not Built |
| `useApproveRequest` | POST `/approvals/:id/approve` | Not Built |
| `useRejectRequest` | POST `/approvals/:id/reject` | Not Built |
| `useDelegateApproval` | POST `/approvals/:id/delegate` | Not Built |
| `useWorkflowExecutions` | GET `/workflow-executions` | Not Built |
| `useExecutionDetail` | GET `/workflow-executions/:id` | Not Built |
| `useExecutionSteps` | GET `/workflow-executions/:id/steps` | Not Built |
| `useCancelExecution` | POST `/workflow-executions/:id/cancel` | Not Built |
| `useRetryExecution` | POST `/workflow-executions/:id/retry` | Not Built |

---

## 7. Business Rules

1. **Trigger Types:** Four trigger types are supported -- MANUAL (user-initiated), EVENT (fires on domain events like `order.status_changed`, `load.tender_accepted`, `invoice.overdue`), SCHEDULE (cron-based recurring execution with timezone), WEBHOOK (external HTTP trigger with endpoint key). Each trigger has a JSON schema for configuration validation.

2. **Action Library:** Six built-in actions -- `tms.update_order_status` (change order status), `tms.assign_carrier` (assign carrier to load with rate), `comm.send_email` (send templated email), `comm.create_task` (assign task to user with due date), `accounting.create_invoice` (generate invoice for order), `system.delay` (wait N minutes before next step).

3. **Workflow Steps:** Steps execute sequentially with six step types -- ACTION (run an action from the library), CONDITION (branch based on logic expression), APPROVAL (pause for human approval), WAIT (delay execution), PARALLEL (run multiple branches simultaneously), LOOP (iterate over a collection). Each step has optional timeout and retry configuration.

4. **Approval Chains:** Four approval modes -- SINGLE (one approver), ALL (every listed approver must approve), ANY (first approval is sufficient), SEQUENTIAL (approvers in order). Approvals can be delegated to another user. Rejections require a reason. Approvals have due dates and can expire.

5. **Templates:** Reusable workflow definitions with trigger config and steps JSON. Templates can be system-provided (e.g., load approval, credit review) or tenant-created. `POST /workflow-templates/:id/create-workflow` instantiates a new workflow from a template with optional parameter overrides and auto-activation.

6. **Versioning:** Workflow updates create a new version (version field defaults to 1, increments on publish). Existing in-flight executions continue using the version they started with. Only ADMIN can publish/activate/deactivate workflows.

7. **Execution Lifecycle:** Executions track step-by-step progress with input/output data per step. Failed steps record error messages and retry count. Executions can be cancelled (with reason) or retried from a specific step number. Six execution statuses: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, WAITING.

8. **Validation:** Workflow definitions can be validated before creation via `POST /workflows/validate` (dry run). This checks trigger configuration, step ordering, action parameter completeness, and condition logic syntax.

9. **Tenant Isolation:** All workflows, templates, executions, and approvals are tenant-scoped. A tenant's workflow cannot trigger actions affecting another tenant's data. All controllers use `@CurrentTenant()` decorator.

10. **Role-Based Access:** ADMIN has full access (create, publish, activate, delete). OPERATIONS_MANAGER can create/update workflows and create from templates. DISPATCHER and SALES_REP have read-only access to workflows. Approval actions require MANAGER or ADMIN role.

---

## 8. Data Model

### Workflow
```
Workflow {
  id                String (UUID, @default(uuid()))
  tenantId          String (FK -> Tenant)
  name              String
  description       String?
  triggerType        TriggerType (enum: EVENT, SCHEDULE, MANUAL, WEBHOOK)
  triggerEvent      String?
  triggerConditions  Json (default: {})
  status            String (default: "ACTIVE")
  version           Int (default: 1)
  createdById       String?
  steps             WorkflowStep[]
  executions        WorkflowExecution[]
  scheduledRuns     ScheduledWorkflowRun[]
  createdAt         DateTime
  updatedAt         DateTime
  deletedAt         DateTime?

  @@unique([tenantId, name])
}
```

### WorkflowTemplate
```
WorkflowTemplate {
  id              String (UUID, @default(uuid()))
  tenantId        String (FK -> Tenant)
  templateName    String
  category        String?
  description     String?
  triggerConfig   Json (trigger type + conditions)
  stepsJson       Json (default: [] -- serialized step definitions)
  isSystem        Boolean (default: false)
  isActive        Boolean (default: true)
  createdById     String?
  createdAt       DateTime
  updatedAt       DateTime

  @@unique([tenantId, templateName])
}
```

### WorkflowStep
```
WorkflowStep {
  id              String (UUID)
  workflowId      String (FK -> Workflow)
  stepNumber      Int (execution order, min: 1)
  stepType        StepType (ACTION, CONDITION, APPROVAL, WAIT, PARALLEL, LOOP)
  stepName        String?
  actionConfig    Json? (action type + parameters)
  conditionLogic  String? (expression for CONDITION steps)
  timeoutSeconds  Int? (step-level timeout)
  retryConfig     Json? (max retries, backoff strategy)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### WorkflowExecution
```
WorkflowExecution {
  id              String (UUID)
  workflowId      String (FK -> Workflow)
  tenantId        String (FK -> Tenant)
  status          WorkflowExecutionStatus (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, WAITING)
  triggerData     Json (payload that triggered execution)
  startedAt       DateTime?
  completedAt     DateTime?
  result          Json? (final output)
  errorMessage    String?
  executedById    String?
  createdAt       DateTime
  updatedAt       DateTime
}
```

### ApprovalRequest
```
ApprovalRequest {
  id              String (UUID)
  tenantId        String (FK -> Tenant)
  requestNumber   String (auto-generated)
  title           String
  description     String?
  approvalType    ApprovalType (SINGLE, ALL, ANY, SEQUENTIAL)
  entityType      String (e.g., "LOAD", "INVOICE", "CREDIT")
  entityId        String
  approverIds     String[] (user IDs)
  status          ApprovalStatus (PENDING, APPROVED, REJECTED, EXPIRED, CANCELLED)
  dueDate         DateTime?
  decidedBy       String?
  decidedAt       DateTime?
  decision        String?
  comments        String?
  requestedById   String?
  customFields    Json?
  createdAt       DateTime
  updatedAt       DateTime
}
```

### ScheduledWorkflowRun
```
ScheduledWorkflowRun {
  id              String (UUID)
  workflowId      String (FK -> Workflow)
  tenantId        String (FK -> Tenant)
  cronExpression  String
  timezone        String?
  nextRunAt       DateTime
  lastRunAt       DateTime?
  isActive        Boolean (default: true)
  createdAt       DateTime
  updatedAt       DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `name` | Required, string | "Workflow name is required" |
| `triggerType` | IsEnum(TriggerType): EVENT, SCHEDULE, MANUAL, WEBHOOK | "Invalid trigger type" |
| `triggerEvent` | Optional string (required when triggerType = EVENT) | -- |
| `triggerConditions` | Optional JSON object | -- |
| `status` | IsEnum(WorkflowStatus): ACTIVE, INACTIVE, DRAFT, WAITING | "Invalid workflow status" |
| `steps[].stepNumber` | Required int, min 1 | "Step number must be >= 1" |
| `steps[].stepType` | IsEnum(StepType): ACTION, CONDITION, APPROVAL, WAIT, PARALLEL, LOOP | "Invalid step type" |
| `steps[].timeoutSeconds` | Optional int, min 1 | "Timeout must be >= 1 second" |
| Template `templateName` | Required string | "Template name is required" |
| Template `triggerConfig` | Required JSON object | "Trigger configuration is required" |
| Template `stepsJson` | Required array | "Steps definition is required" |
| Approval `reason` (reject) | Required string | "Rejection reason is required" |
| Approval `delegateToUserId` | Required string | "Delegate user ID is required" |
| Execution retry `fromStepNumber` | Optional int, min 1 | "Step number must be >= 1" |
| Query `page` | Optional int, min 1 | -- |
| Query `limit` | Optional int, min 1 | -- |

---

## 10. Status States

### Workflow Status Machine
```
DRAFT -> ACTIVE (publish + activate)
ACTIVE -> INACTIVE (deactivate -- ADMIN only)
INACTIVE -> ACTIVE (activate -- ADMIN only)
ACTIVE -> DRAFT (update triggers new version as draft)
Any -> deleted (soft delete -- ADMIN only)
```

### Workflow Execution Status Machine
```
PENDING -> RUNNING (execution starts)
RUNNING -> COMPLETED (all steps succeed)
RUNNING -> FAILED (step fails after retries exhausted)
RUNNING -> WAITING (approval step or wait step)
WAITING -> RUNNING (approval granted or wait expired)
RUNNING -> CANCELLED (manual cancel)
PENDING -> CANCELLED (cancelled before start)
FAILED -> RUNNING (retry from step)
```

### Approval Status Machine
```
PENDING -> APPROVED (approver accepts)
PENDING -> REJECTED (approver rejects with reason)
PENDING -> EXPIRED (due date passed)
PENDING -> CANCELLED (workflow cancelled)
PENDING -> PENDING (delegated to new approver -- same status, different assignee)
```

### Step Execution Status Machine
```
PENDING -> RUNNING (step starts)
RUNNING -> COMPLETED (step succeeds)
RUNNING -> FAILED (step fails, retries exhausted)
RUNNING -> CANCELLED (execution cancelled)
```

---

## 11. Known Issues

| Issue | Severity | File/Area | Status |
|-------|----------|-----------|--------|
| `workflow.bak/` directory exists alongside active module | P1 Cleanup | `apps/api/src/modules/workflow.bak/` | Open -- QS-009 |
| No frontend at all -- 0 of 8 planned screens built | P2 Feature | `apps/web/` | Open |
| No frontend hooks -- API is stranded without consumers | P2 Feature | `apps/web/lib/hooks/` | Open |
| Workflow Builder (visual designer) is the most complex planned screen | P2 Risk | -- | Not started |
| CONDITION trigger type referenced in Prisma but not in backend trigger schemas (schemas have EVENT, SCHEDULE, MANUAL, WEBHOOK) | P3 Mismatch | `actions.constants.ts` vs Prisma | Open |
| No scheduled job runner for SCHEDULE trigger type -- cron execution not wired | P1 Gap | Backend | Needs verification |
| Retry logic for failed steps -- service-level implementation not verified | P2 Gap | `executions.service.ts` | Needs verification |

---

## 12. Tasks

### Quality Sprint (Active)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| WF-001 | Resolve `workflow.bak/` directory (merge or remove) | S (1h) | Open -- QS-009 |
| WF-002 | Verify scheduled workflow runner exists and works | S (1h) | Open |
| WF-003 | Verify step retry logic in `executions.service.ts` | S (1h) | Open |

### Backlog -- Frontend Build
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| WF-101 | Create workflow CRUD hooks (list, detail, create, update, delete) | M (4h) | P2 |
| WF-102 | Create approval hooks (list, pending, approve, reject, delegate) | M (3h) | P2 |
| WF-103 | Create execution hooks (list, detail, steps, cancel, retry) | M (3h) | P2 |
| WF-104 | Create template hooks (list, detail, create-from-template) | S (2h) | P2 |
| WF-105 | Build Workflow Dashboard page (KPI cards, active list, recent executions) | L (8h) | P2 |
| WF-106 | Build Workflow Builder UI (visual step designer -- most complex) | XL (20h) | P2 |
| WF-107 | Build Workflow Templates page (browse, preview, create-from) | M (5h) | P2 |
| WF-108 | Build Approval Queue page (pending list, inline approve/reject) | M (5h) | P2 |
| WF-109 | Build Workflow History / Execution Detail page (timeline view) | M (5h) | P2 |
| WF-110 | Build Automation Rules page | M (5h) | P2 |
| WF-111 | Build Workflow Reports page | M (5h) | P2 |
| WF-112 | Write frontend tests for workflow pages | L (8h) | P2 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Overview | `dev_docs/12-Rabih-design-Process/19-workflow/00-service-overview.md` |
| Workflow Dashboard | Full spec | `dev_docs/12-Rabih-design-Process/19-workflow/01-workflow-dashboard.md` |
| Workflow Templates | Full spec | `dev_docs/12-Rabih-design-Process/19-workflow/02-workflow-templates.md` |
| Workflow Builder | Full spec | `dev_docs/12-Rabih-design-Process/19-workflow/03-workflow-builder.md` |
| Workflow Instances | Full spec | `dev_docs/12-Rabih-design-Process/19-workflow/04-workflow-instances.md` |
| Approval Queue | Full spec | `dev_docs/12-Rabih-design-Process/19-workflow/05-approval-queue.md` |
| Workflow History | Full spec | `dev_docs/12-Rabih-design-Process/19-workflow/06-workflow-history.md` |
| Automation Rules | Full spec | `dev_docs/12-Rabih-design-Process/19-workflow/07-automation-rules.md` |
| Workflow Reports | Full spec | `dev_docs/12-Rabih-design-Process/19-workflow/08-workflow-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| 4 controllers estimated | 5 controllers (WorkflowExecutionsController is separate nested) | Slightly ahead |
| ~5 endpoints estimated | 35 endpoints verified across 5 controllers | Far ahead of estimate |
| Basic CRUD only | Full lifecycle: CRUD + publish/activate/deactivate + execute + validate + action library + trigger library | Exceeds plan |
| Simple trigger types | 4 trigger types with JSON schemas + 10 domain events | Exceeds plan |
| No approval system | Full approval system with 4 modes (SINGLE/ALL/ANY/SEQUENTIAL) + delegation | Exceeds plan |
| No templates | Template system with create-from-template instantiation | Exceeds plan |
| Frontend partially built | 0 of 8 screens built -- no pages, hooks, or components | Behind plan |
| Tests required | Spec files exist in backend, 0 frontend tests | Partial |
| Prisma models basic | 6 models: Workflow, WorkflowTemplate, WorkflowStep, WorkflowExecution, ScheduledWorkflowRun, ApprovalRequest | Exceeds plan |

**Summary:** Backend is remarkably complete for a P2 service (~2,950 LOC, 35 endpoints, 6 Prisma models). The entire bottleneck is frontend -- zero screens, hooks, or components exist. The Workflow Builder (visual designer) will be the most complex and expensive screen to build (estimated XL/20h).

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT authentication, role-based access via RolesGuard, tenantId isolation)
- Communication (email sending for `comm.send_email` action, task creation for `comm.create_task`)
- TMS Core (order status updates for `tms.update_order_status` action, carrier assignment for `tms.assign_carrier`)
- Accounting (invoice generation for `accounting.create_invoice` action)
- All event-emitting services (workflow EVENT triggers listen for: `order.created`, `order.status_changed`, `order.delivered`, `load.tender_accepted`, `load.tender_rejected`, `carrier.compliance_expiring`, `invoice.created`, `invoice.overdue`, `payment.received`, `claim.created`)

**Depended on by:**
- Any service needing automated processes (load approval workflows, credit review workflows, compliance escalation)
- Any service needing approval chains (invoice approval, carrier onboarding approval, rate changes)
- Dashboard (pending approvals count widget)
- Notifications (approval reminders, workflow failure alerts)
