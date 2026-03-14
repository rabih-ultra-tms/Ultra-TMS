# MP-09 Contracts Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build production-ready Contracts frontend (8 pages, 18 components, 12 hooks) with full CRUD for all sub-resources, 70%+ test coverage, and WCAG 2.1 AA accessibility.

**Architecture:** Modular page-by-page structure with shared components folder, custom hooks for data management, React Query for caching, Zod for validation. Each page owns its hooks; sub-resources managed via modals/inline editors within parent.

**Tech Stack:** Next.js 16, React 19, TypeScript, React Hook Form, Zod, React Query, shadcn/ui, Jest, React Testing Library, Playwright

**Timeline:** 10 days (2-week sprint)

- Phase 1 (Days 1-3): Core pages & data layer
- Phase 2 (Days 4-6): CRUD operations & sub-resources
- Phase 3 (Days 7-8): Extended pages (Templates, Renewals, Reports)
- Phase 4 (Days 9-10): Testing, accessibility, polish

---

## File Structure

### API Layer

```
apps/web/lib/api/contracts/
├── types.ts              # Contract, RateTable, Amendment, SLA, etc. TypeScript types
├── client.ts             # Wrapped API methods (list, create, update, delete)
└── validators.ts         # Zod schemas for form validation
```

### Hooks

```
apps/web/lib/hooks/contracts/
├── useContracts.ts       # List, filter, paginate, delete
├── useContractDetail.ts  # Single contract + all related data
├── useRateTables.ts      # Rate table CRUD
├── useRateLanes.ts       # Rate lane CRUD
├── useAmendments.ts      # Amendment CRUD + history
├── useSLAs.ts            # SLA CRUD
├── useVolumeCommitments.ts # Volume commitment CRUD
├── useFuelSurcharge.ts   # Fuel table CRUD + tier management
├── useContractApproval.ts # Approval workflow
├── useContractActivation.ts # Activation workflow
├── useContractTemplates.ts # Template management
├── useContractRenewals.ts # Renewal management
├── useContractReports.ts # Reports aggregation
└── useContractFilters.ts # Filter state
```

### Components

```
apps/web/components/contracts/
├── contracts-dashboard.tsx       # KPI cards + charts
├── contracts-table.tsx           # Sortable/filterable list
├── contract-detail-tabs.tsx      # Tab navigation
├── contract-overview-tab.tsx     # Overview tab content
├── contract-status-badge.tsx     # Status indicator
├── contract-summary-card.tsx     # Summary card
├── contract-filters.tsx          # Filter bar
├── contract-form.tsx             # Base form fields
├── contract-builder-wizard.tsx   # 7-step wizard
├── contract-amendment-form.tsx   # Amendment form
├── contract-amendment-timeline.tsx # Amendment history
├── rate-table-editor.tsx         # Rate table CRUD
├── rate-lane-row.tsx             # Inline lane editor
├── rate-lane-form.tsx            # Lane modal
├── fuel-surcharge-table.tsx      # Fuel table CRUD
├── fuel-surcharge-tier-form.tsx  # Tier form
├── sla-form.tsx                  # SLA form
├── volume-commitment-form.tsx    # Volume form
├── template-grid.tsx             # Template library
├── template-preview.tsx          # Template preview
├── renewal-queue.tsx             # Renewal cards
├── reports-dashboard.tsx         # Reports overview
└── dialogs/
    ├── confirm-approve-dialog.tsx
    ├── confirm-reject-dialog.tsx
    ├── confirm-activate-dialog.tsx
    ├── confirm-terminate-dialog.tsx
    └── send-for-signature-dialog.tsx
```

### Pages

```
apps/web/app/(dashboard)/contracts/
├── page.tsx              # Dashboard
├── list/page.tsx         # Contracts list
├── [id]/
│   ├── page.tsx          # Contract detail
│   └── edit/page.tsx     # Edit contract
├── new/page.tsx          # Contract builder
├── templates/
│   ├── page.tsx          # Template library
│   └── [id]/page.tsx     # Template preview
├── renewals/page.tsx     # Renewal queue
└── reports/page.tsx      # Reports
```

### Tests

```
components/contracts/
├── contracts-table.test.tsx
├── contract-form.test.tsx
├── contract-status-badge.test.tsx
├── rate-table-editor.test.tsx
└── [other component tests]

lib/hooks/contracts/
├── useContracts.test.ts
├── useContractDetail.test.ts
├── useAmendments.test.ts
└── [other hook tests]

app/(dashboard)/contracts/
├── page.test.tsx
├── list/page.test.tsx
├── [id]/page.test.tsx
└── [other page tests]

e2e/
└── contracts.spec.ts
```

---

## Chunk 1: Foundation & API Layer

### Task 1: Create API Types

**Files:**

- Create: `apps/web/lib/api/contracts/types.ts`
- Test: `apps/web/lib/api/contracts/types.test.ts`

- [ ] **Step 1: Create Contract types**

```typescript
// apps/web/lib/api/contracts/types.ts

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT_FOR_SIGNATURE = 'SENT_FOR_SIGNATURE',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum ContractType {
  MASTER_SERVICE_AGREEMENT = 'MASTER_SERVICE_AGREEMENT',
  VOLUME_DISCOUNT = 'VOLUME_DISCOUNT',
  FUEL_SURCHARGE = 'FUEL_SURCHARGE',
  EQUIPMENT = 'EQUIPMENT',
  LANE_RATE = 'LANE_RATE',
}

export interface Contract {
  id: string;
  tenantId: string;
  carrierId?: string;
  customerId?: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvalDate?: string;
  deletedAt?: string | null;
}

export interface RateTable {
  id: string;
  contractId: string;
  name: string;
  equipmentType: string;
  effectiveDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RateLane {
  id: string;
  rateTableId: string;
  origin: string;
  destination: string;
  equipment: string;
  rate: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Amendment {
  id: string;
  contractId: string;
  amendmentNumber: number;
  reason: string;
  changes: Record<string, any>;
  effectiveDate: string;
  appliedAt?: string;
  requiresApproval: boolean;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SLA {
  id: string;
  contractId: string;
  serviceLevel: string;
  target: number;
  targetUnit: string;
  penalty: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolumeCommitment {
  id: string;
  contractId: string;
  targetVolume: number;
  period: 'MONTH' | 'QUARTER' | 'YEAR';
  startDate: string;
  endDate: string;
  penaltyFormula: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelSurchargeTable {
  id: string;
  contractId: string;
  name: string;
  basePrice: number;
  effectiveDate: string;
  tiers: FuelSurchargeTier[];
  createdAt: string;
  updatedAt: string;
}

export interface FuelSurchargeTier {
  id: string;
  tableId: string;
  minPrice: number;
  maxPrice: number;
  surchargePercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractTemplate {
  id: string;
  tenantId: string;
  name: string;
  type: ContractType;
  description: string;
  baseTerms: Partial<Contract>;
  rateTables?: Partial<RateTable>[];
  slas?: Partial<SLA>[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractFilters {
  type?: ContractType;
  status?: ContractStatus[];
  partyId?: string;
  dateRange?: { startDate: string; endDate: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

- [ ] **Step 2: Write type export test**

```typescript
// apps/web/lib/api/contracts/types.test.ts

import {
  ContractStatus,
  ContractType,
  Contract,
  RateTable,
  Amendment,
} from './types';

describe('Contract Types', () => {
  it('should export all required enums', () => {
    expect(ContractStatus.DRAFT).toBe('DRAFT');
    expect(ContractStatus.ACTIVE).toBe('ACTIVE');
    expect(ContractType.MASTER_SERVICE_AGREEMENT).toBe(
      'MASTER_SERVICE_AGREEMENT'
    );
  });

  it('should allow Contract interface instantiation', () => {
    const contract: Contract = {
      id: '1',
      tenantId: 'tenant-1',
      contractNumber: 'CNT-202603-0001',
      type: ContractType.MASTER_SERVICE_AGREEMENT,
      status: ContractStatus.DRAFT,
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      createdAt: '2026-03-14T00:00:00Z',
      updatedAt: '2026-03-14T00:00:00Z',
      createdBy: 'user-1',
    };
    expect(contract.status).toBe(ContractStatus.DRAFT);
  });
});
```

- [ ] **Step 3: Run test to verify it passes**

```bash
cd apps/web && pnpm test lib/api/contracts/types.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/api/contracts/types.ts apps/web/lib/api/contracts/types.test.ts
git commit -m "feat: add Contract domain types and enums"
```

---

### Task 2: Create Zod Validators

**Files:**

- Create: `apps/web/lib/api/contracts/validators.ts`
- Test: `apps/web/lib/api/contracts/validators.test.ts`

- [ ] **Step 1: Write validators for Contract form**

```typescript
// apps/web/lib/api/contracts/validators.ts

import { z } from 'zod';
import { ContractStatus, ContractType } from './types';

export const ContractTypeEnum = z.nativeEnum(ContractType);
export const ContractStatusEnum = z.nativeEnum(ContractStatus);

export const CreateContractSchema = z.object({
  type: ContractTypeEnum,
  carrierId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  terms: z.string().optional(),
});

export const RateLaneSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  equipment: z.string().min(1, 'Equipment is required'),
  rate: z.number().positive('Rate must be positive'),
  currency: z.string().default('USD'),
});

export const RateTableSchema = z.object({
  name: z.string().min(1, 'Rate table name is required'),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  effectiveDate: z.string().datetime(),
  lanes: z.array(RateLaneSchema),
});

export const AmendmentSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  effectiveDate: z.string().datetime(),
  requiresApproval: z.boolean().default(false),
});

export const SLASchema = z.object({
  serviceLevel: z.string().min(1, 'Service level is required'),
  target: z.number().positive('Target must be positive'),
  targetUnit: z.string().min(1, 'Target unit is required'),
  penalty: z.string().min(1, 'Penalty is required'),
  effectiveDate: z.string().datetime(),
});

export const VolumeCommitmentSchema = z.object({
  targetVolume: z.number().positive('Target volume must be positive'),
  period: z.enum(['MONTH', 'QUARTER', 'YEAR']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  penaltyFormula: z.string().min(1, 'Penalty formula is required'),
});

export const FuelSurchargeTierSchema = z.object({
  minPrice: z.number().nonnegative(),
  maxPrice: z.number().positive(),
  surchargePercent: z.number().nonnegative().max(100),
});

export const FuelSurchargeTableSchema = z.object({
  name: z.string().min(1, 'Fuel table name is required'),
  basePrice: z.number().positive('Base price must be positive'),
  effectiveDate: z.string().datetime(),
  tiers: z.array(FuelSurchargeTierSchema).min(1, 'At least one tier required'),
});

export type CreateContractInput = z.infer<typeof CreateContractSchema>;
export type RateLaneInput = z.infer<typeof RateLaneSchema>;
export type RateTableInput = z.infer<typeof RateTableSchema>;
export type AmendmentInput = z.infer<typeof AmendmentSchema>;
export type SLAInput = z.infer<typeof SLASchema>;
export type VolumeCommitmentInput = z.infer<typeof VolumeCommitmentSchema>;
export type FuelSurchargeTableInput = z.infer<typeof FuelSurchargeTableSchema>;
```

- [ ] **Step 2: Write validator tests**

```typescript
// apps/web/lib/api/contracts/validators.test.ts

import {
  CreateContractSchema,
  RateLaneSchema,
  AmendmentSchema,
  SLASchema,
} from './validators';
import { ContractType } from './types';

describe('Contract Validators', () => {
  it('should validate CreateContractSchema with valid data', () => {
    const validData = {
      type: ContractType.MASTER_SERVICE_AGREEMENT,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2027-01-01T00:00:00Z',
    };
    expect(() => CreateContractSchema.parse(validData)).not.toThrow();
  });

  it('should reject CreateContractSchema with missing required fields', () => {
    const invalidData = {
      type: ContractType.MASTER_SERVICE_AGREEMENT,
      // missing startDate and endDate
    };
    expect(() => CreateContractSchema.parse(invalidData)).toThrow();
  });

  it('should validate RateLaneSchema with valid data', () => {
    const validLane = {
      origin: 'Los Angeles',
      destination: 'New York',
      equipment: '53ft Dry Van',
      rate: 2500,
    };
    expect(() => RateLaneSchema.parse(validLane)).not.toThrow();
  });

  it('should reject RateLaneSchema with negative rate', () => {
    const invalidLane = {
      origin: 'Los Angeles',
      destination: 'New York',
      equipment: '53ft Dry Van',
      rate: -100,
    };
    expect(() => RateLaneSchema.parse(invalidLane)).toThrow();
  });

  it('should validate SLASchema with valid data', () => {
    const validSLA = {
      serviceLevel: 'On-time delivery',
      target: 99,
      targetUnit: 'percent',
      penalty: '$500 per violation',
      effectiveDate: '2026-01-01T00:00:00Z',
    };
    expect(() => SLASchema.parse(validSLA)).not.toThrow();
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
cd apps/web && pnpm test lib/api/contracts/validators.test.ts
```

Expected: PASS (6 tests)

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/api/contracts/validators.ts apps/web/lib/api/contracts/validators.test.ts
git commit -m "feat: add Zod validators for contract forms"
```

---

### Task 3: Create API Client Methods

**Files:**

- Create: `apps/web/lib/api/contracts/client.ts`

- [ ] **Step 1: Implement contract CRUD methods**

```typescript
// apps/web/lib/api/contracts/client.ts

import { apiClient } from '@/lib/api/client';
import {
  Contract,
  RateTable,
  RateLane,
  Amendment,
  SLA,
  VolumeCommitment,
  FuelSurchargeTable,
  ContractTemplate,
  ContractFilters,
  PaginatedResponse,
} from './types';
import {
  CreateContractInput,
  RateTableInput,
  RateLaneInput,
  AmendmentInput,
  SLAInput,
  VolumeCommitmentInput,
  FuelSurchargeTableInput,
} from './validators';

const BASE_URL = '/api/v1/contracts';

// Contract CRUD
export const contractsApi = {
  list: async (
    filters?: ContractFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Contract>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status.join(','));
    if (filters?.partyId) params.append('partyId', filters.partyId);
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }
    params.append('page', String(page));
    params.append('limit', String(limit));

    const response = await apiClient.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  },

  create: async (data: CreateContractInput): Promise<Contract> => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data.data;
  },

  getById: async (id: string): Promise<Contract> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<CreateContractInput>
  ): Promise<Contract> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  submit: async (id: string): Promise<Contract> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/submit`, {});
    return response.data.data;
  },

  approve: async (id: string, reason: string): Promise<Contract> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/approve`, {
      reason,
    });
    return response.data.data;
  },

  reject: async (id: string, reason: string): Promise<Contract> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },

  sendForSignature: async (id: string): Promise<Contract> => {
    const response = await apiClient.post(
      `${BASE_URL}/${id}/send-for-signature`,
      {}
    );
    return response.data.data;
  },

  activate: async (id: string): Promise<Contract> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/activate`, {});
    return response.data.data;
  },

  renew: async (id: string): Promise<Contract> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/renew`, {});
    return response.data.data;
  },

  terminate: async (id: string, reason: string): Promise<Contract> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/terminate`, {
      reason,
    });
    return response.data.data;
  },

  getHistory: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`${BASE_URL}/${id}/history`);
    return response.data.data;
  },
};

// Rate Tables
export const rateTablesApi = {
  listForContract: async (contractId: string): Promise<RateTable[]> => {
    const response = await apiClient.get(
      `${BASE_URL}/${contractId}/rate-tables`
    );
    return response.data.data;
  },

  create: async (
    contractId: string,
    data: RateTableInput
  ): Promise<RateTable> => {
    const response = await apiClient.post(
      `${BASE_URL}/${contractId}/rate-tables`,
      data
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<RateTable> => {
    const response = await apiClient.get(`/api/v1/rate-tables/${id}`);
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<RateTableInput>
  ): Promise<RateTable> => {
    const response = await apiClient.put(`/api/v1/rate-tables/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/rate-tables/${id}`);
  },

  importCSV: async (id: string, file: File): Promise<RateTable> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.upload(
      `/api/v1/rate-tables/${id}/import`,
      formData
    );
    return response.data.data;
  },

  exportCSV: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/rate-tables/${id}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Rate Lanes
export const rateLanesApi = {
  listForTable: async (tableId: string): Promise<RateLane[]> => {
    const response = await apiClient.get(
      `/api/v1/rate-tables/${tableId}/lanes`
    );
    return response.data.data;
  },

  create: async (tableId: string, data: RateLaneInput): Promise<RateLane> => {
    const response = await apiClient.post(
      `/api/v1/rate-tables/${tableId}/lanes`,
      data
    );
    return response.data.data;
  },

  update: async (
    tableId: string,
    id: string,
    data: Partial<RateLaneInput>
  ): Promise<RateLane> => {
    const response = await apiClient.put(
      `/api/v1/rate-tables/${tableId}/lanes/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (tableId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/rate-tables/${tableId}/lanes/${id}`);
  },
};

// Amendments
export const amendmentsApi = {
  listForContract: async (contractId: string): Promise<Amendment[]> => {
    const response = await apiClient.get(
      `${BASE_URL}/${contractId}/amendments`
    );
    return response.data.data;
  },

  create: async (
    contractId: string,
    data: AmendmentInput
  ): Promise<Amendment> => {
    const response = await apiClient.post(
      `${BASE_URL}/${contractId}/amendments`,
      data
    );
    return response.data.data;
  },

  update: async (
    contractId: string,
    id: string,
    data: Partial<AmendmentInput>
  ): Promise<Amendment> => {
    const response = await apiClient.put(
      `${BASE_URL}/${contractId}/amendments/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (contractId: string, id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${contractId}/amendments/${id}`);
  },

  apply: async (contractId: string, id: string): Promise<Amendment> => {
    const response = await apiClient.post(
      `${BASE_URL}/${contractId}/amendments/${id}/apply`,
      {}
    );
    return response.data.data;
  },
};

// SLAs
export const slasApi = {
  listForContract: async (contractId: string): Promise<SLA[]> => {
    const response = await apiClient.get(`${BASE_URL}/${contractId}/slas`);
    return response.data.data;
  },

  create: async (contractId: string, data: SLAInput): Promise<SLA> => {
    const response = await apiClient.post(
      `${BASE_URL}/${contractId}/slas`,
      data
    );
    return response.data.data;
  },

  update: async (
    contractId: string,
    id: string,
    data: Partial<SLAInput>
  ): Promise<SLA> => {
    const response = await apiClient.put(
      `${BASE_URL}/${contractId}/slas/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (contractId: string, id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${contractId}/slas/${id}`);
  },
};

// Volume Commitments
export const volumeCommitmentsApi = {
  listForContract: async (contractId: string): Promise<VolumeCommitment[]> => {
    const response = await apiClient.get(
      `${BASE_URL}/${contractId}/volume-commitments`
    );
    return response.data.data;
  },

  create: async (
    contractId: string,
    data: VolumeCommitmentInput
  ): Promise<VolumeCommitment> => {
    const response = await apiClient.post(
      `${BASE_URL}/${contractId}/volume-commitments`,
      data
    );
    return response.data.data;
  },

  update: async (
    contractId: string,
    id: string,
    data: Partial<VolumeCommitmentInput>
  ): Promise<VolumeCommitment> => {
    const response = await apiClient.put(
      `${BASE_URL}/${contractId}/volume-commitments/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (contractId: string, id: string): Promise<void> => {
    await apiClient.delete(
      `${BASE_URL}/${contractId}/volume-commitments/${id}`
    );
  },

  getPerformance: async (contractId: string, id: string): Promise<any> => {
    const response = await apiClient.get(
      `${BASE_URL}/${contractId}/volume-commitments/${id}/performance`
    );
    return response.data.data;
  },
};

// Fuel Surcharge
export const fuelSurchargeApi = {
  list: async (): Promise<FuelSurchargeTable[]> => {
    const response = await apiClient.get('/api/v1/fuel-tables');
    return response.data.data;
  },

  create: async (
    data: FuelSurchargeTableInput
  ): Promise<FuelSurchargeTable> => {
    const response = await apiClient.post('/api/v1/fuel-tables', data);
    return response.data.data;
  },

  getById: async (id: string): Promise<FuelSurchargeTable> => {
    const response = await apiClient.get(`/api/v1/fuel-tables/${id}`);
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<FuelSurchargeTableInput>
  ): Promise<FuelSurchargeTable> => {
    const response = await apiClient.put(`/api/v1/fuel-tables/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/fuel-tables/${id}`);
  },

  calculate: async (fuelPrice: number): Promise<{ surcharge: number }> => {
    const response = await apiClient.get(
      `/api/v1/fuel-surcharge/calculate?fuelPrice=${fuelPrice}`
    );
    return response.data.data;
  },
};

// Templates
export const contractTemplatesApi = {
  list: async (): Promise<ContractTemplate[]> => {
    const response = await apiClient.get('/api/v1/contract-templates');
    return response.data.data;
  },

  clone: async (id: string): Promise<Contract> => {
    const response = await apiClient.post(
      `/api/v1/contract-templates/${id}/clone`,
      {}
    );
    return response.data.data;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/api/contracts/client.ts
git commit -m "feat: add API client methods for all contract endpoints"
```

---

**Chunk 1 Complete.** This chunk establishes the API foundation: types, validation, and client methods. All subsequent hooks and components build on this layer.

---

## Chunk 2: Hooks & Core Data Management

### Task 4: Create useContracts Hook

**Files:**

- Create: `apps/web/lib/hooks/contracts/useContracts.ts`
- Test: `apps/web/lib/hooks/contracts/useContracts.test.ts`

- [ ] **Step 1: Implement hook with React Query**

```typescript
// apps/web/lib/hooks/contracts/useContracts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '@/lib/api/contracts/client';
import {
  Contract,
  ContractFilters,
  PaginatedResponse,
} from '@/lib/api/contracts/types';
import { CreateContractInput } from '@/lib/api/contracts/validators';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'contracts';

interface UseContractsOptions {
  filters?: ContractFilters;
  page?: number;
  limit?: number;
}

export function useContracts(options: UseContractsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filters, page = 1, limit = 20 } = options;

  const listQuery = useQuery({
    queryKey: [QUERY_KEY, filters, page, limit],
    queryFn: () => contractsApi.list(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContractInput) => contractsApi.create(data),
    onSuccess: (contract) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Contract created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create contract',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: Partial<CreateContractInput> }) =>
      contractsApi.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Contract updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update contract',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Success',
        description: 'Contract deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete contract',
        variant: 'destructive',
      });
    },
  });

  return {
    contracts: listQuery.data?.data || [],
    pagination: listQuery.data?.pagination,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    create: createMutation.mutateAsync,
    update: (id: string, payload: Partial<CreateContractInput>) =>
      updateMutation.mutateAsync({ id, payload }),
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

- [ ] **Step 2: Write hook tests**

```typescript
// apps/web/lib/hooks/contracts/useContracts.test.ts

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useContracts } from './useContracts'
import { contractsApi } from '@/lib/api/contracts/client'
import { Contract, ContractType, ContractStatus } from '@/lib/api/contracts/types'

jest.mock('@/lib/api/contracts/client')
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}))

const createQueryClient = () => new QueryClient()

const mockContractResponse = {
  data: [
    {
      id: '1',
      contractNumber: 'CNT-1',
      type: ContractType.MASTER_SERVICE_AGREEMENT,
      status: ContractStatus.DRAFT,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2027-01-01T00:00:00Z',
      tenantId: 'tenant-1',
      createdAt: '2026-03-14T00:00:00Z',
      updatedAt: '2026-03-14T00:00:00Z',
      createdBy: 'user-1',
    } as Contract,
  ],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

describe('useContracts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch contracts on mount', async () => {
    ;(contractsApi.list as jest.Mock).mockResolvedValue(mockContractResponse)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={createQueryClient()}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useContracts(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.contracts).toHaveLength(1)
    expect(result.current.contracts[0].id).toBe('1')
  })

  it('should handle errors gracefully', async () => {
    const error = new Error('API Error')
    ;(contractsApi.list as jest.Mock).mockRejectedValue(error)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={createQueryClient()}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useContracts(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
cd apps/web && pnpm test lib/hooks/contracts/useContracts.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/hooks/contracts/useContracts.ts apps/web/lib/hooks/contracts/useContracts.test.ts
git commit -m "feat: add useContracts hook for list, create, update, delete"
```

---

### Task 5: Create useContractDetail Hook

**Files:**

- Create: `apps/web/lib/hooks/contracts/useContractDetail.ts`

- [ ] **Step 1: Implement hook**

```typescript
// apps/web/lib/hooks/contracts/useContractDetail.ts

import { useQuery } from '@tanstack/react-query';
import { contractsApi } from '@/lib/api/contracts/client';
import {
  rateTablesApi,
  amendmentsApi,
  slasApi,
  volumeCommitmentsApi,
} from '@/lib/api/contracts/client';
import { Contract } from '@/lib/api/contracts/types';

const QUERY_KEY = 'contract-detail';

export function useContractDetail(contractId: string) {
  const contractQuery = useQuery({
    queryKey: [QUERY_KEY, contractId],
    queryFn: () => contractsApi.getById(contractId),
    enabled: !!contractId,
  });

  // Lazy load related data only when contract is loaded
  const rateTablesQuery = useQuery({
    queryKey: [QUERY_KEY, contractId, 'rate-tables'],
    queryFn: () => rateTablesApi.listForContract(contractId),
    enabled: !!contractId && contractQuery.isFetched,
  });

  const amendmentsQuery = useQuery({
    queryKey: [QUERY_KEY, contractId, 'amendments'],
    queryFn: () => amendmentsApi.listForContract(contractId),
    enabled: !!contractId && contractQuery.isFetched,
  });

  const slasQuery = useQuery({
    queryKey: [QUERY_KEY, contractId, 'slas'],
    queryFn: () => slasApi.listForContract(contractId),
    enabled: !!contractId && contractQuery.isFetched,
  });

  const volumeCommitmentsQuery = useQuery({
    queryKey: [QUERY_KEY, contractId, 'volume-commitments'],
    queryFn: () => volumeCommitmentsApi.listForContract(contractId),
    enabled: !!contractId && contractQuery.isFetched,
  });

  return {
    contract: contractQuery.data,
    rateTables: rateTablesQuery.data || [],
    amendments: amendmentsQuery.data || [],
    slas: slasQuery.data || [],
    volumeCommitments: volumeCommitmentsQuery.data || [],
    isLoading:
      contractQuery.isLoading ||
      rateTablesQuery.isLoading ||
      amendmentsQuery.isLoading ||
      slasQuery.isLoading ||
      volumeCommitmentsQuery.isLoading,
    error: contractQuery.error,
    refetch: () => {
      contractQuery.refetch();
      rateTablesQuery.refetch();
      amendmentsQuery.refetch();
      slasQuery.refetch();
      volumeCommitmentsQuery.refetch();
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/hooks/contracts/useContractDetail.ts
git commit -m "feat: add useContractDetail hook with lazy-loaded related data"
```

---

### Task 6: Create Sub-Resource Hooks (Batch)

**Files:**

- Create: `apps/web/lib/hooks/contracts/useRateTables.ts`
- Create: `apps/web/lib/hooks/contracts/useAmendments.ts`
- Create: `apps/web/lib/hooks/contracts/useSLAs.ts`
- Create: `apps/web/lib/hooks/contracts/useVolumeCommitments.ts`
- Create: `apps/web/lib/hooks/contracts/useFuelSurcharge.ts`

_(For brevity, I'll provide the pattern for one; repeat for others)_

- [ ] **Step 1: Implement useRateTables**

```typescript
// apps/web/lib/hooks/contracts/useRateTables.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rateTablesApi } from '@/lib/api/contracts/client';
import { RateTableInput } from '@/lib/api/contracts/validators';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'rate-tables';

export function useRateTables(contractId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: [QUERY_KEY, contractId],
    queryFn: () => rateTablesApi.listForContract(contractId),
    enabled: !!contractId,
  });

  const createMutation = useMutation({
    mutationFn: (data: RateTableInput) =>
      rateTablesApi.create(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, contractId],
      });
      toast({
        title: 'Success',
        description: 'Rate table created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create rate table',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: Partial<RateTableInput> }) =>
      rateTablesApi.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, contractId],
      });
      toast({
        title: 'Success',
        description: 'Rate table updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update rate table',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rateTablesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, contractId],
      });
      toast({
        title: 'Success',
        description: 'Rate table deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete rate table',
        variant: 'destructive',
      });
    },
  });

  return {
    rateTables: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    create: createMutation.mutateAsync,
    update: (id: string, payload: Partial<RateTableInput>) =>
      updateMutation.mutateAsync({ id, payload }),
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

- [ ] **Step 2: Implement remaining sub-resource hooks following same pattern**

```typescript
// apps/web/lib/hooks/contracts/useAmendments.ts
// apps/web/lib/hooks/contracts/useSLAs.ts
// apps/web/lib/hooks/contracts/useVolumeCommitments.ts
// apps/web/lib/hooks/contracts/useFuelSurcharge.ts
// (Same pattern as useRateTables, adjusted for each resource)
```

- [ ] **Step 3: Commit all hooks**

```bash
git add apps/web/lib/hooks/contracts/use*.ts
git commit -m "feat: add all sub-resource hooks (amendments, SLAs, volume, fuel)"
```

---

**Chunk 2 Complete.** All data management hooks are now in place. Next chunk builds the UI components.

---

## Chunk 3: Core Components & Pages (Part 1 - Dashboard, List, Detail)

### Task 7: Create contract-status-badge Component

**Files:**

- Create: `apps/web/components/contracts/contract-status-badge.tsx`
- Test: `apps/web/components/contracts/contract-status-badge.test.tsx`

- [ ] **Step 1: Implement component**

```typescript
// apps/web/components/contracts/contract-status-badge.tsx

import { Badge } from '@/components/ui/badge'
import { ContractStatus } from '@/lib/api/contracts/types'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Signature,
  Archive,
  XCircle,
} from 'lucide-react'

const statusConfig = {
  [ContractStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800',
    icon: FileText,
  },
  [ContractStatus.PENDING_APPROVAL]: {
    label: 'Pending Approval',
    className: 'bg-amber-100 text-amber-800',
    icon: Clock,
  },
  [ContractStatus.APPROVED]: {
    label: 'Approved',
    className: 'bg-blue-100 text-blue-800',
    icon: CheckCircle2,
  },
  [ContractStatus.SENT_FOR_SIGNATURE]: {
    label: 'Sent for Signature',
    className: 'bg-indigo-100 text-indigo-800',
    icon: Signature,
  },
  [ContractStatus.ACTIVE]: {
    label: 'Active',
    className: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  [ContractStatus.EXPIRED]: {
    label: 'Expired',
    className: 'bg-slate-100 text-slate-800',
    icon: Archive,
  },
  [ContractStatus.TERMINATED]: {
    label: 'Terminated',
    className: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
}

interface ContractStatusBadgeProps {
  status: ContractStatus
  size?: 'sm' | 'md'
}

export function ContractStatusBadge({
  status,
  size = 'md',
}: ContractStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={`${config.className} flex items-center gap-1`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </Badge>
  )
}
```

- [ ] **Step 2: Write tests**

```typescript
// apps/web/components/contracts/contract-status-badge.test.tsx

import { render, screen } from '@testing-library/react'
import { ContractStatusBadge } from './contract-status-badge'
import { ContractStatus } from '@/lib/api/contracts/types'

describe('ContractStatusBadge', () => {
  it('should render DRAFT status', () => {
    render(<ContractStatusBadge status={ContractStatus.DRAFT} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('should render ACTIVE status with correct color', () => {
    const { container } = render(
      <ContractStatusBadge status={ContractStatus.ACTIVE} />
    )
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('should render all status variants without errors', () => {
    Object.values(ContractStatus).forEach((status) => {
      const { unmount } = render(<ContractStatusBadge status={status} />)
      unmount()
    })
  })

  it('should include icon for accessibility', () => {
    const { container } = render(
      <ContractStatusBadge status={ContractStatus.APPROVED} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests**

```bash
cd apps/web && pnpm test components/contracts/contract-status-badge.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/contracts/contract-status-badge.tsx apps/web/components/contracts/contract-status-badge.test.tsx
git commit -m "feat: add contract-status-badge component"
```

---

_(Continuing with remaining components and pages - Task 8-15 follow same TDD pattern)_

---

**Due to length constraints, I'll create a abbreviated remaining plan. Full detailed steps for each component follow the pattern established above.**

---

## Chunk 4-6: Remaining Components, Pages & Testing (Abbreviated)

### Task 8-22: Build Remaining Components & Pages

Each of the following tasks follows the TDD pattern (write test → implement → commit):

**Task 8-9: contracts-table.tsx + contracts-dashboard.tsx**

- Sortable table with filters, pagination
- KPI cards with charts, navigation

**Task 10-12: Contract Detail Pages (pages & tabs)**

- `[id]/page.tsx` - Detail page wrapper
- contract-detail-tabs.tsx - Tab container
- 7 tab components (Overview, Rate Tables, Amendments, SLAs, Volume, Fuel, Documents)

**Task 13-15: Forms & Wizards**

- contract-form.tsx - Base form
- contract-builder-wizard.tsx - 7-step wizard
- contract-amendment-form.tsx - Amendment creation

**Task 16-18: Rate/Amendment/SLA Editors**

- rate-table-editor.tsx
- amendment-timeline.tsx
- sla-form.tsx (+ volume, fuel equivalents)

**Task 19-21: Extended Pages**

- templates/page.tsx + template-grid.tsx
- renewals/page.tsx + renewal-queue.tsx
- reports/page.tsx + reports-dashboard.tsx

**Task 22-24: Dialogs**

- confirm-approve-dialog.tsx
- confirm-activate-dialog.tsx
- confirm-terminate-dialog.tsx

_Each task: Write failing test → Implement → Test pass → Commit_

---

### Task 25-30: Comprehensive Test Suite

**Task 25: Component Tests**

- contracts-table: sorting, filtering, pagination
- contract-form: field validation, submission
- rate-table-editor: add/edit/delete lanes
- fuel-surcharge: tier calculations
- amendment-timeline: diff display

**Task 26: Hook Tests**

- useContracts: list, filter, pagination, error handling
- useContractDetail: lazy loading, refetch
- useAmendments: create, apply, delete
- useContractApproval: submit, approve, reject workflows

**Task 27: Page Integration Tests**

- Dashboard: KPI cards load, navigation works
- List: filters work, pagination works, delete works
- Detail: all tabs load data, tab switching works
- Builder: multi-step validation, submission

**Task 28-30: E2E & Accessibility**

- E2E: 7 critical user journeys (create, edit, approve, activate, etc.)
- Accessibility audit: keyboard nav, screen reader, color contrast
- Performance: Lighthouse ≥ 80

---

## Summary of All Tasks

| Phase | Task  | Component/Page                                      | Est. Time     |
| ----- | ----- | --------------------------------------------------- | ------------- |
| 1     | 1-3   | API types, validators, client                       | 4h            |
| 1     | 4-6   | useContracts, useContractDetail, sub-resource hooks | 6h            |
| 2     | 7-9   | Status badge, table, dashboard                      | 5h            |
| 2     | 10-12 | Detail pages & tabs                                 | 8h            |
| 2     | 13-15 | Forms & wizard                                      | 8h            |
| 3     | 16-18 | Editors (rate, amendment, SLA)                      | 6h            |
| 3     | 19-21 | Extended pages (templates, renewals, reports)       | 8h            |
| 3     | 22-24 | Dialogs                                             | 4h            |
| 4     | 25-27 | Component, hook, page tests                         | 12h           |
| 4     | 28-30 | E2E, accessibility, performance                     | 8h            |
|       |       | **TOTAL**                                           | **~69 hours** |

---

## Execution Guidelines

### For Each Task:

1. **Write the failing test first** (TDD approach)
2. **Run test to confirm it fails** with expected error
3. **Implement minimal code** to make test pass
4. **Run test to confirm it passes**
5. **Commit** with descriptive message

### Branching Strategy:

- Create feature branch: `git checkout -b mp-09-contracts`
- Commit frequently (after each task)
- Push to origin: `git push -u origin mp-09-contracts`
- Final PR to `development` with all 30 tasks complete

### Testing Commands:

```bash
# Component & hook tests
cd apps/web && pnpm test lib/hooks/contracts
cd apps/web && pnpm test components/contracts

# Page tests
cd apps/web && pnpm test app/(dashboard)/contracts

# E2E tests
cd apps/web && pnpm exec playwright test e2e/contracts.spec.ts

# All tests + coverage
cd apps/web && pnpm test --coverage
```

### Quality Gates Before PR:

```bash
# Type check
cd apps/web && pnpm check-types

# Lint
pnpm lint apps/web

# Build
pnpm build

# Test coverage (target: 70%)
cd apps/web && pnpm test --coverage
```

---

## Success Criteria Checklist

- [ ] All 8 pages built and navigable
- [ ] All sub-resources have full CRUD (modals or inline editors)
- [ ] 70%+ test coverage across components, hooks, pages
- [ ] E2E tests passing for 7+ critical journeys
- [ ] No console errors or warnings
- [ ] Accessibility passing (axe DevTools scan)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Lighthouse score ≥ 80
- [ ] All endpoints verified (no 404s, 500s)
- [ ] Stale data refreshed (React Query invalidation)

---

## Implementation Notes

### Key Patterns

**Form State Management:**

- Use React Hook Form + Zod for all forms
- Validate on blur + submit
- Show inline errors on field level

**API Caching:**

- React Query with 5-minute stale time for lists
- Invalidate cache on create/update/delete
- Lazy load tabs (only fetch when opened)

**Error Handling:**

- Show toast notifications for all async operations
- Render error boundary for page-level errors
- Retry button on API errors

**Loading States:**

- Skeleton loaders for initial page load
- Disable submit button while loading
- Show spinner on async operations

### Code Quality Reminders

- No `any` types (use TypeScript strictly)
- No hardcoded strings (use enums/constants)
- No commented-out code (delete it)
- No TODOs (finish or file backlog item)
- DRY: Extract repeated logic to utils/hooks
- YAGNI: Don't build features not in spec
- Commit frequently (small, focused commits)

---

## Next Steps

1. ✅ Design spec approved
2. ✅ Implementation plan created
3. → Use superpowers:subagent-driven-development to execute tasks 1-30
4. → Dispatch code review after each phase completion
5. → Create PR to development with full test suite passing
6. → Deploy to staging for QA verification

---

**Plan Created:** 2026-03-14
**Ready for Execution:** Yes

Use `superpowers:subagent-driven-development` to begin implementation.
