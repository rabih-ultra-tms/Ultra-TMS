# TEST-001: Unit Tests for Auth Hooks (use-auth.ts)

**Priority:** P0
**Service:** Auth
**Scope:** Unit test coverage for all auth hooks in `apps/web/lib/hooks/use-auth.ts`

## Current State
The `use-auth.ts` file exports 14 hooks/functions:
- `useCurrentUser` -- GET /auth/me query
- `useLogin` -- POST /auth/login mutation with MFA redirect
- `useVerifyMFA` -- POST /auth/mfa/verify mutation
- `useRegister` -- POST /auth/register mutation
- `useLogout` -- POST /auth/logout mutation (clears QueryClient + tokens)
- `useForgotPassword` -- POST /auth/forgot-password mutation
- `useResetPassword` -- POST /auth/reset-password mutation
- `useChangePassword` -- POST /auth/change-password mutation
- `useEnableMFA` / `useConfirmMFA` / `useDisableMFA` -- MFA lifecycle
- `useSessions` / `useRevokeSession` / `useRevokeAllSessions` -- session management
- `useHasPermission` / `useHasRole` -- permission/role checks

No unit tests currently exist for these hooks. Project-wide test coverage is 8.7%.

## Requirements
- Write unit tests for all 14 exported hooks
- Mock `apiClient`, `useRouter`, `useQueryClient`, `toast`
- Test success and error paths for each mutation
- Test MFA redirect flow in `useLogin`
- Test role normalization logic in `useHasRole` (dash-to-underscore, case insensitive)
- Test `useHasPermission` with various user states (null user, empty permissions, matching)
- Verify `clearAuthTokens` is called on logout (both success and error)
- Verify `queryClient.clear()` is called on logout

## Acceptance Criteria
- [ ] All 14 hooks have at least one test
- [ ] Mutation hooks test both `onSuccess` and `onError` callbacks
- [ ] `useLogin` tests MFA flow (requiresMfa: true) and direct login flow
- [ ] `useHasRole` tests normalization (e.g., "admin" matches "ADMIN", "super-admin" matches "SUPER_ADMIN")
- [ ] `useLogout` tests that tokens and cache are cleared even on error
- [ ] Tests pass in CI (`pnpm --filter web test`)
- [ ] No mocking of internal React Query behavior -- use `renderHook` with `QueryClientProvider`

## Dependencies
- Testing infrastructure (Jest 30 + React Testing Library) already configured
- SWC resolver for `@/` aliases already set up in jest config

## Estimated Effort
L
