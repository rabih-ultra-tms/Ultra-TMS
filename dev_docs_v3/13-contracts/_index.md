# Screen-to-API Contract Registry

> Maps every frontend hook to its backend endpoint -- verified from source code

---

## Purpose

This directory documents the **actual** API calls made by frontend hooks, verified by reading hook source code on 2026-03-07. Each contract file maps:

- **Hook name** (what the frontend calls)
- **HTTP method + endpoint** (what hits the backend)
- **Request shape** (query params or body)
- **Response shape** (what comes back, after envelope unwrapping)
- **Cache key** (React Query key for invalidation)

## Contract Files

| File | Services Covered | Hook Count |
|------|-----------------|------------|
| [auth-crm-contracts.md](./auth-crm-contracts.md) | Auth, CRM (Customers, Contacts, Leads, Activities, Companies) | ~30 |
| [sales-tms-contracts.md](./sales-tms-contracts.md) | Quotes, Orders, Loads, Stops, Check Calls | ~40 |
| [carrier-loadboard-contracts.md](./carrier-loadboard-contracts.md) | Carriers, FMCSA, Scorecard, Load Board, Load Postings | ~35 |
| [accounting-commission-contracts.md](./accounting-commission-contracts.md) | Invoices, Settlements, Payments, Payables, Aging, Commissions | ~35 |
| [admin-profile-contracts.md](./admin-profile-contracts.md) | Users, Roles, Tenant, Sessions, Documents, Email Logs | ~25 |
| [operations-tracking-contracts.md](./operations-tracking-contracts.md) | Ops Dashboard, Dispatch Board, Tracking Map, WebSocket events | ~20 |
| [envelope-patterns.md](./envelope-patterns.md) | API envelope unwrapping guide with code examples | N/A |

## API Base URL

All endpoints are relative to `/api/v1/` (prepended by `apiClient`).

```
Frontend hook -> apiClient.get("/carriers") -> GET http://localhost:3001/api/v1/carriers
```

## Envelope Convention

All API responses follow one of two shapes:

```typescript
// Single entity
{ data: T }

// Paginated list
{ data: T[], pagination: { page: number, limit: number, total: number, totalPages: number } }
```

Frontend hooks MUST unwrap: `response.data.data` (not `response.data`).

## CRITICAL: Endpoint Naming Gotchas

These are the real endpoint prefixes verified from hooks (NOT what you might guess):

| Domain | Hook calls... | NOT |
|--------|--------------|-----|
| Customers | `/crm/companies?companyType=CUSTOMER` | `/crm/customers` |
| Leads | `/crm/opportunities` | `/crm/leads` |
| Activities | `/crm/activities` | -- |
| Quotes | `/quotes` | `/sales/quotes` |
| Orders | `/orders` | `/tms/orders` |
| Loads | `/loads` | `/tms/loads` |
| Stops | `/orders/:orderId/stops` | `/tms/stops` |
| Check Calls | `/loads/:loadId/check-calls` | `/tms/checkcalls` |
| Carriers | `/operations/carriers` | `/carriers` |
| Invoices | `/invoices` | `/accounting/invoices` |
| Settlements | `/settlements` | `/accounting/settlements` |
| Payments Received | `/payments-received` | `/payments` |
| Payments Made | `/payments-made` | `/payables` |
| Commission Plans | `/commissions/plans` | -- |
| Commission Transactions | `/commissions/transactions` | -- |
| Load Postings | `/load-postings` | `/load-board/postings` |
| Load Board Posts | `/load-board/posts` | -- |

## Hook File Locations

```
apps/web/lib/hooks/
  use-auth.ts                          # Auth (14 hooks)
  accounting/
    use-accounting-dashboard.ts        # Dashboard KPIs
    use-aging.ts                       # AR aging report
    use-invoices.ts                    # Invoice CRUD
    use-payables.ts                    # AP payables
    use-payments.ts                    # Payments received
    use-settlements.ts                 # Carrier settlements
  admin/
    use-roles.ts                       # Role CRUD
    use-security-log.ts                # Session logs
    use-tenant.ts                      # Tenant settings
    use-users.ts                       # User management
  carriers/
    use-carrier-scorecard.ts           # Performance scorecard
    use-fmcsa.ts                       # FMCSA lookup + CSA scores
  commissions/
    use-commission-dashboard.ts        # Commission dashboard
    use-payouts.ts                     # Commission payouts
    use-plans.ts                       # Commission plan CRUD
    use-reps.ts                        # Sales rep management
    use-transactions.ts                # Commission entries
  communication/
    use-email-logs.ts                  # Email log viewer
  crm/
    use-activities.ts                  # CRM activities
    use-companies.ts                   # Company listing
    use-contacts.ts                    # Contact CRUD
    use-customers.ts                   # Customer CRUD (uses /crm/companies)
    use-leads.ts                       # Lead/opportunity CRUD
  documents/
    use-documents.ts                   # Document upload/download
  load-board/
    use-loadboard-dashboard.ts         # Load board stats
    use-postings.ts                    # Load posting CRUD + bids
  operations/
    use-carriers.ts                    # Carrier CRUD + drivers/trucks/docs
    use-load-planner-quotes.ts         # Load planner (PROTECTED)
  sales/
    use-quotes.ts                      # Quote CRUD + lifecycle
  tms/
    use-checkcalls.ts                  # Check call CRUD
    use-dispatch.ts                    # Dispatch board
    use-dispatch-ws.ts                 # Dispatch WebSocket events
    use-loads.ts                       # Load CRUD + carrier search
    use-ops-dashboard.ts               # Operations dashboard
    use-orders.ts                      # Order CRUD
    use-rate-confirmation.ts           # Rate confirmation PDF
    use-stops.ts                       # Stop CRUD
    use-tracking.ts                    # Tracking map
  tracking/
    use-public-tracking.ts             # Public tracking (no auth)
```
