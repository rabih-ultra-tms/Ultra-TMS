# HR Domain Models

> Auto-generated from `apps/api/prisma/schema.prisma` — 2026-03-07

## Models in this Domain

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Employee | Employee records | User, Department, Position |
| Department | Organizational departments | Employee, Self-referential |
| Position | Job positions | Employee, EmploymentHistory |
| EmploymentHistory | Position/department changes | Employee, Position, Department |
| TimeEntry | Time tracking | Employee |
| TimeOffRequest | PTO/leave requests | Employee |
| TimeOffBalance | Leave balance tracking | Employee |
| OnboardingChecklist | New hire checklists | OnboardingTask |
| OnboardingTask | Individual onboarding tasks | Employee, OnboardingChecklist |

## Employee

Core employee record linked to User account.

| Field | Type | Notes |
|-------|------|-------|
| userId | String? | @unique — FK to User (optional) |
| employeeNumber | String | @unique, VarChar(50) |
| firstName/lastName | String | VarChar(100) |
| email | String | VarChar(255) |
| phone | String? | VarChar(20) |
| employmentType | EmploymentType enum | FULL_TIME, PART_TIME, CONTRACT, INTERN |
| employmentStatus | EmploymentStatus | @default(ACTIVE) — ACTIVE, ON_LEAVE, TERMINATED |
| departmentId | String? | FK to Department |
| positionId | String? | FK to Position |
| managerId | String? | Self-referential FK |
| locationId | String? | FK to Location |
| hireDate | DateTime | Date |
| terminationDate | DateTime? | |
| annualSalary | Decimal? | Decimal(12,2) |
| hourlyRate | Decimal? | Decimal(10,2) |
| ptoBalance | Decimal | @default(0), Decimal(6,2) — hours |
| sickBalance | Decimal | @default(0), Decimal(6,2) |

**Self-relation:** manager / directReports
**Relations:** EmploymentHistory[], TimeEntry[], TimeOffRequest[], TimeOffBalance[], OnboardingTask[]

## Department

| Field | Type | Notes |
|-------|------|-------|
| code | String | @unique, VarChar(50) |
| name | String | VarChar(255) |
| parentDepartmentId | String? | Self-referential |
| status | String | @default("ACTIVE") |

**Self-relation:** parent / children

## Position

| Field | Type | Notes |
|-------|------|-------|
| title | String | VarChar(255) |
| code | String | VarChar(50) |
| level | String? | VarChar(50) — ENTRY, MID, SENIOR, DIRECTOR |
| minSalary/maxSalary | Decimal? | Salary range |
| isActive | Boolean | @default(true) |

## TimeEntry

| Field | Type | Notes |
|-------|------|-------|
| employeeId | String | FK to Employee |
| date | DateTime | Date |
| startTime/endTime | DateTime? | |
| hoursWorked | Decimal | Decimal(5,2) |
| entryType | String | VarChar(50) — REGULAR, OVERTIME, HOLIDAY |
| status | String | @default("DRAFT") — DRAFT, SUBMITTED, APPROVED |
| approvedBy/approvedAt | | |

## TimeOffRequest

| Field | Type | Notes |
|-------|------|-------|
| employeeId | String | FK to Employee |
| requestType | String | VarChar(50) — PTO, SICK, PERSONAL, BEREAVEMENT |
| startDate/endDate | DateTime | Date range |
| totalHours | Decimal | Decimal(6,2) |
| reason | String? | |
| status | String | @default("PENDING") — PENDING, APPROVED, DENIED, CANCELLED |
| approvedBy/approvedAt | | |
| denialReason | String? | |

## OnboardingChecklist / OnboardingTask

**OnboardingChecklist:** name, departmentId?, items (Json), dueWithinDays
**OnboardingTask:** checklistId, employeeId, taskName, description, dueDate, status, completedAt, assignedToId
