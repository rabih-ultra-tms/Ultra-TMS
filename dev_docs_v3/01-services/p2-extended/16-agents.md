# Service Hub: Agents (16)

> **Priority:** P2 Extended | **Status:** Backend Rich (6 controllers, 43 endpoints), Frontend Not Built
> **Source of Truth** -- dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | 6 controllers, 43 endpoints in `apps/api/src/modules/agents/` |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Components** | None |
| **Hooks** | None |
| **Tests** | None |
| **Prisma Models** | Agent, AgentAgreement, AgentCommission, AgentCustomerAssignment, AgentLead, AgentPayout, AgentContact, AgentDrawBalance, AgentPortalUser (9 models) |
| **Enums** | AgentType, AgentStatus, AgentTier, AgentCommissionStatus, AgentPayoutStatus, AgreementStatus, AssignmentType, AssignmentStatus, LeadStatus, CommissionSplitType (10 enums) |
| **Design Specs** | 9 files in `dev_docs/12-Rabih-design-Process/15-agents/` |
| **Scope** | Freight agents and sub-brokers who bring loads to the brokerage; commission tracking, lead attribution, customer assignments, agreements, payouts |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | 9 design spec files cover full vision |
| Backend Controllers | Done | 6 controllers: agents (14), agreements (6), assignments (8), commissions (3), leads (8), statements (4) = 43 endpoints |
| Backend Services | Done | AgentsService, AgentAgreementsService, CustomerAssignmentsService, AgentCommissionsService, AgentLeadsService, AgentStatementsService |
| Prisma Models | Done | 9 models with 10 enums, rich field sets including financial, territory, portal access |
| Frontend Pages | Not Built | No `/agents` routes exist |
| Hooks | Not Built | No hooks in `lib/hooks/` for agents |
| Components | Not Built | No components in `components/` for agents |
| Tests | None | Zero test files |
| Agent Portal | Schema Only | AgentPortalUser model exists with passwordHash, login tracking; no portal UI |

---

## 3. Screens

| Screen | Route | Status | Design Spec | Notes |
|--------|-------|--------|-------------|-------|
| Agents Dashboard | `/agents` | Not Built | `01-agents-dashboard.md` | KPIs, top agents, recent activity |
| Agents List | `/agents/list` | Not Built | `02-agents-list.md` | Filterable list of all agents |
| Agent Detail | `/agents/[id]` | Not Built | `03-agent-detail.md` | Profile, contacts, agreements, commissions, leads |
| Agent Setup | `/agents/new` | Not Built | `04-agent-setup.md` | Multi-step agent onboarding form |
| Agent Performance | `/agents/[id]/performance` | Not Built | `05-agent-performance.md` | Revenue, load volume, commission history |
| Commission Setup | `/agents/[id]/commissions` | Not Built | `06-commission-setup.md` | Agreement terms, split rates, tiers |
| Agent Territories | `/agents/territories` | Not Built | `07-agent-territories.md` | Territory assignment and map view |
| Agent Reports | `/agents/reports` | Not Built | `08-agent-reports.md` | Rankings, payouts, lead conversion |

---

## 4. API Endpoints

### AgentsController -- `@Controller('agents')`

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/agents/rankings` | Built | Agent performance rankings |
| GET | `/api/v1/agents` | Built | List agents with filters |
| POST | `/api/v1/agents` | Built | Create agent |
| GET | `/api/v1/agents/:id` | Built | Get agent by ID |
| PUT | `/api/v1/agents/:id` | Built | Update agent |
| DELETE | `/api/v1/agents/:id` | Built | Soft-delete agent |
| POST | `/api/v1/agents/:id/activate` | Built | Activate agent (PENDING -> ACTIVE) |
| POST | `/api/v1/agents/:id/suspend` | Built | Suspend agent |
| POST | `/api/v1/agents/:id/terminate` | Built | Terminate agent |
| GET | `/api/v1/agents/:id/contacts` | Built | List agent contacts |
| POST | `/api/v1/agents/:id/contacts` | Built | Add contact to agent |
| PUT | `/api/v1/agents/:id/contacts/:contactId` | Built | Update agent contact |
| DELETE | `/api/v1/agents/:id/contacts/:contactId` | Built | Remove agent contact |

### AgentAgreementsController -- `@Controller()` (route prefix in decorators)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/agents/:id/agreements` | Built | List agreements for agent |
| POST | `/api/v1/agents/:id/agreements` | Built | Create agreement for agent |
| GET | `/api/v1/agent-agreements/:id` | Built | Get agreement by ID |
| PUT | `/api/v1/agent-agreements/:id` | Built | Update agreement |
| POST | `/api/v1/agent-agreements/:id/activate` | Built | Activate agreement (DRAFT -> ACTIVE) |
| POST | `/api/v1/agent-agreements/:id/terminate` | Built | Terminate agreement |

### AgentCommissionsController -- `@Controller()` (route prefix in decorators)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/agents/:id/commissions` | Built | List commissions for agent |
| GET | `/api/v1/agents/:id/performance` | Built | Agent performance metrics |
| GET | `/api/v1/agents/rankings` | Built | Global agent rankings |

### AgentLeadsController -- `@Controller()` (route prefix in decorators)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/agents/:id/leads` | Built | List leads for agent |
| POST | `/api/v1/agents/:id/leads` | Built | Submit lead for agent |
| GET | `/api/v1/agent-leads` | Built | List all leads |
| GET | `/api/v1/agent-leads/:id` | Built | Get lead by ID |
| PUT | `/api/v1/agent-leads/:id` | Built | Update lead |
| POST | `/api/v1/agent-leads/:id/qualify` | Built | Qualify lead (SUBMITTED -> QUALIFIED) |
| POST | `/api/v1/agent-leads/:id/convert` | Built | Convert lead to customer |
| POST | `/api/v1/agent-leads/:id/reject` | Built | Reject lead |

### CustomerAssignmentsController -- `@Controller()` (route prefix in decorators)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/agents/:id/customers` | Built | List customer assignments for agent |
| POST | `/api/v1/agents/:id/customers` | Built | Assign customer to agent |
| GET | `/api/v1/agent-assignments/:id` | Built | Get assignment by ID |
| PUT | `/api/v1/agent-assignments/:id` | Built | Update assignment |
| POST | `/api/v1/agent-assignments/:id/transfer` | Built | Transfer customer to another agent |
| POST | `/api/v1/agent-assignments/:id/start-sunset` | Built | Begin sunset period on assignment |
| POST | `/api/v1/agent-assignments/:id/terminate` | Built | Terminate assignment |
| GET | `/api/v1/customers/:id/agent` | Built | Look up agent for a customer |

### AgentStatementsController -- `@Controller()` (route prefix in decorators)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/agents/:id/statements` | Built | List statements for agent |
| POST | `/api/v1/agents/:id/statements/generate` | Built | Generate statement for period |
| GET | `/api/v1/agents/:id/statements/:statementId` | Built | Get statement detail |
| GET | `/api/v1/agents/:id/statements/:statementId/pdf` | Built | Download statement as PDF |

**Total: 43 endpoints across 6 controllers (all built, no frontend consumption)**

---

## 5. Components

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| AgentsDashboard | `components/agents/agents-dashboard.tsx` | Not Built | KPI cards, top agents, recent activity |
| AgentsList | `components/agents/agents-list.tsx` | Not Built | Filterable/sortable table |
| AgentDetail | `components/agents/agent-detail.tsx` | Not Built | Tabbed detail: profile, contacts, agreements, commissions |
| AgentForm | `components/agents/agent-form.tsx` | Not Built | Multi-step create/edit form |
| AgentStatusBadge | `components/agents/agent-status-badge.tsx` | Not Built | PENDING/ACTIVE/SUSPENDED/TERMINATED badge |
| AgentAgreementCard | `components/agents/agent-agreement-card.tsx` | Not Built | Agreement summary with split details |
| AgentCommissionsTable | `components/agents/agent-commissions-table.tsx` | Not Built | Commission records with load links |
| AgentLeadsTable | `components/agents/agent-leads-table.tsx` | Not Built | Lead pipeline with status workflow |
| AgentPerformanceChart | `components/agents/agent-performance-chart.tsx` | Not Built | Revenue/volume charts |
| CustomerAssignmentsTable | `components/agents/customer-assignments-table.tsx` | Not Built | Assigned customers with split info |

**Current state: Zero agent components exist. Entire frontend is missing.**

---

## 6. Hooks

| Hook | Path | Status | Notes |
|------|------|--------|-------|
| useAgents | `lib/hooks/agents/use-agents.ts` | Not Built | List/search agents |
| useAgent | `lib/hooks/agents/use-agent.ts` | Not Built | Single agent by ID |
| useAgentMutations | `lib/hooks/agents/use-agent-mutations.ts` | Not Built | Create, update, activate, suspend, terminate |
| useAgentAgreements | `lib/hooks/agents/use-agent-agreements.ts` | Not Built | Agreement CRUD |
| useAgentCommissions | `lib/hooks/agents/use-agent-commissions.ts` | Not Built | Commission records for agent |
| useAgentLeads | `lib/hooks/agents/use-agent-leads.ts` | Not Built | Lead pipeline for agent |
| useAgentCustomers | `lib/hooks/agents/use-agent-customers.ts` | Not Built | Customer assignments CRUD |
| useAgentStatements | `lib/hooks/agents/use-agent-statements.ts` | Not Built | Statements and PDF download |
| useAgentPerformance | `lib/hooks/agents/use-agent-performance.ts` | Not Built | Performance metrics |
| useAgentRankings | `lib/hooks/agents/use-agent-rankings.ts` | Not Built | Global agent rankings |

**Current state: Zero hooks. Must follow `response.data.data` envelope pattern.**

---

## 7. Business Rules

1. **Agent Types:** Three types defined in `AgentType` enum: REFERRING (refers leads only, no direct selling), SELLING (actively manages customer relationships and books loads), HYBRID (both referring and selling). External agents operate independently with their own client relationships.
2. **Agent Tiers:** `AgentTier` enum: STANDARD, SILVER, GOLD. Tier affects commission split rates and payout thresholds. Tier promotion based on revenue/volume performance.
3. **Agent Commission Split:** Commission structure defined in `AgentAgreement` with `CommissionSplitType`: PERCENT_OF_REP (split from rep's commission), PERCENT_OF_MARGIN (split from load gross margin -- typical 50/50 or 60/40), FLAT_PER_LOAD (fixed dollar per load), TIERED (volume-based tiers stored in `tiers` JSON field).
4. **Load Attribution:** Loads sourced by an agent are tagged with `agentId`. Commission records in `AgentCommission` track `loadId`, `loadRevenue`, `loadMargin`, `splitRate`, `grossCommission`, `netCommission`. Both agent and internal sales rep commissions are calculated from the same load.
5. **Customer Assignments:** `AgentCustomerAssignment` links agents to customers with `AssignmentType`: PRIMARY, SECONDARY, SPLIT. Assignment includes `splitPercent`, `protectionStart`/`protectionEnd` dates, and `isProtected` flag. Only one PRIMARY assignment per customer (enforced by `@@unique([agentId, customerId])`).
6. **Account Protection:** Agents have a protection period (default 12 months per `AgentAgreement.protectionPeriodMonths`) during which their assigned customers cannot be reassigned without override. Override requires `overrideReason` documentation.
7. **Sunset Process:** When ending an agent relationship, a sunset period reduces commission gradually. `sunsetEnabled`, `sunsetPeriodMonths`, `sunsetSchedule` (JSON) on `AgentAgreement`. Assignment enters `SUNSET` status with `currentSunsetRate` tracking declining split.
8. **Lead Pipeline:** Agents submit leads via `AgentLead` with full prospect details (company, contacts, estimated volume/revenue, lanes, equipment needs). Lead flows: SUBMITTED -> IN_REVIEW -> QUALIFIED -> WORKING -> CONVERTED or REJECTED. Conversion creates a customer and auto-assigns to the submitting agent.
9. **Draw Against Commission:** `AgentDrawBalance` tracks guaranteed minimum payments. If commissions earned are less than draw amount, shortfall is tracked in `carryoverBalance`. `drawRecoverable` on agreement determines if shortfall is recouped from future earnings.
10. **Agent Portal:** `AgentPortalUser` model supports external agent self-service portal with separate credentials (`passwordHash`), role-based access, and login tracking. External agents see only their own loads, commissions, and statements.
11. **Statements and Payouts:** `AgentPayout` tracks period-based payments with `grossCommissions`, `drawRecovery`, `adjustments`, `netAmount`. Approval workflow: PENDING -> APPROVED -> PROCESSING -> PAID. Statements can be generated and downloaded as PDF.
12. **Data Access:** External agents can only see loads they sourced and their own commissions/statements. Internal agents (sales reps) see all loads per their tenant permissions. Enforced at controller/service level.
13. **Onboarding Workflow:** Agent record tracks onboarding: `applicationDate`, `backgroundCheckStatus`/`backgroundCheckDate`, `trainingCompleted`/`trainingCompletedDate`, then `activatedAt`/`activatedBy`. Agent stays PENDING until activated.
14. **Territories:** `territories` JSON field on Agent stores geographic territory definitions. `industryFocus` JSON stores industry specializations. Design spec `07-agent-territories.md` envisions map-based territory management.
15. **Payment Info:** Agent model stores banking details (`bankName`, `bankRouting`, `bankAccount`, `bankAccountType`, `paymentMethod`) for commission payouts. `taxId` for 1099 reporting.

---

## 8. Data Model

### Agent (Prisma -- verified)

```
Agent {
  id                    String      @id @default(uuid())
  tenantId              String
  agentCode             String      @db.VarChar(20)
  agentType             AgentType   (REFERRING | SELLING | HYBRID)
  status                AgentStatus @default(PENDING) (PENDING | ACTIVE | SUSPENDED | TERMINATED)
  companyName           String      @db.VarChar(200)
  contactEmail          String      @db.VarChar(255)
  contactFirstName      String      @db.VarChar(100)
  contactLastName       String      @db.VarChar(100)
  contactPhone          String?     @db.VarChar(20)
  addressLine1          String?     @db.VarChar(200)
  addressLine2          String?     @db.VarChar(200)
  city                  String?     @db.VarChar(100)
  state                 String?     @db.VarChar(50)
  zip                   String?     @db.VarChar(20)
  country               String      @default("USA") @db.VarChar(3)
  dbaName               String?     @db.VarChar(200)
  legalEntityType       String?     @db.VarChar(50)
  taxId                 String?     @db.VarChar(20)
  territories           Json        @default("[]")
  industryFocus         Json        @default("[]")
  applicationDate       DateTime?
  backgroundCheckStatus String?     @db.VarChar(20)
  backgroundCheckDate   DateTime?
  trainingCompleted     Boolean     @default(false)
  trainingCompletedDate DateTime?
  activatedAt           DateTime?
  activatedBy           String?
  tier                  AgentTier   @default(STANDARD) (STANDARD | SILVER | GOLD)
  paymentMethod         String?     @db.VarChar(20)
  bankName              String?     @db.VarChar(100)
  bankRouting           String?     @db.VarChar(20)
  bankAccount           String?     @db.VarChar(50)
  bankAccountType       String?     @db.VarChar(20)
  terminatedAt          DateTime?
  terminatedBy          String?
  terminationReason     String?
  externalId            String?     @db.VarChar(100)
  sourceSystem          String?     @db.VarChar(50)
  customFields          Json        @default("{}")
  createdById           String?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  deletedAt             DateTime?

  @@unique([tenantId, agentCode])
  @@index([agentType, status, contactEmail, tenantId])
}
```

### AgentAgreement (Prisma -- verified)

```
AgentAgreement {
  id                     String              @id @default(uuid())
  tenantId               String
  agentId                String              (FK -> Agent)
  agreementNumber        String              @db.VarChar(30)
  name                   String?             @db.VarChar(200)
  effectiveDate          DateTime            @db.Date
  expirationDate         DateTime?           @db.Date
  status                 AgreementStatus     @default(ACTIVE) (DRAFT | ACTIVE | EXPIRED | TERMINATED)
  splitType              CommissionSplitType (PERCENT_OF_REP | PERCENT_OF_MARGIN | FLAT_PER_LOAD | TIERED)
  splitRate              Decimal?            @db.Decimal(5, 4)
  tiers                  Json                @default("[]")
  protectionPeriodMonths Int                 @default(12)
  drawAmount             Decimal?            @db.Decimal(10, 2)
  drawFrequency          String?             @db.VarChar(20)
  drawRecoverable        Boolean             @default(true)
  minimumPayout          Decimal             @default(100) @db.Decimal(10, 2)
  minimumPerLoad         Decimal?            @db.Decimal(10, 2)
  paymentDay             Int                 @default(15)
  sunsetEnabled          Boolean             @default(false)
  sunsetPeriodMonths     Int?                @default(12)
  sunsetSchedule         Json                @default("[]")
  version                Int                 @default(1)
  previousAgreementId    String?             (FK -> AgentAgreement, self-referential)
  createdAt              DateTime            @default(now())
  updatedAt              DateTime            @updatedAt
}
```

### AgentCommission (Prisma -- verified)

```
AgentCommission {
  id                String                @id @default(uuid())
  tenantId          String
  agentId           String                (FK -> Agent)
  loadId            String?               (FK -> Load)
  orderId           String?               (FK -> Order)
  customerId        String?               (FK -> Company)
  assignmentId      String?               (FK -> AgentCustomerAssignment)
  invoiceId         String?               (FK -> Invoice)
  payoutId          String?
  splitType         CommissionSplitType
  splitRate         Decimal               @db.Decimal(5, 4)
  loadRevenue       Decimal?              @db.Decimal(12, 2)
  loadMargin        Decimal?              @db.Decimal(12, 2)
  commissionBase    Decimal               @db.Decimal(12, 2)
  grossCommission   Decimal               @db.Decimal(10, 2)
  adjustments       Decimal               @default(0) @db.Decimal(10, 2)
  netCommission     Decimal               @db.Decimal(10, 2)
  salesRepCommission Decimal?             @db.Decimal(10, 2)
  commissionPeriod  String?               @db.VarChar(7)
  notes             String?
  status            AgentCommissionStatus @default(CALCULATED) (CALCULATED | APPROVED | PAID | ADJUSTED | VOIDED)
  paidAt            DateTime?
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt
}
```

### AgentCustomerAssignment (Prisma -- verified)

```
AgentCustomerAssignment {
  id                   String           @id @default(uuid())
  tenantId             String
  agentId              String           (FK -> Agent)
  customerId           String           (FK -> Company)
  assignmentType       AssignmentType   (PRIMARY | SECONDARY | SPLIT)
  status               AssignmentStatus @default(ACTIVE) (ACTIVE | SUNSET | TRANSFERRED | TERMINATED)
  splitPercent         Decimal?         @db.Decimal(5, 4)
  isProtected          Boolean          @default(true)
  protectionStart      DateTime
  protectionEnd        DateTime?
  inSunset             Boolean          @default(false)
  sunsetStartDate      DateTime?
  currentSunsetRate    Decimal?         @db.Decimal(5, 4)
  overrideSplitRate    Decimal?         @db.Decimal(5, 4)
  overrideReason       String?
  source               String?          @db.VarChar(50)
  leadId               String?          (FK -> AgentLead)
  transferredToAgentId String?
  terminatedAt         DateTime?
  terminatedReason     String?
  createdById          String?
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  @@unique([agentId, customerId])
}
```

### AgentLead (Prisma -- verified)

```
AgentLead {
  id                      String     @id @default(uuid())
  tenantId                String
  agentId                 String     (FK -> Agent)
  leadNumber              String     @db.VarChar(20)
  companyName             String     @db.VarChar(200)
  contactFirstName        String     @db.VarChar(100)
  contactLastName         String     @db.VarChar(100)
  contactTitle            String?    @db.VarChar(100)
  contactEmail            String?    @db.VarChar(255)
  contactPhone            String?    @db.VarChar(20)
  website                 String?    @db.VarChar(255)
  industry                String?    @db.VarChar(100)
  state                   String?    @db.VarChar(50)
  estimatedMonthlyVolume  Int?
  estimatedMonthlyRevenue Decimal?   @db.Decimal(12, 2)
  primaryLanes            Json       @default("[]")
  equipmentNeeds          Json       @default("[]")
  leadSource              String?    @db.VarChar(50)
  notes                   String?
  status                  LeadStatus @default(SUBMITTED) (SUBMITTED | IN_REVIEW | QUALIFIED | WORKING | CONVERTED | REJECTED | EXPIRED)
  submittedAt             DateTime   @default(now())
  qualifiedAt             DateTime?
  qualifiedBy             String?
  convertedAt             DateTime?
  convertedCustomerId     String?
  conversionDeadline      DateTime?
  rejectionReason         String?
  assignedAt              DateTime?
  assignedTo              String?
  updatedAt               DateTime   @updatedAt
}
```

### AgentPayout (Prisma -- verified)

```
AgentPayout {
  id                  String            @id @default(uuid())
  tenantId            String
  agentId             String            (FK -> Agent)
  payoutNumber        String            @db.VarChar(30)
  periodStart         DateTime          @db.Date
  periodEnd           DateTime          @db.Date
  grossCommissions    Decimal           @db.Decimal(12, 2)
  drawRecovery        Decimal           @default(0) @db.Decimal(10, 2)
  adjustments         Decimal           @default(0) @db.Decimal(10, 2)
  netAmount           Decimal           @db.Decimal(12, 2)
  status              AgentPayoutStatus @default(PENDING) (PENDING | APPROVED | PROCESSING | PAID | FAILED)
  approvedAt          DateTime?
  approvedBy          String?
  paymentDate         DateTime?         @db.Date
  paymentMethod       PaymentMethod?
  paymentReference    String?           @db.VarChar(100)
  statementDocumentId String?
  createdById         String?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}
```

### AgentContact (Prisma -- verified)

```
AgentContact {
  id              String  @id @default(uuid())
  tenantId        String
  agentId         String  (FK -> Agent)
  firstName       String  @db.VarChar(100)
  lastName        String  @db.VarChar(100)
  email           String? @db.VarChar(255)
  phone           String? @db.VarChar(20)
  mobile          String? @db.VarChar(20)
  role            String? @db.VarChar(50)
  isPrimary       Boolean @default(false)
  isActive        Boolean @default(true)
  hasPortalAccess Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([agentId, isPrimary])
}
```

### AgentDrawBalance (Prisma -- verified)

```
AgentDrawBalance {
  id                String   @id @default(uuid())
  tenantId          String
  agentId           String   (FK -> Agent)
  period            String   @db.VarChar(7)
  drawAmount        Decimal  @db.Decimal(10, 2)
  commissionsEarned Decimal  @default(0) @db.Decimal(10, 2)
  amountRecovered   Decimal  @default(0) @db.Decimal(10, 2)
  shortfall         Decimal  @default(0) @db.Decimal(10, 2)
  carryoverBalance  Decimal  @default(0) @db.Decimal(10, 2)
  drawPaidAt        DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([agentId, period, tenantId])
}
```

### AgentPortalUser (Prisma -- verified)

```
AgentPortalUser {
  id                String    @id @default(uuid())
  tenantId          String
  agentId           String    (FK -> Agent)
  agentContactId    String?   (FK -> AgentContact)
  userId            String?   (FK -> User)
  email             String    @db.VarChar(255)
  firstName         String    @db.VarChar(100)
  lastName          String    @db.VarChar(100)
  passwordHash      String    @db.VarChar(255)
  passwordChangedAt DateTime?
  role              String    @default("USER") @db.VarChar(20)
  status            String    @default("ACTIVE") @db.VarChar(20)
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

---

## 9. Validation Rules

| Field | Rule | Notes |
|-------|------|-------|
| agentCode | Required, max 20 chars, unique per tenant | `@@unique([tenantId, agentCode])` |
| agentType | Required, must be valid AgentType enum | REFERRING, SELLING, or HYBRID |
| companyName | Required, max 200 chars | Agent's business entity name |
| contactEmail | Required, max 255 chars, valid email | Primary contact email |
| contactFirstName | Required, max 100 chars | Primary contact first name |
| contactLastName | Required, max 100 chars | Primary contact last name |
| contactPhone | Optional, max 20 chars | Phone number |
| country | Required, max 3 chars, default "USA" | ISO country code |
| tenantId | Required, injected from auth context | Multi-tenant isolation |
| Agreement effectiveDate | Required, Date | Must be valid date |
| Agreement splitType | Required, valid CommissionSplitType | PERCENT_OF_REP, PERCENT_OF_MARGIN, FLAT_PER_LOAD, TIERED |
| Agreement splitRate | Required for non-TIERED types | Decimal(5,4) -- e.g., 0.5000 = 50% |
| Agreement tiers | Required JSON array for TIERED type | Volume breakpoints with rates |
| Lead companyName | Required, max 200 chars | Prospect company name |
| Lead contactFirstName/LastName | Required, max 100 chars each | Prospect contact |
| Lead leadNumber | Required, max 20 chars | Auto-generated lead reference |
| Assignment customerId | Required, valid Company FK | Must reference existing customer |
| Assignment protectionStart | Required, DateTime | Start of account protection window |
| Payout periodStart/End | Required, Date | Commission period boundaries |

---

## 10. Status States

### Agent Status (`AgentStatus`)

```
PENDING (default) -> ACTIVE -> SUSPENDED -> ACTIVE (reinstate)
                  -> ACTIVE -> TERMINATED (final)
```

| Status | Description | Transitions To |
|--------|-------------|----------------|
| PENDING | Agent application received, awaiting onboarding | ACTIVE (via `/activate`) |
| ACTIVE | Agent is operational, can source loads and earn commissions | SUSPENDED, TERMINATED |
| SUSPENDED | Temporarily suspended, no new commissions | ACTIVE (reinstate), TERMINATED |
| TERMINATED | Permanently terminated, no further activity | (terminal state) |

### Agreement Status (`AgreementStatus`)

```
DRAFT -> ACTIVE -> EXPIRED or TERMINATED
```

| Status | Description | Transitions To |
|--------|-------------|----------------|
| DRAFT | Agreement created but not yet in effect | ACTIVE (via `/activate`) |
| ACTIVE | Agreement governs current commission calculations | EXPIRED, TERMINATED |
| EXPIRED | Past expiration date, no longer active | (terminal) |
| TERMINATED | Manually ended before expiration | (terminal) |

### Commission Status (`AgentCommissionStatus`)

```
CALCULATED -> APPROVED -> PAID
          -> ADJUSTED
          -> VOIDED
```

| Status | Description | Transitions To |
|--------|-------------|----------------|
| CALCULATED | Commission computed from load data | APPROVED, ADJUSTED, VOIDED |
| APPROVED | Verified for payout | PAID, ADJUSTED |
| PAID | Included in a payout | (terminal) |
| ADJUSTED | Modified after initial calculation | APPROVED |
| VOIDED | Cancelled, will not be paid | (terminal) |

### Payout Status (`AgentPayoutStatus`)

```
PENDING -> APPROVED -> PROCESSING -> PAID
                                  -> FAILED -> PROCESSING (retry)
```

### Assignment Status (`AssignmentStatus`)

```
ACTIVE -> SUNSET -> TERMINATED
       -> TRANSFERRED
       -> TERMINATED
```

### Lead Status (`LeadStatus`)

```
SUBMITTED -> IN_REVIEW -> QUALIFIED -> WORKING -> CONVERTED
                       -> REJECTED
                                    -> EXPIRED
```

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| No frontend pages -- zero routes for agents | P1 | Open | 9 design specs exist, none built |
| No hooks or components | P1 | Open | 43 backend endpoints have no frontend consumers |
| No tests for any of the 6 controllers | P0 | Open | 43 endpoints completely untested |
| Agent portal (AgentPortalUser) has no UI | P2 | Open | Schema and model exist, no login/portal pages |
| Rankings endpoint duplicated in AgentsController and CommissionsController | P2 | Open | Both expose `GET /agents/rankings` -- potential conflict |
| Commission calculation logic unverified | P1 | Open | Fields exist but unclear if service correctly computes from load data |
| Statement PDF generation unverified | P2 | Open | Endpoint exists but PDF rendering implementation unknown |
| Draw balance tracking unverified | P2 | Open | AgentDrawBalance model exists, unclear if automated |
| Sunset schedule execution unverified | P2 | Open | `sunsetSchedule` JSON stored but no cron/job to apply rate reductions |
| Lead conversion to customer flow unverified | P1 | Open | `/convert` endpoint exists but customer creation logic unknown |
| AgentType enum mismatch with business intent | P2 | Open | Enum has REFERRING/SELLING/HYBRID, business rules reference INTERNAL/EXTERNAL -- these are different concepts |

---

## 12. Tasks

| Task ID | Title | Effort | Priority | Notes |
|---------|-------|--------|----------|-------|
| AGT-001 | Build Agents Dashboard page (`/agents`) | L (6-8h) | P2 | Design spec: `01-agents-dashboard.md` |
| AGT-002 | Build Agents List page (`/agents/list`) | M (4h) | P2 | Design spec: `02-agents-list.md`, filterable table |
| AGT-003 | Build Agent Detail page (`/agents/[id]`) | L (8h) | P2 | Design spec: `03-agent-detail.md`, tabbed layout: profile, contacts, agreements, commissions, leads |
| AGT-004 | Build Agent Setup form (`/agents/new`) | M (4h) | P2 | Design spec: `04-agent-setup.md`, multi-step onboarding |
| AGT-005 | Build Agent Performance page | M (4h) | P2 | Design spec: `05-agent-performance.md`, charts and metrics |
| AGT-006 | Build Commission Setup page | M (3-4h) | P2 | Design spec: `06-commission-setup.md`, agreement terms editor |
| AGT-007 | Build useAgents + useAgent + mutation hooks | M (3h) | P2 | Must follow `response.data.data` envelope |
| AGT-008 | Build useAgentAgreements hook | S (2h) | P2 | Agreement CRUD with status transitions |
| AGT-009 | Build useAgentCommissions + useAgentPerformance hooks | S (2h) | P2 | Commission listing and performance metrics |
| AGT-010 | Build useAgentLeads hook | S (2h) | P2 | Lead pipeline with qualify/convert/reject actions |
| AGT-011 | Build useAgentCustomers hook | S (2h) | P2 | Customer assignment CRUD with transfer/sunset |
| AGT-012 | Build useAgentStatements hook | S (1h) | P2 | Statement list + PDF download |
| AGT-013 | Write controller tests (43 endpoints) | XL (10-12h) | P1 | Zero coverage currently, 6 controllers |
| AGT-014 | Build Agent Territories page | M (4h) | P3 | Design spec: `07-agent-territories.md`, map-based |
| AGT-015 | Build Agent Reports page | M (4h) | P3 | Design spec: `08-agent-reports.md`, rankings and payouts |
| AGT-016 | Build Agent Portal login and restricted UI | XL (12h+) | P3 | AgentPortalUser model ready, need auth flow and restricted views |
| AGT-017 | Verify commission calculation service logic | M (3h) | P1 | Ensure split types compute correctly from load revenue/margin |
| AGT-018 | Verify lead-to-customer conversion flow | S (2h) | P1 | Ensure `/convert` creates customer and auto-assigns to agent |
| AGT-019 | Resolve duplicate rankings endpoint | S (1h) | P2 | AgentsController and CommissionsController both serve rankings |

---

## 13. Design Links

| File | Path | Content |
|------|------|---------|
| Service Overview | `dev_docs/12-Rabih-design-Process/15-agents/00-service-overview.md` | Full agents service scope and business context |
| Agents Dashboard | `dev_docs/12-Rabih-design-Process/15-agents/01-agents-dashboard.md` | KPI cards, top agents, recent activity |
| Agents List | `dev_docs/12-Rabih-design-Process/15-agents/02-agents-list.md` | Searchable/filterable agent table |
| Agent Detail | `dev_docs/12-Rabih-design-Process/15-agents/03-agent-detail.md` | Tabbed detail: profile, agreements, commissions, leads |
| Agent Setup | `dev_docs/12-Rabih-design-Process/15-agents/04-agent-setup.md` | Multi-step agent onboarding form |
| Agent Performance | `dev_docs/12-Rabih-design-Process/15-agents/05-agent-performance.md` | Revenue/volume charts and metrics |
| Commission Setup | `dev_docs/12-Rabih-design-Process/15-agents/06-commission-setup.md` | Commission agreement configuration |
| Agent Territories | `dev_docs/12-Rabih-design-Process/15-agents/07-agent-territories.md` | Territory assignment and map view |
| Agent Reports | `dev_docs/12-Rabih-design-Process/15-agents/08-agent-reports.md` | Rankings, payouts, lead conversion reports |

---

## 14. Delta vs Original Plan

| Area | Original Hub (7 sections) | Actual State | Gap |
|------|---------------------------|--------------|-----|
| Endpoints | 6 listed | 43 across 6 controllers (agents, agreements, assignments, commissions, leads, statements) | Backend is 7x richer than documented |
| Controllers | 1 implied | 6 controllers with dedicated sub-modules | Massive undocumented backend |
| Data Models | Agent, AgentCommission mentioned | 9 models: Agent, AgentAgreement, AgentCommission, AgentCustomerAssignment, AgentLead, AgentPayout, AgentContact, AgentDrawBalance, AgentPortalUser | 7 models were undocumented |
| Enums | None listed | 10 enums covering agent types, statuses, commission splits, lead pipeline | Entirely undocumented |
| Agent Types | INTERNAL/EXTERNAL (business concept) | REFERRING/SELLING/HYBRID (actual enum) | Enum models business differently than described |
| Commission | "50/50 or 60/40 split" | 4 split types (PERCENT_OF_REP, PERCENT_OF_MARGIN, FLAT_PER_LOAD, TIERED) with tiered JSON | Far more sophisticated than documented |
| Leads | Not mentioned | Full lead pipeline with 7 statuses, 8 endpoints | Entirely new sub-module |
| Assignments | Not mentioned | Customer-agent assignments with protection, sunset, transfer workflows | Entirely new sub-module |
| Statements | Not mentioned | Statement generation and PDF download (4 endpoints) | Entirely new sub-module |
| Portal | Not mentioned | AgentPortalUser model with auth fields | Schema-only, no UI |
| Draw | Not mentioned | AgentDrawBalance model for guaranteed minimum payments | Schema-only, unverified |
| Frontend | "Not Built" | Still Not Built | No change -- zero frontend |
| Design Specs | Not referenced | 9 files exist in `dev_docs/12-Rabih-design-Process/15-agents/` | Were not linked |

**Key finding:** The backend is dramatically more capable than the previous hub documented. Six controllers with 43 endpoints, 9 Prisma models, and 10 enums cover a comprehensive agent lifecycle: onboarding, agreements, customer assignments with protection periods, lead pipeline, commission calculation, draw balances, payouts, statements, and a portal user model. The entire frontend is missing -- no pages, no components, no hooks. The previous hub captured roughly 15% of the actual backend scope.

---

## 15. Dependencies

### Depends On

| Service | Reason |
|---------|--------|
| Auth | Tenant isolation, `createdById` / `activatedBy` user references, access control |
| TMS Core / Loads | `loadId` FK on AgentCommission, load revenue/margin data for commission calculation |
| Orders | `orderId` FK on AgentCommission |
| CRM / Companies | `customerId` FK on AgentCustomerAssignment and AgentCommission (references Company model) |
| Invoicing | `invoiceId` FK on AgentCommission, payout statement linking |
| Users | `userId` FK on AgentPortalUser, links portal users to system users |

### Depended On By

| Service | Reason |
|---------|--------|
| Accounting | Agent payouts, commission expenses, 1099 reporting via `taxId` |
| Commission | Agent commission split calculations affect sales rep commissions (`salesRepCommission` field) |
| CRM | Customer-agent assignment lookup via `/customers/:id/agent` endpoint |
| Dispatch | Load attribution to agents for commission tracking |
| Reports | Agent rankings, performance metrics, payout reports |
