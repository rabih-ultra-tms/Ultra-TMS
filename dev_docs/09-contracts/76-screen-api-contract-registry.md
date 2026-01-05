# 72 - Screen-API Contract Registry

**Complete mapping of all 324 screens to their API endpoints and database tables**

This is the KEY DOCUMENT for preventing screen-API mismatches. Every screen must have its contracts defined before implementation.

---

## âš ï¸ CLAUDE CODE: HOW TO USE THIS DOCUMENT

1. **Before building ANY screen**: Find it in this registry and verify ALL API endpoints exist
2. **Before building ANY API**: Verify the database tables exist in Prisma schema
3. **After completing work**: Update the status checkboxes
4. **If contract is missing**: Define it FIRST before coding

---

## Status Legend

| Symbol | Meaning     |
| ------ | ----------- |
| â¬œ    | Not Started |
| ðŸŸ¡   | In Progress |
| âœ…    | Complete    |
| ðŸ”´   | Blocked     |

### Status Columns

- **DB**: Database schema exists in Prisma
- **API**: API endpoint implemented and tested
- **FE**: Frontend screen implemented
- **INT**: Integration tested (API + Frontend working together)
- **VER**: Verified (manual testing complete, all buttons/links work)

---

## Quick Stats

| Category   | Services | Screens | API Endpoints (Est.) |
| ---------- | -------- | ------- | -------------------- |
| Core       | 7        | 78      | ~156                 |
| Operations | 7        | 68      | ~136                 |
| Platform   | 8        | 62      | ~124                 |
| Support    | 2        | 16      | ~32                  |
| Extended   | 9        | 72      | ~144                 |
| Admin      | 1        | 28      | ~56                  |
| **Total**  | **34**   | **324** | **~648**             |

---

# CORE SERVICES (78 Screens)

---

## 01 - Auth & Admin Service (12 Screens)

### Database Tables Required

```prisma
- User
- Role
- Permission
- UserRole
- Session
- MfaConfig
- SecurityLog
- Tenant
- TenantSettings
```

---

### Screen 01.01: Login

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/login`  
**Access**: Public

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/auth/login` | `{ email, password }` | `{ data: { accessToken, refreshToken, user } }` |
| POST | `/api/v1/auth/mfa/verify` | `{ code, sessionId }` | `{ data: { accessToken, refreshToken, user } }` |

**UI Elements**:

- [ ] Email input field
- [ ] Password input field
- [ ] "Login" button â†’ POST /auth/login
- [ ] "Forgot Password" link â†’ /forgot-password
- [ ] "Register" link â†’ /register
- [ ] MFA code input (conditional)
- [ ] Loading state during submission
- [ ] Error message display

---

### Screen 01.02: Register

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/register`  
**Access**: Public

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/auth/register` | `{ email, password, firstName, lastName, companyName }` | `{ data: { user, tenant } }` |
| POST | `/api/v1/auth/verify-email` | `{ token }` | `{ data: { verified: true } }` |

**UI Elements**:

- [ ] Email input
- [ ] Password input
- [ ] Confirm password input
- [ ] First name input
- [ ] Last name input
- [ ] Company name input
- [ ] "Register" button â†’ POST /auth/register
- [ ] "Already have account?" link â†’ /login
- [ ] Terms checkbox
- [ ] Loading state
- [ ] Validation errors

---

### Screen 01.03: Forgot Password

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/forgot-password`  
**Access**: Public

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/auth/forgot-password` | `{ email }` | `{ data: { sent: true } }` |

**UI Elements**:

- [ ] Email input
- [ ] "Send Reset Link" button â†’ POST /auth/forgot-password
- [ ] "Back to Login" link â†’ /login
- [ ] Success message
- [ ] Loading state

---

### Screen 01.04: Reset Password

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/reset-password?token=xxx`  
**Access**: Public

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/auth/reset-password` | `{ token, password }` | `{ data: { success: true } }` |
| GET | `/api/v1/auth/verify-reset-token` | `?token=xxx` | `{ data: { valid: true } }` |

**UI Elements**:

- [ ] New password input
- [ ] Confirm password input
- [ ] "Reset Password" button â†’ POST /auth/reset-password
- [ ] Loading state
- [ ] Invalid/expired token message
- [ ] Success â†’ redirect to /login

---

### Screen 01.05: MFA Setup

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/settings/mfa`  
**Access**: All authenticated users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/auth/mfa/setup` | - | `{ data: { qrCode, secret } }` |
| POST | `/api/v1/auth/mfa/enable` | `{ code }` | `{ data: { enabled: true, backupCodes } }` |
| POST | `/api/v1/auth/mfa/disable` | `{ password }` | `{ data: { disabled: true } }` |
| GET | `/api/v1/auth/mfa/backup-codes` | - | `{ data: { codes } }` |

**UI Elements**:

- [ ] QR code display
- [ ] Manual entry code
- [ ] Verification code input
- [ ] "Enable MFA" button â†’ POST /auth/mfa/enable
- [ ] "Disable MFA" button â†’ POST /auth/mfa/disable
- [ ] Backup codes display
- [ ] "Generate New Codes" button

---

### Screen 01.06: Profile Settings

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/{portal}/profile`  
**Access**: All authenticated users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/users/me` | - | `{ data: User }` |
| PUT | `/api/v1/users/me` | `{ firstName, lastName, phone, ... }` | `{ data: User }` |
| PUT | `/api/v1/users/me/password` | `{ currentPassword, newPassword }` | `{ data: { success: true } }` |
| POST | `/api/v1/users/me/avatar` | FormData(file) | `{ data: { avatarUrl } }` |

**UI Elements**:

- [ ] Profile form (name, phone, etc.)
- [ ] "Save Changes" button â†’ PUT /users/me
- [ ] Password change section
- [ ] "Change Password" button â†’ PUT /users/me/password
- [ ] Avatar upload
- [ ] Loading states
- [ ] Success/error toasts

---

### Screen 01.07: User Management

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/users`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/users` | `?page, limit, search, status, role` | `{ data: User[], pagination }` |
| POST | `/api/v1/users` | CreateUserDto | `{ data: User }` |
| DELETE | `/api/v1/users/:id` | - | `{ data: { deleted: true } }` |
| POST | `/api/v1/users/:id/activate` | - | `{ data: User }` |
| POST | `/api/v1/users/:id/deactivate` | - | `{ data: User }` |
| POST | `/api/v1/users/:id/resend-invite` | - | `{ data: { sent: true } }` |

**UI Elements**:

- [ ] Data table with users
- [ ] Search input
- [ ] Status filter dropdown
- [ ] Role filter dropdown
- [ ] "Add User" button â†’ /admin/users/new OR modal
- [ ] Row actions dropdown:
  - [ ] "View" â†’ /admin/users/:id
  - [ ] "Edit" â†’ /admin/users/:id/edit
  - [ ] "Activate/Deactivate" â†’ POST /users/:id/activate
  - [ ] "Resend Invite" â†’ POST /users/:id/resend-invite
  - [ ] "Delete" â†’ DELETE /users/:id (with confirmation)
- [ ] Pagination controls
- [ ] Loading state
- [ ] Empty state

---

### Screen 01.08: User Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/users/:id`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/users/:id` | - | `{ data: UserWithRelations }` |
| PUT | `/api/v1/users/:id` | UpdateUserDto | `{ data: User }` |
| PUT | `/api/v1/users/:id/roles` | `{ roleIds }` | `{ data: User }` |
| POST | `/api/v1/users/:id/reset-password` | - | `{ data: { sent: true } }` |

**UI Elements**:

- [ ] Back button â†’ /admin/users
- [ ] User info display
- [ ] "Edit" button â†’ /admin/users/:id/edit
- [ ] Role assignment section
- [ ] "Reset Password" button â†’ POST /users/:id/reset-password
- [ ] Activity log section
- [ ] Delete button with confirmation

---

### Screen 01.09: Role Management

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/roles`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/roles` | - | `{ data: Role[] }` |
| POST | `/api/v1/roles` | CreateRoleDto | `{ data: Role }` |
| DELETE | `/api/v1/roles/:id` | - | `{ data: { deleted: true } }` |
| GET | `/api/v1/permissions` | - | `{ data: Permission[] }` |

**UI Elements**:

- [ ] Roles list/table
- [ ] "Add Role" button â†’ modal or /admin/roles/new
- [ ] Row actions:
  - [ ] "Edit" â†’ /admin/roles/:id/edit
  - [ ] "Delete" â†’ DELETE /roles/:id
- [ ] User count per role display
- [ ] Loading/empty states

---

### Screen 01.10: Role Editor

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/roles/:id/edit` or `/admin/roles/new`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/roles/:id` | - | `{ data: RoleWithPermissions }` |
| PUT | `/api/v1/roles/:id` | UpdateRoleDto | `{ data: Role }` |
| POST | `/api/v1/roles` | CreateRoleDto | `{ data: Role }` |
| GET | `/api/v1/permissions` | - | `{ data: Permission[] }` |

**UI Elements**:

- [ ] Role name input
- [ ] Description input
- [ ] Permissions checklist (grouped by category)
- [ ] "Save" button â†’ PUT/POST
- [ ] "Cancel" button â†’ /admin/roles
- [ ] Loading state
- [ ] Validation errors

---

### Screen 01.11: Tenant Settings

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/settings`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/tenants/current` | - | `{ data: TenantWithSettings }` |
| PUT | `/api/v1/tenants/current` | UpdateTenantDto | `{ data: Tenant }` |
| PUT | `/api/v1/tenants/current/settings` | TenantSettingsDto | `{ data: TenantSettings }` |
| POST | `/api/v1/tenants/current/logo` | FormData | `{ data: { logoUrl } }` |

**UI Elements**:

- [ ] Company name input
- [ ] Logo upload
- [ ] Address fields
- [ ] Contact info fields
- [ ] Business settings (timezone, currency, etc.)
- [ ] "Save" button â†’ PUT /tenants/current
- [ ] Loading state
- [ ] Success toast

---

### Screen 01.12: Security Log

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/security-log`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/security-logs` | `?page, limit, userId, action, dateFrom, dateTo` | `{ data: SecurityLog[], pagination }` |
| GET | `/api/v1/sessions` | `?userId` | `{ data: Session[] }` |
| DELETE | `/api/v1/sessions/:id` | - | `{ data: { terminated: true } }` |

**UI Elements**:

- [ ] Security events table
- [ ] User filter dropdown
- [ ] Action type filter
- [ ] Date range picker
- [ ] Active sessions section
- [ ] "Terminate Session" button per session
- [ ] Pagination
- [ ] Export button

---

## 02 - CRM Service (12 Screens)

### Database Tables Required

```prisma
- Lead
- Company
- Contact
- Opportunity
- Activity
- Territory
- Pipeline
- PipelineStage
```

---

### Screen 02.01: CRM Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/dashboard`  
**Access**: Sales, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/crm/dashboard` | `?dateRange` | `{ data: { leads, pipeline, activities, metrics } }` |
| GET | `/api/v1/crm/pipeline/summary` | - | `{ data: { stages, totals } }` |

**UI Elements**:

- [ ] Lead funnel chart
- [ ] Pipeline value cards
- [ ] Recent activities list
- [ ] Upcoming tasks
- [ ] Win/loss metrics
- [ ] Date range selector
- [ ] Quick action buttons

---

### Screen 02.02: Leads List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/leads`  
**Access**: Sales

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/leads` | `?page, limit, search, status, source, assignedTo` | `{ data: Lead[], pagination }` |
| POST | `/api/v1/leads` | CreateLeadDto | `{ data: Lead }` |
| DELETE | `/api/v1/leads/:id` | - | `{ data: { deleted: true } }` |
| POST | `/api/v1/leads/:id/convert` | - | `{ data: { company, contact, opportunity } }` |

**UI Elements**:

- [ ] Data table
- [ ] Search input
- [ ] Status filter
- [ ] Source filter
- [ ] Assigned to filter
- [ ] "Add Lead" button â†’ modal or /sales/leads/new
- [ ] Row actions:
  - [ ] "View" â†’ /sales/leads/:id
  - [ ] "Edit" â†’ /sales/leads/:id/edit
  - [ ] "Convert to Customer" â†’ POST /leads/:id/convert
  - [ ] "Delete" â†’ DELETE /leads/:id
- [ ] Bulk actions
- [ ] Pagination
- [ ] Loading/empty states

---

### Screen 02.03: Lead Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/leads/:id`  
**Access**: Sales

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/leads/:id` | - | `{ data: LeadWithActivities }` |
| PUT | `/api/v1/leads/:id` | UpdateLeadDto | `{ data: Lead }` |
| GET | `/api/v1/leads/:id/activities` | - | `{ data: Activity[] }` |
| POST | `/api/v1/leads/:id/activities` | CreateActivityDto | `{ data: Activity }` |

**UI Elements**:

- [ ] Back button â†’ /sales/leads
- [ ] Lead info card
- [ ] "Edit" button â†’ /sales/leads/:id/edit
- [ ] "Convert" button â†’ POST /leads/:id/convert
- [ ] Activity timeline
- [ ] "Add Activity" button â†’ activity form
- [ ] Activity type selector (call, email, meeting, note)
- [ ] Contact info section
- [ ] Status change dropdown

---

### Screen 02.04: Companies List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/companies` or `/admin/companies`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/companies` | `?page, limit, search, type, status` | `{ data: Company[], pagination }` |
| POST | `/api/v1/companies` | CreateCompanyDto | `{ data: Company }` |
| DELETE | `/api/v1/companies/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Data table
- [ ] Search input
- [ ] Type filter (customer, prospect, partner)
- [ ] Status filter
- [ ] "Add Company" button
- [ ] Row actions:
  - [ ] "View" â†’ /sales/companies/:id
  - [ ] "Edit" â†’ /sales/companies/:id/edit
  - [ ] "Delete" â†’ DELETE /companies/:id
- [ ] Pagination
- [ ] Loading/empty states

---

### Screen 02.05: Company Detail (360Â° Customer View)

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/companies/:id`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/companies/:id` | - | `{ data: CompanyWithRelations }` |
| GET | `/api/v1/companies/:id/contacts` | - | `{ data: Contact[] }` |
| GET | `/api/v1/companies/:id/opportunities` | - | `{ data: Opportunity[] }` |
| GET | `/api/v1/companies/:id/orders` | - | `{ data: Order[] }` |
| GET | `/api/v1/companies/:id/loads` | - | `{ data: Load[] }` |
| GET | `/api/v1/companies/:id/invoices` | - | `{ data: Invoice[] }` |
| GET | `/api/v1/companies/:id/activities` | - | `{ data: Activity[] }` |

**UI Elements**:

- [ ] Company header with key metrics
- [ ] Tabs:
  - [ ] Overview
  - [ ] Contacts
  - [ ] Opportunities
  - [ ] Orders
  - [ ] Loads
  - [ ] Invoices
  - [ ] Activities
- [ ] "Edit" button
- [ ] "Add Contact" button
- [ ] "New Order" button
- [ ] Credit status display
- [ ] Document section

---

### Screen 02.06: Contacts List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/contacts`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/contacts` | `?page, limit, search, companyId, type` | `{ data: Contact[], pagination }` |
| POST | `/api/v1/contacts` | CreateContactDto | `{ data: Contact }` |
| DELETE | `/api/v1/contacts/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Data table
- [ ] Search input
- [ ] Company filter
- [ ] Type filter
- [ ] "Add Contact" button
- [ ] Row actions
- [ ] Pagination

---

### Screen 02.07: Contact Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/contacts/:id`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/contacts/:id` | - | `{ data: ContactWithRelations }` |
| PUT | `/api/v1/contacts/:id` | UpdateContactDto | `{ data: Contact }` |
| GET | `/api/v1/contacts/:id/activities` | - | `{ data: Activity[] }` |

**UI Elements**:

- [ ] Contact info card
- [ ] Company link
- [ ] Activity timeline
- [ ] "Edit" button
- [ ] "Add Activity" button
- [ ] Email/call quick actions

---

### Screen 02.08: Opportunities List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/opportunities`  
**Access**: Sales

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/opportunities` | `?page, limit, search, stage, assignedTo, companyId` | `{ data: Opportunity[], pagination }` |
| POST | `/api/v1/opportunities` | CreateOpportunityDto | `{ data: Opportunity }` |
| DELETE | `/api/v1/opportunities/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Pipeline board view toggle
- [ ] List view toggle
- [ ] Stage filter
- [ ] Assigned to filter
- [ ] "Add Opportunity" button
- [ ] Row/card actions
- [ ] Drag-and-drop (board view)
- [ ] Total pipeline value display

---

### Screen 02.09: Opportunity Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/opportunities/:id`  
**Access**: Sales

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/opportunities/:id` | - | `{ data: OpportunityWithRelations }` |
| PUT | `/api/v1/opportunities/:id` | UpdateOpportunityDto | `{ data: Opportunity }` |
| PUT | `/api/v1/opportunities/:id/stage` | `{ stageId }` | `{ data: Opportunity }` |
| POST | `/api/v1/opportunities/:id/won` | - | `{ data: Opportunity }` |
| POST | `/api/v1/opportunities/:id/lost` | `{ reason }` | `{ data: Opportunity }` |

**UI Elements**:

- [ ] Opportunity header
- [ ] Stage progress indicator
- [ ] "Move to Next Stage" button
- [ ] "Won" button
- [ ] "Lost" button
- [ ] Related quotes section
- [ ] Activity timeline
- [ ] Company/contact links

---

### Screen 02.10: Activities Calendar

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/activities`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/activities` | `?dateFrom, dateTo, type, assignedTo` | `{ data: Activity[] }` |
| POST | `/api/v1/activities` | CreateActivityDto | `{ data: Activity }` |
| PUT | `/api/v1/activities/:id` | UpdateActivityDto | `{ data: Activity }` |
| DELETE | `/api/v1/activities/:id` | - | `{ data: { deleted: true } }` |
| PUT | `/api/v1/activities/:id/complete` | - | `{ data: Activity }` |

**UI Elements**:

- [ ] Calendar view (month/week/day)
- [ ] List view toggle
- [ ] "Add Activity" button
- [ ] Activity type filter
- [ ] Click event to view/edit
- [ ] Drag to reschedule
- [ ] "Mark Complete" action

---

### Screen 02.11: Territory Management

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/territories`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/territories` | - | `{ data: Territory[] }` |
| POST | `/api/v1/territories` | CreateTerritoryDto | `{ data: Territory }` |
| PUT | `/api/v1/territories/:id` | UpdateTerritoryDto | `{ data: Territory }` |
| DELETE | `/api/v1/territories/:id` | - | `{ data: { deleted: true } }` |
| PUT | `/api/v1/territories/:id/assign` | `{ userIds }` | `{ data: Territory }` |

**UI Elements**:

- [ ] Territory list/table
- [ ] "Add Territory" button
- [ ] Map visualization (optional)
- [ ] User assignment section
- [ ] Region/state selection
- [ ] Row actions

---

### Screen 02.12: Lead Import Wizard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/leads/import`  
**Access**: Sales, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/leads/import/upload` | FormData(file) | `{ data: { uploadId, preview, columns } }` |
| POST | `/api/v1/leads/import/map` | `{ uploadId, mapping }` | `{ data: { validated, errors } }` |
| POST | `/api/v1/leads/import/execute` | `{ uploadId }` | `{ data: { imported, skipped, errors } }` |

**UI Elements**:

- [ ] Step 1: File upload (CSV/Excel)
- [ ] Step 2: Column mapping
- [ ] Step 3: Validation preview
- [ ] Step 4: Import results
- [ ] "Next" / "Back" buttons
- [ ] Progress indicator
- [ ] Error display
- [ ] Download template link

---

## 03 - Sales Service (10 Screens)

### Database Tables Required

```prisma
- Quote
- QuoteLine
- RateTable
- RateTableEntry
- Lane
- Accessorial
- ProposalTemplate
```

---

### Screen 03.01: Sales Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/dashboard`  
**Access**: Sales, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/sales/dashboard` | `?dateRange` | `{ data: { quotes, conversion, revenue, metrics } }` |

**UI Elements**:

- [ ] Quote metrics cards
- [ ] Conversion rate chart
- [ ] Revenue by period
- [ ] Top customers
- [ ] Pending quotes list
- [ ] Quick actions

---

### Screen 03.02: Quotes List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/quotes`  
**Access**: Sales

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/quotes` | `?page, limit, search, status, customerId` | `{ data: Quote[], pagination }` |
| POST | `/api/v1/quotes` | CreateQuoteDto | `{ data: Quote }` |
| DELETE | `/api/v1/quotes/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Data table
- [ ] Search
- [ ] Status filter
- [ ] Customer filter
- [ ] "New Quote" button â†’ /sales/quotes/new
- [ ] Row actions:
  - [ ] "View" â†’ /sales/quotes/:id
  - [ ] "Edit" â†’ /sales/quotes/:id/edit
  - [ ] "Duplicate" â†’ POST /quotes/:id/duplicate
  - [ ] "Delete"
- [ ] Pagination

---

### Screen 03.03: Quote Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/quotes/:id`  
**Access**: Sales

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/quotes/:id` | - | `{ data: QuoteWithLines }` |
| POST | `/api/v1/quotes/:id/send` | `{ email }` | `{ data: { sent: true } }` |
| POST | `/api/v1/quotes/:id/accept` | - | `{ data: Quote }` |
| POST | `/api/v1/quotes/:id/reject` | `{ reason }` | `{ data: Quote }` |
| POST | `/api/v1/quotes/:id/convert` | - | `{ data: { order } }` |

**UI Elements**:

- [ ] Quote header
- [ ] Customer info
- [ ] Line items table
- [ ] Total calculation
- [ ] "Edit" button
- [ ] "Send to Customer" button
- [ ] "Accept" button
- [ ] "Reject" button
- [ ] "Convert to Order" button
- [ ] Quote history timeline
- [ ] PDF preview/download

---

### Screen 03.04: Quote Builder

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/quotes/new` or `/sales/quotes/:id/edit`  
**Access**: Sales

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/quotes` | CreateQuoteDto | `{ data: Quote }` |
| PUT | `/api/v1/quotes/:id` | UpdateQuoteDto | `{ data: Quote }` |
| GET | `/api/v1/customers` | `?search` | `{ data: Customer[] }` |
| GET | `/api/v1/rate-tables/:id/lookup` | `?origin, destination, equipment` | `{ data: { rate } }` |
| POST | `/api/v1/quotes/:id/lines` | CreateQuoteLineDto | `{ data: QuoteLine }` |
| DELETE | `/api/v1/quotes/:id/lines/:lineId` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Customer selector
- [ ] Valid until date picker
- [ ] Line items section:
  - [ ] "Add Line" button
  - [ ] Origin/destination inputs
  - [ ] Equipment type selector
  - [ ] Rate lookup button
  - [ ] Manual rate override
  - [ ] Delete line button
- [ ] Accessorials section
- [ ] Notes/terms textarea
- [ ] Total display
- [ ] "Save Draft" button
- [ ] "Save & Send" button
- [ ] "Cancel" button

---

### Screen 03.05: Rate Tables

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/rate-tables`  
**Access**: Sales, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/rate-tables` | `?page, limit, search, status` | `{ data: RateTable[], pagination }` |
| POST | `/api/v1/rate-tables` | CreateRateTableDto | `{ data: RateTable }` |
| DELETE | `/api/v1/rate-tables/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Rate tables list
- [ ] "Add Rate Table" button
- [ ] Row actions
- [ ] Active/inactive toggle
- [ ] Customer assignment indicator

---

### Screen 03.06: Rate Table Editor

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/rate-tables/:id`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/rate-tables/:id` | - | `{ data: RateTableWithEntries }` |
| PUT | `/api/v1/rate-tables/:id` | UpdateRateTableDto | `{ data: RateTable }` |
| POST | `/api/v1/rate-tables/:id/entries` | CreateEntryDto | `{ data: RateTableEntry }` |
| PUT | `/api/v1/rate-tables/:id/entries/:entryId` | UpdateEntryDto | `{ data: RateTableEntry }` |
| DELETE | `/api/v1/rate-tables/:id/entries/:entryId` | - | `{ data: { deleted: true } }` |
| POST | `/api/v1/rate-tables/:id/import` | FormData | `{ data: { imported } }` |

**UI Elements**:

- [ ] Table name/description form
- [ ] Effective dates
- [ ] Rate entries grid
- [ ] "Add Entry" button
- [ ] Inline editing
- [ ] "Import from CSV" button
- [ ] "Export" button
- [ ] "Save" button

---

### Screen 03.07: Lane Pricing

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/lanes`  
**Access**: Sales

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/lanes` | `?page, limit, origin, destination` | `{ data: Lane[], pagination }` |
| GET | `/api/v1/lanes/search` | `?origin, destination` | `{ data: { lanes, marketRate } }` |

**UI Elements**:

- [ ] Lane search form
- [ ] Results table
- [ ] Market rate comparison
- [ ] Historical chart
- [ ] Customer-specific rates section

---

### Screen 03.08: Accessorial Charges

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/accessorials`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/accessorials` | - | `{ data: Accessorial[] }` |
| POST | `/api/v1/accessorials` | CreateAccessorialDto | `{ data: Accessorial }` |
| PUT | `/api/v1/accessorials/:id` | UpdateAccessorialDto | `{ data: Accessorial }` |
| DELETE | `/api/v1/accessorials/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Accessorial list
- [ ] "Add" button
- [ ] Inline editing
- [ ] Active toggle
- [ ] Delete with confirmation

---

### Screen 03.09: Proposal Templates

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/proposal-templates`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/proposal-templates` | - | `{ data: ProposalTemplate[] }` |
| POST | `/api/v1/proposal-templates` | CreateTemplateDto | `{ data: ProposalTemplate }` |
| PUT | `/api/v1/proposal-templates/:id` | UpdateTemplateDto | `{ data: ProposalTemplate }` |
| DELETE | `/api/v1/proposal-templates/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Templates list
- [ ] "Add Template" button
- [ ] Template editor (rich text)
- [ ] Variable insertion
- [ ] Preview button
- [ ] Set as default toggle

---

### Screen 03.10: Sales Reports

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/reports`  
**Access**: Sales, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/reports/sales/summary` | `?dateFrom, dateTo` | `{ data: SalesSummary }` |
| GET | `/api/v1/reports/sales/by-rep` | `?dateFrom, dateTo` | `{ data: RepPerformance[] }` |
| GET | `/api/v1/reports/sales/win-loss` | `?dateFrom, dateTo` | `{ data: WinLossAnalysis }` |
| GET | `/api/v1/reports/sales/export` | `?type, dateFrom, dateTo` | Blob |

**UI Elements**:

- [ ] Date range picker
- [ ] Report type selector
- [ ] Charts/visualizations
- [ ] Data tables
- [ ] "Export PDF" button
- [ ] "Export Excel" button

---

## 04 - TMS Core Service (14 Screens)

### Database Tables Required

```prisma
- Order
- OrderLine
- Load
- LoadStop
- LoadStatus
- LoadEvent
- Commodity
- Reference
```

---

### Screen 04.01: Operations Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/dashboard`  
**Access**: Dispatch, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/tms/dashboard` | - | `{ data: { loads, metrics, alerts } }` |
| GET | `/api/v1/loads/summary` | `?status` | `{ data: { byStatus } }` |

**UI Elements**:

- [ ] Load status cards (pending, dispatched, in-transit, delivered)
- [ ] Today's pickups/deliveries
- [ ] At-risk loads
- [ ] Revenue metrics
- [ ] Quick actions
- [ ] Recent activity feed

---

### Screen 04.02: Orders List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/orders`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/orders` | `?page, limit, search, status, customerId, dateFrom, dateTo` | `{ data: Order[], pagination }` |
| POST | `/api/v1/orders` | CreateOrderDto | `{ data: Order }` |
| DELETE | `/api/v1/orders/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Data table
- [ ] Search by order number
- [ ] Status filter
- [ ] Customer filter
- [ ] Date range filter
- [ ] "New Order" button
- [ ] Row actions
- [ ] Pagination

---

### Screen 04.03: Order Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/orders/:id`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/orders/:id` | - | `{ data: OrderWithRelations }` |
| PUT | `/api/v1/orders/:id` | UpdateOrderDto | `{ data: Order }` |
| GET | `/api/v1/orders/:id/loads` | - | `{ data: Load[] }` |
| POST | `/api/v1/orders/:id/loads` | - | `{ data: Load }` |

**UI Elements**:

- [ ] Order header
- [ ] Customer info
- [ ] Line items
- [ ] Associated loads
- [ ] "Create Load" button
- [ ] Documents section
- [ ] Status timeline
- [ ] Edit button

---

### Screen 04.04: Order Entry

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/orders/new`  
**Access**: Sales, Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/orders` | CreateOrderDto | `{ data: Order }` |
| GET | `/api/v1/customers` | `?search` | `{ data: Customer[] }` |
| GET | `/api/v1/facilities` | `?search` | `{ data: Facility[] }` |

**UI Elements**:

- [ ] Customer selector
- [ ] Reference number inputs
- [ ] Pickup section (facility, date, time)
- [ ] Delivery section (facility, date, time)
- [ ] Commodity details
- [ ] Special instructions
- [ ] "Save" button
- [ ] "Save & Create Load" button

---

### Screen 04.05: Loads List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/loads`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/loads` | `?page, limit, search, status, carrierId, dateFrom, dateTo` | `{ data: Load[], pagination }` |
| POST | `/api/v1/loads` | CreateLoadDto | `{ data: Load }` |
| DELETE | `/api/v1/loads/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Data table
- [ ] Search by load number
- [ ] Status filter (tabs or dropdown)
- [ ] Carrier filter
- [ ] Date range filter
- [ ] "New Load" button
- [ ] Row actions:
  - [ ] "View" â†’ /dispatch/loads/:id
  - [ ] "Track" â†’ /dispatch/loads/:id/track
  - [ ] "Dispatch" â†’ dispatch modal
  - [ ] "Cancel" â†’ cancel confirmation
- [ ] Pagination

---

### Screen 04.06: Load Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/loads/:id`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/loads/:id` | - | `{ data: LoadWithRelations }` |
| PUT | `/api/v1/loads/:id` | UpdateLoadDto | `{ data: Load }` |
| PUT | `/api/v1/loads/:id/status` | `{ status }` | `{ data: Load }` |
| GET | `/api/v1/loads/:id/events` | - | `{ data: LoadEvent[] }` |
| POST | `/api/v1/loads/:id/events` | CreateEventDto | `{ data: LoadEvent }` |

**UI Elements**:

- [ ] Load header with status badge
- [ ] Carrier assignment section
- [ ] Stops timeline
- [ ] Map with route
- [ ] Financial summary
- [ ] Documents section
- [ ] Event log
- [ ] "Edit" button
- [ ] "Update Status" dropdown
- [ ] "Add Event" button

---

### Screen 04.07: Load Builder

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/loads/new`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/loads` | CreateLoadDto | `{ data: Load }` |
| GET | `/api/v1/orders` | `?status=PENDING` | `{ data: Order[] }` |

**UI Elements**:

- [ ] Order selector (or manual entry)
- [ ] Equipment type selector
- [ ] Stops builder (add/remove/reorder)
- [ ] Carrier assignment (optional)
- [ ] Rate entry
- [ ] References section
- [ ] "Save" button
- [ ] "Save & Dispatch" button

---

### Screen 04.08: Dispatch Board

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/board`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/loads` | `?status=AVAILABLE,COVERED` | `{ data: Load[] }` |
| GET | `/api/v1/carriers/available` | `?date, equipment, origin` | `{ data: Carrier[] }` |
| POST | `/api/v1/loads/:id/dispatch` | `{ carrierId, rate }` | `{ data: Load }` |

**UI Elements**:

- [ ] Kanban board by status
- [ ] Available loads column
- [ ] Carrier panel
- [ ] Drag-and-drop assignment
- [ ] Quick dispatch modal
- [ ] Filter by date/equipment/region
- [ ] Refresh button

---

### Screen 04.09: Stop Management

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/stops` (or inline in load detail)  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/loads/:loadId/stops` | - | `{ data: LoadStop[] }` |
| POST | `/api/v1/loads/:loadId/stops` | CreateStopDto | `{ data: LoadStop }` |
| PUT | `/api/v1/loads/:loadId/stops/:id` | UpdateStopDto | `{ data: LoadStop }` |
| DELETE | `/api/v1/loads/:loadId/stops/:id` | - | `{ data: { deleted: true } }` |
| PUT | `/api/v1/loads/:loadId/stops/reorder` | `{ stopIds }` | `{ data: LoadStop[] }` |

**UI Elements**:

- [ ] Stops list (sortable)
- [ ] "Add Stop" button
- [ ] Stop type selector (pickup/delivery/stop)
- [ ] Facility selector
- [ ] Date/time inputs
- [ ] Appointment number
- [ ] Instructions textarea
- [ ] Drag to reorder
- [ ] Delete stop button

---

### Screen 04.10: Tracking Map

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/tracking`  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/loads/active` | - | `{ data: LoadWithLocation[] }` |
| GET | `/api/v1/loads/:id/location` | - | `{ data: { lat, lng, timestamp } }` |
| GET | `/api/v1/loads/:id/route` | - | `{ data: { waypoints, eta } }` |

**UI Elements**:

- [ ] Full-screen map
- [ ] Load markers
- [ ] Click marker for popup
- [ ] Route display
- [ ] ETA display
- [ ] Filter by status
- [ ] Search by load number
- [ ] Refresh interval

---

### Screen 04.11: Status Updates

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: Component within Load Detail  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/loads/:id/status-history` | - | `{ data: StatusHistory[] }` |
| PUT | `/api/v1/loads/:id/status` | `{ status, notes, location }` | `{ data: Load }` |

**UI Elements**:

- [ ] Status history timeline
- [ ] Current status badge
- [ ] "Update Status" button
- [ ] Status dropdown
- [ ] Notes input
- [ ] Location input (optional)
- [ ] Timestamp display

---

### Screen 04.12: Load Timeline

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: Component within Load Detail  
**Access**: All Users

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/loads/:id/events` | - | `{ data: LoadEvent[] }` |

**UI Elements**:

- [ ] Visual timeline
- [ ] Event icons by type
- [ ] Timestamp display
- [ ] User who triggered
- [ ] Expand for details

---

### Screen 04.13: Check Calls

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/check-calls` or within Load Detail  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/loads/:id/check-calls` | - | `{ data: CheckCall[] }` |
| POST | `/api/v1/loads/:id/check-calls` | CreateCheckCallDto | `{ data: CheckCall }` |
| GET | `/api/v1/check-calls/due` | - | `{ data: Load[] }` |

**UI Elements**:

- [ ] Check calls list
- [ ] "Add Check Call" button
- [ ] Location input
- [ ] ETA update
- [ ] Notes
- [ ] Due check calls alert
- [ ] Last check call time

---

### Screen 04.14: Appointment Scheduler

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/appointments`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/appointments` | `?date, facilityId` | `{ data: Appointment[] }` |
| POST | `/api/v1/stops/:id/appointment` | `{ date, time, confirmationNumber }` | `{ data: LoadStop }` |
| PUT | `/api/v1/stops/:id/appointment` | UpdateAppointmentDto | `{ data: LoadStop }` |

**UI Elements**:

- [ ] Calendar view
- [ ] Facility filter
- [ ] Appointment slots
- [ ] Click to schedule
- [ ] Confirmation number input
- [ ] Reschedule functionality

---

## 05 - Carrier Service (12 Screens)

### Database Tables Required

```prisma
- Carrier
- CarrierContact
- CarrierEquipment
- CarrierInsurance
- CarrierScorecard
- CarrierLane
- CarrierDocument
```

---

### Screen 05.01: Carrier Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers/dashboard`  
**Access**: Dispatch, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/dashboard` | - | `{ data: { total, byStatus, compliance, topCarriers } }` |

**UI Elements**:

- [ ] Carrier count cards
- [ ] Compliance status chart
- [ ] Top performers list
- [ ] Expiring insurance alerts
- [ ] Quick actions

---

### Screen 05.02: Carriers List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers` | `?page, limit, search, status, type` | `{ data: Carrier[], pagination }` |
| POST | `/api/v1/carriers` | CreateCarrierDto | `{ data: Carrier }` |
| DELETE | `/api/v1/carriers/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Data table
- [ ] Search by name/MC/DOT
- [ ] Status filter
- [ ] Type filter
- [ ] "Add Carrier" button â†’ /dispatch/carriers/new
- [ ] Row actions:
  - [ ] "View" â†’ /dispatch/carriers/:id
  - [ ] "Edit" â†’ /dispatch/carriers/:id/edit
  - [ ] "Verify FMCSA" â†’ POST /carriers/:id/verify
  - [ ] "Deactivate" / "Activate"
  - [ ] "Delete"
- [ ] Pagination

---

### Screen 05.03: Carrier Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers/:id`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/:id` | - | `{ data: CarrierWithRelations }` |
| PUT | `/api/v1/carriers/:id` | UpdateCarrierDto | `{ data: Carrier }` |
| GET | `/api/v1/carriers/:id/loads` | - | `{ data: Load[] }` |
| GET | `/api/v1/carriers/:id/scorecard` | - | `{ data: Scorecard }` |

**UI Elements**:

- [ ] Carrier header
- [ ] Compliance status indicators
- [ ] Tabs:
  - [ ] Overview
  - [ ] Contacts
  - [ ] Equipment
  - [ ] Insurance
  - [ ] Documents
  - [ ] Load History
  - [ ] Scorecard
- [ ] "Edit" button
- [ ] Quick dispatch button

---

### Screen 05.04: Carrier Onboarding Wizard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers/new`  
**Access**: Dispatch, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/fmcsa/lookup` | `?mc, dot` | `{ data: FmcsaData }` |
| POST | `/api/v1/carriers` | CreateCarrierDto | `{ data: Carrier }` |
| POST | `/api/v1/carriers/:id/contacts` | CreateContactDto | `{ data: CarrierContact }` |
| POST | `/api/v1/carriers/:id/insurance` | CreateInsuranceDto | `{ data: CarrierInsurance }` |
| POST | `/api/v1/carriers/:id/documents` | FormData | `{ data: Document }` |

**UI Elements**:

- [ ] Step 1: FMCSA Lookup (MC/DOT input, auto-fill)
- [ ] Step 2: Company Details
- [ ] Step 3: Contacts
- [ ] Step 4: Insurance
- [ ] Step 5: Documents (W9, etc.)
- [ ] Step 6: Review
- [ ] Progress indicator
- [ ] "Next"/"Back" buttons
- [ ] "Save as Draft" option

---

### Screen 05.05: Compliance Center

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/compliance`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/compliance/summary` | - | `{ data: ComplianceSummary }` |
| GET | `/api/v1/carriers/compliance/expiring` | `?days` | `{ data: ExpiringItem[] }` |
| POST | `/api/v1/carriers/:id/verify` | - | `{ data: VerificationResult }` |

**UI Elements**:

- [ ] Compliance overview cards
- [ ] Expiring insurance list
- [ ] Expiring authority list
- [ ] "Verify All" button
- [ ] Individual verify buttons
- [ ] Export compliance report

---

### Screen 05.06: Insurance Tracking

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/insurance`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/insurance` | `?page, limit, status, expiring` | `{ data: CarrierInsurance[], pagination }` |
| PUT | `/api/v1/carriers/:carrierId/insurance/:id` | UpdateInsuranceDto | `{ data: CarrierInsurance }` |

**UI Elements**:

- [ ] Insurance certificates table
- [ ] Status filter (valid, expiring, expired)
- [ ] Carrier search
- [ ] Update expiry button
- [ ] Upload new certificate
- [ ] Email carrier button

---

### Screen 05.07: Equipment List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers/:id/equipment` (or tab)  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/:id/equipment` | - | `{ data: CarrierEquipment[] }` |
| POST | `/api/v1/carriers/:id/equipment` | CreateEquipmentDto | `{ data: CarrierEquipment }` |
| PUT | `/api/v1/carriers/:id/equipment/:eqId` | UpdateEquipmentDto | `{ data: CarrierEquipment }` |
| DELETE | `/api/v1/carriers/:id/equipment/:eqId` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Equipment table
- [ ] "Add Equipment" button
- [ ] Equipment type dropdown
- [ ] Count input
- [ ] Edit/delete row actions

---

### Screen 05.08: Carrier Scorecard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers/:id/scorecard` (or tab)  
**Access**: Dispatch, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/:id/scorecard` | - | `{ data: Scorecard }` |
| GET | `/api/v1/carriers/:id/performance` | `?dateFrom, dateTo` | `{ data: PerformanceMetrics }` |

**UI Elements**:

- [ ] Overall score display
- [ ] On-time delivery %
- [ ] Claims rate
- [ ] Load count
- [ ] Average rate
- [ ] Historical chart
- [ ] Date range selector

---

### Screen 05.09: Lane Preferences

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers/:id/lanes` (or tab)  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/:id/lanes` | - | `{ data: CarrierLane[] }` |
| POST | `/api/v1/carriers/:id/lanes` | CreateLaneDto | `{ data: CarrierLane }` |
| DELETE | `/api/v1/carriers/:id/lanes/:laneId` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Preferred lanes list
- [ ] "Add Lane" button
- [ ] Origin/destination inputs
- [ ] Equipment type filter
- [ ] Rate input (optional)
- [ ] Delete lane button

---

### Screen 05.10: Carrier Contacts

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers/:id/contacts` (or tab)  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/:id/contacts` | - | `{ data: CarrierContact[] }` |
| POST | `/api/v1/carriers/:id/contacts` | CreateContactDto | `{ data: CarrierContact }` |
| PUT | `/api/v1/carriers/:id/contacts/:contactId` | UpdateContactDto | `{ data: CarrierContact }` |
| DELETE | `/api/v1/carriers/:id/contacts/:contactId` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Contacts list
- [ ] "Add Contact" button
- [ ] Contact type (dispatcher, driver, accounting)
- [ ] Name, email, phone inputs
- [ ] Primary contact toggle
- [ ] Edit/delete buttons

---

### Screen 05.11: FMCSA Lookup Tool

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/fmcsa-lookup`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/fmcsa/lookup` | `?mc, dot, name` | `{ data: FmcsaData }` |
| POST | `/api/v1/fmcsa/import` | `{ mcNumber }` | `{ data: Carrier }` |

**UI Elements**:

- [ ] MC number input
- [ ] DOT number input
- [ ] Company name search
- [ ] "Search" button
- [ ] Results display
- [ ] "Import as Carrier" button
- [ ] SAFER link

---

### Screen 05.12: Preferred Carriers

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/dispatch/carriers/preferred`  
**Access**: Dispatch

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carriers/preferred` | - | `{ data: Carrier[] }` |
| POST | `/api/v1/carriers/:id/favorite` | - | `{ data: { favorited: true } }` |
| DELETE | `/api/v1/carriers/:id/favorite` | - | `{ data: { unfavorited: true } }` |

**UI Elements**:

- [ ] Preferred carriers list
- [ ] Add to preferred button
- [ ] Remove from preferred
- [ ] Quick dispatch integration
- [ ] Scorecard preview

---

## 06 - Accounting Service (14 Screens)

### Database Tables Required

```prisma
- Invoice
- InvoiceLine
- Payment
- CarrierBill
- BillLine
- BankTransaction
- GLAccount
- GLTransaction
```

---

### Screen 06.01: Accounting Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/dashboard`  
**Access**: Accounting, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/accounting/dashboard` | `?dateRange` | `{ data: { ar, ap, cash, metrics } }` |

**UI Elements**:

- [ ] AR total card
- [ ] AP total card
- [ ] Cash flow chart
- [ ] Aging summary
- [ ] Overdue invoices list
- [ ] Pending bills list
- [ ] Quick actions

---

### Screen 06.02: Invoices List

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/invoices`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/invoices` | `?page, limit, search, status, customerId, dateFrom, dateTo` | `{ data: Invoice[], pagination }` |
| POST | `/api/v1/invoices` | CreateInvoiceDto | `{ data: Invoice }` |
| DELETE | `/api/v1/invoices/:id` | - | `{ data: { deleted: true } }` |

**UI Elements**:

- [ ] Data table
- [ ] Search by invoice/load number
- [ ] Status filter
- [ ] Customer filter
- [ ] Date range filter
- [ ] "Create Invoice" button
- [ ] Row actions
- [ ] Batch invoice button
- [ ] Pagination

---

### Screen 06.03: Invoice Detail

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/invoices/:id`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/invoices/:id` | - | `{ data: InvoiceWithRelations }` |
| PUT | `/api/v1/invoices/:id` | UpdateInvoiceDto | `{ data: Invoice }` |
| POST | `/api/v1/invoices/:id/send` | `{ email }` | `{ data: { sent: true } }` |
| POST | `/api/v1/invoices/:id/void` | - | `{ data: Invoice }` |

**UI Elements**:

- [ ] Invoice header
- [ ] Customer info
- [ ] Line items table
- [ ] Payment history
- [ ] "Edit" button
- [ ] "Send" button
- [ ] "Record Payment" button
- [ ] "Void" button
- [ ] PDF download
- [ ] Print button

---

### Screen 06.04: Invoice Entry

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/invoices/new`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/invoices` | CreateInvoiceDto | `{ data: Invoice }` |
| GET | `/api/v1/loads` | `?status=DELIVERED&unbilled=true` | `{ data: Load[] }` |

**UI Elements**:

- [ ] Customer selector
- [ ] Load selector (delivered, unbilled)
- [ ] Invoice date
- [ ] Due date
- [ ] Line items (auto-populated from load)
- [ ] Add manual line
- [ ] Terms selector
- [ ] Notes
- [ ] "Save Draft" button
- [ ] "Save & Send" button

---

### Screen 06.05: Carrier Payables

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/payables`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/carrier-bills` | `?page, limit, search, status, carrierId` | `{ data: CarrierBill[], pagination }` |
| POST | `/api/v1/carrier-bills` | CreateBillDto | `{ data: CarrierBill }` |

**UI Elements**:

- [ ] Bills table
- [ ] Status filter
- [ ] Carrier filter
- [ ] "Enter Bill" button
- [ ] "Pay Selected" button
- [ ] Row actions
- [ ] Batch payment option

---

### Screen 06.06: Bill Entry

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/payables/new`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/carrier-bills` | CreateBillDto | `{ data: CarrierBill }` |
| GET | `/api/v1/loads` | `?carrierId, status=DELIVERED, unbilled=true` | `{ data: Load[] }` |

**UI Elements**:

- [ ] Carrier selector
- [ ] Load selector
- [ ] Bill date
- [ ] Due date
- [ ] Line items
- [ ] Upload invoice document
- [ ] "Save" button

---

### Screen 06.07: Payments Received

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/payments/received`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/payments/received` | `?page, limit, dateFrom, dateTo, customerId` | `{ data: Payment[], pagination }` |
| POST | `/api/v1/payments` | CreatePaymentDto | `{ data: Payment }` |

**UI Elements**:

- [ ] Payments table
- [ ] Date range filter
- [ ] Customer filter
- [ ] "Record Payment" button
- [ ] Row actions (view, void)

---

### Screen 06.08: Payments Made

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/payments/made`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/payments/made` | `?page, limit, dateFrom, dateTo, carrierId` | `{ data: Payment[], pagination }` |
| POST | `/api/v1/payments/carrier` | CreateCarrierPaymentDto | `{ data: Payment }` |

**UI Elements**:

- [ ] Payments table
- [ ] Date filter
- [ ] Carrier filter
- [ ] "Create Payment" button
- [ ] Batch payment option
- [ ] Row actions

---

### Screen 06.09: Payment Entry

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: Modal or `/accounting/payments/new`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/payments` | CreatePaymentDto | `{ data: Payment }` |
| GET | `/api/v1/invoices` | `?customerId, status=OPEN` | `{ data: Invoice[] }` |

**UI Elements**:

- [ ] Payment type (customer/carrier)
- [ ] Entity selector
- [ ] Open invoices/bills list
- [ ] Amount input
- [ ] Date picker
- [ ] Reference number
- [ ] Method (check, ACH, wire)
- [ ] Apply to invoices
- [ ] "Save" button

---

### Screen 06.10: Bank Reconciliation

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/reconciliation`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/bank/transactions` | `?accountId, dateFrom, dateTo, status` | `{ data: BankTransaction[] }` |
| POST | `/api/v1/bank/transactions/import` | FormData | `{ data: { imported } }` |
| POST | `/api/v1/bank/transactions/:id/match` | `{ paymentId }` | `{ data: BankTransaction }` |
| POST | `/api/v1/bank/transactions/:id/reconcile` | - | `{ data: BankTransaction }` |

**UI Elements**:

- [ ] Bank account selector
- [ ] Import transactions button
- [ ] Unreconciled transactions list
- [ ] System transactions list
- [ ] Match interface
- [ ] "Reconcile" button
- [ ] Ending balance input

---

### Screen 06.11: GL Transactions

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/gl/transactions`  
**Access**: Accounting, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/gl/transactions` | `?page, limit, accountId, dateFrom, dateTo` | `{ data: GLTransaction[], pagination }` |
| POST | `/api/v1/gl/transactions` | CreateJournalEntryDto | `{ data: GLTransaction[] }` |

**UI Elements**:

- [ ] Transactions table
- [ ] Account filter
- [ ] Date range filter
- [ ] "Journal Entry" button
- [ ] Running balance display
- [ ] Export button

---

### Screen 06.12: Chart of Accounts

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/chart-of-accounts`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/gl/accounts` | - | `{ data: GLAccount[] }` |
| POST | `/api/v1/gl/accounts` | CreateAccountDto | `{ data: GLAccount }` |
| PUT | `/api/v1/gl/accounts/:id` | UpdateAccountDto | `{ data: GLAccount }` |

**UI Elements**:

- [ ] Accounts tree/list
- [ ] "Add Account" button
- [ ] Account type filter
- [ ] Edit account inline
- [ ] Active/inactive toggle

---

### Screen 06.13: Financial Reports

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/reports`  
**Access**: Accounting, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/reports/pl` | `?dateFrom, dateTo` | `{ data: PLReport }` |
| GET | `/api/v1/reports/balance-sheet` | `?asOf` | `{ data: BalanceSheet }` |
| GET | `/api/v1/reports/cash-flow` | `?dateFrom, dateTo` | `{ data: CashFlow }` |

**UI Elements**:

- [ ] Report type selector
- [ ] Date range/as of date
- [ ] Report display
- [ ] "Export PDF" button
- [ ] "Export Excel" button
- [ ] Print button

---

### Screen 06.14: AR Aging Report

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/reports/aging`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/reports/ar-aging` | `?asOf` | `{ data: AgingReport }` |
| GET | `/api/v1/reports/ap-aging` | `?asOf` | `{ data: AgingReport }` |

**UI Elements**:

- [ ] AR/AP toggle
- [ ] As of date picker
- [ ] Aging buckets (current, 30, 60, 90, 90+)
- [ ] Customer/carrier breakdown
- [ ] Drill-down to invoices
- [ ] Export options

---

## 07 - Commission Service (4 Screens)

### Database Tables Required

```prisma
- CommissionPlan
- CommissionRule
- CommissionStatement
- CommissionPayment
```

---

### Screen 07.01: Commission Dashboard

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/commissions`  
**Access**: Sales, Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/commissions/dashboard` | `?userId, dateRange` | `{ data: { earned, pending, paid, breakdown } }` |

**UI Elements**:

- [ ] Earned commissions card
- [ ] Pending commissions card
- [ ] Paid commissions card
- [ ] Breakdown by load type
- [ ] Monthly trend chart
- [ ] Recent transactions list

---

### Screen 07.02: Commission Plans

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/admin/commission-plans`  
**Access**: Admin

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/commission-plans` | - | `{ data: CommissionPlan[] }` |
| POST | `/api/v1/commission-plans` | CreatePlanDto | `{ data: CommissionPlan }` |
| PUT | `/api/v1/commission-plans/:id` | UpdatePlanDto | `{ data: CommissionPlan }` |
| DELETE | `/api/v1/commission-plans/:id` | - | `{ data: { deleted: true } }` |
| POST | `/api/v1/commission-plans/:id/assign` | `{ userIds }` | `{ data: CommissionPlan }` |

**UI Elements**:

- [ ] Plans list
- [ ] "Add Plan" button
- [ ] Plan editor modal
- [ ] Rules configuration
- [ ] User assignment
- [ ] Active/inactive toggle

---

### Screen 07.03: Commission Calculator

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/accounting/commissions/calculate`  
**Access**: Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/commissions/calculate` | `{ dateFrom, dateTo, userIds? }` | `{ data: CalculationResult[] }` |
| POST | `/api/v1/commissions/approve` | `{ commissionIds }` | `{ data: { approved } }` |
| POST | `/api/v1/commissions/statements/generate` | `{ period, userIds }` | `{ data: Statement[] }` |

**UI Elements**:

- [ ] Period selector
- [ ] User filter
- [ ] "Calculate" button
- [ ] Results preview
- [ ] "Approve" button
- [ ] "Generate Statements" button
- [ ] Adjustment input

---

### Screen 07.04: Commission Statements

| Status | DB  | API | FE  | INT | VER |
| ------ | --- | --- | --- | --- | --- |
|        | â¬œ | â¬œ | â¬œ | â¬œ | â¬œ |

**Route**: `/sales/commissions/statements` or `/accounting/commissions/statements`  
**Access**: Sales, Accounting

**API Endpoints**:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/commissions/statements` | `?page, limit, userId, period` | `{ data: Statement[], pagination }` |
| GET | `/api/v1/commissions/statements/:id` | - | `{ data: StatementWithDetails }` |
| POST | `/api/v1/commissions/statements/:id/pay` | `{ paymentMethod }` | `{ data: Statement }` |

**UI Elements**:

- [ ] Statements list
- [ ] Period filter
- [ ] User filter (admin only)
- [ ] View statement button
- [ ] "Mark Paid" button
- [ ] PDF download
- [ ] Payment history

---

# DOCUMENT CONTINUES IN PART 2...

This document is continued in **72-screen-api-contract-registry-part2.md** covering:

- Operations Services (68 screens): Credit, Claims, Documents, Communication, Customer Portal, Carrier Portal, Driver Portal
- Platform Services (62 screens): Analytics, Workflow, Integration Hub, Search, Audit, Config, Scheduler, Cache, Help Desk, Feedback
- Extended Services (72 screens): EDI, Rate Intelligence, ELD, Cross-Border, Safety, Fuel Cards, Factoring, Load Board, Mobile App
- Admin Services (28 screens): Super Admin

---

## Navigation

- **Previous:** [Pre-Release Checklist](./71-pre-release-checklist.md)
- **Next:** [Screen-API Contract Registry Part 2](./72-screen-api-contract-registry-part2.md)
