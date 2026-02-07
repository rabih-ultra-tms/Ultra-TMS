# Login

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /login | Status: **Built** | Type: Auth / Form
> Primary Personas: All users (dispatchers, brokers, admins, finance, carriers)
> Roles with Access: Public (unauthenticated)

---

## 1. Purpose & Business Context

**What this screen does:**
The login page is the primary gateway into Ultra TMS. Users enter their email and password to authenticate and access the system. After successful credential verification, users may be prompted for MFA before receiving a JWT token and being redirected to their role-appropriate dashboard.

**Business problem it solves:**
Secure access control is foundational to a multi-tenant TMS handling sensitive freight, financial, and customer data. The login page must balance security (preventing unauthorized access) with usability (minimizing friction for legitimate users who log in multiple times daily). A poor login experience directly impacts daily productivity for dispatchers and brokers who may start/stop sessions frequently throughout the day.

**Key business rules:**
- Users must have an active account status to log in (deactivated accounts show a specific error message)
- After 5 consecutive failed login attempts, the account is temporarily locked for 30 minutes
- After 10 consecutive failures, account is locked and requires admin intervention
- Tenant context is determined by the user's email domain or explicit tenant selection
- If MFA is enabled for the user, they are redirected to /mfa after password verification
- Password must meet minimum complexity requirements (8+ chars, mixed case, number, special char)

**Success metric:**
Login success rate exceeds 95% on first attempt. Average time from page load to dashboard access is under 8 seconds (including MFA). Support tickets for login issues reduce by 40%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Browser bookmark / direct URL | User navigates to app | None (or `?returnUrl=` for deep links) |
| Register page | "Already have an account? Sign in" link | None |
| Reset Password page | "Back to login" link or auto-redirect after reset | `?reset=success` query param |
| Session expiry | Automatic redirect when token expires | `?returnUrl=` with previous page, `?expired=true` |
| Logout action | User clicks logout from any page | `?logout=true` |
| Email invitation link | New user clicks invite link | `?invite=TOKEN&email=user@company.com` |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| MFA Verification (/mfa) | Password verified, MFA enabled | Temporary session token, MFA method preference |
| Dashboard (/) | Successful login (no MFA) | JWT in memory, refresh token in httpOnly cookie |
| Forgot Password (/forgot-password) | "Forgot password?" link click | Pre-filled email (if entered) |
| Register (/register) | "Don't have an account?" link click | None |

**Primary trigger:**
User opens Ultra TMS at the start of their workday, or returns after a session timeout. Dispatchers and brokers typically log in 2-4 times per day due to session management policies.

**Success criteria (user completes the screen when):**
- User has entered valid credentials and been authenticated
- If MFA is enabled, user is seamlessly transitioned to MFA input
- If no MFA, user lands on their role-appropriate dashboard within seconds

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
|  |    [Ultra TMS Logo]       |  |    [Logistics Illustration]   |  |
|  |    "Transportation        |  |    Rotating freight images    |  |
|  |     Management System"    |  |    or animated network        |  |
|  |                           |  |    visualization              |  |
|  |    "Welcome back"         |  |                               |  |
|  |    "Sign in to continue"  |  |    "Streamline your freight   |  |
|  |                           |  |     operations from order     |  |
|  |    [Email Input]          |  |     to delivery"              |  |
|  |    [Password Input]       |  |                               |  |
|  |    [Forgot password?]     |  |    "Trusted by 500+           |  |
|  |                           |  |     logistics companies"      |  |
|  |    [x] Remember me        |  |                               |  |
|  |                           |  |    [Company logos faint]      |  |
|  |    [====Sign In====]      |  |                               |  |
|  |                           |  |                               |  |
|  |    ——— or ———             |  |                               |  |
|  |                           |  |                               |  |
|  |    [Continue with Google]  |  |                               |  |
|  |    [Continue with MS]      |  |                               |  |
|  |    [SSO / SAML Login]      |  |                               |  |
|  |                           |  |                               |  |
|  |    Don't have an account? |  |                               |  |
|  |    Register / Contact Admin|  |                               |  |
|  |                           |  |                               |  |
|  +---------------------------+  +-------------------------------+  |
|                                                                    |
|  [Footer: (c) 2025 Ultra TMS | Privacy | Terms]                   |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Email input, password input, Sign In button | Core action — must be immediately obvious |
| **Secondary** (visible but less prominent) | Forgot password link, Remember me checkbox, social login buttons | Supporting actions users need occasionally |
| **Tertiary** (available but subtle) | Register link, SSO button, brand messaging on right panel | Not the primary use case for returning users |
| **Hidden** (behind interaction) | Password visibility toggle, last login info (shown after login), error messages | Contextual, shown only when relevant |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | Email Address | User input | Email format, lowercase, left-aligned mail icon | Form field, left panel center |
| 2 | Password | User input | Masked (dots), password type, eye toggle icon right | Form field, below email |
| 3 | Remember Me | User input | Checkbox, boolean | Below password, left-aligned |
| 4 | Tenant Logo | Tenant.logo | Image (max 200x60px), falls back to Ultra TMS logo | Top of form area |
| 5 | Tenant Name | Tenant.name | Text, 14px gray-500, below logo | Below logo |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Tenant Detection | Parse email domain after @ sign, match to tenant config | Auto-switch branding when email typed |
| 2 | Last Login Info | User.lastLoginAt + User.lastLoginIp | "Last login: Feb 5, 2025 from 192.168.1.x" shown post-login |
| 3 | Account Lock Timer | max(0, lockoutExpiry - now()) | "Account locked. Try again in 25 minutes" countdown |

---

## 5. Features

### Core Features (Already Built)

- [x] Email and password input fields with validation
- [x] Form submission with loading state on button
- [x] Server-side credential verification via POST /api/auth/login
- [x] JWT token storage in memory, refresh token in httpOnly cookie
- [x] Redirect to dashboard on success
- [x] Redirect to /mfa if MFA is enabled
- [x] "Forgot Password" link navigation to /forgot-password
- [x] "Register" link navigation to /register
- [x] Error message display for invalid credentials
- [x] Account lockout message after too many failed attempts
- [x] Form validation (email format, password not empty)

### Enhancement Features (Wave 1 — To Add)

- [ ] **Social login buttons** — "Continue with Google" and "Continue with Microsoft" OAuth integration (currently placeholder, needs backend OAuth flow)
- [ ] **Remember me / trusted device** — Checkbox that extends refresh token to 30 days and stores device fingerprint
- [ ] **Branded login per tenant** — Load company logo and primary color from tenant config when email domain is detected
- [ ] **Login background illustration** — Right panel with rotating logistics-themed images (trucks, warehouses, maps, shipping containers)
- [ ] **Last login location/time** — After successful login, briefly show a toast: "Last login: Feb 5, 2:30 PM from Chicago, IL"
- [ ] **Inline MFA prompt** — Instead of redirecting to /mfa, show MFA input inline below password on same page (reduces page transitions)
- [ ] **Magic link login** — "Send me a login link" option for users who prefer passwordless auth (sends email with one-time link)
- [ ] **SSO / SAML button** — Enterprise SSO button that redirects to IdP (Okta, Azure AD, etc.) — Phase C feature, show placeholder button
- [ ] **Password visibility toggle** — Eye icon in password field to show/hide password text
- [ ] **Auto-detect returning user** — If user has logged in before (localStorage), pre-fill email and show "Welcome back, [name]"
- [ ] **Animated logo / freight animation** — Subtle CSS animation on the right panel: truck moving along a route, packages being sorted, or network nodes connecting
- [ ] **Dark/light mode toggle** — Small toggle in corner of login page for user preference (persisted in localStorage)

### Conditional / Role-Based Features

| Feature | Condition | Behavior |
|---|---|---|
| Social login buttons | Tenant has OAuth configured | Show Google/Microsoft buttons; hide if tenant uses SSO-only |
| SSO / SAML button | Tenant has SAML configured | Show "Sign in with SSO" button prominently; may hide password form entirely |
| Register link | Tenant allows self-registration | Show "Don't have an account? Register"; hide if invite-only |
| Magic link option | Feature flag enabled | Show "Send me a login link" below social buttons |
| Tenant branding | Email domain matches a tenant | Swap Ultra TMS logo for tenant logo, apply tenant primary color |

---

## 6. Status & State Machine

### Login Flow State Machine

```
[Idle] ---(Enter credentials)---> [Form Filled]
   |                                    |
   v                                    v
[Validation Error]              [Submitting...]
   |                                    |
   v                          +---------+---------+
[Show inline errors]          |                   |
                     [Auth Success]        [Auth Failed]
                         |                      |
                    +----+----+           +-----+-----+
                    |         |           |           |
              [MFA Required]  |    [Invalid Creds]  [Account Locked]
                    |         |           |           |
                    v         v           v           v
              [/mfa page]  [Dashboard]  [Error msg]  [Lockout msg
                                        [retry]       + countdown]
```

### Actions Available Per State

| State | Available Actions | Visual Indicators |
|---|---|---|
| Idle | Type email/password, click social login, click forgot password, click register | Empty form, placeholder text visible |
| Form Filled | Submit form, clear form, toggle password visibility | Filled inputs, Sign In button enabled |
| Submitting | None (form disabled) | Loading spinner on Sign In button, inputs disabled |
| Auth Success | None (auto-redirect) | Brief success checkmark, redirect to dashboard or /mfa |
| Auth Failed | Retry credentials, click forgot password | Red error banner below form, shake animation on form |
| Account Locked | Click forgot password, wait for lockout to expire | Red lockout banner with countdown timer, form disabled |

### Status Badge Colors

| State | Background | Text | Tailwind Classes |
|---|---|---|---|
| Success (toast) | green-100 | green-800 | `bg-green-100 text-green-800` |
| Error (invalid creds) | red-100 | red-800 | `bg-red-100 text-red-800` |
| Warning (account locked) | yellow-100 | yellow-800 | `bg-yellow-100 text-yellow-800` |
| Info (session expired) | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Sign In | None (or right arrow) | Primary / Blue-600, full-width | Submit credentials to POST /api/auth/login | No |
| Continue with Google | Google "G" icon | Secondary / Outline, full-width | Initiate Google OAuth flow | No |
| Continue with Microsoft | Microsoft icon | Secondary / Outline, full-width | Initiate Microsoft OAuth flow | No |
| Sign in with SSO | Shield/lock icon | Secondary / Outline, full-width | Redirect to SAML IdP | No |

### Secondary Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Forgot password? | None (text link) | Navigate to /forgot-password | Always visible |
| Register / Sign up | None (text link) | Navigate to /register | Tenant allows self-registration |
| Send me a login link | Mail icon | Trigger magic link email | Feature flag enabled |
| Toggle password visibility | Eye / EyeOff icon | Show/hide password text | Always visible in password field |
| Dark/light mode toggle | Sun / Moon icon | Toggle theme, persist to localStorage | Always visible, top-right corner |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Tab | Move between email, password, remember me, Sign In button |
| Enter | Submit form (when any form element is focused) |
| Escape | Clear error messages |

### Drag & Drop

N/A — No drag-and-drop interactions on the login page.

---

## 8. Real-Time Features

### WebSocket Events

N/A — The login page does not use WebSocket connections. Real-time features begin after authentication.

### Live Update Behavior

- **Tenant branding update:** When the user types their email and the domain matches a known tenant, the logo and branding colors transition smoothly (200ms CSS transition) to the tenant's branding.
- **Account lockout countdown:** If the account is locked, a real-time countdown timer shows remaining lockout time (updates every second via setInterval).

### Polling Fallback

N/A — No polling on the login page.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Submit credentials | Show loading spinner immediately, disable form | Re-enable form, show error message, focus on password field |
| Social login click | Show "Redirecting to Google/Microsoft..." overlay | If popup blocked, show "Please allow popups" message |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `login-form` | `src/components/auth/login-form.tsx` | `onSuccess: () => void, returnUrl?: string` |
| `Input` | `src/components/ui/input.tsx` | Standard shadcn input with label, error state |
| `Button` | `src/components/ui/button.tsx` | `variant: 'default' | 'outline' | 'ghost'` |
| `Checkbox` | `src/components/ui/checkbox.tsx` | `checked, onCheckedChange` |
| `Label` | `src/components/ui/label.tsx` | Standard form label |
| `Alert` | `src/components/ui/alert.tsx` | For error/warning/info banners |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `login-form` | Basic email/password fields + submit | Add social login buttons, remember me, password toggle, magic link option, tenant branding logic |
| `Input` | Standard text input | Add left/right icon slot support (mail icon, eye toggle icon) |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `SocialLoginButtons` | Google and Microsoft OAuth buttons with consistent styling | Small — two styled buttons with icon + text |
| `PasswordInput` | Input with visibility toggle (eye icon) and optional strength meter | Small — wraps Input with toggle state |
| `LoginBrandPanel` | Right-side panel with illustration, tagline, and trust badges | Medium — responsive, image/animation management |
| `TenantBrandLoader` | Logic component that detects email domain and loads tenant branding | Small — API call + context update |
| `MagicLinkForm` | Alternate form that accepts email only and sends login link | Small — email input + submit button |
| `LoginSuccessToast` | Post-login toast showing last login time and location | Small — toast component with formatted data |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Separator | `separator` | Horizontal divider with "or" text between password and social login |
| Toast | `toast` | Success/error notifications |
| Toggle | `toggle` | Dark/light mode toggle |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | POST | `/api/auth/login` | Authenticate with email/password | `useLogin()` |
| 2 | POST | `/api/auth/login/google` | Google OAuth callback | `useGoogleLogin()` |
| 3 | POST | `/api/auth/login/microsoft` | Microsoft OAuth callback | `useMicrosoftLogin()` |
| 4 | POST | `/api/auth/magic-link` | Send magic link email | `useMagicLink()` |
| 5 | GET | `/api/auth/tenant-branding?domain={domain}` | Fetch tenant branding by email domain | `useTenantBranding(domain)` |
| 6 | POST | `/api/auth/refresh` | Silent token refresh | `useRefreshToken()` |
| 7 | GET | `/api/auth/sso/config?domain={domain}` | Check if domain has SSO configured | `useSsoConfig(domain)` |

### Request/Response Examples

**POST /api/auth/login**
```json
// Request
{
  "email": "john@ultralogistics.com",
  "password": "SecureP@ss123",
  "rememberMe": true,
  "deviceFingerprint": "abc123def456"
}

// Response (success, no MFA)
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "usr_001",
    "email": "john@ultralogistics.com",
    "name": "John Doe",
    "role": "dispatcher",
    "tenantId": "tnt_001",
    "lastLoginAt": "2025-02-05T14:30:00Z",
    "lastLoginIp": "192.168.1.100"
  },
  "mfaRequired": false
}

// Response (success, MFA required)
{
  "mfaRequired": true,
  "mfaSessionToken": "mfa_sess_xyz",
  "mfaMethods": ["totp", "sms"],
  "preferredMethod": "totp"
}

// Response (failure)
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "remainingAttempts": 3
}

// Response (locked)
{
  "error": "ACCOUNT_LOCKED",
  "message": "Account temporarily locked due to too many failed attempts",
  "lockoutExpiresAt": "2025-02-06T15:00:00Z"
}
```

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 404 | 429 | 500 |
|---|---|---|---|---|---|---|
| POST /api/auth/login | Validation error (show inline) | Invalid credentials (show error banner) | Account deactivated (show specific message) | N/A | Rate limited (show "Too many attempts" with retry timer) | Show generic error with retry |
| GET /api/auth/tenant-branding | N/A | N/A | N/A | Use default Ultra TMS branding | N/A | Use default branding |
| POST /api/auth/magic-link | Invalid email format | N/A | N/A | "No account found" (intentionally vague for security) | Rate limited | Show error toast |

---

## 11. States & Edge Cases

### Loading State

- **Initial page load:** Show the login form immediately with Ultra TMS default branding. No skeleton needed — the form is static.
- **Form submitting:** Show a spinner inside the Sign In button, replace text with "Signing in..." Disable all form inputs and buttons. Apply 50% opacity to form fields.
- **Tenant branding loading:** When email domain triggers branding fetch, show a subtle shimmer on the logo area (200ms) while branding loads, then cross-fade to tenant logo.

### Empty States

N/A — The login page always shows the form. There is no "empty" data state.

### Error States

**Invalid credentials:**
- Display: Red alert banner below the form title: "Invalid email or password. Please try again."
- Behavior: Clear password field, keep email filled, focus on password input. Subtle shake animation on the form container (300ms).
- Show remaining attempts if < 3: "2 attempts remaining before account lockout."

**Account locked:**
- Display: Yellow/orange alert banner: "Your account has been temporarily locked due to too many failed login attempts. Please try again in [countdown] or reset your password."
- Behavior: Disable email and password inputs. Show countdown timer updating every second. Show prominent "Reset Password" link.

**Account deactivated:**
- Display: Red alert banner: "Your account has been deactivated. Please contact your administrator."
- Behavior: Disable form entirely. Show admin contact information if available.

**Network error:**
- Display: Red alert banner: "Unable to connect to the server. Please check your internet connection and try again."
- Behavior: Show retry button. Do not clear form inputs.

**Session expired (redirected from another page):**
- Display: Blue info banner: "Your session has expired. Please sign in again."
- Behavior: Pre-fill email if available from previous session. Clear after successful login.

### Permission Denied

N/A — The login page is publicly accessible (unauthenticated route). If an already-authenticated user navigates to /login, redirect them to the dashboard.

### Offline / Degraded

- **Full offline:** Show a persistent banner: "You are offline. Login requires an internet connection." Disable the Sign In button but keep form inputs enabled so users can type.
- **Slow connection:** If login request takes > 5 seconds, show additional text below the spinner: "This is taking longer than expected..."

---

## 12. Filters, Search & Sort

N/A — The login page does not have data listing, filtering, or sorting functionality.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Split layout changes to 45/55 (form takes slightly less space)
- Right panel illustration scales down proportionally
- Form max-width remains 400px, centered in left panel
- Social login buttons remain full-width within form

### Mobile (< 768px)

- **Layout switches to single-column:** Right brand panel is hidden entirely; form takes full width
- Logo and form centered on white background
- Form max-width 100% with 24px horizontal padding
- Social login buttons stack vertically, full width
- "Remember me" checkbox remains visible
- Footer links stack vertically
- Touch-friendly input sizes: min-height 48px for inputs and buttons
- Keyboard-aware: form scrolls up when soft keyboard opens to keep active input visible

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | 50/50 split, full illustration panel |
| Desktop | 1024px - 1439px | 50/50 split, illustration may be simpler |
| Tablet | 768px - 1023px | 45/55 split, smaller illustration |
| Mobile | < 768px | Single column, no illustration panel |

---

## 14. Stitch Prompt

```
Design a polished, modern Login page for a freight logistics TMS (Transportation Management System) called "Ultra TMS." This is a SaaS product used by freight brokers, dispatchers, and logistics professionals. Use a clean, modern aesthetic similar to Linear.app, Vercel, or Clerk login pages with generous whitespace and premium feel.

Layout: Full-screen split layout, no sidebar. The left half (50% width) has a white background and contains the centered login form. The right half (50% width) has a dark slate-900 background with a logistics-themed brand area. On mobile, only the left form panel is shown.

Left Side — Login Form (centered, max-width 400px):
At the top, display the "Ultra TMS" logo — a stylized blue-600 truck/freight icon next to "Ultra TMS" in 28px semibold slate-900 text. Below the logo, "Transportation Management System" in 14px gray-500. Add 32px of spacing.

Welcome section: "Welcome back" in 24px semibold gray-900. Below: "Sign in to your account to continue" in 14px gray-500. Add 24px spacing.

Form fields with 16px spacing between them:
1. "Email Address" label in 14px medium gray-700. Below it, a text input with gray-200 border, rounded-md, a subtle mail icon on the left inside the input in gray-400, placeholder "you@company.com".
2. "Password" label in 14px medium gray-700 with "Forgot password?" as a blue-600 text link right-aligned on the same line. Below, a password input with gray-200 border, rounded-md, an eye icon on the right for visibility toggle in gray-400, placeholder dots.

Below the password field: a "Remember me for 30 days" checkbox (blue-600 when checked) on the left in 14px gray-600.

Full-width "Sign In" button: blue-600 background, white text, 14px semibold, rounded-md, height 44px, hover state blue-700. Below the button, show a horizontal divider line (gray-200) with "or" text centered in gray-400 on a white background overlay.

Two social login buttons, full width, stacked with 8px gap:
- "Continue with Google" — white background, gray-200 border, rounded-md, Google "G" colored icon on the left, gray-700 text
- "Continue with Microsoft" — white background, gray-200 border, rounded-md, Microsoft four-square icon on the left, gray-700 text

Below social buttons, 16px spacing, then: "Enterprise SSO" as a gray-500 text link with a small lock icon.

At the very bottom: "Don't have an account?" in gray-500 with "Sign up" as a blue-600 link. Below that, a subtle "Contact your administrator" link in gray-400.

Right Side — Brand Area (slate-900 background):
Centered vertically and horizontally. Show a sophisticated, abstract illustration of a logistics network — glowing blue-400 and blue-600 nodes connected by subtle lines forming a network/route pattern over a faint map outline. The style should feel modern, data-driven, and premium — like a hero image from a SaaS landing page, not clip art.

Below the illustration: "Streamline your freight operations from order to delivery" in 20px medium white text, max-width 360px, centered. Below that: "Trusted by 500+ logistics companies across North America" in 14px white with 60% opacity.

Below the trust statement, show 3 faint placeholder company logo shapes in white at 25% opacity, arranged horizontally with 24px gaps.

Footer: Spanning the full width at the very bottom, 12px gray-400 text. Left side: "(c) 2025 Ultra TMS. All rights reserved." Right side: "Privacy Policy" and "Terms of Service" as subtle links separated by a dot.

Design specs: Font Inter or system sans-serif. 14px base. Inputs have 12px padding, focus ring in blue-600. Everything feels spacious, premium, and trustworthy. The overall impression should convey "enterprise-grade security meets modern usability."
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Email and password input form with client-side validation
- [x] POST /api/auth/login integration with JWT response handling
- [x] Refresh token storage in httpOnly cookie
- [x] Redirect to /mfa when MFA is required
- [x] Redirect to dashboard on successful authentication
- [x] "Forgot Password" link to /forgot-password
- [x] "Register" link to /register
- [x] Error message display for invalid credentials
- [x] Account lockout handling with error message
- [x] Basic responsive layout (form centers on smaller screens)

**What needs polish / bug fixes:**
- [ ] Loading skeleton does not match form layout — currently shows a generic spinner instead of a disabled form state
- [ ] Error messages are generic ("Something went wrong") instead of specific ("Invalid email or password")
- [ ] No visual feedback on form submission — button does not show loading state
- [ ] Page flashes white on load before styles are applied (FOUC)
- [ ] Tab order skips the "Forgot password" link
- [ ] No auto-focus on email input when page loads
- [ ] Right panel (if any) is not responsive — breaks on tablet sizes
- [ ] Password field does not support paste (some browsers block it; needs explicit allowance)

**What to add this wave:**
- [ ] **Password visibility toggle** — Add eye/eye-off icon to password field (low effort, high usability impact)
- [ ] **Remember me checkbox** — Extend refresh token to 30 days, store device fingerprint
- [ ] **Social login buttons (Google, Microsoft)** — Add OAuth buttons below form with "or" divider
- [ ] **Tenant branding** — Detect email domain on blur, load tenant logo and colors
- [ ] **Brand panel (right side)** — Add illustration panel with logistics imagery and trust messaging
- [ ] **Auto-detect returning user** — Pre-fill email from localStorage for returning users
- [ ] **Session expired banner** — Show blue info banner when redirected from expired session
- [ ] **Last login notification** — Toast showing last login time/location after successful auth
- [ ] **Dark/light mode toggle** — Small theme toggle in top-right corner
- [ ] **Animated freight illustration** — Subtle CSS/SVG animation on right panel
- [ ] **SSO/SAML button placeholder** — "Enterprise SSO" link for future implementation
- [ ] **Magic link login option** — "Send me a login link" for passwordless auth

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Password visibility toggle | High | Low | **P0** |
| Remember me checkbox | High | Low | **P0** |
| Social login buttons (UI only) | High | Medium | **P0** |
| Auto-detect returning user (pre-fill email) | Medium | Low | **P0** |
| Session expired banner | Medium | Low | **P0** |
| Brand panel with illustration | High | Medium | **P1** |
| Tenant branding (logo swap on email domain) | High | Medium | **P1** |
| Last login notification toast | Medium | Low | **P1** |
| Dark/light mode toggle | Low | Low | **P1** |
| SSO/SAML button placeholder | Medium | Low | **P1** |
| Magic link login option | Medium | High | **P2** |
| Animated freight illustration | Low | Medium | **P2** |
| Inline MFA (no redirect to /mfa) | High | High | **P2** |
| Full Google OAuth backend integration | High | High | **P2** |
| Full Microsoft OAuth backend integration | High | High | **P2** |

### Future Wave Preview

- **Wave 2:** Full OAuth backend integration (Google, Microsoft), SAML/SSO flow implementation, magic link backend, biometric login support (WebAuthn/passkeys), risk-based authentication (flag suspicious login locations)
- **Wave 3:** Adaptive authentication (skip MFA for trusted devices/locations), login analytics dashboard for admins (failed attempts, geographic distribution), A/B testing on login page conversion, custom login page builder per tenant

---

*This document was created as part of the Wave 1 Enhancement Focus design process for Ultra TMS Auth & Admin service.*
