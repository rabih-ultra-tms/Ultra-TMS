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

## UI Design Process

### The Process That Produces Good Design (2026-02-09)

Discovered through 22 HTML prototype iterations for the Dispatch Board. This 4-phase process consistently produced results the user approved. Follow it for any new screen or major UI redesign.

**Phase 1: Diverge Wide (5-7 variants)**
Generate multiple completely different layout concepts. Use the superdesign MCP tool or build quick HTML prototypes manually. The goal is quantity — explore card layouts, split panels, tables, dense views, minimal views. User reviews all in browser, says what they like/dislike about each. No code commitment yet.

**Phase 2: Refine Directions (3-5 variants)**
Take the best elements from Phase 1 and generate focused iterations. Each variant explores one promising direction deeper. User narrows down which direction is winning.

**Phase 3: Explore Within the Winner (4-6 variants)**
Once the general direction is clear, generate variations within that direction. Small differences — column layouts, drawer vs split panel, dark theme options. This is where the details get refined.

**Phase 4: Cherry-Pick & Combine (1 final)**
Don't pick a single winner. Instead, cherry-pick the best parts from different prototypes: layout from one, drawer from another, theme from a third. Write a detailed spec with exact values (colors, font sizes, spacing) before building the final version. Then build it, get feedback, fix in one round.

### Technical Principles for Prototyping (2026-02-09)

- **Prototype in pure HTML, not React.** No build tools, no API wiring. Double-click the file, see the result. F5 to refresh. This zero-friction loop is why 22 iterations felt manageable.
- **CSS variables over Tailwind for prototypes.** Full control over theming. Light/dark toggle = swap one class. No fighting with utility class overrides.
- **Realistic mock data matters.** Use real company names, real city pairs, realistic dollar amounts. Fake data like "Company A" hides overflow bugs and makes the prototype feel toy-like. We caught customer name overflow only because we used "Midwest Manufacturing Co."
- **Self-contained = portable.** Everything in one HTML file (CSS + JS + mock data). No dependencies beyond Google Fonts CDN. Anyone can open it, any browser, any machine.
- **Keep prototypes outside the git repo.** The `superdesign/` folder is deliberately separate from `Ultra-TMS/`. Prototypes are disposable experiments, not production code.

### Design Judgment Principles (2026-02-09)

- **Earlier iterations can beat later ones in specific ways.** V3's header/filter styling was preferred over V5's initial take. Never assume newer = better for every detail. Be willing to go back.
- **Subtlety wins in dense UIs.** Heavy red backgrounds for at-risk rows were technically correct but visually overwhelming. A subtle tint + thin left border communicated the same information without screaming.
- **Concrete references beat verbal descriptions.** "VS Code Dark Modern" and "Stitch Premium" are things you can look at and compare against. "Make it dark and professional" leads to generic output.
- **Space is a design resource.** Merging 7 status chips into 1 dropdown freed space for 6 property filters. Information density went up while visual clutter went down.
- **Overlay drawers beat split panels for tables.** An overlay preserves the table's full width. A permanent split panel crushes the table when you have 13+ columns.

### Process Principles (2026-02-09)

- **Specific feedback compounds, vague feedback stalls.** "Customer name overflowing into next column" gets fixed in 5 minutes. "Make it look better" leads to guessing. Always push for specific, actionable feedback.
- **The gallery page is underrated.** A single HTML page showing all iterations side by side makes comparison instant. Without it, you're opening files one at a time and trying to remember what the last one looked like.
- **Maintain a protect list.** Declare which pages/components are already good and off-limits. This prevents the temptation to "improve" working code and keeps focus on what actually needs work.
- **Write the spec before the final build.** Once parts are chosen, document exact colors, font sizes, column widths, feature list. No ambiguity during implementation means fewer revision rounds.
- **Write code directly for the final build, don't delegate to agents.** Delegating JS writing to sub-agents trades quality for speed. For the final prototype, every line should be intentional.

Added by: Claude Code (2026-02-09)

---

## How to Add Entries

When you discover something non-obvious during implementation, add it here:

```markdown
### Short Title (YYYY-MM-DD)
Description of what you discovered, where it is, and why it matters.
Added by: [your name or AI tool]
```

Then commit: `git add LEARNINGS.md && git commit -m "docs: add learning about [topic]"`
