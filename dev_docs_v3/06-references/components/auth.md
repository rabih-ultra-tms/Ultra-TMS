# Auth Components

**Path:** `apps/web/components/auth/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| AdminGuard | `admin-guard.tsx` | 44 | Route guard checking admin role before rendering children |
| AuthLayout | `auth-layout.tsx` | 22 | Layout wrapper for auth pages (centered card with branding) |
| ForgotPasswordForm | `forgot-password-form.tsx` | 95 | Email input form for password reset requests |
| LoginForm | `login-form.tsx` | 113 | Email/password login form with validation |
| LoginForm (test) | `login-form.test.tsx` | 27 | Unit tests for LoginForm |
| MfaInput | `mfa-input.tsx` | 20 | 6-digit OTP input for MFA verification |
| MfaSetupDialog | `mfa-setup-dialog.tsx` | 45 | Dialog for initial MFA setup with QR code |
| RegisterForm | `register-form.tsx` | 170 | Registration form with name, email, password, confirm |
| ResetPasswordForm | `reset-password-form.tsx` | 112 | New password form (from reset email link) |
| SocialLoginButtons | `social-login-buttons.tsx` | 10 | Google/Microsoft OAuth login buttons |

**Total:** 10 files, ~658 LOC

## Usage Patterns

Used in `(auth)/` route group (public pages):
- `/login` - `LoginForm` (PROTECT LIST - 8/10 quality)
- `/register` - `RegisterForm`
- `/forgot-password` - `ForgotPasswordForm`
- `/reset-password` - `ResetPasswordForm`
- `/verify-mfa` - `MfaInput`
- `AdminGuard` wraps admin-only routes in `(dashboard)/admin/`

## Dependencies

- `@/components/ui/` (Input, Button, Card, Dialog)
- `@/lib/api/client.ts` for auth API calls
- `@/lib/hooks/auth/` for auth state management
- React Hook Form + Zod validation on all form components
- `next/navigation` for redirects after auth
