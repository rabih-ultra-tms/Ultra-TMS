# Sprint 1 — Phase 3: Auth & Admin + CRM Quality (Weeks 5-6)
> 8 tasks | 30-40h estimated | Prereq: FIX-002 (envelope unwrapping) complete

---

## SVC-AUTH-001: Auth Flow Hardening [P0]
**Effort:** M (3-4h)

### Context
Auth backend is solid (rate limiting, token rotation, bcrypt). Frontend auth flow needs hardening — edge cases, error states, redirect handling.

### Files
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/register/page.tsx`
- `apps/web/app/(auth)/forgot-password/page.tsx`
- `apps/web/app/(auth)/reset-password/page.tsx`
- `apps/web/app/(auth)/verify-email/page.tsx`
- `apps/web/lib/hooks/use-auth.ts`
- `apps/web/lib/api/client.ts` (auth methods)

### Sub-tasks
1. **AUTH-001a:** Verify login form handles all error states:
   - Invalid credentials → "Invalid email or password" (no email enumeration)
   - Account locked → "Account locked. Try again in X minutes"
   - Network error → "Connection failed. Check your internet"
   - Rate limited → "Too many attempts. Wait X seconds"
2. **AUTH-001b:** Verify token refresh works silently (no forced logout on token expiry)
3. **AUTH-001c:** Verify logout clears all cookies and redirects to `/login`
4. **AUTH-001d:** Add redirect-after-login (preserve intended URL in query param)
5. **AUTH-001e:** Test password reset flow end-to-end
6. **AUTH-001f:** Verify email verification flow works

### Acceptance Criteria
- [ ] Login handles all 4 error states with user-friendly messages
- [ ] Token refresh is transparent to user
- [ ] Logout fully clears session
- [ ] Deep link redirect works (visit `/accounting` while logged out → login → redirected to `/accounting`)

---

## SVC-AUTH-002: Admin Pages Quality Pass [P1]
**Effort:** M (4-6h)

### Pages to Fix (10 pages)
| Page | Route | Key Issues |
|------|-------|-----------|
| User List | `/admin/users` | Check data loading, pagination, search |
| User Detail | `/admin/users/[id]` | Check all fields render |
| User Create | `/admin/users/new` | Check form validation |
| User Edit | `/admin/users/[id]/edit` | Check form pre-population |
| Role List | `/admin/roles` | Check permissions display |
| Role Detail | `/admin/roles/[id]` | console.log on this page — remove |
| Role Create/Edit | `/admin/roles/new`, `/admin/roles/[id]/edit` | Check permission checkboxes |
| Audit Logs | `/admin/audit-logs` | Check data loading |
| Permissions | `/admin/permissions` | Check display |
| Settings | `/admin/settings` | Check tenant settings |

### Sub-tasks per page (×10 = 50 checks)
For each page:
1. Verify data loads correctly (hook unwraps envelope)
2. Verify loading state shows skeleton
3. Verify error state shows error UI with retry
4. Verify empty state shows "No data" message
5. Remove any `console.log` or `alert()` calls

### Known Issues
- `app/(dashboard)/admin/roles/[id]/page.tsx` — has console.log (remove)

### Acceptance Criteria
- [ ] All 10 admin pages load data correctly
- [ ] 4-state verification: Loading / Error / Empty / Data
- [ ] Zero console.log in admin pages
- [ ] User CRUD works end-to-end
- [ ] Role management with permissions works

---

## SVC-AUTH-003: Admin Hook Fixes [P0]
**Effort:** M (2-3h) | 7/8 hooks reported broken

### Hooks to Fix
| Hook | File | Fix Needed |
|------|------|-----------|
| useRoles | `lib/hooks/use-roles.ts` | Verify envelope unwrapping |
| useSecurityLog | `lib/hooks/use-security-log.ts` | Verify envelope unwrapping |
| useTenant | `lib/hooks/use-tenant.ts` | Verify envelope unwrapping |
| useUsers | `lib/hooks/use-users.ts` | Verify envelope unwrapping |

### Sub-tasks
1. **AUTH-003a:** Open each hook, check every `queryFn` and `mutationFn`
2. **AUTH-003b:** Add `unwrap()` import and apply to every response
3. **AUTH-003c:** Verify mutation responses (POST/PUT/PATCH) also unwrap correctly
4. **AUTH-003d:** Test each hook's consumer page after fix

### Acceptance Criteria
- [ ] All admin hooks return clean data (not `{ data: T }`)
- [ ] Consumer pages render data correctly after fix
- [ ] Mutations (create/update/delete) work end-to-end

---

## SVC-AUTH-004: Admin Module Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Test Files
- **Existing:** `apps/api/src/modules/auth/` has 7 spec files
- **Target:** Ensure 15+ meaningful tests covering auth + admin functionality

### Sub-tasks
1. **AUTH-004a:** Audit existing 7 test files — verify they run and pass
2. **AUTH-004b:** Add tests for edge cases:
   - Login with locked account
   - Token refresh with expired refresh token
   - Role-based access (admin vs user trying admin endpoints)
   - Tenant isolation (user A can't access user B's tenant data)
3. **AUTH-004c:** Add frontend tests for admin pages:
   - User list renders data
   - User create form validates required fields
   - Role permissions toggle works

### Acceptance Criteria
- [ ] 15+ tests passing for auth/admin module
- [ ] Edge cases covered (lockout, token expiry, RBAC)
- [ ] Tenant isolation verified in tests

---

## SVC-CRM-001: CRM Hook Fixes [P0]
**Effort:** M (2-3h) | 5 hooks reported broken

### Hooks to Fix
| Hook | File | Status |
|------|------|--------|
| useActivities | `lib/hooks/use-activities.ts` | VERIFY & fix |
| useCompanies | `lib/hooks/use-companies.ts` | CORRECT (confirmed) |
| useContacts | `lib/hooks/use-contacts.ts` | VERIFY & fix |
| useCustomers | `lib/hooks/use-customers.ts` | BROKEN (line 28) |
| useLeads | `lib/hooks/use-leads.ts` | VERIFY & fix |

### Sub-tasks
1. **CRM-001a:** Fix `useCustomers` — inconsistent envelope handling at line 28
2. **CRM-001b:** Verify `useActivities`, `useContacts`, `useLeads` envelope handling
3. **CRM-001c:** Apply shared `unwrap()` to all CRM hooks
4. **CRM-001d:** Test each hook's consumer page after fix

### Acceptance Criteria
- [ ] All 5 CRM hooks return clean unwrapped data
- [ ] Customer list, contact list, lead list load correctly
- [ ] CRUD operations work on all CRM entities

---

## SVC-CRM-002: CRM Pages Quality Pass [P1]
**Effort:** M (4-6h)

### Pages to Fix (9+ pages)
| Page | Route | Key Checks |
|------|-------|-----------|
| Companies List | `/companies` | Pagination, search, filters |
| Company Detail | `/companies/[id]` | All tabs render |
| Company Edit | `/companies/[id]/edit` | Form pre-populates |
| Company Activities | `/companies/[id]/activities` | Activity timeline |
| Company Contacts | `/companies/[id]/contacts` | Contact list |
| Company New | `/companies/new` | Form validation |
| Customers List | `/customers` | Data table |
| Customer Detail | `/customers/[id]` | Detail view |
| Leads List | `/leads` | Pipeline view |
| Lead Detail | `/leads/[id]` | Detail + conversion |

### Sub-tasks per page
For each page, verify:
1. Data loads correctly after hook fix
2. Loading state (skeleton)
3. Error state (retry button)
4. Empty state ("No companies yet")
5. All CRUD buttons work (not stubs)
6. Search and filters functional
7. Pagination works

### Known Issues
- `components/crm/customers/customer-form.tsx` — has console.log (remove)

### Acceptance Criteria
- [ ] All CRM pages show 4 states (loading/error/empty/data)
- [ ] CRUD works on companies, contacts, leads, customers
- [ ] Search and pagination functional
- [ ] Zero console.log in CRM code

---

## SVC-CRM-003: Lead Pipeline Polish [P1]
**Effort:** M (2-3h)

### Context
Lead management should show a pipeline/kanban view for sales workflow. Verify the pipeline stages work.

### Sub-tasks
1. **CRM-003a:** Verify lead status transitions work (New → Contacted → Qualified → Proposal → Won/Lost)
2. **CRM-003b:** Verify lead-to-customer conversion flow
3. **CRM-003c:** Verify activity logging on lead interactions
4. **CRM-003d:** Check pipeline view renders correctly (if kanban exists)

### Acceptance Criteria
- [ ] Lead status transitions work end-to-end
- [ ] Lead can be converted to customer
- [ ] Activities are logged on interactions

---

## SVC-CRM-004: CRM Module Tests [P1]
**Effort:** M (3-4h) | AC: 15+ tests

### Sub-tasks
1. **CRM-004a:** Audit existing 6 backend test files — verify they pass
2. **CRM-004b:** Add tests for:
   - Company CRUD with tenant isolation
   - Contact association to company
   - Lead pipeline transitions
   - Customer creation from lead conversion
   - Search and pagination
3. **CRM-004c:** Add frontend tests for key pages:
   - Company list renders and paginates
   - Company form validates required fields

### Acceptance Criteria
- [ ] 15+ tests passing for CRM module
- [ ] Tenant isolation verified
- [ ] Pipeline transitions tested

---

## Phase 3 Summary

| Task | Priority | Effort | Hooks/Pages |
|------|----------|--------|-------------|
| SVC-AUTH-001 | P0 | M (3-4h) | Auth flow, 6 pages |
| SVC-AUTH-002 | P1 | M (4-6h) | 10 admin pages |
| SVC-AUTH-003 | P0 | M (2-3h) | 4 hooks |
| SVC-AUTH-004 | P1 | M (3-4h) | 15+ tests |
| SVC-CRM-001 | P0 | M (2-3h) | 5 hooks |
| SVC-CRM-002 | P1 | M (4-6h) | 9+ pages |
| SVC-CRM-003 | P1 | M (2-3h) | Pipeline flow |
| SVC-CRM-004 | P1 | M (3-4h) | 15+ tests |
| **TOTAL** | | **30-40h** | **19 hooks + 19 pages** |

### Execution Order
1. SVC-AUTH-003 + SVC-CRM-001 (hook fixes — unblocks page work)
2. SVC-AUTH-001 (auth flow — critical path)
3. SVC-AUTH-002 + SVC-CRM-002 (page quality — can parallelize)
4. SVC-CRM-003 (pipeline polish)
5. SVC-AUTH-004 + SVC-CRM-004 (tests — do after fixes stabilize)
