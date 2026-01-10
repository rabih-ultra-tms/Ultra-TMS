# 15 - Workflow Service API Implementation

> **Service:** Workflow Automation  
> **Priority:** P2 - Medium  
> **Endpoints:** 35  
> **Dependencies:** Auth ✅, All Services (event sources)  
> **Doc Reference:** [26-service-workflow.md](../../02-services/26-service-workflow.md)

---

## 📋 Overview

Business process automation engine enabling no-code workflow creation with triggers, conditions, and actions. Orchestrates cross-service processes, handles approvals, and automates repetitive tasks.

### Key Capabilities
- Visual workflow builder with drag-and-drop
- Event, schedule, and manual triggers
- Condition logic with if/then/else branching
- Multi-step approval workflows
- Parallel execution and wait states
- Pre-built action library for all services

---

## ✅ Pre-Implementation Checklist

- [ ] Auth service is working (permissions)
- [ ] Event system is working (triggers)
- [ ] All core services are available (actions)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### Workflow Model
```prisma
model Workflow {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  category          WorkflowCategory
  
  triggerType       TriggerType
  triggerConfig     Json
  
  steps             Json              @default("[]")
  
  isActive          Boolean           @default(false)
  runAsUserId       String?
  maxRetries        Int               @default(3)
  retryDelayMinutes Int               @default(5)
  timeoutMinutes    Int               @default(60)
  
  version           Int               @default(1)
  publishedVersion  Int               @default(0)
  draftSteps        Json?
  
  executionCount    Int               @default(0)
  lastExecutedAt    DateTime?
  successCount      Int               @default(0)
  failureCount      Int               @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  deletedAt         DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  workflowSteps     WorkflowStep[]
  executions        WorkflowExecution[]
  scheduledRuns     ScheduledWorkflowRun[]
  
  @@index([tenantId, triggerType, isActive])
  @@index([tenantId, category])
}

enum WorkflowCategory {
  OPERATIONS
  SALES
  ACCOUNTING
  CARRIER
  HR
  CUSTOM
}

enum TriggerType {
  EVENT
  SCHEDULE
  MANUAL
  WEBHOOK
}
```

### WorkflowStep Model
```prisma
model WorkflowStep {
  id                String            @id @default(cuid())
  workflowId        String
  
  stepOrder         Int
  stepType          StepType
  name              String?
  
  actionType        String?
  actionConfig      Json              @default("{}")
  
  conditionExpression String?         @db.Text
  
  onSuccessStepId   String?
  onFailureStepId   String?
  
  timeoutMinutes    Int?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  workflow          Workflow          @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  stepExecutions    StepExecution[]
  
  @@unique([workflowId, stepOrder])
  @@index([workflowId])
}

enum StepType {
  ACTION
  CONDITION
  APPROVAL
  WAIT
  PARALLEL
  LOOP
}
```

### WorkflowExecution Model
```prisma
model WorkflowExecution {
  id                String            @id @default(cuid())
  tenantId          String
  workflowId        String
  
  executionNumber   String
  
  triggerType       TriggerType
  triggerEvent      Json?
  triggerData       Json              @default("{}")
  
  entityType        String?
  entityId          String?
  
  status            ExecutionStatus   @default(PENDING)
  currentStepId     String?
  
  variables         Json              @default("{}")
  
  startedAt         DateTime?
  completedAt       DateTime?
  
  result            Json              @default("{}")
  errorMessage      String?           @db.Text
  
  attemptNumber     Int               @default(1)
  
  triggeredBy       String?
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  workflow          Workflow          @relation(fields: [workflowId], references: [id])
  stepExecutions    StepExecution[]
  approvalRequests  ApprovalRequest[]
  
  @@index([workflowId, createdAt])
  @@index([status])
  @@index([entityType, entityId])
}

enum ExecutionStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
  WAITING
}
```

### StepExecution Model
```prisma
model StepExecution {
  id                    String            @id @default(cuid())
  workflowExecutionId   String
  stepId                String?
  
  stepOrder             Int
  stepType              StepType
  stepName              String?
  
  status                StepStatus        @default(PENDING)
  
  inputData             Json              @default("{}")
  outputData            Json              @default("{}")
  
  startedAt             DateTime?
  completedAt           DateTime?
  
  errorMessage          String?           @db.Text
  retryCount            Int               @default(0)
  
  createdAt             DateTime          @default(now())
  
  workflowExecution     WorkflowExecution @relation(fields: [workflowExecutionId], references: [id], onDelete: Cascade)
  step                  WorkflowStep?     @relation(fields: [stepId], references: [id])
  approvalRequests      ApprovalRequest[]
  
  @@index([workflowExecutionId, stepOrder])
}

enum StepStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  SKIPPED
}
```

### ApprovalRequest Model
```prisma
model ApprovalRequest {
  id                    String            @id @default(cuid())
  tenantId              String
  workflowExecutionId   String
  stepExecutionId       String
  
  requestNumber         String
  
  approvalType          ApprovalType
  
  entityType            String
  entityId              String
  entitySummary         String?           @db.Text
  
  requestedAction       String
  requestData           Json              @default("{}")
  
  approvers             Json              // [{userId, roleId, status, respondedAt}]
  requiredApprovals     Int               @default(1)
  
  status                ApprovalStatus    @default(PENDING)
  
  dueAt                 DateTime?
  reminderSent          Boolean           @default(false)
  
  resolvedAt            DateTime?
  resolvedBy            String?
  resolutionNotes       String?           @db.Text
  
  requestedBy           String?
  createdAt             DateTime          @default(now())
  
  tenant                Tenant            @relation(fields: [tenantId], references: [id])
  workflowExecution     WorkflowExecution @relation(fields: [workflowExecutionId], references: [id])
  stepExecution         StepExecution     @relation(fields: [stepExecutionId], references: [id])
  
  @@unique([tenantId, requestNumber])
  @@index([status, dueAt])
  @@index([entityType, entityId])
}

enum ApprovalType {
  SINGLE
  ALL
  ANY
  SEQUENTIAL
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
  CANCELLED
}
```

### WorkflowTemplate Model
```prisma
model WorkflowTemplate {
  id                    String            @id @default(cuid())
  tenantId              String?
  
  name                  String
  description           String?           @db.Text
  category              WorkflowCategory
  
  triggerType           TriggerType
  triggerConfigTemplate Json
  stepsTemplate         Json
  
  parametersSchema      Json              @default("{}")
  
  isSystem              Boolean           @default(false)
  isPublished           Boolean           @default(true)
  
  usageCount            Int               @default(0)
  
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  createdBy             String?
  
  tenant                Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
  @@index([category])
}
```

---

## 🛠️ API Endpoints

### Workflows (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflows` | List workflows |
| POST | `/api/v1/workflows` | Create workflow |
| GET | `/api/v1/workflows/:id` | Get workflow |
| PUT | `/api/v1/workflows/:id` | Update workflow |
| DELETE | `/api/v1/workflows/:id` | Delete workflow |
| POST | `/api/v1/workflows/:id/publish` | Publish version |
| POST | `/api/v1/workflows/:id/activate` | Activate workflow |
| POST | `/api/v1/workflows/:id/deactivate` | Deactivate |
| POST | `/api/v1/workflows/:id/execute` | Manual execute |
| GET | `/api/v1/workflows/:id/stats` | Execution stats |

### Workflow Executions (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflows/:id/executions` | List executions |
| GET | `/api/v1/workflow-executions/:id` | Get execution |
| POST | `/api/v1/workflow-executions/:id/cancel` | Cancel execution |
| POST | `/api/v1/workflow-executions/:id/retry` | Retry failed |
| GET | `/api/v1/workflow-executions/:id/steps` | Get step history |
| GET | `/api/v1/workflow-executions/:id/logs` | Get logs |
| GET | `/api/v1/workflow-executions` | All executions |

### Approvals (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/approvals` | List approvals |
| GET | `/api/v1/approvals/pending` | My pending |
| GET | `/api/v1/approvals/:id` | Get approval |
| POST | `/api/v1/approvals/:id/approve` | Approve |
| POST | `/api/v1/approvals/:id/reject` | Reject |
| POST | `/api/v1/approvals/:id/delegate` | Delegate |
| GET | `/api/v1/approvals/stats` | Approval stats |

### Templates (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflow-templates` | List templates |
| GET | `/api/v1/workflow-templates/:id` | Get template |
| POST | `/api/v1/workflow-templates` | Create template |
| PUT | `/api/v1/workflow-templates/:id` | Update template |
| DELETE | `/api/v1/workflow-templates/:id` | Delete template |
| POST | `/api/v1/workflow-templates/:id/create-workflow` | Create from template |

### Actions (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflows/actions` | List available actions |
| GET | `/api/v1/workflows/actions/:type` | Get action schema |
| GET | `/api/v1/workflows/triggers` | List available triggers |
| GET | `/api/v1/workflows/triggers/:type` | Get trigger schema |
| POST | `/api/v1/workflows/validate` | Validate workflow |

---

## 📝 DTO Specifications

### CreateWorkflowDto
```typescript
export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(WorkflowCategory)
  category: WorkflowCategory;

  @IsEnum(TriggerType)
  triggerType: TriggerType;

  @IsObject()
  triggerConfig: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps: WorkflowStepDto[];

  @IsOptional()
  @IsInt()
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  timeoutMinutes?: number;
}

export class WorkflowStepDto {
  @IsInt()
  stepOrder: number;

  @IsEnum(StepType)
  stepType: StepType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  actionType?: string;

  @IsOptional()
  @IsObject()
  actionConfig?: Record<string, any>;

  @IsOptional()
  @IsString()
  conditionExpression?: string;

  @IsOptional()
  @IsInt()
  timeoutMinutes?: number;
}
```

### ExecuteWorkflowDto
```typescript
export class ExecuteWorkflowDto {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}
```

### ApprovalResponseDto
```typescript
export class ApprovalResponseDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DelegateApprovalDto {
  @IsString()
  delegateToUserId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
```

### CreateFromTemplateDto
```typescript
export class CreateFromTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  activate?: boolean;
}
```

---

## 📋 Business Rules

### Action Library
```typescript
const actionLibrary = {
  'tms.update_order_status': {
    name: 'Update Order Status',
    params: ['order_id', 'status', 'notes']
  },
  'tms.assign_carrier': {
    name: 'Assign Carrier to Load',
    params: ['load_id', 'carrier_id', 'rate']
  },
  'comm.send_email': {
    name: 'Send Email',
    params: ['to', 'template_id', 'variables']
  },
  'comm.create_task': {
    name: 'Create Task',
    params: ['user_id', 'title', 'due_date']
  },
  'accounting.create_invoice': {
    name: 'Generate Invoice',
    params: ['order_id', 'customer_id']
  },
  'system.delay': {
    name: 'Wait',
    params: ['duration_minutes']
  }
};
```

### Trigger Events
```typescript
const triggerEvents = [
  'order.created',
  'order.status_changed',
  'order.delivered',
  'load.tender_accepted',
  'load.tender_rejected',
  'carrier.compliance_expiring',
  'invoice.created',
  'invoice.overdue',
  'payment.received',
  'claim.created'
];
```

### Execution Flow
```
Trigger → Start Execution → Step 1 → Step 2 → ... → Complete
                              ↓
                          On Failure
                              ↓
                        Retry or Fail
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `workflow.started` | Execution start | `{ executionId, workflowId }` |
| `workflow.completed` | Execution done | `{ executionId, result }` |
| `workflow.failed` | Execution fail | `{ executionId, error }` |
| `workflow.step.completed` | Step done | `{ stepId, output }` |
| `approval.requested` | New approval | `{ requestId, approvers }` |
| `approval.approved` | Approved | `{ requestId, approvedBy }` |
| `approval.rejected` | Rejected | `{ requestId, rejectedBy }` |
| `approval.expired` | Timed out | `{ requestId }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `*` | All Services | Match to event triggers |
| `scheduler.cron` | Scheduler | Process scheduled runs |

---

## 🧪 Integration Test Requirements

```typescript
describe('Workflow Service API', () => {
  describe('Workflows', () => {
    it('should create workflow');
    it('should publish workflow version');
    it('should activate/deactivate');
    it('should execute manually');
  });

  describe('Executions', () => {
    it('should trigger on event');
    it('should execute steps in order');
    it('should handle conditions');
    it('should retry on failure');
    it('should cancel execution');
  });

  describe('Approvals', () => {
    it('should create approval request');
    it('should approve request');
    it('should reject request');
    it('should delegate approval');
    it('should expire after deadline');
  });

  describe('Templates', () => {
    it('should create from template');
    it('should customize parameters');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/workflow/
├── workflow.module.ts
├── workflows/
│   ├── workflows.controller.ts
│   ├── workflows.service.ts
│   └── dto/
├── executions/
│   ├── executions.controller.ts
│   ├── executions.service.ts
│   └── workflow-engine.service.ts
├── approvals/
│   ├── approvals.controller.ts
│   └── approvals.service.ts
├── templates/
│   ├── templates.controller.ts
│   └── templates.service.ts
├── actions/
│   ├── actions.controller.ts
│   ├── action-registry.service.ts
│   └── actions/
│       ├── tms.actions.ts
│       ├── comm.actions.ts
│       ├── accounting.actions.ts
│       └── system.actions.ts
└── triggers/
    ├── event-trigger.handler.ts
    └── schedule-trigger.handler.ts
```

---

## ✅ Completion Checklist

- [ ] All 35 endpoints implemented
- [ ] Workflow CRUD with versioning
- [ ] Workflow engine executing steps
- [ ] Event trigger matching
- [ ] Schedule trigger with cron
- [ ] Approval request workflow
- [ ] Action library implemented
- [ ] Retry and error handling
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>28</td>
    <td>Workflow</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>35/35</td>
    <td>5/5</td>
    <td>100%</td>
    <td>Workflows, Executions, Approvals, Templates, Actions</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[16-integration-hub-api.md](./16-integration-hub-api.md)** - Implement Integration Hub API
