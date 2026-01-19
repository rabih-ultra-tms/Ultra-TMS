# 26 - Rate Intelligence UI Implementation

> **Service:** Rate Intelligence (Market Rate Analysis)  
> **Priority:** P3 - Low  
> **Pages:** 5  
> **API Endpoints:** 16  
> **Dependencies:** Foundation ✅, Auth API ✅, Rate Intelligence API ✅  
> **Doc Reference:** N/A (Custom Service)

---

## 📋 Overview

The Rate Intelligence UI provides interfaces for market rate analysis, lane rate trends, competitive pricing insights, and rate benchmarking. This helps with pricing decisions and market positioning.

### Key Screens
- Rate dashboard
- Lane rate lookup
- Market trends
- Rate history
- Benchmarking reports

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Rate Intelligence API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── rates/
│   ├── page.tsx                    # Rate dashboard
│   ├── lookup/
│   │   └── page.tsx                # Lane rate lookup
│   ├── trends/
│   │   └── page.tsx                # Market trends
│   ├── history/
│   │   └── page.tsx                # Historical rates
│   └── benchmarks/
│       └── page.tsx                # Benchmarking
```

---

## 🎨 Components to Create

```
components/rates/
├── rate-dashboard-stats.tsx        # Dashboard metrics
├── rate-trend-chart.tsx            # Trend visualization
├── lane-lookup-form.tsx            # Origin/dest input
├── lane-rate-result.tsx            # Rate display
├── rate-breakdown.tsx              # Rate components
├── rate-comparison.tsx             # Compare to market
├── market-trends-chart.tsx         # Trends over time
├── regional-rates-map.tsx          # Geographic view
├── fuel-surcharge-card.tsx         # Fuel rates
├── rate-history-table.tsx          # Historical data
├── rate-history-chart.tsx          # History chart
├── benchmark-comparison.tsx        # vs benchmarks
├── competitor-analysis.tsx         # Market position
├── rate-confidence-badge.tsx       # Confidence level
├── rate-source-indicator.tsx       # Data source
├── equipment-rate-filter.tsx       # Equipment type
├── date-range-selector.tsx         # Date filtering
└── export-rates-button.tsx         # Export data
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/rates.ts`

```typescript
export type EquipmentType = 
  | 'VAN'
  | 'REEFER'
  | 'FLATBED'
  | 'STEP_DECK'
  | 'LOWBOY'
  | 'TANKER'
  | 'CONTAINER'
  | 'OTHER';

export type RateConfidence = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type RateSource = 'HISTORICAL' | 'MARKET' | 'CONTRACT' | 'SPOT';

export interface LaneRate {
  id: string;
  
  // Lane
  originCity: string;
  originState: string;
  originZip?: string;
  destinationCity: string;
  destinationState: string;
  destinationZip?: string;
  
  // Distance
  miles: number;
  
  // Equipment
  equipmentType: EquipmentType;
  
  // Rates
  ratePerMile: number;
  flatRate: number;
  fuelSurcharge: number;
  totalRate: number;
  
  // Ranges
  lowRate: number;
  highRate: number;
  
  // Context
  confidence: RateConfidence;
  sampleSize: number;
  
  // Sources
  sources: RateSource[];
  
  // Trend
  trendDirection: 'UP' | 'DOWN' | 'FLAT';
  trendPercent: number;
  
  // Dates
  effectiveDate: string;
  validUntil?: string;
  
  updatedAt: string;
}

export interface RateLookupRequest {
  originZip?: string;
  originCity?: string;
  originState: string;
  destinationZip?: string;
  destinationCity?: string;
  destinationState: string;
  equipmentType: EquipmentType;
  pickupDate?: string;
}

export interface MarketTrend {
  id: string;
  
  // Period
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  date: string;
  
  // Equipment
  equipmentType: EquipmentType;
  
  // Region (optional)
  region?: string;
  
  // Rates
  avgRatePerMile: number;
  medianRatePerMile: number;
  
  // Changes
  changeFromPrevious: number;
  changePercent: number;
  
  // Volume
  loadVolume: number;
  volumeChange: number;
  
  // Capacity
  truckCapacity: number;
  marketRatio: number; // loads to trucks
}

export interface RateHistory {
  lane: string;
  equipmentType: EquipmentType;
  
  dataPoints: Array<{
    date: string;
    rate: number;
    volume?: number;
    source: RateSource;
  }>;
  
  // Summary
  avgRate: number;
  minRate: number;
  maxRate: number;
  volatility: number;
}

export interface RateBenchmark {
  id: string;
  name: string;
  
  // Scope
  region?: string;
  equipmentType?: EquipmentType;
  
  // Your Performance
  yourAvgRate: number;
  yourLoadCount: number;
  
  // Market
  marketAvgRate: number;
  marketMedianRate: number;
  
  // Comparison
  vsMarketPercent: number;
  vsMarketDollar: number;
  
  // Ranking
  percentile: number;
  
  period: string;
}

export interface FuelRate {
  region: string;
  fuelType: 'DIESEL' | 'GASOLINE';
  
  pricePerGallon: number;
  changeFromLastWeek: number;
  
  surchargePerMile: number;
  
  effectiveDate: string;
}

export interface RateDashboardData {
  // Current Market
  nationalAvgRate: number;
  nationalRateChange: number;
  
  // By Equipment
  ratesByEquipment: Array<{
    type: EquipmentType;
    rate: number;
    change: number;
  }>;
  
  // Fuel
  currentDieselPrice: number;
  dieselChange: number;
  
  // Your Activity
  yourAvgRate: number;
  yourVsMarket: number;
  quotesThisWeek: number;
  
  // Trends
  trendData: MarketTrend[];
  
  // Hot Lanes
  hotLanes: Array<{
    lane: string;
    rate: number;
    change: number;
  }>;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/rates/use-rates.ts`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  LaneRate,
  RateLookupRequest,
  MarketTrend,
  RateHistory,
  RateBenchmark,
  FuelRate,
  RateDashboardData,
} from '@/lib/types/rates';
import { toast } from 'sonner';

export const rateKeys = {
  all: ['rates'] as const,
  dashboard: () => [...rateKeys.all, 'dashboard'] as const,
  
  lookup: (params: RateLookupRequest) => [...rateKeys.all, 'lookup', params] as const,
  
  trends: () => [...rateKeys.all, 'trends'] as const,
  trendsList: (params?: Record<string, unknown>) => [...rateKeys.trends(), 'list', params] as const,
  
  history: () => [...rateKeys.all, 'history'] as const,
  historyLane: (origin: string, dest: string) => [...rateKeys.history(), origin, dest] as const,
  
  benchmarks: () => [...rateKeys.all, 'benchmarks'] as const,
  benchmarksList: (params?: Record<string, unknown>) => [...rateKeys.benchmarks(), 'list', params] as const,
  
  fuel: () => [...rateKeys.all, 'fuel'] as const,
};

// Dashboard
export function useRateDashboard() {
  return useQuery({
    queryKey: rateKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: RateDashboardData }>('/rates/dashboard'),
  });
}

// Lane Lookup
export function useLaneRateLookup(request: RateLookupRequest | null) {
  return useQuery({
    queryKey: rateKeys.lookup(request!),
    queryFn: () => apiClient.post<{ data: LaneRate }>('/rates/lookup', request),
    enabled: !!request && !!request.originState && !!request.destinationState,
  });
}

export function useQuickLaneRate() {
  return useMutation({
    mutationFn: (request: RateLookupRequest) =>
      apiClient.post<{ data: LaneRate }>('/rates/lookup', request),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to get rate');
    },
  });
}

// Market Trends
export function useMarketTrends(params = {}) {
  return useQuery({
    queryKey: rateKeys.trendsList(params),
    queryFn: () => apiClient.get<{ data: MarketTrend[] }>('/rates/trends', params),
  });
}

// Rate History
export function useRateHistory(origin: string, destination: string, params = {}) {
  return useQuery({
    queryKey: rateKeys.historyLane(origin, destination),
    queryFn: () => apiClient.get<{ data: RateHistory }>(`/rates/history/${origin}/${destination}`, params),
    enabled: !!origin && !!destination,
  });
}

// Benchmarks
export function useRateBenchmarks(params = {}) {
  return useQuery({
    queryKey: rateKeys.benchmarksList(params),
    queryFn: () => apiClient.get<{ data: RateBenchmark[] }>('/rates/benchmarks', params),
  });
}

// Fuel Rates
export function useFuelRates() {
  return useQuery({
    queryKey: rateKeys.fuel(),
    queryFn: () => apiClient.get<{ data: FuelRate[] }>('/rates/fuel'),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Export
export function useExportRates() {
  return useMutation({
    mutationFn: (params: { type: string; format: string; filters?: Record<string, unknown> }) =>
      apiClient.post<{ downloadUrl: string }>('/rates/export', params),
    onSuccess: (data) => {
      window.open(data.downloadUrl, '_blank');
      toast.success('Export ready');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Export failed');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/rates-store.ts`

```typescript
import { createStore } from './create-store';
import { EquipmentType, RateLookupRequest } from '@/lib/types/rates';

interface RatesFilters {
  equipmentType: EquipmentType | '';
  region: string;
  period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}

interface RatesState {
  filters: RatesFilters;
  lookupRequest: RateLookupRequest | null;
  isLookupOpen: boolean;
  
  setFilter: <K extends keyof RatesFilters>(key: K, value: RatesFilters[K]) => void;
  resetFilters: () => void;
  setLookupRequest: (request: RateLookupRequest | null) => void;
  setLookupOpen: (open: boolean) => void;
}

const defaultFilters: RatesFilters = {
  equipmentType: '',
  region: '',
  period: 'MONTH',
};

export const useRatesStore = createStore<RatesState>('rates-store', (set, get) => ({
  filters: defaultFilters,
  lookupRequest: null,
  isLookupOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setLookupRequest: (request) => set({ lookupRequest: request }),
  
  setLookupOpen: (open) => set({ isLookupOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/rates.ts`

```typescript
import { z } from 'zod';

export const rateLookupSchema = z.object({
  originZip: z.string().optional(),
  originCity: z.string().optional(),
  originState: z.string().length(2, 'State code required'),
  destinationZip: z.string().optional(),
  destinationCity: z.string().optional(),
  destinationState: z.string().length(2, 'State code required'),
  equipmentType: z.enum(['VAN', 'REEFER', 'FLATBED', 'STEP_DECK', 'LOWBOY', 'TANKER', 'CONTAINER', 'OTHER']),
  pickupDate: z.string().optional(),
}).refine(
  data => data.originZip || data.originCity,
  { message: 'Origin city or ZIP is required', path: ['originCity'] }
).refine(
  data => data.destinationZip || data.destinationCity,
  { message: 'Destination city or ZIP is required', path: ['destinationCity'] }
);

export const rateExportSchema = z.object({
  type: z.enum(['TRENDS', 'HISTORY', 'BENCHMARKS']),
  format: z.enum(['CSV', 'EXCEL', 'PDF']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type RateLookupData = z.infer<typeof rateLookupSchema>;
export type RateExportData = z.infer<typeof rateExportSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/rates/rate-dashboard-stats.tsx`
- [ ] `components/rates/rate-trend-chart.tsx`
- [ ] `components/rates/lane-lookup-form.tsx`
- [ ] `components/rates/lane-rate-result.tsx`
- [ ] `components/rates/rate-breakdown.tsx`
- [ ] `components/rates/rate-comparison.tsx`
- [ ] `components/rates/market-trends-chart.tsx`
- [ ] `components/rates/regional-rates-map.tsx`
- [ ] `components/rates/fuel-surcharge-card.tsx`
- [ ] `components/rates/rate-history-table.tsx`
- [ ] `components/rates/rate-history-chart.tsx`
- [ ] `components/rates/benchmark-comparison.tsx`
- [ ] `components/rates/competitor-analysis.tsx`
- [ ] `components/rates/rate-confidence-badge.tsx`
- [ ] `components/rates/rate-source-indicator.tsx`
- [ ] `components/rates/equipment-rate-filter.tsx`
- [ ] `components/rates/date-range-selector.tsx`
- [ ] `components/rates/export-rates-button.tsx`

### Pages
- [ ] `app/(dashboard)/rates/page.tsx`
- [ ] `app/(dashboard)/rates/lookup/page.tsx`
- [ ] `app/(dashboard)/rates/trends/page.tsx`
- [ ] `app/(dashboard)/rates/history/page.tsx`
- [ ] `app/(dashboard)/rates/benchmarks/page.tsx`

### Hooks & Stores
- [ ] `lib/types/rates.ts`
- [ ] `lib/validations/rates.ts`
- [ ] `lib/hooks/rates/use-rates.ts`
- [ ] `lib/stores/rates-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [27-help-desk-ui.md](./27-help-desk-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [API Review](../../api-review-docs/26-rate-intelligence-review.html)
