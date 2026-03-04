# Sprint 2 — Phase 1: Launch Preparation (Weeks 13-14)
> 7 tasks | 22-31h estimated | Prereq: Sprint 1 complete

---

## UX-001: Responsive Audit [P2]
**Effort:** M (3-4h) | 375px + 768px breakpoints

### Sub-tasks

#### UX-001a: Install and configure viewport testing tools
- Add Chrome DevTools device presets or Playwright viewport tests
- Configure Playwright to run at 375px and 768px viewports

#### UX-001b: Test 8 critical pages at 375px (mobile)
| Page | Route | Key Checks |
|------|-------|-----------|
| Login | `/login` | Form fits viewport, touch targets |
| Dashboard | `/dashboard` | Cards stack, no overflow |
| Dispatch Board | `/operations/dispatch` | Board scrollable, no truncation |
| Carriers | `/carriers` | Table horizontal scroll |
| Invoices | `/accounting/invoices` | Table horizontal scroll |
| Commissions | `/commissions` | Cards stack |
| Quotes | `/quotes` | Table horizontal scroll |
| Users | `/admin/users` | Table horizontal scroll |

#### UX-001c: Fix common layout breaks
- Data tables overflowing → add horizontal scroll or responsive columns
- Sidebar overlay on mobile → use sheet/drawer pattern from shadcn
- Form fields too wide → stack vertically on mobile
- Touch targets too small → minimum 44px on all interactive elements
- Modal/dialog width → max-w-[calc(100vw-2rem)] on mobile

**Files likely affected:**
- `apps/web/components/layout/sidebar.tsx` — mobile drawer conversion
- `apps/web/components/shared/data-table.tsx` — horizontal scroll wrapper
- All form pages — field stacking with `flex-col` on mobile

#### UX-001d: Test at 768px (tablet) for same 8 pages
- Sidebar should show/hide toggle (not permanent)
- Data tables may need column hiding (priority columns only)
- Forms should be 2-column where sensible

#### UX-001e: Create responsive utility classes if needed
```css
/* In globals.css */
@media (max-width: 640px) {
  .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .stack-mobile { flex-direction: column; }
}
```

### Acceptance Criteria
- [ ] 8 critical pages render correctly at 375px
- [ ] 8 critical pages render correctly at 768px
- [ ] No horizontal overflow on mobile
- [ ] Touch targets >= 44px
- [ ] Sidebar collapses to drawer on mobile

---

## UX-002: Accessibility Baseline [P2]
**Effort:** M (3-4h)

### Sub-tasks

#### UX-002a: Install axe-core dev tools
```bash
cd apps/web && pnpm add -D @axe-core/react
```
Configure in development mode only:
```typescript
// In app/layout.tsx (dev only)
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

#### UX-002b: Run axe scan on 5 critical pages
| Page | Route | Priority |
|------|-------|---------|
| Login | `/login` | P0 — first impression |
| Dashboard | `/dashboard` | P0 — daily use |
| Dispatch | `/operations/dispatch` | P0 — power users |
| Carrier List | `/carriers` | P1 — data-heavy |
| Invoice List | `/accounting/invoices` | P1 — data-heavy |

Document all findings in a spreadsheet or markdown table.

#### UX-002c: Fix critical a11y violations
Common fixes:
- Missing alt text on images → add descriptive alt or `aria-hidden="true"` for decorative
- Insufficient color contrast → verify navy theme meets 4.5:1 ratio (check `--brand-navy` against white)
- Missing form labels → add `<Label htmlFor>` or `aria-label` on all inputs
- Missing ARIA landmarks → add `<main>`, `<nav>`, `<aside>` roles
- Focus management on modals → shadcn Dialog should handle, verify

#### UX-002d: Add keyboard navigation test for dispatch board
- Tab through all interactive elements
- Enter/Space activates buttons
- Escape closes modals
- Arrow keys for board navigation (if applicable)

#### UX-002e: Verify screen reader announces page titles
- Each page should set `<title>` via Next.js metadata
- Route changes should announce new page title

### Acceptance Criteria
- [ ] Zero critical/serious axe violations on 5 pages
- [ ] All forms have associated labels
- [ ] Color contrast ratio >= 4.5:1
- [ ] Focus trap works on modals

---

## UX-003: Performance Baseline [P2]
**Effort:** S (2-3h)

### Sub-tasks

#### UX-003a: Run Lighthouse on 5 pages
Record scores for: Performance, Accessibility, Best Practices, SEO
Target: Performance > 80 on all pages

#### UX-003b: Fix critical performance issues
- Add `loading="lazy"` to images below fold
- Check bundle size via `pnpm build` output — no route bundle > 500KB
- Verify `next/dynamic` used for heavy components (maps, charts)
- Check for unnecessary re-renders in React DevTools Profiler

#### UX-003c: Verify font loading
- `next/font` for Inter should be configured
- No FOUT (flash of unstyled text)
- Font file served from same origin (not Google CDN)

#### UX-003d: Verify React Query staleTime
- Dashboard queries: `staleTime: 30_000` (30s)
- List queries: `staleTime: 60_000` (1min)
- Static data (roles, permissions): `staleTime: 300_000` (5min)
- Prevents unnecessary refetches on tab focus

### Acceptance Criteria
- [ ] Lighthouse Performance > 80 on dashboard
- [ ] No JS bundle > 500KB (route-level)
- [ ] Font loading optimized (no FOUT)
- [ ] React Query staleTime configured per query type

---

## LAUNCH-001: Go-Live Checklist [P0]
**Effort:** L (8-12h) | 50+ items

### Sub-tasks

#### LAUNCH-001a: Create comprehensive go-live checklist document
**Create:** `Ultra-TMS/dev_docs_v3/04-business/go-live-checklist.md`

**Security (10 items):**
- [ ] JWT_SECRET rotated to 64+ char random string
- [ ] Redis password changed from default
- [ ] CORS_ORIGINS set to production domain only
- [ ] Helmet enabled with production CSP
- [ ] .env files NOT committed to git (.gitignore verified)
- [ ] ANTHROPIC_API_KEY removed from frontend .env
- [ ] Google Maps API key restricted to production domain
- [ ] Database password changed from default
- [ ] SSL/TLS configured end-to-end
- [ ] Rate limiting verified on login endpoint

**Infrastructure (10 items):**
- [ ] API Dockerfile built and tested
- [ ] Web Dockerfile built and tested
- [ ] Production docker-compose or k8s manifests ready
- [ ] Database backups configured (daily, 30-day retention)
- [ ] Redis persistence configured
- [ ] Log aggregation to file/service
- [ ] Sentry DSN configured for production
- [ ] Uptime monitoring active
- [ ] DNS configured and propagated
- [ ] SSL certificate installed (Let's Encrypt or similar)

**Data (8 items):**
- [ ] Production database created and migrated
- [ ] Seed data appropriate for production (remove test data)
- [ ] Admin user created with strong password
- [ ] Default tenant configured
- [ ] Default roles and permissions seeded
- [ ] Elasticsearch indices created (if applicable)
- [ ] Storage (S3 bucket or local) configured
- [ ] Backup verified (can restore from backup)

**Application (10 items):**
- [ ] All 8 Sprint 1 services at 8+/10
- [ ] CI pipeline passing on main branch
- [ ] Build succeeds (`pnpm build`)
- [ ] TypeScript errors: zero
- [ ] Lint errors: zero
- [ ] All tests passing
- [ ] E2E tests passing
- [ ] Feature flags configured (Load Board gated)
- [ ] Error boundaries in place on all routes
- [ ] Loading states on all pages

**Legal & Compliance (5 items):**
- [ ] Privacy Policy page published
- [ ] Terms of Service page published
- [ ] Cookie Policy page published (if applicable)
- [ ] FMCSA compliance requirements documented
- [ ] Data retention policy documented

**Monitoring (5 items):**
- [ ] Sentry alerts configured (email + Slack)
- [ ] Uptime alerts configured
- [ ] Disk space alerts configured
- [ ] Database connection pool monitoring
- [ ] Error rate baseline established

**Rollback (5 items):**
- [ ] Rollback procedure documented
- [ ] Previous version tagged and deployable
- [ ] Database migration rollback tested
- [ ] DNS rollback plan (if switching domains)
- [ ] Communication plan for users if rollback needed

#### LAUNCH-001b: Execute infrastructure checklist items
Work through each item, marking complete as done.

#### LAUNCH-001c: Document post-launch items
Any items that cannot be done pre-launch → mark as "post-launch day 1" or "post-launch week 1".

### Acceptance Criteria
- [ ] 50+ item checklist documented
- [ ] All P0 items completed before go-live
- [ ] Rollback procedure documented and tested

---

## LAUNCH-002: Production DB Migration [P0]
**Effort:** M (3-4h)

### Sub-tasks

#### LAUNCH-002a: Create production database on hosting provider
- PostgreSQL 15+ on chosen hosting (Railway, Supabase, RDS, or self-hosted)
- Minimum specs: 2GB RAM, 20GB storage, connection pooling

#### LAUNCH-002b: Run all Prisma migrations against production DB
```bash
DATABASE_URL=<production-url> npx prisma migrate deploy
```
Verify all migrations apply cleanly (no errors).

#### LAUNCH-002c: Verify all 258 models created correctly
```bash
DATABASE_URL=<production-url> npx prisma db pull
```
Compare schema against source — should match exactly.

#### LAUNCH-002d: Run production seed
```bash
DATABASE_URL=<production-url> npx prisma db seed
```
Minimal seed: admin user, default tenant, roles (no test data).

#### LAUNCH-002e: Test database connectivity from production API
Start API with production DATABASE_URL, verify health endpoint returns DB status: "connected".

#### LAUNCH-002f: Configure database backups
- Daily automated backups
- 30-day retention minimum
- Test restore procedure (restore backup → verify data)

### Acceptance Criteria
- [ ] Production DB running with all migrations applied
- [ ] Admin user can log in
- [ ] Daily backups configured and tested

---

## LAUNCH-003: Domain & SSL [P0]
**Effort:** S (1-2h)

### Sub-tasks

#### LAUNCH-003a: Configure DNS records
- A record or CNAME pointing to production server
- Verify propagation with `dig` or `nslookup`

#### LAUNCH-003b: Install SSL certificate
- Let's Encrypt via Certbot (auto-renew)
- Or hosting provider's managed SSL

#### LAUNCH-003c: Configure reverse proxy with SSL termination
```nginx
server {
    listen 443 ssl http2;
    server_name app.ultratms.com;

    ssl_certificate /etc/letsencrypt/live/app.ultratms.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.ultratms.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name app.ultratms.com;
    return 301 https://$host$request_uri;
}
```

#### LAUNCH-003d: Update CORS_ORIGINS
In production `.env`:
```
CORS_ORIGINS=https://app.ultratms.com
```

#### LAUNCH-003e: Verify HTTPS redirect
- HTTP request → 301 redirect to HTTPS
- HTTPS request → 200 with valid certificate

### Acceptance Criteria
- [ ] Production domain resolves to app
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] SSL certificate auto-renews

---

## LAUNCH-004: PR Template + Release Process [P1]
**Effort:** S (2h) | v1.0.0

### Sub-tasks

#### LAUNCH-004a: Create PR template
**Create:** `.github/pull_request_template.md`
```markdown
## Summary
<!-- What does this PR do? -->

## Type
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement
- [ ] Refactor
- [ ] Documentation
- [ ] Testing

## Checklist
- [ ] TypeScript: zero errors (`pnpm check-types`)
- [ ] Tests: all passing (`pnpm test`)
- [ ] Lint: zero errors (`pnpm lint`)
- [ ] Build: succeeds (`pnpm build`)
- [ ] 4-state verified (loading/error/empty/data) — if UI change
- [ ] No console.log or alert() in committed code
- [ ] No hardcoded colors — uses design tokens
- [ ] Screenshots attached — if UI change

## Test Plan
<!-- How to test this change -->

## Related Issues
<!-- Closes #123 -->
```

#### LAUNCH-004b: Create release process document
**Create:** `Ultra-TMS/dev_docs_v3/04-business/release-process.md`
- Git tag convention: `v1.0.0`, `v1.1.0`, `v1.0.1` (semver)
- Changelog format: Keep a Changelog
- Deployment steps: tag → CI builds → deploy staging → smoke test → deploy production

#### LAUNCH-004c: Tag v1.0.0 on main branch
```bash
git tag -a v1.0.0 -m "Sprint 1 complete: 8 services production-ready"
git push origin v1.0.0
```

#### LAUNCH-004d: Create CHANGELOG.md
**Create:** `Ultra-TMS/CHANGELOG.md`
```markdown
# Changelog

## [1.0.0] - 2026-XX-XX
### Added
- Auth & Admin: login, registration, user/role management
- CRM: companies, contacts, leads, customers
- Sales: quotes, rate confirmation
- TMS Core: loads, orders, dispatch, tracking
- Carrier: management, FMCSA verification, trucks, drivers
- Accounting: invoices, payments, settlements, aging
- Commission: plans, reps, payouts, transactions
- Load Board: internal load posting

### Security
- Multi-tenant isolation enforced
- Security headers (Helmet)
- CORS from environment variables
- CSRF protection
```

### Acceptance Criteria
- [ ] PR template with checklist exists
- [ ] Release process documented
- [ ] v1.0.0 tagged
- [ ] CHANGELOG.md created

---

## Phase 1 Summary

| Task | Priority | Effort | Scope |
|------|----------|--------|-------|
| UX-001 | P2 | M (3-4h) | 8 pages × 2 viewports |
| UX-002 | P2 | M (3-4h) | 5 pages a11y |
| UX-003 | P2 | S (2-3h) | 5 pages performance |
| LAUNCH-001 | P0 | L (8-12h) | 50+ checklist items |
| LAUNCH-002 | P0 | M (3-4h) | Production DB |
| LAUNCH-003 | P0 | S (1-2h) | Domain + SSL |
| LAUNCH-004 | P1 | S (2h) | Release process |
| **TOTAL** | | **22-31h** | |

### Execution Order
1. LAUNCH-001 (go-live checklist — unblocks everything)
2. LAUNCH-002 + LAUNCH-003 (parallel — DB + domain)
3. UX-001 + UX-002 + UX-003 (parallel — all UX work)
4. LAUNCH-004 (release process — after Sprint 1 tagged)
