# 25 - Safety UI Implementation

> **Service:** Safety (Safety & Compliance Management)  
> **Priority:** P2 - Medium  
> **Pages:** 6  
> **API Endpoints:** 20  
> **Dependencies:** Foundation ✅, Auth API ✅, Safety API ✅, Carrier API ✅  
> **Doc Reference:** [36-service-safety.md](../../02-services/36-service-safety.md)

---

## 📋 Overview

The Safety UI provides interfaces for monitoring carrier safety ratings, FMCSA compliance, insurance tracking, and safety violations. This enables proactive carrier vetting and compliance monitoring.

### Key Screens
- Safety dashboard
- Carrier safety profiles
- Insurance monitoring
- Safety scores & ratings
- Violations & alerts
- Compliance reports

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Carrier prompt (05) is complete
- [ ] Safety API is deployed

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── safety/
│   ├── page.tsx                    # Safety dashboard
│   ├── carriers/
│   │   ├── page.tsx                # All carriers safety
│   │   └── [id]/
│   │       └── page.tsx            # Carrier safety profile
│   ├── insurance/
│   │   └── page.tsx                # Insurance monitoring
│   ├── violations/
│   │   └── page.tsx                # Violations list
│   ├── alerts/
│   │   └── page.tsx                # Safety alerts
│   └── reports/
│       └── page.tsx                # Compliance reports
```

---

## 🎨 Components to Create

```
components/safety/
├── safety-dashboard-stats.tsx      # Dashboard metrics
├── safety-score-chart.tsx          # Score distribution
├── carrier-safety-table.tsx        # Carriers list
├── carrier-safety-card.tsx         # Summary card
├── carrier-safety-profile.tsx      # Full profile
├── safety-score-badge.tsx          # Score indicator
├── safety-rating-display.tsx       # FMCSA rating
├── inspection-history.tsx          # Inspection table
├── inspection-detail.tsx           # Single inspection
├── violation-table.tsx             # Violations list
├── violation-card.tsx              # Violation summary
├── insurance-monitoring.tsx        # Insurance list
├── insurance-card.tsx              # Single policy
├── insurance-expiry-alert.tsx      # Expiry warning
├── authority-status.tsx            # MC/DOT status
├── out-of-service-rate.tsx         # OOS metrics
├── crash-history.tsx               # Crash records
├── safety-alerts-list.tsx          # Alerts queue
├── alert-detail.tsx                # Alert view
├── alert-action-form.tsx           # Handle alert
├── safety-filters.tsx              # Filter controls
└── refresh-safety-button.tsx       # Fetch latest
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/safety.ts`

```typescript
export type SafetyRating = 'SATISFACTORY' | 'CONDITIONAL' | 'UNSATISFACTORY' | 'UNRATED';

export type SafetyScoreLevel = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

export type InsuranceType = 'LIABILITY' | 'CARGO' | 'GENERAL' | 'WORKERS_COMP' | 'OTHER';

export type InsuranceStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED';

export type ViolationSeverity = 'MINOR' | 'SERIOUS' | 'CRITICAL' | 'OOS';

export type AlertType = 
  | 'INSURANCE_EXPIRING'
  | 'INSURANCE_EXPIRED'
  | 'AUTHORITY_REVOKED'
  | 'RATING_CHANGE'
  | 'HIGH_OOS_RATE'
  | 'SAFETY_EVENT'
  | 'VIOLATION_ADDED';

export interface CarrierSafetyProfile {
  id: string;
  carrierId: string;
  carrierName: string;
  mcNumber?: string;
  dotNumber: string;
  
  // FMCSA Data
  safetyRating: SafetyRating;
  safetyRatingDate?: string;
  
  // Authority
  operatingAuthority: 'ACTIVE' | 'INACTIVE' | 'REVOKED' | 'PENDING';
  authorityType: string[];
  
  // Scores
  overallScore: number;
  scoreLevel: SafetyScoreLevel;
  
  // BASIC Scores
  basicScores: {
    unsafeDriving: number;
    hoursOfService: number;
    driverFitness: number;
    controlledSubstances: number;
    vehicleMaintenance: number;
    hazardousMaterials?: number;
    crashIndicator: number;
  };
  
  // OOS Rates
  outOfServiceRates: {
    driver: number;
    vehicle: number;
    hazmat?: number;
  };
  nationalAverage: {
    driver: number;
    vehicle: number;
    hazmat?: number;
  };
  
  // Inspections
  inspectionSummary: {
    total: number;
    last24Months: number;
    driverInspections: number;
    vehicleInspections: number;
  };
  
  // Crashes
  crashSummary: {
    total: number;
    fatal: number;
    injury: number;
    towAway: number;
  };
  
  // Insurance
  insurancePolicies: InsurancePolicy[];
  
  // Recent
  recentViolations: Violation[];
  
  lastUpdated: string;
  lastFmcsaSync?: string;
}

export interface InsurancePolicy {
  id: string;
  carrierId: string;
  carrierName?: string;
  
  type: InsuranceType;
  policyNumber: string;
  
  // Provider
  insurerName: string;
  insurerPhone?: string;
  
  // Coverage
  coverageAmount: number;
  deductible?: number;
  
  // Dates
  effectiveDate: string;
  expirationDate: string;
  
  // Status
  status: InsuranceStatus;
  daysUntilExpiry: number;
  
  // Documents
  certificateUrl?: string;
  
  // Alerts
  expiryAlertSent?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface Violation {
  id: string;
  carrierId: string;
  carrierName?: string;
  
  // Details
  code: string;
  description: string;
  category: string;
  
  // Severity
  severity: ViolationSeverity;
  isOutOfService: boolean;
  
  // Inspection
  inspectionId?: string;
  inspectionDate: string;
  inspectionState: string;
  
  // Resolution
  isResolved: boolean;
  resolvedAt?: string;
  
  createdAt: string;
}

export interface Inspection {
  id: string;
  carrierId: string;
  
  // Report
  reportNumber: string;
  reportState: string;
  
  // Details
  inspectionDate: string;
  level: '1' | '2' | '3' | '4' | '5';
  levelDescription: string;
  
  // Results
  driverOutOfService: boolean;
  vehicleOutOfService: boolean;
  hazmatOutOfService: boolean;
  
  // Violations
  violationCount: number;
  violations: Violation[];
  
  createdAt: string;
}

export interface SafetyAlert {
  id: string;
  carrierId: string;
  carrierName: string;
  
  type: AlertType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  title: string;
  description: string;
  
  // Related
  relatedEntityType?: string;
  relatedEntityId?: string;
  
  // Status
  isAcknowledged: boolean;
  acknowledgedById?: string;
  acknowledgedAt?: string;
  
  // Action
  actionTaken?: string;
  
  createdAt: string;
}

export interface SafetyDashboardData {
  // Overview
  totalCarriers: number;
  monitoredCarriers: number;
  
  // Ratings
  ratingBreakdown: Array<{ rating: SafetyRating; count: number }>;
  scoreDistribution: Array<{ level: SafetyScoreLevel; count: number }>;
  
  // Insurance
  expiringInsurance: number;
  expiredInsurance: number;
  
  // Alerts
  activeAlerts: number;
  criticalAlerts: number;
  
  // Issues
  highOosCarriers: number;
  unsatisfactoryRatings: number;
  
  // Recent
  recentAlerts: SafetyAlert[];
  recentViolations: Violation[];
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/safety/use-safety.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  CarrierSafetyProfile,
  InsurancePolicy,
  Violation,
  Inspection,
  SafetyAlert,
  SafetyDashboardData,
} from '@/lib/types/safety';
import { toast } from 'sonner';

export const safetyKeys = {
  all: ['safety'] as const,
  dashboard: () => [...safetyKeys.all, 'dashboard'] as const,
  
  carriers: () => [...safetyKeys.all, 'carriers'] as const,
  carriersList: (params?: Record<string, unknown>) => [...safetyKeys.carriers(), 'list', params] as const,
  carrierProfile: (id: string) => [...safetyKeys.carriers(), 'profile', id] as const,
  
  insurance: () => [...safetyKeys.all, 'insurance'] as const,
  insuranceList: (params?: Record<string, unknown>) => [...safetyKeys.insurance(), 'list', params] as const,
  
  violations: () => [...safetyKeys.all, 'violations'] as const,
  violationsList: (params?: Record<string, unknown>) => [...safetyKeys.violations(), 'list', params] as const,
  
  inspections: (carrierId: string) => [...safetyKeys.all, 'inspections', carrierId] as const,
  
  alerts: () => [...safetyKeys.all, 'alerts'] as const,
  alertsList: (params?: Record<string, unknown>) => [...safetyKeys.alerts(), 'list', params] as const,
};

// Dashboard
export function useSafetyDashboard() {
  return useQuery({
    queryKey: safetyKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: SafetyDashboardData }>('/safety/dashboard'),
  });
}

// Carrier Safety
export function useCarriersSafety(params = {}) {
  return useQuery({
    queryKey: safetyKeys.carriersList(params),
    queryFn: () => apiClient.get<PaginatedResponse<CarrierSafetyProfile>>('/safety/carriers', params),
  });
}

export function useCarrierSafetyProfile(carrierId: string) {
  return useQuery({
    queryKey: safetyKeys.carrierProfile(carrierId),
    queryFn: () => apiClient.get<{ data: CarrierSafetyProfile }>(`/safety/carriers/${carrierId}`),
    enabled: !!carrierId,
  });
}

export function useRefreshCarrierSafety() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (carrierId: string) =>
      apiClient.post(`/safety/carriers/${carrierId}/refresh`),
    onSuccess: (_, carrierId) => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.carrierProfile(carrierId) });
      toast.success('Safety data refreshed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to refresh');
    },
  });
}

// Insurance
export function useInsurancePolicies(params = {}) {
  return useQuery({
    queryKey: safetyKeys.insuranceList(params),
    queryFn: () => apiClient.get<PaginatedResponse<InsurancePolicy>>('/safety/insurance', params),
  });
}

export function useUpdateInsurance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsurancePolicy> }) =>
      apiClient.patch<{ data: InsurancePolicy }>(`/safety/insurance/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.insurance() });
      toast.success('Insurance updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update');
    },
  });
}

// Violations
export function useViolations(params = {}) {
  return useQuery({
    queryKey: safetyKeys.violationsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<Violation>>('/safety/violations', params),
  });
}

// Inspections
export function useInspections(carrierId: string, params = {}) {
  return useQuery({
    queryKey: safetyKeys.inspections(carrierId),
    queryFn: () => apiClient.get<PaginatedResponse<Inspection>>(`/safety/carriers/${carrierId}/inspections`, params),
    enabled: !!carrierId,
  });
}

// Alerts
export function useSafetyAlerts(params = {}) {
  return useQuery({
    queryKey: safetyKeys.alertsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<SafetyAlert>>('/safety/alerts', params),
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, actionTaken }: { id: string; actionTaken?: string }) =>
      apiClient.post(`/safety/alerts/${id}/acknowledge`, { actionTaken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: safetyKeys.dashboard() });
      toast.success('Alert acknowledged');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to acknowledge');
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/safety/alerts/${id}/dismiss`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: safetyKeys.alerts() });
      toast.success('Alert dismissed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to dismiss');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/safety-store.ts`

```typescript
import { createStore } from './create-store';
import { SafetyRating, SafetyScoreLevel, InsuranceStatus } from '@/lib/types/safety';

interface SafetyFilters {
  search: string;
  rating: SafetyRating | '';
  scoreLevel: SafetyScoreLevel | '';
  insuranceStatus: InsuranceStatus | '';
  hasAlerts: boolean | null;
  hasViolations: boolean | null;
}

interface SafetyState {
  filters: SafetyFilters;
  selectedCarrierId: string | null;
  selectedAlertId: string | null;
  isProfileOpen: boolean;
  isAlertDialogOpen: boolean;
  
  setFilter: <K extends keyof SafetyFilters>(key: K, value: SafetyFilters[K]) => void;
  resetFilters: () => void;
  setSelectedCarrier: (id: string | null) => void;
  setSelectedAlert: (id: string | null) => void;
  setProfileOpen: (open: boolean) => void;
  setAlertDialogOpen: (open: boolean) => void;
}

const defaultFilters: SafetyFilters = {
  search: '',
  rating: '',
  scoreLevel: '',
  insuranceStatus: '',
  hasAlerts: null,
  hasViolations: null,
};

export const useSafetyStore = createStore<SafetyState>('safety-store', (set, get) => ({
  filters: defaultFilters,
  selectedCarrierId: null,
  selectedAlertId: null,
  isProfileOpen: false,
  isAlertDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedCarrier: (id) => set({ selectedCarrierId: id }),
  
  setSelectedAlert: (id) => set({ selectedAlertId: id }),
  
  setProfileOpen: (open) => set({ isProfileOpen: open }),
  
  setAlertDialogOpen: (open) => set({ isAlertDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/safety.ts`

```typescript
import { z } from 'zod';

export const insuranceFormSchema = z.object({
  type: z.enum(['LIABILITY', 'CARGO', 'GENERAL', 'WORKERS_COMP', 'OTHER']),
  policyNumber: z.string().min(1, 'Policy number is required'),
  insurerName: z.string().min(1, 'Insurer name is required'),
  insurerPhone: z.string().optional(),
  coverageAmount: z.number().positive('Coverage must be positive'),
  deductible: z.number().min(0).optional(),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  expirationDate: z.string().min(1, 'Expiration date is required'),
});

export const alertActionSchema = z.object({
  actionTaken: z.string().optional(),
});

export const dismissAlertSchema = z.object({
  reason: z.string().optional(),
});

export type InsuranceFormData = z.infer<typeof insuranceFormSchema>;
export type AlertActionData = z.infer<typeof alertActionSchema>;
export type DismissAlertData = z.infer<typeof dismissAlertSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/safety/safety-dashboard-stats.tsx`
- [ ] `components/safety/safety-score-chart.tsx`
- [ ] `components/safety/carrier-safety-table.tsx`
- [ ] `components/safety/carrier-safety-card.tsx`
- [ ] `components/safety/carrier-safety-profile.tsx`
- [ ] `components/safety/safety-score-badge.tsx`
- [ ] `components/safety/safety-rating-display.tsx`
- [ ] `components/safety/inspection-history.tsx`
- [ ] `components/safety/inspection-detail.tsx`
- [ ] `components/safety/violation-table.tsx`
- [ ] `components/safety/violation-card.tsx`
- [ ] `components/safety/insurance-monitoring.tsx`
- [ ] `components/safety/insurance-card.tsx`
- [ ] `components/safety/insurance-expiry-alert.tsx`
- [ ] `components/safety/authority-status.tsx`
- [ ] `components/safety/out-of-service-rate.tsx`
- [ ] `components/safety/crash-history.tsx`
- [ ] `components/safety/safety-alerts-list.tsx`
- [ ] `components/safety/alert-detail.tsx`
- [ ] `components/safety/alert-action-form.tsx`
- [ ] `components/safety/safety-filters.tsx`
- [ ] `components/safety/refresh-safety-button.tsx`

### Pages
- [ ] `app/(dashboard)/safety/page.tsx`
- [ ] `app/(dashboard)/safety/carriers/page.tsx`
- [ ] `app/(dashboard)/safety/carriers/[id]/page.tsx`
- [ ] `app/(dashboard)/safety/insurance/page.tsx`
- [ ] `app/(dashboard)/safety/violations/page.tsx`
- [ ] `app/(dashboard)/safety/alerts/page.tsx`
- [ ] `app/(dashboard)/safety/reports/page.tsx`

### Hooks & Stores
- [ ] `lib/types/safety.ts`
- [ ] `lib/validations/safety.ts`
- [ ] `lib/hooks/safety/use-safety.ts`
- [ ] `lib/stores/safety-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [26-rate-intelligence-ui.md](./26-rate-intelligence-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/36-service-safety.md)
- [API Review](../../api-review-docs/25-safety-review.html)
