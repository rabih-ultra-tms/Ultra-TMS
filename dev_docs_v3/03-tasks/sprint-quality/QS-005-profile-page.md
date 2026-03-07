# QS-005: Profile Page

**Priority:** P1
**Effort:** L (4-8 hours)
**Status:** planned
**Assigned:** Claude Code

---

## Context Header (Read These First)

1. `apps/web/app/(dashboard)/profile/page.tsx` — Current stub (read the 0/10 stub)
2. `apps/api/src/modules/auth/auth.controller.ts` — Find `GET /auth/me` and `PATCH /auth/me` endpoints
3. `apps/web/lib/hooks/use-auth.ts` — Auth hook (has user data from /auth/me)
4. `dev_docs/12-Rabih-design-Process/01-auth/` — Profile design spec (if exists)
5. `apps/web/components/tms/forms/` — FormField, SelectField components to use

---

## Objective

Replace the 0/10 profile page stub with a working profile screen that displays user info and allows editing name, email, and password. The `GET /auth/me` and `PATCH /auth/me` endpoints exist in Production.

---

## File Plan

| File | Change |
|------|--------|
| `apps/web/app/(dashboard)/profile/page.tsx` | Complete rewrite — full profile UI |
| `apps/web/components/profile/ProfileForm.tsx` | Edit form component (RHF + Zod) |
| `apps/web/components/profile/PasswordChangeForm.tsx` | Change password section |
| `apps/web/components/profile/MfaSection.tsx` | MFA enable/disable section |
| `apps/web/lib/hooks/use-auth.ts` | Add `updateProfile(data)` mutation if not present |

---

## Screen Requirements

Based on design spec pattern — the profile page must show:

### Section 1: Profile Info
- Avatar (initials-based if no image)
- Full name (editable)
- Email (editable)
- Role (read-only)
- Tenant name (read-only)
- Member since date

### Section 2: Edit Profile Form
- First name field (RHF, required)
- Last name field (RHF, required)
- Email field (RHF, required, email format)
- Save button → `PATCH /auth/me` → `queryClient.invalidateQueries(['me'])`
- Success toast on save
- Error handling if email already taken

### Section 3: Change Password
- Current password field
- New password field (min 8 chars)
- Confirm new password field
- Save button → `POST /auth/change-password` (verify this endpoint exists first)

### Section 4: MFA Settings
- MFA status badge (enabled/disabled)
- Enable button → `POST /auth/mfa/enable` → show QR code modal
- Disable button (when enabled) → `DELETE /auth/mfa/disable`

---

## Acceptance Criteria

1. Profile page renders with user's actual name, email, and role from `GET /auth/me`
2. Edit form is pre-populated with current user data (not blank)
3. Saving the edit form calls `PATCH /auth/me` and shows success toast
4. Password change section validates that new password ≠ confirm password before submitting
5. MFA enable flow shows QR code modal from `POST /auth/mfa/enable`
6. All 4 states handled: loading (Skeleton), error (ErrorState), empty (n/a — user always exists), populated
7. `pnpm check-types` passes with 0 errors
8. Playwright screenshot taken of the completed profile page

---

## Dependencies

- **Blocks:** User experience for profile management
- **Blocked by:** None

---

## Key Risk: PATCH /auth/me Endpoint

Before writing the form, verify `PATCH /auth/me` exists:
```bash
grep -r "@Patch.*me\|@Patch.*profile" apps/api/src/modules/auth/
```

If not found, create it first (S effort, 1h) then build the frontend form.
