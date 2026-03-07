# Service Hub: Rate Intelligence (29)

> **Source of Truth** -- dev_docs_v3 era | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (Rate Intelligence service definition)
> **Design specs:** `dev_docs/12-Rabih-design-Process/26-rate-intelligence/` (9 files)
> **Priority:** P3 Future -- requires DAT/Greenscreens.ai API integration (commercial cost)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (1/10) |
| **Confidence** | High -- verified 2026-03-07, backend module exists, no frontend |
| **Last Verified** | 2026-03-07 |
| **Backend** | Scaffolded -- 6 controllers, 21 endpoints in `apps/api/src/modules/rate-intelligence/` |
| **Frontend** | Not Started -- 0 pages, 0 components, 0 hooks |
| **Tests** | None -- 0 backend, 0 frontend |
| **Active Blockers** | Commercial API contracts required (DAT, Greenscreens.ai) before any frontend work |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Rate Intelligence service definition in dev_docs |
| Design Specs | Done | 9 files in `dev_docs/12-Rabih-design-Process/26-rate-intelligence/` |
| Backend -- Alerts | Scaffolded | `rate-intelligence/alerts/` -- rate spike/drop alert CRUD |
| Backend -- Analytics | Scaffolded | `rate-intelligence/analytics/` -- dashboard, margins, competitiveness, market |
| Backend -- History | Scaffolded | `rate-intelligence/history/` -- historical rates and trends |
| Backend -- Lanes | Scaffolded | `rate-intelligence/lanes/` -- lane-level analytics, history, forecast |
| Backend -- Lookup | Scaffolded | `rate-intelligence/lookup/` -- single and batch rate lookups |
| Backend -- Providers | Scaffolded | `rate-intelligence/providers/` -- provider config, test connectivity |
| Prisma Models | Unknown | Need to verify if rate intelligence models exist in schema |
| Frontend Pages | Not Started | 0 pages |
| React Hooks | Not Started | 0 hooks |
| Components | Not Started | 0 components |
| Tests | Not Started | 0 tests |
| Security | Unknown | Controllers likely have JwtAuthGuard but unverified at runtime |

---

## 3. Screens

| Screen | Route | Status | Quality | Notes |
|--------|-------|--------|---------|-------|
| Rate Intelligence Dashboard | `/rate-intelligence` | Not Built | -- | Design spec: `01-rate-intelligence-dashboard.md` |
| Market Rates | `/rate-intelligence/market` | Not Built | -- | Design spec: `02-market-rates.md` |
| Rate Trends | `/rate-intelligence/trends` | Not Built | -- | Design spec: `03-rate-trends.md` |
| Lane Rate Lookup | `/rate-intelligence/lookup` | Not Built | -- | Design spec: `04-lane-rate-lookup.md` |
| Rate Comparison | `/rate-intelligence/comparison` | Not Built | -- | Design spec: `05-rate-comparison.md` |
| Rate Alerts | `/rate-intelligence/alerts` | Not Built | -- | Design spec: `06-rate-alerts.md` |
| Rate Forecast | `/rate-intelligence/forecast` | Not Built | -- | Design spec: `07-rate-forecast.md` |
| Rate Reports | `/rate-intelligence/reports` | Not Built | -- | Design spec: `08-rate-reports.md` |

---

## 4. API Endpoints

| Method | Path | Controller | Status | Notes |
|--------|------|------------|--------|-------|
| GET | `/api/v1/rates/alerts` | RateAlertsController | Scaffolded | List active rate alerts |
| POST | `/api/v1/rates/alerts` | RateAlertsController | Scaffolded | Create rate alert (spike/drop threshold) |
| PATCH | `/api/v1/rates/alerts/:id` | RateAlertsController | Scaffolded | Update alert configuration |
| DELETE | `/api/v1/rates/alerts/:id` | RateAlertsController | Scaffolded | Delete rate alert |
| GET | `/api/v1/rates/alerts/:id/history` | RateAlertsController | Scaffolded | Alert trigger history |
| GET | `/api/v1/rates/analytics/dashboard` | AnalyticsController | Scaffolded | Rate intelligence dashboard KPIs |
| GET | `/api/v1/rates/analytics/margins` | AnalyticsController | Scaffolded | Margin analysis vs market rates |
| GET | `/api/v1/rates/analytics/competitiveness` | AnalyticsController | Scaffolded | Rate competitiveness scoring |
| GET | `/api/v1/rates/analytics/market` | AnalyticsController | Scaffolded | Market rate overview |
| GET | `/api/v1/rates/history` | RateHistoryController | Scaffolded | Historical rate data (filterable by lane/equipment/date) |
| GET | `/api/v1/rates/trends` | RateHistoryController | Scaffolded | Rate trend analysis (seasonal, directional) |
| GET | `/api/v1/rates/lanes` | LaneAnalyticsController | Scaffolded | List lanes with rate analytics |
| GET | `/api/v1/rates/lanes/:id` | LaneAnalyticsController | Scaffolded | Lane detail (avg rate, volume, patterns) |
| GET | `/api/v1/rates/lanes/:id/history` | LaneAnalyticsController | Scaffolded | Lane rate history over time |
| GET | `/api/v1/rates/lanes/:id/forecast` | LaneAnalyticsController | Scaffolded | Lane rate forecast (ML-based prediction) |
| GET | `/api/v1/rates/providers` | ProvidersController | Scaffolded | List configured rate providers |
| POST | `/api/v1/rates/providers` | ProvidersController | Scaffolded | Register rate provider (DAT, Greenscreens.ai) |
| PATCH | `/api/v1/rates/providers/:id` | ProvidersController | Scaffolded | Update provider config (API keys, preferences) |
| POST | `/api/v1/rates/providers/:id/test` | ProvidersController | Scaffolded | Test provider connectivity |
| POST | `/api/v1/rates/lookup` | RateLookupController | Scaffolded | Single rate lookup by lane + equipment |
| POST | `/api/v1/rates/lookup/batch` | RateLookupController | Scaffolded | Batch rate lookup (multiple lanes) |

---

## 5. Components

No components built. Planned components based on design specs:

| Component | Planned Path | Status |
|-----------|-------------|--------|
| RateDashboardKPIs | `components/rate-intelligence/rate-dashboard-kpis.tsx` | Not Built |
| MarketRateChart | `components/rate-intelligence/market-rate-chart.tsx` | Not Built |
| RateTrendGraph | `components/rate-intelligence/rate-trend-graph.tsx` | Not Built |
| LaneRateLookupForm | `components/rate-intelligence/lane-rate-lookup-form.tsx` | Not Built |
| RateComparisonTable | `components/rate-intelligence/rate-comparison-table.tsx` | Not Built |
| RateAlertConfigDialog | `components/rate-intelligence/rate-alert-config-dialog.tsx` | Not Built |
| RateForecastChart | `components/rate-intelligence/rate-forecast-chart.tsx` | Not Built |
| ProviderStatusCard | `components/rate-intelligence/provider-status-card.tsx` | Not Built |
| LaneHeatMap | `components/rate-intelligence/lane-heat-map.tsx` | Not Built |
| SeasonalPatternChart | `components/rate-intelligence/seasonal-pattern-chart.tsx` | Not Built |

---

## 6. Hooks

No hooks built. Planned hooks based on endpoints:

| Hook | Endpoints Used | Status |
|------|---------------|--------|
| `useRateAlerts` | GET `/rates/alerts` | Not Built |
| `useCreateRateAlert` | POST `/rates/alerts` | Not Built |
| `useUpdateRateAlert` | PATCH `/rates/alerts/:id` | Not Built |
| `useDeleteRateAlert` | DELETE `/rates/alerts/:id` | Not Built |
| `useRateAlertHistory` | GET `/rates/alerts/:id/history` | Not Built |
| `useRateDashboard` | GET `/rates/analytics/dashboard` | Not Built |
| `useRateMargins` | GET `/rates/analytics/margins` | Not Built |
| `useRateCompetitiveness` | GET `/rates/analytics/competitiveness` | Not Built |
| `useMarketRates` | GET `/rates/analytics/market` | Not Built |
| `useRateHistory` | GET `/rates/history` | Not Built |
| `useRateTrends` | GET `/rates/trends` | Not Built |
| `useLaneAnalytics` | GET `/rates/lanes` | Not Built |
| `useLaneDetail` | GET `/rates/lanes/:id` | Not Built |
| `useLaneRateHistory` | GET `/rates/lanes/:id/history` | Not Built |
| `useLaneForecast` | GET `/rates/lanes/:id/forecast` | Not Built |
| `useRateProviders` | GET `/rates/providers` | Not Built |
| `useRateLookup` | POST `/rates/lookup` | Not Built |
| `useBatchRateLookup` | POST `/rates/lookup/batch` | Not Built |

---

## 7. Business Rules

1. **Rate Lookups by Lane/Equipment:** A rate lookup requires origin (city/state or zip), destination (city/state or zip), and equipment type (Van, Reefer, Flatbed, etc.). The system queries configured external providers (DAT, Greenscreens.ai) and returns market low, average, and high rates. Results are cached for a configurable TTL (default 4 hours) to reduce API call costs.

2. **Historical Rate Trends:** The system stores every rate lookup result and completed load rate in a historical dataset. Trends are calculated over configurable windows (7d, 30d, 90d, 1y). Trend direction (rising, falling, stable) is computed by comparing the current 7-day average against the prior 30-day average. A change of more than 5% triggers a directional flag.

3. **Market Rate Alerts (Rate Spike/Drop):** Users configure alerts per lane with a threshold percentage (e.g., "alert me if Chicago-Dallas Dry Van rate changes more than 10%"). Alert types: RATE_SPIKE (rate exceeds threshold above baseline), RATE_DROP (rate falls below threshold under baseline). Alerts are evaluated on each new rate lookup or on a scheduled basis (configurable: hourly, daily). Triggered alerts generate notifications via the Notifications service.

4. **Provider Integration (DAT, Greenscreens.ai):** Each provider is registered with API credentials, base URL, and rate type support. The system supports multiple concurrent providers and merges results into a unified rate response. Provider health is monitored via periodic test calls (`POST /rates/providers/:id/test`). If a provider fails 3 consecutive health checks, it is marked DEGRADED and excluded from lookups until manually re-enabled. API keys are encrypted at rest.

5. **Lane Analytics (Avg Rate, Volume, Seasonal Patterns):** Each lane (origin-destination pair) accumulates analytics over time: average rate per mile, total volume (number of loads), rate volatility (standard deviation), and seasonal patterns. Seasonal patterns are detected by comparing monthly averages across years. High-volume lanes (top 20% by load count) are flagged as "key lanes" for priority monitoring. Lane analytics power the Rate Forecast feature, which uses historical patterns to predict rates 30/60/90 days out.

6. **Rate Comparison Against Contracts:** When a rate lookup is performed, the system automatically compares market rates against any active contract rates for the same lane and equipment. The comparison surfaces: contract rate, market average, delta ($ and %), and a recommendation (BELOW_MARKET, AT_MARKET, ABOVE_MARKET). Loads priced more than 15% above market average are flagged for review. This enables brokers to validate quote pricing and renegotiate contracts when market conditions shift.

7. **Competitiveness Scoring:** Each completed load receives a competitiveness score: (market average rate - actual rate paid) / market average rate * 100. A positive score means the load was booked below market (good). A negative score means above market (review needed). Scores aggregate to a company-wide competitiveness index displayed on the Rate Intelligence Dashboard.

8. **Margin Analysis:** The analytics module calculates margins by comparing the customer-facing rate (revenue) against the carrier rate (cost) and benchmarking both against market rates. Margin metrics include: gross margin %, margin vs market, and margin trend over time. Lanes with shrinking margins over 3 consecutive months trigger a margin alert.

---

## 8. Data Model

### RateLookup
```
RateLookup {
  id              String (UUID)
  originCity      String
  originState     String
  originZip       String?
  destinationCity String
  destinationState String
  destinationZip  String?
  equipmentType   EquipmentType (VAN, REEFER, FLATBED, STEP_DECK, etc.)
  rateLow         Decimal
  rateAverage     Decimal
  rateHigh        Decimal
  ratePerMile     Decimal?
  distance        Decimal?
  provider        String (DAT, GREENSCREENS, INTERNAL)
  lookupDate      DateTime
  expiresAt       DateTime
  tenantId        String
  createdAt       DateTime
}
```

### RateAlert
```
RateAlert {
  id              String (UUID)
  name            String
  originCity      String
  originState     String
  destinationCity String
  destinationState String
  equipmentType   EquipmentType
  alertType       RateAlertType (RATE_SPIKE, RATE_DROP, MARGIN_SHRINK)
  thresholdPct    Decimal (e.g., 10.0 for 10%)
  baselineRate    Decimal
  isActive        Boolean (default: true)
  lastTriggeredAt DateTime?
  frequency       AlertFrequency (HOURLY, DAILY, WEEKLY)
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
}
```

### RateProvider
```
RateProvider {
  id              String (UUID)
  name            String (DAT, GREENSCREENS_AI, etc.)
  apiBaseUrl      String
  apiKeyEncrypted String
  status          ProviderStatus (ACTIVE, DEGRADED, INACTIVE)
  supportedTypes  EquipmentType[] (which equipment types this provider covers)
  consecutiveFailures Int (default: 0)
  lastTestedAt    DateTime?
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
}
```

### LaneAnalytics
```
LaneAnalytics {
  id              String (UUID)
  originCity      String
  originState     String
  destinationCity String
  destinationState String
  equipmentType   EquipmentType
  avgRate         Decimal
  avgRatePerMile  Decimal
  totalVolume     Int (number of loads)
  rateVolatility  Decimal (standard deviation)
  isKeyLane       Boolean (default: false)
  seasonalData    Json? (monthly averages)
  lastUpdatedAt   DateTime
  tenantId        String
  createdAt       DateTime
  updatedAt       DateTime
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `originCity` | Required, non-empty string | "Origin city is required" |
| `originState` | Required, valid 2-letter US state code | "Valid origin state is required" |
| `destinationCity` | Required, non-empty string | "Destination city is required" |
| `destinationState` | Required, valid 2-letter US state code | "Valid destination state is required" |
| `equipmentType` | Required, IsEnum(EquipmentType) | "Valid equipment type is required" |
| `thresholdPct` | Required for alerts, 1-100 | "Threshold must be between 1% and 100%" |
| `frequency` | Required for alerts, IsEnum(AlertFrequency) | "Valid alert frequency is required" |
| `apiBaseUrl` | Required for providers, valid URL | "Valid API base URL is required" |
| `apiKeyEncrypted` | Required for providers, non-empty | "API key is required" |
| Origin != Destination | Origin city+state must differ from destination | "Origin and destination must be different" |

---

## 10. Status States

### Rate Provider Status Machine
```
ACTIVE -> DEGRADED (3 consecutive health check failures, auto)
DEGRADED -> ACTIVE (manual re-enable after fix + successful test)
DEGRADED -> INACTIVE (admin disables provider)
ACTIVE -> INACTIVE (admin disables provider)
INACTIVE -> ACTIVE (admin re-enables + successful connectivity test)
```

### Rate Alert Status
```
ACTIVE -> INACTIVE (user disables alert)
INACTIVE -> ACTIVE (user re-enables alert)
ACTIVE -> TRIGGERED (threshold breached, creates notification)
TRIGGERED -> ACTIVE (auto, after notification sent — alert remains active for future triggers)
```

---

## 11. Known Issues

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| All 21 endpoints are scaffolded only -- no real provider integration | P0 Blocker | `rate-intelligence/` | Open |
| No Prisma models verified for rate intelligence | P1 | `schema.prisma` | Needs verification |
| No frontend pages, components, or hooks exist | P1 | -- | Open |
| No tests for any rate intelligence code | P2 | -- | Open |
| DAT API contract not signed -- cannot implement lookups | P0 External | -- | Blocked |
| Greenscreens.ai API contract not signed | P0 External | -- | Blocked |
| Rate caching strategy not implemented | P1 | -- | Open |
| No scheduled jobs for alert evaluation | P1 | -- | Open |

---

## 12. Tasks

### Prerequisites (Must Complete First)
| Task ID | Title | Effort | Status |
|---------|-------|--------|--------|
| RATE-001 | Sign DAT API contract and obtain credentials | -- | Blocked (commercial) |
| RATE-002 | Sign Greenscreens.ai API contract and obtain credentials | -- | Blocked (commercial) |
| RATE-003 | Define and migrate Prisma models for rate intelligence | M (4h) | Not Started |

### Backend
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| RATE-004 | Implement DAT provider integration (lookup, batch) | L (8h) | P3 |
| RATE-005 | Implement Greenscreens.ai provider integration | L (8h) | P3 |
| RATE-006 | Implement rate caching layer (TTL-based) | M (4h) | P3 |
| RATE-007 | Implement rate alert evaluation scheduled job | M (5h) | P3 |
| RATE-008 | Implement lane analytics aggregation job | M (5h) | P3 |
| RATE-009 | Implement rate history storage and trend calculation | M (4h) | P3 |
| RATE-010 | Implement contract rate comparison logic | M (4h) | P3 |
| RATE-011 | Implement competitiveness scoring | S (2h) | P3 |

### Frontend
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| RATE-012 | Build Rate Intelligence Dashboard page | L (8h) | P3 |
| RATE-013 | Build Lane Rate Lookup page + form | M (5h) | P3 |
| RATE-014 | Build Rate Trends page with charts | L (8h) | P3 |
| RATE-015 | Build Rate Alerts CRUD page | M (5h) | P3 |
| RATE-016 | Build Rate Comparison page | M (5h) | P3 |
| RATE-017 | Build Market Rates page | M (5h) | P3 |
| RATE-018 | Build Rate Forecast page | L (8h) | P3 |
| RATE-019 | Build Rate Reports page | M (5h) | P3 |
| RATE-020 | Create all rate intelligence hooks (18 hooks) | M (4h) | P3 |

### Testing
| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| RATE-021 | Write backend unit tests for rate intelligence | L (8h) | P3 |
| RATE-022 | Write frontend tests for rate intelligence pages | M (5h) | P3 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/00-service-overview.md` |
| Rate Intelligence Dashboard | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/01-rate-intelligence-dashboard.md` |
| Market Rates | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/02-market-rates.md` |
| Rate Trends | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/03-rate-trends.md` |
| Lane Rate Lookup | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/04-lane-rate-lookup.md` |
| Rate Comparison | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/05-rate-comparison.md` |
| Rate Alerts | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/06-rate-alerts.md` |
| Rate Forecast | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/07-rate-forecast.md` |
| Rate Reports | Full 15-section | `dev_docs/12-Rabih-design-Process/26-rate-intelligence/08-rate-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Full rate intelligence service | 6 controllers scaffolded, 0 frontend | Backend structure only |
| DAT integration | Not implemented | Blocked on commercial contract |
| Greenscreens.ai integration | Not implemented | Blocked on commercial contract |
| 8 screens planned (per design specs) | 0 built | All deferred to P3 |
| Rate alerting system | Controller exists, no scheduled job | Needs implementation |
| Lane analytics | Controller exists, no aggregation logic | Needs implementation |
| Rate forecasting (ML) | Endpoint exists, no model | Needs data + ML pipeline |
| Tests required | 0 tests | Not started |

---

## 15. Dependencies

**Depends on:**
- Auth & Admin (JWT, roles, tenantId)
- DAT RateView API (external, commercial -- primary market rate source)
- Greenscreens.ai API (external, commercial -- AI-powered rate predictions)
- TMS Core (load data for historical rate calculations, contract rates for comparison)
- Notifications (alert delivery when rate thresholds are breached)
- Carriers (carrier rate data for competitiveness analysis)

**Depended on by:**
- Sales & Quotes (market rate benchmarking for quote pricing)
- TMS Core / Load Planner (rate validation during load creation)
- Accounting (margin analysis, rate vs cost reporting)
- Carrier Scorecard (rate competitiveness as a scoring factor)
- Reports & Analytics (rate trend data for executive dashboards)
