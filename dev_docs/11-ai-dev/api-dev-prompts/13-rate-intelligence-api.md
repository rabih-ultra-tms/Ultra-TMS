# 13 - Rate Intelligence Service API Implementation

> **Service:** Rate Intelligence  
> **Priority:** P2 - Medium  
> **Endpoints:** 25  
> **Dependencies:** TMS Core ✅ (01), Sales ✅, Integration Hub  
> **Doc Reference:** [43-service-rate-intelligence.md](../../02-services/43-service-rate-intelligence.md)

---

## 📋 Overview

Market rate intelligence service integrating with DAT, Truckstop, and Greenscreens for real-time rate data, historical analysis, lane benchmarking, and rate alerting. Enables data-driven pricing decisions through market insights.

### Key Capabilities
- Real-time spot rate lookups
- Multi-source rate aggregation
- Historical rate trends and analysis
- Lane profitability benchmarking
- Rate change alerts and notifications
- Provider configuration and management

---

## ✅ Pre-Implementation Checklist

- [ ] Sales service is working (quotes for margin analysis)
- [ ] TMS Core service is working (loads for rate tracking)
- [ ] Rate provider API credentials configured
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### RateQuery Model
```prisma
model RateQuery {
  id                String            @id @default(cuid())
  tenantId          String
  
  // Query parameters
  originCity        String?
  originState       String?
  originZip         String?
  destCity          String?
  destState         String?
  destZip           String?
  equipmentType     String?
  queryDate         DateTime          @default(now())
  
  dataSource        String            // DAT, TRUCKSTOP, GREENSCREENS
  
  // Results
  lowRate           Decimal?          @db.Decimal(10,2)
  averageRate       Decimal?          @db.Decimal(10,2)
  highRate          Decimal?          @db.Decimal(10,2)
  fuelSurcharge     Decimal?          @db.Decimal(10,2)
  
  // Confidence/quality
  sampleSize        Int?
  confidenceScore   Int?              // 0-100
  dataAgeHours      Int?
  
  rawResponse       Json?
  
  createdAt         DateTime          @default(now())
  queriedBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
  @@index([originState, destState])
  @@index([queryDate])
}
```

### RateHistory Model
```prisma
model RateHistory {
  id                String            @id @default(cuid())
  tenantId          String?           // null for global data
  
  originMarket      String
  destMarket        String
  equipmentType     String
  
  rateDate          DateTime
  
  lowRate           Decimal?          @db.Decimal(10,2)
  averageRate       Decimal?          @db.Decimal(10,2)
  highRate          Decimal?          @db.Decimal(10,2)
  ratePerMile       Decimal?          @db.Decimal(8,4)
  
  loadToTruckRatio  Decimal?          @db.Decimal(6,2)
  postedLoads       Int?
  postedTrucks      Int?
  
  dataSource        String
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@unique([originMarket, destMarket, equipmentType, rateDate, dataSource])
  @@index([originMarket, destMarket])
  @@index([rateDate])
}
```

### RateAlert Model
```prisma
model RateAlert {
  id                String            @id @default(cuid())
  tenantId          String
  
  name              String
  alertType         RateAlertType
  
  // Lane criteria
  originMarket      String?
  destMarket        String?
  equipmentType     String?
  
  // Trigger conditions
  thresholdType     ThresholdType?    // PERCENTAGE, ABSOLUTE
  thresholdValue    Decimal?          @db.Decimal(10,2)
  comparisonPeriod  String?           // DAY, WEEK, MONTH
  
  // Notification
  notifyUsers       String[]
  notifyEmail       String[]
  notifySms         String[]
  
  isActive          Boolean           @default(true)
  lastTriggeredAt   DateTime?
  triggerCount      Int               @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdBy         String?
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  history           RateAlertHistory[]
  
  @@index([tenantId])
}

enum RateAlertType {
  RATE_INCREASE
  RATE_DECREASE
  THRESHOLD
  MARKET_SPIKE
  CAPACITY_LOW
}

enum ThresholdType {
  PERCENTAGE
  ABSOLUTE
}
```

### RateAlertHistory Model
```prisma
model RateAlertHistory {
  id                String            @id @default(cuid())
  tenantId          String
  alertId           String
  
  triggeredAt       DateTime          @default(now())
  triggerData       Json              // { oldRate, newRate, changePercent, lane }
  
  notificationsSent Json?             // [{ type, recipient, sentAt, status }]
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  alert             RateAlert         @relation(fields: [alertId], references: [id])
  
  @@index([alertId])
}
```

### LaneAnalytics Model
```prisma
model LaneAnalytics {
  id                String            @id @default(cuid())
  tenantId          String
  
  originMarket      String
  destMarket        String
  equipmentType     String
  
  periodType        AnalyticsPeriod
  periodStart       DateTime
  periodEnd         DateTime
  
  // Volume
  loadsQuoted       Int               @default(0)
  loadsBooked       Int               @default(0)
  winRate           Decimal?          @db.Decimal(5,2)
  
  // Rates
  avgQuotedRate     Decimal?          @db.Decimal(10,2)
  avgBookedRate     Decimal?          @db.Decimal(10,2)
  avgMarketRate     Decimal?          @db.Decimal(10,2)
  
  // Margins
  avgMarginPercent  Decimal?          @db.Decimal(5,2)
  avgMarginAmount   Decimal?          @db.Decimal(10,2)
  
  // Comparison
  rateVsMarketPercent Decimal?        @db.Decimal(5,2)
  
  calculatedAt      DateTime          @default(now())
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, originMarket, destMarket, equipmentType, periodType, periodStart])
  @@index([tenantId])
  @@index([originMarket, destMarket])
}

enum AnalyticsPeriod {
  WEEK
  MONTH
  QUARTER
}
```

### RateProviderConfig Model
```prisma
model RateProviderConfig {
  id                String            @id @default(cuid())
  tenantId          String
  
  provider          RateProvider
  
  apiKeyEncrypted   String?
  apiSecretEncrypted String?
  username          String?
  
  isActive          Boolean           @default(true)
  priority          Int               @default(1)
  
  dailyQuota        Int?
  queriesToday      Int               @default(0)
  quotaResetAt      DateTime?
  
  lastSuccessfulQuery DateTime?
  lastError         String?           @db.Text
  errorCount        Int               @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, provider])
}

enum RateProvider {
  DAT
  TRUCKSTOP
  GREENSCREENS
}
```

---

## 🛠️ API Endpoints

### Rate Lookup (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/rates/lookup` | Get real-time rates |
| POST | `/api/v1/rates/lookup/batch` | Batch rate lookup |
| GET | `/api/v1/rates/history` | Get rate history |
| GET | `/api/v1/rates/trends` | Get rate trends |

### Lane Analysis (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/rates/lanes` | List analyzed lanes |
| GET | `/api/v1/rates/lanes/:id` | Get lane details |
| GET | `/api/v1/rates/lanes/:id/history` | Lane rate history |
| GET | `/api/v1/rates/lanes/:id/forecast` | Lane rate forecast |

### Alerts (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/rates/alerts` | List alerts |
| POST | `/api/v1/rates/alerts` | Create alert |
| PATCH | `/api/v1/rates/alerts/:id` | Update alert |
| DELETE | `/api/v1/rates/alerts/:id` | Delete alert |
| GET | `/api/v1/rates/alerts/:id/history` | Alert history |

### Analytics (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/rates/analytics/dashboard` | Analytics dashboard |
| GET | `/api/v1/rates/analytics/margins` | Margin analysis |
| GET | `/api/v1/rates/analytics/competitiveness` | Rate competitiveness |
| GET | `/api/v1/rates/analytics/market` | Market overview |

### Provider Management (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/rates/providers` | List providers |
| POST | `/api/v1/rates/providers` | Add provider |
| PATCH | `/api/v1/rates/providers/:id` | Update provider |
| POST | `/api/v1/rates/providers/:id/test` | Test connection |

---

## 📝 DTO Specifications

### RateLookupDto
```typescript
export class RateLookupDto {
  @IsOptional()
  @IsString()
  originCity?: string;

  @IsString()
  @Length(2, 3)
  originState: string;

  @IsOptional()
  @IsString()
  originZip?: string;

  @IsOptional()
  @IsString()
  destCity?: string;

  @IsString()
  @Length(2, 3)
  destState: string;

  @IsOptional()
  @IsString()
  destZip?: string;

  @IsString()
  equipmentType: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  providers?: string[];  // Specific providers or all
}
```

### BatchRateLookupDto
```typescript
export class BatchRateLookupDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateLookupDto)
  queries: RateLookupDto[];
}
```

### RateHistoryQueryDto
```typescript
export class RateHistoryQueryDto {
  @IsString()
  originMarket: string;

  @IsString()
  destMarket: string;

  @IsString()
  equipmentType: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsString()
  dataSource?: string;
}
```

### CreateRateAlertDto
```typescript
export class CreateRateAlertDto {
  @IsString()
  name: string;

  @IsEnum(RateAlertType)
  alertType: RateAlertType;

  @IsOptional()
  @IsString()
  originMarket?: string;

  @IsOptional()
  @IsString()
  destMarket?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsEnum(ThresholdType)
  thresholdType?: ThresholdType;

  @IsOptional()
  @IsNumber()
  thresholdValue?: number;

  @IsOptional()
  @IsString()
  comparisonPeriod?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notifyUsers?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  notifyEmail?: string[];
}
```

### CreateProviderConfigDto
```typescript
export class CreateProviderConfigDto {
  @IsEnum(RateProvider)
  provider: RateProvider;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsInt()
  dailyQuota?: number;
}
```

---

## 📋 Business Rules

### Multi-Source Rate Aggregation
```typescript
async function getRates(lane: Lane): Promise<RateResult> {
  const providers = await getActiveProviders();
  const results = await Promise.allSettled(
    providers.map(p => queryProvider(p, lane))
  );

  const validResults = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  if (validResults.length === 0) {
    throw new Error('No rate data available');
  }

  return aggregateRates(validResults);
}

function aggregateRates(results: ProviderResult[]): RateResult {
  return {
    lowRate: Math.min(...results.map(r => r.lowRate)),
    averageRate: results.reduce((sum, r) => sum + r.averageRate, 0) / results.length,
    highRate: Math.max(...results.map(r => r.highRate)),
    confidence: calculateConfidence(results),
    sources: results.map(r => r.provider)
  };
}
```

### Confidence Score Calculation
```typescript
function calculateConfidence(result: RateResult): number {
  let score = 100;

  // Reduce for old data
  if (result.dataAgeHours > 24) score -= 20;
  if (result.dataAgeHours > 72) score -= 30;

  // Reduce for small sample
  if (result.sampleSize < 10) score -= 20;
  if (result.sampleSize < 5) score -= 30;

  // Reduce for single source
  if (result.sourceCount === 1) score -= 10;

  return Math.max(0, score);
}
```

### Alert Trigger Conditions
| Alert Type | Trigger Condition |
|------------|-------------------|
| RATE_INCREASE | Rate up by threshold vs period |
| RATE_DECREASE | Rate down by threshold vs period |
| THRESHOLD | Rate crosses specified value |
| MARKET_SPIKE | Rate changes >15% in 24 hours |
| CAPACITY_LOW | Load-to-truck ratio >10:1 |

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `rate.query.completed` | Rate lookup done | `{ queryId, results }` |
| `rate.alert.triggered` | Alert condition met | `{ alertId, lane, change }` |
| `rate.market.spike` | Market volatility | `{ lane, change, direction }` |
| `rate.provider.error` | Provider failed | `{ provider, error }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `quote.created` | Sales | Track quoted rates |
| `load.booked` | TMS Core | Track booked rates for margin |
| `scheduler.daily` | Scheduler | Trigger daily rate refresh |
| `scheduler.15min` | Scheduler | Check alert conditions |

---

## 🧪 Integration Test Requirements

```typescript
describe('Rate Intelligence API', () => {
  describe('Rate Lookup', () => {
    it('should lookup rate from single provider');
    it('should aggregate rates from multiple providers');
    it('should calculate confidence score');
    it('should handle provider failures gracefully');
    it('should batch lookup multiple lanes');
  });

  describe('Rate History', () => {
    it('should retrieve historical rates');
    it('should calculate rate trends');
    it('should show lane analytics');
  });

  describe('Alerts', () => {
    it('should create rate alert');
    it('should trigger on threshold breach');
    it('should send notifications');
    it('should track alert history');
  });

  describe('Provider Management', () => {
    it('should configure provider');
    it('should test provider connection');
    it('should track quota usage');
    it('should failover to backup provider');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/rate-intelligence/
├── rate-intelligence.module.ts
├── lookup/
│   ├── rate-lookup.controller.ts
│   ├── rate-lookup.service.ts
│   ├── rate-aggregator.service.ts
│   └── dto/
├── history/
│   ├── rate-history.controller.ts
│   └── rate-history.service.ts
├── lanes/
│   ├── lane-analytics.controller.ts
│   └── lane-analytics.service.ts
├── alerts/
│   ├── rate-alerts.controller.ts
│   ├── rate-alerts.service.ts
│   ├── alert-evaluator.service.ts
│   └── dto/
├── analytics/
│   ├── analytics.controller.ts
│   └── analytics.service.ts
├── providers/
│   ├── providers.controller.ts
│   ├── providers.service.ts
│   ├── provider.interface.ts
│   ├── dat.provider.ts
│   ├── truckstop.provider.ts
│   └── greenscreens.provider.ts
└── dto/
```

---

## ✅ Completion Checklist

- [ ] All 25 endpoints implemented
- [ ] DAT API integration working
- [ ] Truckstop API integration working
- [ ] Rate aggregation logic
- [ ] Confidence scoring
- [ ] Rate alert system
- [ ] Alert notifications
- [ ] Lane analytics calculation
- [ ] Rate caching (60 min TTL)
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>26</td>
    <td>Rate Intelligence</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>25/25</td>
    <td>5/5</td>
    <td>100%</td>
    <td>Lookup, History, Lanes, Alerts, Providers</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[14-analytics-api.md](./14-analytics-api.md)** - Implement Analytics Service API
