# useRateConfirmation (TMS)

**File:** `apps/web/lib/hooks/tms/use-rate-confirmation.ts`
**LOC:** 121

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useGenerateRateConfirmation` | `() => UseMutationResult<Blob, Error, string>` |
| `useDownloadRateConfirmation` | `() => UseMutationResult<void, Error, string>` |
| `useSendRateConfirmation` | `() => UseMutationResult<void, Error, { loadId: string; email: string }>` |

## API Endpoints Called

| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useGenerateRateConfirmation | GET | /loads/:loadId/rate-confirmation/pdf | Blob (PDF) |
| useDownloadRateConfirmation | GET | /loads/:loadId/rate-confirmation/pdf | Blob (triggers download) |
| useSendRateConfirmation | POST | /loads/:loadId/rate-confirmation/send | void |

## Envelope Handling

**ANTI-PATTERN:** Uses raw `fetch()` instead of `apiClient` for PDF generation. Manually constructs authorization header from stored token. This bypasses the apiClient's interceptors and error handling.

## Queries (React Query)

None -- all hooks are mutations (PDF generation is treated as a side effect).

## Mutations

| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useGenerateRateConfirmation | GET /loads/:loadId/rate-confirmation/pdf | None | No |
| useDownloadRateConfirmation | GET /loads/:loadId/rate-confirmation/pdf | None | Yes (on error) |
| useSendRateConfirmation | POST /loads/:loadId/rate-confirmation/send | None | Yes |

## Quality Assessment

- **Score:** 5/10
- **Anti-patterns:**
  - **ANTI-PATTERN:** Uses raw `fetch()` with manual `Authorization` header instead of `apiClient` -- bypasses interceptors, error handling, and token refresh
  - **ANTI-PATTERN:** Reads auth token directly from localStorage -- ties to P0-001 XSS vulnerability
  - PDF download triggers `window.open()` or creates blob URL manually -- no cleanup of object URLs
  - GET request wrapped in `useMutation` instead of `useQuery` with `enabled: false`
- **Dependencies:** Raw `fetch`, `localStorage`, `sonner`
