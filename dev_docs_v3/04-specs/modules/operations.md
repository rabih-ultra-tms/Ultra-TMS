# Operations Module API Spec

**Module:** `apps/api/src/modules/operations/`
**Base path:** `/api/v1/`
**Controllers:** DashboardController (operations/dashboard), plus submodules for truck-types, equipment, load-history
**Auth:** All endpoints require `JwtAuthGuard` + `RolesGuard`

---

## DashboardController (Operations)

**Route prefix:** `operations/dashboard`
**Pattern:** Uses both `@CurrentTenant()` and `@CurrentUser()` decorators (not `@Request()`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/operations/dashboard` | Dashboard KPIs with period/scope |
| GET | `/operations/dashboard/charts` | Chart data (load volume, revenue) |
| GET | `/operations/dashboard/alerts` | Active alerts requiring attention |
| GET | `/operations/dashboard/activity` | Activity feed |
| GET | `/operations/dashboard/needs-attention` | Loads needing dispatcher action |

### GET /operations/dashboard — Query Params
```
period?: string            // 'today' | 'week' | 'month' | 'quarter' | 'year'  (default: 'today')
scope?: string             // 'personal' | 'team' | 'company'  (default: 'personal')
comparisonPeriod?: string  // 'yesterday' | 'last_week' | 'last_month'  (default: 'yesterday')
```

- `scope='personal'` filters loads by `user.id` — shows only the current dispatcher's loads
- `scope='company'` shows all tenant loads

### GET /operations/dashboard/charts — Query Params
```
period?: string   // same options as above (default: 'today')
```

### GET /operations/dashboard/activity — Query Params
```
period?: string   // same options as above (default: 'today')
```

### Response shapes
```typescript
// GET /operations/dashboard
{
  data: {
    kpis: {
      activeLoads: number;
      deliveredToday: number;
      pendingPickup: number;
      revenue: number;
      revenueChange: number;   // % vs comparison period
      onTimeRate: number;
    };
    comparison: { period: string; values: Record<string, number> };
  }
}

// GET /operations/dashboard/needs-attention
{
  data: Load[]   // loads with status issues, late, unassigned
}
```

---

## TruckTypesController (via operations module)

**Route prefix:** `truck-types`
**PROTECTED PAGE:** `/truck-types` is gold standard — do not rebuild

| Method | Path | Description |
|--------|------|-------------|
| POST | `/truck-types` | Create truck type |
| GET | `/truck-types` | List truck types |
| GET | `/truck-types/:id` | Get truck type |
| PATCH | `/truck-types/:id` | Update truck type |
| DELETE | `/truck-types/:id` | Delete truck type |

### Response envelope (list)
```typescript
{ data: TruckType[], pagination: { page, limit, total, totalPages } }
```

---

## EquipmentController

**Route prefix:** `equipment`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/equipment` | Add equipment record |
| GET | `/equipment` | List equipment |
| GET | `/equipment/:id` | Get equipment |
| PATCH | `/equipment/:id` | Update equipment |
| DELETE | `/equipment/:id` | Delete equipment |

---

## InlandServiceTypesController

**Route prefix:** `inland-service-types`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/inland-service-types` | List service types (used in load forms) |
| POST | `/inland-service-types` | Create service type |
| PATCH | `/inland-service-types/:id` | Update service type |
| DELETE | `/inland-service-types/:id` | Delete service type |

---

## TenantServicesController

**Route prefix:** `tenant-services`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tenant-services` | List services enabled for tenant |
| POST | `/tenant-services/:serviceKey/enable` | Enable a service |
| DELETE | `/tenant-services/:serviceKey/disable` | Disable a service |

Frontend: `/superadmin/tenant-services` page + `useTenantServices` hook

---

## LoadHistoryController

**Route prefix:** `loads/history` (may differ — verify with Glob)

Used by `useLoadHistory` hook. Returns completed/archived loads separate from active loads in TMS module.

---

## Frontend Hooks

| Hook | File | Calls |
|------|------|-------|
| `useOpsDashboard` | `lib/hooks/tms/use-ops-dashboard.ts` | GET /operations/dashboard (+ charts, alerts, activity) |
| `useTruckTypes` | `lib/hooks/operations/use-truck-types.ts` | GET /truck-types |
| `useEquipment` | `lib/hooks/operations/use-equipment.ts` | GET /equipment |
| `useInlandServiceTypes` | `lib/hooks/operations/use-inland-service-types.ts` | GET /inland-service-types |
| `useTenantServices` | `lib/hooks/operations/use-tenant-services.ts` | GET /tenant-services |
| `useLoadHistory` | `lib/hooks/operations/use-load-history.ts` | GET /loads/history (verify path) |

---

## Known Issues

1. **useOpsDashboard** is in `lib/hooks/tms/` not `lib/hooks/operations/` — hook location inconsistency
2. **`scope` param implementation:** `getKPIs` receives `user?.id` — if undefined (e.g. service account), scope filter breaks silently
3. **No role restrictions on operations dashboard** — all authenticated users can view all scopes; scope enforcement is service-level only
4. **useLoadHistory endpoint path** — verify actual controller route prefix (may be `/load-history` not `/loads/history`)
