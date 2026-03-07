# Profile Components

**Path:** `apps/web/components/profile/`

## Files

| Component | File | LOC | Description |
|-----------|------|-----|-------------|
| ActiveSessions | `active-sessions.tsx` | 14 | List of active login sessions with revoke action |
| AvatarUpload | `avatar-upload.tsx` | 18 | Avatar image upload with preview |
| MfaSettings | `mfa-settings.tsx` | 25 | MFA enable/disable toggle with setup flow |
| PasswordChangeForm | `password-change-form.tsx` | 30 | Current + new + confirm password form |
| ProfileForm | `profile-form.tsx` | 32 | User profile edit form (name, email, phone) |

**Total:** 5 files, ~119 LOC

## Usage Patterns

Used in `(dashboard)/profile/` route:
- `/profile` - `ProfileForm` + `AvatarUpload`
- `/profile/security` - `PasswordChangeForm` + `MfaSettings` + `ActiveSessions`

## Dependencies

- `@/components/ui/` (Input, Button, Switch, Card)
- `@/lib/hooks/auth/` (useProfile, useUpdateProfile)
- All components are very thin (14-32 LOC each) - likely placeholder implementations
