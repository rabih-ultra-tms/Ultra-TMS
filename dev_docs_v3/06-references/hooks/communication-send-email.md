# useSendEmail (communication)

**File:** `apps/web/lib/hooks/communication/use-send-email.ts`
**LOC:** 60

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useSendEmail` | `() => UseMutationResult<void, Error, SendEmailInput>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useSendEmail | POST | /communication/send-email | void |

## Envelope Handling

Sends `SendEmailInput` (to, subject, body, attachments) and returns void.

## Queries (React Query)

None -- mutation-only hook.

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useSendEmail | POST /communication/send-email | email-logs list | Yes |

## Quality Assessment

- **Score:** 7/10
- **Anti-patterns:**
  - No email validation on the client side before sending
  - Invalidates email-logs list after send -- good pattern
  - No attachment size validation
- **Dependencies:** `apiClient`, `sonner`
