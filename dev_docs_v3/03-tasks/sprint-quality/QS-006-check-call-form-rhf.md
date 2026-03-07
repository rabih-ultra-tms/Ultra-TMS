# QS-006: Check Call Form RHF Refactor

**Priority:** P2
**Effort:** M (2-4 hours)
**Status:** planned
**Assigned:** Codex

---

## Context Header (Read These First)

1. `apps/web/app/(dashboard)/operations/check-calls/page.tsx` — Current form (raw state, not RHF)
2. `apps/web/components/tms/forms/FormField.tsx` — RHF FormField component to use
3. `apps/api/src/modules/operations/check-calls.controller.ts` — `POST /checkcalls` endpoint
4. `dev_docs_v3/05-audit/recurring-patterns.md` — Pattern 2 (stub buttons) + Pattern 8 (missing states)

---

## Objective

Refactor the check call form from raw React state management to React Hook Form (RHF) + Zod validation. This fixes inconsistent validation behavior and makes the form match the codebase standard.

---

## File Plan

| File | Change |
|------|--------|
| `apps/web/app/(dashboard)/operations/check-calls/page.tsx` | Replace useState form with RHF |
| `apps/web/components/tms/tms/CheckCallForm.tsx` | Create reusable check call form component |

---

## Current State

The form likely uses raw `useState` for each field:
```tsx
const [location, setLocation] = useState('');
const [status, setStatus] = useState('');
const [notes, setNotes] = useState('');
// No validation schema
// Submit handler may not validate before API call
```

---

## Target State

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  loadId: z.string().min(1, 'Load is required'),
  location: z.string().min(2, 'Location is required'),
  status: z.enum(['ON_TIME', 'DELAYED', 'EARLY', 'AT_STOP']),
  notes: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});

const form = useForm({ resolver: zodResolver(schema) });

const onSubmit = form.handleSubmit(async (data) => {
  await createCheckCall(data);
  form.reset();
  queryClient.invalidateQueries(['checkcalls']);
});
```

---

## Acceptance Criteria

1. Form uses `useForm` from react-hook-form with Zod resolver
2. Validation runs before API call — empty required fields show inline error messages
3. Submit button is disabled while submitting (no double-submit)
4. Form resets to empty after successful submission
5. Error from API (e.g., invalid loadId) shows in a toast, not alert()
6. `pnpm check-types` passes with 0 errors
7. Form fields use `FormField` component from `components/tms/forms/`

---

## Dependencies

- **Blocks:** Nothing
- **Blocked by:** None
