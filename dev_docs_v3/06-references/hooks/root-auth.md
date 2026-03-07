# useAuth (root)

**File:** `apps/web/lib/hooks/use-auth.ts`
**LOC:** 283

## Exported Hooks

| Hook | Signature |
|------|-----------|
| `useCurrentUser` | `() => UseQueryResult<User>` |
| `useLogin` | `() => UseMutationResult<LoginResponse, ApiError, LoginRequest>` |
| `useVerifyMFA` | `() => UseMutationResult<LoginResponse, ApiError, MFAVerifyRequest>` |
| `useRegister` | `() => UseMutationResult<void, ApiError, RegisterRequest>` |
| `useLogout` | `() => UseMutationResult<void, unknown, void>` |
| `useForgotPassword` | `() => UseMutationResult<void, ApiError, PasswordResetRequest>` |
| `useResetPassword` | `() => UseMutationResult<void, ApiError, PasswordResetConfirm>` |
| `useChangePassword` | `() => UseMutationResult<void, ApiError, ChangePasswordRequest>` |
| `useEnableMFA` | `() => UseMutationResult<{data:{secret,qrCode}}, ApiError, "TOTP"|"SMS"|"EMAIL">` |
| `useConfirmMFA` | `() => UseMutationResult<void, ApiError, string>` |
| `useDisableMFA` | `() => UseMutationResult<void, ApiError, string>` |
| `useSessions` | `() => UseQueryResult<{data: Session[]}>` |
| `useRevokeSession` | `() => UseMutationResult<void, ApiError, string>` |
| `useRevokeAllSessions` | `() => UseMutationResult<void, ApiError, void>` |
| `useHasPermission` | `(permission: string) => boolean` |
| `useHasRole` | `(roles: string \| string[]) => boolean` |

## API Endpoints Called
| Function | Method | Endpoint | Returns |
|----------|--------|----------|---------|
| useCurrentUser | GET | /auth/me | `{ data: User }` |
| useLogin | POST | /auth/login | LoginResponse |
| useVerifyMFA | POST | /auth/mfa/verify | LoginResponse |
| useRegister | POST | /auth/register | void |
| useLogout | POST | /auth/logout | void |
| useForgotPassword | POST | /auth/forgot-password | void |
| useResetPassword | POST | /auth/reset-password | void |
| useChangePassword | POST | /auth/change-password | void |
| useEnableMFA | POST | /auth/mfa/enable | `{ data: { secret, qrCode } }` |
| useConfirmMFA | POST | /auth/mfa/confirm | void |
| useDisableMFA | POST | /auth/mfa/disable | void |
| useSessions | GET | /auth/sessions | `{ data: Session[] }` |
| useRevokeSession | DELETE | /auth/sessions/:id | void |
| useRevokeAllSessions | DELETE | /auth/sessions | void |

## Envelope Handling
- `useCurrentUser`: `apiClient.get<{ data: User }>("/auth/me")` then returns `response.data` -- correctly unwraps the envelope.
- `useSessions`: Returns raw response from `apiClient.get<{ data: Session[] }>` -- consumer must do `.data` to get the array.

## Queries (React Query)
| Query Key | Stale Time | Enabled Condition |
|-----------|-----------|-------------------|
| `["auth", "user"]` | 5 min | Always (retry: false) |
| `["auth", "sessions"]` | default | Always |

## Mutations
| Function | Endpoint | Invalidates | Toast |
|----------|----------|-------------|-------|
| useLogin | POST /auth/login | Sets user data directly | Yes |
| useVerifyMFA | POST /auth/mfa/verify | Sets user data directly | Yes |
| useRegister | POST /auth/register | None | Yes |
| useLogout | POST /auth/logout | Clears ALL queries | Yes |
| useForgotPassword | POST /auth/forgot-password | None | Yes |
| useResetPassword | POST /auth/reset-password | None | Yes |
| useChangePassword | POST /auth/change-password | None | Yes |
| useEnableMFA | POST /auth/mfa/enable | `["auth","user"]` | Error only |
| useConfirmMFA | POST /auth/mfa/confirm | `["auth","user"]` | Yes |
| useDisableMFA | POST /auth/mfa/disable | `["auth","user"]` | Yes |
| useRevokeSession | DELETE /auth/sessions/:id | `["auth","sessions"]` | Yes |
| useRevokeAllSessions | DELETE /auth/sessions | `["auth","sessions"]` | Yes |

## Quality Assessment
- **Score:** 8/10
- **Anti-patterns:**
  - `useHasRole` uses multiple `as` casts for fallback role structures -- fragile
  - Uses `setAuthTokens`/`clearAuthTokens` (localStorage) -- known P0-001 XSS risk
  - `useSessions` does not unwrap `.data` like `useCurrentUser` does (inconsistent)
- **Dependencies:** `apiClient`, `setAuthTokens`/`clearAuthTokens` from `@/lib/api/client`, `AUTH_CONFIG`, `sonner`
