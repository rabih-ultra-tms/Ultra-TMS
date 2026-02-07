# Register

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /register | Status: **Built** | Type: Auth / Form
> Primary Personas: New users (company owners, admins setting up a new tenant)
> Roles with Access: Public (unauthenticated)

---

## 1. Purpose & Business Context

**What this screen does:**
The registration page allows new users to create an account on Ultra TMS. Currently, it collects name, email, password, and company name in a single-step form. The user receives a verification email after submission and, once verified, can log in and begin setting up their organization.

**Business problem it solves:**
Self-service onboarding reduces the sales and support team burden. Without this screen, every new customer would require manual account provisioning by an admin. A frictionless registration experience directly impacts conversion rates from trial interest to active accounts. In the freight/logistics industry, many users are not tech-savvy, so the form must be clear, trustworthy, and simple.

**Key business rules:**
- Email must be unique across all tenants (one email = one account)
- Company name creates a new tenant if self-registration is enabled
- Password must meet complexity requirements (8+ chars, mixed case, number, special char)
- A verification email is sent immediately after registration
- Account is in "pending verification" status until email is confirmed
- If the email domain matches an existing tenant with invite-only registration, show a message: "Your organization requires an invitation. Contact your administrator."
- Referral codes are optional and tracked for marketing attribution

**Success metric:**
Registration completion rate exceeds 70% (visitors who start the form vs. those who complete it). Time from registration to first login under 5 minutes. Email verification rate exceeds 85% within 24 hours.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Login page | "Don't have an account? Sign up" link | None |
| Marketing website | "Start Free Trial" or "Sign Up" CTA | `?plan=starter` or `?ref=PARTNER123` |
| Email invitation | Invited user clicks "Accept Invitation" link | `?invite=TOKEN&email=user@company.com` |
| Direct URL | Shared link or bookmark | Optional `?ref=` referral code |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Email Verification Pending page | Successful registration | User email for "Check your inbox" message |
| Login page (/login) | "Already have an account?" link | None |
| Login page (/login) | After email verification (from email link) | `?verified=true&email=user@company.com` |

**Primary trigger:**
A potential customer decides to try Ultra TMS — either from a marketing campaign, sales demo follow-up, referral, or organic discovery. They click "Sign Up" and land on this page.

**Success criteria (user completes the screen when):**
- User has filled all required fields and submitted the form
- Verification email has been sent
- User sees the "Check your email" confirmation screen

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
|  |                           |  |                               |  |
|  |    "Create your account"  |  |    Feature highlights:        |  |
|  |    "Start managing your   |  |    - "Real-time tracking"     |  |
|  |     freight in minutes"   |  |    - "Automated dispatching"  |  |
|  |                           |  |    - "Financial management"   |  |
|  |    === STEP INDICATOR ===  |  |                               |  |
|  |    (1)---(2)---(3)---(4)  |  |    Testimonial quote:         |  |
|  |                           |  |    "Ultra TMS cut our         |  |
|  |    [Current Step Form]    |  |     dispatch time by 60%"     |  |
|  |                           |  |    — Mike R., Broker          |  |
|  |    [Back] [Continue]      |  |                               |  |
|  |                           |  |    Trust badges:              |  |
|  |    Already have account?  |  |    SOC2 | HIPAA | 99.9% SLA  |  |
|  |    Sign in                |  |                               |  |
|  |                           |  |                               |  |
|  +---------------------------+  +-------------------------------+  |
|                                                                    |
|  [Footer: (c) 2025 Ultra TMS | Privacy | Terms]                   |
+------------------------------------------------------------------+
```

### Multi-Step Form Layout (Enhancement)

```
Step 1: Email & Password          Step 2: Verify Email
+------------------------+       +------------------------+
| Email Address          |       | Check your inbox!      |
| Password               |       | We sent a code to      |
| Confirm Password       |       | john@company.com       |
| [Password Strength Bar]|       |                        |
| [Continue ->]          |       | [_ _ _ _ _ _] code    |
+------------------------+       | [Resend code] [Change] |
                                 +------------------------+

Step 3: Your Profile              Step 4: Company Setup
+------------------------+       +------------------------+
| First Name             |       | Company Name           |
| Last Name              |       | Industry [Dropdown]    |
| Phone Number           |       | Team Size [Selector]   |
| Job Title              |       | Company Logo [Upload]  |
| [<- Back] [Continue ->]|       | Referral Code          |
+------------------------+       | [<- Back] [Complete]   |
                                 +------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | Current step form fields, progress indicator, Continue button | Users need to focus on the current step without distraction |
| **Secondary** (visible but less prominent) | Step indicator, "Already have an account?" link, password requirements | Context for where they are and escape hatch |
| **Tertiary** (on the right panel) | Feature highlights, testimonial, trust badges | Social proof and value reinforcement during registration |
| **Hidden** (behind interaction) | Terms of service full text, privacy policy, referral code field | Available when needed, not cluttering the form |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source | Format / Display | Step |
|---|---|---|---|---|
| 1 | Email Address | User input | Email format, lowercase | Step 1 |
| 2 | Password | User input | Masked, strength meter below | Step 1 |
| 3 | Confirm Password | User input | Masked, match validation | Step 1 |
| 4 | Verification Code | User input (from email) | 6-digit numeric, spaced input boxes | Step 2 |
| 5 | First Name | User input | Text, max 50 chars | Step 3 |
| 6 | Last Name | User input | Text, max 50 chars | Step 3 |
| 7 | Phone Number | User input | Phone format with country code | Step 3 |
| 8 | Job Title | User input | Text, max 100 chars | Step 3 |
| 9 | Company Name | User input | Text, max 200 chars | Step 4 |
| 10 | Industry | User selection | Dropdown: Freight Broker, Carrier, Shipper, 3PL, Other | Step 4 |
| 11 | Team Size | User selection | Radio/selector: 1-5, 6-20, 21-50, 51-200, 200+ | Step 4 |
| 12 | Company Logo | User upload | Image (PNG/JPG/SVG, max 2MB), drag-drop area | Step 4 |
| 13 | Referral Code | User input (optional) | Alphanumeric, max 20 chars | Step 4 |
| 14 | Terms Checkbox | User input | Checkbox: "I agree to Terms and Privacy Policy" | Step 1 |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Password Strength | Evaluate against complexity rules (length, case, numbers, special chars) | Visual bar: red (weak), yellow (fair), green (strong), with text label |
| 2 | Password Match | Compare password and confirm password fields | Green checkmark or red X icon on confirm field |
| 3 | Email Domain Check | Check if email domain matches existing tenant | Info message: "Your organization uses Ultra TMS!" or warning if invite-only |

---

## 5. Features

### Core Features (Already Built)

- [x] Single-step registration form (name, email, password, company name)
- [x] Client-side email format validation
- [x] Client-side password minimum length validation
- [x] POST /api/auth/register endpoint integration
- [x] Verification email triggered on successful registration
- [x] Redirect to login page after registration
- [x] "Already have an account?" link to /login
- [x] Error handling for duplicate email
- [x] Terms of service checkbox (basic)

### Enhancement Features (Wave 1 — To Add)

- [ ] **Multi-step registration wizard** — Break the single form into 4 steps: (1) Email & Password, (2) Email Verification, (3) Profile Details, (4) Company Setup. Progress indicator at top.
- [ ] **Password strength meter** — Visual animated bar below password field showing strength (weak/fair/strong/excellent) with real-time feedback as user types
- [ ] **Password requirements checklist** — Live-updating checklist: min 8 chars, uppercase, lowercase, number, special char. Each requirement shows green check or gray circle
- [ ] **Company logo upload** — Drag-and-drop zone during company setup step. Preview the uploaded logo. Accept PNG/JPG/SVG up to 2MB
- [ ] **Industry selection dropdown** — "What type of company are you?" with options: Freight Broker, Carrier, Shipper, 3PL, Freight Forwarder, Other
- [ ] **Team size selector** — Visual selector cards (not dropdown) for team size ranges: 1-5, 6-20, 21-50, 51-200, 200+
- [ ] **Referral code field** — Optional field at company setup step. Auto-populate from `?ref=` URL parameter. Show "Referral applied!" badge if valid
- [ ] **Google reCAPTCHA v3** — Invisible reCAPTCHA on form submission to prevent bot registrations
- [ ] **Terms of service with modal** — Checkbox links open Terms and Privacy Policy in a modal or new tab, not navigate away
- [ ] **Email verification inline** — After step 1, verify email immediately with a 6-digit code (sent to email), rather than requiring user to leave the page
- [ ] **Social signup** — "Sign up with Google" and "Sign up with Microsoft" options above the form
- [ ] **Confirm password field** — Add confirm password with real-time match indicator
- [ ] **Phone number with country code** — International phone input with country flag selector

### Conditional / Role-Based Features

| Feature | Condition | Behavior |
|---|---|---|
| Full registration form | Tenant allows self-registration | Show complete multi-step form |
| Invite-only message | Email domain matches invite-only tenant | Show: "Your organization requires an invitation. Contact your admin." Hide registration form |
| Pre-filled fields | Invitation token in URL | Pre-fill email (read-only), skip email verification step, show remaining steps |
| Referral code auto-fill | `?ref=` URL parameter present | Auto-fill referral code field, show "Referral from [partner]" badge |
| Plan selection | `?plan=` URL parameter present | Pre-select the plan tier, show plan features on right panel |

---

## 6. Status & State Machine

### Registration Flow State Machine

```
[Step 1: Credentials]
       |
       v
[Validate email + password] ---(Invalid)---> [Show errors, stay on Step 1]
       |
       | (Valid)
       v
[Step 2: Email Verification]
       |
       v
[User enters 6-digit code] ---(Invalid)---> [Show error, allow retry / resend]
       |
       | (Valid)
       v
[Step 3: Profile Details]
       |
       v
[Validate profile fields] ---(Invalid)---> [Show errors, stay on Step 3]
       |
       | (Valid)
       v
[Step 4: Company Setup]
       |
       v
[Submit registration] ---(Failed)---> [Show error, stay on Step 4]
       |
       | (Success)
       v
[Account Created — Redirect to Login]
```

### Account Status After Registration

| Status | Description | Next Action |
|---|---|---|
| Pending Verification | Email not yet verified (if not using inline verification) | User clicks verification link in email |
| Active | Email verified, account ready | User can log in |
| Invited (pre-registration) | Admin invited user, awaiting registration completion | User completes registration form |

### Status Badge Colors

| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| Step Complete | green-100 | green-800 | `bg-green-100 text-green-800` |
| Current Step | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| Upcoming Step | gray-100 | gray-500 | `bg-gray-100 text-gray-500` |
| Error | red-100 | red-800 | `bg-red-100 text-red-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Continue | Right arrow | Primary / Blue-600, full-width | Validate current step, advance to next | No |
| Complete Registration | Checkmark | Primary / Blue-600, full-width | Submit final registration | No |
| Back | Left arrow | Secondary / Outline | Go to previous step | No |
| Sign up with Google | Google icon | Secondary / Outline, full-width | Initiate Google OAuth signup | No |
| Sign up with Microsoft | Microsoft icon | Secondary / Outline, full-width | Initiate Microsoft OAuth signup | No |

### Secondary Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Already have an account? Sign in | None (text link) | Navigate to /login | Always visible |
| Resend verification code | Mail icon | Re-send verification email | Step 2, timer expired (60s cooldown) |
| Change email | Edit icon | Go back to Step 1 to change email | Step 2 |
| Skip (company logo upload) | None (text link) | Skip logo upload, proceed with default | Step 4, logo upload field |
| Terms of Service | None (text link) | Open Terms in modal | Step 1 |
| Privacy Policy | None (text link) | Open Privacy Policy in modal | Step 1 |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Tab | Navigate between form fields |
| Enter | Submit current step / advance to next step |
| Escape | Close Terms/Privacy modal |
| Backspace (in verification code) | Move to previous digit |

### Drag & Drop

| Draggable Element | Drop Target | Action |
|---|---|---|
| Image file | Company logo upload zone | Upload and preview logo |

---

## 8. Real-Time Features

### WebSocket Events

N/A — Registration page does not use WebSocket connections.

### Live Update Behavior

- **Password strength meter:** Updates in real-time as user types, with smooth CSS transitions on the strength bar width and color
- **Password requirements checklist:** Each requirement toggles between gray circle (unmet) and green checkmark (met) as user types, with subtle fade transition
- **Confirm password match:** Real-time match indicator updates on each keystroke in the confirm field
- **Email domain detection:** On email field blur, check if domain matches an existing tenant (300ms debounce)
- **Verification code auto-submit:** When all 6 digits are entered, automatically submit for verification without requiring button click

### Polling Fallback

- **Verification email delivery check:** If user reports not receiving email, poll /api/auth/verify-status every 10 seconds for 2 minutes to check if email was delivered

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Step advancement | Immediately show next step with slide animation | Slide back to previous step, show error |
| Verification code submit | Show spinning indicator on code input | Show error message, clear code, refocus first digit |
| Final registration submit | Show loading state on Complete button | Re-enable form, show error banner |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `register-form` | `src/components/auth/register-form.tsx` | `onSuccess: () => void` |
| `Input` | `src/components/ui/input.tsx` | Standard shadcn input |
| `Button` | `src/components/ui/button.tsx` | Various variants |
| `Checkbox` | `src/components/ui/checkbox.tsx` | For Terms of Service |
| `Label` | `src/components/ui/label.tsx` | Form labels |
| `Select` | `src/components/ui/select.tsx` | For industry dropdown |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `register-form` | Single-step with 4 fields | Refactor into multi-step wizard with 4 steps, add all new fields |
| `Input` | Basic text input | Add icon slots (left/right) for email icon, password toggle |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `RegistrationWizard` | Multi-step form container with step indicator, navigation, and step transitions | Medium — manages step state, validation per step, animations |
| `StepIndicator` | Horizontal progress indicator showing 4 steps with completed/current/upcoming states | Small — circles + connecting lines with state |
| `PasswordStrengthMeter` | Animated horizontal bar showing password strength with color transitions | Small — strength calculation + CSS animation |
| `PasswordRequirementsList` | Checklist of requirements that toggle green/gray in real-time | Small — list of boolean checks |
| `VerificationCodeInput` | 6 separate digit input boxes that auto-advance and auto-submit | Medium — focus management, paste handling |
| `TeamSizeSelector` | Visual card-based selector for team size ranges | Small — styled radio group as cards |
| `LogoUploadZone` | Drag-and-drop area with preview and file validation | Medium — file handling, image preview, size validation |
| `IndustrySelect` | Styled dropdown with freight-specific industry options and icons | Small — enhanced Select with icons |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| Progress | `progress` | Step indicator progress bar |
| Dialog | `dialog` | Terms of Service / Privacy Policy modal |
| RadioGroup | `radio-group` | Team size selector (base for card variant) |
| Avatar | `avatar` | Logo preview |
| InputOTP | `input-otp` | Verification code input (6 digits) |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | Create new account (step 1 submission) | `useRegister()` |
| 2 | POST | `/api/auth/verify-email` | Verify email with 6-digit code | `useVerifyEmail()` |
| 3 | POST | `/api/auth/resend-verification` | Resend verification email | `useResendVerification()` |
| 4 | PATCH | `/api/auth/complete-profile` | Submit profile details (step 3) | `useCompleteProfile()` |
| 5 | PATCH | `/api/auth/complete-company` | Submit company setup (step 4) | `useCompleteCompany()` |
| 6 | POST | `/api/auth/upload-logo` | Upload company logo image | `useUploadLogo()` |
| 7 | GET | `/api/auth/check-email?email={email}` | Check if email is available | `useCheckEmail(email)` |
| 8 | GET | `/api/auth/validate-referral?code={code}` | Validate referral code | `useValidateReferral(code)` |
| 9 | POST | `/api/auth/register/google` | Google OAuth registration | `useGoogleRegister()` |
| 10 | POST | `/api/auth/register/microsoft` | Microsoft OAuth registration | `useMicrosoftRegister()` |

### Request/Response Examples

**POST /api/auth/register**
```json
// Request
{
  "email": "john@newlogistics.com",
  "password": "SecureP@ss123",
  "recaptchaToken": "03AGdBq27..."
}

// Response (success)
{
  "userId": "usr_new_001",
  "email": "john@newlogistics.com",
  "verificationSent": true,
  "verificationExpiry": "2025-02-06T16:00:00Z"
}

// Response (duplicate email)
{
  "error": "EMAIL_EXISTS",
  "message": "An account with this email already exists"
}
```

### Error Handling per Endpoint

| Endpoint | 400 | 409 | 422 | 429 | 500 |
|---|---|---|---|---|---|
| POST /api/auth/register | Validation errors (show inline per field) | Email already exists (show specific message) | Password too weak (show requirements) | Rate limited ("Please wait before trying again") | Generic error with retry |
| POST /api/auth/verify-email | Invalid code format | N/A | Code expired (show "Resend code" option) | Too many attempts | Generic error |
| POST /api/auth/upload-logo | File too large / wrong format | N/A | N/A | N/A | Upload failed, show retry |

---

## 11. States & Edge Cases

### Loading State

- **Initial page load:** Show form immediately — registration forms are static, no data to fetch
- **Step transition:** Smooth slide-left animation (300ms) when advancing, slide-right when going back
- **Form submitting:** Loading spinner in Continue/Complete button, disable all inputs in current step
- **Logo upload:** Show upload progress bar inside the drop zone

### Empty States

N/A — Registration form always shows input fields. No data-driven empty states.

### Error States

**Email already exists (409):**
- Display: Inline error below email field: "An account with this email already exists." Show "Sign in instead" link next to the error.
- Behavior: Keep form on Step 1, focus email field, highlight field border in red

**Invalid verification code:**
- Display: Shake animation on code inputs, red border on all digit boxes, text: "Invalid code. Please try again."
- Behavior: Clear code inputs, refocus first digit, decrement remaining attempts counter

**Verification code expired:**
- Display: Warning banner: "Your verification code has expired." Show prominent "Resend Code" button
- Behavior: Disable code input until user clicks resend

**Password too weak:**
- Display: Inline error below password field. Password strength meter stays red. Requirements checklist shows unmet items
- Behavior: Prevent advancement to next step. Focus password field

**reCAPTCHA failure:**
- Display: Toast error: "Verification failed. Please try again."
- Behavior: Refresh reCAPTCHA, re-enable submit button

**Network error:**
- Display: Red toast: "Connection error. Please check your internet and try again."
- Behavior: Keep form data intact, re-enable submit button

### Permission Denied

- If an authenticated user navigates to /register, redirect them to the dashboard
- If tenant is invite-only and email domain matches, show a message instead of the form: "Your organization [Company Name] uses Ultra TMS but requires an invitation to register. Please contact your administrator."

### Offline / Degraded

- **Full offline:** Show persistent banner: "You are offline. Registration requires an internet connection." Disable submit buttons but allow users to fill in fields (data preserved).

---

## 12. Filters, Search & Sort

N/A — The registration page does not have data listing, filtering, or sorting functionality.

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- Split layout changes to 40/60 (form takes more space)
- Right panel content reduces to just the tagline and one feature highlight
- Step indicator remains horizontal
- Form max-width 400px, centered in left panel

### Mobile (< 768px)

- **Single-column layout:** Right brand panel is hidden entirely
- Form takes full width with 24px horizontal padding
- Step indicator becomes compact: show only step numbers (no labels), current step highlighted
- Logo upload zone becomes a simple file picker button instead of drag-and-drop
- Team size selector cards stack 2 per row instead of all in one row
- Touch-friendly inputs: min-height 48px
- Verification code digits remain 6 boxes, but larger (48x48px each) for easier tapping
- Back/Continue buttons become fixed at bottom of viewport
- Social login buttons stack vertically

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | 50/50 split, full brand panel |
| Desktop | 1024px - 1439px | 50/50 split, condensed brand panel |
| Tablet | 768px - 1023px | 40/60 split, minimal brand panel |
| Mobile | < 768px | Single column, no brand panel |

---

## 14. Stitch Prompt

```
Design a modern, multi-step Registration page for a freight logistics TMS (Transportation Management System) called "Ultra TMS." Use a clean, premium SaaS aesthetic similar to Linear.app, Clerk, or Stripe signup pages.

Layout: Full-screen split layout, no sidebar. The left half (50% width) has a white background and contains the registration wizard. The right half (50% width) has a dark slate-900 background with value proposition content. On mobile, only the left form panel is shown.

Left Side — Registration Form (centered, max-width 440px):
At the top, display the "Ultra TMS" logo — a stylized blue-600 truck/freight icon next to "Ultra TMS" in 24px semibold slate-900. Below, "Transportation Management System" in 13px gray-500.

Below the logo (24px spacing), show a horizontal step indicator with 4 steps connected by lines. Step 1 "Account" has a blue-600 filled circle with a white checkmark (completed, filled connecting line to step 2). Step 2 "Verify" has a blue-600 filled circle with white "2" (current/active step). Step 3 "Profile" has a gray-300 outlined circle with gray "3" (upcoming). Step 4 "Company" has a gray-300 outlined circle with gray "4" (upcoming). Labels below each circle in 12px text (blue-600 for completed/active, gray-400 for upcoming).

Below the step indicator (24px spacing), show the heading "Verify your email" in 20px semibold gray-900. Below: "We sent a 6-digit code to john@newlogistics.com" in 14px gray-500, with the email in semibold.

Main content area showing Step 2 (Email Verification):
Display 6 separate square input boxes (48px x 48px each) in a horizontal row with 8px gaps. Each box has a gray-200 border, rounded-md, centered text in 24px semibold gray-900. The first 3 boxes contain "4", "7", "2" in black text (partially filled). The 4th box has a blinking cursor (active/focused with blue-600 border ring). The 5th and 6th boxes are empty with gray-200 borders.

Below the code inputs (16px spacing): "Didn't receive the code?" in 14px gray-500, followed by a "Resend code" blue-600 text link. Next to it, show a subtle countdown timer: "Resend available in 0:42" in 13px gray-400.

Below (8px spacing): "Wrong email?" as a gray-500 text link with "Change email" as a blue-600 link next to it.

Below (32px spacing): A full-width "Verify & Continue" button in blue-600 background, white text, 14px semibold, rounded-md, height 44px.

At the bottom of the form: "Already have an account?" in 14px gray-500 with "Sign in" as a blue-600 link.

Right Side — Value Proposition (slate-900 background):
Centered vertically. At the top, show a clean illustration of a logistics dashboard mockup with subtle blue-400 and blue-600 accents — screens showing maps, charts, and route lines in a stylized, abstract way.

Below the illustration (32px spacing): "Everything you need to manage freight operations" in 22px medium white text, max-width 380px, centered.

Below (24px spacing), show 3 feature bullet points in a vertical list:
1. A blue-600 checkmark icon + "Real-time shipment tracking & visibility" in 15px white text
2. A blue-600 checkmark icon + "Automated dispatching & carrier matching" in 15px white text
3. A blue-600 checkmark icon + "Integrated invoicing & financial reporting" in 15px white text

Below (32px spacing): A testimonial in a subtle white/10% background rounded-lg card with 20px padding. Quote: "Ultra TMS cut our dispatch time by 60% and eliminated double-entry across our systems." Attribution: "— Mike Rodriguez, Operations Manager at Summit Freight" in 13px white/70% opacity.

Below (24px spacing): Three small trust badges in a horizontal row — "SOC 2 Compliant", "99.9% Uptime SLA", "256-bit Encryption" — each in 11px uppercase white/50% opacity with a small shield/lock icon.

Footer: Full-width, 12px gray-400 text. Left: "(c) 2025 Ultra TMS." Right: "Privacy Policy | Terms of Service" as subtle links.

Design specs: Font Inter or system sans-serif, 14px base. Blue-600 primary. The entire experience should feel premium, trustworthy, and fast — making the user confident they are signing up for a professional tool.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] Single-step registration form with Name, Email, Password, Company Name fields
- [x] Client-side email and password validation
- [x] POST /api/auth/register integration
- [x] Verification email sent on registration
- [x] Redirect to login after registration
- [x] "Already have an account?" link
- [x] Duplicate email error handling
- [x] Terms of service checkbox (basic)

**What needs polish / bug fixes:**
- [ ] Password field has no strength indicator — users don't know if their password is strong enough until submission fails
- [ ] No confirm password field — users may mistype password and not realize until login
- [ ] Verification flow requires leaving the page (click email link) — high drop-off point
- [ ] Error messages are generic and not actionable
- [ ] Form loses all data if user navigates away and comes back
- [ ] No loading state on submit button
- [ ] Company name validation is too loose (allows single characters)
- [ ] No reCAPTCHA — vulnerable to bot registrations
- [ ] Terms checkbox is not linked to actual Terms and Privacy documents

**What to add this wave:**
- [ ] **Multi-step wizard** — Break into 4 steps for reduced cognitive load and better data collection
- [ ] **Password strength meter** — Real-time visual bar (weak → excellent) with color transitions
- [ ] **Password requirements checklist** — Live-updating list of complexity requirements
- [ ] **Confirm password field** — With real-time match indicator
- [ ] **Inline email verification** — 6-digit code entry on Step 2 instead of leaving the page
- [ ] **Industry selection** — Freight Broker, Carrier, Shipper, 3PL dropdown for user segmentation
- [ ] **Team size selector** — Visual card-based selector for sizing and plan recommendations
- [ ] **Company logo upload** — Drag-and-drop with preview during company setup
- [ ] **Referral code field** — Optional field, auto-fill from URL param, validate on blur
- [ ] **Google reCAPTCHA v3** — Invisible bot protection on form submission
- [ ] **Terms of service modal** — Open full Terms/Privacy in modal instead of navigating away
- [ ] **Social signup (Google, Microsoft)** — OAuth-based registration option
- [ ] **Right panel value proposition** — Feature highlights, testimonial, trust badges
- [ ] **Form data persistence** — Save progress to sessionStorage so data survives page refresh
- [ ] **Invitation flow integration** — Pre-fill email and skip verification when registering via invite link

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Password strength meter | High | Low | **P0** |
| Password requirements checklist | High | Low | **P0** |
| Confirm password field | High | Low | **P0** |
| Inline email verification (6-digit code) | High | Medium | **P0** |
| Google reCAPTCHA v3 | High | Low | **P0** |
| Multi-step wizard (4 steps) | High | High | **P1** |
| Industry selection dropdown | Medium | Low | **P1** |
| Team size selector | Medium | Low | **P1** |
| Terms of service modal | Medium | Low | **P1** |
| Right panel value proposition | Medium | Medium | **P1** |
| Form data persistence (sessionStorage) | Medium | Low | **P1** |
| Referral code field | Low | Low | **P1** |
| Company logo upload | Medium | Medium | **P2** |
| Social signup (Google/Microsoft) | High | High | **P2** |
| Invitation flow integration | Medium | Medium | **P2** |
| Phone number with country code | Low | Medium | **P2** |

### Future Wave Preview

- **Wave 2:** Full OAuth registration backend (Google, Microsoft), company domain verification, onboarding wizard after registration (set up first load, invite team), plan selection and billing integration during registration
- **Wave 3:** AI-assisted company profile setup (auto-fill from MC/DOT number lookup), progressive profiling (collect additional info over first 7 days instead of all at registration), referral program dashboard, registration analytics (funnel analysis, drop-off tracking)

---

*This document was created as part of the Wave 1 Enhancement Focus design process for Ultra TMS Auth & Admin service.*
