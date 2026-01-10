# 08 - Agent Service API Implementation

> **Service:** Agent Network Management  
> **Priority:** P2 - Medium  
> **Endpoints:** 40  
> **Dependencies:** Auth/Admin ✅, CRM ✅, Commission ✅, Contracts ✅ (07), Accounting ✅  
> **Doc Reference:** [22-service-agent.md](../../02-services/22-service-agent.md)

---

## 📋 Overview

Manage the agent network for lead generation, sales referrals, and commission splits. Agents are independent sales partners who refer customers and receive a split of commissions generated from their accounts.

### Key Capabilities
- Agent onboarding and agreement management
- Customer-to-agent assignment with ownership rules
- Commission split configuration (fixed, tiered, custom)
- Lead submission and conversion tracking
- Protection periods and sunset provisions
- Agent performance metrics and rankings

---

## ✅ Pre-Implementation Checklist

- [ ] CRM service is working (Customer lookup)
- [ ] Commission service is working (Split calculations)
- [ ] Contracts service is working (Agent agreements)
- [ ] Accounting service is working (Payments)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### Agent Model
```prisma
model Agent {
  id                String            @id @default(cuid())
  tenantId          String
  
  agentCode         String            // AUTO: A-XXXX
  
  companyName       String
  dbaName           String?
  legalEntityType   String?           // LLC, CORPORATION, SOLE_PROP
  taxId             String?
  
  addressLine1      String?
  addressLine2      String?
  city              String?
  state             String?
  zip               String?
  country           String            @default("USA")
  
  contactFirstName  String
  contactLastName   String
  contactEmail      String
  contactPhone      String?
  
  agentType         AgentType         // REFERRING, SELLING, HYBRID
  
  territories       Json              @default("[]")
  industryFocus     Json              @default("[]")
  
  status            AgentStatus       @default(PENDING)
  
  applicationDate   DateTime?
  backgroundCheckStatus String?
  backgroundCheckDate DateTime?
  trainingCompleted Boolean           @default(false)
  trainingCompletedDate DateTime?
  
  agreementId       String?
  agreementSignedAt DateTime?
  
  activatedAt       DateTime?
  activatedBy       String?
  
  tier              AgentTier         @default(STANDARD)
  
  paymentMethod     String?
  bankName          String?
  bankRouting       String?
  bankAccount       String?
  bankAccountType   String?
  
  terminatedAt      DateTime?
  terminatedBy      String?
  terminationReason String?           @db.Text
  
  customFields      Json              @default("{}")
  
  createdById       String
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  deletedAt         DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  agreement         Contract?         @relation(fields: [agreementId], references: [id])
  
  contacts          AgentContact[]
  agreements        AgentAgreement[]
  customerAssignments AgentCustomerAssignment[]
  leads             AgentLead[]
  commissions       AgentCommission[]
  statements        AgentStatement[]
  
  @@unique([tenantId, agentCode])
  @@index([tenantId, status])
  @@index([tenantId, agentType])
  @@index([contactEmail])
}

enum AgentType {
  REFERRING     // Brings leads, earns referral fee
  SELLING       // Actively sells and manages accounts
  HYBRID        // Does both
}

enum AgentStatus {
  PENDING
  ACTIVE
  SUSPENDED
  TERMINATED
}

enum AgentTier {
  STANDARD
  SILVER
  GOLD
  PLATINUM
}
```

### AgentAgreement Model
```prisma
model AgentAgreement {
  id                String            @id @default(cuid())
  tenantId          String
  agentId           String
  
  agreementNumber   String
  name              String?
  
  effectiveDate     DateTime
  expirationDate    DateTime?
  
  splitType         CommissionSplitType
  splitRate         Decimal?          @db.Decimal(5, 4)
  minimumPerLoad    Decimal?          @db.Decimal(10, 2)
  
  tiers             Json              @default("[]")
  
  protectionPeriodMonths Int          @default(12)
  
  sunsetEnabled     Boolean           @default(false)
  sunsetPeriodMonths Int?             @default(12)
  sunsetSchedule    Json              @default("[]")
  
  drawAmount        Decimal?          @db.Decimal(10, 2)
  drawFrequency     String?
  drawRecoverable   Boolean           @default(true)
  
  paymentDay        Int               @default(15)
  minimumPayout     Decimal           @default(100) @db.Decimal(10, 2)
  
  status            AgreementStatus   @default(ACTIVE)
  
  version           Int               @default(1)
  previousAgreementId String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  agent             Agent             @relation(fields: [agentId], references: [id])
  previousAgreement AgentAgreement?   @relation("AgreementVersions", fields: [previousAgreementId], references: [id])
  nextAgreements    AgentAgreement[]  @relation("AgreementVersions")
  
  @@index([agentId])
  @@index([status])
}

enum CommissionSplitType {
  PERCENT_OF_REP
  PERCENT_OF_MARGIN
  FLAT_PER_LOAD
  TIERED
}

enum AgreementStatus {
  DRAFT
  ACTIVE
  EXPIRED
  TERMINATED
}
```

### AgentCustomerAssignment Model
```prisma
model AgentCustomerAssignment {
  id                String            @id @default(cuid())
  tenantId          String
  agentId           String
  customerId        String
  
  assignmentType    AssignmentType    // PRIMARY, SECONDARY, SPLIT
  
  protectionStart   DateTime
  protectionEnd     DateTime?
  isProtected       Boolean           @default(true)
  
  splitPercent      Decimal?          @db.Decimal(5, 4)
  
  leadId            String?
  source            String?           // AGENT_LEAD, TRANSFER, COMPANY_ASSIGNED
  
  overrideSplitRate Decimal?          @db.Decimal(5, 4)
  overrideReason    String?           @db.Text
  
  inSunset          Boolean           @default(false)
  sunsetStartDate   DateTime?
  currentSunsetRate Decimal?          @db.Decimal(5, 4)
  
  status            AssignmentStatus  @default(ACTIVE)
  
  terminatedAt      DateTime?
  terminatedReason  String?           @db.Text
  transferredToAgentId String?
  
  createdById       String
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  agent             Agent             @relation(fields: [agentId], references: [id])
  customer          Company           @relation(fields: [customerId], references: [id])
  lead              AgentLead?        @relation(fields: [leadId], references: [id])
  
  @@unique([agentId, customerId])
  @@index([customerId])
  @@index([status])
}

enum AssignmentType {
  PRIMARY
  SECONDARY
  SPLIT
}

enum AssignmentStatus {
  ACTIVE
  SUNSET
  TRANSFERRED
  TERMINATED
}
```

### AgentLead Model
```prisma
model AgentLead {
  id                String            @id @default(cuid())
  tenantId          String
  agentId           String
  
  leadNumber        String            // AUTO: AL-YYYYMM-XXXX
  
  companyName       String
  website           String?
  industry          String?
  estimatedMonthlyVolume Int?
  estimatedMonthlyRevenue Decimal?    @db.Decimal(12, 2)
  
  contactFirstName  String
  contactLastName   String
  contactTitle      String?
  contactEmail      String?
  contactPhone      String?
  
  city              String?
  state             String?
  
  notes             String?           @db.Text
  
  status            LeadStatus        @default(SUBMITTED)
  
  submittedAt       DateTime          @default(now())
  
  assignedTo        String?
  assignedAt        DateTime?
  
  qualifiedAt       DateTime?
  qualificationNotes String?          @db.Text
  
  convertedAt       DateTime?
  convertedCustomerId String?
  
  rejectedAt        DateTime?
  rejectionReason   String?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  agent             Agent             @relation(fields: [agentId], references: [id])
  customer          Company?          @relation(fields: [convertedCustomerId], references: [id])
  
  customerAssignments AgentCustomerAssignment[]
  
  @@unique([tenantId, leadNumber])
  @@index([agentId])
  @@index([status])
}

enum LeadStatus {
  SUBMITTED
  IN_REVIEW
  QUALIFIED
  CONTACTED
  NEGOTIATING
  CONVERTED
  REJECTED
  EXPIRED
}
```

---

## 🛠️ API Endpoints

### Agents (12 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agents` | List agents |
| POST | `/api/v1/agents` | Create agent |
| GET | `/api/v1/agents/:id` | Get agent details |
| PUT | `/api/v1/agents/:id` | Update agent |
| DELETE | `/api/v1/agents/:id` | Delete agent |
| POST | `/api/v1/agents/:id/activate` | Activate agent |
| POST | `/api/v1/agents/:id/suspend` | Suspend agent |
| POST | `/api/v1/agents/:id/terminate` | Terminate agent |
| GET | `/api/v1/agents/:id/contacts` | Get contacts |
| POST | `/api/v1/agents/:id/contacts` | Add contact |
| PUT | `/api/v1/agents/:id/contacts/:contactId` | Update contact |
| DELETE | `/api/v1/agents/:id/contacts/:contactId` | Delete contact |

### Agent Agreements (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agents/:id/agreements` | List agreements |
| POST | `/api/v1/agents/:id/agreements` | Create agreement |
| GET | `/api/v1/agent-agreements/:id` | Get agreement |
| PUT | `/api/v1/agent-agreements/:id` | Update agreement |
| POST | `/api/v1/agent-agreements/:id/activate` | Activate |
| POST | `/api/v1/agent-agreements/:id/terminate` | Terminate |

### Customer Assignments (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agents/:id/customers` | List agent's customers |
| POST | `/api/v1/agents/:id/customers` | Assign customer |
| GET | `/api/v1/agent-assignments/:id` | Get assignment |
| PUT | `/api/v1/agent-assignments/:id` | Update assignment |
| POST | `/api/v1/agent-assignments/:id/transfer` | Transfer customer |
| POST | `/api/v1/agent-assignments/:id/start-sunset` | Start sunset |
| POST | `/api/v1/agent-assignments/:id/terminate` | End assignment |
| GET | `/api/v1/customers/:id/agent` | Get customer's agent |

### Leads (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agents/:id/leads` | List agent's leads |
| POST | `/api/v1/agents/:id/leads` | Submit lead |
| GET | `/api/v1/agent-leads/:id` | Get lead details |
| PUT | `/api/v1/agent-leads/:id` | Update lead |
| POST | `/api/v1/agent-leads/:id/qualify` | Qualify lead |
| POST | `/api/v1/agent-leads/:id/convert` | Convert to customer |
| POST | `/api/v1/agent-leads/:id/reject` | Reject lead |
| GET | `/api/v1/agent-leads` | List all leads |

### Commissions & Statements (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/agents/:id/commissions` | Commission history |
| GET | `/api/v1/agents/:id/statements` | Statement history |
| GET | `/api/v1/agents/:id/statements/:statementId` | Statement details |
| GET | `/api/v1/agents/:id/statements/:statementId/pdf` | Download PDF |
| GET | `/api/v1/agents/:id/performance` | Performance metrics |
| GET | `/api/v1/agents/rankings` | Agent rankings |

---

## 📝 DTO Specifications

### CreateAgentDto
```typescript
export class CreateAgentDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  dbaName?: string;

  @IsOptional()
  @IsString()
  legalEntityType?: string;

  @IsString()
  contactFirstName: string;

  @IsString()
  contactLastName: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsEnum(AgentType)
  agentType: AgentType;

  @IsOptional()
  @IsArray()
  territories?: Array<{ state: string; region?: string }>;

  @IsOptional()
  @IsArray()
  industryFocus?: string[];
}
```

### CreateAgentAgreementDto
```typescript
export class CreateAgentAgreementDto {
  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsEnum(CommissionSplitType)
  splitType: CommissionSplitType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  splitRate?: number;

  @IsOptional()
  @IsNumber()
  minimumPerLoad?: number;

  @IsOptional()
  @IsInt()
  protectionPeriodMonths?: number;

  @IsOptional()
  @IsBoolean()
  sunsetEnabled?: boolean;

  @IsOptional()
  @IsInt()
  sunsetPeriodMonths?: number;

  @IsOptional()
  @IsNumber()
  drawAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  paymentDay?: number;
}
```

### AssignCustomerDto
```typescript
export class AssignCustomerDto {
  @IsString()
  customerId: string;

  @IsEnum(AssignmentType)
  assignmentType: AssignmentType;

  @IsOptional()
  @IsDateString()
  protectionEnd?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  splitPercent?: number;

  @IsOptional()
  @IsString()
  source?: string;
}
```

### SubmitLeadDto
```typescript
export class SubmitLeadDto {
  @IsString()
  companyName: string;

  @IsString()
  contactFirstName: string;

  @IsString()
  contactLastName: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsInt()
  estimatedMonthlyVolume?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

## 📋 Business Rules

### Agent Tiers
```typescript
const agentTiers = {
  PLATINUM: { minMonthlyRevenue: 100000, splitBonus: 0.05 },
  GOLD: { minMonthlyRevenue: 50000, splitBonus: 0.03 },
  SILVER: { minMonthlyRevenue: 25000, splitBonus: 0.01 },
  STANDARD: { minMonthlyRevenue: 0, splitBonus: 0 }
};
```

### Protection Period
- Default: 12 months from assignment
- Customer cannot be reassigned during protection
- Agent receives commission on all orders during protection

### Sunset Schedule
```typescript
const defaultSunsetSchedule = [
  { months: '1-3', rate: 0.75 },   // 75% of normal split
  { months: '4-6', rate: 0.50 },   // 50% of normal split
  { months: '7-9', rate: 0.25 },   // 25% of normal split
  { months: '10-12', rate: 0.10 }  // 10% of normal split
];
```

### Lead Expiration
- Leads expire after 90 days if not converted
- Expired leads can be resubmitted

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `agent.created` | Create agent | `{ agentId, agentCode }` |
| `agent.activated` | Activate agent | `{ agentId }` |
| `agent.suspended` | Suspend agent | `{ agentId, reason }` |
| `agent.terminated` | Terminate agent | `{ agentId, reason }` |
| `agent.agreement.created` | Create agreement | `{ agreementId, agentId }` |
| `agent.customer.assigned` | Assign customer | `{ assignmentId, agentId, customerId }` |
| `agent.customer.transferred` | Transfer customer | `{ assignmentId, fromAgentId, toAgentId }` |
| `agent.customer.sunset.started` | Start sunset | `{ assignmentId, sunsetStartDate }` |
| `agent.lead.submitted` | Submit lead | `{ leadId, agentId }` |
| `agent.lead.converted` | Convert lead | `{ leadId, customerId }` |
| `agent.commission.earned` | Commission earned | `{ agentId, amount, orderId }` |
| `agent.statement.generated` | Generate statement | `{ statementId, agentId }` |

---

## 🧪 Integration Test Requirements

```typescript
describe('Agent Service API', () => {
  describe('Agent Management', () => {
    it('should create agent with code');
    it('should activate agent');
    it('should suspend agent');
    it('should terminate agent');
  });

  describe('Agreements', () => {
    it('should create agreement with split');
    it('should calculate tiered commission');
    it('should track draw balance');
  });

  describe('Customer Assignments', () => {
    it('should assign customer to agent');
    it('should enforce protection period');
    it('should transfer customer');
    it('should apply sunset schedule');
  });

  describe('Leads', () => {
    it('should submit lead');
    it('should qualify lead');
    it('should convert lead to customer');
    it('should auto-assign customer on conversion');
  });

  describe('Commissions', () => {
    it('should calculate commission split');
    it('should generate statements');
    it('should track performance metrics');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/agents/
├── agents.module.ts
├── agents/
│   ├── agents.controller.ts
│   ├── agents.service.ts
│   └── dto/
├── agreements/
│   ├── agent-agreements.controller.ts
│   ├── agent-agreements.service.ts
│   └── dto/
├── assignments/
│   ├── customer-assignments.controller.ts
│   ├── customer-assignments.service.ts
│   └── dto/
├── leads/
│   ├── agent-leads.controller.ts
│   ├── agent-leads.service.ts
│   └── dto/
├── commissions/
│   ├── agent-commissions.controller.ts
│   ├── agent-commissions.service.ts
│   └── dto/
└── statements/
    ├── agent-statements.controller.ts
    ├── agent-statements.service.ts
    └── dto/
```

---

## ✅ Completion Checklist

- [ ] All 40 endpoints implemented
- [ ] Agent onboarding workflow
- [ ] Agreement with splits and tiers
- [ ] Customer assignment with protection
- [ ] Lead submission and conversion
- [ ] Sunset schedule implementation
- [ ] Commission calculation
- [ ] Statement generation
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>21</td>
    <td>Agent</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>40/40</td>
    <td>6/6</td>
    <td>100%</td>
    <td>Agents, Agreements, Assignments, Leads, Commissions</td>
</tr>
```

### Add Changelog Entry
```html
<div class="log-entry">
    <div class="log-date">January XX, 2026 - Agent API Complete</div>
    <ul class="log-items">
        <li>Implemented 40 Agent API endpoints</li>
        <li>Agent onboarding and agreement management</li>
        <li>Customer assignment with protection periods</li>
        <li>Lead submission and conversion workflow</li>
        <li>Sunset provisions implementation</li>
        <li>Commission calculations and statements</li>
        <li>Full integration test coverage</li>
    </ul>
</div>
```

---

## 🔜 Next Step

➡️ **[09-factoring-internal-api.md](./09-factoring-internal-api.md)** - Implement Factoring Service API
