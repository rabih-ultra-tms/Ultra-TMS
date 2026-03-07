# useAutoEmail (communication)

**File:** `apps/web/lib/hooks/communication/use-auto-email.ts`
**LOC:** 259

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useAutoEmailTriggers` | `() => UseQueryResult<AutoEmailTrigger[]>` |
| `useAutoEmailTrigger` | `(id: string) => UseQueryResult<{ data: AutoEmailTrigger }>` |
| `useCreateAutoEmailTrigger` | `() => UseMutationResult<{ data: AutoEmailTrigger }, Error, Partial<AutoEmailTrigger>>` |
| `useUpdateAutoEmailTrigger` | `() => UseMutationResult<{ data: AutoEmailTrigger }, Error, { id: string; data: Partial<AutoEmailTrigger> }>` |
| `useDeleteAutoEmailTrigger` | `() => UseMutationResult<void, Error, string>` |
| `useEnableAutoEmailTrigger` | `() => UseMutationResult<void, Error, string>` |
| `useDisableAutoEmailTrigger` | `() => UseMutationResult<void, Error, string>` |
| `useTestAutoEmailTrigger` | `() => UseMutationResult<void, Error, string>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useAutoEmailTriggers | GET | /communication/auto-email | AutoEmailTrigger[] |
| useAutoEmailTrigger | GET | /communication/auto-email/:id | `{ data: AutoEmailTrigger }` |
| useCreateAutoEmailTrigger | POST | /communication/auto-email | `{ data: AutoEmailTrigger }` |
| useUpdateAutoEmailTrigger | PATCH | /communication/auto-email/:id | `{ data: AutoEmailTrigger }` |
| useDeleteAutoEmailTrigger | DELETE | /communication/auto-email/:id | void |
| useEnableAutoEmailTrigger | POST | /communication/auto-email/:id/enable | void |
| useDisableAutoEmailTrigger | POST | /communication/auto-email/:id/disable | void |
| useTestAutoEmailTrigger | POST | /communication/auto-email/:id/test | void |

## Envelope Handling

List query returns raw array (not paginated). Detail uses standard `{ data: T }` envelope. Contains a `TRIGGER_CONFIG_MAP` that maps trigger event types to their configuration schema.

## Queries (React Query)

| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["communication", "auto-email", "list"]` | default | Always |
| `["communication", "auto-email", "detail", id]` | default | `!!id` |

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useCreateAutoEmailTrigger | POST /communication/auto-email | list | Yes |
| useUpdateAutoEmailTrigger | PATCH .../auto-email/:id | detail + list | Yes |
| useDeleteAutoEmailTrigger | DELETE .../auto-email/:id | list | Yes |
| useEnableAutoEmailTrigger | POST .../enable | detail + list | Yes |
| useDisableAutoEmailTrigger | POST .../disable | detail + list | Yes |
| useTestAutoEmailTrigger | POST .../test | None | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - 259 LOC -- large file for email automation CRUD
  - `TRIGGER_CONFIG_MAP` hardcoded in hook file -- should be shared configuration
  - List query returns unpaginated array -- could grow large with many triggers
  - No optimistic updates for enable/disable toggle
- **Dependencies:** `apiClient`, `sonner`, `TRIGGER_CONFIG_MAP` (inline config)
