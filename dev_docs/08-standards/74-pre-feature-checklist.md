# 70 - Pre-Feature Checklist

**Complete this checklist BEFORE building any feature**

---

## âš ï¸ CLAUDE CODE: MANDATORY

Before implementing ANY feature, work through this entire checklist. Do not skip steps. This prevents 90% of common issues.

---

## Phase 1: Understanding (15 min)

### 1.1 Identify the Screen(s)

- [ ] Find screen in Screen-API Contract Registry (doc 72)
- [ ] Note the screen type (list, detail, form, dashboard, etc.)
- [ ] Note the user roles that access this screen
- [ ] Identify all related screens (list â†’ detail â†’ edit flow)

**Screen Name:** **************\_\_\_\_**************

**Screen Type:** **************\_\_\_\_**************

**Allowed Roles:** **************\_\_\_\_**************

### 1.2 Identify Required APIs

From the Screen-API Contract Registry, list ALL required endpoints:

| Endpoint | Method | Purpose |
| -------- | ------ | ------- |
|          |        |         |
|          |        |         |
|          |        |         |
|          |        |         |

### 1.3 Identify Database Tables

- [ ] List tables this feature reads from
- [ ] List tables this feature writes to
- [ ] Check if tables exist in Prisma schema
- [ ] Note any missing tables/fields

| Table | Operations | Exists? |
| ----- | ---------- | ------- |
|       |            |         |
|       |            |         |

---

## Phase 2: Contract Verification (10 min)

### 2.1 API Contracts

For EACH required endpoint, verify:

**Endpoint 1:** `________________`

- [ ] Contract defined in doc 72
- [ ] Request format documented
- [ ] Response format documented
- [ ] Error cases documented
- [ ] Auth roles specified

**Endpoint 2:** `________________`

- [ ] Contract defined in doc 72
- [ ] Request format documented
- [ ] Response format documented
- [ ] Error cases documented
- [ ] Auth roles specified

_(Add more as needed)_

### 2.2 If Contracts Missing

If ANY contract is not defined:

- [ ] **STOP** - Do not start coding
- [ ] Define the contract first
- [ ] Add to Screen-API Contract Registry
- [ ] Get contract approved before proceeding

---

## Phase 3: Database Readiness (10 min)

### 3.1 Schema Check

- [ ] Required tables exist in `schema.prisma`
- [ ] All required fields exist
- [ ] Relations defined correctly
- [ ] Indexes added for query fields
- [ ] Migration fields included (externalId, sourceSystem, customFields)
- [ ] Audit fields included (createdAt, updatedAt, deletedAt)
- [ ] Multi-tenant field included (tenantId)

### 3.2 If Schema Changes Needed

- [ ] Create schema changes
- [ ] Run `npx prisma format`
- [ ] Run `npx prisma validate`
- [ ] Run `npx prisma migrate dev --name [description]`
- [ ] Run `npx prisma generate`
- [ ] Update seed script

---

## Phase 4: Build Backend (Variable)

### 4.1 Service Implementation

- [ ] Create DTO files matching contract
- [ ] Create service with all required methods
- [ ] Each method filters by `tenantId`
- [ ] Each method excludes soft-deleted records
- [ ] Include required relations in queries
- [ ] Implement validation logic
- [ ] Add error handling

### 4.2 Controller Implementation

- [ ] Create controller at correct route
- [ ] Add `@UseGuards(JwtAuthGuard, RolesGuard)`
- [ ] Add `@Roles()` for each endpoint
- [ ] Use `@CurrentUser()` decorator
- [ ] Return standard response format
- [ ] Add Swagger documentation

### 4.3 Backend Verification

- [ ] Endpoint responds to correct URL
- [ ] Returns 401 without auth token
- [ ] Returns 403 for wrong role
- [ ] Returns 400 for invalid input
- [ ] Returns 404 for missing resource
- [ ] Returns correct data format
- [ ] Filters by tenant correctly

---

## Phase 5: Build Frontend (Variable)

### 5.1 Page Setup

- [ ] Create page in correct portal folder
- [ ] Add `'use client'` directive if needed
- [ ] Define TypeScript interfaces for API data
- [ ] Implement `fetchData` with `useCallback`

### 5.2 State Handling

- [ ] Loading state with spinner
- [ ] Error state with retry button
- [ ] Empty state with helpful message
- [ ] Success state with data

### 5.3 Interactive Elements

For EVERY interactive element:

| Element | Type     | Action | âœ“ |
| ------- | -------- | ------ | --- |
|         | Button   |        |     |
|         | Button   |        |     |
|         | Link     |        |     |
|         | Dropdown |        |     |
|         | Form     |        |     |

- [ ] EVERY button has onClick OR is in Link OR is type="submit"
- [ ] EVERY dropdown item has onClick OR asChild with Link
- [ ] EVERY link points to existing page
- [ ] EVERY form has onSubmit handler

---

## Phase 6: Verification (15 min)

### 6.1 Manual Testing

- [ ] Page loads without errors
- [ ] Console has no errors
- [ ] Loading state shows during fetch
- [ ] Data displays correctly
- [ ] Empty state shows when no data
- [ ] Error state shows on API failure
- [ ] Retry works from error state

### 6.2 Click Testing

Test EVERY clickable element:

| Element | Expected Action | Works? |
| ------- | --------------- | ------ |
|         |                 |        |
|         |                 |        |
|         |                 |        |
|         |                 |        |

- [ ] All buttons tested
- [ ] All dropdown items tested
- [ ] All links tested
- [ ] All forms tested

### 6.3 CRUD Testing (if applicable)

- [ ] Create works
- [ ] List refreshes after create
- [ ] View/detail shows correct data
- [ ] Edit works
- [ ] List refreshes after edit
- [ ] Delete shows confirmation
- [ ] Delete works
- [ ] List refreshes after delete

### 6.4 Role Testing

Test with each allowed role:

| Role | Can Access? | Correct Permissions? |
| ---- | ----------- | -------------------- |
|      |             |                      |
|      |             |                      |

---

## Phase 7: Finalization (5 min)

### 7.1 Code Cleanup

- [ ] No `console.log` statements
- [ ] No `TODO` comments
- [ ] No `any` types
- [ ] No commented-out code

### 7.2 Documentation Update

- [ ] Update Screen-API Contract Registry status to âœ…
- [ ] Update any related documentation
- [ ] Add any new patterns learned

### 7.3 Commit

- [ ] Run `npx tsc --noEmit` - no errors
- [ ] Run `npm test` - all pass
- [ ] Commit with descriptive message

---

## Quick Reference: What Each Screen Type Needs

### List Page

```
Required:
- GET /api/v1/{resource} with pagination
- fetchData with useCallback
- Loading/Error/Empty states
- DataTable component
- Row actions (View, Edit, Delete)
- Create button with navigation
- Search/Filter (optional)
```

### Detail Page

```
Required:
- GET /api/v1/{resource}/:id
- fetchData with useCallback
- Loading/Error states
- Back button
- Edit button (if user has permission)
- Delete button (if user has permission)
- Related data display
```

### Form Page (Create/Edit)

```
Required:
- POST /api/v1/{resource} (create)
- PUT /api/v1/{resource}/:id (edit)
- GET /api/v1/{resource}/:id (edit - load existing)
- Zod schema for validation
- React Hook Form
- Loading state during submit
- Error display
- Success redirect
- Cancel button
```

### Dashboard Page

```
Required:
- Multiple GET endpoints for widgets
- Loading states per widget
- Error handling per widget
- Refresh capability
- KPI cards
- Charts/graphs (optional)
```

---

## Navigation

- **Previous:** [Common Pitfalls Prevention](./69-common-pitfalls-prevention.md)
- **Next:** [Pre-Release Checklist](./71-pre-release-checklist.md)
