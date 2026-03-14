# MP-09 Contracts Frontend Design Specification

**Date:** 2026-03-14
**Sprint:** MP-09 (Weeks 13-14)
**Service:** Contracts (#15)
**Scope:** Full frontend build (8 pages, full CRUD sub-resources)
**Quality Bar:** Production-ready (tests, error handling, accessibility)
**Status:** Design Approved - Ready for Implementation

---

## 1. Overview

### Purpose

Build a production-ready frontend for the Contracts service (MP-09), enabling users to create, manage, approve, and execute commercial agreements with carriers and customers. This includes comprehensive management of rate tables, amendments, SLAs, volume commitments, and fuel surcharge structures.

### Context

- **Backend Status:** Substantial - 58 endpoints across 8 controllers, all implemented and tested
- **Frontend Status:** 0 pages built (greenfield)
- **Design Source:** `dev_docs/12-Rabih-design-Process/14-contracts/` (8 detailed spec files)
- **Related Services:** CRM (customers), Carriers (carrier data), Sales (rate consumption)

### Deliverables

1. **8 Pages:** Dashboard, List, Detail (with 7 tabs), New/Builder, Edit, Templates, Renewals, Reports
2. **18 Shared Components:** Forms, tables, tabs, dialogs, badges
3. **12 Custom Hooks:** CRUD operations, data fetching, workflow management
4. **Test Suite:** 70%+ coverage (components, hooks, pages, E2E)
5. **Accessibility:** WCAG 2.1 AA compliance
6. **Design Doc:** This specification

---

## 2. Architecture & Directory Structure

### Frontend Directory Layout

```
apps/web/
├── app/(dashboard)/contracts/
│   ├── page.tsx                     # Dashboard (KPIs, recent contracts)
│   ├── list/
│   │   └── page.tsx                 # Contracts list (filterable, paginated)
│   ├── [id]/
│   │   ├── page.tsx                 # Contract detail (tabbed interface)
│   │   └── edit/
│   │       └── page.tsx             # Edit contract (amendment tracking)
│   ├── new/
│   │   └── page.tsx                 # Contract builder (multi-step wizard)
│   ├── templates/
│   │   ├── page.tsx                 # Template library (grid)
│   │   └── [id]/
│   │       └── page.tsx             # Template detail & preview
│   ├── renewals/
│   │   └── page.tsx                 # Renewal queue (upcoming renewals)
│   └── reports/
│       └── page.tsx                 # Reports dashboard
│
├── components/contracts/
│   ├── contracts-dashboard.tsx       # Dashboard KPI cards & charts
│   ├── contracts-table.tsx           # Sortable/filterable contracts list
│   ├── contract-detail-tabs.tsx      # Tab navigation container
│   ├── contract-overview-tab.tsx     # Overview tab content
│   ├── contract-status-badge.tsx     # Status indicator badge
│   ├── contract-summary-card.tsx     # Summary card (key terms, dates)
│   ├── contract-filters.tsx          # Filter bar (type, status, party, date)
│   ├── contract-form.tsx             # Base contract form (used by builder & edit)
│   ├── contract-builder-wizard.tsx   # Multi-step creation wizard
│   ├── contract-amendment-form.tsx   # Amendment creation form
│   ├── contract-amendment-timeline.tsx # Amendment history timeline
│   ├── rate-table-editor.tsx         # Rate table CRUD interface
│   ├── rate-lane-row.tsx             # Inline rate lane editor
│   ├── rate-lane-form.tsx            # Modal/inline lane add/edit
│   ├── fuel-surcharge-table.tsx      # Fuel surcharge table CRUD
│   ├── fuel-surcharge-tier-form.tsx  # Tier add/edit form
│   ├── sla-form.tsx                  # SLA add/edit modal
│   ├── volume-commitment-form.tsx    # Volume commitment form
│   ├── template-grid.tsx             # Template library grid
│   ├── template-preview.tsx          # Template preview modal
│   ├── renewal-queue.tsx             # Renewal cards grid
│   ├── reports-dashboard.tsx         # Reports overview with charts
│   └── dialogs/
│       ├── confirm-approve-dialog.tsx         # Approval confirmation
│       ├── confirm-reject-dialog.tsx          # Rejection with reason
│       ├── confirm-activate-dialog.tsx        # Activation confirmation
│       ├── confirm-terminate-dialog.tsx       # Termination warning
│       ├── send-for-signature-dialog.tsx      # DocuSign flow
│       └── unsaved-changes-dialog.tsx         # Warn on navigation
│
├── lib/hooks/contracts/
│   ├── useContracts.ts               # List, filter, paginate, delete contracts
│   ├── useContractDetail.ts          # Single contract + all related data
│   ├── useRateTables.ts              # Rate table CRUD
│   ├── useRateLanes.ts               # Rate lane CRUD
│   ├── useAmendments.ts              # Amendment CRUD + history
│   ├── useSLAs.ts                    # SLA CRUD
│   ├── useVolumeCommitments.ts       # Volume commitment CRUD + tracking
│   ├── useFuelSurcharge.ts           # Fuel table CRUD + tier management
│   ├── useContractApproval.ts        # Approval workflow (submit, approve, reject)
│   ├── useContractActivation.ts      # Activation workflow
│   ├── useContractTemplates.ts       # Template library (list, clone)
│   ├── useContractRenewals.ts        # Renewal management
│   ├── useContractReports.ts         # Reports data aggregation
│   └── useContractFilters.ts         # Centralized filter state
│
└── lib/api/contracts/
    ├── types.ts                      # TypeScript types for API responses
    ├── client.ts                     # API client methods (wrapper around apiClient)
    └── validators.ts                 # Zod schemas for validation
```

### Data Flow Architecture

```
User Action
    ↓
Page Component
    ↓
Hook (useContracts, useRateTable, etc.)
    ↓
API Client (lib/api/contracts/client.ts)
    ↓
Backend API (/api/v1/contracts/*)
    ↓
Response → React Query Cache
    ↓
Hook returns { data, isLoading, error }
    ↓
Page re-renders with data
```

---

## 3. Pages & Screens

### 3.1 Dashboard (`/contracts`)

**Purpose:** High-level overview of contract portfolio

**Components:**

- Header: "Contracts Dashboard"
- KPI Cards (4 total):
  - Active contracts count + trend
  - Expiring in 30 days count + warning icon
  - Expired contracts count (read-only info)
  - Total revenue under contract (sum of all active contract values)
- Recent Contracts Table (last 5):
  - Columns: Name, Type, Party, Status, End Date, Actions
  - Quick actions: View Detail, Edit, Renew (if expiring)
- Charts:
  - Pie chart: Contract status distribution (DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE, EXPIRED, TERMINATED)
  - Line chart: Contract value over time (monthly)

**Data Source:** `useContractReports()` + `useContracts({ limit: 5, orderBy: 'updatedAt', sort: 'DESC' })`

**Interactions:**

- Click KPI card → navigate to List with filter applied (e.g., status=ACTIVE)
- Click recent contract row → navigate to Detail page

---

### 3.2 Contracts List (`/contracts/list`)

**Purpose:** Browse, filter, and manage contracts

**Components:**

- Header: "Contracts"
- Filter Bar:
  - Type (dropdown): All, Master Service Agreement, Volume Discount, Fuel Surcharge, Equipment, Lane Rate
  - Status (multi-select): DRAFT, PENDING_APPROVAL, APPROVED, SENT_FOR_SIGNATURE, ACTIVE, EXPIRED, TERMINATED
  - Party (search/combobox): Carrier or Customer name
  - Date Range (picker): Created/Updated between dates
  - Button: Clear Filters, Export CSV
- Contracts Table:
  - Columns: Name, Type, Party, Status, Start Date, End Date, Value, Actions
  - Sortable: all columns
  - Paginated: 20 rows per page
  - Row Actions: View, Edit, Renew, Delete (soft)
- Empty State: "No contracts found. Create your first contract."

**Data Source:** `useContracts()` + `useContractFilters()`

**Interactions:**

- Filter → updates URL query params → fetches data with filters
- Click contract row → navigate to `/contracts/[id]`
- Click "New Contract" → navigate to `/contracts/new`
- Click "Delete" → confirmation dialog → soft delete

---

### 3.3 Contract Detail (`/contracts/[id]`)

**Purpose:** View and manage contract details and sub-resources

**Layout:** Tabbed interface with 7 tabs

**Header:**

- Contract name + type badge
- Contract status badge (with color)
- Quick Actions Buttons:
  - Edit (if DRAFT or APPROVED)
  - Approve (if PENDING_APPROVAL, Audit role only)
  - Reject (if PENDING_APPROVAL, Audit role only)
  - Send for Signature (if APPROVED)
  - Activate (if SENT_FOR_SIGNATURE)
  - Renew (if ACTIVE and within 30 days of expiry)
  - Terminate (if ACTIVE, Audit role only)

**Tab 1: Overview**

- Contract Summary Card:
  - Type, Parties (Customer/Carrier), Start Date, End Date, Status, Created By, Last Modified
  - Key Terms (if any)
- Amendment Timeline (collapsed, expandable)
- Approval Workflow Status (if applicable):
  - Submitted at, Approved by, Approval date
  - Or: Rejected reason (if rejected)
- Documents Section (read-only, from Documents module)
  - Upload button (if DRAFT)
  - List of attached documents

**Tab 2: Rate Tables**

- Description: "Define pricing structure for this contract"
- RateTableEditor Component:
  - List of rate tables for this contract
  - Add button: "Create Rate Table"
  - For each table:
    - Table name, equipment type, effective date, status
    - Expandable rows showing RateLanes (origin, destination, equipment, rate)
    - Inline add/edit/delete lane buttons
    - Import/Export CSV buttons

**Tab 3: Rate Lanes**

- List of all lanes across all rate tables
- Table: Origin, Destination, Equipment, Rate, Table Name, Actions
- Add button opens RateLaneForm modal
- Edit/Delete inline or modal

**Tab 4: Amendments**

- Description: "Track contract modifications"
- ContractAmendmentTimeline:
  - Timeline of all amendments (newest first)
  - Each amendment shows: amendment #, date, change summary, created by
  - Expandable details: diff preview (what changed)
- Add button: "Create Amendment"
  - Opens ContractAmendmentForm modal
  - Fields: reason, changes (diff preview), effective date, requires approval (checkbox)
- Apply button (if not applied): applies amendment to contract

**Tab 5: SLAs**

- Description: "Service level agreements and penalties"
- SLA List:
  - Columns: Service Level, Target, Penalty, Status, Actions
  - Examples: "On-time delivery", "99% uptime", "damage-free shipments"
- Add button: "Add SLA"
  - Opens SlaForm modal
  - Fields: service level (text), target (number + unit), penalty (text/amount), effective date
- Edit/Delete for each row

**Tab 6: Volume Commitments**

- Description: "Track volume targets and performance"
- VolumeCommitmentList:
  - Columns: Period, Target Volume, Actual Volume, % of Target, Penalty (if shortfall), Actions
  - Status indicator: on-track (green), at-risk (yellow), failed (red)
- Add button: "Create Volume Commitment"
  - Opens VolumeCommitmentForm modal
  - Fields: target volume, period (month/quarter/year), start date, end date, penalty formula
- Performance tracking: shows rolling performance for current period

**Tab 7: Fuel Surcharge Tables**

- Description: "Dynamic fuel pricing adjustments"
- FuelSurchargeTable Component:
  - List of fuel tables for this contract
  - For each table:
    - Base fuel price, effective date, tiers (price ranges → surcharge %)
    - Inline tier editor: add/edit/delete tiers
    - Calculate button: shows surcharge for a given fuel price
- Add button: "Create Fuel Table"
  - Opens FuelSurchargeTableForm modal
  - Fields: name, base price, effective date, tiers (dynamic array)

**Data Source:** `useContractDetail(id)` + individual hooks for each sub-resource

---

### 3.4 Contract Builder (`/contracts/new`)

**Purpose:** Create contract through guided multi-step wizard

**Wizard Structure:** 7 Steps

**Step 1: Contract Type & Parties**

- Type: dropdown (MSA, Volume Discount, Fuel Surcharge, Equipment, Lane Rate)
- Carrier: combobox (search carriers)
- Customer: combobox (search customers) - optional depending on type
- Effective Date: date picker

**Step 2: Terms & Dates**

- Start Date: date picker
- End Date: date picker
- Auto-Renewal: checkbox + days before expiry
- Terms (optional): rich text editor

**Step 3: Rate Tables**

- Option A: Create new rate table inline (form)
  - Equipment Type, lanes (add rows: origin, destination, rate)
- Option B: Use template rate table (template picker)
- Option C: Skip (add later)

**Step 4: SLAs**

- Add SLA rows (dynamic array)
- For each: service level, target, penalty
- Option: Skip

**Step 5: Volume Commitments** (optional)

- Add volume commitment rows
- For each: target volume, period, penalty
- Option: Skip

**Step 6: Fuel Surcharge** (optional)

- Create fuel table or skip

**Step 7: Review & Submit**

- Summary of all entries
- Button: "Create Contract" → POST to `/api/v1/contracts` with all data
- On success: redirect to Detail page
- On error: show error and allow retry

**Data Source:** All from form state (local, not from API yet)

**Validation:** Zod schema validates at each step; step navigation blocked if invalid

---

### 3.5 Contract Edit (`/contracts/[id]/edit`)

**Purpose:** Modify existing contract and track changes as amendments

**Layout:** Similar to builder, but:

- Pre-fills all fields from contract data
- Form header shows "Edit Contract" + status
- On submit:
  - If ACTIVE: creates amendment record (tracks what changed)
  - If DRAFT: updates contract directly
  - If requires approval: sends for approval workflow

**Unsaved Changes:** Shows warning dialog if navigating away with unsaved changes

**Amendment Tracking:**

- Form compares new values to old values
- On save: calculates delta (what changed)
- Creates amendment record with delta
- If ACTIVE contract, requires audit approval before applying

---

### 3.6 Contract Templates (`/contracts/templates`)

**Purpose:** Browse and reuse contract templates

**Layout:**

- Header: "Contract Templates"
- Filter/Search: by type, name
- Grid Layout (TemplateGrid):
  - Cards for each template
  - Card shows: name, type, description, # of times cloned
  - Card actions: Preview, Clone, Delete

**Preview Modal:**

- Shows template details (type, rate structure, SLA examples)
- Clone button: creates new contract from template

**Clone Workflow:**

- Copy all template data (rate tables, SLAs, etc.) into new contract
- Navigate to Edit page to customize
- User saves as new contract

**Data Source:** `useContractTemplates()`

---

### 3.7 Contract Renewals (`/contracts/renewals`)

**Purpose:** Manage upcoming contract renewals

**Layout:**

- Header: "Contract Renewals"
- Filter: By status (Upcoming, Expiring Soon, Expired)
- RenewalQueue Component:
  - Cards for each expiring contract
  - Shows: contract name, current end date, days until expiry, actions
  - Action buttons: Renew, Contact Carrier, Skip

**Renew Workflow:**

1. Click "Renew"
2. System creates new contract (clone of current)
3. New contract dates start from current end date
4. Navigate to Edit page to customize (if needed)
5. Save and submit for approval

**Data Source:** `useContractRenewals()` → filters for contracts expiring within 60 days

---

### 3.8 Contract Reports (`/contracts/reports`)

**Purpose:** Analytics and insights on contract portfolio

**Layout:**

- Header: "Contract Reports"
- Tabs or sections:

**Section 1: Expiry Report**

- Table: Contract Name, Type, Party, End Date, Days Until Expiry, Status
- Filter by month or quarter
- Export CSV button
- Chart: contracts expiring by month (next 12 months)

**Section 2: Rate Comparison Report**

- Compares rates across similar contracts
- Table: Lane, Equipment, Contract 1 Rate, Contract 2 Rate, Difference, % Change
- Select 2-3 contracts to compare
- Chart: rate distribution by lane/equipment

**Section 3: Volume vs Commitment**

- Shows performance against volume commitments
- Table: Contract, Target Volume, Actual Volume, % of Target, Status, Penalty (if shortfall)
- Filter by period (month/quarter/year)
- Chart: actual vs target by contract

**Section 4: Revenue Summary**

- Total revenue under contract (by contract type)
- Revenue growth trend (last 12 months)
- Average contract value
- Contracts expiring in 30 days (revenue at risk)

**Data Source:** `useContractReports()` → aggregates data from all contracts

---

## 4. Components

### Shared Components

#### contracts-dashboard.tsx

- Props: `{ contracts: Contract[], reports: Reports }`
- Returns: KPI cards + charts
- Tests: rendering, color coding, navigation

#### contracts-table.tsx

- Props: `{ contracts: Contract[], isLoading: boolean, onRowClick: (id) => void }`
- Sortable columns, filters, pagination
- Tests: sorting, filtering, row selection

#### contract-detail-tabs.tsx

- Props: `{ contractId: string, initialTab?: string }`
- State: active tab
- Children: 7 tab panels
- Tests: tab switching, data loading per tab

#### contract-status-badge.tsx

- Props: `{ status: ContractStatus }`
- Returns: styled badge with icon + text
- Tests: all status colors, accessibility

#### contract-form.tsx

- Props: `{ initialData?: Contract, onSubmit: (data) => void }`
- Form fields: type, parties, dates, terms
- Validation: Zod schema
- Tests: field rendering, validation, submission

#### contract-builder-wizard.tsx

- Props: `{ onSubmit: (data) => void }`
- State: active step, form data accumulation
- 7-step form with validation per step
- Tests: step navigation, validation, submission

#### rate-table-editor.tsx

- Props: `{ contractId: string }`
- Displays rate tables + inline lane editor
- Tests: table rendering, CRUD operations, calculation

#### fuel-surcharge-table.tsx

- Props: `{ contractId: string }`
- Displays fuel tiers + calculator
- Tests: tier addition, calculation accuracy

#### amendment-timeline.tsx

- Props: `{ contractId: string }`
- Shows amendment history with diffs
- Tests: timeline rendering, diff display

### Dialog Components

#### confirm-approve-dialog.tsx

- Props: `{ contractId: string, onConfirm: () => void }`
- Shows contract terms, asks for approval reason
- Submission: POST `/api/v1/contracts/:id/approve`

#### confirm-activate-dialog.tsx

- Props: `{ contractId: string, onConfirm: () => void }`
- Warns that rates will be locked
- Submission: POST `/api/v1/contracts/:id/activate`

#### confirm-terminate-dialog.tsx

- Props: `{ contractId: string, onConfirm: () => void }`
- Shows termination date picker, final amount due
- Submission: POST `/api/v1/contracts/:id/terminate`

---

## 5. Hooks

### useContracts

```typescript
interface UseContractsOptions {
  filters?: { type?, status?, partyId?, dateRange? }
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
}

return {
  contracts: Contract[]
  pagination: { page, limit, total, totalPages }
  isLoading: boolean
  error?: Error
  refetch: () => void
  delete: (id: string) => Promise<void>
}
```

### useContractDetail

```typescript
return {
  contract: Contract
  rateTables: RateTable[]
  amendments: Amendment[]
  slas: SLA[]
  volumeCommitments: VolumeCommitment[]
  isLoading: boolean
  error?: Error
  refetch: () => void
}
```

### useRateTables

```typescript
return {
  rateTables: RateTable[]
  create: (data: CreateRateTableDTO) => Promise<RateTable>
  update: (id: string, data: UpdateRateTableDTO) => Promise<RateTable>
  delete: (id: string) => Promise<void>
  isLoading: boolean
  error?: Error
}
```

### useAmendments

```typescript
return {
  amendments: Amendment[]
  create: (data: CreateAmendmentDTO) => Promise<Amendment>
  apply: (id: string) => Promise<void>
  delete: (id: string) => Promise<void>
  isLoading: boolean
  error?: Error
}
```

### useContractApproval

```typescript
return {
  submit: (contractId: string) => Promise<void>
  approve: (contractId: string, reason: string) => Promise<void>
  reject: (contractId: string, reason: string) => Promise<void>
  isLoading: boolean
  error?: Error
}
```

### useContractTemplates

```typescript
return {
  templates: ContractTemplate[]
  clone: (id: string, data: Partial<Contract>) => Promise<Contract>
  delete: (id: string) => Promise<void>
  isLoading: boolean
  error?: Error
}
```

### useContractRenewals

```typescript
return {
  renewals: Contract[] // expiring within 60 days
  renew: (contractId: string) => Promise<Contract>
  isLoading: boolean
  error?: Error
}
```

### useContractReports

```typescript
return {
  kpis: { activeCount, expiringCount, expiredCount, totalValue }
  expiryData: Contract[]
  rateComparison: RateComparisonData
  volumePerformance: VolumePerformanceData
  revenueSummary: RevenueSummaryData
  isLoading: boolean
  error?: Error
}
```

---

## 6. Data Types & API Contracts

### Contract Status Enum

```typescript
enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT_FOR_SIGNATURE = 'SENT_FOR_SIGNATURE',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}
```

### Contract Type Enum

```typescript
enum ContractType {
  MASTER_SERVICE_AGREEMENT = 'MASTER_SERVICE_AGREEMENT',
  VOLUME_DISCOUNT = 'VOLUME_DISCOUNT',
  FUEL_SURCHARGE = 'FUEL_SURCHARGE',
  EQUIPMENT = 'EQUIPMENT',
  LANE_RATE = 'LANE_RATE',
}
```

### Key API Endpoints Used

```
POST   /api/v1/contracts                          # Create
GET    /api/v1/contracts                          # List (filters, pagination)
GET    /api/v1/contracts/:id                      # Detail
PUT    /api/v1/contracts/:id                      # Update
DELETE /api/v1/contracts/:id                      # Soft delete

POST   /api/v1/contracts/:id/submit               # Submit for approval
POST   /api/v1/contracts/:id/approve              # Approve (Audit role)
POST   /api/v1/contracts/:id/reject               # Reject (Audit role)
POST   /api/v1/contracts/:id/send-for-signature   # Send to DocuSign
POST   /api/v1/contracts/:id/activate             # Activate
POST   /api/v1/contracts/:id/renew                # Create renewal
POST   /api/v1/contracts/:id/terminate            # Terminate

GET    /api/v1/contracts/:contractId/rate-tables  # List rate tables
POST   /api/v1/contracts/:contractId/rate-tables  # Create rate table
PUT    /api/v1/rate-tables/:id                    # Update rate table
DELETE /api/v1/rate-tables/:id                    # Delete rate table

GET    /api/v1/rate-tables/:rateTableId/lanes     # List lanes
POST   /api/v1/rate-tables/:rateTableId/lanes     # Create lane
PUT    /api/v1/rate-tables/:rateTableId/lanes/:id # Update lane
DELETE /api/v1/rate-tables/:rateTableId/lanes/:id # Delete lane

GET    /api/v1/contracts/:contractId/amendments   # List amendments
POST   /api/v1/contracts/:contractId/amendments   # Create amendment
PUT    /api/v1/contracts/:contractId/amendments/:id # Update
DELETE /api/v1/contracts/:contractId/amendments/:id # Delete
POST   /api/v1/contracts/:contractId/amendments/:id/apply # Apply amendment

GET    /api/v1/contracts/:contractId/slas        # List SLAs
POST   /api/v1/contracts/:contractId/slas        # Create SLA
PUT    /api/v1/contracts/:contractId/slas/:id    # Update
DELETE /api/v1/contracts/:contractId/slas/:id    # Delete

GET    /api/v1/contracts/:contractId/volume-commitments     # List
POST   /api/v1/contracts/:contractId/volume-commitments     # Create
PUT    /api/v1/contracts/:contractId/volume-commitments/:id # Update
DELETE /api/v1/contracts/:contractId/volume-commitments/:id # Delete
GET    /api/v1/contracts/:contractId/volume-commitments/:id/performance # Performance

GET    /api/v1/fuel-tables                # List fuel tables
POST   /api/v1/fuel-tables                # Create
PUT    /api/v1/fuel-tables/:id            # Update
DELETE /api/v1/fuel-tables/:id            # Delete
GET    /api/v1/fuel-surcharge/calculate   # Calculate surcharge

GET    /api/v1/contract-templates         # List templates
POST   /api/v1/contract-templates/:id/clone # Clone
```

---

## 7. Error Handling & Loading States

### Loading States

- **Page load:** Skeleton loaders for all major sections
- **Sub-resource tabs:** Lazy load when tab is opened
- **Form submission:** Disable submit button, show spinner
- **CRUD operations:** Optimistic update + server confirm

### Error States

- **API error (5xx):** Toast notification + retry button
- **Network error:** Offline indicator + queue operation
- **Validation error:** Inline field errors (Zod)
- **403/401:** Redirect to login or permission denied page
- **Soft-deleted contract:** Show "This contract has been archived" + restore option

### Confirmation Dialogs

- Contract approval: shows key terms, requires approval reason
- Contract activation: warns "rates will be locked"
- Contract termination: warns "cannot be undone"
- Amendment apply: shows diff preview
- Delete operations: "Are you sure?" with undo option

### Toast Notifications

- "Contract created successfully"
- "Contract updated successfully"
- "Amendment created (pending approval)" or "Amendment applied"
- "Rate table updated"
- "Contract approved by [User]"
- "Error: [message]"

---

## 8. Testing Strategy

### Target Coverage: 70%+ across pages, components, hooks

### Component Tests (Jest + React Testing Library)

#### Unit Tests

- `contracts-table.tsx`: sorting, filtering, pagination, row selection
- `contract-form.tsx`: field validation, required field detection, submission
- `contract-status-badge.tsx`: status color mapping, icon rendering
- `contract-filters.tsx`: filter state changes, clear filters
- `rate-table-editor.tsx`: add/edit/delete lanes, calculation display
- `fuel-surcharge-table.tsx`: tier ordering, surcharge calculation
- `amendment-timeline.tsx`: timeline rendering, diff display
- Each: 5-8 test cases

#### Dialog Tests

- `confirm-approve-dialog.tsx`: renders, calls onConfirm callback
- `confirm-activate-dialog.tsx`: shows rate lock warning
- `confirm-terminate-dialog.tsx`: shows termination date picker

### Hook Tests (Jest + Supertest)

#### Unit Tests

- `useContracts`: list, filter, pagination, delete (mock API)
- `useContractDetail`: single contract, lazy-load related data
- `useRateTables`: CRUD operations, validation
- `useAmendments`: create, apply, delete, history
- `useFuelSurcharge`: calculate, update tiers
- `useContractApproval`: submit, approve, reject workflows
- Each: 5-10 test cases

### Page Integration Tests (Jest + React Testing Library)

#### Integration Tests

- Detail page: loads all tabs data, tab switching
- List page: filters work, pagination works, delete works
- Builder: multi-step validation, submission
- Edit: pre-fills form, creates amendment on save
- Each: 3-5 test cases (happy path + error scenarios)

### E2E Tests (Playwright)

#### Critical User Journeys

1. Create contract → fill wizard → submit → appears in list
2. Edit contract → change rate → creates amendment
3. Approve contract → state transitions to APPROVED
4. Activate contract → state transitions to ACTIVE, rates locked
5. Create amendment → apply amendment → contract updated
6. Add rate table → add lanes → calculate rate
7. Search/filter contracts → results correct

#### Test Coverage

- 5-8 critical journeys
- File: `e2e/contracts.spec.ts`

### Test Structure

```
components/contracts/
├── contracts-table.test.tsx
├── contract-form.test.tsx
├── contract-status-badge.test.tsx
├── rate-table-editor.test.tsx
└── ...

lib/hooks/contracts/
├── useContracts.test.ts
├── useContractDetail.test.ts
├── useAmendments.test.ts
└── ...

app/(dashboard)/contracts/
├── page.test.tsx (dashboard)
├── list/page.test.tsx
├── [id]/page.test.tsx
├── new/page.test.tsx
└── ...

e2e/
└── contracts.spec.ts
```

---

## 9. Accessibility (WCAG 2.1 AA)

### Form Accessibility

- All inputs have associated labels (visible or `aria-label`)
- Tab order is logical throughout all forms
- Error messages linked to fields via `aria-describedby`
- Required fields marked with `aria-required="true"`

### Table Accessibility

- Tables have `role="table"`
- Headers marked with `scope="col"`
- Sortable columns have `aria-sort="ascending|descending|none"`
- Focused rows have `aria-selected="true"`

### Dialog Accessibility

- Dialogs use `role="alertdialog"` for confirmation
- Focus trapped within dialog
- Escape key closes dialog
- Screen reader announces modal

### Color & Icons

- Status colors never sole indicator (always include icon)
- Color contrast ratio ≥ 4.5:1 for text
- Icon buttons have `aria-label`

### Keyboard Navigation

- All interactive elements keyboard accessible (Tab, Enter, Space, Arrow keys)
- Breadcrumbs navigable via keyboard
- Sortable columns can be sorted via keyboard

### Announcements

- Loading states announced via `aria-busy` or `aria-live` regions
- Form submission status announced (success/error)
- Toast notifications announced via `aria-live="polite"`

---

## 10. Design & Polish

### Visual Consistency

- Use shadcn/ui components (Button, Input, Select, Dialog, Tabs, etc.)
- Color scheme:
  - DRAFT: gray-500
  - PENDING_APPROVAL: amber-500
  - APPROVED: blue-600
  - SENT_FOR_SIGNATURE: indigo-600
  - ACTIVE: green-600
  - EXPIRED: slate-400
  - TERMINATED: red-600
- Typography: Tailwind scales (no custom fonts)
- Spacing: 8px grid (Tailwind default)

### UX Enhancements

- **Unsaved changes warning:** Dirty form detection, prevent navigation
- **Optimistic updates:** UI reflects change before API confirms
- **Toast notifications:** All async operations (create, update, delete, approve)
- **Keyboard shortcuts:** Cmd+S to save draft, Cmd+Shift+D to delete (with confirmation)
- **Breadcrumbs:** Contracts > [Contract Name] > Edit
- **Status timeline:** Visual timeline showing contract lifecycle (DRAFT → PENDING → APPROVED → SIGNED → ACTIVE)
- **Rate comparison:** Side-by-side comparison when viewing amendments
- **Amendment diff preview:** Highlights what changed (red/green)

### Performance

- Lazy load tabs (only fetch when tab opened)
- Virtual scrolling for large tables (1000+ contracts)
- Debounce filters (300ms)
- Cache API responses via React Query

### Responsive Design

- Mobile: single-column layout, stacked cards
- Tablet: 2-column where applicable
- Desktop: full layout with sidebars

---

## 11. Implementation Phases

### Phase 1: Core Pages & Data Layer (Days 1-3)

- Pages: Dashboard, List, Detail
- Hooks: useContracts, useContractDetail, useFilters
- Components: ContractsTable, ContractDetailTabs, ContractStatusBadge

### Phase 2: CRUD Operations (Days 4-6)

- Pages: New (Builder), Edit
- Hooks: useRateTables, useAmendments, useSLAs, useVolumeCommitments, useFuelSurcharge
- Components: ContractBuilderWizard, RateTableEditor, AmendmentForm
- Dialogs: Approval, Activation, Termination

### Phase 3: Extended Pages (Days 7-8)

- Pages: Templates, Renewals, Reports
- Hooks: useContractTemplates, useContractRenewals, useContractReports
- Components: TemplateGrid, RenewalQueue, ReportsDashboard

### Phase 4: Testing & Polish (Days 9-10)

- Component tests (70%+ coverage)
- Hook tests (CRUD, error scenarios)
- Page tests (integration)
- E2E tests (critical journeys)
- Accessibility audit
- Performance optimization

---

## 12. Success Criteria

- [ ] All 8 pages built and wired to API
- [ ] All sub-resources (rate tables, amendments, SLAs, etc.) have full CRUD
- [ ] 70%+ test coverage (components, hooks, pages)
- [ ] E2E tests passing for 5+ critical journeys
- [ ] No console errors or warnings
- [ ] WCAG 2.1 AA compliance verified (axe DevTools)
- [ ] Optimized performance (Lighthouse ≥ 80)
- [ ] All endpoints verified (no 404s, 500s)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Documentation complete (component props, hook usage)

---

## 13. Risks & Mitigations

| Risk                              | Impact                          | Mitigation                                                    |
| --------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| Scope creep (8 pages + full CRUD) | Timeline overrun                | Ruthlessly prioritize; defer non-essential features to MP-10  |
| Complex amendment workflow        | Logic errors, bugs              | Write comprehensive tests for amendment creation + apply      |
| Rate table calculations           | Financial correctness critical  | Unit test all calculation methods; verify against design spec |
| Nested CRUD (lanes within tables) | UI complexity, state management | Use modals for nested operations; test thoroughly             |
| Soft-delete edge cases            | Data integrity                  | Test soft-delete filtering on all queries; audit trail        |
| DocuSign integration stub         | Incomplete workflow             | Plan DocuSign integration for MP-10; stub with toast for now  |

---

## 14. Dependencies & Assumptions

### Dependencies

- Backend: All 58 endpoints fully implemented and tested ✅
- Authentication: JWT-based auth with role-based access control (Admin, Audit, etc.)
- API client: `lib/api/client.ts` with request/response handling
- Components: shadcn/ui components pre-installed
- React Query: Configured for data fetching and caching

### Assumptions

- CRM service available for customer/carrier search
- Documents module available for file uploads
- File storage (S3 or local) configured
- Email service available for contract notifications
- Rate calculation logic matches backend implementation

---

## 15. Sign-Off

**Design Approved By:** [User]
**Date:** 2026-03-14
**Status:** Ready for Implementation Planning

---

**Next Steps:**

1. ✅ Design approved
2. → Invoke writing-plans skill to create implementation plan
3. → Execute implementation in isolated git worktree
4. → Test and iterate
5. → PR review and merge to development
