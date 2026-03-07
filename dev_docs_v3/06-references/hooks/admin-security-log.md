# useSecurityLog (admin)

**File:** `apps/web/lib/hooks/admin/use-security-log.ts`
**LOC:** 53

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useSessionLogs` | `() => UseQueryResult<{ data: SessionLog[] }>` |
| `useRevokeSession` | `() => UseMutationResult<void, Error, string>` |
| `useRevokeAllSessions` | `() => UseMutationResult<void, Error, void>` |

## API Endpoints Called
| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useSessionLogs | GET | /sessions | `{ data: SessionLog[] }` |
| useRevokeSession | DELETE | /sessions/:id | void |
| useRevokeAllSessions | POST | /auth/logout-all | void |

## Envelope Handling
Returns raw apiClient response. Consumer accesses `.data` to get session array.

## Queries (React Query)
| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["admin", "security-log"]` | default | Always |

## Mutations
| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useRevokeSession | DELETE /sessions/:id | `["admin", "security-log"]` | Yes |
| useRevokeAllSessions | POST /auth/logout-all | **None (BUG)** | Yes |

## Quality Assessment
- **Score:** 6/10
- **Anti-patterns:**
  - **BUG:** `useRevokeAllSessions` does NOT invalidate the session list query after revoking -- stale data remains
  - Duplicates `useRevokeSession` hook name from `use-auth.ts` (different endpoints)
  - `SessionLog` interface defined inline rather than shared
- **Dependencies:** `apiClient`, `sonner`
