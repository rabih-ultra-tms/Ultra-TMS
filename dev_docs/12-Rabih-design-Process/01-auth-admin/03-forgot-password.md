# Forgot Password

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P1
> Route: /forgot-password | Status: **Built** | Type: Auth / Form
> Primary Personas: All users who have forgotten their password
> Roles with Access: Public (unauthenticated)

---

## 1. Purpose & Business Context

**What this screen does:**
The forgot password page allows users who cannot remember their password to initiate a password reset flow. The user enters their registered email address and receives a password reset link (or code) via email. This is a critical self-service page that prevents password-related support tickets.

**Business problem it solves:**
Without this screen, every user who forgets their password would need to contact an administrator to manually reset it — creating support overhead and downtime. In a logistics company where dispatchers and brokers need rapid access during business-critical operations, even a 15-minute delay to reset a password can mean missed load pickups and lost revenue. This page must work reliably and feel reassuring.

**Key business rules:**
- The same success message is shown whether or not the email exists in the system (security: prevents email enumeration)
- Reset links expire after 1 hour
- Only the most recent reset link is valid (previous links are invalidated)
- Rate limited: maximum 3 reset requests per email per hour
- If the account has MFA enabled, MFA is not required for password reset (the email itself serves as verification)
- Account must be in "active" status to receive reset emails (deactivated accounts silently fail)

**Success metric:**
Password reset completion rate (users who click "Forgot Password" and successfully set a new password) exceeds 80%. Support tickets for password resets reduce by 70%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Login page (/login) | "Forgot password?" link click | Pre-filled email (if user typed it before clicking) |
| Direct URL | User bookmarks or is directed to forgot password | None |
| Support documentation | Help article links to password reset page | None |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| "Check Your Email" success state (same page) | Successful form submission | Email displayed for reference |
| Login page (/login) | "Back to login" link | None |
| Reset Password (/reset-password) | User clicks link in email | `?token=RESET_TOKEN` |
| Register (/register) | "Don't have an account?" link (optional) | None |

**Primary trigger:**
User is on the login page, cannot remember their password, and clicks the "Forgot password?" link. Occasionally, users land here directly from a support article or bookmark.

**Success criteria (user completes the screen when):**
- User has entered their email and submitted the form
- User sees the "Check your email" confirmation with clear instructions
- User checks their email and clicks the reset link (navigating to /reset-password)

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
|  |    [Ultra TMS Logo]       |  |                               |  |
|  |                           |  |    [Lock / Shield             |  |
|  |    [<- Back to login]     |  |     Illustration]             |  |
|  |                           |  |                               |  |
|  |    "Forgot your           |  |    "Your security             |  |
|  |     password?"            |  |     matters to us"            |  |
|  |    "Enter your email and  |  |                               |  |
|  |     we'll send you a      |  |    "We use industry-standard  |  |
|  |     reset link."          |  |     encryption and security   |  |
|  |                           |  |     protocols to protect      |  |
|  |    [Email Input]          |  |     your account."            |  |
|  |                           |  |                               |  |
|  |    [===Send Reset Link==] |  |                               |  |
|  |                           |  |                               |  |
|  |    --- or ---             |  |                               |  |
|  |    "Verify by phone"      |  |                               |  |
|  |    "Answer security Q"    |  |                               |  |
|  |                           |  |                               |  |
|  +---------------------------+  +-------------------------------+  |
|                                                                    |
|  --- SUCCESS STATE (replaces form above) ---                      |
|                                                                    |
|  +---------------------------+  +-------------------------------+  |
|  |    [Checkmark / Email     |  |                               |  |
|  |     Illustration]         |  |    (Same right panel)         |  |
|  |                           |  |                               |  |
|  |    "Check your email"     |  |                               |  |
|  |    "We sent a reset link  |  |                               |  |
|  |     to john@company.com"  |  |                               |  |
|  |                           |  |                               |  |
|  |    [Open Email App]       |  |                               |  |
|  |    "Didn't receive it?"   |  |                               |  |
|  |    [Resend] | [Try phone] |  |                               |  |
|  |                           |  |                               |  |
|  |    [Back to login]        |  |                               |  |
|  +---------------------------+  +-------------------------------+  |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Email input, Submit button, clear heading | Single action — must be crystal clear |
| **Secondary** (visible but less prominent) | "Back to login" link, explanation text | Navigation and reassurance |
| **Tertiary** (on success state) | "Check your email" message, resend option, alternative verification methods | Post-action guidance |
| **Hidden** (behind interaction) | Phone verification option, security question option, email open helpers | Alternative paths, not primary flow |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Email Address | User input (or pre-filled from login page) | Email format, left-aligned mail icon inside input | Center of form area |
| 2 | Submitted Email (success state) | From submission | Bold text, e.g., "john@company.com" | Success message area |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Resend Cooldown Timer | 60-second countdown after submission | "Resend available in 0:42" — updates every second |
| 2 | Email Provider Shortcut | Parse email domain → map to provider | "Open Gmail" / "Open Outlook" button with provider icon |

---

## 5. Features

### Core Features (Already Built)

- [x] Email input field with validation
- [x] POST /api/auth/forgot-password endpoint integration
- [x] Success message display after submission
- [x] "Back to login" link
- [x] Rate limiting error handling
- [x] Generic success message (same whether email exists or not — security)

### Enhancement Features (Wave 1 — To Add)

- [ ] **"Check your email" illustration** — Animated mail envelope illustration on the success state, replacing the plain text confirmation
- [ ] **Email provider shortcut button** — After submission, detect email domain and show "Open Gmail" / "Open Outlook" / "Open Yahoo Mail" button that links directly to the user's inbox
- [ ] **Resend with cooldown timer** — "Resend email" link with a 60-second cooldown countdown before it becomes clickable again
- [ ] **Phone verification option** — "Verify by phone instead" link that shows a phone number input (masked: (***) ***-4567) and sends an SMS code
- [ ] **Security question option** — "Answer security question instead" link (if user has set one up) for alternative identity verification
- [ ] **Right panel illustration** — Lock/shield illustration with security messaging on the right brand panel
- [ ] **Pre-fill email from login page** — If user typed an email on /login before clicking "Forgot password?", carry it over via query param or state
- [ ] **Animated success transition** — Smooth cross-fade from form to success state (300ms transition)
- [ ] **Back to login with context** — "Back to login" link preserves the email so user doesn't have to retype
- [ ] **Spam folder reminder** — On success state, include: "Not in your inbox? Check your spam or junk folder."
- [ ] **Contact support fallback** — After 2 resend attempts, show: "Still having trouble? Contact support" with link

### Conditional / Role-Based Features

| Feature | Condition | Behavior |
|---|---|---|
| Phone verification option | User has a verified phone number on file | Show "Verify by phone" link |
| Security question option | User has configured security questions | Show "Answer security question" link |
| Email provider shortcut | Email domain matches known provider | Show "Open [Provider]" button on success |
| reCAPTCHA | After 2 submissions from same IP | Show visible reCAPTCHA challenge |

---

## 6. Status & State Machine

### Forgot Password Flow

```
[Form Visible]
      |
      v
[User enters email]
      |
      v
[Submit] ---(Invalid email format)---> [Inline validation error, stay on form]
      |
      | (Valid format)
      v
[Submitting...] (loading state)
      |
      +---(Success — 200)---> [Show "Check Your Email" success state]
      |                              |
      |                         [Resend option]
      |                         [Email provider shortcut]
      |                         [Back to login]
      |
      +---(Rate Limited — 429)---> [Show "Too many requests" error, show cooldown timer]
      |
      +---(Server Error — 500)---> [Show "Something went wrong" error with retry]
```

### States

| State | UI Display | Available Actions |
|---|---|---|
| Form (initial) | Email input, Submit button, "Back to login" | Enter email, submit, navigate to login |
| Submitting | Loading spinner in button, disabled form | None (waiting) |
| Success | "Check your email" message, illustration, resend link | Open email app, resend, back to login, try phone |
| Rate Limited | Warning banner with cooldown timer | Wait for cooldown, back to login |
| Error | Error banner below form | Retry submission, back to login |

### Status Badge Colors

| State | Background | Text | Tailwind Classes |
|---|---|---|---|
| Success | green-100 | green-800 | `bg-green-100 text-green-800` |
| Error | red-100 | red-800 | `bg-red-100 text-red-800` |
| Rate Limited | yellow-100 | yellow-800 | `bg-yellow-100 text-yellow-800` |
| Info | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Send Reset Link | Mail / Send icon | Primary / Blue-600, full-width | POST /api/auth/forgot-password | No |
| Open Gmail / Open Outlook | Provider icon | Secondary / Outline, full-width | Open email provider in new tab | No |
| Resend Email | Refresh icon | Ghost / text link | Re-POST /api/auth/forgot-password | No (cooldown enforced) |

### Secondary Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Back to login | Left arrow | Navigate to /login (preserve email in state) | Always visible |
| Verify by phone instead | Phone icon | Switch to phone verification UI | User has verified phone number |
| Answer security question | Shield icon | Switch to security question UI | User has security questions configured |
| Contact support | Headset icon | Open support contact (email or chat) | After 2 failed resend attempts |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Tab | Move between email input and Submit button |
| Enter | Submit form |
| Escape | Navigate back to login |

### Drag & Drop

N/A — No drag-and-drop interactions.

---

## 8. Real-Time Features

### WebSocket Events

N/A — Forgot password page does not use WebSocket connections.

### Live Update Behavior

- **Resend cooldown timer:** 60-second countdown updates every second via setInterval. When it reaches 0, the "Resend" link becomes clickable with a color change from gray-400 to blue-600.
- **Email pre-fill animation:** If email is carried over from login page, the input animates in (fade + slight slide) to draw attention.

### Polling Fallback

N/A — No polling on this page.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Submit email | Immediately show loading state on button | Re-enable form, show error banner |
| Resend email | Immediately restart cooldown timer, show "Email resent" toast | Show error if resend fails |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `forgot-password-form` | `src/components/auth/forgot-password-form.tsx` | `onSuccess: () => void, defaultEmail?: string` |
| `Input` | `src/components/ui/input.tsx` | Standard text input with email type |
| `Button` | `src/components/ui/button.tsx` | Primary and ghost variants |
| `Alert` | `src/components/ui/alert.tsx` | For error/warning/info banners |
| `Label` | `src/components/ui/label.tsx` | Form label |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `forgot-password-form` | Basic email input + submit, plain text success message | Add illustration, email provider shortcut, resend with cooldown, phone verification option, animated success transition |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `CheckEmailIllustration` | SVG illustration of an email envelope with subtle animation (floating, opening) | Small — SVG + CSS animation |
| `EmailProviderShortcut` | Button that detects email domain and links to the correct webmail provider | Small — domain parsing + link mapping |
| `ResendWithCooldown` | "Resend email" link with 60-second countdown timer | Small — timer state + UI toggle |
| `SecurityIllustration` | Right panel illustration with lock/shield imagery | Small — SVG or static image |
| `PhoneVerificationForm` | Phone number masked display + SMS code input (alternative to email) | Medium — phone masking, SMS API integration |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Toast | `toast` | "Email resent" confirmation |
| Separator | `separator` | "or" divider between email and alternative methods |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | POST | `/api/auth/forgot-password` | Send password reset email | `useForgotPassword()` |
| 2 | POST | `/api/auth/forgot-password/phone` | Send SMS reset code | `useForgotPasswordPhone()` |
| 3 | POST | `/api/auth/forgot-password/security-question` | Verify security question answer | `useSecurityQuestionVerify()` |
| 4 | GET | `/api/auth/user-recovery-options?email={email}` | Check available recovery methods for email | `useRecoveryOptions(email)` |

### Request/Response Examples

**POST /api/auth/forgot-password**
```json
// Request
{
  "email": "john@ultralogistics.com"
}

// Response (always 200 — security: no email enumeration)
{
  "message": "If an account exists with this email, a password reset link has been sent.",
  "cooldownSeconds": 60
}
```

**GET /api/auth/user-recovery-options?email=john@ultralogistics.com**
```json
// Response
{
  "email": true,
  "phone": true,
  "phoneMasked": "(***) ***-4567",
  "securityQuestion": false
}
```

### Error Handling per Endpoint

| Endpoint | 400 | 429 | 500 |
|---|---|---|---|
| POST /api/auth/forgot-password | Invalid email format (show inline) | Rate limited: "You've requested too many resets. Please try again in [X] minutes." | Generic error with retry button |
| GET /api/auth/user-recovery-options | Invalid email format | N/A | Silently fail — show email-only option (default) |

---

## 11. States & Edge Cases

### Loading State

- **Initial page load:** Form renders immediately, no data to fetch. If email is pre-filled from login page, input shows the email with a subtle fade-in.
- **Form submitting:** Show spinner inside "Send Reset Link" button, replace text with "Sending..." Disable the email input and button.
- **Success transition:** Smooth cross-fade animation (300ms) from form to "Check your email" success state.

### Empty States

N/A — The form always shows the email input field.

### Error States

**Invalid email format:**
- Display: Inline error below email field: "Please enter a valid email address."
- Behavior: Red border on input, focus on email field.

**Rate limited (429):**
- Display: Yellow warning banner: "You've made too many requests. Please wait [countdown] before trying again."
- Behavior: Disable Submit button, show countdown timer. Button re-enables when timer reaches 0.

**Network error:**
- Display: Red error banner: "Unable to connect. Please check your internet and try again."
- Behavior: Keep email input filled, show retry button.

**Server error (500):**
- Display: Red error banner: "Something went wrong on our end. Please try again in a few minutes."
- Behavior: Keep form state, re-enable submit button.

### Permission Denied

- If an authenticated user navigates to /forgot-password, redirect to the dashboard (they can change their password from profile settings).

### Offline / Degraded

- **Full offline:** Show banner: "You are offline. Password reset requires an internet connection." Disable submit button.

---

## 12. Filters, Search & Sort

N/A — No data listing on this page.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Split layout changes to 45/55
- Right panel illustration scales down
- Form area stays centered with max-width 400px

### Mobile (< 768px)

- **Single-column layout:** Right panel hidden entirely
- Form takes full width with 24px horizontal padding
- Success state illustration scales to 60% of width, centered above text
- "Open Gmail" / "Open Outlook" button becomes full-width
- Touch-friendly: email input min-height 48px, submit button min-height 48px
- "Back to login" link positioned at top of page as a left-arrow back button

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | 50/50 split, full illustration panel |
| Desktop | 1024px - 1439px | 50/50 split |
| Tablet | 768px - 1023px | 45/55 split, smaller illustration |
| Mobile | < 768px | Single column, no illustration panel |

---

## 14. Stitch Prompt

```
Design a Forgot Password page for a modern freight logistics TMS called "Ultra TMS." Show the SUCCESS STATE (after email is submitted) with a "Check your email" confirmation. Use a clean, modern SaaS aesthetic similar to Linear.app or Clerk password reset pages.

Layout: Full-screen split layout, no sidebar. Left half (50% width) has white background with the success content. Right half (50% width) has dark slate-900 background with security-themed branding.

Left Side — Success State (centered, max-width 400px):
At the top-left, a "Back to login" link with a left arrow icon in gray-500, 14px text. The arrow and text should be subtle but clearly clickable.

Below (40px spacing), centered: the "Ultra TMS" logo in blue-600, smaller size (20px text).

Below (32px spacing), centered: A clean, modern illustration of an email envelope. The envelope should be stylized in blue-100 and blue-600 colors with a subtle floating animation — the envelope gently bobs up and down. A small green checkmark badge sits on the top-right corner of the envelope. The illustration should be approximately 120px x 100px.

Below the illustration (24px spacing): "Check your email" in 24px semibold gray-900, centered.

Below (8px spacing): "We sent a password reset link to" in 14px gray-500, centered. Below that: "john@ultralogistics.com" in 14px semibold gray-900, centered.

Below (24px spacing): A full-width button "Open Gmail" with a Gmail icon on the left, white background, gray-200 border, rounded-md, 14px gray-700 text, height 44px. This button links to the user's email provider.

Below (16px spacing): "Didn't receive the email?" in 14px gray-500, centered. Below that, two links side by side: "Resend email" in blue-600 (with a small clock icon showing "0:42" countdown in gray-400 next to it when on cooldown) and a dot separator and "Try phone verification" in blue-600.

Below (8px spacing): "Check your spam folder if it doesn't appear in a few minutes." in 13px gray-400 italic, centered.

Below (32px spacing): A subtle horizontal gray-200 line. Below the line: "Still having trouble?" in 14px gray-500 with "Contact support" as a blue-600 link.

Right Side — Security Brand Panel (slate-900 background):
Centered vertically. Display an elegant illustration of a shield with a lock icon inside, rendered in blue-400 and blue-600 with subtle glowing edges against the dark background. The style should be modern, geometric, and abstract — like security graphics from enterprise software landing pages.

Below (24px spacing): "Your security is our priority" in 20px medium white text, centered, max-width 320px.

Below (16px spacing): Three security feature points in 14px white/80% opacity, each with a small blue-600 checkmark:
- "256-bit SSL encryption"
- "SOC 2 Type II certified"
- "GDPR compliant data handling"

Below (32px spacing): "Password reset links expire after 1 hour for your protection." in 13px white/50% opacity, centered.

Footer: Full width, 12px gray-400. Left: "(c) 2025 Ultra TMS." Right: "Privacy Policy | Terms of Service."

Design specs: Font Inter, 14px base. Blue-600 primary. The page should feel calm, reassuring, and professional — confirming to the user that the process is working and their account is secure.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Email input field with client-side format validation
- [x] POST /api/auth/forgot-password integration
- [x] Generic success message (same for existing and non-existing emails — secure)
- [x] "Back to login" navigation link
- [x] Rate limiting error handling (shows error on 429)
- [x] Basic responsive layout

**What needs polish / bug fixes:**
- [ ] Success state is plain text ("We sent you an email") — no illustration, no visual confirmation
- [ ] No resend option — user must refresh page and resubmit to get another email
- [ ] Email is not pre-filled when coming from login page (user has to retype)
- [ ] No loading state on the submit button
- [ ] Error message for rate limiting is not user-friendly (shows raw "429" or generic text)
- [ ] No guidance about checking spam folder
- [ ] No alternative recovery methods (phone, security question)
- [ ] Page looks bare — no right panel branding, minimal layout

**What to add this wave:**
- [ ] **"Check your email" illustration** — Animated envelope SVG on success state
- [ ] **Email provider shortcut** — "Open Gmail" / "Open Outlook" button based on email domain detection
- [ ] **Resend with cooldown** — "Resend email" link with 60-second countdown timer
- [ ] **Spam folder reminder** — "Check your spam folder" text on success state
- [ ] **Pre-fill email from login** — Carry email value via router state or query param from /login
- [ ] **Right panel branding** — Security-themed illustration with trust messaging
- [ ] **Loading state on button** — Spinner + "Sending..." text on submit
- [ ] **Animated success transition** — Smooth cross-fade from form to success state
- [ ] **Contact support fallback** — Show support link after 2 resend attempts
- [ ] **Phone verification option** — Alternative recovery via SMS (if phone on file)
- [ ] **Back to login preserves email** — Pass email back to /login so user does not retype

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Loading state on button | High | Low | **P0** |
| Pre-fill email from login page | High | Low | **P0** |
| Resend with cooldown timer | High | Low | **P0** |
| "Check your email" illustration | Medium | Medium | **P0** |
| Spam folder reminder text | Medium | Low | **P0** |
| Email provider shortcut button | Medium | Low | **P1** |
| Right panel security branding | Medium | Medium | **P1** |
| Animated success transition | Low | Low | **P1** |
| Back to login preserves email | Medium | Low | **P1** |
| Contact support fallback | Medium | Low | **P1** |
| Phone verification option | Medium | High | **P2** |
| Security question option | Low | High | **P2** |

### Future Wave Preview

- **Wave 2:** SMS-based password reset flow, security question as alternative verification, reset link deep-linking (open directly in mobile app), admin-initiated password reset with notification to user
- **Wave 3:** Self-service account recovery wizard (multi-method verification), forgot password analytics (track reset request volume, completion rates), AI-powered anomaly detection on reset requests (flag suspicious patterns)

---

*This document was created as part of the Wave 1 Enhancement Focus design process for Ultra TMS Auth & Admin service.*
