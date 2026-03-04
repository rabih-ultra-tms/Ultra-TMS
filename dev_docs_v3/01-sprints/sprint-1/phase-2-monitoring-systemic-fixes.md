# Sprint 1 — Phase 2: Monitoring & Systemic Fixes (Weeks 3-4)
> 9 tasks | 30-40h estimated | Depends on: Phase 1 complete

---

## MON-001: Error Tracking (Sentry) [P0]
**Effort:** M (4-6h) | **Blocks:** production visibility

### Context
Zero error tracking. Errors in production are invisible. No aggregation, no alerting, no source maps.

### Sub-tasks

#### MON-001a: Install Sentry for NestJS Backend
**File:** `apps/api/package.json` + new `apps/api/src/common/sentry/`

```bash
cd apps/api && pnpm add @sentry/nestjs @sentry/profiling-node
```

**Create:** `apps/api/src/common/sentry/sentry.module.ts`
```typescript
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 0.1,
  integrations: [
    Sentry.prismaIntegration(),
  ],
});
```

**Create:** `apps/api/src/common/filters/sentry-exception.filter.ts`
```typescript
@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    Sentry.captureException(exception);
    super.catch(exception, host);
  }
}
```

Register in `main.ts`:
```typescript
app.useGlobalFilters(new SentryExceptionFilter(app.getHttpAdapter()));
```

#### MON-001b: Install Sentry for Next.js Frontend
```bash
cd apps/web && npx @sentry/wizard@latest -i nextjs
```

This creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.js` wrapped with `withSentryConfig`

#### MON-001c: Configure Source Maps
**File:** `apps/web/next.config.js`

```javascript
const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(nextConfig, {
  org: 'ultra-tms',
  project: 'ultra-tms-web',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
});
```

#### MON-001d: Add Sentry Environment Variables
**Files:** `.env`, `.env.example`

```env
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=ultra-tms
SENTRY_PROJECT=ultra-tms-api
SENTRY_AUTH_TOKEN=sntrys_xxx
```

#### MON-001e: Test Error Capture
- Throw intentional error in API endpoint → verify appears in Sentry
- Throw error in React component → verify appears in Sentry
- Verify source maps resolve to original TypeScript

### Acceptance Criteria
- [ ] Backend errors appear in Sentry within 30 seconds
- [ ] Frontend errors appear in Sentry within 30 seconds
- [ ] Source maps resolve to original TypeScript lines
- [ ] Error context includes: user ID, tenant ID, correlation ID
- [ ] Performance traces for API requests

---

## MON-002: Structured Logging (Pino) [P1]
**Effort:** M (3-4h)

### Context
Current logging uses NestJS Logger (console output). No JSON structure, no file output, no log levels in production. Correlation IDs exist (middleware) but logs aren't aggregatable.

### Sub-tasks

#### MON-002a: Install Pino
```bash
cd apps/api && pnpm add nestjs-pino pino pino-pretty pino-http
```

#### MON-002b: Configure Pino Logger
**Create:** `apps/api/src/common/logger/logger.module.ts`

```typescript
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            correlationId: req.headers['x-correlation-id'],
          }),
        },
        customProps: (req) => ({
          tenantId: req.user?.tenantId,
          userId: req.user?.id,
          correlationId: req.headers['x-correlation-id'],
        }),
      },
    }),
  ],
})
export class AppLoggerModule {}
```

#### MON-002c: Replace Console Logs
- Remove `RequestLoggingMiddleware` (Pino HTTP handles this)
- Update `app.module.ts` to import `AppLoggerModule`
- Search and replace `console.log` in API code:
  ```bash
  grep -r "console.log\|console.warn\|console.error" apps/api/src/ --include="*.ts" -l
  ```

#### MON-002d: Add Log Rotation (Production)
For production, configure pino to write to files with rotation:
```typescript
// Production transport
transport: {
  targets: [
    { target: 'pino/file', options: { destination: '/var/log/ultra-tms/app.log' } },
    { target: '@sentry/pino-transport', options: { sentry: { dsn: process.env.SENTRY_DSN } } },
  ],
},
```

### Acceptance Criteria
- [ ] All logs are JSON in production
- [ ] Every log entry includes correlationId, tenantId, userId
- [ ] Zero `console.log` in production code (excluding test files)
- [ ] Pino pretty-prints in development
- [ ] HTTP requests auto-logged with timing

---

## MON-003: Uptime Monitoring [P1]
**Effort:** S (1h)

### Context
No external monitoring of whether the app is up. If it goes down, nobody knows until a user reports it.

### Sub-tasks
1. **MON-003a:** Choose and configure uptime service (UptimeRobot, BetterStack, or Checkly — all have free tiers)
2. **MON-003b:** Configure check against `/ready` endpoint (not `/health`)
3. **MON-003c:** Set up alerting: email + Slack on downtime
4. **MON-003d:** Configure 1-minute check interval

### Acceptance Criteria
- [ ] External service pings `/ready` every 60 seconds
- [ ] Alert fires within 2 minutes of downtime
- [ ] Alert includes which dependency failed (DB vs Redis)

---

## FIX-001: SocketProvider Infinite Loop [P0 CRITICAL]
**Effort:** M (4-6h) | **Blocks:** dispatch board, tracking, notifications

### Context
The 2026-02-16 audit flagged SocketProvider as having an infinite loop. Our 2026-02-22 exploration found the current code looks clean (no obvious loop). This task needs to **verify under real conditions** and fix if the loop manifests.

### File
`apps/web/lib/socket/socket-provider.tsx` (175 lines)

### Sub-tasks

#### FIX-001a: Reproduce the Loop
1. Start API + Web locally
2. Open dispatch board (`/operations/dispatch`)
3. Open browser DevTools → Performance tab
4. Monitor for 5 minutes:
   - Watch network tab for rapid WebSocket reconnections
   - Watch memory usage for growth
   - Watch console for repeated connection/disconnection logs

#### FIX-001b: Check Auth Failure Reconnect Storm
The most likely cause: if `getAccessToken` returns null (expired cookie), socket tries to connect, gets rejected, triggers reconnect, which calls `getAccessToken` again... forever.

Check lines 80-84:
```typescript
if (!token) {
  setError(new Error('No auth token'));
  setStatus('error');
  return;  // Does this actually prevent reconnect?
}
```

Verify that socket.io's built-in reconnect doesn't bypass this check.

#### FIX-001c: Fix if Loop Exists
Add reconnect limits:
```typescript
const socket = io(wsUrl, {
  auth: { token },
  reconnection: true,
  reconnectionAttempts: 5,  // Limit reconnect attempts
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
});
```

Add: on `reconnect_failed`, clear socketRef and stop:
```typescript
socket.on('reconnect_failed', () => {
  setStatus('disconnected');
  setError(new Error('Unable to reconnect after 5 attempts'));
  socketRef.current = null;
});
```

#### FIX-001d: Add Memory Leak Detection
```typescript
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const interval = setInterval(() => {
      const mb = (performance as any).memory?.usedJSHeapSize / 1024 / 1024;
      if (mb > 200) console.warn(`[Socket] Memory usage high: ${mb.toFixed(0)}MB`);
    }, 10000);
    return () => clearInterval(interval);
  }
}, []);
```

### Acceptance Criteria
- [ ] Dispatch board open for 5+ minutes without memory growth
- [ ] No rapid reconnection loops in network tab
- [ ] Auth failure → graceful degradation (show "reconnecting" banner, not infinite loop)
- [ ] Max 5 reconnect attempts before stopping

---

## FIX-002: API Envelope Unwrapping (40+ Hooks) [P0 CRITICAL]
**Effort:** L (6-8h) | **Blocks:** ALL service quality passes in Phases 3-5

### Context
The API returns `{ data: T, message?: string }` for single items and `{ data: T[], pagination: {...} }` for lists. The `apiClient.request()` method returns raw JSON (line 363: `return response.json()`). Some hooks manually unwrap, most don't.

**Root cause:** `apiClient` doesn't auto-unwrap. Two hooks (useLoads, useInvoices) have local `unwrap()` functions. The rest pass the envelope through, causing components to receive `{ data: T }` instead of `T`.

### File to Modify
`apps/web/lib/api/client.ts` (447 lines)

### Sub-tasks

#### FIX-002a: Add Shared Unwrap Utility to API Client
**File:** `apps/web/lib/api/client.ts`

Add after line 237 (after interface definitions):
```typescript
/**
 * Unwrap API envelope { data: T } → T
 * Use: const user = await unwrap(apiClient.get<ApiResponse<User>>('/users/1'));
 */
export function unwrap<T>(response: ApiResponse<T>): T {
  return response.data;
}

/**
 * Unwrap paginated response, returning both data and pagination
 */
export function unwrapPaginated<T>(response: PaginatedResponse<T>): {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
} {
  return { items: response.data, pagination: response.pagination };
}
```

#### FIX-002b: Audit and Fix Each Hook
For each hook file, check if it unwraps the API response. Fix pattern:

**Before (broken):**
```typescript
queryFn: async () => {
  return apiClient.get<{ data: Carrier[] }>('/carriers');
  // Returns { data: Carrier[] } — component gets envelope
},
```

**After (fixed):**
```typescript
queryFn: async () => {
  const response = await apiClient.get<ApiResponse<Carrier[]>>('/carriers');
  return unwrap(response);
  // Returns Carrier[] — component gets clean data
},
```

#### FIX-002c: Hook-by-Hook Fix List

**AUTH hooks (1 file):**
| Hook | File | Status | Action |
|------|------|--------|--------|
| useAuth | `lib/hooks/use-auth.ts` | CORRECT | No change |

**CRM hooks (5 files):**
| Hook | File | Status | Action |
|------|------|--------|--------|
| useActivities | `lib/hooks/use-activities.ts` | VERIFY | Check & fix if needed |
| useCompanies | `lib/hooks/use-companies.ts` | CORRECT | No change |
| useContacts | `lib/hooks/use-contacts.ts` | VERIFY | Check & fix if needed |
| useCustomers | `lib/hooks/use-customers.ts` | BROKEN | Fix line 28 |
| useLeads | `lib/hooks/use-leads.ts` | VERIFY | Check & fix if needed |

**OPERATIONS hooks (7 files):**
| Hook | File | Status | Action |
|------|------|--------|--------|
| useCarriers | `lib/hooks/use-carriers.ts` | BROKEN | Fix lines 34-40 |
| useEquipment | `lib/hooks/use-equipment.ts` | VERIFY | Check & fix |
| useInlandServiceTypes | `lib/hooks/use-inland-service-types.ts` | VERIFY | Check & fix |
| useLoadHistory | `lib/hooks/use-load-history.ts` | VERIFY | Check & fix |
| useLoadPlannerQuotes | `lib/hooks/use-load-planner-quotes.ts` | VERIFY | Check & fix |
| useTenantServices | `lib/hooks/use-tenant-services.ts` | VERIFY | Check & fix |
| useTruckTypes | `lib/hooks/use-truck-types.ts` | VERIFY | Check & fix |

**TMS hooks (10 files):**
| Hook | File | Status | Action |
|------|------|--------|--------|
| useCheckcalls | `lib/hooks/tms/use-checkcalls.ts` | VERIFY | Check & fix |
| useDispatch | `lib/hooks/tms/use-dispatch.ts` | VERIFY | Check & fix |
| useDispatchWs | `lib/hooks/tms/use-dispatch-ws.ts` | N/A | Socket, not REST |
| useLoadBoard | `lib/hooks/tms/use-load-board.ts` | VERIFY | Check & fix |
| useLoads | `lib/hooks/tms/use-loads.ts` | CORRECT | Has local unwrap() — keep or migrate to shared |
| useOpsDashboard | `lib/hooks/tms/use-ops-dashboard.ts` | VERIFY | Check & fix |
| useOrders | `lib/hooks/tms/use-orders.ts` | VERIFY | Check & fix |
| useRateConfirmation | `lib/hooks/tms/use-rate-confirmation.ts` | VERIFY | Check & fix |
| useStops | `lib/hooks/tms/use-stops.ts` | VERIFY | Check & fix |
| useTracking | `lib/hooks/tms/use-tracking.ts` | VERIFY | Check & fix |

**ACCOUNTING hooks (6 files):**
| Hook | File | Status | Action |
|------|------|--------|--------|
| useAccountingDashboard | `lib/hooks/use-accounting-dashboard.ts` | VERIFY | Check & fix |
| useAging | `lib/hooks/use-aging.ts` | VERIFY | Check & fix |
| useInvoices | `lib/hooks/use-invoices.ts` | CORRECT | Has local unwrap() — keep or migrate |
| usePayables | `lib/hooks/use-payables.ts` | VERIFY | Check & fix |
| usePayments | `lib/hooks/use-payments.ts` | VERIFY | Check & fix |
| useSettlements | `lib/hooks/use-settlements.ts` | VERIFY | Check & fix |

**ADMIN hooks (4 files):**
| Hook | File | Status | Action |
|------|------|--------|--------|
| useRoles | `lib/hooks/use-roles.ts` | VERIFY | Check & fix |
| useSecurityLog | `lib/hooks/use-security-log.ts` | VERIFY | Check & fix |
| useTenant | `lib/hooks/use-tenant.ts` | VERIFY | Check & fix |
| useUsers | `lib/hooks/use-users.ts` | VERIFY | Check & fix |

**COMMISSION hooks (5 files):**
| Hook | File | Status | Action |
|------|------|--------|--------|
| useCommissionDashboard | `lib/hooks/use-commission-dashboard.ts` | VERIFY | Check & fix |
| usePayouts | `lib/hooks/use-payouts.ts` | VERIFY | Check & fix |
| usePlans | `lib/hooks/use-plans.ts` | VERIFY | Check & fix |
| useReps | `lib/hooks/use-reps.ts` | VERIFY | Check & fix |
| useTransactions | `lib/hooks/use-transactions.ts` | VERIFY | Check & fix |

**OTHER hooks (9 files):**
| Hook | File | Status | Action |
|------|------|--------|--------|
| useFmcsa | `lib/hooks/use-fmcsa.ts` | VERIFY | Check & fix |
| useAutoEmail | `lib/hooks/use-auto-email.ts` | VERIFY | Check & fix |
| useEmailLogs | `lib/hooks/use-email-logs.ts` | VERIFY | Check & fix |
| useSendEmail | `lib/hooks/use-send-email.ts` | VERIFY | Check & fix |
| useDocuments | `lib/hooks/use-documents.ts` | VERIFY | Check & fix |
| useLoadboardDashboard | `lib/hooks/load-board/use-loadboard-dashboard.ts` | VERIFY | Check & fix |
| usePostings | `lib/hooks/load-board/use-postings.ts` | VERIFY | Check & fix |
| useQuotes | `lib/hooks/use-quotes.ts` | VERIFY | Check & fix |
| usePublicTracking | `lib/hooks/use-public-tracking.ts` | VERIFY | Check & fix |

**Total: 47 hooks to verify, ~40 likely need fixing**

#### FIX-002d: Remove Local Unwrap Functions
After migrating to shared utility, remove local `unwrap()` from:
- `lib/hooks/tms/use-loads.ts` (lines 11-15)
- `lib/hooks/use-invoices.ts` (lines 111-114)

Replace with import: `import { unwrap } from '@/lib/api/client';`

#### FIX-002e: Write Test for Unwrap Utility
**Create:** `apps/web/__tests__/lib/api/unwrap.test.ts`

```typescript
import { unwrap, unwrapPaginated } from '@/lib/api/client';

test('unwrap extracts data from envelope', () => {
  expect(unwrap({ data: { id: 1, name: 'Test' }, message: 'ok' })).toEqual({ id: 1, name: 'Test' });
});

test('unwrapPaginated extracts items and pagination', () => {
  const response = { data: [{ id: 1 }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } };
  const result = unwrapPaginated(response);
  expect(result.items).toEqual([{ id: 1 }]);
  expect(result.pagination.total).toBe(1);
});
```

### Acceptance Criteria
- [ ] Shared `unwrap()` and `unwrapPaginated()` exported from client.ts
- [ ] All 47 hooks verified — each returns clean data (not envelope)
- [ ] Local unwrap functions removed from useLoads and useInvoices
- [ ] Test file for unwrap utility passes
- [ ] No component receives `{ data: T }` when it expects `T`

---

## FIX-003: Broken Navigation Links [P1]
**Effort:** S (2-3h)

### Context
Navigation config has routes that don't have matching pages. Users click and get 404.

### File to Audit
`apps/web/lib/config/navigation.ts` (246 lines)

### Sub-tasks

#### FIX-003a: Audit All Nav Routes Against Existing Pages
Cross-reference each `href` in navigation.ts against `apps/web/app/` page files.

**Known broken:**
| Nav Route | Issue | Fix |
|-----------|-------|-----|
| `/load-history/[id]` | No detail page exists | Create `app/(dashboard)/load-history/[id]/page.tsx` |
| `/load-planner/new/edit` (line 91) | Wrong path pattern | Fix to `/load-planner/new/edit` or create matching page |
| `/help` (line 236) | No page, `disabled: true` | OK — already disabled |

#### FIX-003b: Create Missing Detail Pages
For each broken route, create a minimal page that loads data and shows detail view.

#### FIX-003c: Verify All Working Routes
Click-test every nav item in the sidebar. Mark each as working or broken.

### Acceptance Criteria
- [ ] Every non-disabled sidebar link navigates to a valid page
- [ ] No 404 errors when clicking through navigation
- [ ] Missing detail pages created with proper data loading

---

## INFRA-007: Loading States (30+ Routes) [P1]
**Effort:** M (4-6h)

### Context
0 loading.tsx files across 101 pages. Navigation shows no feedback during page loads.

### Sub-tasks

#### INFRA-007a: Create Reusable Skeleton Components
**Create:** `apps/web/components/shared/skeletons/`

```
skeletons/
├── page-skeleton.tsx          # Full-page skeleton
├── table-skeleton.tsx         # Data table skeleton
├── form-skeleton.tsx          # Form page skeleton
├── detail-skeleton.tsx        # Detail/show page skeleton
├── dashboard-skeleton.tsx     # Dashboard with cards skeleton
└── index.ts                   # Barrel export
```

#### INFRA-007b: Add loading.tsx to Route Groups
Create `loading.tsx` files that use appropriate skeleton:

| Route Group | Skeleton Type | File |
|-------------|--------------|------|
| `app/(dashboard)/` | dashboard-skeleton | `loading.tsx` |
| `app/(dashboard)/operations/` | table-skeleton | `loading.tsx` |
| `app/(dashboard)/accounting/` | table-skeleton | `loading.tsx` |
| `app/(dashboard)/commissions/` | table-skeleton | `loading.tsx` |
| `app/(dashboard)/admin/` | table-skeleton | `loading.tsx` |
| `app/(dashboard)/companies/` | table-skeleton | `loading.tsx` |
| `app/(dashboard)/customers/` | table-skeleton | `loading.tsx` |
| `app/(dashboard)/leads/` | table-skeleton | `loading.tsx` |
| `app/(dashboard)/quotes/` | table-skeleton | `loading.tsx` |
| `app/(dashboard)/load-board/` | table-skeleton | `loading.tsx` |

#### INFRA-007c: Add Suspense Boundaries for Client Components
Wrap heavy client components with `<Suspense fallback={<Skeleton />}>`.

### Acceptance Criteria
- [ ] Every route group has a loading.tsx
- [ ] Navigation between sections shows skeleton
- [ ] Skeletons match the layout of the target page
- [ ] No blank/white screens during navigation

---

## INFRA-008: Feature Flags Foundation [P1]
**Effort:** S (2-3h)

### Context
Need a basic feature flag system to gate unreleased features (e.g., Load Board routes).

### Sub-tasks

#### INFRA-008a: Create Feature Flag Utility
**Create:** `apps/web/lib/feature-flags.ts`

```typescript
const FLAGS = {
  LOAD_BOARD: process.env.NEXT_PUBLIC_FF_LOAD_BOARD === 'true',
  ANALYTICS: process.env.NEXT_PUBLIC_FF_ANALYTICS === 'true',
  // Add more as needed
} as const;

export function isFeatureEnabled(flag: keyof typeof FLAGS): boolean {
  return FLAGS[flag] ?? false;
}
```

#### INFRA-008b: Create Feature Gate Component
**Create:** `apps/web/components/shared/feature-gate.tsx`

```typescript
export function FeatureGate({ flag, children, fallback }: {
  flag: keyof typeof FLAGS;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (!isFeatureEnabled(flag)) return fallback ?? null;
  return <>{children}</>;
}
```

#### INFRA-008c: Gate Load Board Routes
- Wrap Load Board nav items with `FeatureGate`
- Add middleware to block direct URL access to gated routes

#### INFRA-008d: Add Feature Flag Env Vars
```env
NEXT_PUBLIC_FF_LOAD_BOARD=true
NEXT_PUBLIC_FF_ANALYTICS=false
```

### Acceptance Criteria
- [ ] Load Board routes gated by `NEXT_PUBLIC_FF_LOAD_BOARD`
- [ ] Disabled features hidden from navigation
- [ ] Direct URL access to disabled features redirects to dashboard

---

## INFRA-009: CSRF Token Enforcement [P1]
**Effort:** M (2-3h)

### Context
No CSRF protection exists. Since the API uses Bearer tokens (not cookies for auth), CSRF risk is lower but still relevant for cookie-based sessions.

### Sub-tasks

#### INFRA-009a: Assess CSRF Risk
Check if auth tokens are transmitted via cookies or headers:
- **If cookies:** CSRF protection is critical — implement csurf
- **If Authorization header only:** CSRF risk is minimal — document the decision

From the security audit: tokens are in cookies (HttpOnly). This means CSRF IS a risk.

#### INFRA-009b: Implement CSRF Protection
**Option A — SameSite Cookie Policy:**
```typescript
// In auth service where cookies are set
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',  // Prevents CSRF
  path: '/',
});
```

**Option B — CSRF Token (more robust):**
```bash
cd apps/api && pnpm add csurf
```

#### INFRA-009c: Test CSRF Protection
- Attempt state-changing request from different origin → should fail (403)
- Same-origin request → should succeed

### Acceptance Criteria
- [ ] State-changing requests from different origins are rejected
- [ ] Same-origin requests work normally
- [ ] CSRF strategy documented (SameSite vs token)

---

## Phase 2 Summary

| Task | Priority | Effort | Sub-tasks |
|------|----------|--------|-----------|
| MON-001 | P0 | M (4-6h) | 5 |
| MON-002 | P1 | M (3-4h) | 4 |
| MON-003 | P1 | S (1h) | 4 |
| FIX-001 | P0 CRITICAL | M (4-6h) | 4 |
| FIX-002 | P0 CRITICAL | L (6-8h) | 5 (47 hooks to verify) |
| FIX-003 | P1 | S (2-3h) | 3 |
| INFRA-007 | P1 | M (4-6h) | 3 |
| INFRA-008 | P1 | S (2-3h) | 4 |
| INFRA-009 | P1 | M (2-3h) | 3 |
| **TOTAL** | | **30-40h** | **35 sub-tasks** |

### Execution Order (dependency-aware)
1. FIX-002 (envelope unwrapping) — **most critical, blocks all service passes**
2. FIX-001 (socket provider) — blocks dispatch board work
3. MON-001 (Sentry) — get visibility before fixing more
4. MON-002 (Pino) — replace console.log
5. FIX-003 (navigation) — quick fixes
6. INFRA-007 (loading states) — UX improvement
7. INFRA-008 (feature flags) — quick utility
8. INFRA-009 (CSRF) — security hardening
9. MON-003 (uptime) — external service setup
