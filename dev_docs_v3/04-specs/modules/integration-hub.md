# Integration Hub Module API Spec

**Module:** `apps/api/src/modules/integration-hub/`
**Base path:** `/api/v1/`
**Controllers:** IntegrationsController, SyncController, WebhooksController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Note:** `integration-hub.bak/` directory exists — legacy backup, do NOT reference.

---

## IntegrationsController

**Route prefix:** `integrations`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/integrations` | List available integrations |
| GET | `/integrations/connected` | List tenant's connected integrations |
| POST | `/integrations/:key/connect` | Connect integration |
| DELETE | `/integrations/:key/disconnect` | Disconnect integration |
| GET | `/integrations/:key/status` | Integration health status |
| POST | `/integrations/:key/test` | Test connection |
| PATCH | `/integrations/:key/config` | Update integration config |

### Integration keys (estimated)
```
google-maps      — Load Planner map (embedded in Load Planner page)
fmcsa            — Carrier lookup (already used in carrier module)
macropoint       — GPS tracking
project44        — Visibility platform
fourkites        — Visibility platform
samsara          — ELD/telematics
keeptruckin      — ELD/telematics
quickbooks       — Accounting sync
```

---

## SyncController

**Route prefix:** `integrations/sync`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/integrations/sync/:key` | Trigger manual sync |
| GET | `/integrations/sync/logs` | List sync logs |
| GET | `/integrations/sync/logs/:id` | Get sync log entry |

---

## WebhooksController

**Route prefix:** `integrations/webhooks`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/integrations/webhooks` | JWT | Register webhook endpoint |
| GET | `/integrations/webhooks` | JWT | List registered webhooks |
| DELETE | `/integrations/webhooks/:id` | JWT | Remove webhook |
| POST | `/integrations/webhooks/incoming/:key` | HMAC signature | Receive inbound webhook |

### Inbound webhook
`POST /integrations/webhooks/incoming/:key` is public-facing but validated via HMAC signature verification. Used by external services (macropoint, project44) to push tracking updates.

---

## Services subdir

`services/` contains provider-specific service implementations (one per integration). Each follows the same interface:
```typescript
interface IntegrationService {
  connect(tenantId: string, config: Record<string, string>): Promise<void>;
  disconnect(tenantId: string): Promise<void>;
  testConnection(tenantId: string): Promise<boolean>;
  sync(tenantId: string): Promise<SyncResult>;
}
```

---

## Frontend

No dedicated integration hub screens in MVP. The `/admin/settings` page may expose a simplified integration toggle panel. Full integration management is a P2 feature.
