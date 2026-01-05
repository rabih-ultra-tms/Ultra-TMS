# Service 17: HR Service

| Field             | Value                                               |
| ----------------- | --------------------------------------------------- |
| **Service ID**    | 17                                                  |
| **Service Name**  | HR Service                                          |
| **Category**      | Platform Services                                   |
| **Phase**         | B (Enhancement)                                     |
| **Planned Weeks** | 83-86                                               |
| **Priority**      | P2                                                  |
| **Dependencies**  | Auth/Admin (01), Documents (10), Communication (11) |

---

## Overview

### Purpose

Manage employee information, organizational structure, onboarding, time tracking, payroll integration, and workforce administration. Provides HR capabilities for brokerages managing internal staff.

### Key Features

- Employee profiles and employment records
- Organizational structure and reporting hierarchy
- Position and job title management
- Onboarding workflow and checklists
- Time and attendance tracking
- PTO and leave management
- Payroll data integration
- Performance reviews and goal tracking
- Compliance and certification tracking

---

## Database Schema

### Employees Table

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Link to System User
    user_id UUID REFERENCES users(id),

    -- Employee Reference
    employee_number VARCHAR(20) NOT NULL,

    -- Personal Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    preferred_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    personal_email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),

    -- Demographics (optional, for EEO)
    date_of_birth DATE,
    gender VARCHAR(20),
    ethnicity VARCHAR(50),

    -- Address
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(3) DEFAULT 'USA',

    -- Employment
    employment_type VARCHAR(20) NOT NULL,  -- FULL_TIME, PART_TIME, CONTRACT, TEMP
    employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, ON_LEAVE, TERMINATED
    hire_date DATE NOT NULL,
    start_date DATE,
    termination_date DATE,
    termination_reason VARCHAR(100),
    termination_type VARCHAR(20),  -- VOLUNTARY, INVOLUNTARY, LAYOFF, RETIREMENT

    -- Position
    position_id UUID REFERENCES positions(id),
    department_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES employees(id),
    location_id UUID REFERENCES locations(id),

    -- Compensation (basic info, detailed in separate table)
    pay_type VARCHAR(20),  -- SALARY, HOURLY
    pay_rate DECIMAL(12,2),
    pay_frequency VARCHAR(20),  -- WEEKLY, BIWEEKLY, SEMIMONTHLY, MONTHLY

    -- Tax Info
    ssn_encrypted VARCHAR(255),  -- Encrypted SSN
    w4_status VARCHAR(20),
    w4_allowances INTEGER,

    -- Banking
    direct_deposit BOOLEAN DEFAULT FALSE,
    bank_routing VARCHAR(20),
    bank_account VARCHAR(50),
    bank_account_type VARCHAR(20),

    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),

    -- Profile
    photo_url VARCHAR(500),
    bio TEXT,

    -- Onboarding
    onboarding_status VARCHAR(20),  -- NOT_STARTED, IN_PROGRESS, COMPLETED
    onboarding_completed_at TIMESTAMP,

    -- Migration Support
    external_id VARCHAR(100),
    source_system VARCHAR(50),

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}',

    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    UNIQUE(tenant_id, employee_number)
);

CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_user ON employees(user_id);
```

### Departments Table

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Department Info
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20),
    description TEXT,

    -- Hierarchy
    parent_department_id UUID REFERENCES departments(id),

    -- Leadership
    department_head_id UUID REFERENCES employees(id),

    -- Cost Center
    cost_center VARCHAR(50),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_departments_tenant ON departments(tenant_id);
CREATE INDEX idx_departments_parent ON departments(parent_department_id);
```

### Positions Table

```sql
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Position Info
    title VARCHAR(200) NOT NULL,
    code VARCHAR(20),
    description TEXT,

    -- Department
    department_id UUID REFERENCES departments(id),

    -- Classification
    job_family VARCHAR(100),
    job_level VARCHAR(50),  -- ENTRY, MID, SENIOR, MANAGER, DIRECTOR, VP, EXECUTIVE
    is_manager BOOLEAN DEFAULT FALSE,

    -- Compensation
    pay_grade VARCHAR(20),
    min_salary DECIMAL(12,2),
    max_salary DECIMAL(12,2),

    -- Requirements
    requirements TEXT,
    qualifications TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_positions_tenant ON positions(tenant_id);
CREATE INDEX idx_positions_department ON positions(department_id);
```

### Locations Table

```sql
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Location Info
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20),
    location_type VARCHAR(50),  -- HEADQUARTERS, BRANCH, REMOTE, WAREHOUSE

    -- Address
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(3) DEFAULT 'USA',

    -- Contact
    phone VARCHAR(20),

    -- Timezone
    timezone VARCHAR(50) DEFAULT 'America/Chicago',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_locations_tenant ON locations(tenant_id);
```

### Employment History Table

```sql
CREATE TABLE employment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID NOT NULL REFERENCES employees(id),

    -- Change Type
    change_type VARCHAR(50) NOT NULL,  -- HIRE, PROMOTION, TRANSFER, DEMOTION, TITLE_CHANGE, DEPARTMENT_CHANGE, PAY_CHANGE, TERMINATION

    -- Effective Date
    effective_date DATE NOT NULL,

    -- Previous Values
    previous_position_id UUID REFERENCES positions(id),
    previous_department_id UUID REFERENCES departments(id),
    previous_manager_id UUID REFERENCES employees(id),
    previous_pay_rate DECIMAL(12,2),
    previous_title VARCHAR(200),

    -- New Values
    new_position_id UUID REFERENCES positions(id),
    new_department_id UUID REFERENCES departments(id),
    new_manager_id UUID REFERENCES employees(id),
    new_pay_rate DECIMAL(12,2),
    new_title VARCHAR(200),

    -- Details
    reason TEXT,
    notes TEXT,

    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employment_history_employee ON employment_history(employee_id);
CREATE INDEX idx_employment_history_date ON employment_history(effective_date);
```

### Time Off Balances Table

```sql
CREATE TABLE time_off_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID NOT NULL REFERENCES employees(id),

    -- Time Off Type
    time_off_type VARCHAR(50) NOT NULL,  -- PTO, SICK, VACATION, PERSONAL, FLOATING_HOLIDAY

    -- Year
    year INTEGER NOT NULL,

    -- Balances (in hours)
    accrued_hours DECIMAL(6,2) DEFAULT 0,
    used_hours DECIMAL(6,2) DEFAULT 0,
    pending_hours DECIMAL(6,2) DEFAULT 0,
    available_hours DECIMAL(6,2) DEFAULT 0,
    carryover_hours DECIMAL(6,2) DEFAULT 0,
    max_carryover DECIMAL(6,2),

    -- Accrual Rate
    accrual_rate DECIMAL(6,4),  -- Hours per pay period

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(employee_id, time_off_type, year)
);

CREATE INDEX idx_time_off_balances_employee ON time_off_balances(employee_id);
```

### Time Off Requests Table

```sql
CREATE TABLE time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID NOT NULL REFERENCES employees(id),

    -- Request Type
    time_off_type VARCHAR(50) NOT NULL,

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_hours DECIMAL(6,2) NOT NULL,

    -- Partial Days
    partial_day_start BOOLEAN DEFAULT FALSE,
    start_time TIME,
    partial_day_end BOOLEAN DEFAULT FALSE,
    end_time TIME,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, APPROVED, DENIED, CANCELLED

    -- Notes
    employee_notes TEXT,
    manager_notes TEXT,

    -- Approval
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    denied_reason TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_time_off_requests_employee ON time_off_requests(employee_id);
CREATE INDEX idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX idx_time_off_requests_dates ON time_off_requests(start_date, end_date);
```

### Time Entries Table

```sql
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID NOT NULL REFERENCES employees(id),

    -- Date
    work_date DATE NOT NULL,

    -- Time
    clock_in TIMESTAMP,
    clock_out TIMESTAMP,

    -- Hours
    regular_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    break_hours DECIMAL(5,2),
    total_hours DECIMAL(5,2),

    -- Type
    entry_type VARCHAR(20) DEFAULT 'WORK',  -- WORK, HOLIDAY, PTO, SICK

    -- Notes
    notes TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED

    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX idx_time_entries_date ON time_entries(work_date);
CREATE INDEX idx_time_entries_status ON time_entries(status);
```

### Onboarding Checklists Table

```sql
CREATE TABLE onboarding_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID NOT NULL REFERENCES employees(id),

    -- Template
    template_name VARCHAR(200),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',  -- NOT_STARTED, IN_PROGRESS, COMPLETED
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Due Date
    due_date DATE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_onboarding_employee ON onboarding_checklists(employee_id);
CREATE INDEX idx_onboarding_status ON onboarding_checklists(status);
```

### Onboarding Tasks Table

```sql
CREATE TABLE onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    checklist_id UUID NOT NULL REFERENCES onboarding_checklists(id),

    -- Task Info
    task_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),  -- PAPERWORK, IT_SETUP, TRAINING, EQUIPMENT, MEETINGS

    -- Assignment
    assigned_to VARCHAR(50),  -- EMPLOYEE, MANAGER, HR, IT
    assignee_id UUID REFERENCES users(id),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, IN_PROGRESS, COMPLETED, SKIPPED
    completed_at TIMESTAMP,
    completed_by UUID REFERENCES users(id),

    -- Sequence
    sequence INTEGER,
    is_required BOOLEAN DEFAULT TRUE,

    -- Due
    due_date DATE,
    due_days_from_start INTEGER,  -- Days after hire date

    -- Related Document
    document_id UUID REFERENCES documents(id),
    document_required BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_onboarding_tasks_checklist ON onboarding_tasks(checklist_id);
CREATE INDEX idx_onboarding_tasks_status ON onboarding_tasks(status);
```

### Employee Documents Table

```sql
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id UUID NOT NULL REFERENCES employees(id),

    -- Document
    document_id UUID NOT NULL REFERENCES documents(id),

    -- Type
    document_type VARCHAR(50) NOT NULL,  -- I9, W4, OFFER_LETTER, HANDBOOK_ACK, NDA, LICENSE, CERTIFICATION

    -- Details
    description TEXT,

    -- Dates
    effective_date DATE,
    expiration_date DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, EXPIRED, SUPERSEDED

    -- Acknowledgment
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employee_docs_employee ON employee_documents(employee_id);
CREATE INDEX idx_employee_docs_type ON employee_documents(document_type);
CREATE INDEX idx_employee_docs_expiration ON employee_documents(expiration_date);
```

---

## API Endpoints

### Employees

| Method | Endpoint                        | Description            |
| ------ | ------------------------------- | ---------------------- |
| GET    | `/api/v1/employees`             | List employees         |
| POST   | `/api/v1/employees`             | Create employee        |
| GET    | `/api/v1/employees/:id`         | Get employee details   |
| PUT    | `/api/v1/employees/:id`         | Update employee        |
| DELETE | `/api/v1/employees/:id`         | Terminate employee     |
| GET    | `/api/v1/employees/:id/history` | Get employment history |
| GET    | `/api/v1/employees/:id/reports` | Get direct reports     |
| GET    | `/api/v1/employees/org-chart`   | Get org chart          |

### Departments

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| GET    | `/api/v1/departments`               | List departments         |
| POST   | `/api/v1/departments`               | Create department        |
| GET    | `/api/v1/departments/:id`           | Get department           |
| PUT    | `/api/v1/departments/:id`           | Update department        |
| DELETE | `/api/v1/departments/:id`           | Deactivate department    |
| GET    | `/api/v1/departments/:id/employees` | Get department employees |

### Positions

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| GET    | `/api/v1/positions`     | List positions      |
| POST   | `/api/v1/positions`     | Create position     |
| GET    | `/api/v1/positions/:id` | Get position        |
| PUT    | `/api/v1/positions/:id` | Update position     |
| DELETE | `/api/v1/positions/:id` | Deactivate position |

### Time Off

| Method | Endpoint                                  | Description            |
| ------ | ----------------------------------------- | ---------------------- |
| GET    | `/api/v1/employees/:id/time-off/balances` | Get balances           |
| GET    | `/api/v1/time-off/requests`               | List time off requests |
| POST   | `/api/v1/time-off/requests`               | Submit request         |
| GET    | `/api/v1/time-off/requests/:id`           | Get request            |
| POST   | `/api/v1/time-off/requests/:id/approve`   | Approve request        |
| POST   | `/api/v1/time-off/requests/:id/deny`      | Deny request           |
| POST   | `/api/v1/time-off/requests/:id/cancel`    | Cancel request         |
| GET    | `/api/v1/time-off/calendar`               | Get team calendar      |

### Time Tracking

| Method | Endpoint                                             | Description       |
| ------ | ---------------------------------------------------- | ----------------- |
| GET    | `/api/v1/time-entries`                               | List time entries |
| POST   | `/api/v1/time-entries`                               | Create entry      |
| PUT    | `/api/v1/time-entries/:id`                           | Update entry      |
| DELETE | `/api/v1/time-entries/:id`                           | Delete entry      |
| POST   | `/api/v1/time-entries/clock-in`                      | Clock in          |
| POST   | `/api/v1/time-entries/clock-out`                     | Clock out         |
| POST   | `/api/v1/time-entries/approve`                       | Batch approve     |
| GET    | `/api/v1/time-entries/timesheet/:employeeId/:period` | Get timesheet     |

### Onboarding

| Method | Endpoint                                | Description           |
| ------ | --------------------------------------- | --------------------- |
| GET    | `/api/v1/employees/:id/onboarding`      | Get onboarding status |
| POST   | `/api/v1/employees/:id/onboarding`      | Start onboarding      |
| GET    | `/api/v1/onboarding/tasks`              | List onboarding tasks |
| PUT    | `/api/v1/onboarding/tasks/:id`          | Update task           |
| POST   | `/api/v1/onboarding/tasks/:id/complete` | Complete task         |

### Documents

| Method | Endpoint                              | Description             |
| ------ | ------------------------------------- | ----------------------- |
| GET    | `/api/v1/employees/:id/documents`     | List employee documents |
| POST   | `/api/v1/employees/:id/documents`     | Add document            |
| GET    | `/api/v1/employee-documents/:id`      | Get document            |
| DELETE | `/api/v1/employee-documents/:id`      | Remove document         |
| GET    | `/api/v1/employee-documents/expiring` | Get expiring documents  |

### Reporting

| Method | Endpoint                    | Description         |
| ------ | --------------------------- | ------------------- |
| GET    | `/api/v1/hr/headcount`      | Headcount report    |
| GET    | `/api/v1/hr/turnover`       | Turnover report     |
| GET    | `/api/v1/hr/payroll-export` | Export payroll data |
| GET    | `/api/v1/hr/compliance`     | Compliance status   |

---

## Events

### Published Events

| Event                       | Trigger             | Payload                                   |
| --------------------------- | ------------------- | ----------------------------------------- |
| `employee.created`          | New employee        | `{tenant_id, employee_id}`                |
| `employee.updated`          | Employee updated    | `{tenant_id, employee_id, changes}`       |
| `employee.terminated`       | Employee terminated | `{tenant_id, employee_id}`                |
| `employee.position_changed` | Promotion/transfer  | `{tenant_id, employee_id, new_position}`  |
| `time_off.requested`        | PTO request         | `{tenant_id, employee_id, request_id}`    |
| `time_off.approved`         | PTO approved        | `{tenant_id, request_id}`                 |
| `time_off.denied`           | PTO denied          | `{tenant_id, request_id}`                 |
| `onboarding.started`        | Onboarding begins   | `{tenant_id, employee_id}`                |
| `onboarding.completed`      | Onboarding done     | `{tenant_id, employee_id}`                |
| `document.expiring`         | Doc expiring        | `{tenant_id, employee_id, document_type}` |

### Subscribed Events

| Event                   | Source             | Action                              |
| ----------------------- | ------------------ | ----------------------------------- |
| `user.created`          | Auth Service       | Link user to employee if applicable |
| `commission.calculated` | Commission Service | Sync for payroll                    |

---

## Business Rules

### Employment

1. Employee number auto-generated and unique
2. Hire date cannot be in the future
3. Termination date must be after hire date
4. Manager cannot report to themselves (circular)
5. Active employees must have a position

### Time Off

1. PTO requests cannot overlap with existing approved requests
2. Requests must be approved by manager
3. Balance cannot go negative unless policy allows
4. Carryover processed at year end
5. Unused PTO may be paid out on termination

### Time Tracking

1. Clock out required before new clock in
2. Overtime calculated based on state/federal rules
3. Timesheets approved weekly
4. Missing time entries flagged for review

### Onboarding

1. All required tasks must complete before onboarding closes
2. I-9 must be completed within 3 business days
3. Task due dates calculated from hire date
4. Manager and HR both have onboarding tasks

### Documents

1. I-9 and W-4 required for all employees
2. Expiring documents alert 30 days before
3. Superseded documents archived, not deleted

---

## Screens

| Screen            | Type      | Description                             |
| ----------------- | --------- | --------------------------------------- |
| HR Dashboard      | Dashboard | Headcount, pending requests, compliance |
| Employee List     | List      | All employees with filters              |
| Employee Profile  | Detail    | Full employee information               |
| Employee Form     | Form      | Create/edit employee                    |
| Org Chart         | Chart     | Visual organization structure           |
| Time Off Calendar | Calendar  | Team time off view                      |
| Time Off Requests | List      | Pending approval queue                  |
| Timesheets        | List      | Time entry review and approval          |
| Onboarding        | List      | New hire onboarding status              |

---

## Configuration

### Environment Variables

```bash
# Payroll Integration
PAYROLL_PROVIDER=ADP
PAYROLL_API_KEY=xxx
PAYROLL_COMPANY_CODE=xxx

# I-9 Verification
I9_PROVIDER=EVERIFY
EVERIFY_API_KEY=xxx
```

### Default Settings

```json
{
  "pto_accrual_rate_hours": 6.67,
  "sick_accrual_rate_hours": 3.33,
  "max_pto_carryover_hours": 40,
  "overtime_threshold_hours": 40,
  "i9_deadline_days": 3,
  "document_expiration_alert_days": 30,
  "timesheet_approval_deadline_days": 3
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Employee number generation
- [ ] PTO balance calculations
- [ ] Overtime calculations
- [ ] Org chart hierarchy validation
- [ ] Onboarding task sequencing

### Integration Tests

- [ ] Employee creation â†’ user account
- [ ] PTO request â†’ balance update
- [ ] Time entry â†’ payroll export
- [ ] Onboarding workflow completion
- [ ] Document expiration alerting

### E2E Tests

- [ ] Full employee onboarding journey
- [ ] PTO request and approval
- [ ] Timesheet submission and approval
- [ ] Employee promotion/transfer
- [ ] Termination workflow

---

## Navigation

**Previous:** [16 - Factoring Service](../16-factoring/README.md)

**Next:** [18 - Analytics Service](../18-analytics/README.md)

**[Back to Services Index](../README.md)**
