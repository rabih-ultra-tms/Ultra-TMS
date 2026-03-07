# Rate Intelligence Module API Spec

**Module:** `apps/api/src/modules/rate-intelligence/`
**Base path:** `/api/v1/`
**Controllers:** RateLookupController, LaneAnalyticsController, RateHistoryController, RateAlertsController, AnalyticsController
**Auth:** `JwtAuthGuard` + `RolesGuard`
**Scope:** P2 feature. Backend implemented. Used partially by Load Planner for rate suggestions.

---

## RateLookupController

**Route prefix:** `rate-intelligence/lookup`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/rate-intelligence/lookup` | Get rate for lane |
| GET | `/rate-intelligence/lookup/quick` | Quick rate estimate |
| POST | `/rate-intelligence/lookup/batch` | Batch rate lookup |

### POST /rate-intelligence/lookup body
```typescript
{
  origin: { city: string; state: string; zip?: string };
  destination: { city: string; state: string; zip?: string };
  equipmentType: string;   // 'DRY_VAN' | 'REEFER' | 'FLATBED' | etc
  weight?: number;
  miles?: number;
  pickupDate?: string;
  providers?: string[];    // which rate sources to query
}
```

### Response
```typescript
{
  data: {
    rate: number;          // recommended all-in rate
    ratePerMile: number;
    linehaul: number;
    fuelSurcharge: number;
    confidence: 'high' | 'medium' | 'low';
    sources: { provider: string; rate: number; }[];
    validUntil: string;    // ISO date
  }
}
```

---

## LaneAnalyticsController

**Route prefix:** `rate-intelligence/lanes`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/rate-intelligence/lanes` | List active lanes |
| GET | `/rate-intelligence/lanes/:id/trends` | Rate trend for lane |
| GET | `/rate-intelligence/lanes/:id/seasonality` | Seasonal rate patterns |
| POST | `/rate-intelligence/lanes/compare` | Compare lane rates |

---

## RateHistoryController

**Route prefix:** `rate-intelligence/history`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/rate-intelligence/history` | Rate history (filter by lane/date) |
| POST | `/rate-intelligence/history` | Record actual rate (from completed load) |

Actual rates from completed loads are stored here to improve future estimates.

---

## RateAlertsController

**Route prefix:** `rate-intelligence/alerts`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/rate-intelligence/alerts` | Create rate alert (trigger on price change) |
| GET | `/rate-intelligence/alerts` | List alerts |
| DELETE | `/rate-intelligence/alerts/:id` | Remove alert |

---

## Rate Providers (estimated from `providers/` subdir)

- Internal historical data (from completed loads)
- DAT (if configured)
- Truckstop.com (if configured)
- Transplace
- Manual rates (from contracts/rate-tables)

---

## Integration with Load Planner

The Load Planner (`/load-planner/[id]/edit`) calls `POST /rate-intelligence/lookup` to suggest rates during quote creation. This is an existing working integration — DO NOT BREAK.
