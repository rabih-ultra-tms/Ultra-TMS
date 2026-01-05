# 61 - Development Standards Overview

**Master Guide for Building the 3PL Platform Without Errors**

This document is the master index for all development standards. Following these standards prevents the most common issues: forgotten pages, API endpoint mismatches, database inconsistencies, dead UI elements, and testing gaps.

---

## âš ï¸ CLAUDE CODE: READ THIS FIRST

**Before implementing ANY feature, Claude Code MUST:**

1. **Read the AI Development Playbook (doc 84)** - Understand the task pattern and decision tree
2. **Read the Screen-API Contract Registry (doc 72)** - Find the screen(s) being built and understand ALL required API endpoints
3. **Read the Entity Data Dictionary (doc 86)** - Know every field, validation, and constraint
4. **Read the Business Rules Reference (doc 87)** - Know what logic to implement
5. **Read the Pre-Feature Checklist (doc 70)** - Complete ALL checklist items before writing code
6. **Read the relevant standards document** - API (62), Database (63), Frontend (64), UI (65)

**After implementing ANY feature, Claude Code MUST:**

1. Update the Screen-API Contract Registry status
2. Run the verification checklist from doc 70
3. Ensure NO dead UI elements (buttons, links, dropdowns without actions)

---

## The 5 Golden Rules

### Rule 1: Every Interactive Element MUST Work

**No exceptions.** Every button, link, dropdown item, and form must trigger an action.

```typescript
// âœ… ALLOWED
<Button onClick={() => handleAction()}>Action</Button>
<Button asChild><Link href="/path">Navigate</Link></Button>
<DropdownMenuItem onClick={() => edit()}>Edit</DropdownMenuItem>

// âŒ FORBIDDEN - NEVER COMMIT THESE
<Button>Does Nothing</Button>
<Button onClick={() => {}}>Empty Handler</Button>
<Button onClick={() => { /* TODO */ }}>TODO Handler</Button>
<DropdownMenuItem>Edit</DropdownMenuItem>
```

### Rule 2: API Contracts Before Code

Define the API request/response format BEFORE building:

- Frontend developer knows what to expect
- Backend developer knows what to return
- Contract is documented in Screen-API Registry (doc 72)

### Rule 3: Screen â†’ API â†’ Database Traceability

```
Screen (324 total)
    â†“ requires
API Endpoints
    â†“ uses
Database Tables
    â†“ defined in
Prisma Schema
```

Nothing exists in isolation. Every screen maps to APIs, every API maps to database operations.

### Rule 4: Type Safety is Mandatory

- No `any` types without documented exception
- Types must match actual runtime data
- API response types must match what's actually returned

### Rule 5: Verify Before Shipping

No feature is "done" until:

- [ ] All buttons/links work
- [ ] All API calls succeed
- [ ] Loading/error/empty states handled
- [ ] Console has no errors
- [ ] Contract registry updated

---

## Document Index

### Core Standards (Read Before Building)

| #   | Document                                                         | Purpose                     | Read Before       |
| --- | ---------------------------------------------------------------- | --------------------------- | ----------------- |
| 62  | [API Design Standards](./62-api-design-standards.md)             | NestJS REST patterns, DTOs  | ANY endpoint      |
| 63  | [Database Design Standards](./63-database-design-standards.md)   | Prisma patterns, migrations | ANY schema change |
| 64  | [Frontend Architecture](./64-frontend-architecture-standards.md) | React page patterns         | ANY screen        |
| 65  | [UI Component Standards](./65-ui-component-standards.md)         | THE GOLDEN RULE             | ANY component     |
| 66  | [Type Safety Standards](./66-type-safety-standards.md)           | TypeScript patterns         | ALL code          |
| 67  | [Auth & Authorization](./67-auth-authorization-standards.md)     | Multi-tenant, RBAC          | Auth features     |
| 68  | [Testing Strategy](./68-testing-strategy.md)                     | NestJS + React tests        | ANY tests         |

### Quality Assurance (Read Before Committing)

| #   | Document                                               | Purpose          | Use When             |
| --- | ------------------------------------------------------ | ---------------- | -------------------- |
| 69  | [Common Pitfalls](./69-common-pitfalls-prevention.md)  | What NOT to do   | Code review          |
| 70  | [Pre-Feature Checklist](./70-pre-feature-checklist.md) | Before building  | Starting ANY feature |
| 71  | [Pre-Release Checklist](./71-pre-release-checklist.md) | Before deploying | Each release         |

### Contract Registry (THE KEY DOCUMENT)

| #    | Document                                                                          | Purpose                               | Use When             |
| ---- | --------------------------------------------------------------------------------- | ------------------------------------- | -------------------- |
| 72   | [Screen-API Contract Registry](./72-screen-api-contract-registry.md)              | Maps ALL 324 screens to APIs          | Building ANY feature |
| 72-2 | [Screen-API Contract Registry Part 2](./72-screen-api-contract-registry-part2.md) | Operations, Platform, Extended, Admin | Building ANY feature |

### Platform Features (Read for Specific Features)

| #   | Document                                                                       | Purpose                          | Read Before              |
| --- | ------------------------------------------------------------------------------ | -------------------------------- | ------------------------ |
| 73  | [i18n Standards](./73-i18n-standards.md)                                       | Multi-language, Spanish priority | ANY user-facing text     |
| 74  | [Real-Time & WebSocket Standards](./74-real-time-websocket-standards.md)       | Socket.io, live updates          | Tracking, dispatch board |
| 75  | [File Upload & Storage Standards](./75-file-upload-storage-standards.md)       | S3, documents, images            | PODs, BOLs, uploads      |
| 76  | [Error Handling & Logging Standards](./76-error-handling-logging-standards.md) | Structured logging, monitoring   | ALL backend code         |
| 77  | [Git Workflow Standards](./77-git-workflow-standards.md)                       | Branches, commits, PRs           | ALL commits              |
| 78  | [Accessibility Standards](./78-accessibility-standards.md)                     | WCAG 2.1 AA compliance           | ALL UI                   |

### Advanced Patterns

| #   | Document                                                                   | Purpose                       | Read Before        |
| --- | -------------------------------------------------------------------------- | ----------------------------- | ------------------ |
| 79  | [State Management Standards](./79-state-management-standards.md)           | React Query, Context, caching | Complex state      |
| 80  | [Performance & Caching Standards](./80-performance-caching-standards.md)   | Redis, N+1, optimization      | Performance issues |
| 81  | [Background Jobs Standards](./81-background-jobs-standards.md)             | Bull queues, async tasks      | Async processing   |
| 82  | [Code Generation Templates](./82-code-generation-templates.md)             | Scaffolding, CRUD generators  | New entities       |
| 83  | [Environment & Secrets Management](./83-environment-secrets-management.md) | Config, feature flags         | Deployment         |

### AI-Assisted Development (Critical for Claude Code)

| #   | Document                                                     | Purpose                            | Read Before           |
| --- | ------------------------------------------------------------ | ---------------------------------- | --------------------- |
| 84  | [AI Development Playbook](./84-ai-development-playbook.md)   | Prompting patterns, decision trees | EVERY task            |
| 85  | [Seed Data & Test Fixtures](./85-seed-data-fixtures.md)      | Test data, factories               | Testing any feature   |
| 86  | [Entity Data Dictionary](./86-entity-data-dictionary.md)     | Field specs, validations           | Building ANY form/API |
| 87  | [Business Rules Reference](./87-business-rules-reference.md) | Validation logic, state machines   | ANY business logic    |

---

## Standard Patterns Quick Reference

### API Response Format (ALWAYS Use)

```typescript
// Single item
{
  data: T,
  message?: string
}

// List with pagination
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Error
{
  error: string,
  code: string,
  details?: Record<string, unknown>
}
```

### NestJS Controller Pattern

```typescript
@Controller('api/v1/carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CarrierController {
  @Get()
  @Roles('ADMIN', 'DISPATCH')
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.carrierService.findAll(query);
    return {
      data,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }
}
```

### React Page Pattern

```typescript
'use client';

export default function CarriersPage() {
  const [data, setData] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract for reuse after mutations
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/carriers');
      if (!res.ok) throw new Error('Failed to fetch');
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ALWAYS handle all states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (data.length === 0) return <EmptyState onCreate={() => router.push('/carriers/new')} />;

  return <CarrierTable data={data} onRefresh={fetchData} />;
}
```

### Button Pattern Checklist

| Element          | Required                    | Example                         |
| ---------------- | --------------------------- | ------------------------------- |
| Button           | onClick OR Link wrapper     | `onClick={() => action()}`      |
| DropdownMenuItem | onClick OR asChild+Link     | `onClick={() => edit()}`        |
| Form             | onSubmit                    | `onSubmit={handleSubmit}`       |
| Link             | Valid href to existing page | `/carriers` not `/carrier-list` |
| IconButton       | onClick                     | `onClick={() => action()}`      |

---

## Development Workflow

### Phase 1: Before Coding

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 1. Read Pre-Feature Checklist (doc 70)                      â”‚
â”‚ 2. Find screen(s) in Screen-API Registry (doc 72)           â”‚
â”‚ 3. Verify API contracts are defined                         â”‚
â”‚ 4. Verify database schema exists for required tables        â”‚
â”‚ 5. If contracts missing, define them FIRST                  â”‚
â”‚ 6. Get approval on contracts before coding                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Phase 2: Building Backend

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 1. Create/update Prisma schema if needed                    â”‚
â”‚ 2. Run migration: npx prisma migrate dev --name desc        â”‚
â”‚ 3. Generate client: npx prisma generate                     â”‚
â”‚ 4. Create DTOs matching the contract                        â”‚
â”‚ 5. Implement service with all CRUD operations               â”‚
â”‚ 6. Implement controller with proper guards                  â”‚
â”‚ 7. Add auth check FIRST in every endpoint                   â”‚
â”‚ 8. Return data in STANDARD format                           â”‚
â”‚ 9. Write unit tests                                         â”‚
â”‚ 10. Update seed script                                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Phase 3: Building Frontend

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 1. Create page in correct portal folder                     â”‚
â”‚ 2. Add 'use client' if using hooks                          â”‚
â”‚ 3. Define TypeScript interfaces matching API response       â”‚
â”‚ 4. Implement fetchData with useCallback                     â”‚
â”‚ 5. Handle loading state with spinner                        â”‚
â”‚ 6. Handle error state with retry button                     â”‚
â”‚ 7. Handle empty state with helpful message                  â”‚
â”‚ 8. Connect ALL buttons to actions                           â”‚
â”‚ 9. Connect ALL dropdown items to actions                    â”‚
â”‚ 10. Verify ALL links go to existing pages                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Phase 4: Verification

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 1. Click every button - verify action occurs                â”‚
â”‚ 2. Click every dropdown item - verify action occurs         â”‚
â”‚ 3. Click every link - verify correct destination            â”‚
â”‚ 4. Check browser console - must be clean                    â”‚
â”‚ 5. Test with different user roles                           â”‚
â”‚ 6. Verify API responses match contract                      â”‚
â”‚ 7. Update Screen-API Registry status to âœ…                  â”‚
â”‚ 8. Mark feature complete ONLY if all checks pass            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Audit Commands

Run these regularly to catch issues:

```bash
# Find buttons without onClick
grep -rn "<Button" --include="*.tsx" | grep -v "onClick\|asChild\|type=\"submit\""

# Find empty dropdown items
grep -rn "DropdownMenuItem>" --include="*.tsx" | grep -v "onClick\|asChild"

# Find forms without onSubmit
grep -rn "<form" --include="*.tsx" | grep -v "onSubmit"

# Find TODO comments (should be zero before release)
grep -rn "TODO" --include="*.ts" --include="*.tsx"

# Find console.log (clean up before release)
grep -rn "console.log" --include="*.ts" --include="*.tsx"

# Find 'any' type usage
grep -rn ": any" --include="*.ts" --include="*.tsx"

# Count pages vs API routes
find apps/web/app -name "page.tsx" | wc -l
find apps/api/src -name "*.controller.ts" | wc -l

# TypeScript check
npx tsc --noEmit
```

---

## Tech Stack Reference

| Layer      | Technology            | Documentation      |
| ---------- | --------------------- | ------------------ |
| Backend    | NestJS                | nestjs.com         |
| ORM        | Prisma                | prisma.io/docs     |
| Database   | PostgreSQL            | -                  |
| Cache      | Redis                 | -                  |
| Frontend   | React 18              | react.dev          |
| Styling    | TailwindCSS           | tailwindcss.com    |
| Components | shadcn/ui             | ui.shadcn.com      |
| Forms      | React Hook Form + Zod | -                  |
| State      | React Query           | tanstack.com/query |

---

## File Structure Reference

```
apps/
â”œâ”€â”€ api/                          # NestJS Backend
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ modules/              # Feature modules
â”‚       â”‚   â”œâ”€â”€ auth/
â”‚       â”‚   â”‚   â”œâ”€â”€ auth.controller.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ auth.service.ts
â”‚       â”‚   â”‚   â”œâ”€â”€ auth.module.ts
â”‚       â”‚   â”‚   â””â”€â”€ dto/
â”‚       â”‚   â”œâ”€â”€ carrier/
â”‚       â”‚   â”œâ”€â”€ tms/
â”‚       â”‚   â””â”€â”€ ...
â”‚       â”œâ”€â”€ common/               # Shared utilities
â”‚       â”‚   â”œâ”€â”€ guards/
â”‚       â”‚   â”œâ”€â”€ decorators/
â”‚       â”‚   â”œâ”€â”€ filters/
â”‚       â”‚   â””â”€â”€ dto/
â”‚       â””â”€â”€ prisma/
â”‚           â””â”€â”€ prisma.service.ts
â”‚
â”œâ”€â”€ web/                          # React Frontend
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ (auth)/               # Public auth pages
â”‚       â”‚   â”œâ”€â”€ login/
â”‚       â”‚   â””â”€â”€ register/
â”‚       â”œâ”€â”€ (dashboard)/          # Protected pages
â”‚       â”‚   â”œâ”€â”€ admin/
â”‚       â”‚   â”œâ”€â”€ dispatch/
â”‚       â”‚   â”œâ”€â”€ operations/
â”‚       â”‚   â””â”€â”€ ...
â”‚       â””â”€â”€ api/                  # API routes (if using Next.js)
â”‚
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ shared-types/             # Shared TypeScript types
â”‚   â”œâ”€â”€ ui/                       # Shared UI components
â”‚   â””â”€â”€ utils/                    # Shared utilities
â”‚
â””â”€â”€ prisma/
    â”œâ”€â”€ schema.prisma
    â”œâ”€â”€ seed.ts
    â””â”€â”€ migrations/
```

---

## Summary Statistics

| Metric                 | Count |
| ---------------------- | ----- |
| Total Screens          | 324   |
| Total Services         | 34    |
| User Roles             | 8     |
| Phase A MVP Weeks      | 78    |
| Master Checklist Tasks | 373   |

---

## Navigation

- **Next:** [API Design Standards](./62-api-design-standards.md)
- **Index:** [Documentation Home](./59-documentation-index.md)
