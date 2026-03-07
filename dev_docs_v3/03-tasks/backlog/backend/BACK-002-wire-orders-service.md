# BACK-002: Wire OrdersService to Frontend

**Priority:** P0
**Module:** `apps/api/src/modules/tms/`
**Endpoint(s):** `GET /orders`, `GET /orders/:id`, `POST /orders`, `PATCH /orders/:id`, `DELETE /orders/:id`, `POST /orders/:id/clone`, `PATCH /orders/:id/status`, `POST /orders/:id/cancel`

## Current State
OrdersController and OrdersService exist with full CRUD plus clone, status change, cancel, create-load-from-order, and template-based creation. Controller uses JwtAuthGuard with `SerializeOptions`. DTOs include CreateOrder, UpdateOrder, CloneOrder, ChangeOrderStatus, CancelOrder, OrderQuery, CreateLoad, CreateOrderItem, CreateOrderFromTemplate. Service file is ~22KB.

## Requirements
- Verify frontend `useOrders` hook maps to `GET /orders` with correct query params
- Verify `useOrder(id)` maps to `GET /orders/:id` and returns full detail with stops, loads, items
- Fix frontend `useUpdateOrder` which uses `any` type cast for status change
- Ensure order status transitions match backend enum

## Acceptance Criteria
- [ ] Endpoint returns correct data shape
- [ ] Auth guards applied
- [ ] Multi-tenant filtered (tenantId + deletedAt)
- [ ] DTO validation
- [ ] Tests pass
- [ ] Frontend hooks receive data in expected format

## Dependencies
- Prisma model: Order, OrderStop, OrderItem
- Related modules: crm (customer), tms/loads

## Estimated Effort
M
