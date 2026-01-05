# 71 - Pre-Release Checklist

**Complete audit before every release/deployment**

---

## âš ï¸ CLAUDE CODE: Before ANY Deployment

This checklist MUST be completed before every release. A single missed item can cause production issues.

---

## Release Information

**Release Version:** **************\_\_\_\_**************

**Release Date:** **************\_\_\_\_**************

**Features Included:**

- [ ] ***
- [ ] ***
- [ ] ***

**Checklist Completed By:** **************\_\_\_\_**************

---

## 1. Build & Deployment Readiness

### 1.1 Code Quality

- [ ] `npx tsc --noEmit` - Zero TypeScript errors
- [ ] `npm run lint` - Zero linting errors
- [ ] `npm test` - All tests pass
- [ ] No `console.log` statements (except intentional logging)
- [ ] No `TODO` or `FIXME` comments for this release
- [ ] No commented-out code
- [ ] No hardcoded credentials or secrets

### 1.2 Build Verification

- [ ] `npm run build` succeeds without errors
- [ ] Build output size is reasonable
- [ ] All environment variables documented
- [ ] Environment variables set in production

### 1.3 Dependencies

- [ ] No security vulnerabilities in dependencies (`npm audit`)
- [ ] All dependencies are production-ready (no alpha/beta for critical libs)
- [ ] Lock file committed (`package-lock.json`)

---

## 2. Database Readiness

### 2.1 Schema

- [ ] All migrations up to date
- [ ] `npx prisma migrate deploy` runs without errors
- [ ] Database backup configured
- [ ] Rollback migration tested (if applicable)

### 2.2 Seed Data

- [ ] Seed script runs without errors
- [ ] Demo/test data appropriate for environment
- [ ] No test data in production

### 2.3 Data Integrity

- [ ] All required indexes created
- [ ] Foreign key constraints in place
- [ ] No orphan records possible

---

## 3. Authentication & Security

### 3.1 Auth Verification

- [ ] Login works with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Session/token expiry works correctly
- [ ] Logout clears session completely
- [ ] Password reset flow works

### 3.2 Authorization Verification

| Endpoint             | Public | Auth Required | Role Restricted | âœ“ |
| -------------------- | ------ | ------------- | --------------- | --- |
| `/api/v1/auth/login` | âœ…    | -             | -               |     |
| `/api/v1/carriers`   | -      | âœ…           | ADMIN, DISPATCH |     |
| `/api/v1/admin/*`    | -      | âœ…           | ADMIN only      |     |

- [ ] All protected endpoints return 401 without token
- [ ] All role-restricted endpoints return 403 for wrong role
- [ ] Multi-tenant isolation verified (can't access other tenant's data)

### 3.3 Security Headers

- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting in place
- [ ] No sensitive data in URLs
- [ ] No sensitive data in logs

---

## 4. API Audit

### 4.1 Endpoint Inventory

Run this command and verify each endpoint:

```bash
find apps/api/src -name "*.controller.ts" -exec grep -l "@Get\|@Post\|@Put\|@Delete" {} \;
```

For each endpoint verify:

- [ ] Returns correct response format
- [ ] Has authentication guard
- [ ] Has role guard (if needed)
- [ ] Validates input
- [ ] Handles errors properly
- [ ] Filters by tenant

### 4.2 Response Format Audit

- [ ] All list endpoints return `{ data: [], pagination: {} }`
- [ ] All single endpoints return `{ data: {} }`
- [ ] All errors return `{ error: "", code: "" }`

### 4.3 Critical Endpoints Test

| Endpoint                | Works | Response Format | Auth | Notes |
| ----------------------- | ----- | --------------- | ---- | ----- |
| POST /api/v1/auth/login |       |                 |      |       |
| GET /api/v1/carriers    |       |                 |      |       |
| POST /api/v1/carriers   |       |                 |      |       |
| GET /api/v1/loads       |       |                 |      |       |
| POST /api/v1/loads      |       |                 |      |       |

---

## 5. Frontend Audit

### 5.1 Page Inventory

Run and verify:

```bash
find apps/web/app -name "page.tsx" | wc -l
```

### 5.2 Page-by-Page Verification

For EACH page in the release:

| Page | Loads | States OK | Buttons Work | Links Work | Console Clean |
| ---- | ----- | --------- | ------------ | ---------- | ------------- |
|      |       |           |              |            |               |
|      |       |           |              |            |               |
|      |       |           |              |            |               |

### 5.3 Interactive Elements Audit

Run audit commands:

```bash
# Buttons without actions
grep -rn "<Button" --include="*.tsx" | grep -v "onClick\|asChild\|type=\"submit\""

# DropdownMenuItems without actions
grep -rn "DropdownMenuItem>" --include="*.tsx" | grep -v "onClick\|asChild"

# Forms without handlers
grep -rn "<form" --include="*.tsx" | grep -v "onSubmit"
```

- [ ] Zero buttons without actions
- [ ] Zero dropdown items without actions
- [ ] Zero forms without handlers

### 5.4 Navigation Audit

For each portal, verify:

**Admin Portal:**

- [ ] Dashboard link works
- [ ] All sidebar links work
- [ ] Profile link works
- [ ] Settings link works
- [ ] Logout works

**Dispatch Portal:**

- [ ] Dashboard link works
- [ ] All sidebar links work
- [ ] Profile link works

_(Repeat for each portal)_

### 5.5 State Handling

- [ ] Loading states show spinners
- [ ] Error states show messages and retry
- [ ] Empty states show helpful messages
- [ ] All toasts/notifications work

---

## 6. Cross-Browser & Device Testing

### 6.1 Browser Testing

| Browser          | Works | Notes |
| ---------------- | ----- | ----- |
| Chrome (latest)  |       |       |
| Firefox (latest) |       |       |
| Safari (latest)  |       |       |
| Edge (latest)    |       |       |

### 6.2 Responsive Testing

| Breakpoint          | Works | Notes |
| ------------------- | ----- | ----- |
| Mobile (< 640px)    |       |       |
| Tablet (640-1024px) |       |       |
| Desktop (> 1024px)  |       |       |

---

## 7. Performance Audit

### 7.1 API Performance

- [ ] List endpoints respond < 500ms
- [ ] Detail endpoints respond < 200ms
- [ ] No N+1 query issues
- [ ] Pagination working for large datasets

### 7.2 Frontend Performance

- [ ] Initial load < 3 seconds
- [ ] Page transitions < 500ms
- [ ] No layout shifts
- [ ] Images optimized

### 7.3 Database Performance

- [ ] Slow query log reviewed
- [ ] Indexes verified for common queries
- [ ] Connection pool configured

---

## 8. User Acceptance Testing

### 8.1 Critical User Flows

Test complete flows end-to-end:

**Flow: Create and Manage Carrier**

- [ ] Login as dispatcher
- [ ] Navigate to carriers
- [ ] Click "Add Carrier"
- [ ] Fill form and submit
- [ ] Verify carrier appears in list
- [ ] Click to view details
- [ ] Edit carrier
- [ ] Verify changes saved
- [ ] Delete carrier
- [ ] Verify removed from list

**Flow: Create and Track Load**

- [ ] Login as dispatcher
- [ ] Create new load
- [ ] Assign carrier
- [ ] Update status through workflow
- [ ] Verify tracking updates
- [ ] Complete load

_(Add flows for each feature in release)_

### 8.2 Role-Based Testing

Test each role can do their job:

| Role       | Key Actions              | Works |
| ---------- | ------------------------ | ----- |
| Admin      | Manage users, settings   |       |
| Dispatch   | Create/manage loads      |       |
| Sales      | Manage customers, quotes |       |
| Accounting | Invoice, payments        |       |
| Carrier    | View assigned loads      |       |
| Customer   | Track shipments          |       |

---

## 9. Documentation & Communication

### 9.1 Documentation Updates

- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Screen-API Contract Registry updated
- [ ] Known issues documented

### 9.2 Release Notes

- [ ] New features documented
- [ ] Bug fixes documented
- [ ] Breaking changes documented
- [ ] Migration steps documented (if any)

### 9.3 Team Communication

- [ ] Team notified of release
- [ ] Support team briefed on changes
- [ ] Customer communication prepared (if needed)

---

## 10. Deployment Execution

### 10.1 Pre-Deployment

- [ ] Backup database
- [ ] Notify team of deployment window
- [ ] Prepare rollback plan

### 10.2 Deployment Steps

- [ ] Deploy database migrations
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verify health checks pass
- [ ] Run smoke tests

### 10.3 Post-Deployment

- [ ] Verify application accessible
- [ ] Run critical user flows
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Confirm with stakeholders

---

## Sign-Off

### Checklist Verified By:

| Name | Role | Signature | Date |
| ---- | ---- | --------- | ---- |
|      | Dev  |           |      |
|      | QA   |           |      |
|      | Lead |           |      |

### Release Approved:

- [ ] Approved for deployment

**Approved By:** **************\_\_\_\_**************

**Date:** **************\_\_\_\_**************

---

## Navigation

- **Previous:** [Pre-Feature Checklist](./70-pre-feature-checklist.md)
- **Next:** [Screen-API Contract Registry](./72-screen-api-contract-registry.md)
