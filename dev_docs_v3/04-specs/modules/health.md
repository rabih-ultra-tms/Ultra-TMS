# Health Module API Spec

**Module:** `apps/api/src/modules/health/`
**Base path:** `/api/v1/` (and root `/`)
**Controller:** HealthController
**Auth:** `@Public()` decorator — NO authentication required on any health endpoint

---

## HealthController

**Route prefix:** (none — controller is `@Controller()` with empty prefix)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Basic health check |
| GET | `/ready` | Readiness check (DB ping) |
| GET | `/live` | Liveness check |

### GET /health response
```typescript
{
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;      // ISO 8601
  uptime: number;         // process.uptime() in seconds
  version: string;        // '1.0.0'
}
```

### GET /ready response
```typescript
{
  status: 'ok' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: 'connected' | 'disconnected';
    redis?: 'connected' | 'disconnected';    // optional, not currently checked
  };
}
```

### GET /live response
```typescript
{
  status: 'alive';
  timestamp: string;
}
```

---

## Implementation Notes

- `GET /ready` performs `prisma.$queryRaw\`SELECT 1\`` — if it throws, `status: 'unhealthy'` and `database: 'disconnected'`
- `GET /health` does NOT ping the database — lightweight check only
- All endpoints are decorated with `@Public()` — bypass JWT guard globally
- Redis health check (`redis?: 'connected'`) is in the response type but not currently implemented in the controller

---

## Usage

Used by:
- Docker healthcheck: `HEALTHCHECK CMD curl -f http://localhost:3001/health`
- Kubernetes readiness probe: `/ready`
- Kubernetes liveness probe: `/live`
- Load balancer health check: `/health`

These endpoints are accessed at `localhost:3001/health` (NOT via `/api/v1/health` — the health controller has no prefix).
