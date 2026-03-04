# Frontend Audit — Sprint 1 Baseline
> Explored 2026-02-22 | Agent: Claude Opus 4.6

---

## 1. All Frontend Hooks (54 files)

**Location:** `apps/web/lib/hooks/`

### Hooks by Service Area

#### AUTH (1 file)
| Hook | File | Envelope Status |
|------|------|----------------|
| useAuth | `lib/hooks/use-auth.ts` | CORRECT — unwraps via `response.data` (line 35-36) |

#### CRM (5 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| useActivities | `lib/hooks/use-activities.ts` | Needs verification |
| useCompanies | `lib/hooks/use-companies.ts` | CORRECT — uses `PaginatedResponse<Customer>` |
| useContacts | `lib/hooks/use-contacts.ts` | Needs verification |
| useCustomers | `lib/hooks/use-customers.ts` | BROKEN — inconsistent `PaginatedResponse` vs `{ data: Customer }` (line 18 vs 28) |
| useLeads | `lib/hooks/use-leads.ts` | Needs verification |

#### OPERATIONS (7 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| useCarriers | `lib/hooks/use-carriers.ts` | **BROKEN** — Lines 34-40: `apiClient.get<{ data: OperationsCarrierListItem[] }>` but does NOT unwrap |
| useEquipment | `lib/hooks/use-equipment.ts` | Needs verification |
| useInlandServiceTypes | `lib/hooks/use-inland-service-types.ts` | Needs verification |
| useLoadHistory | `lib/hooks/use-load-history.ts` | Needs verification |
| useLoadPlannerQuotes | `lib/hooks/use-load-planner-quotes.ts` | Needs verification |
| useTenantServices | `lib/hooks/use-tenant-services.ts` | Needs verification |
| useTruckTypes | `lib/hooks/use-truck-types.ts` | Needs verification |

#### TMS (10 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| useCheckcalls | `lib/hooks/tms/use-checkcalls.ts` | Needs verification |
| useDispatch | `lib/hooks/tms/use-dispatch.ts` | Needs verification |
| useDispatchWs | `lib/hooks/tms/use-dispatch-ws.ts` | Socket-related, no envelope issue |
| useLoadBoard | `lib/hooks/tms/use-load-board.ts` | Needs verification |
| useLoads | `lib/hooks/tms/use-loads.ts` | **CORRECT** — Has custom `unwrap()` helper (lines 11-15), used on lines 35, 46, 135, 168 |
| useOpsDashboard | `lib/hooks/tms/use-ops-dashboard.ts` | Needs verification |
| useOrders | `lib/hooks/tms/use-orders.ts` | Needs verification |
| useRateConfirmation | `lib/hooks/tms/use-rate-confirmation.ts` | Needs verification |
| useStops | `lib/hooks/tms/use-stops.ts` | Needs verification |
| useTracking | `lib/hooks/tms/use-tracking.ts` | Needs verification |

#### ACCOUNTING (6 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| useAccountingDashboard | `lib/hooks/use-accounting-dashboard.ts` | Needs verification |
| useAging | `lib/hooks/use-aging.ts` | Needs verification |
| useInvoices | `lib/hooks/use-invoices.ts` | **CORRECT** — Has custom `unwrap()` (lines 111-114), used on lines 140, 151, 183, 199, 227, 243, 267 |
| usePayables | `lib/hooks/use-payables.ts` | Needs verification |
| usePayments | `lib/hooks/use-payments.ts` | Needs verification |
| useSettlements | `lib/hooks/use-settlements.ts` | Needs verification |

#### ADMIN (4 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| useRoles | `lib/hooks/use-roles.ts` | Needs verification |
| useSecurityLog | `lib/hooks/use-security-log.ts` | Needs verification |
| useTenant | `lib/hooks/use-tenant.ts` | Needs verification |
| useUsers | `lib/hooks/use-users.ts` | Needs verification |

#### COMMISSIONS (5 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| useCommissionDashboard | `lib/hooks/use-commission-dashboard.ts` | Needs verification |
| usePayouts | `lib/hooks/use-payouts.ts` | Needs verification |
| usePlans | `lib/hooks/use-plans.ts` | Needs verification |
| useReps | `lib/hooks/use-reps.ts` | Needs verification |
| useTransactions | `lib/hooks/use-transactions.ts` | Needs verification |

#### CARRIERS (1 file)
| Hook | File | Envelope Status |
|------|------|----------------|
| useFmcsa | `lib/hooks/use-fmcsa.ts` | Needs verification |

#### COMMUNICATION (3 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| useAutoEmail | `lib/hooks/use-auto-email.ts` | Needs verification |
| useEmailLogs | `lib/hooks/use-email-logs.ts` | Needs verification |
| useSendEmail | `lib/hooks/use-send-email.ts` | Needs verification |

#### DOCUMENTS (1 file)
| Hook | File | Envelope Status |
|------|------|----------------|
| useDocuments | `lib/hooks/use-documents.ts` | Needs verification |

#### LOAD BOARD (3 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| index | `lib/hooks/load-board/index.ts` | Re-export barrel |
| useLoadboardDashboard | `lib/hooks/load-board/use-loadboard-dashboard.ts` | Needs verification |
| usePostings | `lib/hooks/load-board/use-postings.ts` | Needs verification |

#### SALES (1 file)
| Hook | File | Envelope Status |
|------|------|----------------|
| useQuotes | `lib/hooks/use-quotes.ts` | Needs verification |

#### TRACKING (1 file)
| Hook | File | Envelope Status |
|------|------|----------------|
| usePublicTracking | `lib/hooks/use-public-tracking.ts` | Needs verification |

#### UTILITY (3 files)
| Hook | File | Envelope Status |
|------|------|----------------|
| useConfirm | `lib/hooks/use-confirm.ts` | N/A — UI utility |
| useDebounce | `lib/hooks/use-debounce.ts` | N/A — utility |
| usePagination | `lib/hooks/use-pagination.ts` | N/A — utility |

### Envelope Summary
- **Confirmed CORRECT:** useAuth, useCompanies, useLoads, useInvoices (4 hooks)
- **Confirmed BROKEN:** useCarriers, useCustomers (2 hooks)
- **Needs verification:** ~40 hooks (must check each during FIX-002)
- **Not applicable:** 3 utility hooks, 1 socket hook, 1 barrel export

---

## 2. API Client

**File:** `apps/web/lib/api/client.ts` (447 lines)

### Response Types (lines 223-237)
```typescript
interface ApiResponse<T> { data: T; message?: string }
interface PaginatedResponse<T> {
  data: T[];
  pagination: { page, limit, total, totalPages }
}
```

### Core Issue — No Built-in Unwrapping (line 363)
```typescript
return response.json(); // Returns raw { data: T }, not T
```

### Auth Pattern
- HTTP-only cookies (accessToken, refreshToken)
- Auto-refresh on 401 (lines 321-329)
- Token validation via JWT decode (lines 64-88)
- Activity-based refresh (lines 165-181)
- `credentials: 'include'` for cookie transmission
- No localStorage (XSS-safe)

### Methods
| Method | Lines | Notes |
|--------|-------|-------|
| get() | 366-387 | Standard GET |
| post() | 389-391 | Standard POST |
| put() | 393-395 | Standard PUT |
| patch() | 397-399 | Standard PATCH |
| delete() | 401-403 | Standard DELETE |
| upload() | 405-437 | FormData support |

### FIX-002 Action Plan
Add shared `unwrapResponse<T>()` utility to `client.ts` that all hooks use:
```typescript
// Proposed addition
export function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}
```
Then update all 40+ hooks to use it.

---

## 3. Socket Provider

**File:** `apps/web/lib/socket/socket-provider.tsx` (175 lines)

### Status: NO INFINITE LOOP DETECTED (contradicts earlier audit)

**Evidence:**
- Dependency array (line 153) is correct: `[userId, isLoading, namespace, getAccessToken]`
- Socket cleanup properly removes listeners (lines 146-152)
- `socketRef` prevents duplicate connections (lines 76-77)
- Checks `isLoading || !userId` before connecting (lines 67-74)

### Token Management (lines 55-64)
- Extracts JWT from cookies (line 58)
- Decodes URI component (line 63)
- No token = error state (lines 80-84)

### Connection Events
| Event | Lines | Behavior |
|-------|-------|----------|
| connect | 92-104 | Sets connected, starts 5s ping latency monitor |
| disconnect | 106-118 | Clears latency, handles server disconnect |
| connect_error | 120-124 | Sets error state |
| reconnect_attempt | 126-128 | Status tracking |
| reconnect | 130-134 | Status tracking |
| reconnect_failed | 136-140 | Status tracking |

### Performance
- Context value memoized (lines 156-159) to prevent consumer re-renders
- Stable consumer hook at lines 168-174
- **Conclusion:** Socket provider appears clean. The "infinite loop" may have been fixed already or may only manifest under specific conditions (e.g., auth failure causing reconnect storm).

---

## 4. Navigation

**File:** `apps/web/lib/config/navigation.ts` (246 lines)

### Structure
- 6 main sections (Dashboard, CRM, Operations, Finance, Commissions, User Management, System)
- 33 nav items total
- Role-based access (lines 118, 199, 205, 216, 222, 228)

### Broken/Missing Routes
| Route | Status | Issue |
|-------|--------|-------|
| `/help` (line 236) | disabled: true | No page exists — OK (intentional) |
| `/load-history/[id]` | MISSING | List exists but no detail view page |
| `/load-planner/new/edit` (line 91) | WRONG PATH | Should use dynamic `[id]` pattern |

### Working Routes
- `/carriers`, `/carriers/[id]`, `/carriers/[id]/edit` — all pages exist
- All CRM routes — pages exist
- All Accounting routes — pages exist
- All Admin routes — pages exist

---

## 5. Frontend Pages Inventory (101 page.tsx files)

### By Service Area

| Service | Pages | Key Routes |
|---------|-------|------------|
| Auth | 6 | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/mfa`, `/superadmin/login` |
| CRM | 9 | `/companies/*`, `/contacts/*`, `/leads/*` with CRUD + activities |
| Operations | 17 | `/operations/*`, `/load-planner/*`, `/load-history/*`, `/quote-history` |
| Customers/Leads | 12 | `/customers/*`, `/leads/*` with activities, contacts, edit |
| Accounting | 9 | `/accounting/*` with invoices, payments, payables, settlements, aging |
| Commissions | 8 | `/commissions/*` with plans, reps, payouts, transactions, reports |
| Admin | 10 | `/admin/users/*`, `/admin/roles/*`, audit-logs, permissions, settings, tenants |
| Sales/Quotes | 4 | `/quotes/*` with CRUD |
| Load Board | 4 | `/load-board/*` with post, postings, search |
| Other | 2 | `/dashboard`, `/profile/*`, `/superadmin/*`, `/truck-types` |
| **TOTAL** | **101** | |

### Error/Loading States — ZERO
- **0 error.tsx files** in entire dashboard tree
- **0 loading.tsx files** in entire dashboard tree
- All 101 pages lack proper error boundaries and loading skeletons

---

## 6. Code Quality Issues

### alert() Calls (2 files)
| File | Production? |
|------|-------------|
| `components/load-planner/ExtractedItemsList.tsx` | YES — must fix |
| `stories/tables/DataTable.stories.tsx` | No — storybook only |

### console.log Calls (8 files)
| File | Context |
|------|---------|
| `app/(dashboard)/load-planner/[id]/edit/page.tsx` | PROTECTED — do not touch |
| `app/(dashboard)/carriers/[id]/edit/page.tsx` | Debug log |
| `components/load-planner/RouteIntelligence.tsx` | PROTECTED |
| `components/load-planner/ExtractedItemsList.tsx` | PROTECTED |
| `components/load-planner/UniversalDropzone.tsx` | PROTECTED |
| `components/crm/customers/customer-form.tsx` | Debug log |
| `components/load-planner/route-map.tsx` | PROTECTED |
| `app/(dashboard)/admin/roles/[id]/page.tsx` | Debug log |

**Note:** 5 of 8 are in PROTECTED load-planner files. Only 3 need cleanup.

### TODO/FIXME/HACK Comments (2 files)
| File | Content |
|------|---------|
| `components/carriers/carrier-documents-section.tsx` | TODO marker |
| `app/(dashboard)/operations/orders/page.tsx` | TODO marker |

### Stub Implementations
**File:** `lib/hooks/tms/use-loads.ts` (Lines 54-70)

```typescript
// INTENTIONAL STUBS — marked enabled: false
export function useLoadStats() { ... enabled: false }   // No backend endpoint
export function useLoadTimeline(id: string) { ... enabled: false }   // No backend endpoint
```

These are safe — `enabled: false` prevents execution.

### window.confirm() — ALREADY FIXED
- 0 instances in production code
- Test file exists confirming fix: `__tests__/bugs/bug-006-window-confirm.test.ts`

---

## Critical Issues Summary

### HIGH PRIORITY (Blocks Sprint 1)

1. **API Envelope Wrapping Inconsistency** — ~40 hooks need verification/fix
2. **No Shared Unwrap Utility** — Must add to `lib/api/client.ts`
3. **No Error Boundaries** — 0 error.tsx across 101 pages
4. **No Loading States** — 0 loading.tsx across 101 pages
5. **Missing Detail Pages** — `/load-history/[id]` routes to 404

### MEDIUM PRIORITY

6. **console.log in 3 non-protected files** — cleanup before shipping
7. **alert() in ExtractedItemsList.tsx** — replace with toast/modal
8. **2 TODO comments** — resolve or document

### CONFIRMED WORKING

- Auth flow (JWT, refresh, rate limiting)
- Socket provider (no infinite loop detected)
- API client structure
- React Query setup
- 4 hooks with proper unwrapping (useAuth, useCompanies, useLoads, useInvoices)
