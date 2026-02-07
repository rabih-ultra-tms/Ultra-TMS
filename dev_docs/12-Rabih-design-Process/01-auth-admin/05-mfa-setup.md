# MFA Setup

> Service: Auth & Admin | Wave: 1 (Enhancement Focus) | Priority: P0
> Route: /mfa | Status: **Built (Partially)** | Type: Auth / Form
> Primary Personas: All users enabling multi-factor authentication
> Roles with Access: Authenticated users, plus unauthenticated during login MFA challenge

---

## 1. Purpose & Business Context

**What this screen does:**
The MFA (Multi-Factor Authentication) page serves two purposes: (1) During login, it prompts users to enter their MFA code after password verification. (2) In settings/profile, it provides a setup wizard for configuring MFA methods (TOTP authenticator app, SMS, or email). The page supports QR code display for authenticator apps, backup code generation, and device trust management.

**Business problem it solves:**
Freight and logistics data is high-value — load information, financial records, customer details, and carrier contracts must be protected. MFA is the single most effective security measure against account takeover. With growing cyber threats targeting logistics companies, MFA adoption among users must be high. A clear, guided setup experience removes the barrier to enabling MFA, while a frictionless verification experience during login prevents users from disabling it out of annoyance.

**Key business rules:**
- Tenant admins can mandate MFA for all users (enforceable policy)
- Users can configure multiple MFA methods (TOTP + SMS as backup, for example)
- TOTP (Time-based One-Time Password) is the recommended/default method
- SMS and Email are supported as alternative methods
- Backup codes (10 single-use codes) are generated when MFA is first enabled
- Users must verify their first code to complete MFA setup (prove they can generate codes)
- "Remember this device for 30 days" stores a device fingerprint that bypasses MFA
- If all MFA methods fail, user must contact admin for manual reset
- During login, MFA challenge must be completed within 5 minutes or the session expires

**Success metric:**
MFA enrollment rate among active users exceeds 80%. MFA verification success rate on first attempt exceeds 95%. Average MFA verification time under 10 seconds. Support tickets for MFA issues reduce by 50%.

---

## 2. User Journey Context

**Comes from (entry points):**
| Source Screen | Trigger / Action | Data Passed |
|---|---|---|
| Login (/login) | Password verified, MFA required | `mfaSessionToken`, available MFA methods, preferred method |
| Profile Settings (/profile) | "Enable MFA" or "Manage MFA" button click | User's current MFA configuration |
| Admin enforcement | User logs in, tenant requires MFA, user has not set it up | Enforcement flag, redirect after setup |
| Security settings | "Change MFA method" or "Regenerate backup codes" | Current MFA state |

**Goes to (exit points):**
| Destination Screen | Trigger / Action | Data Passed |
|---|---|---|
| Dashboard (/) | Successful MFA verification during login | Full JWT issued |
| Profile Settings (/profile) | MFA setup completed from settings | Updated MFA status |
| Login (/login) | MFA session timeout (5 min) or "Use a different account" | None, restart login |
| Backup Codes display | MFA first-time setup complete | 10 backup codes to download/print |

**Primary trigger:**
Two main paths: (1) User logs in with password and is prompted for their MFA code. (2) User navigates to profile settings and clicks "Enable Two-Factor Authentication" to set it up for the first time.

**Success criteria (user completes the screen when):**
- **Login path:** User enters correct MFA code and is authenticated to the dashboard
- **Setup path:** User completes the setup wizard, verifies their first code, and downloads backup codes

---

## 3. Layout Blueprint

### Desktop Layout — Login MFA Challenge (1440px+)

```
+------------------------------------------------------------------+
|                    FULL-SCREEN CENTERED LAYOUT                    |
|                                                                    |
|              +--------------------------------+                    |
|              |                                |                    |
|              |    [Ultra TMS Logo]            |                    |
|              |                                |                    |
|              |    [Shield/Lock Icon]          |                    |
|              |                                |                    |
|              |    "Two-factor                 |                    |
|              |     authentication"            |                    |
|              |    "Enter the code from        |                    |
|              |     your authenticator app"    |                    |
|              |                                |                    |
|              |    [_ _ _ _ _ _] (6 digits)    |                    |
|              |                                |                    |
|              |    [x] Remember this device    |                    |
|              |        for 30 days             |                    |
|              |                                |                    |
|              |    [====Verify====]            |                    |
|              |                                |                    |
|              |    "Try another method"        |                    |
|              |    [Authenticator App]         |                    |
|              |    [Text Message]              |                    |
|              |    [Email Code]                |                    |
|              |    [Backup Code]               |                    |
|              |                                |                    |
|              |    [Use different account]     |                    |
|              |                                |                    |
|              +--------------------------------+                    |
|                                                                    |
+------------------------------------------------------------------+
```

### Desktop Layout — MFA Setup Wizard (1440px+)

```
+------------------------------------------------------------------+
|  Sidebar  |  Page Header: "Two-Factor Authentication Setup"       |
|           +-------------------------------------------------------+
|           |                                                        |
|           |  Step Indicator: (1) Choose Method → (2) Configure →  |
|           |                  (3) Verify → (4) Backup Codes        |
|           |                                                        |
|           |  +------------------------------------------------+   |
|           |  |                                                 |   |
|           |  |  STEP 2: Configure Authenticator                |   |
|           |  |                                                 |   |
|           |  |  +---------------------+  +------------------+ |   |
|           |  |  |                     |  |                  | |   |
|           |  |  |  [QR CODE IMAGE]   |  | Instructions:    | |   |
|           |  |  |                     |  | 1. Download app  | |   |
|           |  |  |  200px x 200px     |  | 2. Scan QR code  | |   |
|           |  |  |                     |  | 3. Enter code    | |   |
|           |  |  +---------------------+  |                  | |   |
|           |  |                            | Supported apps:  | |   |
|           |  |  "Can't scan? Enter       | - Google Auth    | |   |
|           |  |   this code manually:"     | - Authy          | |   |
|           |  |  [ABCD-EFGH-IJKL-MNOP]    | - 1Password      | |   |
|           |  |  [Copy]                    | - Microsoft Auth | |   |
|           |  |                            +------------------+ |   |
|           |  |                                                 |   |
|           |  |  "Enter the 6-digit code from your app:"       |   |
|           |  |  [_ _ _ _ _ _]                                  |   |
|           |  |                                                 |   |
|           |  |  [<- Back]          [Verify & Continue ->]      |   |
|           |  |                                                 |   |
|           |  +------------------------------------------------+   |
|           |                                                        |
+------------------------------------------------------------------+
```

### Information Hierarchy

| Priority | Content | Rationale |
|---|---|---|
| **Primary** (always visible) | 6-digit code input, Verify button | Core action — must be immediately clear |
| **Secondary** (MFA challenge) | Remember device checkbox, alternative method links | Convenience and fallback options |
| **Secondary** (MFA setup) | QR code, setup instructions, step indicator | Guided setup experience |
| **Tertiary** (available on demand) | Manual setup key, supported app list, backup codes | Reference information for specific needs |
| **Hidden** (behind interaction) | "Can't scan?" manual key, alternative method switcher | Edge case paths |

---

## 4. Data Fields & Display

### Visible Fields

| # | Field Label | Source | Format / Display | Location on Screen |
|---|---|---|---|---|
| 1 | MFA Code | User input | 6 separate digit boxes, auto-advance, auto-submit | Center of form |
| 2 | QR Code | Server-generated TOTP secret | 200x200px QR code image | Setup wizard, step 2 |
| 3 | Manual Setup Key | TOTP secret as text | Formatted groups (ABCD-EFGH-IJKL-MNOP), monospace, copy button | Below QR code, collapsible |
| 4 | Remember This Device | User input | Checkbox with "for 30 days" label | Below code input (login challenge only) |
| 5 | Phone Number (SMS setup) | User input | International phone with country code | SMS setup step |
| 6 | Backup Codes | Server-generated | 10 codes in 2-column grid, monospace, printable | Final setup step |

### Calculated / Derived Fields

| # | Field Label | Calculation / Logic | Format |
|---|---|---|---|
| 1 | Session Countdown | 5-minute timer from MFA session creation | "Session expires in 4:32" — updates every second |
| 2 | Code Validity Window | TOTP codes are valid for 30 seconds | Subtle circular progress around the code input |
| 3 | Remaining Backup Codes | Count of unused backup codes | "7 of 10 backup codes remaining" |
| 4 | SMS Cooldown | 60-second cooldown after sending SMS code | "Resend in 0:42" |

---

## 5. Features

### Core Features (Already Built)

- [x] 6-digit TOTP code input for login MFA challenge
- [x] POST /api/auth/mfa/verify endpoint integration
- [x] Redirect to dashboard on successful verification
- [x] MFA setup dialog (basic) for TOTP method
- [x] QR code generation and display
- [x] Error handling for invalid codes
- [x] Session timeout handling (redirect to login)

### Enhancement Features (Wave 1 — To Add)

- [ ] **Full MFA setup wizard** — Multi-step guided flow: (1) Choose Method, (2) Configure, (3) Verify, (4) Backup Codes. Replace the current basic dialog with a full-page wizard experience
- [ ] **QR code with visual styling** — Branded QR code with Ultra TMS logo overlay in center. High contrast, generous quiet zone for reliable scanning
- [ ] **Manual setup key** — "Can't scan the QR code?" expandable section showing the TOTP secret key in human-readable groups with one-click copy button
- [ ] **Backup codes generation** — After initial setup, generate and display 10 single-use backup codes. Provide "Download as .txt", "Copy all", and "Print" options
- [ ] **SMS setup with phone verification** — Phone number input with country code selector. Send verification SMS, enter 6-digit code to confirm
- [ ] **Email 2FA setup** — Option to receive codes via email (least secure, but most accessible)
- [ ] **Recovery options configuration** — Let users configure recovery email, recovery phone, or security questions as a failsafe
- [ ] **Device trust management** — "Remember this device for 30 days" checkbox during login challenge. In profile, show list of trusted devices with ability to revoke
- [ ] **Step-by-step visual guide** — Animated illustrations showing how to install and use an authenticator app (Google Authenticator, Authy, etc.)
- [ ] **Method switcher during login** — "Try another method" accordion showing all configured methods (authenticator, SMS, email, backup code)
- [ ] **Session countdown timer** — During login MFA challenge, show remaining time (5 minutes) before session expires
- [ ] **Auto-submit on complete** — Automatically verify the code when all 6 digits are entered (no need to click Verify button)
- [ ] **Paste support** — Allow pasting a 6-digit code (splits into individual boxes automatically)
- [ ] **Trusted device list** — In profile/settings, show all devices where "Remember this device" is active with device name, browser, last used, and "Revoke" button

### Conditional / Role-Based Features

| Feature | Condition | Behavior |
|---|---|---|
| MFA setup wizard | User has not enabled MFA and navigates to /mfa | Show full setup wizard |
| MFA login challenge | User has MFA enabled and just verified password | Show code input with preferred method |
| Method switcher | User has multiple MFA methods configured | Show method selector during login challenge |
| Mandatory MFA banner | Tenant admin has enforced MFA, user has not set it up | Show: "Your organization requires two-factor authentication. Set it up now." |
| SMS option | Tenant has SMS MFA enabled (costs per message) | Show SMS as a method option |
| Email option | Always available | Show email as a method option (with "less secure" label) |
| Backup codes | MFA is enabled | Show in profile settings with count of remaining codes |
| Device trust | Feature enabled for tenant | Show "Remember this device" checkbox |

---

## 6. Status & State Machine

### MFA Login Challenge Flow

```
[Code Input] ---(Enter 6 digits)---> [Auto-verify]
      |                                     |
      |                           +---------+---------+
      |                           |                   |
      |                    [Verified]           [Invalid Code]
      |                        |                      |
      |                        v                      v
      |                   [Dashboard]         [Error: "Invalid code"]
      |                                       [Remaining attempts: N]
      |                                              |
      |                                    (0 attempts left)
      |                                              |
      |                                    [Account locked]
      |                                    [Contact admin]
      |
      +---(Session timeout 5min)---> [Redirect to /login]
      |
      +---(Try another method)---> [Method Selector]
                                        |
                                   [SMS / Email / Backup Code]
```

### MFA Setup Wizard Flow

```
[Step 1: Choose Method]
  - Authenticator App (recommended)
  - Text Message (SMS)
  - Email
       |
       v
[Step 2: Configure]
  - TOTP: Show QR code + manual key
  - SMS: Enter phone, verify with code
  - Email: Confirm email, verify with code
       |
       v
[Step 3: Verify]
  - Enter code from chosen method
  - Must succeed to proceed
       |
       v
[Step 4: Backup Codes]
  - Display 10 backup codes
  - Download / Copy / Print
  - Checkbox: "I've saved my backup codes"
       |
       v
[MFA Enabled — Redirect to profile/dashboard]
```

### Status Badge Colors

| State | Background | Text | Tailwind Classes |
|---|---|---|---|
| MFA Enabled | green-100 | green-800 | `bg-green-100 text-green-800` |
| MFA Disabled | gray-100 | gray-600 | `bg-gray-100 text-gray-600` |
| MFA Required (not set up) | yellow-100 | yellow-800 | `bg-yellow-100 text-yellow-800` |
| Code Invalid | red-100 | red-800 | `bg-red-100 text-red-800` |
| Code Verified | green-100 | green-800 | `bg-green-100 text-green-800` |
| TOTP Method | blue-100 | blue-800 | `bg-blue-100 text-blue-800` |
| SMS Method | purple-100 | purple-800 | `bg-purple-100 text-purple-800` |
| Email Method | orange-100 | orange-800 | `bg-orange-100 text-orange-800` |

---

## 7. Actions & Interactions

### Primary Action Buttons

| Button Label | Icon | Variant | Action | Confirmation Required? |
|---|---|---|---|---|
| Verify | Shield/check | Primary / Blue-600, full-width | POST /api/auth/mfa/verify with code | No |
| Continue (setup step) | Right arrow | Primary / Blue-600 | Advance to next setup step | No |
| Complete Setup | Checkmark | Primary / Green-600, full-width | Finalize MFA setup | "I've saved my backup codes" checkbox must be checked |
| Download Backup Codes | Download icon | Secondary / Outline | Download codes as .txt file | No |
| Copy All Codes | Copy icon | Secondary / Outline | Copy all codes to clipboard | No |
| Print Codes | Printer icon | Secondary / Outline | Open print dialog | No |

### Secondary Actions

| Action Label | Icon | Action | Condition |
|---|---|---|---|
| Try another method | Swap icon | Expand method selector | Login challenge, multiple methods |
| Resend SMS code | Refresh icon | Re-send SMS (60s cooldown) | SMS method selected |
| Resend email code | Refresh icon | Re-send email code (60s cooldown) | Email method selected |
| Can't scan? Enter manually | Keyboard icon | Show manual TOTP key | TOTP setup step |
| Copy setup key | Copy icon | Copy TOTP key to clipboard | Manual key displayed |
| Use different account | Logout icon | Return to login page | Login challenge only |
| Remember this device for 30 days | Checkbox | Store device fingerprint | Login challenge |
| Back | Left arrow | Previous setup step | Setup wizard (not step 1) |
| Regenerate backup codes | Refresh icon | Generate new set of 10 codes | Profile settings, existing MFA |
| Revoke device trust | X icon | Remove device from trusted list | Trusted device list |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| 0-9 | Enter digit in current code box, auto-advance to next |
| Backspace | Clear current digit and move to previous box |
| Ctrl/Cmd + V | Paste 6-digit code (auto-distributes across boxes) |
| Enter | Submit/verify code |
| Escape | Cancel setup (with confirmation) or back to login |

### Drag & Drop

N/A — No drag-and-drop interactions.

---

## 8. Real-Time Features

### WebSocket Events

N/A — MFA pages do not use WebSocket connections (pre-authentication).

### Live Update Behavior

- **MFA session countdown:** 5-minute countdown updates every second. At 60 seconds remaining, the timer text turns yellow. At 30 seconds, it turns red. At 0, auto-redirect to /login with "Session expired" message.
- **TOTP code validity:** Subtle 30-second circular progress indicator around the code input area showing the current TOTP window. Helps users understand why a code might fail if entered at the edge of a time window.
- **Auto-submit:** When the 6th digit is entered, automatically trigger verification (no button click needed). Show a brief 300ms delay with loading indicator to feel responsive.
- **SMS cooldown timer:** After sending SMS, 60-second countdown before "Resend" link becomes active.
- **Backup code count:** Real-time update of remaining codes when one is used.

### Polling Fallback

N/A — No polling on MFA pages.

### Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|---|---|---|
| Verify code | Show brief loading indicator (300ms), disable input | Clear code, show error "Invalid code", refocus first digit |
| Send SMS | Show "Code sent!" toast, start cooldown | Show error "Failed to send. Try again." |
| Download backup codes | Trigger download immediately | Show error toast if generation fails |

---

## 9. Component Inventory

### Existing Components to Reuse

| Component | Location | Props / Config |
|---|---|---|
| `mfa-input` | `src/components/auth/mfa-input.tsx` | `length: 6, onComplete: (code: string) => void` |
| `mfa-setup-dialog` | `src/components/auth/mfa-setup-dialog.tsx` | `onSetupComplete: () => void` (basic TOTP only) |
| `Input` | `src/components/ui/input.tsx` | For phone number input |
| `Button` | `src/components/ui/button.tsx` | Various variants |
| `Checkbox` | `src/components/ui/checkbox.tsx` | Remember device, backup codes confirmation |
| `Dialog` | `src/components/ui/dialog.tsx` | Current MFA setup uses dialog (to be replaced with full page) |

### Components Needing Enhancement

| Component | Current State | Enhancement Needed |
|---|---|---|
| `mfa-input` | Basic 6 digit input, no auto-submit | Add auto-submit on completion, paste support, visual TOTP timer ring, error shake animation |
| `mfa-setup-dialog` | Basic dialog with QR code for TOTP only | Replace with full-page multi-step wizard supporting TOTP, SMS, Email methods |

### New Components to Create

| Component | Description | Estimated Complexity |
|---|---|---|
| `MfaSetupWizard` | Full-page multi-step setup flow (Choose Method → Configure → Verify → Backup Codes) | High — multi-step state, 3 method paths, backup code generation |
| `MfaMethodSelector` | Card-based selection of MFA methods with icons and descriptions | Small — styled radio cards |
| `QrCodeDisplay` | Branded QR code with logo overlay, manual key fallback, copy button | Medium — QR generation, styling, clipboard |
| `BackupCodesDisplay` | Grid of 10 codes with Download, Copy All, and Print actions | Medium — code generation, file download, print CSS |
| `TotpTimerRing` | Circular progress indicator showing 30-second TOTP window | Small — SVG circle animation |
| `MfaMethodSwitcher` | Expandable selector for trying different MFA methods during login | Small — accordion with method list |
| `PhoneInputWithCountry` | International phone input with country flag/code selector | Medium — country data, formatting |
| `TrustedDevicesList` | Table of trusted devices with name, browser, last used, revoke button | Medium — device data display, revoke API |
| `SessionCountdown` | Timer showing remaining MFA session time | Small — countdown + urgency colors |
| `AuthenticatorGuide` | Step-by-step illustrated guide for setting up authenticator apps | Medium — illustrations, accordion steps |

### shadcn/ui Components to Install

| Component | shadcn Name | Usage |
|---|---|---|
| InputOTP | `input-otp` | 6-digit MFA code input (enhanced) |
| Accordion | `accordion` | Method switcher, "Can't scan?" section |
| RadioGroup | `radio-group` | Method selection cards |
| Tabs | `tabs` | Switching between MFA methods in settings |
| Badge | `badge` | Method type badges |
| Toast | `toast` | Code sent, code verified notifications |

---

## 10. API Integration

### REST Endpoints

| # | Method | Path | Purpose | React Query Hook |
|---|---|---|---|---|
| 1 | POST | `/api/auth/mfa/verify` | Verify MFA code during login | `useMfaVerify()` |
| 2 | POST | `/api/auth/mfa/setup/totp` | Initiate TOTP setup (returns QR + secret) | `useTotpSetup()` |
| 3 | POST | `/api/auth/mfa/setup/totp/verify` | Verify first TOTP code to confirm setup | `useTotpVerify()` |
| 4 | POST | `/api/auth/mfa/setup/sms` | Send SMS verification to phone number | `useSmsSetup()` |
| 5 | POST | `/api/auth/mfa/setup/sms/verify` | Verify SMS code to confirm phone | `useSmsVerify()` |
| 6 | POST | `/api/auth/mfa/setup/email` | Send email verification code | `useEmailMfaSetup()` |
| 7 | POST | `/api/auth/mfa/setup/email/verify` | Verify email code | `useEmailMfaVerify()` |
| 8 | POST | `/api/auth/mfa/backup-codes/generate` | Generate 10 backup codes | `useGenerateBackupCodes()` |
| 9 | GET | `/api/auth/mfa/backup-codes/count` | Get remaining backup codes count | `useBackupCodesCount()` |
| 10 | POST | `/api/auth/mfa/send-code` | Send code via SMS or email (during login challenge) | `useSendMfaCode()` |
| 11 | GET | `/api/auth/mfa/trusted-devices` | List trusted devices | `useTrustedDevices()` |
| 12 | DELETE | `/api/auth/mfa/trusted-devices/:id` | Revoke a trusted device | `useRevokeTrustedDevice()` |
| 13 | DELETE | `/api/auth/mfa/disable` | Disable MFA (requires current password) | `useDisableMfa()` |

### Request/Response Examples

**POST /api/auth/mfa/setup/totp**
```json
// Response
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "issuer": "Ultra TMS",
  "accountName": "john@ultralogistics.com"
}
```

**POST /api/auth/mfa/verify**
```json
// Request
{
  "mfaSessionToken": "mfa_sess_xyz",
  "code": "482910",
  "method": "totp",
  "trustDevice": true,
  "deviceFingerprint": "fp_abc123"
}

// Response (success)
{
  "accessToken": "eyJhbG...",
  "user": { ... }
}

// Response (invalid code)
{
  "error": "INVALID_MFA_CODE",
  "message": "Invalid verification code",
  "remainingAttempts": 4
}
```

**POST /api/auth/mfa/backup-codes/generate**
```json
// Response
{
  "codes": [
    "a1b2-c3d4",
    "e5f6-g7h8",
    "i9j0-k1l2",
    "m3n4-o5p6",
    "q7r8-s9t0",
    "u1v2-w3x4",
    "y5z6-a7b8",
    "c9d0-e1f2",
    "g3h4-i5j6",
    "k7l8-m9n0"
  ],
  "generatedAt": "2025-02-06T12:00:00Z",
  "expiresAt": null
}
```

### Error Handling per Endpoint

| Endpoint | 400 | 401 | 403 | 429 | 500 |
|---|---|---|---|---|---|
| POST /api/auth/mfa/verify | Invalid code format | MFA session expired → redirect to /login | Account locked after too many attempts | Rate limited: "Too many attempts" | Generic error with retry |
| POST /api/auth/mfa/setup/totp | N/A | Not authenticated | MFA already enabled (must disable first) | N/A | Setup failed, retry |
| POST /api/auth/mfa/send-code | Invalid method | Session expired | N/A | "Please wait before requesting another code" | Code send failed |

---

## 11. States & Edge Cases

### Loading State

- **MFA login challenge:** Show the 6-digit input immediately. No data needs to load for the code entry form.
- **MFA setup wizard:** Step 2 (TOTP) needs to fetch the QR code — show a skeleton QR placeholder (200x200 gray shimmer) while loading.
- **Code verification:** Brief loading state (300ms) when code auto-submits. Show subtle spinner overlay on the code input area.
- **Backup codes generation:** Show loading spinner in the backup codes area while codes are being generated.

### Empty States

**No MFA configured (in profile settings):**
- Display: Shield icon + "Two-factor authentication is not enabled" heading + "Add an extra layer of security to your account" description + "Enable 2FA" primary button
- If tenant mandates MFA: Yellow banner: "Your organization requires two-factor authentication. Please set it up to continue using Ultra TMS."

### Error States

**Invalid MFA code:**
- Display: Shake animation on code inputs (300ms), all boxes get red border, text below: "Invalid code. [N] attempts remaining."
- Behavior: Clear all digits, refocus first box.
- After 5 failed attempts: Lock out with "Too many attempts. Please contact your administrator." message.

**MFA session expired (5-minute timeout):**
- Display: Modal overlay: "Your verification session has expired. Please sign in again."
- CTA: "Back to Login" button. Auto-redirect after 5 seconds.

**SMS delivery failure:**
- Display: Toast error: "Failed to send SMS. Please try again or use a different verification method."
- Behavior: Enable "Resend" immediately (no cooldown on failure), show alternative method links.

**QR code load failure:**
- Display: Replace QR placeholder with: "Unable to load QR code." Show the manual key prominently as fallback.
- CTA: "Retry" link to re-fetch QR code.

### Permission Denied

- Unauthenticated users without an MFA session token: Redirect to /login.
- Users trying to access MFA setup without being authenticated: Redirect to /login.

### Offline / Degraded

- **Login MFA challenge offline:** Show banner: "You are offline. Verification requires an internet connection." TOTP codes are generated offline on the user's device, but verification requires connectivity.
- **MFA setup offline:** Show banner and disable the setup wizard. MFA setup requires server communication.

---

## 12. Filters, Search & Sort

### Trusted Devices List (in profile settings)

| # | Filter Label | Type | Options | Default |
|---|---|---|---|---|
| 1 | Search | Text | Device name, browser name | Empty |
| 2 | Sort | Column header | Last used date, device name | Last used (descending) |

---

## 13. Responsive Design Notes

### Tablet (768px - 1023px)

- **Login challenge:** Centered card layout remains the same, max-width 420px
- **Setup wizard:** Single column layout. QR code and instructions stack vertically (QR above, instructions below)
- Step indicator remains horizontal but with smaller spacing
- Backup codes grid: 2 columns of 5 codes each

### Mobile (< 768px)

- **Login challenge:** Code input boxes are 48x48px with 8px gaps for comfortable tapping. Center-aligned
- "Remember this device" checkbox below code input
- Method switcher becomes a full-width accordion
- "Use different account" link at bottom
- **Setup wizard:** Full-width, single column
- QR code centered, scaled to 70% of screen width (max 200px)
- Manual key wraps with smaller font
- Backup codes: single column list, full width
- Download/Copy/Print buttons stack vertically
- Step indicator becomes minimal: just numbered dots
- Touch-friendly: all interactive elements min 44px touch target

### Breakpoint Reference

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Desktop XL | 1440px+ | Login: centered card. Setup: with sidebar, 2-column content |
| Desktop | 1024px - 1439px | Same as XL with tighter spacing |
| Tablet | 768px - 1023px | Single column, stacked QR + instructions |
| Mobile | < 768px | Full width, larger touch targets, stacked everything |

---

## 14. Stitch Prompt

```
Design a Two-Factor Authentication Setup page for a modern freight logistics TMS called "Ultra TMS." Show Step 2 of the setup wizard where the user is configuring their authenticator app with a QR code. Use a clean, modern SaaS aesthetic similar to GitHub's 2FA setup or Clerk's MFA configuration pages.

Layout: Standard app layout with a dark slate-900 sidebar (240px) on the left with the "Ultra TMS" logo in white at top and navigation links. The "Settings" or "Profile" link is active with a blue-600 left border. Main content area on the right with white background.

Page Header: Breadcrumb "Home / Profile / Two-Factor Authentication" in gray-500 text. Below, page title "Two-Factor Authentication Setup" in 24px semibold gray-900. On the right, a "Cancel Setup" ghost button in gray-500.

Step Indicator: Below the header, a horizontal step indicator with 4 steps connected by lines. Step 1 "Choose Method" has a blue-600 filled circle with white checkmark (completed). Step 2 "Configure" has a blue-600 filled circle with white "2" (current/active). Step 3 "Verify" has a gray-300 circle with "3" (upcoming). Step 4 "Backup Codes" has a gray-300 circle with "4" (upcoming). Step labels below each circle in 13px. Completed/active labels in blue-600, upcoming in gray-400.

Main Content — Step 2 "Configure Authenticator App":
Below the step indicator, a white card with rounded-lg border and subtle shadow-sm, max-width 720px, centered padding 32px.

Inside the card, a two-column layout:

Left Column (45%): "Scan QR Code" label in 16px semibold gray-900 above. A 200x200px QR code image with clean black-on-white pattern and a small blue-600 Ultra TMS shield logo overlaid in the center (16x16px). The QR code has a white background with 16px padding inside a gray-100 background rounded-lg container with gray-200 border.

Below the QR code (16px spacing): "Can't scan the code?" in 13px gray-500 as a clickable text link. When expanded, it shows: "Manual Setup Key:" label in 12px uppercase gray-500, then "JBSW-Y3DP-EHPK-3PXP" in 16px monospace semibold gray-900 inside a gray-50 rounded-md box with a "Copy" button (copy icon + "Copy" text in blue-600, 13px) on the right side.

Right Column (55%): "Setup Instructions" label in 16px semibold gray-900. Below, a numbered list with 20px spacing between items:

1. A blue-600 circle with white "1" + "Download an authenticator app" in 14px gray-700. Below in 13px gray-500: "We recommend Google Authenticator, Authy, or 1Password." Show 3 small app icons (Google Authenticator, Authy, 1Password) as 24px square icons in a horizontal row.

2. A blue-600 circle with white "2" + "Scan the QR code" in 14px gray-700. Below in 13px gray-500: "Open your authenticator app and scan the QR code on the left. If scanning doesn't work, enter the manual key."

3. A blue-600 circle with white "3" + "Enter verification code" in 14px gray-700. Below in 13px gray-500: "Once configured, your app will display a 6-digit code that changes every 30 seconds."

Below the two-column layout, a gray-200 horizontal divider.

Below the divider (24px spacing): "Enter the 6-digit code from your authenticator app" in 14px medium gray-700. Below (12px): Six separate square input boxes (48x48px each) with gray-200 borders, rounded-md, centered. The first 3 boxes contain "4", "8", "2" in 20px semibold gray-900. The 4th box is empty with a blue-600 border ring (focused). The 5th and 6th are empty with gray-200 borders.

Below the code input (8px): A subtle circular timer indicator — a small 16px circle with a blue-600 arc showing approximately 60% of a 30-second countdown, with "18s" text in 11px gray-400 next to it.

Bottom Action Bar: A horizontal bar with gray-100 background at the bottom of the card, 16px padding. Left: "Back" button with left arrow icon, outline style. Right: "Verify & Continue" primary blue-600 button with right arrow icon.

Design specs: Font Inter, 14px base. Blue-600 primary. The page should feel trustworthy, educational, and guide the user through setup without intimidation. The QR code area should be the visual focal point, with clear instructions supporting it.
```

---

## 15. Enhancement Opportunities

### Current State (Wave 1)

**What's built and working:**
- [x] 6-digit TOTP code input during login MFA challenge
- [x] TOTP code verification via POST /api/auth/mfa/verify
- [x] QR code display for TOTP authenticator setup (basic dialog)
- [x] Redirect to dashboard on successful MFA verification
- [x] Error handling for invalid codes
- [x] Session timeout redirect to login
- [x] Basic mfa-setup-dialog component for TOTP configuration

**What needs polish / bug fixes:**
- [ ] MFA setup is a small dialog, not a guided experience — users are confused about the process
- [ ] No backup codes — if user loses their phone, they are locked out entirely
- [ ] No SMS or Email MFA options — TOTP only
- [ ] No "Remember this device" option — users must enter MFA code every single login
- [ ] No manual TOTP key fallback — if QR code fails to scan, no alternative
- [ ] Code input does not auto-submit — users must click Verify after entering 6 digits
- [ ] No paste support in code input — users who receive codes via SMS or email cannot paste
- [ ] No session countdown — users don't know they have a time limit
- [ ] No visual TOTP timer — users don't know when their current code expires

**What to add this wave:**
- [ ] **Full setup wizard** — Replace dialog with multi-step full-page wizard (Choose → Configure → Verify → Backup)
- [ ] **Backup codes generation** — Generate 10 codes with download/copy/print options
- [ ] **SMS MFA method** — Phone number input + SMS code verification as alternative method
- [ ] **Email MFA method** — Email code as the most accessible (least secure) option
- [ ] **Manual TOTP key** — "Can't scan?" expandable showing copyable text key
- [ ] **Remember this device (30 days)** — Device trust checkbox during login challenge
- [ ] **Auto-submit on code completion** — Submit automatically when 6th digit entered
- [ ] **Paste support** — Detect paste event, distribute digits across boxes
- [ ] **Session countdown timer** — Show 5-minute countdown during login challenge
- [ ] **TOTP timer ring** — Visual 30-second countdown for code validity window
- [ ] **Step-by-step authenticator guide** — Illustrated instructions for app installation
- [ ] **Trusted devices list** — View and revoke trusted devices in profile settings
- [ ] **Regenerate backup codes** — Option to generate new codes (invalidates old ones)
- [ ] **Method switcher** — During login challenge, switch between configured methods

### Priority Matrix

| Enhancement | Impact | Effort | Priority |
|---|---|---|---|
| Auto-submit on code completion | High | Low | **P0** |
| Paste support in code input | High | Low | **P0** |
| Manual TOTP key fallback | High | Low | **P0** |
| Backup codes generation | High | Medium | **P0** |
| Remember this device (30 days) | High | Medium | **P0** |
| Full setup wizard (replace dialog) | High | High | **P0** |
| Session countdown timer | Medium | Low | **P1** |
| SMS MFA method | High | High | **P1** |
| Method switcher during login | Medium | Medium | **P1** |
| Step-by-step authenticator guide | Medium | Medium | **P1** |
| TOTP timer ring (30-second visual) | Low | Medium | **P1** |
| Email MFA method | Medium | Medium | **P2** |
| Trusted devices list in profile | Medium | Medium | **P2** |
| Regenerate backup codes | Medium | Low | **P2** |
| Recovery options configuration | Medium | High | **P2** |

### Future Wave Preview

- **Wave 2:** WebAuthn / passkey support (FIDO2 hardware keys and biometrics), push notification MFA (approve login from phone), risk-based MFA (skip for trusted networks/locations), MFA enrollment analytics for admins
- **Wave 3:** Adaptive MFA (machine learning to determine when to challenge), MFA fatigue protection (rate limit push approvals), hardware security key management (YubiKey enrollment), admin MFA policy templates (per role, per sensitivity level)

---

*This document was created as part of the Wave 1 Enhancement Focus design process for Ultra TMS Auth & Admin service.*
