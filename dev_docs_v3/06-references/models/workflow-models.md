# Workflow Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Workflow | Workflow definitions | WorkflowStep, WorkflowExecution |
| WorkflowStep | Steps within workflows | Workflow |
| WorkflowExecution | Running workflow instances | Workflow, StepExecution |
| WorkflowTemplate | Reusable workflow templates | |
| StepExecution | Individual step execution records | WorkflowExecution |
| ScheduledWorkflowRun | Scheduled workflow triggers | |
| ApprovalRequest | Approval workflow requests | |

## Workflow

Configurable business workflow definitions.

| Field | Type | Notes |
|-------|------|-------|
| name | String | VarChar(255) |
| description | String? | |
| entityType | String | VarChar(50) — ORDER, LOAD, CLAIM, etc. |
| triggerType | String | VarChar(50) — MANUAL, EVENT, SCHEDULE |
| triggerConfig | Json | @default("{}") |
| isActive | Boolean | @default(true) |
| version | Int | @default(1) |

**Relations:** WorkflowStep[], WorkflowExecution[]

## WorkflowStep

| Field | Type | Notes |
|-------|------|-------|
| workflowId | String | FK to Workflow |
| stepNumber | Int | Sequence |
| stepName | String | VarChar(255) |
| stepType | String | VarChar(50) — ACTION, CONDITION, APPROVAL, NOTIFICATION |
| config | Json | Step-specific configuration |
| timeout | Int? | Timeout in minutes |
| retryCount | Int | @default(0) |
| onSuccessStepId | String? | Next step on success |
| onFailureStepId | String? | Next step on failure |

## WorkflowExecution

Running instance of a workflow.

| Field | Type | Notes |
|-------|------|-------|
| workflowId | String | FK to Workflow |
| entityType | String | VarChar(50) |
| entityId | String | |
| status | String | VarChar(50) — RUNNING, COMPLETED, FAILED, CANCELLED |
| currentStepId | String? | |
| startedAt | DateTime | |
| completedAt | DateTime? | |
| errorMessage | String? | |
| context | Json | @default("{}") — execution context/variables |

**Relations:** StepExecution[]

## ApprovalRequest

Generic approval workflow.

| Field | Type | Notes |
|-------|------|-------|
| requestNumber | String | VarChar(50) |
| title | String | VarChar(255) |
| approvalType | ApprovalType enum | CREDIT, SETTLEMENT, CLAIM, RATE |
| entityType | String | VarChar(50) |
| entityId | String | |
| approverIds | String[] | |
| status | String | @default("PENDING") |
| dueDate | DateTime? | |
| decidedBy/decidedAt/decision/comments | | Decision fields |

**Unique:** `[tenantId, requestNumber]`
