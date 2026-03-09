# Observability Strategy

> Status: Pre-Production Standard (to be implemented before first customer)
> Last updated: 2026-03-09
> See also: deployment-runbook.md, security-findings.md

---

## Current State

Ultra TMS has **minimal observability** in the codebase today:

### What Exists

| Layer | Implementation | Location |
|-------|---------------|----------|
| Health endpoints | `/api/v1/health` (basic OK), `/api/v1/ready` (DB check), `/api/v1/live` (liveness) | `apps/api/src/modules/health/health.controller.ts` |
| Request logging middleware | `RequestLoggingMiddleware` — logs method, path, status, response time | `apps/api/src/common/middleware/request-logging.middleware.ts` |
| Correlation IDs | `CorrelationIdMiddleware` — adds `x-correlation-id` header to all requests | `apps/api/src/common/middleware/correlation-id.middleware.ts` |
| Audit interceptor | `AuditInterceptor` — captures entity mutations to AuditLog table | `apps/api/src/modules/audit/interceptors/audit.interceptor.ts` |
| NestJS Logger | Built-in `Logger` class (console-based, not structured JSON) | Used in `main.ts` and across modules |
| Kibana | Available via docker-compose on port 5601 | `docker-compose.yml` — connected to Elasticsearch |

### What Does NOT Exist

- No structured JSON logging (current logs are plain text console output)
- No application metrics (Prometheus/Datadog)
- No distributed tracing (OpenTelemetry)
- No alerting system (PagerDuty/Opsgenie)
- No error tracking service (Sentry)
- No SLO monitoring
- Health endpoint does NOT check Redis connectivity (only DB)
- Health endpoint does NOT check Elasticsearch connectivity
- No per-tenant request metrics

---

## Logging Standards

### Format: Structured JSON

Replace NestJS built-in Logger with `nestjs-pino` or `winston` configured for JSON output.

```typescript
// Target log format (every log line)
{
  "level": "info",
  "timestamp": "2026-03-09T14:30:00.000Z",
  "correlationId": "abc-123-def",
  "tenantId": "tenant_xyz",
  "userId": "user_456",
  "service": "AccountingService",
  "method": "createInvoice",
  "message": "Invoice created",
  "duration_ms": 45,
  "metadata": { "invoiceId": "inv_789", "amount": 2500.00 }
}
```

### Log Levels

| Level | When | Production? | Development? |
|-------|------|-------------|--------------|
| ERROR | Unhandled exceptions, failed external calls, data integrity violations | Always | Always |
| WARN | Deprecated usage, approaching limits, recoverable failures, missing optional config | Always | Always |
| INFO | Request lifecycle, business operations completed, state transitions | Yes | Yes |
| DEBUG | Detailed operation flow, query parameters, intermediate values | No | Yes |

### What to Log at Each Layer

**Controller layer:**
- Request received: method, path, tenantId, userId, query params (sanitized)
- Response sent: status code, response time (ms)
- Do NOT log: request bodies with sensitive fields

**Service layer:**
- Business operations: "Invoice created", "Settlement approved", "Payment applied"
- State transitions: "Load status changed from DISPATCHED to IN_TRANSIT"
- External API calls: service name, endpoint, response time, success/failure
- Do NOT log: full entity bodies (log IDs only)

**Repository/Prisma layer:**
- Query execution time (only if > 100ms threshold — slow query log)
- Connection pool events (acquire, release, timeout)
- Do NOT log: raw SQL with parameter values

### What NEVER to Log

- Passwords or password hashes
- JWT tokens or refresh tokens
- API keys (SendGrid, Twilio, etc.)
- PII in bulk (full customer lists, email addresses in arrays)
- Full request/response bodies containing credit card data
- Encryption keys or secrets
- Database connection strings with credentials

### Tenant Context Requirement

**Every log line MUST include `tenantId`** for multi-tenant filtering. This is enforced by:
1. The `CorrelationIdMiddleware` extracting tenant from JWT
2. The structured logger automatically injecting tenant context
3. Log queries filtering by `tenantId` for tenant-specific troubleshooting

---

## Metrics

### Application Metrics (Priority: P0)

| Metric | Type | Labels | Target |
|--------|------|--------|--------|
| `http_requests_total` | Counter | method, path, status_code, tenant_id | — |
| `http_request_duration_seconds` | Histogram | method, path, tenant_id | p95 < 500ms |
| `http_active_connections` | Gauge | — | < 200 per instance |
| `auth_login_attempts_total` | Counter | status (success/failure), tenant_id | — |
| `auth_token_refresh_total` | Counter | status, tenant_id | — |

### Business Metrics (Priority: P1)

| Metric | Type | Labels | Purpose |
|--------|------|--------|---------|
| `loads_created_total` | Counter | tenant_id, status | Volume tracking |
| `loads_dispatched_total` | Counter | tenant_id | Dispatch throughput |
| `loads_delivered_total` | Counter | tenant_id | Delivery tracking |
| `invoices_created_total` | Counter | tenant_id | Revenue pipeline |
| `invoices_amount_total` | Counter | tenant_id, currency | Revenue volume |
| `settlements_paid_total` | Counter | tenant_id | AP throughput |
| `quotes_conversion_rate` | Gauge | tenant_id | Sales effectiveness |

### Infrastructure Metrics (Priority: P0)

| Metric | Type | Source | Alert Threshold |
|--------|------|--------|----------------|
| DB connection pool utilization | Gauge | Prisma | > 80% |
| DB query duration | Histogram | Prisma | p95 > 200ms |
| Redis memory usage | Gauge | Redis INFO | > 80% of max |
| Redis hit rate | Gauge | Redis INFO | < 80% |
| Redis connected clients | Gauge | Redis INFO | > 100 |
| ES cluster status | Gauge | ES API | yellow or red |
| ES query latency | Histogram | ES client | p95 > 500ms |
| Node.js event loop lag | Gauge | perf_hooks | > 100ms |
| Node.js heap used | Gauge | process.memoryUsage() | > 80% of limit |

### Per-Tenant Metrics (Priority: P1)

| Metric | Purpose | Alert |
|--------|---------|-------|
| Request volume per tenant | Capacity planning, abuse detection | > 10x average |
| Error rate per tenant | Tenant-specific issues | > 1% |
| Data volume per tenant | Storage planning | > 2x average |
| API latency per tenant | SLA compliance | p95 > 1s |

---

## Health Checks

### Current Implementation (verified from code)

| Endpoint | Path | What It Checks | Auth Required |
|----------|------|---------------|--------------|
| `/api/v1/health` | GET | Returns `{ status: "ok", timestamp, uptime, version }` | No (@Public) |
| `/api/v1/ready` | GET | PostgreSQL connectivity via `SELECT 1` | No (@Public) |
| `/api/v1/live` | GET | Returns `{ status: "alive", timestamp }` | No (@Public) |

### Gaps in Current Health Checks

1. **Redis not checked** — `/ready` only checks DB. If Redis is down, the app reports healthy but rate limiting, caching, and distributed locks all fail silently.
2. **Elasticsearch not checked** — Search will fail with no health signal.
3. **No version from package.json** — Hardcoded `version: '1.0.0'` instead of reading actual version.
4. **No dependency health aggregation** — No composite health score.

### Recommended Enhancements

```typescript
// Enhanced /ready endpoint should check:
{
  status: "ok" | "degraded" | "unhealthy",
  timestamp: "2026-03-09T14:30:00.000Z",
  uptime: 86400,
  version: "0.1.0",  // from package.json
  checks: {
    database: { status: "connected", latency_ms: 2 },
    redis: { status: "connected", latency_ms: 1, memory_used: "45MB" },
    elasticsearch: { status: "connected", cluster: "green" }  // or "skipped" if ES disabled
  }
}
```

**Status logic:**
- `ok`: All required services (DB, Redis) connected
- `degraded`: Optional service (ES) down, or latency > threshold
- `unhealthy`: Required service (DB or Redis) down

---

## Alerting Rules

### SEV-1: Critical (page immediately, 24/7)

| Condition | Threshold | Channel | Escalation |
|-----------|-----------|---------|------------|
| API completely down | `/health` returns non-200 for 2 min | PagerDuty + SMS | On-call engineer, then CTO at 15 min |
| Database unreachable | `/ready` DB check fails for 1 min | PagerDuty + SMS | On-call engineer |
| Error rate spike | > 5% of requests returning 5xx for 5 min | PagerDuty + Slack | On-call engineer |
| Data breach indicator | Unauthorized cross-tenant data access detected | PagerDuty + SMS + Email | CTO immediately |

### SEV-2: High (page during business hours)

| Condition | Threshold | Channel | Escalation |
|-----------|-----------|---------|------------|
| API latency degradation | p95 > 2s for 10 min | Slack #alerts + PagerDuty | On-call engineer |
| Redis down | Redis health check fails for 2 min | Slack #alerts + PagerDuty | On-call engineer |
| DB connection pool exhausted | Pool utilization > 95% for 5 min | Slack #alerts | Backend lead |
| Authentication failures spike | > 50 failed logins in 5 min (single tenant) | Slack #security | Security review |

### SEV-3: Medium (Slack notification, next business day)

| Condition | Threshold | Channel | Response |
|-----------|-----------|---------|----------|
| Elasticsearch down | ES health check fails for 10 min | Slack #alerts | Search degrades to DB fallback (when implemented) |
| Disk usage high | > 80% on any volume | Slack #infra | Expand or clean up |
| Slow queries | > 10 queries/min exceeding 500ms | Slack #backend | Query optimization |
| Memory pressure | Node.js heap > 80% for 30 min | Slack #backend | Investigate leaks |

### SEV-4: Low (logged, reviewed weekly)

| Condition | Threshold | Channel | Response |
|-----------|-----------|---------|----------|
| Deprecated API usage | Any call to deprecated endpoint | Log only | Plan migration |
| SendGrid/Twilio errors | Email/SMS delivery failure | Slack #notifications | Check provider status |
| Background job failures | > 3 consecutive failures | Slack #backend | Review job logic |

---

## SLOs (Service Level Objectives)

### Availability

| Target | Budget | Meaning |
|--------|--------|---------|
| 99.9% monthly | 43.8 min/month downtime | ~1.4 min/day allowed |
| 99.5% (launch target) | 3.6 hours/month | Conservative initial target |

### API Latency

| Percentile | Target | Measurement |
|------------|--------|-------------|
| p50 | < 100ms | Median response time across all endpoints |
| p95 | < 500ms | 95th percentile |
| p99 | < 2s | 99th percentile (complex queries allowed) |

### Frontend Performance (Web Vitals)

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | p95 < 2s | Page load performance |
| FID (First Input Delay) | p95 < 100ms | Interactivity |
| CLS (Cumulative Layout Shift) | p95 < 0.1 | Visual stability |
| TTFB (Time to First Byte) | p95 < 500ms | Server response |

### Error Rate

| Target | Scope | Exclusions |
|--------|-------|------------|
| < 0.1% of requests | All API endpoints | 4xx client errors (those are expected) |
| < 1% of requests (launch target) | Conservative initial target | Rate-limited requests (429) |

### Business SLOs (Post-Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invoice generation latency | < 5s | Time from load DELIVERED to draft invoice created |
| Rate confirmation PDF | < 10s | Time from request to PDF ready |
| Search results | < 1s | Full-text search response time |
| Dashboard load | < 3s | All KPI widgets populated |

---

## Recommended Stack

### Near-Term (Pre-Launch)

| Concern | Tool | Rationale |
|---------|------|-----------|
| Structured logging | `nestjs-pino` | JSON logs, auto-request context, low overhead |
| Error tracking | Sentry | Automatic error grouping, source maps, release tracking |
| Uptime monitoring | UptimeRobot (free tier) | External health check on `/api/v1/health` |
| Log aggregation | Elasticsearch + Kibana (already in docker-compose) | Zero additional cost, already running |

### Production (Post-Launch)

| Concern | Tool | Alternative |
|---------|------|-------------|
| Metrics | Prometheus + Grafana | Datadog (managed, higher cost) |
| Logging | Structured JSON to ELK stack | CloudWatch Logs (if on AWS) |
| Tracing | OpenTelemetry | Datadog APM |
| Alerting | PagerDuty or Opsgenie | Grafana Alerting (self-hosted) |
| Error tracking | Sentry | Datadog Error Tracking |
| Synthetic monitoring | Playwright + cron (monthly) | Datadog Synthetics |

### Implementation Priority

1. **Week 1:** Add `nestjs-pino` for structured JSON logging + enhance `/ready` to check Redis
2. **Week 2:** Add Sentry for error tracking + UptimeRobot for external monitoring
3. **Week 3:** Add Prometheus metrics endpoint (`/metrics`) + basic Grafana dashboards
4. **Month 2:** Add alerting rules (SEV-1/SEV-2 only initially)
5. **Month 3:** Add OpenTelemetry tracing for cross-service visibility

---

## See Also

- `deployment-runbook.md` — Pre-deploy checklist and post-deploy verification
- `security-findings.md` — Incident severity framework (SEV-1 to SEV-4)
- `architecture.md` — Caching strategy and Redis configuration
- `quality-gates.md` — /verify sequence
