# 12 - Load Board External Service API Implementation

> **Service:** Load Board External  
> **Priority:** P1 - High  
> **Endpoints:** 35  
> **Dependencies:** TMS Core ✅ (01), Carrier ✅ (02), Sales ✅  
> **Doc Reference:** [39-service-load-board-external.md](../../02-services/39-service-load-board-external.md)

---

## 📋 Overview

Integration service for posting loads and searching capacity on external load boards (DAT, Truckstop, 123Loadboard, Trucker Path). Automates freight posting, capacity discovery, lead capture, and carrier onboarding from industry marketplaces.

### Key Capabilities
- Multi-board integration (DAT, Truckstop, etc.)
- Automated load posting and refresh
- Capacity/truck search
- Lead capture and conversion
- Posting rules engine
- Post analytics and performance tracking

---

## ✅ Pre-Implementation Checklist

- [ ] TMS Core service is working (Loads)
- [ ] Carrier service is working (carrier creation)
- [ ] Sales service is working (quotes)
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### LoadBoardProvider Model
```prisma
model LoadBoardProvider {
  id                String            @id @default(cuid())
  
  providerCode      String            @unique  // DAT, TRUCKSTOP, 123LOADBOARD
  providerName      String
  
  apiBaseUrl        String?
  apiVersion        String?
  
  supportsPosting   Boolean           @default(true)
  supportsSearching Boolean           @default(true)
  supportsRateData  Boolean           @default(false)
  supportsCarrierData Boolean         @default(false)
  
  maxPostsPerHour   Int?
  maxSearchesPerHour Int?
  
  status            String            @default("ACTIVE")
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  accounts          LoadBoardAccount[]
}
```

### LoadBoardAccount Model
```prisma
model LoadBoardAccount {
  id                String            @id @default(cuid())
  tenantId          String
  providerId        String
  
  accountName       String
  username          String?
  credentials       Json              // Encrypted API credentials
  
  // Company Info for Posts
  companyName       String
  mcNumber          String?
  dotNumber         String?
  contactName       String?
  contactPhone      String
  contactEmail      String?
  
  // Posting Defaults
  defaultContactPhone String?
  defaultCommentTemplate String?      @db.Text
  
  // Settings
  autoPostEnabled   Boolean           @default(false)
  autoPostDelayMinutes Int            @default(30)
  autoRefreshEnabled Boolean          @default(true)
  refreshIntervalHours Int            @default(4)
  autoRemoveOnBook  Boolean           @default(true)
  
  // Status
  status            AccountStatus     @default(ACTIVE)
  connectionStatus  String            @default("UNKNOWN")
  lastConnectionAt  DateTime?
  lastError         String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  provider          LoadBoardProvider @relation(fields: [providerId], references: [id])
  posts             LoadPost[]
  searches          CapacitySearch[]
  
  @@unique([tenantId, providerId, username])
  @@index([tenantId])
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  EXPIRED
}
```

### LoadPost Model
```prisma
model LoadPost {
  id                String            @id @default(cuid())
  tenantId          String
  loadId            String
  accountId         String
  
  providerPostId    String?           // ID from load board
  postReference     String?
  
  postStatus        PostStatus        @default(PENDING)
  postedAt          DateTime?
  refreshedAt       DateTime?
  removedAt         DateTime?
  expiresAt         DateTime?
  
  // Snapshot at posting time
  originCity        String
  originState       String
  originZip         String?
  destinationCity   String
  destinationState  String
  destinationZip    String?
  
  pickupDate        DateTime
  pickupDateEnd     DateTime?
  deliveryDate      DateTime?
  
  equipmentType     String
  equipmentLength   Int?
  weight            Int?
  
  // Rate Info
  rateType          String?           // ALL_IN, PER_MILE, OPEN
  rateAmount        Decimal?          @db.Decimal(10,2)
  ratePerMile       Decimal?          @db.Decimal(8,2)
  totalMiles        Int?
  
  fullOrPartial     String?           // FULL, PARTIAL
  commodity         String?
  comments          String?           @db.Text
  
  contactPhone      String?
  contactName       String?
  
  postedManually    Boolean           @default(false)
  postedBy          String?
  
  // Response Tracking
  viewsCount        Int               @default(0)
  callsCount        Int               @default(0)
  emailsCount       Int               @default(0)
  
  errorMessage      String?           @db.Text
  retryCount        Int               @default(0)
  nextRetryAt       DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  load              Load              @relation(fields: [loadId], references: [id])
  account           LoadBoardAccount  @relation(fields: [accountId], references: [id])
  leads             PostLead[]
  
  @@index([loadId])
  @@index([postStatus])
  @@index([expiresAt])
}

enum PostStatus {
  PENDING
  POSTED
  REFRESHED
  REMOVED
  FAILED
}
```

### PostLead Model
```prisma
model PostLead {
  id                String            @id @default(cuid())
  tenantId          String
  loadPostId        String
  loadId            String
  
  sourceBoard       String
  leadType          LeadType
  
  contactName       String?
  contactPhone      String?
  contactEmail      String?
  companyName       String?
  mcNumber          String?
  dotNumber         String?
  
  carrierId         String?           // If matched
  carrierMatchedAt  DateTime?
  
  inquiryMessage    String?           @db.Text
  offeredRate       Decimal?          @db.Decimal(10,2)
  equipmentOffered  String?
  availableDate     DateTime?
  
  status            LeadStatus        @default(NEW)
  
  assignedTo        String?
  contactedAt       DateTime?
  contactedBy       String?
  followUpNotes     String?           @db.Text
  
  outcome           String?
  outcomeNotes      String?           @db.Text
  
  providerLeadId    String?
  rawData           Json?
  
  receivedAt        DateTime
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  loadPost          LoadPost          @relation(fields: [loadPostId], references: [id])
  load              Load              @relation(fields: [loadId], references: [id])
  carrier           Carrier?          @relation(fields: [carrierId], references: [id])
  
  @@index([loadPostId])
  @@index([status])
  @@index([mcNumber])
}

enum LeadType {
  CALL
  EMAIL
  BOOK_NOW
  INQUIRY
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  BOOKED
  DECLINED
  SPAM
}
```

### CapacitySearch Model
```prisma
model CapacitySearch {
  id                String            @id @default(cuid())
  tenantId          String
  accountId         String
  
  // Search Criteria
  originCity        String?
  originState       String?
  originZip         String?
  originRadiusMiles Int?
  
  destinationCity   String?
  destinationState  String?
  destinationZip    String?
  destinationRadiusMiles Int?
  
  availableDateFrom DateTime?
  availableDateTo   DateTime?
  
  equipmentTypes    String[]
  
  relatedLoadId     String?
  
  searchStatus      SearchStatus      @default(PENDING)
  resultsCount      Int               @default(0)
  searchedAt        DateTime?
  
  errorMessage      String?           @db.Text
  searchDurationMs  Int?
  
  createdAt         DateTime          @default(now())
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  account           LoadBoardAccount  @relation(fields: [accountId], references: [id])
  load              Load?             @relation(fields: [relatedLoadId], references: [id])
  results           CapacitySearchResult[]
  
  @@index([relatedLoadId])
}

enum SearchStatus {
  PENDING
  COMPLETED
  FAILED
}
```

### CapacitySearchResult Model
```prisma
model CapacitySearchResult {
  id                String            @id @default(cuid())
  searchId          String
  
  providerResultId  String?
  sourceBoard       String
  
  companyName       String?
  mcNumber          String?
  dotNumber         String?
  contactName       String?
  contactPhone      String?
  contactEmail      String?
  
  matchedCarrierId  String?
  
  equipmentType     String?
  equipmentLength   Int?
  availableDate     DateTime?
  
  originCity        String?
  originState       String?
  destinationPreference String?
  
  truckType         String?           // SOLO, TEAM
  driverType        String?           // OWNER_OP, COMPANY
  
  targetRate        Decimal?          @db.Decimal(10,2)
  targetRatePerMile Decimal?          @db.Decimal(8,2)
  
  contacted         Boolean           @default(false)
  contactedAt       DateTime?
  contactedBy       String?
  contactResult     String?
  notes             String?           @db.Text
  
  rawData           Json?
  
  createdAt         DateTime          @default(now())
  
  search            CapacitySearch    @relation(fields: [searchId], references: [id], onDelete: Cascade)
  carrier           Carrier?          @relation(fields: [matchedCarrierId], references: [id])
  
  @@index([searchId])
  @@index([mcNumber])
}
```

### PostingRule Model
```prisma
model PostingRule {
  id                String            @id @default(cuid())
  tenantId          String
  
  ruleName          String
  description       String?           @db.Text
  
  conditions        Json              // Lane, equipment, customer criteria
  
  autoPost          Boolean           @default(true)
  postAccounts      String[]          // Account IDs
  postDelayMinutes  Int               @default(30)
  
  rateAdjustmentType String?          // NONE, PERCENTAGE, FLAT
  rateAdjustmentValue Decimal?        @db.Decimal(10,2)
  customComments    String?           @db.Text
  
  priority          Int               @default(100)
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, isActive])
}
```

---

## 🛠️ API Endpoints

### Board Accounts (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/load-board/accounts` | List accounts |
| POST | `/api/v1/load-board/accounts` | Add account |
| GET | `/api/v1/load-board/accounts/:id` | Get account |
| PUT | `/api/v1/load-board/accounts/:id` | Update account |
| DELETE | `/api/v1/load-board/accounts/:id` | Remove account |
| POST | `/api/v1/load-board/accounts/:id/test` | Test connection |

### Load Posting (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/load-board/posts` | List posts |
| POST | `/api/v1/load-board/posts` | Post load |
| GET | `/api/v1/load-board/posts/:id` | Get post |
| PUT | `/api/v1/load-board/posts/:id` | Update post |
| POST | `/api/v1/load-board/posts/:id/refresh` | Refresh post |
| DELETE | `/api/v1/load-board/posts/:id` | Remove post |
| POST | `/api/v1/load-board/posts/bulk` | Bulk post |
| DELETE | `/api/v1/load-board/posts/bulk` | Bulk remove |
| GET | `/api/v1/loads/:loadId/posts` | Posts for load |

### Capacity Search (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/load-board/capacity/search` | Search trucks |
| GET | `/api/v1/load-board/capacity/searches` | List searches |
| GET | `/api/v1/load-board/capacity/searches/:id` | Get results |
| POST | `/api/v1/load-board/capacity/results/:id/contact` | Log contact |

### Leads (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/load-board/leads` | List leads |
| GET | `/api/v1/load-board/leads/:id` | Get lead |
| PUT | `/api/v1/load-board/leads/:id` | Update lead |
| POST | `/api/v1/load-board/leads/:id/assign` | Assign lead |
| POST | `/api/v1/load-board/leads/:id/contact` | Log contact |
| POST | `/api/v1/load-board/leads/:id/qualify` | Qualify |
| POST | `/api/v1/load-board/leads/:id/convert` | Convert to carrier |

### Posting Rules (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/load-board/rules` | List rules |
| POST | `/api/v1/load-board/rules` | Create rule |
| GET | `/api/v1/load-board/rules/:id` | Get rule |
| PUT | `/api/v1/load-board/rules/:id` | Update rule |
| DELETE | `/api/v1/load-board/rules/:id` | Delete rule |

### Analytics (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/load-board/analytics/posts` | Post metrics |
| GET | `/api/v1/load-board/analytics/leads` | Lead metrics |
| GET | `/api/v1/load-board/analytics/boards` | Board comparison |

---

## 📝 DTO Specifications

### CreateAccountDto
```typescript
export class CreateAccountDto {
  @IsString()
  providerId: string;

  @IsString()
  accountName: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsObject()
  credentials: Record<string, string>;

  @IsString()
  companyName: string;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @IsOptional()
  @IsString()
  dotNumber?: string;

  @IsOptional()
  @IsBoolean()
  autoPostEnabled?: boolean;

  @IsOptional()
  @IsInt()
  autoPostDelayMinutes?: number;
}
```

### PostLoadDto
```typescript
export class PostLoadDto {
  @IsString()
  loadId: string;

  @IsArray()
  @IsString({ each: true })
  accountIds: string[];

  @IsOptional()
  @IsString()
  rateType?: string;

  @IsOptional()
  @IsNumber()
  rateAmount?: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  postImmediately?: boolean;
}
```

### BulkPostDto
```typescript
export class BulkPostDto {
  @IsArray()
  @IsString({ each: true })
  loadIds: string[];

  @IsArray()
  @IsString({ each: true })
  accountIds: string[];

  @IsOptional()
  @IsString()
  rateType?: string;
}
```

### CapacitySearchDto
```typescript
export class CapacitySearchDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsInt()
  originRadiusMiles?: number;

  @IsOptional()
  @IsString()
  destinationCity?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  availableDateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  availableDateTo?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentTypes?: string[];

  @IsOptional()
  @IsString()
  relatedLoadId?: string;
}
```

### CreatePostingRuleDto
```typescript
export class CreatePostingRuleDto {
  @IsString()
  ruleName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  conditions: PostingRuleConditions;

  @IsBoolean()
  autoPost: boolean;

  @IsArray()
  @IsString({ each: true })
  postAccounts: string[];

  @IsOptional()
  @IsInt()
  postDelayMinutes?: number;

  @IsOptional()
  @IsString()
  rateAdjustmentType?: string;

  @IsOptional()
  @IsNumber()
  rateAdjustmentValue?: number;

  @IsOptional()
  @IsInt()
  priority?: number;
}

interface PostingRuleConditions {
  originStates?: string[];
  destinationStates?: string[];
  equipmentTypes?: string[];
  customers?: string[];
  minMiles?: number;
  maxMiles?: number;
  loadTypes?: string[];
}
```

---

## 📋 Business Rules

### Auto-Post Logic
```typescript
async function evaluateAutoPost(load: Load): Promise<void> {
  // Check if load is eligible
  if (load.status !== 'AVAILABLE') return;
  if (load.carrierId) return; // Already assigned
  
  // Get matching rules
  const rules = await getMatchingRules(load);
  
  for (const rule of rules) {
    if (!rule.autoPost) continue;
    
    // Schedule post with delay
    await schedulePost({
      loadId: load.id,
      accountIds: rule.postAccounts,
      delayMinutes: rule.postDelayMinutes,
      rateAdjustment: {
        type: rule.rateAdjustmentType,
        value: rule.rateAdjustmentValue
      }
    });
  }
}
```

### Post Refresh Schedule
```typescript
const refreshStrategy = {
  peak: {
    hours: [8, 9, 10, 11, 14, 15, 16],
    intervalMinutes: 60
  },
  offPeak: {
    intervalMinutes: 240
  }
};
```

### Lead Matching
```typescript
async function matchLeadToCarrier(lead: PostLead): Promise<Carrier | null> {
  // Try MC number match
  if (lead.mcNumber) {
    const carrier = await findCarrierByMc(lead.mcNumber);
    if (carrier) return carrier;
  }
  
  // Try DOT number match
  if (lead.dotNumber) {
    const carrier = await findCarrierByDot(lead.dotNumber);
    if (carrier) return carrier;
  }
  
  // Try phone match
  if (lead.contactPhone) {
    const carrier = await findCarrierByPhone(lead.contactPhone);
    if (carrier) return carrier;
  }
  
  return null;
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `loadboard.post.created` | Post created | `{ postId, loadId }` |
| `loadboard.post.refreshed` | Post refreshed | `{ postId }` |
| `loadboard.post.removed` | Post removed | `{ postId, loadId }` |
| `loadboard.post.failed` | Post failed | `{ postId, error }` |
| `loadboard.lead.received` | Lead received | `{ leadId, loadId }` |
| `loadboard.lead.qualified` | Lead qualified | `{ leadId, carrierId }` |
| `loadboard.lead.converted` | Converted to carrier | `{ leadId, carrierId }` |
| `loadboard.capacity.found` | Search completed | `{ searchId, count }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `load.created` | TMS Core | Evaluate auto-post rules |
| `load.carrier_assigned` | TMS Core | Remove posts |
| `load.cancelled` | TMS Core | Remove posts |
| `scheduler.hourly` | Scheduler | Refresh posts |

---

## 🧪 Integration Test Requirements

```typescript
describe('Load Board External API', () => {
  describe('Accounts', () => {
    it('should create board account');
    it('should test connection');
    it('should encrypt credentials');
  });

  describe('Posting', () => {
    it('should post load to board');
    it('should refresh post');
    it('should remove post on book');
    it('should bulk post multiple loads');
  });

  describe('Capacity Search', () => {
    it('should search for available trucks');
    it('should match to existing carriers');
    it('should log contact attempts');
  });

  describe('Leads', () => {
    it('should capture lead from board');
    it('should match lead to carrier');
    it('should qualify lead');
    it('should convert lead to carrier');
  });

  describe('Rules', () => {
    it('should create posting rule');
    it('should evaluate rule conditions');
    it('should apply rate adjustments');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/load-board/
├── load-board.module.ts
├── accounts/
│   ├── accounts.controller.ts
│   ├── accounts.service.ts
│   └── dto/
├── posting/
│   ├── posting.controller.ts
│   ├── posting.service.ts
│   ├── auto-post.service.ts
│   └── dto/
├── capacity/
│   ├── capacity.controller.ts
│   ├── capacity.service.ts
│   └── dto/
├── leads/
│   ├── leads.controller.ts
│   ├── leads.service.ts
│   └── dto/
├── rules/
│   ├── rules.controller.ts
│   ├── rules.service.ts
│   └── rules.engine.ts
├── analytics/
│   └── analytics.controller.ts
└── providers/
    ├── provider.interface.ts
    ├── dat.provider.ts
    ├── truckstop.provider.ts
    └── loadboard123.provider.ts
```

---

## ✅ Completion Checklist

- [ ] All 35 endpoints implemented
- [ ] Account management with encryption
- [ ] Multi-board posting working
- [ ] Auto-post rules engine
- [ ] Capacity search integration
- [ ] Lead capture and matching
- [ ] Lead conversion to carrier
- [ ] Post refresh automation
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>25</td>
    <td>Load Board External</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>35/35</td>
    <td>6/6</td>
    <td>100%</td>
    <td>Accounts, Posting, Capacity, Leads, Rules, Analytics</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[13-rate-intelligence-api.md](./13-rate-intelligence-api.md)** - Implement Rate Intelligence API
