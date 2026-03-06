# Sprint 2 — Phase 2: Go-Live & Stabilization (Weeks 15-16)
> 6 tasks | 20-30h estimated | Prereq: Phase 1 complete, Sprint 1 tagged v1.0.0

---

## LAUNCH-005: Deploy to Production [P0]
**Effort:** M (4-6h)

### Sub-tasks

#### LAUNCH-005a: Create production Dockerfiles

**Create:** `apps/api/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
RUN corepack enable && pnpm install --frozen-lockfile
COPY apps/api/ apps/api/
RUN cd apps/api && pnpm prisma:generate && pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

**Create:** `apps/web/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
RUN corepack enable && pnpm install --frozen-lockfile
COPY apps/web/ apps/web/
RUN cd apps/web && pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

#### LAUNCH-005b: Create production docker-compose
**Create:** `docker-compose.prod.yml`
```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3001:3001"
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    env_file: .env.production
    depends_on:
      - api
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ultra_tms_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certs:/etc/letsencrypt
    depends_on:
      - api
      - web
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### LAUNCH-005c: Deploy to production server
1. SSH into production server
2. Clone repo (or pull latest)
3. Copy `.env.production` with real secrets
4. `docker compose -f docker-compose.prod.yml up -d --build`
5. Wait for all services healthy

#### LAUNCH-005d: Verify all health endpoints
```bash
curl https://app.ultratms.com/api/v1/health
# Expected: { "status": "ok", "database": "connected", "redis": "connected" }

curl https://app.ultratms.com
# Expected: 200 with HTML
```

#### LAUNCH-005e: Run smoke test
1. Login with admin credentials
2. Navigate to dashboard — verify data loads
3. Create a test load — verify CRUD works
4. Navigate to all 8 service areas — no errors
5. Check Sentry for any errors during smoke test

#### LAUNCH-005f: Point DNS to production
- Update DNS A record to production server IP
- Verify propagation (`dig app.ultratms.com`)
- Test from external network (not just local)

### Acceptance Criteria
- [ ] App accessible at production URL
- [ ] Health endpoints return 200
- [ ] Login flow works
- [ ] Basic CRUD operations work
- [ ] No Sentry errors during smoke test

---

## STAB-001: First 48h Monitoring [P0]
**Effort:** M (4-6h) | Zero SEV1/SEV2

### Sub-tasks

#### STAB-001a: Monitor Sentry for errors
- Check Sentry dashboard every 4 hours for first 48h
- Triage new errors by severity
- SEV1/SEV2 → immediate fix
- SEV3/SEV4 → track in GitHub issues

#### STAB-001b: Monitor uptime service
- Verify no downtime alerts
- Check response time trends

#### STAB-001c: Check API response times
```bash
# Monitor p95 response times
# Target: p95 < 500ms for all endpoints
```
Key endpoints to watch:
- `/api/v1/loads` — list loads (data-heavy)
- `/api/v1/dashboard` — aggregation queries
- `/api/v1/carriers` — list with search

#### STAB-001d: Check database connection pool
- Monitor active connections vs pool size
- Adjust pool size if utilization > 80%
- Watch for connection leaks (growing active count)

#### STAB-001e: Check resource utilization
- Disk space: < 80% utilized
- Memory: < 80% utilized
- CPU: < 70% average
- Set alerts for threshold breaches

#### STAB-001f: Document findings
Create: `Ultra-TMS/dev_docs_v3/04-business/launch-monitoring-log.md`
Log every issue found with timestamp, severity, resolution.

### Acceptance Criteria
- [ ] Zero SEV1 (complete outage) in 48h
- [ ] Zero SEV2 (major feature broken) in 48h
- [ ] p95 response time < 500ms
- [ ] Error rate < 0.1%
- [ ] Monitoring log documented

---

## STAB-002: Bug Fix Sprint [P0]
**Effort:** M (4-6h) | Fix issues found in first 48h

### Sub-tasks

#### STAB-002a: Triage all Sentry errors by severity
| Severity | Criteria | Response Time |
|---------|---------|--------------|
| SEV1 | Complete outage, data loss | 15 min |
| SEV2 | Major feature broken for all users | 1 hour |
| SEV3 | Minor feature broken, workaround exists | 4 hours |
| SEV4 | Cosmetic, low-impact | 24 hours |

#### STAB-002b: Fix SEV1/SEV2 issues immediately
- Hotfix branch from main
- Fix → test → deploy
- Document root cause

#### STAB-002c: Create GitHub issues for SEV3/SEV4
- Label with severity
- Assign to next sprint if not critical

#### STAB-002d: Deploy hotfixes
```bash
git checkout -b hotfix/issue-description
# ... fix ...
git push origin hotfix/issue-description
gh pr create --title "fix: description" --body "..."
# Merge → deploy
```

### Acceptance Criteria
- [ ] All SEV1/SEV2 resolved
- [ ] SEV3/SEV4 tracked in GitHub issues
- [ ] Root cause documented for each SEV1/SEV2

---

## STAB-003: Performance Tuning [P1]
**Effort:** S (2-3h) | p95 < 500ms

### Sub-tasks

#### STAB-003a: Identify slow endpoints from production logs
```sql
-- Check Prisma query logs for slow queries (>100ms)
-- Or use Sentry performance monitoring
```

#### STAB-003b: Add database indexes for slow queries
Common indexes needed:
```prisma
@@index([tenantId, status])        // Most list queries filter by tenant + status
@@index([tenantId, createdAt])     // Time-based queries
@@index([tenantId, companyId])     // Company lookups
@@index([tenantId, carrierId])     // Carrier lookups
@@index([email])                   // Auth lookups
```

#### STAB-003c: Configure Prisma connection pooling
In `apps/api/src/prisma/prisma.service.ts`:
```typescript
// Ensure connection pooling is configured
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=10',
    },
  },
});
```

#### STAB-003d: React Query staleTime tuning
```typescript
// In query client config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s default
      gcTime: 300_000,          // 5min garbage collection
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      retry: 1,                   // Only retry once
    },
  },
});
```

### Acceptance Criteria
- [ ] All API endpoints p95 < 500ms
- [ ] Database queries < 100ms
- [ ] Connection pooling configured
- [ ] React Query prevents unnecessary refetches

---

## LAUNCH-006: Onboarding Flow [P1]
**Effort:** M (4-6h)

### Sub-tasks

#### LAUNCH-006a: Create first-login setup wizard
**Create:** `apps/web/app/(dashboard)/setup/page.tsx`
**Create:** `apps/web/components/onboarding/setup-wizard.tsx`

Steps:
1. **Company Info** — name, address, MC#, DOT#, phone, email
2. **Settings** — timezone, currency (USD), date format (MM/DD/YYYY), measurement units
3. **Invite Users** — email addresses for first team members with role selection
4. **Quick Tour** — guided overlay pointing to key areas (sidebar, dispatch, carriers)

```typescript
// Setup wizard state
type SetupStep = 'company' | 'settings' | 'invite' | 'tour';

function SetupWizard() {
  const [step, setStep] = useState<SetupStep>('company');
  const { data: tenant } = useTenant();

  // Skip if already completed
  if (tenant?.setupCompleted) redirect('/dashboard');

  return (
    <div className="max-w-2xl mx-auto py-12">
      <StepIndicator current={step} steps={['Company', 'Settings', 'Invite', 'Tour']} />
      {step === 'company' && <CompanyInfoStep onNext={() => setStep('settings')} />}
      {step === 'settings' && <SettingsStep onNext={() => setStep('invite')} />}
      {step === 'invite' && <InviteStep onNext={() => setStep('tour')} />}
      {step === 'tour' && <TourStep onComplete={() => markSetupComplete()} />}
    </div>
  );
}
```

#### LAUNCH-006b: Create guided tour
**Create:** `apps/web/components/onboarding/guided-tour.tsx`

Use spotlight/tooltip overlay pattern:
- Highlight sidebar → "Navigate between services here"
- Highlight dispatch → "Manage your loads and dispatch carriers"
- Highlight carriers → "Add and manage your carrier partners"
- Highlight accounting → "Track invoices, payments, and settlements"

#### LAUNCH-006c: Add "Getting Started" checklist widget
**Create:** `apps/web/components/onboarding/getting-started-checklist.tsx`

```typescript
const checklistItems = [
  { key: 'company_info', label: 'Complete company profile', route: '/admin/settings' },
  { key: 'first_carrier', label: 'Add your first carrier', route: '/carriers/new' },
  { key: 'first_customer', label: 'Add your first customer', route: '/companies/new' },
  { key: 'first_load', label: 'Create your first load', route: '/operations/loads/new' },
  { key: 'first_invoice', label: 'Send your first invoice', route: '/accounting/invoices/new' },
  { key: 'invite_team', label: 'Invite your team members', route: '/admin/users/new' },
];
```

Dashboard widget that:
- Shows progress (3/6 complete)
- Links to each action
- Dismissible after all complete (or manually)
- Persisted via localStorage or backend flag

### Acceptance Criteria
- [ ] First login shows setup wizard
- [ ] Setup wizard configures essential settings
- [ ] Guided tour highlights key areas
- [ ] Dashboard shows getting-started checklist until dismissed
- [ ] Checklist tracks real completion (e.g., carrier count > 0)

---

## LAUNCH-007: Feedback Widget [P1]
**Effort:** S (2-3h)

### Sub-tasks

#### LAUNCH-007a: Create floating feedback button
**Create:** `apps/web/components/shared/feedback-widget.tsx`

```typescript
function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <MessageSquareIcon className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
          </DialogHeader>
          <FeedbackForm
            userId={user?.id}
            pageUrl={window.location.pathname}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

#### LAUNCH-007b: Create feedback dialog form
Fields:
- **Type:** Bug / Feature Request / Other (radio buttons)
- **Message:** textarea (required)
- **Screenshot:** optional file upload (or "include screenshot" checkbox that captures current page)
- **Priority:** Low / Medium / High (optional)
- Auto-includes: page URL, user ID, browser info, timestamp

#### LAUNCH-007c: Submit to internal endpoint
**Option A:** Backend endpoint → stores in DB
**Option B:** Email to team → uses Communication service
**Option C:** GitHub Issues → uses gh API

Recommended: Backend endpoint with email notification:
```typescript
// POST /api/v1/feedback
{
  type: 'bug' | 'feature' | 'other',
  message: string,
  pageUrl: string,
  userId: string,
  browserInfo: string,
  screenshot?: string, // base64
}
```

#### LAUNCH-007d: Add to dashboard layout
In `apps/web/app/(dashboard)/layout.tsx`:
```typescript
<FeedbackWidget />
```

### Acceptance Criteria
- [ ] Feedback button visible on all dashboard pages
- [ ] Feedback includes page URL and user context
- [ ] Submissions reach the team (email or stored)
- [ ] Screenshot attachment works

---

## Phase 2 Summary

| Task | Priority | Effort | Scope |
|------|----------|--------|-------|
| LAUNCH-005 | P0 | M (4-6h) | Deploy to production |
| STAB-001 | P0 | M (4-6h) | 48h monitoring |
| STAB-002 | P0 | M (4-6h) | Bug fixes |
| STAB-003 | P1 | S (2-3h) | Performance tuning |
| LAUNCH-006 | P1 | M (4-6h) | Onboarding flow |
| LAUNCH-007 | P1 | S (2-3h) | Feedback widget |
| **TOTAL** | | **20-30h** | |

### Execution Order
1. LAUNCH-005 (deploy — critical path)
2. STAB-001 (monitoring — immediately after deploy)
3. STAB-002 (bug fixes — based on monitoring findings)
4. STAB-003 (performance — based on monitoring findings)
5. LAUNCH-006 + LAUNCH-007 (parallel — onboarding + feedback)
