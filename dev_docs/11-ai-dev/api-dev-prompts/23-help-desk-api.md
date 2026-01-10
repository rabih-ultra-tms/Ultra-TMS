# 23 - Help Desk Service API Implementation

> **Service:** Help Desk  
> **Priority:** P2 - Medium  
> **Endpoints:** 30  
> **Dependencies:** Auth ✅, Communication ✅, Documents ✅  
> **Doc Reference:** [33-service-help-desk.md](../../02-services/33-service-help-desk.md)

---

## 📋 Overview

Internal support ticket system for managing customer inquiries, technical issues, and service requests. Provides ticket lifecycle management, SLA tracking, knowledge base, and support team collaboration tools.

### Key Capabilities
- Ticket management with SLA tracking
- Support team queues and assignment
- Knowledge base articles
- Canned responses
- Escalation rules
- Customer satisfaction surveys

---

## ✅ Pre-Implementation Checklist

- [ ] Auth and Communication services operational
- [ ] Documents service for attachments
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### SupportTicket Model
```prisma
model SupportTicket {
  id                String            @id @default(cuid())
  tenantId          String
  
  ticketNumber      String
  
  // Source
  source            String            // EMAIL, PORTAL, PHONE, CHAT, INTERNAL
  sourceEmail       String?
  sourcePhone       String?
  
  // Requester
  requesterType     String            // USER, CONTACT, ANONYMOUS
  requesterUserId   String?
  requesterContactId String?
  requesterName     String?
  requesterEmail    String?
  
  // Details
  subject           String
  description       String            @db.Text
  
  // Classification
  category          String
  subcategory       String?
  ticketType        String            @default("QUESTION")
  
  // Priority & Status
  priority          String            @default("NORMAL")
  status            String            @default("NEW")
  
  // Assignment
  assignedTeamId    String?
  assignedUserId    String?
  
  // Related Entity
  relatedType       String?
  relatedId         String?
  
  // SLA
  slaPolicyId       String?
  firstResponseDueAt DateTime?
  resolutionDueAt   DateTime?
  firstResponseAt   DateTime?
  resolvedAt        DateTime?
  slaFirstResponseBreached Boolean    @default(false)
  slaResolutionBreached    Boolean    @default(false)
  
  // Satisfaction
  satisfactionRating Int?
  satisfactionComment String?
  satisfactionSentAt DateTime?
  satisfactionRespondedAt DateTime?
  
  // Merging
  mergedIntoId      String?
  
  // Tracking
  reopenedCount     Int               @default(0)
  replyCount        Int               @default(0)
  
  // Migration
  externalId        String?
  sourceSystem      String?
  customFields      Json              @default("{}")
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  closedAt          DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  assignedTeam      SupportTeam?      @relation(fields: [assignedTeamId], references: [id])
  assignedUser      User?             @relation(fields: [assignedUserId], references: [id])
  slaPolicy         SlaPolicy?        @relation(fields: [slaPolicyId], references: [id])
  
  replies           TicketReply[]
  tags              TicketTagAssignment[]
  
  @@unique([tenantId, ticketNumber])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([assignedUserId, status])
  @@index([assignedTeamId, status])
}
```

### TicketReply Model
```prisma
model TicketReply {
  id                String            @id @default(cuid())
  ticketId          String
  
  authorType        String            // AGENT, REQUESTER, SYSTEM
  authorUserId      String?
  authorName        String?
  authorEmail       String?
  
  body              String            @db.Text
  bodyHtml          String?           @db.Text
  
  replyType         String            // PUBLIC, INTERNAL_NOTE, SYSTEM
  
  emailMessageId    String?
  attachmentCount   Int               @default(0)
  
  createdAt         DateTime          @default(now())
  
  ticket            SupportTicket     @relation(fields: [ticketId], references: [id])
  
  @@index([ticketId, createdAt])
}
```

### SupportTeam Model
```prisma
model SupportTeam {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  email             String?
  
  autoAssign        Boolean           @default(false)
  assignmentMethod  String            @default("ROUND_ROBIN")
  
  managerId         String?
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  manager           User?             @relation(fields: [managerId], references: [id])
  
  members           SupportTeamMember[]
  tickets           SupportTicket[]
  
  @@index([tenantId])
}
```

### SupportTeamMember Model
```prisma
model SupportTeamMember {
  id                String            @id @default(cuid())
  teamId            String
  userId            String
  
  role              String            @default("MEMBER")  // LEAD, MEMBER
  maxOpenTickets    Int               @default(20)
  currentTicketCount Int              @default(0)
  isAvailable       Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  
  team              SupportTeam       @relation(fields: [teamId], references: [id])
  user              User              @relation(fields: [userId], references: [id])
  
  @@unique([teamId, userId])
}
```

### SlaPolicy Model
```prisma
model SlaPolicy {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  
  conditions        Json              // {priority: ['URGENT'], category: ['TECHNICAL']}
  
  firstResponseTarget Int             // Minutes
  resolutionTarget  Int               // Minutes
  
  useBusinessHours  Boolean           @default(true)
  priority          Int               @default(0)
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  tickets           SupportTicket[]
  
  @@index([tenantId])
}
```

### EscalationRule Model
```prisma
model EscalationRule {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  description       String?           @db.Text
  
  triggerType       String            // SLA_BREACH, NO_RESPONSE, CUSTOMER_REPLY
  triggerMinutes    Int?
  
  conditions        Json?
  
  actionType        String            // NOTIFY, REASSIGN, CHANGE_PRIORITY
  actionConfig      Json
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
}
```

### CannedResponse Model
```prisma
model CannedResponse {
  id                String            @id @default(cuid())
  tenantId          String
  
  title             String
  content           String            @db.Text
  contentHtml       String?           @db.Text
  
  category          String?
  shortcut          String?
  
  visibility        String            @default("TEAM")  // PERSONAL, TEAM, ALL
  createdBy         String?
  teamId            String?
  
  useCount          Int               @default(0)
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
}
```

### KbCategory Model
```prisma
model KbCategory {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  slug              String
  description       String?           @db.Text
  icon              String?
  
  parentId          String?
  displayOrder      Int               @default(0)
  
  isPublic          Boolean           @default(true)
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  parent            KbCategory?       @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children          KbCategory[]      @relation("CategoryHierarchy")
  articles          KbArticle[]
  
  @@unique([tenantId, slug])
}
```

### KbArticle Model
```prisma
model KbArticle {
  id                String            @id @default(cuid())
  tenantId          String
  categoryId        String
  
  title             String
  slug              String
  summary           String?           @db.Text
  content           String            @db.Text
  contentHtml       String?           @db.Text
  
  authorId          String?
  
  metaTitle         String?
  metaDescription   String?
  keywords          Json              @default("[]")
  
  isPublic          Boolean           @default(true)
  isFeatured        Boolean           @default(false)
  
  status            String            @default("DRAFT")  // DRAFT, PUBLISHED, ARCHIVED
  publishedAt       DateTime?
  
  viewCount         Int               @default(0)
  helpfulCount      Int               @default(0)
  notHelpfulCount   Int               @default(0)
  
  version           Int               @default(1)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  category          KbCategory        @relation(fields: [categoryId], references: [id])
  
  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([categoryId])
  @@index([status, isPublic])
}
```

### TicketTag Model
```prisma
model TicketTag {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  color             String            @default("#6366F1")
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  tickets           TicketTagAssignment[]
  
  @@unique([tenantId, name])
}

model TicketTagAssignment {
  ticketId          String
  tagId             String
  
  createdAt         DateTime          @default(now())
  
  ticket            SupportTicket     @relation(fields: [ticketId], references: [id])
  tag               TicketTag         @relation(fields: [tagId], references: [id])
  
  @@id([ticketId, tagId])
}
```

---

## 🛠️ API Endpoints

### Tickets (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/support/tickets` | List tickets |
| POST | `/api/v1/support/tickets` | Create ticket |
| GET | `/api/v1/support/tickets/:id` | Get ticket |
| PUT | `/api/v1/support/tickets/:id` | Update ticket |
| DELETE | `/api/v1/support/tickets/:id` | Delete ticket |
| POST | `/api/v1/support/tickets/:id/reply` | Add reply |
| POST | `/api/v1/support/tickets/:id/assign` | Assign ticket |
| POST | `/api/v1/support/tickets/:id/close` | Close ticket |
| POST | `/api/v1/support/tickets/:id/reopen` | Reopen ticket |

### Teams (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/support/teams` | List teams |
| POST | `/api/v1/support/teams` | Create team |
| GET | `/api/v1/support/teams/:id` | Get team |
| PUT | `/api/v1/support/teams/:id` | Update team |
| POST | `/api/v1/support/teams/:id/members` | Manage members |

### SLA Policies (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/support/sla-policies` | List policies |
| POST | `/api/v1/support/sla-policies` | Create policy |
| PUT | `/api/v1/support/sla-policies/:id` | Update policy |
| DELETE | `/api/v1/support/sla-policies/:id` | Delete policy |

### Canned Responses (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/support/canned-responses` | List responses |
| POST | `/api/v1/support/canned-responses` | Create response |
| PUT | `/api/v1/support/canned-responses/:id` | Update response |
| DELETE | `/api/v1/support/canned-responses/:id` | Delete response |

### Knowledge Base (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/support/kb/categories` | List categories |
| POST | `/api/v1/support/kb/categories` | Create category |
| GET | `/api/v1/support/kb/articles` | List articles |
| POST | `/api/v1/support/kb/articles` | Create article |
| GET | `/api/v1/support/kb/articles/:id` | Get article |
| PUT | `/api/v1/support/kb/articles/:id` | Update article |
| POST | `/api/v1/support/kb/articles/:id/publish` | Publish article |
| POST | `/api/v1/support/kb/articles/:id/feedback` | Article feedback |

---

## 📝 DTO Specifications

### CreateTicketDto
```typescript
export class CreateTicketDto {
  @IsString()
  subject: string;

  @IsString()
  description: string;

  @IsIn(['EMAIL', 'PORTAL', 'PHONE', 'CHAT', 'INTERNAL'])
  source: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsIn(['URGENT', 'HIGH', 'NORMAL', 'LOW'])
  priority?: string;

  @IsOptional()
  @IsString()
  requesterEmail?: string;

  @IsOptional()
  @IsString()
  requesterName?: string;

  @IsOptional()
  @IsString()
  relatedType?: string;

  @IsOptional()
  @IsString()
  relatedId?: string;
}
```

### AddReplyDto
```typescript
export class AddReplyDto {
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @IsIn(['PUBLIC', 'INTERNAL_NOTE'])
  replyType: string;
}
```

### AssignTicketDto
```typescript
export class AssignTicketDto {
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  assignedTeamId?: string;
}
```

### CreateSlaPolicyDto
```typescript
export class CreateSlaPolicyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  conditions: {
    priority?: string[];
    category?: string[];
  };

  @IsInt()
  @Min(1)
  firstResponseTarget: number;

  @IsInt()
  @Min(1)
  resolutionTarget: number;

  @IsOptional()
  @IsBoolean()
  useBusinessHours?: boolean;

  @IsOptional()
  @IsInt()
  priority?: number;
}
```

### CreateKbArticleDto
```typescript
export class CreateKbArticleDto {
  @IsString()
  title: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
```

---

## 📋 Business Rules

### Ticket Number Generation
```typescript
class TicketService {
  async generateTicketNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const sequence = await this.sequenceService.getNext(
      tenantId, 
      `TICKET-${year}${month}`
    );
    return `TKT-${year}${month}-${sequence.toString().padStart(5, '0')}`;
  }
}
```

### SLA Calculation
```typescript
class SlaService {
  calculateDueAt(
    policy: SlaPolicy, 
    createdAt: Date, 
    targetMinutes: number
  ): Date {
    if (!policy.useBusinessHours) {
      return new Date(createdAt.getTime() + targetMinutes * 60 * 1000);
    }
    
    // Calculate using business hours
    let remainingMinutes = targetMinutes;
    let current = new Date(createdAt);
    
    while (remainingMinutes > 0) {
      const businessHours = this.getBusinessHours(current);
      
      if (businessHours.isOpen) {
        const minutesUntilClose = this.getMinutesUntilClose(current, businessHours);
        const minutesToAdd = Math.min(remainingMinutes, minutesUntilClose);
        current = new Date(current.getTime() + minutesToAdd * 60 * 1000);
        remainingMinutes -= minutesToAdd;
      } else {
        current = this.getNextOpenTime(current, businessHours);
      }
    }
    
    return current;
  }
}
```

### Auto-Assignment
```typescript
class AssignmentService {
  async autoAssign(ticket: SupportTicket): Promise<string | null> {
    const team = await this.getTeamForTicket(ticket);
    if (!team || !team.autoAssign) return null;
    
    const members = await this.getAvailableMembers(team.id);
    
    if (team.assignmentMethod === 'ROUND_ROBIN') {
      return this.roundRobinAssign(members);
    }
    
    if (team.assignmentMethod === 'LOAD_BALANCED') {
      // Assign to member with fewest open tickets
      const sorted = members.sort((a, b) => 
        a.currentTicketCount - b.currentTicketCount
      );
      return sorted[0]?.userId;
    }
    
    return null;
  }
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `ticket.created` | Ticket created | `{ ticketId }` |
| `ticket.assigned` | Ticket assigned | `{ ticketId, assignee }` |
| `ticket.replied` | Reply added | `{ ticketId, replyId }` |
| `ticket.closed` | Ticket closed | `{ ticketId }` |
| `ticket.sla.breached` | SLA breached | `{ ticketId, slaType }` |
| `ticket.satisfaction` | Rating received | `{ ticketId, rating }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `email.received` | Communication | Create ticket |

---

## 🧪 Integration Test Requirements

```typescript
describe('Help Desk Service API', () => {
  describe('Tickets', () => {
    it('should create ticket');
    it('should assign ticket');
    it('should add reply');
    it('should close and reopen ticket');
  });

  describe('SLA', () => {
    it('should apply SLA policy');
    it('should calculate due dates');
    it('should track SLA breach');
  });

  describe('Knowledge Base', () => {
    it('should create article');
    it('should publish article');
    it('should track article views');
  });

  describe('Teams', () => {
    it('should auto-assign tickets');
    it('should round-robin assignment');
    it('should load-balanced assignment');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/help-desk/
├── help-desk.module.ts
├── tickets/
│   ├── tickets.controller.ts
│   ├── tickets.service.ts
│   └── ticket-number.service.ts
├── teams/
│   ├── teams.controller.ts
│   ├── teams.service.ts
│   └── assignment.service.ts
├── sla/
│   ├── sla-policies.controller.ts
│   ├── sla.service.ts
│   └── sla-tracker.service.ts
├── canned-responses/
│   ├── canned-responses.controller.ts
│   └── canned-responses.service.ts
├── knowledge-base/
│   ├── kb.controller.ts
│   ├── categories.service.ts
│   └── articles.service.ts
└── escalation/
    └── escalation.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 30 endpoints implemented
- [ ] Ticket CRUD with lifecycle
- [ ] Reply and internal notes
- [ ] Team management and assignment
- [ ] SLA policy application
- [ ] SLA tracking and breach detection
- [ ] Canned responses
- [ ] Knowledge base articles
- [ ] Escalation rules
- [ ] All integration tests passing

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>36</td>
    <td>Help Desk</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>30/30</td>
    <td>4/4</td>
    <td>100%</td>
    <td>Tickets, Teams, SLA, Knowledge Base</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[24-feedback-api.md](./24-feedback-api.md)** - Implement Feedback Service API
