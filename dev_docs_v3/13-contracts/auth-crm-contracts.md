# Auth & CRM Screen-to-API Contracts

> Verified from hook source code on 2026-03-07

---

## Auth Hooks

**Source:** `apps/web/lib/hooks/use-auth.ts`

### Authentication

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCurrentUser` | GET | `/auth/me` | -- | `{ data: User }` |
| `useLogin` | POST | `/auth/login` | `LoginRequest { email, password }` | `LoginResponse { accessToken, refreshToken, user, requiresMfa?, mfaToken? }` |
| `useRegister` | POST | `/auth/register` | `RegisterRequest` | success message |
| `useLogout` | POST | `/auth/logout` | -- | success |
| `useForgotPassword` | POST | `/auth/forgot-password` | `{ email }` | success message |
| `useResetPassword` | POST | `/auth/reset-password` | `{ token, password }` | success |
| `useChangePassword` | POST | `/auth/change-password` | `ChangePasswordRequest` | success |

### MFA

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useVerifyMFA` | POST | `/auth/mfa/verify` | `MFAVerifyRequest` | `LoginResponse` |
| `useEnableMFA` | POST | `/auth/mfa/enable` | `{ method: "TOTP" \| "SMS" \| "EMAIL" }` | `{ data: { secret, qrCode } }` |
| `useConfirmMFA` | POST | `/auth/mfa/confirm` | `{ code }` | success |
| `useDisableMFA` | POST | `/auth/mfa/disable` | `{ password }` | success |

### Sessions

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useSessions` | GET | `/auth/sessions` | -- | `{ data: Session[] }` |
| `useRevokeSession` | DELETE | `/auth/sessions/:sessionId` | -- | success |
| `useRevokeAllSessions` | DELETE | `/auth/sessions` | -- | success |

### Authorization (client-side only, no API call)

| Hook | Purpose |
|------|---------|
| `useHasPermission(permission)` | Checks `user.permissions` array |
| `useHasRole(roles)` | Checks `user.roles` / `user.roleName` / `user.role.name` |

### Cache Keys

```typescript
authKeys = {
  all: ["auth"],
  user: () => ["auth", "user"],
  sessions: () => ["auth", "sessions"],
};
```

---

## CRM: Customers

**Source:** `apps/web/lib/hooks/crm/use-customers.ts`

**IMPORTANT:** Customers use the `/crm/companies` endpoint with `companyType=CUSTOMER` filter, NOT `/crm/customers`.

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCustomers` | GET | `/crm/companies` | `{ ...params, companyType: "CUSTOMER" }` | `PaginatedResponse<Customer>` |
| `useCustomer` | GET | `/crm/companies/:id` | -- | `{ data: Customer }` |
| `useCreateCustomer` | POST | `/crm/companies` | `{ ...data, companyType: "CUSTOMER" }` | `{ data: Customer }` |
| `useUpdateCustomer` | PATCH | `/crm/companies/:id` | `Partial<Customer>` | `{ data: Customer }` |
| `useDeleteCustomer` | DELETE | `/crm/companies/:id` | -- | success |

### Cache Keys

```typescript
customerKeys = {
  all: ["customers"],
  lists: () => ["customers", "list"],
  list: (params) => ["customers", "list", params],
  detail: (id) => ["customers", "detail", id],
};
```

---

## CRM: Companies

**Source:** `apps/web/lib/hooks/crm/use-companies.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useCompanies` | GET | `/crm/companies` | `{ page?, limit?, search? }` | `PaginatedResponse<Customer>` |

### Cache Keys

```typescript
companyKeys = {
  all: ["companies"],
  list: (params) => ["companies", "list", params],
};
```

---

## CRM: Contacts

**Source:** `apps/web/lib/hooks/crm/use-contacts.ts`

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useContacts` | GET | `/crm/contacts` | `ContactListParams` | `PaginatedResponse<Contact>` |
| `useContact` | GET | `/crm/contacts/:id` | -- | `{ data: Contact }` |
| `useCreateContact` | POST | `/crm/contacts` | `Partial<Contact>` | `{ data: Contact }` |
| `useUpdateContact` | PATCH | `/crm/contacts/:id` | `Partial<Contact>` | `{ data: Contact }` |
| `useDeleteContact` | DELETE | `/crm/contacts/:id` | -- | success |

### Cache Keys

```typescript
contactKeys = {
  all: ["contacts"],
  lists: () => ["contacts", "list"],
  list: (params) => ["contacts", "list", params],
  detail: (id) => ["contacts", "detail", id],
};
```

---

## CRM: Leads (Opportunities)

**Source:** `apps/web/lib/hooks/crm/use-leads.ts`

**IMPORTANT:** Leads use the `/crm/opportunities` endpoint, NOT `/crm/leads`.

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useLeads` | GET | `/crm/opportunities` | `LeadListParams` | `PaginatedResponse<Lead>` |
| `useLeadsPipeline` | GET | `/crm/opportunities/pipeline` | -- | `{ data: Record<string, Lead[]> }` |
| `useLead` | GET | `/crm/opportunities/:id` | -- | `{ data: Lead }` |
| `useCreateLead` | POST | `/crm/opportunities` | `Partial<Lead>` | `{ data: Lead }` |
| `useUpdateLeadStage` | PATCH | `/crm/opportunities/:id/stage` | `{ stage }` | success |
| `useDeleteLead` | DELETE | `/crm/opportunities/:id` | -- | success |
| `useConvertLead` | POST | `/crm/opportunities/:id/convert` | `{ customerId? }` | success |

### Cache Keys

```typescript
leadKeys = {
  all: ["leads"],
  lists: () => ["leads", "list"],
  list: (params) => ["leads", "list", params],
  detail: (id) => ["leads", "detail", id],
  pipeline: () => ["leads", "pipeline"],
};
```

---

## CRM: Activities

**Source:** `apps/web/lib/hooks/crm/use-activities.ts`

**Field mapping notes:**
- Frontend `type` maps to backend `activityType`
- Frontend `leadId` maps to backend `opportunityId`
- Frontend `assignedToId` maps to backend `ownerId`
- Backend also expects `entityType` and `entityId` (derived from leadId/companyId/contactId)

| Hook | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| `useActivities` | GET | `/crm/activities` | `{ activityType?, opportunityId?, ...params }` | `PaginatedResponse<Activity>` |
| `useActivity` | GET | `/crm/activities/:id` | -- | `{ data: Activity }` |
| `useCreateActivity` | POST | `/crm/activities` | mapped DTO (see below) | `{ data: Activity }` |
| `useUpdateActivity` | PATCH | `/crm/activities/:id` | mapped DTO (see below) | `{ data: Activity }` |
| `useDeleteActivity` | DELETE | `/crm/activities/:id` | -- | success |

### Create Activity DTO Mapping

```typescript
// Frontend -> Backend
{
  activityType: data.type,
  subject: data.subject,
  description: data.description,
  activityDate: data.activityDate,
  dueDate: data.dueDate,
  durationMinutes: data.durationMinutes,
  companyId,
  contactId,
  opportunityId: data.leadId,
  ownerId: data.assignedToId,
  entityType,   // "OPPORTUNITY" | "COMPANY" | "CONTACT"
  entityId,     // derived from leadId || companyId || contactId
}
```

### Cache Keys

```typescript
activityKeys = {
  all: ["activities"],
  lists: () => ["activities", "list"],
  list: (params) => ["activities", "list", params],
  detail: (id) => ["activities", "detail", id],
};
```
