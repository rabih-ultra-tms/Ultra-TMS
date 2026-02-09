# DOC-003: Screen-to-API Contract Registry

> **Phase:** 6 | **Priority:** P2 | **Status:** NOT STARTED
> **Effort:** L (6-8h)
> **Assigned:** Unassigned
> **Added:** v2 — Logistics expert review ("maps exactly which screen calls which endpoint — saves hours per screen")

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. `dev_docs_v2/05-references/doc-map.md` — Where things live
3. `apps/api/src/modules/` — All controller files
4. `apps/web/app/` — All page files

## Objective

Create a comprehensive Screen-to-API contract registry at `dev_docs_v2/05-references/screen-api-registry.md`. This maps every frontend screen to the exact backend endpoints it calls, with request/response types. Eliminates the need for developers to reverse-engineer API contracts.

## File Plan

| Action | Path | What |
|--------|------|------|
| CREATE | `dev_docs_v2/05-references/screen-api-registry.md` | Screen ↔ API mapping for all MVP screens |

## Content Format

```markdown
## Orders

### Orders List (`/operations/orders`)
| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| List orders | GET | /api/v1/orders | ?page, ?limit, ?status, ?customerId, ?search | PaginatedResponse<Order> |
| Get stats | GET | /api/v1/orders/stats | — | OrderStats |

### Order Detail (`/operations/orders/[id]`)
| Action | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| Get order | GET | /api/v1/orders/:id | — | Order |
| Get stops | GET | /api/v1/orders/:id/stops | — | Stop[] |
...
```

## Acceptance Criteria

- [ ] Document created at `dev_docs_v2/05-references/screen-api-registry.md`
- [ ] All ~30 MVP screens mapped
- [ ] Each screen lists: route, all API calls, HTTP method, request params, response type
- [ ] Validated against actual controller files (not guessed)
- [ ] Linked from `dev_docs_v2/05-references/doc-map.md`
- [ ] Format: tables, easy to scan

## Dependencies

- Blocked by: Most screens should be built by Phase 6 (retrospective documentation)
- Blocks: None

## Reference

- Expert recommendation: Section 11.3 item 5
- Source: `dev_docs/06-external/76-*` and `dev_docs/06-external/77-*` (original screen-to-API docs)
