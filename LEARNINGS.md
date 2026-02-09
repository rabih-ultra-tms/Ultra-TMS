# Ultra TMS - Shared Learnings

> **What is this?** A shared knowledge base for all developers and AI agents.
> When you discover something non-obvious, add it here so the other developer doesn't have to rediscover it.
> Organized by area. Add entries with your name and date.

---

## Backend

### API Proxy Pattern (2026-02-08)
Frontend calls `/api/v1/*`, Next.js rewrites to `localhost:3001/api/v1/*` via `apps/web/next.config.js`. Never call `:3001` directly from client code.

### ValidationPipe Strips Unknown Fields (2026-02-08)
NestJS global ValidationPipe uses `whitelist: true, forbidNonWhitelisted: true`. Only fields declared in DTOs pass through. If your request data is being silently dropped, check if the field is in the DTO.

### Existing Backend Services (2026-02-08)
These services are production-ready with real business logic — do NOT rebuild:
- `LoadsService` (19KB, 656 LOC) — full CRUD + status management
- `OrdersService` (22KB, 730 LOC) — full CRUD + lifecycle
- `RateConfirmationService` — PDF generation
- Check Calls, dispatch/assignCarrier — operational logic
- Carrier module (40 endpoints), Accounting (~53 endpoints), Load Board (~25 endpoints)

### Auth Guard Pattern (2026-02-08)
Every controller needs `@UseGuards(JwtAuthGuard, RolesGuard)` at class level. Every method needs `@CurrentTenant() tenantId: string` parameter. Import guards from `../auth/guards/` and decorators from `../../common/decorators/`.

---

## Frontend

### CORS Restriction (2026-02-08)
Only `localhost:3000` and `localhost:3002` are allowed origins. If you get CORS errors from a different port, check `apps/api/src/main.ts`.

### shadcn/ui Components Already Installed (2026-02-08)
Available in `apps/web/components/ui/`: button, card, dialog, dropdown-menu, input, label, select, separator, sheet, skeleton, table, tabs, textarea, toast, tooltip, badge, avatar, checkbox, command, form, popover, scroll-area, switch, alert-dialog, collapsible.

Still need installation (COMP-008 task): radio-group, accordion, breadcrumb, resizable, toggle, toggle-group, chart, drawer, input-otp.

### Path Aliases (2026-02-08)
- `@/*` maps to web app root (not `src/` — there's no src directory)
- `@repo/ui` maps to shared UI package
- Pages go in `apps/web/app/(dashboard)/{resource}/page.tsx`

---

## Database

### Multi-Tenant Isolation (2026-02-08)
EVERY Prisma query must filter by `tenantId` AND `deletedAt: null`. Queries without tenantId leak data across tenants. This is a security requirement, not optional.

### Migration-First Fields (2026-02-08)
Every entity must include: `external_id`, `source_system`, `custom_fields`, `tenant_id`. These support data migration from legacy systems.

### Soft Deletes Everywhere (2026-02-08)
Never hard-delete records. Set `deletedAt: new Date()` instead. All queries must filter `deletedAt: null`.

---

## Common Gotchas

### TypeScript Strict Mode (2026-02-08)
`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are enabled. Array access returns `T | undefined`. Optional properties must explicitly include `undefined` in their type.

### No `window.confirm()` (2026-02-08)
Found in 7 places across carriers, load-history, quote-history, truck-types. Use the ConfirmDialog component instead (COMP-006 task to upgrade it).

### Search Debounce Missing (2026-02-08)
3 pages hammer the API on every keystroke: carriers, load-history, quote-history. Always debounce search inputs (BUG-007 task).

### JWT Token Logging (2026-02-08)
`admin/layout.tsx` has 10 `console.log` statements that expose JWT tokens. `lib/api/client.ts:59,77` stores tokens in localStorage (contradicts XSS-safe cookie policy). Both are security bugs (BUG-004, BUG-005).

---

## Patterns That Work

### Gold Standard Pages (2026-02-08)
- **Truck Types** (`/truck-types`) — 8/10 quality. Clean CRUD with inline editing. Best example of a list page.
- **Load Planner** (`/load-planner/[id]/edit`) — 1,825 LOC. AI cargo extraction, Google Maps, full quote lifecycle. Best example of a complex form.
- **Login** (`/login`) — 8/10 quality. Clean auth flow.

Study these before building new pages.

---

## How to Add Entries

When you discover something non-obvious during implementation, add it here:

```markdown
### Short Title (YYYY-MM-DD)
Description of what you discovered, where it is, and why it matters.
Added by: [your name or AI tool]
```

Then commit: `git add LEARNINGS.md && git commit -m "docs: add learning about [topic]"`
