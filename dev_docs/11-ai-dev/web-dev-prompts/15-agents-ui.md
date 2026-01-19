# 15 - Agents UI Implementation

> **Service:** Agents (Agent Network Management)  
> **Priority:** P2 - Medium  
> **Pages:** 7  
> **API Endpoints:** 22  
> **Dependencies:** Foundation ✅, Auth API ✅, Agents API ✅  
> **Doc Reference:** [22-service-agent.md](../../02-services/22-service-agent.md)

---

## 📋 Overview

The Agents UI provides interfaces for managing the agent network, agent onboarding, commission structures, territory assignments, and agent performance tracking. This covers freight broker agent management.

### Key Screens
- Agents dashboard
- Agents list and profiles
- Agent onboarding
- Commission structures
- Territory management
- Performance tracking
- Agent payouts

---

## ✅ Pre-Implementation Checklist

Before starting, verify:

- [ ] Foundation prompt (00) is complete
- [ ] Auth prompt (01) is complete
- [ ] Agents API is deployed
- [ ] Commission API is accessible

---

## 🗂️ Route Structure

```
app/(dashboard)/
├── agents/
│   ├── page.tsx                    # Agents dashboard
│   ├── list/
│   │   └── page.tsx                # All agents
│   ├── new/
│   │   └── page.tsx                # Onboard agent
│   ├── [id]/
│   │   ├── page.tsx                # Agent profile
│   │   ├── edit/
│   │   │   └── page.tsx            # Edit agent
│   │   ├── commissions/
│   │   │   └── page.tsx            # Agent commissions
│   │   └── performance/
│   │       └── page.tsx            # Performance metrics
│   ├── territories/
│   │   └── page.tsx                # Territory management
│   └── payouts/
│       └── page.tsx                # Agent payouts
```

---

## 🎨 Components to Create

```
components/agents/
├── agents-dashboard-stats.tsx      # Dashboard metrics
├── agents-table.tsx                # Agents list
├── agents-columns.tsx              # Column definitions
├── agent-card.tsx                  # Agent summary
├── agent-form.tsx                  # Create/edit agent
├── agent-profile.tsx               # Full profile view
├── agent-status-badge.tsx          # Status indicator
├── onboarding-wizard.tsx           # Multi-step onboarding
├── commission-structure-card.tsx   # Commission overview
├── commission-structure-form.tsx   # Edit commission
├── territory-map.tsx               # Territory visualization
├── territory-list.tsx              # Territory assignments
├── territory-form.tsx              # Assign territory
├── performance-metrics.tsx         # Performance charts
├── performance-scorecard.tsx       # KPI scorecard
├── agent-payouts-table.tsx         # Payout history
├── payout-detail-card.tsx          # Payout breakdown
├── agent-filters.tsx               # Filter controls
└── agent-activity-feed.tsx         # Recent activity
```

---

## 📝 TypeScript Interfaces

### File: `lib/types/agents.ts`

```typescript
export type AgentStatus = 
  | 'PENDING'
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TERMINATED';

export type AgentType = 
  | 'INDEPENDENT'
  | 'COMPANY'
  | 'HYBRID';

export interface Agent {
  id: string;
  agentCode: string;
  status: AgentStatus;
  type: AgentType;
  
  // Personal/Company Info
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Commission
  commissionStructureId: string;
  commissionStructureName: string;
  overrideRate?: number;
  
  // Territories
  territories: Territory[];
  
  // Performance
  metrics: AgentMetrics;
  
  // Documents
  contractUrl?: string;
  w9Url?: string;
  
  // Payment
  paymentMethod: 'ACH' | 'CHECK';
  paymentFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  
  // Dates
  startDate: string;
  terminationDate?: string;
  
  // Manager
  managerId?: string;
  managerName?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Territory {
  id: string;
  name: string;
  type: 'STATE' | 'REGION' | 'ZIP_RANGE' | 'CUSTOM';
  
  // Geographic
  states?: string[];
  zipCodes?: string[];
  region?: string;
  
  // Assignment
  isExclusive: boolean;
  
  createdAt: string;
}

export interface AgentMetrics {
  // Volume
  totalLoads: number;
  loadsThisMonth: number;
  loadsThisYear: number;
  
  // Revenue
  totalRevenue: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  
  // Commission
  totalCommission: number;
  commissionThisMonth: number;
  commissionThisYear: number;
  pendingCommission: number;
  
  // Performance
  marginPercent: number;
  avgLoadValue: number;
  customerCount: number;
  activeCustomers: number;
}

export interface CommissionStructure {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  
  // Base
  type: 'PERCENTAGE' | 'TIERED' | 'HYBRID';
  baseRate: number;
  
  // Tiers
  tiers?: CommissionTier[];
  
  // Bonuses
  bonuses?: CommissionBonus[];
  
  // Deductions
  splitWithHouse?: number; // Percentage to house
  
  createdAt: string;
  updatedAt: string;
}

export interface CommissionTier {
  id: string;
  minRevenue: number;
  maxRevenue?: number;
  rate: number;
}

export interface CommissionBonus {
  id: string;
  name: string;
  type: 'VOLUME' | 'REVENUE' | 'NEW_CUSTOMER' | 'RETENTION';
  threshold: number;
  bonusAmount: number;
  bonusType: 'FLAT' | 'PERCENTAGE';
}

export interface AgentPayout {
  id: string;
  payoutNumber: string;
  agentId: string;
  agentName: string;
  
  // Period
  periodStart: string;
  periodEnd: string;
  
  // Amounts
  grossCommission: number;
  bonuses: number;
  adjustments: number;
  deductions: number;
  netAmount: number;
  
  // Details
  loadCount: number;
  
  // Status
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID';
  
  paymentMethod?: string;
  paidAt?: string;
  
  createdAt: string;
}

export interface AgentDashboardData {
  totalAgents: number;
  activeAgents: number;
  pendingOnboarding: number;
  totalCommissionsPaid: number;
  pendingPayouts: number;
  topAgents: Array<{ id: string; name: string; revenue: number }>;
}
```

---

## 🪝 React Query Hooks

### File: `lib/hooks/agents/use-agents.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '@/lib/api';
import {
  Agent,
  Territory,
  CommissionStructure,
  AgentPayout,
  AgentDashboardData,
} from '@/lib/types/agents';
import { toast } from 'sonner';

export const agentKeys = {
  all: ['agents'] as const,
  dashboard: () => [...agentKeys.all, 'dashboard'] as const,
  
  list: (params?: Record<string, unknown>) => [...agentKeys.all, 'list', params] as const,
  detail: (id: string) => [...agentKeys.all, 'detail', id] as const,
  
  commissions: (agentId: string) => [...agentKeys.all, 'commissions', agentId] as const,
  performance: (agentId: string) => [...agentKeys.all, 'performance', agentId] as const,
  
  structures: () => [...agentKeys.all, 'structures'] as const,
  structureDetail: (id: string) => [...agentKeys.structures(), id] as const,
  
  territories: () => [...agentKeys.all, 'territories'] as const,
  
  payouts: () => [...agentKeys.all, 'payouts'] as const,
  payoutsList: (params?: Record<string, unknown>) => [...agentKeys.payouts(), 'list', params] as const,
  payoutDetail: (id: string) => [...agentKeys.payouts(), 'detail', id] as const,
};

// Dashboard
export function useAgentsDashboard() {
  return useQuery({
    queryKey: agentKeys.dashboard(),
    queryFn: () => apiClient.get<{ data: AgentDashboardData }>('/agents/dashboard'),
  });
}

// Agents
export function useAgents(params = {}) {
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Agent>>('/agents', params),
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => apiClient.get<{ data: Agent }>(`/agents/${id}`),
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Agent>) =>
      apiClient.post<{ data: Agent }>('/agents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      toast.success('Agent created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create agent');
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) =>
      apiClient.patch<{ data: Agent }>(`/agents/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      toast.success('Agent updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update agent');
    },
  });
}

export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      apiClient.post(`/agents/${id}/status`, { status, reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

// Agent Commissions
export function useAgentCommissions(agentId: string, params = {}) {
  return useQuery({
    queryKey: agentKeys.commissions(agentId),
    queryFn: () => apiClient.get(`/agents/${agentId}/commissions`, params),
    enabled: !!agentId,
  });
}

// Agent Performance
export function useAgentPerformance(agentId: string, params = {}) {
  return useQuery({
    queryKey: agentKeys.performance(agentId),
    queryFn: () => apiClient.get(`/agents/${agentId}/performance`, params),
    enabled: !!agentId,
  });
}

// Commission Structures
export function useCommissionStructures() {
  return useQuery({
    queryKey: agentKeys.structures(),
    queryFn: () => apiClient.get<{ data: CommissionStructure[] }>('/agents/structures'),
  });
}

export function useCommissionStructure(id: string) {
  return useQuery({
    queryKey: agentKeys.structureDetail(id),
    queryFn: () => apiClient.get<{ data: CommissionStructure }>(`/agents/structures/${id}`),
    enabled: !!id,
  });
}

export function useCreateCommissionStructure() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CommissionStructure>) =>
      apiClient.post<{ data: CommissionStructure }>('/agents/structures', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.structures() });
      toast.success('Commission structure created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create structure');
    },
  });
}

export function useUpdateCommissionStructure() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommissionStructure> }) =>
      apiClient.patch<{ data: CommissionStructure }>(`/agents/structures/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.structureDetail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.structures() });
      toast.success('Commission structure updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update structure');
    },
  });
}

// Assign Commission Structure
export function useAssignCommissionStructure() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, structureId, overrideRate }: { 
      agentId: string; 
      structureId: string;
      overrideRate?: number;
    }) =>
      apiClient.post(`/agents/${agentId}/commission-structure`, { structureId, overrideRate }),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      toast.success('Commission structure assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign structure');
    },
  });
}

// Territories
export function useTerritories() {
  return useQuery({
    queryKey: agentKeys.territories(),
    queryFn: () => apiClient.get<{ data: Territory[] }>('/agents/territories'),
  });
}

export function useAssignTerritory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, territory }: { agentId: string; territory: Partial<Territory> }) =>
      apiClient.post(`/agents/${agentId}/territories`, territory),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.territories() });
      toast.success('Territory assigned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign territory');
    },
  });
}

export function useRemoveTerritory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, territoryId }: { agentId: string; territoryId: string }) =>
      apiClient.delete(`/agents/${agentId}/territories/${territoryId}`),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      toast.success('Territory removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove territory');
    },
  });
}

// Payouts
export function useAgentPayouts(params = {}) {
  return useQuery({
    queryKey: agentKeys.payoutsList(params),
    queryFn: () => apiClient.get<PaginatedResponse<AgentPayout>>('/agents/payouts', params),
  });
}

export function useAgentPayout(id: string) {
  return useQuery({
    queryKey: agentKeys.payoutDetail(id),
    queryFn: () => apiClient.get<{ data: AgentPayout }>(`/agents/payouts/${id}`),
    enabled: !!id,
  });
}

export function useGenerateAgentPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, periodEnd }: { agentId: string; periodEnd: string }) =>
      apiClient.post<{ data: AgentPayout }>('/agents/payouts/generate', { agentId, periodEnd }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.payouts() });
      toast.success('Payout generated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate payout');
    },
  });
}

export function useProcessAgentPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod: string }) =>
      apiClient.post(`/agents/payouts/${id}/process`, { paymentMethod }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.payoutDetail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.payouts() });
      toast.success('Payout processed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process payout');
    },
  });
}
```

---

## 🗄️ Zustand Store

### File: `lib/stores/agents-store.ts`

```typescript
import { createStore } from './create-store';
import { AgentStatus, AgentType } from '@/lib/types/agents';

interface AgentFilters {
  search: string;
  status: AgentStatus | '';
  type: AgentType | '';
  territoryState: string;
  managerId: string;
}

interface AgentsState {
  filters: AgentFilters;
  selectedAgentId: string | null;
  isOnboardingOpen: boolean;
  isTerritoryDialogOpen: boolean;
  isCommissionDialogOpen: boolean;
  
  setFilter: <K extends keyof AgentFilters>(key: K, value: AgentFilters[K]) => void;
  resetFilters: () => void;
  setSelectedAgent: (id: string | null) => void;
  setOnboardingOpen: (open: boolean) => void;
  setTerritoryDialogOpen: (open: boolean) => void;
  setCommissionDialogOpen: (open: boolean) => void;
}

const defaultFilters: AgentFilters = {
  search: '',
  status: '',
  type: '',
  territoryState: '',
  managerId: '',
};

export const useAgentsStore = createStore<AgentsState>('agents-store', (set, get) => ({
  filters: defaultFilters,
  selectedAgentId: null,
  isOnboardingOpen: false,
  isTerritoryDialogOpen: false,
  isCommissionDialogOpen: false,
  
  setFilter: (key, value) =>
    set({ filters: { ...get().filters, [key]: value } }),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedAgent: (id) => set({ selectedAgentId: id }),
  
  setOnboardingOpen: (open) => set({ isOnboardingOpen: open }),
  
  setTerritoryDialogOpen: (open) => set({ isTerritoryDialogOpen: open }),
  
  setCommissionDialogOpen: (open) => set({ isCommissionDialogOpen: open }),
}));
```

---

## 📄 Zod Validation Schemas

### File: `lib/validations/agents.ts`

```typescript
import { z } from 'zod';

export const agentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  type: z.enum(['INDEPENDENT', 'COMPANY', 'HYBRID']),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'ZIP is required'),
  }),
  commissionStructureId: z.string().min(1, 'Commission structure is required'),
  overrideRate: z.number().min(0).max(100).optional(),
  paymentMethod: z.enum(['ACH', 'CHECK']),
  paymentFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
  startDate: z.string().min(1, 'Start date is required'),
  managerId: z.string().optional(),
});

export const commissionStructureFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'TIERED', 'HYBRID']),
  baseRate: z.number().min(0).max(100, 'Rate must be between 0-100'),
  tiers: z.array(z.object({
    minRevenue: z.number().min(0),
    maxRevenue: z.number().positive().optional(),
    rate: z.number().min(0).max(100),
  })).optional(),
  splitWithHouse: z.number().min(0).max(100).optional(),
  isDefault: z.boolean().default(false),
});

export const territoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['STATE', 'REGION', 'ZIP_RANGE', 'CUSTOM']),
  states: z.array(z.string()).optional(),
  zipCodes: z.array(z.string()).optional(),
  region: z.string().optional(),
  isExclusive: z.boolean().default(false),
});

export const agentStatusSchema = z.object({
  status: z.enum(['PENDING', 'ONBOARDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']),
  reason: z.string().optional(),
});

export type AgentFormData = z.infer<typeof agentFormSchema>;
export type CommissionStructureFormData = z.infer<typeof commissionStructureFormSchema>;
export type TerritoryFormData = z.infer<typeof territoryFormSchema>;
export type AgentStatusData = z.infer<typeof agentStatusSchema>;
```

---

## ✅ Completion Checklist

### Components
- [ ] `components/agents/agents-dashboard-stats.tsx`
- [ ] `components/agents/agents-table.tsx`
- [ ] `components/agents/agents-columns.tsx`
- [ ] `components/agents/agent-card.tsx`
- [ ] `components/agents/agent-form.tsx`
- [ ] `components/agents/agent-profile.tsx`
- [ ] `components/agents/agent-status-badge.tsx`
- [ ] `components/agents/onboarding-wizard.tsx`
- [ ] `components/agents/commission-structure-card.tsx`
- [ ] `components/agents/commission-structure-form.tsx`
- [ ] `components/agents/territory-map.tsx`
- [ ] `components/agents/territory-list.tsx`
- [ ] `components/agents/territory-form.tsx`
- [ ] `components/agents/performance-metrics.tsx`
- [ ] `components/agents/performance-scorecard.tsx`
- [ ] `components/agents/agent-payouts-table.tsx`
- [ ] `components/agents/payout-detail-card.tsx`
- [ ] `components/agents/agent-filters.tsx`
- [ ] `components/agents/agent-activity-feed.tsx`

### Pages
- [ ] `app/(dashboard)/agents/page.tsx`
- [ ] `app/(dashboard)/agents/list/page.tsx`
- [ ] `app/(dashboard)/agents/new/page.tsx`
- [ ] `app/(dashboard)/agents/[id]/page.tsx`
- [ ] `app/(dashboard)/agents/[id]/edit/page.tsx`
- [ ] `app/(dashboard)/agents/[id]/commissions/page.tsx`
- [ ] `app/(dashboard)/agents/[id]/performance/page.tsx`
- [ ] `app/(dashboard)/agents/territories/page.tsx`
- [ ] `app/(dashboard)/agents/payouts/page.tsx`

### Hooks & Stores
- [ ] `lib/types/agents.ts`
- [ ] `lib/validations/agents.ts`
- [ ] `lib/hooks/agents/use-agents.ts`
- [ ] `lib/stores/agents-store.ts`

### Tests
- [ ] Component tests
- [ ] Hook tests
- [ ] MSW handlers
- [ ] All tests passing: `pnpm test`

---

## 🔗 Next Steps

After completing this prompt:
1. Proceed to [16-credit-ui.md](./16-credit-ui.md)
2. Update [00-index.md](./00-index.md) status

---

## 📚 Reference

- [Service Documentation](../../02-services/22-service-agent.md)
- [API Review](../../api-review-docs/15-agents-review.html)
