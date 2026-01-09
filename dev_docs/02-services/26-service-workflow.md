# 19 - Workflow Service

| Field            | Value                              |
| ---------------- | ---------------------------------- |
| **Service ID**   | 19                                 |
| **Service Name** | Workflow                           |
| **Category**     | Platform                           |
| **Module Path**  | `@modules/workflow`                |
| **Phase**        | A (MVP)                            |
| **Weeks**        | 39-42                              |
| **Priority**     | P2                                 |
| **Dependencies** | Auth, All Services (event sources) |

---

## Purpose

Business process automation engine enabling no-code workflow creation with triggers, conditions, and actions. Orchestrates cross-service processes, handles approvals, and automates repetitive tasks to improve operational efficiency.

---

## Features

- **Visual Workflow Builder** - Drag-and-drop workflow designer
- **Event Triggers** - System events, schedules, or manual start
- **Condition Logic** - If/then/else branching with complex conditions
- **Action Library** - Pre-built actions for all services
- **Approval Workflows** - Multi-step approval processes
- **Parallel Execution** - Run multiple branches simultaneously
- **Wait States** - Pause until condition met or time elapsed
- **Error Handling** - Retry logic and failure notifications
- **Workflow Templates** - Pre-built workflow templates
- **Execution History** - Complete audit trail of all executions
- **Version Control** - Track workflow changes over time

---

## Database Schema

```sql
-- Workflow Definitions
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,          -- OPERATIONS, SALES, ACCOUNTING, CARRIER, HR, CUSTOM

    -- Definition
    trigger_type VARCHAR(50) NOT NULL,       -- EVENT, SCHEDULE, MANUAL, WEBHOOK
    trigger_config JSONB NOT NULL,           -- Event name, cron, webhook settings

    -- Steps (stored as ordered array for flexibility)
    steps JSONB NOT NULL DEFAULT '[]',

    -- Settings
    is_active BOOLEAN DEFAULT false,
    run_as_user_id UUID REFERENCES users(id), -- Context for permission checks
    max_retries INTEGER DEFAULT 3,
    retry_delay_minutes INTEGER DEFAULT 5,
    timeout_minutes INTEGER DEFAULT 60,

    -- Version Control
    version INTEGER DEFAULT 1,
    published_version INTEGER DEFAULT 0,
    draft_steps JSONB,                       -- Unpublished changes

    -- Statistics
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,

    -- Migration
    external_id VARCHAR(100),
    source_system VARCHAR(50),
    custom_fields JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_workflows_tenant ON workflows(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_trigger ON workflows(tenant_id, trigger_type, is_active);
CREATE INDEX idx_workflows_category ON workflows(tenant_id, category);

-- Workflow Steps (for complex querying)
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL,          -- ACTION, CONDITION, APPROVAL, WAIT, PARALLEL, LOOP
    name VARCHAR(200),

    -- Action Configuration
    action_type VARCHAR(100),                -- send_email, update_record, create_task, etc.
    action_config JSONB NOT NULL DEFAULT '{}',

    -- Condition Configuration
    condition_expression TEXT,               -- For CONDITION type

    -- Branching
    on_success_step_id UUID,
    on_failure_step_id UUID,

    -- Timeout
    timeout_minutes INTEGER,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workflow_id, step_order)
);

CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id, step_order);

-- Workflow Executions
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    workflow_id UUID NOT NULL REFERENCES workflows(id),

    execution_number VARCHAR(30) NOT NULL,   -- WF-{YYYYMMDD}-{sequence}

    -- Trigger Context
    trigger_type VARCHAR(50) NOT NULL,
    trigger_event JSONB,                     -- Event payload that triggered
    trigger_data JSONB DEFAULT '{}',         -- Additional context data

    -- Entity Context
    entity_type VARCHAR(50),                 -- orders, carriers, invoices, etc.
    entity_id UUID,

    -- Execution State
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, WAITING
    current_step_id UUID,

    -- Variables (workflow context)
    variables JSONB DEFAULT '{}',

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Results
    result JSONB DEFAULT '{}',
    error_message TEXT,

    -- Retry
    attempt_number INTEGER DEFAULT 1,

    -- Audit
    triggered_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_executions_tenant ON workflow_executions(tenant_id, created_at DESC);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id, created_at DESC);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status)
    WHERE status IN ('PENDING', 'RUNNING', 'WAITING');
CREATE INDEX idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id);

-- Step Executions
CREATE TABLE step_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES workflow_steps(id),

    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    step_name VARCHAR(200),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, RUNNING, COMPLETED, FAILED, SKIPPED

    -- Input/Output
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Error
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_step_executions_workflow ON step_executions(workflow_execution_id, step_order);

-- Approval Requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    workflow_execution_id UUID NOT NULL REFERENCES workflow_executions(id),
    step_execution_id UUID NOT NULL REFERENCES step_executions(id),

    request_number VARCHAR(30) NOT NULL,     -- APR-{YYYYMMDD}-{sequence}

    -- Approval Type
    approval_type VARCHAR(50) NOT NULL,      -- SINGLE, ALL, ANY, SEQUENTIAL

    -- What's Being Approved
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    entity_summary TEXT,                     -- Human readable summary

    -- Request Details
    requested_action VARCHAR(100) NOT NULL,  -- approve_quote, release_load, approve_credit
    request_data JSONB DEFAULT '{}',

    -- Approvers
    approvers JSONB NOT NULL,                -- [{user_id, role_id, status, responded_at}]
    required_approvals INTEGER DEFAULT 1,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED, EXPIRED, CANCELLED

    -- Deadline
    due_at TIMESTAMPTZ,
    reminder_sent BOOLEAN DEFAULT false,

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,

    -- Audit
    requested_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, request_number)
);

CREATE INDEX idx_approval_requests_tenant ON approval_requests(tenant_id, status, created_at DESC);
CREATE INDEX idx_approval_requests_pending ON approval_requests(status, due_at)
    WHERE status = 'PENDING';
CREATE INDEX idx_approval_requests_entity ON approval_requests(entity_type, entity_id);

-- Workflow Templates
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for system templates

    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,

    -- Template Definition
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config_template JSONB NOT NULL,
    steps_template JSONB NOT NULL,

    -- Parameters (for customization)
    parameters_schema JSONB DEFAULT '{}',

    -- Status
    is_system BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,

    -- Usage Stats
    usage_count INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_workflow_templates_tenant ON workflow_templates(tenant_id);
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);

-- Scheduled Workflow Runs
CREATE TABLE scheduled_workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    workflow_id UUID NOT NULL REFERENCES workflows(id),

    -- Schedule
    cron_expression VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',

    next_run_at TIMESTAMPTZ NOT NULL,
    last_run_at TIMESTAMPTZ,
    last_execution_id UUID REFERENCES workflow_executions(id),

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_runs_next ON scheduled_workflow_runs(next_run_at)
    WHERE is_active = true;
```

---

## Action Library

### TMS Actions

| Action                    | Description              | Parameters                     |
| ------------------------- | ------------------------ | ------------------------------ |
| `tms.update_order_status` | Update order status      | order_id, status, notes        |
| `tms.assign_carrier`      | Assign carrier to load   | load_id, carrier_id, rate      |
| `tms.send_tender`         | Send load tender         | load_id, carrier_ids, deadline |
| `tms.create_appointment`  | Schedule pickup/delivery | stop_id, date, time, notes     |
| `tms.add_accessorial`     | Add accessorial charge   | order_id, type, amount         |

### Carrier Actions

| Action                      | Description             | Parameters                |
| --------------------------- | ----------------------- | ------------------------- |
| `carrier.update_status`     | Update carrier status   | carrier_id, status        |
| `carrier.request_documents` | Request compliance docs | carrier_id, doc_types     |
| `carrier.update_scorecard`  | Update carrier score    | carrier_id, metric, value |
| `carrier.flag_compliance`   | Flag compliance issue   | carrier_id, issue_type    |

### Accounting Actions

| Action                         | Description            | Parameters                 |
| ------------------------------ | ---------------------- | -------------------------- |
| `accounting.create_invoice`    | Generate invoice       | order_id, customer_id      |
| `accounting.apply_credit`      | Apply credit memo      | invoice_id, amount, reason |
| `accounting.hold_payment`      | Place payment on hold  | carrier_pay_id, reason     |
| `accounting.release_payment`   | Release payment hold   | carrier_pay_id             |
| `accounting.create_collection` | Create collection task | invoice_id                 |

### Communication Actions

| Action              | Description           | Parameters                 |
| ------------------- | --------------------- | -------------------------- |
| `comm.send_email`   | Send email            | to, template_id, variables |
| `comm.send_sms`     | Send SMS              | to, message                |
| `comm.create_task`  | Create follow-up task | user_id, title, due_date   |
| `comm.notify_users` | In-app notification   | user_ids, message, link    |
| `comm.send_slack`   | Send Slack message    | channel, message           |

### Sales Actions

| Action                     | Description                | Parameters                      |
| -------------------------- | -------------------------- | ------------------------------- |
| `sales.update_opportunity` | Update opportunity stage   | opportunity_id, stage           |
| `sales.create_quote`       | Create quote from template | customer_id, template_id        |
| `sales.assign_rep`         | Assign sales rep           | entity_type, entity_id, user_id |

### System Actions

| Action                  | Description              | Parameters                  |
| ----------------------- | ------------------------ | --------------------------- |
| `system.delay`          | Wait for duration        | duration_minutes            |
| `system.wait_for_event` | Wait for event           | event_type, timeout_minutes |
| `system.run_workflow`   | Trigger another workflow | workflow_id, variables      |
| `system.http_request`   | Call external API        | url, method, body, headers  |
| `system.set_variable`   | Set workflow variable    | name, value                 |
| `system.log`            | Log message              | level, message              |

---

## Trigger Types

### Event Triggers

| Event                         | Description             | Available Variables                   |
| ----------------------------- | ----------------------- | ------------------------------------- |
| `order.created`               | New order created       | order._, customer._                   |
| `order.status_changed`        | Order status changed    | order.\*, previous_status, new_status |
| `order.delivered`             | Order delivered         | order._, load._, pod.\*               |
| `load.tender_sent`            | Tender sent to carrier  | load._, tender._                      |
| `load.tender_accepted`        | Carrier accepted tender | load._, carrier._                     |
| `load.tender_rejected`        | Carrier rejected tender | load._, carrier._, reason             |
| `carrier.compliance_expiring` | Docs expiring soon      | carrier.\*, doc_type, expires_at      |
| `carrier.created`             | New carrier registered  | carrier.\*                            |
| `invoice.created`             | Invoice generated       | invoice._, customer._                 |
| `invoice.overdue`             | Invoice past due        | invoice.\*, days_overdue              |
| `payment.received`            | Payment received        | payment._, invoice._                  |
| `quote.created`               | Quote created           | quote._, customer._                   |
| `quote.accepted`              | Quote accepted          | quote._, customer._                   |
| `claim.created`               | Claim filed             | claim._, order._                      |

### Schedule Triggers

```json
{
  "type": "SCHEDULE",
  "cron": "0 8 * * 1",
  "timezone": "America/Chicago",
  "description": "Every Monday at 8am CT"
}
```

### Manual Triggers

```json
{
  "type": "MANUAL",
  "allowed_roles": ["operations_manager", "admin"],
  "required_entity": "order",
  "input_form": [
    { "field": "reason", "type": "text", "required": true },
    {
      "field": "priority",
      "type": "select",
      "options": ["low", "medium", "high"]
    }
  ]
}
```

### Webhook Triggers

```json
{
  "type": "WEBHOOK",
  "endpoint_key": "wf_abc123",
  "authentication": "bearer_token",
  "expected_payload": {
    "order_id": "string",
    "action": "string"
  }
}
```

---

## API Endpoints

### Workflow Management

| Method | Endpoint                           | Description          |
| ------ | ---------------------------------- | -------------------- |
| GET    | `/api/v1/workflows`                | List workflows       |
| GET    | `/api/v1/workflows/:id`            | Get workflow details |
| POST   | `/api/v1/workflows`                | Create workflow      |
| PUT    | `/api/v1/workflows/:id`            | Update workflow      |
| DELETE | `/api/v1/workflows/:id`            | Delete workflow      |
| POST   | `/api/v1/workflows/:id/publish`    | Publish changes      |
| POST   | `/api/v1/workflows/:id/activate`   | Activate workflow    |
| POST   | `/api/v1/workflows/:id/deactivate` | Deactivate workflow  |
| POST   | `/api/v1/workflows/:id/clone`      | Clone workflow       |
| GET    | `/api/v1/workflows/:id/versions`   | Get version history  |
| POST   | `/api/v1/workflows/:id/test`       | Test run workflow    |

### Workflow Execution

| Method | Endpoint                                 | Description           |
| ------ | ---------------------------------------- | --------------------- |
| POST   | `/api/v1/workflows/:id/execute`          | Manually trigger      |
| GET    | `/api/v1/workflows/:id/executions`       | List executions       |
| GET    | `/api/v1/workflow-executions/:id`        | Get execution details |
| GET    | `/api/v1/workflow-executions/:id/steps`  | Get step history      |
| POST   | `/api/v1/workflow-executions/:id/cancel` | Cancel execution      |
| POST   | `/api/v1/workflow-executions/:id/retry`  | Retry failed          |

### Approval Management

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/api/v1/approvals`              | List pending approvals |
| GET    | `/api/v1/approvals/my`           | My pending approvals   |
| GET    | `/api/v1/approvals/:id`          | Get approval details   |
| POST   | `/api/v1/approvals/:id/approve`  | Approve request        |
| POST   | `/api/v1/approvals/:id/reject`   | Reject request         |
| POST   | `/api/v1/approvals/:id/delegate` | Delegate to another    |
| POST   | `/api/v1/approvals/:id/comment`  | Add comment            |

### Templates

| Method | Endpoint                             | Description          |
| ------ | ------------------------------------ | -------------------- |
| GET    | `/api/v1/workflow-templates`         | List templates       |
| GET    | `/api/v1/workflow-templates/:id`     | Get template         |
| POST   | `/api/v1/workflow-templates/:id/use` | Create from template |

### Webhook Endpoints

| Method | Endpoint                         | Description              |
| ------ | -------------------------------- | ------------------------ |
| POST   | `/api/v1/workflows/webhook/:key` | Webhook trigger endpoint |

---

## Events

### Published Events

| Event                          | Payload                          | Description          |
| ------------------------------ | -------------------------------- | -------------------- |
| `workflow.created`             | `{workflowId, name}`             | Workflow created     |
| `workflow.activated`           | `{workflowId}`                   | Workflow activated   |
| `workflow.deactivated`         | `{workflowId}`                   | Workflow deactivated |
| `workflow.execution_started`   | `{executionId, workflowId}`      | Execution started    |
| `workflow.execution_completed` | `{executionId, status}`          | Execution completed  |
| `workflow.execution_failed`    | `{executionId, error}`           | Execution failed     |
| `approval.requested`           | `{approvalId, approvers}`        | Approval requested   |
| `approval.approved`            | `{approvalId, approver}`         | Request approved     |
| `approval.rejected`            | `{approvalId, approver, reason}` | Request rejected     |
| `approval.expired`             | `{approvalId}`                   | Request expired      |

### Subscribed Events

Workflow service subscribes to ALL configurable events across the platform based on active workflow triggers.

---

## Business Rules

### Workflow Execution

1. **Trigger Matching**
   - Events matched against active workflow triggers
   - Multiple workflows can trigger from same event
   - Deactivated workflows never trigger

2. **Execution Context**
   - Each execution isolated with own variables
   - Run-as user determines permission context
   - Sensitive data masked in logs

3. **Error Handling**
   - Failed steps retry up to max_retries
   - Exponential backoff between retries
   - Final failure triggers error handler (if defined)
   - Admin notified of repeated failures

4. **Timeout Handling**
   - Workflows timeout at configured limit
   - Timed-out executions marked FAILED
   - Wait steps can have independent timeouts

### Approval Rules

1. **Approval Types**
   - `SINGLE`: Any one approver sufficient
   - `ALL`: All approvers must approve
   - `ANY`: First response (approve/reject) decides
   - `SEQUENTIAL`: Approvers in order

2. **Deadlines**
   - Reminders sent 24h before due
   - Expired approvals auto-reject (configurable)
   - Escalation can be configured

3. **Delegation**
   - Approvers can delegate to others
   - Delegation must be to user with same/higher role
   - Original approver notified of decision

---

## Pre-Built Workflow Templates

### Operational Templates

| Template                 | Trigger                       | Description                          |
| ------------------------ | ----------------------------- | ------------------------------------ |
| Load Late Notification   | `load.appointment_missed`     | Notify customer and ops of late load |
| Carrier Compliance Alert | `carrier.compliance_expiring` | Request docs before expiration       |
| POD Follow-Up            | 24h after delivery            | Request POD if not uploaded          |
| Hot Load Escalation      | `load.tracking_overdue`       | Escalate loads without updates       |

### Financial Templates

| Template                  | Trigger                        | Description                       |
| ------------------------- | ------------------------------ | --------------------------------- |
| Invoice Overdue Reminder  | `invoice.overdue`              | Send reminder sequence            |
| Large Invoice Approval    | `invoice.created`              | Approval for invoices > threshold |
| Credit Application Review | `credit_application.submitted` | Route for credit review           |
| Payment Hold Notification | `carrier_pay.held`             | Notify carrier of hold reason     |

### Sales Templates

| Template              | Trigger                | Description                 |
| --------------------- | ---------------------- | --------------------------- |
| New Customer Welcome  | `customer.created`     | Send welcome sequence       |
| Quote Follow-Up       | 48h after quote        | Follow up on pending quotes |
| Win/Loss Notification | `quote.status_changed` | Notify team of outcomes     |
| Contract Renewal      | 60 days before expiry  | Initiate renewal process    |

---

## Screens

| Screen            | Path                        | Description              |
| ----------------- | --------------------------- | ------------------------ |
| Workflow List     | `/workflows`                | All workflows            |
| Workflow Builder  | `/workflows/builder`        | Visual designer          |
| Workflow Detail   | `/workflows/:id`            | View/edit workflow       |
| Execution History | `/workflows/:id/executions` | Workflow runs            |
| Execution Detail  | `/workflows/executions/:id` | Single run detail        |
| My Approvals      | `/approvals`                | Pending approvals        |
| Approval Detail   | `/approvals/:id`            | View/respond to approval |
| Templates         | `/workflows/templates`      | Template library         |
| Workflow Monitor  | `/workflows/monitor`        | Live execution monitor   |

---

## Configuration

### Environment Variables

```bash
# Workflow Engine
WORKFLOW_MAX_CONCURRENT_EXECUTIONS=100
WORKFLOW_DEFAULT_TIMEOUT_MINUTES=60
WORKFLOW_MAX_RETRIES=3
WORKFLOW_RETRY_BASE_DELAY_MS=5000
WORKFLOW_EVENT_QUEUE_SIZE=10000

# Approval Settings
APPROVAL_DEFAULT_DUE_HOURS=48
APPROVAL_REMINDER_HOURS=24
APPROVAL_AUTO_EXPIRE=true
```

### Default Settings

```json
{
  "maxWorkflowsPerTenant": 100,
  "maxStepsPerWorkflow": 50,
  "executionRetentionDays": 90,
  "enableWebhookTriggers": true,
  "enableHttpActions": false,
  "approvalExpirationHours": 48
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Trigger matching logic
- [ ] Condition expression evaluation
- [ ] Variable substitution
- [ ] Step sequencing
- [ ] Approval routing logic
- [ ] Cron expression parsing

### Integration Tests

- [ ] Event-triggered execution
- [ ] Multi-step workflow completion
- [ ] Parallel branch execution
- [ ] Wait state resumption
- [ ] Approval workflow flow
- [ ] Error retry mechanism

### E2E Tests

- [ ] Workflow builder UI
- [ ] Manual workflow trigger
- [ ] Approval request/response cycle
- [ ] Execution monitoring
- [ ] Template usage flow

---

## Navigation

- **Previous:** [18 - Analytics](../18-analytics/README.md)
- **Next:** [20 - Integration Hub](../20-integration-hub/README.md)
- **Index:** [All Services](../README.md)
