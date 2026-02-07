# Reset Password

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P1
> Route: /reset-password | Status: **Built** | Type: Auth / Form
> Primary Personas: Users resetting their password via email link
> Roles with Access: Public (unauthenticated, token-validated)

---

## 1. Purpose & Business Context

**What this screen does:**
The reset password page allows users to set a new password after receiving a password reset link via email. The page is accessed via a tokenized URL and displays two fields: new password and confirm password. Upon successful submission, the user is redirected to the login page with a success message.

**Business problem it solves:**
This is the completion step of the password recovery flow. If this step fails or is confusing, users remain locked out and must contact support. A smooth reset experience with clear validation feedback ensures users can quickly regain access and return to their logistics operations without downtime.

**Key business rules:**
- The reset token is validated on page load — if expired or invalid, show an error state with a "Request a new link" option
- Reset tokens expire after 1 hour from generation
- The new password must differ from the current password and the last 5 passwords (password history check)
- Password must meet complexity requirements (8+ chars, uppercase, lowercase, number, special char)
- After successful reset, all existing sessions for the user are invalidated (security: force re-login everywhere)
- The reset token is single-use — once consumed, it cannot be used again
- After successful reset, the user is redirected to /login with a success banner

**Success metric:**
Password reset completion rate (from clicking the email link to successfully setting a new password) exceeds 90%. Zero users should get stuck on this page due to unclear requirements.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Email inbox | User clicks "Reset Password" link in email | `?token=RESET_TOKEN_HERE` in URL |
| Forgot Password page (rare) | Direct navigation if user has the URL | `?token=RESET_TOKEN_HERE` |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Login page (/login) | Successful password reset | `?reset=success` query param, triggers success banner |
| Forgot Password (/forgot-password) | Token expired — "Request a new link" | None |
| Login page (/login) | "Back to login" link | None |

**Primary trigger:**
User received a password reset email after using the Forgot Password page. They click the "Reset Password" button in the email, which opens this page in their browser with a valid reset token.

**Success criteria (user completes the screen when):**
- User has entered a new password that meets all requirements
- User has confirmed the password (both fields match)
- Form has been submitted successfully
- User is redirected to /login and sees "Password reset successfully" banner

---

## 3. Layout Blueprint

### Desktop Layout (1440px+)

```
+------------------------------------------------------------------+
|                    FULL-SCREEN SPLIT LAYOUT                       |
|                                                                    |
|  +---------------------------+  +-------------------------------+  |
|  |                           |  |                               |  |
|  |    LEFT SIDE (50%)        |  |    RIGHT SIDE (50%)           |  |
|  |    White background       |  |    Slate-900 background       |  |
|  |                           |  |                               |  |
|  |    [Ultra TMS Logo]       |  |    [Key / Lock                |  |
|  |                           |  |     Illustration]             |  |
|  |    "Set your new          |  |                               |  |
|  |     password"             |  |    "Choose a strong           |  |
|  |    "Choose a strong       |  |     password to protect       |  |
|  |     password to protect   |  |     your account"             |  |
|  |     your account"         |  |                               |  |
|  |                           |  |    Password tips:             |  |
|  |    [New Password Input]   |  |    - Use a passphrase         |  |
|  |    [Strength Meter Bar]   |  |    - Avoid personal info      |  |
|  |    [Requirements List]    |  |    - Use a password manager   |  |
|  |                           |  |                               |  |
|  |    [Confirm Password]     |  |                               |  |
|  |    [Match Indicator]      |  |                               |  |
|  |                           |  |                               |  |
|  |    [==Reset Password==]   |  |                               |  |
|  |                           |  |                               |  |
|  |    [Back to login]        |  |                               |  |
|  |                           |  |                               |  |
|  +---------------------------+  +-------------------------------+  |
|                                                                    |
|  --- TOKEN EXPIRED STATE (replaces form) ---                      |
|                                                                    |
|  +---------------------------+                                     |
|  |    [Expired Clock Icon]   |                                     |
|  |    "Reset link expired"   |                                     |
|  |    "Your password reset   |                                     |
|  |     link has expired.     |                                     |
|  |     Links are valid for   |                                     |
|  |     1 hour."              |                                     |
|  |                           |                                     |
|  |    [Request New Link]     |                                     |
|  |    [Back to login]        |                                     |
|  +---------------------------+                                     |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | New password input, confirm password input, Reset Password button | Core action must dominate the page |
| **Secondary** (visible, real-time) | Password strength meter, requirements checklist, match indicator | Real-time feedback helps users succeed on first attempt |
| **Tertiary** (right panel) | Password tips, security messaging | Educational content that reduces errors |
| **Hidden** (conditional) | Token expired state, error messages | Only shown when problems occur |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | New Password | User input | Masked (dots), password type, eye toggle icon right | Form center |
| 2 | Confirm Password | User input | Masked (dots), password type, eye toggle icon right, match indicator | Below new password |
| 3 | Password Strength | Calculated | Visual bar (red/yellow/green) + text label | Below new password field |
| 4 | Requirements Checklist | Calculated | 5 items with green check / gray circle | Below strength meter |
| 5 | Match Indicator | Calculated | Green checkmark or red X with text | Right of confirm password field |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Password Strength | Score from 0-4 based on: length, mixed case, numbers, special chars, not common pattern | Bar width + color: 0-1 red "Weak", 2 yellow "Fair", 3 green "Strong", 4 green "Excellent" |
| 2 | Requirements Met | Check each rule against current password input | List: checkmark (green) or circle (gray) per rule |
| 3 | Passwords Match | password === confirmPassword | Green check "Passwords match" or red X "Passwords don't match" |
| 4 | Token Valid | Validate token on page load via API | Boolean — controls form vs. expired state |

---

## 5. Features

### Core Features (Already Built)

- [x] New password and confirm password input fields
- [x] POST /api/auth/reset-password endpoint integration with token
- [x] Basic client-side validation (non-empty, minimum length)
- [x] Server-side password complexity validation
- [x] Redirect to /login on success
- [x] Error message for invalid/expired token
- [x] "Back to login" link

### Enhancement Features (Wave 1 — To Add)

- [ ] **Password strength meter** — Animated horizontal bar below the password field that changes width and color (red → yellow → green) in real-time as the user types. Label updates: "Weak", "Fair", "Strong", "Excellent"
- [ ] **Password requirements checklist** — Live-updating list of 5 requirements with green checkmark (met) or gray circle (unmet):
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character (!@#$%^&*)
- [ ] **Confirm password match indicator** — Real-time green checkmark + "Passwords match" text or red X + "Passwords don't match" next to/below the confirm field
- [ ] **Password visibility toggle** — Eye/EyeOff icon in both password fields to show/hide text
- [ ] **Token validation on page load** — Validate the reset token immediately when the page loads. If invalid/expired, show the expired state immediately (don't let users fill in the form first)
- [ ] **Token expired illustration** — Clock/timer illustration with clear messaging and "Request New Link" button
- [ ] **Success redirect with message** — On successful reset, redirect to /login with query param that triggers a green success banner: "Your password has been reset. Please sign in with your new password."
- [ ] **Right panel with password tips** — Security-themed right panel with actionable tips
- [ ] **Previous password check** — If server returns "password was used recently" error, show specific message: "This password was used recently. Please choose a different one."
- [ ] **Auto-redirect countdown on success** — Brief success state: "Password reset! Redirecting to login in 3... 2... 1..." before auto-redirect

### Conditional / Role-Based Features

| Feature | Condition | Behavior |
|---|---|---|
| Form display | Token is valid and not expired | Show the password reset form |
| Token expired state | Token is invalid or expired | Show expired message with "Request New Link" |
| Previous password warning | Server returns PASSWORD_REUSED error | Show inline error: "This password was used recently" |
| All sessions invalidated notice | Always on success | Show info: "All other sessions have been signed out for security" |

---

## 6. Status & State Machine

### Reset Password Flow

```
[Page Load]
     |
     v
[Validate Token] ---(API call: GET /api/auth/validate-token?token=X)
     |
     +---(Valid)---> [Show Reset Form]
     |                    |
     |                    v
     |              [User fills form]
     |                    |
     |                    v
     |              [Submit] ---(Validation fail)---> [Show inline errors]
     |                    |
     |                    | (Valid)
     |                    v
     |              [Submitting...]
     |                    |
     |                    +---(Success)---> [Success State] ---> [Redirect to /login]
     |                    |
     |                    +---(Password reused)---> [Show reuse error]
     |                    |
     |                    +---(Token expired during)---> [Show expired state]
     |                    |
     |                    +---(Server error)---> [Show error, enable retry]
     |
     +---(Invalid/Expired)---> [Token Expired State]
                                    |
                                    v
                              [Request New Link] --> [Navigate to /forgot-password]
```

### States

| State | UI Display | Available Actions |
|---|---|---|
| Validating Token | Centered spinner with "Verifying your reset link..." | None (wait) |
| Form (valid token) | Password form with strength meter and requirements | Enter passwords, submit, back to login |
| Submitting | Loading spinner in button, form disabled | None (wait) |
| Success | Checkmark + "Password reset!" + countdown redirect | Wait for redirect, or click "Go to login" immediately |
| Token Expired | Expired illustration + message + "Request New Link" button | Request new link, back to login |
| Error | Error banner above form | Retry, back to login |

### Status Badge Colors

| State | Background | Text | Tailwind Classes |
|---|---|---|---|
| Strong password | green-100 | green-800 | `bg-green-100 text-green-800` |
| Fair password | yellow-100 | yellow-800 | `bg-yellow-100 text-yellow-800` |
| Weak password | red-100 | red-800 | `bg-red-100 text-red-800` |
| Passwords match | green-100 | green-700 | `text-green-700` |
| Passwords don't match | red-100 | red-700 | `text-red-700` |

---

## 7. Actions & Interactions

### Primary Action Buttons

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Reset Password | Lock/Checkmark icon | Primary / Blue-600, full-width | POST /api/auth/reset-password | No |
| Request New Link | Mail icon | Primary / Blue-600, full-width | Navigate to /forgot-password | No |
| Go to Login | Right arrow | Secondary / Outline | Navigate to /login | No |

### Secondary Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Back to login | Left arrow, text link | Navigate to /login | Always visible |
| Toggle password visibility (new) | Eye/EyeOff | Show/hide new password text | Always visible in field |
| Toggle password visibility (confirm) | Eye/EyeOff | Show/hide confirm password text | Always visible in field |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Tab | Move between new password, confirm password, and Reset button |
| Enter | Submit form (when focused on any form element) |
| Escape | Navigate back to login |

### Drag & Drop

N/A — No drag-and-drop interactions.

---

## 8. Real-Time Features

### WebSocket Events

N/A — Reset password page does not use WebSocket connections.

### Live Update Behavior

- **Password strength meter:** Updates on every keystroke with smooth CSS transition (200ms) for bar width and color changes
- **Requirements checklist:** Each item transitions between gray circle (unmet) and green checkmark (met) with a subtle fade (150ms)
- **Confirm password match:** Updates on every keystroke in the confirm field. Shows green checkmark when matching, red X when not matching. Does not show anything if confirm field is empty.
- **Auto-redirect countdown:** After successful reset, countdown from 3 to 0 with 1-second intervals, updating the displayed number, then redirect

### Polling Fallback

N/A — No polling needed.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Submit reset | Show loading state, disable form | Re-enable form, show error banner, keep password fields filled |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `reset-password-form` | `src/components/auth/reset-password-form.tsx` | `token: string, onSuccess: () => void` |
| `Input` | `src/components/ui/input.tsx` | Password type with icon slot |
| `Button` | `src/components/ui/button.tsx` | Primary and outline variants |
| `Alert` | `src/components/ui/alert.tsx` | Error/warning/success banners |
| `Label` | `src/components/ui/label.tsx` | Form labels |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `reset-password-form` | Two basic password fields + submit | Add strength meter, requirements checklist, match indicator, visibility toggles, token validation on mount, success/expired states |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `PasswordStrengthMeter` | Animated bar showing strength (shared with register page) | Small — strength scoring + CSS bar |
| `PasswordRequirementsList` | Live checklist of requirements (shared with register page) | Small — boolean checks + icon toggles |
| `PasswordMatchIndicator` | Green check or red X showing if passwords match | Small — comparison + icon display |
| `PasswordInput` | Input wrapper with visibility toggle (shared across auth forms) | Small — state + eye icon toggle |
| `TokenExpiredState` | Full-page state for expired/invalid tokens with illustration | Small — illustration + messaging + CTA |
| `ResetSuccessState` | Success checkmark with countdown redirect | Small — countdown timer + redirect logic |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Progress | `progress` | Base for password strength meter bar |
| Toast | `toast` | Success notification on redirect |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | GET | `/api/auth/validate-reset-token?token={token}` | Validate reset token on page load | `useValidateResetToken(token)` |
| 2 | POST | `/api/auth/reset-password` | Submit new password with token | `useResetPassword()` |

### Request/Response Examples

**GET /api/auth/validate-reset-token?token=abc123**
```json
// Response (valid)
{
  "valid": true,
  "email": "john@ultralogistics.com",
  "expiresAt": "2025-02-06T16:00:00Z"
}

// Response (expired)
{
  "valid": false,
  "reason": "TOKEN_EXPIRED",
  "message": "This reset link has expired. Please request a new one."
}

// Response (invalid)
{
  "valid": false,
  "reason": "TOKEN_INVALID",
  "message": "This reset link is invalid or has already been used."
}
```

**POST /api/auth/reset-password**
```json
// Request
{
  "token": "abc123def456",
  "newPassword": "NewSecureP@ss456"
}

// Response (success)
{
  "message": "Password reset successfully",
  "sessionsInvalidated": 3
}

// Response (password reused)
{
  "error": "PASSWORD_REUSED",
  "message": "This password was used recently. Please choose a different password."
}

// Response (password too weak)
{
  "error": "PASSWORD_TOO_WEAK",
  "message": "Password does not meet requirements",
  "requirements": {
    "minLength": false,
    "uppercase": true,
    "lowercase": true,
    "number": false,
    "specialChar": true
  }
}
```

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 410 | 422 | 500 |
|---|---|---|---|---|---|
| GET /api/auth/validate-reset-token | Invalid token format | N/A | Token expired (show expired state) | N/A | Show error with "Try again" option |
| POST /api/auth/reset-password | Validation errors (show inline per requirement) | Token expired during submission (show expired state) | Token already used | Password reused / too weak (show specific message) | Generic error with retry |

---

## 11. States & Edge Cases

### Loading State

- **Token validation (page load):** Show centered spinner with text "Verifying your reset link..." on a clean white background. This should be brief (under 1 second typically).
- **Form submitting:** Show spinner inside "Reset Password" button, replace text with "Resetting..." Disable both password fields and the button.
- **Success state:** Show green checkmark with "Password reset successfully!" and a countdown: "Redirecting to login in 3..."

### Empty States

N/A — The form always shows the password fields (if token is valid).

### Error States

**Token expired:**
- Display: Expired state with clock/timer illustration, "Your reset link has expired" heading, "Password reset links are valid for 1 hour. Please request a new one." description
- CTA: "Request New Link" primary button (navigates to /forgot-password)
- Secondary: "Back to login" text link

**Token already used:**
- Display: Similar to expired state but with different messaging: "This reset link has already been used"
- Description: "Each reset link can only be used once. If you need to reset your password again, please request a new link."
- CTA: "Request New Link" button

**Password reused:**
- Display: Inline error below new password field: "This password was used recently. Please choose a different password."
- Behavior: Clear both password fields, refocus new password input, strength meter resets

**Passwords don't match:**
- Display: Red indicator next to confirm field: "Passwords don't match"
- Behavior: Prevent form submission until passwords match (button disabled)

**Password too weak (server-side):**
- Display: Inline error below password with specific unmet requirements highlighted in red in the requirements checklist
- Behavior: Keep form state, focus on password field

**Network error:**
- Display: Red banner: "Connection error. Your password has not been changed. Please try again."
- Behavior: Re-enable form with entered data intact

### Permission Denied

- If an authenticated user navigates to /reset-password, redirect to /profile where they can change their password directly.
- If no token is in the URL, redirect to /forgot-password.

### Offline / Degraded

- **Full offline:** On page load, show: "You are offline. Password reset requires an internet connection." with retry option.

---

## 12. Filters, Search & Sort

N/A — No data listing on this page.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Split layout changes to 45/55
- Right panel content (password tips) condensed
- Form max-width remains 400px

### Mobile (< 768px)

- **Single-column layout:** Right panel hidden entirely
- Form takes full width with 24px horizontal padding
- Password strength meter spans full form width
- Requirements checklist displays in a compact 2-column grid (2 items per row)
- Touch-friendly inputs: min-height 48px
- Eye toggle icons have 44px touch target
- "Reset Password" button full-width, fixed at bottom of viewport for easy thumb access
- "Back to login" as a top-left back arrow button

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | 50/50 split, full right panel with tips |
| Desktop | 1024px - 1439px | 50/50 split |
| Tablet | 768px - 1023px | 45/55 split, condensed right panel |
| Mobile | < 768px | Single column, no right panel |

---

## 14. Stitch Prompt

```
Design a Reset Password page for a modern freight logistics TMS called "Ultra TMS." Show the FORM STATE where the user is setting a new password with real-time validation feedback. Use a clean, modern SaaS aesthetic similar to Linear.app or Clerk authentication pages.

Layout: Full-screen split layout, no sidebar. Left half (50% width) has white background with the password reset form. Right half (50% width) has dark slate-900 background with security tips.

Left Side — Reset Password Form (centered, max-width 400px):
At the top-left, a "Back to login" link with left arrow icon in gray-500, 14px text.

Below (40px spacing), centered: the "Ultra TMS" logo in blue-600 (20px text).

Below (24px spacing): "Set your new password" in 24px semibold gray-900. Below: "Choose a strong password to protect your account" in 14px gray-500.

Form fields (24px spacing between sections):
1. "New Password" label in 14px medium gray-700. Below, a password input with gray-200 border, rounded-md, masked dots as placeholder. On the right side inside the input, an eye icon in gray-400 for visibility toggle. The input currently contains a typed password (shown as dots).

Below the password input (8px spacing), show a Password Strength Meter: a horizontal bar spanning the full input width, height 4px, rounded-full. The bar is 75% filled with a green-500 color (indicating "Strong"). To the right of the bar, text "Strong" in 13px green-600 semibold.

Below the strength bar (12px spacing), show a Password Requirements Checklist — 5 items in a single column with 6px spacing between:
- Green checkmark icon + "At least 8 characters" in 13px green-600
- Green checkmark icon + "One uppercase letter" in 13px green-600
- Green checkmark icon + "One lowercase letter" in 13px green-600
- Green checkmark icon + "One number" in 13px green-600
- Gray circle icon + "One special character (!@#$%)" in 13px gray-400 (not yet met)

2. "Confirm Password" label in 14px medium gray-700. Below, a password input with gray-200 border, rounded-md, masked dots. Eye icon on the right. Below the confirm input, a small indicator: green checkmark icon + "Passwords match" in 13px green-600.

Below (24px spacing): A full-width "Reset Password" button in blue-600 background, white text, 14px semibold, rounded-md, height 44px.

Below (16px spacing): "Remember your password?" in 14px gray-500 with "Sign in" as a blue-600 link.

Right Side — Security Tips Panel (slate-900 background):
Centered vertically. At the top, a modern illustration of a key and lock in blue-400 and blue-600 — stylized, geometric, abstract design against the dark background. Approximately 160px x 120px.

Below (24px spacing): "Password Security Tips" in 18px semibold white text.

Below (16px spacing), show 4 tips in a vertical list with 12px spacing:
1. Blue-600 shield icon + "Use a passphrase like 'correct-horse-battery-staple'" in 14px white/80% opacity
2. Blue-600 shield icon + "Avoid personal information (birthdays, names)" in 14px white/80% opacity
3. Blue-600 shield icon + "Use a different password for each service" in 14px white/80% opacity
4. Blue-600 shield icon + "Consider using a password manager" in 14px white/80% opacity

Below (32px spacing): A subtle info box with white/5% background, rounded-md, 16px padding: "For security, all other active sessions will be signed out when you reset your password." in 13px white/60% opacity.

Footer: Full-width, 12px gray-400. Left: "(c) 2025 Ultra TMS." Right: "Privacy Policy | Terms of Service."

Design specs: Font Inter, 14px base. Blue-600 primary. Green-500/600 for met requirements and matching passwords. Gray-400 for unmet requirements. The page should feel secure, clear, and guide the user to set a strong password effortlessly.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] New password and confirm password input fields
- [x] Basic client-side validation (non-empty, minimum length)
- [x] POST /api/auth/reset-password with token integration
- [x] Redirect to /login on success
- [x] Error message for invalid/expired token
- [x] "Back to login" link
- [x] Server-side password complexity enforcement

**What needs polish / bug fixes:**
- [ ] No password strength visual indicator — users guess at strength until server rejects
- [ ] No live requirements checklist — users must submit to discover which requirements are unmet
- [ ] No confirm password match indicator — users only see mismatch error on submit
- [ ] No password visibility toggle — users cannot verify what they typed
- [ ] Token validation does not happen on page load — users fill in the form only to find out token is expired on submit
- [ ] No visual distinction between "expired" and "invalid" token states
- [ ] Success state is a bare redirect — no confirmation message or animation
- [ ] Page looks minimal — no right panel, no illustrations, no context
- [ ] No "request new link" button on expired state — users must manually navigate to /forgot-password

**What to add this wave:**
- [ ] **Password strength meter** — Real-time animated bar (weak/fair/strong/excellent) with color transitions
- [ ] **Password requirements checklist** — Live-updating 5-item checklist with check/circle icons
- [ ] **Confirm password match indicator** — Real-time checkmark or X showing match status
- [ ] **Password visibility toggle** — Eye icon on both password fields
- [ ] **Token validation on page load** — Validate token immediately; show form only if valid
- [ ] **Token expired state with illustration** — Dedicated expired state with clock illustration and "Request New Link" button
- [ ] **Success state with countdown** — Brief success animation: "Password reset! Redirecting in 3..."
- [ ] **Right panel with password tips** — Security-themed panel with actionable password advice
- [ ] **Previous password check messaging** — Show specific error if password was recently used
- [ ] **Auto-focus new password field** — Focus new password input on page load for immediate typing

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Password strength meter | High | Low | **P0** |
| Password requirements checklist | High | Low | **P0** |
| Confirm password match indicator | High | Low | **P0** |
| Password visibility toggle | High | Low | **P0** |
| Token validation on page load | High | Low | **P0** |
| Auto-focus new password field | Medium | Low | **P0** |
| Token expired state with illustration | Medium | Medium | **P1** |
| Success state with countdown redirect | Medium | Low | **P1** |
| Right panel with password tips | Medium | Medium | **P1** |
| Previous password check messaging | Medium | Low | **P1** |
| Success banner on /login after redirect | Medium | Low | **P1** |
| All sessions invalidated notice | Low | Low | **P2** |

### Future Wave Preview

- **Wave 2:** Password breach check (check against haveibeenpwned API during input), passphrase generator suggestion, biometric re-enrollment prompt after password change, push notification to other devices about password change
- **Wave 3:** Password rotation policy enforcement (admin-configurable expiry), password complexity scoring with AI (detect keyboard patterns, dictionary words), security score dashboard integration

---

*This document was created as part of the Wave 1 Enhancement Focus design process for Ultra TMS Auth & Admin service.*
