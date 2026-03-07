# Prompt Engineering for Ultra TMS

> AI Dev Guide | How to prompt AI tools effectively for this codebase

---

## The Golden Formula

```
[TASK TYPE] + [ENTITY/SCREEN] + [CONTEXT DOCS] + [SPECIFIC REQUIREMENTS]
```

## Task Type Prefixes

| Prefix | Meaning |
|--------|---------|
| BUILD | Create a new screen, component, or feature from scratch |
| FIX | Diagnose and fix a specific bug |
| REFACTOR | Improve existing code without changing behavior |
| WIRE | Connect existing backend to existing frontend |
| TEST | Write tests for existing code |
| AUDIT | Review code quality and find issues |

## Context Loading Order

Always load these files BEFORE coding:

### For any task:
1. `dev_docs_v3/01-services/p0-mvp/{service}.md` -- Service hub (source of truth)
2. `CLAUDE.md` -- Codebase conventions and gotchas

### For building screens:
3. Design spec from `dev_docs/12-Rabih-design-Process/{service}/{screen}.md`
4. Existing hooks in `apps/web/lib/hooks/{domain}/`

### For backend work:
3. `apps/api/prisma/schema.prisma` (relevant model section)
4. Existing controller + service files

### Maximum context budget: 6 files before starting to code.

## Effective Prompt Examples

### Building a Screen

```
BUILD the Invoices List screen.

CONTEXT:
- Service hub: dev_docs_v3/01-services/p0-mvp/07-accounting.md (Section 3: Screens)
- Design spec: dev_docs/12-Rabih-design-Process/06-accounting/01-invoices-list.md
- Hooks: apps/web/lib/hooks/accounting/use-invoices.ts (exists)
- API: GET /api/v1/accounting/invoices (Production, paginated)

REQUIREMENTS:
- Route: /accounting/invoices
- Columns: Invoice#, Customer, Amount, Status, Due Date, Actions
- Filters: Status dropdown, date range, search by invoice#
- Actions: View, Send, Record Payment
- Must handle loading, error, empty states
- Use design tokens (no hardcoded colors)
- No window.confirm -- use useConfirm hook
```

### Fixing a Bug

```
FIX: Delete buttons missing on Contacts table.

BUG: BUG-009 from dev_docs_v3/01-services/p0-mvp/03-crm.md
FILE: apps/web/components/crm/contacts/contacts-table.tsx
HOOK: useDeleteContact exists in apps/web/lib/hooks/crm/use-contacts.ts (not wired)
API: DELETE /api/v1/crm/contacts/:id (Production, works)

EXPECTED: Each row has a delete button. Click shows confirm dialog, then calls API.
ACTUAL: No delete button in the table or detail page.
```

### Writing Tests

```
TEST: Write component tests for CarriersTable.

FILE: apps/web/components/operations/carriers/carriers-table.tsx
HOOK: useCarriers from apps/web/lib/hooks/operations/use-carriers.ts
API RESPONSE: { data: Carrier[], pagination: { page, limit, total, totalPages } }

TEST CASES:
1. Renders loading skeleton while fetching
2. Renders carrier rows after data loads
3. Displays correct status badges
4. Pagination controls work
5. Search filters the list
```

## Prompt Anti-Patterns to Avoid

| Bad Prompt | Why It's Bad | Better Prompt |
|------------|-------------|---------------|
| "Build the accounting page" | Too vague, which page? | "BUILD the Invoices List at /accounting/invoices" |
| "Fix the carrier bug" | Which bug? 12 are listed | "FIX BUG-001: Carrier Detail 404" |
| "Make it look better" | No specific criteria | "Replace hardcoded colors with design tokens per CLAUDE.md" |
| "Add a new feature" | No context | "BUILD: Add search debounce to Carriers list (BUG-007)" |

## Context Hierarchy

When instructions conflict, follow this priority:

1. **CLAUDE.md** -- Codebase conventions (highest priority)
2. **Service hub** (`dev_docs_v3/01-services/p0-mvp/`) -- Source of truth
3. **Design specs** (`dev_docs/12-Rabih-design-Process/`) -- UI specifications
4. **AI dev docs** (`dev_docs/11-ai-dev/`) -- General patterns
5. **Code comments** -- In-file documentation (lowest priority)
