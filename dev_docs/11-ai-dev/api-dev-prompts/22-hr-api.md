# 22 - HR Service API Implementation

> **Service:** HR  
> **Priority:** P2 - Medium  
> **Endpoints:** 35  
> **Dependencies:** Auth ✅, Documents ✅, Communication ✅  
> **Doc Reference:** [24-service-hr.md](../../02-services/24-service-hr.md)

---

## 📋 Overview

Manage employee information, organizational structure, onboarding, time tracking, payroll integration, and workforce administration. Provides HR capabilities for brokerages managing internal staff.

### Key Capabilities
- Employee profiles and employment records
- Organizational structure and hierarchy
- Position and department management
- Time and attendance tracking
- PTO and leave management
- Employment history tracking

---

## ✅ Pre-Implementation Checklist

- [ ] Auth service operational
- [ ] Documents service for employee files
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### Employee Model
```prisma
model Employee {
  id                String            @id @default(cuid())
  tenantId          String
  
  userId            String?           // Link to system user
  employeeNumber    String
  
  // Personal Info
  firstName         String
  lastName          String
  middleName        String?
  preferredName     String?
  email             String
  personalEmail     String?
  phone             String?
  mobile            String?
  
  // Demographics
  dateOfBirth       DateTime?         @db.Date
  gender            String?
  ethnicity         String?
  
  // Address
  addressLine1      String?
  addressLine2      String?
  city              String?
  state             String?
  zip               String?
  country           String            @default("USA")
  
  // Employment
  employmentType    String            // FULL_TIME, PART_TIME, CONTRACT, TEMP
  employmentStatus  String            @default("ACTIVE")
  hireDate          DateTime          @db.Date
  startDate         DateTime?         @db.Date
  terminationDate   DateTime?         @db.Date
  terminationReason String?
  terminationType   String?
  
  // Position
  positionId        String?
  departmentId      String?
  managerId         String?
  locationId        String?
  
  // Compensation
  payType           String?           // SALARY, HOURLY
  payRate           Decimal?          @db.Decimal(12, 2)
  payFrequency      String?
  
  // Tax
  ssnEncrypted      String?
  w4Status          String?
  w4Allowances      Int?
  
  // Banking
  directDeposit     Boolean           @default(false)
  bankRouting       String?
  bankAccount       String?
  bankAccountType   String?
  
  // Emergency Contact
  emergencyContactName     String?
  emergencyContactPhone    String?
  emergencyContactRelation String?
  
  // Profile
  photoUrl          String?
  bio               String?           @db.Text
  
  // Onboarding
  onboardingStatus     String?
  onboardingCompletedAt DateTime?
  
  // Migration
  externalId        String?
  sourceSystem      String?
  customFields      Json              @default("{}")
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  deletedAt         DateTime?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  user              User?             @relation(fields: [userId], references: [id])
  position          Position?         @relation(fields: [positionId], references: [id])
  department        Department?       @relation(fields: [departmentId], references: [id])
  manager           Employee?         @relation("ManagerReports", fields: [managerId], references: [id])
  location          Location?         @relation(fields: [locationId], references: [id])
  
  directReports     Employee[]        @relation("ManagerReports")
  employmentHistory EmploymentHistory[]
  timeOffBalances   TimeOffBalance[]
  timeOffRequests   TimeOffRequest[]
  timeEntries       TimeEntry[]
  
  @@unique([tenantId, employeeNumber])
  @@index([tenantId])
  @@index([employmentStatus])
  @@index([departmentId])
  @@index([managerId])
}
```

### Department Model
```prisma
model Department {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  code              String?
  description       String?           @db.Text
  
  parentDepartmentId String?
  departmentHeadId  String?
  
  costCenter        String?
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  parentDepartment  Department?       @relation("DepartmentHierarchy", fields: [parentDepartmentId], references: [id])
  childDepartments  Department[]      @relation("DepartmentHierarchy")
  
  employees         Employee[]
  positions         Position[]
  
  @@index([tenantId])
  @@index([parentDepartmentId])
}
```

### Position Model
```prisma
model Position {
  id                String            @id @default(cuid())
  tenantId          String
  
  title             String
  code              String?
  description       String?           @db.Text
  
  departmentId      String?
  
  jobFamily         String?
  jobLevel          String?           // ENTRY, MID, SENIOR, MANAGER, DIRECTOR
  isManager         Boolean           @default(false)
  
  payGrade          String?
  minSalary         Decimal?          @db.Decimal(12, 2)
  maxSalary         Decimal?          @db.Decimal(12, 2)
  
  requirements      String?           @db.Text
  qualifications    String?           @db.Text
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  department        Department?       @relation(fields: [departmentId], references: [id])
  employees         Employee[]
  
  @@index([tenantId])
  @@index([departmentId])
}
```

### Location Model
```prisma
model Location {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  code              String?
  locationType      String?           // HEADQUARTERS, BRANCH, REMOTE
  
  addressLine1      String?
  addressLine2      String?
  city              String?
  state             String?
  zip               String?
  country           String            @default("USA")
  
  phone             String?
  timezone          String            @default("America/Chicago")
  
  isActive          Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  employees         Employee[]
  
  @@index([tenantId])
}
```

### TimeOffBalance Model
```prisma
model TimeOffBalance {
  id                String            @id @default(cuid())
  tenantId          String
  employeeId        String
  
  timeOffType       String            // PTO, SICK, VACATION, PERSONAL
  year              Int
  
  accruedHours      Decimal           @default(0) @db.Decimal(6, 2)
  usedHours         Decimal           @default(0) @db.Decimal(6, 2)
  pendingHours      Decimal           @default(0) @db.Decimal(6, 2)
  availableHours    Decimal           @default(0) @db.Decimal(6, 2)
  carryoverHours    Decimal           @default(0) @db.Decimal(6, 2)
  maxCarryover      Decimal?          @db.Decimal(6, 2)
  
  accrualRate       Decimal?          @db.Decimal(6, 4)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  employee          Employee          @relation(fields: [employeeId], references: [id])
  
  @@unique([employeeId, timeOffType, year])
  @@index([employeeId])
}
```

### TimeOffRequest Model
```prisma
model TimeOffRequest {
  id                String            @id @default(cuid())
  tenantId          String
  employeeId        String
  
  timeOffType       String
  
  startDate         DateTime          @db.Date
  endDate           DateTime          @db.Date
  totalHours        Decimal           @db.Decimal(6, 2)
  
  partialDayStart   Boolean           @default(false)
  startTime         String?
  partialDayEnd     Boolean           @default(false)
  endTime           String?
  
  status            String            @default("PENDING")  // PENDING, APPROVED, DENIED, CANCELLED
  
  employeeNotes     String?           @db.Text
  managerNotes      String?           @db.Text
  
  approvedBy        String?
  approvedAt        DateTime?
  deniedReason      String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  employee          Employee          @relation(fields: [employeeId], references: [id])
  
  @@index([employeeId])
  @@index([status])
  @@index([startDate, endDate])
}
```

### TimeEntry Model
```prisma
model TimeEntry {
  id                String            @id @default(cuid())
  tenantId          String
  employeeId        String
  
  workDate          DateTime          @db.Date
  
  clockIn           DateTime?
  clockOut          DateTime?
  
  regularHours      Decimal?          @db.Decimal(5, 2)
  overtimeHours     Decimal?          @db.Decimal(5, 2)
  breakHours        Decimal?          @db.Decimal(5, 2)
  totalHours        Decimal?          @db.Decimal(5, 2)
  
  entryType         String            @default("WORK")  // WORK, HOLIDAY, PTO, SICK
  
  notes             String?           @db.Text
  
  status            String            @default("PENDING")  // PENDING, APPROVED, REJECTED
  
  approvedBy        String?
  approvedAt        DateTime?
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  employee          Employee          @relation(fields: [employeeId], references: [id])
  
  @@index([employeeId, workDate])
  @@index([status])
}
```

### EmploymentHistory Model
```prisma
model EmploymentHistory {
  id                String            @id @default(cuid())
  tenantId          String
  employeeId        String
  
  changeType        String            // HIRE, PROMOTION, TRANSFER, etc.
  effectiveDate     DateTime          @db.Date
  
  previousPositionId   String?
  previousDepartmentId String?
  previousManagerId    String?
  previousPayRate      Decimal?        @db.Decimal(12, 2)
  previousTitle        String?
  
  newPositionId     String?
  newDepartmentId   String?
  newManagerId      String?
  newPayRate        Decimal?          @db.Decimal(12, 2)
  newTitle          String?
  
  reason            String?           @db.Text
  notes             String?           @db.Text
  
  approvedBy        String?
  approvedAt        DateTime?
  
  createdBy         String?
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  employee          Employee          @relation(fields: [employeeId], references: [id])
  
  @@index([employeeId])
  @@index([effectiveDate])
}
```

---

## 🛠️ API Endpoints

### Employees (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hr/employees` | List employees |
| POST | `/api/v1/hr/employees` | Create employee |
| GET | `/api/v1/hr/employees/:id` | Get employee |
| PUT | `/api/v1/hr/employees/:id` | Update employee |
| DELETE | `/api/v1/hr/employees/:id` | Delete employee |
| GET | `/api/v1/hr/employees/:id/org-chart` | Org chart view |
| POST | `/api/v1/hr/employees/:id/terminate` | Terminate |
| GET | `/api/v1/hr/employees/:id/history` | Employment history |

### Departments (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hr/departments` | List departments |
| POST | `/api/v1/hr/departments` | Create department |
| GET | `/api/v1/hr/departments/:id` | Get department |
| PUT | `/api/v1/hr/departments/:id` | Update department |
| DELETE | `/api/v1/hr/departments/:id` | Delete department |

### Positions (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hr/positions` | List positions |
| POST | `/api/v1/hr/positions` | Create position |
| GET | `/api/v1/hr/positions/:id` | Get position |
| PUT | `/api/v1/hr/positions/:id` | Update position |
| DELETE | `/api/v1/hr/positions/:id` | Delete position |

### Locations (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hr/locations` | List locations |
| POST | `/api/v1/hr/locations` | Create location |
| GET | `/api/v1/hr/locations/:id` | Get location |
| PUT | `/api/v1/hr/locations/:id` | Update location |
| DELETE | `/api/v1/hr/locations/:id` | Delete location |

### Time Off (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hr/time-off/balances` | Get balances |
| GET | `/api/v1/hr/time-off/requests` | List requests |
| POST | `/api/v1/hr/time-off/requests` | Create request |
| GET | `/api/v1/hr/time-off/requests/:id` | Get request |
| PUT | `/api/v1/hr/time-off/requests/:id` | Update request |
| POST | `/api/v1/hr/time-off/requests/:id/approve` | Approve |
| POST | `/api/v1/hr/time-off/requests/:id/deny` | Deny |

### Time Tracking (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hr/time-entries` | List entries |
| POST | `/api/v1/hr/time-entries` | Create entry |
| PUT | `/api/v1/hr/time-entries/:id` | Update entry |
| POST | `/api/v1/hr/time-entries/:id/approve` | Approve |
| GET | `/api/v1/hr/time-entries/summary` | Time summary |

---

## 📝 DTO Specifications

### CreateEmployeeDto
```typescript
export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMP'])
  employmentType: string;

  @IsDateString()
  hireDate: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsIn(['SALARY', 'HOURLY'])
  payType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  payRate?: number;
}
```

### TerminateEmployeeDto
```typescript
export class TerminateEmployeeDto {
  @IsDateString()
  terminationDate: string;

  @IsIn(['VOLUNTARY', 'INVOLUNTARY', 'LAYOFF', 'RETIREMENT'])
  terminationType: string;

  @IsOptional()
  @IsString()
  terminationReason?: string;
}
```

### CreateTimeOffRequestDto
```typescript
export class CreateTimeOffRequestDto {
  @IsIn(['PTO', 'SICK', 'VACATION', 'PERSONAL', 'FLOATING_HOLIDAY'])
  timeOffType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0.5)
  totalHours: number;

  @IsOptional()
  @IsBoolean()
  partialDayStart?: boolean;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsBoolean()
  partialDayEnd?: boolean;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  employeeNotes?: string;
}
```

### CreateTimeEntryDto
```typescript
export class CreateTimeEntryDto {
  @IsDateString()
  workDate: string;

  @IsOptional()
  @IsDateString()
  clockIn?: string;

  @IsOptional()
  @IsDateString()
  clockOut?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  regularHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimeHours?: number;

  @IsOptional()
  @IsIn(['WORK', 'HOLIDAY', 'PTO', 'SICK'])
  entryType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

## 📋 Business Rules

### Employee Number Generation
```typescript
class EmployeeService {
  async generateEmployeeNumber(tenantId: string): Promise<string> {
    const sequence = await this.sequenceService.getNext(tenantId, 'EMPLOYEE');
    return `EMP-${sequence.toString().padStart(5, '0')}`;
  }
}
```

### Time Off Balance Calculation
```typescript
class TimeOffService {
  async calculateBalance(employeeId: string, type: string, year: number) {
    const balance = await this.getBalance(employeeId, type, year);
    
    const pendingRequests = await this.getPendingRequests(employeeId, type, year);
    const pendingHours = pendingRequests.reduce((sum, r) => sum + r.totalHours, 0);
    
    return {
      accrued: balance.accruedHours + balance.carryoverHours,
      used: balance.usedHours,
      pending: pendingHours,
      available: balance.accruedHours + balance.carryoverHours 
                 - balance.usedHours - pendingHours
    };
  }
}
```

### Manager Hierarchy Validation
```typescript
class EmployeeService {
  async validateManager(employeeId: string, managerId: string): Promise<boolean> {
    if (employeeId === managerId) {
      throw new BadRequestException('Employee cannot be their own manager');
    }
    
    // Check for circular references
    let currentManager = managerId;
    const visited = new Set([employeeId]);
    
    while (currentManager) {
      if (visited.has(currentManager)) {
        throw new BadRequestException('Circular management hierarchy detected');
      }
      visited.add(currentManager);
      
      const manager = await this.findById(currentManager);
      currentManager = manager?.managerId;
    }
    
    return true;
  }
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `employee.created` | New hire | `{ employeeId }` |
| `employee.updated` | Profile updated | `{ employeeId, changes }` |
| `employee.terminated` | Termination | `{ employeeId, date }` |
| `timeoff.requested` | Request submitted | `{ requestId }` |
| `timeoff.approved` | Request approved | `{ requestId }` |
| `timeoff.denied` | Request denied | `{ requestId }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `user.created` | Auth | Link to employee |

---

## 🧪 Integration Test Requirements

```typescript
describe('HR Service API', () => {
  describe('Employees', () => {
    it('should create employee');
    it('should update employee');
    it('should terminate employee');
    it('should get org chart');
  });

  describe('Departments', () => {
    it('should create department');
    it('should create child department');
    it('should list hierarchy');
  });

  describe('Time Off', () => {
    it('should calculate balance');
    it('should create request');
    it('should approve request');
    it('should update balance on approval');
  });

  describe('Time Tracking', () => {
    it('should create time entry');
    it('should calculate total hours');
    it('should approve time entry');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/hr/
├── hr.module.ts
├── employees/
│   ├── employees.controller.ts
│   └── employees.service.ts
├── departments/
│   ├── departments.controller.ts
│   └── departments.service.ts
├── positions/
│   ├── positions.controller.ts
│   └── positions.service.ts
├── locations/
│   ├── locations.controller.ts
│   └── locations.service.ts
├── time-off/
│   ├── time-off.controller.ts
│   ├── time-off.service.ts
│   └── balance.service.ts
└── time-tracking/
    ├── time-entries.controller.ts
    └── time-entries.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 35 endpoints implemented
- [ ] Employee CRUD with full profile
- [ ] Department hierarchy
- [ ] Position management
- [ ] Location management
- [ ] Time off balances and requests
- [ ] Time entry tracking
- [ ] Org chart generation
- [ ] Employment history
- [ ] All integration tests passing

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>35</td>
    <td>HR</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>35/35</td>
    <td>4/4</td>
    <td>100%</td>
    <td>Employees, Departments, Time Off, Time Tracking</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[23-help-desk-api.md](./23-help-desk-api.md)** - Implement Help Desk Service API
